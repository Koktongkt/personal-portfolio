/** Backing-store cap. Above this, a full-viewport canvas becomes a long task. */
export const MAX_CANVAS_DPR = 1.25;

export function cappedDevicePixelRatio() {
  return Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
}

/** Phones, including Lighthouse mobile. A fine pointer keeps the desktop rate. */
export function isPhonePointer() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export const PHONE_FRAME_MS = 1000 / 30;

/**
 * Run WebGL setup after first paint, during idle when the browser offers it.
 * The timeout still starts the canvas if the main thread never goes idle.
 */
export function scheduleAfterFirstPaint(work: () => void) {
  let idleId = 0;
  let timeoutId = 0;

  if (typeof window.requestIdleCallback === "function") {
    idleId = window.requestIdleCallback(() => work(), { timeout: 1200 });
  } else {
    timeoutId = window.setTimeout(work, 1);
  }

  return () => {
    if (idleId) window.cancelIdleCallback(idleId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}
