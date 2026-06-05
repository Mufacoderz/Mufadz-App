import { useState, useEffect } from "react";
import {
    fetchReminders,
    createReminder,
    toggleReminder,
    deleteReminder,
} from "../../../services/profileService";

type Reminder = {
    id: number;
    title: string;
    note: string;
    time: string;
    is_done: boolean;
    created_at: string;
};

function ProfileReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", note: "", time: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadReminders(); }, []);

    const loadReminders = async () => {
        try {
            const data = await fetchReminders();
            setReminders(data.data || data);
        } finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            const data = await createReminder(form);
            setReminders((prev) => [data.data || data, ...prev]);
            setForm({ title: "", note: "", time: "" });
            setShowForm(false);
        } catch {
            alert("Gagal menambahkan reminder");
        } finally { setSaving(false); }
    };

    const handleToggle = async (id: number) => {
        try {
            await toggleReminder(id);
            setReminders((prev) => prev.map((r) => r.id === id ? { ...r, is_done: !r.is_done } : r));
        } catch { alert("Gagal mengupdate reminder"); }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteReminder(id);
            setReminders((prev) => prev.filter((r) => r.id !== id));
        } catch { alert("Gagal menghapus reminder"); }
    };

    const done = reminders.filter((r) => r.is_done);
    const todo = reminders.filter((r) => !r.is_done);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-gray-800 dark:text-white leading-none">Reminder & Todo</h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{todo.length} aktif · {done.length} selesai</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                        showForm
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                    }`}
                >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showForm ? "rotate-45" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {showForm ? "Tutup" : "Tambah"}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="px-5 py-4 bg-blue-50/40 dark:bg-blue-900/10 border-b border-blue-100 dark:border-gray-700 space-y-3">
                    <input type="text" placeholder="Apa yang ingin kamu lakukan?"
                        value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-400 transition"
                    />
                    <textarea placeholder="Catatan tambahan (opsional)..."
                        value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-400 transition resize-none"
                    />
                    <input type="datetime-local" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-400 transition"
                    />
                    <button onClick={handleAdd} disabled={saving || !form.title.trim()}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
                        {saving ? "Menyimpan..." : "Simpan Reminder"}
                    </button>
                </div>
            )}

            <div className="px-5 py-4">
                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-6">
                        <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    </div>
                )}

                {/* Empty */}
                {!loading && reminders.length === 0 && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-blue-300 dark:text-blue-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Belum ada reminder</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">Klik tombol Tambah untuk mulai</p>
                    </div>
                )}

                {/* Todo */}
                {todo.length > 0 && (
                    <div className="space-y-2">
                        {todo.map((r) => <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} onDelete={handleDelete} />)}
                    </div>
                )}

                {/* Done */}
                {done.length > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2.5">
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium px-2">Selesai ({done.length})</span>
                            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                        </div>
                        <div className="space-y-2">
                            {done.map((r) => <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} onDelete={handleDelete} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReminderItem({ reminder, onToggle, onDelete }: {
    reminder: Reminder;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}) {
    const formattedTime = reminder.time
        ? new Date(reminder.time).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : null;
    const isOverdue = reminder.time && !reminder.is_done && new Date(reminder.time) < new Date();

    return (
        <div className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 group ${
            reminder.is_done
                ? "opacity-50 bg-gray-50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700/50"
                : isOverdue
                    ? "bg-red-50/40 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                    : "bg-gray-50 dark:bg-gray-700/40 border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
        }`}>
            <button onClick={() => onToggle(reminder.id)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                    reminder.is_done ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-gray-500 hover:border-blue-400"
                }`}>
                {reminder.is_done && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${reminder.is_done ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-200"}`}>
                    {reminder.title}
                </p>
                {reminder.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{reminder.note}</p>}
                {formattedTime && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400 dark:text-gray-500"}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                        </svg>
                        {isOverdue && <span>⚠️ Terlambat ·</span>}
                        <span>{formattedTime}</span>
                    </div>
                )}
            </div>

            <button onClick={() => onDelete(reminder.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400 transition-all duration-200 shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
}

export default ProfileReminders;