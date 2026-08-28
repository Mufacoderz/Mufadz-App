import { useEffect, useState } from "react"

const LOCATION_CACHE_KEY = "mufadz_last_coords"

type Coords = { lat: number; lon: number }

const readCachedCoords = (): Coords | null => {
    try {
        const raw = localStorage.getItem(LOCATION_CACHE_KEY)
        return raw ? (JSON.parse(raw) as Coords) : null
    } catch {
        return null
    }
}

export const useLocation = () => {
    const [coords, setCoords] = useState<Coords | null>(readCachedCoords)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Browser tidak mendukung geolocation.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const fresh: Coords = {
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                }
                setCoords(fresh)
                setError(null)
                try {
                    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(fresh))
                } catch {
                    // localStorage bisa gagal di private mode, aman diabaikan
                }
            },
            (err) => {
                console.warn("Geolocation denied or error:", err.message)
                // kalau masih ada cache dari kunjungan sebelumnya, pertahankan itu
                // sebagai fallback daripada nge-null-in dan nampilin error ke user
                setCoords((prev) => prev ?? null)
                if (!readCachedCoords()) setError(err.message)
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 10 * 60 * 1000, // 10 menit — boleh pakai last-known-position
            }
        )
    }, [])

    return { coords, error }
}
