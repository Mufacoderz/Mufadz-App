import { Play, Pause } from "lucide-react";
import type { Ayat } from "../../../../types/surah";
import Number from "../Number";

type AyatCardProps = {
  ayat: Ayat;
  isActive?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  registerRef?: (node: HTMLDivElement | null) => void;
};

function AyatCard({
  ayat,
  isActive = false,
  isPlaying = false,
  onPlay,
  registerRef,
}: AyatCardProps) {
  return (
    <div
      ref={registerRef}
      className={`
        group relative overflow-hidden
        rounded-2xl p-6 flex flex-col gap-5
        shadow-sm hover:shadow-lg transition-all duration-300
        bg-white text-gray-800
        dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-blue-950 dark:text-gray-100
        ${isActive ? "ring-2 ring-textLight dark:ring-textDark" : ""}
      `}
    >

      <div className="
        absolute inset-0 
        bg-gradient-to-br from-blue-500/10 to-blue-700/10
        dark:from-blue-400/10 dark:to-cyan-500/10
        opacity-70 group-hover:opacity-100
        blur-2xl transition-all duration-500
      " />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Number nomor={ayat.nomorAyat} />
          <button
            onClick={onPlay}
            aria-label={isPlaying ? "Jeda ayat ini" : "Putar ayat ini"}
            className="
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              bg-blue-50 text-textLight hover:bg-blue-100
              dark:bg-gray-700 dark:text-textDark dark:hover:bg-gray-600
              transition-all duration-200
            "
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
        </div>
        <p
          className="font-bold text-3xl text-right leading-relaxed w-full
          text-gray-900 dark:text-blue-100"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {ayat.teksArab}
        </p>
      </div>

      <p className="text-sm italic tracking-wide leading-relaxed text-gray-600 dark:text-blue-200/80">
        {ayat.teksLatin}
      </p>

      <p className="
        text-sm font-medium leading-relaxed border-t pt-3
        border-gray-200 dark:border-blue-900/50
        text-gray-700 dark:text-blue-100
      ">
        {ayat.teksIndonesia}
      </p>

      <div className="absolute bottom-0 left-0 w-full h-1 
        bg-gradient-to-r from-transparent via-blue-400/40 to-transparent 
        dark:via-cyan-400/40 opacity-0 group-hover:opacity-100 transition-all duration-500
      " />
    </div>
  );
}

export default AyatCard;
