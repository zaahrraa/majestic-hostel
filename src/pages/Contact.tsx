import { useState } from "react";
import { motion } from "framer-motion";
import { HOSTEL_INFO } from "@/data/hostelData";
import { Reveal } from "@/components/Reveal";
import { MapPin, Phone, MessageCircle, Clock, CheckCircle, ExternalLink } from "lucide-react";

/** Opens a URL in a new tab — works inside preview iframes too */
function openExternal(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(`Hi! I'm ${formData.name}. ${formData.message} My email: ${formData.email}`);
    openExternal(`https://wa.me/${HOSTEL_INFO.whatsapp}?text=${msg}`);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main className="pt-20">
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/5 blur-3xl rounded-full" />
        <Reveal className="text-center max-w-3xl mx-auto relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Reach Us</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-2 mb-4">
            Get in <span className="text-gold-gradient">Touch</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Have questions? We'd love to hear from you. Send us a message or visit us directly.
          </p>
        </Reveal>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info */}
          <div className="space-y-6">
            <Reveal>
              <div className="card-cinematic p-7 border-primary/15">
                <h2 className="font-display text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Address</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{HOSTEL_INFO.address}</p>
                      <p className="text-sm text-muted-foreground">{HOSTEL_INFO.nearby}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Phone</p>
                      <a href={`tel:${HOSTEL_INFO.phone}`} className="text-sm text-primary hover:underline">
                        {HOSTEL_INFO.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">WhatsApp</p>
                      <button
                        onClick={() => openExternal(`https://wa.me/${HOSTEL_INFO.whatsapp}`)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Chat on WhatsApp <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">Office Hours</p>
                      <p className="text-sm text-muted-foreground">Mon–Sat: 9:00 AM – 6:00 PM</p>
                      <p className="text-sm text-muted-foreground">Sunday: 10:00 AM – 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Map */}
            <Reveal delay={0.15}>
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-card">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-64 flex items-center justify-center relative">
                  <div className="text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-3 animate-pulse-gold shadow-gold">
                      <MapPin className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <p className="font-semibold text-sm">Majestic Girls Hostel</p>
                    <p className="text-xs text-muted-foreground mt-1">LDA Avenue, Phase 1, Lahore</p>
                    <button
                      onClick={() => openExternal("https://maps.google.com/?q=Majestic+Girls+Hostel+LDA+Avenue+Lahore")}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs btn-gold px-4 py-1.5 rounded-full"
                    >
                      Open in Maps <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Animated rings */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border border-primary/20"
                      style={{ width: 60 + i * 40, height: 60 + i * 40 }}
                      animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
                      transition={{ duration: 2.5, delay: i * 0.6, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={0.1}>
            <div className="card-cinematic p-8 border-primary/15">
              <h2 className="font-display text-2xl font-bold mb-6">Send a Message</h2>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-14 h-14 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">Your message was forwarded to WhatsApp. We'll respond shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { key: "name", label: "Full Name", type: "text", placeholder: "Your name" },
                    { key: "email", label: "Email Address", type: "email", placeholder: "your@email.com" },
                    { key: "phone", label: "Phone Number", type: "tel", placeholder: "03XX-XXXXXXX" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData((p) => ({ ...p, [key]: e.target.value }))}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all duration-200 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Message
                    </label>
                    <textarea
                      placeholder="Your inquiry or message..."
                      value={formData.message}
                      onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all duration-200 placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-xl font-semibold btn-gold text-sm flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Send via WhatsApp
                  </button>
                  {/* Preview notice */}
                  <p className="text-xs text-center text-muted-foreground/60 flex items-center justify-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    WhatsApp will open in a new tab. If blocked in preview, it works on the published URL.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
