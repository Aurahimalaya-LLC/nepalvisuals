import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // Configure the redirect URL to point to our reset page
            const redirectTo = `${window.location.origin}/admin/reset-password`;
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo,
            });

            if (error) throw error;

            setStatus('success');
            setMessage('If an account exists with this email, you will receive a password reset link shortly.');
        } catch (err: any) {
            console.error('Password reset request error:', err);
            // Security: Don't reveal if user exists or not, but handle rate limits
            if (err.status === 429) {
                setStatus('error');
                setMessage('Too many requests. Please try again later.');
            } else {
                setStatus('success'); // Pretend success to prevent enumeration
                setMessage('If an account exists with this email, you will receive a password reset link shortly.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 id="forgot-password-title" className="text-lg font-bold text-gray-900">Reset Password</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black transition-colors"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Enter your email address and we'll send you instructions to reset your password.
                            </p>
                            
                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                                    <span className="material-symbols-outlined text-sm mt-0.5">error</span>
                                    {message}
                                </div>
                            )}

                            <div>
                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    id="reset-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2.5 px-4 bg-gray-900 text-white font-semibold rounded-lg shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors ${
                                    loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Sending Link...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
