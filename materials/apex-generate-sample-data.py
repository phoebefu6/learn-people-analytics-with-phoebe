#!/usr/bin/env python3
"""Generate realistic sample HR data for retention analysis testing."""

import random
import pandas as pd
import numpy as np
from datetime import timedelta

random.seed(42)
np.random.seed(42)

N = 500
COMPANIES = ["Alpha Corp", "Beta Holdings", "Gamma Solutions", "Delta Industries", "Epsilon Tech"]

LEAVING_REASONS = [
    # Resignation variants (messy free text)
    "Resigned - personal reasons", "Voluntary resignation", "Resigned for better opportunity",
    "Career change to another industry", "Resigned, relocating overseas",
    "Moving to new job in competitor", "Left for career growth", "Resigned - family reasons",
    "Going back to school for MBA", "Starting own business", "Resigned to freelance",
    "Personal reason - spouse relocation", "Resigned, emigrating to Canada",
    "Voluntary exit - new role elsewhere", "Career advancement opportunity",
    # Termination variants
    "Terminated - misconduct", "Dismissed for policy violation", "Poor performance - terminated",
    "Terminated due to disciplinary issue", "Fired after repeated warnings",
    "Performance issue, contract terminated", "Breach of contract",
    # Probation
    "Failed probation review", "Probation not passed", "Did not pass probation assessment",
    "Probation fail - performance below standard", "Not confirmed after probation",
    # Redundancy
    "Position made redundant", "Laid off due to restructuring", "Retrenchment exercise",
    "Downsizing - role eliminated", "Company restructuring",
    # Contract
    "Contract ended, not renewed", "Fixed-term contract expired", "End of contract",
    # Retirement
    "Retired after 30 years of service", "Early retirement package",
    # Health
    "Left due to health issues", "Medical leave turned permanent", "Long-term illness",
    # Death
    "Deceased", "Passed away",
    # Transfer
    "Transferred to sister company", "Internal move to HQ", "Secondment to regional office",
    # Mutual
    "Mutual separation agreement", "Agreed settlement",
    # Uncategorizable
    "Left the company", "No longer employed", "End of employment",
]

REASON_WEIGHTS = (
    [3.0]*15 +  # resignation (most common)
    [1.5]*7 +   # termination
    [1.2]*5 +   # probation
    [0.8]*5 +   # redundancy
    [0.6]*3 +   # contract
    [0.3]*2 +   # retirement
    [0.4]*3 +   # health
    [0.1]*2 +   # death
    [0.5]*3 +   # transfer
    [0.3]*2 +   # mutual
    [0.2]*3     # uncategorizable
)

records = []
for i in range(1, N + 1):
    # service_start_date: 2018-2025
    service_start = pd.Timestamp("2018-01-01") + timedelta(days=random.randint(0, 2500))
    # join_date: same or later (transfer scenario ~20%)
    if random.random() < 0.2:
        join_date = service_start + timedelta(days=random.randint(90, 730))
    else:
        join_date = service_start

    company = random.choice(COMPANIES)

    # ~40% are leavers
    is_leaver = random.random() < 0.40
    if is_leaver:
        tenure_days = random.randint(30, 2000)
        last_date = join_date + timedelta(days=tenure_days)
        if last_date > pd.Timestamp("2026-06-01"):
            last_date = pd.Timestamp("2026-06-01") - timedelta(days=random.randint(1, 60))
        reason = random.choices(LEAVING_REASONS, weights=REASON_WEIGHTS, k=1)[0]
    else:
        last_date = None
        reason = None

    records.append({
        "staff_id": f"EMP{i:04d}",
        "service_start_date": service_start,
        "join_date": join_date,
        "last_date": last_date,
        "current_company": company,
        "reason_of_leaving": reason,
    })

df = pd.DataFrame(records)
output_path = "sample_staff_data.xlsx"
df.to_excel(output_path, index=False)
print(f"Generated {len(df)} records → {output_path}")
print(f"  Leavers: {df['last_date'].notna().sum()}")
print(f"  Active:  {df['last_date'].isna().sum()}")
print(f"  Companies: {df['current_company'].nunique()}")
print(f"\nSample rows:")
print(df.head(10).to_string(index=False))
