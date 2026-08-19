"use client";

import { useEffect, useRef } from "react";

type Pixel = {
  column: number;
  row: number;
  layer: number;
  headX: number;
  headY: number;
  headEdge: boolean;
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

type HeadPoint = { x: number; y: number; edge: boolean };

function createPortraitPoints(): HeadPoint[] {
  const mask = document.createElement("canvas");
  const maskWidth = 300;
  const maskHeight = 380;
  mask.width = maskWidth;
  mask.height = maskHeight;
  const maskContext = mask.getContext("2d");
  if (!maskContext) return [];

  maskContext.fillStyle = "#fff";

  // A calm side-profile bust with one continuous, readable contour.
  maskContext.beginPath();
  maskContext.moveTo(182, 18);
  maskContext.bezierCurveTo(122, 15, 84, 54, 79, 111);
  maskContext.bezierCurveTo(77, 137, 69, 157, 56, 178);
  maskContext.lineTo(42, 195);
  maskContext.bezierCurveTo(38, 201, 46, 205, 59, 207);
  maskContext.bezierCurveTo(54, 213, 57, 219, 66, 223);
  maskContext.bezierCurveTo(58, 227, 60, 234, 70, 238);
  maskContext.bezierCurveTo(75, 255, 91, 270, 111, 278);
  maskContext.bezierCurveTo(121, 305, 112, 337, 94, 378);
  maskContext.lineTo(278, 378);
  maskContext.bezierCurveTo(251, 345, 235, 313, 240, 281);
  maskContext.bezierCurveTo(282, 253, 302, 204, 296, 142);
  maskContext.bezierCurveTo(290, 65, 247, 21, 182, 18);
  maskContext.closePath();
  maskContext.fill();

  const pixels = maskContext.getImageData(0, 0, maskWidth, maskHeight).data;
  const isFilled = (x: number, y: number) =>
    x >= 0 && x < maskWidth && y >= 0 && y < maskHeight && pixels[(y * maskWidth + x) * 4 + 3] > 0;
  const points: HeadPoint[] = [];

  for (let y = 2; y < maskHeight; y += 4) {
    for (let x = 2; x < maskWidth; x += 4) {
      if (!isFilled(x, y)) continue;
      const edge = !isFilled(x - 7, y) || !isFilled(x + 7, y) || !isFilled(x, y - 7) || !isFilled(x, y + 7);
      points.push({ x: x / maskWidth, y: y / maskHeight, edge });
    }
  }

  const bounds = points.reduce(
    (result, point) => ({
      minimumX: Math.min(result.minimumX, point.x),
      maximumX: Math.max(result.maximumX, point.x),
      minimumY: Math.min(result.minimumY, point.y),
      maximumY: Math.max(result.maximumY, point.y),
    }),
    { minimumX: 1, maximumX: 0, minimumY: 1, maximumY: 0 },
  );
  const shapeWidth = Math.max(0.001, bounds.maximumX - bounds.minimumX);
  const shapeHeight = Math.max(0.001, bounds.maximumY - bounds.minimumY);

  return points.map((point) => ({
    x: (point.x - bounds.minimumX) / shapeWidth,
    y: (point.y - bounds.minimumY) / shapeHeight,
    edge: point.edge,
  }));
}

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
    const headPoints = createPortraitPoints();
    const pointer = { x: -1000, y: -1000, active: false };
    let width = 0;
    let height = 0;
    let aboutTop = 0;
    let aboutHeight = 0;
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
              headX: 0,
              headY: 0,
              headEdge: false,
              offsetX: 0,
              offsetY: 0,
              velocityX: 0,
              velocityY: 0,
            });
          }
        }
      });

      const compactLayout = width < 900;
      const headWidth = width < 640
        ? Math.min(240, width * 0.62)
        : compactLayout
          ? 270
          : clamp(width * 0.27, 320, 360);
      const headHeight = headWidth * 1.27;
      const headCenterX = compactLayout ? width * 0.68 : width * 0.89;
      const headLeft = headCenterX - headWidth / 2;
      const headTop = compactLayout
        ? aboutTop + aboutHeight - headHeight - 58
        : aboutTop + clamp(aboutHeight * 0.16, 75, 145);

      pixels.forEach((pixel, index) => {
        const point = headPoints[((index * 2654435761) >>> 0) % headPoints.length];
        if (!point) return;
        pixel.headX = headLeft + point.x * headWidth;
        pixel.headY = headTop + point.y * headHeight;
        pixel.headEdge = point.edge;
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
        const headMotionX = Math.sin(elapsed * 0.8 + pixel.headY * 0.012) * 1.2 * morph;
        const headMotionY = Math.sin(elapsed * 1.05 + pixel.headX * 0.01) * 0.9 * morph;
        const originX = baseX + (pixel.headX + headMotionX - baseX) * morph;
        const originY = baseY + (pixel.headY + headMotionY - baseY) * morph;

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
        const headAlpha = (pixel.headEdge ? 0.72 : 0.03) * edgeFade;
        const alpha = waveAlpha + (headAlpha - waveAlpha) * morph;
        const waveAccent = clamp((waveEnergy - 0.58) * 0.72 + pixel.layer * 0.035, 0, 0.48);
        const headAccent = pixel.headEdge ? 0.1 : 0.02;
        const accentMix = clamp(waveAccent + (headAccent - waveAccent) * morph + pointerEnergy * 0.35, 0, 0.6);
        const red = Math.round(229 + (199 - 229) * accentMix);
        const green = Math.round(230 + (255 - 230) * accentMix);
        const blue = Math.round(232 + (74 - 232) * accentMix);
        const waveSize = layer.size + (pixel.layer > 1 && waveEnergy > 0.72 ? 1 : 0);
        const headSize = pixel.headEdge ? 4 : 2;
        const size = Math.round(waveSize + (headSize - waveSize) * morph);
        const drawX = Math.round(originX + pixel.offsetX);
        const drawY = Math.round(originY + pixel.offsetY);

        if (accentMix > 0.2) {
          context.fillStyle = `rgba(199, 255, 74, ${alpha * 0.12})`;
          context.fillRect(drawX - 2, drawY - 2, size + 4, size + 4);
        }

        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        context.fillRect(drawX, drawY, size, size);
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
