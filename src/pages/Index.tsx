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
import { BlockedCards } from "@/components/BlockedCards";
import { analyzeWithHistory } from "@/lib/predictor";

type UserType = {
  name?: string;
  email?: string;
  role?: "admin" | "employee";
};

const Index = () => {
  const [userName, setUserName] = useState<string | null>("Guest");
  const [cardData, setCardData] = useState({ cardholderName: "", cardNumber: "", expiry: "", cvv: "" });
  const [cvvFocused, setCvvFocused] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastResult, setLastResult] = useState<Transaction | null>(null);
  const [blockedCards, setBlockedCards] = useState<any[]>([]);
  const [user, setUser] = useState<UserType>({});

useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  setUser(stored);
}, []);
  

  useEffect(() => {
  fetch("http://localhost:5000/api/blocked-cards")
    .then(res => res.json())
    .then(data => {
      setBlockedCards(data);
    })
    .catch(err => {
      console.log("Blocked cards fetch error:", err);

      // fallback (optional)
      const stored = JSON.parse(localStorage.getItem("blockedCards") || "[]");
      setBlockedCards(stored);
    });
}, []);

//   useEffect(() => {
//   const data = JSON.parse(localStorage.getItem("blockedCards") || "[]");
//   setBlockedCards(data);
// }, []);

  useEffect(() => {
    document.title = userName ? "Dashboard" : "Dashboard";
  }, [userName]);

  useEffect(() => {
  const storedUser =
    JSON.parse(localStorage.getItem("user") || "null") ||
    (localStorage.getItem("sg_user")
      ? { name: localStorage.getItem("sg_user") }
      : null);

    if (storedUser?.name) {
    setUserName(storedUser.name);
  }
}, []);

 useEffect(() => {
  fetch("http://localhost:5000/api/transactions/all")
  .then(res => res.json())
  .then(data => {
    const fixedData = data
      .map((t: any) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime()
      );

    setTransactions(fixedData);
  })
    .catch(err => console.log("Fetch error:", err));
}, []);

// 🔥 SYNC BLOCKED CARDS ACROSS TABS + REALTIME UI FIX
useEffect(() => {
  const syncBlockedCards = () => {
    const latest = JSON.parse(localStorage.getItem("blockedCards") || "[]");
    setBlockedCards(latest);
  };

  window.addEventListener("storage", syncBlockedCards);
  window.addEventListener("focus", syncBlockedCards);

  return () => {
    window.removeEventListener("storage", syncBlockedCards);
    window.removeEventListener("focus", syncBlockedCards);
  };
}, []);

function handleUnblock(last4: string) {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  if (currentUser.role !== "admin") {
    toast.error("Unauthorized action");
    return;
  }

  const updated = blockedCards.filter((b) => b.last4 !== last4);

 
  localStorage.setItem("blockedCards", JSON.stringify(updated));
   setBlockedCards(updated);
  toast.success("Card unblocked");
}


  function handleLogin(name: string) {
  // keep your existing
  localStorage.setItem("sg_user", name);

  // ADD this (important for consistency with HTML + backend)
  const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

localStorage.setItem("user", JSON.stringify({
  ...existingUser,
  name
}));

  setUserName(name);
}

  function handleLogout() {
  // clear everything like your HTML version
  localStorage.clear();
  sessionStorage.clear();

  setUserName(null);
  setTransactions([]);
  setLastResult(null);

  // redirect like dashboard.html
  window.location.href = "/index.html";
}

  const handleCardChange = useCallback((d: Partial<typeof cardData>) => {
    setCardData((prev) => ({ ...prev, ...d }));
  }, []);

  // 🔒 CHECK BLOCKED CARDS
function isCardBlocked(cardNumber: string) {
  const last4 = cardNumber.slice(-4).trim();

  // check state FIRST
  const existsInState = blockedCards.some(
    (b: any) => String(b.last4).trim() === last4
  );

  if (existsInState) return true;

  // fallback localStorage
  const blocked = JSON.parse(
    localStorage.getItem("blockedCards") || "[]"
  );

  return blocked.some(
    (b: any) => String(b.last4).slice(-4).trim() === last4
  );
}

function handleBlockCard(tx: any) {
  const last4 = tx.cardNumberMasked.slice(-4);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "test@gmail.com";

  setBlockedCards(prev => {
    if (prev.find(b => b.last4 === last4)) {
      toast.error("Card already blocked");
      return prev;
    }


const updated = [
  ...prev,
  {
    id: crypto.randomUUID(),
    last4,
    cardholderName: tx.cardholderName,
    cardNumber: tx.cardNumber,   // ✅ ADD
    merchant: tx.merchantName,
    product: tx.productName,
    amount: tx.amount,
    location: tx.location,
    riskScore: tx.riskScore,
    reason: "Manual Block",
    reasons: ["Blocked manually by user"],
    source: "MANUAL ACTION",
    time: tx.timestamp || new Date().toISOString(), // ✅ USE REAL TIME
  }
]; 



    localStorage.setItem("blockedCards", JSON.stringify(updated));

    // EMAIL
    fetch("http://localhost:5000/api/block-card", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        last4,
        location: tx.location,
        amount: tx.amount,
        merchant: tx.merchantName
      }),
    }).catch(err => console.log("Email error:", err));

    toast.success("Card blocked & email sent");

    return updated;
  });
}


  async function handleSubmit(data: TransactionFormData) {

  const last4 = data.cardNumber.slice(-4).trim();

  const blockedNow = JSON.parse(localStorage.getItem("blockedCards") || "[]");

  const isBlocked = blockedNow.some(
    (b: any) => String(b.last4).slice(-4).trim() === last4
  );

  if (isBlocked) {
    toast.error("🚫 Card already BLOCKED");
    return;
  }

  const merchant = MERCHANTS.find((m) => m.name === data.merchantName);

  if (!merchant) {
    toast.error("Invalid merchant");
    return;
  }

  

    const ts = data.timestamp;
    const recent = transactions.map((t) => t.timestamp);
    const result = await analyzeFraud(
  data.amount,
  merchant,
  ts,
  recent,
  data.location,
  transactions,
  data.cardNumber
);
 
   const tx: Transaction = {
          id: crypto.randomUUID(),
          cardholderName: data.cardholderName,
          cardNumber: data.cardNumber, // ✅ ADD THIS
          cardNumberMasked: `•••• ${data.cardNumber.slice(-4)}`,
          merchantName: data.merchantName,
          productName: data.productName,
          amount: data.amount,
          location: data.location,
          timestamp: ts,
          ...result,
        };
  
  // 🔥 GET PREVIOUS TRANSACTIONS
const history = transactions;

// 🔥 RUN PREDICTION (based on last month)
const prediction = analyzeWithHistory(tx, history);

// 🔥 UPDATE RISK SCORE
tx.riskScore += Math.min(prediction.extraRisk, 15);
tx.reasons = [...tx.reasons, ...prediction.reasons];

// setTransactions((prev) => [tx, ...prev]);
// setLastResult(tx);

// 🔥 AUTO BLOCK IF HIGH RISK (FIXED)
if (tx.riskScore >= 80) {
  tx.isBlocked = true;   // ✅ IMPORTANT
  tx.isFraud = true;

  // ✅ ADD HERE (after tx is ready)
setTransactions((prev) => [tx, ...prev]);
setLastResult(tx);

  const last4 = String(data.cardNumber).slice(-4).trim();

  setBlockedCards(prev => {
    if (prev.find(b => b.last4 === last4)) return prev;

    const updated = [
  ...prev,
  {
    id: crypto.randomUUID(),
    last4,
    cardholderName: data.cardholderName,
    cardNumber: data.cardNumber,   // ✅ ADD THIS
    merchant: tx.merchantName,     // ✅ SAME NAMING
    product: data.productName,     // ✅ SAME NAMING
    amount: tx.amount,
    location: data.location,
    riskScore: tx.riskScore,
    reason: "High Risk Fraud",
    reasons: tx.reasons,
    source: "AUTO FRAUD SYSTEM",

    time: tx.timestamp || new Date().toISOString(),
  }
];

  fetch("http://localhost:5000/api/blocked-cards/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(updated[updated.length - 1]),
}).catch(err => console.log("Auto DB save error:", err));

    localStorage.setItem("blockedCards", JSON.stringify(updated));
    return updated;
  });

  // ✅ ADD THIS PART
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const email = user.email || "test@gmail.com";

  fetch("http://localhost:5000/api/block-card", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      last4,
      location: data.location,
      amount: tx.amount,
      merchant: tx.merchantName
    }),
  }).catch(err => console.log("Auto email error:", err));

  fetch("http://localhost:5000/api/transactions/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tx),
}).catch(err => console.log("Save error:", err));

  toast.error("⚠️ High Risk Detected - Card Auto Blocked!");
  return;
}

console.log("Checking block for:", data.cardNumber.slice(-4));
console.log("Blocked list:", localStorage.getItem("blockedCards"));


    fetch("http://localhost:5000/api/transactions/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tx),
}).catch(err => console.log("Save error:", err));


setTransactions((prev) => [tx, ...prev]);   // 🔥 THIS FIXES YOUR GRAPH
setLastResult(tx);                          // (optional but good)

     
  // ✅ SAVE TO LOCAL STORAGE (VERY IMPORTANT)
const updatedHistory = [tx, ...transactions];
localStorage.setItem("transactions", JSON.stringify(updatedHistory));

    if (tx.isFraud) {
      toast.error(`Fraud detected · Risk ${tx.riskScore}`, {
  description:
    tx.riskScore >= 80
      ? "Card has been automatically BLOCKED"
      : tx.reasons[0],
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

  

  return (
    <div className="min-h-screen">
      <Navbar userName={userName} onLogout={handleLogout} />

      <main className="container py-8 space-y-8">
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="gradient-card border border-primary/20 rounded-xl p-6 shadow-card"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display text-lg font-semibold">Protection Status</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Real-time monitoring active</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                      </span>
                      <span className="text-xs font-semibold text-success">LIVE</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: ShieldCheck, label: "AI Engine", value: "Active", color: "text-success" },
                      { icon: ShieldAlert, label: "Threat Level", value: "Low", color: "text-primary" },
                      { icon: ShieldCheck, label: "Encryption", value: "AES-256", color: "text-success" },
                      { icon: ShieldCheck, label: "Compliance", value: "PCI-DSS", color: "text-primary" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="rounded-lg border border-border bg-background/40 p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</span>
                        </div>
                        <div className={`font-display font-bold text-sm ${item.color}`}>{item.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                        <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-sm">Enterprise-Grade Security</h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          ML models trained on millions of transactions to detect anomalies in milliseconds.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="gradient-card border border-border rounded-xl p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold mb-4">Transaction Details</h2>
            <TransactionForm
              onChange={(d) =>
                setCardData((prev) => ({ ...prev, ...d }))
              }
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
          <TransactionHistory 
          transactions={transactions}
          onBlock={handleBlockCard}
          onUnblock={handleUnblock}   // ✅ ADD THIS
          role={user.role || "employee"} />
        </section>

        {/* 🔥 ADD THIS HERE */}
        <section className="gradient-card border border-border rounded-xl p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold mb-4">
            Blocked Cards 
          </h2>

      <BlockedCards 
        blockedCards={blockedCards}
        onUnblock={handleUnblock}
        role={user.role || "employee"}
      />
        </section>

        <footer className="text-center text-xs text-muted-foreground py-6">
           SECUREGUARD FRAUD DETECTION 
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