import type { Surah } from "../../../../types/surah";
import DetailSurahInfo from "./DetailSurahInfo";
import AudioControl from "../AudioControl";
import AyatList from "../Ayat/AyatList";
import MiniAudioPlayer from "../MiniAudioPlayer";

type DetailSurahProps = {
  surah: Surah;
  currentReciter: string;
  changeReciter: (reciterId: string) => void;
  onPlay: () => void;
  onPause: () => void;
  audioPlaying: boolean;
  currentAyatIndex: number | null;
  progress: { currentTime: number; duration: number };
  onPlayAyat: (index: number) => void;
  onPlayNext: () => void;
  onPlayPrev: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
};

function DetailSurah({
  surah,
  currentReciter,
  changeReciter,
  onPlay,
  onPause,
  audioPlaying,
  currentAyatIndex,
  progress,
  onPlayAyat,
  onPlayNext,
  onPlayPrev,
  onTogglePlay,
  onSeek,
}: DetailSurahProps) {
  const activeAyatNumber =
    currentAyatIndex !== null ? surah.ayat[currentAyatIndex]?.nomorAyat ?? null : null;

  return (
    <div className="pt-2 sm:pt-8 pb-28 px-5 flex flex-col gap-5">
      <DetailSurahInfo surah={surah} />

      <AudioControl
        currentReciter={currentReciter}
        changeReciter={changeReciter}
        onPlay={onPlay}
        onPause={onPause}
        audioPlaying={audioPlaying}
      />

      <AyatList
        ayat={surah.ayat}
        activeAyatNumber={activeAyatNumber}
        audioPlaying={audioPlaying}
        onPlayAyat={onPlayAyat}
      />

      <MiniAudioPlayer
        surahName={surah.namaLatin}
        ayatNumber={activeAyatNumber}
        totalAyat={surah.jumlahAyat}
        audioPlaying={audioPlaying}
        currentTime={progress.currentTime}
        duration={progress.duration}
        hasPrev={currentAyatIndex !== null && currentAyatIndex > 0}
        hasNext={currentAyatIndex !== null && currentAyatIndex < surah.ayat.length - 1}
        onPrev={onPlayPrev}
        onNext={onPlayNext}
        onTogglePlay={onTogglePlay}
        onSeek={onSeek}
      />
    </div>
  );
}

export default DetailSurah;