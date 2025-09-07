import { User, Chore, Priority, GroceryItem, Timer, Alarm, Routine } from './types';

export const INITIAL_USERS: User[] = [
    { id: 1, name: 'Mom', avatar: 'https://i.pravatar.cc/150?u=mom', isAdult: true },
    { id: 2, name: 'Dad', avatar: 'https://i.pravatar.cc/150?u=dad', isAdult: true },
];

const today = new Date();
const getFutureDate = (days: number) => {
    const date = new Date();
    date.setDate(today.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const INITIAL_CHORES: Chore[] = [
    { id: 1, task: 'Take out the trash', assigneeIds: [2], priority: Priority.MEDIUM, dueDate: getFutureDate(1), completed: false, recurrence: { frequency: 'weekly', byday: ['Tuesday'] } },
    { id: 2, task: 'Grocery shopping', assigneeIds: [1], priority: Priority.HIGH, completed: false, dueDate: getFutureDate(4) },
    { id: 3, task: 'Plan weekly meals', assigneeIds: [1], priority: Priority.LOW, dueDate: getFutureDate(3), completed: false },
    { id: 4, task: 'Water the plants', assigneeIds: [2], priority: Priority.MEDIUM, completed: false, recurrence: { frequency: 'daily' } },
    { id: 5, task: 'Family Movie Night', assigneeIds: [1,2], priority: Priority.HIGH, dueDate: getFutureDate(2), completed: false, notificationDateTime: `${getFutureDate(2)}T19:00` },
];

export const INITIAL_GROCERIES: GroceryItem[] = [
    { id: 1, name: 'Milk', completed: false },
    { id: 2, name: 'Bread', completed: true },
    { id: 3, name: 'Eggs', completed: false },
    { id: 4, name: 'Apples', completed: false },
];

export const INITIAL_TIMERS: Timer[] = [];

export const INITIAL_ALARMS: Alarm[] = [
    { id: 1, time: '07:00', label: 'Wake up for school', enabled: true, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 2, time: '21:00', label: 'Bedtime', enabled: false, days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
];

export const INITIAL_ROUTINES: Routine[] = [
    {
        id: 1,
        name: 'Morning Routine',
        icon: 'sun',
        steps: ['Wake up', 'Brush teeth', 'Get dressed', 'Eat breakfast', 'Pack school bag'],
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
        id: 2,
        name: 'After School',
        icon: 'home',
        steps: ['Unpack bag', 'Have a snack', 'Do homework', 'Free time!'],
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    {
        id: 3,
        name: 'Bedtime Routine',
        icon: 'moon',
        steps: ['Tidy up room', 'Put on pajamas', 'Brush teeth', 'Read a book'],
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
    }
];