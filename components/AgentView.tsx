import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';

interface AgentViewProps {
    chatHistory: ChatMessage[];
    onCommand: (command: string) => void;
    isProcessing: boolean;
    currentUser: User;
    isListening: boolean;
    startListening: () => void;
}

const ChatBubble: React.FC<{ message: ChatMessage; currentUser: User; }> = ({ message, currentUser }) => {
    const isUser = message.sender === 'user';
    const avatar = isUser ? currentUser.avatar : 'https://i.pravatar.cc/150?u=ai-assistant';
    const name = isUser ? currentUser.name : 'HomeSync AI';
    const alignment = isUser ? 'items-end' : 'items-start';
    const bubbleColor = isUser ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800';
    
    return (
        <div className={`flex flex-col ${alignment} mb-4`}>
            <div className={`flex items-start ${isUser ? 'flex-row-reverse' : ''}`}>
                <img src={avatar} alt={name} className="w-8 h-8 rounded-full border-2 border-slate-300" />
                <div className={`mx-3 p-3 rounded-xl max-w-lg ${bubbleColor}`}>
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                </div>
            </div>
            <span className={`text-xs text-slate-500 mt-1 ${isUser ? 'mr-12' : 'ml-12'}`}>{name}</span>
        </div>
    );
};

export const AgentView: React.FC<AgentViewProps> = ({ chatHistory, onCommand, isProcessing, currentUser, isListening, startListening }) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isProcessing || isListening) return;
        onCommand(input);
        setInput('');
    };
    
    const placeholder = isListening ? "Listening..." : "Type or click the mic to speak...";

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
            <div className="flex-1 p-6 overflow-y-auto">
                {chatHistory.map(msg => (
                    <ChatBubble key={msg.id} message={msg} currentUser={currentUser} />
                ))}
                {isProcessing && (
                    <div className="flex items-start">
                         <img src="https://i.pravatar.cc/150?u=ai-assistant" alt="HomeSync AI" className="w-8 h-8 rounded-full border-2 border-slate-300" />
                         <div className="mx-3 p-3 rounded-xl bg-slate-200 text-slate-800">
                             <div className="flex items-center space-x-1">
                                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></span>
                            </div>
                         </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200">
                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex items-center space-x-3">
                        <div className="relative flex-grow">
                                <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={placeholder}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 pr-12 transition-colors border-slate-300 disabled:bg-slate-50"
                                disabled={isProcessing || isListening}
                            />
                                <button
                                type="button"
                                onClick={startListening}
                                disabled={isProcessing || isListening}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors duration-200 disabled:opacity-50 bg-transparent text-slate-500 hover:bg-slate-100`}
                                aria-label={'Start voice input'}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/><path d="M12 17c-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2c0 2.76-2.24 5-5 5z"/></svg>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={isProcessing || !input.trim() || isListening}
                            className="bg-sky-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};