import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Multer setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Hanya file gambar yang diizinkan"));
    },
});

// GET /api/profile
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, email, name, role, bio, profile_image, created_at FROM users WHERE id = ?",
            [req.user.id]
        );
        if (!rows.length) return res.status(404).json({ message: "User tidak ditemukan" });
        res.json({ data: rows[0] });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// PUT /api/profile
router.put("/", async (req, res) => {
    const { name, bio } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Nama tidak boleh kosong" });

    try {
        await db.query(
            "UPDATE users SET name = ?, bio = ? WHERE id = ?",
            [name.trim(), bio || null, req.user.id]
        );
        res.json({ message: "Profil berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// PUT /api/profile/password
router.put("/password", async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
        return res.status(400).json({ message: "Semua field wajib diisi" });
    if (newPassword.length < 6)
        return res.status(400).json({ message: "Password minimal 6 karakter" });

    try {
        const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
        if (!rows.length) return res.status(404).json({ message: "User tidak ditemukan" });

        const match = await bcrypt.compare(currentPassword, rows[0].password);
        if (!match) return res.status(400).json({ message: "Password saat ini salah" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
        res.json({ message: "Password berhasil diubah" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// POST /api/profile/avatar
router.post("/avatar", upload.single("avatar"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "File tidak ditemukan" });

    try {
        const [rows] = await db.query("SELECT profile_image FROM users WHERE id = ?", [req.user.id]);
        if (rows[0]?.profile_image) {
            const oldPath = path.join(__dirname, "../uploads", rows[0].profile_image);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const filename = req.file.filename;
        await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [filename, req.user.id]);
        res.json({ message: "Foto berhasil diupload", profile_image: filename });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;