"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaRegister() {
  const [offline, setOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const ios = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const inApp = /WhatsApp|Instagram|FBAN|FBAV|Messenger|Line\/|Twitter|TikTok|Snapchat/i.test(ua) || (/Android/i.test(ua) && /; wv\)/i.test(ua));
    const standalone = window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setPlatform(ios ? "ios" : android ? "android" : "other");
    setEmbedded(inApp);
    setIsInstalled(standalone);
    setOffline(!navigator.onLine);

    const online = () => setOffline(false);
    const offlineNow = () => setOffline(true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const installed = () => { setIsInstalled(true); setInstallPrompt(null); setHelpOpen(false); };
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineNow);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", installed);

    let registration: ServiceWorkerRegistration | undefined;
    const register = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
        await registration.update();
        if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const worker = registration?.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(worker);
          });
        });
      } catch (error) {
        console.error("Strata offline support could not register.", error);
      }
    };
    void register();

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offlineNow);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function install() {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") setIsInstalled(true);
      } catch {
        setHelpOpen(true);
      } finally {
        setInstallPrompt(null);
      }
      return;
    }
    setHelpOpen(true);
  }

  function applyUpdate() {
    if (!updateReady) return;
    setRefreshing(true);
    const worker = updateReady;
    const onController = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onController, { once: true });
    worker.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => { if (refreshing) window.location.reload(); }, 2000);
  }

  return <>
    {offline && <div className="strataOfflineNotice" role="status">You’re offline. Strata’s saved app shell may open, but menu availability and orders need a connection.</div>}
    {!isInstalled && <button className="strataInstallButton" type="button" onClick={() => void install()} aria-haspopup="dialog">＋ Install Strata</button>}
    {helpOpen && <div className="strataInstallHelp" role="dialog" aria-modal="false" aria-labelledby="strata-install-title">
      <button className="strataInstallClose" type="button" onClick={() => setHelpOpen(false)} aria-label="Close installation help">×</button>
      <strong id="strata-install-title">Add Strata to your home screen</strong>
      {embedded ? <p>Strata still works here. For installation, open this page in your phone’s main browser first.</p> : platform === "ios" ? <p>Open this page in Safari, tap Share, choose <b>Add to Home Screen</b>, then tap Add. Installation is optional.</p> : platform === "android" ? <p>In Chrome, open the ⋮ menu and choose <b>Install app</b> or <b>Add to Home screen</b>. Installation is optional.</p> : <p>In your browser menu, choose <b>Install Strata</b> or <b>Install page as app</b> if offered. The website works without installation.</p>}
      <button type="button" onClick={() => setHelpOpen(false)}>Got it</button>
    </div>}
    {updateReady && <div className="strataUpdateNotice" role="status"><span><strong>Strata has an update ready.</strong><small>Refresh to use the latest version.</small></span><button type="button" onClick={applyUpdate} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button></div>}
  </>;
}
