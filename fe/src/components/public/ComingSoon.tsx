import { motion } from "framer-motion";

interface ComingSoonProps {
    title: string;
    message?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, message }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-[80vh] text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="bg-white/60 dark:bg-blue-950/60 backdrop-blur-md shadow-sm border border-blue-100 dark:border-blue-900 rounded-2xl px-8 py-6">
                <p className="text-gray-700 dark:text-gray-100 font-medium">
                    {message || ` Fitur ${title} belum tersedia.`}
                </p>
            </div>
        </motion.div>
    );
};

export default ComingSoon;
