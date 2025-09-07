import React, { useEffect, useRef } from 'react';
import { Chore } from '../types';

interface EventNotificationProps {
    chore: Chore;
    onDismiss: (choreId: number) => void;
}

export const EventNotification: React.FC<EventNotificationProps> = ({ chore, onDismiss }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        audioRef.current?.play().catch(e => console.error("Error playing event sound:", e));
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    const formatDueDate = (dueDate: string | undefined) => {
        if (!dueDate) return 'No due date';
        const date = new Date(dueDate.replace(/-/g, '\/'));
        return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Reminder</h2>
                <p className="text-lg text-slate-600 mt-2">{chore.task}</p>
                <p className="text-sm text-slate-500 mt-1 mb-6">Due: {formatDueDate(chore.dueDate)}</p>
                <button
                    onClick={() => onDismiss(chore.id)}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label={`Dismiss reminder for ${chore.task}`}
                >
                    Dismiss
                </button>
            </div>
            <audio ref={audioRef} src="https://cdn.jsdelivr.net/npm/ion-sound@3.0.7/sounds/bell_ring.mp3" preload="auto" />
             <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};