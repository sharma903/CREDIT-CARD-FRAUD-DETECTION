export type Merchant = {
  name: string;
  category: string;
  riskLevel: "low" | "medium" | "high";
};

export const MERCHANTS: Merchant[] = [
  { name: "Amazon", category: "E-commerce", riskLevel: "low" },
  { name: "Walmart", category: "Retail", riskLevel: "low" },
  { name: "Apple Store", category: "Electronics", riskLevel: "low" },
  { name: "Starbucks", category: "Food & Beverage", riskLevel: "low" },
  { name: "Netflix", category: "Subscription", riskLevel: "low" },
  { name: "Uber", category: "Transport", riskLevel: "medium" },
  { name: "Best Buy", category: "Electronics", riskLevel: "medium" },
  { name: "Target", category: "Retail", riskLevel: "low" },
  { name: "eBay", category: "E-commerce", riskLevel: "medium" },
  { name: "PayPal", category: "Digital Wallet", riskLevel: "medium" },
  { name: "CryptoExchange", category: "Cryptocurrency", riskLevel: "high" },
  { name: "OnlineCasino", category: "Gambling", riskLevel: "high" },
  { name: "ForeignATM", category: "Cash Withdrawal", riskLevel: "high" },
  { name: "LuxuryGoods Inc", category: "Luxury", riskLevel: "high" },
];

export type Transaction = {
  id: string;
  cardholderName: string;
  cardNumberMasked: string;
  merchantName: string;
  productName: string;
  amount: number;
  location: string;
  timestamp: Date;
  riskScore: number;
  isFraud: boolean;
  confidence: number;
  reasons: string[];
};

export type FraudResult = {
  riskScore: number;
  isFraud: boolean;
  confidence: number;
  reasons: string[];
};

export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 10000;

// Returns true if hour is within SAFE window: 05:00 AM (5) up to 11:59 PM (23)
// Fraud window: 12:00 AM (0) - 04:59 AM (4)
function isSafeHour(hour: number): boolean {
  return hour >= 5 && hour <= 23;
}

export function analyzeFraud(
  amount: number,
  merchant: Merchant,
  timestamp: Date,
  recentTimestamps: Date[],
  location: string
): FraudResult {
  const reasons: string[] = [];
  let riskScore = 10; // base
  let confidence = 50;

  const hour = timestamp.getHours();
  const safe = isSafeHour(hour);

  // Time-based rule
  if (!safe) {
    riskScore += 45;
    confidence += 25;
    reasons.push(`Suspicious hour: ${formatHour(hour)} is outside safe window (5 AM – 12 AM)`);
  } else {
    reasons.push(`Transaction time ${formatHour(hour)} is within safe window`);
  }

  // Velocity rule: count transactions in last 60s including this one
  const oneMinAgo = timestamp.getTime() - 60_000;
  const recentInWindow = recentTimestamps.filter(t => t.getTime() >= oneMinAgo).length;
  const totalInMinute = recentInWindow + 1;
  if (totalInMinute >= 1 && totalInMinute <= 3 && recentInWindow >= 1) {
    // 1-3 in 1 minute (per spec: very low score = fraud)
    riskScore += 35;
    confidence += 20;
    reasons.push(`Velocity spike: ${totalInMinute} transactions in 1 minute`);
  }
  if (totalInMinute > 3) {
    riskScore += 50;
    confidence += 30;
    reasons.push(`Critical velocity: ${totalInMinute} transactions/min`);
  }

  // Merchant risk
  if (merchant.riskLevel === "high") {
    riskScore += 25;
    confidence += 15;
    reasons.push(`High-risk merchant category: ${merchant.category}`);
  } else if (merchant.riskLevel === "medium") {
    riskScore += 10;
    confidence += 5;
    reasons.push(`Medium-risk merchant: ${merchant.category}`);
  }

  // Amount
  if (amount > 5000) {
    riskScore += 15;
    confidence += 10;
    reasons.push(`Large amount: $${amount.toLocaleString()}`);
  } else if (amount > 2000) {
    riskScore += 7;
    reasons.push(`Above-average amount: $${amount.toLocaleString()}`);
  }

  // Location
  if (/foreign|unknown|vpn/i.test(location)) {
    riskScore += 10;
    confidence += 5;
    reasons.push(`Unusual location: ${location}`);
  }

  riskScore = Math.min(100, Math.max(0, riskScore));
  confidence = Math.min(99, Math.max(20, confidence));

  // If confidence is high, increase risk score (per user spec)
  if (confidence >= 75) {
    riskScore = Math.min(100, riskScore + 10);
  }

  const isFraud = riskScore >= 55 || !safe || (recentInWindow >= 1 && totalInMinute <= 3);

  return { riskScore, isFraud, confidence, reasons };
}

export function formatHour(h: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${period}`;
}

export function formatTime12(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  h = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h}:${m}:${s} ${period}`;
}
