import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import type { Surah } from "../../../../types/surah";
import SurahCard from "./SurahCard";

type SurahListProps = {
    surahs: Surah[];
};

function SurahList({ surahs }: SurahListProps) {
    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
            offset: 60,
        });
    }, []);

    useEffect(() => {
        AOS.refresh();
    }, [surahs]);

    if (surahs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-4xl opacity-30">🔍</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Surah tidak ditemukan.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
            {surahs.map((surah) => (
                <SurahCard key={surah.nomor} surah={surah} />
            ))}
        </div>
    );
}

export default SurahList;
