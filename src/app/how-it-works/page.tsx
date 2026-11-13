import type { Metadata } from "next";
import Link from "next/link";
import summary from "@/lib/eval-summary.json";
import { RULES } from "@/lib/rules";

export const metadata: Metadata = { title: "How KerjaCheck works and how we tested it" };

type Row = (typeof summary)[number]["results"][number];
const pct = (x: number) => `${Math.round(x * 1000) / 10}%`;
const MODE_NAME: Record<string, string> = { rules: "Rules only", model: "Classifier only", combined: "Rules + classifier (shipped)" };
const LABEL: Record<string, string> = { legit: "Real job", job_scam: "Job scam", mule: "Mule offer" };

function Table({ rows }: { rows: Row[] }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th className="num">Scams caught</th>
            <th className="num">Real jobs wrongly flagged</th>
            <th className="num">Precision</th>
            <th className="num">3-way accuracy</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.mode} className={r.mode === "combined" ? "best" : undefined}>
              <td>{MODE_NAME[r.mode]}</td>
              <td className="num">{pct(r.recall)}</td>
              <td className="num">{pct(r.false_alarm_rate)}</td>
              <td className="num">{pct(r.precision)}</td>
              <td className="num">{pct(r.three_class_accuracy)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Confusion({ row }: { row: Row }) {
  const labels = ["legit", "job_scam", "mule"] as const;
  return (
    <div className="tablewrap">
      <table aria-label="Confusion matrix">
        <thead>
          <tr>
            <th>Actual ↓ / KerjaCheck said →</th>
            {labels.map((l) => (
              <th key={l} className="num">{LABEL[l]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((a) => (
            <tr key={a}>
              <th>{LABEL[a]}</th>
              {labels.map((p) => (
                <td key={p} className={`num${a === p ? " best" : ""}`}>
                  {(row.confusion_matrix as Record<string, Record<string, number>>)[a][p]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HowItWorks() {
  const final = summary.find((s) => s.key === "final");
  const finalCombined = final?.results.find((r) => r.mode === "combined");
  return (
    <div className="page doc">
      <header className="top">
        <Link href="/" className="wordmark">
          Kerja<span>Check</span>
        </Link>
        <Link href="/">Back to the checker</Link>
      </header>
      <main>
        <h1>How KerjaCheck works, and how we tested it</h1>
        <p className="lede">
          KerjaCheck reads a job offer the way a careful friend would: it looks for the specific tricks that Malaysian police
          and Bank Negara warn about, and it compares the wording with thousands of examples. All of this runs in your
          browser, so nothing you paste is uploaded.
        </p>

        <h2>The pipeline</h2>
        <ol className="pipeline">
          <li>
            <strong>Red-flag rules.</strong> {RULES.length} hand-written rules in English, Bahasa Melayu and Manglish, each
            based on how job scams and mule recruitment are described in PDRM, NSRC and Bank Negara advisories and Malaysian
            news. They find the exact phrase that is dangerous, which is what gets highlighted, and explain why.
          </li>
          <li>
            <strong>Trained classifier.</strong> A logistic-regression model on character n-grams (so it copes with
            spelling like &quot;u&quot;, &quot;ur&quot; and &quot;akaun&quot;) plus words and word pairs, trained on 960
            labelled example messages. It was trained in Python and exported to a 260&nbsp;KB file that runs in
            TypeScript; an automated check confirms the two give identical scores.
          </li>
          <li>
            <strong>Decision.</strong> A strong rule match means the message is flagged; the classifier decides whether it
            looks more like mule recruitment or a job scam. The classifier alone can only raise a caution unless it is very
            confident, because rules are more reliable on wording it hasn&apos;t seen.
          </li>
          <li>
            <strong>What to do.</strong> Every result ends with the next step: Semak Mule (PDRM), the 997 National Scam
            Response Centre, or SSM e-Search for checking a real company.
          </li>
        </ol>

        <h2>How we tested it</h2>
        <p>
          A model scored on its own training data proves nothing, so the test messages were written by a separate process
          that never saw the rules, the model or the training data. Each blind set is balanced between real jobs, job scams
          and mule offers, and deliberately includes hard cases: real cashier, clerk and freelance jobs that talk about bank
          accounts and payments, and scams written in formal language with invented company names. Some messages are close
          paraphrases of offers described in Malaysian news reports. The engine was frozen and committed to Git before
          each blind run.
        </p>
        {summary.map((s) => (
          <section key={s.key}>
            <h3>
              {s.title} ({s.n} messages)
            </h3>
            <Table rows={s.results} />
          </section>
        ))}
        {finalCombined && (
          <>
            <h3>Final blind set, shipped engine: where it was right and wrong</h3>
            <Confusion row={finalCombined} />
          </>
        )}
        <p>
          On the final set the rules alone miss half the scams, and the classifier alone catches 96% with fewer false
          alarms than the combination. We still combine them because the rules are what find and explain the exact
          dangerous phrases; a probability on its own can&apos;t tell you why. Reducing the rules&apos; false alarms is the next
          fix. Each check takes well under a millisecond on a laptop.
        </p>

        <h2>Honest limitations</h2>
        <ul>
          <li>
            <strong>False alarms on real jobs.</strong> On the final blind set, 9 of 40 real jobs got a warning (2 as
            &quot;be careful&quot;, 7 as scam or mule). 7 of the 9 were deliberately hard cases: freelance gigs where the
            client pays the student a deposit, admin jobs that involve checking customer deposits, and clerks who handle
            rent or fee collection for a real business. The rules recognise words like &quot;deposit&quot; but not which
            direction the money flows. Teaching the rules who pays whom is the next fix; we have not tuned on the final set,
            so this number stays as measured.
          </li>
          <li>
            <strong>Misses.</strong> 3 of 80 scams got through: a fully formal Malay &quot;product evaluator&quot; job using
            your own funds, a Manglish &quot;collection officer&quot; asking you to withdraw cash received via DuitNow, and
            an onboarding message asking for IC photos and a selfie.
          </li>
          <li>
            All training and test messages are synthetic or paraphrased; we had no access to a dataset of real scam messages
            received by Malaysian students. Results on real messages will be lower than these numbers.
          </li>
          <li>
            The test sets were written by an AI model following public descriptions of scams, not collected from victims.
          </li>
          <li>
            Scammers change their wording. Rules need updating, and the classifier should be retrained on messages that
            users choose to report (with consent) in a future version.
          </li>
          <li>&quot;No red flags found&quot; never means &quot;safe&quot;. KerjaCheck always tells you how to verify.</li>
          <li>Chinese and Tamil scripts are not supported yet; romanised Malay, English and Manglish are.</li>
        </ul>

        <h2>Open source</h2>
        <p>
          The code, the training data generator, both blind test sets and the evaluation scripts are on GitHub so anyone can
          re-run these numbers.
        </p>
      </main>
      <footer className="foot">
        <p>Built for STEMergent Hacks 2026. KerjaCheck gives guidance, not legal advice. When in doubt, call 997.</p>
      </footer>
    </div>
  );
}
