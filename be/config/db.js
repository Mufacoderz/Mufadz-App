import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

(async () => {
    try {
        const conn = await db.getConnection();
        console.log("DB berhasil terkoneksi");
        conn.release();
    } catch (err) {
        console.error("DB gagal konek:", err.message);
    }
})();

export default db;