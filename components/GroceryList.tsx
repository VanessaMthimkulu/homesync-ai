import React, { useState } from 'react';
import { GroceryItem } from '../types';

interface GroceryListProps {
    items: GroceryItem[];
    toggleItem: (itemId: number) => void;
    addItem: (name: string) => void;
    deleteItem: (itemId: number) => void;
    canEdit: boolean;
}

export const GroceryList: React.FC<GroceryListProps> = ({ items, toggleItem, addItem, deleteItem, canEdit }) => {
    const [newItemName, setNewItemName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim()) {
            addItem(newItemName.trim());
            setNewItemName('');
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Grocery List</h2>
            
            {canEdit && (
                <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add a new item..."
                        className="flex-grow p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                        type="submit"
                        className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors flex items-center disabled:bg-sky-300"
                        disabled={!newItemName.trim()}
                    >
                        Add
                    </button>
                </form>
            )}

            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {items.map(item => (
                    <li key={item.id} className="flex items-center group bg-slate-50 p-2 rounded-md transition-colors hover:bg-slate-100">
                        <input
                            type="checkbox"
                            id={`grocery-${item.id}`}
                            checked={item.completed}
                            onChange={() => toggleItem(item.id)}
                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <label htmlFor={`grocery-${item.id}`} className={`flex-grow ml-3 text-slate-600 cursor-pointer ${item.completed ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                        </label>
                        {canEdit && (
                             <button 
                                onClick={() => deleteItem(item.id)} 
                                className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={`Delete ${item.name}`}
                             >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                </svg>
                             </button>
                        )}
                    </li>
                ))}
                 {items.length === 0 && <p className="text-slate-500 italic text-center py-4">Your grocery list is empty.</p>}
            </ul>
             {!canEdit && <p className="text-xs text-slate-500 mt-4 italic text-center">Only adults can add or remove items.</p>}
        </div>
    );
};