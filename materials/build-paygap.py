#!/usr/bin/env python3
"""Rebuild every UK gender pay gap number quoted in learn-people-analytics-with-phoebe, the bench
sample, and the BLS JOLTS benchmark series.

Internal build document. Not linked from any audience-facing page.

Usage
-----
  python3 materials/build-paygap.py <dir-with-gpg-csvs> [--write-sample]

The directory must hold gpg-2024.csv and gpg-2023.csv, downloaded from the gov.uk gender pay gap
service (https://gender-pay-gap.service.gov.uk/viewing/download-data/<year>, Open Government
Licence). --write-sample also fetches JOLTS from the BLS public API v1 (no key).

Decisions, stated once (deep-dive session 5 teaches them):
  rows      one employer's filing for the reporting year (snapshot 5 April)
  kept      filings with all eight quartile shares and both hourly gaps present, mean gap within
            -100..100 (three 2024 filings report an impossible mean gap below -100)
  usable    for the composition model, employers with at least one man and one woman across the
            four bands (an all-male or all-female workforce has no gap to decompose)
  bands     the four equal-sized pay quartiles the regulation defines
  ladder    L = relative mean pay of the four bands (L1 = 1); the composition-only gap is
            1 - (female band-weighted mean / male band-weighted mean); the ladder is FITTED by
            least squares on the reported mean gaps, so it is a statement about UK filings as a
            whole, not a pay scale of any employer
  sample    3,000 employers drawn with numpy default_rng(20240405) for the bench
"""
import json, os, sys, urllib.request
import numpy as np, pandas as pd

Q = ['FemaleLowerQuartile', 'FemaleLowerMiddleQuartile', 'FemaleUpperMiddleQuartile', 'FemaleTopQuartile']
MQ = ['MaleLowerQuartile', 'MaleLowerMiddleQuartile', 'MaleUpperMiddleQuartile', 'MaleTopQuartile']
SEED, SAMPLE_N = 20240405, 3000


def load(d, year):
    x = pd.read_csv(os.path.join(d, f"gpg-{year}.csv"))
    n0 = len(x)
    x = x.dropna(subset=Q + MQ + ['DiffMedianHourlyPercent', 'DiffMeanHourlyPercent'])
    x = x[x.DiffMeanHourlyPercent.abs() <= 100].copy()
    F = x[Q].values / 100; M = x[MQ].values / 100
    ok = (F.sum(1) > 0) & (M.sum(1) > 0)
    print(f"{year}: filings {n0}, complete and within range {len(x)}, usable (both sexes present) {ok.sum()}")
    return x[ok].reset_index(drop=True)


def comp_gap(F, M, L):
    L = np.asarray(L, float)
    return (1 - (F * L).sum(1) / F.sum(1) / ((M * L).sum(1) / M.sum(1))) * 100


def fit_ladder(F, M, y):
    best = None
    for l2 in np.arange(1.05, 1.61, 0.05):
        for l3 in np.arange(l2 + 0.05, 2.61, 0.05):
            for l4 in np.arange(l3 + 0.05, 5.01, 0.05):
                sse = ((comp_gap(F, M, [1, l2, l3, l4]) - y) ** 2).sum()
                if best is None or sse < best[0]: best = (sse, l2, l3, l4)
    return best


def report(x):
    F = x[Q].values / 100; M = x[MQ].values / 100
    y = x.DiffMeanHourlyPercent.values; ymed = x.DiffMedianHourlyPercent.values
    print(f"reported median hourly gap: median {np.median(ymed):.1f}, mean {ymed.mean():.1f}; share > 0 {(ymed > 0).mean():.3f}; share exactly 0 {(ymed == 0).mean():.3f}")
    print(f"reported mean hourly gap:   median {np.median(y):.1f}, mean {y.mean():.1f}; share > 0 {(y > 0).mean():.3f}")
    print(f"female share by band, median employer: {np.round(np.median(F, 0), 3)}  (bottom to top)")
    print(f"share of employers with more women at the bottom than the top: {(F[:, 0] > F[:, 3]).mean():.3f}")
    sse, l2, l3, l4 = fit_ladder(F, M, y); L = [1, l2, l3, l4]
    g = comp_gap(F, M, L); r2 = 1 - sse / ((y - y.mean()) ** 2).sum()
    print(f"fitted ladder L = {np.round(L, 2)}; composition-only gap explains R2 {r2:.3f} of reported mean gaps (corr {np.corrcoef(g, y)[0, 1]:.3f})")
    resid = y - g
    print(f"composition-only gap: median {np.median(g):.1f}, mean {g.mean():.1f}; residual (reported minus composition) median {np.median(resid):.1f}, sd {resid.std():.1f}")
    print(f"share of employers whose reported gap is BELOW their composition-only gap: {(resid < 0).mean():.3f}")
    # the anti-lever on the median employer profile: add women equal to 10 percent of headcount into one band
    med = np.median(F, 0); L = np.array(L)
    def gap_w(f, w):
        m = 1 - f; return (1 - (f * w * L).sum() / (f * w).sum() / ((m * w * L).sum() / (m * w).sum())) * 100
    base = gap_w(med, np.ones(4))
    fb = med.copy(); fb[0] = (med[0] + 0.4) / 1.4; wb = np.array([1.4, 1, 1, 1])
    ft = med.copy(); ft[3] = (med[3] + 0.4) / 1.4; wt = np.array([1, 1, 1, 1.4])
    print(f"median-profile composition gap {base:.2f}; add women = 10% of headcount at the BOTTOM band: {gap_w(fb, wb):.2f}; at the TOP band: {gap_w(ft, wt):.2f}")
    print(f"employer size classes: {x.EmployerSize.value_counts().to_dict()}")
    print(f"share reporting a median bonus gap: {x.DiffMedianBonusPercent.notna().mean():.3f}")
    return L


def write_sample(x, L, out):
    rng = np.random.default_rng(SEED)
    idx = np.sort(rng.choice(len(x), SAMPLE_N, replace=False)); s = x.iloc[idx]
    sizes = sorted(x.EmployerSize.unique()); sidx = {k: i for i, k in enumerate(sizes)}
    js = ("/* pa-sample.js - 3,000 UK employers sampled (seed 20240405) from the 2024 gender pay gap filings.\n"
          " * Source: gov.uk gender pay gap service, reporting year 2024 (snapshot 5 April 2024), Open Government Licence.\n"
          " * med/mean = reported median/mean hourly pay gap x100 (integer hundredths of a percent); f1..f4 = female share of each\n"
          " * pay quartile x100 (bottom to top); size = employer size class index. ladder = the fitted band pay ladder. */\n"
          "window.PA_SAMPLE = {\n"
          f'  year: 2024, n: {len(s)}, sizes: {json.dumps(sizes)}, ladder: {json.dumps([round(float(v), 2) for v in L])},\n'
          f"  med: {json.dumps([int(round(v * 100)) for v in s.DiffMedianHourlyPercent])},\n"
          f"  mean: {json.dumps([int(round(v * 100)) for v in s.DiffMeanHourlyPercent])},\n"
          + "".join(f"  f{i + 1}: {json.dumps([int(round(v * 100)) for v in s[c]])},\n" for i, c in enumerate(Q))
          + f"  size: {json.dumps([sidx[v] for v in s.EmployerSize])}\n"
          "};\n")
    open(out, "w").write(js); print(f"wrote {out} ({len(js)} bytes)")
    # the sample's own canon, which the bench (assets/pa-live.js) must reproduce in node
    Fs = s[Q].values / 100; Ms = s[MQ].values / 100; ys = s.DiffMeanHourlyPercent.values; ms = s.DiffMedianHourlyPercent.values
    print(f"SAMPLE canon: n {len(s)}; median of median gap {np.median(ms):.1f}; share > 0 {(ms > 0).mean():.4f}; "
          f"median female shares {np.round(np.median(Fs, 0), 3)}; bottom>top {(Fs[:, 0] > Fs[:, 3]).mean():.4f}")
    sse, l2, l3, l4 = fit_ladder(Fs, Ms, ys); Ls = [1, l2, l3, l4]; g = comp_gap(Fs, Ms, Ls)
    r2 = 1 - sse / ((ys - ys.mean()) ** 2).sum()
    print(f"SAMPLE ladder {np.round(Ls, 2)} R2 {r2:.4f} corr {np.corrcoef(g, ys)[0, 1]:.4f}; comp median {np.median(g):.2f}; resid median {np.median(ys - g):.2f}; share below {((ys - g) < 0).mean():.4f}")
    gF = comp_gap(Fs, Ms, L); r2F = 1 - ((gF - ys) ** 2).sum() / ((ys - ys.mean()) ** 2).sum()
    print(f"SAMPLE under the FULL-set ladder {np.round(L, 2)}: R2 {r2F:.4f} corr {np.corrcoef(gF, ys)[0, 1]:.4f}")
    medS = np.median(Fs, 0)
    def gw(f, w):
        m = 1 - f; return (1 - (f * w * np.array(L)).sum() / (f * w).sum() / ((m * w * np.array(L)).sum() / (m * w).sum())) * 100
    fb = medS.copy(); fb[0] = (medS[0] + 0.4) / 1.4; ft = medS.copy(); ft[3] = (medS[3] + 0.4) / 1.4
    print(f"SAMPLE anti-lever on the sample's median profile, full-set ladder: base {gw(medS, np.ones(4)):.2f}, +women at bottom {gw(fb, np.array([1.4, 1, 1, 1])):.2f}, at top {gw(ft, np.array([1, 1, 1, 1.4])):.2f}")
    rng2 = np.random.default_rng(SEED)
    r2s = []
    for _ in range(100):
        Fp = np.array([rng2.permutation(r) for r in Fs]); Mp = 1 - Fp
        gp = comp_gap(Fp, Mp, L); r2s.append(1 - ((gp - ys) ** 2).sum() / ((ys - ys.mean()) ** 2).sum())
    print(f"SAMPLE placebo (bands shuffled within employer, 100 draws, full-set ladder): R2 mean {np.mean(r2s):.4f} sd {np.std(r2s):.4f} max {np.max(r2s):.4f}")


def jolts_summary(d):
    t = dict(d["total"]); ks = sorted(t)
    peak = max(ks, key=lambda k: t[k]); trough = min(ks, key=lambda k: t[k])
    y19 = np.mean([v for k, v in t.items() if k.startswith("2019")]); y25 = np.mean([v for k, v in t.items() if k.startswith("2025")])
    print(f"JOLTS total quits: peak {peak} at {t[peak]}, trough {trough} at {t[trough]}, 2019 mean {y19:.2f}, 2025 mean {y25:.2f}, Dec 2025 {t['2025-12']}")
    for k in ("manufacturing", "leisure_hospitality", "prof_business", "health_education"):
        v = dict(d[k]); print(f"  {k}: 2025 mean {np.mean([x for m, x in v.items() if m.startswith('2025')]):.2f}, Dec 2025 {v['2025-12']}")


def fetch_jolts(out):
    ids = {"total": "JTS000000000000000QUR", "prof_business": "JTS540099000000000QUR", "manufacturing": "JTS300000000000000QUR",
           "leisure_hospitality": "JTS700000000000000QUR", "health_education": "JTS600000000000000QUR", "total_hires": "JTS000000000000000HIR"}
    body = json.dumps({"seriesid": list(ids.values()), "startyear": "2016", "endyear": "2025"}).encode()
    req = urllib.request.Request("https://api.bls.gov/publicAPI/v1/timeseries/data/", data=body, headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=60))
    print("JOLTS", d["status"], d.get("message"))
    out_d = {}
    for s in d["Results"]["series"]:
        name = [k for k, v in ids.items() if v == s["seriesID"]][0]
        rows = sorted([(r["year"] + "-" + r["period"][1:], float(r["value"])) for r in s["data"] if r["period"] != "M13"])
        out_d[name] = rows; print(f"  {name}: {len(rows)} months, first {rows[0]}, last {rows[-1]}")
    js = ("/* pa-jolts.js - BLS JOLTS monthly rates, percent of employment, seasonally adjusted, fetched from the\n"
          " * BLS public API v1 on 2026-09-26. total = quits rate all nonfarm; total_hires = hires rate; others = quits by industry. */\n"
          "window.PA_JOLTS = " + json.dumps(out_d) + ";\n")
    open(out, "w").write(js); print(f"wrote {out} ({len(js)} bytes)")
    jolts_summary(out_d)


if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    x24 = load(sys.argv[1], 2024); x23 = load(sys.argv[1], 2023)
    print(f"2023 median of median gap {x23.DiffMedianHourlyPercent.median():.1f}, 2024 {x24.DiffMedianHourlyPercent.median():.1f}")
    L = report(x24)
    if "--write-sample" in sys.argv:
        here = os.path.dirname(os.path.abspath(__file__))
        write_sample(x24, L, os.path.join(here, "..", "assets", "pa-sample.js"))
        fetch_jolts(os.path.join(here, "..", "assets", "pa-jolts.js"))
