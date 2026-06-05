import type { Ayat } from "../../../../types/surah";
import AyatCard from "./AyatCard";

type AyatListProps = {
  ayat: Ayat[];
};

function AyatList({ ayat }: AyatListProps) {
  return (
    <div className="flex flex-col gap-3">
      {ayat.map((item) => (
        <AyatCard key={item.nomorAyat} ayat={item} />
      ))}
    </div>
  );
}

export default AyatList;
