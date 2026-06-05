import { useState } from 'react'
import { useUser } from '../../hooks/useUser'
import ProfileAvatar from "../../components/public/Profile/ProfileAvatar";
import ProfileInfo from "../../components/public/Profile/ProfileInfo";
import ProfileReminders from "../../components/public/Profile/ProfileReminders";

function Profile() {
    const { user, loading, refreshUser } = useUser();
    const [editing, setEditing] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] dark:bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                    <p className="text-blue-400 text-sm font-medium tracking-wide">Memuat profil...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f0f4ff] dark:bg-gray-950 flex items-center justify-center">
                <p className="text-red-400">Gagal memuat profil</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#0a0f1e]">
            {/* Subtle background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/60 dark:bg-blue-900/10 blur-3xl" />
                <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/10 blur-3xl" />
            </div>

            <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-blue-100/50 dark:shadow-blue-900/20 overflow-hidden border border-blue-50 dark:border-gray-800">

                    {/* Top accent strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600" />

                    <div className="px-7 pt-8 pb-7">
                        {/* Avatar row */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <ProfileAvatar
                                    name={user.name}
                                    profileImage={user.profile_image}
                                    role={user.role}
                                    onAvatarUpdated={refreshUser}
                                />
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                            {user.name}
                                        </h1>
                                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold tracking-wide ${
                                            user.role === "admin"
                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                        }`}>
                                            {user.role === "admin" ? "Admin" : "User"}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5 font-medium">{user.email}</p>
                                    {user.bio && !editing && (
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed max-w-sm">
                                            {user.bio}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Edit button */}
                            <div className="shrink-0">
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center gap-1.5 text-xs font-bold border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white px-3.5 py-1.5 rounded-full transition-all duration-200"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-3.5 py-1.5 rounded-full border-2 border-gray-200 dark:border-gray-700 transition-all duration-200"
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="flex gap-0 mt-7 rounded-2xl overflow-hidden border border-blue-50 dark:border-gray-800 bg-[#f8faff] dark:bg-gray-800/40">
                            <div className="flex-1 px-5 py-3.5">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Bergabung</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white">
                                    {new Date(user.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                                </p>
                            </div>
                            <div className="w-px bg-blue-50 dark:bg-gray-700" />
                            <div className="flex-1 px-5 py-3.5">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Role</p>
                                <p className="text-sm font-bold text-gray-800 dark:text-white capitalize">{user.role}</p>
                            </div>
                            <div className="w-px bg-blue-50 dark:bg-gray-700" />
                            <div className="flex-1 px-5 py-3.5">
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Status</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-300" />
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">Aktif</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content below */}
                <div className="mt-5 flex flex-col gap-4 pb-10">
                    {editing && (
                        <ProfileInfo
                            name={user.name}
                            bio={user.bio}
                            onUpdated={() => {
                                refreshUser();
                                setEditing(false);
                            }}
                            onCancel={() => setEditing(false)}
                        />
                    )}
                    <ProfileReminders />
                </div>
            </div>
        </div>
    );
}

export default Profile;