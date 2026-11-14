// Cap reads text aloud with the browser's built-in text-to-speech (no audio files, works offline).
// English uses an en voice; Bahasa Melayu prefers ms, then id (very close), then any voice.
import { useEffect } from "react";

const state = { lang: "en", auto: true, enabled: true };

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Emoji, arrows and symbols sound silly when read out
const clean = (text) =>
  String(text || "")
    .replace(/\p{Extended_Pictographic}|️|‍/gu, "")
    .replace(/[▲▼◀▶←→↩⏳⏱✓✨]/g, "")
    .replace(/\s+/g, " ")
    .trim();

function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  const prefs = lang === "ms" ? ["ms", "id"] : ["en"];
  for (const p of prefs) {
    const v = voices.find((x) => x.lang?.toLowerCase().startsWith(p) && /female|google|natural/i.test(x.name)) || voices.find((x) => x.lang?.toLowerCase().startsWith(p));
    if (v) return v;
  }
  return null;
}

export function configureSpeech({ lang, auto, enabled }) {
  if (lang) state.lang = lang;
  if (typeof auto === "boolean") state.auto = auto;
  if (typeof enabled === "boolean") state.enabled = enabled;
  if (!state.enabled || !state.auto) stopSpeaking();
}

export function speak(text) {
  if (!supported() || !state.enabled) return;
  const words = clean(text);
  if (!words) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(words);
    u.lang = state.lang === "ms" ? "ms-MY" : "en-US";
    const v = pickVoice(state.lang);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.pitch = 1.15; // a friendly robot buddy
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

export function stopSpeaking() {
  if (supported()) window.speechSynthesis.cancel();
}

// Read a line automatically when it appears (if auto-read is on)
export function useAutoSpeak(text, active = true) {
  useEffect(() => {
    if (!active || !text || !state.auto) return undefined;
    const id = setTimeout(() => speak(text), 250);
    return () => clearTimeout(id);
  }, [text, active]);
}

export const speechSupported = supported;
