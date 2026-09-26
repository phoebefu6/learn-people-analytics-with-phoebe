# Agent brief - shared by every fan-out page of learn-people-analytics-with-phoebe

Internal build document. Not linked from any audience-facing page.

You are writing ONE static HTML session page. No servers, no npm. Write the file, return its path
and one line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page for YOUR track. Copy its structure, classes, SVG grammar and quiz markup EXACTLY:
   - Foundations track (a-pages, no code, worksheets in the build-along):
     `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-people-analytics-with-phoebe/courses/a1-headcount-and-flows.html`
   - Data and AI deep-dive track (p-pages, Python code in the build-along):
     `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-people-analytics-with-phoebe/courses/p1-the-people-data-model.html`
2. The source map, which holds every verified number, its evidence tier, the per-session
   coverage table and the seams. Use ONLY numbers from it. Never invent a statistic. If a fact is
   not in the map, teach the uncertainty instead:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-people-analytics-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-people-analytics-with-phoebe/assets/style.css`

## Page skeleton (from the template, keep every component)

toolbar (crumb EXACTLY "Foundations session N of 6" or "Deep-dive session N of 10", #toggle-all,
#zoom-toggle) · masthead (eyebrow "Learn People Analytics with Phoebe · Foundations session N of 6" or
"... · Deep-dive session N of 10", h1 with one `<span class="accent">`, .sub, .chip-row with the
level chip (`🟢 Foundations` on a-pages, `🟡 Core` on p-pages, `🔴 Bench night` on p10 which is
not yours), .agenda a1-a4) · main.wrap · section#intro (Part 0: kicker, .lede, .legend pills,
.callout.win "★ What you walk out with tonight") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
hand-drawn figure, `details.card` accordions (summary with `.mode.live` or `.mode.self`, title,
`.mini`, `.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" somewhere
on the page · section#demo-1 Build-along (kicker with `.tag.demo "★ 22 min · everyone builds"`
on p-pages or "★ 22 min · everyone works it through" on a-pages, .lede, ONE figure,
`.steps > .step` each with a `.prompt-box.good` carrying a `span.label`; on a-pages the box holds
a plain-text worksheet, on p-pages Python) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"` with `p.qtext`, FOUR `button.qopt` "A · ...",
`p.qwhy`; one `p.quiz-score` after the last) · section#official Sources covered, h2 EXACTLY
"What this session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ /
light ◐ + name + note), then the `.mono` line EXACTLY: "Every fact on this page, and its
verification tier, is recorded in the course's source map." · section.cheat#cheatsheet (h3
"Foundations session N cheat sheet <span>· pin this</span>" or "Deep-dive session N cheat sheet
...", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" ·
footer.pagefoot (prev/next chain) · `<script src="../assets/app.js?v=1">`.

Head: the social meta block as in the template with this page's own title/description/url,
`<title>Foundations session N · [name] - learn people analytics with phoebe</title>` (or Deep-dive),
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other card is. Sentence case headings.
Warm practitioner voice, concrete, never dry. Escape `&` as `&amp;`, `<` as `&lt;` and `>` as
`&gt;` inside prompt-boxes. 450 to 650 lines: guidance about depth, never a target to minify
toward. Never collapse whitespace, never dissolve a list into a paragraph, never drop a
component to fit.

## HARD RULES (a violation is rework)

- NEVER an em dash or en dash anywhere, in prose, code, aria-labels or comments. Hyphen only.
- No meta or course-instruction text. Never "this course", "in this course", "the course
  teaches", "banned here". State the professional norm directly, as domain knowledge with its
  reason. The two estate-standard phrases above ("What this session teaches..." heading and the
  `.mono` line) are the ONLY allowed self-references. "Foundations session 2", "deep-dive
  session 5" cross-references are fine and encouraged.
- Attribution is "by Phoebe Fu". Never "built with", never a tool name as author.
- Every number on the page comes from the source map or is explicitly labelled constructed.
  Code boxes may print real Olist numbers ONLY where the map states them; for constructed data,
  print "your numbers will differ" rather than invented outputs.
- Where the evidence is contested or missing, teach the disagreement. Do not resolve what the
  literature has not resolved. p7 in particular makes NO claim about total employment.
- Every citation uses the exact form in the map's appendix (year, journal, volume, verdict).
  Anything the appendix marks secondary is "reported" on the page. The two folk claims
  ("people leave managers", "replacing someone costs 1.5 to 2x salary") are NOT stated as facts.
- NEVER a sex, race or age statistic about any real named employer beyond what its own public
  filing states; the sample rows carry employer names only as data, and no page names one as
  good or bad. The Apex company and every person in it are constructed; say so.
- The four-fifths rule and the screening simulator belong to the live AI + HR course: teach
  adverse impact as one metric in one card and link, never a second simulator.
- Colours in figures: ONLY these hexes, nothing else, including no invented greys:
  `#7A2334` wine · `#4F1521` wine-deep · `#9A3A4C` wine-mid · `#E6C7CD` wine-soft ·
  `#F9EEF0` wine-50 · `#2A1A1E` ink · `#6B5459` muted · `#DCC9CD` faint · `#EADDE0` hairline ·
  `#3D6B2E` moss · `#2B4D20` moss-ink · `#E9F1E4` moss-50 · `#FFFFFF` white ·
  `#991B1B` `#FEF2F2` `#FCA5A5` universal reds (only for a wrong-way panel).
- NEVER the word "lottery" or "lotteries". Say what happens: "decided by row order",
  "arbitrary", "a random draw". Phoebe's rule for every course, 2026-09-24.
- Chinese terms: default to the English word. When the Chinese is genuinely the name, write
  `中文 (English)` with the translation in brackets after it, on EVERY occurrence. Grep
  `[一-鿿]` before you finish; the gate does not check this. Phoebe's rule, 2026-09-24.
- Do not use the word "session" in a kicker klabel other than as "Part N · covers ...".
- Titles and widget ids must not collide with sibling courses: do not use `id="econ-bench"`,
  `id="rfm-bench"`, or title anything "The funnel, and what a ratio is a ratio of" (Ecommerce
  Metrics owns it), "Fairness in practice" or "Screening simulator" (AI + HR owns them).

## The hand-drawn figure grammar (every figure, no exceptions)

Study the four figures in your template and reproduce the register. Each figure:

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns=... role="img" aria-label="describes
  the data, not the shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom -
  one-line takeaway</figcaption>`. Never widen past 880; grow H.
- `<defs>` holds THREE things with a prefix unique to this figure. Foundations page aN uses
  `sNa`, `sNb`, `sNc`, `sNd` (a2: `s2a`...); deep-dive page pN uses `dNa`... (p3: `d3a`...; p10:
  `d10a`...): a wobble filter `id="s2aSk"` (`feTurbulence type="fractalNoise" baseFrequency="0.02"
  numOctaves="2" seed="<any int>"` + `feDisplacementMap scale="2.4" xChannelSelector="R"
  yChannelSelector="G"`, with `x="-3%" y="-3%" width="106%" height="106%"`), a hachure pattern
  `id="s2aHc"` (7x7 userSpaceOnUse, rotate(-38), one wine `#7A2334` line, opacity .5), and an open
  arrowhead marker `id="s2aAr"` (path `M1 1 L9 5 L1 9`, fill none, ink stroke 1.6).
- ALL shapes (rects, circles, paths, arrows) go inside ONE `<g filter="url(#s2aSk)" fill="none"
  stroke="#2A1A1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`. Rects carry a
  tiny rotation (`transform="rotate(-0.6 cx cy)"`, between -4 and 4 degrees for "hand-placed"
  items, under 1 degree for panels). Fills: white, `#F9EEF0`, the hachure `url(#s2aHc)` for "the
  pile" or "the data", and solid `#3D6B2E` or `#E9F1E4` with a moss stroke ONLY for the one
  thing the figure is about. One doodle anchor per figure (a person, an org chart, a door with
  people going in and out, a ladder of four rungs, a survey sheet, a clock, a funnel, a pair of
  scales, a magnifier, a calendar): simple
  strokes, never a mascot.
- ALL `<text>` sits OUTSIDE the filtered group, in the sans stack, using classes like the
  template's (`.s2aH` 800 12px ink heading · `.s2aL` 600 12px ink label · `.s2aS` 400 11px muted
  · `.s2aB` 800 11px moss-ink · `.s2aV` 800 16-20px wine-deep value · `.s2aW` 800 12px white on
  a wine or moss fill · `.s2aA` 700 11px wine axis caption · `.s2aN` 400 12px muted bottom note).
  Never below 10.5px.
- Text must fit its box AND the viewBox. Budget 7px per character at 12px (6.4 at 11px): a 150px
  box holds about 18 characters, 240px about 33, a full-width note line under 110. Labels beside a
  corner or a dot: keep 40px between neighbouring labels. When in doubt, shorten. Text over a
  rect's edge, or two labels within 12px vertically at the same x, is a gate failure.
- Bottom note at least 22px below the last content row, H clears it by 8px.
- Floor: one figure per Part plus one in the build-along, so 4 per page. Illustrate the
  MECHANISM (which curve moved, what a fixed effect removes, where the break-even sits, which
  bidder wins and pays what), never a metaphor literally and never decoration.

## Voice and honesty

Real world callouts sell the concept; every Part gets at least one story grounded in the map's
cases. Where a case is constructed (Apex, every named employee, every survey response) say
"constructed" or "invented" on the page. Where a figure is from a filing or a paper, name it in
the form the map gives and say "reported" if its tier is secondary. Never state a causal reading
of a pay gap, an attrition "cost", or a national benchmark that is not in the map.

## Cross-links (absolute URLs, audience-facing)

- AI + HR (four-fifths, screening simulator, legal map): https://phoebefu6.github.io/learn-ai-hr-with-phoebe/
- Performance Management: https://phoebefu6.github.io/learn-performance-management-with-phoebe/
- OKRs and Fair Measurement: https://phoebefu6.github.io/learn-okr-with-phoebe/
- Customer Retention (cohorts, survival on customers): https://phoebefu6.github.io/learn-customer-retention-with-phoebe/
- Experimentation: https://phoebefu6.github.io/learn-experimentation-with-phoebe/
- Causal Inference: https://phoebefu6.github.io/learn-causal-inference-with-phoebe/
- Data Governance: https://phoebefu6.github.io/learn-data-governance-with-phoebe/
- GDPR: https://phoebefu6.github.io/learn-gdpr-with-phoebe/  ·  PDPA: https://phoebefu6.github.io/learn-pdpa-dnc-with-phoebe/
- AI Governance and the EU AI Act: https://phoebefu6.github.io/learn-ai-governance-with-phoebe/
- Statistics: https://phoebefu6.github.io/learn-statistics-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chains

Foundations: a1-headcount-and-flows.html → a2-attrition-needs-a-base.html → a3-the-hiring-funnel.html
→ a4-pay-gaps-and-fairness.html → a5-surveys-as-evidence.html → a6-the-people-dashboard.html
Footer left: "Foundations session N of 6 · learn-people-analytics-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "← Prev: <title>" and "Next: <title> →" (a6: "← Prev" and "Course home").

Deep-dive: p1-the-people-data-model.html → p2-attrition-survival.html → p3-regretted-and-benchmarked.html
→ p4-funnel-maths.html → p5-pay-gap-decomposition.html → p6-pay-equity-regression.html →
p7-survey-psychometrics.html → p8-workforce-planning.html → p9-ai-on-people-data.html → p10-the-pay-gap-bench.html
Footer left: "Deep-dive session N of 10 · learn-people-analytics-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href=...>Learn with Phoebe ↗</a>"
Footer right: "← Prev: <title>" and "Next: <title> →".

Session titles (use exactly, sentence case in h1 with one accent span):
a1 Headcount is a stock, attrition is a flow · a2 An attrition rate needs a base · a3 The hiring funnel ·
a4 Pay, gaps and fairness · a5 Surveys as evidence · a6 The people dashboard ·
p1 The people data model · p2 Attrition as survival · p3 Regretted, and benchmarked ·
p4 Funnel maths and adverse impact · p5 Pay gap decomposition on 11,301 employers ·
p6 Pay equity regression · p7 Survey psychometrics · p8 Workforce planning ·
p9 AI on people data, and what the law forbids · p10 The pay gap bench, and defending a number
