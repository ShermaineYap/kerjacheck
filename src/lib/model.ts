import raw from "./model.json";
import { normalize, tokens } from "./features";

export type Label = "legit" | "job_scam" | "mule";

interface ModelJson {
  labels: Label[];
  features: string[];
  idf: number[];
  coef: number[][];
  intercept: number[];
}

const model = raw as unknown as ModelJson;
const vocab = new Map<string, number>(model.features.map((f, i) => [f, i]));

export interface ModelResult {
  probs: Record<Label, number>;
  /** words that pushed the message towards scam/mule, strongest first */
  suspiciousWords: string[];
}

const STOP = new Set(["the","and","your","you","our","for","with","are","will","kami","anda","dan","yang","untuk","this","that","then","only","pls","boleh","dari","get","can"]);

export function classify(text: string): ModelResult {
  const counts = new Map<number, number>();
  for (const f of tokens(text)) {
    const j = vocab.get(f);
    if (j !== undefined) counts.set(j, (counts.get(j) ?? 0) + 1);
  }
  const vec = new Map<number, number>();
  let norm = 0;
  for (const [j, c] of counts) {
    const v = (1 + Math.log(c)) * model.idf[j];
    vec.set(j, v);
    norm += v * v;
  }
  norm = Math.sqrt(norm) || 1;
  const logits = model.intercept.slice();
  for (const [j, v] of vec) {
    for (let k = 0; k < logits.length; k++) logits[k] += (v / norm) * model.coef[k][j];
  }
  const m = Math.max(...logits);
  const ex = logits.map((l) => Math.exp(l - m));
  const s = ex.reduce((a, b) => a + b, 0);
  const probs = { legit: 0, job_scam: 0, mule: 0 } as Record<Label, number>;
  model.labels.forEach((l, k) => (probs[l] = ex[k] / s));

  // Attribute scam evidence back to words: sum (scam - legit) weight of each word's n-grams.
  const legitK = model.labels.indexOf("legit");
  const words = normalize(text).split(" ").filter((w) => w.length > 2);
  const score = new Map<string, number>();
  for (const w of new Set(words)) {
    let s2 = 0;
    for (const f of tokens(w)) {
      const j = vocab.get(f);
      if (j === undefined) continue;
      const scamW = Math.max(...model.coef.map((row, k) => (k === legitK ? -Infinity : row[j])));
      s2 += (scamW - model.coef[legitK][j]) * model.idf[j];
    }
    score.set(w, s2);
  }
  const suspiciousWords = [...score.entries()]
    .filter(([w, v]) => v > 1.5 && !/^0+$/.test(w) && !STOP.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w);
  return { probs, suspiciousWords };
}
