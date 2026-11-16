"use client";

import { useEffect } from "react";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Feeds the pointer position to whichever [data-spotlight] surface is under it,
 * as --mx / --my. The glow itself is CSS. One listener serves the whole page.
 */
export default function Spotlight() {
  useEffect(() => {
    const fine = window.matchMedia(FINE_POINTER);
    let frame = 0;
    let x = 0;
    let y = 0;
    let target: HTMLElement | null = null;

    const paint = () => {
      frame = 0;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${x - rect.left}px`);
      target.style.setProperty("--my", `${y - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (!fine.matches) return;
      target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-spotlight]") : null;
      if (!target) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
