
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const addonsList = [
    { id: 'privateRoom', name: 'Private Room Upgrade', price: 350 },
    { id: 'porter', name: 'Extra Porter Weight (10kg)', price: 150 },
    { id: 'helicopter', name: 'Helicopter Return', price: 900 },
    { id: 'transfer', name: 'Private Luxury Transfer', price: 60 },
];

const ConfirmationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Restore state from LocalStorage if missing (Handle Reload)
    const state = location.state || (() => {
        try {
            const saved = localStorage.getItem('bookingConfirmation');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    })();

    const { booking, tourName, email, name, bookingRef, numTravelers, calculation, selectedAddons, paymentStatus, dates } = state;

    useEffect(() => {
        if (!state.booking && !state.bookingRef) {
            // Only redirect if absolutely no data (not even in local storage)
            // navigate('/');
        }
    }, [state, navigate]);

    // Defaults for preview if no state
    const displayRef = bookingRef || "NV-8293-EBC";
    const displayName = name || "Traveler";
    const displayTour = tourName || "Everest Base Camp Trek";
    const displayEmail = email || "your email";
    
    // Determine status: DB record > passed state > default
    const displayStatus = booking?.payment_status || paymentStatus || "Paid in Full";

    // Default calculation if missing (fallback for preview)
    const calc = calculation || {
        unitPrice: 1200,
        basePrice: 2400,
        permitsAndFees: 100,
        addonsTotal: 410,
        earlyBirdDiscount: -500,
        subtotal: 2410,
        taxes: 241,
        totalDue: 2651,
        partialAmount: 795 // Dummy partial
    };
    
    const guestCount = numTravelers || 2;
    const activeAddons = selectedAddons || { privateRoom: true, transfer: true };
    
    // Determine amount paid to display
    const amountPaid = displayStatus === 'Deposit Paid' 
        ? (calc.partialAmount || calc.totalDue * 0.3) 
        : calc.totalDue;

    return (
        <>
            <header className="relative -mt-[100px] min-h-[40vh] flex items-end justify-center overflow-hidden rounded-b-2xl md:rounded-b-[3rem]">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDRhAgmyafMtZInsKcZjC6PERny9fQkTYXnQc2xe3Dn2hSTQ2D2bEPyiLHkfuqDOIamvdyHiV6lOBJgYm_mzEkiQeGcxj6XcjWqapph7IcKty8Mcbs7CdDGengbgwALm5rAVVQmydirCKo5JLlaeh-L3z0AJYecOSmxkI8TpR7pMITU12XLou8iXgEwQe7_3NbQK8rZDzw39TV_j5JnhmpBQ55T2U0LJGQROBZEKe8IxNVO4-xOcOfSMr99VgNtWGMAriy0J_zOV2il')" }}>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-background-dark/60"></div>
                <div className="relative z-10 container mx-auto px-4 pb-12 max-w-7xl">
                    <div className="flex flex-col gap-4">
                        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium w-fit">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Home
                        </Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                            Booking <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Confirmed</span>
                        </h1>
                    </div>
                </div>
            </header>
            <main className="flex-grow pt-12 pb-16 px-4 md:px-8 lg:px-16 container mx-auto max-w-7xl">
                <div className="w-full max-w-4xl mx-auto mb-10 md:mb-14 px-4">
                    <div className="relative">
                        <div className="absolute top-4 md:top-5 left-0 w-full h-0.5 bg-surface-dark border-t border-white/5 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute top-4 md:top-5 left-0 w-full h-0.5 bg-primary -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(217,30,70,0.5)]"></div>
                        <div className="relative flex justify-between w-full">
                            <div className="flex flex-col items-center gap-3 group cursor-pointer">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center ring-[6px] ring-background-dark z-10 transition-transform group-hover:scale-110">
                                    <span className="material-symbols-outlined text-white text-base md:text-lg font-bold">check</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest group-hover:text-white transition-colors">Review Order</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center ring-[6px] ring-background-dark z-10 shadow-[0_0_10px_rgba(217,30,70,0.3)]">
                                    <span className="material-symbols-outlined text-white text-base md:text-lg font-bold">check</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">Payment</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center ring-[6px] ring-background-dark z-10 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    <span className="material-symbols-outlined text-background-dark text-base md:text-lg font-bold">star</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">Confirmation</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-surface-dark border border-white/5 rounded-3xl p-8 md:p-12 text-center shadow-xl shadow-black/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-white to-primary opacity-50"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)] ring-8 ring-green-500/20">
                                <span className="material-symbols-outlined text-5xl text-white font-bold">check_circle</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">Booking Confirmed!</h2>
                            <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                                Thank you, <span className="text-white font-bold">{displayName}</span>! Your spot on the <span className="text-primary font-bold">{displayTour}</span> has been successfully reserved.
                            </p>
                            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-surface-darker/50 border border-white/10 rounded-2xl p-2 pr-6 mb-8 hover:border-white/20 transition-colors">
                                <div className="bg-white/5 rounded-xl px-4 py-3">
                                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Booking Reference</p>
                                    <p className="text-xl font-mono font-bold text-white tracking-widest">{displayRef}</p>
                                </div>
                                <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                                <p className="text-sm text-text-secondary">
                                    Confirmation sent to <span className="text-white font-bold">{displayEmail}</span>
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button className="w-full sm:w-auto px-8 py-3 bg-white text-background-dark font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">download</span>
                                    Download Receipt
                                </button>
                                <button className="w-full sm:w-auto px-8 py-3 bg-surface-darker border border-white/10 text-white font-bold rounded-xl hover:bg-surface-darker/80 transition-colors flex items-center justify-center gap-2 group">
                                    <span className="material-symbols-outlined text-xl text-primary group-hover:scale-110 transition-transform">calendar_add_on</span>
                                    Add to Calendar
                                </button>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-6 md:gap-8">
                                <button className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group">
                                    <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">print</span>
                                    Print Confirmation
                                </button>
                                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                <button className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider group">
                                    <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">forward_to_inbox</span>
                                    Email Copy
                                </button>
                            </div>
                        </section>
                        
                        {/* Trip Summary Section */}
                        <section className="bg-surface-dark border border-white/5 rounded-3xl p-8 md:p-12 shadow-xl shadow-black/10">
                            <h3 className="text-2xl font-bold text-white mb-6">Your Adventure Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-b border-white/10 pb-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-2xl text-primary mt-1">calendar_month</span>
                                    <div>
                                        <p className="text-sm text-text-secondary">Dates</p>
                                        <p className="text-lg font-bold text-white">{booking?.dates || dates || "Dates Pending"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-2xl text-primary mt-1">group</span>
                                    <div>
                                        <p className="text-sm text-text-secondary">Guests</p>
                                        <p className="text-lg font-bold text-white">{guestCount} {guestCount === 1 ? 'Person' : 'People'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-2xl text-primary mt-1">bed</span>
                                    <div>
                                        <p className="text-sm text-text-secondary">Accommodation</p>
                                        <p className="text-lg font-bold text-white">Teahouse {activeAddons?.privateRoom ? '+ Private Room' : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-2xl text-primary mt-1">local_airport</span>
                                    <div>
                                        <p className="text-sm text-text-secondary">Transport</p>
                                        <p className="text-lg font-bold text-white">Flight (KTM-LUK) {activeAddons?.transfer ? '+ Private Transfer' : ''}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <h4 className="text-lg font-bold text-white mb-4">What's Next?</h4>
                            <ul className="space-y-3 text-text-secondary list-none">
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>Check your email for the detailed itinerary and packing list.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>Ensure your travel insurance is up-to-date.</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    <span>Feel free to <a href="#" className="text-primary hover:underline font-medium">contact us</a> with any questions.</span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-black/30">
                                <div className="relative h-48 w-full">
                                    <img alt="Everest Base Camp Trek" className="w-full h-full object-cover grayscale-[20%]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRhAgmyafMtZInsKcZjC6PERny9fQkTYXnQc2xe3Dn2hSTQ2D2bEPyiLHkfuqDOIamvdyHiV6lOBJgYm_mzEkiQeGcxj6XcjWqapph7IcKty8Mcbs7CdDGengbgwALm5rAVVQmydirCKo5JLlaeh-L3z0AJYecOSmxkI8TpR7pMITU12XLou8iXgEwQe7_3NbQK8rZDzw39TV_j5JnhmpBQ55T2U0LJGQROBZEKe8IxNVO4-xOcOfSMr99VgNtWGMAriy0J_zOV2il" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent"></div>
                                    <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                                        {displayStatus}
                                    </div>
                                    <div className="absolute bottom-4 left-6">
                                        <div className="inline-flex items-center gap-1 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                                            <span className="material-symbols-outlined text-[12px]">landscape</span>
                                            <span>Expedition</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white leading-tight">Everest Base Camp Trek</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {/* Pricing Details */}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Base Price ({guestCount} x ${calc.unitPrice?.toLocaleString()})</span>
                                            <span className="text-white font-medium">${calc.basePrice?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Permits &amp; Fees</span>
                                            <span className="text-white font-medium">${calc.permitsAndFees?.toLocaleString()}</span>
                                        </div>
                                        
                                        {addonsList.map(addon => activeAddons[addon.id] && (
                                            <div key={addon.id} className="flex justify-between text-sm">
                                                <span className="text-text-secondary">{addon.name}</span>
                                                <span className="text-white font-medium">${addon.price}</span>
                                            </div>
                                        ))}

                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Early Bird Discount</span>
                                            <span className="text-green-500 font-medium">-${Math.abs(calc.earlyBirdDiscount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                                            <span className="text-text-secondary">Subtotal</span>
                                            <span className="text-white font-medium">${calc.subtotal?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Taxes (10%)</span>
                                            <span className="text-white font-medium">${calc.taxes?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-end mb-6 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-xs text-text-secondary uppercase mb-1">Amount Paid</p>
                                            <p className="text-sm text-text-secondary">USD</p>
                                        </div>
                                        <p className="text-3xl font-black text-white">${amountPaid?.toLocaleString()}</p>
                                    </div>
                                    <button className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group mb-4">
                                        Download Invoice
                                        <span className="material-symbols-outlined group-hover:translate-y-1 transition-transform">download</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default ConfirmationPage;
