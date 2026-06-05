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
