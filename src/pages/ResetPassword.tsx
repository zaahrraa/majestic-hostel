import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Supabase sends #access_token=...&type=recovery in the URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
      toast.error(updateErr.message);
    } else {
      setDone(true);
      toast.success("Password updated successfully!");
      setTimeout(() => navigate("/login"), 2500);
    }
  };

  return (
    <main className="min-h-screen pt-20 flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="card-cinematic p-8 border-primary/15">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 btn-gold">
              <Lock className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-1">Reset Password</h1>
            <p className="text-sm text-muted-foreground">Enter your new password below</p>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse-gold">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">Password updated! Redirecting to login…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="input-field pr-11" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                  Confirm New Password
                </label>
                <input type="password" placeholder="Repeat new password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} required
                  className="input-field" />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">{error}</p>
                </motion.div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold btn-gold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  );
}
