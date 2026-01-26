import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminResetPasswordPage from './AdminResetPasswordPage';
import { BrowserRouter } from 'react-router-dom';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '123' } } } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
            updateUser: vi.fn().mockResolvedValue({ error: null })
        }
    }
}));

describe('AdminResetPasswordPage', () => {
    it('renders the reset password form', async () => {
        render(
            <BrowserRouter>
                <AdminResetPasswordPage />
            </BrowserRouter>
        );

        // Check for the heading specifically
        expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
        expect(screen.getByLabelText('New Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    });

    it('validates password complexity', async () => {
        render(
            <BrowserRouter>
                <AdminResetPasswordPage />
            </BrowserRouter>
        );

        const passwordInput = screen.getByLabelText('New Password');
        const submitButton = screen.getByRole('button', { name: /Reset Password/i });

        // Enter weak password
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Password must be at least 12 characters/i)).toBeInTheDocument();
        });
    });

    it('validates password match', async () => {
        render(
            <BrowserRouter>
                <AdminResetPasswordPage />
            </BrowserRouter>
        );

        const passwordInput = screen.getByLabelText('New Password');
        const confirmInput = screen.getByLabelText('Confirm Password');
        const submitButton = screen.getByRole('button', { name: /Reset Password/i });

        fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
        fireEvent.change(confirmInput, { target: { value: 'Mismatch123!' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Your passwords do no match/i)).toBeInTheDocument();
        });
    });
});
