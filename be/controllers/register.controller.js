import db from "../config/db.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Field tidak lengkap" });
        }

        const [cek] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (cek.length > 0) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        const hash = await bcrypt.hash(password, 10);

        // role otomatis user
        await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hash, "user"]
        );

        res.status(201).json({ message: "Register berhasil" });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: "Server error" });
    }
};
