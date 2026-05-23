import { motion } from "framer-motion";
import { Crown, Quote } from "lucide-react";
import { VISION_TEXT } from "@/data/hostelData";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/Reveal";

const VALUES = [
  { icon: "🔐", title: "Security First", desc: "Biometric entry, CCTV monitoring, and strict visitor protocols keep every student safe." },
  { icon: "✨", title: "Cleanliness", desc: "Daily housekeeping standards and regular inspections ensure a hygienic living space." },
  { icon: "💙", title: "Comfort", desc: "Modern amenities and well-maintained facilities designed for student comfort." },
  { icon: "📚", title: "Academic Growth", desc: "Quiet study hours, a focused community, and support for academic excellence." },
  { icon: "🤝", title: "Respect & Care", desc: "A community built on mutual respect, responsibility, and genuine care for every resident." },
  { icon: "🌟", title: "Personal Development", desc: "Motivational environment and guidance to help students grow beyond the classroom." },
];

export default function About() {
  const paragraphs = VISION_TEXT.split("\n\n");

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our Story</span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mt-3 mb-6 leading-tight">
              About <span className="text-gold-gradient">Majestic</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're more than just a hostel — we're a community dedicated to providing a safe, nurturing environment for female students.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Vision card */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="relative card-cinematic p-8 md:p-12 border-primary/20 overflow-hidden">
              <div className="absolute top-6 left-6 w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center">
                <Quote className="w-8 h-8 text-primary/40" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />

              <div className="relative pl-4 md:pl-16">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary block mb-6">
                  — Warden's Message
                </span>

                <div className="space-y-5">
                  {paragraphs.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, duration: 0.6 }}
                      className={`leading-relaxed ${i === 0 ? "font-cormorant text-lg md:text-xl text-foreground" : "text-muted-foreground"}`}
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                    <Crown className="w-5 h-5 text-background" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Female Hostel Manager</p>
                    <p className="text-xs text-muted-foreground">Majestic Girls Hostel, Lahore</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values grid */}
      <section className="py-20 px-6 bg-muted/20 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our Foundation</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
              Core <span className="text-gold-gradient">Values</span>
            </h2>
          </Reveal>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon, title, desc }) => (
              <StaggerItem key={title}>
                <div className="card-cinematic p-6 group h-full">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-200">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* Building images */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold">
              Our <span className="text-gold-gradient">Building</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              "https://i.postimg.cc/dtYnSLN7/mainbuilding.png",
              "https://i.postimg.cc/PfmQZdX2/main-Building2.png",
              "https://i.postimg.cc/wBCDyGSJ/main-Building3.png",
            ].map((src, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="overflow-hidden rounded-2xl aspect-[4/3] group">
                  <img src={src} alt={`Building ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
