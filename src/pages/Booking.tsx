import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { HOSTEL_INFO, ROOMS } from "@/data/hostelData";
import { Reveal } from "@/components/Reveal";
import { CheckCircle, MessageCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

/** Opens a URL in a new tab — works inside iframes / preview environments */
function openExternal(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  university: "",
  cnic: "",
  guardian: "",
  guardianPhone: "",
  room: "",
  moveIn: "",
  rulesAccepted: false,
};

type FieldErrors = Partial<Record<keyof typeof INITIAL_FORM, string>>;

function validateForm(data: typeof INITIAL_FORM): FieldErrors {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(data.email)) errors.email = "Valid email required";
  if (!/^0\d{3}-?\d{7}$/.test(data.phone.replace(/\s/g, "")))
    errors.phone = "Valid Pakistani phone required (e.g. 0300-1234567)";
  if (!data.university.trim()) errors.university = "University is required";
  if (!data.room) errors.room = "Please select a room";
  if (!data.moveIn) errors.moveIn = "Move-in date required";
  if (!data.guardian.trim()) errors.guardian = "Guardian name required";
  if (!data.guardianPhone.trim()) errors.guardianPhone = "Guardian phone required";
  if (!data.rulesAccepted) errors.rulesAccepted = "You must accept the rules";
  return errors;
}

export default function Booking() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof INITIAL_FORM, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);

    // Save to Supabase bookings table
    const { error } = await supabase.from("bookings").insert({
      full_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      cnic: form.cnic.trim() || null,
      university: form.university.trim(),
      guardian: form.guardian.trim() || null,
      guardian_phone: form.guardianPhone.trim() || null,
      room_type: form.room,
      move_in_date: form.moveIn || null,
      status: "Pending",
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit booking. Please try again.");
      setErrors({ name: "Failed to submit. Please try again." });
      return;
    }

    toast.success("Booking Request Saved! The warden will contact you soon.");

    // Also send WhatsApp message to warden
    const msg = encodeURIComponent(
      `*New Booking Request — Majestic Girls Hostel*\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nUniversity: ${form.university}\nRoom Type: ${form.room}\nMove-in Date: ${form.moveIn}\nGuardian: ${form.guardian} (${form.guardianPhone})\nCNIC: ${form.cnic || "Not provided"}\n\n_Please confirm payment and set up student account._`
    );
    openExternal(`https://wa.me/${HOSTEL_INFO.whatsapp}?text=${msg}`);

    setSubmitted(true);
  };

  return (
    <main className="pt-20">
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/6 blur-3xl rounded-full" />
        <Reveal className="text-center max-w-3xl mx-auto relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Admissions</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-2 mb-4">
            Book Your <span className="text-gold-gradient">Room</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Fill out the form below. After payment confirmation via WhatsApp, the warden will set up your student account.
          </p>
        </Reveal>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="card-cinematic p-12 text-center border-primary/20">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse-gold">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-3">Booking Request Sent!</h2>
                <p className="text-muted-foreground mb-2">
                  Your request has been saved and forwarded to the warden via WhatsApp.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  The warden will contact you at <strong>{form.phone}</strong> after payment confirmation. Your login credentials will be provided once the room is confirmed.
                </p>
                <button onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); }}
                  className="btn-gold px-8 py-3 rounded-xl text-sm font-semibold">
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="card-cinematic p-8 border-primary/15">
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* Personal Info */}
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-border/50">
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name *" error={errors.name}>
                          <input type="text" placeholder="Your full name" value={form.name}
                            onChange={(e) => set("name", e.target.value)} className={inputClass(!!errors.name)} />
                        </Field>
                        <Field label="Email Address *" error={errors.email}>
                          <input type="email" placeholder="your@email.com" value={form.email}
                            onChange={(e) => set("email", e.target.value)} className={inputClass(!!errors.email)} />
                        </Field>
                        <Field label="Phone Number *" error={errors.phone}>
                          <input type="tel" placeholder="0300-1234567" value={form.phone}
                            onChange={(e) => set("phone", e.target.value)} className={inputClass(!!errors.phone)} />
                        </Field>
                        <Field label="CNIC" error={errors.cnic}>
                          <input type="text" placeholder="35202-XXXXXXX-X" value={form.cnic}
                            onChange={(e) => set("cnic", e.target.value)} className={inputClass(false)} />
                        </Field>
                        <Field label="University/College *" error={errors.university} className="sm:col-span-2">
                          <input type="text" placeholder="COMSATS, UET, LUMS..." value={form.university}
                            onChange={(e) => set("university", e.target.value)} className={inputClass(!!errors.university)} />
                        </Field>
                      </div>
                    </div>

                    {/* Room selection */}
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-border/50">
                        Room Preference
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {ROOMS.map((room) => (
                          <button key={room.id} type="button" onClick={() => set("room", room.title)}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${form.room === room.title ? "border-primary bg-primary/10 shadow-gold" : "border-border hover:border-primary/40 bg-card"}`}>
                            <img src={room.image} alt={room.title} className="w-full aspect-[4/3] object-cover rounded-lg mb-2" />
                            <p className="font-semibold text-sm">{room.title}</p>
                          </button>
                        ))}
                      </div>
                      {errors.room && <ErrorMsg msg={errors.room} />}
                    </div>

                    {/* Additional Details */}
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-4 pb-2 border-b border-border/50">
                        Additional Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Preferred Move-in Date *" error={errors.moveIn}>
                          <input type="date" value={form.moveIn}
                            onChange={(e) => set("moveIn", e.target.value)} className={inputClass(!!errors.moveIn)} />
                        </Field>
                        <Field label="Guardian Name *" error={errors.guardian}>
                          <input type="text" placeholder="Parent/Guardian name" value={form.guardian}
                            onChange={(e) => set("guardian", e.target.value)} className={inputClass(!!errors.guardian)} />
                        </Field>
                        <Field label="Guardian Phone *" error={errors.guardianPhone} className="sm:col-span-2">
                          <input type="tel" placeholder="Guardian contact number" value={form.guardianPhone}
                            onChange={(e) => set("guardianPhone", e.target.value)} className={inputClass(!!errors.guardianPhone)} />
                        </Field>
                      </div>
                    </div>

                    {/* Rules acceptance */}
                    <div className={`p-4 rounded-xl border transition-colors duration-200 ${errors.rulesAccepted ? "border-destructive/50 bg-destructive/5" : "border-border/50 bg-muted/30"}`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <div onClick={() => set("rulesAccepted", !form.rulesAccepted)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${form.rulesAccepted ? "bg-primary border-primary" : "border-border"}`}>
                          {form.rulesAccepted && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          I have read and agree to the{" "}
                          <a href="/rules" target="_blank" className="text-primary hover:underline font-medium">
                            Hostel Rules & Policies
                          </a>
                          . I understand the late fee policy and curfew regulations.
                        </span>
                      </label>
                      {errors.rulesAccepted && <ErrorMsg msg={errors.rulesAccepted} />}
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full py-4 rounded-xl font-semibold btn-gold text-base flex items-center justify-center gap-2 disabled:opacity-60">
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MessageCircle className="w-5 h-5" />
                      )}
                      {submitting ? "Submitting…" : "Submit Booking via WhatsApp"}
                    </button>
                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Your booking will be saved and WhatsApp will open in a new tab. If blocked in preview, it works on the published URL.
                    </p>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 rounded-xl bg-background border ${hasError ? "border-destructive/60" : "border-border"} focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all duration-200 placeholder:text-muted-foreground/50`;
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle className="w-3 h-3 text-destructive" />
      <p className="text-xs text-destructive">{msg}</p>
    </div>
  );
}

function Field({ label, error, children, className = "" }: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
        {label}
      </label>
      {children}
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}
