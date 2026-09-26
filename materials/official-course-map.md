# Official course map - learn-people-analytics-with-phoebe

Internal build document. Not linked from any audience-facing page. Every number quoted on any
page comes from here, with its verification tier. If a fact is not here, the page teaches the
uncertainty instead of inventing a number.

Built 2026-09-26. Scope approved by Phoebe the same day: **People Analytics: HR by the Numbers,
data and AI angle, generic intro + data/AI deep dive.** Two tracks: Foundations (6, no code) and
Data and AI deep-dive (10, Python). Signature bench: pay gap composition on real UK filings,
computed in the browser. Seam: the four-fifths rule and the screening simulator stay in the live
AI + HR course (link, never a second simulator). Constructed company: Apex, Phoebe's own seeded
synthetic staff table.

## Verification tiers

| Tier | Meaning |
|------|---------|
| **computed** | Recomputed in this build from the gov.uk gender pay gap filings by `materials/build-paygap.py`, from BLS JOLTS by the same script, or from the Apex table by `materials/build-apex.py`; the bench (`assets/pa-live.js`) reproduces the sample's deterministic numbers exactly in node (checked 2026-09-26: median 8.50, positive share 0.7787, ladder 1/1.3/1.5/3, R2 0.4114, anti-lever 9.79/15.07/-2.92 all agree; the placebo uses a different generator and agrees to mean -1.843 vs -1.845) |
| **modelled** | Arithmetic on computed numbers under a stated assumption (the fitted pay ladder, equal pay within a band, a constant rate annualised); the page says so |
| **primary** | Read at source in this build or confirmed by the source-checker with the source text |
| **secondary** | Confirmed through an abstract, a summary or a reproduction; the page says "reported" |
| **constructed** | Invented for teaching (Apex and everyone in it, every salary, every survey response, every funnel); the page says so |
| **not claimed** | Circulates without a measured source; the page teaches the uncertainty |

---

## Running data 1: UK gender pay gap filings (real, open)

Every employer with 250 or more employees must publish six figures each year under the Equality
Act 2010 (Gender Pay Gap Information) Regulations 2017: mean and median hourly pay gap, mean and
median bonus gap, share of each sex receiving a bonus, and the share of each sex in four
equal-sized hourly-pay quartiles. Snapshot 5 April (private sector), published within 12 months.
The service publishes the whole dataset as CSV under the Open Government Licence v3.0 (checker:
confirmed). `https://gender-pay-gap.service.gov.uk/viewing/download-data/2024`.

| Decision | Choice | Why |
|---|---|---|
| Row | one employer's filing for reporting year 2024 (snapshot 5 April 2024) | the unit the regulation defines |
| Kept | all eight quartile shares and both hourly gaps present; mean gap within -100 to 100 | 3 filings of 11,315 report an impossible mean gap below -100 |
| Usable | at least one man and one woman across the four bands | an all-male or all-female workforce has no gap to decompose (11 filings) |
| Bands | the four equal-sized pay quartiles the regulation defines | the only pay structure the filing reveals |
| Ladder | L = relative mean pay of the four bands, L1 = 1, FITTED by least squares on the reported mean gaps across all usable employers | nobody publishes band pay; the ladder is a statement about UK filings as a whole, not any employer's pay scale |
| Composition-only gap | 1 minus (female band-weighted mean pay over male band-weighted mean pay), under the ladder and equal pay within a band | the gap an employer would report if pay differed only by band |
| Sample | 3,000 employers, `numpy.random.default_rng(20240405)` | the bench recomputes everything on them in the browser |

**Counts (computed):**
- 2024: **11,315 filings**; 11,312 complete and in range; **11,301 usable**. 2023: 11,169 filings, 11,162 usable.
- Reported **median** hourly gap: median **8.4 percent** (2023: 8.9), mean 11.2; **77.6 percent of employers report a positive median gap** (men paid more); **8.5 percent report exactly zero**.
- Reported **mean** hourly gap: median 11.0, mean 12.0; 85.9 percent positive.
- Female share by band, median employer, bottom to top: **56.0 / 52.7 / 47.0 / 40.0 percent**.
- **81.3 percent of employers have a higher female share in the bottom band than in the top band.**
- Employer size classes: 250 to 499: 4,895 · 500 to 999: 2,901 · 1,000 to 4,999: 2,431 · 5,000 to 19,999: 543 · under 250: 462 · 20,000 or more: 69.
- 75.8 percent report a median bonus gap (the rest pay no bonus to one sex or either).

**The ladder and the decomposition (computed, then modelled):**
- Fitted ladder, all usable employers: **L = 1 / 1.20 / 1.45 / 2.80**. Under it, composition alone explains **R2 0.353** of the variance in reported mean gaps (correlation **0.66**).
- Composition-only gap: median **9.8 percent** against a reported mean-gap median of 11.0. Residual (reported minus composition-only): median **2.3 points**, sd 10.2.
- **33.8 percent of employers report a gap BELOW their composition-only gap**: at those employers, within-band pay runs the other way, or the ladder is steeper than their own.
- **The anti-lever (modelled on the median employer's band profile):** composition-only gap **9.57**. Add women equal to 10 percent of headcount into the **bottom** band and it becomes **14.88**. Add the same women into the **top** band and it becomes **-3.18**. "Hire more women" is not a lever; "hire more women where" is.
- The bench's 3,000-row sample: median of median gap 8.5; positive share 0.7787; band medians 56.6 / 52.8 / 47.0 / 40.0; bottom-over-top 0.823; **sample-fitted ladder 1 / 1.3 / 1.5 / 3.0, R2 0.4114, corr 0.6907**; under the full-set ladder R2 0.4082; anti-lever on the sample's median profile **9.79 / 15.07 / -2.92**.
- **Placebo (computed):** shuffle each employer's four band shares (the pyramid destroyed, the shares kept) and refit under the full-set ladder: R2 mean **-1.84**, sd 0.07, best draw -1.68 over 100 draws. Composition explains the gap only when the bands are in their real order.

**What the filings cannot say (teach, do not resolve):** nothing about pay within a band, nothing
about hours, occupation, tenure or part-time status, nothing causal. A composition-only gap is
"what the pyramid alone would report", not "what discrimination adds". The regression version
of the same idea is Oaxaca-Blinder, taught in p6 on constructed salaries and named as the
method that decomposes a gap into "explained by measured differences" and "not explained", with
the warning that explained is not the same as justified.

**National benchmarks (primary, ONS):** the UK gender pay gap from the Annual Survey of Hours and
Earnings, April 2024: **7.0 percent for full-time employees, 13.1 percent for all employees**
(2023: 7.5 and 14.2). These are hourly-earnings medians across the whole economy and are NOT
comparable with the filing medians above, which are per-employer medians; the page says so.

## Running data 2: BLS JOLTS quits (real, open, fetched 2026-09-26)

Job Openings and Labor Turnover Survey, monthly, seasonally adjusted, percent of employment,
public API v1 with no key. The quits rate is quits during the month as a percent of employment
(checker: confirmed; December 2025 total nonfarm quits rate **2.0 percent** per the BLS release
of 5 February 2026). 120 months each, January 2016 to December 2025, in `assets/pa-jolts.js`.

| Series | Computed |
|---|---|
| Total nonfarm quits rate | peak **3.0 percent, November 2021**; trough **1.5 percent, April 2020**; 2019 mean 2.32; 2025 mean 2.02; December 2025 2.0 |
| Manufacturing quits | 2025 mean 1.39; December 2025 1.4 |
| Leisure and hospitality quits | 2025 mean 3.92; December 2025 4.4 |
| Professional and business services quits | 2025 mean 2.34; December 2025 1.9 |
| Private education and health quits | 2025 mean 1.93; December 2025 1.9 |
| Total nonfarm hires rate | January 2016 3.6; December 2025 3.3 |

**Monthly is not annual.** A 2.0 percent monthly quits rate is about 24 percent a year only if
the same people never quit twice and the base never moves; the page multiplies by 12 as a rough
scale and says exactly that. US, all employers, voluntary quits only. Not a target for any
one company.

## Running data 3: Apex (constructed, Phoebe's own seeded table)

`materials/apex-staff.csv`: 1,071 staff rows across four entities (Apex Manufacturing 460, Apex
Retail 250, Apex Logistics 231, Apex Digital 130), eight departments (Operations 227, Engineering
222, Finance 148, Sales 120, Customer Service 99, R&D 98, Marketing 81, HR 76). Generated by a
seeded script; the generator family ships as `materials/apex-generate-sample-data.py`. **Every
page says "constructed".** Nobody in it is real.

**The table is a snapshot.** It holds everyone employed on 1 January 2026 plus the 210 people who
left between 1 January and 17 June 2026. Nobody who left before 2026 is in it. That is what most
HR exports look like, and it is the lesson of p2.

| Apex fact | Computed from the table |
|---|---|
| Headcount 1 January 2026 | **1,022** |
| Joiners January to June 2026 | **49** |
| Leavers January to June 2026 | **210** (all between 1 January and 17 June) |
| Headcount 1 July 2026 | **861** (1,022 + 49 - 210) |
| H1 attrition on the START base | **20.5 percent** (210 / 1,022) |
| H1 attrition on the AVERAGE base | **22.3 percent** (210 / 941.5) |
| H1 attrition on the END base | **24.4 percent** (210 / 861) |
| Annualised, average base, times two | **44.6 percent** (modelled: assumes H2 repeats H1) |
| By entity, start base | Digital 25.0 (31 of 124) · Logistics 23.5 (52 of 221) · Manufacturing 19.3 (85 of 440) · Retail 17.7 (42 of 237) |
| By department, start base | **Sales 50.0 (54 of 108)** · Customer Service 37.6 (35 of 93) · Operations 25.2 (55 of 218) · Marketing 19.7 (15 of 76) · Engineering 11.3 (24 of 213) · HR 10.7 (8 of 75) · Finance 8.3 (12 of 145) · R&D 7.4 (7 of 94) |
| Reason categories among the 210 | Better Opportunity 33 · Career Growth 33 · Compensation 29 · Management/Culture 23 · Relocation 19 · Work-Life Balance 19 · Unknown 17 · Personal/Health 15 · Involuntary/Performance 10 · Retirement 9 · Further Study 3 |
| Regretted (a CHOICE: Better Opportunity, Career Growth, Compensation, Management/Culture, Work-Life Balance) | **137 of 210 = 65.2 percent** |
| Involuntary, retirement, study | 22 |
| Regretted under OTHER lists (p3, computed) | seven categories: 171 of 210 = 81.4 percent · three categories: 95 of 210 = 45.2 percent · the five with "Unknown" removed from the base: 137 of 193 = 71.0 percent |
| One leaver more or less (p3, computed) | Sales 50.9 / 49.1 percent; HR 12.0 / 9.3 percent |
| Tenure at exit | median **1.52 years**; 29.5 percent under 1 year; **61.0 percent under 2 years** |
| Survivor-table Kaplan-Meier at 1 / 2 / 3 / 5 years | 0.940 / 0.872 / 0.813 / 0.778, **biased upward** because nobody who left before 2026 is in the table |
| Active staff tenure | median 5.01 years; 17.7 percent joined in 2025 or later |
| Transfers between entities | 291 rows carry a transfer flag |

**Rules:** "regretted" is a classification the page shows as a choice with the 11 categories
visible; the 44.6 is always "annualised by doubling H1, which assumes H2 repeats". Apex has no
salary column: p6's salaries are a SECOND constructed table generated on the page's own build
script (`materials/build-apex-pay.py` if written; otherwise the page prints "your numbers will
differ" and no output).

---

## Named facts and citations

| Fact | Tier | Where |
|---|---|---|
| Equality Act 2010 (Gender Pay Gap Information) Regulations 2017, SI 2017/172: 250+ employees, six measures, four equal quartiles, 5 April snapshot, publish within 12 months | primary (checker read the SI) | a4, p5 |
| gov.uk gender pay gap service CSV, Open Government Licence v3.0 | primary | every page that uses the filings |
| ONS ASHE April 2024: 7.0 percent full-time, 13.1 percent all employees (2023: 7.5, 14.2) | primary (ONS bulletin) | a4, p5 |
| Blinder 1973, "Wage Discrimination: Reduced Form and Structural Estimates", Journal of Human Resources 8(4) 436-455; Oaxaca 1973, "Male-Female Wage Differentials in Urban Labor Markets", International Economic Review 14(3) 693-709 | primary (records) | p5, p6 |
| Goldin 2014, "A Grand Gender Convergence: Its Last Chapter", American Economic Review 104(4) 1091-1119: the remaining gap is driven by occupations that reward long and particular hours | primary | a4, p6 |
| Bertrand and Mullainathan 2004, "Are Emily and Greg More Employable Than Lakisha and Jamal?", AER 94(4) 991-1013: about 50 percent more callbacks for white-sounding names | primary | a3, p4 |
| Hoffman, Kahn and Li 2018, "Discretion in Hiring", Quarterly Journal of Economics 133(2) 765-800: test-based hiring raised completed tenure by about 25 percent (0.23 log points); hires made by overriding the test left sooner | primary (full text read by the checker) | a3, p4, p9 |
| Reuters, 10 October 2018 (Jeffrey Dastin): Amazon scrapped an experimental recruiting tool that penalised resumes containing "women's" | secondary (reproduction of the report) | p9 |
| 29 CFR 1607.4(D), Uniform Guidelines 1978: a selection rate less than four-fifths (80 percent) of the highest group's rate is generally regarded as evidence of adverse impact | primary (LII) | a3 (named once), p4 |
| New York City Local Law 144 of 2021, enforced from 5 July 2023: annual independent bias audit of automated employment decision tools, published summary, impact ratios by sex and race/ethnicity | primary | p4, p9 |
| EU AI Act, Regulation (EU) 2024/1689, Annex III point 4: recruitment, selection, promotion, termination, task allocation and monitoring are high-risk | primary (EUR-Lex) | a6, p9 |
| GDPR Article 22 (solely automated decisions with legal or similarly significant effects) and Article 9 (special categories: health, trade union membership among them) | primary | a6, p9 |
| Kaplan and Meier 1958, "Nonparametric Estimation from Incomplete Observations", JASA 53(282) 457-481 | primary | p2 |
| Cox 1972, "Regression Models and Life-Tables", Journal of the Royal Statistical Society Series B 34(2) **187-202** (not 187-220) | primary (checker corrected the pages) | p2 |
| Cronbach 1951, "Coefficient alpha and the internal structure of tests", Psychometrika 16(3) 297-334 | primary | a5, p7 |
| Strathern 1997, "'Improving ratings': audit in the British University system", European Review 5(3) 305-321: the popular wording of Goodhart's law is hers, not Goodhart's 1975 | confirmed (economics build's source-checker located the original PDF, 2026-09-25) | a6, p8, p9 |
| BLS JOLTS quits rate definition; December 2025 total quits 2.0 percent (release 5 February 2026) | primary | a2, p3 |
| Gallup, State of the Global Workplace: **23 percent engaged in the 2024 edition** (2023 data); Gallup's later editions report 21 (2025) and 20 (2026) | secondary; the page names the edition and the drift | a5, p7 |
| "People leave managers, not companies" | **not claimed**: traces to Buckingham and Coffman, First, Break All the Rules (1999), not to a measured Gallup statistic | a5, p7 |
| "Replacing an employee costs 1.5 to 2 times salary" | **not claimed**: SHRM's own range is 50 to 200 percent of salary; the 1.5 to 2x figure is attributed to an analyst, not measured | a2, p3 |

## Constructed cases (say "constructed" on the page)

- **Apex** and every person, department and reason in it.
- **The Apex hiring funnel** (a3, p4): 400 applicants, 120 screened, 40 interviewed, 12 offers, 10 hires, invented, with an invented split by sex for the impact ratio.
  Invented split, men / women: applicants 240 / 160; screened 80 / 40; interviewed 26 / 14;
  offered 7 / 5; hired 6 / 4. Impact ratios by stage (lower group over higher): screened 0.750
  (women), interviewed 0.929 (men), offered 0.754 (men), hired 0.933 (women); end to end exactly
  1.000. The p4 lesson: an end-to-end ratio of 1.000 hides two stages under four-fifths. Women
  screened in for the screen to reach 0.8: 43 of 160. (Added by the p4 build, executed.)
- **The Apex salary table** (p6): generated on the page's build script with a seed; log pay on grade, tenure and sex.
- **The survey** (a5, p7): 12 items, five-point scale, 600 constructed responses of 1,022 invited (58.7 percent, the invited population is the 1 January headcount), one planted low-reliability item (q9, item-rest r -0.03; alpha 0.90 on 11 items without it); minimum reporting group 8 (a stated choice). a5 adds Team A and Team B with the same 3.8 mean and different distributions, and HR survey cells 21 / 12 / 7 of 40, all constructed.
- **The recoding** (a6): the same 210 leavers recoded under pressure on the regretted metric, regretted 65.2 to 54.3 percent and Unknown 17 to 40, constructed to show Goodhart on a people metric.
- **The workforce plan** (p8): Apex's real counts as inputs, invented growth and transfer rates.

## Not claimed

- Any causal reading of a pay gap, an attrition rate or a survey score.
- Any "cost of attrition" figure. Any "engagement drives performance" figure.
- That the JOLTS rates are a target for any employer, or comparable to an annual rate without the stated arithmetic.
- That Apex's numbers describe any real company.
- The name of any real employer in the filings as good or bad; the sample rows carry names only as data and no page singles one out.

---

## Seams (checked against the live hub 2026-09-26)

| Neighbour | It owns | This course does NOT |
|---|---|---|
| `learn-ai-hr-with-phoebe` (aiap, 16 sessions) | the four-fifths rule on 13 pages, the screening simulator (b4), the legal map (a2), fairness in practice (a4), AI across the people lifecycle | build a second simulator; a3 and p4 teach adverse impact as one metric in one card and link |
| `learn-performance-management-with-phoebe` (lead) | ratings, calibration, performance conversations | teach performance ratings; a6 shows a rating distribution as one dashboard row and links |
| `learn-okr-with-phoebe` (lead) | OKRs and fair measurement | set goals |
| `learn-customer-retention-with-phoebe` (data) | cohorts and survival on customers | reuse its engine; p2 teaches survival on employees and links for the customer version |
| `learn-experimentation-with-phoebe`, `learn-causal-inference-with-phoebe` (ds) | tests and identification | prove causes |
| `learn-gdpr-with-phoebe`, `learn-pdpa-dnc-with-phoebe`, `learn-data-governance-with-phoebe`, `learn-ai-governance-with-phoebe` (gov) | the law in depth | teach the law; p9 names the articles and links |
| `learn-statistics-with-phoebe` (ds) | the statistics | teach regression from scratch; p6 links |
| `learn-team-management-with-phoebe` (planned, lead) | managing the team | |

Heading collisions grepped 2026-09-26: "The funnel, and what a ratio is a ratio of" is live in
Ecommerce Metrics; "Why leaders read funnels" exists; neither title is reused here.

---

## Session coverage

### Foundations track (6 x 45 min, no code)

| # | File | Title | Live | Self-study | Figures (mechanism) | Numbers |
|---|---|---|---|---|---|---|
| a1 | a1-headcount-and-flows.html | Headcount is a stock, attrition is a flow | stock vs flow; the identity (start + joiners - leavers = end); why "how many people do we have" needs a date; the three bases | the survivor table (who is in an HR export and who is not); transfers as flows that are not exits | 1 the tank: headcount with joiners in and leavers out; 2 three bases, one count of leavers; 3 the export as a photograph of survivors; 4 (build-along) the Apex H1 bridge 1,022 + 49 - 210 = 861 | Apex bridge, 20.5 / 22.3 / 24.4 |
| a2 | a2-attrition-needs-a-base.html | An attrition rate needs a base | annualising and its assumption (44.6); rates by entity and department (Sales 50.0, R&D 7.4); small groups (HR 8 of 75); regretted as a choice (65.2); the benchmark question | JOLTS: what a monthly quits rate is, the 2021 peak and 2020 trough, industries 1.4 to 4.4; why the folk cost figure is not claimed | 1 the same 210 leavers over three bases; 2 the department bars with the base printed under each; 3 the regretted split as a choice; 4 (build-along) the JOLTS line with the peak and trough | Apex rates, JOLTS |
| a3 | a3-the-hiring-funnel.html | The hiring funnel | stages and conversion ratios, and what each ratio is a ratio of; time-to-fill vs time-to-hire; the constructed Apex funnel 400 / 120 / 40 / 12 / 10 | adverse impact as one metric (impact ratio, four-fifths named once, link AI + HR); Bertrand and Mullainathan 50 percent; Hoffman, Kahn and Li: overrides shorten tenure | 1 the funnel with a base under every stage; 2 the two clocks (fill vs hire); 3 the impact ratio as two selection rates; 4 (build-along) the funnel worksheet | constructed funnel, two papers |
| a4 | a4-pay-gaps-and-fairness.html | Pay, gaps and fairness | a pay gap is not equal pay; the six UK figures and the four bands; 11,315 filings, median 8.4, 77.6 percent positive; the pyramid: 56 / 53 / 47 / 40; composition vs within-band | the anti-lever (9.57 to 14.88 at the bottom, -3.18 at the top); ONS 7.0 / 13.1 and why it differs from filing medians; Goldin on hours | 1 the four-band pyramid; 2 composition vs within-band as two mechanisms; 3 the anti-lever's two arrows; 4 (build-along) reading one filing's six numbers | filings canon |
| a5 | a5-surveys-as-evidence.html | Surveys as evidence | who answers and who does not; a five-point average is not a temperature; anonymity thresholds; the constructed survey | Gallup 23 percent (2024 edition) and the drift to 21 and 20; reliability (Cronbach named); the two folk claims and why they are not claimed | 1 the response funnel; 2 the same mean from two distributions; 3 the anonymity threshold as a wall; 4 (build-along) the survey worksheet | Gallup editions |
| a6 | a6-the-people-dashboard.html | The people dashboard | one stock and one flow per row, each with its base and date; the honest sentence per row; Goodhart on people metrics | what the law forbids on a dashboard: GDPR 9 and 22, EU AI Act Annex III, NYC LL144 named, links to the governance courses and AI + HR | 1 the dashboard as rows with bases; 2 a metric that became a target; 3 the fence: what may not be computed; 4 (build-along) the dashboard worksheet | all of the above |

### Data and AI deep-dive track (10 x 45 min, Python)

| # | File | Title | Live | Self-study | Figures | Build-along |
|---|---|---|---|---|---|---|
| p1 | p1-the-people-data-model.html | The people data model | employee, position and event tables; the Apex columns; snapshot vs event log; headcount at a date; the identity; the three bases | transfers as events not exits; the id that is the person; the survivor table | 1 three tables; 2 snapshot vs event log; 3 the Apex column map; 4 pipeline | pandas on apex-staff.csv: 1,071 rows; 1,022 / 49 / 210 / 861; 20.5 / 22.3 / 24.4 |
| p2 | p2-attrition-survival.html | Attrition as survival | tenure as time-to-event; censoring; Kaplan-Meier by hand; the survivor-table bias: 0.940 / 0.872 / 0.813 / 0.778 are biased upward and the page proves why | Cox 1972 named (187-202); the retention course's customer version linked; what an event log would fix | 1 tenure lines with censoring marks; 2 the KM staircase; 3 who is missing from a survivor table; 4 the fix (an event log) | KM in pandas on Apex; tenure at exit median 1.52, 61 percent under 2 years |
| p3 | p3-regretted-and-benchmarked.html | Regretted, and benchmarked | reason categories; regretted as a classification with the 11 categories visible (65.2); by department (Sales 50.0, Customer Service 37.6); the JOLTS benchmark and its arithmetic | fetching BLS v1 without a key; monthly vs annual; industries 1.4 to 4.4; the cost figure not claimed | 1 the reason categories as a choice; 2 department bars with n; 3 the JOLTS line; 4 monthly to annual | pandas on Apex reasons; requests to BLS v1 |
| p4 | p4-funnel-maths.html | Funnel maths and adverse impact | conversion per stage; the impact ratio; four-fifths as the rule of thumb (29 CFR 1607.4(D)); NYC LL144's audit; link AI + HR for the simulator | Bertrand and Mullainathan; Hoffman, Kahn and Li; why a ratio needs both rates printed | 1 the funnel with bases; 2 the impact ratio; 3 the audit's two columns; 4 pipeline | constructed funnel in pandas, labelled |
| p5 | p5-pay-gap-decomposition.html | Pay gap decomposition on 11,301 employers | the filing; the pyramid; the ladder fit (1 / 1.2 / 1.45 / 2.8, R2 0.353, corr 0.66); composition-only 9.8 vs reported 11.0; 33.8 percent below; the anti-lever | Oaxaca-Blinder named as the regression version; ONS 7.0 / 13.1; the placebo (R2 -1.84 when bands are shuffled) | 1 the pyramid; 2 the ladder; 3 composition vs reported cloud; 4 the anti-lever | pandas on the gov.uk CSV: reproduce the counts, the fit, the anti-lever |
| p6 | p6-pay-equity-regression.html | Pay equity regression | within-band pay on constructed Apex salaries; log pay on grade, tenure, sex; Oaxaca-Blinder decomposition; explained is not justified | Goldin; what the filing cannot see (hours, occupation); link statistics course | 1 the regression as a ladder with residuals; 2 explained vs unexplained; 3 the variable that should not be in the model; 4 pipeline | numpy least squares on a seeded constructed table; "your numbers will differ" |
| p7 | p7-survey-psychometrics.html | Survey psychometrics | Cronbach alpha computed on constructed responses; the planted bad item; response bias; anonymity threshold | Gallup 23 / 21 / 20 by edition; the folk claim not claimed; correlation is not cause | 1 items as a bundle; 2 alpha as shared variance; 3 the response funnel; 4 pipeline | numpy on constructed responses |
| p8 | p8-workforce-planning.html | Workforce planning | stock-flow model; hiring need = growth + replacement; Apex's real counts as inputs; the annualising assumption made explicit | transition-rate (Markov) planning in one page; scenario ranges not points | 1 the tank with a plan; 2 replacement vs growth; 3 three scenarios; 4 pipeline | Python stock-flow on Apex inputs; invented growth rates labelled |
| p9 | p9-ai-on-people-data.html | AI on people data, and what the law forbids | GDPR 22 and 9; EU AI Act Annex III point 4; NYC LL144; Amazon 2018 (reported); Hoffman, Kahn and Li on discretion vs the test; Goodhart | what a model may not see; the audit as a habit; links | 1 the fence; 2 the tool that learned the past; 3 discretion vs the test; 4 the checklist | a checklist dict and a "may not see" list; no model trained |
| p10 | p10-the-pay-gap-bench.html | The pay gap bench, and defending a number | the bench: 3,000 real employers, the pyramid, the live ladder fit, composition vs reported, size filter, the anti-lever (bottom vs top), the break button (shuffle the bands), the honest sentence; final scorecard | | 1 bench schematic; 2 the anti-lever's two arrows; 3 the placebo | `assets/pa-live.js` on `assets/pa-sample.js` |

## Sources covered rows

The estate-standard heading on every session page is exactly "What this session teaches, and
where it came from". Mechanics with no single source (stock and flow, conversion ratios,
Kaplan-Meier arithmetic) are labelled "standard practice, no single source".

## Not covered by design

- The law in depth (gov shelf). Performance ratings (Performance Management). Goal setting
  (OKRs). Screening simulation and fairness practice (AI + HR).
- Compensation benchmarking against market surveys (no open source of the data).
- Any AI model trained on people data in the build-along.

## Build log (session-limit relaunch, 2026-09-26)

- All three fan-out agents hit the model limit mid-run. Disk held 7 of 13 pages, each complete
  and passing the hard-rule checks; the six missing pages were relaunched with "if the file
  exists, do not write it" in every prompt, after the disk check in a separate step.
- The Python in p2, p3, p6 and p7 was extracted and executed end to end from the repo root:
  all four exit 0 and reproduce the map (p3 against the live BLS API).

## Build log

- 2026-09-26: grill approved (6 + 10, pay gap bench on real UK filings, four-fifths stays in
  AI + HR, reuse Apex). Palette wine `#7A2334` + moss `#3D6B2E`, 18 pairs AA, none of the 15
  hexes used by any of the 155 live repos.
- The first ladder fit returned NaN: eleven employers have an all-male or all-female band set,
  so the female-weighted mean divides by zero; they are excluded and the count is stated.
- The first JOLTS request failed on series ids with one zero too many: the industry code is six
  digits and the working id has fifteen zeros after JTS.
- The bench sample first stored gaps in tenths of a percent, which turned a handful of 0.04
  filings into zeros and moved the positive share from 0.7787 to 0.7780; stored in hundredths.
- Apex turned out to be a survivor table (all 210 exits in H1 2026). Kept, and made the lesson
  of p2 rather than regenerated.

## Appendix: source-checker verdicts (run 2026-09-26, 19 claims, 37 tool uses)

| # | Claim | Verdict |
|---|---|---|
| 1 | GPG Regulations 2017 threshold, six measures, quartiles, snapshot | confirmed (SI 2017/172 read) |
| 2 | gov.uk CSV under OGL v3.0, 2024 file exists | confirmed |
| 3 | ONS ASHE 2024: 7.0 full-time, 13.1 all employees | confirmed (ONS bulletin) |
| 4, 5 | Blinder 1973 JHR 8(4) 436-455; Oaxaca 1973 IER 14(3) 693-709 | confirmed |
| 6 | Goldin 2014 AER 104(4) 1091-1119 | confirmed |
| 7 | Bertrand and Mullainathan 2004 AER 94(4) 991-1013, about 50 percent | confirmed |
| 8 | Hoffman, Kahn, Li 2018 QJE 133(2) 765-800 | confirmed, primary (full text) |
| 9 | Reuters 10 October 2018, Amazon tool | confirmed via reproduction; secondary |
| 10 | 29 CFR 1607.4(D) wording | confirmed |
| 11 | NYC LL144, 5 July 2023, bias audit, impact ratios | confirmed |
| 12 | EU AI Act Annex III point 4 | confirmed (EUR-Lex) |
| 13 | GDPR Articles 22 and 9 | confirmed |
| 14 | Kaplan and Meier 1958 JASA 53(282) 457-481 | confirmed |
| 15 | Cox 1972 JRSS B 34(2) | **pages are 187-202, not 187-220**; corrected above |
| 16 | Cronbach 1951 Psychometrika 16(3) 297-334 | confirmed |
| 17 | JOLTS definition; December 2025 quits 2.0 | confirmed (BLS release 5 February 2026) |
| 18 | Gallup 23 percent | confirmed for the 2024 edition; 21 (2025) and 20 (2026) in later editions; name the edition |
| 19a | "leave managers not companies" | no measured source; Buckingham and Coffman 1999; not claimed |
| 19b | "1.5 to 2x salary" | no measured source; SHRM's range is 50 to 200 percent; not claimed |
