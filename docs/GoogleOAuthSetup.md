# Google OAuth 2.0 Setup for Admin Panel

This guide details how to configure Google OAuth 2.0 authentication for the Nepal Visuals Trekking Admin Panel.

## 1. Google Cloud Console Setup

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project or select an existing one.
3.  **OAuth Consent Screen**:
    *   Navigate to **APIs & Services > OAuth consent screen**.
    *   Select **External** (unless you have a Google Workspace organization).
    *   Fill in the App Information (App name, User support email, Developer contact information).
    *   Click **Save and Continue**.
    *   (Optional) Add Scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile` are selected by default.
    *   (Optional) Test Users: Add your own email for testing.
4.  **Create Credentials**:
    *   Navigate to **APIs & Services > Credentials**.
    *   Click **Create Credentials > OAuth client ID**.
    *   Application type: **Web application**.
    *   Name: `Supabase Auth`.
    *   **Authorized JavaScript origins**:
        *   Add your Supabase project URL (e.g., `https://<project-id>.supabase.co`).
        *   Add `https://nepalvisuals.aurahimalaya.org` for production.
        *   Add `http://localhost:3000` (or your local dev port) for local testing.
    *   **Authorized redirect URIs**:
        *   Add `https://<project-id>.supabase.co/auth/v1/callback`.
    *   Click **Create**.
    *   **Copy the Client ID and Client Secret**.

## 2. Supabase Configuration

1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to **Authentication > Providers**.
3.  Click on **Google**.
4.  Toggle **Enable Google**.
5.  Paste the **Client ID** and **Client Secret** from the Google Cloud Console.
6.  Click **Save**.

## 3. Environment Variables (Optional)

If you are using a custom domain or need specific redirect logic, ensure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set in `.env.local`.

## 4. Security & RBAC

The application enforces Role-Based Access Control (RBAC). Even if a user logs in with Google, they must have an `Admin` or `Super Admin` role in the `public.profiles` table to access the admin panel.

*   **New Users**: By default, new users signing up via Google might be assigned a `Customer` role (depending on your trigger logic).
*   **Granting Access**: An existing Super Admin must manually update the user's role in the `profiles` table to `Admin` or `Super Admin`.

```sql
-- Example SQL to promote a user
UPDATE public.profiles
SET role = 'Admin'
WHERE email = 'admin@example.com';
```

## 5. Troubleshooting "Unable to exchange external code"

If you see an error like `server_error: Unable to exchange external code` or `400: redirect_uri_mismatch`:

1.  **Check Redirect URIs**: Ensure `https://<project-id>.supabase.co/auth/v1/callback` is exactly listed in your Google Cloud Console "Authorized redirect URIs".
2.  **Check Client Secret**: Re-copy the Client Secret from Google Cloud to Supabase. A trailing space can cause this.
3.  **Supabase URL Configuration**:
    *   Go to **Supabase Dashboard > Authentication > URL Configuration**.
    *   Ensure **Site URL** is set to `https://nepalvisuals.aurahimalaya.org`.
    *   Add `http://localhost:3000/*` to **Redirect URLs**.
4.  **Localhost vs 127.0.0.1**: Sometimes Google treats these differently. Try adding both to "Authorized JavaScript origins".
