// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase URL or Service Role Key");
    }

    // Admin client with service role to bypass RLS securely on the backend
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Security Check: Verify User is Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing Authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    
    if (userError || !user) throw new Error('Invalid Token');

    const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    if (!profile || !['Admin', 'Super Admin'].includes(profile.role)) {
        throw new Error('Unauthorized: Admin access required');
    }

    // Handle Actions (Update/Create/Delete)
    if (req.method === "POST") {
        const body = await req.json();
        const { action, table = 'bookings', id, data: payload, match } = body;

        // Sanitize payload (remove guest_count if present)
        if (payload && typeof payload === 'object' && 'guest_count' in payload) {
            delete payload.guest_count;
        }

        let query = admin.from(table);
        let result;

        if (action === 'update') {
            result = await query.update(payload).eq('id', id).select().single();
        } else if (action === 'create') {
            const q = query.insert(payload).select();
            // Only use single() if payload is not an array
            if (!Array.isArray(payload)) {
                result = await q.single();
            } else {
                result = await q;
            }
        } else if (action === 'delete') {
            if (match) {
                 result = await query.delete().match(match);
            } else {
                 result = await query.delete().eq('id', id);
            }
        } else {
            throw new Error(`Unknown action: ${action}`);
        }

        if (result.error) throw result.error;

        return new Response(
            JSON.stringify({ success: true, data: result.data }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
    }

    // Default: GET (Fetch All Bookings)
    const { data, error } = await admin
      .from("bookings")
      .select(`
        *,
        customers (name, email),
        profiles (full_name, email),
        tours (name),
        booking_travelers (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Failed to fetch bookings");
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("admin-get-bookings error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
