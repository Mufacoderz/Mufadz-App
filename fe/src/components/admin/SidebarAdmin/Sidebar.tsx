import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard, Users, BookOpen, Heart,
    MessageCircle, Settings, LogOut, ChevronRight
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import HeaderSidebarAdmin from "./HeaderSidebar";
import SidebarToggle from "./SidebarToggle";

const SidebarAdmin = () => {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const activePath = location.pathname;

    let isAdmin = false;
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decoded: { role?: string } = jwtDecode(token);
            isAdmin = decoded.role === "admin";
        } catch {
            isAdmin = false;
        }
    }

    const navItems = [
        { name: "Dashboard",        path: "/admin/dashboard",      icon: <LayoutDashboard size={18} /> },
        { name: "Manajemen User",   path: "/admin/manajemenUser",  icon: <Users size={18} /> },
        { name: "Manajemen Doa",    path: "/admin/manajemenDoa",   icon: <Heart size={18} /> },
        { name: "Baca Quran",       path: "/admin/quran",          icon: <BookOpen size={18} /> },
        { name: "Forum",            path: "/admin/forum",          icon: <MessageCircle size={18} /> },
        { name: "Settings",         path: "/admin/settings",       icon: <Settings size={18} /> },
    ];

    const handleLogout = () => {
        if (!confirm("Yakin mau keluar?")) return;
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <>
            <SidebarToggle open={open} setOpen={setOpen} />

            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/60 z-40
                flex flex-col transform transition-transform duration-300 ease-in-out
                ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-60 md:w-64`}
            >
                <HeaderSidebarAdmin />

                <div className="px-5 mt-5 mb-2">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                        Menu Utama
                    </p>
                </div>

                <ul className="space-y-0.5 px-3 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = activePath === item.path;
                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                                        ${isActive
                                            ? "bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                        }`}
                                >
                                    <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200
                                        ${isActive
                                            ? "bg-white/20 text-white"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500"
                                        }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && <ChevronRight size={14} className="opacity-70" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Bottom */}
                <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700/60">
                    {isAdmin && (
                        <button
                            onClick={handleLogout}
                            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
                                text-gray-500 dark:text-gray-400
                                hover:bg-red-50 dark:hover:bg-red-900/20
                                hover:text-red-600 dark:hover:text-red-400
                                transition-all duration-200"
                        >
                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                                <LogOut size={16} />
                            </span>
                            Keluar
                        </button>
                    )}
                    <p className="text-center text-[10px] text-gray-300 dark:text-gray-700 mt-3">
                        Mufadz Admin Panel v1.0
                    </p>
                </div>
            </aside>

            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
                />
            )}
        </>
    );
};

export default SidebarAdmin;