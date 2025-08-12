import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

interface InstallContextValue {
  canInstall: boolean;
  isStandalone: boolean;
  isIOS: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

const InstallContext = createContext<InstallContextValue | undefined>(undefined);

// Detect iOS Safari
function detectIOS() {
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  // iOS 13+ iPadOS reports as Mac, use touch points
  const iOSLike = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  return iOSLike;
}

function detectStandalone() {
  // PWA display-mode
  const mql = window.matchMedia && window.matchMedia('(display-mode: standalone)');
  const standaloneMql = mql ? mql.matches : false;
  // iOS Safari
  const iosStandalone = (window as any).navigator?.standalone === true;
  return standaloneMql || iosStandalone;
}

export const InstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deferredPromptRef = useRef<any | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(detectStandalone());
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(detectIOS());
    const onChange = () => setIsStandalone(detectStandalone());
    window.matchMedia('(display-mode: standalone)').addEventListener?.('change', onChange as any);
    window.addEventListener('appinstalled', onChange);
    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener?.('change', onChange as any);
      window.removeEventListener('appinstalled', onChange);
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setIsStandalone(true);
    });
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    // If we have a deferred prompt (Android/Chrome)
    const promptEvent = deferredPromptRef.current;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        // Once used, Chrome discards the event; reset state
        deferredPromptRef.current = null;
        setCanInstall(false);
        return choice?.outcome === 'accepted' ? 'accepted' : 'dismissed';
      } catch {
        return 'dismissed';
      }
    }
    return 'unavailable';
  };

  const value = useMemo<InstallContextValue>(() => ({
    canInstall,
    isStandalone,
    isIOS,
    promptInstall,
  }), [canInstall, isStandalone, isIOS]);

  return (
    <InstallContext.Provider value={value}>
      {children}
    </InstallContext.Provider>
  );
};

export function useInstall() {
  const ctx = useContext(InstallContext);
  if (!ctx) throw new Error('useInstall must be used within InstallProvider');
  return ctx;
}
