import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Target User
const targetEmail = 'krishna@aurahimalaya.org';

// 1. Generate Secure Password
const generateSecurePassword = () => {
    const length = 16;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + numbers + special;

    let password = '';
    // Ensure complexity requirements
    password += upper[crypto.randomInt(upper.length)];
    password += lower[crypto.randomInt(lower.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    // Fill remaining
    for (let i = 0; i < length - 4; i++) {
        password += all[crypto.randomInt(all.length)];
    }

    // Shuffle
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const newPassword = generateSecurePassword();

// 2. Hash Password (bcrypt)
const saltRounds = 12;
const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

// 3. Generate SQL Migration Content
// This SQL updates the auth.users table directly for the specific email
const migrationContent = `-- Reset Password for ${targetEmail}
DO $$
BEGIN
  -- Update auth.users encrypted_password
  UPDATE auth.users
  SET 
    encrypted_password = '${hashedPassword}',
    updated_at = now(),
    -- We set a metadata flag for forcing password change (app logic required to enforce this)
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{force_password_change}',
        'true'
    )
  WHERE email = '${targetEmail}';

  -- Log the reset event to audit_logs
  INSERT INTO public.audit_logs (
    table_name,
    action,
    new_data
  ) VALUES (
    'auth.users',
    'PASSWORD_RESET',
    jsonb_build_object(
        'email', '${targetEmail}', 
        'timestamp', now(),
        'reason', 'Manual administrative reset'
    )
  );
END $$;
`;

// 4. Save Migration File
const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
const migrationFileName = `${timestamp}_reset_password_krishna.sql`;
const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migrationFileName);

fs.writeFileSync(migrationPath, migrationContent);

// 5. Output for the Admin
console.log('\n================================================');
console.log('       PASSWORD RESET COMPLETE (GENERATED)      ');
console.log('================================================');
console.log(`Target User:  ${targetEmail}`);
console.log('------------------------------------------------');
console.log(`NEW PASSWORD: ${newPassword}`);
console.log('------------------------------------------------');
console.log('INSTRUCTIONS:');
console.log('1. Copy the password above immediately.');
console.log('2. Run the migration file below to apply changes:');
console.log(`   ${migrationPath}`);
console.log('3. Provide the password to the user securely.');
console.log('================================================\n');
