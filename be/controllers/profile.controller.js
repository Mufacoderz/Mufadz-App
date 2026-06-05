import db from "../config/db.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.query(
            "SELECT id, username, email, created_at FROM users WHERE id = ?",
            [userId]
        );

        const user = rows[0];

        res.json({
            message: "Profile berhasil diambil",
            data: user,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
