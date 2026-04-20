import { useCallback, useEffect, useMemo, useState } from "react";
import { Login } from "@/components/Login";
import { Navbar } from "@/components/Navbar";
import { CreditCard } from "@/components/CreditCard";
import { TransactionForm, TransactionFormData } from "@/components/TransactionForm";
import { ChartsDashboard } from "@/components/ChartsDashboard";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Transaction, analyzeFraud, MERCHANTS } from "@/lib/fraud-engine";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const Index = () => {
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem("sg_user"));
  const [cardData, setCardData] = useState({ cardholderName: "", cardNumber: "", expiry: "", cvv: "" });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastResult, setLastResult] = useState<Transaction | null>(null);

  useEffect(() => {
    document.title = userName ? "SecureGuard – Dashboard" : "SecureGuard – AI Fraud Detection";
  }, [userName]);

  function handleLogin(name: string) {
    localStorage.setItem("sg_user", name);
    setUserName(name);
  }

  function handleLogout() {
    localStorage.removeItem("sg_user");
    setUserName(null);
    setTransactions([]);
    setLastResult(null);
  }

  const handleCardChange = useCallback((d: Partial<typeof cardData>) => {
    setCardData((prev) => ({ ...prev, ...d }));
  }, []);

  function handleSubmit(data: TransactionFormData) {
    const merchant = MERCHANTS.find((m) => m.name === data.merchantName);
    if (!merchant) return;

    const ts = data.timestamp;
    const recent = transactions.map((t) => t.timestamp);
    const result = analyzeFraud(data.amount, merchant, ts, recent, data.location);

    const tx: Transaction = {
      id: crypto.randomUUID(),
      cardholderName: data.cardholderName,
      cardNumberMasked: `•••• ${data.cardNumber.slice(-4)}`,
      merchantName: data.merchantName,
      productName: data.productName,
      amount: data.amount,
      location: data.location,
      timestamp: ts,
      ...result,
    };

    setTransactions((prev) => [...prev, tx]);
    setLastResult(tx);

    if (tx.isFraud) {
      toast.error(`Fraud detected · Risk ${tx.riskScore}`, {
        description: tx.reasons[0],
      });
    } else {
      toast.success(`Transaction approved · Risk ${tx.riskScore}`, {
        description: `${tx.merchantName} · ₹${tx.amount.toLocaleString("en-IN")}`,
      });
    }
  }

  const stats = useMemo(() => {
    const total = transactions.length;
    const fraud = transactions.filter((t) => t.isFraud).length;
    const safe = total - fraud;
    const avgRisk = total ? Math.round(transactions.reduce((s, t) => s + t.riskScore, 0) / total) : 0;
    return { total, fraud, safe, avgRisk };
  }, [transactions]);

  if (!userName) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen">
      <Navbar userName={userName} onLogout={handleLogout} />

      <main className="container py-8 space-y-8">
        {/* Hero */}
        <section className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            <span className="text-gradient">AI Fraud Detection</span> Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time machine-learning powered transaction risk analysis.
          </p>
        </section>

        {/* Top: Card + Form */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <CreditCard {...cardData} flipped={cvvFocused} />

            <AnimatePresence mode="wait">
              {lastResult ? (
                <motion.div
                  key={lastResult.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`rounded-xl border p-5 ${
                    lastResult.isFraud ? "border-destructive/50 bg-destructive/10" : "border-success/40 bg-success/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {lastResult.isFraud ? (
                      <ShieldAlert className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 text-success shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-display font-semibold">
                          {lastResult.isFraud ? "Fraud Detected" : "Transaction Safe"}
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                          <span>Risk: <span className="font-mono font-bold">{lastResult.riskScore}</span></span>
                          <span className="text-muted-foreground">Confidence: <span className="font-mono">{lastResult.confidence}%</span></span>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {lastResult.reasons.map((r, i) => (
                          <li key={i} className="flex gap-2"><span className="text-primary">•</span>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-border gradient-card p-5 text-sm text-muted-foreground"
                >
                  Fill in the transaction details to run an AI risk analysis. Click the CVV field to see the back of the card.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="gradient-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold mb-4">Transaction Details</h2>
            <TransactionForm
              onChange={handleCardChange}
              onCvvFocus={setCvvFocused}
              onSubmit={handleSubmit}
            />
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Transactions" value={stats.total} accent="primary" />
          <StatCard label="Safe" value={stats.safe} accent="success" />
          <StatCard label="Fraud Detected" value={stats.fraud} accent="destructive" />
          <StatCard label="Avg Risk Score" value={stats.avgRisk} accent="primary" suffix="/100" />
        </section>

        {/* Charts */}
        <section className="space-y-3">
          <h2 className="font-display text-2xl font-semibold">Live Analytics</h2>
          <ChartsDashboard transactions={transactions} />
        </section>

        {/* History */}
        <section className="gradient-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold mb-4">Transaction History</h2>
          <TransactionHistory transactions={transactions} />
        </section>

        <footer className="text-center text-xs text-muted-foreground py-6">
          SecureGuard · AI fraud detection demo · Data is stored locally in your browser.
        </footer>
      </main>
    </div>
  );
};

function StatCard({ label, value, accent, suffix }: { label: string; value: number; accent: "primary" | "success" | "destructive"; suffix?: string }) {
  const accentMap = {
    primary: "text-primary",
    success: "text-success",
    destructive: "text-destructive",
  } as const;
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.97, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="gradient-card border border-border rounded-xl p-4 shadow-card"
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl font-bold mt-1 ${accentMap[accent]}`}>
        {value}
        {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
      </div>
    </motion.div>
  );
}

export default Index;
