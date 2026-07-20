import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { getHijriCalendar, type HijriDayData } from "../../../api/aladhan"

const hijriMonthNames = [
    "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
    "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
    "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"
]

function gregorianToHijri(date: Date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const jd = Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
        Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
        Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
        day - 32075;

    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) +
        (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
    const l3 = l2 - ((Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50))) -
        ((Math.floor(j / 16)) * (Math.floor((15238 * j) / 43))) + 29;
    const m = Math.floor((24 * l3) / 709);
    const d = l3 - Math.floor((709 * m) / 24);
    const y = 30 * n + j - 30;

    return { day: d, month: m - 1, year: y }
}

const KalenderModern = () => {
    const [monthOffset, setMonthOffset] = useState(0)
    const [apiData, setApiData] = useState<Record<string, HijriDayData> | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetchError, setFetchError] = useState(false)

    const today = new Date()
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const todayDate = today.getDate()
    const isCurrentMonth = monthOffset === 0

    const dates = useMemo(() => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1)
    }, [daysInMonth])

    useEffect(() => {
        const apiMonth = month + 1
        const apiYear = year
        setLoading(true)
        setFetchError(false)
        setApiData(null)

        getHijriCalendar(apiMonth, apiYear)
            .then((data) => {
                const map: Record<string, HijriDayData> = {}
                data.forEach((d) => {
                    map[parseInt(d.gregorian.day)] = d
                })
                setApiData(map)
                setLoading(false)
            })
            .catch(() => {
                setFetchError(true)
                setLoading(false)
            })
    }, [month, year])

    const getCellData = (dateValue: number) => {
        const apiEntry = apiData ? apiData[dateValue] : null
        if (apiEntry) {
            return {
                hijriDay: parseInt(apiEntry.hijri.day),
                hijriMonth: apiEntry.hijri.month.number - 1,
                hijriYear: parseInt(apiEntry.hijri.year),
                holidays: apiEntry.hijri.holidays || [],
            }
        }

        const fallback = gregorianToHijri(new Date(year, month, dateValue))
        return {
            hijriDay: fallback.day,
            hijriMonth: fallback.month,
            hijriYear: fallback.year,
            holidays: [] as string[],
        }
    }

    const isSeninKamis = (dateValue: number) => {
        const dow = new Date(year, month, dateValue).getDay()
        return dow === 1 || dow === 4
    }

    const monthName = targetDate.toLocaleString("id-ID", { month: "long", year: "numeric" })

    return (
        <div
            className="
                w-full max-w-full mx-auto rounded-3xl p-4 sm:p-6 border flex flex-col gap-4 box-border
                bg-gradient-to-b from-blue-50 to-white border-blue-100 hover:shadow-md
                dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 dark:border-gray-800 dark:hover:shadow-lg
                transition-all duration-500
            "
        >
            {/* Header Navigasi */}
            <div className="flex items-center justify-between px-2 text-gray-700 dark:text-gray-200">
                <button
                    className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    onClick={() => setMonthOffset(prev => prev - 1)}
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <p className="font-semibold text-base tracking-wide text-center w-full">
                    {monthName}
                </p>
                <button
                    className="p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-gray-700/50 transition-all duration-300"
                    onClick={() => setMonthOffset(prev => prev + 1)}
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Loading / Error */}
            {loading && (
                <div className="flex justify-center items-center h-32">
                    <p className="text-textLight dark:text-textDark text-lg animate-pulse flex items-center gap-2">
                        <Sparkles className="animate-spin-slow" /> Memuat kalender...
                    </p>
                </div>
            )}

            {fetchError && !apiData && !loading && (
                <p className="text-center text-red-500 font-medium">
                    Gagal memuat data kalender. Menampilkan perkiraan lokal.
                </p>
            )}

            {/* Grid */}
            {!loading && (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={monthOffset}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-7 gap-1 sm:gap-2 text-sm text-center"
                    >
                        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => (
                            <div key={d} className="text-gray-500 dark:text-gray-400 font-semibold py-1 text-xs sm:text-sm">
                                {d}
                            </div>
                        ))}

                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}

                        {dates.map((dateValue) => {
                            const cell = getCellData(dateValue)
                            const isToday = isCurrentMonth && dateValue === todayDate
                            const hasHoliday = cell.holidays.length > 0
                            const isSunnaDay = isSeninKamis(dateValue)

                            return (
                                <div
                                    key={dateValue}
                                    title={
                                        hasHoliday
                                            ? cell.holidays.join(", ")
                                            : isSunnaDay
                                                ? "Puasa Sunnah"
                                                : undefined
                                    }
                                    className={`
                                        relative p-1 sm:p-2 rounded-xl border font-medium transition-all duration-300 cursor-default flex flex-col items-center justify-center min-h-[60px] sm:min-h-[72px]
                                        ${isToday
                                            ? "bg-textLight dark:bg-textDark text-white dark:text-gray-800 border-textDark dark:border-gray-800 shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 border-transparent dark:text-gray-200 dark:hover:bg-gray-800"
                                        }
                                    `}
                                >
                                    <span className={`text-base sm:text-lg leading-tight ${isToday ? "font-bold" : "font-semibold"}`}>
                                        {dateValue}
                                    </span>
                                    <span className={`text-[10px] sm:text-xs leading-tight mt-0.5 ${isToday ? "text-white/80 dark:text-gray-800/80" : "text-gray-400 dark:text-gray-500"}`}>
                                        {cell.hijriDay} {hijriMonthNames[cell.hijriMonth]?.slice(0, 3)}
                                    </span>
                                    {(hasHoliday || isSunnaDay) && !isToday && (
                                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-textLight dark:bg-textDark" />
                                    )}
                                </div>
                            )
                        })}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    )
}

export default KalenderModern