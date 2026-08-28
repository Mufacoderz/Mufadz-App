import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

type MiniAudioPlayerProps = {
  surahName: string;
  ayatNumber: number | null;
  totalAyat: number;
  audioPlaying: boolean;
  currentTime: number;
  duration: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

function MiniAudioPlayer({
  surahName,
  ayatNumber,
  totalAyat,
  audioPlaying,
  currentTime,
  duration,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onTogglePlay,
  onSeek,
}: MiniAudioPlayerProps) {
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)) * duration);
  };

  return (
    <AnimatePresence>
      {ayatNumber !== null && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="
            fixed bottom-0 left-0 right-0 z-50
            border-t shadow-[0_-4px_16px_rgba(0,0,0,0.08)]
            bg-white/95 backdrop-blur border-blue-100
            dark:bg-gray-900/95 dark:border-gray-800
            pb-[env(safe-area-inset-bottom)]
          "
        >
          <div
            onClick={handleBarClick}
            className="w-full h-1.5 bg-blue-100 dark:bg-gray-800 cursor-pointer"
          >
            <div
              className="h-full bg-textLight dark:bg-textDark transition-[width] duration-150"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              aria-label="Ayat sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0 text-center">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {surahName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Ayat {ayatNumber} dari {totalAyat} · {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>

            <button
              onClick={onTogglePlay}
              className="
                w-11 h-11 rounded-full flex items-center justify-center shrink-0
                bg-textLight dark:bg-textDark text-white dark:text-gray-900
                shadow-md hover:shadow-lg transition-all duration-200
              "
              aria-label={audioPlaying ? "Jeda" : "Putar"}
            >
              {audioPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              aria-label="Ayat berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MiniAudioPlayer;
