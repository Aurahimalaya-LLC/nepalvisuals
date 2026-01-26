import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 1. Generate Email
const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
const email = `admin_${timestamp}@domain.com`;

// 2. Generate Strong Password
const generateStrongPassword = () => {
    const length = 16;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + numbers + special;

    let password = '';
    // Ensure complexity
    password += upper[crypto.randomInt(upper.length)];
    password += lower[crypto.randomInt(lower.length)];
    password += numbers[crypto.randomInt(numbers.length)];
    password += special[crypto.randomInt(special.length)];

    for (let i = 0; i < length - 4; i++) {
        password += all[crypto.randomInt(all.length)];
    }

    // Shuffle
    return password.split('').sort(() => 0.5 - Math.random()).join('');
};

const password = generateStrongPassword();

// 3. Hash Password
const saltRounds = 12;
const hashedPassword = bcrypt.hashSync(password, saltRounds);

// 4. Generate SQL Migration
const migrationContent = `-- Seed Super Admin User
DO $$
DECLARE
  new_user_id uuid := uuid_generate_v4();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_super_admin
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    '${email}',
    '${hashedPassword}',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    now(),
    now(),
    '',
    '',
    '',
    '',
    true
  );

  -- Insert into public.profiles
  -- Note: The handle_new_user trigger might run, but we want to ensure role is Super Admin.
  -- We'll use ON CONFLICT UPDATE to overwrite if the trigger beat us, or insert if not.
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    new_user_id,
    '${email}',
    'Super Admin',
    'Super Admin',
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'Super Admin',
    status = 'Active';
    
END $$;
`;

// Write Migration File
const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260107000013_seed_super_admin.sql');
fs.writeFileSync(migrationPath, migrationContent);

console.log('\n================================================');
console.log('       SUPER ADMIN ACCOUNT GENERATED        ');
console.log('================================================');
console.log(`Email:    ${email}`);
console.log(`Password: ${password}`);
console.log('------------------------------------------------');
console.log(`Migration file created at:`);
console.log(migrationPath);
console.log('------------------------------------------------');
console.log('IMPORTANT: Run "supabase db reset" or apply the migration');
console.log('to active this account in your local/production database.');
console.log('================================================\n');
