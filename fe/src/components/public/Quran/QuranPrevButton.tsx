import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"


const QuranPrevButton = () => {
    const navigate = useNavigate()
    return (
        <>
            {/* Mobile: floating arrow */}
            <button
                onClick={() => navigate("/quran")}
                className="
                    md:hidden fixed bottom-24 right-4 z-40
                    w-12 h-12 rounded-full flex items-center justify-center
                    bg-textLight dark:bg-textDark text-white dark:text-gray-800
                    shadow-lg hover:shadow-xl transition-all duration-300
                "
                aria-label="Kembali ke Daftar Surah"
            >
                <ChevronLeft size={22} />
            </button>

            {/* Desktop: text button */}
            <button
                onClick={() => navigate("/quran")}
                className="
                    hidden md:inline-flex items-center gap-2 mb-6 mt-4
                    px-4 py-2 bg-textLight dark:bg-textDark text-white dark:text-gray-800
                    font-medium rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-200
                    transition-all duration-300
                "
            >
                ← Kembali ke Daftar Surah
            </button>
        </>
    )
}

export default QuranPrevButton
