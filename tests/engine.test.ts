import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "../src/lib/analyze";
import { runRules } from "../src/lib/rules";
import { normalize } from "../src/lib/features";

test("normalize folds digits, case and punctuation", () => {
  assert.equal(normalize("RM1,500/month!!"), "rm0 000 month");
});

test("receive-and-forward offer is flagged as mule", () => {
  const a = analyze("Part time: receive customer payments into your bank account and transfer to our company account. RM100/day");
  assert.equal(a.verdict, "mule");
  assert.ok(a.hits.some((h) => h.rule.id === "receive-forward"));
});

test("account rental in Malay is flagged as mule", () => {
  assert.equal(analyze("Sewa akaun bank anda RM1,500 sebulan, serahkan kad ATM sahaja").verdict, "mule");
});

test("top-up task is flagged as job scam", () => {
  assert.equal(analyze("Like and share TikTok earn RM300 a day, then top-up RM100 to unlock VIP tasks").verdict, "job_scam");
});

test("real cashier job that mentions bank account is not flagged", () => {
  const a = analyze("Part-time cashier at our bakery in Cheras, handle cash and card payments, RM9/hour. Salary paid monthly to your bank account. Walk in with resume.");
  assert.equal(a.verdict, "clear");
});

test("bringing IC on first day for payroll is not a red flag", () => {
  const hits = runRules("Bring your IC and bank account details on your first day for payroll.");
  assert.ok(!hits.some((h) => h.rule.id === "id-before-interview"));
});

test("spans point at the matched text", () => {
  const text = "Please pay RM50 registration fee first.";
  for (const h of runRules(text)) for (const s of h.spans) assert.equal(text.slice(s.start, s.end), s.text);
});
