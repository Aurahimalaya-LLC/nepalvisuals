I will enhance the password recovery functionality by implementing a comprehensive secure reset flow.

**Implementation Plan:**

1. **Frontend Components**:

   * `components/auth/ForgotPasswordModal.tsx`: A modal to request a password reset link via email.

   * `components/auth/PasswordStrengthMeter.tsx`: A visual component using `zxcvbn` to show password strength.

   * `components/auth/ResetPasswordForm.tsx`: The core form with:

     * New Password & Confirm Password fields.

     * Real-time validation (length, complexity, match).

     * Eye icons for visibility toggle.

     * Accessibility attributes (ARIA).

   * `pages/AdminResetPasswordPage.tsx`: The page users land on after clicking the email link, hosting the `ResetPasswordForm`.

2. **Integration**:

   * Update `pages/AdminLoginPage.tsx` to integrate `ForgotPasswordModal`.

   * Update `App.tsx` to add the route `/admin/reset-password` (or handle the Supabase recovery redirect).

3. **Backend / Database (Supabase)**:

   * Create a migration `20260107000014_password_history.sql`:

     * Create `password_history` table (user\_id, password\_hash, created\_at).

     * Create a trigger on `auth.users` to log password changes (for auditing/history).

     * *Note*: Strict enforcement of "no reuse" is limited by Supabase Auth's architecture, but we will implement the logging infrastructure.

4. **Testing**:

   * Create `pages/AdminResetPasswordPage.test.tsx` to verify validation rules and accessibility.

**Flow:**

1. User clicks "Forgot Password?" -> Opens Modal -> Enters Email -> Supabase sends email.
2. User clicks email link -> Redirects to App (with token) -> App detects recovery event -> Shows `AdminResetPasswordPage`.
3. User enters new password -> Form validates -> Submits -> Supabase updates password -> Redirects to Login.

