/** Backing-store cap. Above this, a full-viewport canvas becomes a long task. */
export const MAX_CANVAS_DPR = 1.25;

export function cappedDevicePixelRatio() {
  return Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
}
