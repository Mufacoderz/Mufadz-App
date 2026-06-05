import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import DoaPrevButton from "../../../components/public/Doa/DoaPrevButton"
import DoaCard from "../../../components/public/Doa/DoaCard"
import { motion } from "framer-motion"

interface Doa {
    id: number
    judul: string
    arab: string
    latin: string
    terjemah: string
}

export default function DoaDetail() {
    const { id } = useParams<{ id: string }>()
    const [doa, setDoa] = useState<Doa | null>(null)

    useEffect(() => {
        if (!id) return
        axios
            .get(`https://open-api.my.id/api/doa/${id}`)
            .then(res => setDoa(res.data))
            .catch(console.error)
    }, [id])

    if (!doa)
        return (
            <p className="text-center pt-20 text-blue-500 dark:text-blue-300  dark:bg-gray-900 h-full ">
                Loading doa...
            </p>
        )

    return (
        <div className="min-h-screen flex justify-center items-start px-5 pt-10 pb-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-3xl space-y-8"
            >
                <div className="flex items-center justify-between">
                    <DoaPrevButton />
                </div>

                <div
                    className="  p-6 sm:p-8 
                    transition-all duration-300"
                >
                    <DoaCard
                        judul={doa.judul}
                        arab={doa.arab}
                        latin={doa.latin}
                        terjemah={doa.terjemah}
                    />
                </div>
            </motion.div>
        </div>
    )
}
