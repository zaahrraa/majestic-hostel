import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Crown, CheckCircle, Users, Loader2, AlertCircle } from "lucide-react";
import { Reveal, StaggerReveal, StaggerItem } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";

interface RoomListing {
  id: string;
  room_type: string;
  title: string;
  description: string;
  image_url: string | null;
  badge: string | null;
  badge_color: string | null;
  features: string[];
  capacity: number;
  availability_status: string;
  sort_order: number;
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={`perspective-1000 ${className}`}
    >
      {children}
    </motion.div>
  );
}

const statusColor = (status: string) => {
  if (status === "Available") return "bg-green-500/10 text-green-600 dark:text-green-400";
  if (status === "Maintenance") return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
  return "bg-destructive/10 text-destructive";
};
const statusDot = (status: string) => {
  if (status === "Available") return "bg-green-500";
  if (status === "Maintenance") return "bg-yellow-500";
  return "bg-destructive";
};

export default function Rooms() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("room_listings")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setRooms(data as RoomListing[]);
        setLoading(false);
      });
  }, []);

  return (
    <main className="pt-20">
      {/* Header */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 blur-3xl rounded-full" />
        <Reveal className="text-center max-w-3xl mx-auto relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Accommodation</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-2 mb-4">
            Our <span className="text-gold-gradient">Rooms</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose the perfect space for your stay. All rooms include 24/7 security, clean attached washrooms, and a supportive community.
          </p>
        </Reveal>
      </section>

      {/* Room cards */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
          ) : (
            <StaggerReveal className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {rooms.map((room) => (
                <StaggerItem key={room.id}>
                  <TiltCard>
                    <div
                      className={`card-cinematic overflow-hidden cursor-pointer transition-all duration-500 ${
                        activeRoom === room.id ? "ring-2 ring-primary shadow-gold" : ""
                      }`}
                      onClick={() => setActiveRoom(activeRoom === room.id ? null : room.id)}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden aspect-[4/3] group">
                        {room.image_url ? (
                          <motion.img
                            src={room.image_url}
                            alt={room.title}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.07 }}
                            transition={{ duration: 0.5 }}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Crown className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                        {/* Badge */}
                        {room.badge && (
                          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            room.badge_color === "gold" ? "bg-primary text-primary-foreground" :
                            room.badge_color === "rose" ? "bg-accent text-accent-foreground" :
                            "bg-secondary text-secondary-foreground"
                          }`}>
                            {room.badge}
                          </div>
                        )}

                        {/* Availability Status */}
                        <div className={`absolute bottom-4 right-4 flex items-center gap-1 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium ${statusColor(room.availability_status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusDot(room.availability_status)} animate-pulse`} />
                          {room.availability_status}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display text-xl font-bold">{room.title}</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{room.capacity === 1 ? "Private" : "Shared"}</span>
                            </div>
                          </div>
                          {room.availability_status !== "Available" && (
                            <AlertCircle className="w-4 h-4 text-yellow-500 shrink-0 mt-1" />
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{room.description}</p>

                        {/* Features */}
                        <motion.div
                          initial={false}
                          animate={{ height: activeRoom === room.id ? "auto" : 0, opacity: activeRoom === room.id ? 1 : 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 gap-2 mb-4 pt-2 border-t border-border/50">
                            {room.features.map((f) => (
                              <div key={f} className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="text-sm text-muted-foreground">{f}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>

                        {room.availability_status === "Available" ? (
                          <Link
                            to="/booking"
                            className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold btn-gold mt-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Book This Room
                          </Link>
                        ) : (
                          <div className="mt-2 w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-muted text-muted-foreground cursor-not-allowed">
                            {room.availability_status === "Maintenance" ? "Under Maintenance" : "Fully Booked"}
                          </div>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerReveal>
          )}

          {/* Washroom section */}
          <Reveal className="mt-16">
            <div className="card-cinematic p-8 md:p-10 border-primary/15 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Included</span>
                  <h2 className="font-display text-3xl font-bold mt-2 mb-4">
                    Attached <span className="text-gold-gradient">Washrooms</span>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Every room type comes with access to clean, modern attached washrooms. Maintained to the highest hygiene standards with daily cleaning and inspections.
                  </p>
                  {["Hot & cold water supply", "Clean sanitation daily", "Modern fittings", "Privacy assured"].map((feat) => (
                    <div key={feat} className="flex items-center gap-2 mb-2">
                      <Crown className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm text-muted-foreground">{feat}</span>
                    </div>
                  ))}
                </div>
                <div className="overflow-hidden rounded-2xl group">
                  <img
                    src="https://i.postimg.cc/1zHvpPr8/attached-washroom1.png"
                    alt="Attached Washroom"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
