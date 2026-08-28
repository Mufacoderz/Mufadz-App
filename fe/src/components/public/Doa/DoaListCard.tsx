import { Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useDoa } from "../../../api/doa"
import { Sparkles } from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css";

const PAGE_SIZE = 30;

const DoaListCard = () => {

    useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
            offset: 60,
        });
    }, []);

    const { doaList, loading, error } = useDoa()

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    const [loadingMore, setLoadingMore] = useState(false)

    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const visibleCountRef = useRef(visibleCount)
    const loadingMoreRef = useRef(false)

    useEffect(() => {
        setVisibleCount(PAGE_SIZE)
    }, [doaList])

    useEffect(() => {
        visibleCountRef.current = visibleCount
    }, [visibleCount])

    useEffect(() => {
        AOS.refresh()
    }, [visibleCount])

    useEffect(() => {
        if (!sentinelRef.current || doaList.length === 0) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (
                    entry.isIntersecting &&
                    !loadingMoreRef.current &&
                    visibleCountRef.current < doaList.length
                ) {
                    loadingMoreRef.current = true
                    setLoadingMore(true)

                    setTimeout(() => {
                        setVisibleCount((c) => Math.min(c + PAGE_SIZE, doaList.length))
                        setLoadingMore(false)
                        loadingMoreRef.current = false
                    }, 250)
                }
            },
            { rootMargin: "200px" }
        )

        observer.observe(sentinelRef.current)
        return () => observer.disconnect()
    }, [doaList.length])

    if (loading)
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 rounded-2xl bg-blue-50/60 dark:bg-gray-800/40 animate-pulse"
                    />
                ))}
            </div>
        )

    if (error)
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            </div>
        )

    if (!doaList || doaList.length === 0)
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-4xl opacity-30">📖</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Tidak ada do'a tersedia.</p>
            </div>
        )

    const visibleDoa = doaList.slice(0, visibleCount)
    const hasMore = visibleCount < doaList.length

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
                {visibleDoa.map((doa) => (
                    <Link key={doa.id} to={`/doa/${doa.id}`}>
                        <div
                            data-aos="fade-up"
                            className="
                                group relative overflow-hidden
                                rounded-2xl border shadow-sm hover:shadow-lg
                                transition-all duration-300 cursor-pointer hover:-translate-y-0.5
                                bg-white dark:bg-gray-800/80
                                border-blue-50 dark:border-gray-700/60
                                hover:border-blue-200 dark:hover:border-blue-900/60
                            "
                        >
                            <div className="
                                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30
                                dark:from-blue-950/20 dark:via-transparent dark:to-blue-900/10
                            " />

                            <div className="relative flex items-center gap-4 p-4">
                                <div className="
                                    w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                                    bg-gradient-to-br from-blue-500 to-blue-600
                                    dark:from-blue-600 dark:to-blue-700
                                    text-white font-bold text-sm shadow-sm
                                ">
                                    {doa.id}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">
                                        {doa.judul}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {hasMore && (
                <div ref={sentinelRef} className="flex justify-center items-center py-8">
                    {loadingMore && (
                        <p className="text-textLight dark:text-textDark text-sm flex items-center gap-2 animate-pulse">
                            <Sparkles size={16} className="animate-spin-slow" />
                            Memuat do'a lainnya...
                        </p>
                    )}
                </div>
            )}

            {!hasMore && doaList.length > PAGE_SIZE && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-600 py-8">
                    Semua {doaList.length} do'a sudah ditampilkan.
                </p>
            )}
        </>
    )
}

export default DoaListCard
