// Builds src/lib/eval-summary.json for the "How we tested it" page from saved evaluation runs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

type Run = { file: string; evaluated_at: string; results: { mode: string; n: number; scam_detection: Record<string, number>; three_class_accuracy: number; confusion_matrix: Record<string, Record<string, number>>; median_ms: number }[] };
const load = (f: string): Run | null => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null);

const sets = [
  { key: "dev_v1", title: "Blind set A, engine v1 (first look, before any tuning)", file: "eval/blind_v1.json" },
  { key: "dev_v2", title: "Blind set A, engine v2 (after error analysis on set A)", file: "eval/blind_dev_v2.json" },
  { key: "final", title: "Blind set B, engine v2 (final; never used for tuning)", file: "eval/blind_final_v2.json" },
];
const out = sets.flatMap((s) => {
  const r = load(s.file);
  if (!r) return [];
  return [{ key: s.key, title: s.title, n: r.results[0].n, evaluated_at: r.evaluated_at, results: r.results.map(({ mode, scam_detection, three_class_accuracy, confusion_matrix, median_ms }) => ({ mode, ...scam_detection, three_class_accuracy, confusion_matrix, median_ms })) }];
});
writeFileSync("src/lib/eval-summary.json", JSON.stringify(out, null, 2));
console.log(out.map((o) => o.key));
