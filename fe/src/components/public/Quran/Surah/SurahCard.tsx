import { Link } from "react-router-dom";
import type { Surah } from "../../../../types/surah";
import Number from "../Number";
// AOS.init DIHAPUS dari sini — sudah dipindah ke SurahList

type SurahCardProps = {
    surah: Surah;
};

function SurahCard({ surah }: SurahCardProps) {
    return (
        <Link to={`/surah/${surah.nomor}`}>
            <div
                data-aos="fade-right"
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 hover:border-blue-700 dark:hover:border-blue-100
                        rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
                        hover:-translate-y-1 flex justify-between gap-3"
            >
                <div className="flex text-left gap-3">
                    <Number nomor={surah.nomor} />
                    <div className="text-light">
                        <p className="font-bold text-base dark:text-gray-300">{surah.namaLatin}</p>
                        <p className="text-subtle dark:text-gray-300">{surah.arti}</p>
                        <p className="text-subtle dark:text-gray-300">{surah.tempatTurun} • {surah.jumlahAyat}</p>
                    </div>
                </div>
                <p className="font-bold text-2xl text-textLight dark:text-textDark" style={{ fontFamily: "'Amiri', serif" }}>{surah.nama}</p>
            </div>
        </Link>
    );
}

export default SurahCard;