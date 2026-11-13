"""Feature extraction. Mirrored exactly in app/lib/features.ts (parity is tested)."""
import math, re, unicodedata

def normalize(text: str) -> str:
    t = unicodedata.normalize("NFKC", text).lower()
    t = re.sub(r"[0-9]", "0", t)
    t = re.sub(r"[^a-z0 ]+", " ", t)
    return re.sub(r" +", " ", t).strip()

def tokens(text: str):
    n = normalize(text)
    words = n.split(" ") if n else []
    feats = []
    for w in words:
        p = f" {w} "
        for k in (3, 4, 5):
            for i in range(0, len(p) - k + 1):
                feats.append("c:" + p[i:i + k])
    for w in words:
        feats.append("w:" + w)
    for a, b in zip(words, words[1:]):
        feats.append("b:" + a + "_" + b)
    return feats

def vectorize(text, vocab, idf):
    counts = {}
    for f in tokens(text):
        j = vocab.get(f)
        if j is not None:
            counts[j] = counts.get(j, 0) + 1
    vec = {j: (1 + math.log(c)) * idf[j] for j, c in counts.items()}
    norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
    return {j: v / norm for j, v in vec.items()}
