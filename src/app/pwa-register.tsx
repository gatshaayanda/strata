"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaRegister() {
  const [offline, setOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installCardDismissed, setInstallCardDismissed] = useState(false);
  const [updateReady, setUpdateReady] = useState<ServiceWorker | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const online = () => setOffline(false);
    const offlineNow = () => setOffline(true);
    const installPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallCardDismissed(false);
    };
    const installed = () => {
      setDeferredPrompt(null);
      setInstallCardDismissed(true);
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offlineNow);
    window.addEventListener("beforeinstallprompt", installPrompt);
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
      window.removeEventListener("beforeinstallprompt", installPrompt);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function applyUpdate() {
    if (!updateReady) return;
    setRefreshing(true);
    const worker = updateReady;
    const onController = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", onController, { once: true });
    worker.postMessage({ type: "SKIP_WAITING" });
    window.setTimeout(() => window.location.reload(), 2500);
  }

  return <>
    {offline && <div className="strataOfflineNotice" role="status">You’re offline. Strata’s saved app shell may open, but menu availability and orders need a connection.</div>}
    {deferredPrompt && !installCardDismissed && <aside className="strata-install-card" aria-label="Install Strata">
      <div className="strata-install-brand">
        <img src="/stratalogo.jpeg" alt="" width="40" height="40" />
        <span><strong>STRATA</strong><small>SA’O BITSA · COME GET HOOKED</small></span>
      </div>
      <button className="strata-install-close" type="button" aria-label="Dismiss install prompt" onClick={() => setInstallCardDismissed(true)}>×</button>
      <button className="strata-install-action" type="button" onClick={() => void install()}>Install Strata <span aria-hidden="true">↗</span></button>
    </aside>}
    {updateReady && <div className="strataUpdateNotice" role="status"><span><strong>Strata has an update ready.</strong><small>Refresh to use the latest version.</small></span><button type="button" onClick={applyUpdate} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button></div>}
  </>;
}
