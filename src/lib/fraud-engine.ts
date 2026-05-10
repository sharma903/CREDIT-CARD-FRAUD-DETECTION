
import { INDIA_LOCATIONS } from "./India-locations";

export type Merchant = {
  name: string;
  category: string;
  riskLevel: "low" | "medium" | "high";
};

export const MERCHANTS: Merchant[] = [
  { name: "Amazon", category: "E-commerce", riskLevel: "low" },
  { name: "Flipkart", category: "E-commerce", riskLevel: "low" },
  { name: "Apple Store", category: "Electronics", riskLevel: "low" },
  { name: "Starbucks", category: "Food & Beverage", riskLevel: "low" },
  { name: "Netflix", category: "Subscription", riskLevel: "low" },
  { name: "Uber", category: "Transport", riskLevel: "medium" },
  { name: "Croma", category: "Electronics", riskLevel: "medium" },
  { name: "BigBazaar", category: "Retail", riskLevel: "low" },
  { name: "eBay", category: "E-commerce", riskLevel: "medium" },
  { name: "Paytm", category: "Digital Wallet", riskLevel: "medium" },
  { name: "CryptoExchange", category: "Cryptocurrency", riskLevel: "high" },
  { name: "OnlineCasino", category: "Gambling", riskLevel: "high" },
  { name: "ForeignATM", category: "Cash Withdrawal", riskLevel: "high" },
  { name: "LuxuryGoods Inc", category: "Luxury", riskLevel: "high" },
];

export const MERCHANT_PRODUCTS: Record<string, string[]> = {
  "Amazon": ["Echo Dot", "Kindle Paperwhite", "Fire TV Stick", "Wireless Headphones", "Smart Watch"],
  "Flipkart": ["Smartphone", "Laptop", "Bluetooth Speaker", "Backpack", "Smart TV"],
  "Apple Store": ["iPhone 15 Pro", "MacBook Air", "AirPods Pro", "iPad", "Apple Watch"],
  "Starbucks": ["Caffè Latte", "Cappuccino", "Cold Brew", "Frappuccino", "Croissant"],
  "Netflix": ["Basic Plan", "Standard Plan", "Premium Plan", "Mobile Plan"],
  "Uber": ["UberGo Ride", "Uber Premier", "Uber Auto", "Uber Eats Order"],
  "Croma": ["LED TV", "Refrigerator", "Washing Machine", "Microwave", "Air Conditioner"],
  "BigBazaar": ["Groceries", "Apparel", "Home Essentials", "Kitchenware"],
  "eBay": ["Vintage Watch", "Collectible Coin", "Camera Lens", "Sneakers"],
  "Paytm": ["Mobile Recharge", "Electricity Bill", "DTH Recharge", "Gas Bill"],
  "CryptoExchange": ["Bitcoin Purchase", "Ethereum Purchase", "USDT Transfer", "Altcoin Trade"],
  "OnlineCasino": ["Poker Buy-in", "Slots Credits", "Roulette Chips", "Blackjack Stake"],
  "ForeignATM": ["Cash Withdrawal", "Currency Exchange", "Balance Inquiry"],
  "LuxuryGoods Inc": ["Designer Handbag", "Swiss Watch", "Diamond Ring", "Premium Sunglasses"],
};

export type Transaction = {
  id: string;
  cardholderName: string;
  cardNumber?: string;
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
  isBlocked?: boolean;
};

export type FraudResult = {
  riskScore: number;
  isFraud: boolean;
  confidence: number;
  reasons: string[];
};

export const MIN_AMOUNT = 1;
export const MAX_AMOUNT = 50000;

// Returns true if hour is within SAFE window: 05:00 AM (5) up to 11:59 PM (23)
// Fraud window: 12:00 AM (0) - 04:59 AM (4)
function isSafeHour(hour: number): boolean {
  return hour >= 5 && hour <= 23;
}

function isIndianLocation(location: string): boolean {
  const normalized = location.toLowerCase().trim();

  return INDIA_LOCATIONS.some((place) =>
    normalized.includes(place.toLowerCase())
  );
}
// function isIndianLocation(location: string): boolean {
//   const normalized = location.toLowerCase();

//   const keywords = [
//     "India",
//     "madhya pradesh",
//     "maharashtra",
//     "karnataka",
//     "tamil nadu",
//     "gujarat",
//     "rajasthan",
//     "uttar pradesh",
//     "bihar",
//     "west bengal",
//     "chhattisgarh",
//     "punjab",
//     "haryana",
//     "mumbai",
//     "delhi",
//     "new delhi",
//     "bangalore",
//     "bengaluru",
//     "chennai",
//     "kolkata",
//     "hyderabad",
//     "pune",
//     "bhopal",
//     "indore",
//     "lucknow",
//     "noida",
//     "kanpur",
//     "surat",
//     "ahmedabad",
//     "raipur",
//   ];

//   // direct match
//   if (keywords.some(k => normalized.includes(k))) return true;

//   // fallback rule: if user explicitly writes "mp", "mh", etc
//   const stateShortCodes = ["mp", "mh", "ka", "tn", "gj", "up"];

//   return stateShortCodes.some(code =>
//     normalized.split(" ").includes(code)
//   );
// }
export function analyzeFraud(
  amount: number,
  merchant: Merchant,
  timestamp: Date,
  recentTimestamps: Date[],
  location: string,
  transactions: Transaction[],
  cardNumber: string
): FraudResult{
  const reasons: string[] = [];
  let riskScore = 10; // base
  let confidence = 50;

  const hour = timestamp.getHours();
  const safe = isSafeHour(hour);
  // 🌍 FOREIGN LOCATION DETECTION
// 🌍 LOCATION FRAUD DETECTION
const isForeign = !isIndianLocation(location);
const previousForeignTx: Transaction[] = [];

for (const t of transactions) {
 const prevIsForeign = !isIndianLocation(t.location);

  if (
    prevIsForeign &&
    t.cardNumberMasked.includes(cardNumber.slice(-4))
  ) {
    previousForeignTx.push(t);
  }
}

if (isForeign) {
  riskScore += 25;
  confidence += 20;

  reasons.push("Foreign transaction detected");

  // SECOND foreign transaction
  if (previousForeignTx.length >= 1) {
    riskScore += 70;
    confidence += 40;

    reasons.push("Card used multiple times outside India");
  }
}



  // Time-based rule
  if (!safe) {
    riskScore += 25;
    confidence += 25;
    reasons.push(`Suspicious hour: ${formatHour(hour)} is outside safe window (5 AM – 12 AM)`);
  } else {
    reasons.push(`Transaction time ${formatHour(hour)} is within safe window`);
  }

  // Velocity rule: count transactions in last 60s including this one

    // 🔥 NEW RULE: 2 HIGH VALUE TRANSACTIONS (within 2 minutes)
  const twoMinAgo = timestamp.getTime() - 120_000;

const recentHighTx = transactions.filter(
  (t) =>
    t.timestamp.getTime() >= twoMinAgo &&
    t.amount > 20000
).length;

  if (amount > 20000 && recentHighTx >= 1) {
    riskScore += 50;
    confidence += 25;
    reasons.push("🚨 Multiple high-value transactions detected within 2 minutes");
  } 
  
  const oneMinAgo = timestamp.getTime() - 60_000;
  const recentInWindow = recentTimestamps.filter(t => t.getTime() >= oneMinAgo).length;
  const totalInMinute = recentInWindow + 1;
  if (totalInMinute >= 3 && totalInMinute <= 5) {
    // 1-3 in 1 minute (per spec: very low score = fraud)
    riskScore += 20;
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

  // Amount (INR)
  if (amount > 25000) {
    riskScore += 15;
    confidence += 10;
    reasons.push(`Large amount: ₹${amount.toLocaleString("en-IN")}`);
  } else if (amount > 10000) {
    riskScore += 7;
    reasons.push(`Above-average amount: ₹${amount.toLocaleString("en-IN")}`);
  }

  // Location
  if (/foreign|unknown|vpn/i.test(location)) {
    riskScore += 10;
    confidence += 5;
    reasons.push(`Unusual location: ${location}`);
  }
  // 🌍 LOCATION CHANGE DETECTION

let hadIndianTransaction = false;

for (const t of transactions) {
const wasIndian = isIndianLocation(t.location);

  if (
    t.cardNumberMasked.includes(cardNumber.slice(-4)) &&
    wasIndian
  ) {
    hadIndianTransaction = true;
    break;
  }
}

const currentIsForeign = isForeign;

if (hadIndianTransaction && currentIsForeign) {
  riskScore += 70;
  confidence += 35;

  reasons.push(
    "🚨 Sudden foreign transaction detected after Indian usage"
  );
}

  riskScore = Math.min(100, Math.max(0, riskScore));
  confidence = Math.min(99, Math.max(20, confidence));

  // If confidence is high, increase risk score (per user spec)
  // if (confidence >= 75) {
  //   riskScore = Math.min(100, riskScore + 10);
  // }

  // 🔥 FINAL FRAUD LOGIC (BEST VERSION)

const isFraud =
  riskScore >= 70 ||
  (!safe && amount > 10000) ||
  (amount > 20000 && recentHighTx >= 1) ||
  (isForeign && previousForeignTx.length >= 1);

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
