import React, { useState, useEffect, useCallback } from 'react';
import { getHomeworkHelp } from '../services/geminiService';

const SUBJECTS = ['General', 'Math', 'Science', 'Reading', 'History'];

interface HomeworkHelperProps {
    isListening: boolean;
    startListening: () => void;
    lastHomeworkPrompt: string | null;
    setLastHomeworkPrompt: (prompt: string | null) => void;
    isVoicePlaybackEnabled: boolean;
    speakText: (text: string) => void;
}

export const HomeworkHelper: React.FC<HomeworkHelperProps> = ({ 
    isListening, 
    startListening,
    lastHomeworkPrompt,
    setLastHomeworkPrompt,
    isVoicePlaybackEnabled,
    speakText
}) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [subject, setSubject] = useState('General');
    
    const handleSubmit = useCallback(async (e: React.FormEvent | Event, voicePrompt?: string) => {
        e.preventDefault();
        const currentPrompt = voicePrompt || prompt;
        if (!currentPrompt || isLoading) return;
        
        setIsLoading(true);
        setResponse('');
        try {
            const result = await getHomeworkHelp(currentPrompt, subject);
            setResponse(result);
            if (isVoicePlaybackEnabled) {
                speakText(result);
            }
        } catch (error) {
            console.error("Error getting homework help:", error);
            const errorMsg = "I'm having trouble connecting right now. Please try again later.";
            setResponse(errorMsg);
            if(isVoicePlaybackEnabled) speakText(errorMsg);
        } finally {
            setIsLoading(false);
            if (!voicePrompt) setPrompt('');
        }
    }, [prompt, isLoading, subject, isVoicePlaybackEnabled, speakText]);

    useEffect(() => {
        if (lastHomeworkPrompt) {
            setPrompt(lastHomeworkPrompt);
            handleSubmit(new Event('submit'), lastHomeworkPrompt);
            setLastHomeworkPrompt(null);
        }
    }, [lastHomeworkPrompt, setLastHomeworkPrompt, handleSubmit]);

    const placeholder = isListening ? "Listening..." : "Type or click the mic to ask a question...";

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Homework Helper</h2>
            <p className="text-slate-600 mb-6">Select a subject and ask a question. I'll do my best to help!</p>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s => (
                        <button 
                            key={s} 
                            onClick={() => setSubject(s)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                subject === s 
                                ? 'bg-sky-600 text-white' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={placeholder}
                        className="w-full p-3 border rounded-md focus:ring-2 h-28 pr-12 resize-none transition-colors border-slate-300 focus:ring-sky-500 disabled:bg-slate-50"
                        disabled={isLoading || isListening}
                    />
                    <button
                        type="button"
                        onClick={startListening}
                        disabled={isLoading || isListening}
                        className={`absolute right-2 top-3 p-2 rounded-full transition-colors duration-200 disabled:opacity-50 bg-transparent text-slate-500 hover:bg-slate-100`}
                        aria-label={'Start voice input'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/><path d="M12 17c-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2c0 2.76-2.24 5-5 5z"/></svg>
                    </button>
                </div>
                <button
                    type="submit"
                    className="w-full mt-2 bg-purple-600 text-white font-semibold py-3 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                    disabled={isLoading || !prompt.trim() || isListening}
                >
                    {isLoading ? 'Thinking...' : 'Get Help'}
                </button>
            </form>
            
            {(isLoading || response) && (
                 <div className="mt-6 pt-4 border-t border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-800 mb-2">My Answer:</h3>
                     <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                        {isLoading && !response && (
                             <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-500 rounded-full animate-bounce"></span>
                            </div>
                        )}
                        {response && (
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{response}</p>
                        )}
                     </div>
                 </div>
            )}
        </div>
    );
};