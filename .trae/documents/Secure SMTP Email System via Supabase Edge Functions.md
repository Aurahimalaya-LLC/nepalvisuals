I will implement a robust SMTP email notification system using a Supabase Edge Function (`send-email`), as the project architecture (Vite + Supabase) lacks a dedicated Node.js backend. This is the secure and standard way to handle SMTP credentials and server-side logic in this environment.

**Implementation Plan:**

1.  **Initialize Edge Functions Environment**:
    *   Create the `supabase/functions` directory if it doesn't exist.
    *   Set up a new Edge Function named `send-email`.

2.  **Develop `send-email` Edge Function (Deno)**:
    *   **Dependencies**: Import `nodemailer` (via `npm:nodemailer` in Deno) to handle SMTP connections reliably.
    *   **SMTP Configuration**: Implement logic to read secure credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) from Supabase Secrets.
    *   **Features**:
        *   Support plain text and HTML content.
        *   Handle attachments (accepting base64 strings).
        *   Support multiple recipients.
        *   Customizable "From" address.
    *   **Security & Error Handling**:
        *   Validate the request payload (to, subject, body).
        *   Check for an authenticated user (JWT validation) to prevent unauthorized use.
        *   Wrap sending logic in `try-catch` blocks to log specific SMTP errors.

3.  **Frontend Service Integration**:
    *   Create `lib/services/emailService.ts`: A TypeScript service to invoke the `send-email` Edge Function from the React app.
    *   This service will handle the API call structure and authentication headers.

4.  **Database Logging (Audit Trail)**:
    *   Create a migration `20260107000015_email_logs.sql` to create an `email_logs` table.
    *   The Edge Function will insert a record into this table for every attempt (Success/Failure) to ensure full accountability.

5.  **Documentation**:
    *   Create `docs/EmailSystem.md` explaining how to configure the secrets and use the service.

**Why this approach?**
*   **Security**: SMTP credentials stay in Supabase Secrets, never exposed to the client.
*   **Reliability**: `nodemailer` is the industry standard for Node/Deno email sending.
*   **Scalability**: Edge Functions scale automatically.
*   **Auditing**: Dedicated logging table fulfills the "Comprehensive logging" requirement.

*Note: Since I cannot "deploy" the function to your live Supabase project, I will provide the complete code files and instructions on how to deploy and set the secrets.*
