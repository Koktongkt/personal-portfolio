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
