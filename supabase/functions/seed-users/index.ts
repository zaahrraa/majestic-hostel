import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACCOUNTS = [
  {
    email: "admin@demo.com",
    password: "pw@1234",
    profile: {
      full_name: "Hostel Warden",
      role: "warden",
      room_number: null,
      phone: "0327-0844959",
      university: null,
      cnic: null,
      guardian: null,
      guardian_phone: null,
      fee_status: "Paid",
      booking_status: "Active",
      join_date: new Date().toISOString().split("T")[0],
    },
  },
  {
    email: "jannat123@gmail.com",
    password: "student123",
    profile: {
      full_name: "Jannat Rasool",
      role: "student",
      room_number: "3 Seater",
      phone: "0306-7890123",
      university: "Kinnaird College",
      cnic: "35202-7890123-4",
      guardian: "Mr. Rasool",
      guardian_phone: "0327-3210987",
      fee_status: "Paid",
      booking_status: "Active",
      join_date: "2025-03-15",
    },
  },
  {
    email: "ayesha.khan@gmail.com",
    password: "student123",
    profile: {
      full_name: "Ayesha Khan",
      role: "student",
      room_number: "1 Seater",
      phone: "0300-1234567",
      university: "COMSATS University",
      cnic: "35202-1234567-8",
      guardian: "Mr. Khan",
      guardian_phone: "0321-9876543",
      fee_status: "Paid",
      booking_status: "Active",
      join_date: "2025-01-15",
    },
  },
  {
    email: "fatimaali@gmail.com",
    password: "student123",
    profile: {
      full_name: "Fatima Ali",
      role: "student",
      room_number: "2 Seater",
      phone: "0301-2345678",
      university: "COMSATS University",
      cnic: "35202-2345678-9",
      guardian: "Mr. Ali",
      guardian_phone: "0322-8765432",
      fee_status: "Pending",
      booking_status: "Active",
      join_date: "2025-02-10",
    },
  },
  {
    email: "hira.ahmed@gmail.com",
    password: "student123",
    profile: {
      full_name: "Hira Ahmed",
      role: "student",
      room_number: "3 Seater",
      phone: "0302-3456789",
      university: "UET Lahore",
      cnic: "35202-3456789-0",
      guardian: "Mr. Ahmed",
      guardian_phone: "0323-7654321",
      fee_status: "Paid",
      booking_status: "Active",
      join_date: "2025-01-20",
    },
  },
  {
    email: "sana.malik@gmail.com",
    password: "student123",
    profile: {
      full_name: "Sana Malik",
      role: "student",
      room_number: "2 Seater",
      phone: "0303-4567890",
      university: "LUMS",
      cnic: "35202-4567890-1",
      guardian: "Mr. Malik",
      guardian_phone: "0324-6543210",
      fee_status: "Pending",
      booking_status: "Active",
      join_date: "2025-03-05",
    },
  },
  {
    email: "zainab.tariq@gmail.com",
    password: "student123",
    profile: {
      full_name: "Zainab Tariq",
      role: "student",
      room_number: "1 Seater",
      phone: "0304-5678901",
      university: "Punjab University",
      cnic: "35202-5678901-2",
      guardian: "Mr. Tariq",
      guardian_phone: "0325-5432109",
      fee_status: "Paid",
      booking_status: "Active",
      join_date: "2025-01-08",
    },
  },
  {
    email: "mahnoor@gmail.com",
    password: "student123",
    profile: {
      full_name: "Mahnoor Sheikh",
      role: "student",
      room_number: "3 Seater",
      phone: "0305-6789012",
      university: "FAST NUCES",
      cnic: "35202-6789012-3",
      guardian: "Mr. Sheikh",
      guardian_phone: "0326-4321098",
      fee_status: "Pending",
      booking_status: "Active",
      join_date: "2025-02-28",
    },
  },
  {
    email: "komal.iqbal@gmail.com",
    password: "student123",
    profile: {
      full_name: "Komal Iqbal",
      role: "student",
      room_number: "2 Seater",
      phone: "0307-8901234",
      university: "Lahore College",
      cnic: "35202-8901234-5",
      guardian: "Mr. Iqbal",
      guardian_phone: "0328-2109876",
      fee_status: "Pending",
      booking_status: "Active",
      join_date: "2025-04-01",
    },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results = [];

  for (const account of ACCOUNTS) {
    // Check if auth user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const exists = existingUsers?.users?.find((u) => u.email === account.email);

    let userId: string;

    if (exists) {
      userId = exists.id;
      results.push({ email: account.email, status: "already_exists", userId });
    } else {
      // Create auth user
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      });

      if (authError || !newUser?.user) {
        results.push({ email: account.email, status: "auth_error", error: authError?.message });
        continue;
      }
      userId = newUser.user.id;
      results.push({ email: account.email, status: "created", userId });
    }

    // Upsert profile
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        email: account.email,
        ...account.profile,
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      results.push({ email: account.email, status: "profile_error", error: profileError.message });
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
