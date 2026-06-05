import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    MessageCircle,
    Home,
    BookOpen,
    User,
    LogOut,
    Heart,
    UserCircle,
    HelpCircle,
} from "lucide-react";


import HeaderSidebar from "./HeaderSidebar";
import SidebarToggle from "./SidebarToggle";
import TanyaFadzAIButton from "./TanyaAIButton";

import AOS from "aos";
import "aos/dist/aos.css";

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const activePath = location.pathname;

    const isLoggedIn = !!localStorage.getItem("token");

    const navItems = [
        { name: "Home", path: "/", icon: <Home size={20} />, auth: false },
        {
            name: "Forum Chat",
            path: "/chat",
            icon: <MessageCircle size={20} />,
            auth: true,
        },
        {
            name: "Baca Quran",
            path: "/quran",
            icon: <BookOpen size={20} />,
            auth: false,
        },
        {
            name: "Daftar Do'a",
            path: "/doa",
            icon: <Heart size={20} />,
            auth: false,
        },
        { name: "Profile", path: "/profile", icon: <User size={20} />, auth: true },
        {
            name: "Panduan",
            path: "/panduan",
            icon: <HelpCircle size={20} />,
            auth: false,
        },
    ];

    const handleProtectedClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        needAuth: boolean
    ) => {
        if (needAuth && !isLoggedIn) {
            e.preventDefault();
            const goLogin = confirm("Login dulu");
            if (goLogin) navigate("/login");
        }
    };

    const handleLogout = () => {
        const confirmLogout = confirm("Yakin mau keluar?");
        if (!confirmLogout) return;

        localStorage.removeItem("token")
        navigate("/login")
    };



    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
            offset: 100,
        });
    }, []);

    return (
        <>
            <SidebarToggle open={open} setOpen={setOpen} />

            <aside
                className={`fixed top-0 left-0 h-full bg-white dark:bg-bgDark shadow-lg border-r dark:border-gray-600 z-40 transform transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-60 md:w-64`}
            >
                <HeaderSidebar />

                <ul className="mt-6 space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = activePath === item.path;
                        const isDisabled = item.auth && !isLoggedIn;

                        return (
                            <li
                                key={item.name}
                                data-aos="fade-right"
                                data-aos-delay={Math.random() * 200}
                            >
                                <Link
                                    to={item.path}
                                    onClick={(e) => {
                                        handleProtectedClick(e, item.auth);
                                        setOpen(false);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200
                                    ${isActive
                                            ? "bg-blue-50 text-textLight shadow-sm border-l-4 border-textLight dark:bg-blue-950 dark:text-textDark dark:border-textDark"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                                        }
                                    ${isDisabled
                                            ? "opacity-50 cursor-not-allowed hover:translate-x-0"
                                            : "hover:translate-x-1"
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <TanyaFadzAIButton setOpen={setOpen} />

                <div className="absolute bottom-5 left-0 w-full px-3 space-y-1">
                    {/* 🚪 Logout hanya muncul kalau login */}
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg 
                text-gray-500 hover:bg-red-50 dark:hover:bg-red-950 
                hover:text-red-600 dark:hover:text-red-300 
                transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span>Keluar</span>
                        </button>

                    )}

                    <a
                        href="https://github.com/Mufacoderz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-textLight dark:hover:text-blue-300 transition-all duration-200"
                    >
                        <UserCircle size={20} />
                        <span>By Muhammad Fadil</span>
                    </a>
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

export default Sidebar;
