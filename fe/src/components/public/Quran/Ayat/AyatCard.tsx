import type { Ayat } from "../../../../types/surah";
import Number from "../Number";

type AyatCardProps = {
  ayat: Ayat;
};

function AyatCard({ ayat }: AyatCardProps) {
  return (
    <div className="
      group relative overflow-hidden
      rounded-2xl p-6 flex flex-col gap-5
      shadow-sm hover:shadow-lg transition-all duration-300
      bg-white text-gray-800
      dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-blue-950 dark:text-gray-100
    ">

      <div className="
        absolute inset-0 
        bg-gradient-to-br from-blue-500/10 to-blue-700/10
        dark:from-blue-400/10 dark:to-cyan-500/10
        opacity-70 group-hover:opacity-100
        blur-2xl transition-all duration-500
      " />

      <div className="relative flex items-start justify-between gap-4">
        <Number nomor={ayat.nomorAyat} />
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
