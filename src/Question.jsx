import { useFormikContext } from "formik";
import { TAGS, EFFORT } from "./data.js";
import { idsOf, isAnswered } from "./logic.js";

const TAG_CLS = {
  rec: "text-ok bg-ok-weak",
  min: "text-primary bg-primary-weak",
  plus: "text-plus bg-plus-weak",
  risk: "text-warn bg-warn-weak",
  no: "text-bad bg-bad-weak",
};

function Tag({ cls, children }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] leading-none font-semibold tracking-normal ${cls}`}>{children}</span>;
}

export default function Question({ q, n, missing, onPicked }) {
  const { values, setFieldValue } = useFormikContext();
  const a = values.answers[q.id];
  const ids = idsOf(a);
  const done = isAnswered(q, a);

  function pick(id, checked) {
    if (q.multi) {
      const next = ids.filter((x) => x !== id);
      if (checked) next.push(id);
      setFieldValue(`answers.${q.id}`, next);
    } else {
      setFieldValue(`answers.${q.id}`, id);
      onPicked(q.id);
    }
  }

  return (
    <fieldset id={`q-${q.id}`}
      className={`mb-4 min-w-0 rounded-[18px] border bg-surface p-5 transition-colors ${missing ? "border-bad ring-2 ring-bad/30" : "border-hairline"}`}>
      <legend className="float-left mb-2 flex w-full items-start gap-3">
        <span aria-hidden="true"
          className={`grid size-8 flex-none place-items-center rounded-full text-[14px] font-semibold tracking-normal transition-colors ${done ? "bg-ok text-surface" : "bg-surface-2 text-muted"}`}>
          {done ? <svg viewBox="0 0 24 24" className="pop size-4"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : n}
        </span>
        <span className="font-display text-[19px] leading-snug font-semibold" dangerouslySetInnerHTML={{ __html: `<span class="sr-only">${n}. </span>${q.title}` }} />
      </legend>
      <div className="clear-both">
        {missing && <p role="alert" className="mb-3 rounded-lg bg-bad-weak px-3 py-2 text-[15px] font-semibold text-bad">Falta responder esta pregunta.</p>}
        {q.ctx && <p className="mb-3 text-[15px] text-muted" dangerouslySetInnerHTML={{ __html: q.ctx }} />}
        {q.multi && (
          <p className="mb-3 text-[15px] font-semibold text-primary">Seleccionadas: {ids.length} (mínimo {q.min})</p>
        )}
        <div className="grid gap-2.5">
          {q.options.map((o) => {
            const on = ids.includes(o.id);
            return (
              <label key={o.id}
                className={`flex cursor-pointer gap-3 rounded-[11px] border p-3.5 transition active:scale-[.99] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${on ? "border-primary bg-primary-weak ring-1 ring-primary" : "border-hairline hover:border-muted"}`}>
                <input type={q.multi ? "checkbox" : "radio"} name={`q-${q.id}`} value={o.id} checked={on}
                  onChange={(e) => pick(o.id, e.target.checked)}
                  className="mt-1 size-5 flex-none accent-[var(--c-primary)] focus-visible:outline-none" />
                <span className="min-w-0">
                  <span className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="font-semibold" dangerouslySetInnerHTML={{ __html: o.label }} />
                    {o.tags.map((t) => <Tag key={t} cls={TAG_CLS[t]}>{TAGS[t]}</Tag>)}
                    <Tag cls="text-muted bg-surface-2">Esfuerzo {EFFORT[o.e]}</Tag>
                  </span>
                  <span className="block text-[15px] leading-normal"><b className="font-semibold text-muted">A favor: </b><span dangerouslySetInnerHTML={{ __html: o.pro }} /></span>
                  <span className="mt-0.5 block text-[15px] leading-normal"><b className="font-semibold text-muted">En contra: </b><span dangerouslySetInnerHTML={{ __html: o.con }} /></span>
                </span>
              </label>
            );
          })}
        </div>
        <details className="mt-3 text-[15px]">
          <summary className="cursor-pointer py-2 font-semibold text-primary">Por qué la recomendada</summary>
          <p className="mt-1" dangerouslySetInnerHTML={{ __html: q.why }} />
        </details>
      </div>
    </fieldset>
  );
}
