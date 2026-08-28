import { useEffect, useState } from "react"
import { Sun, Sunrise, Sunset, Moon } from "lucide-react"
import { getPrayerTimes } from "../../../api/aladhan"
import { useLocation } from "../../../hooks/useLocation"
import AOS from "aos"
import "aos/dist/aos.css";

interface Prayer {
    name: string
    time: string
    icon: React.ReactNode
}

type PrayerTimings = {
    Fajr: string
    Dhuhr: string
    Asr: string
    Maghrib: string
    Isha: string
}

const prayerCacheKey = (lat: number, lon: number) => {
    const dateKey = new Date().toISOString().slice(0, 10)
    return `mufadz_prayer_${dateKey}_${lat.toFixed(2)}_${lon.toFixed(2)}`
}

const JadwalSholat: React.FC = () => {
    const { coords, error } = useLocation()
    const [times, setTimes] = useState<PrayerTimings | null>(null)

    useEffect(() => {
        if (!coords) return

        const cacheKey = prayerCacheKey(coords.lat, coords.lon)
        try {
            const cached = localStorage.getItem(cacheKey)
            if (cached) setTimes(JSON.parse(cached))
        } catch {
            // ignore
        }

        getPrayerTimes(coords.lat, coords.lon).then((data) => {
            setTimes(data)
            try {
                localStorage.setItem(cacheKey, JSON.stringify(data))
            } catch {
                // ignore
            }
        })
    }, [coords])

    useEffect(() => {
        AOS.init({ duration: 1000, once: false, offset: 100 });
    }, []);

    if (error && !times)
        return <p className="text-red-500 dark:text-red-400 text-center">{error}</p>

    if (!times)
        return (
            <div
                className="
                    p-6 rounded-2xl shadow-sm border w-full max-w-full box-border
                    bg-gradient-to-b from-blue-50 to-white border-blue-100
                    dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 dark:border-gray-800
                "
            >
                <div className="h-6 w-48 rounded-md bg-blue-100/70 dark:bg-gray-800 animate-pulse mb-4" />
                <div className="grid grid-cols-1 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 rounded-xl bg-blue-50/80 dark:bg-gray-800/60 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        )

    const prayers: Prayer[] = [
        { name: "Subuh", time: times.Fajr, icon: <Sunrise size={20} /> },
        { name: "Zuhur", time: times.Dhuhr, icon: <Sun size={20} /> },
        { name: "Ashar", time: times.Asr, icon: <Sun size={20} /> },
        { name: "Maghrib", time: times.Maghrib, icon: <Sunset size={20} /> },
        { name: "Isya", time: times.Isha, icon: <Moon size={20} /> },
    ]

    return (
        <div
            className="
                p-6 rounded-2xl shadow-sm border w-full max-w-full hover:shadow-md box-border
                bg-gradient-to-b from-blue-50 to-white border-blue-100
                dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 dark:border-gray-800
                transition-all duration-500
            "
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Jadwal Sholat Hari Ini
                </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 w-full max-w-full">
                {prayers.map((p) => (
                    <div
                        key={p.name}
                        data-aos="fade-up"
                        data-aos-delay={Math.random() * 200}
                        className="
                            flex justify-between items-center rounded-xl px-4 py-3 border shadow-sm
                            bg-white border-gray-100 text-gray-800
                            hover:shadow-md hover:-translate-y-1 cursor-pointer transition
                            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200
                            w-full max-w-full box-border
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 text-textLight dark:bg-gray-700 dark:text-textDark">
                                {p.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {p.name}
                                </h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    Waktu lokal
                                </p>
                            </div>
                        </div>
                        <span className="text-textLight dark:text-textDark font-semibold">
                            {p.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default JadwalSholat
