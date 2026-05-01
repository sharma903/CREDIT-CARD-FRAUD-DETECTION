import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, MapPin } from "lucide-react";

interface Props {
  blockedCards: any[];
  onUnblock: (last4: string) => void;
  role: "admin" | "employee";
}

export function BlockedCards({ blockedCards, onUnblock, role }: Props) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  if (!blockedCards || blockedCards.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No blocked cards
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      <AnimatePresence>
        {[...blockedCards].reverse().map((b, i) => {
          const id = b._id || b.id || i;

          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 rounded-lg border bg-destructive/10 border-destructive/40 cursor-pointer"
              onClick={() => setActiveId(activeId === id ? null : id)}
            >
              {/* HEADER */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-destructive/20 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {b.merchant || "Unknown Merchant"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      · BLOCKED
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono">•••• {b.last4}</span>
                    <span>
                      {new Date(b.time || b.createdAt).toLocaleTimeString()}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {b.location || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-semibold">
                    ₹{b.amount?.toLocaleString("en-IN") || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">Risk</div>
                  <div
                    className={`font-bold ${
                      b.riskScore >= 80
                        ? "text-red-500"
                        : b.riskScore >= 50
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {b.riskScore || "--"}/100
                  </div>
                </div>
              </div>

              {/* EXPANDED DETAILS */}
              <AnimatePresence>
                {activeId === id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-2"
                  >
                    <div><b>Reason:</b> {b.reason}</div>
                    <div><b>Cardholder:</b> {b.cardholderName || "N/A"}</div>
                    <div><b>Card:</b> •••• {b.last4}</div>
                    <div><b>Product:</b> {b.product || "N/A"}</div>
                    <div><b>Location:</b> {b.location || "N/A"}</div>
                    <div><b>Blocked By:</b> {b.source || "System"}</div>
                    <div><b>Time:</b> {new Date(b.time).toLocaleString()}</div>

                    {/* FRAUD REASONS */}
                    {b.reasons && (
                      <div>
                        <b className="text-destructive">Fraud Reasons:</b>
                        <ul className="mt-1 space-y-1">
                          {b.reasons.map((r: string, idx: number) => (
                            <li key={idx} className="text-destructive">
                              • {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ADMIN ONLY */}
                    {role === "admin" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnblock(b.last4);
                        }}
                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs"
                      >
                        Unblock Card
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}