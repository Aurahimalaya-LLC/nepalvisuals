
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCountries } from '../lib/utils/countries';
import { BookingService, BookingTraveler } from '../lib/services/bookingService';
import { Calendar } from '../components/common/Calendar';
import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const countryOptions = getCountries();

const addons = [
    { id: 'privateRoom', name: 'Private Room Upgrade', price: 350, description: 'Guaranteed single occupancy room in Kathmandu and teahouses during the trek.' },
    { id: 'porter', name: 'Extra Porter Weight (10kg)', price: 150, description: 'Increase your luggage allowance. We’ll carry one heavy item for you.' },
    { id: 'helicopter', name: 'Helicopter Return', price: 900, description: 'Skip the descent and fly back to Kathmandu with breathtaking aerial views.' },
    { id: 'transfer', name: 'Private Luxury Transfer', price: 60, description: 'Premium airport pickup and drop-off in a private vehicle.' },
];

// --- Checkout Form Content (Child Component) ---
const CheckoutFormContent = ({ 
    bookingData, 
    calculation, 
    numTravelers, 
    setNumTravelers, 
    selectedAddons, 
    setSelectedAddons, 
    paymentMethod, 
    setPaymentMethod,
    selectedDate,
    setSelectedDate,
    formattedDateRange,
    showCalendar,
    setShowCalendar,
    displayDate,
    setDisplayDate,
    calendarRef,
    showGuestEdit,
    setShowGuestEdit,
    guestEditRef,
    clientSecret // Passed from container
}: any) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    // Local Form State
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('Male');
    const [dob, setDob] = useState('');
    const [country, setCountry] = useState('');
    const [dietary, setDietary] = useState('');
    const [phone, setPhone] = useState('');
    const [hearAbout, setHearAbout] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isExistingUser, setIsExistingUser] = useState(false);

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState(new Array(8).fill('')); 
    const [otpError, setOtpError] = useState<string | null>(null);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendTimer, setResendTimer] = useState(0);
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    
    // Additional Travelers State
    const [additionalTravelers, setAdditionalTravelers] = useState<Array<{
        fullName: string;
        dob: string;
        gender: string;
        country: string;
        dietary: string;
    }>>([]);

    // Sync additional travelers with numTravelers
    useEffect(() => {
        setAdditionalTravelers(prev => {
            const needed = Math.max(0, numTravelers - 1);
            if (prev.length === needed) return prev;
            if (prev.length < needed) {
                // Add new empty travelers
                const newTravelers = Array(needed - prev.length).fill(null).map(() => ({ 
                    fullName: '', 
                    dob: '', 
                    gender: 'Male', 
                    country: '', 
                    dietary: '' 
                }));
                return [...prev, ...newTravelers];
            } else {
                // Remove extra travelers
                return prev.slice(0, needed);
            }
        });
    }, [numTravelers]);

    const handleTravelerChange = (index: number, field: string, value: string) => {
        setAdditionalTravelers(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
    };

    // Timer for Resend OTP
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer]);

    // Restore Form Data (User inputs only)
    useEffect(() => {
        const saved = localStorage.getItem('pendingBooking');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.formData) {
                    const fd = parsed.formData;
                    setFullName(fd.fullName || '');
                    setEmail(fd.email || '');
                    setPhone(fd.phone || '');
                    setCountry(fd.country || '');
                    setGender(fd.gender || 'Male');
                    setDob(fd.dob || '');
                    setHearAbout(fd.hearAbout || '');
                    setIsExistingUser(fd.isExistingUser || false);
                }
            } catch (e) { }
        }
    }, []);

    const handleAddonToggle = (addonId: string) => {
        setSelectedAddons((prev: any) => ({ ...prev, [addonId]: !prev[addonId] }));
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setShowCalendar(false);
    };

    const checkUserExistence = async () => {
        if (!email || !email.includes('@')) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

            if (data) {
                const dbName = (data.full_name || '').toLowerCase().trim();
                const inputName = fullName.toLowerCase().trim();
                if (inputName && dbName === inputName) {
                     setIsExistingUser(true);
                } else if (inputName) {
                    setIsExistingUser(false);
                } else {
                    setIsExistingUser(true);
                }
            } else {
                setIsExistingUser(false);
            }
        } catch (err) {
            setIsExistingUser(false);
        }
    };

    const validateForm = () => {
        // console.log("Validating form...");
        const errors: Record<string, string> = {};
        if (!selectedDate) errors.selectedDate = "Please select a trip date";
        if (numTravelers < 1) errors.numTravelers = "At least 1 traveler is required";
        if (!fullName.trim() || fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address";
        if (!dob) errors.dob = "Date of birth is required";
        if (!country) errors.country = "Please select a country";
        if (!agreeTerms) errors.agreeTerms = "You must agree to the Terms and Conditions";
        
        //console.log("Validation errors:", errors);
        setFieldErrors(errors);
        
        // if (Object.keys(errors).length > 0) {
        //     console.warn("Form validation failed", errors);
        // }

        if (errors.selectedDate) {
            setShowCalendar(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return Object.keys(errors).length === 0;
    };

    const handleBooking = async () => {
        //console.log("handleBooking called");
        setLoading(true);
        setAuthError(null);

        if (!validateForm()) {
            //console.log("Validation failed in handleBooking");
            setLoading(false);
            return;
        }

        /*
        if (!stripe || !elements) {
            setAuthError("Payment system is not ready. Please refresh.");
            setLoading(false);
            return;
        }
        */
        
        try {
            // Check Identity
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

            if (data) {
                const dbName = (data.full_name || '').toLowerCase().trim();
                const inputName = fullName.toLowerCase().trim();
                
                if (dbName !== inputName && dbName !== '') {
                    setShowErrorPopup(true);
                    setLoading(false);
                    return;
                }
            }
            
            // Proceed to OTP
            // Save state
            localStorage.setItem('pendingBooking', JSON.stringify({
                bookingData: bookingData,
                formData: {
                    fullName, email, phone, country, gender, dob, hearAbout, 
                    paymentMethod, numTravelers, isExistingUser,
                    totalDue: calculation.totalDue, 
                    partialAmount: calculation.partialAmount,
                    selectedAddons: selectedAddons
                }
            }));

            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    shouldCreateUser: true,
                    data: {
                        full_name: fullName,
                        phone: phone,
                        country: country,
                        gender: gender,
                        dob: dob ? new Date(dob).toISOString().split('T')[0] : null,
                        hear_about: hearAbout,
                    },
                }
            });

            if (otpError) throw otpError;

            setOtp(new Array(8).fill(''));
            setShowOtpModal(true);
            setResendTimer(60); 
            setLoading(false);

        } catch (err: any) {
            setAuthError(err.message || "Failed to process request.");
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setLoading(true);
        setOtpError(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/booking/checkout` },
            });
            if (error) throw error;
            setResendTimer(60);
            alert("New code sent! Please check your email.");
        } catch (err: any) {
            let msg = err.message || "Failed to resend code.";
            if (err.status === 429) {
                msg = "Too many attempts. Please wait a moment before trying again.";
            }
            setOtpError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const token = otp.join('');
        if (token.length < 6) {
            setOtpError("Please enter the full code.");
            return;
        }

        setLoading(true);
        setOtpError(null);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });
            if (error) throw error;
            await handlePostOtpVerification(data.user);
        } catch (err: any) {
             let msg = err.message || "Failed to verify code.";
             if (err.status === 429) {
                 msg = "Too many attempts. Please wait a moment.";
             }
            setOtpError(msg);
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (user: any) => {
        try {
            if (!bookingData?.tourId) {
                throw new Error("Booking data is missing. Please restart the booking process.");
            }

            // Prepare Booking Data
            const statusStr = paymentMethod === 'full' ? 'Paid in Full' : 'Deposit Paid';
            const bookingPayload = {
                tour_id: bookingData.tourId, 
                dates: formattedDateRange,
                total_price: calculation.totalDue,
                status: 'Confirmed' as const,
                payment_status: statusStr as any,
                user_id: user.id,
            };

            // Prepare Travelers Data
            const leadTraveler: Partial<BookingTraveler> = {
                name: fullName,
                email: email,
                phone: phone,
                is_primary: true,
                dob: dob ? new Date(dob).toISOString().split('T')[0] : '',
                gender: gender,
                country: country,
                dietary_requirements: dietary
            };

            const others: Partial<BookingTraveler>[] = additionalTravelers.map(t => ({
                name: t.fullName,
                email: null,
                phone: null,
                is_primary: false,
                dob: t.dob,
                gender: t.gender,
                country: t.country,
                dietary_requirements: t.dietary
            }));

            const allTravelers = [leadTraveler, ...others];

            // Create Booking via Service
            const bookingDataResult = await BookingService.createBooking(bookingPayload, allTravelers);
            
            const bookingRef = `NV-${Date.now().toString().slice(-4)}-${(bookingData?.tourId || 'TRIP').slice(0, 3).toUpperCase()}`;

            localStorage.removeItem('pendingBooking');
            
            const confirmationState = {
                booking: bookingDataResult,
                bookingRef,
                tourName: bookingData?.tourName,
                email: email,
                name: fullName,
                numTravelers,
                calculation,
                selectedAddons,
                paymentStatus: statusStr,
                dates: formattedDateRange
            };

            localStorage.setItem('bookingConfirmation', JSON.stringify(confirmationState));

            navigate('/booking/confirmed', {
                state: confirmationState
            });
            
        } catch (err: any) {
            console.error(err);
            setAuthError("Booking Creation Failed: " + err.message);
            setLoading(false);
        }
    };

    const handlePostOtpVerification = async (user: any, overrideData?: any) => {
        setVerifiedUser(user);
        const d = overrideData || {
            fullName, phone, country, gender, dob, hearAbout, email, isExistingUser, 
        };

        try {
            setLoading(true);
            
            // If new user/mismatch, update profile
            if (!d.isExistingUser && user) {
                await supabase.auth.updateUser({
                    data: {
                        full_name: d.fullName,
                        phone: d.phone,
                        country: d.country,
                        gender: d.gender,
                        dob: d.dob,
                        hear_about: d.hearAbout,
                    }
                });
            
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: d.email,
                    full_name: d.fullName,
                    updated_at: new Date().toISOString(),
                });
            }

            setShowOtpModal(false);
           
            // Direct success for testing (Stripe skipped)
            await handlePaymentSuccess(user);

        } catch (err: any) {
            setOtpError("Process Failed: " + err.message);
            setLoading(false);
        }
    };

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling && element.value !== "") {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
             const prevInput = otpInputRefs.current[index - 1];
             if (prevInput) prevInput.focus();
        }
    };

    // Render forms for additional travelers
    const travelerForms = additionalTravelers.map((traveler, i) => {
        const travelerIndex = i + 2;
        return (
            <div key={i} className={`bg-surface-darker/60 rounded-xl p-6 ${i > 0 ? 'mt-4' : ''}`}>
                 <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">{travelerIndex}</div>
                        <h4 className="font-bold text-white">Traveler {travelerIndex}</h4>
                    </div>
                    <button onClick={() => setNumTravelers((n: number) => Math.max(1, n - 1))} className="text-xs font-bold text-primary hover:underline">Remove</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-text-secondary mb-1 block">Full Name</label>
                        <input 
                            type="text" 
                            value={traveler.fullName} 
                            onChange={(e) => handleTravelerChange(i, 'fullName', e.target.value)} 
                            className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" 
                            placeholder="Full Name"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-text-secondary mb-1 block">Date of Birth</label>
                        <input 
                            type="date" 
                            value={traveler.dob} 
                            onChange={(e) => handleTravelerChange(i, 'dob', e.target.value)} 
                            className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition [color-scheme:dark]" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-text-secondary mb-1 block">Gender</label>
                        <select 
                            value={traveler.gender} 
                            onChange={(e) => handleTravelerChange(i, 'gender', e.target.value)} 
                            className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-text-secondary mb-1 block">Country</label>
                        <select 
                            value={traveler.country} 
                            onChange={(e) => handleTravelerChange(i, 'country', e.target.value)} 
                            className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer"
                        >
                            <option value="">Select Country</option>
                            {countryOptions.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold text-text-secondary mb-1 block">Dietary Requirements</label>
                        <input 
                            type="text" 
                            value={traveler.dietary} 
                            onChange={(e) => handleTravelerChange(i, 'dietary', e.target.value)} 
                            className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" 
                            placeholder="e.g. Gluten Free, Vegetarian, Allergies..."
                        />
                    </div>
                 </div>
            </div>
        );
    });

    return (
         <>
            <header className="relative -mt-[100px] min-h-[40vh] flex items-end justify-center overflow-hidden rounded-b-2xl md:rounded-b-[3rem]">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${bookingData?.tourImage || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}')` }}></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-background-dark/60"></div>
                <div className="relative z-10 container mx-auto px-4 pb-12 max-w-7xl">
                    <div className="flex flex-col gap-4">
                        <Link to={bookingData ? `/trip/${bookingData.tourId}` : "/"} className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium w-fit">
                            <span className="material-symbols-outlined text-lg">arrow_back</span> Back to Trip Details
                        </Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                            {bookingData?.tourName || <>Checkout & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Payment</span></>}
                        </h1>
                        <p className="text-xl text-white/80 font-medium">
                            Start Date: {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Not set'}
                        </p>
                    </div>
                </div>
            </header>
             <main className="flex-grow pt-12 pb-16 px-4 md:px-8 lg:px-16 container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {authError && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">{authError}</div>}

                        {/* Lead Traveler */}
                        <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                             <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                                <h3 className="text-xl font-bold text-white">Lead Traveler & Account</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold text-text-secondary mb-2">Full Name *</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} onBlur={checkUserExistence} className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition ${fieldErrors.fullName ? 'border-red-500' : ''}`} required /></div>
                                <div><label className="block text-xs font-bold text-text-secondary mb-2">Email Address *</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={checkUserExistence} className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition ${fieldErrors.email ? 'border-red-500' : ''}`} required /></div>
                                <div><label className="block text-xs font-bold text-text-secondary mb-2">Gender *</label><select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                                <div><label className="block text-xs font-bold text-text-secondary mb-2">Date of Birth *</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition [color-scheme:dark] ${fieldErrors.dob ? 'border-red-500' : ''}`} required /></div>
                                <div><label className="block text-xs font-bold text-text-secondary mb-2">Country *</label><select value={country} onChange={(e) => setCountry(e.target.value)} className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer ${fieldErrors.country ? 'border-red-500' : ''}`} required><option value="">Select Country</option>{countryOptions.map((c) => (<option key={c.code} value={c.code}>{c.name}</option>))}</select></div>
                                <div><label className="block text-xs font-bold text-text-secondary mb-2">Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-text-secondary mb-2">Dietary Requirements</label><input type="text" value={dietary} onChange={(e) => setDietary(e.target.value)} className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" placeholder="e.g. Gluten Free, Vegetarian, Allergies..." /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold text-text-secondary mb-2">Where did you hear about us?</label><select value={hearAbout} onChange={(e) => setHearAbout(e.target.value)} className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer"><option value="">Choose a option</option><option value="Google">Google Search</option><option value="Social Media">Social Media</option><option value="Friend">Friend Recommendation</option><option value="Other">Other</option></select></div>
                             </div>
                        </div>

                        {/* Additional Travelers */}
                        {numTravelers > 1 && (
                            <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">group</span>
                                    <h3 className="text-xl font-bold text-white">Additional Travelers</h3>
                                </div>
                                {travelerForms}
                                <button onClick={() => setNumTravelers((n: number) => n + 1)} className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/10 rounded-lg text-sm font-bold text-white hover:border-primary hover:text-primary transition-colors"><span className="material-symbols-outlined text-base">add_circle</span> Add Another Traveler</button>
                            </div>
                        )}

                        {/* Add-ons */}
                        <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary text-2xl">add_shopping_cart</span>
                                <h3 className="text-xl font-bold text-white">Add-ons & Extras</h3>
                            </div>
                            <div className="space-y-3">
                                {addons.map(addon => {
                                    const isSelected = !!selectedAddons[addon.id];
                                    return (
                                        <div key={addon.id} onClick={() => handleAddonToggle(addon.id)} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-darker hover:border-white/20'}`}>
                                            <div className={`mt-1 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-primary border-primary' : 'bg-surface-dark border-white/30'}`}>{isSelected && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}</div>
                                            <div className="flex-grow"><div className="flex justify-between items-center"><span className="font-bold text-white">{addon.name}</span><span className="font-bold text-white">+${addon.price}</span></div><p className="text-sm text-text-secondary mt-1">{addon.description}</p></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                            {/* Payment Method */}
                        <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                             <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">payment</span>
                                <h3 className="text-xl font-bold text-white">Payment Method</h3>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div onClick={() => setPaymentMethod('full')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${paymentMethod === 'full' ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-darker hover:border-white/20'}`}>
                                    <div className="w-full flex justify-between items-center mb-1"><span className="font-bold text-white">Pay in Full</span><span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md">SAVE 5%</span></div>
                                    <p className="text-2xl font-bold text-white self-end">${calculation.totalDue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                                </div>
                                 <div onClick={() => setPaymentMethod('partial')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${paymentMethod === 'partial' ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-darker hover:border-white/20'}`}>
                                    <div className="w-full flex justify-between items-center mb-1"><span className="font-bold text-white">Partial Payment</span><span className="text-xs font-bold bg-white/10 text-white px-2 py-0.5 rounded-md">30% ADVANCE</span></div>
                                    <p className="text-2xl font-bold text-white self-end">${calculation.partialAmount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                                </div>
                             </div>
                        </div>

                        {/* Payment Details (Stripe Element) */}
                        <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">credit_card</span>
                                <h3 className="text-xl font-bold text-white">Card Details</h3>
                            </div>
                            <div className="space-y-4">
                                 <PaymentElement id="payment-element" options={{layout: "tabs"}} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Sticky Sidebar */}
                     <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden shadow-2xl shadow-black/30">
                                <div className="relative h-48 w-full">
                                    <img alt="Tour" className="w-full h-full object-cover" src={bookingData?.tourImage} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <h3 className="text-xl font-bold text-white leading-tight">{bookingData?.tourName}</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10 relative">
                                        <div><p className="text-xs text-text-secondary uppercase">Dates</p><p className="font-bold text-white">{formattedDateRange}</p></div>
                                        <button onClick={(e) => { e.stopPropagation(); setShowCalendar(!showCalendar); }} className="text-xs font-bold text-primary hover:underline">Edit</button>
                                        {showCalendar && ( <div className="absolute top-full right-0 z-50 mt-2 bg-surface-card rounded-xl shadow-xl border border-white/10 p-4 w-[320px]"><Calendar displayDate={displayDate} setDisplayDate={setDisplayDate} selectedDate={selectedDate} onSelectDate={handleDateSelect} onClose={() => setShowCalendar(false)} containerRef={calendarRef} /></div> )}
                                    </div>
                                     <div className="flex justify-between items-center mb-6 relative">
                                        <div><p className="text-xs text-text-secondary uppercase">Guests</p><p className="font-bold text-white">{numTravelers} Adults</p></div>
                                        <button onClick={(e) => { e.stopPropagation(); setShowGuestEdit(!showGuestEdit); }} className="text-xs font-bold text-primary hover:underline">Edit</button>
                                        {showGuestEdit && ( <div ref={guestEditRef} className="absolute top-full right-0 z-50 mt-2 bg-surface-card rounded-xl shadow-xl border border-white/10 p-4 w-[200px]"><div className="flex flex-col gap-2"><div className="flex items-center justify-between bg-surface-darker rounded-lg p-2 border border-white/10"><button onClick={(e) => { e.stopPropagation(); setNumTravelers(Math.max(1, numTravelers - 1)); }} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white">-</button><span className="font-bold text-white">{numTravelers}</span><button onClick={(e) => { e.stopPropagation(); setNumTravelers(numTravelers + 1); }} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white">+</button></div></div></div> )}
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Base Price ({numTravelers} x ${calculation.unitPrice.toLocaleString()})</span><span className="text-white font-medium">${calculation.basePrice.toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Permits & Fees</span><span className="text-white font-medium">${calculation.permitsAndFees.toLocaleString()}</span></div>
                                        {Object.entries(selectedAddons).map(([id, isSelected]) => isSelected ? <div key={id} className="flex justify-between text-sm"><span className="text-text-secondary">{addons.find(a => a.id === id)?.name}</span><span className="text-white font-medium">${addons.find(a => a.id === id)?.price.toLocaleString()}</span></div> : null)}
                                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Early Bird Discount</span><span className="text-green-500 font-medium">-${(-calculation.earlyBirdDiscount).toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-text-secondary">Taxes (10%)</span><span className="text-white font-medium">${calculation.taxes.toLocaleString()}</span></div>
                                     </div>
                                    <div className="flex justify-between items-end mb-6 pt-4 border-t border-white/10">
                                        <div><p className="text-xs text-text-secondary uppercase mb-1">Total Due</p><p className="text-sm text-text-secondary">USD</p></div>
                                        <p className="text-3xl font-black text-white">${calculation.totalDue.toLocaleString()}</p>
                                    </div>
                                    <div className="mb-4"><label className="flex items-start gap-2 cursor-pointer group"><input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className={`mt-1 w-4 h-4 rounded bg-surface-darker border-white/20 text-primary focus:ring-primary transition-colors ${fieldErrors.agreeTerms ? 'border-red-500' : ''}`} /><span className={`text-xs ${fieldErrors.agreeTerms ? 'text-red-500' : 'text-text-secondary'}`}>I agree to the Terms and Conditions and Cancellation Policy.</span></label></div>

                                    <button 
                                        onClick={handleBooking}
                                        disabled={loading || !stripe}
                                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>Complete Booking <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* OTP Modal */}
                {showOtpModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowOtpModal(false)}></div>
                        <div className="relative bg-surface-card w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl">
                             <div className="flex flex-col items-center text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">Security Verification</h3>
                                <p className="text-text-secondary mb-4">Code sent to <span className="text-white font-bold">{email}</span>.</p>
                                <div className="flex gap-1 mb-2 justify-center">{otp.map((data, index) => <input className="w-8 h-10 bg-surface-darker border border-white/10 rounded-lg text-center text-lg font-bold text-white focus:border-primary" type="text" maxLength={1} key={index} value={data} onChange={e => handleOtpChange(e.target, index)} onKeyDown={e => handleOtpKeyDown(e, index)} ref={el => otpInputRefs.current[index] = el} />)}</div>
                                {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
                                <div className="mt-8 w-full space-y-3">
                                    <button onClick={handleVerifyOtp} disabled={loading} className="w-full py-3 bg-primary text-white font-bold rounded-xl">{loading ? "Verifying..." : "Verify & Pay"}</button>
                                    <button onClick={() => setShowOtpModal(false)} className="w-full py-3 text-text-secondary">Cancel</button>
                                </div>
                                <p className="mt-6 text-xs text-text-secondary">Didn't receive? <button onClick={handleResendOtp} disabled={resendTimer > 0} className="text-primary hover:underline">{resendTimer > 0 ? `Wait ${resendTimer}s` : 'Resend'}</button></p>
                             </div>
                        </div>
                    </div>
                )}

                {/* Error Popup */}
                {showErrorPopup && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowErrorPopup(false)}></div>
                        <div className="relative bg-surface-card w-full max-w-sm rounded-2xl border border-red-500/20 p-6 shadow-2xl">
                             <div className="flex flex-col items-center text-center">
                                <span className="material-symbols-outlined text-2xl text-red-500 mb-4">warning</span>
                                <h3 className="text-xl font-bold text-white mb-2">Identity Mismatch</h3>
                                <p className="text-text-secondary text-sm mb-6">The email you entered belongs to an existing account, but the name does not match. Please verify your details.</p>
                                <button onClick={() => setShowErrorPopup(false)} className="w-full py-3 bg-surface-darker text-white font-bold rounded-xl">Close</button>
                             </div>
                        </div>
                    </div>
                )}
            </main>
         </>
    );
};

// --- Main Container Component ---
const CheckoutPage: React.FC = () => {
    const location = useLocation();
    
    // Booking Data State
    const [bookingData, setBookingData] = useState<any>(() => {
        if (location.state) return location.state;
        const saved = localStorage.getItem('pendingBooking');
        try { return saved ? JSON.parse(saved).bookingData : undefined; } catch (e) { return undefined; }
    });

    const [numTravelers, setNumTravelers] = useState(bookingData?.guestCount || 2);
    const [selectedDate, setSelectedDate] = useState<Date | null>(bookingData?.selectedDate ? new Date(bookingData.selectedDate) : null);
    const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({ privateRoom: true, transfer: true });
    const [paymentMethod, setPaymentMethod] = useState<'full' | 'partial'>('full');
    const [clientSecret, setClientSecret] = useState("");
    const [paymentInitError, setPaymentInitError] = useState<string | null>(null);
    
    // UI State
    const [showCalendar, setShowCalendar] = useState(false);
    const [displayDate, setDisplayDate] = useState(new Date());
    const [showGuestEdit, setShowGuestEdit] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const guestEditRef = useRef<HTMLDivElement>(null);

    // Click Outside Handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setShowCalendar(false);
            if (guestEditRef.current && !guestEditRef.current.contains(event.target as Node)) setShowGuestEdit(false);
        };
        if (showCalendar || showGuestEdit) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCalendar, showGuestEdit]);

    // State Restoration (User Inputs - Partial)
    useEffect(() => {
        const saved = localStorage.getItem('pendingBooking');
        if (saved && !location.state) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.bookingData) setBookingData(parsed.bookingData);
                if (parsed.formData) {
                    setNumTravelers(parsed.formData.numTravelers);
                    if (parsed.formData.selectedDate) setSelectedDate(new Date(parsed.formData.selectedDate));
                    if (parsed.formData.paymentMethod) setPaymentMethod(parsed.formData.paymentMethod);
                    if (parsed.formData.selectedAddons) setSelectedAddons(parsed.formData.selectedAddons);
                }
            } catch (e) { }
        }
    }, [location.state]);

    // Calculation Logic
    const calculation = useMemo(() => {
        const unitPrice = bookingData?.basePrice || 1200;
        const basePrice = numTravelers * unitPrice;
        const permitsAndFees = numTravelers * 50;
        let addonsTotal = 0;
        addons.forEach(addon => { if (selectedAddons[addon.id]) addonsTotal += addon.price; });
        const earlyBirdDiscount = -500;
        const subtotal = basePrice + permitsAndFees + addonsTotal + earlyBirdDiscount;
        const taxes = subtotal * 0.10;
        const totalDue = subtotal + taxes;
        const partialAmount = totalDue * 0.30;
        return { unitPrice, basePrice, permitsAndFees, addonsTotal, earlyBirdDiscount, subtotal, taxes, totalDue, partialAmount };
    }, [numTravelers, selectedAddons, bookingData]);

    const formattedDateRange = useMemo(() => {
        if (!selectedDate) return 'Not set';
        const startDate = selectedDate;
        const duration = bookingData?.duration || 14; 
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration - 1);
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }, [selectedDate, bookingData?.duration]);

    // Fetch Client Secret (Stripe)
    useEffect(() => {
        const fetchPaymentIntent = async (retryCount = 0) => {
            try {
                const amount = paymentMethod === 'partial' ? calculation.partialAmount : calculation.totalDue;
                if (!amount || amount <= 0) return;

                const { data, error } = await supabase.functions.invoke('payment-sheet', {
                    body: {
                        amount: amount,
                        currency: 'usd',
                    },
                    // Explicitly use Anon Key to avoid "Invalid JWT" errors from stale user sessions.
                    // The payment-sheet function does not require user authentication.
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    }
                });

                if (error) {
                    console.error("Supabase Function Error Object:", error);
                    throw error;
                }
                if (data?.clientSecret) {
                    setClientSecret(data.clientSecret);
                }
            } catch (e: any) {
                console.error("Error fetching payment intent:", e);
                // Try to extract useful error message from Supabase FunctionsHttpError
                let msg = e.message || "Failed to initialize payment system.";
                let isInvalidJwt = false;
                
                // If it's a FunctionsHttpError, it often has a context with the response
                if (e.context && typeof e.context.json === 'function') {
                   try {
                       const body = await e.context.json();
                       console.log("Error body from function:", body);
                       if (body.error) msg = body.error;
                       if (body.message) {
                           msg = body.message; // Capture 'Invalid JWT' or other gateway messages
                           if (msg === 'Invalid JWT') isInvalidJwt = true;
                       }
                   } catch (jsonErr) {
                       console.error("Failed to parse error body JSON", jsonErr);
                   }
                } else if (e instanceof Error && e.message.includes("non-2xx")) {
                    // Fallback for generic non-2xx error if body parsing failed or wasn't available
                    msg = "Payment service configuration error. Please check server logs.";
                }
                
                // Attempt auto-recovery for Invalid JWT
                if (isInvalidJwt && retryCount < 1) {
                    console.log("Detected Invalid JWT. Attempting to refresh session and retry...");
                    const { error: refreshError } = await supabase.auth.refreshSession();
                    if (!refreshError) {
                        // Retry once
                        return fetchPaymentIntent(retryCount + 1);
                    } else {
                        console.error("Session refresh failed:", refreshError);
                        msg = "Session expired. Please sign out and sign in again.";
                    }
                }

                setPaymentInitError(msg);
            }
        };
        fetchPaymentIntent();
    }, [calculation.totalDue, calculation.partialAmount, paymentMethod]);

    return (
        <>
            {!stripePublicKey ? (
                <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
                    <div className="bg-surface-dark border border-red-500/20 rounded-xl p-8 max-w-md w-full text-center">
                        <span className="material-symbols-outlined text-red-500 text-4xl mb-4">settings_alert</span>
                        <h3 className="text-xl font-bold text-white mb-2">Configuration Missing</h3>
                        <p className="text-text-secondary mb-6">Stripe Public Key is missing from environment variables.</p>
                        <div className="bg-black/30 p-4 rounded-lg text-left text-xs font-mono text-gray-400 mb-6 overflow-x-auto">
                            VITE_STRIPE_PUBLIC_KEY=pk_test_...
                        </div>
                        <p className="text-xs text-text-secondary">Please add this to your .env file.</p>
                    </div>
                </div>
            ) : clientSecret ? (
                <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#D91E46' } } }}>
                    <CheckoutFormContent 
                        bookingData={bookingData}
                        calculation={calculation}
                        numTravelers={numTravelers}
                        setNumTravelers={setNumTravelers}
                        selectedAddons={selectedAddons}
                        setSelectedAddons={setSelectedAddons}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        formattedDateRange={formattedDateRange}
                        showCalendar={showCalendar}
                        setShowCalendar={setShowCalendar}
                        displayDate={displayDate}
                        setDisplayDate={setDisplayDate}
                        calendarRef={calendarRef}
                        showGuestEdit={showGuestEdit}
                        setShowGuestEdit={setShowGuestEdit}
                        guestEditRef={guestEditRef}
                        clientSecret={clientSecret}
                    />
                </Elements>
            ) : paymentInitError ? (
                <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
                    <div className="bg-surface-dark border border-red-500/20 rounded-xl p-8 max-w-md w-full text-center">
                        <span className="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
                        <h3 className="text-xl font-bold text-white mb-2">Payment System Error</h3>
                        <p className="text-text-secondary mb-6">{paymentInitError}</p>
                        <p className="text-xs text-text-secondary mb-6 bg-black/20 p-2 rounded">
                            Dev Tip: Check Supabase Edge Function logs and ensure STRIPE_SECRET_KEY is set in Secrets.
                        </p>
                        <button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-background-dark">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </>
    );
};

export default CheckoutPage;
