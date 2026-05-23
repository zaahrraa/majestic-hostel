import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ITEMS = ["Bed", "Mattress", "Pillow", "Cupboard", "Chair", "Desk", "Fan", "Lights"];

export default function InventoryGate({ profileId, onVerified }: { profileId: string; onVerified: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const allChecked = ITEMS.every((i) => checked[i]);

  const submit = async () => {
    if (!allChecked) {
      toast.error("Please confirm every item before continuing.");
      return;
    }
    setSubmitting(true);
    console.log("[InventoryGate] submitting verification for profile", profileId, checked);
    const { data, error, status } = await supabase
      .from("profiles")
      .update({ inventory_verified: true })
      .eq("id", profileId)
      .select();
    console.log("[InventoryGate] response", { data, error, status });
    if (error) {
      toast.error("Failed to save verification: " + error.message);
      setSubmitting(false);
      return;
    }
    toast.success("Inventory verified! Welcome to your dashboard.");
    onVerified();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card-cinematic p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
            <ClipboardCheck className="w-6 h-6 text-background" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Room Inventory Checklist</h2>
            <p className="text-xs text-muted-foreground">Confirm the items in your room before continuing.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 my-5">
          {ITEMS.map((item) => (
            <label key={item}
              className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                checked[item] ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}>
              <input type="checkbox" className="accent-primary"
                checked={!!checked[item]}
                onChange={(e) => setChecked((p) => ({ ...p, [item]: e.target.checked }))} />
              <span>{item}</span>
              {checked[item] && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
            </label>
          ))}
        </div>
        <button onClick={submit} disabled={submitting || !allChecked}
          className="btn-gold w-full px-5 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
          Confirm & Enter Dashboard
        </button>
      </motion.div>
    </div>
  );
}
