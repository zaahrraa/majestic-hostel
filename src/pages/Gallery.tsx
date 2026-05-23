import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { X, ChevronLeft, ChevronRight, Maximize2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = ["All", "Building", "Interior", "Facilities", "Rooms"];

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: string;
  sort_order: number;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setImages(data as GalleryImage[]);
        setLoading(false);
      });
  }, []);

  const filtered = filter === "All" ? images : images.filter((img) => img.category === filter);

  const openLightbox = (id: string) => setLightbox(id);
  const closeLightbox = () => setLightbox(null);

  const prev = () => {
    if (lightbox === null) return;
    const idx = filtered.findIndex((i) => i.id === lightbox);
    setLightbox(filtered[(idx - 1 + filtered.length) % filtered.length].id);
  };

  const next = () => {
    if (lightbox === null) return;
    const idx = filtered.findIndex((i) => i.id === lightbox);
    setLightbox(filtered[(idx + 1) % filtered.length].id);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightbox, filtered]);

  const lightboxImage = lightbox !== null ? images.find((i) => i.id === lightbox) : null;

  return (
    <main className="pt-20">
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/6 blur-3xl rounded-full" />
        <Reveal className="text-center max-w-3xl mx-auto relative">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Visual Tour</span>
          <h1 className="font-display text-5xl md:text-7xl font-bold mt-2 mb-4">
            Our <span className="text-gold-gradient">Gallery</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore Majestic Girls Hostel through our gallery. Click any image for a cinematic full-screen view.
          </p>
        </Reveal>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === cat
                  ? "btn-gold"
                  : "glass border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry grid */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
          ) : (
            <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              <AnimatePresence>
                {filtered.map((img, i) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="break-inside-avoid mb-4"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl cursor-pointer group shadow-card hover:shadow-elevated transition-all duration-400"
                      onClick={() => openLightbox(img.id)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                          {img.category}
                        </span>
                        <p className="text-sm font-medium mt-1 text-foreground">{img.alt}</p>
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Maximize2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 w-10 h-10 rounded-full glass border border-border/60 flex items-center justify-center hover:border-destructive/60 hover:bg-destructive/10 transition-all duration-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 md:left-8 w-10 h-10 rounded-full glass border border-border/60 flex items-center justify-center hover:border-primary/40 transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <motion.div
              key={lightboxImage.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-elevated"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent rounded-b-2xl">
                <p className="text-sm font-medium text-center">{lightboxImage.alt}</p>
                <p className="text-xs text-muted-foreground text-center mt-1">{lightboxImage.category}</p>
              </div>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 md:right-8 w-10 h-10 rounded-full glass border border-border/60 flex items-center justify-center hover:border-primary/40 transition-all duration-200 z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {filtered.map((img) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setLightbox(img.id); }}
                  className={`rounded-full transition-all duration-200 ${img.id === lightbox ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/40 hover:bg-muted-foreground"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
