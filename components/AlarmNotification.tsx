import React, { useEffect, useRef } from 'react';
import { Alarm } from '../types';

interface AlarmNotificationProps {
    alarm: Alarm;
    onDismiss: (alarmId: number) => void;
}

export const AlarmNotification: React.FC<AlarmNotificationProps> = ({ alarm, onDismiss }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Play sound when component mounts
        audioRef.current?.play().catch(e => console.error("Error playing alarm sound:", e));
        
        // Cleanup: pause sound when component unmounts
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm text-center transform transition-all animate-fade-in-up">
                <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-800">{alarm.time}</h2>
                <p className="text-lg text-slate-600 mt-2 mb-6">{alarm.label}</p>
                <button
                    onClick={() => onDismiss(alarm.id)}
                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors text-lg focus:outline-none focus:ring-4 focus:ring-red-300"
                    aria-label={`Dismiss alarm for ${alarm.label}`}
                >
                    Dismiss
                </button>
            </div>
            <audio ref={audioRef} src="https://cdn.jsdelivr.net/npm/ion-sound@3.0.7/sounds/bell_ring.mp3" loop preload="auto" />
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};