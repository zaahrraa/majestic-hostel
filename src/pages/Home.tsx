import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, ChevronDown, Shield, Star, Home as HomeIcon, Send, Loader2 } from "lucide-react";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface FeaturedReview {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  student_name?: string;
}

function ReviewsSection() {
  const { profile } = useAuth();
  const [featured, setFeatured] = useState<FeaturedReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.from("reviews").select("*, profiles(full_name)").eq("status", "Featured").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => {
        if (data) setFeatured(data.map((r: any) => ({ ...r, student_name: r.profiles?.full_name ?? "Anonymous" })));
        setLoadingReviews(false);
      });
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !rating || !reviewText.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({ student_id: profile.id, rating, review_text: reviewText.trim() });
    if (!error) { setSubmitted(true); setRating(0); setReviewText(""); toast.success("Review submitted! Awaiting warden approval."); }
    else toast.error("Failed to submit review.");
    setSubmitting(false);
  };

  return (
    <section className="py-24 px-6 bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">What Residents Say</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Student <span className="text-gold-gradient">Reviews</span></h2>
        </Reveal>

        {!loadingReviews && featured.length > 0 && (
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {featured.map(r => (
              <StaggerItem key={r.id}>
                <div className="card-cinematic p-6 h-full">
                  <div className="flex mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{r.review_text}"</p>
                  <p className="text-xs font-semibold text-primary">{r.student_name}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        )}

        {profile && !submitted && (
          <Reveal>
            <div className="max-w-xl mx-auto card-cinematic p-8 border-primary/20">
              <h3 className="font-display text-xl font-bold mb-5 text-center">Share Your Experience</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button"
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(i + 1)}
                      className="transition-transform hover:scale-110">
                      <Star className={`w-8 h-8 transition-colors ${i < (hoverRating || rating) ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
                  placeholder="Tell us about your stay…"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm resize-none" />
                <button type="submit" disabled={submitting || !rating || !reviewText.trim()}
                  className="w-full btn-gold py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Review
                </button>
              </form>
            </div>
          </Reveal>
        )}

        {!profile && (
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link> to share your experience.
          </p>
        )}
      </div>
    </section>
  );
}

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 4,
}));

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  return (
    <main>
      {/* HERO */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center">
        {/* Parallax background */}
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img
            src="https://i.postimg.cc/dtYnSLN7/mainbuilding.png"
            alt="Majestic Girls Hostel Main Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/40" />
        </motion.div>

        {/* Floating particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-primary/30 pointer-events-none"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Content */}
        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="h-px w-12 bg-primary/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Lahore, Pakistan
            </span>
            <div className="h-px w-12 bg-primary/50" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
          >
            <span className="text-gold-gradient">Majestic</span>
            <br />
            <span className="text-foreground">Girls Hostel</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="font-cormorant text-xl md:text-2xl text-muted-foreground italic mb-10 max-w-xl mx-auto"
          >
            Your second home — safe, disciplined, and supportive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/booking" className="btn-gold px-8 py-3.5 rounded-2xl text-base shadow-gold">
              Book Your Room
            </Link>
            <Link
              to="/rooms"
              className="px-8 py-3.5 rounded-2xl text-base font-semibold glass border border-primary/20 text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
            >
              Explore Rooms
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4 text-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS MARQUEE */}
      <div className="border-y border-border/40 bg-card/30 overflow-hidden py-4">
        <motion.div className="flex gap-16 w-max animate-marquee">
          {["Safe & Secure", "Biometric Entry", "24/7 CCTV", "Attached Washrooms", "Lift Available", "Mess Facility", "Near COMSATS", "Premium Rooms"].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
              <Crown className="w-3 h-3 text-primary" />
              {item}
            </span>
          ))}
          {["Safe & Secure", "Biometric Entry", "24/7 CCTV", "Attached Washrooms", "Lift Available", "Mess Facility", "Near COMSATS", "Premium Rooms"].map((item, i) => (
            <span key={`dup-${i}`} className="flex items-center gap-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
              <Crown className="w-3 h-3 text-primary" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      {/* HIGHLIGHTS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Why Choose Us</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
            Built for <span className="text-gold-gradient">Her Success</span>
          </h2>
        </Reveal>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Maximum Security", desc: "Biometric entry, 24/7 CCTV, strict visitor protocols — your safety is our first priority.", color: "text-primary" },
            { icon: HomeIcon, title: "Home-Like Comfort", desc: "Cozy rooms, clean facilities, and a warm community that makes you feel right at home.", color: "text-accent" },
            { icon: Star, title: "Academic Focus", desc: "Peaceful study environment, reliable internet, and rules designed to help you excel.", color: "text-primary" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <StaggerItem key={title}>
              <div className="card-cinematic p-8 text-center group">
                <div className={`w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-all duration-300`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </section>

      {/* ROOMS PREVIEW */}
      <section className="py-20 bg-muted/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Accommodation</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Our Rooms</h2>
          </Reveal>

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "1-Seater", img: "https://i.postimg.cc/C1c6VYRr/1seater.png", badge: "Premium" },
              { title: "2-Seater", img: "https://i.postimg.cc/c4sPj96P/2-seater.png", badge: "Popular" },
              { title: "3-Seater", img: "https://i.postimg.cc/sgW8GtLr/3-seater.png", badge: "Best Value" },
            ].map(({ title, img, badge }) => (
              <StaggerItem key={title}>
                <div className="card-cinematic overflow-hidden group">
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <span className="absolute top-3 right-3 text-xs font-semibold bg-primary/90 text-primary-foreground px-3 py-1 rounded-full">
                      {badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold">{title} Room</h3>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          <div className="text-center mt-10">
            <Link to="/rooms" className="btn-gold px-8 py-3 rounded-2xl inline-block text-sm font-semibold">
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
              <div className="relative card-cinematic p-12 border-primary/20">
                <Crown className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse-gold" />
                <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  Ready to Join Our <span className="text-gold-gradient">Community?</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Secure your spot at Majestic Girls Hostel. Fill out the booking form and our team will reach out within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/booking" className="btn-gold px-8 py-3.5 rounded-2xl text-base">
                    Book Now
                  </Link>
                  <Link to="/contact" className="px-8 py-3.5 rounded-2xl text-base font-semibold glass border border-primary/20 hover:border-primary/50 transition-all duration-300">
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
