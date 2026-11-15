import React from "react";
import SpeakButton from "./SpeakButton";
import { useAutoSpeak } from "../utils/speech";
import drFarahImg from "../assets/dr-farah.png";

export const GUIDE_NAME = "Dr Farah";
export const GUIDE_IMG = drFarahImg;

// Dr Farah, the mission guide: portrait + speech bubble
export default function CapAvatar({ mood = "happy", message }) {
  const ring = {
    happy: "border-cyan-400/70 shadow-[0_0_24px_rgba(34,211,238,0.45)]",
    worried: "border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.45)]",
    alert: "border-rose-500/90 shadow-[0_0_28px_rgba(244,63,94,0.6)]",
  };
  const label = { happy: "text-cyan-300", worried: "text-amber-300", alert: "text-rose-300" };
  useAutoSpeak(message);

  return (
    <div className="pointer-events-none flex items-end gap-3 max-w-md">
      <div
        className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 ${ring[mood] || ring.happy} flex flex-col items-center justify-end overflow-hidden animate-float`}
      >
        <img src={drFarahImg} alt={GUIDE_NAME} className="absolute inset-x-0 top-0 w-full h-[82%] object-cover object-top" draggable={false} />
        <span className={`relative z-10 w-full text-center bg-slate-950/85 py-0.5 text-[9px] font-extrabold tracking-wider uppercase ${label[mood] || label.happy}`}>
          {GUIDE_NAME}
        </span>
      </div>

      {message && (
        <div className="pointer-events-auto flex items-start gap-2 bg-slate-900/85 backdrop-blur-md border border-white/15 rounded-2xl rounded-bl-sm pl-4 pr-2 py-2.5 shadow-xl text-xs sm:text-sm text-slate-100 leading-snug max-w-xs sm:max-w-sm">
          <span className="flex-1">{message}</span>
          <SpeakButton text={message} className="w-8 h-8 text-sm" />
        </div>
      )}
    </div>
  );
}
