import { useState } from "react";
import { updateProfile } from "../../../services/profileService";

type Props = {
    name: string;
    bio: string;
    onUpdated: () => void;
    onCancel: () => void;
};

function ProfileInfo({ name, bio, onUpdated, onCancel }: Props) {
    const [form, setForm] = useState({ name, bio: bio || "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setLoading(true);
        try {
            await updateProfile({ name: form.name, bio: form.bio });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onUpdated(); // refresh + tutup form
            }, 1000);
        } catch {
            alert("Gagal menyimpan perubahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-1 h-5 rounded-full bg-blue-500" />
                <h2 className="font-bold text-base text-gray-800 dark:text-white">Edit Profil</h2>
            </div>

            <div className="px-5 py-5 space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Nama Lengkap
                    </label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-2 w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 transition"
                    />
                </div>

                <div>
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Bio
                    </label>
                    <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        rows={3}
                        placeholder="Tulis sedikit tentang dirimu..."
                        className="mt-2 w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm outline-none focus:border-blue-400 focus:bg-white dark:focus:bg-gray-600 transition resize-none"
                    />
                </div>

                {success && (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
                        <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Profil berhasil diperbarui!</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={loading || success}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileInfo;