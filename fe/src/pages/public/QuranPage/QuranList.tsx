import SurahContainer from "../../../components/public/Quran/Surah/SurahContainer"
import HeadingPage from "../../../components/public/Heading"

const QuranList = () => {
    return (
        <div className="dark:bg-gray-900 min-h-screen">
            <div className="py-10 px-2 sm:px-4 w-full max-w-5xl mx-auto">
                <HeadingPage title="Baca Al-Quran" subtitle="114 surah lengkap dengan tafsir dan audio" />
                <SurahContainer />
            </div>
        </div>
    )
}

export default QuranList
