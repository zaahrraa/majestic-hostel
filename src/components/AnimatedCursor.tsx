import { useEffect, useState, useRef } from "react";
import { motion, useSpring } from "framer-motion";

const AnimatedCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { stiffness: 400, damping: 30, mass: 0.6 };
  const trailConfig = { stiffness: 120, damping: 20, mass: 0.9 };

  const dotX = useSpring(0, springConfig);
  const dotY = useSpring(0, springConfig);
  const trailX = useSpring(0, trailConfig);
  const trailY = useSpring(0, trailConfig);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePos({ x, y });
      dotX.set(x - 4);
      dotY.set(y - 4);
      trailX.set(x - 16);
      trailY.set(y - 16);
      if (!isVisible) setIsVisible(true);
    };

    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive = target.closest("a, button, [role='button'], input, textarea, select, label, [data-cursor]");
      setIsHovering(!!interactive);
    };

    const down = () => setIsClicking(true);
    const up = () => setIsClicking(false);
    const leave = () => setIsVisible(false);
    const enter = () => setIsVisible(true);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
    };
  }, [isVisible, dotX, dotY, trailX, trailY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner dot — snappy */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{ x: dotX, y: dotY }}
        animate={{
          scale: isClicking ? 0.4 : isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "hsl(var(--primary))" }}
        />
      </motion.div>

      {/* Outer ring — smooth trail */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{ x: trailX, y: trailY }}
        animate={{
          scale: isClicking ? 0.7 : isHovering ? 1.5 : 1,
          opacity: isClicking ? 0.6 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            border: isHovering
              ? "1.5px solid hsl(var(--primary) / 0.9)"
              : "1.5px solid hsl(var(--primary) / 0.45)",
            background: isHovering ? "hsl(var(--primary) / 0.08)" : "transparent",
            backdropFilter: isHovering ? "blur(4px)" : "none",
            transition: "border-color 0.2s ease, background 0.2s ease",
          }}
        />
      </motion.div>
    </>
  );
};

export default AnimatedCursor;
