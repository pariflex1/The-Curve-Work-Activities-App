"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

declare global {
  interface Window {
    __pwaPrompt?: any;
  }
}

export default function PWAInstallButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if running in standalone PWA mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Grab existing prompt if already captured by root layout script
    if (window.__pwaPrompt) {
      setDeferredPrompt(window.__pwaPrompt);
    }

    // Event handlers
    const onPromptReady = () => {
      if (window.__pwaPrompt) {
        setDeferredPrompt(window.__pwaPrompt);
      }
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") {
        window.__pwaPrompt = null;
      }
    };

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__pwaPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("pwaPromptReady", onPromptReady);
    window.addEventListener("appinstalled", onAppInstalled);
    window.addEventListener("pwaInstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("pwaPromptReady", onPromptReady);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("pwaInstalled", onAppInstalled);
    };
  }, []);

  // When app is installed, the button disappears completely
  if (isInstalled) {
    return null;
  }

  async function handleDirectInstall() {
    const promptEvent = deferredPrompt || window.__pwaPrompt;

    if (promptEvent) {
      try {
        // Trigger native browser direct install dialog
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult?.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        window.__pwaPrompt = null;
      } catch (err) {
        console.error("Direct install prompt error:", err);
      }
    } else {
      // If prompt event is not captured yet, dispatch event / trigger navigator install prompt if supported
      console.warn("PWA install prompt is not ready or not supported by this browser.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDirectInstall}
      title="Install The Curve App directly on your device"
      className={
        className ||
        "px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 min-h-[40px] border border-blue-400/30 shrink-0 cursor-pointer"
      }
    >
      <img
        src="/the-curve-logo.webp"
        alt="The Curve Icon"
        className="w-5 h-5 rounded-md object-contain shrink-0 bg-white/90 p-0.5"
      />
      <Download className="w-4 h-4 text-white animate-bounce" />
      <span>Install App</span>
    </button>
  );

}

