import { Compass } from "lucide-react";

export default function KiblatPage() {
    return (
        <div className="w-full dark:bg-gray-900 min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Compass className="w-16 h-16 text-textLight dark:text-textDark mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-textLight dark:text-textDark">Kiblat</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Kompas Kiblat akan segera hadir</p>
            </div>
        </div>
    );
}
