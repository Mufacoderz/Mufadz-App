import { Suspense, lazy } from "react";
import { BrowserRouter, useLocation, Navigate, Route, Routes } from "react-router-dom";
import { useUser } from "./hooks/useUser";

import Sidebar from "./components/public/Sidebar/Sidebar";
import SidebarAdmin from "./components/admin/SidebarAdmin/Sidebar";
import DarkModeToggle from "./components/public/DarkModeToggle";

const ChatGlobal = lazy(() => import("./pages/public/ChatPage"));
const QuranList = lazy(() => import("./pages/public/QuranPage/QuranList"));
const DetailSurahPage = lazy(() => import("./pages/public/QuranPage/DetailSurah"));
const Profile = lazy(() => import("./pages/public/ProfilePage"));
const Homepages = lazy(() => import("./pages/public/HomePage"));
const DoaList = lazy(() => import("./pages/public/DoaPage/DoaList"));
const DoaDetail = lazy(() => import("./pages/public/DoaPage/DoaDetail"));
const Panduan = lazy(() => import("./pages/public/PanduanPage"));
const ChatBot = lazy(() => import("./pages/public/ChatBot"));
const Login = lazy(() => import("./pages/public/Auth/Login"));
const Register = lazy(() => import("./pages/public/Auth/Register"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const ManajemenUser = lazy(() => import("./pages/admin/Users"));
const Quran = lazy(() => import("./pages/admin/Quran"));
const KiblatPage = lazy(() => import("./pages/public/KiblatPage"));
const ZakatPage = lazy(() => import("./pages/public/ZakatPage"));
const ZikirPage = lazy(() => import("./pages/public/ZikirPage"));

function PageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <svg className="w-7 h-7 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
        </div>
    );
}

function AppContent() {
    const location = useLocation();

    // Ambil dari context — otomatis update setelah login tanpa perlu decode manual
    const { user, isLoggedIn, loading } = useUser();
    const role = user?.role ?? "";

    const hideSidebarRoutes = ["/login", "/register"];
    const hideSidebar = hideSidebarRoutes.includes(location.pathname);



    // Tunggu context selesai fetch — cegah sidebar flash ke sidebar yang salah
    if (loading && !hideSidebar) {
        return (
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
                <svg className="w-7 h-7 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {!hideSidebar && (role === "admin" ? <SidebarAdmin /> : <Sidebar />)}
            <DarkModeToggle />
            <main className={`flex-1 transition-all duration-300 ${hideSidebar ? "ml-0" : "ml-0 md:ml-64"}`}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* PUBLIC */}
                        <Route path="/" element={<Homepages />} />
                        <Route path="/quran" element={<QuranList />} />
                        <Route path="/surah/:surahId" element={<DetailSurahPage />} />
                        <Route path="/doa" element={<DoaList />} />
                        <Route path="/doa/:id" element={<DoaDetail />} />
                        <Route path="/panduan" element={<Panduan />} />
                        <Route path="/kiblat" element={<KiblatPage />} />
                        <Route path="/zakat" element={<ZakatPage />} />
                        <Route path="/zikir" element={<ZikirPage />} />
                        <Route path="/chatbot" element={<ChatBot />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* USER PROTECTED */}
                        <Route path="/chat" element={
                            isLoggedIn ? <ChatGlobal /> : <Navigate to="/login" replace />
                        } />
                        <Route path="/profile" element={
                            isLoggedIn ? <Profile /> : <Navigate to="/login" replace />
                        } />

                        {/* ADMIN PROTECTED */}
                        <Route path="/admin/dashboard" element={
                            !isLoggedIn ? <Navigate to="/login" replace />
                            : role === "admin" ? <AdminDashboard />
                            : <Navigate to="/" replace />
                        } />
                        <Route path="/admin/manajemenUser" element={
                            !isLoggedIn ? <Navigate to="/login" replace />
                            : role === "admin" ? <ManajemenUser />
                            : <Navigate to="/" replace />
                        } />
                        <Route path="/admin/quran" element={
                            !isLoggedIn ? <Navigate to="/login" replace />
                            : role === "admin" ? <Quran />
                            : <Navigate to="/" replace />
                        } />
                    </Routes>
                </Suspense>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}