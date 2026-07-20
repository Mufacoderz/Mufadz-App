import { useState, useEffect } from "react"
import axios from "axios"

export interface Doa {
    id: number
    judul: string
    arab: string
    latin: string
    terjemah: string
}

function mapItem(raw: Record<string, unknown>): Doa {
    return {
        id: raw.id as number,
        judul: raw.nama as string,
        arab: raw.ar as string,
        latin: raw.tr as string,
        terjemah: raw.idn as string,
    }
}

export function useDoa() {
    const [doaList, setDoaList] = useState<Doa[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDoa = async () => {
            try {
                const res = await axios.get("https://equran.id/api/doa")
                const rawData: Record<string, unknown>[] = res.data?.data ?? []
                const data: Doa[] = Array.isArray(rawData) ? rawData.map(mapItem) : []
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
