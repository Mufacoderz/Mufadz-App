import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.route.js";
import adminRoute from "./routes/admin.route.js";
import reminderRoutes from "./routes/reminders.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import chatRoute from './routes/chat.route.js';

const app = express();
const PORT = 5050;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());



// Static folder untuk foto profil
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("SERVER OK");
});

app.use('/api/chat', chatRoute);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoute);


// Protected routes (butuh token)
app.use("/api/profile", authMiddleware, profileRoutes);
app.use("/api/reminders", authMiddleware, reminderRoutes);

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});