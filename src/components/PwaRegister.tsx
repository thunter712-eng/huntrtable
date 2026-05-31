"use client";

import { useEffect } from "react";
import { BASE_PATH } from "@/lib/basePath";

/**
 * Registers the service worker so HuntrTable can be installed and used offline.
 * Renders nothing; runs once on mount in the browser.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` })
        .catch((err) => console.warn("SW registration failed:", err));
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
