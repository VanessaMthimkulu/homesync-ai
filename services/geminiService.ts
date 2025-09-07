import { GoogleGenAI, Type } from "@google/genai";
import { User, Chore, Priority, Routine, Alarm, GroceryItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const commandSchema = {
    type: Type.OBJECT,
    properties: {
        action: {
            type: Type.STRING,
            description: "The primary action. Must be one of: ADD_CHORE, EDIT_CHORE, DELETE_CHORE, ADD_GROCERY, SET_TIMER, ADD_ALARM, NAVIGATE, ANSWER_QUESTION.",
        },
        choreId: { type: Type.NUMBER, description: "The ID of the chore/event to edit or delete. Must be retrieved from the provided context." },
        task: { type: Type.STRING, description: "The name of the chore or grocery item." },
        assigneeNames: {
            type: Type.ARRAY,
            description: "An array of user names to assign the chore to.",
            items: { type: Type.STRING }
        },
        priority: {
            type: Type.STRING,
            description: "The priority of the chore. Must be 'High', 'Medium', or 'Low'.",
            enum: Object.values(Priority),
        },
        dueDate: { type: Type.STRING, description: "The due date for the chore in YYYY-MM-DD format." },
        recurrence: {
            type: Type.OBJECT,
            description: "The recurrence rule for the event.",
            properties: {
                frequency: { type: Type.STRING, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
                until: { type: Type.STRING, description: "End date in YYYY-MM-DD format." },
                byday: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] } }
            }
        },
        notificationDateTime: { type: Type.STRING, description: "The specific date and time for a reminder in YYYY-MM-DDTHH:mm format." },
        duration: { type: Type.NUMBER, description: "The duration for a timer in seconds." },
        timerLabel: { type: Type.STRING, description: "The label for the timer." },
        alarmTime: { type: Type.STRING, description: "The time for an alarm in HH:mm format." },
        alarmLabel: { type: Type.STRING, description: "The label for the alarm." },
        alarmDays: {
            type: Type.ARRAY,
            description: "An array of days for a recurring alarm (e.g., 'Monday', 'Friday').",
            items: { type: Type.STRING }
        },
        view: {
            type: Type.STRING,
            description: "The view to navigate to. Must be one of: agent, chores, groceries, calendar, timers, alarms, routines, homework.",
        },
        responseText: {
            type: Type.STRING,
            description: "A friendly, conversational response to the user confirming the action taken or answering their question."
        }
    },
    required: ['action', 'responseText']
};

interface CommandContext {
    currentUser: User;
    chores: Chore[];
    users: User[];
    routines: Routine[];
    alarms: Alarm[];
    groceries: GroceryItem[];
}

export const processCommand = async (command: string, context: CommandContext): Promise<any> => {
    const { currentUser, chores, users, routines, alarms, groceries } = context;
    const userNames = users.map(u => u.name).join(', ');
    const currentDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

    const systemInstruction = `You are HomeSync AI. Your goal is to translate user commands into a structured JSON format.
- Today's date is ${currentDate}.
- The current user is ${currentUser.name}.
- AVAILABLE USERS: ${userNames}.
- AVAILABLE CHORES/EVENTS: ${JSON.stringify(chores.map(c => ({id: c.id, task: c.task})))}. When asked to edit or delete, find the chore's ID from this list.
- A "chore" and an "event" are the same thing. Both use the ADD_CHORE, EDIT_CHORE, DELETE_CHORE actions.
- For recurring events, you must determine the frequency. 'Every day' is daily. 'Every Tuesday' is weekly with byday: ['Tuesday'].
- Always provide a friendly and concise 'responseText'.

EXAMPLE:
User says: "schedule a planning meeting for Alex and Sam for tomorrow at 3pm, it repeats every weekday until the end of the month. remind them 15 minutes before"
Your JSON output should be:
{
  "action": "ADD_CHORE",
  "task": "Planning meeting",
  "assigneeNames": ["Alex", "Sam"],
  "priority": "Medium",
  "dueDate": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}",
  "recurrence": {
    "frequency": "weekly",
    "byday": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "until": "${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]}"
  },
  "notificationDateTime": "${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().substring(0,11)}14:45",
  "responseText": "OK. I've scheduled the recurring 'Planning meeting' for Alex and Sam, starting tomorrow at 3 PM."
}`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User command: "${command}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: commandSchema,
            },
        });
        
        const jsonText = result.text.trim();
        const parsedJson = JSON.parse(jsonText);

        // Defensive check to ensure assignees is an array if it exists
        if (parsedJson.assigneeNames && !Array.isArray(parsedJson.assigneeNames)) {
            parsedJson.assigneeNames = [parsedJson.assigneeNames];
        }

        return parsedJson;

    } catch (error) {
        console.error("Error processing command with Gemini:", error);
        return {
            action: 'error',
            responseText: "I'm sorry, I'm having a little trouble right now. Please try again."
        };
    }
};

export const getHomeworkHelp = async (prompt: string, subject: string): Promise<string> => {
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a helpful and encouraging homework assistant. Your goal is to explain concepts clearly, simply, and concisely for the subject: ${subject}. Do not just give the answer; guide the student to understand it.`
            }
        });
        return result.text;
    } catch (error) {
        console.error("Error getting homework help from Gemini:", error);
        return "I'm sorry, I couldn't get an answer for that right now. Please check your connection and try again.";
    }
};