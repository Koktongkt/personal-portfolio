"use client";

import { useEffect, useState, type ComponentType } from "react";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export default function CursorGate() {
  const [Cursor, setCursor] = useState<ComponentType | null>(null);

  useEffect(() => {
    const media = window.matchMedia(FINE_POINTER);
    let cancelled = false;
    let loaded: ComponentType | null = null;

    const sync = () => {
      if (!media.matches) {
        setCursor(null);
        document.documentElement.classList.remove("has-custom-cursor");
        return;
      }

      if (loaded) {
        setCursor(() => loaded);
        return;
      }

      // Import only after the media query matches so phones never fetch this chunk.
      void import("./custom-cursor").then((mod) => {
        if (cancelled || !media.matches) return;
        loaded = mod.default;
        setCursor(() => loaded);
      });
    };

    sync();
    media.addEventListener("change", sync);
    return () => {
      cancelled = true;
      media.removeEventListener("change", sync);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!Cursor) return null;
  return <Cursor />;
}
