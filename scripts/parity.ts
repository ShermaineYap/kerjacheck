// Checks the TypeScript model port matches the Python training code.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { classify } from "../src/lib/model";

const file = process.argv[2] ?? "data/train.jsonl";
const py: number[][] = JSON.parse(execFileSync("python3", ["scripts/parity.py", file], { maxBuffer: 1 << 26 }).toString());
const rows = readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
let maxDiff = 0;
rows.forEach((r, i) => {
  const p = classify(r.text).probs;
  const ts = [p.legit, p.job_scam, p.mule];
  ts.forEach((v, k) => (maxDiff = Math.max(maxDiff, Math.abs(v - py[i][k]))));
});
console.log(`parity on ${rows.length} rows, max abs prob diff = ${maxDiff.toExponential(2)}`);
if (maxDiff > 1e-3) process.exit(1);
