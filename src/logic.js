import { TAGS, EFFORT, REQS, SECTIONS } from "./data.js";

export function allQuestions() {
    return SECTIONS.reduce(function (acc, s) { return acc.concat(s.qs); }, []);
  }
export function hasTag(o, t) { return o.tags.indexOf(t) !== -1; }
export function recIds(q) { return q.options.filter(function (o) { return hasTag(o, "rec"); }).map(function (o) { return o.id; }); }
export function idsOf(a) { return a == null ? [] : (Array.isArray(a) ? a : [a]); }
export function selectedOptions(q, a) {
    var ids = idsOf(a);
    return q.options.filter(function (o) { return ids.indexOf(o.id) !== -1; });
  }
export function isAnswered(q, a) {
    return q.multi ? idsOf(a).length >= (q.min || 1) : typeof a === "string";
  }

export function recommended() {
    var ans = {};
    allQuestions().forEach(function (q) { ans[q.id] = q.multi ? recIds(q) : recIds(q)[0]; });
    return ans;
  }

export function evaluate(ans) {
    var covered = {}, broken = {}, warnings = [], high = 0, answered = 0, matches = 0;
    var qs = allQuestions();
    qs.forEach(function (q) {
      var a = ans[q.id];
      if (isAnswered(q, a)) {
        answered++;
        var recs = recIds(q), ids = idsOf(a);
        if (recs.every(function (id) { return ids.indexOf(id) !== -1; }) && (q.multi || ids.length === 1)) matches++;
      }
      selectedOptions(q, a).forEach(function (o) {
        (o.covers || []).forEach(function (r) { covered[r] = true; });
        (o.breaks || []).forEach(function (r) { broken[r] = true; });
        if (o.warn) warnings.push({ level: hasTag(o, "no") ? "bad" : "warn", text: o.warn, qid: q.id });
        if (o.e === 3) high++;
      });
      if (q.multi && q.req) {
        var n = idsOf(a).length;
        if (n >= q.min) covered[q.req] = true;
        else if (n > 0) warnings.push({ level: "bad", text: "Modificaciones: van " + n + " de " + q.min + ".", qid: q.id });
      }
    });
    if (high >= 2) {
      warnings.push({ level: "warn", text: "Van " + high + " decisiones de esfuerzo alto: riesgo de sobreingeniería para 8 días." });
    }
    var status = {};
    REQS.forEach(function (r) { status[r.id] = broken[r.id] ? "bad" : (covered[r.id] ? "ok" : "pend"); });
    return { status: status, warnings: warnings, high: high, answered: answered, matches: matches, total: qs.length };
  }

export function plain(html) {
    return String(html).replace(/<code>(.*?)<\/code>/g, "`$1`").replace(/<[^>]+>/g, "");
  }

export function buildMarkdown(ans, date, who) {
    var ev = evaluate(ans);
    var out = [];
    out.push("# Decisiones del pipeline: proyecto final CI/CD", "");
    out.push("Integrante: " + (who || "sin nombre"), "");
    out.push("Fecha: " + date, "");
    out.push("Respondidas: " + ev.answered + " de " + ev.total + ". Coinciden con la recomendación: " + ev.matches + ". Decisiones de esfuerzo alto: " + ev.high + ".", "");
    out.push("## Mínimos del enunciado", "");
    REQS.forEach(function (r) {
      var s = ev.status[r.id];
      var note = s === "bad" ? " (NO CUMPLE con lo elegido)" : (s === "pend" ? " (sin decidir)" : "");
      out.push("- [" + (s === "ok" ? "x" : " ") + "] " + r.group + ": " + r.text + note);
    });
    out.push("");
    if (ev.warnings.length) {
      out.push("## Alertas", "");
      ev.warnings.forEach(function (w) { out.push("- " + plain(w.text)); });
      out.push("");
    }
    out.push("## Decisiones", "");
    var n = 0;
    SECTIONS.forEach(function (s, si) {
      out.push("### " + (si + 1) + ". " + s.title, "");
      s.qs.forEach(function (q) {
        n++;
        var sel = selectedOptions(q, ans[q.id]);
        out.push(n + ". " + plain(q.title));
        if (!sel.length) out.push("   Sin decidir.");
        sel.forEach(function (o) {
          out.push("   Elegida: " + plain(o.label) + (hasTag(o, "rec") ? " (recomendada)" : "") + ". Esfuerzo " + EFFORT[o.e] + ".");
        });
      });
      out.push("");
    });
    return out.join("\n");
  }

  // Revisa los datos: ids únicos, una recomendada por pregunta, requisitos existentes,
  // y que la ruta recomendada cubra todos los mínimos sin alertas.
export function selfCheck() {
    var problems = [], seen = {}, reqIds = REQS.map(function (r) { return r.id; });
    allQuestions().forEach(function (q) {
      if (seen[q.id]) problems.push("Pregunta repetida: " + q.id);
      seen[q.id] = true;
      var recs = recIds(q).length;
      if (!q.multi && recs !== 1) problems.push(q.id + ": debe tener 1 recomendada y tiene " + recs);
      if (q.multi && recs !== q.min) problems.push(q.id + ": tiene " + recs + " recomendadas y pide " + q.min);
      var optSeen = {};
      q.options.forEach(function (o) {
        if (optSeen[o.id]) problems.push(q.id + ": opción repetida " + o.id);
        optSeen[o.id] = true;
        (o.covers || []).concat(o.breaks || []).forEach(function (r) {
          if (reqIds.indexOf(r) === -1) problems.push(q.id + "/" + o.id + ": requisito desconocido " + r);
        });
        if (!EFFORT[o.e]) problems.push(q.id + "/" + o.id + ": esfuerzo inválido");
        o.tags.forEach(function (t) { if (!TAGS[t]) problems.push(q.id + "/" + o.id + ": etiqueta desconocida " + t); });
      });
    });
    var ev = evaluate(recommended());
    REQS.forEach(function (r) { if (ev.status[r.id] !== "ok") problems.push("La ruta recomendada no cubre: " + r.id); });
    if (ev.warnings.length) problems.push("La ruta recomendada genera " + ev.warnings.length + " alertas");
    if (ev.matches !== ev.total) problems.push("La ruta recomendada no coincide consigo misma");
    return problems;
  }
