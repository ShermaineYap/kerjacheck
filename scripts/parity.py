"""Print Python-side model probabilities for parity checking against the TS port."""
import json, math, sys
sys.path.insert(0, "ml")
from features import vectorize
m = json.load(open("src/lib/model.json"))
vocab = {f: i for i, f in enumerate(m["features"])}
out = []
for line in open(sys.argv[1]):
    r = json.loads(line)
    v = vectorize(r["text"], vocab, m["idf"])
    logits = [m["intercept"][k] + sum(x * m["coef"][k][j] for j, x in v.items()) for k in range(3)]
    mx = max(logits); ex = [math.exp(l - mx) for l in logits]; s = sum(ex)
    out.append([e / s for e in ex])
json.dump(out, sys.stdout)
