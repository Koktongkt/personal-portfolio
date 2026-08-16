"use client";

import { useEffect, useRef } from "react";

export default function CursorAmbient() {
  const ambientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ambient = ambientRef.current;
    const motionQuery = window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)");

    if (!ambient || motionQuery.matches) return;

    let frame = 0;
    let pointerX = -300;
    let pointerY = -300;
    let currentX = -300;
    let currentY = -300;
    let hasEntered = false;

    const render = () => {
      currentX += (pointerX - currentX) * 0.22;
      currentY += (pointerY - currentY) * 0.22;

      ambient.style.transform = `translate3d(${currentX - 95}px, ${currentY - 95}px, 0)`;
      ambient.style.opacity = "1";

      if (Math.abs(pointerX - currentX) > 0.15 || Math.abs(pointerY - currentY) > 0.15) {
        frame = window.requestAnimationFrame(render);
      } else {
        currentX = pointerX;
        currentY = pointerY;
        frame = 0;
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;

      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!hasEntered) {
        currentX = pointerX;
        currentY = pointerY;
        hasEntered = true;
      }

      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const hideAmbient = () => {
      ambient.style.opacity = "0";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", hideAmbient);
    document.documentElement.addEventListener("pointerleave", hideAmbient);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", hideAmbient);
      document.documentElement.removeEventListener("pointerleave", hideAmbient);
    };
  }, []);

  return (
    <div className="cursor-ambient" ref={ambientRef} aria-hidden="true">
      <span className="cursor-ambient__glow" />
      <span className="cursor-ambient__pixels" />
    </div>
  );
}
