import { Link } from "react-router-dom"
import { useEffect } from "react"
import { useDoa } from "../../../api/doa"
import { Sparkles } from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css";




const DoaListCard = () => {

        useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            offset: 100,
        });
    }, []);

    const { doaList, loading, error } = useDoa()

    if (loading)
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-textbg-textLight dark:text-txtbg-textDark text-lg animate-pulse flex items-center gap-2">
                    <Sparkles className="animate-spin-slow" /> Memuat do'a...
                </p>
            </div>
        )

    if (error)
        return (
            <p className="text-center mt-10 text-red-500 font-medium">
                Terjadi kesalahan: {error}
            </p>
        )

    if (!doaList || doaList.length === 0)
        return (
            <p className="text-center mt-10 text-gray-500 italic">
                Tidak ada do'a tersedia.
            </p>
        )

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ">
                {doaList.map((doa)=>(
                    <Link key={doa.id} to={`/doa/${doa.id}`}>
                        <div
                        key={doa.id}
                        data-aos="fade-right"
                        data-aos-delay={Math.random() * 200}
                        className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-100 dark:border-gray-700 hover:border-blue-700 dark:hover:border-blue-100
                        rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
                        hover:-translate-y-1 flex flex-col items-start h-18 sm:h-24"
                    >
                        <div 
                        
                        className="flex items-center justify-between w-full ">
                            <div className="flex items-start gap-3">
                                <div className="bg-textLight dark:bg-textDark text-white dark:text-gray-800 w-10 h-10 flex items-center justify-center rounded-full font-semibold shadow-sm">
                                    {doa.id}
                                </div>
                                <h3 className="text-base font-semibold text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-txtbg-textDark transition-colors flex-1">
                                    {doa.judul}
                                </h3>
                            </div>
                        </div>
                    </div>
                    </Link>
                ))}
            </div>
    )
}

export default DoaListCard
