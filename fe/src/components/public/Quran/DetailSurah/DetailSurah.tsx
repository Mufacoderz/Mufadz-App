
import type { Surah } from "../../../../types/surah";
import DetailSurahInfo from "./DetailSurahInfo";
import AudioControl from "../AudioControl";
import AyatList from "../Ayat/AyatList";

type DetailSurahProps = {
  surah: Surah;
  currentReciter: string;
  changeReciter: (reciterId: string) => void;
  onPlay: () => void;
  onPause: () => void;
  audioPlaying: boolean;
};

function DetailSurah({
  surah,
  currentReciter,
  changeReciter,
  onPlay,
  onPause,
  audioPlaying,
}: DetailSurahProps) {
  return (
    <div className="py-8 px-5 flex flex-col gap-5">
      <DetailSurahInfo surah={surah} />

      <AudioControl
        currentReciter={currentReciter}
        changeReciter={changeReciter}
        onPlay={onPlay}
        onPause={onPause}
        audioPlaying={audioPlaying}
      />

      <AyatList ayat={surah.ayat} />
    </div>
  );
}

export default DetailSurah;
