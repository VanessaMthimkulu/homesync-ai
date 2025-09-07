import React, { useState } from 'react';
import { Timer } from '../types';

interface TimersProps {
    timers: Timer[];
    addTimer: (label: string, duration: number) => void;
    resetTimer: (timerId: number) => void;
    dismissTimer: (timerId: number) => void;
}

export const Timers: React.FC<TimersProps> = ({ timers, addTimer: addTimerProp, resetTimer }) => {
    const [newTimerLabel, setNewTimerLabel] = useState('');
    const [newTimerDuration, setNewTimerDuration] = useState(300); // Default 5 minutes

    const handleAddTimerClick = () => {
        if (!newTimerLabel.trim() || newTimerDuration <= 0) return;
        addTimerProp(newTimerLabel.trim(), newTimerDuration);
        setNewTimerLabel('');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const activeTimers = timers.filter(t => !t.finished);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Timers</h2>
            <div className="space-y-3">
                {activeTimers.map(timer => (
                    <div key={timer.id} className="flex justify-between items-center bg-slate-100 p-3 rounded-lg">
                        <span className="font-medium text-slate-700">{timer.label}</span>
                         <div className="flex items-center gap-2">
                            <span className="font-mono text-lg text-slate-800 bg-slate-200 px-2 py-1 rounded">{formatTime(timer.remaining)}</span>
                            <button onClick={() => resetTimer(timer.id)} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-200 rounded-full" aria-label="Reset timer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>
                            </button>
                        </div>
                    </div>
                ))}
                 {timers.length === 0 && <p className="text-slate-500 italic text-center py-2">No active timers.</p>}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                 <input type="text" value={newTimerLabel} onChange={e => setNewTimerLabel(e.target.value)} placeholder="Timer Label (e.g., Pasta)" className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                 <input type="number" value={newTimerDuration} onChange={e => setNewTimerDuration(Number(e.target.value))} placeholder="Duration (seconds)" className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"/>
                 <button onClick={handleAddTimerClick} disabled={!newTimerLabel.trim()} className="w-full bg-sky-600 text-white font-semibold py-2 rounded-md hover:bg-sky-700 transition-colors disabled:bg-sky-300">Add Timer</button>
            </div>
        </div>
    );
};