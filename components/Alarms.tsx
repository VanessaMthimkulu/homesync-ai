import React, { useState, useEffect } from 'react';
import { Alarm } from '../types';

interface AlarmsProps {
    alarms: Alarm[];
    toggleAlarm: (alarmId: number) => void;
    addAlarm: (alarmData: Omit<Alarm, 'id' | 'enabled' | 'ringing'>) => void;
    editAlarm: (alarm: Alarm) => void;
    deleteAlarm: (alarmId: number) => void;
    dismissAlarm: (alarmId: number) => void;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const AlarmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (alarmData: Omit<Alarm, 'id' | 'enabled' | 'ringing'> | Alarm) => void;
    alarmToEdit: Alarm | null;
}> = ({ isOpen, onClose, onSave, alarmToEdit }) => {
    const [time, setTime] = useState('07:30');
    const [label, setLabel] = useState('');
    const [days, setDays] = useState<string[]>([]);

    useEffect(() => {
        if (alarmToEdit) {
            setTime(alarmToEdit.time);
            setLabel(alarmToEdit.label);
            setDays(alarmToEdit.days || []);
        } else {
            setTime('07:30');
            setLabel('');
            setDays([]);
        }
    }, [alarmToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDayChange = (day: string) => {
        setDays(prev => 
            prev.includes(day) 
            ? prev.filter(d => d !== day) 
            : [...prev, day]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim()) return;

        if (alarmToEdit) {
            onSave({ ...alarmToEdit, time, label, days });
        } else {
            onSave({ time, label, days });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{alarmToEdit ? 'Edit Alarm' : 'Add New Alarm'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-slate-700">Time</label>
                            <input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div>
                            <label htmlFor="label" className="block text-sm font-medium text-slate-700">Label</label>
                            <input id="label" type="text" value={label} onChange={e => setLabel(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" required placeholder="e.g., Wake up" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Repeat</label>
                            <div className="mt-2 grid grid-cols-4 sm:grid-cols-7 gap-2">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => handleDayChange(day)}
                                        className={`px-2 py-2 text-sm font-semibold rounded-md transition-colors text-center ${
                                            days.includes(day)
                                            ? 'bg-sky-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">{alarmToEdit ? 'Save Changes' : 'Add Alarm'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const formatRepeatDays = (days?: string[]): string => {
    if (!days || days.length === 0) {
        return 'One-time';
    }
    if (days.length === 7) {
        return 'Every day';
    }
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const isWeekdays = weekdays.every(d => days.includes(d)) && days.length === 5;
    if (isWeekdays) {
        return 'Weekdays';
    }
    
    const sortedDays = DAYS_OF_WEEK.filter(day => days.includes(day));

    return sortedDays.map(d => d.substring(0, 3)).join(', ');
};

export const Alarms: React.FC<AlarmsProps> = ({ alarms, toggleAlarm, addAlarm, editAlarm, deleteAlarm, dismissAlarm }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [alarmToEdit, setAlarmToEdit] = useState<Alarm | null>(null);

    const handleOpenAddModal = () => {
        setAlarmToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (alarm: Alarm) => {
        setAlarmToEdit(alarm);
        setIsModalOpen(true);
    };

    const handleDeleteAlarm = (alarmId: number) => {
        deleteAlarm(alarmId);
    };

    const handleSaveAlarm = (alarmData: Omit<Alarm, 'id' | 'enabled' | 'ringing'> | Alarm) => {
        if ('id' in alarmData) {
            editAlarm(alarmData as Alarm);
        } else {
            addAlarm(alarmData);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Alarms</h2>
            <ul className="space-y-3">
                {alarms.map(alarm => {
                    const isRinging = !!alarm.ringing;
                    return (
                        <li key={alarm.id} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                            isRinging ? 'bg-red-100 border border-red-300 animate-pulse' : 'bg-slate-100'
                        }`}>
                            <div>
                                <span className={`font-mono text-2xl ${isRinging ? 'text-red-800' : (alarm.enabled ? 'text-slate-800' : 'text-slate-400')}`}>{alarm.time}</span>
                                <p className={`${isRinging ? 'text-red-700 font-semibold' : (alarm.enabled ? 'text-slate-600' : 'text-slate-400')}`}>{alarm.label}</p>
                                <p className={`text-xs mt-1 ${isRinging ? 'text-red-600' : (alarm.enabled ? 'text-slate-500' : 'text-slate-400')}`}>
                                    {formatRepeatDays(alarm.days)}
                                </p>
                            </div>
                            
                            {!isRinging && (
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => handleOpenEditModal(alarm)} className="p-2 text-slate-500 hover:text-sky-600 rounded-full hover:bg-slate-200" aria-label="Edit alarm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                                    <button onClick={() => handleDeleteAlarm(alarm.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-200" aria-label="Delete alarm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                    <div
                                        onClick={() => toggleAlarm(alarm.id)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer transition-colors ${
                                            alarm.enabled ? 'bg-green-500' : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                alarm.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </div>
                                </div>
                            )}
                        </li>
                    );
                })}
                 {alarms.length === 0 && <p className="text-slate-500 italic text-center py-4">No alarms have been set.</p>}
            </ul>
             <div className="mt-4 pt-4 border-t border-slate-200">
                 <button onClick={handleOpenAddModal} className="w-full bg-sky-600 text-white font-semibold py-2 rounded-md hover:bg-sky-700 transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add New Alarm
                </button>
             </div>
             <AlarmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveAlarm}
                alarmToEdit={alarmToEdit}
            />
        </div>
    );
};