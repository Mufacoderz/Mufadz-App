import axios from "axios"

type PrayerTimings = {
    Fajr: string
    Dhuhr: string
    Asr: string
    Maghrib: string
    Isha: string
}

export const getPrayerTimes = async (lat: number, lon: number): Promise<PrayerTimings> => {
    const res = await axios.get("https://api.aladhan.com/v1/timings", {
        params: {
            latitude: lat,
            longitude: lon,
            method: 5,
        },
    })
    return res.data.data.timings
}

export type HijriDayData = {
    gregorian: { day: string; month: { number: number; en: string }; year: string }
    hijri: { day: string; month: { number: number; en: string; ar: string }; year: string; holidays: string[] }
}

export const getHijriCalendar = async (month: number, year: number): Promise<HijriDayData[]> => {
    const res = await axios.get(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`)
    return res.data.data
}
