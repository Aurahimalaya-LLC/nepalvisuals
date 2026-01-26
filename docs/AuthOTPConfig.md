# Supabase Auth OTP Expiration Configuration

To resolve "OTP Expired" errors and extend the validity of password reset links to **30 minutes**, you must update the project settings in the Supabase Dashboard. This configuration is managed server-side and cannot be changed via code.

## Steps to Configure

1.  **Log in to Supabase Dashboard**
    *   Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard).
    *   Select your project (`nepal-visuals-trekking`).

2.  **Navigate to Auth Settings**
    *   Click on the **Authentication** icon in the left sidebar.
    *   Select **Providers** from the inner menu.
    *   Click on **Email** to expand the email provider settings.

3.  **Update OTP Expiration**
    *   Locate the **"Secure Code Expiration"** or **"Magic Link Expiration"** setting.
    *   The default is often `3600` (1 hour) or sometimes shorter.
    *   **Action**: Ensure it is set to at least `1800` seconds (30 minutes).
    *   Recommended: `3600` (1 hour) to provide ample time for users.

4.  **Save Changes**
    *   Click **Save** at the bottom of the section.

## Verification

After updating this setting:
1.  Request a new "Forgot Password" link from the application.
2.  Wait for 29 minutes (if testing the boundary) or use it immediately.
3.  The link should remain valid for the full duration specified.

## Troubleshooting "otp_expired"

If users still report this error immediately after clicking a link:
*   **Email Scanners**: Corporate email scanners (like Outlook Safe Links) might "click" the link to check for viruses. Since magic links are often "one-time use", the scanner consumes the token, making it invalid when the user clicks it.
*   **Fix**: In Supabase Auth settings, disable "Revoke tokens on use" if possible, or ensure you are using the "Recovery" flow (which allows password reset) rather than "Magic Link" (which logs in directly). Our current implementation uses the standard recovery flow which handles this robustly if the session persists.
