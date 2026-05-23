import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify the caller is an authenticated warden
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use anon client to check the caller's role
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userErr } = await anonClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: roleData } = await anonClient.rpc("get_user_role", { uid: user.id });
  if (roleData !== "warden") {
    return new Response(JSON.stringify({ error: "Only wardens can create students" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse and validate body
  const body = await req.json().catch(() => null);
  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { full_name, email, password, phone, cnic, university, room_type } = body;

  if (!full_name?.trim() || !email?.trim() || !password?.trim()) {
    return new Response(JSON.stringify({ error: "full_name, email and password are required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use service role to create auth user
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: password.trim(),
    email_confirm: true,
  });

  if (authError || !newUser?.user) {
    return new Response(JSON.stringify({ error: authError?.message ?? "Failed to create auth user" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = newUser.user.id;

  // Insert profile row
  const { error: profileError } = await adminClient.from("profiles").insert({
    user_id: userId,
    email: email.trim().toLowerCase(),
    full_name: full_name.trim(),
    role: "student",
    phone: phone?.trim() || null,
    cnic: cnic?.trim() || null,
    university: university?.trim() || null,
    room_number: room_type?.trim() || null,
    fee_status: "Pending",
    booking_status: "Active",
    join_date: new Date().toISOString().split("T")[0],
  });

  if (profileError) {
    // Roll back auth user creation if profile fails
    await adminClient.auth.admin.deleteUser(userId);
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, user_id: userId }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
