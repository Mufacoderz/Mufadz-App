import { motion } from "framer-motion";

export default function MorphingShape() {
    return (
        <motion.div
            className="
        fixed w-[400px] h-[400px] mt-20 sm:mt-0
        sm:w-[700px] sm:h-[600px] 
        bg-gradient-to-tr from-sky-200 via-blue-300 to-indigo-400
        dark:from-sky-900 dark:via-blue-950 dark:to-indigo-950
        opacity-80 rounded-[40%] hidden sm:block
        shadow-lg  z-0
        "
            animate={{
                borderRadius: [
                    "40% 60% 60% 40% / 40% 60% 40% 60%",
                    "65% 35% 55% 45% / 60% 40% 50% 50%",
                    "50% 50% 70% 30% / 40% 60% 50% 50%",
                    "30% 70% 40% 60% / 60% 40% 70% 30%",
                    "60% 40% 40% 60% / 50% 70% 30% 50%",
                    "40% 60% 60% 40% / 50% 40% 60% 50%",
                ],
                rotate: [0, 10, -10, 5, -5, 0],
                scale: [1, 1.08, 0.97, 1.05, 1],
                x: [0, 20, -25, 10, -10, 0],
                y: [0, -15, 20, -10, 15, 0],
            }}
            transition={{
                duration: 20,
                ease: "easeInOut",
                repeat: Infinity,
            }}
        />
    );
}
