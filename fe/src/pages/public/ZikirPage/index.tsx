import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Repeat, X, RotateCcw } from "lucide-react";
import DoaCard from "../../../components/public/Doa/DoaCard";
import HeadingPage from "../../../components/public/Heading";

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

// Satu putaran tasbih tradisional = 33 hitungan — angka yang sama juga
// dipakai di bacaan Tasbih/Tahmid/Takbir/Tahlil pada daftar di atas.
const LAP_SIZE = 33;

export default function ZikirPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [count, setCount] = useState(0);
    const [justCompletedLap, setJustCompletedLap] = useState(false);
    const milestoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        return () => clearTimeout(milestoneTimeoutRef.current);
    }, []);

    // Posisi dalam putaran saat ini (1..33), dan lagi di putaran ke berapa.
    // Kelipatan LAP_SIZE sengaja dianggap "putaran itu penuh" (33/33), bukan
    // balik ke 0 -- biar cincinnya nunjukin lingkaran utuh pas baru selesai,
    // persis kayak manik terakhir tasbih sebelum pindah ke untai berikutnya.
    const lapProgress = count === 0 ? 0 : count % LAP_SIZE === 0 ? LAP_SIZE : count % LAP_SIZE;
    const currentLap = count === 0 ? 1 : count % LAP_SIZE === 0 ? count / LAP_SIZE : Math.floor(count / LAP_SIZE) + 1;
    const ringPct = (lapProgress / LAP_SIZE) * 100;

    const handleTap = () => {
        setCount((c) => {
            const next = c + 1;
            const completedLap = next % LAP_SIZE === 0;
            if (navigator.vibrate) {
                // Getaran beda pas nyelesain 1 putaran penuh (33/66/99...),
                // biar kerasa walau mata merem/gak liat layar
                navigator.vibrate(completedLap ? [15, 40, 15] : 8);
            }
            if (completedLap) {
                setJustCompletedLap(true);
                clearTimeout(milestoneTimeoutRef.current);
                milestoneTimeoutRef.current = setTimeout(() => setJustCompletedLap(false), 900);
            }
            return next;
        });
    };

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCount(0);
        setJustCompletedLap(false);
        clearTimeout(milestoneTimeoutRef.current);
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalOpen(false);
        setCount(0);
        setJustCompletedLap(false);
        clearTimeout(milestoneTimeoutRef.current);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full dark:bg-gray-900 min-h-screen p-4 md:p-8"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <HeadingPage title="Zikir & Dzikir" subtitle="Bacaan zikir harian dengan fitur tasbih digital" />

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

                <div className="sticky bottom-0 z-10 pt-2 pb-4 bg-gray-50 dark:bg-gray-900 -mx-4 md:-mx-8 px-4 md:px-8">
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
            </div>

            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 select-none animate-modal-pop"
                    onClick={handleTap}
                >
                    <button
                        onClick={handleClose}
                        aria-label="Tutup"
                        className="absolute top-5 right-5 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-md border border-blue-100 dark:border-gray-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                    >
                        <X size={26} className="text-gray-500 dark:text-gray-300" />
                    </button>

                    <div
                        className="relative flex items-center justify-center pointer-events-none"
                        style={{ width: "min(70vw, 300px)", height: "min(70vw, 300px)" }}
                    >
                        <svg
                            viewBox="0 0 100 100"
                            className={`absolute inset-0 -rotate-90 transition-[filter] duration-500 ${justCompletedLap ? "drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]" : ""
                                }`}
                        >
                            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="5" className="stroke-blue-100 dark:stroke-gray-800" />
                            <circle
                                cx="50" cy="50" r="45" fill="none" strokeWidth="5" strokeLinecap="round"
                                className="stroke-textLight dark:stroke-textDark transition-[stroke-dashoffset] duration-300 ease-out"
                                style={{
                                    strokeDasharray: 2 * Math.PI * 45,
                                    strokeDashoffset: 2 * Math.PI * 45 * (1 - ringPct / 100),
                                }}
                            />
                        </svg>

                        <div className="flex flex-col items-center">
                            <p
                                className="text-7xl font-bold text-textLight dark:text-textDark tabular-nums"
                                style={{ fontFamily: "'Changa', sans-serif" }}
                            >
                                {count}
                            </p>
                            {count > 0 && (
                                <span className="mt-1 text-[11px] font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                                    Putaran ke-{currentLap}
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-400 dark:text-gray-600 pointer-events-none">
                        {count === 0 ? "Tap layar buat mulai menghitung" : "Tap layar buat lanjut menghitung"}
                    </p>

                    <button
                        onClick={handleReset}
                        aria-label="Reset hitungan"
                        className="absolute bottom-9 w-11 h-11 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-105 active:scale-95 transition-all"
                    >
                        <RotateCcw size={22} />
                    </button>
                </div>
            )}
        </motion.div>
    );
}