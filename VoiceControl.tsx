import { useState, useEffect, useRef, useCallback } from 'react';
import { View } from '../types';

// This is a browser-only API. We define the type locally to avoid polluting the global scope.
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const DING_SOUND_URL = "https://cdn.jsdelivr.net/npm/ion-sound@3.0.7/sounds/bell_ring.mp3";

interface UseVoiceControlProps {
    onCommand: (command: string) => void;
    onHomeworkPrompt: (prompt: string) => void;
    activeView: View;
}

export const useVoiceControl = ({ onCommand, onHomeworkPrompt, activeView }: UseVoiceControlProps) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const transcriptRef = useRef<string>('');
    const hasProcessedRef = useRef(false);

    // Use refs for callbacks to ensure the latest functions are always called from within the recognition event handlers
    const onCommandRef = useRef(onCommand);
    const onHomeworkPromptRef = useRef(onHomeworkPrompt);
    const activeViewRef = useRef(activeView);

    useEffect(() => {
        onCommandRef.current = onCommand;
        onHomeworkPromptRef.current = onHomeworkPrompt;
        activeViewRef.current = activeView;
    }, [onCommand, onHomeworkPrompt, activeView]);

    // Initialize the SpeechRecognition instance only once
    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        recognition.continuous = true; // Keep listening until manually stopped
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            transcriptRef.current = '';
            hasProcessedRef.current = false;
            setIsListening(true);
            setError(null);
            audioRef.current?.play().catch(e => console.error("Error playing audio cue:", e));
        };
        
        // onend is now primarily a safety net to clean up state
        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') return; // Ignore timeouts
            setError(`Speech error: ${event.error}`);
            console.error("Speech recognition error:", event.error);
        };

        recognition.onresult = (event: any) => {
            let newTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newTranscript += event.results[i][0].transcript + ' ';
                }
            }
            transcriptRef.current += newTranscript;
        };

        return () => {
            recognitionRef.current?.abort();
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error("Error starting recognition:", err);
                setError("Could not start listening.");
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            // Stop listening immediately to make the UI responsive.
            setIsListening(false); 
            recognitionRef.current.stop();

            // Process the transcript immediately, don't wait for the unreliable onend event.
            if (!hasProcessedRef.current) {
                hasProcessedRef.current = true;
                const finalTranscript = transcriptRef.current.trim();
                if (finalTranscript) {
                    if (activeViewRef.current === View.HOMEWORK) {
                        onHomeworkPromptRef.current(finalTranscript);
                    } else {
                        onCommandRef.current(finalTranscript);
                    }
                }
            }
        }
    }, [isListening]);

    // Setup audio element
    useEffect(() => {
        audioRef.current = new Audio(DING_SOUND_URL);
        audioRef.current.preload = 'auto';
    }, []);

    // Error message timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return { isListening, error, startListening, stopListening };
};
