"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_PATH } from "@/lib/basePath";

/**
 * Registers the service worker, watches for updates, and shows a "new version
 * available" toast the user can tap to refresh — no delete/reinstall needed.
 *
 * How it works:
 *  - Each deploy ships a uniquely-stamped sw.js, so the browser installs the
 *    new worker. Because sw.js does NOT skipWaiting, the new worker parks in
 *    the "waiting" state — that's our signal that an update is ready.
 *  - We surface that as a toast. Tapping Refresh posts SKIP_WAITING to the
 *    waiting worker; once it takes control ("controllerchange") we reload.
 *  - We poll for updates on launch, when the app returns to the foreground,
 *    and on an interval — important on iOS, which rarely re-checks otherwise.
 */
export default function PwaRegister() {
  const [updateReady, setUpdateReady] = useState(false);
  const waitingRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;
    // Pages controlled at load time are running an installed app; a later
    // controller change is then a real update we should reload for.
    const wasControlled = !!navigator.serviceWorker.controller;
    const onControllerChange = () => {
      if (!wasControlled || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    let registration: ServiceWorkerRegistration | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;

    const announce = (worker: ServiceWorker | null) => {
      if (!worker) return;
      waitingRef.current = worker;
      setUpdateReady(true);
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register(
          `${BASE_PATH}/sw.js`,
          { scope: `${BASE_PATH}/` },
        );

        // An update may already be waiting from a previous visit.
        if (registration.waiting && navigator.serviceWorker.controller) {
          announce(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const incoming = registration!.installing;
          if (!incoming) return;
          incoming.addEventListener("statechange", () => {
            if (
              incoming.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              announce(incoming);
            }
          });
        });

        registration.update().catch(() => {});
        document.addEventListener("visibilitychange", onVisible);
        interval = setInterval(
          () => registration?.update().catch(() => {}),
          30 * 60 * 1000,
        );
      } catch (err) {
        console.warn("SW registration failed:", err);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        registration?.update().catch(() => {});
      }
    };

    window.addEventListener("load", register);

    return () => {
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", onVisible);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      if (interval) clearInterval(interval);
    };
  }, []);

  const refresh = useCallback(() => {
    setUpdateReady(false);
    const worker = waitingRef.current;
    if (worker) {
      worker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  }, []);

  if (!updateReady) return null;

  return (
    <div className="ht-update-toast" role="status">
      <span className="flex items-center gap-1.5">
        <span aria-hidden>✨</span> New version available
      </span>
      <button
        type="button"
        onClick={refresh}
        className="ht-update-toast__btn"
      >
        Refresh
      </button>
    </div>
  );
}
