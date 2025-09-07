import React, { useEffect, useRef } from 'react';
import { Timer } from '../types';

interface TimerNotificationProps {
    timer: Timer;
    onDismiss: (timerId: number) => void;
}

export const TimerNotification: React.FC<TimerNotificationProps> = ({ timer, onDismiss }) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        // Play sound when component mounts
        audioRef.current?.play().catch(e => console.error("Error playing timer sound:", e));
        
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
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Time's Up!</h2>
                <p className="text-lg text-slate-600 mt-2 mb-6">{timer.label}</p>
                <button
                    onClick={() => onDismiss(timer.id)}
                    className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-colors text-lg focus:outline-none focus:ring-4 focus:ring-sky-300"
                    aria-label={`Dismiss timer for ${timer.label}`}
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