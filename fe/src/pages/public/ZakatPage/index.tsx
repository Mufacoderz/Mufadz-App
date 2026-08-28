import { useState } from "react";
import { motion } from "framer-motion";
import { Wheat, Briefcase, PiggyBank } from "lucide-react";
import HeadingPage from "../../../components/public/Heading";

type ZakatType = "fitrah" | "penghasilan" | "maal";

const HITUNGAN_NISAB = 85;

function formatRupiah(angka: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(angka);
}

export default function ZakatPage() {
    const [jenis, setJenis] = useState<ZakatType>("fitrah");

    const [fitrahJiwa, setFitrahJiwa] = useState(1);
    const [fitrahHarga, setFitrahHarga] = useState(15000);

    const [penghasilanBulanan, setPenghasilanBulanan] = useState(5000000);
    const [penghasilanNisab, setPenghasilanNisab] = useState(7500000);

    const [maalHarta, setMaalHarta] = useState(0);
    const [maalEmas, setMaalEmas] = useState(0);
    const [maalHargaEmas, setMaalHargaEmas] = useState(1200000);

    const jenisList: { key: ZakatType; label: string; icon: React.ReactNode }[] = [
        { key: "fitrah", label: "Zakat Fitrah", icon: <Wheat size={20} /> },
        { key: "penghasilan", label: "Zakat Penghasilan", icon: <Briefcase size={20} /> },
        { key: "maal", label: "Zakat Maal", icon: <PiggyBank size={20} /> },
    ];

    const hasilFitrah = fitrahJiwa * 2.5 * fitrahHarga;
    const hasilPenghasilan = penghasilanBulanan >= penghasilanNisab / 12
        ? penghasilanBulanan * 0.025
        : 0;
    const totalHarta = maalHarta + (maalEmas * maalHargaEmas);
    const hasilMaal = totalHarta >= maalHargaEmas * HITUNGAN_NISAB
        ? totalHarta * 0.025
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full dark:bg-gray-900 min-h-screen p-4 md:p-8"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <HeadingPage title="Kalkulator Zakat" subtitle="Hitung zakat fitrah, penghasilan, dan maal" />

                <div className="grid grid-cols-3 gap-3">
                    {jenisList.map((j) => (
                        <button
                            key={j.key}
                            onClick={() => setJenis(j.key)}
                            className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1 flex flex-col items-center gap-2 ${
                                jenis === j.key
                                    ? "border-blue-700 dark:border-blue-100 ring-2 ring-textLight dark:ring-textDark"
                                    : "border-blue-100 dark:border-gray-700 hover:border-blue-700 dark:hover:border-blue-100"
                            }`}
                        >
                            <div className="bg-textLight dark:bg-textDark text-white dark:text-gray-800 w-10 h-10 flex items-center justify-center rounded-full shadow-sm">
                                {j.icon}
                            </div>
                            <span className="text-xs font-semibold text-gray-800 dark:text-white text-center">
                                {j.label}
                            </span>
                        </button>
                    ))}
                </div>

                {jenis === "fitrah" && (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-blue-100 dark:border-gray-950 space-y-5">
                        <h2 className="text-xl font-bold text-textLight dark:text-textDark">
                            Zakat Fitrah
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jumlah Jiwa
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={fitrahJiwa}
                                onChange={(e) => setFitrahJiwa(Math.max(1, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Harga Beras per Kg (Rp)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={fitrahHarga}
                                onChange={(e) => setFitrahHarga(Math.max(0, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                * harga beras per kg sesuai daerah masing-masing
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 text-center space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Zakat Fitrah
                            </p>
                            <p className="text-3xl font-bold text-textLight dark:text-textDark">
                                {fitrahJiwa * 2.5} kg ({formatRupiah(hasilFitrah)})
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {fitrahJiwa} jiwa × 2,5 kg × Rp{fitrahHarga.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                )}

                {jenis === "penghasilan" && (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-blue-100 dark:border-gray-950 space-y-5">
                        <h2 className="text-xl font-bold text-textLight dark:text-textDark">
                            Zakat Penghasilan
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Penghasilan per Bulan (Rp)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={penghasilanBulanan}
                                onChange={(e) => setPenghasilanBulanan(Math.max(0, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nisab per Tahun (Rp)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={penghasilanNisab}
                                onChange={(e) => setPenghasilanNisab(Math.max(0, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                * nisab ≈ nilai 85 gram emas per tahun (cek harga emas hari ini)
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 text-center space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Zakat Penghasilan Bulan Ini
                            </p>
                            <p className="text-3xl font-bold text-textLight dark:text-textDark">
                                {hasilPenghasilan > 0
                                    ? formatRupiah(hasilPenghasilan)
                                    : "Tidak wajib zakat"}
                            </p>
                            {hasilPenghasilan > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {penghasilanBulanan.toLocaleString("id-ID")} × 2,5%
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {jenis === "maal" && (
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 border border-blue-100 dark:border-gray-950 space-y-5">
                        <h2 className="text-xl font-bold text-textLight dark:text-textDark">
                            Zakat Maal
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tabungan / Uang Tunai (Rp)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={maalHarta}
                                onChange={(e) => setMaalHarta(Math.max(0, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Emas (gram)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={maalEmas}
                                onChange={(e) => setMaalEmas(Math.max(0, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Harga Emas per Gram (Rp)
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={maalHargaEmas}
                                onChange={(e) => setMaalHargaEmas(Math.max(0, Number(e.target.value)))}
                                className="w-full border border-blue-100 dark:border-gray-700 rounded-xl px-4 py-2.5 bg-white dark:bg-gray-900 text-textLight dark:text-textDark focus:ring-2 focus:ring-textLight dark:focus:ring-textDark focus:border-transparent outline-none transition"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                * cek harga emas hari ini untuk hasil akurat
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 text-center space-y-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Harta
                            </p>
                            <p className="text-lg font-semibold text-textLight dark:text-textDark">
                                {formatRupiah(totalHarta)}
                            </p>
                            <hr className="my-2 border-blue-100 dark:border-gray-700" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Zakat Maal
                            </p>
                            <p className="text-3xl font-bold text-textLight dark:text-textDark">
                                {hasilMaal > 0
                                    ? formatRupiah(hasilMaal)
                                    : "Belum wajib zakat"}
                            </p>
                            {hasilMaal > 0 ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    2,5% dari {formatRupiah(totalHarta)} (haul 1 tahun)
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Nisab: {formatRupiah(maalHargaEmas * HITUNGAN_NISAB)} (85 gram emas)
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}