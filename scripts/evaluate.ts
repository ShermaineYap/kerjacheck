// Evaluate the shipped engine on a labelled JSONL file.
// Usage: npx tsx scripts/evaluate.ts data/blind_test.jsonl [out.json]
import { readFileSync, writeFileSync } from "node:fs";
import { analyze, toLabel, type Mode } from "../src/lib/analyze";
import type { Label } from "../src/lib/model";

const file = process.argv[2];
const out = process.argv[3];
const rows = readFileSync(file, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const LABELS: Label[] = ["legit", "job_scam", "mule"];

function evalMode(mode: Mode) {
  const cm: Record<string, Record<string, number>> = {};
  for (const t of LABELS) cm[t] = Object.fromEntries(LABELS.map((p) => [p, 0]));
  let caught = 0, scams = 0, falseAlarm = 0, legit = 0, correct3 = 0;
  const errors: { id: string; label: string; pred: string; verdict: string; text: string }[] = [];
  const times: number[] = [];
  for (const r of rows) {
    const t0 = performance.now();
    const a = analyze(r.text, mode);
    times.push(performance.now() - t0);
    const p = toLabel(a);
    cm[r.label][p]++;
    if (p === r.label) correct3++;
    else errors.push({ id: r.id, label: r.label, pred: p, verdict: a.verdict, text: r.text });
    if (r.label === "legit") { legit++; if (p !== "legit") falseAlarm++; }
    else { scams++; if (p !== "legit") caught++; }
  }
  const tp = caught, fp = falseAlarm, fn = scams - caught;
  const precision = tp / (tp + fp || 1), recall = tp / (tp + fn || 1);
  times.sort((a, b) => a - b);
  return {
    mode, n: rows.length,
    scam_detection: {
      recall: +recall.toFixed(3), precision: +precision.toFixed(3),
      f1: +((2 * precision * recall) / (precision + recall || 1)).toFixed(3),
      false_alarm_rate: +(falseAlarm / (legit || 1)).toFixed(3),
      accuracy: +((tp + legit - fp) / rows.length).toFixed(3),
    },
    three_class_accuracy: +(correct3 / rows.length).toFixed(3),
    confusion_matrix: cm,
    median_ms: +times[Math.floor(times.length / 2)].toFixed(2),
    errors,
  };
}

const results = (["rules", "model", "combined"] as Mode[]).map(evalMode);
for (const r of results) {
  const { errors, ...rest } = r;
  console.log(JSON.stringify(rest));
  if (r.mode === (process.env.SHOW ?? "combined")) for (const e of errors) console.log(`  ${e.id} ${e.label}->${e.pred}(${e.verdict}): ${e.text.slice(0, 140)}`);
}
if (out) writeFileSync(out, JSON.stringify({ file, evaluated_at: new Date().toISOString(), results }, null, 2));
