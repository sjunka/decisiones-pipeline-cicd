import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base = nombre del repo, para que funcione en GitHub Pages.
export default defineConfig({ base: "/decisiones-pipeline-cicd/", plugins: [react(), tailwindcss()] });
