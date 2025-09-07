import React from 'react';

interface ListeningOverlayProps {
    isVisible: boolean;
    error: string | null;
    onStop: () => void;
}

const MicIcon: React.FC<{ error: boolean }> = ({ error }) => {
    if (error) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
        );
    }

    return (
         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14a2 2 0 0 0 2-2V6a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2z"/>
            <path d="M12 17c-2.76 0-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2c0 2.76-2.24 5-5 5z"/>
        </svg>
    );
};


export const ListeningOverlay: React.FC<ListeningOverlayProps> = ({ isVisible, error, onStop }) => {
    if (!isVisible) {
        return null;
    }

    const message = error || "Listening...";

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4 w-72 text-center">
                <MicIcon error={!!error} />
                <p className={`text-xl font-bold ${error ? 'text-red-600' : 'text-slate-700'}`}>
                    {message}
                </p>
                {!error && (
                    <button
                        onClick={onStop}
                        className="mt-6 w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors text-lg focus:outline-none focus:ring-4 focus:ring-red-300"
                        aria-label="Stop recording"
                    >
                        Stop Recording
                    </button>
                )}
            </div>
        </div>
    );
};