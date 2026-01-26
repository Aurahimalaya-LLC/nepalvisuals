# Setting Up Gmail SMTP with Supabase

Using Gmail as your SMTP provider requires creating a specialized **App Password** because Google does not allow using your regular account password for third-party apps like this.

## Step 1: Enable 2-Step Verification (If not already enabled)

1.  Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2.  Under "How you sign in to Google", select **2-Step Verification**.
3.  Follow the prompts to enable it (if it isn't already on).

## Step 2: Create an App Password

1.  Go back to the [Security page](https://myaccount.google.com/security).
2.  Search for **"App passwords"** in the search bar at the top (or look under "2-Step Verification" > scroll to bottom).
3.  Give your app a name (e.g., "Supabase Email System").
4.  Click **Create**.
5.  Google will generate a **16-character code** (e.g., `abcd efgh ijkl mnop`).
6.  **Copy this code immediately.** You will not be able to see it again. This is your `SMTP_PASS`.

## Step 3: Configure Supabase Secrets

Now, you need to set the environment variables in your Supabase project so the `send-email` Edge Function can use them.

Run the following commands in your terminal (using Supabase CLI), or add them via the Supabase Dashboard (Settings > Edge Functions > Secrets).

```bash
# Set the SMTP Host for Gmail
supabase secrets set SMTP_HOST=smtp.gmail.com

# Set the Port (465 is for SSL, 587 is for TLS)
# We recommend 465 with SSL for Gmail
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_SECURE=true

# Set your Gmail address
supabase secrets set SMTP_USER=your.email@gmail.com

# Set the App Password you generated in Step 2 (remove spaces)
supabase secrets set SMTP_PASS=abcdefghijklmnop

# Set the "From" address (Must match your Gmail address or an alias)
supabase secrets set SMTP_FROM="Nepal Visuals <your.email@gmail.com>"
```

## Step 4: Verify Configuration

You can verify the setup by running the `send-email` function test or triggering an email from your application.

### Common Issues
*   **Authentication Failed**: Ensure you are using the **App Password** (16 chars), NOT your Google Account password.
*   **Connection Timeout**: If using port 465, ensure `SMTP_SECURE` is set to `true`. If using port 587, set it to `false`.
*   **"From" Address Mismatch**: Gmail forces the "From" header to match the authenticated user. You cannot spoof the sender address easily with Gmail SMTP.
