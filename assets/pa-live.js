/* pa-live.js - the pay gap composition engine, computed in the browser on real UK filings.
 *
 * Reads window.PA_SAMPLE (assets/pa-sample.js): 3,000 employers from the 2024 gender pay gap
 * filings, each with its reported median and mean hourly gap and the female share of its four
 * pay quartiles. Every number the bench shows is computed here from those rows.
 * Node check (must agree with materials/build-paygap.py's SAMPLE lines):
 *   node -e 'global.window={};require("./pa-sample.js");const L=require("./pa-live.js");
 *            console.log(JSON.stringify(L.summary(window.PA_SAMPLE),null,1))'
 */
(function (root) {
  "use strict";

  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }); var n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function corr(a, b) {
    var ma = mean(a), mb = mean(b), sab = 0, saa = 0, sbb = 0;
    for (var i = 0; i < a.length; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) * (a[i] - ma); sbb += (b[i] - mb) * (b[i] - mb); }
    return sab / Math.sqrt(saa * sbb);
  }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  /* ---------- rows ---------- */
  function rows(S, opt) {
    opt = opt || {};
    var out = { F: [], med: [], mean: [], size: [], idx: [] };
    for (var i = 0; i < S.n; i++) {
      if (opt.size !== undefined && opt.size !== null && S.size[i] !== opt.size) continue;
      out.F.push([S.f1[i] / 10000, S.f2[i] / 10000, S.f3[i] / 10000, S.f4[i] / 10000]);
      out.med.push(S.med[i] / 100); out.mean.push(S.mean[i] / 100); out.size.push(S.size[i]); out.idx.push(i);
    }
    return out;
  }

  /* composition-only mean gap for one employer under ladder L (band weights w default equal) */
  function gapOf(f, L, w) {
    var nf = 0, df = 0, nm = 0, dm = 0;
    for (var q = 0; q < 4; q++) {
      var wq = w ? w[q] : 1, m = 1 - f[q];
      nf += f[q] * wq * L[q]; df += f[q] * wq; nm += m * wq * L[q]; dm += m * wq;
    }
    return (1 - (nf / df) / (nm / dm)) * 100;
  }
  function compGaps(R, L) { var g = new Array(R.F.length); for (var i = 0; i < R.F.length; i++) g[i] = gapOf(R.F[i], L); return g; }
  function r2(g, y) { var my = mean(y), sse = 0, sst = 0; for (var i = 0; i < y.length; i++) { sse += (g[i] - y[i]) * (g[i] - y[i]); sst += (y[i] - my) * (y[i] - my); } return 1 - sse / sst; }

  /* grid search for the ladder that best explains the reported mean gaps: same grid as the build script */
  function fitLadder(R, y) {
    y = y || R.mean;
    var best = null, l2, l3, l4;
    for (l2 = 1.05; l2 <= 1.605; l2 += 0.05) for (l3 = l2 + 0.05; l3 <= 2.605; l3 += 0.05) for (l4 = l3 + 0.05; l4 <= 5.005; l4 += 0.05) {
      var L = [1, l2, l3, l4], sse = 0;
      for (var i = 0; i < R.F.length; i++) { var d = gapOf(R.F[i], L) - y[i]; sse += d * d; }
      if (!best || sse < best.sse) best = { sse: sse, L: [1, +l2.toFixed(2), +l3.toFixed(2), +l4.toFixed(2)] };
    }
    var g = compGaps(R, best.L);
    return { L: best.L, r2: r2(g, y), corr: corr(g, y) };
  }

  function decompose(R, L) {
    var g = compGaps(R, L), res = [], below = 0;
    for (var i = 0; i < g.length; i++) { res.push(R.mean[i] - g[i]); if (R.mean[i] < g[i]) below++; }
    return { comp: g, resid: res, compMedian: median(g), residMedian: median(res), belowShare: below / g.length, r2: r2(g, R.mean), corr: corr(g, R.mean) };
  }

  function stats(R) {
    var band = [[], [], [], []], bt = 0, pos = 0, zero = 0;
    for (var i = 0; i < R.F.length; i++) { for (var q = 0; q < 4; q++) band[q].push(R.F[i][q]); if (R.F[i][0] > R.F[i][3]) bt++; if (R.med[i] > 0) pos++; if (R.med[i] === 0) zero++; }
    return { n: R.F.length, medianOfMedian: median(R.med), meanOfMedian: mean(R.med), medianOfMean: median(R.mean), posShare: pos / R.F.length, zeroShare: zero / R.F.length,
             bandMedian: band.map(median), bottomOverTop: bt / R.F.length };
  }

  /* the anti-lever: add women equal to `share` of headcount into band `q` of a profile, before the quartiles are re-cut */
  function addWomen(f, q, share, L) {
    var f2 = f.slice(), w = [1, 1, 1, 1], k = share * 4;   /* share of headcount = share x 4 of one band */
    f2[q] = (f[q] + k) / (1 + k); w[q] = 1 + k;
    return gapOf(f2, L, w);
  }

  /* placebo: shuffle each employer's four band shares, so the pyramid is destroyed but the shares are kept */
  function shuffleBands(R, seed) {
    var rand = rng(seed || 20240405), out = { F: [], med: R.med, mean: R.mean, size: R.size, idx: R.idx };
    for (var i = 0; i < R.F.length; i++) {
      var f = R.F[i].slice();
      for (var k = 3; k > 0; k--) { var j = Math.floor(rand() * (k + 1)); var t = f[k]; f[k] = f[j]; f[j] = t; }
      out.F.push(f);
    }
    return out;
  }
  function placebo(R, L, draws, seed) {
    var rs = [], rand = rng(seed || 20240405);
    for (var d = 0; d < (draws || 100); d++) { var Rp = shuffleBands(R, Math.floor(rand() * 1e9)); rs.push(r2(compGaps(Rp, L), R.mean)); }
    var m = mean(rs), s = 0, mx = -Infinity; for (var i = 0; i < rs.length; i++) { s += (rs[i] - m) * (rs[i] - m); if (rs[i] > mx) mx = rs[i]; }
    return { mean: m, sd: Math.sqrt(s / rs.length), max: mx, draws: rs.length };
  }

  function summary(S) {
    var R = rows(S), st = stats(R), fit = fitLadder(R), dec = decompose(R, S.ladder);
    return { stats: st, sampleLadder: fit, underFullLadder: { L: S.ladder, r2: dec.r2, corr: dec.corr, compMedian: dec.compMedian, residMedian: dec.residMedian, belowShare: dec.belowShare },
             antiLever: { base: gapOf(st.bandMedian, S.ladder), bottom: addWomen(st.bandMedian, 0, 0.1, S.ladder), top: addWomen(st.bandMedian, 3, 0.1, S.ladder) } };
  }

  var api = { rows: rows, gapOf: gapOf, compGaps: compGaps, fitLadder: fitLadder, decompose: decompose, stats: stats, addWomen: addWomen, shuffleBands: shuffleBands, placebo: placebo, summary: summary, median: median, mean: mean, corr: corr, r2: r2, rng: rng };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.PA = api;
})(typeof window !== "undefined" ? window : this);
