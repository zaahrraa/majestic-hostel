import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Menu, X, Crown, LogOut, LayoutDashboard } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Rooms", href: "/rooms" },
  { label: "Facilities", href: "/facilities" },
  { label: "Rules", href: "/rules" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
  { label: "Booking", href: "/booking" },
];

/** Tiny tooltip wrapper */
function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className="tooltip-text">{label}</span>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastY, setLastY] = useState(0);
  const { toggleTheme, isDark } = useTheme();
  const { isLoggedIn, profile, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      setHidden(y > lastY && y > 200);
      setLastY(y);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const dashboardHref =
    profile?.role === "warden" ? "/warden-dashboard" : profile?.role === "student" ? "/student-dashboard" : "/login";

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "py-2 glass shadow-elevated border-b border-primary/10" : "py-4 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full btn-gold flex items-center justify-center shadow-gold">
              <Crown className="w-4 h-4" style={{ color: "hsl(var(--primary-foreground))" }} />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-gold-gradient leading-none block">
                Majestic
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none">
                Girls Hostel
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle with tooltip */}
            <Tip label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-full flex items-center justify-center glass border border-border/60 hover:border-primary/40 transition-all duration-200 hover:shadow-gold"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="w-4 h-4 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </Tip>

            {/* Auth CTA */}
            {isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-2">
                <Tip label="Go to Dashboard">
                  <Link
                    to={dashboardHref}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                </Tip>
                <Tip label="Logout from dashboard">
                  <button
                    onClick={logout}
                    className="w-9 h-9 rounded-full flex items-center justify-center glass border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/10 transition-all duration-200"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4 text-destructive" />
                  </button>
                </Tip>
              </div>
            ) : (
              <Tip label="Book a hostel room">
                <Link
                  to="/login"
                  className="hidden lg:flex px-5 py-2 rounded-xl text-sm font-semibold btn-gold"
                >
                  Student Login
                </Link>
              </Tip>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center glass border border-border/60 hover:border-primary/40 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <X className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Menu className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-4 right-4 z-40 glass rounded-2xl border border-primary/20 p-6 shadow-elevated lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 pt-3 border-t border-border/50">
                {isLoggedIn ? (
                  <div className="flex gap-2">
                    <Link
                      to={dashboardHref}
                      className="flex-1 py-2.5 text-center rounded-xl text-sm font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={logout}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-destructive/10 text-destructive border border-destructive/20"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full py-2.5 text-center rounded-xl text-sm font-semibold btn-gold"
                  >
                    Student Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
