"use client";

import { useEffect, useRef } from "react";

type Pixel = {
  column: number;
  row: number;
  layer: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

const LAYERS = [
  { spacing: 22, rows: 5, speed: 10, amplitude: 23, wavelength: 210, size: 4, alpha: 0.12 },
  { spacing: 17, rows: 7, speed: 15, amplitude: 34, wavelength: 260, size: 5, alpha: 0.14 },
  { spacing: 13, rows: 9, speed: 21, amplitude: 45, wavelength: 330, size: 6, alpha: 0.16 },
] as const;

export default function PixelWave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const pixels: Pixel[] = [];
    const pointer = { x: -1000, y: -1000, active: false };
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let previousTime = performance.now();

    const rebuild = () => {
      const bounds = canvas.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(width * density));
      canvas.height = Math.max(1, Math.round(height * density));
      context.setTransform(density, 0, 0, density, 0, 0);
      pixels.length = 0;
      pointer.active = false;

      LAYERS.forEach((layer, layerIndex) => {
        const columns = Math.ceil(width / layer.spacing) + 8;
        for (let row = 0; row < layer.rows; row += 1) {
          for (let column = -4; column < columns; column += 1) {
            pixels.push({
              column,
              row,
              layer: layerIndex,
              offsetX: 0,
              offsetY: 0,
              velocityX: 0,
              velocityY: 0,
            });
          }
        }
      });
    };

    const draw = (time: number) => {
      const delta = Math.min((time - previousTime) / 16.667, 2);
      previousTime = time;
      context.clearRect(0, 0, width, height);
      const elapsed = reducedMotion.matches ? 0 : time / 1000;

      for (const pixel of pixels) {
        const layer = LAYERS[pixel.layer];
        const bandCenter = height * (0.57 + pixel.layer * 0.1);
        const rowOffset = (pixel.row - (layer.rows - 1) / 2) * layer.spacing;
        const travel = reducedMotion.matches ? 0 : elapsed * layer.speed;
        const travelWidth = width + layer.spacing * 8;
        const baseX = ((pixel.column * layer.spacing + travel + layer.spacing * 4) % travelWidth) - layer.spacing * 4;
        const phase = baseX / layer.wavelength * Math.PI * 2 - elapsed * (0.72 + pixel.layer * 0.13);
        const baseY = bandCenter + rowOffset + Math.sin(phase + pixel.row * 0.18) * layer.amplitude;

        let targetX = 0;
        let targetY = 0;
        if (pointer.active && !coarsePointer.matches && !reducedMotion.matches) {
          const dx = baseX - pointer.x;
          const dy = baseY - pointer.y;
          const distanceSquared = dx * dx + dy * dy;
          const radius = 118;
          if (distanceSquared < radius * radius) {
            const distance = Math.max(Math.sqrt(distanceSquared), 1);
            const force = (1 - distance / radius) ** 2 * 72;
            targetX = dx / distance * force;
            targetY = dy / distance * force;
          }
        }

        pixel.velocityX += (targetX - pixel.offsetX) * 0.16 * delta;
        pixel.velocityY += (targetY - pixel.offsetY) * 0.16 * delta;
        pixel.velocityX *= 0.72 ** delta;
        pixel.velocityY *= 0.72 ** delta;
        pixel.offsetX += pixel.velocityX * delta;
        pixel.offsetY += pixel.velocityY * delta;

        const depthFade = 0.72 + pixel.layer * 0.14;
        const edgeFade = Math.min(1, baseX / 90, (width - baseX) / 90);
        const alpha = Math.max(0, layer.alpha * depthFade * edgeFade);
        context.fillStyle = `rgba(229, 230, 232, ${alpha})`;
        context.fillRect(
          Math.round(baseX + pixel.offsetX),
          Math.round(baseY + pixel.offsetY),
          layer.size,
          layer.size,
        );
      }

      if (!reducedMotion.matches && !document.hidden) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const restart = () => {
      window.cancelAnimationFrame(animationFrame);
      previousTime = performance.now();
      animationFrame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = pointer.x >= 0 && pointer.x <= bounds.width && pointer.y >= 0 && pointer.y <= bounds.height;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && !reducedMotion.matches) restart();
    };

    const handleMotionChange = () => {
      rebuild();
      restart();
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuild();
      if (reducedMotion.matches) draw(performance.now());
    });

    rebuild();
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionChange);
    restart();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return <canvas className="pixel-wave" ref={canvasRef} aria-hidden="true" />;
}
