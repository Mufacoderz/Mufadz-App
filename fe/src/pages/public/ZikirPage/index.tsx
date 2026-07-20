import { useState } from "react";
import { Repeat, X, RotateCcw } from "lucide-react";
import DoaCard from "../../../components/public/Doa/DoaCard";

interface Bacaan {
    judul: string;
    arab: string;
    latin: string;
    terjemah: string;
}

const bacaanList: Bacaan[] = [
    {
        judul: "Istighfar",
        arab: "أَسْتَغْفِرُ اللهَ الْعَظِـيْمِ الَّذِيْ لَااِلَهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَأَتُوْبُ إِلَيْهِ",
        latin: "ASTAGHFIRULLAH HAL'ADZIM, ALADZI LAAILAHA ILLAHUWAL KHAYYUL QOYYUUMU WA ATUUBU ILAIIH",
        terjemah: "Aku mohon ampun kepada Allah Yang Maha Agung, yang tidak ada tuhan selain Dia Yang Maha Hidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya.",
    },
    {
        judul: "Tahlil",
        arab: "لَاإِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيْكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِيْ وَيُمِيْتُ وَهُوَ عَلَى كُلِّ شَيْئٍ قَدِيْرٌ",
        latin: "LAA ILAHA ILLALLAH WAKHDAHU LAA SYARIKA LAHU, LAHUL MULKU WALAHUL KHAMDU YUKHYIIY WAYUMIITU WAHUWA 'ALAA KULLI SYAI'INNQODIIR",
        terjemah: "Tidak ada tuhan selain Allah, Yang Maha Esa, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji. Dia menghidupkan dan mematikan, dan Dia Maha Kuasa atas segala sesuatu.",
    },
    {
        judul: "Mohon Perlindungan dari Neraka",
        arab: "اَللَّهُمَّ أَجِرْنِـى مِنَ النَّارِ",
        latin: "ALLAHUMMA AJIRNI MINAN-NAAR (3x)",
        terjemah: "Ya Allah, lindungilah aku dari api neraka.",
    },
    {
        judul: "Memuji Allah",
        arab: "للَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلَامُ، وَإِلَيْكَ يَعُوْدُ السَّلَامُ فَحَيِّنَارَبَّنَا بِالسَّلَامِ وَاَدْخِلْنَا الْـجَنَّةَ دَارَ السَّلَامِ تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ يَا ذَاالْـجَلَالِ وَاْلإِكْرَام",
        latin: "ALLAHUMMA ANGTASSALAM, WAMINGKASSALAM, WA ILAYKA YA'UUDUSSALAM FAKHAYYINA RABBANAA BISSALAAM WA-ADKHILNALJANNATA DAROSSALAAM TABAROKTA RABBANAA WATA'ALAYTA YAA DZALJALAALI WAL IKRAAM",
        terjemah: "Ya Allah, Engkaulah sumber keselamatan, dari-Mu keselamatan, dan kepada-Mu keselamatan kembali. Maka hidupkanlah kami dengan selamat, masukkanlah kami ke surga tempat keselamatan. Maha Berkah Engkau wahai Tuhan kami, Maha Tinggi Engkau wahai Yang Memiliki Keagungan dan Kemuliaan.",
    },
    {
        judul: "Al-Fatihah & Ayat Kursi",
        arab: "بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيْمِ. اَللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَّلَانَوْمٌ، لَهُ مَافِي السَّمَاوَاتِ وَمَافِي اْلأَرْضِ مَن ذَا الَّذِيْ يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَابَيْنَ أَيْدِيْهِمْ وَمَاخَلْفَهُمْ وَلَا يُحِيْطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَآءَ، وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَاْلأَرْضَ وَلَا يَـؤدُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيْمُ",
        latin: "Allahu laa ilaaha illaa huwal hayyul qayyum. Laa ta'khudzuhuu sinatuw wa laa naum. Lahuu maa fis samaawaati wa maa fil ardh. Man dzal ladzii yasyfa'u 'indahuu illaa bi idznih. Ya'lamu maa bayna aidiihim wa maa khalfahum. Wa laa yuhiithuuna bi syai-im min 'ilmihii illaa bimaa syaa-a. Wasi'a kursiyyuhus samaawaati wal ardh walaa ya-uuduhuu hifzhuhumaa Wahuwal 'aliyyul 'azhiim.",
        terjemah: "Allah, tidak ada tuhan selain Dia, Yang Maha Hidup lagi Maha Berdiri Sendiri. Tidak dapat dikalahkan oleh kantuk dan tidur. Milik-Nya apa yang di langit dan di bumi...",
    },
    {
        judul: "Tasbih, Tahmid, Takbir & Tahlil",
        arab: "سُبْحَانَ اللهِ (33x)\nالْحَمْدُلِلهِ (33x)\nاللهُ اَكْبَرُ (33x)\nلَااِلٰهَ اِلَّا اللهُ (33x)",
        latin: "SUBHANALLAH (33x) · ALHAMDULILLAH (33x) · ALLAHU AKBAR (33x) · LAILAHA ILLALLAH (33x)",
        terjemah: "Maha Suci Allah, Segala puji bagi Allah, Allah Maha Besar, Tidak ada tuhan selain Allah.",
    },
];

export default function ZikirPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [count, setCount] = useState(0);

    const handleTap = () => {
        setCount((c) => c + 1);
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCount(0);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalOpen(false);
        setCount(0);
    };

    return (
        <div className="w-full dark:bg-gray-900 min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="sticky top-0 z-10 pt-2 pb-4 bg-gray-50 dark:bg-gray-900 -mx-4 md:-mx-8 px-4 md:px-8">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 dark:from-sky-400 dark:via-blue-500 dark:to-indigo-600 text-white dark:text-gray-800 font-semibold px-5 py-2.5 shadow-lg shadow-blue-300/40 dark:shadow-blue-700/40 transition-all duration-300 ease-out hover:scale-105 hover:shadow-blue-400/50 focus:outline-none w-full group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Repeat size={18} />
                            Mulai Hitung
                        </span>
                        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] animate-[shine_2.5s_infinite]" />
                    </button>
                </div>

                <div className="space-y-6 pb-8">
                    {bacaanList.map((bacaan, i) => (
                        <DoaCard
                            key={i}
                            judul={bacaan.judul}
                            arab={bacaan.arab}
                            latin={bacaan.latin}
                            terjemah={bacaan.terjemah}
                        />
                    ))}
                </div>
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 select-none"
                    onClick={handleTap}
                >
                    <button
                        onClick={handleClose}
                        className="absolute top-6 right-6 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={24} className="text-gray-400 dark:text-gray-500" />
                    </button>

                    <p className="text-8xl font-bold text-textLight dark:text-textDark tabular-nums select-none pointer-events-none">
                        {count}
                    </p>

                    <button
                        onClick={handleReset}
                        className="absolute bottom-10 flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>
            )}
        </div>
    );
}
