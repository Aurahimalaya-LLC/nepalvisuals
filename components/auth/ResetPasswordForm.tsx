import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabaseClient';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import zxcvbn from 'zxcvbn';

interface ResetPasswordFormProps {
    onSuccess: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess }) => {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        mode: 'onChange'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const password = watch('password', '');

    const validatePassword = (value: string) => {
        if (value.length < 12) return 'Password must be at least 12 characters';
        if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Must contain at least one number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Must contain at least one special character';
        
        const strength = zxcvbn(value);
        if (strength.score < 3) return 'Password is too weak';
        
        return true;
    };

    const onSubmit = async (data: any) => {
        setServerError(null);
        try {
            // Check session before attempting update
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Auth session missing! Please refresh the page or request a new reset link.');
            }

            const { error } = await supabase.auth.updateUser({
                password: data.password
            });

            if (error) throw error;
            onSuccess();
        } catch (err: any) {
            console.error('Reset password error:', err);
            setServerError(err.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Reset Password Form">
            {serverError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3" role="alert">
                    <span className="material-symbols-outlined text-red-600">error</span>
                    <p className="text-sm text-red-700">{serverError}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new-password">
                    New Password
                </label>
                <div className="relative">
                    <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', { 
                            required: 'Password is required',
                            validate: validatePassword
                        })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                            errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••••••"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
                {errors.password && (
                    <p id="password-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errors.password.message as string}
                    </p>
                )}
                <PasswordStrengthMeter password={password} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">
                    Confirm Password
                </label>
                <div className="relative">
                    <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...register('confirmPassword', { 
                            required: 'Please confirm your password',
                            validate: (val) => {
                                if (watch('password') != val) {
                                    return "Your passwords do no match";
                                }
                            }
                        })}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                            errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••••••"
                        aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                        aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {showConfirmPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p id="confirm-password-error" className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errors.confirmPassword.message as string}
                    </p>
                )}
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 px-4 bg-gray-900 text-white font-semibold rounded-lg shadow-sm hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Updating Password...
                    </span>
                ) : (
                    'Reset Password'
                )}
            </button>
        </form>
    );
};

export default ResetPasswordForm;
