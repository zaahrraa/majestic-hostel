import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: "student" | "warden";
  room_number: string | null;
  phone: string | null;
  university: string | null;
  cnic: string | null;
  guardian: string | null;
  guardian_phone: string | null;
  fee_status: "Paid" | "Pending";
  booking_status: "Active" | "Pending" | "Approved";
  join_date: string | null;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  important: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  student_id: string;
  title: string;
  description: string;
  status: "Pending" | "Resolved";
  created_at: string;
}

export interface VisitorRequest {
  id: string;
  student_id: string;
  visitor_name: string;
  relation: string;
  visit_date: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  loading: boolean;
  loginStudent: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWarden: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          // Defer Supabase call to avoid deadlock
          setTimeout(() => fetchProfile(sess.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Then get existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchProfile(sess.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginStudent = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (!prof || prof.role !== "student") {
      await supabase.auth.signOut();
      return { success: false, error: "This account is not a student account." };
    }
    setUser(data.user);
    setSession(data.session);
    await fetchProfile(data.user.id);
    return { success: true };
  };

  const loginWarden = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    if (!prof || prof.role !== "warden") {
      await supabase.auth.signOut();
      return { success: false, error: "This account is not a warden account." };
    }
    setUser(data.user);
    setSession(data.session);
    await fetchProfile(data.user.id);
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoggedIn: !!user,
        loading,
        loginStudent,
        loginWarden,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
