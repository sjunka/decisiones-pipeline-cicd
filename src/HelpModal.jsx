import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Sheet from "./Sheet.jsx";

const URL_APP = "https://sjunka.github.io/decisiones-pipeline-cicd/";
const REPO = "https://github.com/sjunka/decisiones-pipeline-cicd";

export default function HelpModal({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(URL_APP); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* sin portapapeles: queda el QR */ }
  }
  return (
    <Sheet open={open} onClose={onClose} title="Cómo funciona">
      <div className="grid gap-5 text-[16px] leading-relaxed">
        <section>
          <h3 className="mb-1 font-semibold">Qué estamos haciendo</h3>
          <p>Aquí cerramos las decisiones del pipeline CI/CD del proyecto final de SI6008: herramienta, ambientes, ramas, pruebas, rollback, las 3 modificaciones y la app. Cada pregunta trae opciones con lo que tienen a favor, en contra y el esfuerzo.</p>
        </section>
        <section>
          <h3 className="mb-1 font-semibold">Por qué necesitamos tus decisiones</h3>
          <p>Somos 3 y tenemos 8 días. Si cada uno arranca con su idea, terminamos rehaciendo el pipeline. Con las respuestas de los tres vemos de una vez en qué estamos de acuerdo y solo discutimos lo que no.</p>
        </section>
        <section>
          <h3 className="mb-1 font-semibold">Cómo responder</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Escribe tu nombre.</li>
            <li>Responde cada pregunta. La recomendada viene marcada, pero elige lo que tú harías.</li>
            <li>Toca <b>Enviar mis respuestas</b>. Si te falta alguna, te lleva a ella.</li>
            <li>Descarga o comparte el resumen y mándaselo a Sergio.</li>
          </ol>
          <p className="mt-2 text-[14px] text-muted">Las respuestas se guardan solo en tu navegador; puedes cerrar y seguir después.</p>
        </section>
        <section className="flex flex-col items-center gap-3 rounded-[18px] bg-surface-2 p-5 text-center">
          <h3 className="font-semibold">Pásalo al equipo o a tu celular</h3>
          <div className="rounded-[11px] bg-white p-3">
            <QRCodeSVG value={URL_APP} size={176} level="M" aria-label="Código QR con el enlace del formulario" />
          </div>
          <p className="text-[14px] break-all text-muted">{URL_APP}</p>
          <button type="button" onClick={copy}
            className="min-h-11 rounded-full bg-action px-5 text-[15px] text-white transition active:scale-95">
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </button>
          <span role="status" className="sr-only">{copied ? "Enlace copiado" : ""}</span>
        </section>
        <p className="text-[14px] text-muted">Código y cambios en <a className="text-primary underline" href={REPO}>GitHub</a>.</p>
      </div>
    </Sheet>
  );
}
