"use client";

import { useEffect, useRef } from "react";

type Pixel = {
  column: number;
  row: number;
  layer: number;
  sphereX: number;
  sphereY: number;
  sphereZ: number;
  sphereSeed: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
};

const LAYERS = [
  { spacing: 30, rows: 4, speed: 5, amplitude: 25, wavelength: 320, size: 2, alpha: 0.08 },
  { spacing: 22, rows: 6, speed: 8, amplitude: 38, wavelength: 390, size: 3, alpha: 0.12 },
  { spacing: 17, rows: 8, speed: 12, amplitude: 52, wavelength: 460, size: 4, alpha: 0.16 },
  { spacing: 13, rows: 10, speed: 16, amplitude: 66, wavelength: 540, size: 5, alpha: 0.2 },
] as const;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const hashUnit = (value: number) => {
  let hashed = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  hashed = Math.imul(hashed ^ (hashed >>> 16), 0x45d9f3b);
  return ((hashed ^ (hashed >>> 16)) >>> 0) / 4294967295;
};

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
    let aboutTop = 0;
    let aboutHeight = 0;
    let sphereCenterX = 0;
    let sphereCenterY = 0;
    let sphereDiameter = 320;
    let morph = 0;
    let morphTarget = 0;
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

      const aboutSection = canvas.parentElement?.querySelector<HTMLElement>(".manifesto");
      aboutTop = aboutSection?.offsetTop ?? height * 0.58;
      aboutHeight = aboutSection?.offsetHeight ?? height * 0.42;

      LAYERS.forEach((layer, layerIndex) => {
        const columns = Math.ceil(width / layer.spacing) + 8;
        for (let row = 0; row < layer.rows; row += 1) {
          for (let column = -4; column < columns; column += 1) {
            pixels.push({
              column,
              row,
              layer: layerIndex,
              sphereX: 0,
              sphereY: 0,
              sphereZ: 0,
              sphereSeed: 0,
              offsetX: 0,
              offsetY: 0,
              velocityX: 0,
              velocityY: 0,
            });
          }
        }
      });

      const compactLayout = width < 900;
      sphereDiameter = width < 640
        ? Math.min(230, width * 0.6)
        : compactLayout
          ? 260
          : clamp(width * 0.212, 280, 300);
      sphereCenterX = compactLayout ? width * 0.68 : width * 0.895;
      sphereCenterY = compactLayout
        ? aboutTop + aboutHeight - sphereDiameter / 2 - 58
        : aboutTop + clamp(aboutHeight * 0.16, 75, 145) + sphereDiameter / 2;
      pixels.forEach((pixel, index) => {
        const normalizedY = 1 - hashUnit(index + 1) * 2;
        const radialScale = Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY));
        const angle = hashUnit(index + 1731) * Math.PI * 2;
        pixel.sphereX = Math.cos(angle) * radialScale * sphereDiameter / 2;
        pixel.sphereY = normalizedY * sphereDiameter / 2;
        pixel.sphereZ = Math.sin(angle) * radialScale;
        pixel.sphereSeed = hashUnit(index + 9013);
      });
    };

    const updateMorphTarget = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const localScroll = -container.getBoundingClientRect().top;
      const start = aboutTop - window.innerHeight * 0.58;
      const end = aboutTop - window.innerHeight * 0.08;
      const progress = clamp((localScroll - start) / Math.max(1, end - start), 0, 1);
      morphTarget = progress * progress * (3 - 2 * progress);
    };

    const draw = (time: number) => {
      const delta = Math.min((time - previousTime) / 16.667, 2);
      previousTime = time;
      context.clearRect(0, 0, width, height);
      const elapsed = reducedMotion.matches ? 0 : time / 1000;
      morph = reducedMotion.matches
        ? morphTarget
        : morph + (morphTarget - morph) * (1 - 0.86 ** delta);
      const sphereRotation = reducedMotion.matches ? 0.4 : elapsed * 0.38;
      const rotationCosine = Math.cos(sphereRotation);
      const rotationSine = Math.sin(sphereRotation);

      for (const pixel of pixels) {
        const layer = LAYERS[pixel.layer];
        const bandCenter = aboutTop * (0.49 + pixel.layer * 0.085);
        const rowOffset = (pixel.row - (layer.rows - 1) / 2) * layer.spacing;
        const travel = reducedMotion.matches ? 0 : elapsed * layer.speed;
        const travelWidth = width + layer.spacing * 8;
        const rowStagger = pixel.row * layer.spacing * 0.34;
        const baseX = ((pixel.column * layer.spacing + rowStagger + travel + layer.spacing * 4) % travelWidth) - layer.spacing * 4;
        const phase = baseX / layer.wavelength * Math.PI * 2 - elapsed * (0.42 + pixel.layer * 0.07);
        const primaryWave = Math.sin(phase + pixel.row * 0.12);
        const secondaryWave = Math.sin(phase * 0.47 + pixel.row * 0.54 + pixel.layer * 0.8) * 0.24;
        const waveEnergy = clamp((primaryWave + secondaryWave + 1.24) / 2.48, 0, 1);
        const baseY = bandCenter + rowOffset + (primaryWave + secondaryWave) * layer.amplitude;
        const rotatedX = pixel.sphereX * rotationCosine + pixel.sphereZ * sphereDiameter / 2 * rotationSine;
        const rotatedZ = -pixel.sphereX / (sphereDiameter / 2) * rotationSine + pixel.sphereZ * rotationCosine;
        const perspective = 1 + rotatedZ * 0.055;
        const sphereX = sphereCenterX + rotatedX * perspective;
        const sphereY = sphereCenterY + pixel.sphereY * perspective;
        const originX = baseX + (sphereX - baseX) * morph;
        const originY = baseY + (sphereY - baseY) * morph;

        let targetX = 0;
        let targetY = 0;
        let pointerEnergy = 0;
        if (pointer.active && !coarsePointer.matches && !reducedMotion.matches) {
          const dx = originX - pointer.x;
          const dy = originY - pointer.y;
          const distanceSquared = dx * dx + dy * dy;
          const radius = 165;
          if (distanceSquared < radius * radius) {
            const distance = Math.max(Math.sqrt(distanceSquared), 1);
            pointerEnergy = (1 - distance / radius) ** 2;
            const push = pointerEnergy * 58;
            const ripple = Math.sin(distance * 0.075 - elapsed * 6) * pointerEnergy * 16;
            targetX = dx / distance * (push + ripple);
            targetY = dy / distance * (push + ripple);
          }
        }

        pixel.velocityX += (targetX - pixel.offsetX) * 0.12 * delta;
        pixel.velocityY += (targetY - pixel.offsetY) * 0.12 * delta;
        pixel.velocityX *= 0.78 ** delta;
        pixel.velocityY *= 0.78 ** delta;
        pixel.offsetX += pixel.velocityX * delta;
        pixel.offsetY += pixel.velocityY * delta;

        const rowDistance = Math.abs(pixel.row - (layer.rows - 1) / 2) / Math.max(1, layer.rows / 2);
        const rowFade = 1 - rowDistance * 0.38;
        const edgeFade = clamp(Math.min(originX / 110, (width - originX) / 110), 0, 1);
        const crestGlow = 0.72 + waveEnergy * 0.48;
        const waveAlpha = layer.alpha * rowFade * edgeFade * crestGlow;
        const frontVisibility = clamp((rotatedZ + 0.08) / 0.16, 0, 1);
        const frontEase = frontVisibility * frontVisibility * (3 - 2 * frontVisibility);
        const horizontalShade = rotatedX / Math.max(1, sphereDiameter / 2);
        const verticalShade = pixel.sphereY / Math.max(1, sphereDiameter / 2);
        const stippleShade = clamp(0.26 + horizontalShade * 0.2 + verticalShade * 0.26 + pixel.sphereSeed * 0.2, 0.08, 0.84);
        const rim = (1 - Math.max(0, rotatedZ)) ** 3 * 0.2;
        const sphereAlpha = (0.1 + stippleShade * 0.66 + rim) * frontEase * edgeFade;
        const alpha = waveAlpha + (sphereAlpha - waveAlpha) * morph;
        const waveAccent = clamp((waveEnergy - 0.58) * 0.72 + pixel.layer * 0.035, 0, 0.48);
        const accentMix = clamp(waveAccent * (1 - morph) + pointerEnergy * 0.35, 0, 0.6);
        const red = Math.round(229 + (199 - 229) * accentMix);
        const green = Math.round(230 + (255 - 230) * accentMix);
        const blue = Math.round(232 + (74 - 232) * accentMix);
        const waveSize = layer.size + (pixel.layer > 1 && waveEnergy > 0.72 ? 1 : 0);
        const sphereSize = 1 + Math.round(pixel.sphereSeed * 1.6 + Math.max(0, rotatedZ) * 0.8);
        const size = Math.max(1, Math.round(waveSize + (sphereSize - waveSize) * morph));
        const drawX = Math.round(originX + pixel.offsetX);
        const drawY = Math.round(originY + pixel.offsetY);

        if (accentMix > 0.2) {
          context.fillStyle = `rgba(199, 255, 74, ${alpha * 0.12})`;
          context.fillRect(drawX - 2, drawY - 2, size + 4, size + 4);
        }

        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        context.fillRect(drawX, drawY, size, size);

        if (morph > 0.2 && frontEase > 0.05) {
          const detailAngle = pixel.sphereSeed * Math.PI * 2;
          const detailAlpha = sphereAlpha * morph * 0.46;
          context.fillStyle = `rgba(229, 230, 232, ${detailAlpha})`;
          context.fillRect(
            Math.round(drawX + Math.cos(detailAngle) * 3.2),
            Math.round(drawY + Math.sin(detailAngle) * 3.2),
            1,
            1,
          );
          context.fillRect(
            Math.round(drawX - Math.sin(detailAngle) * 2.1),
            Math.round(drawY + Math.cos(detailAngle) * 2.1),
            1,
            1,
          );
        }
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
      updateMorphTarget();
      restart();
    };

    const handleScroll = () => {
      updateMorphTarget();
      if (reducedMotion.matches) draw(performance.now());
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuild();
      updateMorphTarget();
      if (reducedMotion.matches) draw(performance.now());
    });

    rebuild();
    updateMorphTarget();
    resizeObserver.observe(canvas);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.addEventListener("change", handleMotionChange);
    restart();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return <canvas className="pixel-wave" ref={canvasRef} aria-hidden="true" />;
}
