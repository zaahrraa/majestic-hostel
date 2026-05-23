import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FACILITIES } from "@/data/hostelData";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/Reveal";
import { Shield, Camera } from "lucide-react";

export default function Facilities() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className="pt-20">
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/6 blur-3xl rounded-full" />
        <Reveal className="text-center max-w-3xl mx-auto relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Everything You Need</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-2 mb-4">
            Our <span className="text-gold-gradient">Facilities</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Modern amenities thoughtfully designed for student comfort and convenience.
          </p>
        </Reveal>
      </section>

      {/* Facilities grid */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FACILITIES.map((facility) => (
              <StaggerItem key={facility.id}>
                <motion.div
                  layout
                  className={`card-cinematic overflow-hidden cursor-pointer ${selected === facility.id ? "ring-2 ring-primary shadow-gold" : ""}`}
                  onClick={() => setSelected(selected === facility.id ? null : facility.id)}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {facility.image ? (
                    <div className="relative overflow-hidden aspect-video group">
                      <motion.img
                        src={facility.image}
                        alt={facility.title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center text-lg">
                        {facility.icon}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-primary mx-auto mb-2 opacity-60" />
                        <span className="text-sm text-muted-foreground">24/7 Active</span>
                      </div>
                      {/* Animated rings */}
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute rounded-full border border-primary/20"
                          animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.4, 0] }}
                          transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                          style={{ width: 40, height: 40 }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{facility.icon}</span>
                      <h3 className="font-display text-lg font-semibold">{facility.title}</h3>
                    </div>
                    <AnimatePresence>
                      {selected === facility.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-muted-foreground leading-relaxed overflow-hidden"
                        >
                          {facility.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {selected !== facility.id && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{facility.description}</p>
                    )}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>

          {/* Security highlight */}
          <Reveal className="mt-16">
            <div className="relative card-cinematic p-10 border-primary/20 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-gold">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-3xl font-bold mb-3">24/7 CCTV Security</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Our entire premises are monitored around the clock with high-definition security cameras. Combined with biometric entry systems and trained security staff, we ensure complete peace of mind.
                </p>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto">
                  {["Biometric Entry", "CCTV Cameras", "Night Security", "Visitor Log"].map((item) => (
                    <div key={item} className="bg-primary/8 rounded-xl py-3 px-2">
                      <p className="text-xs font-medium text-primary">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
