#!/usr/bin/env python3
"""Every Apex number quoted on the pages, recomputed from materials/apex-staff.csv.

Internal build document. Apex is a CONSTRUCTED company: four Apex entities, 1,071 staff rows,
generated with a seeded script (materials/apex-generate-sample-data.py is the family of
generator it came from). Every page that uses it says "constructed".

The table is a SNAPSHOT: it holds everyone employed on 1 January 2026 plus the people who left
between 1 January and 17 June 2026. Nobody who left before 2026 is in it. That shape is real
(most HR exports look like this) and it is the lesson of deep-dive session 2: a survivor table
cannot give an unbiased tenure survival curve, and the page says so.
"""
import numpy as np, pandas as pd, sys, os
here = os.path.dirname(os.path.abspath(__file__))
d = pd.read_csv(os.path.join(here, "apex-staff.csv"), parse_dates=["Date Join", "Last Day"])
SNAP = pd.Timestamp("2026-07-01")
print(f"rows {len(d)}; companies {d.Company.value_counts().to_dict()}")
print(f"departments {d.Department.value_counts().to_dict()}")
print(f"leavers {int(d.is_attrited.sum())} (all between {d['Last Day'].min().date()} and {d['Last Day'].max().date()}); active {int((~d.is_attrited).sum())}")
start = pd.Timestamp("2026-01-01")
hc0 = int(((d["Date Join"] <= start) & (d["Last Day"].isna() | (d["Last Day"] >= start))).sum())
hc1 = int(((d["Date Join"] <= SNAP) & (d["Last Day"].isna())).sum())
joiners = int((d["Date Join"] >= start).sum()); leavers = int(d.is_attrited.sum())
print(f"headcount 1 Jan 2026 {hc0}; joiners Jan-Jun {joiners}; leavers Jan-Jun {leavers}; headcount 1 Jul {hc1}")
print(f"H1 attrition: on start base {leavers / hc0 * 100:.1f}%; on average base {leavers / ((hc0 + hc1) / 2) * 100:.1f}%; on end base {leavers / hc1 * 100:.1f}%; annualised (x2) on average base {leavers / ((hc0 + hc1) / 2) * 200:.1f}%")
print("by company (leavers / start headcount):")
for c, g in d.groupby("Company"):
    h = int(((g["Date Join"] <= start) & (g["Last Day"].isna() | (g["Last Day"] >= start))).sum()); l = int(g.is_attrited.sum())
    print(f"  {c:18s} start {h:4d} leavers {l:3d} rate {l / h * 100:5.1f}%")
print("by department (leavers / start headcount):")
for c, g in d.groupby("Department"):
    h = int(((g["Date Join"] <= start) & (g["Last Day"].isna() | (g["Last Day"] >= start))).sum()); l = int(g.is_attrited.sum())
    print(f"  {c:18s} start {h:4d} leavers {l:3d} rate {l / max(h, 1) * 100:5.1f}%")
rc = d[d.is_attrited].reason_category.value_counts()
print(f"reason categories among leavers: {rc.to_dict()}")
REGRET = ["Better Opportunity", "Career Growth", "Compensation", "Management/Culture", "Work-Life Balance"]
reg = int(d[d.is_attrited].reason_category.isin(REGRET).sum())
print(f"regretted (avoidable: {', '.join(REGRET)}): {reg} of {leavers} = {reg / leavers * 100:.1f}%; involuntary+retirement+study {int(d[d.is_attrited].reason_category.isin(['Involuntary/Performance', 'Retirement', 'Further Study']).sum())}")
# tenure at exit, and the survivor-table Kaplan-Meier (biased, taught as such)
te = d[d.is_attrited].tenure_at_exit_years
print(f"tenure at exit: median {te.median():.2f} y, share under 1 y {(te < 1).mean():.3f}, under 2 y {(te < 2).mean():.3f}")
t = ((d["Last Day"].fillna(SNAP) - d["Date Join"]).dt.days / 365.25).clip(lower=0).values
e = d["Last Day"].notna().values
o = np.argsort(t); tt, ee = t[o], e[o]; S = 1.0; at = len(tt); km = {}
for i in range(len(tt)):
    if ee[i]: S *= 1 - 1 / at
    at -= 1
    for h in (1, 2, 3, 5):
        if tt[i] <= h: km[h] = S
print(f"survivor-table Kaplan-Meier survival at 1/2/3/5 years: { {k: round(v, 3) for k, v in km.items()} } (BIASED UPWARD: nobody who left before 2026 is in the table)")
print(f"tenure of active staff: median {d[~d.is_attrited].company_tenure_years.median():.2f} y; share joined 2025 or later {(d['Date Join'] >= '2025-01-01').mean():.3f}")
print(f"transfers between Apex entities: {int(d.is_transfer.sum())}")
