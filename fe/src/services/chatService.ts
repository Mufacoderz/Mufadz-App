import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
}

export interface Conversation {
    conversation_id: string;
    started_at: string;
    message_count: number;
    first_message: string;
}

export const sendMessage = async (message: string, conversationId: string) => {
    const res = await axios.post(
        `${API_BASE_URL}/api/chat`,
        { message, conversationId },
        { headers: getAuthHeader() }
    );
    return res.data;
};

export const getChatHistory = async (conversationId: string): Promise<Message[]> => {
    const res = await axios.get(`${API_BASE_URL}/api/chat/history/${conversationId}`, {
        headers: getAuthHeader(),
    });
    return res.data.messages;
};

export const getConversations = async (): Promise<Conversation[]> => {
    const res = await axios.get(`${API_BASE_URL}/api/chat/conversations`, {
        headers: getAuthHeader(),
    });
    return res.data.conversations;
};

export const deleteConversation = async (conversationId: string) => {
    const res = await axios.delete(`${API_BASE_URL}/api/chat/conversations/${conversationId}`, {
        headers: getAuthHeader(),
    });
    return res.data;
};
