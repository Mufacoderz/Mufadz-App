import React from 'react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
                        : 'bg-gradient-to-br from-blue-400 to-cyan-300 text-white'
                    }`}
            >
                {isUser ? '👤' : '✦'}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-gray-700'
                    }`}
            >
                {content}
            </div>
        </div>
    );
};

export default ChatMessage;