import { useEffect, useRef } from "react";
import type { Ayat } from "../../../../types/surah";
import AyatCard from "./AyatCard";

type AyatListProps = {
  ayat: Ayat[];
  activeAyatNumber?: number | null;
  audioPlaying?: boolean;
  onPlayAyat?: (index: number) => void;
};

function AyatList({
  ayat,
  activeAyatNumber = null,
  audioPlaying = false,
  onPlayAyat,
}: AyatListProps) {
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (activeAyatNumber === null) return;
    const node = cardRefs.current.get(activeAyatNumber);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeAyatNumber]);

  return (
    <div className="flex flex-col gap-3">
      {ayat.map((item, index) => (
        <AyatCard
          key={item.nomorAyat}
          ayat={item}
          isActive={activeAyatNumber === item.nomorAyat}
          isPlaying={audioPlaying && activeAyatNumber === item.nomorAyat}
          onPlay={() => onPlayAyat?.(index)}
          registerRef={(node) => {
            if (node) cardRefs.current.set(item.nomorAyat, node);
            else cardRefs.current.delete(item.nomorAyat);
          }}
        />
      ))}
    </div>
  );
}

export default AyatList;
