import React, { useState, useMemo, useEffect } from 'react';
import { Chore, User, Priority, RecurrenceRule } from '../types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Converts a Date object to a 'YYYY-MM-DD' string in the local timezone.
 * This avoids timezone conversion errors from methods like `toISOString`.
 * @param date The date to convert.
 * @returns The formatted date string.
 */
const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const ChoreModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'> | Chore) => void;
    onDelete: (choreId: number) => void;
    users: User[];
    choreToEdit: Chore | null;
    defaultDate?: string; // YYYY-MM-DD
}> = ({ isOpen, onClose, onSave, onDelete, users, choreToEdit, defaultDate }) => {
    const [task, setTask] = useState('');
    const [assigneeIds, setAssigneeIds] = useState<number[]>([users[0]?.id || 1]);
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [dueDate, setDueDate] = useState('');
    const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>(undefined);
    const [repeatForever, setRepeatForever] = useState(true);
    const [notificationDateTime, setNotificationDateTime] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (choreToEdit) {
            setTask(choreToEdit.task);
            setAssigneeIds(choreToEdit.assigneeIds);
            setPriority(choreToEdit.priority);
            setDueDate(choreToEdit.dueDate || '');
            setRecurrence(choreToEdit.recurrence);
            setRepeatForever(!choreToEdit.recurrence?.until);
            setNotificationDateTime(choreToEdit.notificationDateTime);
        } else {
            setTask('');
            setAssigneeIds([users[0]?.id || 1]);
            setPriority(Priority.MEDIUM);
            setDueDate(defaultDate || '');
            setRecurrence(undefined);
            setRepeatForever(true);
            setNotificationDateTime(undefined);
        }
    }, [choreToEdit, isOpen, users, defaultDate]);

    if (!isOpen) return null;
    
    const handleAssigneeChange = (id: number) => {
        setAssigneeIds(prev => 
            prev.includes(id) 
            ? prev.filter(userId => userId !== id) 
            : [...prev, id]
        );
    };

    const handleRecurrenceChange = <K extends keyof RecurrenceRule>(key: K, value: RecurrenceRule[K]) => {
        setRecurrence(prev => {
            const newRec: RecurrenceRule = { ...prev, frequency: prev?.frequency || 'daily', [key]: value };
            if (key === 'frequency' && value === 'weekly' && !newRec.byday?.length) {
                const dayOfWeek = DAYS_OF_WEEK[new Date(dueDate.replace(/-/g, '\/')).getDay()];
                newRec.byday = [dayOfWeek];
            } else if (key === 'frequency' && value !== 'weekly') {
                delete newRec.byday;
            }
            if(repeatForever) delete newRec.until;
            return newRec;
        });
    };
    
    const toggleWeekDay = (day: string) => {
        const byday = recurrence?.byday || [];
        const newByday = byday.includes(day) ? byday.filter(d => d !== day) : [...byday, day];
        if (newByday.length > 0) {
            handleRecurrenceChange('byday', newByday);
        }
    };

    const handleFrequencySelect = (freq: RecurrenceRule['frequency'] | 'none') => {
        if (freq === 'none') {
            setRecurrence(undefined);
        } else {
            handleRecurrenceChange('frequency', freq);
        }
    };
    
    const handleRepeatForeverToggle = () => {
        setRepeatForever(prev => {
            if (!prev) { // If it's being turned ON
                setRecurrence(currentRec => {
                    if (!currentRec) return undefined;
                    const { until, ...rest } = currentRec;
                    return rest;
                });
            }
            return !prev;
        });
    };

    const handleNotificationToggle = (enabled: boolean) => {
        if (enabled) {
            // Default to one hour before the due date, or one hour from now if no due date
            const baseDate = dueDate ? new Date(`${dueDate}T09:00:00`) : new Date();
            const defaultNotificationTime = new Date(baseDate.getTime() - 60 * 60 * 1000);
            
            // Format for datetime-local input: YYYY-MM-DDTHH:mm
            const year = defaultNotificationTime.getFullYear();
            const month = (defaultNotificationTime.getMonth() + 1).toString().padStart(2, '0');
            const day = defaultNotificationTime.getDate().toString().padStart(2, '0');
            const hours = defaultNotificationTime.getHours().toString().padStart(2, '0');
            const minutes = defaultNotificationTime.getMinutes().toString().padStart(2, '0');
            setNotificationDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
            setNotificationDateTime(undefined);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!task.trim() || assigneeIds.length === 0) return;

        const choreData = { task, assigneeIds, priority, dueDate: dueDate || undefined, recurrence, notificationDateTime };
        if (choreToEdit) {
            onSave({ ...choreToEdit, ...choreData });
        } else {
            onSave(choreData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (choreToEdit) {
            onDelete(choreToEdit.id);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-bold mb-4">{choreToEdit ? 'Edit Event' : 'Add Event'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="task" className="block text-sm font-medium text-slate-700">Event</label>
                            <input id="task" type="text" value={task} onChange={e => setTask(e.target.value)} className="input" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assign To</label>
                            <div className="mt-2 grid grid-cols-2 gap-2 max-h-24 overflow-y-auto border p-2 rounded-md">
                                {users.map(user => (
                                    <label key={user.id} className="flex items-center space-x-2 p-1 rounded-md hover:bg-slate-50 cursor-pointer">
                                        <input type="checkbox" checked={assigneeIds.includes(user.id)} onChange={() => handleAssigneeChange(user.id)} className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500" />
                                        <span className="text-slate-800">{user.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="input bg-white text-slate-900">
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">{recurrence ? 'Start Date' : 'Date'}</label>
                            <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input" required/>
                        </div>

                        <div className="pt-2">
                             <label htmlFor="frequency" className="block text-sm font-medium text-slate-700">Repeat</label>
                             <select id="frequency" value={recurrence?.frequency || 'none'} onChange={e => handleFrequencySelect(e.target.value as any)} className="input bg-white text-slate-900">
                                <option value="none">Does not repeat</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>

                        {recurrence?.frequency === 'weekly' && (
                             <div className="pt-2">
                                <label className="block text-sm font-medium text-slate-700">Repeat on</label>
                                <div className="mt-2 grid grid-cols-4 sm:grid-cols-7 gap-2">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button key={day} type="button" onClick={() => toggleWeekDay(day)}
                                            className={`px-2 py-2 text-sm font-semibold rounded-md transition-colors text-center ${
                                                recurrence.byday?.includes(day) ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}>
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {recurrence && (
                            <div className="pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={repeatForever} onChange={handleRepeatForeverToggle} className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500" />
                                    <span className="text-sm font-medium text-slate-700">Repeat forever</span>
                                </label>
                                {!repeatForever && (
                                    <div className="mt-2">
                                        <label htmlFor="until" className="block text-sm font-medium text-slate-700">Repeat Until</label>
                                        <input id="until" type="date" value={recurrence.until || ''} onChange={e => handleRecurrenceChange('until', e.target.value)} className="input" />
                                    </div>
                                )}
                            </div>
                        )}
                        
                         <div className="pt-2 border-t">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={notificationDateTime !== undefined} 
                                    onChange={(e) => handleNotificationToggle(e.target.checked)}
                                    className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                                />
                                <span className="text-sm font-medium text-slate-700">Set Reminder</span>
                            </label>

                            {notificationDateTime !== undefined && (
                                <div className="mt-2">
                                    <label htmlFor="notification" className="block text-sm font-medium text-slate-700">Notify at</label>
                                    <input
                                        id="notification"
                                        type="datetime-local"
                                        value={notificationDateTime || ''}
                                        onChange={e => setNotificationDateTime(e.target.value)}
                                        className="input"
                                    />
                                </div>
                            )}
                        </div>


                    </div>
                    <div className="mt-6 flex justify-between">
                        <div>
                            {choreToEdit && (
                                <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-sky-300" disabled={assigneeIds.length === 0}>{choreToEdit ? 'Save Changes' : 'Add Event'}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface CalendarViewProps {
    chores: Chore[];
    users: User[];
    addChore: (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'>) => void;
    editChore: (chore: Chore) => void;
    deleteChore: (choreId: number) => void;
}

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case Priority.HIGH: return 'bg-red-500';
        case Priority.MEDIUM: return 'bg-yellow-500';
        case Priority.LOW: return 'bg-green-500';
        default: return 'bg-slate-300';
    }
}

const AvatarStack: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="flex -space-x-1.5 ml-auto flex-shrink-0">
        {users.slice(0, 2).map((user) => (
            <img key={user.id} src={user.avatar} alt={user.name} 
                className="w-4 h-4 rounded-full border border-white"
            />
        ))}
        {users.length > 2 && (
            <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-semibold flex items-center justify-center border border-white">
                +{users.length - 2}
            </div>
        )}
    </div>
);

export const CalendarView: React.FC<CalendarViewProps> = ({ chores, users, addChore, editChore, deleteChore }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);

    const usersById = useMemo(() => new Map(users.map(user => [user.id, user])), [users]);
    
    const choresByDate = useMemo(() => {
        const map = new Map<string, Chore[]>();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);

        chores.forEach(chore => {
            if (!chore.recurrence && chore.dueDate) {
                const choreDate = new Date(chore.dueDate.replace(/-/g, '\/'));
                if (choreDate >= monthStart && choreDate <= monthEnd) {
                    const date = chore.dueDate;
                    if (!map.has(date)) map.set(date, []);
                    map.get(date)!.push(chore);
                }
                return;
            }

            if (chore.recurrence && chore.dueDate) {
                const startDate = new Date(chore.dueDate.replace(/-/g, '\/'));
                const recurrenceUntilDate = chore.recurrence.until ? new Date(chore.recurrence.until.replace(/-/g, '\/')) : monthEnd;
                const loopEndDate = recurrenceUntilDate < monthEnd ? recurrenceUntilDate : monthEnd;
                
                let current = new Date(startDate.getTime());
                while (current <= loopEndDate) {
                    if (current >= monthStart) {
                         const dateString = toYYYYMMDD(current);
                        let shouldAdd = false;

                        switch (chore.recurrence.frequency) {
                            case 'daily': shouldAdd = true; break;
                            case 'weekly':
                                const currentDayName = DAYS_OF_WEEK[current.getDay()];
                                if (chore.recurrence.byday?.includes(currentDayName)) shouldAdd = true;
                                break;
                            case 'monthly':
                                if (current.getDate() === startDate.getDate()) shouldAdd = true;
                                break;
                            case 'yearly':
                                 if (current.getMonth() === startDate.getMonth() && current.getDate() === startDate.getDate()) shouldAdd = true;
                                break;
                        }

                        if (shouldAdd) {
                            if (!map.has(dateString)) map.set(dateString, []);
                            map.get(dateString)!.push({ ...chore, dueDate: dateString });
                        }
                    }
                    
                    switch (chore.recurrence.frequency) {
                         case 'weekly': current.setDate(current.getDate() + 1); break;
                         case 'monthly': current.setMonth(current.getMonth() + 1); break;
                         case 'yearly': current.setFullYear(current.getFullYear() + 1); break;
                         default: current.setDate(current.getDate() + 1); break;
                    }
                }
            }
        });
        return map;
    }, [chores, currentDate]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDayClick = (date: Date) => {
        setSelectedDate(toYYYYMMDD(date));
        setEditingChore(null);
        setIsModalOpen(true);
    };

    const handleChoreClick = (chore: Chore, e: React.MouseEvent) => {
        e.stopPropagation();
        const originalChore = chores.find(c => c.id === chore.id);
        if (originalChore) {
            setEditingChore(originalChore);
            setIsModalOpen(true);
        }
    }
    
    const handleSaveChore = (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'> | Chore) => {
        if ('id' in choreData) {
            editChore(choreData as Chore);
        } else {
            addChore(choreData);
        }
    };

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`prev-${i}`} className="border border-slate-200 bg-slate-50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = toYYYYMMDD(date);
            const isToday = toYYYYMMDD(new Date()) === dateString;
            const dayChores = choresByDate.get(dateString) || [];

            days.push(
                <div key={dateString} onClick={() => handleDayClick(date)} className="border border-slate-200 p-2 flex flex-col cursor-pointer hover:bg-sky-50 transition-colors h-32 overflow-hidden">
                    <span className={`font-semibold ${isToday ? 'bg-sky-600 text-white rounded-full h-7 w-7 flex items-center justify-center' : 'text-slate-700'}`}>{day}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto pr-1 -mr-1">
                        {dayChores.map(chore => {
                            const assignees = chore.assigneeIds.map(id => usersById.get(id)).filter((u): u is User => !!u);
                            return (
                                <div key={`${chore.id}-${chore.dueDate}`} onClick={(e) => handleChoreClick(chore, e)} className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 flex items-center">
                                    <span className={`w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${getPriorityColor(chore.priority)}`}></span>
                                    <span className="truncate">{chore.task}</span>
                                    {assignees.length > 0 && <AvatarStack users={assignees} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        const totalCells = days.length;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < remainingCells; i++) {
            days.push(<div key={`next-${i}`} className="border border-slate-200 bg-slate-50"></div>);
        }
        
        return days;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold text-slate-800">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center font-semibold text-slate-500 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-grow">
                {renderCalendarGrid()}
            </div>
             <ChoreModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveChore}
                onDelete={deleteChore}
                users={users}
                choreToEdit={editingChore}
                defaultDate={selectedDate || undefined}
            />
        </div>
    );
};