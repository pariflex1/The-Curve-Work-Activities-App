"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsLoading(false);
    setProgress(100);
    const timer = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (
        anchor &&
        anchor.href &&
        anchor.target !== "_blank" &&
        !anchor.href.startsWith("javascript:") &&
        !anchor.href.startsWith("#")
      ) {
        try {
          const url = new URL(anchor.href, window.location.href);
          if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
            setIsLoading(true);
            setProgress(35);
          }
        } catch {}
      }
    };

    const handleFormSubmit = () => {
      setIsLoading(true);
      setProgress(40);
    };

    document.addEventListener("click", handleAnchorClick);
    document.addEventListener("submit", handleFormSubmit);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      document.removeEventListener("submit", handleFormSubmit);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90;
          return prev + 15;
        });
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* Top Global Progress Loading Bar */}
      <div className="fixed top-0 left-0 right-0 z-[99999] h-1.5 bg-slate-200/50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(59,130,246,0.9)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Corner Loading Badge */}
      {isLoading && (
        <div className="fixed bottom-5 right-5 z-[99999] bg-slate-900/90 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center animate-spin">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">Loading...</span>
        </div>
      )}
    </>
  );
}

export default function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}
