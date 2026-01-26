// Helper to generate random alphanumeric string
export const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    return result;
};

// Generate Username
export const generateUsername = (): string => {
    return `admin_${generateRandomString(8)}`;
};

// Generate Strong Password
export const generateStrongPassword = (): string => {
    const length = 16; // Minimum 12, going for 16 for extra security
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + numbers + special;

    let password = '';
    // Ensure at least one of each required type
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest
    const randomValues = new Uint32Array(length - 4);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length - 4; i++) {
        password += all[randomValues[i] % all.length];
    }

    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// AES-256 Encryption (Simulation for Demo, using Node crypto if available or Web Crypto)
export const encryptCredential = async (data: string, secretKey: string): Promise<string> => {
    // Note: In a real browser env, we'd use window.crypto.subtle. 
    // In Node (for scripts), we might need 'crypto' module.
    // For this portable utility, we'll try to use the SubtleCrypto API if available.
    
    try {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            enc.encode(secretKey),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("salt"), // Fixed salt for demo (bad practice in prod)
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            key,
            enc.encode(data)
        );

        const encryptedArray = new Uint8Array(encrypted);
        const combined = new Uint8Array(iv.length + encryptedArray.length);
        combined.set(iv);
        combined.set(encryptedArray, iv.length);

        return btoa(String.fromCharCode(...combined));
    } catch (e) {
        console.error("Encryption failed:", e);
        return "ENCRYPTION_FAILED";
    }
};

// Log Access
export const logCredentialAccess = async (username: string, action: string) => {
    try {
        console.log(`[AUDIT LOG] Action: ${action}, User: ${username}, Time: ${new Date().toISOString()}`);
        // In a real app environment, we would use supabase here.
        // But for this CLI script, we'll just log to console to avoid 'import.meta' issues in Node.
        /*
        const { error } = await supabase.from('audit_logs').insert({
            table_name: 'system_credentials',
            record_id: null,
            action: action,
            old_data: null,
            new_data: { username, timestamp: new Date().toISOString() },
            changed_by: null
        });
        if (error) console.error('Failed to log access:', error);
        */
    } catch (e) {
        console.error('Logging exception:', e);
    }
};
