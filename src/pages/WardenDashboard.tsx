import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Notice, Complaint, VisitorRequest } from "@/context/AuthContext";
import {
  Shield, LogOut, Users, MessageSquare, Eye, Bell, Plus, Trash2,
  CheckCircle, X, TrendingUp, Loader2, Package, UserPlus, Lock,
  DollarSign, Receipt, ClipboardCheck,
  Star, CreditCard, FileCheck, ChevronDown, ChevronUp,
  Plane, BookOpen, Image, Home, Search, Key, Save, Pencil, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

const TABS = [
  "Overview", "Leave", "Bookings", "Students", "Billing",
  "Clearance", "Visitors", "Complaints", "Notices", "Reviews", "Staff", "CMS", "Profile",
] as const;
type Tab = typeof TABS[number];

interface BookingRow {
  id: string; full_name: string; email: string; phone: string;
  room_type: string; university: string; guardian: string | null;
  cnic: string | null; move_in_date: string | null;
  status: "Pending" | "Confirmed" | "Rejected"; created_at: string;
}
interface BillingRecord {
  id: string; student_id: string; type: "fee" | "fine" | "extra_charge";
  description: string; amount: number; units?: number; rate?: number;
  status: "Pending" | "Paid" | "Waived"; created_at: string; student_name?: string;
}
interface Voucher {
  id: string; student_id: string; billing_record_id?: string;
  voucher_url: string; notes?: string; status: "Pending" | "Verified" | "Rejected";
  created_at: string; student_name?: string;
}
interface ClearanceRequest {
  id: string; student_id: string; reason: string;
  status: "Pending" | "Approved" | "Rejected"; warden_notes?: string;
  approved_at?: string; created_at: string; student_name?: string;
  student_email?: string; student_room?: string;
}
interface Review {
  id: string; student_id: string; rating: number; review_text: string;
  status: "Pending" | "Featured" | "Rejected"; created_at: string; student_name?: string;
}
interface LeaveRequest {
  id: string; student_id: string; guardian_name: string; guardian_phone: string;
  destination: string; leaving_at: string; returning_at: string;
  status: "Pending" | "Approved" | "Rejected"; warden_notes?: string;
  created_at: string; student_name?: string;
}
interface HostelRule { id: string; icon: string; title: string; description: string; sort_order: number; }
interface RoomListing {
  id: string; title: string; room_type: string; description: string; image_url: string | null;
  badge: string | null; badge_color: string | null; features: string[];
  capacity: number; availability_status: string; sort_order: number;
}
interface GalleryImage { id: string; src: string; alt: string; category: string; sort_order: number; }

const EMPTY_STUDENT = { full_name: "", email: "", password: "", phone: "", cnic: "", university: "", room_type: "" };
const EMPTY_BILLING = { student_id: "", type: "fee" as "fee" | "fine" | "extra_charge", description: "", amount: "", units: "", rate: "" };
const EMPTY_RULE = { icon: "📋", title: "", description: "" };

export default function WardenDashboard() {
  const { profile, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Overview");
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Data
  const [students, setStudents] = useState<Profile[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [complaints, setComplaints] = useState<Array<Complaint & { student_name?: string }>>([]);
  const [visitors, setVisitors] = useState<Array<VisitorRequest & { student_name?: string }>>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [clearance, setClearance] = useState<ClearanceRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [rules, setRules] = useState<HostelRule[]>([]);
  const [roomListings, setRoomListings] = useState<RoomListing[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [staff, setStaff] = useState<Array<{ id: string; name: string; role: string; timing: string; created_at: string }>>([]);
  const [newStaff, setNewStaff] = useState({ name: "", role: "", timing: "" });
  const [addingStaff, setAddingStaff] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // UI state
  const [newNotice, setNewNotice] = useState({ title: "", content: "", important: false });
  const [submitting, setSubmitting] = useState(false);
  const [noticeErrors, setNoticeErrors] = useState({ title: false, content: false });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState(EMPTY_STUDENT);
  const [addingStudent, setAddingStudent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newBilling, setNewBilling] = useState(EMPTY_BILLING);
  const [addingBilling, setAddingBilling] = useState(false);
  const [expandedClearance, setExpandedClearance] = useState<string | null>(null);
  const [clearanceBilling, setClearanceBilling] = useState<Record<string, BillingRecord[]>>({});
  const [wardenNote, setWardenNote] = useState("");
  const [processingClearance, setProcessingClearance] = useState<string | null>(null);
  const [processingLeave, setProcessingLeave] = useState<string | null>(null);
  const [leaveNote, setLeaveNote] = useState("");

  // CMS state
  const [editingRule, setEditingRule] = useState<HostelRule | null>(null);
  const [newRule, setNewRule] = useState(EMPTY_RULE);
  const [addingRule, setAddingRule] = useState(false);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [updatingRoom, setUpdatingRoom] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [newGallery, setNewGallery] = useState({ alt: "", category: "Building" });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentBilling, setStudentBilling] = useState<BillingRecord[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<LeaveRequest[]>([]);
  const [studentComplaints, setStudentComplaints] = useState<Complaint[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Warden profile
  const [wardenEmail, setWardenEmail] = useState("");
  const [wardenPassword, setWardenPassword] = useState("");
  const [savingWardenProfile, setSavingWardenProfile] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "warden")) navigate("/warden-login");
  }, [loading, profile, navigate]);

  useEffect(() => {
    if (!profile || profile.role !== "warden") return;
    setWardenEmail(profile.email || "");
    fetchAll();
    const subs = [
      supabase.channel("wd-complaints").on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, fetchComplaints).subscribe(),
      supabase.channel("wd-visitors").on("postgres_changes", { event: "*", schema: "public", table: "visitor_requests" }, fetchVisitors).subscribe(),
      supabase.channel("wd-notices").on("postgres_changes", { event: "*", schema: "public", table: "notices" }, fetchNotices).subscribe(),
      supabase.channel("wd-bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchBookings).subscribe(),
      supabase.channel("wd-students").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchStudents).subscribe(),
      supabase.channel("wd-billing").on("postgres_changes", { event: "*", schema: "public", table: "billing_records" }, fetchBilling).subscribe(),
      supabase.channel("wd-vouchers").on("postgres_changes", { event: "*", schema: "public", table: "payment_vouchers" }, fetchVouchers).subscribe(),
      supabase.channel("wd-clearance").on("postgres_changes", { event: "*", schema: "public", table: "clearance_requests" }, fetchClearance).subscribe(),
      supabase.channel("wd-reviews").on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, fetchReviews).subscribe(),
      supabase.channel("wd-leaves").on("postgres_changes", { event: "*", schema: "public", table: "leave_requests" }, fetchLeaves).subscribe(),
      supabase.channel("wd-rules").on("postgres_changes", { event: "*", schema: "public", table: "hostel_rules" }, fetchRules).subscribe(),
      supabase.channel("wd-rooms").on("postgres_changes", { event: "*", schema: "public", table: "room_listings" }, fetchRoomListings).subscribe(),
      supabase.channel("wd-gallery").on("postgres_changes", { event: "*", schema: "public", table: "gallery_images" }, fetchGallery).subscribe(),
      supabase.channel("wd-staff").on("postgres_changes", { event: "*", schema: "public", table: "staff" }, fetchStaff).subscribe(),
    ];
    return () => { subs.forEach(s => supabase.removeChannel(s)); };
  }, [profile]);

  const fetchStudents = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("role", "student").order("full_name");
    if (data) setStudents(data as Profile[]);
  };
  const fetchNotices = async () => {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    if (data) setNotices(data as Notice[]);
  };
  const fetchComplaints = async () => {
    const { data } = await supabase.from("complaints").select("*, profiles(full_name)").order("created_at", { ascending: false });
    if (data) setComplaints(data.map((c: any) => ({ ...c, student_name: c.profiles?.full_name ?? "Unknown" })));
  };
  const fetchVisitors = async () => {
    const { data } = await supabase.from("visitor_requests").select("*, profiles(full_name)").order("created_at", { ascending: false });
    if (data) setVisitors(data.map((v: any) => ({ ...v, student_name: v.profiles?.full_name ?? "Unknown" })));
  };
  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (data) setBookings(data as BookingRow[]);
  };
  const fetchBilling = async () => {
    const { data } = await supabase.from("billing_records").select("*, profiles(full_name)").order("created_at", { ascending: false });
    if (data) setBilling(data.map((b: any) => ({ ...b, student_name: b.profiles?.full_name ?? "Unknown" })));
  };
  const fetchVouchers = async () => {
    const { data } = await supabase.from("payment_vouchers").select("*, profiles(full_name)").order("created_at", { ascending: false });
    if (data) setVouchers(data.map((v: any) => ({ ...v, student_name: v.profiles?.full_name ?? "Unknown" })));
  };
  const fetchClearance = async () => {
    const { data } = await supabase.from("clearance_requests").select("*, profiles(full_name, email, room_number)").order("created_at", { ascending: false });
    if (data) setClearance(data.map((c: any) => ({ ...c, student_name: c.profiles?.full_name ?? "Unknown", student_email: c.profiles?.email, student_room: c.profiles?.room_number })));
  };
  const fetchReviews = async () => {
    const { data } = await supabase.from("reviews").select("*, profiles(full_name)").order("created_at", { ascending: false });
    if (data) setReviews(data.map((r: any) => ({ ...r, student_name: r.profiles?.full_name ?? "Anonymous" })));
  };
  const fetchLeaves = async () => {
    const { data } = await supabase.from("leave_requests").select("*, profiles(full_name)").order("created_at", { ascending: false });
    if (data) setLeaves(data.map((l: any) => ({ ...l, student_name: l.profiles?.full_name ?? "Unknown" })));
  };
  const fetchRules = async () => {
    const { data } = await supabase.from("hostel_rules").select("*").order("sort_order");
    if (data) setRules(data as HostelRule[]);
  };
  const fetchRoomListings = async () => {
    const { data } = await supabase.from("room_listings").select("*").order("sort_order");
    if (data) setRoomListings(data as RoomListing[]);
  };
  const fetchGallery = async () => {
    const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
    if (data) setGalleryImages(data as GalleryImage[]);
  };
  const fetchStaff = async () => {
    const res = await supabase.from("staff").select("*").order("created_at", { ascending: false });
    console.log("[Staff] fetch", { data: res.data, error: res.error, status: res.status });
    if (res.error) toast.error("Failed to load staff list.");
    if (res.data) setStaff(res.data as any);
  };

  const fetchAll = async () => {
    setDataLoading(true);
    await Promise.all([
      fetchStudents(), fetchNotices(), fetchComplaints(), fetchVisitors(), fetchBookings(),
      fetchBilling(), fetchVouchers(), fetchClearance(), fetchReviews(),
      fetchLeaves(), fetchRules(), fetchRoomListings(), fetchGallery(), fetchStaff(),
    ]);
    setDataLoading(false);
  };

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.role.trim() || !newStaff.timing.trim()) {
      toast.error("Please fill name, role and timing.");
      return;
    }
    setAddingStaff(true);
    console.log("[Staff] insert", newStaff);
    const res = await supabase.from("staff").insert({
      name: newStaff.name.trim(), role: newStaff.role.trim(), timing: newStaff.timing.trim(),
    }).select();
    console.log("[Staff] response", { data: res.data, error: res.error, status: res.status });
    if (res.error) toast.error("Failed to add staff: " + res.error.message);
    else {
      toast.success("Staff Added Successfully");
      setNewStaff({ name: "", role: "", timing: "" });
      await fetchStaff();
    }
    setAddingStaff(false);
  };
  const deleteStaff = async (id: string) => {
    const res = await supabase.from("staff").delete().eq("id", id);
    console.log("[Staff] delete", { error: res.error, status: res.status });
    if (res.error) toast.error("Failed to remove staff.");
    else { toast.success("Staff removed."); fetchStaff(); }
  };

  const handleLogout = async () => { await logout(); navigate("/"); };

  // --- Actions ---
  const approveVisitor = async (id: string) => {
    await supabase.from("visitor_requests").update({ status: "Approved" }).eq("id", id);
    toast.success("Visitor approved!"); fetchVisitors();
  };
  const rejectVisitor = async (id: string) => {
    await supabase.from("visitor_requests").update({ status: "Rejected" }).eq("id", id);
    toast.success("Visitor rejected."); fetchVisitors();
  };
  const resolveComplaint = async (id: string) => {
    await supabase.from("complaints").update({ status: "Resolved" }).eq("id", id);
    toast.success("Complaint resolved!"); fetchComplaints();
  };
  const updateFeeStatus = async (id: string, current: "Paid" | "Pending") => {
    const next = current === "Paid" ? "Pending" : "Paid";
    await supabase.from("profiles").update({ fee_status: next }).eq("id", id);
    toast.success(`Fee → ${next}`); fetchStudents();
  };
  const updateBookingStatus = async (id: string, status: "Confirmed" | "Rejected") => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    toast.success(`Booking ${status.toLowerCase()}!`); fetchBookings();
  };
  const postNotice = async () => {
    const titleEmpty = !newNotice.title.trim();
    const contentEmpty = !newNotice.content.trim();
    if (titleEmpty || contentEmpty) {
      setNoticeErrors({ title: titleEmpty, content: contentEmpty });
      toast.error("Please fill in both the Title and Message before posting!", { duration: 3000 });
      return;
    }
    setNoticeErrors({ title: false, content: false });
    setSubmitting(true);
    const { error } = await supabase.from("notices").insert({ title: newNotice.title.trim(), content: newNotice.content.trim(), important: newNotice.important });
    if (!error) { setNewNotice({ title: "", content: "", important: false }); toast.success("Notice posted!"); await fetchNotices(); }
    else toast.error("Failed to post notice.");
    setSubmitting(false);
  };
  const deleteNotice = async (id: string) => {
    await supabase.from("notices").delete().eq("id", id);
    toast.success("Notice deleted.");
  };
  const verifyVoucher = async (id: string, status: "Verified" | "Rejected") => {
    await supabase.from("payment_vouchers").update({ status }).eq("id", id);
    toast.success(`Voucher ${status.toLowerCase()}!`); fetchVouchers();
  };
  const addBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBilling.student_id || !newBilling.description || !newBilling.amount) return;
    setAddingBilling(true);
    const units = newBilling.units ? parseFloat(newBilling.units) : null;
    const rate = newBilling.rate ? parseFloat(newBilling.rate) : null;
    const amount = units && rate ? units * rate : parseFloat(newBilling.amount);
    const { error } = await supabase.from("billing_records").insert({ student_id: newBilling.student_id, type: newBilling.type, description: newBilling.description, amount, units, rate });
    if (!error) { setNewBilling(EMPTY_BILLING); toast.success("Billing record added!"); await fetchBilling(); }
    else toast.error("Failed to add billing record.");
    setAddingBilling(false);
  };
  const markBillingPaid = async (id: string) => {
    await supabase.from("billing_records").update({ status: "Paid" }).eq("id", id);
    toast.success("Marked as paid!"); fetchBilling();
  };
  const loadStudentBilling = async (studentId: string) => {
    if (clearanceBilling[studentId]) return;
    const { data } = await supabase.from("billing_records").select("*").eq("student_id", studentId).order("created_at", { ascending: false });
    if (data) setClearanceBilling(prev => ({ ...prev, [studentId]: data as BillingRecord[] }));
  };
  const toggleClearanceDetail = async (cr: ClearanceRequest) => {
    if (expandedClearance === cr.id) { setExpandedClearance(null); return; }
    setExpandedClearance(cr.id);
    await loadStudentBilling(cr.student_id);
  };
  const processClearance = async (id: string, status: "Approved" | "Rejected") => {
    setProcessingClearance(id);
    const updates: any = { status };
    if (wardenNote.trim()) updates.warden_notes = wardenNote.trim();
    if (status === "Approved") updates.approved_at = new Date().toISOString();
    const { error } = await supabase.from("clearance_requests").update(updates).eq("id", id);
    if (error) { toast.error("Failed."); setProcessingClearance(null); return; }
    toast.success(`Clearance ${status.toLowerCase()}!`);
    setExpandedClearance(null); setWardenNote(""); setProcessingClearance(null); fetchClearance();
  };
  const processLeave = async (id: string, status: "Approved" | "Rejected") => {
    setProcessingLeave(id);
    const updates: any = { status };
    if (leaveNote.trim()) updates.warden_notes = leaveNote.trim();
    // Optimistic UI: badge color updates immediately
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status, warden_notes: updates.warden_notes ?? l.warden_notes } : l));
    const res = await supabase.from("leave_requests").update(updates).eq("id", id).select();
    console.log("[GatePass] update", { id, status, data: res.data, error: res.error, status_code: res.status });
    if (res.error) { toast.error("Failed."); setProcessingLeave(null); fetchLeaves(); return; }
    toast.success(`Leave ${status.toLowerCase()}!`);
    setLeaveNote(""); setProcessingLeave(null); fetchLeaves();
  };
  const updateReviewStatus = async (id: string, status: "Featured" | "Rejected") => {
    await supabase.from("reviews").update({ status }).eq("id", id);
    toast.success(`Review ${status.toLowerCase()}!`); fetchReviews();
  };
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.full_name.trim() || !newStudent.email.trim() || !newStudent.password.trim()) return;
    setAddingStudent(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ full_name: newStudent.full_name.trim(), email: newStudent.email.trim(), password: newStudent.password.trim(), phone: newStudent.phone.trim() || null, cnic: newStudent.cnic.trim() || null, university: newStudent.university.trim() || null, room_type: newStudent.room_type || null }),
      });
      const result = await res.json();
      if (!res.ok) toast.error(result.error || "Failed to create student.");
      else { toast.success(`Student "${newStudent.full_name}" added!`); setNewStudent(EMPTY_STUDENT); setShowAddStudent(false); await fetchStudents(); }
    } catch { toast.error("Network error."); }
    finally { setAddingStudent(false); }
  };

  // --- CMS ---
  const saveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    const { error } = await supabase.from("hostel_rules").update({ icon: editingRule.icon, title: editingRule.title, description: editingRule.description }).eq("id", editingRule.id);
    if (!error) { toast.success("Rule updated!"); setEditingRule(null); fetchRules(); }
    else toast.error("Failed to update rule.");
  };
  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.description.trim()) return;
    setAddingRule(true);
    const maxOrder = rules.reduce((m, r) => Math.max(m, r.sort_order), 0);
    const { error } = await supabase.from("hostel_rules").insert({ ...newRule, sort_order: maxOrder + 1 });
    if (!error) { setNewRule(EMPTY_RULE); setShowNewRuleForm(false); toast.success("Rule added!"); fetchRules(); }
    else toast.error("Failed to add rule.");
    setAddingRule(false);
  };
  const deleteRule = async (id: string) => {
    await supabase.from("hostel_rules").delete().eq("id", id);
    toast.success("Rule deleted."); fetchRules();
  };
  const toggleRoomStatus = async (room: RoomListing) => {
    setUpdatingRoom(room.id);
    const statuses = ["Available", "Booked", "Maintenance"];
    const next = statuses[(statuses.indexOf(room.availability_status) + 1) % statuses.length];
    const { error } = await supabase.from("room_listings").update({ availability_status: next }).eq("id", room.id);
    if (!error) { toast.success(`${room.title} → ${next}`); fetchRoomListings(); }
    else toast.error("Failed.");
    setUpdatingRoom(null);
  };
  const deleteGalleryImage = async (id: string) => {
    await supabase.from("gallery_images").delete().eq("id", id);
    toast.success("Image removed."); fetchGallery();
  };
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newGallery.alt.trim()) { toast.error("Please enter an image label first."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large. Max 10MB."); return; }
    setUploadingMedia(true);
    const fileName = `gallery/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from("media").upload(fileName, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed: " + uploadError.message); setUploadingMedia(false); return; }
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(uploadData.path);
    const maxOrder = galleryImages.reduce((m, g) => Math.max(m, g.sort_order), 0);
    const { error } = await supabase.from("gallery_images").insert({ src: urlData.publicUrl, alt: newGallery.alt.trim(), category: newGallery.category, sort_order: maxOrder + 1 });
    if (!error) { toast.success("Image added to gallery!"); setNewGallery({ alt: "", category: "Building" }); fetchGallery(); }
    else toast.error("Failed to save gallery record.");
    setUploadingMedia(false);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  // --- Unified Student Search ---
  const searchStudents = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSelectedStudent(null);
    const q = searchQuery.trim().toLowerCase();
    const { data } = await supabase.from("profiles").select("*").eq("role", "student")
      .or(`full_name.ilike.%${q}%,cnic.ilike.%${q}%,email.ilike.%${q}%`);
    if (data) setSearchResults(data as Profile[]);
    setSearchLoading(false);
  };
  const selectStudent = async (s: Profile) => {
    setSelectedStudent(s);
    const [b, l, c] = await Promise.all([
      supabase.from("billing_records").select("*").eq("student_id", s.id).order("created_at", { ascending: false }),
      supabase.from("leave_requests").select("*").eq("student_id", s.id).order("created_at", { ascending: false }),
      supabase.from("complaints").select("*").eq("student_id", s.id).order("created_at", { ascending: false }),
    ]);
    if (b.data) setStudentBilling(b.data as BillingRecord[]);
    if (l.data) setStudentLeaves(l.data as LeaveRequest[]);
    if (c.data) setStudentComplaints(c.data as Complaint[]);
  };
  const deleteStudent = async (profileId: string, userId: string) => {
    if (!confirm("Are you sure? This will permanently delete the student account and all associated data.")) return;
    setDeletingStudent(true);
    // Delete profile (cascades to related tables)
    const { error } = await supabase.from("profiles").delete().eq("id", profileId);
    if (error) { toast.error("Failed to delete profile: " + error.message); setDeletingStudent(false); return; }
    toast.success("Student deleted.");
    setSelectedStudent(null); setSearchResults([]); setSearchQuery("");
    fetchStudents();
    setDeletingStudent(false);
  };

  // --- Warden Profile ---
  const saveWardenProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingWardenProfile(true);
    const updates: any = {};
    if (wardenEmail.trim() && wardenEmail !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: wardenEmail.trim() });
      if (authError) { toast.error("Failed to update email: " + authError.message); setSavingWardenProfile(false); return; }
      await supabase.from("profiles").update({ email: wardenEmail.trim() }).eq("user_id", profile.user_id);
    }
    if (wardenPassword && wardenPassword.length >= 6) {
      const { error: pwError } = await supabase.auth.updateUser({ password: wardenPassword });
      if (pwError) { toast.error("Failed to update password: " + pwError.message); setSavingWardenProfile(false); return; }
    }
    toast.success("Profile updated!");
    setWardenPassword("");
    setSavingWardenProfile(false);
  };

  // Counts
  const pendingVisitors = visitors.filter(v => v.status === "Pending").length;
  const pendingComplaints = complaints.filter(c => c.status === "Pending").length;
  const pendingBookings = bookings.filter(b => b.status === "Pending").length;
  const pendingClearance = clearance.filter(c => c.status === "Pending").length;
  const pendingVouchers = vouchers.filter(v => v.status === "Pending").length;
  const pendingReviews = reviews.filter(r => r.status === "Pending").length;
  const pendingLeaves = leaves.filter(l => l.status === "Pending").length;
  const totalPaid = students.filter(s => s.fee_status === "Paid").length;
  const totalPending = students.filter(s => s.fee_status === "Pending").length;

  const badge = (count: number, color = "bg-primary text-primary-foreground") =>
    count > 0 ? <span className={`ml-1 ${color} text-[9px] px-1.5 py-0.5 rounded-full`}>{count}</span> : null;

  if (loading || !profile) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm";

  return (
    <main className="min-h-screen pt-20 pb-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-gold">
              <Shield className="w-7 h-7 text-background" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Warden Dashboard</h1>
              <p className="text-sm text-muted-foreground">Majestic Girls Hostel — Admin Panel</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200 text-sm font-medium">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 min-w-fit py-2 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${tab === t ? "bg-card shadow-card text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
              {t === "Bookings" && badge(pendingBookings)}
              {t === "Visitors" && badge(pendingVisitors)}
              {t === "Complaints" && badge(pendingComplaints, "bg-destructive text-destructive-foreground")}
              {t === "Clearance" && badge(pendingClearance, "bg-orange-500 text-white")}
              {t === "Billing" && badge(pendingVouchers)}
              {t === "Reviews" && badge(pendingReviews)}
              {t === "Leave" && badge(pendingLeaves, "bg-blue-500 text-white")}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

            {/* ── OVERVIEW ── */}
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Users, label: "Total Students", value: students.length, color: "text-primary" },
                    { icon: TrendingUp, label: "Fees Paid", value: totalPaid, color: "text-green-500" },
                    { icon: TrendingUp, label: "Fees Pending", value: totalPending, color: "text-destructive" },
                    { icon: Package, label: "Pending Bookings", value: pendingBookings, color: "text-primary" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <motion.div key={label} className="card-cinematic p-5" whileHover={{ y: -3 }}>
                      <Icon className={`w-5 h-5 ${color} mb-2`} />
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className={`font-bold text-2xl mt-0.5 ${color}`}>{value}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4">Room Occupancy</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[["1-Seater", "1 Seater", 4], ["2-Seater", "2 Seater", 6], ["3-Seater", "3 Seater", 6]].map(([label, type, capacity]) => {
                      const occupied = students.filter(s => s.room_number === type).length;
                      const pct = Math.round((occupied / (capacity as number)) * 100);
                      return (
                        <div key={label as string} className="text-center">
                          <p className="text-sm font-semibold mb-2">{label as string}</p>
                          <div className="w-16 h-16 rounded-full border-4 border-border flex items-center justify-center mx-auto relative">
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 60 60">
                              <circle cx="30" cy="30" r="25" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeDasharray={`${pct * 1.57} 157`} strokeLinecap="round" />
                            </svg>
                            <span className="text-xs font-bold text-primary">{pct}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{occupied}/{capacity as number}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}


            {/* ── LEAVE / GATE PASS ── */}
            {tab === "Leave" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold">Gate Pass / Leave Requests ({leaves.length})</h2>
                {dataLoading ? (
                  <div className="card-cinematic p-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" /></div>
                ) : leaves.length === 0 ? (
                  <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No leave requests yet.</div>
                ) : leaves.map(l => (
                  <div key={l.id} className="card-cinematic overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{l.student_name}</p>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.status === "Approved" ? "bg-green-500/10 text-green-600 dark:text-green-400" : l.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-blue-500/10 text-blue-500"}`}>{l.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">📍 {l.destination}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            🕐 {new Date(l.leaving_at).toLocaleString()} → {new Date(l.returning_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">👤 {l.guardian_name} · {l.guardian_phone}</p>
                          {l.warden_notes && <p className="text-xs italic text-muted-foreground mt-1">Note: {l.warden_notes}</p>}
                        </div>
                        {l.status === "Pending" && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <input type="text" placeholder="Add note (optional)" value={leaveNote}
                              onChange={e => setLeaveNote(e.target.value)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-background border border-border focus:border-primary outline-none" />
                            <div className="flex gap-2">
                              <button onClick={() => processLeave(l.id, "Approved")} disabled={processingLeave === l.id}
                                className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors font-semibold disabled:opacity-50">
                                {processingLeave === l.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Approve
                              </button>
                              <button onClick={() => processLeave(l.id, "Rejected")} disabled={processingLeave === l.id}
                                className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-semibold disabled:opacity-50">
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {tab === "Bookings" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold">Booking Requests ({bookings.length})</h2>
                {bookings.map(b => (
                  <div key={b.id} className="card-cinematic p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{b.full_name}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.status === "Confirmed" ? "bg-green-500/10 text-green-600 dark:text-green-400" : b.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{b.status}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>📧 {b.email}</span><span>📞 {b.phone}</span>
                          <span>🏠 {b.room_type}</span><span>🎓 {b.university}</span>
                          {b.cnic && <span>🪪 {b.cnic}</span>}
                          {b.guardian && <span>👤 {b.guardian}</span>}
                        </div>
                      </div>
                      {b.status === "Pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => updateBookingStatus(b.id, "Confirmed")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirm
                          </button>
                          <button onClick={() => updateBookingStatus(b.id, "Rejected")} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STUDENTS ── */}
            {tab === "Students" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold">All Students ({students.length})</h2>
                  <button onClick={() => setShowAddStudent(true)} className="btn-gold px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Add Student
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-border/50">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>{["Name", "Email", "Room", "University", "Fee Status", "Actions"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {students.map((s, i) => (
                        <tr key={s.id} className={`border-t border-border/30 ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>
                          <td className="px-4 py-3 font-medium">{s.full_name}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{s.email}</td>
                          <td className="px-4 py-3">{s.room_number || "—"}</td>
                          <td className="px-4 py-3 text-xs">{s.university || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.fee_status === "Paid" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>{s.fee_status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => updateFeeStatus(s.id, s.fee_status as "Paid" | "Pending")} className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              Toggle Fee
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── BILLING ── */}
            {tab === "Billing" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Add Billing Record</h2>
                  <form onSubmit={addBilling} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-muted-foreground block mb-1">Student</label>
                      <select value={newBilling.student_id} onChange={e => setNewBilling(p => ({ ...p, student_id: e.target.value }))} required className={inputClass}>
                        <option value="">Select student…</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Type</label>
                      <select value={newBilling.type} onChange={e => setNewBilling(p => ({ ...p, type: e.target.value as any }))} className={inputClass}>
                        <option value="fee">Monthly Fee</option>
                        <option value="fine">Fine</option>
                        <option value="extra_charge">Extra Charge (AC/Electricity)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Description</label>
                      <input type="text" placeholder="e.g. June fee, AC usage" value={newBilling.description}
                        onChange={e => setNewBilling(p => ({ ...p, description: e.target.value }))} required className={inputClass} />
                    </div>
                    {newBilling.type === "extra_charge" && (<>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Units</label>
                        <input type="number" min="0" step="0.1" placeholder="e.g. 50" value={newBilling.units}
                          onChange={e => setNewBilling(p => ({ ...p, units: e.target.value, amount: e.target.value && p.rate ? String(parseFloat(e.target.value) * parseFloat(p.rate)) : p.amount }))} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Rate (PKR/unit)</label>
                        <input type="number" min="0" step="1" placeholder="e.g. 20" value={newBilling.rate}
                          onChange={e => setNewBilling(p => ({ ...p, rate: e.target.value, amount: p.units && e.target.value ? String(parseFloat(p.units) * parseFloat(e.target.value)) : p.amount }))} className={inputClass} />
                      </div>
                    </>)}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Amount (PKR)</label>
                      <input type="number" min="0" step="1" placeholder="Total amount" value={newBilling.amount}
                        onChange={e => setNewBilling(p => ({ ...p, amount: e.target.value }))} required className={inputClass} />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" disabled={addingBilling} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                        {addingBilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Record
                      </button>
                    </div>
                  </form>
                </div>
                {vouchers.filter(v => v.status === "Pending").length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Vouchers Awaiting Verification ({vouchers.filter(v => v.status === "Pending").length})</h3>
                    {vouchers.filter(v => v.status === "Pending").map(v => (
                      <div key={v.id} className="card-cinematic p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-sm">{v.student_name}</p>
                          <p className="text-xs text-muted-foreground">{v.notes || "Payment Receipt"} · {new Date(v.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={v.voucher_url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">View Image</a>
                          <button onClick={() => verifyVoucher(v.id, "Verified")} className="text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verify</button>
                          <button onClick={() => verifyVoucher(v.id, "Rejected")} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1"><X className="w-3.5 h-3.5" /> Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">All Billing Records</h3>
                  {billing.map(b => (
                    <div key={b.id} className="card-cinematic p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">{b.student_name} — {b.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">{b.type.replace("_", " ")} · {new Date(b.created_at).toLocaleDateString()}</p>
                        {b.units && <p className="text-xs text-muted-foreground">{b.units} units × PKR {b.rate}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-bold text-sm">PKR {Number(b.amount).toLocaleString()}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${b.status === "Paid" ? "bg-green-500/10 text-green-600 dark:text-green-400" : b.status === "Waived" ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive"}`}>{b.status}</span>
                        {b.status === "Pending" && (
                          <button onClick={() => markBillingPaid(b.id)} className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors">Mark Paid</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CLEARANCE ── */}
            {tab === "Clearance" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold">Clearance Requests ({clearance.length})</h2>
                {clearance.map(cr => (
                  <div key={cr.id} className="card-cinematic overflow-hidden">
                    <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{cr.student_name}</p>
                        <p className="text-xs text-muted-foreground">{cr.student_email} · Room {cr.student_room || "—"}</p>
                        <p className="text-sm text-muted-foreground mt-1">{cr.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cr.status === "Approved" ? "bg-green-500/10 text-green-600 dark:text-green-400" : cr.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-orange-500/10 text-orange-500"}`}>{cr.status}</span>
                        {cr.status === "Pending" && (
                          <button onClick={() => toggleClearanceDetail(cr)} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1">
                            {expandedClearance === cr.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Review
                          </button>
                        )}
                      </div>
                    </div>
                    {expandedClearance === cr.id && (
                      <div className="border-t border-border/40 p-5 bg-muted/20 space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment History</h3>
                        {!clearanceBilling[cr.student_id] ? (
                          <div className="text-center py-4"><Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" /></div>
                        ) : clearanceBilling[cr.student_id].length === 0 ? (
                          <p className="text-sm text-muted-foreground">No billing records.</p>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {clearanceBilling[cr.student_id].map(b => (
                              <div key={b.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-card">
                                <span>{b.description}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">PKR {Number(b.amount).toLocaleString()}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.status === "Paid" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>{b.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div>
                          <textarea value={wardenNote} onChange={e => setWardenNote(e.target.value)} rows={2} placeholder="Add approval note…"
                            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => processClearance(cr.id, "Approved")} disabled={processingClearance === cr.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all font-semibold text-sm disabled:opacity-50">
                            {processingClearance === cr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />} Approve
                          </button>
                          <button onClick={() => processClearance(cr.id, "Rejected")} disabled={processingClearance === cr.id}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-semibold text-sm disabled:opacity-50">
                            <X className="w-4 h-4" /> Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── VISITORS ── */}
            {tab === "Visitors" && (
              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold mb-4">Visitor Requests</h2>
                {visitors.map(v => (
                  <div key={v.id} className="card-cinematic p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{v.visitor_name} <span className="text-muted-foreground">({v.relation})</span></p>
                      <p className="text-xs text-muted-foreground">Student: {(v as any).student_name} · {new Date(v.visit_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${v.status === "Approved" ? "bg-green-500/10 text-green-600 dark:text-green-400" : v.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{v.status}</span>
                      {v.status === "Pending" && (<>
                        <button onClick={() => approveVisitor(v.id)} className="w-7 h-7 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-500/20"><CheckCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => rejectVisitor(v.id)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"><X className="w-3.5 h-3.5" /></button>
                      </>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── COMPLAINTS ── */}
            {tab === "Complaints" && (
              <div className="space-y-3">
                <h2 className="font-display text-xl font-bold mb-4">All Complaints</h2>
                {complaints.map(c => (
                  <div key={c.id} className="card-cinematic p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{c.title}</p>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                      <p className="text-xs text-muted-foreground">By: {(c as any).student_name} · {new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.status === "Resolved" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-primary/10 text-primary"}`}>{c.status}</span>
                      {c.status === "Pending" && (
                        <button onClick={() => resolveComplaint(c.id)} className="text-xs px-2 py-1.5 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Resolve</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NOTICES ── */}
            {tab === "Notices" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Post Notice</h2>
                  <div className="space-y-3">
                    <input type="text" placeholder="Notice title" value={newNotice.title} onChange={e => { setNewNotice(p => ({ ...p, title: e.target.value })); if (noticeErrors.title) setNoticeErrors(p => ({ ...p, title: false })); }} className={`${inputClass} ${noticeErrors.title ? "border-red-500" : ""}`} />
                    <textarea placeholder="Message…" rows={3} value={newNotice.content} onChange={e => { setNewNotice(p => ({ ...p, content: e.target.value })); if (noticeErrors.content) setNoticeErrors(p => ({ ...p, content: false })); }} className={`w-full px-4 py-3 rounded-xl bg-background border focus:border-primary outline-none text-sm resize-none ${noticeErrors.content ? "border-red-500" : "border-border"}`} />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <div onClick={() => setNewNotice(p => ({ ...p, important: !p.important }))}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${newNotice.important ? "bg-primary border-primary" : "border-border"}`}>
                          {newNotice.important && <div className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                        </div>
                        Mark as Important
                      </label>
                      <button onClick={postNotice} disabled={submitting} className="btn-gold px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                        {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting...</> : <><Bell className="w-3.5 h-3.5" /> Post</>}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {notices.map(n => (
                    <div key={n.id} className={`card-cinematic p-4 flex items-start justify-between gap-4 ${n.important ? "border-primary/30" : ""}`}>
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{n.title}</p>
                            {n.important && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">Important</span>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{n.content}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteNotice(n.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            {tab === "Reviews" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-bold">Student Reviews ({reviews.length})</h2>
                {reviews.map(r => (
                  <div key={r.id} className="card-cinematic p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">{r.student_name}</p>
                          <div className="flex">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />))}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.review_text}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.status === "Featured" ? "bg-primary/10 text-primary" : r.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{r.status}</span>
                        {r.status === "Pending" && (<>
                          <button onClick={() => updateReviewStatus(r.id, "Featured")} className="text-xs px-2 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1"><Star className="w-3 h-3" /> Feature</button>
                          <button onClick={() => updateReviewStatus(r.id, "Rejected")} className="text-xs px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-3 h-3" /></button>
                        </>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STAFF DIRECTORY ── */}
            {tab === "Staff" && (
              <div className="space-y-4">
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" /> Add Hostel Staff
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">Maintain a directory of cleaning, kitchen, and security staff.</p>
                  <form onSubmit={addStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input className={inputClass} placeholder="Name *" value={newStaff.name}
                      onChange={e => setNewStaff(p => ({ ...p, name: e.target.value }))} required />
                    <input className={inputClass} placeholder="Role (e.g. Cook, Guard) *" value={newStaff.role}
                      onChange={e => setNewStaff(p => ({ ...p, role: e.target.value }))} required />
                    <input className={inputClass} placeholder="Timing (e.g. 6am–2pm) *" value={newStaff.timing}
                      onChange={e => setNewStaff(p => ({ ...p, timing: e.target.value }))} required />
                    <div className="sm:col-span-3">
                      <button type="submit" disabled={addingStaff}
                        className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                        {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Staff
                      </button>
                    </div>
                  </form>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Staff Directory ({staff.length})</h3>
                  {staff.length === 0 ? (
                    <div className="card-cinematic p-8 text-center text-muted-foreground text-sm">No staff members added yet.</div>
                  ) : staff.map(s => (
                    <div key={s.id} className="card-cinematic p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.role} · {s.timing}</p>
                      </div>
                      <button onClick={() => deleteStaff(s.id)}
                        className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CMS ── */}
            {tab === "CMS" && (
              <div className="space-y-6">
                {/* CMS Sub-sections */}
                {/* 1. Rules Management */}
                <div className="card-cinematic p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Hostel Rules</h2>
                    <button onClick={() => setShowNewRuleForm(v => !v)} className="btn-gold px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" /> Add Rule
                    </button>
                  </div>
                  {showNewRuleForm && (
                    <form onSubmit={addRule} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Icon (emoji)</label>
                        <input type="text" value={newRule.icon} onChange={e => setNewRule(p => ({ ...p, icon: e.target.value }))} className={inputClass} maxLength={4} />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Title</label>
                        <input type="text" value={newRule.title} onChange={e => setNewRule(p => ({ ...p, title: e.target.value }))} required className={inputClass} />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-xs text-muted-foreground block mb-1">Description</label>
                        <textarea value={newRule.description} onChange={e => setNewRule(p => ({ ...p, description: e.target.value }))} required rows={2} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
                      </div>
                      <div className="sm:col-span-3 flex gap-2">
                        <button type="submit" disabled={addingRule} className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                          {addingRule ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Save Rule
                        </button>
                        <button type="button" onClick={() => setShowNewRuleForm(false)} className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted transition-colors">Cancel</button>
                      </div>
                    </form>
                  )}
                  <div className="space-y-2">
                    {rules.map(rule => (
                      <div key={rule.id}>
                        {editingRule?.id === rule.id ? (
                          <form onSubmit={saveRule} className="p-4 rounded-xl bg-muted/30 border border-primary/20 space-y-2">
                            <div className="grid grid-cols-4 gap-2">
                              <input type="text" value={editingRule.icon} onChange={e => setEditingRule(r => r ? { ...r, icon: e.target.value } : r)} className={inputClass} maxLength={4} />
                              <input type="text" value={editingRule.title} onChange={e => setEditingRule(r => r ? { ...r, title: e.target.value } : r)} required className={`${inputClass} col-span-3`} />
                            </div>
                            <textarea value={editingRule.description} onChange={e => setEditingRule(r => r ? { ...r, description: e.target.value } : r)} required rows={2} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
                            <div className="flex gap-2">
                              <button type="submit" className="btn-gold px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                              <button type="button" onClick={() => setEditingRule(null)} className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted">Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                            <span className="text-xl">{rule.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{rule.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{rule.description}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button onClick={() => setEditingRule(rule)} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => deleteRule(rule.id)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Room Availability */}
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4"><Home className="w-5 h-5 text-primary" /> Room Availability</h2>
                  <div className="space-y-3">
                    {roomListings.map(room => (
                      <div key={room.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          {room.image_url && <img src={room.image_url} alt={room.title} className="w-12 h-12 rounded-xl object-cover" />}
                          <div>
                            <p className="font-semibold text-sm">{room.title}</p>
                            <p className="text-xs text-muted-foreground">{room.capacity} person · {room.badge}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            room.availability_status === "Available" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                            room.availability_status === "Maintenance" ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                            "bg-destructive/10 text-destructive"
                          }`}>{room.availability_status}</span>
                          <button onClick={() => toggleRoomStatus(room)} disabled={updatingRoom === room.id}
                            className="btn-gold px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                            {updatingRoom === room.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ToggleRight className="w-3.5 h-3.5" />} Toggle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Gallery / Media Manager */}
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold flex items-center gap-2 mb-4"><Image className="w-5 h-5 text-primary" /> Media Manager</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Image Label</label>
                      <input type="text" placeholder="e.g. Main Entrance" value={newGallery.alt} onChange={e => setNewGallery(p => ({ ...p, alt: e.target.value }))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Category</label>
                      <select value={newGallery.category} onChange={e => setNewGallery(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                        {["Building", "Interior", "Facilities", "Rooms", "General"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <input ref={mediaInputRef} type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                      <button onClick={() => mediaInputRef.current?.click()} disabled={uploadingMedia || !newGallery.alt.trim()}
                        className="w-full btn-gold px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50">
                        {uploadingMedia ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        {uploadingMedia ? "Uploading…" : "Upload Image"}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {galleryImages.map(img => (
                      <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square">
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <p className="text-xs font-semibold text-center text-foreground leading-tight">{img.alt}</p>
                          <span className="text-[10px] text-muted-foreground">{img.category}</span>
                          <button onClick={() => deleteGalleryImage(img.id)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE / SEARCH ── */}
            {tab === "Profile" && (
              <div className="space-y-6">
                {/* Unified Search */}
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> Unified Student Search</h2>
                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Search by Name, CNIC, or Email…" value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && searchStudents()}
                      className={`${inputClass} flex-1`} />
                    <button onClick={searchStudents} disabled={searchLoading || !searchQuery.trim()}
                      className="btn-gold px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
                      {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
                    </button>
                  </div>
                  {searchResults.length > 0 && !selectedStudent && (
                    <div className="space-y-2">
                      {searchResults.map(s => (
                        <div key={s.id} onClick={() => selectStudent(s)}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
                          <div>
                            <p className="font-semibold text-sm">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground">{s.email} · CNIC: {s.cnic || "—"}</p>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedStudent && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold">{selectedStudent.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedStudent.email} · Room {selectedStudent.room_number || "—"}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedStudent(null)} className="px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-muted transition-colors">← Back</button>
                          <button onClick={() => deleteStudent(selectedStudent.id, selectedStudent.user_id)} disabled={deletingStudent}
                            className="px-3 py-1.5 rounded-lg text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1 disabled:opacity-50">
                            {deletingStudent ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete Student
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        {[["University", selectedStudent.university || "—"], ["Phone", selectedStudent.phone || "—"], ["CNIC", selectedStudent.cnic || "—"], ["Fee Status", selectedStudent.fee_status], ["Booking Status", selectedStudent.booking_status], ["Joined", selectedStudent.join_date || "—"]].map(([k, v]) => (
                          <div key={k} className="card-cinematic p-3">
                            <p className="text-muted-foreground uppercase tracking-wider mb-0.5">{k}</p>
                            <p className="font-semibold">{v}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Billing History ({studentBilling.length})</h4>
                        {studentBilling.map(b => (
                          <div key={b.id} className="flex items-center justify-between text-sm p-3 rounded-xl bg-muted/30">
                            <span>{b.description}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">PKR {Number(b.amount).toLocaleString()}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.status === "Paid" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>{b.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Leave History ({studentLeaves.length})</h4>
                        {studentLeaves.map(l => (
                          <div key={l.id} className="text-sm p-3 rounded-xl bg-muted/30 flex items-start justify-between">
                            <div>
                              <p>📍 {l.destination}</p>
                              <p className="text-xs text-muted-foreground">{new Date(l.leaving_at).toLocaleDateString()} → {new Date(l.returning_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.status === "Approved" ? "bg-green-500/10 text-green-600 dark:text-green-400" : l.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-blue-500/10 text-blue-500"}`}>{l.status}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Complaints ({studentComplaints.length})</h4>
                        {studentComplaints.map(c => (
                          <div key={c.id} className="text-sm p-3 rounded-xl bg-muted/30 flex items-start justify-between">
                            <div>
                              <p className="font-medium">{c.title}</p>
                              <p className="text-xs text-muted-foreground">{c.description}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.status === "Resolved" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-primary/10 text-primary"}`}>{c.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Warden Profile Settings */}
                <div className="card-cinematic p-6">
                  <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-primary" /> Warden Profile</h2>
                  <form onSubmit={saveWardenProfile} className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Email</label>
                      <input type="email" value={wardenEmail} onChange={e => setWardenEmail(e.target.value)} required className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">New Password (leave blank to keep current)</label>
                      <input type="password" value={wardenPassword} onChange={e => setWardenPassword(e.target.value)} placeholder="New password…" minLength={6} className={inputClass} />
                    </div>
                    <button type="submit" disabled={savingWardenProfile}
                      className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                      {savingWardenProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                    </button>
                  </form>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ADD STUDENT MODAL */}
      <AnimatePresence>
        {showAddStudent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowAddStudent(false)} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25 }}
                className="w-full max-w-lg card-cinematic p-6 border-primary/20 shadow-elevated" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl btn-gold flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary-foreground" /></div>
                    <div>
                      <h2 className="font-display text-lg font-bold">Add New Student</h2>
                      <p className="text-xs text-muted-foreground">Creates login credentials + profile</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddStudent(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Full Name *", key: "full_name", type: "text", placeholder: "Student's name", required: true },
                      { label: "Email *", key: "email", type: "email", placeholder: "student@email.com", required: true },
                      { label: "Phone", key: "phone", type: "tel", placeholder: "0300-XXXXXXX", required: false },
                      { label: "CNIC", key: "cnic", type: "text", placeholder: "35202-XXXXXXX-X", required: false },
                      { label: "University", key: "university", type: "text", placeholder: "COMSATS, UET…", required: false },
                    ].map(({ label, key, type, placeholder, required }) => (
                      <div key={key}>
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">{label}</label>
                        <input type={type} placeholder={placeholder} value={(newStudent as any)[key]}
                          onChange={e => setNewStudent(p => ({ ...p, [key]: e.target.value }))} required={required}
                          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Password *</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Min. 6 chars" value={newStudent.password}
                          onChange={e => setNewStudent(p => ({ ...p, password: e.target.value }))} required minLength={6}
                          className="w-full px-3 py-2.5 pr-9 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <Lock className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">Room Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["1 Seater", "2 Seater", "3 Seater"].map(rt => (
                          <button key={rt} type="button"
                            onClick={() => setNewStudent(p => ({ ...p, room_type: p.room_type === rt ? "" : rt }))}
                            className={`py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${newStudent.room_type === rt ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/40"}`}>
                            {rt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddStudent(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">Cancel</button>
                    <button type="submit" disabled={addingStudent} className="flex-1 btn-gold py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                      {addingStudent ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {addingStudent ? "Adding…" : "Add Student"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
