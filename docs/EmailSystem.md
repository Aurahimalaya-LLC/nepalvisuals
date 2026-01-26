# Secure Email Notification System

This project uses **Supabase Edge Functions** to handle secure SMTP email delivery. This approach ensures that SMTP credentials are never exposed to the client-side code.

## Architecture

1.  **Frontend (`lib/services/emailService.ts`)**: React components call this service to request an email.
2.  **Edge Function (`supabase/functions/send-email`)**: A Deno-based serverless function that:
    *   Validates the user's JWT.
    *   Initializes a `nodemailer` transport using secure environment variables.
    *   Sends the email via your SMTP provider (Gmail, Outlook, AWS SES, etc.).
    *   Logs the transaction to the `email_logs` database table.

## Configuration

### 1. Set Supabase Secrets

You must configure the SMTP credentials in your Supabase project. Run the following command using the Supabase CLI:

```bash
# Specific Configuration for info@nepalvisuals.com
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_SECURE=true
supabase secrets set SMTP_USER=info@nepalvisuals.com
supabase secrets set SMTP_PASS="hvmv rozv jtze itjq"
supabase secrets set SMTP_FROM="Nepal Visuals <info@nepalvisuals.com>"
```

### 2. Deploy the Function

Deploy the `send-email` function to your Supabase project:

```bash
supabase functions deploy send-email
```

### 3. Database Migration

Apply the `email_logs` table migration:

```bash
supabase db push
# or
supabase migration up
```

## Usage Example

```typescript
import { EmailService } from '../lib/services/emailService';

await EmailService.sendEmail({
  to: 'customer@example.com',
  subject: 'Booking Confirmation',
  html: '<h1>Thank you!</h1><p>Your booking is confirmed.</p>'
});
```

## Security Features

*   **Authentication**: Only authenticated users (via Supabase Auth) can invoke the email function.
*   **Secret Management**: Credentials are stored in Supabase Vault/Secrets, not in the code.
*   **Auditing**: Every email attempt is logged in the `email_logs` table with the user ID, recipient, and status.
*   **Rate Limiting**: (Implicit via Supabase Edge Function quotas, but custom logic can be added).
