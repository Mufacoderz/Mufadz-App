import SurahContainer from "../../../components/public/Quran/Surah/SurahContainer"
import HeadingPage from "../../../components/public/Heading"

const QuranList = () => {
    return (
        <>
            <div className="dark:bg-gray-900 h-full">
                <div className="py-10 sm:w-[80%] max-w-3xl mx-auto">
                <HeadingPage title="Baca Al-Quran" />
                <SurahContainer />
            </div>
            </div>
        </>
    )
}

export default QuranList
