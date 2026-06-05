import { API_BASE_URL } from "../config/api";

function getToken() {
    return localStorage.getItem("token") || "";
}

function authHeaders() {
    return {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    };
}

// GET /api/profile
export async function fetchProfile() {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil data profil");
    return res.json();
}

// PUT /api/profile
export async function updateProfile(data: { name: string; bio: string }) {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal memperbarui profil");
    return res.json();
}

// PUT /api/profile/password
export async function updatePassword(data: {
    currentPassword: string;
    newPassword: string;
}) {
    const res = await fetch(`${API_BASE_URL}/api/profile/password`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengganti password");
    }
    return res.json();
}

// POST /api/profile/avatar
export async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
    });
    if (!res.ok) throw new Error("Gagal mengupload foto");
    return res.json();
}

// GET /api/reminders
export async function fetchReminders() {
    const res = await fetch(`${API_BASE_URL}/api/reminders`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengambil reminder");
    return res.json();
}

// POST /api/reminders
export async function createReminder(data: { title: string; note?: string; time?: string }) {
    const res = await fetch(`${API_BASE_URL}/api/reminders`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Gagal membuat reminder");
    return res.json();
}

// PATCH /api/reminders/:id/toggle
export async function toggleReminder(id: number) {
    const res = await fetch(`${API_BASE_URL}/api/reminders/${id}/toggle`, {
        method: "PATCH",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Gagal mengupdate reminder");
    return res.json();
}

// DELETE /api/reminders/:id
export async function deleteReminder(id: number) {
    const res = await fetch(`${API_BASE_URL}/api/reminders/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Gagal menghapus reminder");
    return res.json();
}
