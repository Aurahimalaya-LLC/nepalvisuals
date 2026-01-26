import React, { useState, useEffect } from 'react';

interface DateCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDuration?: number;
    title?: string;
}

export const DateCalculatorModal: React.FC<DateCalculatorModalProps> = ({ 
    isOpen, 
    onClose, 
    initialDuration = 0,
    title = "Trip Date Calculator"
}) => {
    const [duration, setDuration] = useState<number | ''>(initialDuration);
    const [startDate, setStartDate] = useState<string>('');
    const [resultDate, setResultDate] = useState<Date | null>(null);
    const [error, setError] = useState<string>('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setDuration(initialDuration);
            setStartDate('');
            setResultDate(null);
            setError('');
        }
    }, [isOpen, initialDuration]);

    if (!isOpen) return null;

    const handleCalculate = () => {
        setError('');
        setResultDate(null);

        // Validation
        if (duration === '' || duration < 0) {
            setError('Please enter a valid positive number of days.');
            return;
        }

        if (!startDate) {
            setError('Please select a start date.');
            return;
        }

        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            setError('Invalid date format.');
            return;
        }

        // Calculation: Add days to start date
        // Note: We need to handle timezone offsets to ensure we don't jump dates unexpectedly due to UTC conversion
        // Creating date from "YYYY-MM-DD" string treats it as UTC in some contexts or Local in others depending on parsing.
        // Using explicit parts is safer.
        const [year, month, day] = startDate.split('-').map(Number);
        const date = new Date(year, month - 1, day); // Month is 0-indexed

        date.setDate(date.getDate() + Number(duration));
        
        setResultDate(date);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="calculator-title"
        >
            <div 
                className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined">calendar_month</span>
                        <h2 id="calculator-title" className="text-lg font-bold text-white">{title}</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-text-secondary hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                        aria-label="Close calculator"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    
                    {/* Duration Input */}
                    <div>
                        <label htmlFor="duration-input" className="block text-sm font-medium text-text-secondary mb-1">
                            Duration (Days)
                        </label>
                        <input
                            id="duration-input"
                            type="number"
                            min="0"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value === '' ? '' : parseInt(e.target.value))}
                            className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            placeholder="Enter number of days"
                        />
                    </div>

                    {/* Start Date Input */}
                    <div>
                        <label htmlFor="start-date-input" className="block text-sm font-medium text-text-secondary mb-1">
                            Start Date
                        </label>
                        <input
                            id="start-date-input"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all [color-scheme:dark]"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-start gap-2 animate-fadeIn">
                            <span className="material-symbols-outlined text-sm mt-0.5">error</span>
                            {error}
                        </div>
                    )}

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculate}
                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                    >
                        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">calculate</span>
                        Calculate End Date
                    </button>

                    {/* Result Area */}
                    {resultDate && (
                        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl animate-fadeIn text-center">
                            <p className="text-sm text-text-secondary mb-1">Your trip will end on</p>
                            <p className="text-xl font-bold text-white">{formatDate(resultDate)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
