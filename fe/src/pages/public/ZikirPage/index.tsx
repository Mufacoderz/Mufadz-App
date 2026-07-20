import { Repeat } from "lucide-react";

export default function ZikirPage() {
    return (
        <div className="w-full dark:bg-gray-900 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Repeat className="w-16 h-16 text-textLight dark:text-textDark mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-textLight dark:text-textDark">Zikir</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Zikir akan segera hadir</p>
            </div>
        </div>
    );
}
