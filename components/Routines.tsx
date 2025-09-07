import React, { useState, useEffect } from 'react';
import { Routine } from '../types';

const ICONS: Routine['icon'][] = ['sun', 'home', 'moon', 'default'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RoutineIcon: React.FC<{ icon: Routine['icon'], className?: string }> = ({ icon, className = "h-6 w-6" }) => {
    const icons: { [key in Routine['icon']]: JSX.Element } = {
        sun: <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        home: <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        moon: <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-indigo-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
        default: <svg xmlns="http://www.w3.org/2000/svg" className={`${className} text-slate-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    };
    return icons[icon] || icons.default;
}

const RoutineModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (routineData: Omit<Routine, 'id'> | Routine) => void;
    routineToEdit: Routine | null;
}> = ({ isOpen, onClose, onSave, routineToEdit }) => {
    const [name, setName] = useState('');
    const [steps, setSteps] = useState('');
    const [icon, setIcon] = useState<Routine['icon']>('default');
    const [days, setDays] = useState<string[]>([]);

    useEffect(() => {
        if (routineToEdit) {
            setName(routineToEdit.name);
            setSteps(routineToEdit.steps.join('\n'));
            setIcon(routineToEdit.icon);
            setDays(routineToEdit.days || []);
        } else {
            setName('');
            setSteps('');
            setIcon('default');
            setDays([]);
        }
    }, [routineToEdit, isOpen]);

    if (!isOpen) return null;

    const handleDayChange = (day: string) => {
        setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalSteps = steps.split('\n').map(s => s.trim()).filter(s => s);
        if (!name.trim() || finalSteps.length === 0) return;
        
        const routineData = { name, steps: finalSteps, icon, days };
        if (routineToEdit) {
            onSave({ ...routineToEdit, ...routineData });
        } else {
            onSave(routineData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-bold mb-4">{routineToEdit ? 'Edit Routine' : 'Add New Routine'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Routine Name</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full input" required />
                    </div>
                    <div>
                        <label htmlFor="steps" className="block text-sm font-medium text-slate-700">Steps (one per line)</label>
                        <textarea id="steps" value={steps} onChange={e => setSteps(e.target.value)} className="mt-1 block w-full input h-32" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Icon</label>
                        <div className="mt-2 flex space-x-2">
                            {ICONS.map(iconName => (
                                <button key={iconName} type="button" onClick={() => setIcon(iconName)} className={`p-2 rounded-full transition-colors ${icon === iconName ? 'bg-sky-100 ring-2 ring-sky-500' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                    <RoutineIcon icon={iconName} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Days of the Week</label>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={days.includes(day)} onChange={() => handleDayChange(day)} className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500" />
                                    <span className="text-sm">{day.substring(0,3)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">{routineToEdit ? 'Save Changes' : 'Add Routine'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RoutineCard: React.FC<{ routine: Routine, onEdit: () => void, onDelete: () => void }> = ({ routine, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-full">
            <div className="flex justify-between items-start">
                <div className="flex items-center mb-3">
                    <RoutineIcon icon={routine.icon} className="h-8 w-8" />
                    <h3 className="text-xl font-bold text-slate-800 ml-3">{routine.name}</h3>
                </div>
                 <div className="flex space-x-1">
                    <button onClick={onEdit} className="p-2 text-slate-400 hover:text-sky-600 rounded-full hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                    <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                </div>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 mb-4 flex-grow">
                {routine.steps.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
            <div className="flex flex-wrap gap-1.5 mt-auto">
                {routine.days && routine.days.length > 0 ? routine.days.map(day => (
                    <span key={day} className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{day.substring(0,3)}</span>
                )) : <span className="text-xs italic text-slate-400">Not scheduled</span>}
            </div>
        </div>
    );
};

interface RoutinesProps {
    routines: Routine[];
    addRoutine: (routineData: Omit<Routine, 'id'>) => void;
    editRoutine: (routine: Routine) => void;
    deleteRoutine: (routineId: number) => void;
}

export const Routines: React.FC<RoutinesProps> = ({ routines, addRoutine, editRoutine, deleteRoutine }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

    const handleOpenAddModal = () => {
        setEditingRoutine(null);
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (routine: Routine) => {
        setEditingRoutine(routine);
        setIsModalOpen(true);
    };
    
    const handleDeleteRoutine = (routineId: number) => {
        deleteRoutine(routineId);
    };
    
    const handleSaveRoutine = (routineData: Omit<Routine, 'id'> | Routine) => {
        if ('id' in routineData) {
            editRoutine(routineData as Routine);
        } else {
            addRoutine(routineData);
        }
    };
    
    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Family Routines</h2>
                <button onClick={handleOpenAddModal} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Routine
                </button>
             </div>
             {routines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routines.map(routine => (
                        <RoutineCard key={routine.id} routine={routine} onEdit={() => handleOpenEditModal(routine)} onDelete={() => handleDeleteRoutine(routine.id)}/>
                    ))}
                </div>
             ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <h3 className="text-xl font-semibold text-slate-700">No routines yet!</h3>
                    <p className="text-slate-500 mt-2">Click "Add Routine" to get started.</p>
                </div>
             )}
             <RoutineModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRoutine}
                routineToEdit={editingRoutine}
            />
        </div>
    );
};