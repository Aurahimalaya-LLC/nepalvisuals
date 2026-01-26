-- Seed Super Admin User
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
    'admin_20260107064654@domain.com',
    '$2b$12$YGFg4n7xbEEmg7XVDELEEOuNd48wbkGmpUouKErzBHYePYhHotOpW',
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
    'admin_20260107064654@domain.com',
    'Super Admin',
    'Super Admin',
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'Super Admin',
    status = 'Active';
    
END $$;
