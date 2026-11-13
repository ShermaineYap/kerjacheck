// Mirrors ml/features.py exactly. Parity is checked by scripts/parity.ts.

export function normalize(text: string): string {
  let t = text.normalize("NFKC").toLowerCase();
  t = t.replace(/[0-9]/g, "0");
  t = t.replace(/[^a-z0 ]+/g, " ");
  return t.replace(/ +/g, " ").trim();
}

export function tokens(text: string): string[] {
  const n = normalize(text);
  const words = n ? n.split(" ") : [];
  const feats: string[] = [];
  for (const w of words) {
    const p = ` ${w} `;
    for (const k of [3, 4, 5]) {
      for (let i = 0; i + k <= p.length; i++) feats.push("c:" + p.slice(i, i + k));
    }
  }
  for (const w of words) feats.push("w:" + w);
  for (let i = 0; i + 1 < words.length; i++) feats.push("b:" + words[i] + "_" + words[i + 1]);
  return feats;
}
