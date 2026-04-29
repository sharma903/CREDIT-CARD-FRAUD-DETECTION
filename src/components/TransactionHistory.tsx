import { Transaction, formatTime12 } from "@/lib/fraud-engine";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onBlock: (tx: Transaction) => void;
   role: "admin" | "employee";   // ✅ ADD
}

export function TransactionHistory({ transactions ,onBlock, role }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No transactions yet. Submit one above to get started.
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      <AnimatePresence initial={false}>
        {[...transactions].reverse().map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              t.isFraud
                ? "bg-destructive/10 border-destructive/40"
                : "bg-success/5 border-success/30"
            }`}
          >
            <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${t.isFraud ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
              {t.isFraud ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{t.merchantName}</span>
                <span className="text-xs text-muted-foreground truncate">· {t.productName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono">{t.cardNumberMasked}</span>
                <span>{formatTime12(t.timestamp)}</span>
                <span className="hidden sm:flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</span>
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1">
  <div className="font-mono font-semibold">
    ₹{t.amount.toLocaleString("en-IN")}
  </div>

  <div className={`text-xs font-medium ${t.isFraud ? "text-destructive" : "text-success"}`}>
    Risk {t.riskScore}
  </div>

  {role === "admin" && (
  <button
    onClick={() => onBlock(t)}
    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
  >
    Block
  </button>
)}
</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
