"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { analyze, type Analysis } from "@/lib/analyze";
import { EXAMPLES, T } from "@/lib/i18n";
import { useLang } from "./LangContext";
import { MarkedMessage } from "./MarkedMessage";

const ORDER = { mule: 0, job_scam: 1, caution: 2 };

export function Checker() {
  const { lang } = useLang();
  const t = T[lang];
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<{ text: string; a: Analysis } | null>(null);
  const [error, setError] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  function run(input: string) {
    if (!input.trim()) {
      setError(true);
      setChecked(null);
      return;
    }
    setError(false);
    const a = analyze(input);
    a.hits.sort((x, y) => ORDER[x.rule.category] - ORDER[y.rule.category] || y.rule.weight - x.rule.weight);
    setChecked({ text: input, a });
  }

  // ?ex=0..2 pre-fills an example (used for demos and the video)
  useEffect(() => {
    const ex = Number(new URLSearchParams(window.location.search).get("ex"));
    if (Number.isInteger(ex) && EXAMPLES[ex]) {
      setText(EXAMPLES[ex].text);
      run(EXAMPLES[ex].text);
    }
  }, []);

  useEffect(() => {
    if (!checked || !resultRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    resultRef.current.focus({ preventScroll: true });
  }, [checked]);

  const a = checked?.a;
  const danger = a && (a.verdict === "mule" || a.verdict === "job_scam");
  const scamPct = a ? Math.round((a.probs.mule + a.probs.job_scam) * 100) : 0;

  return (
    <>
      <form
        className="ask"
        onSubmit={(e) => {
          e.preventDefault();
          run(text);
        }}
      >
        <label htmlFor="msg" className="ask-label">
          {t.label}
        </label>
        <div className="bubble">
          <textarea
            id="msg"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            rows={7}
            aria-invalid={error}
            aria-describedby={error ? "msg-err" : undefined}
          />
        </div>
        {error && (
          <p id="msg-err" className="err">
            {t.emptyError}
          </p>
        )}
        <div className="ask-actions">
          <button type="submit" className="btn-check">
            {t.check}
          </button>
          {text && (
            <button
              type="button"
              className="btn-quiet"
              onClick={() => {
                setText("");
                setChecked(null);
              }}
            >
              {t.clear}
            </button>
          )}
        </div>
        <div className="examples">
          <span>{t.tryExample}</span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              className="chip"
              onClick={() => {
                setText(ex.text);
                run(ex.text);
              }}
            >
              {ex.name[lang]}
            </button>
          ))}
        </div>
      </form>

      {a && checked && (
        <section ref={resultRef} tabIndex={-1} className={`result v-${a.verdict}`} aria-live="polite">
          <div className="verdict">
            <div className="stamp" aria-hidden="true">
              {a.verdict === "clear" ? "✓" : a.verdict === "caution" ? "?" : "✗"}
            </div>
            <div>
              <h2>{t.verdict[a.verdict]}</h2>
              <p>{t.verdictSub[a.verdict]}</p>
              <div className="meter" role="img" aria-label={`${t.risk}: ${a.risk}/100`}>
                <span className="meter-label">{t.risk}</span>
                <span className="meter-track">
                  <span className="meter-fill" style={{ width: `${a.risk}%` }} />
                </span>
                <span className="meter-num">{a.risk}/100</span>
              </div>
            </div>
          </div>

          <h3>{t.marked}</h3>
          <div className="script">
            <MarkedMessage text={checked.text} hits={a.hits} />
          </div>

          {(a.hits.length > 0 || a.verdict !== "clear") && (
            <>
              <h3>{t.flags}</h3>
              <ol className="notes">
                {a.hits.map((h) => (
                  <li key={h.rule.id} className={`note note-${h.rule.category}`}>
                    <strong>{h.rule.title[lang]}</strong>
                    <p>{h.rule.why[lang]}</p>
                  </li>
                ))}
              </ol>
              {a.verdict !== "clear" && (
                <div className="model-note">
                  <p>{t.modelNote(scamPct)}</p>
                  {a.suspiciousWords.length > 0 && (
                    <p>
                      {t.modelWords}{" "}
                      {a.suspiciousWords.map((w) => (
                        <span key={w} className="word">
                          {w}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          {a.hits.length === 0 && a.verdict === "clear" && <p className="muted">{t.nothingMarked}</p>}

          <h3>{t.next}</h3>
          <ul className="actions">
            {(danger ? t.actions.danger : t.actions.safe).map((x) => (
              <li key={x.t}>
                {x.href ? (
                  <a href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                    {x.t}
                  </a>
                ) : (
                  x.t
                )}
              </li>
            ))}
          </ul>
          <p className="fine">
            {t.disclaimer} <Link href="/how-it-works">{t.how}</Link>
          </p>
        </section>
      )}
    </>
  );
}
