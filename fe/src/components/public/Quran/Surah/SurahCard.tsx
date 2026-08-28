import { Link } from "react-router-dom";
import type { Surah } from "../../../../types/surah";

type SurahCardProps = {
    surah: Surah;
};

function SurahCard({ surah }: SurahCardProps) {
    return (
        <Link to={`/surah/${surah.nomor}`}>
            <div
                data-aos="fade-up"
                className="
                    group relative overflow-hidden
                    rounded-2xl border shadow-sm hover:shadow-lg
                    transition-all duration-300 cursor-pointer hover:-translate-y-0.5
                    bg-white dark:bg-gray-800/80
                    border-blue-50 dark:border-gray-700/60
                    hover:border-blue-200 dark:hover:border-blue-900/60
                "
            >
                {/* Decorative gradient background */}
                <div className="
                    absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                    bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30
                    dark:from-blue-950/20 dark:via-transparent dark:to-blue-900/10
                " />

                <div className="relative flex items-center gap-4 p-4">
                    {/* Number badge */}
                    <div className="
                        w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                        bg-gradient-to-br from-blue-500 to-blue-600
                        dark:from-blue-600 dark:to-blue-700
                        text-white font-bold text-sm shadow-sm
                    ">
                        {surah.nomor}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
                            {surah.namaLatin}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {surah.arti} • {surah.jumlahAyat} ayat
                        </p>
                    </div>

                    {/* Arabic name */}
                    <p
                        className="text-2xl font-bold text-blue-500/80 dark:text-blue-400/70 shrink-0 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-300"
                        style={{ fontFamily: "'Amiri', serif" }}
                    >
                        {surah.nama}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default SurahCard;
