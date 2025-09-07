import React, { useState } from 'react';
import { Chore, User, Priority } from '../types';

interface ChoreChartProps {
    chores: Chore[];
    users: User[];
    currentUser: User;
    addChore: (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'>) => void;
    editChore: (chore: Chore) => void;
    deleteChore: (choreId: number) => void;
    toggleChore: (choreId: number) => void;
}

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case Priority.HIGH: return 'border-red-500';
        case Priority.MEDIUM: return 'border-yellow-500';
        case Priority.LOW: return 'border-green-500';
        default: return 'border-slate-300';
    }
}

const ChoreModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'> | Chore) => void;
    users: User[];
    choreToEdit: Chore | null;
}> = ({ isOpen, onClose, onSave, users, choreToEdit }) => {
    const [task, setTask] = useState('');
    const [assigneeIds, setAssigneeIds] = useState<number[]>([users[0]?.id || 1]);
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
    const [dueDate, setDueDate] = useState('');

    React.useEffect(() => {
        if (choreToEdit) {
            setTask(choreToEdit.task);
            setAssigneeIds(choreToEdit.assigneeIds);
            setPriority(choreToEdit.priority);
            setDueDate(choreToEdit.dueDate || '');
        } else {
            setTask('');
            setAssigneeIds([users[0]?.id || 1]);
            setPriority(Priority.MEDIUM);
            setDueDate('');
        }
    }, [choreToEdit, isOpen, users]);

    if (!isOpen) return null;

    const handleAssigneeChange = (id: number) => {
        setAssigneeIds(prev => 
            prev.includes(id) 
            ? prev.filter(userId => userId !== id) 
            : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!task.trim() || assigneeIds.length === 0) return;

        if (choreToEdit) {
            onSave({ ...choreToEdit, task, assigneeIds, priority, dueDate: dueDate || undefined });
        } else {
            onSave({ task, assigneeIds, priority, dueDate: dueDate || undefined });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{choreToEdit ? 'Edit Chore' : 'Add New Chore'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="task" className="block text-sm font-medium text-slate-700">Task</label>
                            <input id="task" type="text" value={task} onChange={e => setTask(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assign To</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {users.map(user => (
                                    <label key={user.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer">
                                        <input type="checkbox" checked={assigneeIds.includes(user.id)} onChange={() => handleAssigneeChange(user.id)} className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500" />
                                        <span>{user.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-slate-700">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                            <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-sky-300" disabled={assigneeIds.length === 0}>{choreToEdit ? 'Save Changes' : 'Add Chore'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AvatarStack: React.FC<{ users: User[] }> = ({ users }) => (
    <div className="flex -space-x-2">
        {users.slice(0, 3).map((user, index) => (
            <img key={user.id} src={user.avatar} alt={user.name} 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ zIndex: users.length - index }}
            />
        ))}
        {users.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center border-2 border-white" style={{ zIndex: 0 }}>
                +{users.length - 3}
            </div>
        )}
    </div>
);


const ChoreItem: React.FC<{ 
    chore: Chore; 
    assignees: User[]; 
    onToggle: () => void; 
    onEdit: () => void;
    onDelete: () => void;
}> = ({ chore, assignees, onToggle, onEdit, onDelete }) => {
    const isOverdue = chore.dueDate && new Date(chore.dueDate) < new Date() && !chore.completed;

    return (
        <li className={`flex items-center p-4 bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(chore.priority)}`}>
            <input
                type="checkbox"
                checked={chore.completed}
                onChange={onToggle}
                className="h-6 w-6 rounded-md border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer flex-shrink-0"
                aria-label={`Mark ${chore.task} as complete`}
            />
            <div className="flex-grow ml-4">
                <p className={`font-semibold text-slate-800 ${chore.completed ? 'line-through text-slate-400' : ''}`}>
                    {chore.task}
                </p>
                <div className="flex items-center text-sm text-slate-500 space-x-4 mt-1">
                    {assignees.length > 0 && <AvatarStack users={assignees} />}
                    {chore.dueDate && (
                        <div className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             <span>{new Date(chore.dueDate.replace(/-/g, '\/')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                </div>
            </div>
             <div className="flex space-x-2 ml-4">
                <button onClick={onEdit} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-full" aria-label="Edit chore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-full" aria-label="Delete chore"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
            </div>
        </li>
    );
}

export const ChoreChart: React.FC<ChoreChartProps> = ({ chores, users, currentUser, addChore, editChore, deleteChore, toggleChore }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChore, setEditingChore] = useState<Chore | null>(null);

    const usersById = new Map(users.map(user => [user.id, user]));

    const handleOpenAddModal = () => {
        setEditingChore(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (chore: Chore) => {
        setEditingChore(chore);
        setIsModalOpen(true);
    };
    
    const handleDeleteChore = (choreId: number) => {
        deleteChore(choreId);
    }

    const handleSaveChore = (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'> | Chore) => {
        if ('id' in choreData) {
            editChore(choreData as Chore);
        } else {
            addChore(choreData);
        }
    };

    const priorityOrder: { [key in Priority]: number } = {
        [Priority.HIGH]: 0,
        [Priority.MEDIUM]: 1,
        [Priority.LOW]: 2,
    };

    const incompleteChores = chores
        .filter(c => !c.completed)
        .sort((a, b) => {
            const aIsCurrentUser = a.assigneeIds.includes(currentUser.id);
            const bIsCurrentUser = b.assigneeIds.includes(currentUser.id);
            if (aIsCurrentUser && !bIsCurrentUser) return -1;
            if (!aIsCurrentUser && bIsCurrentUser) return 1;

            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;

            return a.id - b.id;
        });
        
    const completedChores = chores
        .filter(c => c.completed)
        .sort((a, b) => {
            if (a.completionDate && b.completionDate) {
                return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
            }
            if (a.completionDate) return -1;
            if (b.completionDate) return 1;
            return b.id - a.id;
        });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-slate-800">Chore Chart</h2>
                 <button onClick={handleOpenAddModal} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors flex items-center">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                     Add Chore
                 </button>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-700 mt-6 border-b pb-2">To-Do</h3>
                {incompleteChores.length > 0 ? (
                    <ul className="space-y-3">
                        {incompleteChores.map(chore => (
                            <ChoreItem key={chore.id} chore={chore} assignees={chore.assigneeIds.map(id => usersById.get(id)).filter((u): u is User => !!u)} onToggle={() => toggleChore(chore.id)} onEdit={() => handleOpenEditModal(chore)} onDelete={() => handleDeleteChore(chore.id)} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 italic p-4 bg-slate-50 rounded-lg">All chores are done. Great job!</p>
                )}

                <h3 className="text-xl font-semibold text-slate-700 mt-8 border-b pb-2">Completed</h3>
                 {completedChores.length > 0 ? (
                    <ul className="space-y-3">
                        {completedChores.map(chore => (
                             <ChoreItem key={chore.id} chore={chore} assignees={chore.assigneeIds.map(id => usersById.get(id)).filter((u): u is User => !!u)} onToggle={() => toggleChore(chore.id)} onEdit={() => handleOpenEditModal(chore)} onDelete={() => handleDeleteChore(chore.id)} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 italic p-4 bg-slate-50 rounded-lg">No chores completed yet.</p>
                )}
            </div>
             <ChoreModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveChore}
                users={users}
                choreToEdit={editingChore}
            />
        </div>
    );
};