import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import type { Surah } from "../../../../types/surah";
import SurahCard from "./SurahCard";

type SurahListProps = {
    surahs: Surah[];
};

function SurahList({ surahs }: SurahListProps) {
    // AOS.init cukup sekali di parent, bukan di tiap SurahCard
    useEffect(() => {
        AOS.init({
            duration: 600,
            once: true, // animasi hanya sekali, tidak re-trigger saat scroll balik
            offset: 80,
        });
    }, []);

    // refresh AOS saat list berubah (misal setelah filter search)
    useEffect(() => {
        AOS.refresh();
    }, [surahs]);

    return (
        <div className="flex flex-col gap-3 p-5">
            {surahs.map((surah) => (
                <SurahCard key={surah.nomor} surah={surah} />
            ))}
        </div>
    );
}

export default SurahList;