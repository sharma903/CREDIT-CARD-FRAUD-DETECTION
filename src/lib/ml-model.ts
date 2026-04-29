export function predictRisk(features: number[]) {
  const weights = [0.002, 0.5, 15, 10, 8]; // trained manually (demo)
  const bias = -20;

  let z = bias;

  for (let i = 0; i < features.length; i++) {
    z += features[i] * weights[i];
  }

  const probability = 1 / (1 + Math.exp(-z));

  return probability * 100; // risk score
}