import { useEffect, useState } from "react";
import { Users, BookOpen, Heart, MessageCircle, TrendingUp, ArrowUpRight, Clock, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { API_BASE_URL, getUploadUrl } from "../../config/api";

type StatCard = {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    change?: string;
};

type RecentUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image: string | null;
    created_at: string;
};

function Dashboard() {
    const { user } = useUser();
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const greeting =
        now.getHours() < 11 ? "Selamat Pagi" :
        now.getHours() < 15 ? "Selamat Siang" :
        now.getHours() < 18 ? "Selamat Sore" : "Selamat Malam";

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const users: RecentUser[] = data.data || data;
                    setTotalUsers(users.length);
                    setRecentUsers(
                        [...users]
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 5)
                    );
                }
            } catch {
                // fallback: keep defaults
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats: StatCard[] = [
        {
            label: "Total Pengguna",
            value: totalUsers,
            icon: <Users size={20} />,
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-900/30",
            change: "Terdaftar",
        },
        {
            label: "Surah Tersedia",
            value: 114,
            icon: <BookOpen size={20} />,
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
            change: "Al-Quran",
        },
        {
            label: "Koleksi Doa",
            value: "—",
            icon: <Heart size={20} />,
            color: "text-rose-600 dark:text-rose-400",
            bgColor: "bg-rose-50 dark:bg-rose-900/30",
            change: "Tersimpan",
        },
        {
            label: "Pesan Forum",
            value: "—",
            icon: <MessageCircle size={20} />,
            color: "text-violet-600 dark:text-violet-400",
            bgColor: "bg-violet-50 dark:bg-violet-900/30",
            change: "Diskusi",
        },
    ];

    const getInitials = (name: string) =>
        name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 60) return `${mins} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        return `${days} hari lalu`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-5 sm:p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Assalamualaikum, {greeting}</p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                            {user?.name || "Admin"}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Berikut ringkasan aktivitas Mufadz hari ini
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                        <Clock size={15} />
                        {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bgColor} ${stat.color}`}>
                                {stat.icon}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs text-emerald-500 font-medium">
                                <TrendingUp size={12} />
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {loading && stat.label === "Total Pengguna" ? "..." : stat.value}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Users */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-5 rounded-full bg-blue-500" />
                            <h2 className="font-bold text-sm text-gray-800 dark:text-white">Pengguna Terbaru</h2>
                        </div>
                        <span className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline cursor-pointer">
                            Lihat semua <ArrowUpRight size={12} />
                        </span>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-32" />
                                        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded w-48" />
                                    </div>
                                </div>
                            ))
                        ) : recentUsers.length > 0 ? (
                            recentUsers.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                    {u.profile_image ? (
                                        <img
                                            src={getUploadUrl(u.profile_image)}
                                            alt={u.name}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-white">{getInitials(u.name)}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                            u.role === "admin"
                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                        }`}>
                                            {u.role}
                                        </span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-600">
                                            {timeAgo(u.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-10 text-center text-sm text-gray-400">
                                Belum ada pengguna terdaftar
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-col gap-4">
                    {/* App info */}
                    <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 rounded-2xl p-5 text-white relative overflow-hidden">
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />
                        <div className="relative">
                            <p className="text-xs text-blue-100 font-medium uppercase tracking-widest mb-1">Mufadz App</p>
                            <h3 className="text-xl font-bold mb-1">Admin Panel</h3>
                            <p className="text-sm text-blue-100 leading-relaxed">
                                Kelola konten, pengguna, dan pengaturan aplikasi dari sini.
                            </p>
                            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                                <span>Version 1.0.0</span>
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-1 h-5 rounded-full bg-blue-500" />
                            <h2 className="font-bold text-sm text-gray-800 dark:text-white">Akses Cepat</h2>
                        </div>
                        <div className="p-3 space-y-1">
                            {[
                                { label: "Tambah User Baru", path: "/admin/manajemenUser", icon: <Users size={15} />, color: "text-blue-500" },
                                { label: "Kelola Quran", path: "/admin/quran", icon: <BookOpen size={15} />, color: "text-emerald-500" },
                                { label: "Lihat Forum", path: "/chat", icon: <MessageCircle size={15} />, color: "text-violet-500" },
                                { label: "Profil Admin", path: "/profile", icon: <Settings size={15} />, color: "text-gray-500" },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors group"
                                >
                                    <span className={`${item.color} group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    <ArrowUpRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
