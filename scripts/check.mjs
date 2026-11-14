// Revisa la consistencia de los datos. Corre en CI: falla si hay problemas.
import { selfCheck } from "../src/logic.js";
const problems = selfCheck();
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log("Datos OK");
