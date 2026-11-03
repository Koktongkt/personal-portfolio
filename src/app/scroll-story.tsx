"use client";

import { useEffect, useRef } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export default function ScrollStory() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const motion = window.matchMedia(REDUCED_MOTION);
    let frame = 0;
    let maxScroll = 0;
    let listening = false;

    const measure = () => {
      maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    };

    const paintBar = () => {
      frame = 0;
      if (!bar || motion.matches) return;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const requestPaint = () => {
      if (motion.matches || frame) return;
      frame = window.requestAnimationFrame(paintBar);
    };

    const onResize = () => {
      measure();
      requestPaint();
    };

    const startBar = () => {
      if (listening || motion.matches) return;
      listening = true;
      measure();
      requestPaint();
      window.addEventListener("scroll", requestPaint, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("load", onResize);
    };

    const stopBar = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      bar?.style.removeProperty("transform");
    };

    const onMotion = () => {
      if (motion.matches) stopBar();
      else startBar();
    };

    startBar();
    motion.addEventListener("change", onMotion);

    return () => {
      stopBar();
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
