import type { Surah } from "../../../../types/surah";
import ChevronRight from "../../../../assets/ChevronRightIcon.svg";

type DetailSurahInfoProps = {
  surah: Surah;
};

function DetailSurahInfo({ surah }: DetailSurahInfoProps) {
  return (
    <div className="relative rounded-2xl bg-textLight dark:bg-textDark text-white dark:text-gray-700 shadow-lg overflow-hidden w-full ">
  <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shine_2.5s_infinite]" />
  <div className="py-4 px-4 pb-14 flex flex-col gap-2">
    <h2 className="font-bold tracking-wide text-[clamp(1rem,2vw,1.5rem)]">
      {surah.namaLatin}
    </h2>
    <p className="italic text-[clamp(0.7rem,1.5vw,0.875rem)] text-blue-100 dark:text-gray-700">
      {surah.arti}
    </p>

    <div className="mt-2 border-t border-white/20 pt-2 flex items-center justify-between text-[clamp(0.65rem,1.2vw,0.75rem)] text-blue-100 dark:text-gray-700">
      <span className="capitalize">{surah.tempatTurun}</span>
      <span>{surah.jumlahAyat} Ayat</span>
    </div>
  </div>

  <button
    className="group absolute bottom-0 left-0 w-full bg-blue-600/30 hover:bg-textLight/50 backdrop-blur-sm py-2 px-4 flex items-center justify-between text-[clamp(0.7rem,1.2vw,0.875rem)] font-medium transition-all duration-200"
  >
    <span className="text-white/90 dark:text-gray-700/90 group-hover:text-white dark:group-hover:text-gray-950">
      Tentang Surah <span className="font-semibold">{surah.namaLatin}</span>
    </span>
    <img
      src={ChevronRight}
      alt="Chevron Right"
      className="w-4 h-4 transition-transform group-hover:translate-x-1"
    />
  </button>
</div>

  );
}


export default DetailSurahInfo;
