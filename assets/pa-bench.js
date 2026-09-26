/* pa-bench.js - the pay gap bench UI. Renders into #pa-bench on deep-dive session 10.
 * Every number shown is computed by pa-live.js on 3,000 real UK filings the moment a control
 * changes; nothing is stored. Reads window.PA (pa-live.js) and window.PA_SAMPLE. */
(function () {
  "use strict";
  var rootEl, S, L, state, els = {};

  var RUNGS = [
    { id: "pyramid", name: "1 · The pyramid", note: "Median female share of each pay band, bottom to top. The shape almost every employer files.", stage: "bars" },
    { id: "fit", name: "2 · Fit the ladder", note: "Search for the band pay ladder that best explains the reported mean gaps from composition alone. Computed live on the rows below.", stage: "scatter" },
    { id: "decomp", name: "3 · Composition vs reported", note: "Under the ladder fitted on all 11,301 filings: what the pyramid alone would report, against what was reported.", stage: "scatter" },
    { id: "anti", name: "Hire more women", anti: true, note: "The anti-lever. Add women equal to 10 percent of headcount to the median employer, and read the reported gap by WHERE they land.", stage: "anti" }
  ];

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function f1(x) { return (x >= 0 ? "+" : "") + x.toFixed(1); }
  function f2(x) { return x.toFixed(2); }
  function pct(x) { return (x * 100).toFixed(1) + "%"; }

  function rowsNow() { return L.rows(S, { size: state.size === "all" ? null : parseInt(state.size, 10) }); }

  function render() {
    var R = state.broken ? state.brokenR : rowsNow();
    var st = L.stats(R), dec = L.decompose(R, S.ladder), fit = null;
    if (state.rung === "fit") { fit = state.fitCache[state.size + ":" + (state.broken ? "b" : "r")] || (state.fitCache[state.size + ":" + (state.broken ? "b" : "r")] = L.fitLadder(R)); }
    var anti = { base: L.gapOf(st.bandMedian, S.ladder), bottom: L.addWomen(st.bandMedian, 0, 0.1, S.ladder), top: L.addWomen(st.bandMedian, 3, 0.1, S.ladder) };
    var v;
    if (state.broken) v = { cls: "is-bad", text: "Bands shuffled inside every employer: composition now explains R2 " + f2(dec.r2) + " of the reported gaps, worse than guessing the mean. The pyramid only explains anything when it is the right way up." };
    else if (state.rung === "pyramid") v = { cls: "is-ok", text: "Median employer: women are " + pct(st.bandMedian[0]) + " of the bottom band and " + pct(st.bandMedian[3]) + " of the top. " + pct(st.bottomOverTop) + " of employers have more women at the bottom than at the top." };
    else if (state.rung === "fit") v = { cls: "is-good", text: "Best ladder on these rows: " + fit.L.join(" / ") + ". Composition alone explains R2 " + f2(fit.r2) + " (correlation " + f2(fit.corr) + ") of the reported mean gaps." };
    else if (state.rung === "decomp") v = { cls: "is-good", text: "Composition-only gap median " + f1(dec.compMedian) + " against a reported median of " + f1(st.medianOfMean) + ". " + pct(dec.belowShare) + " of employers report LESS than their pyramid alone would." };
    else v = { cls: "is-bad", text: "Same 10 percent of headcount in women: at the bottom band the reported gap goes " + f1(anti.base) + " to " + f1(anti.bottom) + "; at the top band it goes to " + f1(anti.top) + ". The question is never how many, it is where." };
    els.verdict.className = "mb-verdict " + v.cls; els.verdict.textContent = v.text;

    setMetric("n", st.n.toLocaleString() + " employers", state.size === "all" ? "2024 filings in the sample" : S.sizes[parseInt(state.size, 10)] + " employees", "measured");
    setMetric("median", st.medianOfMedian.toFixed(1) + "%", "median of reported median gaps", "measured");
    setMetric("pos", pct(st.posShare), "report men paid more", "measured");
    setMetric("ladder", (fit ? fit.L : S.ladder).join(" / "), fit ? "ladder fitted on these rows" : "ladder fitted on all 11,301 filings", "measured");
    setMetric("r2", f2(fit ? fit.r2 : dec.r2), "R2, composition alone vs reported", "measured");
    setMetric("anti", f1(state.rung === "anti" ? anti.bottom : anti.base) + "%", state.rung === "anti" ? "median employer, women added at the bottom" : "median employer, composition-only gap", "heuristic");
    els.compare.textContent = state.rung === "anti"
      ? "Add the same women at the top band instead and the median employer would report " + f1(anti.top) + "%. Modelled under the fitted ladder and equal pay within a band."
      : "Reported gaps are what employers filed; composition-only gaps are modelled under the fitted ladder with equal pay inside every band.";
    drawStage(R, st, dec, fit, anti);
  }

  function setMetric(id, value, label, kind) {
    var m = els.metrics[id]; m.value.textContent = value; m.label.textContent = label;
    m.kind.textContent = kind === "measured" ? "computed" : "modelled"; m.kind.className = "mb-mkind " + (kind === "measured" ? "is-measured" : "is-heuristic");
  }

  function drawStage(R, st, dec, fit, anti) {
    var W = 880, H = 300, s = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="';
    var mode = RUNGS.filter(function (r) { return r.id === state.rung; })[0].stage;
    if (state.broken) mode = "scatter";
    if (mode === "bars") {
      s += 'Four bars, the median female share of each pay band from bottom to top.">';
      var names = ["bottom band", "lower middle", "upper middle", "top band"];
      for (var q = 0; q < 4; q++) {
        var x = 90 + q * 200, h = st.bandMedian[q] * 380, y = 250 - h;
        s += '<rect x="' + x + '" y="' + y.toFixed(1) + '" width="120" height="' + h.toFixed(1) + '" rx="6" fill="' + (q === 0 ? "#7A2334" : "#E6C7CD") + '"/>';
        s += '<text x="' + (x + 60) + '" y="' + (y - 10).toFixed(1) + '" text-anchor="middle" class="mb-lab" fill="#4F1521" font-weight="800">' + pct(st.bandMedian[q]) + ' women</text>';
        s += '<text x="' + (x + 60) + '" y="272" text-anchor="middle" class="mb-lab" fill="#6B5459">' + names[q] + '</text>';
      }
      s += '<line x1="60" y1="250" x2="' + (W - 20) + '" y2="250" stroke="#DCC9CD" stroke-width="1.5"/>';
      s += '<line x1="60" y1="60" x2="' + (W - 20) + '" y2="60" stroke="#EADDE0" stroke-dasharray="4 4"/><text x="' + (W - 24) + '" y="56" text-anchor="end" class="mb-lab" fill="#6B5459">50 percent</text>';
    } else if (mode === "anti") {
      s += 'Three bars: the median employer\'s composition-only gap, the gap after adding women at the bottom band, and after adding them at the top band.">';
      var vals = [anti.base, anti.bottom, anti.top], labs = ["as filed", "women added at the bottom", "women added at the top"], cols = ["#9A3A4C", "#991B1B", "#3D6B2E"];
      var zero = 170, scale = 6;
      s += '<line x1="60" y1="' + zero + '" x2="' + (W - 20) + '" y2="' + zero + '" stroke="#2A1A1E" stroke-width="1.5"/>';
      for (var i = 0; i < 3; i++) {
        var bx = 120 + i * 250, bh = Math.abs(vals[i]) * scale, by = vals[i] >= 0 ? zero - bh : zero;
        s += '<rect x="' + bx + '" y="' + by.toFixed(1) + '" width="140" height="' + bh.toFixed(1) + '" rx="6" fill="' + cols[i] + '"/>';
        s += '<text x="' + (bx + 70) + '" y="' + (vals[i] >= 0 ? by - 10 : by + bh + 18).toFixed(1) + '" text-anchor="middle" class="mb-lab" fill="#2A1A1E" font-weight="800">' + f1(vals[i]) + '% gap</text>';
        s += '<text x="' + (bx + 70) + '" y="276" text-anchor="middle" class="mb-lab" fill="#6B5459">' + labs[i] + '</text>';
      }
      s += '<text x="64" y="' + (zero - 6) + '" class="mb-lab" fill="#6B5459">0</text>';
    } else {
      s += 'Scatter of composition-only gap against reported mean gap for every employer in the rows, with the line where they would be equal. R2 ' + f2(fit ? fit.r2 : dec.r2) + '.">';
      var Lc = fit ? fit.L : S.ladder, g = L.compGaps(R, Lc), padL = 60, padR = 20, padT = 24, padB = 44;
      var xmin = -40, xmax = 60, ymin = -40, ymax = 80;
      var sx = function (v) { return padL + (Math.max(xmin, Math.min(xmax, v)) - xmin) / (xmax - xmin) * (W - padL - padR); };
      var sy = function (v) { return H - padB - (Math.max(ymin, Math.min(ymax, v)) - ymin) / (ymax - ymin) * (H - padT - padB); };
      s += '<line x1="' + padL + '" y1="' + (H - padB) + '" x2="' + (W - padR) + '" y2="' + (H - padB) + '" stroke="#DCC9CD" stroke-width="1.5"/><line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (H - padB) + '" stroke="#DCC9CD" stroke-width="1.5"/>';
      s += '<line x1="' + sx(-40) + '" y1="' + sy(-40) + '" x2="' + sx(60) + '" y2="' + sy(60) + '" stroke="' + (state.broken ? "#991B1B" : "#3D6B2E") + '" stroke-width="2.5" stroke-dasharray="6 4"/>';
      for (var k = 0; k < g.length; k++) s += '<circle cx="' + sx(g[k]).toFixed(1) + '" cy="' + sy(R.mean[k]).toFixed(1) + '" r="2.2" fill="#7A2334" fill-opacity="0.3"/>';
      s += '<text x="' + (W - padR) + '" y="' + (H - 14) + '" text-anchor="end" class="mb-lab" fill="#6B5459">composition-only gap, percent (ladder ' + Lc.join("/") + ')</text>';
      s += '<text x="' + (padL + 6) + '" y="' + (padT + 4) + '" class="mb-lab" fill="#6B5459">reported mean gap, percent</text>';
      s += '<text x="' + (padL + 6) + '" y="' + (H - padB - 10) + '" class="mb-lab" fill="' + (state.broken ? "#991B1B" : "#2B4D20") + '" font-weight="800">R2 ' + f2(fit ? fit.r2 : dec.r2) + ' · ' + g.length.toLocaleString() + ' employers · dashed line: equal</text>';
    }
    s += "</svg>"; els.stage.innerHTML = s;
  }

  function breakIt() {
    if (state.broken) { state.broken = false; els.breakBtn.textContent = "Break it: shuffle the bands inside every employer"; render(); return; }
    state.brokenR = L.shuffleBands(rowsNow(), Math.floor(Math.random() * 1e9)); state.broken = true;
    state.rung = "decomp"; syncRungs();
    els.breakBtn.textContent = "Put the bands back"; render();
  }
  function syncRungs() { els.rungInputs.forEach(function (inp) { inp.checked = inp.value === state.rung; inp.parentNode.classList.toggle("is-on", inp.checked); }); }

  function build() {
    rootEl.innerHTML = "";
    var wrap = el("div", "mb-wrap");
    wrap.appendChild(el("h4", null, "The pay gap bench, on 3,000 real employers"));
    wrap.appendChild(el("p", "mb-intro", "Pick a rung. The bench recomputes from the 2024 filings of 3,000 UK employers sampled from the gov.uk gender pay gap service. Filter by employer size, then press the anti-lever, then the break button."));
    var presets = el("div", "mb-presets"); els.rungInputs = [];
    RUNGS.forEach(function (r) {
      var lab = el("label", "mb-preset" + (r.anti ? " is-anti" : "")); var inp = document.createElement("input"); inp.type = "radio"; inp.name = "pa-rung"; inp.value = r.id; lab.appendChild(inp);
      var name = el("span", "mb-pname", r.name); lab.appendChild(name); if (r.anti) name.appendChild(el("em", "mb-anti", " · anti-lever"));
      lab.appendChild(el("span", "mb-pnote", r.note));
      inp.addEventListener("change", function () { state.rung = r.id; if (state.broken) { state.broken = false; els.breakBtn.textContent = "Break it: shuffle the bands inside every employer"; } syncRungs(); render(); });
      presets.appendChild(lab); els.rungInputs.push(inp);
    });
    wrap.appendChild(presets);
    var ctls = el("div", "mb-ctls");
    var sel = document.createElement("select"); sel.id = "pa-size"; var o = document.createElement("option"); o.value = "all"; o.textContent = "All employer sizes"; sel.appendChild(o);
    S.sizes.forEach(function (name, i) { var n = 0; for (var k = 0; k < S.size.length; k++) if (S.size[k] === i) n++; if (n >= 30) { var op = document.createElement("option"); op.value = String(i); op.textContent = name + " employees (" + n + ")"; sel.appendChild(op); } });
    sel.addEventListener("change", function () { state.size = sel.value; if (state.broken) { state.broken = false; els.breakBtn.textContent = "Break it: shuffle the bands inside every employer"; } render(); });
    var selLab = el("label", "mb-ctl", "Employer size "); selLab.appendChild(sel); ctls.appendChild(selLab);
    els.breakBtn = el("button", "mb-break", "Break it: shuffle the bands inside every employer"); els.breakBtn.type = "button"; els.breakBtn.addEventListener("click", breakIt); ctls.appendChild(els.breakBtn);
    wrap.appendChild(ctls);
    els.verdict = el("div", "mb-verdict is-ok", ""); wrap.appendChild(els.verdict);
    var metrics = el("div", "mb-metrics"); els.metrics = {};
    ["n", "median", "pos", "ladder", "r2", "anti"].forEach(function (id) { var m = el("div", "mb-metric"); var label = el("span", "mb-mlabel", ""); var value = el("span", "mb-mvalue", ""); var kind = el("span", "mb-mkind", ""); m.appendChild(value); m.appendChild(label); m.appendChild(kind); metrics.appendChild(m); els.metrics[id] = { value: value, label: label, kind: kind }; });
    wrap.appendChild(metrics);
    els.compare = el("p", "mb-hint", ""); wrap.appendChild(els.compare);
    els.stage = el("div", "mb-stage"); wrap.appendChild(els.stage);
    rootEl.appendChild(wrap);
  }

  function init() {
    rootEl = document.getElementById("pa-bench");
    if (!rootEl || !window.PA || !window.PA_SAMPLE) return;
    S = window.PA_SAMPLE; L = window.PA;
    state = { rung: "pyramid", size: "all", broken: false, fitCache: {} };
    build(); syncRungs(); render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
