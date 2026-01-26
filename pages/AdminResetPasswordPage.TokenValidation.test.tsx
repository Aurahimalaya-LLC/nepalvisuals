import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminResetPasswordPage from './AdminResetPasswordPage';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
            updateUser: vi.fn().mockResolvedValue({ error: null })
        }
    }
}));

describe('AdminResetPasswordPage Token Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('displays specific error for expired tokens', async () => {
        // Mock URL with expired error code
        window.location.hash = '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
        
        render(
            <BrowserRouter>
                <AdminResetPasswordPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Link Expired')).toBeInTheDocument();
            expect(screen.getByText(/This password reset link has expired/i)).toBeInTheDocument();
        });
    });

    it('displays specific error for invalid tokens', async () => {
        // Mock URL with generic error
        // The page logic uses error_description from URL if available, otherwise fallback
        window.location.hash = '#error=invalid_request&error_description=Invalid+token';
        
        render(
            <BrowserRouter>
                <AdminResetPasswordPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Invalid Link')).toBeInTheDocument();
            // The text content should be 'Invalid token' because that's what we put in error_description
            expect(screen.getByText('Invalid token')).toBeInTheDocument();
        });
    });

    it('displays "Invalid Link" when no session or tokens are present', async () => {
        // Mock empty hash
        window.location.hash = '';
        (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null });
        
        render(
            <BrowserRouter>
                <AdminResetPasswordPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Invalid Link')).toBeInTheDocument();
            expect(screen.getByText(/missing required parameters/i)).toBeInTheDocument();
        });
    });
});
