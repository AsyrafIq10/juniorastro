import React from "react";
import { speak, speechSupported } from "../utils/speech";

// Small 🔊 button: tap to hear Cap read the text
export default function SpeakButton({ text, className = "", label = "Listen" }) {
  if (!speechSupported()) return null;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className={`inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-cyan-400/90 hover:bg-cyan-300 text-slate-950 text-base shadow-md border-2 border-white/70 active:scale-90 transition align-middle ${className}`}
    >
      🔊
    </button>
  );
}
