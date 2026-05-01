import { Transaction, formatTime12 } from "@/lib/fraud-engine";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react";

interface Props {
  transactions: Transaction[];
  onBlock: (tx: Transaction) => void;
  onUnblock: (last4: string) => void;
  role: "admin" | "employee";
}

export function TransactionHistory({
  transactions,
  onBlock,
  onUnblock,
  role,
}: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        No transactions yet. Submit one above to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      <AnimatePresence>
        {transactions.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              t.isFraud
                ? "bg-destructive/10 border-destructive/40"
                : "bg-success/5 border-success/30"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                t.isFraud
                  ? "bg-destructive/20 text-destructive"
                  : "bg-success/20 text-success"
              }`}
            >
              {t.isFraud ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex gap-2">
                <span className="font-semibold text-sm">
                  {t.merchantName}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {t.productName}
                </span>
              </div>

              <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                <span className="font-mono">{t.cardNumberMasked}</span>
                <span>{formatTime12(t.timestamp)}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {t.location}
                </span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1 min-w-[120px]">
              <div className="font-mono">
                ₹{t.amount.toLocaleString("en-IN")}
              </div>

              <div className="text-xs">
                Risk {t.riskScore}
              </div>

              {role === "admin" && !t.isBlocked && (
            <button
              onClick={() => onBlock(t)}
              className="
                mt-2
                px-3 py-1
                rounded-md
                bg-destructive
                hover:bg-destructive/90
                text-white
                text-xs
                font-medium
                transition-all
                duration-200
                shadow-sm
                hover:scale-105
                active:scale-95
              "
            >
              Block 
            </button>
          )}

{role === "admin" && t.isBlocked && (
  <button
    onClick={() => onUnblock(t.cardNumberMasked.slice(-4))}
    className="
      mt-2
      px-3 py-1
      rounded-md
      bg-success
      hover:bg-success/90
      text-white
      text-xs
      font-medium
      transition-all
      duration-200
      shadow-sm
      hover:scale-105
      active:scale-95
    "
  >
    Unblock Card
  </button>
)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}