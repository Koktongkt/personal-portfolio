"use client";

/* eslint-disable @next/next/no-img-element -- still WebP plus a video srcset the image optimizer does not emit */
import { useEffect, useRef } from "react";

type Props = {
  slug: string;
  alt: string;
  imageSizes: string;
  /** The 800px WebM is absent for some cards. The 400px WebM is still used. */
  webm800?: boolean;
};

const FINE = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

function canPreview() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return window.matchMedia(FINE).matches && !window.matchMedia(REDUCED).matches && !saveData;
}

export default function ProjectPreview({ slug, alt, imageSizes, webm800 = true }: Props) {
  const shot = useRef<HTMLSpanElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    const box = shot.current;
    const card = box?.closest<HTMLElement>(".project-card");
    if (!element || !box || !card) return;

    let active = false;
    let pauseTimer = 0;

    const attach = () => {
      if (element.getAttribute("src")) return;
      const big = box.clientWidth * window.devicePixelRatio > 480;
      const webm = element.canPlayType('video/webm; codecs="vp9"') !== "" && (webm800 || !big);
      const ext = webm ? "webm" : "mp4";
      const size = big ? "" : "-400";
      element.src = `/projects/clips/${slug}${size}.${ext}`;
    };

    const start = () => {
      if (!canPreview()) return;
      active = true;
      window.clearTimeout(pauseTimer);
      attach();
      element.play().catch(() => {});
    };

    const stop = () => {
      active = false;
      card.classList.remove("is-previewing");
      pauseTimer = window.setTimeout(() => {
        if (!active) element.pause();
      }, 220);
    };

    const onPlaying = () => {
      if (active) card.classList.add("is-previewing");
    };

    const onFocusOut = (event: FocusEvent) => {
      if (!card.contains(event.relatedTarget as Node)) stop();
    };

    card.addEventListener("pointerenter", start);
    card.addEventListener("pointerleave", stop);
    card.addEventListener("focusin", start);
    card.addEventListener("focusout", onFocusOut);
    element.addEventListener("playing", onPlaying);

    return () => {
      window.clearTimeout(pauseTimer);
      card.removeEventListener("pointerenter", start);
      card.removeEventListener("pointerleave", stop);
      card.removeEventListener("focusin", start);
      card.removeEventListener("focusout", onFocusOut);
      element.removeEventListener("playing", onPlaying);
    };
  }, [slug, webm800]);

  return (
    <span className="project-media" ref={shot}>
      <img
        src={`/projects/${slug}.webp`}
        srcSet={`/projects/${slug}-400.webp 400w, /projects/${slug}.webp 800w`}
        sizes={imageSizes}
        width={800}
        height={500}
        loading="lazy"
        decoding="async"
        alt={alt}
      />
      <video
        ref={video}
        className="project-video"
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        width={800}
        height={500}
      />
    </span>
  );
}
