-- Reset Password for krishna@aurahimalaya.org
DO $$
BEGIN
  -- Update auth.users encrypted_password
  UPDATE auth.users
  SET 
    encrypted_password = '$2b$12$LgJUYzuRtYDvc1DGD.CFtuV9PSJ/DWBFmVxY/w4VxQlLC7LoYBN6W',
    updated_at = now(),
    -- We set a metadata flag for forcing password change (app logic required to enforce this)
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{force_password_change}',
        'true'
    )
  WHERE email = 'krishna@aurahimalaya.org';

  -- Log the reset event to audit_logs
  INSERT INTO public.audit_logs (
    table_name,
    action,
    new_data
  ) VALUES (
    'auth.users',
    'PASSWORD_RESET',
    jsonb_build_object(
        'email', 'krishna@aurahimalaya.org', 
        'timestamp', now(),
        'reason', 'Manual administrative reset'
    )
  );
END $$;
