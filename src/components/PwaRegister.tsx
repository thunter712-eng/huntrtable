"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/basePath";

/**
 * Registers the service worker and keeps the installed app up to date.
 *
 * Update flow (so a home-screen app refreshes itself without reinstalling):
 *  - Each deploy ships a uniquely-stamped sw.js, so the browser detects a new
 *    version and installs it. The new worker calls skipWaiting() (in sw.js),
 *    activates, and claims the page — which fires "controllerchange".
 *  - We reload once on controllerchange, but only if the page was already
 *    controlled (i.e. this is an update, not the first install) so first visits
 *    don't flash a reload.
 *  - We also poll for updates on launch, when the app returns to the
 *    foreground, and on an interval — important on iOS, which otherwise rarely
 *    re-checks for a standalone web app.
 *
 * Renders nothing.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;
    // If a controller already exists, this page load is from an installed app,
    // so a later controller change means a real update we should reload for.
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

    const checkForUpdate = () => registration?.update().catch(() => {});

    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register(
          `${BASE_PATH}/sw.js`,
          { scope: `${BASE_PATH}/` },
        );
        checkForUpdate();
        // Re-check when the user comes back to the app, and periodically.
        document.addEventListener("visibilitychange", onVisible);
        interval = setInterval(checkForUpdate, 30 * 60 * 1000);
      } catch (err) {
        console.warn("SW registration failed:", err);
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

  return null;
}
