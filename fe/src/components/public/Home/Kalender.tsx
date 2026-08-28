import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Sparkles, CalendarX2 } from "lucide-react"
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

type TabKey = "kalender" | "penting"

const TABS: { key: TabKey; label: string }[] = [
    { key: "kalender", label: "Kalender" },
    { key: "penting", label: "Hari Penting" },
]

const KalenderModern = () => {
    const [activeTab, setActiveTab] = useState<TabKey>("kalender")
    const [monthOffset, setMonthOffset] = useState(0)
    const [apiData, setApiData] = useState<Record<string, HijriDayData> | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetchError, setFetchError] = useState(false)
    const [hariPentingOffset, setHariPentingOffset] = useState(0)
    const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set())

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
        setHariPentingOffset(0)
        setExpandedDays(new Set())

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
    const monthShort = targetDate.toLocaleString("id-ID", { month: "short" })

    const hariPentingList = useMemo(() => {
        if (!apiData) return []
        return Object.entries(apiData)
            .filter(([, d]) => d.hijri.holidays && d.hijri.holidays.length > 0)
            .map(([day, d]) => ({
                gregorianDay: Number(day),
                hijriDay: d.hijri.day,
                hijriMonthName: hijriMonthNames[d.hijri.month.number - 1],
                hijriYear: d.hijri.year,
                holidays: d.hijri.holidays,
            }))
            .sort((a, b) => a.gregorianDay - b.gregorianDay)
    }, [apiData])

    return (
        <div
            className="
                w-full max-w-full mx-auto rounded-3xl p-4 sm:p-6 border flex flex-col gap-3 box-border overflow-hidden min-w-0
                bg-gradient-to-b from-blue-50 to-white border-blue-100 hover:shadow-md
                dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 dark:border-gray-800 dark:hover:shadow-lg
                transition-all duration-500
            "
        >
            {/* Tab Switcher */}
            <div
                className="
                    relative w-full max-w-xs h-10 rounded-full flex items-center p-1 shadow-inner mx-auto
                    bg-white/70 border border-blue-100 backdrop-blur-sm
                    dark:bg-gray-800/70 dark:border-gray-700
                "
            >
                <motion.div
                    layout
                    className="absolute top-1 bottom-1 w-1/2 rounded-full bg-textLight dark:bg-textDark shadow-md"
                    animate={{ x: activeTab === "kalender" ? 0 : "100%" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <div className="relative z-10 flex w-full text-sm font-medium text-center">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 transition ${
                                activeTab === tab.key
                                    ? "text-white dark:text-gray-800"
                                    : "text-gray-600 dark:text-gray-300 hover:text-textLight dark:hover:text-textDark"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

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

            {/* Content */}
            {!loading && (
                <div className="min-w-0 w-full">
                <AnimatePresence mode="wait">
                    {activeTab === "kalender" ? (
                        <motion.div
                            key={`grid-${monthOffset}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-7 gap-0.5 sm:gap-1 text-sm text-center overflow-hidden"
                        >
                            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => (
                                <div key={d} className="text-gray-500 dark:text-gray-400 font-semibold py-1 text-xs sm:text-sm">
                                    {d}
                                </div>
                            ))}

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
                                            relative p-1 sm:p-2 rounded-xl border font-medium transition-all duration-300 cursor-default flex flex-col items-center justify-center min-h-[48px] sm:min-h-[56px]
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
                    ) : (
                        <motion.div
                            key={`list-${monthOffset}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col gap-2 overflow-hidden w-full min-h-[420px]"
                        >
                            {hariPentingList.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
                                    <CalendarX2 size={40} className="text-gray-300 dark:text-gray-600" />
                                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                                        Tidak ada hari penting di bulan ini.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2">
                                        {hariPentingList.slice(hariPentingOffset, hariPentingOffset + 5).map((item) => {
                                            const isExpanded = expandedDays.has(item.gregorianDay)
                                            const hasMultiple = item.holidays.length > 1
                                            return (
                                                <div
                                                    key={item.gregorianDay}
                                                    className="
                                                        flex gap-3 p-3 rounded-xl border
                                                        bg-white/70 border-blue-100 dark:bg-gray-800/60 dark:border-gray-700
                                                    "
                                                >
                                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-blue-50 dark:bg-gray-700 shrink-0">
                                                        <span className="text-base font-bold text-textLight dark:text-textDark leading-none">
                                                            {item.gregorianDay}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
                                                            {monthShort}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {!isExpanded && (
                                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                                                {item.holidays[0]}
                                                            </p>
                                                        )}
                                                        <AnimatePresence>
                                                            {isExpanded && (
                                                                <motion.ul
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                    className="text-sm font-medium text-gray-800 dark:text-gray-100 space-y-1 overflow-hidden"
                                                                >
                                                                    {item.holidays.map((h, i) => (
                                                                        <li key={i} className="flex items-start gap-1.5">
                                                                            <span className="text-textLight dark:text-textDark mt-0.5">•</span>
                                                                            <span>{h}</span>
                                                                        </li>
                                                                    ))}
                                                                </motion.ul>
                                                            )}
                                                        </AnimatePresence>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            {item.hijriDay} {item.hijriMonthName} {item.hijriYear} H
                                                        </p>
                                                        {hasMultiple && (
                                                            <button
                                                                onClick={() => {
                                                                    const next = new Set(expandedDays)
                                                                    if (next.has(item.gregorianDay)) next.delete(item.gregorianDay)
                                                                    else next.add(item.gregorianDay)
                                                                    setExpandedDays(next)
                                                                }}
                                                                className="text-xs text-textLight dark:text-textDark mt-1 hover:underline"
                                                            >
                                                                {isExpanded ? "Tutup" : `+${item.holidays.length - 1} lagi`}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {hariPentingList.length > 5 && (
                                        <div className="flex justify-center gap-2 pt-1">
                                            <button
                                                disabled={hariPentingOffset === 0}
                                                onClick={() => setHariPentingOffset((p) => Math.max(0, p - 1))}
                                                className="p-1.5 rounded-full bg-blue-50 dark:bg-gray-800 text-textLight dark:text-textDark disabled:opacity-30 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                disabled={hariPentingOffset + 5 >= hariPentingList.length}
                                                onClick={() => setHariPentingOffset((p) => Math.min(hariPentingList.length - 5, p + 1))}
                                                className="p-1.5 rounded-full bg-blue-50 dark:bg-gray-800 text-textLight dark:text-textDark disabled:opacity-30 hover:bg-blue-100 dark:hover:bg-gray-700 transition"
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export default KalenderModern
