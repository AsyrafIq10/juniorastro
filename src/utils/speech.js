// Dr Farah reads text aloud with the browser's built-in text-to-speech (no audio files, works offline).
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

// Dr Farah is a woman: always prefer a female voice. Browsers don't expose a voice's gender,
// so we match well-known female voice names (Windows, macOS/iOS, Android/Chrome) and avoid male ones.
const FEMALE_VOICES =
  /female|woman|zira|aria|jenny|michelle|sonia|libby|hazel|susan|natasha|clara|emma|ava|ana|samantha|karen|moira|tessa|fiona|victoria|veena|kate|serena|allison|susan|joanna|salli|kimberly|ivy|yasmin|gadis|damayanti|amira|nur|siti|google uk english female|google us english/i;
const MALE_VOICES = /\bmale\b|david|mark|guy|ryan|daniel|alex|fred|george|james|thomas|tom|arthur|aaron|oliver|rishi|osman|ardi|christopher|eric|roger|steffan|brian|matthew|justin|joey|google uk english male/i;

function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices();
  const prefs = lang === "ms" ? ["ms", "id"] : ["en"];
  for (const p of prefs) {
    const local = voices.filter((x) => x.lang?.toLowerCase().replace("_", "-").startsWith(p));
    const female = local.find((x) => FEMALE_VOICES.test(x.name) && !MALE_VOICES.test(x.name));
    if (female) return female;
    const notMale = local.find((x) => !MALE_VOICES.test(x.name));
    if (notMale) return notMale;
  }
  // No female voice for Malay? Use a female English voice rather than a male one.
  return voices.find((x) => x.lang?.toLowerCase().startsWith("en") && FEMALE_VOICES.test(x.name) && !MALE_VOICES.test(x.name)) || null;
}
// Voices load asynchronously in some browsers: warm the list up early
if (supported()) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", () => window.speechSynthesis.getVoices());
  } catch {
    // ignore
  }
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
    // Female voice found: natural pitch. Only a fallback (possibly male) voice gets lifted higher.
    u.pitch = v && FEMALE_VOICES.test(v.name) ? 1.08 : 1.35;
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
