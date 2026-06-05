import db from "../config/db.js";
import bcrypt from "bcrypt";

// GET semua user
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, profile_image, bio, created_at FROM users ORDER BY created_at DESC"
        );
        res.json({ data: rows });
    } catch (err) {
        console.error("getAllUsers ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// GET user by id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            "SELECT id, name, email, role, profile_image, bio, created_at FROM users WHERE id = ?",
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });
        res.json({ data: rows[0] });
    } catch (err) {
        console.error("getUserById ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// POST buat user baru
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Field tidak lengkap" });
        }

        const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const userRole = role === "admin" ? "admin" : "user";

        const [result] = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashed, userRole]
        );

        res.status(201).json({
            message: "User berhasil dibuat",
            data: { id: result.insertId, name, email, role: userRole }
        });
    } catch (err) {
        console.error("createUser ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// PUT update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;

        const [existing] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
        if (existing.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        if (password && password.trim() !== "") {
            const hashed = await bcrypt.hash(password, 10);
            await db.query(
                "UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?",
                [name, email, role, hashed, id]
            );
        } else {
            await db.query(
                "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
                [name, email, role, id]
            );
        }

        res.json({ message: "User berhasil diupdate" });
    } catch (err) {
        console.error("updateUser ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// DELETE user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Jangan hapus diri sendiri
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "Tidak bisa menghapus akun sendiri" });
        }

        const [existing] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
        if (existing.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        await db.query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "User berhasil dihapus" });
    } catch (err) {
        console.error("deleteUser ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};