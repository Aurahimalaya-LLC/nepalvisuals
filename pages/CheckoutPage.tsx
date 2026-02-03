
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCountries } from '../lib/utils/countries';
import { Calendar } from '../components/common/Calendar';
import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ onSuccess, onError, amount }: { onSuccess: () => void, onError: (msg: string) => void, amount: number }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/booking/confirmed', 
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message ?? "An unexpected error occurred.");
            onError(error.message ?? "Payment failed");
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
             setMessage("Payment status: " + paymentIntent?.status);
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{layout: "tabs"}} />
            {message && <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{message}</div>}
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-primary/25"
            >
                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">lock</span>
                        Pay ${amount.toLocaleString()}
                    </>
                )}
            </button>
        </form>
    );
};

const countryOptions = getCountries();

const addons = [
    { id: 'privateRoom', name: 'Private Room Upgrade', price: 350, description: 'Guaranteed single occupancy room in Kathmandu and teahouses during the trek.' },
    { id: 'porter', name: 'Extra Porter Weight (10kg)', price: 150, description: 'Increase your luggage allowance. We’ll carry one heavy item for you.' },
    { id: 'helicopter', name: 'Helicopter Return', price: 900, description: 'Skip the descent and fly back to Kathmandu with breathtaking aerial views.' },
    { id: 'transfer', name: 'Private Luxury Transfer', price: 60, description: 'Premium airport pickup and drop-off in a private vehicle.' },
];

const CheckoutPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Persistence: Recover booking data from LocalStorage if page reloaded/redirected
    const [bookingData, setBookingData] = useState<any>(() => {
        if (location.state) return location.state;
        const saved = localStorage.getItem('pendingBooking');
        try {
            return saved ? JSON.parse(saved).bookingData : undefined;
        } catch (e) { return undefined; }
    });

    const [numTravelers, setNumTravelers] = useState(bookingData?.guestCount || 2);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        bookingData?.selectedDate ? new Date(bookingData.selectedDate) : null
    );
    const [showCalendar, setShowCalendar] = useState(false);
    const [displayDate, setDisplayDate] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
        privateRoom: true,
        transfer: true,
    });
    const [paymentMethod, setPaymentMethod] = useState<'full' | 'partial'>('full');

    // Lead Traveler / Signup State
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('Male');
    const [dob, setDob] = useState('');
    const [country, setCountry] = useState('');
    const [phone, setPhone] = useState('');
    const [hearAbout, setHearAbout] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isExistingUser, setIsExistingUser] = useState(false);

    // Restore Form Data from LocalStorage on Mount
    useEffect(() => {
        const saved = localStorage.getItem('pendingBooking');
        if (saved && !location.state) {
            try {
                const parsed = JSON.parse(saved);
                
                // Restore Booking Data (Tour Info)
                if (parsed.bookingData) {
                     setBookingData(parsed.bookingData);
                }

                // Restore Form Data (User Inputs)
                if (parsed.formData) {
                    const fd = parsed.formData;
                    setNumTravelers(fd.numTravelers);
                    if (fd.selectedDate) setSelectedDate(new Date(fd.selectedDate));
                    setFullName(fd.fullName || '');
                    setEmail(fd.email || '');
                    setPhone(fd.phone || '');
                    setCountry(fd.country || '');
                    setGender(fd.gender || 'Male');
                    setDob(fd.dob || '');
                    setHearAbout(fd.hearAbout || '');
                    setIsExistingUser(fd.isExistingUser || false);
                    if (fd.paymentMethod) setPaymentMethod(fd.paymentMethod);
                    if (fd.selectedAddons) setSelectedAddons(fd.selectedAddons);
                }
            } catch (e) { /* console.error("Error restoring state", e); */ }
        }
    }, [location.state]);

    const [showGuestEdit, setShowGuestEdit] = useState(false);
    const guestEditRef = useRef<HTMLDivElement>(null);
    
    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    // Initialize with 8 digits (User reported receiving 8 digits). 
    const [otp, setOtp] = useState(new Array(8).fill('')); 
    const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
    const [otpError, setOtpError] = useState<string | null>(null);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [resendTimer, setResendTimer] = useState(0);

    // New State for Stripe & Validation
    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [verifiedUser, setVerifiedUser] = useState<any>(null);


    // Timer for Resend OTP
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Redirect if no booking data is present (optional, or show default/empty state)
    useEffect(() => {
        if (!bookingData) {
            // Uncomment to enforce selection flow
            // navigate('/');
        }
    }, [bookingData, navigate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
            if (guestEditRef.current && !guestEditRef.current.contains(event.target as Node)) {
                setShowGuestEdit(false);
            }
        };

        if (showCalendar || showGuestEdit) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar, showGuestEdit]);

    const handleAddonToggle = (addonId: string) => {
        setSelectedAddons(prev => ({ ...prev, [addonId]: !prev[addonId] }));
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
                .single();

            if (data) {
                // User exists with this email
                // We check if the name roughly matches to confirm identity context
                // but strictly speaking, if email exists, they must login.
                const dbName = (data.full_name || '').toLowerCase().trim();
                const inputName = fullName.toLowerCase().trim();

                // If name is provided and matches, or just email matches (implied existing account)
                // The user prompt specifically asked: "check if the user exists with same name and corresponding mail"
                // So we prioritize the match.
                if (inputName && dbName === inputName) {
                     setIsExistingUser(true);
                     setFieldErrors(prev => {
                         const newErrors = { ...prev };
                         return newErrors;
                     });
                } else if (inputName) {
                    // Email exists but name mismatch
                    // "if the mail and full name are non correspondent and entirely new a new customer should be formed"
                    // So we treat this as a new customer flow (which implies updating the profile/identity).
                    setIsExistingUser(false);
                } else {
                    // Only email entered so far
                    setIsExistingUser(true);
                }
            } else {
                setIsExistingUser(false);
            }
        } catch (err) {
            setIsExistingUser(false);
        }
    };

    const formattedDateRange = useMemo(() => {
        if (!selectedDate) return 'Not set';
        
        const startDate = selectedDate;
        const duration = bookingData?.duration || 14; // Default duration if not provided
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration - 1);
        
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }, [selectedDate, bookingData?.duration]);

    const calculation = useMemo(() => {
        // Use passed basePrice or default to 1200
        const unitPrice = bookingData?.basePrice || 1200;
        const basePrice = numTravelers * unitPrice;
        const permitsAndFees = numTravelers * 50;
        let addonsTotal = 0;
        addons.forEach(addon => {
            if (selectedAddons[addon.id]) {
                addonsTotal += addon.price;
            }
        });
        const earlyBirdDiscount = -500; // This logic might need to be dynamic too
        const subtotal = basePrice + permitsAndFees + addonsTotal + earlyBirdDiscount;
        const taxes = subtotal * 0.10;
        const totalDue = subtotal + taxes;
        const partialAmount = totalDue * 0.30;

        return {
            unitPrice,
            basePrice,
            permitsAndFees,
            addonsTotal,
            earlyBirdDiscount,
            subtotal,
            taxes,
            totalDue,
            partialAmount,
        };
    }, [numTravelers, selectedAddons, bookingData]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!selectedDate) errors.selectedDate = "Please select a trip date";
        if (numTravelers < 1) errors.numTravelers = "At least 1 traveler is required";
        
        if (!fullName.trim() || fullName.length < 2) errors.fullName = "Full name must be at least 2 characters";
        if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Please enter a valid email address";
        if (!dob) errors.dob = "Date of birth is required";
        
        if (!country) errors.country = "Please select a country";
        if (!agreeTerms) errors.agreeTerms = "You must agree to the Terms and Conditions";

        setFieldErrors(errors);
        
        // Show calendar if date is missing
        if (errors.selectedDate) {
            setShowCalendar(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        return Object.keys(errors).length === 0;
    };

    const initiatePayment = async (overrideData?: { email?: string, name?: string, paymentMethod?: string, totalDue?: number, partialAmount?: number }) => {
        try {
            const d = overrideData || {};
            const mail = d.email || email;
            const name = d.name || fullName;
            const method = d.paymentMethod || paymentMethod;
            
            // Use override amounts if provided, otherwise fallback to calculation
            const total = d.totalDue ?? calculation.totalDue;
            const partial = d.partialAmount ?? calculation.partialAmount;
            
            const amount = method === 'partial' ? partial : total;
            
            const { data, error } = await supabase.functions.invoke('payment-sheet', {
                body: {
                    amount: amount,
                    currency: 'usd',
                    email: mail,
                    name: name
                }
            });

            if (error) throw error;
            if (data?.clientSecret) {
                setClientSecret(data.clientSecret);
                setShowPaymentModal(true);
            } else {
                throw new Error("Invalid response from payment server");
            }
        } catch (e: any) {
            setAuthError("Payment initialization failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async () => {
        setLoading(true);
        setAuthError(null);

        if (!validateForm()) {
            setLoading(false);
            if (!selectedDate) {
                 window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }
        
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
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    shouldCreateUser: true,
                    data: {
                        full_name: fullName,
                        phone: phone,
                        country: country,
                        gender: gender,
                        dob: dob,
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
            // console.log("Resending OTP to:", email);
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: `${window.location.origin}/booking/checkout`,
                },
            });

            if (error) throw error;
            
            setResendTimer(60);
            alert("New code sent! Please check your email.");
        } catch (err: any) {
            // console.error("Resend Error:", err);
            setOtpError(err.message || "Failed to resend code.");
        } finally {
            setLoading(false);
        }
    };

    // Listen for Auth Changes (Link Click in other tab or this tab)
    useEffect(() => {
        // Immediate check on mount
        const checkCurrentSession = async () => {
             const saved = localStorage.getItem('pendingBooking');
             const { data: { session } } = await supabase.auth.getSession();
             
             if (session?.user && saved) {
                 // console.log("Found existing session on Checkout mount with pending booking!");
                 try {
                    const parsed = JSON.parse(saved);
                    if (parsed.formData) {
                        await handlePostOtpVerification(session.user, parsed.formData);
                    }
                } catch (e) { /* console.error("Error parsing", e); */ }
             }
        };
        checkCurrentSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Check for pending booking from Magic Link return
            const saved = localStorage.getItem('pendingBooking');
            
            if (event === 'SIGNED_IN' && session?.user && saved) {
                // User clicked Magic Link (in this tab or another synced tab)
                // console.log("User signed in via link with pending booking!", session.user.email);
                
                try {
                    const parsed = JSON.parse(saved);
                    // Trigger booking finalization automatically with saved data
                    if (parsed.formData) {
                        await handlePostOtpVerification(session.user, parsed.formData);
                    }
                } catch (e) {
                    // console.error("Error parsing pending booking:", e);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handlePaymentSuccess = async () => {
        if (!verifiedUser) {
            setAuthError("User not identified. Please contact support.");
            return;
        }

        try {
            setLoading(true);
            
            // 3. Create Booking Record
            const bookingRef = `NV-${Date.now().toString().slice(-4)}-${(bookingData?.tourId || 'TRIP').slice(0, 3).toUpperCase()}`;
            const statusStr = paymentMethod === 'full' ? 'Paid in Full' : 'Deposit Paid';
            
            const { data: bookingDataResult, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    user_id: verifiedUser.id,
                    tour_id: bookingData?.tourId, 
                    dates: formattedDateRange,
                    total_price: calculation.totalDue,
                    status: 'Confirmed',
                    payment_status: statusStr,
                })
                .select()
                .single();

            if (bookingError) throw bookingError;

            // 4. Finalize & Redirect
            localStorage.removeItem('pendingBooking');
            setShowPaymentModal(false);
            
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
            // console.error("Booking Creation Error:", err);
            setAuthError("Booking Creation Failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePostOtpVerification = async (user: any, overrideData?: any) => {
        setVerifiedUser(user);
        
        // Prepare data for profile update (using current state or override)
        const d = overrideData || {
            fullName, phone, country, gender, dob, hearAbout, email, isExistingUser, paymentMethod, 
            totalDue: calculation.totalDue, partialAmount: calculation.partialAmount, selectedAddons
        };

        // If we have override data (restored session), we should update the UI state to match
        if (overrideData) {
            if (d.fullName) setFullName(d.fullName);
            if (d.phone) setPhone(d.phone);
            if (d.country) setCountry(d.country);
            if (d.gender) setGender(d.gender);
            if (d.dob) setDob(d.dob);
            if (d.hearAbout) setHearAbout(d.hearAbout);
            if (d.email) setEmail(d.email);
            if (d.numTravelers) setNumTravelers(d.numTravelers);
            if (d.selectedAddons) setSelectedAddons(d.selectedAddons);
            // bookingData is handled by useState initializer from localStorage
        }

        try {
            setLoading(true);
            
            // If new user/mismatch, update profile
            if (!d.isExistingUser && user) {
                // 1. Update Auth Metadata
                const { error: authUpdateError } = await supabase.auth.updateUser({
                    data: {
                        full_name: d.fullName,
                        phone: d.phone,
                        country: d.country,
                        gender: d.gender,
                        dob: d.dob,
                        hear_about: d.hearAbout,
                    }
                });
            
                if (authUpdateError) { /* console.error("Auth update error:", authUpdateError); */ }
            
                // 2. Insert into Profiles Table
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: user.id,
                    email: d.email,
                    full_name: d.fullName,
                    updated_at: new Date().toISOString(),
                });
                
                if (profileError) { /* console.error('Error updating profile:', profileError); */ }
            }

            // Proceed to Payment
            setShowOtpModal(false);
            
            // Pass the relevant data to initiatePayment
            await initiatePayment({
                email: d.email,
                name: d.fullName,
                paymentMethod: d.paymentMethod,
                // We assume calculation amounts (totalDue/partialAmount) are not in overrideData (which is formData),
                // so we rely on calculation state or optional props.
                // If overrideData comes from localStorage parsed.formData, it has: numTravelers, etc.
                // It does NOT have calculated amounts.
                // But initiatePayment will fallback to `calculation` state.
                // Since this runs after mount, `calculation` should be correct based on `bookingData` and `numTravelers`.
            });
            
        } catch (err: any) {
            // console.error("Profile Update Error:", err);
            setOtpError("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const token = otp.join('');
        // Supabase standard is 6, but we'll be flexible if config changes
        if (token.length < 6) {
            setOtpError("Please enter the full code.");
            return;
        }

        setLoading(true);
        setOtpError(null);

        try {
            // Verify Real OTP
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });

            if (error) throw error;

            await handlePostOtpVerification(data.user);
            
        } catch (err: any) {
            // console.error("Verification Error:", err);
            setOtpError(err.message || "Failed to verify code.");
            setLoading(false);
        }
    };

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (otp[index] === "" && index > 0) {
                 // Focus previous input if current is empty
                 const prevInput = otpInputRefs.current[index - 1];
                 if (prevInput) prevInput.focus();
            }
        }
    };


    // Render forms for additional travelers (Traveler 2, 3...)
    const travelerForms = Array.from({ length: Math.max(0, numTravelers - 1) }, (_, i) => {
        const travelerIndex = i + 2; // Start from Traveler 2
        return (
            <div key={i} className={`bg-surface-darker/60 rounded-xl p-6 ${i > 0 ? 'mt-4' : ''}`}>
                 <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">{travelerIndex}</div>
                        <h4 className="font-bold text-white">Traveler {travelerIndex}</h4>
                    </div>
                    <button 
                        onClick={() => setNumTravelers(n => Math.max(1, n - 1))}
                        className="text-xs font-bold text-primary hover:underline"
                    >
                        Remove
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-text-secondary mb-1 block">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                    </div>
                     <div>
                        <label className="text-xs text-text-secondary mb-1 block">Date of Birth</label>
                        <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                    </div>
                     <div>
                        <label className="text-xs text-text-secondary mb-1 block">Passport Number</label>
                        <input type="text" placeholder="A1234567" className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                    </div>
                     <div>
                        <label className="text-xs text-text-secondary mb-1 block">Nationality</label>
                        <select className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition">
                            <option>Select Country</option>
                            {countryOptions.map(c => <option key={c.code}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <label className="text-xs text-text-secondary mb-1 block">Dietary or Special Requests</label>
                        <textarea placeholder="E.g., Vegetarian, Gluten-free, Allergies..." rows={2} className="w-full bg-surface-dark border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition"></textarea>
                    </div>
                 </div>
            </div>
        );
    });

    return (
         <>
            <header className="relative -mt-[100px] min-h-[40vh] flex items-end justify-center overflow-hidden rounded-b-2xl md:rounded-b-[3rem]">
                <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('${bookingData?.tourImage || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'}')` }}>
                </div>
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-background-dark via-background-dark/90 to-background-dark/60"></div>
                <div className="relative z-10 container mx-auto px-4 pb-12 max-w-7xl">
                    <div className="flex flex-col gap-4">
                        <Link to={bookingData ? `/trip/${bookingData.tourId}` : "/"} className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors text-sm font-medium w-fit">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Back to Trip Details
                        </Link>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                            {bookingData?.tourName ? (
                                <span>{bookingData.tourName}</span>
                            ) : (
                                <>Checkout & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">Payment</span></>
                            )}
                        </h1>
                        <p className="text-xl text-white/80 font-medium">
                            Start Date: {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Not set'}
                        </p>
                    </div>
                </div>
            </header>
             <main className="flex-grow pt-12 pb-16 px-4 md:px-8 lg:px-16 container mx-auto max-w-7xl">
                <div className="w-full max-w-4xl mx-auto mb-10 md:mb-14 px-4">
                    <div className="relative">
                        <div className="absolute top-4 md:top-5 left-0 w-full h-0.5 bg-surface-dark border-t border-white/5 -translate-y-1/2 rounded-full"></div>
                        <div className="absolute top-4 md:top-5 left-0 w-1/2 h-0.5 bg-primary -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(217,30,70,0.5)]"></div>
                        <div className="relative flex justify-between w-full">
                            <div className="flex flex-col items-center gap-3 group cursor-pointer">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center ring-[6px] ring-background-dark z-10 transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(217,30,70,0.4)]">
                                    <span className="material-symbols-outlined text-white text-base md:text-lg font-bold">check</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest group-hover:text-white transition-colors">Review Order</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-dark flex items-center justify-center ring-[6px] ring-background-dark z-10 border-2 border-white/10">
                                    <span className="text-white text-base md:text-lg font-bold">2</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">Payment</span>
                            </div>
                            <div className="flex flex-col items-center gap-3 opacity-50">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface-dark flex items-center justify-center ring-[6px] ring-background-dark z-10 border-2 border-white/10">
                                   <span className="text-white text-base md:text-lg font-bold">3</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest">Confirmation</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Error Message */}
                        {authError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                                {authError}
                            </div>
                        )}

                        {/* Lead Traveler / Account Creation */}
                        <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                             <div className="flex items-center gap-3 mb-6">
                                <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
                                <h3 className="text-xl font-bold text-white">Lead Traveler & Account</h3>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Full Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        onBlur={checkUserExistence}
                                        className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition ${fieldErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        required
                                    />
                                    {fieldErrors.fullName && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Email Address <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={checkUserExistence}
                                        className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition ${fieldErrors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        required
                                    />
                                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Gender <span className="text-red-500">*</span></label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Date of Birth <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition [color-scheme:dark] ${fieldErrors.dob ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        required
                                    />
                                    {fieldErrors.dob && <p className="text-xs text-red-500 mt-1">{fieldErrors.dob}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Country <span className="text-red-500">*</span></label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className={`w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer ${fieldErrors.country ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {countryOptions.map((c) => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.country && <p className="text-xs text-red-500 mt-1">{fieldErrors.country}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-text-secondary mb-2">Where did you hear about us?</label>
                                    <select
                                        value={hearAbout}
                                        onChange={(e) => setHearAbout(e.target.value)}
                                        className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition appearance-none cursor-pointer"
                                    >
                                        <option value="">Choose a option</option>
                                        <option value="Google">Google Search</option>
                                        <option value="Social Media">Social Media</option>
                                        <option value="Friend">Friend Recommendation</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                             </div>
                        </div>

                        {/* Additional Travelers Details (if > 1 guest) */}
                        {numTravelers > 1 && (
                            <div className="bg-surface-dark border border-white/5 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-primary text-2xl">group</span>
                                    <h3 className="text-xl font-bold text-white">Additional Travelers</h3>
                                </div>
                                {travelerForms}
                                <button 
                                    onClick={() => setNumTravelers(n => n + 1)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/10 rounded-lg text-sm font-bold text-white hover:border-primary hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">add_circle</span>
                                    Add Another Traveler
                                </button>
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
                                        <div
                                            key={addon.id}
                                            onClick={() => handleAddonToggle(addon.id)}
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-darker hover:border-white/20'}`}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleAddonToggle(addon.id); } }}
                                        >
                                            <div className={`mt-1 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-primary border-primary' : 'bg-surface-dark border-white/30'}`}>
                                                {isSelected && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-white">{addon.name}</span>
                                                    <span className="font-bold text-white">+${addon.price}</span>
                                                </div>
                                                <p className="text-sm text-text-secondary mt-1">{addon.description}</p>
                                            </div>
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
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div onClick={() => setPaymentMethod('full')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'full' ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-darker hover:border-white/20'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">Pay in Full</span>
                                        <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md">SAVE 5%</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">${calculation.totalDue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                                    <p className="text-sm text-text-secondary">Total amount due today</p>
                                </div>
                                 <div onClick={() => setPaymentMethod('partial')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'partial' ? 'border-primary bg-primary/10' : 'border-transparent bg-surface-darker hover:border-white/20'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-white">Partial Payment</span>
                                        <span className="text-xs font-bold bg-white/10 text-white px-2 py-0.5 rounded-md">30% ADVANCE</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">${calculation.partialAmount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                                    <p className="text-sm text-text-secondary">Pay the rest upon arrival</p>
                                </div>
                             </div>
                             <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                                <p className="text-xs text-text-secondary">Please read our <a href="#" className="font-bold text-primary hover:underline">Terms and Conditions</a> carefully before selecting your payment plan. This document contains important information about cancellations and refunds.</p>
                             </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <h4 className="font-bold text-white mb-4">Enter Card Details</h4>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="text-xs text-text-secondary mb-1 block">Card Number</label>
                                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-surface-darker border-transparent rounded-lg pl-12 pr-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-[-2px] text-text-secondary">credit_card</span>
                                    </div>
                                     <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs text-text-secondary mb-1 block">Expiration Date</label>
                                            <input type="text" placeholder="MM/YY" className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                                        </div>
                                         <div>
                                            <label className="text-xs text-text-secondary mb-1 block">CVC/CVV</label>
                                            <input type="text" placeholder="123" className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                                        </div>
                                    </div>
                                    <div>
                                         <label className="text-xs text-text-secondary mb-1 block">Name on Card</label>
                                         <input type="text" placeholder="Full Name" className="w-full bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition" />
                                    </div>
                                    <div className="mt-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded bg-surface-darker border-white/20 text-primary focus:ring-primary" />
                                            <span className="text-sm text-text-secondary">Billing address is same as contact information</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                             <div className="mt-6 flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                                <span className="material-symbols-outlined text-primary text-xl">troubleshoot</span>
                                <div className="flex-grow">
                                    <h5 className="font-bold text-white text-sm">Having trouble paying?</h5>
                                    <p className="text-xs text-text-secondary">If you're experiencing payment issues, please contact our support team immediately.</p>
                                </div>
                                <button className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-full text-xs font-bold text-white whitespace-nowrap">Live Chat</button>
                            </div>
                             <div className="mt-4 flex items-center gap-3 p-4 bg-green-500/10 rounded-lg">
                                <span className="material-symbols-outlined text-green-400 text-xl">lock</span>
                                <div className="flex-grow">
                                    <h5 className="font-bold text-white text-sm">Secure SSL Encryption</h5>
                                    <p className="text-xs text-text-secondary">Your financial data is encrypted and secure. We do not store your full credit card information.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Sticky Sidebar */}
                     <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-surface-dark rounded-xl border border-white/5 overflow-hidden shadow-2xl shadow-black/30">
                                <div className="relative h-48 w-full">
                                    <img alt="Everest Base Camp Trek" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRhAgmyafMtZInsKcZjC6PERny9fQkTYXnQc2xe3Dn2hSTQ2D2bEPyiLHkfuqDOIamvdyHiV6lOBJgYm_mzEkiQeGcxj6XcjWqapph7IcKty8Mcbs7CdDGengbgwALm5rAVVQmydirCKo5JLlaeh-L3z0AJYecOSmxkI8TpR7pMITU12XLou8iXgEwQe7_3NbQK8rZDzw39TV_j5JnhmpBQ55T2U0LJGQROBZEKe8IxNVO4-xOcOfSMr99VgNtWGMAriy0J_zOV2il" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent"></div>
                                    <div className="absolute bottom-4 left-6">
                                        <div className="inline-flex items-center gap-1 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                                            <span className="material-symbols-outlined text-[12px]">landscape</span>
                                            <span>Expedition</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white leading-tight">Everest Base Camp Trek</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10 relative">
                                        <div>
                                            <p className="text-xs text-text-secondary uppercase">Dates</p>
                                            <p className="font-bold text-white">{formattedDateRange}</p>
                                        </div>
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowCalendar(!showCalendar);
                                            }}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                        
                                        {showCalendar && (
                                            <div className="absolute top-full right-0 z-50 mt-2 bg-surface-card rounded-xl shadow-xl border border-white/10 p-4 w-[320px]">
                                                <Calendar
                                                    displayDate={displayDate}
                                                    setDisplayDate={setDisplayDate}
                                                    selectedDate={selectedDate}
                                                    onSelectDate={handleDateSelect}
                                                    onClose={() => setShowCalendar(false)}
                                                    containerRef={calendarRef}
                                                />
                                            </div>
                                        )}
                                    </div>
                                     <div className="flex justify-between items-center mb-6 relative">
                                        <div>
                                            <p className="text-xs text-text-secondary uppercase">Guests</p>
                                            <p className="font-bold text-white">{numTravelers} Adults</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowGuestEdit(!showGuestEdit);
                                            }}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                        
                                        {showGuestEdit && (
                                            <div ref={guestEditRef} className="absolute top-full right-0 z-50 mt-2 bg-surface-card rounded-xl shadow-xl border border-white/10 p-4 w-[200px]">
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-sm font-bold text-white">Number of Travelers</label>
                                                    <div className="flex items-center justify-between bg-surface-darker rounded-lg p-2 border border-white/10">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNumTravelers(Math.max(1, numTravelers - 1));
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"
                                                            disabled={numTravelers <= 1}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-bold text-white">{numTravelers}</span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setNumTravelers(numTravelers + 1);
                                                            }}
                                                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Base Price ({numTravelers} x ${calculation.unitPrice.toLocaleString()})</span>
                                            <span className="text-white font-medium">${calculation.basePrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Permits &amp; Fees</span>
                                            <span className="text-white font-medium">${calculation.permitsAndFees.toLocaleString()}</span>
                                        </div>
                                        {Object.entries(selectedAddons).map(([id, isSelected]) => {
                                            if (!isSelected) return null;
                                            const addon = addons.find(a => a.id === id);
                                            return (
                                                 <div key={id} className="flex justify-between text-sm">
                                                    <span className="text-text-secondary">{addon?.name}</span>
                                                    <span className="text-white font-medium">${addon?.price.toLocaleString()}</span>
                                                </div>
                                            )
                                        })}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Early Bird Discount</span>
                                            <span className="text-green-500 font-medium">-${(-calculation.earlyBirdDiscount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-3 border-t border-white/10">
                                            <span className="text-text-secondary">Subtotal</span>
                                            <span className="text-white font-medium">${calculation.subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-secondary">Taxes (10%)</span>
                                            <span className="text-white font-medium">${calculation.taxes.toLocaleString()}</span>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-2 mb-4">
                                        <input type="text" placeholder="Gift card or discount code" className="flex-grow bg-surface-darker border-transparent rounded-lg px-4 py-2 text-white focus:ring-primary focus:border-primary transition text-sm" />
                                        <button className="px-4 py-2 rounded-lg bg-white/5 text-white font-bold text-sm hover:bg-white/10">Apply</button>
                                    </div>
                                    <div className="flex justify-between items-end mb-6 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-xs text-text-secondary uppercase mb-1">Total Due</p>
                                            <p className="text-sm text-text-secondary">USD</p>
                                        </div>
                                        <p className="text-3xl font-black text-white">${calculation.totalDue.toLocaleString()}</p>
                                    </div>
                                    <div className="mb-4">
                                        <label className="flex items-start gap-2 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={agreeTerms}
                                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                                className={`mt-1 w-4 h-4 rounded bg-surface-darker border-white/20 text-primary focus:ring-primary transition-colors ${fieldErrors.agreeTerms ? 'border-red-500 ring-1 ring-red-500' : ''}`} 
                                            />
                                            <span className={`text-xs ${fieldErrors.agreeTerms ? 'text-red-500' : 'text-text-secondary group-hover:text-white'} transition-colors`}>
                                                I agree to the <a href="#" className="text-primary hover:underline font-bold" onClick={(e) => e.stopPropagation()}>Terms and Conditions</a> and <a href="#" className="text-primary hover:underline font-bold" onClick={(e) => e.stopPropagation()}>Cancellation Policy</a>.
                                            </span>
                                        </label>
                                    </div>

                                    <button 
                                        onClick={handleBooking}
                                        disabled={loading}
                                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                Complete Booking
                                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="bg-surface-dark rounded-xl border border-white/5 p-6 text-center">
                                <h4 className="font-bold text-white mb-3">Need help with your booking?</h4>
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <img src="https://randomuser.me/api/portraits/women/68.jpg" className="w-8 h-8 rounded-full border-2 border-surface-dark" />
                                    <img src="https://randomuser.me/api/portraits/men/75.jpg" className="w-8 h-8 rounded-full border-2 border-surface-dark -ml-3" />
                                    <img src="https://randomuser.me/api/portraits/women/79.jpg" className="w-8 h-8 rounded-full border-2 border-surface-dark -ml-3" />
                                </div>
                                <div className="flex gap-3">
                                    <button className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-bold transition-colors">
                                        <span className="material-symbols-outlined text-base text-primary">chat</span>
                                        Live Chat
                                    </button>
                                    <button className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-bold transition-colors">
                                        <span className="material-symbols-outlined text-base text-primary">call</span>
                                        Call Us
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
                        <div className="relative bg-surface-card w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl transform transition-all scale-100">
                             <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6 ring-4 ring-primary/10">
                                    <span className="material-symbols-outlined text-3xl text-primary">lock_person</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Security Verification</h3>
                                <p className="text-text-secondary mb-4">
                                    We've sent a confirmation email to <span className="text-white font-bold">{email}</span>.
                                </p>
                                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                                    <p className="text-primary font-bold text-sm animate-pulse">
                                        👉 Please click the "Log In" link in that email to verify.
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1">
                                        (You can close the new tab that opens)
                                    </p>
                                </div>
                                
                                <p className="text-xs text-text-secondary mb-2">
                                    Or enter the code if provided:
                                </p>
                                
                                <div className="flex gap-1 mb-2 justify-center">
                                    {otp.map((data, index) => {
                                        return (
                                            <input
                                                className="w-8 h-10 sm:w-10 sm:h-12 bg-surface-darker border border-white/10 rounded-lg text-center text-lg font-bold text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                                                type="text"
                                                name="otp"
                                                maxLength={1}
                                                key={index}
                                                value={data}
                                                onChange={e => handleOtpChange(e.target, index)}
                                                onKeyDown={e => handleOtpKeyDown(e, index)}
                                                onFocus={e => e.target.select()}
                                                ref={el => otpInputRefs.current[index] = el}
                                            />
                                        );
                                    })}
                                </div>
                                {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
                                
                                <div className="mt-8 w-full space-y-3">
                                    <button 
                                        onClick={handleVerifyOtp}
                                        disabled={loading}
                                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            "Verify & Pay"
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => setShowOtpModal(false)}
                                        className="w-full py-3 bg-transparent text-text-secondary hover:text-white font-bold text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                
                                <p className="mt-6 text-xs text-text-secondary">
                                    Didn't receive the code?{' '}
                                    <button 
                                        onClick={handleResendOtp}
                                        disabled={resendTimer > 0 || loading}
                                        className={`font-bold transition-colors ${resendTimer > 0 ? 'text-text-secondary cursor-not-allowed' : 'text-primary hover:underline'}`}
                                    >
                                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                    </button>
                                </p>
                                <p className="mt-2 text-[10px] text-text-secondary/60">
                                    Please check your Spam/Junk folder.
                                </p>
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
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 ring-4 ring-red-500/10">
                                    <span className="material-symbols-outlined text-2xl text-red-500">warning</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Identity Mismatch</h3>
                                <p className="text-text-secondary text-sm mb-6">
                                    The email you entered belongs to an existing account, but the name does not match our records. Please verify your details or use a different email.
                                </p>
                                <button 
                                    onClick={() => setShowErrorPopup(false)}
                                    className="w-full py-3 bg-surface-darker hover:bg-surface-dark text-white font-bold rounded-xl transition-all border border-white/10"
                                >
                                    Close
                                </button>
                             </div>
                        </div>
                    </div>
                )}

                {/* Payment Modal */}
                {showPaymentModal && clientSecret && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-md"></div>
                        <div className="relative bg-surface-card w-full max-w-lg rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                                <button onClick={() => setShowPaymentModal(false)} className="text-text-secondary hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                             </div>
                             
                             <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-xl flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-text-secondary uppercase font-bold">Total to Pay</p>
                                    <p className="text-2xl font-black text-white">
                                        ${(paymentMethod === 'partial' ? calculation.partialAmount : calculation.totalDue).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-text-secondary uppercase font-bold">Payment Type</p>
                                    <p className="text-sm font-bold text-white">{paymentMethod === 'partial' ? '30% Deposit' : 'Full Payment'}</p>
                                </div>
                             </div>

                             <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#D91E46' } } }}>
                                <CheckoutForm 
                                    amount={paymentMethod === 'partial' ? calculation.partialAmount : calculation.totalDue} 
                                    onSuccess={handlePaymentSuccess}
                                    onError={(msg) => setAuthError(msg)}
                                />
                             </Elements>
                        </div>
                    </div>
                )}
            </main>
         </>
    );
};

export default CheckoutPage;
