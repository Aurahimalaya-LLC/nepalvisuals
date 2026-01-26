import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { supabase } from '../lib/supabaseClient';

const AdminResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [checkingSession, setCheckingSession] = useState(true);
    const [sessionError, setSessionError] = useState<string | null>(null);

    useEffect(() => {
        // Verify we have a session (which happens after clicking the email link)
        const checkSession = async () => {
            try {
                // Check for error parameters in the URL hash (Supabase standard)
                const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove leading #
                const urlError = hashParams.get('error');
                const urlErrorCode = hashParams.get('error_code');
                const urlErrorDescription = hashParams.get('error_description');

                if (urlErrorCode === 'otp_expired') {
                    setSessionError('This password reset link has expired. For security, links are valid for a limited time.');
                    setCheckingSession(false);
                    return;
                }

                if (urlError) {
                    setSessionError(urlErrorDescription?.replace(/\+/g, ' ') || 'This password reset link is invalid.');
                    setCheckingSession(false);
                    return;
                }

                // First, check if there is a hash in the URL which Supabase uses for recovery
                // If there is no hash and no session, the link is definitely invalid/expired for this flow
                const { data: { session }, error: sessionCheckError } = await supabase.auth.getSession();
                
                if (sessionCheckError) throw sessionCheckError;
                
                if (session) {
                    setCheckingSession(false);
                    return;
                }

                // FIX: Check for recovery tokens in the URL.
                // If present, Supabase takes a moment to process the hash and establish the session.
                // We should wait instead of failing immediately.
                const accessToken = hashParams.get('access_token');
                const type = hashParams.get('type');

                if (accessToken && (type === 'recovery' || type === 'magiclink' || type === 'invite')) {
                    // We found tokens, so we wait. The onAuthStateChange listener will handle the success case.
                    // We set a fallback timeout just in case the token is invalid and no session ever forms.
                    console.log('Recovery token detected, waiting for session...');
                    setTimeout(async () => {
                        const { data: { session: delayedSession } } = await supabase.auth.getSession();
                        if (!delayedSession) {
                            setSessionError('This link appears to be invalid or has already been used.');
                        }
                        setCheckingSession(false);
                    }, 3000); // Wait 3 seconds for Supabase to process the hash
                    return;
                }

                // If no session and no tokens, it's definitely invalid
                setSessionError('This password reset link is invalid or missing required parameters.');
                setCheckingSession(false);
            } catch (err: any) {
                console.error('Session check error:', err);
                setSessionError('Failed to verify session. Please try again.');
                setCheckingSession(false);
            }
        };
        
        // Listen for auth state changes (e.g. PASSWORD_RECOVERY event)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                // User is in recovery mode or successfully signed in via link
                setSessionError(null);
                setCheckingSession(false);
            } else if (event === 'SIGNED_OUT') {
                // Only show error if we aren't already successful
                if (!isSuccess) {
                    setSessionError('Session expired. Please request a new password reset link.');
                }
            }
        });

        checkSession();

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isSuccess && countdown > 0) {
            timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        } else if (isSuccess && countdown === 0) {
            navigate('/admin/login');
        }
        return () => clearTimeout(timer);
    }, [isSuccess, countdown, navigate]);

    if (checkingSession) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying security token...</p>
                </div>
            </div>
        );
    }

    if (sessionError) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">link_off</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {sessionError.includes('expired') ? 'Link Expired' : 'Invalid Link'}
                    </h2>
                    <p className="text-gray-600 mb-6">{sessionError}</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/login')}
                            className="w-full py-2.5 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors"
                        >
                            Request New Link
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border border-gray-200 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                    <p className="text-gray-600 mb-6">
                        Your password has been securely updated. You will be redirected to the login page in {countdown} seconds.
                    </p>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="text-admin-primary font-semibold hover:underline"
                    >
                        Go to Login now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-admin-primary/10 text-admin-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-2xl">lock_reset</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Please choose a strong, unique password for your account.
                    </p>
                </div>

                <ResetPasswordForm onSuccess={() => setIsSuccess(true)} />
            </div>
        </div>
    );
};

export default AdminResetPasswordPage;
