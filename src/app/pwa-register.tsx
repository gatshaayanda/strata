"use client";
import { useEffect, useRef, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }> };
type InstallState = "hidden" | "embedded" | "ios";
const DISMISSED_KEY = "strata:install:dismissed-at";
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function environment() {
  if (typeof window === "undefined") return { standalone: true, ios: false, android: false, embedded: false };
  const ua = navigator.userAgent || "";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const ios = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const embedded = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line\/|Twitter|TikTok|Snapchat/i.test(ua) || (/Android/i.test(ua) && /; wv\)/i.test(ua));
  return { standalone, ios, android, embedded };
}
function isIosSafari() {
  if (typeof window === "undefined") return false;
  const nav = navigator;
  const ios = /iPad|iPhone|iPod/i.test(nav.userAgent) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
  return ios && /Safari/i.test(nav.userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(nav.userAgent);
}
function wasDismissed() {
  try { const at = Date.parse(localStorage.getItem(DISMISSED_KEY) || ""); return Number.isFinite(at) && Date.now() - at < DISMISS_MS; }
  catch { return false; }
}
function rememberDismissal() { try { localStorage.setItem(DISMISSED_KEY, new Date().toISOString()); } catch {} }

export default function PwaRegister({ initialEmbedded = false, initialAndroid = false }: { initialEmbedded?: boolean; initialAndroid?: boolean }) {
  const [offline, setOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [installCardDismissed, setInstallCardDismissed] = useState(false);
  const [installState, setInstallState] = useState<InstallState>(initialEmbedded ? "embedded" : "hidden");
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const embeddedActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const env = environment();
    const embedded = initialEmbedded || env.embedded;
    if (env.standalone) setInstallState("hidden");
    else if (embedded) setInstallState("embedded");
    setInstallCardDismissed(wasDismissed());
    const online = () => setOffline(false);
    const offlineNow = () => setOffline(true);
    const onBeforeInstallPrompt = (event: Event) => {
      if (environment().standalone) return;
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
      setInstallCardDismissed(false);
    };
    const appInstalled = () => {
      setDeferredPrompt(null);
      setInstallCardDismissed(true);
      try { localStorage.removeItem(DISMISSED_KEY); } catch {}
      setInstallState("hidden");
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineNow);
    const promptWindow = window as Window & { __strataInstallPrompt?: Event; __strataPwaListenerReady?: boolean };
    promptWindow.__strataPwaListenerReady = true;
    const earlyPrompt = promptWindow.__strataInstallPrompt;
    if (earlyPrompt) { delete promptWindow.__strataInstallPrompt; onBeforeInstallPrompt(earlyPrompt); }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", appInstalled);

    let registration: ServiceWorkerRegistration | null = null;
    const inspect = () => { if (registration?.waiting && navigator.serviceWorker.controller) setUpdateReady(registration.waiting); };
    const register = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
        inspect();
        registration.addEventListener("updatefound", () => registration?.installing?.addEventListener("statechange", inspect));
        await registration.update();
        inspect();
      } catch (error) { console.error("Strata offline support could not register.", error); }
    };
    void register();
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineNow);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", appInstalled);
    };
  }, [initialEmbedded, initialAndroid]);

  useEffect(() => {
    if (installState !== "embedded") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    embeddedActionRef.current?.focus();
    const lock = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") { event.preventDefault(); event.stopPropagation(); embeddedActionRef.current?.focus(); }
    };
    window.addEventListener("keydown", lock, true);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", lock, true); };
  }, [installState]);

  async function install() {
    const prompt = deferredPrompt;
    if (!prompt) return;
    try { await prompt.prompt(); await prompt.userChoice; }
    catch { /* Native prompt is browser-controlled; never replace it with a fake flow. */ }
    finally { setDeferredPrompt(null); }
  }
  function dismissInstall() { rememberDismissal(); setInstallCardDismissed(true); setInstallState("hidden"); }
  function openBrowser() {
    const url = window.location.href;
    const env = environment();
    if (env.android) { window.location.href = "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end"; return; }
    window.open(url, "_blank", "noopener,noreferrer");
  }
  function applyUpdate() {
    if (!updateReady) return;
    setRefreshing(true);
    const onController = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onController, { once: true });
    updateReady.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => window.location.reload(), 2500);
  }
  const env = typeof window === "undefined" ? { standalone: true, ios: false, android: false, embedded: false } : environment();
  const showInstallCard = !env.standalone && installState !== "embedded" && !installCardDismissed && Boolean(deferredPrompt || isIosSafari());
  return <>
    {offline && <div className="strataOfflineNotice" role="status" aria-live="polite">You’re offline. Strata’s saved app shell may open, but menu availability and orders need a connection.</div>}
    {showInstallCard && <aside className="strata-install-card" aria-label="Install Strata">
      <div className="strata-install-brand"><img src="/strata-brand-logo.svg" alt="Strata Sa’o Bitsa logo" width="40" height="40" /><span><strong>STRATA</strong><small>SA’O BITSA · COME GET HOOKED</small></span></div>
      <button className="strata-install-close" type="button" aria-label="Dismiss install prompt" onClick={dismissInstall}>×</button>
      <button className="strata-install-action" type="button" onClick={() => { if (deferredPrompt) { void install(); return; } if (isIosSafari()) setInstallState("ios"); }}>{deferredPrompt ? "Install Strata" : "Add to Home Screen"} <span aria-hidden="true">↗</span></button>
    </aside>}
    {installState === "ios" && isIosSafari() && <div className="strata-ios-install-backdrop"><section className="strata-ios-install" role="dialog" aria-modal="false" aria-labelledby="strata-ios-title">
      <img src="/strata-brand-logo.svg" alt="" width="48" height="48" /><button type="button" className="strata-ios-close" aria-label="Close installation guidance" onClick={dismissInstall}>×</button>
      <small>IPHONE &amp; IPAD</small><h2 id="strata-ios-title">Add Strata to your Home Screen.</h2>
      <p>In Safari, tap <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>. Open the new Home Screen icon to launch Strata.</p>
      <button type="button" onClick={dismissInstall}>Continue on the website</button>
    </section></div>}
    {installState === "embedded" && <div className="strata-embedded-backdrop" role="alertdialog" aria-modal="true" aria-labelledby="strata-embedded-title"><section className="strata-embedded-card">
      <img src="/strata-brand-logo.svg" alt="" width="48" height="48" /><h2 id="strata-embedded-title">Open Strata in your browser</h2>
      <p>{(initialEmbedded && initialAndroid) || env.android ? "Open Strata in Chrome to continue with the full browser experience." : "Strata opened inside another app. Open this page in your browser to continue."}</p>
      <button ref={embeddedActionRef} type="button" onClick={openBrowser}>{(initialEmbedded && initialAndroid) || env.android ? "Open in Chrome" : "Open in browser"}</button>
    </section></div>}
    {updateReady && <div className="strataUpdateNotice" role="status"><span><strong>Strata has an update ready.</strong><small>Refresh to use the latest version.</small></span><button type="button" onClick={applyUpdate} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button></div>}
  </>;
}
