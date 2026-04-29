import { Transaction } from "./fraud-engine";

export function analyzeWithHistory(tx: Transaction, history: Transaction[]) {
  let extraRisk = 0;
  const reasons: string[] = [];

  if (!history || history.length === 0) {
    return { extraRisk, reasons };
  }

  // 🗓️ FILTER ONLY LAST MONTH DATA
  const now = new Date();
  const lastMonthData = history.filter((t) => {
    const d = new Date(t.timestamp);
    return (
      d.getMonth() === now.getMonth() - 1 &&
      d.getFullYear() === now.getFullYear()
    );
  });

  if (lastMonthData.length === 0) {
    return { extraRisk, reasons };
  }

  // 💰 1. AVERAGE AMOUNT CHECK
  const avgAmount =
    lastMonthData.reduce((sum, t) => sum + t.amount, 0) /
    lastMonthData.length;

  if (tx.amount > avgAmount * 2) {
    extraRisk += 15;
    reasons.push("Amount unusually high compared to last month");
  }

  // 🛒 2. NEW MERCHANT CHECK
  const merchantUsedBefore = lastMonthData.some(
    (t) => t.merchantName === tx.merchantName
  );

  if (!merchantUsedBefore) {
    extraRisk += 10;
    reasons.push("New merchant not seen in last month");
  }

  // 🌍 3. LOCATION CHECK
  const knownLocations = lastMonthData.map((t) => t.location);

  if (!knownLocations.includes(tx.location)) {
    extraRisk += 15;
    reasons.push("Transaction from new/unusual location");
  }

  // ⏰ 4. TIME PATTERN CHECK
  const hours = lastMonthData.map((t) =>
    new Date(t.timestamp).getHours()
  );

  const avgHour =
    hours.reduce((a, b) => a + b, 0) / hours.length;

  const currentHour = new Date(tx.timestamp).getHours();

  if (Math.abs(currentHour - avgHour) > 5) {
    extraRisk += 10;
    reasons.push("Unusual transaction time compared to history");
  }

  // 🔁 5. FREQUENCY CHECK (same merchant too often today)
  const today = new Date().toDateString();

  const todaySameMerchant = history.filter(
    (t) =>
      new Date(t.timestamp).toDateString() === today &&
      t.merchantName === tx.merchantName
  ).length;

  if (todaySameMerchant >= 3) {
    extraRisk += 20;
    reasons.push("Too many transactions to same merchant today");
  }

  return { extraRisk, reasons };
}