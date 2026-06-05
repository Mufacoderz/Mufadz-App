import { useState, useEffect } from "react"
import axios from "axios"

export interface Doa {
    id: number
    judul: string
    arab: string
    latin: string
    terjemah: string
}

export function useDoa() {
    const [doaList, setDoaList] = useState<Doa[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDoa = async () => {
            try {
                const res = await axios.get("https://open-api.my.id/api/doa")

                console.log("API Response:", res.data)
                const rawData = res.data?.data ?? res.data
                const data: Doa[] = Array.isArray(rawData) ? rawData : []
                setDoaList(data)

                setLoading(false)
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data")
                setLoading(false)
            }
        }

        fetchDoa()
    }, [])

    return { doaList, loading, error }
}
