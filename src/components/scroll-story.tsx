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
    let reveals: IntersectionObserver | undefined;

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

    const clearReveals = () => {
      reveals?.disconnect();
      reveals = undefined;
      document.querySelector("main")?.classList.remove("story-ready");
    };

    const armReveals = () => {
      clearReveals();
      if (motion.matches || !("IntersectionObserver" in window)) return;

      const main = document.querySelector("main");
      if (!main) return;
      const items = Array.from(main.querySelectorAll<HTMLElement>("[data-reveal]"));
      if (!items.length) return;

      const groups = new Map<HTMLElement, HTMLElement[]>();
      for (const el of items) {
        const parent = el.parentElement;
        if (!parent) continue;
        const group = groups.get(parent);
        if (group) group.push(el);
        else groups.set(parent, [el]);
      }
      for (const group of groups.values()) {
        group.forEach((el, index) => el.style.setProperty("--i", String(index)));
      }

      const viewportHeight = window.innerHeight;
      for (const el of items) {
        const rect = el.getBoundingClientRect();
        el.classList.toggle("is-shown", rect.top < viewportHeight && rect.bottom > 0);
      }

      main.classList.add("story-ready");

      reveals = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-shown");
            reveals?.unobserve(entry.target);
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
      );

      for (const el of items) {
        if (!el.classList.contains("is-shown")) reveals.observe(el);
      }
    };

    const nativeBar = CSS.supports("animation-timeline: scroll()");

    const onMotion = () => {
      if (motion.matches) stopBar();
      else if (!nativeBar) startBar();
      armReveals();
    };

    if (!nativeBar) startBar();
    armReveals();
    motion.addEventListener("change", onMotion);

    return () => {
      stopBar();
      clearReveals();
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
