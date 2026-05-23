import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/Reveal";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HostelRule {
  id: string;
  icon: string;
  title: string;
  description: string;
  sort_order: number;
}

export default function Rules() {
  const [rules, setRules] = useState<HostelRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("hostel_rules")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setRules(data as HostelRule[]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="pt-20">
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/8 blur-3xl rounded-full" />
        <Reveal className="text-center max-w-3xl mx-auto relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Compliance</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-2 mb-4">
            Rules & <span className="text-gold-gradient">Policies</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Our rules exist to ensure a safe, comfortable, and respectful environment for all residents.
          </p>
        </Reveal>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <StaggerReveal className="space-y-4">
              {rules.map((rule, i) => (
                <StaggerItem key={rule.id}>
                  <motion.div
                    className="card-cinematic p-6 group flex gap-5 items-start"
                    whileHover={{ x: 8, borderColor: "hsl(var(--primary) / 0.3)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0 group-hover:bg-primary/20 group-hover:shadow-gold transition-all duration-300">
                      {rule.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Rule {String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-1.5 group-hover:text-primary transition-colors duration-200">
                        {rule.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-primary/30 group-hover:text-primary transition-colors duration-200 shrink-0 mt-1" />
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          )}

          {/* Late fee callout */}
          <Reveal className="mt-10">
            <div className="card-cinematic p-6 border-destructive/20 bg-destructive/5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-destructive">Late Payment Policy</h3>
                <p className="text-sm text-muted-foreground">
                  A late fee of <strong className="text-foreground">PKR 500</strong> is charged for every month fee payment is overdue. Please ensure timely payment to avoid additional charges.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Acceptance note */}
          <Reveal className="mt-8 text-center">
            <div className="card-cinematic p-8 border-primary/20">
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
                By residing at Majestic Girls Hostel, all students agree to abide by these rules and policies. Violations may result in warnings, fines, or termination of the tenancy agreement.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <CheckCircle className="w-4 h-4" />
                I understand and will comply
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
