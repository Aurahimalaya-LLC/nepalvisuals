I will implement a secure credential generation system and produce the requested admin credential.

**Implementation Plan:**

1.  **Create Credential Utility (`lib/utils/credentialGenerator.ts`)**:
    *   `generateUsername()`: Generates `admin_${random}`.
    *   `generateStrongPassword()`: Generates a 12+ char password with required complexity using `crypto.getRandomValues`.
    *   `encryptCredential()`: Implements AES-256 encryption using Web Crypto API.
    *   `logCredentialAccess()`: Logs generation events to the `audit_logs` table via Supabase.

2.  **Create Execution Script (`scripts/generate-admin-credential.ts`)**:
    *   A standalone script (runnable via `tsx` or `ts-node`) that utilizes the utility to generate a credential.
    *   It will output the formatted credentials, timestamp, and expiration date.
    *   It will simulate the "secure storage" step by logging the encrypted packet (since we don't have a specific vault table, I'll define the logic for it).

3.  **Execute & Verify**:
    *   Run the script to generate the credential.
    *   Verify the output meets all formatting requirements.
    *   Provide the final generated credential in the response.

**Security Note**: The generated password will be displayed *once* in the tool output as requested. The "storage" aspect will be handled by encrypting the data before "logging" or "storing" it (in the simulation).

**Immediate Action**: I will create the utility and script, then run it.
