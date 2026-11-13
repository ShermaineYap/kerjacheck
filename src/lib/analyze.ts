import { classify, type Label } from "./model";
import { runRules, type RuleHit } from "./rules";

export type Verdict = "mule" | "job_scam" | "caution" | "clear";

export interface Analysis {
  verdict: Verdict;
  /** 0-100, higher = more dangerous */
  risk: number;
  hits: RuleHit[];
  probs: Record<Label, number>;
  suspiciousWords: string[];
  reasonSource: "rules" | "model" | "both" | "none";
}

export type Mode = "combined" | "rules" | "model";

const STRONG = 1;

export function analyze(text: string, mode: Mode = "combined"): Analysis {
  const trimmed = text.trim();
  const { probs, suspiciousWords } = classify(trimmed);
  const hits = mode === "model" ? [] : runRules(trimmed);

  const score = { mule: 0, job_scam: 0, caution: 0 };
  for (const h of hits) score[h.rule.category] += h.rule.weight;
  const strongMule = score.mule >= STRONG;
  const strongScam = score.job_scam >= STRONG;
  const pScam = probs.mule + probs.job_scam;

  let verdict: Verdict = "clear";
  let reasonSource: Analysis["reasonSource"] = "none";
  const useModel = mode !== "rules";
  const useRules = mode !== "model";

  if (useRules && (strongMule || strongScam)) {
    // Rules decide that it is dangerous; the model breaks ties between the two kinds.
    const m = score.mule + (useModel ? probs.mule : 0);
    const s = score.job_scam + (useModel ? probs.job_scam : 0);
    verdict = m >= s ? "mule" : "job_scam";
    reasonSource = useModel && pScam > 0.5 ? "both" : "rules";
  } else if (useModel && pScam >= 0.5) {
    verdict = probs.mule >= probs.job_scam ? "mule" : "job_scam";
    if (pScam < 0.7 && score.mule + score.job_scam < 0.5) verdict = "caution";
    reasonSource = hits.length ? "both" : "model";
  } else if (useRules && score.mule + score.job_scam + score.caution >= 0.8) {
    verdict = "caution";
    reasonSource = "rules";
  } else if (hits.length) {
    reasonSource = "rules";
  }

  const ruleRisk = Math.min(1, (score.mule + score.job_scam) / 2 + score.caution / 4);
  let risk: number;
  if (mode === "rules") risk = ruleRisk;
  else if (mode === "model") risk = pScam;
  else risk = Math.max(pScam, ruleRisk);
  if (verdict === "mule" || verdict === "job_scam") risk = Math.max(risk, 0.8);
  if (verdict === "caution") risk = Math.min(Math.max(risk, 0.45), 0.79);
  if (verdict === "clear") risk = Math.min(risk, 0.44);

  return { verdict, risk: Math.round(risk * 100), hits, probs, suspiciousWords, reasonSource };
}

/** Collapse a verdict to the 3 evaluation labels. "caution" counts as flagged. */
export function toLabel(a: Analysis): Label {
  if (a.verdict === "clear") return "legit";
  if (a.verdict === "caution") return a.probs.mule > a.probs.job_scam ? "mule" : "job_scam";
  return a.verdict;
}
