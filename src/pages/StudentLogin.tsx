import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Eye, EyeOff, LogIn, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Screen = "login" | "forgot";

export default function StudentLogin() {
  const [screen, setScreen] = useState<Screen>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [fpEmail, setFpEmail] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSent, setFpSent] = useState(false);

  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!emailValid || !passwordValid) return;
    setError("");
    setLoading(true);
    const result = await loginStudent(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back! Redirecting to dashboard…");
      navigate("/student-dashboard");
    } else {
      setError(result.error || "Invalid email or password. Please try again.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail.trim()) return;
    setFpLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(fpEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setFpLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setFpSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    }
  };

  return (
    <main className="min-h-screen pt-20 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl animate-blob"
          style={{ background: "hsl(var(--primary) / 0.07)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl animate-blob"
          style={{ background: "hsl(var(--accent) / 0.06)", animationDelay: "3s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative"
      >
        <AnimatePresence mode="wait">
          {screen === "login" ? (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="card-cinematic p-8 border-primary/15">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-gold btn-gold"
                  >
                    <Crown className="w-7 h-7" style={{ color: "hsl(var(--primary-foreground))" }} />
                  </motion.div>
                  <h1 className="font-display text-3xl font-bold mb-1">Student Login</h1>
                  <p className="text-sm text-muted-foreground">Access your hostel dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                      Email Address
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Password
                      </label>
                      <button type="button" onClick={() => { setFpEmail(email); setScreen("forgot"); }}
                        className="text-xs text-primary hover:underline font-medium transition-colors">
                        Forgot password?
                      </button>
                    </div>
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

                  <button type="submit" disabled={loading} data-cursor="Sign In"
                    className="w-full py-3.5 rounded-xl font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    {loading ? "Signing in…" : "Sign In"}
                  </button>
                </form>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  Staff access?{" "}
                  <Link to="/warden-login" className="text-primary hover:underline font-medium">
                    Warden login
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="card-cinematic p-8 border-primary/15">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "hsl(var(--primary) / 0.12)" }}
                  >
                    <Mail className="w-7 h-7 text-primary" />
                  </motion.div>
                  <h1 className="font-display text-2xl font-bold mb-1">Forgot Password?</h1>
                  <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                </div>

                {fpSent ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-gold">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reset link sent to <strong className="text-foreground">{fpEmail}</strong>. Check your inbox (and spam folder).
                    </p>
                    <button onClick={() => { setFpSent(false); setScreen("login"); }}
                      className="w-full py-3 rounded-xl font-semibold btn-gold flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back to Login
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                        Email Address
                      </label>
                      <input type="email" placeholder="your@email.com" value={fpEmail}
                        onChange={(e) => setFpEmail(e.target.value)} required
                        className="input-field" />
                    </div>

                    <button type="submit" disabled={fpLoading || !fpEmail.trim()}
                      className="w-full py-3.5 rounded-xl font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                      {fpLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      {fpLoading ? "Sending…" : "Send Reset Link"}
                    </button>

                    <button type="button" onClick={() => setScreen("login")}
                      className="w-full py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
