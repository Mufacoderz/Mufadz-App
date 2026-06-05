import { BookOpen, MessageCircle, Calendar, User, Sun, Feather } from "lucide-react"
import { useNavigate } from "react-router-dom"

const PanduanList = () => {
    const navigate = useNavigate()

    const pages = [
        {
            title: "Doa Harian",
            desc: "Kumpulan doa harian lengkap dengan teks Arab, Latin, dan terjemahannya.",
            icon: <Feather className="w-4 h-4" />,
            iconBg: "bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-400",
            path: "/doa",
        },
        {
            title: "Baca Quran",
            desc: "Al-Qur'an digital dengan tampilan nyaman dan navigasi surah yang mudah.",
            icon: <BookOpen className="w-4 h-4" />,
            iconBg: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
            path: "/quran",
        },
        {
            title: "Forum Chat",
            desc: "Berinteraksi dengan pengguna lain untuk berdiskusi atau bertanya seputar ibadah.",
            icon: <MessageCircle className="w-4 h-4" />,
            iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
            path: "/chat",
        },
        {
            title: "Profil",
            desc: "Kelola profil, pengaturan aplikasi, dan preferensi pribadi Anda.",
            icon: <User className="w-4 h-4" />,
            iconBg: "bg-pink-50 text-pink-500 dark:bg-pink-950 dark:text-pink-400",
            path: "/profile",
        },
    ]

    const homeSections = [
        {
            title: "Jadwal Sholat",
            desc: "Cek waktu sholat harian di lokasi Anda secara akurat berdasarkan GPS.",
            icon: <Sun className="w-4 h-4" />,
            iconBg: "bg-amber-50 text-amber-500 dark:bg-amber-950 dark:text-amber-400",
            id: "JadwalSholat",
        },
        {
            title: "Kalender",
            desc: "Lihat kalender Hijriah dan Masehi untuk jadwal ibadah dan kegiatan penting.",
            icon: <Calendar className="w-4 h-4" />,
            iconBg: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
            id: "Kalender",
        },
    ]

    const scrollToSection = (id: string) => {
        navigate("/")
        setTimeout(() => {
            const el = document.getElementById(id)
            if (el) el.scrollIntoView({ behavior: "smooth" })
        }, 50)
    }

    const CardItem = ({
        icon, iconBg, title, desc, label, onClick
    }: {
        icon: React.ReactNode
        iconBg: string
        title: string
        desc: string
        label: string
        onClick: () => void
    }) => (
        <button
            onClick={onClick}
            className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 flex flex-col gap-3 text-left"
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mt-auto">
                {label} →
            </span>
        </button>
    )

    return (
        <div className="space-y-6 mb-12">
            {/* Beranda Section */}
            <div>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                    Beranda
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                    {homeSections.map((f) => (
                        <CardItem
                            key={f.title}
                            icon={f.icon}
                            iconBg={f.iconBg}
                            title={f.title}
                            desc={f.desc}
                            label="Lihat di beranda"
                            onClick={() => scrollToSection(f.id)}
                        />
                    ))}
                </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Halaman Section */}
            <div>
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                    Halaman
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                    {pages.map((f) => (
                        <CardItem
                            key={f.title}
                            icon={f.icon}
                            iconBg={f.iconBg}
                            title={f.title}
                            desc={f.desc}
                            label="Buka halaman"
                            onClick={() => navigate(f.path)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default PanduanList