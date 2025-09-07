import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChoreChart } from './components/ChoreChart';
import { GroceryList } from './components/GroceryList';
import { CalendarView } from './components/CalendarView';
import { AgentView } from './components/AgentView';
import { Timers } from './components/Timers';
import { Alarms } from './components/Alarms';
import { Routines } from './components/Routines';
import { HomeworkHelper } from './components/HomeworkHelper';
import { ListeningOverlay } from './components/ListeningOverlay';
import { AlarmNotification } from './components/AlarmNotification';
import { TimerNotification } from './components/TimerNotification';
import { EventNotification } from './components/EventNotification';
import { useVoiceControl } from './components/VoiceControl';

import { View, User, Chore, GroceryItem, ChatMessage, Priority, Timer, Alarm, Routine } from './types';
import { INITIAL_USERS, INITIAL_CHORES, INITIAL_GROCERIES, INITIAL_TIMERS, INITIAL_ALARMS, INITIAL_ROUTINES } from './constants';
import { processCommand } from './services/geminiService';

const App: React.FC = () => {
    // App State
    const [activeView, setActiveView] = useState<View>(View.AGENT);
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isVoicePlaybackEnabled, setIsVoicePlaybackEnabled] = useState(false);

    // Feature States
    const [chores, setChores] = useState<Chore[]>(INITIAL_CHORES);
    const [groceries, setGroceries] = useState<GroceryItem[]>(INITIAL_GROCERIES);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 1, text: `Hello ${currentUser.name}! How can I help you sync your home today?`, sender: 'ai' }
    ]);
    const [timers, setTimers] = useState<Timer[]>(INITIAL_TIMERS);
    const [alarms, setAlarms] = useState<Alarm[]>(INITIAL_ALARMS);
    const [routines, setRoutines] = useState<Routine[]>(INITIAL_ROUTINES);

    // Notifications
    const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
    const [finishedTimer, setFinishedTimer] = useState<Timer | null>(null);
    const [eventNotification, setEventNotification] = useState<Chore | null>(null);
    const shownNotificationsRef = useRef<Set<string>>(new Set());

    // Homework Helper State
    const [lastHomeworkPrompt, setLastHomeworkPrompt] = useState<string | null>(null);

    // Custom Hooks
    const handleVoiceCommand = (command: string) => handleCommand(command);
    const { isListening, error: voiceError, startListening, stopListening } = useVoiceControl({
        onCommand: handleVoiceCommand,
        onHomeworkPrompt: (prompt) => {
            setActiveView(View.HOMEWORK);
            setLastHomeworkPrompt(prompt);
        },
        activeView,
    });
    
    // Core Logic
    const nextId = (items: { id: any }[]) => items.length > 0 ? Math.max(...items.map(i => typeof i.id === 'number' ? i.id : 0)) + 1 : 1;
    
    const speakText = useCallback((text: string) => {
        if (isVoicePlaybackEnabled && 'speechSynthesis' in window) {
            // Cancel any previous speech to prevent overlap
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }, [isVoicePlaybackEnabled]);

    const handleToggleVoicePlayback = () => {
        setIsVoicePlaybackEnabled(prev => {
            if (prev) {
                window.speechSynthesis.cancel();
            }
            return !prev;
        });
    };

    // User Handlers
    const addUser = (name: string, isAdult: boolean) => {
        const newUser: User = {
            id: nextId(users),
            name,
            isAdult,
            avatar: `https://i.pravatar.cc/150?u=${name.toLowerCase().replace(/\s/g, '')}${Date.now()}`
        };
        setUsers(prev => [...prev, newUser]);
    };

    const deleteUser = (userId: number) => {
        if (users.length <= 1) {
            alert("Cannot delete the last user.");
            return;
        }
        const userToDelete = users.find(u => u.id === userId);

        // Safety Check: Prevent deleting the last remaining adult profile.
        if (userToDelete?.isAdult) {
            const totalAdults = users.filter(u => u.isAdult).length;
            if (totalAdults <= 1) {
                alert("Cannot delete the last remaining adult profile.");
                return;
            }
        }

        const newUsers = users.filter(u => u.id !== userId);
        setUsers(newUsers);

        setChores(prev => prev.map(chore => ({
            ...chore,
            assigneeIds: chore.assigneeIds.filter(id => id !== userId)
        })));

        if (currentUser.id === userId) {
            setCurrentUser(newUsers[0]);
        }
    };


    // Chore Handlers
    const addChore = (choreData: Omit<Chore, 'id' | 'completed' | 'completionDate'>) => {
        const newChore: Chore = { ...choreData, id: nextId(chores), completed: false };
        setChores(prev => [...prev, newChore]);
    };
    const editChore = (updatedChore: Chore) => setChores(prev => prev.map(c => c.id === updatedChore.id ? updatedChore : c));
    const deleteChore = (choreId: number) => setChores(prev => prev.filter(c => c.id !== choreId));
    const toggleChore = (choreId: number) => {
        setChores(prev => prev.map(c => c.id === choreId ? { ...c, completed: !c.completed, completionDate: !c.completed ? new Date().toISOString() : undefined } : c));
    };

    // Grocery Handlers
    const addGroceryItem = (name: string) => setGroceries(prev => [...prev, { id: nextId(prev), name, completed: false }]);
    const toggleGroceryItem = (itemId: number) => setGroceries(prev => prev.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i));
    const deleteGroceryItem = (itemId: number) => setGroceries(prev => prev.filter(i => i.id !== itemId));

    // Timer Handlers
    const addTimer = (label: string, duration: number) => {
        const newTimer: Timer = { id: nextId(timers), label, duration, remaining: duration, isRunning: true, finished: false };
        setTimers(prev => [...prev, newTimer]);
    };
    const resetTimer = (timerId: number) => setTimers(prev => prev.filter(t => t.id !== timerId));
    const dismissTimer = (timerId: number) => {
        setTimers(prev => prev.filter(t => t.id !== timerId));
        if (finishedTimer?.id === timerId) setFinishedTimer(null);
    };

    // Alarm Handlers
    const addAlarm = (alarmData: Omit<Alarm, 'id' | 'enabled' | 'ringing'>) => {
        const newAlarm: Alarm = { ...alarmData, id: nextId(alarms), enabled: true };
        setAlarms(prev => [...prev, newAlarm]);
    };
    const editAlarm = (updatedAlarm: Alarm) => setAlarms(prev => prev.map(a => a.id === updatedAlarm.id ? updatedAlarm : a));
    const deleteAlarm = (alarmId: number) => setAlarms(prev => prev.filter(a => a.id !== alarmId));
    const toggleAlarm = (alarmId: number) => setAlarms(prev => prev.map(a => a.id === alarmId ? { ...a, enabled: !a.enabled } : a));
    const dismissAlarm = (alarmId: number) => {
        setAlarms(prev => prev.map(a => a.id === alarmId ? { ...a, ringing: false, enabled: false } : a));
        if (ringingAlarm?.id === alarmId) setRingingAlarm(null);
    };
    
    // Routine Handlers
    const addRoutine = (routineData: Omit<Routine, 'id'>) => {
        const newRoutine: Routine = { ...routineData, id: nextId(routines) };
        setRoutines(prev => [...prev, newRoutine]);
    };
    const editRoutine = (updatedRoutine: Routine) => setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    const deleteRoutine = (routineId: number) => setRoutines(prev => prev.filter(r => r.id !== routineId));

    // AI Command Processing
    const handleCommand = async (command: string) => {
        if (!command.trim()) return;

        setChatHistory(prev => [...prev, { id: nextId(prev), text: command, sender: 'user' }]);
        setIsProcessing(true);

        const context = { currentUser, chores, users, routines, alarms, groceries };
        const result = await processCommand(command, context);

        const aiResponse: ChatMessage = { id: nextId(chatHistory) + 2, text: result.responseText, sender: 'ai' };

        // Process Gemini's response
        if (result.action) {
            switch(result.action) {
                case 'ADD_CHORE':
                    const assigneeIds = result.assigneeNames
                        ?.map((name: string) => users.find(u => u.name.toLowerCase() === name.toLowerCase())?.id)
                        .filter((id: number | undefined): id is number => id !== undefined);
                    if (assigneeIds?.length) {
                        addChore({
                            task: result.task,
                            assigneeIds,
                            priority: result.priority || Priority.MEDIUM,
                            dueDate: result.dueDate,
                            recurrence: result.recurrence,
                            notificationDateTime: result.notificationDateTime,
                        });
                    }
                    setActiveView(View.CALENDAR);
                    break;
                case 'EDIT_CHORE':
                    const choreToEdit = chores.find(c => c.id === result.choreId);
                    if(choreToEdit) {
                        const updatedAssignees = result.assigneeNames
                            ?.map((name: string) => users.find(u => u.name.toLowerCase() === name.toLowerCase())?.id)
                            .filter((id: number | undefined): id is number => id !== undefined);

                        editChore({
                            ...choreToEdit,
                            task: result.task || choreToEdit.task,
                            assigneeIds: updatedAssignees?.length ? updatedAssignees : choreToEdit.assigneeIds,
                            priority: result.priority || choreToEdit.priority,
                            dueDate: result.dueDate || choreToEdit.dueDate,
                        });
                    }
                    setActiveView(View.CALENDAR);
                    break;
                case 'DELETE_CHORE':
                    if (result.choreId) deleteChore(result.choreId);
                    setActiveView(View.CALENDAR);
                    break;
                case 'ADD_GROCERY':
                    if(result.task) addGroceryItem(result.task);
                    break;
                case 'SET_TIMER':
                    if(result.timerLabel && result.duration) addTimer(result.timerLabel, result.duration);
                    break;
                case 'ADD_ALARM':
                    if (result.alarmTime && result.alarmLabel) {
                        addAlarm({ time: result.alarmTime, label: result.alarmLabel, days: result.alarmDays });
                    }
                    break;
                case 'NAVIGATE':
                    if (result.view && Object.values(View).includes(result.view)) {
                        setActiveView(result.view as View);
                    }
                    break;
            }
        }

        setChatHistory(prev => [...prev, aiResponse]);
        speakText(result.responseText);
        setIsProcessing(false);
    };
    
    // Effects for timers and alarms
    useEffect(() => {
        const interval = setInterval(() => {
            // Timer countdown
            setTimers(currentTimers => 
                currentTimers.map(t => {
                    if(t.isRunning && t.remaining > 0) {
                        const newRemaining = t.remaining - 1;
                        if (newRemaining <= 0) {
                            setFinishedTimer(t);
                            return { ...t, remaining: 0, isRunning: false, finished: true };
                        }
                        return { ...t, remaining: newRemaining };
                    }
                    return t;
                })
            );
            
            // Alarm check
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

            alarms.forEach(alarm => {
                if (alarm.enabled && alarm.time === currentTime && !alarm.ringing) {
                    const isToday = !alarm.days || alarm.days.length === 0 || alarm.days.includes(currentDay);
                    const notificationId = `${alarm.id}-${now.toISOString().split('T')[0]}`;
                    
                    if(isToday && !shownNotificationsRef.current.has(notificationId)) {
                        setRingingAlarm(alarm);
                        setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, ringing: true } : a));
                        shownNotificationsRef.current.add(notificationId);
                    }
                }
            });

            // Event notification check
            chores.forEach(chore => {
                if(chore.notificationDateTime) {
                    const notificationTime = new Date(chore.notificationDateTime);
                    if(now >= notificationTime && !shownNotificationsRef.current.has(`chore-${chore.id}`)) {
                        setEventNotification(chore);
                        shownNotificationsRef.current.add(`chore-${chore.id}`);
                    }
                }
            });

        }, 1000);

        return () => clearInterval(interval);
    }, [alarms, chores]);

    // Update greeting when user changes
    useEffect(() => {
        // Prevent setting chat history if users array is empty (e.g., after last user deleted)
        if (currentUser) {
            setChatHistory(prev => prev.map((msg, index) => index === 0 ? { ...msg, text: `Hello ${currentUser.name}! How can I help you sync your home today?` } : msg));
        }
    }, [currentUser]);

    const renderView = () => {
        switch (activeView) {
            case View.AGENT:
                return <AgentView chatHistory={chatHistory} onCommand={handleCommand} isProcessing={isProcessing} currentUser={currentUser} isListening={isListening} startListening={startListening} />;
            case View.CHORES:
                return <ChoreChart chores={chores} users={users} currentUser={currentUser} addChore={addChore} editChore={editChore} deleteChore={deleteChore} toggleChore={toggleChore} />;
            case View.GROCERIES:
                return <GroceryList items={groceries} toggleItem={toggleGroceryItem} addItem={addGroceryItem} deleteItem={deleteGroceryItem} canEdit={currentUser.isAdult} />;
            case View.CALENDAR:
                return <CalendarView chores={chores} users={users} addChore={addChore} editChore={editChore} deleteChore={deleteChore} />;
            case View.TIMERS:
                return <Timers timers={timers} addTimer={addTimer} resetTimer={resetTimer} dismissTimer={dismissTimer} />;
            case View.ALARMS:
                return <Alarms alarms={alarms} toggleAlarm={toggleAlarm} addAlarm={addAlarm} editAlarm={editAlarm} deleteAlarm={deleteAlarm} dismissAlarm={dismissAlarm} />;
            case View.ROUTINES:
                return <Routines routines={routines} addRoutine={addRoutine} editRoutine={editRoutine} deleteRoutine={deleteRoutine} />;
            case View.HOMEWORK:
                return <HomeworkHelper isListening={isListening} startListening={startListening} lastHomeworkPrompt={lastHomeworkPrompt} setLastHomeworkPrompt={setLastHomeworkPrompt} isVoicePlaybackEnabled={isVoicePlaybackEnabled} speakText={speakText} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-1 flex flex-col h-screen">
                <Header 
                    currentUser={currentUser} 
                    users={users} 
                    setCurrentUser={setCurrentUser}
                    isVoicePlaybackEnabled={isVoicePlaybackEnabled}
                    toggleVoicePlayback={handleToggleVoicePlayback}
                    addUser={addUser}
                    deleteUser={deleteUser}
                />
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
            <ListeningOverlay isVisible={isListening || !!voiceError} error={voiceError} onStop={stopListening} />
            {ringingAlarm && <AlarmNotification alarm={ringingAlarm} onDismiss={dismissAlarm} />}
            {finishedTimer && <TimerNotification timer={finishedTimer} onDismiss={dismissTimer} />}
            {eventNotification && <EventNotification chore={eventNotification} onDismiss={() => setEventNotification(null)} />}
        </div>
    );
};

export default App;