import { Transaction } from "./fraud-engine";

export function extractFeatures(tx: Transaction, history: Transaction[]) {
  const hour = new Date(tx.timestamp).getHours();

  const avgAmount =
    history.length > 0
      ? history.reduce((s, t) => s + t.amount, 0) / history.length
      : tx.amount;

  const deviation = tx.amount / avgAmount;

  const oneMinAgo = new Date(tx.timestamp).getTime() - 60000;
  const velocity = history.filter(
    (t) => new Date(t.timestamp).getTime() >= oneMinAgo
  ).length;

  return [
    tx.amount,
    hour,
    hour < 5 ? 1 : 0,
    deviation,
    velocity,
  ];
}