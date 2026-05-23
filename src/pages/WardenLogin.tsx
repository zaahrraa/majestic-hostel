import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function WardenLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const { loginWarden } = useAuth();
  const navigate = useNavigate();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!emailValid || !passwordValid) return;
    setError("");
    setLoading(true);
    try {
      const result = await loginWarden(email, password);
      if (result.success) {
        navigate("/warden-dashboard", { replace: true });
      } else {
        setError(result.error || "Invalid warden credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-20 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl animate-blob"
          style={{ background: "hsl(var(--accent) / 0.07)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl animate-blob"
          style={{ background: "hsl(var(--primary) / 0.06)", animationDelay: "4s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="card-cinematic p-8 border-primary/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
            >
              <Shield className="w-7 h-7" style={{ color: "hsl(var(--primary-foreground))" }} />
            </motion.div>
            <h1 className="font-display text-3xl font-bold mb-1">Warden Access</h1>
            <p className="text-sm text-muted-foreground">Administrative dashboard login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                className={`input-field${touched.email && !emailValid && email ? " error" : ""}`}
              />
              {touched.email && email && !emailValid && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Please enter a valid email address
                </motion.p>
              )}
              {touched.email && !email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> This field is required
                </motion.p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  className={`input-field pr-11${touched.password && !passwordValid && password ? " error" : ""}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && !password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> This field is required
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </motion.div>
            )}

            <button type="submit" disabled={loading} data-cursor="Enter"
              className="w-full py-3.5 rounded-xl font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Authenticating…" : "Enter Dashboard"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            This page is for authorised warden use only.{" "}
            <Link to="/login" className="text-primary hover:underline">Student login</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
