"""Train the KerjaCheck classifier on data/train.jsonl and export app model JSON."""
import json, math, sys
from collections import Counter
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
sys.path.insert(0, "/home/claude/kerjacheck/ml")
from features import tokens, vectorize

LABELS = ["legit", "job_scam", "mule"]
MAX_FEATS = 6000

rows = [json.loads(l) for l in open("/home/claude/kerjacheck/data/train.jsonl")]
df = Counter()
for r in rows:
    df.update(set(tokens(r["text"])))
cands = [f for f, c in df.items() if c >= 2]
cands.sort(key=lambda f: (-df[f], f))
feats = sorted(cands[:MAX_FEATS])
vocab = {f: i for i, f in enumerate(feats)}
N = len(rows)
idf = [math.log((1 + N) / (1 + df[f])) + 1 for f in feats]

def matrix(texts):
    data, ri, ci = [], [], []
    for i, t in enumerate(texts):
        for j, v in vectorize(t, vocab, idf).items():
            data.append(v); ri.append(i); ci.append(j)
    return csr_matrix((data, (ri, ci)), shape=(len(texts), len(feats)))

X = matrix([r["text"] for r in rows])
y = np.array([LABELS.index(r["label"]) for r in rows])
C = 4.0
clf = LogisticRegression(C=C, max_iter=3000)
print("5-fold CV accuracy on synthetic training data:", cross_val_score(clf, X, y, cv=5).mean().round(4))
clf.fit(X, y)

model = {
    "labels": LABELS,
    "features": feats,
    "idf": [round(v, 5) for v in idf],
    "coef": [[round(float(v), 5) for v in row] for row in clf.coef_],
    "intercept": [round(float(v), 5) for v in clf.intercept_],
    "meta": {"trained_on": N, "C": C, "max_features": MAX_FEATS},
}
json.dump(model, open("/home/claude/kerjacheck/ml/model.json", "w"), separators=(",", ":"))
print("features", len(feats))
