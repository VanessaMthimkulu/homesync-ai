import React, { useState } from 'react';
import { User } from '../types';

interface HeaderProps {
    currentUser: User;
    users: User[];
    setCurrentUser: (user: User) => void;
    isVoicePlaybackEnabled: boolean;
    toggleVoicePlayback: () => void;
    addUser: (name: string, isAdult: boolean) => void;
    deleteUser: (userId: number) => void;
}

const AddUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, isAdult: boolean) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [isAdult, setIsAdult] = useState(true);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), isAdult);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-4">Add New Profile</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className="input" required autoFocus />
                    </div>
                    <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={isAdult} onChange={(e) => setIsAdult(e.target.checked)} className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500" />
                            <span className="text-sm font-medium text-slate-700">This profile is for an adult</span>
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">Add Profile</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DeleteUserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
}> = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h3 className="text-xl font-bold mb-2 text-red-600">Delete Profile</h3>
                <p className="text-slate-600 mb-4">Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone and will unassign them from all chores.</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                </div>
            </div>
        </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ currentUser, users, setCurrentUser, isVoicePlaybackEnabled, toggleVoicePlayback, addUser, deleteUser }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleConfirmDelete = () => {
        deleteUser(currentUser.id);
        setIsDeleteModalOpen(false);
    };
    
    const handleSaveUser = (name: string, isAdult: boolean) => {
        addUser(name, isAdult);
        setIsAddModalOpen(false);
    };

    return (
        <>
            <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
                <div>
                    {/* This could be a breadcrumb or title, for now it's empty */}
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleVoicePlayback}
                        className={`p-2 rounded-full transition-colors ${
                            isVoicePlaybackEnabled ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        aria-label={isVoicePlaybackEnabled ? 'Disable voice playback' : 'Enable voice playback'}
                    >
                        {isVoicePlaybackEnabled ? (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a.75.75 0 01.75.75v14.5a.75.75 0 01-1.5 0V2.75A.75.75 0 0110 2zM5.5 5.03a.75.75 0 00-1.5 0v9.94a.75.75 0 001.5 0V5.03zM16 6.22a.75.75 0 00-1.5 0v7.56a.75.75 0 001.5 0V6.22z"/></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        )}
                    </button>
                    <div className="flex items-center space-x-1">
                        <div className="relative">
                            <select
                                value={currentUser.id}
                                onChange={(e) => {
                                    const selectedUser = users.find(u => u.id === parseInt(e.target.value));
                                    if (selectedUser) {
                                        setCurrentUser(selectedUser);
                                    }
                                }}
                                className="appearance-none bg-slate-100 border border-slate-200 rounded-full py-2 pl-12 pr-4 font-semibold text-slate-700 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                aria-label="Switch user"
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Add profile">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600" aria-label="Delete selected profile">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
            </header>
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveUser}
            />
            <DeleteUserModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                userName={currentUser.name}
            />
        </>
    );
};