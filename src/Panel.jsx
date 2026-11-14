import { REQS } from "./data.js";

function Ring({ value, total }) {
  const r = 26, c = 2 * Math.PI * r, pct = total ? value / total : 0;
  const color = pct === 1 ? "var(--c-ok)" : "var(--c-primary)";
  return (
    <svg viewBox="0 0 64 64" className="size-16 flex-none -rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--c-surface-2)" strokeWidth="7" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset .5s ease, stroke .3s" }} />
    </svg>
  );
}

const ST = {
  ok: { cls: "bg-ok-weak text-ok", icon: "✓", sr: "cubierto" },
  bad: { cls: "bg-bad-weak text-bad", icon: "✗", sr: "no cumple" },
  pend: { cls: "bg-surface-2 text-muted", icon: "·", sr: "sin decidir" },
};

function Card({ title, aside, children }) {
  return (
    <section className="rounded-[18px] border border-hairline bg-surface p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Estado del formulario: va en la columna fija (escritorio) y en la hoja inferior (celular).
export default function Panel({ ev, missing, onJump, onSend }) {
  const okCount = REQS.filter((r) => ev.status[r.id] === "ok").length;
  const groups = [...new Set(REQS.map((r) => r.group))];
  return (
    <div className="grid gap-3">
      <section className="flex items-center gap-4 rounded-[18px] border border-hairline bg-surface p-4">
        <div className="relative">
          <Ring value={ev.answered} total={ev.total} />
          <span className="absolute inset-0 grid place-items-center text-[14px] font-semibold tracking-normal">
            {Math.round((100 * ev.answered) / ev.total)}%
          </span>
        </div>
        <div className="min-w-0">
          <p className="font-display text-[21px] leading-tight font-semibold">{ev.answered} de {ev.total} respondidas</p>
          <p className="text-[14px] text-muted">
            {ev.matches} como la recomendada · {ev.high} de esfuerzo alto
          </p>
        </div>
      </section>

      {missing.length > 0 && (
        <Card title={`Te faltan ${missing.length}`} aside={<span className="text-[13px] text-muted">toca para ir</span>}>
          <div className="flex flex-wrap gap-1.5">
            {missing.map(({ q, n }) => (
              <button key={q.id} type="button" onClick={() => onJump(q.id)} title={q.title.replace(/<[^>]+>/g, "")}
                className="grid h-11 min-w-11 place-items-center rounded-full bg-surface-2 px-3 text-[15px] font-semibold tracking-normal text-primary transition hover:bg-primary-weak active:scale-95">
                {n}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card title="Mínimos del enunciado"
        aside={<span className={`rounded-full px-2.5 py-1 text-[13px] font-semibold tracking-normal ${okCount === REQS.length ? "bg-ok-weak text-ok" : "bg-surface-2 text-muted"}`}>{okCount}/{REQS.length}</span>}>
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-ok transition-[width] duration-500" style={{ width: `${(100 * okCount) / REQS.length}%` }} />
        </div>
        {groups.map((g) => (
          <div key={g} className="mb-2 last:mb-0">
            <p className="mb-1 text-[12px] font-semibold tracking-[.06em] text-muted uppercase">{g}</p>
            <ul className="grid gap-1">
              {REQS.filter((r) => r.group === g).map((r) => {
                const s = ST[ev.status[r.id]];
                return (
                  <li key={r.id} className="flex items-start gap-2 text-[15px] leading-snug">
                    <span aria-hidden="true" className={`grid size-5 flex-none place-items-center rounded-md text-[12px] font-bold ${s.cls}`}>{s.icon}</span>
                    <span className={ev.status[r.id] === "bad" ? "text-bad" : ""}>{r.text}<span className="sr-only"> ({s.sr})</span></span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Card>

      <Card title="Alertas" aside={ev.warnings.length > 0 && <span className="rounded-full bg-warn-weak px-2.5 py-1 text-[13px] font-semibold tracking-normal text-warn">{ev.warnings.length}</span>}>
        {ev.warnings.length === 0 ? (
          <p className="text-[15px] text-muted">Sin alertas con lo elegido.</p>
        ) : (
          <ul className="grid gap-2">
            {ev.warnings.map((w, i) => (
              <li key={i} className={`rounded-[11px] border-l-4 px-3 py-2 text-[15px] leading-snug ${w.level === "bad" ? "border-bad bg-bad-weak" : "border-warn bg-warn-weak"}`}>
                <span dangerouslySetInnerHTML={{ __html: w.text }} />
                {w.qid && (
                  <button type="button" onClick={() => onJump(w.qid)} className="ml-1 min-h-11 font-semibold text-primary">Ir a la pregunta</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <button type="button" onClick={onSend}
        className="min-h-12 rounded-full bg-action px-6 text-[17px] font-medium text-white transition hover:opacity-90 active:scale-[.98]">
        Enviar mis respuestas
      </button>
    </div>
  );
}
