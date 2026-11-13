import type { RuleHit } from "@/lib/rules";

/** Renders the message with each red-flag span highlighted and numbered like a marked exam script. */
export function MarkedMessage({ text, hits }: { text: string; hits: RuleHit[] }) {
  const owner = new Array<number>(text.length).fill(-1);
  hits.forEach((h, i) => {
    for (const s of h.spans) for (let c = s.start; c < s.end; c++) if (owner[c] === -1) owner[c] = i;
  });
  const parts: { text: string; hit: number; firstOfHit: boolean }[] = [];
  const seen = new Set<number>();
  let i = 0;
  while (i < text.length) {
    const o = owner[i];
    let j = i;
    while (j < text.length && owner[j] === o) j++;
    const first = o >= 0 && !seen.has(o);
    if (o >= 0) seen.add(o);
    parts.push({ text: text.slice(i, j), hit: o, firstOfHit: first });
    i = j;
  }
  return (
    <p className="script-text">
      {parts.map((p, k) =>
        p.hit < 0 ? (
          <span key={k}>{p.text}</span>
        ) : (
          <mark key={k} className={`hl hl-${hits[p.hit].rule.category}`}>
            {p.text}
            {p.firstOfHit && (
              <sup className="pen-num" aria-label={`red flag ${p.hit + 1}`}>
                {p.hit + 1}
              </sup>
            )}
          </mark>
        ),
      )}
    </p>
  );
}
