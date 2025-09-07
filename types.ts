// FIX: Removed a circular dependency. This file defines 'View', so it should not import it from './App'.
export enum View {
    AGENT = 'agent',
    CHORES = 'chores',
    GROCERIES = 'groceries',
    CALENDAR = 'calendar',
    TIMERS = 'timers',
    ALARMS = 'alarms',
    ROUTINES = 'routines',
    HOMEWORK = 'homework',
}

export enum Priority {
    HIGH = 'High',
    MEDIUM = 'Medium',
    LOW = 'Low',
}

export interface User {
    id: number;
    name: string;
    avatar: string;
    isAdult: boolean;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  until?: string; // YYYY-MM-DD
  byday?: string[]; // 'Sunday', 'Monday', ...
}

export interface Chore {
    id: number;
    task: string;
    assigneeIds: number[];
    priority: Priority;
    dueDate?: string;
    completed: boolean;
    completionDate?: string;
    // FIX: Removed a stray 's' character from the beginning of the next line that was causing a syntax error.
    recurrence?: RecurrenceRule;
    notificationDateTime?: string; // e.g., "2024-07-30T09:00"
}

export interface GroceryItem {
    id: number;
    name: string;
    completed: boolean;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource?: any;
}

export interface Timer {
    id: number;
    label: string;
    duration: number; // in seconds
    remaining: number; // in seconds
    isRunning: boolean;
    finished: boolean;
}

export interface Alarm {
    id: number;
    time: string; // "HH:mm"
    label: string;
    enabled: boolean;
    ringing?: boolean;
    days?: string[];
}

export interface Routine {
    id: number;
    name: string;
    icon: 'sun' | 'home' | 'moon' | 'default';
    steps: string[];
    days?: string[];
}

export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}