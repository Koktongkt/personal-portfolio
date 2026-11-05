"use client";

import { useEffect, useRef } from "react";
import "./custom-cursor.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const RING_SIZE = 40;
/* First-order follow. A gap of G px is within 1px after tau * ln(G) ms, so a
   fast stop (~80px of lag) settles in about 70ms and a long jump in about 110ms.
   No velocity term, so the ring cannot overshoot. */
const SETTLE_TAU_MS = 16;

type Mode = "hidden" | "default" | "link" | "text" | "view" | "play" | "native";

type Box = { left: number; top: number; width: number; height: number };

const EXPLICIT = new Set(["view", "play", "text", "link"]);
const INTERACTIVE = "a[href], button, summary, [role='button'], [role='link']";
const NATIVE_FIELD = "input, textarea, select, option, [contenteditable='true']";
const TEXTUAL = "h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, dd, dt, time, address, label, small";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isTextual(element: HTMLElement) {
  if (element.matches(TEXTUAL)) return true;
  return element.tagName === "SPAN" && element.childElementCount === 0 && (element.textContent?.trim().length ?? 0) > 0;
}

function magnetElement(element: HTMLElement, mode: Mode) {
  if (mode === "view" || mode === "play") return element.closest<HTMLElement>(".project-card") ?? element;
  if (mode === "link") return element;
  return null;
}

function resolveTarget(target: EventTarget | null) {
  let textElement: HTMLElement | null = null;
  let element = target instanceof Element ? target : null;

  while (element && element !== document.documentElement) {
    if (element instanceof HTMLElement) {
      const explicit = element.dataset.cursor;
      if (explicit && EXPLICIT.has(explicit)) {
        const mode = explicit as Mode;
        return { mode, magnet: magnetElement(element, mode) };
      }
      if (element.matches(NATIVE_FIELD)) return { mode: "native" as const, magnet: null };
      if (element.matches(INTERACTIVE)) return { mode: "link" as const, magnet: element };
      if (!textElement && isTextual(element)) textElement = element;
    }
    element = element.parentElement;
  }

  if (textElement) return { mode: "text" as const, magnet: null };
  return { mode: "default" as const, magnet: null };
}

function ringScaleFor(mode: Mode, box: Box | null) {
  if (mode !== "link" || !box) return 1;
  const span = Math.min(box.width, box.height);
  return Math.max(54, Math.min(86, span + 20)) / RING_SIZE;
}

function place(element: HTMLElement, x: number, y: number, scale = 1) {
  element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
}

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const dot = root.querySelector<HTMLElement>(".fx-cursor__dot");
    const ring = root.querySelector<HTMLElement>(".fx-cursor__ring");
    const beam = root.querySelector<HTMLElement>(".fx-cursor__beam");
    const pill = root.querySelector<HTMLElement>(".fx-cursor__pill");
    const play = root.querySelector<HTMLElement>(".fx-cursor__play");
    if (!dot || !ring || !beam || !pill || !play) return;

    const motion = window.matchMedia(REDUCED_MOTION);
    const html = document.documentElement;
    let reduced = motion.matches;
    let frame = 0;
    let lastTime = 0;
    let inside = false;
    let pointerX = 0;
    let pointerY = 0;
    let trailX = 0;
    let trailY = 0;
    let ringScale = 1;
    let scaleGoal = 1;
    let mode: Mode = "hidden";
    let magnet: HTMLElement | null = null;
    let box: Box | null = null;
    let boxDirty = false;
    let nudged: HTMLElement | null = null;
    let nudgeX = 0;
    let nudgeY = 0;
    let nudgeGoalX = 0;
    let nudgeGoalY = 0;
    let lastTarget: EventTarget | null = null;

    const setMode = (next: Mode) => {
      if (mode === next) return;
      mode = next;
      root.dataset.mode = next;
    };

    const syncNativeCursor = () => {
      // Native cursor stays available on form fields and whenever the custom one is hidden.
      html.classList.toggle("has-custom-cursor", inside && mode !== "native" && mode !== "hidden");
    };

    const clearNudge = () => {
      if (nudged) nudged.style.removeProperty("translate");
      nudged = null;
      nudgeX = 0;
      nudgeY = 0;
      nudgeGoalX = 0;
      nudgeGoalY = 0;
    };

    const measure = (element: HTMLElement): Box => {
      const rect = element.getBoundingClientRect();
      const ownX = element === nudged ? nudgeX : 0;
      const ownY = element === nudged ? nudgeY : 0;
      return {
        left: rect.left - ownX,
        top: rect.top - ownY,
        width: rect.width,
        height: rect.height,
      };
    };

    const retarget = (target: EventTarget | null) => {
      const resolved = resolveTarget(target);
      if (resolved.magnet !== magnet) {
        clearNudge();
        magnet = resolved.magnet;
        box = magnet ? measure(magnet) : null;
      }
      scaleGoal = ringScaleFor(resolved.mode, box);
      setMode(inside ? resolved.mode : "hidden");
      syncNativeCursor();
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const tick = (now: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(48, now - lastTime) : 16;
      lastTime = now;
      const factor = reduced ? 1 : 1 - Math.exp(-dt / SETTLE_TAU_MS);

      if (boxDirty && magnet) {
        boxDirty = false;
        box = measure(magnet);
        scaleGoal = ringScaleFor(mode, box);
      }

      let goalX = pointerX;
      let goalY = pointerY;

      if (!reduced && magnet && box && (mode === "link" || mode === "view" || mode === "play")) {
        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;
        const pull = mode === "link" ? 0.62 : 0.18;
        const cap = mode === "link" ? 26 : 12;
        let offsetX = (centerX - pointerX) * pull;
        let offsetY = (centerY - pointerY) * pull;
        const distance = Math.hypot(offsetX, offsetY);
        if (distance > cap) {
          offsetX = (offsetX / distance) * cap;
          offsetY = (offsetY / distance) * cap;
        }
        goalX = pointerX + offsetX;
        goalY = pointerY + offsetY;

        const strength = mode === "link" ? 0.22 : 0.045;
        const limit = mode === "link" ? 7 : 5;
        nudgeGoalX = clamp((pointerX - centerX) * strength, -limit, limit);
        nudgeGoalY = clamp((pointerY - centerY) * strength, -limit, limit);
        if (nudged !== magnet) {
          if (nudged) nudged.style.removeProperty("translate");
          nudged = magnet;
          nudgeX = 0;
          nudgeY = 0;
        }
      } else {
        nudgeGoalX = 0;
        nudgeGoalY = 0;
      }

      trailX += (goalX - trailX) * factor;
      trailY += (goalY - trailY) * factor;
      ringScale += (scaleGoal - ringScale) * factor;
      nudgeX += (nudgeGoalX - nudgeX) * factor;
      nudgeY += (nudgeGoalY - nudgeY) * factor;

      if (nudged) {
        if (Math.abs(nudgeX) < 0.05 && Math.abs(nudgeY) < 0.05 && nudgeGoalX === 0 && nudgeGoalY === 0) {
          nudged.style.removeProperty("translate");
          nudged = null;
          nudgeX = 0;
          nudgeY = 0;
        } else {
          // `translate` composes with the element's own `transform` (hover lift, scroll reveal).
          nudged.style.setProperty("translate", `${nudgeX.toFixed(2)}px ${nudgeY.toFixed(2)}px`);
        }
      }

      place(dot, pointerX, pointerY);
      place(ring, trailX, trailY, ringScale);
      place(beam, pointerX, pointerY);
      place(pill, trailX, trailY);
      place(play, trailX, trailY);

      const moving =
        Math.abs(trailX - goalX) > 0.2 ||
        Math.abs(trailY - goalY) > 0.2 ||
        Math.abs(ringScale - scaleGoal) > 0.008 ||
        Math.abs(nudgeX - nudgeGoalX) > 0.15 ||
        Math.abs(nudgeY - nudgeGoalY) > 0.15 ||
        boxDirty;

      if (moving && inside) frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      const entered = !inside;
      inside = true;

      if (entered) {
        trailX = pointerX;
        trailY = pointerY;
        ringScale = scaleGoal;
        lastTime = 0;
        root.classList.add("is-on");
      }

      if (entered || event.target !== lastTarget) {
        lastTarget = event.target;
        retarget(event.target);
      }

      schedule();
    };

    const hide = () => {
      inside = false;
      lastTarget = null;
      root.classList.remove("is-on");
      setMode("hidden");
      html.classList.remove("has-custom-cursor");
      clearNudge();
      stop();
    };

    const markBoxDirty = () => {
      if (!magnet) return;
      boxDirty = true;
      if (inside) schedule();
    };

    const onMotionChange = () => {
      reduced = motion.matches;
      if (reduced) clearNudge();
      if (inside) schedule();
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", markBoxDirty, { passive: true, capture: true });
    window.addEventListener("resize", markBoxDirty, { passive: true });
    motion.addEventListener("change", onMotionChange);

    return () => {
      stop();
      clearNudge();
      html.classList.remove("has-custom-cursor");
      document.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", markBoxDirty, true);
      window.removeEventListener("resize", markBoxDirty);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className="fx-cursor" data-mode="hidden" ref={rootRef} aria-hidden="true">
      <span className="fx-cursor__dot" />
      <span className="fx-cursor__ring" />
      <span className="fx-cursor__beam">
        <svg width="18" height="30" viewBox="0 0 18 30" aria-hidden="true">
          <path d="M2 3h14M9 3v24M2 27h14" stroke="#0a0a0b" strokeWidth="4" strokeLinecap="square" />
          <path d="M2 3h14M9 3v24M2 27h14" stroke="#f4f4f0" strokeWidth="2" strokeLinecap="square" />
        </svg>
      </span>
      <span className="fx-cursor__pill">View →</span>
      <span className="fx-cursor__play">
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="22" fill="#c7ff4a" />
          <path d="M18.2 14.4v15.2L31.4 22 18.2 14.4Z" fill="#10110d" />
        </svg>
      </span>
    </div>
  );
}
