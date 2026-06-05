import { useNavigate } from "react-router-dom"


const QuranPrevButton = () => {
        const navigate = useNavigate()
    return (
        <button
                onClick={() => navigate("/quran")}
                className="mb-6 mt-4 inline-flex items-center gap-2 px-4 py-2 bg-textLight dark:bg-textDark text-white dark:text-gray-800 font-medium rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-200 transition-all duration-300"
            >
                ← Kembali ke Daftar Surah
            </button>
    )
}

export default QuranPrevButton
