# Decisiones del pipeline CI/CD

Formulario para que el equipo cierre las decisiones del proyecto final de SI6008 (EAFIT): herramienta de CI/CD, ambientes, ramas, pruebas, rollback, modificaciones y app.

Abrir: https://sjunka.github.io/decisiones-pipeline-cicd/

## Cómo se usa

1. Escribe tu nombre y responde las 28 preguntas.
2. Toca "Enviar mis respuestas". Si falta alguna, el formulario te lleva a ella.
3. Comparte o descarga el resumen `.md` y mándaselo a Sergio.

## Desarrollo

```bash
npm install
npm run dev     # local
npm run check   # revisa que los datos sean consistentes
npm run build
```

Cada push a `main` corre `.github/workflows/pages.yml`: revisa los datos, construye y publica en GitHub Pages.

Stack: React + Vite, Tailwind, Formik (solo para validar que no quede nada sin responder) y `qrcode.react`.

Las preguntas están en `src/data.js` y la lógica (mínimos, alertas, resumen) en `src/logic.js`.
