import React, { createContext, useContext } from "react";

// "Low graphics" setting for slower laptops.
// Each 3D <Canvas> wraps its scene in <GfxContext.Provider value={lowGfx}>.
export const GfxContext = createContext(false);
export const useLowGfx = () => useContext(GfxContext);

// A purely decorative point light: skipped in low graphics mode (every extra light costs GPU time on every pixel).
// Lights that matter for gameplay (e.g. the rover's night headlight) stay as normal <pointLight>.
export function DecoLight(props) {
  const low = useContext(GfxContext);
  return low ? null : <pointLight {...props} />;
}

// Canvas settings for each quality level: no shadow maps, lower resolution in low mode
export function canvasQuality(low) {
  return { shadows: !low, dpr: low ? 0.75 : [1, 2] };
}

const KEY = "blastoff-low-gfx";
export function loadLowGfx() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
export function saveLowGfx(on) {
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // private mode / blocked storage: the setting just won't be remembered
  }
}
