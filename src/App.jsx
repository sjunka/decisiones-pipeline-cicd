import { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, useFormikContext } from "formik";
import { SECTIONS } from "./data.js";
import { allQuestions, isAnswered, evaluate, recommended, buildMarkdown } from "./logic.js";
import Question from "./Question.jsx";
import Panel from "./Panel.jsx";
import Sheet from "./Sheet.jsx";
import HelpModal from "./HelpModal.jsx";

const STORE_KEY = "pf-cicd-decisiones-v1";
const QS = allQuestions();
const NUM = Object.fromEntries(QS.map((q, i) => [q.id, i + 1]));

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || null; } catch { return null; }
}
function save(v) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch { /* sin almacenamiento: la página sigue funcionando */ }
}

// Formik solo vigila que no quede nada sin responder.
function validate(values) {
  const errors = {};
  if (!values.who.trim()) errors.who = "Escribe tu nombre.";
  const missing = {};
  QS.forEach((q) => { if (!isAnswered(q, values.answers[q.id])) missing[q.id] = "Falta responder"; });
  if (Object.keys(missing).length) errors.answers = missing;
  return errors;
}

function today() { return new Date().toLocaleDateString("es-CO"); }
function fileName(who) {
  const slug = who.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `decisiones-${slug || "sin-nombre"}.md`;
}

function jump(qid) {
  const el = document.getElementById(qid === "who" ? "who" : `q-${qid}`);
  if (!el) return;
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  if (qid === "who") setTimeout(() => el.focus({ preventScroll: true }), 300);
}

function Persist() {
  const { values } = useFormikContext();
  useEffect(() => save(values), [values]);
  return null;
}

// Si el envío falla, lleva a la primera pregunta pendiente.
function ScrollToFirstError() {
  const { submitCount, isValid, errors } = useFormikContext();
  const last = useRef(0);
  useEffect(() => {
    if (submitCount === last.current) return;
    last.current = submitCount;
    if (isValid) return;
    const first = errors.who ? "who" : QS.find((q) => errors.answers?.[q.id])?.id;
    if (first) setTimeout(() => jump(first), 320);
  }, [submitCount, isValid, errors]);
  return null;
}

function Done({ open, onClose, values }) {
  const [msg, setMsg] = useState("");
  const md = useMemo(() => buildMarkdown(values.answers, today(), values.who.trim()), [values]);
  const name = fileName(values.who.trim());
  function say(m) { setMsg(m); setTimeout(() => setMsg((x) => (x === m ? "" : x)), 3500); }
  function download() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    say(`Descargado ${name}.`);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(md); say("Resumen copiado."); } catch { say("No se pudo copiar. Usa Descargar."); }
  }
  async function share() {
    const file = new File([md], name, { type: "text/markdown" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: name });
      else await navigator.share({ title: name, text: md });
    } catch { /* el usuario canceló */ }
  }
  const btn = "min-h-12 rounded-full px-6 text-[17px] transition active:scale-[.98]";
  return (
    <Sheet open={open} onClose={onClose} title="¡Listo!">
      <p className="mb-4 text-[16px]">Respondiste todo. Envíale el resumen a Sergio por el medio que prefieras.</p>
      <div className="grid gap-2.5">
        {typeof navigator !== "undefined" && navigator.share && (
          <button type="button" onClick={share} className={`${btn} bg-action text-white`}>Compartir (WhatsApp, correo…)</button>
        )}
        <button type="button" onClick={download} className={`${btn} ${navigator.share ? "border border-hairline text-primary" : "bg-action text-white"}`}>Descargar {name}</button>
        <button type="button" onClick={copy} className={`${btn} border border-hairline text-primary`}>Copiar como texto</button>
      </div>
      <p role="status" className="mt-3 min-h-6 text-center text-[15px] text-ok">{msg}</p>
    </Sheet>
  );
}

// Único botón de enviar: fijo abajo en celular y en la columna fija en escritorio.
export function SendButton({ onClick, ready, compact }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex min-h-12 flex-none items-center justify-center gap-2 rounded-full bg-action px-6 text-[17px] font-semibold text-white transition hover:opacity-90 active:scale-[.98] ${compact ? "" : "w-full"} ${ready ? "ring-4 ring-ok/40" : ""}`}>
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l16-8-6 16-2.5-6.5z" /></svg>
      {compact ? "Enviar" : "Enviar mis respuestas"}
    </button>
  );
}

function Page({ done, setDone }) {
  const { values, setValues, setFieldValue, submitCount, errors, submitForm } = useFormikContext();
  const [help, setHelp] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [armed, setArmed] = useState(false);
  const ev = useMemo(() => evaluate(values.answers), [values.answers]);
  const missing = QS.filter((q) => !isAnswered(q, values.answers[q.id])).map((q) => ({ q, n: NUM[q.id] }));
  const showErr = submitCount > 0;

  function onPicked(qid) {
    const i = QS.findIndex((q) => q.id === qid);
    const next = QS.slice(i + 1).find((q) => !isAnswered(q, values.answers[q.id]));
    if (next) setTimeout(() => jump(next.id), 260);
  }
  function jumpFromSheet(qid) { setSheet(false); setTimeout(() => jump(qid), 50); }
  function send() { setSheet(false); submitForm(); }
  function reset() {
    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 4000); return; }
    setArmed(false);
    setValues({ ...values, answers: {} });
  }

  const pct = (100 * ev.answered) / ev.total;
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-hairline bg-frost backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[52px] max-w-[1200px] items-center justify-between gap-3 px-4">
          <p className="truncate font-display text-[17px] font-semibold">Decisiones CI/CD</p>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-surface-2 px-3 py-1 text-[14px] font-semibold tracking-normal tabular-nums" aria-label={`${ev.answered} de ${ev.total} respondidas`}>
              {ev.answered}/{ev.total}
            </span>
            <button type="button" onClick={() => setHelp(true)} aria-label="Ayuda: qué es esto y cómo compartirlo"
              className="grid size-11 place-items-center rounded-full text-primary transition hover:bg-primary-weak active:scale-95">
              <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9.5" /><path d="M9.5 9.3a2.6 2.6 0 015 .9c0 1.7-2.5 2.3-2.5 3.8" /><circle cx="12" cy="17.2" r=".6" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
        <div className="h-[3px] bg-transparent" aria-hidden="true">
          <div className={`h-full transition-[width] duration-500 ${pct === 100 ? "bg-ok" : "bg-primary"}`} style={{ width: `${pct}%` }} />
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-4 pt-10 pb-6">
        <p className="mb-2 text-[14px] font-semibold text-muted">Proyecto final · SI6008 · EAFIT</p>
        <h1 className="mb-3 font-display text-[40px] leading-[1.07] font-semibold tracking-[-0.28px] sm:text-[56px]">Decisiones del pipeline.</h1>
        <p className="mb-6 max-w-[62ch] text-[19px] leading-snug text-muted">
          {ev.total} preguntas para cerrar en equipo cómo será el CI/CD.{" "}
          <button type="button" onClick={() => setHelp(true)} className="text-primary hover:underline">Por qué y cómo ›</button>
        </p>
        <div className="mb-5 max-w-sm">
          <label htmlFor="who" className="mb-1.5 block text-[15px] font-semibold">Tu nombre</label>
          <input id="who" type="text" autoComplete="name" placeholder="Ej: Sergio Junca" value={values.who}
            onChange={(e) => setFieldValue("who", e.target.value)} aria-invalid={showErr && !!errors.who} aria-describedby="who-err"
            className={`h-12 w-full rounded-[11px] border bg-surface px-3.5 text-[17px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 ${showErr && errors.who ? "border-bad" : "border-hairline"}`} />
          <p id="who-err" className="mt-1 min-h-5 text-[14px] text-bad">{showErr && errors.who}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" onClick={() => setFieldValue("answers", recommended())}
            className="min-h-11 rounded-full bg-action px-5 text-[15px] text-white transition hover:opacity-90 active:scale-95">Llenar con las recomendadas</button>
          <button type="button" onClick={reset}
            className={`min-h-11 rounded-full border px-5 text-[15px] transition active:scale-95 ${armed ? "border-bad bg-bad-weak text-bad" : "border-hairline text-primary"}`}>
            {armed ? "Toca otra vez para borrar" : "Reiniciar"}
          </button>
        </div>
        <nav aria-label="Secciones" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {SECTIONS.map((s, si) => {
            const d = s.qs.filter((q) => isAnswered(q, values.answers[q.id])).length;
            const full = d === s.qs.length;
            return (
              <a key={s.id} href={`#sec-${s.id}`}
                className={`flex min-h-11 flex-none items-center gap-2 rounded-full border px-4 text-[14px] whitespace-nowrap transition ${full ? "border-ok bg-ok-weak text-ok" : "border-hairline bg-surface text-ink"}`}>
                {si + 1}. {s.title} <span className="tabular-nums opacity-70">{d}/{s.qs.length}</span>
              </a>
            );
          })}
        </nav>
      </section>

      <div className="mx-auto grid max-w-[1200px] items-start gap-6 px-4 pb-32 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-16">
        <Form noValidate>
          {SECTIONS.map((s, si) => (
            <section key={s.id} id={`sec-${s.id}`} className="mb-6">
              <h2 className="mb-3 font-display text-[28px] font-semibold tracking-[.2px]">{si + 1}. {s.title}</h2>
              {s.qs.map((q) => (
                <Question key={q.id} q={q} n={NUM[q.id]} missing={showErr && !!errors.answers?.[q.id]} onPicked={onPicked} />
              ))}
            </section>
          ))}
        </Form>

        <aside className="hidden lg:sticky lg:top-[68px] lg:block lg:max-h-[calc(100dvh-84px)] lg:overflow-y-auto lg:overscroll-contain" aria-label="Estado">
          <Panel ev={ev} missing={missing} onJump={jump} onSend={send} />
        </aside>
      </div>

      {/* Celular: barra fija que acompaña al bajar y abre el estado completo. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-frost pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 lg:hidden">
        <div className="mx-auto flex min-h-[68px] w-full max-w-[1200px] items-center gap-3 px-4">
          <button type="button" onClick={() => setSheet(true)} className="flex min-h-12 min-w-0 flex-1 items-center gap-2 text-left" aria-label="Ver estado del formulario">
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">
                Mínimos {Object.values(ev.status).filter((s) => s === "ok").length}/{Object.keys(ev.status).length}
                {ev.warnings.length > 0 && <span className="ml-2 rounded-full bg-warn-weak px-2 py-0.5 text-[13px] text-warn">{ev.warnings.length} alerta{ev.warnings.length > 1 ? "s" : ""}</span>}
              </span>
              <span className="block text-[13px] text-primary">{missing.length ? `Te faltan ${missing.length} · ver estado ›` : "Todo respondido · ver estado ›"}</span>
            </span>
          </button>
          <SendButton onClick={send} ready={!missing.length} compact />
        </div>
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Estado">
        <Panel ev={ev} missing={missing} onJump={jumpFromSheet} />
      </Sheet>
      <HelpModal open={help} onClose={() => setHelp(false)} />
      <Done open={done} onClose={() => setDone(false)} values={values} />
      <Persist />
      <ScrollToFirstError />
    </>
  );
}

export default function App() {
  const [done, setDone] = useState(false);
  const init = load() || {};
  const initialValues = { who: init.who || "", answers: init.answers || {} };
  return (
    <Formik initialValues={initialValues} validate={validate} validateOnBlur={false} onSubmit={() => setDone(true)}>
      <Page done={done} setDone={setDone} />
    </Formik>
  );
}
