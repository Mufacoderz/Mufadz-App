import { motion } from "framer-motion"
import DetailSurahContainer from "../../../components/public/Quran/DetailSurah/DetailSurahContainer"
import QuranPrevButton from "../../../components/public/Quran/QuranPrevButton"

function DetailSurahPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className="dark:bg-gray-900">
                <div className="py-4 sm:py-10 sm:w-[80%] mx-auto">
                    <div className="ml-6">
                        <QuranPrevButton />
                    </div>
                    <DetailSurahContainer />
                </div>
            </div>
        </motion.div>
    )
}

export default DetailSurahPage