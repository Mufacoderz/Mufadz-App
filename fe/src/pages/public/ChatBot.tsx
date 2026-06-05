import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from '../../components/public/Chatbot/ChatMessage';
import ChatInput from '../../components/public/Chatbot/ChatInput';
import {
    sendMessage as apiSendMessage,
    getChatHistory,
    getConversations,
    deleteConversation,
} from '../../services/chatService';
import type { Message, Conversation } from '../../services/chatService';

const RATE_LIMIT_MSG =
    'Chatbot sedang istirahat sejenak karena batas harian telah tercapai 🌙\nSilakan coba lagi besok ya!';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConvId, setActiveConvId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Scroll ke bawah setiap ada pesan baru
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load daftar percakapan saat mount
    useEffect(() => {
        loadConversations();
        startNewConversation();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch {
            // silent fail
        }
    };

    const startNewConversation = () => {
        const newId = uuidv4();
        setActiveConvId(newId);
        setMessages([
            {
                role: 'assistant',
                content:
                    'Assalamu\'alaikum! 👋 Aku Mufadz Assistant, siap membantu kamu.\n\nKamu bisa tanya seputar Al-Quran, hadits, doa, atau topik umum lainnya. Ada yang bisa aku bantu?',
            },
        ]);
        setIsRateLimited(false);
    };

    const loadHistory = async (convId: string) => {
        try {
            const data = await getChatHistory(convId);
            setActiveConvId(convId);
            setMessages(data);
            setIsRateLimited(false);
            setSidebarOpen(false);
        } catch {
            // silent fail
        }
    };

    const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteConversation(convId);
            setConversations((prev) => prev.filter((c) => c.conversation_id !== convId));
            if (activeConvId === convId) startNewConversation();
        } catch {
            // silent fail
        }
    };

    const handleSend = useCallback(
        async (text: string) => {
            if (isRateLimited) return;

            const userMsg: Message = { role: 'user', content: text };
            setMessages((prev) => [...prev, userMsg]);
            setLoading(true);

            try {
                const data = await apiSendMessage(text, activeConvId);
                const aiMsg: Message = { role: 'assistant', content: data.reply };
                setMessages((prev) => [...prev, aiMsg]);
                loadConversations(); // refresh sidebar
            } catch (err) {
                const error = err as AxiosError<{ message: string }>;
                const status = error?.response?.status;
                const isLimit =
                    status === 429 || error?.response?.data?.message === 'RATE_LIMIT';

                if (isLimit) {
                    setIsRateLimited(true);
                    setMessages((prev) => [
                        ...prev,
                        { role: 'assistant', content: RATE_LIMIT_MSG },
                    ]);
                } else {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: 'assistant',
                            content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                        },
                    ]);
                }
            } finally {
                setLoading(false);
            }
        },
        [activeConvId, isRateLimited]
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
            {/* ── SIDEBAR ── */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Sidebar Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg text-white font-bold">
                            ✦
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">Mufadz Assistant</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">AI Islami & Umum</p>
                        </div>
                    </div>
                    <button
                        onClick={startNewConversation}
                        className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <span>+</span> Percakapan Baru
                    </button>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {conversations.length === 0 ? (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6">Belum ada percakapan</p>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.conversation_id}
                                onClick={() => loadHistory(conv.conversation_id)}
                                className={`group flex items-start justify-between p-3 rounded-xl cursor-pointer transition-colors ${activeConvId === conv.conversation_id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {conv.first_message || 'Percakapan baru'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                        {formatDate(conv.started_at)} · {conv.message_count} pesan
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteConversation(conv.conversation_id, e)}
                                    className="opacity-0 group-hover:opacity-100 ml-2 text-gray-300 dark:text-gray-600 hover:text-red-400 transition-all text-xs mt-0.5"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── MAIN CHAT ── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <button
                        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-base text-white font-bold">
                        ✦
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Mufadz Assistant</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {loading ? (
                                <span className="text-blue-500 dark:text-blue-400 animate-pulse">Sedang mengetik...</span>
                            ) : (
                                'Online · Siap membantu'
                            )}
                        </p>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-2xl mx-auto w-full">
                        {messages.map((msg, i) => (
                            <ChatMessage key={i} role={msg.role} content={msg.content} />
                        ))}

                        {/* Loading bubble */}
                        {loading && (
                            <div className="flex items-end gap-2 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm text-white font-bold">
                                    ✦
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1 items-center h-4">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Rate limit banner */}
                {isRateLimited && (
                    <div className="mx-4 mb-3">
                        <div className="max-w-2xl mx-auto bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 text-amber-600 dark:text-amber-400 text-sm text-center">
                            🌙 Batas harian tercapai. Chatbot akan kembali besok.
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="px-4 pb-5 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="max-w-2xl mx-auto">
                        <ChatInput onSend={handleSend} disabled={loading || isRateLimited} />
                        <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                            Powered by GROQ · Respons AI dapat keliru, verifikasi info penting
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Chatbot;