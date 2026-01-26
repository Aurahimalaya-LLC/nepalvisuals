
import React from 'react';
import { Link } from 'react-router-dom';

// FIX: Defined a type for departure data to ensure type safety.
// This resolves the issue where `urgency.color` was inferred as `string`
// instead of the more specific union type required by UrgencyBadge.
type Departure = {
    name: string;
    image: string;
    duration: string;
    difficulty: string;
    startDate: { month: string; day: string };
    endDate: { month: string; day: string };
    status: string;
    spots: number;
    maxSpots: number;
    link: string;
    buttonText: string;
    urgency: { text: string; color: 'yellow' | 'blue' | 'green' };
    isNew?: boolean;
};

const departureData: Departure[] = [
    {
        name: 'Everest Base Camp',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRhAgmyafMtZInsKcZjC6PERny9fQkTYXnQc2xe3Dn2hSTQ2D2bEPyiLHkfuqDOIamvdyHiV6lOBJgYm_mzEkiQeGcxj6XcjWqapph7IcKty8Mcbs7CdDGengbgwALm5rAVVQmydirCKo5JLlaeh-L3z0AJYecOSmxkI8TpR7pMITU12XLou8iXgEwQe7_3NbQK8rZDzw39TV_j5JnhmpBQ55T2U0LJGQROBZEKe8IxNVO4-xOcOfSMr99VgNtWGMAriy0J_zOV2il',
        duration: '14 Days',
        difficulty: 'Difficult',
        startDate: { month: 'OCT 2024', day: '15' },
        endDate: { month: 'OCT 2024', day: '29' },
        status: 'spots_left',
        spots: 4,
        maxSpots: 12,
        link: '/booking/checkout',
        buttonText: 'Book Now',
        urgency: { text: 'Filling fast!', color: 'yellow' },
    },
    {
        name: 'Annapurna Circuit',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwWW3lEJ9YYM6nDdQ_clegxQ7nPWH-Trbv40arFyiafhUfI8TSQG1BbV5qC8CVnbZTdocnjJPmXxOW8gwfFA04Byy5vrMjRBD8rXQCFOAKi77ATkMO6rJbEN7truIDQj484smO4H2WPG9dNRmsDO33DoBkSP7HikkIFWIqYm89TDPRD-g9CAIz4zoCF_ixKAl_E7arOVyQ36V-Nl3tdG9w0ZAfFYMJZsq7qHFyh6AeiRd81D4QcIIVtWzZjZmBGyoIMmZ020UPJGo5',
        duration: '18 Days',
        difficulty: 'Moderate',
        startDate: { month: 'NOV 2024', day: '02' },
        endDate: { month: 'NOV 2024', day: '20' },
        status: 'available',
        spots: 8,
        maxSpots: 12,
        link: '#',
        buttonText: 'View Details',
        urgency: { text: 'Popular dates', color: 'blue' },
    },
    {
        name: 'Manaslu Winter Trek',
        image: 'https://placehold.co/200x200?text=Manaslu',
        duration: '12 Days',
        difficulty: 'Challenging',
        startDate: { month: 'DEC 2024', day: '10' },
        endDate: { month: 'DEC 2024', day: '22' },
        status: 'open',
        spots: 12,
        maxSpots: 12,
        link: '#',
        buttonText: 'View Details',
        isNew: true,
        urgency: { text: 'Just opened!', color: 'green' },
    },
];

const StatusIndicator: React.FC<{ status: string; spots?: number; maxSpots?: number }> = ({ status, spots = 0, maxSpots = 12 }) => {
    const progress = (spots / maxSpots) * 100;

    switch (status) {
        case 'spots_left':
            return (
                <div className="w-28 flex-shrink-0">
                    <p className="text-sm font-bold text-yellow-400 mb-1 text-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1 align-middle"></span>
                        {spots} Spots Left
                    </p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-yellow-400 h-full" style={{ width: `${100 - progress}%` }}></div>
                    </div>
                </div>
            );
        case 'available':
            return (
                <div className="w-28 flex-shrink-0">
                    <p className="text-sm font-bold text-green-400 mb-1 text-center">
                         <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 align-middle"></span>
                        Available
                    </p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-400 h-full" style={{ width: `${100 - progress}%` }}></div>
                    </div>
                </div>
            );
        case 'open':
            return (
                <div className="w-28 flex-shrink-0">
                    <p className="text-sm font-bold text-green-400 mb-1 text-center">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1 align-middle"></span>
                        Open
                    </p>
                     <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-400 h-full" style={{ width: '0%' }}></div>
                    </div>
                </div>
            );
        default:
            return null;
    }
};

const UrgencyBadge: React.FC<{ urgency: { text: string; color: 'yellow' | 'blue' | 'green' } }> = ({ urgency }) => {
    const colorClasses = {
        yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        green: 'bg-green-500/10 text-green-400 border-green-500/20',
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorClasses[urgency.color]}`}>
            {urgency.text}
        </span>
    );
};


const UpcomingDepartures: React.FC = () => {
    return (
        <section className="mb-24">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 px-2">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping absolute opacity-75"></span>
                        <span className="w-2 h-2 rounded-full bg-primary relative"></span>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Upcoming Fixed Departures</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Upcoming Departures</h2>
                    <p className="text-text-secondary">Secure your spot on our most popular expeditions for the upcoming season.</p>
                </div>
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                     <button className="px-5 py-2.5 bg-surface-dark border border-white/10 rounded-full text-sm font-bold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">filter_list</span>
                        Filter
                    </button>
                    <button className="px-5 py-2.5 bg-surface-dark border border-white/10 rounded-full text-sm font-bold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">calendar_month</span>
                        Full Calendar
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {departureData.map((trip, index) => (
                    <div key={index} className="bg-surface-dark/80 backdrop-blur-sm border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-all flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="w-full md:flex-1 flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                                <img src={trip.image} alt={trip.name} className="w-14 h-14 rounded-full object-cover"/>
                                {trip.isNew && (
                                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">NEW</span>
                                )}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-1">
                                    <h3 className="text-lg font-bold text-white">{trip.name}</h3>
                                    {trip.urgency && <UrgencyBadge urgency={trip.urgency} />}
                                </div>
                                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">schedule</span> {trip.duration}</span>
                                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-base">hiking</span> {trip.difficulty}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-background-dark/50 border border-white/5 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-primary font-bold uppercase tracking-wider">{trip.startDate.month}</span>
                                <span className="text-3xl font-black text-white">{trip.startDate.day}</span>
                            </div>
                            <span className="material-symbols-outlined text-3xl text-text-secondary">arrow_forward</span>
                             <div className="w-20 h-20 rounded-full bg-background-dark/50 border border-white/5 flex flex-col items-center justify-center text-center">
                                <span className="text-xs text-primary font-bold uppercase tracking-wider">{trip.endDate.month}</span>
                                <span className="text-3xl font-black text-white">{trip.endDate.day}</span>
                            </div>
                        </div>
                        
                        <div className="w-full h-px bg-white/10 md:hidden"></div>

                        <div className="w-full md:w-auto flex items-center justify-between gap-4">
                            <StatusIndicator status={trip.status} spots={trip.spots} maxSpots={trip.maxSpots} />
                            <Link 
                                to={trip.link} 
                                className={`px-4 py-3 sm:px-6 rounded-full font-bold text-sm transition-all flex items-center justify-center shadow-lg whitespace-nowrap flex-shrink-0 ${
                                    trip.status === 'spots_left' 
                                    ? 'bg-primary hover:bg-primary-dark text-white shadow-primary/20' 
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            >
                                {trip.buttonText}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default UpcomingDepartures;
