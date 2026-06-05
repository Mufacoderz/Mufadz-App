import { useCallback, useEffect, useState } from "react";
import { Users, Plus, Search, Pencil, Trash2, X, Check, Shield, User } from "lucide-react";
import { API_BASE_URL, getUploadUrl } from "../../config/api";

function authHeaders() {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

type UserData = {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image: string | null;
    created_at: string;
};

type FormData = {
    name: string;
    email: string;
    password: string;
    role: string;
};

const emptyForm: FormData = { name: "", email: "", password: "", role: "user" };

function getInitials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    return `${days} hari lalu`;
}

export default function ManajemenUser() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");

    // Modal state
    const [modal, setModal] = useState<"add" | "edit" | null>(null);
    const [editTarget, setEditTarget] = useState<UserData | null>(null);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users`, { headers: authHeaders() });
            const data = await res.json();
            setUsers(data.data || data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const filtered = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === "all" || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const openAdd = () => {
        setForm(emptyForm);
        setFormError("");
        setModal("add");
    };

    const openEdit = (u: UserData) => {
        setEditTarget(u);
        setForm({ name: u.name, email: u.email, password: "", role: u.role });
        setFormError("");
        setModal("edit");
    };

    const closeModal = () => {
        setModal(null);
        setEditTarget(null);
        setFormError("");
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            setFormError("Nama dan email wajib diisi");
            return;
        }
        if (modal === "add" && !form.password.trim()) {
            setFormError("Password wajib diisi untuk user baru");
            return;
        }

        setSaving(true);
        setFormError("");
        try {
            let res;
            if (modal === "add") {
                res = await fetch(`${API_BASE_URL}/api/admin/users`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify(form),
                });
            } else {
                res = await fetch(`${API_BASE_URL}/api/admin/users/${editTarget!.id}`, {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify(form),
                });
            }

            const data = await res.json();
            if (!res.ok) {
                setFormError(data.message || "Gagal menyimpan");
                return;
            }

            await fetchUsers();
            closeModal();
        } catch {
            setFormError("Gagal terhubung ke server");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/users/${deleteTarget.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            if (res.ok) {
                setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
                setDeleteTarget(null);
            } else {
                const data = await res.json();
                alert(data.message || "Gagal menghapus");
            }
        } finally {
            setDeleting(false);
        }
    };

    const adminCount = users.filter((u) => u.role === "admin").length;
    const userCount = users.filter((u) => u.role === "user").length;

    return (
        <div className="min-h-screen bg-[#f0f4ff] dark:bg-[#0a0f1e] p-5 sm:p-8">
            {/* Fixed background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-100/60 dark:bg-blue-900/10 blur-3xl" />
                <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] rounded-full bg-indigo-100/50 dark:bg-indigo-900/10 blur-3xl" />
            </div>

            <div className="relative max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-7 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manajemen User</h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Kelola semua akun pengguna aplikasi</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200 dark:shadow-none"
                    >
                        <Plus size={16} />
                        Tambah User
                    </button>
                </div>

                {/* Stat chips */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    {[
                        { label: "Total", value: users.length, color: "bg-blue-500", role: "all" as const },
                        { label: "Admin", value: adminCount, color: "bg-amber-500", role: "admin" as const },
                        { label: "User", value: userCount, color: "bg-emerald-500", role: "user" as const },
                    ].map((chip) => (
                        <button
                            key={chip.role}
                            onClick={() => setFilterRole(chip.role)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                filterRole === chip.role
                                    ? "bg-white dark:bg-gray-800 border-blue-200 dark:border-gray-700 text-gray-800 dark:text-white shadow-sm"
                                    : "bg-white/60 dark:bg-gray-900/40 border-transparent text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800"
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${chip.color}`} />
                            {chip.label}
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{chip.value}</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative mb-5">
                    <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-400 dark:focus:border-blue-600 transition shadow-sm"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Table card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-blue-50 dark:border-gray-800 shadow-xl shadow-blue-100/30 dark:shadow-none overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600" />

                    {loading ? (
                        <div className="py-16 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-500 animate-spin" />
                            <p className="text-sm text-blue-400 font-medium">Memuat data...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                            <Users size={36} className="text-blue-100 dark:text-gray-700" />
                            <p className="text-sm font-medium">Tidak ada user ditemukan</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {/* Table header */}
                            <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50/60 dark:bg-gray-800/40">
                                {["Nama", "Email", "Role", "Bergabung", ""].map((h) => (
                                    <p key={h} className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{h}</p>
                                ))}
                            </div>

                            {filtered.map((u) => (
                                <div
                                    key={u.id}
                                    className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 sm:gap-4 px-6 py-4 hover:bg-blue-50/30 dark:hover:bg-gray-800/40 transition-colors items-center"
                                >
                                    {/* Name + avatar */}
                                    <div className="flex items-center gap-3">
                                        {u.profile_image ? (
                                            <img src={getUploadUrl(u.profile_image)} alt={u.name}
                                                className="w-9 h-9 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-bold text-white">{getInitials(u.name)}</span>
                                            </div>
                                        )}
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                                    </div>

                                    {/* Email */}
                                    <p className="text-sm text-gray-400 dark:text-gray-500 truncate">{u.email}</p>

                                    {/* Role */}
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit ${
                                        u.role === "admin"
                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                    }`}>
                                        {u.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                                        {u.role}
                                    </span>

                                    {/* Date */}
                                    <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(u.created_at)}</p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEdit(u)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(u)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add / Edit Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-blue-50 dark:border-gray-800 w-full max-w-md overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600" />
                        <div className="px-6 py-5">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-bold text-base text-gray-800 dark:text-white">
                                    {modal === "add" ? "Tambah User Baru" : "Edit User"}
                                </h2>
                                <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Nama Lengkap", key: "name", type: "text", placeholder: "Nama user" },
                                    { label: "Email", key: "email", type: "email", placeholder: "email@contoh.com" },
                                    { label: modal === "add" ? "Password" : "Password Baru (kosongkan jika tidak diganti)", key: "password", type: "password", placeholder: "••••••••" },
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{field.label}</label>
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            value={form[field.key as keyof FormData]}
                                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-blue-100 dark:border-gray-700 bg-blue-50/40 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-400 transition"
                                        />
                                    </div>
                                ))}

                                {/* Role */}
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Role</label>
                                    <div className="flex gap-2 mt-1.5">
                                        {["user", "admin"].map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => setForm({ ...form, role: r })}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                                    form.role === r
                                                        ? r === "admin"
                                                            ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                                            : "border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                                        : "border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300"
                                                }`}
                                            >
                                                {r === "admin" ? <Shield size={13} /> : <User size={13} />}
                                                {r}
                                                {form.role === r && <Check size={12} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formError && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-500 dark:text-red-400 text-sm px-4 py-2.5 rounded-xl">
                                        {formError}
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 mt-1"
                                >
                                    {saving ? "Menyimpan..." : modal === "add" ? "Buat User" : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-50 dark:border-gray-800 w-full max-w-sm overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-500" />
                        <div className="px-6 py-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={20} className="text-red-500" />
                            </div>
                            <h3 className="text-center font-bold text-gray-900 dark:text-white mb-1">Hapus User?</h3>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{deleteTarget.name}</span> akan dihapus permanen dan tidak bisa dikembalikan.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
                                >
                                    {deleting ? "Menghapus..." : "Hapus"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
