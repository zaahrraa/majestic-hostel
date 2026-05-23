import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, direction = "up", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const controls = useAnimation();

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 40 : 0,
      x: direction === "left" ? -40 : direction === "right" ? 40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.7, delay, ease: "easeOut" as const },
    },
  };

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <motion.div ref={ref} initial="hidden" animate={controls} variants={variants} className={className}>
      {children}
    </motion.div>
  );
};

interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerReveal: React.FC<StaggerRevealProps> = ({ children, className = "", staggerDelay = 0.1 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: staggerDelay } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default Reveal;
