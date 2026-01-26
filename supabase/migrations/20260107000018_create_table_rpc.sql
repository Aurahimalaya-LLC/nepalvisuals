-- Create a system_logs table for auditing if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL,
    details JSONB,
    status TEXT
);

-- Create the self-healing RPC function
CREATE OR REPLACE FUNCTION public.check_and_create_featured_destinations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    table_exists BOOLEAN;
    result JSONB;
BEGIN
    -- 1. Check if table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'featured_destinations'
    ) INTO table_exists;

    -- 2. If exists, return success immediately
    IF table_exists THEN
        RETURN jsonb_build_object(
            'status', 'exists',
            'message', 'Table already exists'
        );
    END IF;

    -- 3. If missing, create the table
    -- Note: We use dynamic SQL but with hardcoded schema for security
    CREATE TABLE IF NOT EXISTS public.featured_destinations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        price TEXT,
        duration TEXT,
        rating NUMERIC(3, 1),
        link_url TEXT,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
    );

    -- 4. Enable RLS
    ALTER TABLE public.featured_destinations ENABLE ROW LEVEL SECURITY;

    -- 5. Create Policies (checking if they exist first to avoid errors)
    DO $policy$
    BEGIN
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'featured_destinations' 
            AND policyname = 'Allow public read access'
        ) THEN
            CREATE POLICY "Allow public read access" ON public.featured_destinations
                FOR SELECT TO public USING (true);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'featured_destinations' 
            AND policyname = 'Allow admin write access'
        ) THEN
            CREATE POLICY "Allow admin write access" ON public.featured_destinations
                FOR ALL TO authenticated USING (
                    EXISTS (
                        SELECT 1 FROM public.profiles
                        WHERE profiles.id = auth.uid()
                        AND profiles.role = 'admin'
                    )
                );
        END IF;
    END
    $policy$;

    -- 6. Seed Initial Data
    INSERT INTO public.featured_destinations (name, description, image_url, price, duration, rating, link_url, display_order)
    VALUES
        (
            'Everest Base Camp',
            'Stand at the foot of the world''s highest peak and experience Sherpa culture firsthand.',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDRhAgmyafMtZInsKcZjC6PERny9fQkTYXnQc2xe3Dn2hSTQ2D2bEPyiLHkfuqDOIamvdyHiV6lOBJgYm_mzEkiQeGcxj6XcjWqapph7IcKty8Mcbs7CdDGengbgwALm5rAVVQmydirCKo5JLlaeh-L3z0AJYecOSmxkI8TpR7pMITU12XLou8iXgEwQe7_3NbQK8rZDzw39TV_j5JnhmpBQ55T2U0LJGQROBZEKe8IxNVO4-xOcOfSMr99VgNtWGMAriy0J_zOV2il',
            '$1,200',
            '14 Days',
            4.9,
            '/trip/everest-base-camp',
            1
        ),
        (
            'Annapurna Circuit',
            'Traverse through diverse landscapes, from subtropical forests to alpine peaks.',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuCwWW3lEJ9YYM6nDdQ_clegxQ7nPWH-Trbv40arFyiafhUfI8TSQG1BbV5qC8CVnbZTdocnjJPmXxOW8gwfFA04Byy5vrMjRBD8rXQCFOAKi77ATkMO6rJbEN7truIDQj484smO4H2WPG9dNRmsDO33DoBkSP7HikkIFWIqYm89TDPRD-g9CAIz4zoCF_ixKAl_E7arOVyQ36V-Nl3tdG9w0ZAfFYMJZsq7qHFyh6AeiRd81D4QcIIVtWzZjZmBGyoIMmZ020UPJGo5',
            '$950',
            '12 Days',
            4.8,
            '/trip/annapurna-circuit',
            2
        ),
        (
            'Langtang Valley',
            'The valley of glaciers, offering stunning views and rich Tamang culture.',
            'https://lh3.googleusercontent.com/aida-public/AB6AXuB7oJvicfMYF2tTDspjyC_dNc6L_u3AS3u1gLba-Lnwk50u3YZOQu3BkxHIjp6qOm8t6-NdGiFKjAxtFwVL1N5XTTmnRQEsYogfMQZfRLPcoYucuMk0ybPhdPiwooV3LVT_bSwr3Ld2FpmTFJP4MwAgLfiztLA7j1qaUiTbpBEa-bWWzUGuIU_wFBqd0T-S_5J3Xle-0CUZZp84IdPuI3fpZyaG0t50baFmMaApe8X6CrvYDROuk7W1PI6KncjUpZ3zKUnhjmCd4hWa',
            '$800',
            '10 Days',
            4.7,
            '/trip/langtang-valley',
            3
        );

    -- 7. Log the creation
    INSERT INTO public.system_logs (action, details, status)
    VALUES ('CREATE_TABLE', '{"table": "featured_destinations"}', 'SUCCESS');

    RETURN jsonb_build_object(
        'status', 'created',
        'message', 'Table created and seeded successfully'
    );

EXCEPTION WHEN OTHERS THEN
    -- Log failure
    INSERT INTO public.system_logs (action, details, status)
    VALUES ('CREATE_TABLE_ERROR', jsonb_build_object('error', SQLERRM), 'FAILED');
    
    RETURN jsonb_build_object(
        'status', 'error',
        'message', SQLERRM
    );
END;
$$;
