import { motion } from "framer-motion"
import SurahContainer from "../../../components/public/Quran/Surah/SurahContainer"
import HeadingPage from "../../../components/public/Heading"

const QuranList = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="dark:bg-gray-900 min-h-screen"
        >
            <div className="py-10 px-2 sm:px-4 w-full max-w-5xl mx-auto">
                <HeadingPage title="Baca Al-Quran" subtitle="114 surah lengkap dengan tafsir dan audio" />
                <SurahContainer />
            </div>
        </motion.div>
    )
}

export default QuranList
