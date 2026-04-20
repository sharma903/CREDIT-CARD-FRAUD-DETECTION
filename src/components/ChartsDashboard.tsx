import { Transaction } from "@/lib/fraud-engine";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";

interface Props {
  transactions: Transaction[];
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))" },
  itemStyle: { color: "hsl(var(--foreground))" },
};

export function ChartsDashboard({ transactions }: Props) {
  // Risk score over time (last 20)
  const riskData = transactions.slice(-20).map((t, i) => ({
    idx: i + 1,
    risk: t.riskScore,
    confidence: t.confidence,
  }));

  // Fraud vs safe pie
  const fraudCount = transactions.filter((t) => t.isFraud).length;
  const safeCount = transactions.length - fraudCount;
  const pieData = [
    { name: "Safe", value: safeCount, color: "hsl(var(--success))" },
    { name: "Fraud", value: fraudCount, color: "hsl(var(--destructive))" },
  ];

  // Amount per transaction bar
  const amountData = transactions.slice(-10).map((t, i) => ({
    idx: `T${i + 1}`,
    amount: t.amount,
    fraud: t.isFraud,
  }));

  // Hour distribution (0-23)
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: 0,
    fraud: 0,
  }));
  transactions.forEach((t) => {
    const h = t.timestamp.getHours();
    hourBuckets[h].count += 1;
    if (t.isFraud) hourBuckets[h].fraud += 1;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <ChartCard title="Live Risk Score" subtitle="Recent transactions">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={riskData}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="risk" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#riskGrad)" isAnimationActive animationDuration={600} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Confidence Trend" subtitle="ML model confidence">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary-glow))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary-glow))" }} isAnimationActive animationDuration={600} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Safe vs Fraud" subtitle="Distribution">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4} isAnimationActive animationDuration={600}>
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Recent Amounts" subtitle="Last 10 transactions">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={amountData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="idx" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600}>
              {amountData.map((d, i) => (
                <Cell key={i} fill={d.fraud ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Activity by Hour" subtitle="24-hour distribution" wide>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourBuckets}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} isAnimationActive animationDuration={600} />
            <Bar dataKey="fraud" stackId="a" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, subtitle, children, wide }: { title: string; subtitle?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`gradient-card border border-border rounded-xl p-5 shadow-card ${wide ? "lg:col-span-2" : ""}`}
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display font-semibold">{title}</h3>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </motion.div>
  );
}
