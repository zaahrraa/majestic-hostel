import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Complaint, VisitorRequest, Notice } from "@/context/AuthContext";
import {
  Crown, LogOut, User, CreditCard, MessageSquare, Eye, Bell, Plus, CheckCircle,
  Clock, Loader2, Upload, FileCheck, Star, AlertCircle, Phone, MessageCircle,
  Receipt, ClipboardCheck, DollarSign, Download, Plane, Key, Save,
} from "lucide-react";
import { toast } from "sonner";
import InventoryGate from "@/components/dashboard/InventoryGate";

const WARDEN_PHONE = "03270844959";

const TABS = ["Overview", "Leave", "Fees", "Complaints", "Visitors", "Billing", "Clearance", "Notices", "Profile"] as const;
type Tab = typeof TABS[number];

interface BillingRecord {
  id: string; student_id: string; type: "fee" | "fine" | "extra_charge";
  description: string; amount: number; units?: number; rate?: number;
  status: "Pending" | "Paid" | "Waived"; created_at: string;
}
interface Voucher {
  id: string; billing_record_id?: string; voucher_url: string;
  notes?: string; status: "Pending" | "Verified" | "Rejected"; created_at: string;
}
interface ClearanceRequest {
  id: string; reason: string; status: "Pending" | "Approved" | "Rejected";
  warden_notes?: string; approved_at?: string; created_at: string; updated_at: string;
}
interface LeaveRequest {
  id: string; guardian_name: string; guardian_phone: string; destination: string;
  leaving_at: string; returning_at: string; status: "Pending" | "Approved" | "Rejected";
  warden_notes?: string; created_at: string;
}
interface Payment {
  id: string; description: string; amount: number; due_date: string | null;
  status: "Paid" | "Unpaid"; paid_at: string | null; created_at: string;
}

export default function StudentDashboard() {
  const { profile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Overview");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core data
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [visitors, setVisitors] = useState<VisitorRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [clearance, setClearance] = useState<ClearanceRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [inventoryVerified, setInventoryVerified] = useState<boolean>(true);
  const [dataLoading, setDataLoading] = useState(true);

  // Forms
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [visitor, setVisitor] = useState({ name: "", relation: "", date: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const [voucherNotes, setVoucherNotes] = useState("");
  const [clearanceReason, setClearanceReason] = useState("");
  const [submittingClearance, setSubmittingClearance] = useState(false);

  // Leave form
  const [leaveForm, setLeaveForm] = useState({
    guardian_name: "", guardian_phone: "", destination: "", leaving_at: "", returning_at: "",
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Profile edit
  const [profileEdit, setProfileEdit] = useState({ full_name: "", phone: "", university: "", guardian: "", guardian_phone: "", cnic: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!loading && !profile) navigate("/login");
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (!profile) return;
    setProfileEdit({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      university: profile.university || "",
      guardian: profile.guardian || "",
      guardian_phone: profile.guardian_phone || "",
      cnic: profile.cnic || "",
    });
    setInventoryVerified(((profile as any).inventory_verified ?? false) as boolean);
    fetchAll();
    const subs = [
      supabase.channel("sd-complaints").on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, fetchComplaints).subscribe(),
      supabase.channel("sd-visitors").on("postgres_changes", { event: "*", schema: "public", table: "visitor_requests" }, fetchVisitors).subscribe(),
      supabase.channel("sd-notices").on("postgres_changes", { event: "*", schema: "public", table: "notices" }, fetchNotices).subscribe(),
      supabase.channel("sd-billing").on("postgres_changes", { event: "*", schema: "public", table: "billing_records" }, fetchBilling).subscribe(),
      supabase.channel("sd-clearance").on("postgres_changes", { event: "*", schema: "public", table: "clearance_requests" }, fetchClearance).subscribe(),
      supabase.channel("sd-leaves").on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, fetchLeaves).subscribe(),
      supabase.channel("sd-payments").on("postgres_changes", { event: "*", schema: "public", table: "payments" }, fetchPayments).subscribe(),
    ];
    return () => { subs.forEach(s => supabase.removeChannel(s)); };
  }, [profile]);

  const fetchComplaints = async () => {
    if (!profile) return;
    const { data } = await supabase.from("complaints").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    if (data) setComplaints(data as Complaint[]);
  };
  const fetchVisitors = async () => {
    if (!profile) return;
    const { data } = await supabase.from("visitor_requests").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    if (data) setVisitors(data as VisitorRequest[]);
  };
  const fetchNotices = async () => {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    if (data) setNotices(data as Notice[]);
  };
  const fetchBilling = async () => {
    if (!profile) return;
    const { data } = await supabase.from("billing_records").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    if (data) setBilling(data as BillingRecord[]);
  };
  const fetchVouchers = async () => {
    if (!profile) return;
    const { data } = await supabase.from("payment_vouchers").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    if (data) setVouchers(data as Voucher[]);
  };
  const fetchClearance = async () => {
    if (!profile) return;
    const { data } = await supabase.from("clearance_requests").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    if (data) setClearance(data as ClearanceRequest[]);
  };
  const fetchLeaves = async () => {
    if (!profile) return;
    const { data } = await supabase.from("leave_requests").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    if (data) setLeaves(data as LeaveRequest[]);
  };
  const fetchPayments = async () => {
    if (!profile) return;
    const res = await supabase.from("payments").select("*").eq("student_id", profile.id).order("created_at", { ascending: false });
    console.log("[Payments] fetch", { data: res.data, error: res.error, status: res.status });
    if (res.error) toast.error("Failed to load fee ledger.");
    if (res.data) setPayments(res.data as Payment[]);
  };

  const fetchAll = async () => {
    setDataLoading(true);
    await Promise.all([fetchComplaints(), fetchVisitors(), fetchNotices(), fetchBilling(), fetchVouchers(), fetchClearance(), fetchLeaves(), fetchPayments()]);
    setDataLoading(false);
  };

  const submitComplaint = async () => {
    if (!complaintText.trim() || !profile) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("complaints").insert({ student_id: profile.id, title: complaintTitle.trim() || "General Complaint", description: complaintText.trim() });
    if (!error) { setComplaintTitle(""); setComplaintText(""); toast.success("Complaint submitted successfully!"); await fetchComplaints(); }
    else toast.error("Failed to submit complaint.");
    setSubmitting(false);
  };

  const submitVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitor.name || !visitor.relation || !visitor.date || !profile) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("visitor_requests").insert({ student_id: profile.id, visitor_name: visitor.name, relation: visitor.relation, visit_date: visitor.date });
    if (!error) { setVisitor({ name: "", relation: "", date: "" }); toast.success("Visitor request submitted!"); await fetchVisitors(); }
    else toast.error("Failed to submit visitor request.");
    setSubmitting(false);
  };

  const handleVoucherUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large. Max 5MB."); return; }
    setUploadingVoucher(true);
    const fileName = `${profile.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from("vouchers").upload(fileName, file);
    if (uploadError) { toast.error("Upload failed: " + uploadError.message); setUploadingVoucher(false); return; }
    const { data: urlData } = supabase.storage.from("vouchers").getPublicUrl(uploadData.path);
    const { error } = await supabase.from("payment_vouchers").insert({
      student_id: profile.id, voucher_url: urlData.publicUrl,
      billing_record_id: selectedBillingId || null, notes: voucherNotes.trim() || null,
    });
    if (!error) {
      toast.success("Payment voucher uploaded! Warden will verify it.");
      setSelectedBillingId(""); setVoucherNotes(""); await fetchVouchers();
    } else toast.error("Failed to save voucher record.");
    setUploadingVoucher(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submitClearance = async () => {
    if (!clearanceReason.trim() || !profile) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }
    setSubmittingClearance(true);
    const { error } = await supabase.from("clearance_requests").insert({ student_id: profile.id, reason: clearanceReason.trim() });
    if (!error) { setClearanceReason(""); toast.success("Clearance request submitted!"); await fetchClearance(); }
    else toast.error("Failed to submit clearance request.");
    setSubmittingClearance(false);
  };

  const submitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !leaveForm.guardian_name || !leaveForm.destination || !leaveForm.leaving_at || !leaveForm.returning_at) {
      toast.error("Please fill in all required fields before submitting.");
      return;
    }
    setSubmittingLeave(true);
    const { error } = await supabase.from("leave_requests").insert({
      student_id: profile.id,
      guardian_name: leaveForm.guardian_name.trim(),
      guardian_phone: leaveForm.guardian_phone.trim(),
      destination: leaveForm.destination.trim(),
      leaving_at: leaveForm.leaving_at,
      returning_at: leaveForm.returning_at,
    });
    if (!error) {
      setLeaveForm({ guardian_name: "", guardian_phone: "", destination: "", leaving_at: "", returning_at: "" });
      toast.success("Leave request submitted! Awaiting warden approval.");
      await fetchLeaves();
    } else toast.error("Failed to submit leave request.");
    setSubmittingLeave(false);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profileEdit.full_name.trim(),
      phone: profileEdit.phone.trim() || null,
      university: profileEdit.university.trim() || null,
      guardian: profileEdit.guardian.trim() || null,
      guardian_phone: profileEdit.guardian_phone.trim() || null,
      cnic: profileEdit.cnic.trim() || null,
    }).eq("user_id", profile.user_id);
    if (!error) toast.success("Profile updated successfully!");
    else toast.error("Failed to update profile.");
    setSavingProfile(false);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) { setNewPassword(""); toast.success("Password updated successfully!"); }
    else toast.error("Failed to update password: " + error.message);
    setSavingPassword(false);
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  const callWarden = () => {
    const url = `tel:${WARDEN_PHONE}`;
    console.log("[ContactWarden] tel link", url);
    toast.success("Opening dialer to call the warden…");
    window.location.href = url;
  };
  const whatsappWarden = () => {
    const msg = encodeURIComponent(`Hello Warden, this is ${profile?.full_name || "a student"} from Majestic Girls Hostel.`);
    const url = `https://wa.me/92${WARDEN_PHONE.replace(/^0/, "")}?text=${msg}`;
    console.log("[ContactWarden] whatsapp link", url);
    toast.success("Opening WhatsApp chat with the warden…");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const pendingBilling = billing.filter(b => b.status === "Pending");
  const totalDue = pendingBilling.reduce((s, b) => s + Number(b.amount), 0);
  const latestClearance = clearance[0];
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const approvedLeaves = leaves.filter(l => l.status === "Approved").length;

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-colors";

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Approved: "bg-green-500/10 text-green-600 dark:text-green-400",
      Resolved: "bg-green-500/10 text-green-600 dark:text-green-400",
      Verified: "bg-green-500/10 text-green-600 dark:text-green-400",
      Paid: "bg-green-500/10 text-green-600 dark:text-green-400",
      Featured: "bg-primary/10 text-primary",
      Rejected: "bg-destructive/10 text-destructive",
      Unpaid: "bg-destructive/10 text-destructive",
      Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      Waived: "bg-muted text-muted-foreground",
    };
    return map[status] || "bg-muted text-muted-foreground";
  };

  return (
    <>
      {!inventoryVerified && (
        <InventoryGate profileId={profile.id} onVerified={() => setInventoryVerified(true)} />
      )}
    <main className="min-h-screen pt-20 pb-12 px-4 md:px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
              <Crown className="w-7 h-7 text-background" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Welcome, {profile.full_name.split(" ")[0]}!</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200 text-sm font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 min-w-fit py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${tab === t ? "bg-card shadow-card text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
              {t === "Billing" && pendingBilling.length > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-[9px] px-1.5 py-0.5 rounded-full">{pendingBilling.length}</span>}
              {t === "Leave" && pendingLeaves > 0 && <span className="ml-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full">{pendingLeaves}</span>}
              {t === "Clearance" && latestClearance?.status === "Approved" && <span className="ml-1 bg-green-500/80 text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full">✓</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>

            {/* ── OVERVIEW ── */}
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: User, label: "Room", value: profile.room_number || "—", color: "text-primary" },
                    { icon: CreditCard, label: "Fee Status", value: profile.fee_status, color: profile.fee_status === "Paid" ? "text-green-500" : "text-destructive" },
                    { icon: DollarSign, label: "Amount Due", value: totalDue > 0 ? `PKR ${totalDue.toLocaleString()}` : "All Clear", color: totalDue > 0 ? "text-destructive" : "text-green-500" },
                    { icon: Plane, label: "Leave Status", value: pendingLeaves > 0 ? `${pendingLeaves} Pending` : approvedLeaves > 0 ? `${approvedLeaves} Approved` : "No Leaves", color: pendingLeaves > 0 ? "text-primary" : "text-green-500" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="card-cinematic p-5">
                      <Icon className={`w-5 h-5 ${color} mb-2`} />
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className={`font-bold text-sm mt-0.5 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Leaves Quick View */}
                {leaves.length > 0 && (
                  <div className="card-cinematic p-6">
                    <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                      <Plane className="w-4 h-4 text-primary" /> Recent Gate Pass / Leave
                    </h2>
                    <div className="space-y-2">
                      {leaves.slice(0, 3).map(l => (
                        <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <div>
                            <p className="text-sm font-medium">📍 {l.destination}</p>
                            <p className="text-xs text-muted-foreground">{new Date(l.leaving_at).toLocaleDateString()} → {new Date(l.returning_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(l.status)}`}>{l.status}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setTab("Leave")} className="mt-3 text-xs text-primary hover:underline">View all leave requests →</button>
                  </div>
                )}

                <div className="card-cinematic p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" /> Emergency Contact
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">Reach the warden instantly for any urgent issue.</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={callWarden}
                      className="btn-gold flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> Call Warden
                    </button>
                    <button onClick={whatsappWarden}
                      className="flex-1 px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-green-500/40 text-green-600 dark:text-green-400 hover:bg-green-500/10 transition-colors">
                      <MessageCircle className="w-4 h-4" /> WhatsApp Warden
                    </button>
                  </div>
                </div>

                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> My Profile</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[["Full Name", profile.full_name], ["University", profile.university || "—"], ["Phone", profile.phone || "—"], ["CNIC", profile.cnic || "—"], ["Guardian", profile.guardian || "—"], ["Guardian Phone", profile.guardian_phone || "—"], ["Booking Status", profile.booking_status], ["Joined", profile.join_date || "—"]].map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{k}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LEAVE / GATE PASS ── */}
            {tab === "Leave" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" /> Request Gate Pass / Leave
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">Fill in your leave details. The warden will approve or reject your request.</p>
                  <form onSubmit={submitLeave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Guardian Name *</label>
                      <input type="text" placeholder="e.g. Mrs. Khan" value={leaveForm.guardian_name}
                        onChange={e => setLeaveForm(p => ({ ...p, guardian_name: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Guardian Phone *</label>
                      <input type="tel" placeholder="e.g. 0300-0000000" value={leaveForm.guardian_phone}
                        onChange={e => setLeaveForm(p => ({ ...p, guardian_phone: e.target.value }))} required className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground block mb-1">Destination Address *</label>
                      <input type="text" placeholder="e.g. 45 Block J, Lahore" value={leaveForm.destination}
                        onChange={e => setLeaveForm(p => ({ ...p, destination: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Leaving Date & Time *</label>
                      <input type="datetime-local" value={leaveForm.leaving_at}
                        onChange={e => setLeaveForm(p => ({ ...p, leaving_at: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Returning Date & Time *</label>
                      <input type="datetime-local" value={leaveForm.returning_at}
                        onChange={e => setLeaveForm(p => ({ ...p, returning_at: e.target.value }))} required className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" disabled={submittingLeave}
                        className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                        {submittingLeave ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plane className="w-4 h-4" />} Submit Leave Request
                      </button>
                    </div>
                  </form>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">My Leave History</h3>
                  {dataLoading ? (
                    <div className="card-cinematic p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
                  ) : leaves.length === 0 ? (
                    <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No leave requests yet.</div>
                  ) : leaves.map((l) => (
                    <div key={l.id} className="card-cinematic p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">📍 {l.destination}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            🕐 {new Date(l.leaving_at).toLocaleString()} → {new Date(l.returning_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">👤 {l.guardian_name} · {l.guardian_phone}</p>
                          {l.warden_notes && <p className="text-xs text-muted-foreground mt-1 italic">Warden's Note: {l.warden_notes}</p>}
                          <p className="text-xs text-muted-foreground/60 mt-1">{new Date(l.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusBadge(l.status)}`}>
                          {l.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COMPLAINTS ── */}
            {tab === "Complaints" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4">Submit a Complaint</h2>
                  <div className="space-y-3">
                    <input type="text" placeholder="Complaint title (optional)" value={complaintTitle}
                      onChange={(e) => setComplaintTitle(e.target.value)} className={inputClass} />
                    <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="Describe your issue in detail…" rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none transition-colors" />
                  </div>
                  <button onClick={submitComplaint} disabled={submitting || !complaintText.trim()}
                    className="mt-3 btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Submit
                  </button>
                </div>
                <div className="space-y-3">
                  {complaints.length === 0 ? (
                    <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No complaints yet.</div>
                  ) : complaints.map((c) => (
                    <div key={c.id} className="card-cinematic p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{c.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${statusBadge(c.status)}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── VISITORS ── */}
            {tab === "Visitors" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4">Request Visitor Permission</h2>
                  <form onSubmit={submitVisitor} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Visitor Name *</label>
                      <input type="text" placeholder="Visitor's full name" value={visitor.name}
                        onChange={(e) => setVisitor(p => ({ ...p, name: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Relation *</label>
                      <input type="text" placeholder="Mother, Brother…" value={visitor.relation}
                        onChange={(e) => setVisitor(p => ({ ...p, relation: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Visit Date *</label>
                      <input type="date" value={visitor.date}
                        onChange={(e) => setVisitor(p => ({ ...p, date: e.target.value }))} required className={inputClass} />
                    </div>
                    <div className="sm:col-span-3">
                      <button type="submit" disabled={submitting}
                        className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Submit Request
                      </button>
                    </div>
                  </form>
                </div>
                <div className="space-y-3">
                  {visitors.length === 0 ? (
                    <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No visitor requests yet.</div>
                  ) : visitors.map((v) => (
                    <div key={v.id} className="card-cinematic p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{v.visitor_name}</p>
                        <p className="text-xs text-muted-foreground">{v.relation} · {new Date(v.visit_date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusBadge(v.status)}`}>{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BILLING ── */}
            {tab === "Billing" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Total Due", value: `PKR ${totalDue.toLocaleString()}`, color: totalDue > 0 ? "text-destructive" : "text-green-500" },
                    { label: "Paid Records", value: billing.filter(b => b.status === "Paid").length, color: "text-green-500" },
                    { label: "Pending Records", value: pendingBilling.length, color: "text-destructive" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="card-cinematic p-4 text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className={`font-bold text-lg mt-1 ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" /> Upload Payment Voucher
                  </h2>
                  <div className="space-y-3">
                    <select value={selectedBillingId} onChange={(e) => setSelectedBillingId(e.target.value)} className={inputClass}>
                      <option value="">— General Payment —</option>
                      {pendingBilling.map(b => <option key={b.id} value={b.id}>{b.description} — PKR {Number(b.amount).toLocaleString()}</option>)}
                    </select>
                    <input type="text" placeholder="Notes (optional)" value={voucherNotes} onChange={(e) => setVoucherNotes(e.target.value)} className={inputClass} />
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleVoucherUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploadingVoucher}
                      className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                      {uploadingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      {uploadingVoucher ? "Uploading…" : "Choose & Upload Receipt"}
                    </button>
                  </div>
                </div>
                {vouchers.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Uploaded Vouchers</h3>
                    {vouchers.map((v) => (
                      <div key={v.id} className="card-cinematic p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{v.notes || "Payment Receipt"}</p>
                            <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={v.voucher_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                            <Download className="w-3 h-3" /> View
                          </a>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(v.status)}`}>{v.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Billing History</h3>
                  {billing.length === 0 ? (
                    <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No billing records yet.</div>
                  ) : billing.map((b) => (
                    <div key={b.id} className="card-cinematic p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{b.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">{b.type.replace(/_/g, " ")} · {new Date(b.created_at).toLocaleDateString()}</p>
                        {b.units && <p className="text-xs text-muted-foreground">{b.units} units × PKR {b.rate}/unit</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">PKR {Number(b.amount).toLocaleString()}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(b.status)}`}>{b.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CLEARANCE ── */}
            {tab === "Clearance" && (
              <div className="space-y-4">
                {latestClearance?.status === "Approved" ? (
                  <div className="card-cinematic p-8 text-center border-green-500/30 bg-green-500/5">
                    <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Clearance Approved!</h2>
                    <p className="text-muted-foreground mb-2">Your clearance was approved on {new Date(latestClearance.approved_at || latestClearance.updated_at).toLocaleDateString()}</p>
                    {latestClearance.warden_notes && (
                      <div className="mt-4 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground">
                        <strong>Warden's Note:</strong> {latestClearance.warden_notes}
                      </div>
                    )}
                    <div className="mt-6 p-5 rounded-xl border border-green-500/30 bg-green-500/5 text-left max-w-sm mx-auto">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Digital Clearance Certificate</p>
                      <p className="font-display font-bold text-lg">{profile.full_name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email} · Room {profile.room_number || "—"}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">✓ Formally cleared by Majestic Girls Hostel</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {latestClearance?.status === "Pending" && (
                      <div className="card-cinematic p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3 mb-2"><AlertCircle className="w-5 h-5 text-primary" /><p className="font-semibold">Clearance Request Pending</p></div>
                        <p className="text-sm text-muted-foreground">Your request from {new Date(latestClearance.created_at).toLocaleDateString()} is under review.</p>
                        <p className="text-sm text-muted-foreground mt-1"><strong>Reason:</strong> {latestClearance.reason}</p>
                      </div>
                    )}
                    {(!latestClearance || latestClearance.status === "Rejected") && (
                      <div className="card-cinematic p-6">
                        <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" /> Request Clearance</h2>
                        <p className="text-sm text-muted-foreground mb-4">Submit a clearance request. The warden will review your full payment history before approval.</p>
                        <textarea value={clearanceReason} onChange={(e) => setClearanceReason(e.target.value)}
                          placeholder="Reason for clearance (e.g. graduated, moving out)…" rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none mb-3 transition-colors" />
                        <button onClick={submitClearance} disabled={submittingClearance || !clearanceReason.trim()}
                          className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                          {submittingClearance ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />} Submit Request
                        </button>
                      </div>
                    )}
                  </>
                )}
                {clearance.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Request History</h3>
                    {clearance.map((c) => (
                      <div key={c.id} className="card-cinematic p-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">{c.reason}</p>
                          <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</p>
                          {c.warden_notes && <p className="text-xs text-muted-foreground mt-1">Note: {c.warden_notes}</p>}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusBadge(c.status)}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── FEES LEDGER ── */}
            {tab === "Fees" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" /> Fee Status Ledger
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">All payments recorded by the warden, with live status from the database.</p>
                  {dataLoading ? (
                    <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
                  ) : payments.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">No payment records yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {payments.map((p) => {
                        const isPaid = p.status === "Paid";
                        return (
                          <div key={p.id}
                            className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${isPaid ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isPaid ? "bg-green-500" : "bg-destructive"}`} />
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{p.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {p.due_date ? `Due ${new Date(p.due_date).toLocaleDateString()}` : new Date(p.created_at).toLocaleDateString()}
                                  {isPaid && p.paid_at && ` · Paid ${new Date(p.paid_at).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-sm">PKR {Number(p.amount).toLocaleString()}</p>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge(p.status)}`}>{p.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── NOTICES ── */}
            {tab === "Notices" && (
              <div className="space-y-3">
                {notices.length === 0 ? (
                  <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No notices posted yet.</div>
                ) : notices.map((n) => (
                  <div key={n.id} className={`card-cinematic p-5 ${n.important ? "border-destructive/20 bg-destructive/5" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {n.important && <span className="text-xs font-bold text-destructive uppercase tracking-widest">⚠ Important</span>}
                      <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold">{n.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── PROFILE ── */}
            {tab === "Profile" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Edit Profile</h2>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> Email is read-only and cannot be changed by students.
                  </p>
                  <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Email (read-only)</label>
                      <input type="email" value={profile.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed bg-muted/30`} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Full Name *</label>
                      <input type="text" value={profileEdit.full_name}
                        onChange={e => setProfileEdit(p => ({ ...p, full_name: e.target.value }))} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Phone</label>
                      <input type="tel" value={profileEdit.phone}
                        onChange={e => setProfileEdit(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">University</label>
                      <input type="text" value={profileEdit.university}
                        onChange={e => setProfileEdit(p => ({ ...p, university: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">CNIC</label>
                      <input type="text" placeholder="XXXXX-XXXXXXX-X" value={profileEdit.cnic}
                        onChange={e => setProfileEdit(p => ({ ...p, cnic: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Guardian Name</label>
                      <input type="text" value={profileEdit.guardian}
                        onChange={e => setProfileEdit(p => ({ ...p, guardian: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Guardian Phone</label>
                      <input type="tel" value={profileEdit.guardian_phone}
                        onChange={e => setProfileEdit(p => ({ ...p, guardian_phone: e.target.value }))} className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" disabled={savingProfile}
                        className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                      </button>
                    </div>
                  </form>
                </div>

                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Change Password</h2>
                  <form onSubmit={savePassword} className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">New Password (min 6 characters)</label>
                      <input type="password" placeholder="Enter new password" value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} minLength={6} required className={inputClass} />
                    </div>
                    <button type="submit" disabled={savingPassword || newPassword.length < 6}
                      className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                      {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Update Password
                    </button>
                  </form>
                </div>

                {/* Review Section */}
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Leave a Review</h2>
                  <ReviewForm profileId={profile.id} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
    </>
  );
}

// ── Inline ReviewForm ──
function ReviewForm({ profileId }: { profileId: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({ student_id: profileId, rating, review_text: text.trim() });
    if (!error) { setText(""); toast.success("Review submitted! Awaiting warden approval."); }
    else toast.error("Failed to submit review.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" onClick={() => setRating(i)}>
            <Star className={`w-6 h-6 transition-colors ${i <= rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience at Majestic Girls Hostel…" rows={3}
        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none transition-colors" />
      <button type="submit" disabled={submitting || !text.trim()}
        className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />} Submit Review
      </button>
    </form>
  );
}
