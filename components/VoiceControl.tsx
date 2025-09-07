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
    
    // Use refs for callbacks to ensure the latest functions are always called from within the recognition event handlers
    const onCommandRef = useRef(onCommand);
    const onHomeworkPromptRef = useRef(onHomeworkPrompt);
    const activeViewRef = useRef(activeView);

    useEffect(() => {
        onCommandRef.current = onCommand;
        onHomeworkPromptRef.current = onHomeworkPrompt;
        activeViewRef.current = activeView;
    }, [onCommand, onHomeworkPrompt, activeView]);

    // Main setup effect. The empty dependency array is crucial for creating a single, stable instance.
    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;
        
        let finalTranscript = '';
        
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            finalTranscript = ''; // Reset transcript on start
            setIsListening(true);
            setError(null);
            audioRef.current?.play().catch(e => console.error("Error playing audio cue:", e));
        };
        
        recognition.onend = () => {
            setIsListening(false);
            const processedTranscript = finalTranscript.trim();
            if (processedTranscript) {
                if (activeViewRef.current === View.HOMEWORK) {
                     onHomeworkPromptRef.current(processedTranscript);
                } else {
                     onCommandRef.current(processedTranscript);
                }
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            // Gracefully ignore non-critical errors
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }
            
            let errorMessage = "An unknown error occurred during speech recognition.";
            switch (event.error) {
                case 'not-allowed':
                case 'service-not-allowed':
                    errorMessage = "Microphone access denied. Please allow microphone permissions in your browser settings.";
                    break;
                case 'audio-capture':
                    errorMessage = "No microphone found. Please ensure a microphone is connected and working.";
                    break;
                case 'network':
                    errorMessage = "A network error occurred. Please check your connection.";
                    break;
            }
            setError(errorMessage);
            console.error("Speech recognition error:", event.error, errorMessage);
        };

        recognition.onresult = (event: any) => {
            let accumulatedTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                 if (event.results[i].isFinal) {
                    accumulatedTranscript += event.results[i][0].transcript + ' ';
                }
            }
            if (accumulatedTranscript) {
                finalTranscript += accumulatedTranscript;
            }
        };

        // Cleanup on unmount
        return () => {
            recognition.abort();
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                // This can happen if start() is called too soon after stop()
                console.error("Error starting recognition:", err);
                setError("Could not start listening. Please wait a moment and try again.");
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            // Instantly update UI for responsiveness, then ask the service to stop.
            // The final transcript will be processed reliably in the `onend` handler.
            setIsListening(false); 
            recognitionRef.current.stop();
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
            const timer = setTimeout(() => setError(null), 5000); // Longer timeout for more helpful error messages
            return () => clearTimeout(timer);
        }
    }, [error]);

    return { isListening, error, startListening, stopListening };
};
