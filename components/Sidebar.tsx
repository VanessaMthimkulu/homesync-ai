import React from 'react';
import { View } from '../types';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    view: View;
    activeView: View;
    setActiveView: (view: View) => void;
    icon: JSX.Element;
    label: string;
}> = ({ view, activeView, setActiveView, icon, label }) => {
    const isActive = activeView === view;
    return (
        <li>
            <button
                onClick={() => setActiveView(view)}
                className={`flex items-center justify-start w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                <span className="w-7 h-7">{icon}</span>
                <span className="ml-3 font-semibold">{label}</span>
            </button>
        </li>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
    return (
        <nav className="bg-slate-800 text-white w-64 p-4 flex flex-col" aria-label="Main navigation">
            <div className="flex items-center space-x-3 mb-8 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.09917C6.47715 2.09917 2 6.57632 2 12.0992C2 17.622 6.47715 22.0992 12 22.0992C17.5228 22.0992 22 17.622 22 12.0992C22 6.57632 17.5228 2.09917 12 2.09917ZM12 4.09917C16.4183 4.09917 20 7.68086 20 12.0992C20 16.5175 16.4183 20.0992 12 20.0992C7.58172 20.0992 4 16.5175 4 12.0992C4 7.68086 7.58172 4.09917 12 4.09917Z" />
                    <path d="M12 7.09917C9.23858 7.09917 7 9.33775 7 12.0992C7 14.8606 9.23858 17.0992 12 17.0992C14.7614 17.0992 17 14.8606 17 12.0992C17 9.33775 14.7614 7.09917 12 7.09917ZM12 15.0992C10.3431 15.0992 9 13.756 9 12.0992C9 10.4423 10.3431 9.09917 12 9.09917C13.6569 9.09917 15 10.4423 15 12.0992C15 13.756 13.6569 15.0992 12 15.0992Z" />
                </svg>
                <h1 className="text-xl font-bold">HomeSync AI</h1>
            </div>
            <ul>
                <NavItem view={View.AGENT} activeView={activeView} setActiveView={setActiveView} label="AI Assistant" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>} />
                <NavItem view={View.CHORES} activeView={activeView} setActiveView={setActiveView} label="Chore Chart" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
                <NavItem view={View.GROCERIES} activeView={activeView} setActiveView={setActiveView} label="Grocery List" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <NavItem view={View.CALENDAR} activeView={activeView} setActiveView={setActiveView} label="Calendar" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <NavItem view={View.TIMERS} activeView={activeView} setActiveView={setActiveView} label="Timers" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <NavItem view={View.ALARMS} activeView={activeView} setActiveView={setActiveView} label="Alarms" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
                <NavItem view={View.ROUTINES} activeView={activeView} setActiveView={setActiveView} label="Routines" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>} />
                <NavItem view={View.HOMEWORK} activeView={activeView} setActiveView={setActiveView} label="Homework" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
            </ul>
        </nav>
    );
};