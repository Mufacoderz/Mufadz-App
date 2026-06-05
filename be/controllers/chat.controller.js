import db from "../config/db.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang membantu dan berpengetahuan luas bernama "Mufadz Assistant".
Kamu memahami ajaran Islam dengan baik dan bisa menjawab pertanyaan seputar Al-Quran, hadits, fiqih, doa, 
dan kehidupan sehari-hari dari perspektif Islam. Untuk topik umum, kamu tetap membantu dengan bijak dan santun.
Jawab selalu dalam bahasa yang sama dengan pertanyaan user. Gunakan bahasa yang hangat, ramah, dan mudah dipahami.`;

// Get istory
const getChatHistory = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            `SELECT role, content, created_at 
       FROM chat_messages 
       WHERE user_id = ? AND conversation_id = ?
       ORDER BY created_at ASC
       LIMIT 50`,
            [userId, conversationId],
        );
        res.json({ success: true, messages: rows });
    } catch (error) {
        console.error("getChatHistory error:", error);
        res
            .status(500)
            .json({ success: false, message: "Gagal mengambil history chat" });
    }
};

// GET /api/chat/conversations
const getConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await db.query(
            `SELECT 
            conversation_id,
            MIN(created_at) as started_at,
            COUNT(*) as message_count,
            (SELECT content FROM chat_messages cm2 
            WHERE cm2.conversation_id = cm.conversation_id 
            AND cm2.user_id = ? AND cm2.role = 'user'
            ORDER BY created_at ASC LIMIT 1) as first_message
            FROM chat_messages cm
            WHERE user_id = ?
            GROUP BY conversation_id
            ORDER BY started_at DESC
            LIMIT 20`,
            [userId, userId],
        );
        res.json({ success: true, conversations: rows });
    } catch (error) {
        console.error("getConversations error:", error);
        res
            .status(500)
            .json({ success: false, message: "Gagal mengambil daftar percakapan" });
    }
};

// POST /api/chat
const sendMessage = async (req, res) => {
    const { message, conversationId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
        return res
            .status(400)
            .json({ success: false, message: "Pesan tidak boleh kosong" });
    }

    if (!conversationId) {
        return res
            .status(400)
            .json({ success: false, message: "conversationId diperlukan" });
    }

    try {
        // Ambil history percakapan dari DB
        const [historyRows] = await db.query(
            `SELECT role, content FROM chat_messages 
       WHERE user_id = ? AND conversation_id = ?
       ORDER BY created_at ASC
       LIMIT 20`,
            [userId, conversationId],
        );

        // Build messages untuk Groq (format: {role, content})
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...historyRows.map((row) => ({
                role: row.role === "assistant" ? "assistant" : "user",
                content: row.content,
            })),
            { role: "user", content: message.trim() },
        ];

        // Kirim ke Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages,
            max_tokens: 1024,
        });

        const aiResponse = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons.';

        // Simpan pesan user & AI ke DB
        await db.query(
            `INSERT INTO chat_messages (user_id, conversation_id, role, content) VALUES (?, ?, 'user', ?)`,
            [userId, conversationId, message.trim()],
        );
        await db.query(
            `INSERT INTO chat_messages (user_id, conversation_id, role, content) VALUES (?, ?, 'assistant', ?)`,
            [userId, conversationId, aiResponse],
        );

        res.json({ success: true, reply: aiResponse });
    } catch (error) {
        console.error("sendMessage error:", error);

        // Handle Groq rate limit (429)
        if (
            error.status === 429 ||
            (error.message && error.message.includes("429"))
        ) {
            return res.status(429).json({
                success: false,
                message: "RATE_LIMIT",
            });
        }

        res
            .status(500)
            .json({ success: false, message: "Terjadi kesalahan pada server" });
    }
};

// DELETE /api/chat/conversations/:conversationId
const deleteConversation = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.user.id;

    try {
        await db.query(
            `DELETE FROM chat_messages WHERE user_id = ? AND conversation_id = ?`,
            [userId, conversationId],
        );
        res.json({ success: true, message: "Percakapan berhasil dihapus" });
    } catch (error) {
        console.error("deleteConversation error:", error);
        res
            .status(500)
            .json({ success: false, message: "Gagal menghapus percakapan" });
    }
};

export { sendMessage, getChatHistory, getConversations, deleteConversation };
