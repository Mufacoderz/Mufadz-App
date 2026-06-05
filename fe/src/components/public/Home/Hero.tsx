import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <div className="space-y-5 w-full box-border mt-10 sm:mt-0">

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-snug text-gray-800 text-center md:text-left w-full md:w-[70%]">
                <motion.span
                    className="text-4xl sm:text-5xl lg:text-6xl relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-cyan-300 to-blue-500"
                    animate={{
                        backgroundPositionX: ["0%", "200%"],
                    }}
                    transition={{
                        duration: 3,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    style={{
                        backgroundSize: "200% auto",
                    }}
                >
                    Mufadz Portal
                </motion.span>

                <span className="block text-gray-700 dark:text-gray-100">
                    Media Islami Untuk Generasi Masa Kini
                </span>
            </h1>

            <p className="text-gray-500 dark:text-gray-300 text-lg sm:text-xl max-w-full leading-relaxed mx-auto lg:mx-0">
                Aplikasi pendukung kehidupan Muslim modern — dengan jadwal sholat,
                arah kiblat, dan fitur Islami lainnya dalam satu tempat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start flex-wrap mx-auto sm:m-0 w-[70%] sm:w-full">
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    className="px-6 py-3 bg-textLight dark:bg-textDark text-white dark:text-gray-800 font-semibold rounded-xl shadow-md hover:bg-blue-700 dark:hover:bg-blue-200 hover:shadow-lg transition-all"
                >
                    <Link to={"/quran"}>
                        Baca Qur'an 
                    </Link>
                </motion.div>

                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    className="px-6 py-3 bg-transparent dark:border-textDark border-2 border-textLight text-textLight dark:text-textDark dark:hover:text-gray-800 font-semibold rounded-xl hover:bg-textLight hover:text-white dark:hover:bg-textDark transition-all"
                >
                    <Link to={"/register"}>
                        Gabung Sekarang
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;

