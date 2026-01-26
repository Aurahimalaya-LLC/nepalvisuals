# Admin Authentication Bypass Configuration

This document describes the "Skip Authentication" feature for the admin panel, designed for use in trusted internal networks or specific development scenarios.

## ⚠️ Security Warning

**Enabling this feature completely bypasses the login screen and role verification for the admin panel.**
*   Do **NOT** enable this in production environments accessible to the public internet.
*   Only enable this in secure, isolated development or internal staging environments.

## How to Enable

To enable the bypass mode, you must set a specific environment variable in your `.env.local` or deployment configuration.

```bash
VITE_ENABLE_ADMIN_BYPASS=true
```

## How It Works

1.  **`RequireAuth.tsx`**: Checks if `import.meta.env.VITE_ENABLE_ADMIN_BYPASS === 'true'`.
2.  **If Enabled**:
    *   Skips the Supabase session check.
    *   Skips the Role-Based Access Control (RBAC) check.
    *   Automatically grants access to the requested route.
    *   Logs the event as `ADMIN_BYPASS_ACCESS` in the audit system (if possible) or console.
3.  **UI Indicator**:
    *   A prominent red warning banner will appear at the top of the Admin Layout to indicate that the system is running in "Unauthenticated Mode".

## Logging & Auditing

When bypass mode is active:
*   The system logs access attempts with the action `ADMIN_BYPASS_ACCESS`.
*   Since there is no real user, the `user_id` in logs might be null or a placeholder, clearly distinguishing these sessions from authenticated ones.

## Disabling

To disable the feature and restore standard security:
1.  Remove `VITE_ENABLE_ADMIN_BYPASS` from your environment variables.
2.  Or set it to `false`.
3.  Rebuild/Restart the application.
