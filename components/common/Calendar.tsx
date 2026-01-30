import React from 'react';

interface CalendarProps {
    displayDate: Date;
    setDisplayDate: (date: Date) => void;
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    availableDates?: Date[];
    onClose: () => void;
    containerRef?: React.RefObject<HTMLDivElement>;
}

export const Calendar: React.FC<CalendarProps> = ({ 
    displayDate, 
    setDisplayDate, 
    selectedDate, 
    onSelectDate, 
    availableDates = [], 
    onClose,
    containerRef
}) => {
    
    // Note: availableDates is passed but logic for highlighting them was not present in the original code.
    // Keeping it for future use or if it was intended to be used.
    // const availableDateStrings = React.useMemo(() => availableDates.map(d => d.toDateString()), [availableDates]);

    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Generate 42 slots (6 rows x 7 cols) for the calendar grid
    const calendarDays = React.useMemo(() => {
        const days = [];
        // Calculate start date of the grid
        const startDate = new Date(year, month, 1);
        startDate.setDate(startDate.getDate() - firstDay);
        
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            // Determine if the day belongs to the current month view
            // Note: We use a simple check against the display month
            const isCurrentMonth = currentDate.getMonth() === month;
            
            days.push({
                date: currentDate,
                isCurrentMonth
            });
        }
        return days;
    }, [year, month, firstDay]);

    const goToPrevMonth = () => setDisplayDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setDisplayDate(new Date(year, month + 1, 1));

    const handleDateClick = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date >= today) {
            onSelectDate(date);
            onClose();
        }
    };

    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(event.target.value, 10);
        setDisplayDate(new Date(newYear, month, 1));
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div 
            ref={containerRef}
            className="absolute top-full left-0 mt-2 w-full bg-surface-darker border border-white/10 rounded-xl shadow-2xl p-4 z-20 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={goToPrevMonth} className="w-8 h-8  flex items-center justify-center rounded-full text-white transition-colors hover:bg-white/10" aria-label="Previous month">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                        {displayDate.toLocaleString('default', { month: 'long' })}
                    </span>
                    <div className="relative">
                        <select
                            value={year}
                            onChange={handleYearChange}
                            aria-label="Select year"
                            className="bg-surface-darker border border-transparent hover:border-white/10 rounded-md font-bold text-white text-sm cursor-pointer py-1 pl-2 pr-2 focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {years.map(y => <option key={y} value={y} className="bg-surface-darker text-white font-medium">{y}</option>)}
                        </select>
                    </div>
                </div>
                <button type="button" onClick={goToNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full text-white transition-colors hover:bg-white/10" aria-label="Next month">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map(day => <div key={day} className="text-xs font-bold text-text-secondary h-8 flex items-center justify-center">{day}</div>)}
                
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = date < today;
                    const isToday = date.toDateString() === today.toDateString();
                    
                    let dayClass = "";
                    
                    if (isSelected) {
                         dayClass = "bg-primary !text-white font-bold shadow-lg shadow-primary/30";
                    } else if (isToday) {
                         dayClass = "bg-white/10 text-primary font-bold border border-primary/50";
                    } else if (isPast) {
                         // Past days
                         if (isCurrentMonth) {
                             dayClass = "text-text-secondary/20 cursor-not-allowed";
                         } else {
                             // Past days from other months
                             dayClass = "text-text-secondary/30 cursor-not-allowed";
                         }
                    } else {
                        // Future days (selectable)
                        if (isCurrentMonth) {
                            dayClass = "text-white hover:bg-white/10 cursor-pointer hover:text-primary transition-colors";
                        } else {
                            // Future days in other months
                            dayClass = "text-text-secondary hover:bg-white/10 cursor-pointer hover:text-white transition-colors";
                        }
                    }

                    return (
                        <div 
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!isPast) handleDateClick(date);
                            }}
                            className={`w-full aspect-square flex items-center justify-center rounded-full text-sm ${dayClass}`}
                        >
                            {date.getDate()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
