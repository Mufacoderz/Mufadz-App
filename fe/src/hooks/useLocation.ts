import { useEffect, useState } from "react"

export const useLocation = () => {
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Browser tidak mendukung geolocation.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                })
                setError(null)
            },
            (err) => {
                console.warn("Geolocation denied or error:", err.message)
                setError(err.message)
                setCoords(null)
            
            }
        )
    }, []) 

    return { coords, error }
}
