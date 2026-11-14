// Preguntas, opciones y mínimos del enunciado del proyecto final.
export const TAGS = { rec: "Recomendada", min: "Cumple mínimo", plus: "Suma puntos", risk: "Riesgo", no: "No cumple" };
export const EFFORT = { 1: "bajo", 2: "medio", 3: "alto" };

  // Mínimos de la diapositiva del proyecto final. Las opciones los cubren (covers) o los rompen (breaks).
export const REQS = [
    { id: "ci_base", group: "CI", text: "Checkout y build" },
    { id: "ci_static", group: "CI", text: "Test: pruebas estáticas" },
    { id: "ci_unit", group: "CI", text: "Test: unitarias y cobertura" },
    { id: "ci_release", group: "CI", text: "Release: artefacto versionado" },
    { id: "ci_gha", group: "CI", text: "Logs en GitHub Actions (evidencia)" },
    { id: "cd_iac", group: "CD", text: "IaC" },
    { id: "cd_envs", group: "CD", text: "Deploy infra y app en 2 o más ambientes" },
    { id: "cd_pre", group: "CD", text: "Tests pre-producción" },
    { id: "cd_post", group: "CD", text: "Tests post-producción (smoke)" },
    { id: "cd_rb_auto", group: "CD", text: "Rollback ante fallo de smoke tests" },
    { id: "cd_rb_manual", group: "CD", text: "Rollback manual (botón de pánico)" },
    { id: "p_components", group: "Proyecto", text: "App distinta con 2 o más componentes" },
    { id: "p_branch", group: "Proyecto", text: "Estrategia de ramas sustentada" },
    { id: "p_mods", group: "Proyecto", text: "3 o más modificaciones o introducciones" }
  ];

export const SECTIONS = [
    {
      id: "plataforma", title: "Plataforma y artefacto", qs: [
        {
          id: "ci", title: "¿Con qué herramienta orquestamos el CI/CD?",
          ctx: "La diapositiva pide: <em>Entrar al pipeline de GitHub Actions y mostrar los logs exitosos</em>.",
          options: [
            { id: "gha", label: "GitHub Actions", tags: ["rec", "min"], e: 1, covers: ["ci_base", "ci_gha"],
              pro: "Lo pide la rúbrica, se usó en los Talleres 1, 2 y 3 y el <code>ci-cd.yml</code> del Taller 3 sirve de base. Trae ambientes con aprobación, pestaña Deployments y botón Run workflow. Gratis en repo público.",
              con: "Para depurar un job hay que leer logs; no hay SSH al runner sin acciones de terceros." },
            { id: "circle", label: "CircleCI", tags: ["risk"], e: 3, covers: ["ci_base"], breaks: ["ci_gha"],
              warn: "CircleCI: la rúbrica pide mostrar los logs en GitHub Actions.",
              pro: "Botón de Rollback nativo (rollback pipeline), muy buena caché, paralelismo de pruebas y SSH para depurar.",
              con: "Reescribir todo el pipeline, cuenta y créditos aparte, nadie del equipo lo conoce y el profe revisa en otra plataforma." },
            { id: "hybrid", label: "Híbrido: CI en GitHub Actions y CD en CircleCI", tags: ["risk"], e: 3, covers: ["ci_base", "ci_gha"],
              warn: "Híbrido: dos herramientas y doble manejo de secretos. Sobreingeniería para 8 días.",
              pro: "Muestra dos herramientas.",
              con: "Doble configuración, doble manejo de secretos y más puntos de falla. No suma en la rúbrica." },
            { id: "jenkins", label: "Jenkins", tags: ["risk"], e: 3, covers: ["ci_base"], breaks: ["ci_gha"],
              warn: "Jenkins: la rúbrica pide mostrar los logs en GitHub Actions.",
              pro: "Aparece en el programa del curso y se usa mucho en empresas.",
              con: "Hay que hospedar y mantener el servidor y sus plugins (una EC2 con costo)." }
          ],
          why: "GitHub Actions gana por rúbrica, reuso y tiempo (puntaje estimado 9,4 contra 5,3 de CircleCI). CircleCI entra como una diapositiva de <em>alternativas evaluadas</em>: muestra criterio sin pagar el costo de migrar."
        },
        {
          id: "repo", title: "¿Un repositorio o uno por componente?",
          options: [
            { id: "mono", label: "Un solo repositorio con <code>web/</code>, <code>api/</code>, <code>infra/</code> y <code>tests/</code>", tags: ["rec"], e: 1,
              pro: "Un pipeline, un proyecto de SonarCloud y un PR para los cambios que tocan front y API. Se entrega un solo repo, como en el Taller 3.",
              con: "El pipeline prueba todo aunque cambie un solo componente." },
            { id: "multi", label: "Un repositorio por componente", tags: [], e: 3,
              pro: "Cada componente con su propio pipeline y su ritmo.",
              con: "Dos pipelines, dos proyectos de Sonar y versiones que coordinar. La evidencia queda repartida." }
          ],
          why: "Un repo: menos cosas que configurar y una sola historia que mostrar."
        },
        {
          id: "registry", title: "¿Dónde publicamos el artefacto (las imágenes Docker)?",
          ctx: "El artefacto se construye una vez y se promueve entre ambientes.",
          options: [
            { id: "dockerhub", label: "Docker Hub", tags: ["rec"], e: 1, covers: ["ci_release"],
              pro: "Ya está configurado desde el Taller 2 (token y variable). ECS descarga la imagen pública sin credenciales.",
              con: "Queda fuera de AWS y tiene límites de descarga anónima." },
            { id: "ecr", label: "Amazon ECR", tags: ["plus"], e: 2, covers: ["ci_release"],
              pro: "Registry nativo de AWS, escaneo al subir y permisos con IAM. Aparece en la diapositiva (ECS, ECR, ALB) y puede contar como modificación de arquitectura.",
              con: "El CI necesita las credenciales de AWS Academy, que vencen cada 4 horas, solo para publicar." },
            { id: "ghcr", label: "GitHub Container Registry", tags: [], e: 2, covers: ["ci_release"],
              pro: "Se autentica con <code>GITHUB_TOKEN</code>: cero secretos nuevos. El paquete queda junto al repo.",
              con: "No se vio en clase y hay que hacer público el paquete para que ECS lo descargue." }
          ],
          why: "Docker Hub por reuso. ECR solo si lo eligen como una de las modificaciones."
        },
        {
          id: "iac", title: "¿Con qué herramienta hacemos la IaC?",
          options: [
            { id: "terraform", label: "Terraform con estado en S3 y workspaces", tags: ["rec", "min"], e: 1, covers: ["cd_iac"],
              pro: "Es lo del Taller 3: el mismo código crea staging y producción, y ya está probado en AWS Academy.",
              con: "Hay que cuidar el estado (bucket S3 y bloqueo)." },
            { id: "cfn", label: "AWS CloudFormation", tags: [], e: 2, covers: ["cd_iac"],
              pro: "Nativo de AWS, sin estado que administrar.",
              con: "Reescribir la infraestructura del Taller 3 en un YAML largo." },
            { id: "cdk", label: "AWS CDK", tags: ["risk"], e: 3, covers: ["cd_iac"],
              warn: "CDK: su bootstrap crea roles IAM y AWS Academy no permite crear roles.",
              pro: "IaC en Python o TypeScript.",
              con: "Su bootstrap crea roles IAM, que el Learner Lab no permite." },
            { id: "console", label: "Crear todo a mano en la consola", tags: ["no"], e: 1, breaks: ["cd_iac"],
              warn: "Consola a mano: el mínimo pide IaC.",
              pro: "Rápido la primera vez.",
              con: "No cumple el mínimo y no se puede repetir igual." }
          ],
          why: "Terraform ya funciona en AWS Academy y es el diseño que el profe usó en el Taller 3."
        },
        {
          id: "compute", title: "¿Dónde corre la app?",
          options: [
            { id: "ecs", label: "ECS Fargate detrás de un ALB", tags: ["rec"], e: 1,
              pro: "Lo del Taller 3: sin servidores que administrar, con health checks, despliegue gradual y circuit breaker.",
              con: "El ALB cobra aunque no haya tráfico: hay que destruirlo al final." },
            { id: "lambda", label: "Lambda + API Gateway", tags: [], e: 3,
              pro: "Se paga por uso y aparece en la diapositiva.",
              con: "Otro tipo de artefacto (zip), el front necesita otro hosting y se pierde el reuso del Taller 3." },
            { id: "ec2", label: "EC2 con Docker", tags: [], e: 2,
              pro: "Control total de la máquina.",
              con: "Hay que administrar el servidor, y no trae despliegue gradual ni los health checks de ECS." },
            { id: "eks", label: "Kubernetes (EKS)", tags: ["risk"], e: 3,
              warn: "EKS: demasiado costo y complejidad para 8 días y el presupuesto de AWS Academy.",
              pro: "Estándar de la industria.",
              con: "Costo del plano de control y mucha complejidad para el tiempo y el presupuesto." }
          ],
          why: "ECS Fargate: reuso total del Taller 3 y se explica en una diapositiva."
        },
        {
          id: "envs", title: "¿Cuántos ambientes?",
          ctx: "Mínimo: Deploy Infra y Deploy App en 2 o más ambientes.",
          options: [
            { id: "two", label: "Staging y producción", tags: ["rec", "min"], e: 1, covers: ["cd_envs"],
              pro: "Cumple el mínimo y reusa los workspaces del Taller 3. Unos US$3 al día los dos (estimación).",
              con: "No hay ambiente de desarrollo en la nube: se desarrolla en local con Docker." },
            { id: "three", label: "Desarrollo, staging y producción", tags: [], e: 2, covers: ["cd_envs"],
              pro: "Más parecido a una empresa.",
              con: "Un tercio más de costo y de tiempo de pipeline. No suma frente al mínimo." },
            { id: "prodonly", label: "Solo producción", tags: ["no"], e: 1, breaks: ["cd_envs"],
              warn: "Un solo ambiente: el mínimo pide al menos 2.",
              pro: "Barato.",
              con: "No cumple el mínimo." },
            { id: "ephemeral", label: "Ambientes temporales por PR", tags: ["risk"], e: 3, covers: ["cd_envs"],
              warn: "Ambientes por PR: un ALB por PR y limpieza automática. Sobreingeniería.",
              pro: "Impresiona: cada PR tiene su propia URL.",
              con: "Un ALB por PR, más costo y limpieza automática." }
          ],
          why: "Dos ambientes cumplen el mínimo con el menor costo y el menor tiempo."
        }
      ]
    },
    {
      id: "versiones", title: "Ramas y versiones", qs: [
        {
          id: "branching", title: "¿Qué estrategia de ramificación usamos?",
          ctx: "Hay que sustentar por qué se escogió.",
          options: [
            { id: "tbd", label: "Trunk-based: <code>main</code> + ramas cortas <code>feature/*</code> con PR y 1 aprobación", tags: ["rec"], e: 1, covers: ["p_branch"],
              pro: "Integración constante y ya se usa con <code>proteger-main</code>. Una sola imagen se construye y se promueve a los dos ambientes.",
              con: "<code>main</code> debe estar siempre desplegable: exige buenas pruebas." },
            { id: "gitflowlite", label: "GitFlow simple: <code>develop</code> despliega a staging y <code>main</code> a producción", tags: ["risk"], e: 2, covers: ["p_branch"],
              warn: "GitFlow simple: el merge a main reconstruye la imagen y producción recibe un artefacto que no se probó en staging.",
              pro: "Fácil de explicar: cada rama es un ambiente.",
              con: "El merge a <code>main</code> genera otro commit y otra imagen. Rompe la regla de construir una vez y promover." },
            { id: "gitflow", label: "GitFlow completo (<code>develop</code>, <code>release/*</code>, <code>hotfix/*</code>)", tags: [], e: 3, covers: ["p_branch"],
              pro: "Control fuerte de releases planificados.",
              con: "Mucho proceso para 3 personas y 8 días. Retrasa la integración." }
          ],
          why: "Trunk-based encaja con lo visto en clase (artefacto inmutable que se promueve) y con el flujo del Taller 3."
        },
        {
          id: "versioning", title: "¿Cómo versionamos el artefacto?",
          options: [
            { id: "semver", label: "SHA + SemVer automático <code>1.0.N</code> (N = número de ejecución) y GitHub Release al pasar producción", tags: ["rec", "plus"], e: 2, covers: ["ci_release"],
              pro: "Trazabilidad exacta con el SHA y una versión legible en la app. Cada Release marca una versión buena: el rollback sabe a dónde volver.",
              con: "El PATCH es un número de build, no siempre un bugfix. MAJOR y MINOR se cambian a mano en un archivo <code>VERSION</code>." },
            { id: "sha", label: "Solo el SHA del commit (como el Taller 3)", tags: [], e: 1, covers: ["ci_release"],
              pro: "Lo más simple y ya funciona.",
              con: "No se lee bien en la demo y no deja una lista de versiones buenas para el rollback." },
            { id: "tags", label: "SemVer manual: un tag <code>v1.2.0</code> dispara producción", tags: [], e: 2, covers: ["ci_release"],
              pro: "Control total de qué sale a producción.",
              con: "Depende de que alguien cree el tag. Son dos flujos que explicar." },
            { id: "releaseplease", label: "Conventional Commits + release-please", tags: [], e: 3, covers: ["ci_release"],
              pro: "SemVer real, calculado desde los mensajes de commit.",
              con: "Exige disciplina en cada mensaje y una herramienta más que configurar." }
          ],
          why: "SHA para la máquina, <code>1.0.N</code> para las personas y la Release como punto de restauración."
        },
        {
          id: "events", title: "¿Qué evento dispara cada parte?",
          ctx: "La presentación pide explicar en qué rama o evento se ejecuta qué.",
          options: [
            { id: "tbdmap", label: "PR: solo CI. Push a <code>main</code>: CI, release y CD. Manual: botón de pánico.", tags: ["rec"], e: 1,
              pro: "Una tabla de tres filas. En el PR los jobs de despliegue salen omitidos, igual que en el Taller 3.",
              con: "Todo cambio en <code>main</code> pasa por staging: no hay atajo a producción." },
            { id: "branchmap", label: "PR: CI. Push a <code>develop</code>: staging. Push a <code>main</code>: producción.", tags: [], e: 2,
              pro: "Mapa rama igual a ambiente, muy visual.",
              con: "Va con GitFlow y trae el problema de reconstruir la imagen." },
            { id: "tagmap", label: "PR: CI. Push a <code>main</code>: staging. Tag <code>v*</code>: producción.", tags: [], e: 2,
              pro: "Separa con claridad la versión candidata de la release.",
              con: "Dos workflows, y producción depende de crear el tag a mano." }
          ],
          why: "Tres filas fáciles de mostrar en una diapositiva y en la pestaña Actions."
        },
        {
          id: "promotion", title: "¿Cómo pasa una versión de staging a producción?",
          options: [
            { id: "manual", label: "Aprobación manual: <em>Required reviewers</em> en el ambiente <code>production</code> (Entrega Continua)", tags: ["rec"], e: 1,
              pro: "Es lo del Taller 3. En la demo se ve el botón Review deployments y quién aprobó.",
              con: "Producción espera a una persona. Si la sesión de AWS Academy vence, hay que renovar las credenciales antes de aprobar." },
            { id: "auto", label: "Automático si staging pasa (Despliegue Continuo)", tags: [], e: 1,
              pro: "Más rápido y muestra confianza en las pruebas.",
              con: "En la demo no se controla el momento en que llega a producción." }
          ],
          why: "Con aprobación manual el equipo controla el momento de la demo y puede explicar la diferencia entre Delivery y Deployment."
        }
      ]
    },
    {
      id: "pruebas", title: "Pruebas", qs: [
        {
          id: "static", title: "¿Qué pruebas estáticas corren en CI?",
          options: [
            { id: "reuse", label: "Black, Flake8 y Pylint (API), ESLint (web) y quality gate de SonarCloud", tags: ["rec", "min"], e: 1, covers: ["ci_static"],
              pro: "Reusa el Taller 2: Sonar importa los reportes y decide con el quality gate.",
              con: "Tres herramientas de Python que hacen cosas parecidas." },
            { id: "sononly", label: "Solo SonarCloud", tags: [], e: 1, covers: ["ci_static"],
              pro: "Menos pasos.",
              con: "El aviso llega más tarde y sin reportes propios." },
            { id: "ruff", label: "Ruff (reemplaza Black, Flake8 y Pylint), ESLint y SonarCloud", tags: [], e: 2, covers: ["ci_static"],
              pro: "Una sola herramienta, muy rápida.",
              con: "Se aleja de lo visto en clase y hay que reconfigurar la importación de reportes en Sonar." }
          ],
          why: "Reuso: ya está configurado y ya se sabe sustentar."
        },
        {
          id: "coverage", title: "¿Qué umbral de cobertura exigimos?",
          options: [
            { id: "c80", label: "80% en pytest (API) y en Vitest (web), más el quality gate de Sonar", tags: ["rec", "min"], e: 2, covers: ["ci_unit"],
              pro: "El mismo criterio de los Talleres 2 y 3. El build falla antes de construir la imagen.",
              con: "En el front cuesta llegar a 80% si se mide todo: medir la lógica (porcentajes, validaciones), no el archivo de arranque." },
            { id: "c70", label: "70%", tags: [], e: 1, covers: ["ci_unit"],
              pro: "Menos presión en el front.",
              con: "Se ve más débil en la parte de robustez de las pruebas." },
            { id: "c90", label: "90%", tags: [], e: 3, covers: ["ci_unit"],
              pro: "Número alto en la diapositiva.",
              con: "Mucho tiempo en pruebas de interfaz. Cobertura alta no significa buenas pruebas." }
          ],
          why: "80% es el estándar del curso y del quality gate por defecto de Sonar."
        },
        {
          id: "dbtest", title: "¿Cómo probamos la base de datos en CI, sin AWS?",
          options: [
            { id: "moto", label: "moto: simula DynamoDB dentro de pytest", tags: ["rec"], e: 1,
              pro: "Sin contenedores ni credenciales. Las pruebas siguen siendo rápidas.",
              con: "Es una simulación: la tabla real se prueba en staging." },
            { id: "local", label: "DynamoDB Local en Docker (docker compose en el runner)", tags: [], e: 2,
              pro: "Más parecido a la realidad.",
              con: "Más lento y con más configuración." },
            { id: "real", label: "Contra la tabla real de staging desde CI", tags: ["risk"], e: 2,
              warn: "Tabla real desde CI: el CI quedaría atado a credenciales de AWS Academy que vencen cada 4 horas.",
              pro: "Lo más real.",
              con: "El CI depende de AWS y mezcla datos de prueba." }
          ],
          why: "moto mantiene el CI rápido y aislado. Staging prueba lo real."
        },
        {
          id: "preprod", title: "¿Qué pruebas corren en staging (pre-producción)?",
          options: [
            { id: "apie2e", label: "Integración de la API (pytest + requests) y aceptación E2E con Selenium", tags: ["rec", "min"], e: 2, covers: ["cd_pre"],
              pro: "La API real con DynamoDB real (crear, votar y los errores 400, 404 y 409) más el flujo completo del usuario.",
              con: "Dos suites que mantener." },
            { id: "e2eonly", label: "Solo Selenium (como el Taller 3)", tags: [], e: 1, covers: ["cd_pre"],
              pro: "Menos trabajo.",
              con: "No prueba los errores de la API." },
            { id: "playwright", label: "Playwright en vez de Selenium", tags: [], e: 2, covers: ["cd_pre"],
              pro: "Más estable y más rápido.",
              con: "Cambia la herramienta vista en clase." }
          ],
          why: "Dos niveles: el contrato de la API y la experiencia del usuario. Es lo que más suma en robustez."
        },
        {
          id: "postprod", title: "¿Qué pruebas corren en producción (post-producción)?",
          options: [
            { id: "smoke", label: "Smoke de solo lectura: la web carga y <code>/api/health</code> responde ok, con la versión esperada y la base conectada", tags: ["rec", "min"], e: 1, covers: ["cd_post"],
              pro: "Tardan segundos, no ensucian datos reales y disparan el rollback si fallan.",
              con: "No prueban cada funcionalidad (eso ya se hizo en staging)." },
            { id: "e2eprod", label: "El E2E completo también en producción", tags: ["risk"], e: 2, covers: ["cd_post"],
              warn: "E2E en producción: escribe datos reales.",
              pro: "Más cobertura en producción.",
              con: "Crea encuestas de prueba en producción y tarda más." },
            { id: "synthetic", label: "Monitoreo sintético con CloudWatch Synthetics", tags: ["risk"], e: 3,
              warn: "Monitoreo sintético: no es un paso del pipeline, no reemplaza las smoke.",
              pro: "Vigila todo el día.",
              con: "Costo y configuración, y no corre dentro del pipeline." }
          ],
          why: "Smoke de solo lectura: rápidas, seguras y suficientes para decidir si hay rollback."
        }
      ]
    },
    {
      id: "rollback", title: "Rollback", qs: [
        {
          id: "rbauto", title: "¿Qué dispara el rollback automático?",
          ctx: "Mínimo: rollback ante fallo de smoke tests y manual (botón de pánico).",
          options: [
            { id: "smokefail", label: "Falla de las smoke (o del deploy) en producción: job <code>rollback-production</code>. Además queda el circuit breaker de ECS.", tags: ["rec", "min"], e: 2, covers: ["cd_rb_auto"],
              pro: "Cumple el mínimo literal y cubre dos casos: la app no arranca (circuit breaker) y la app arranca pero responde mal (smoke).",
              con: "Hay que probarlo rompiendo una versión a propósito." },
            { id: "cbonly", label: "Solo el circuit breaker de ECS (como el Taller 3)", tags: ["no"], e: 1, breaks: ["cd_rb_auto"],
              warn: "Solo circuit breaker: el mínimo pide rollback ante fallo de smoke tests.",
              pro: "Ya viene configurado.",
              con: "Solo reacciona si la tarea no queda saludable, no si responde mal." },
            { id: "alarm", label: "Smoke + alarma de CloudWatch (errores 5xx) que también revierte", tags: ["plus"], e: 3, covers: ["cd_rb_auto"],
              pro: "También detecta fallas que aparecen después del despliegue.",
              con: "Configurar alarmas y tiempos. Difícil de mostrar en vivo." }
          ],
          why: "El job de rollback cumple el mínimo. El circuit breaker queda como segunda red."
        },
        {
          id: "rbtarget", title: "¿A qué versión vuelve el rollback?",
          options: [
            { id: "release", label: "A la última GitHub Release (solo se crea cuando producción pasó las smoke)", tags: ["rec"], e: 1,
              pro: "La lista de versiones buenas queda visible en GitHub y se ve en la demo.",
              con: "El primer despliegue no tiene a dónde volver: hay que tener 2 Releases antes de exponer." },
            { id: "prevtask", label: "A la revisión anterior de la task definition en ECS", tags: [], e: 2,
              pro: "No depende de GitHub.",
              con: "La anterior también puede ser mala, y no queda claro cuál era buena." },
            { id: "ssm", label: "A un valor <code>last-good</code> guardado en SSM Parameter Store", tags: [], e: 2,
              pro: "Queda guardado en AWS.",
              con: "Otro servicio más, con permisos de AWS Academy por verificar." }
          ],
          why: "Release igual a versión que pasó producción. Une versionamiento y rollback en una sola idea."
        },
        {
          id: "rbhow", title: "¿Cómo se ejecuta el rollback?",
          options: [
            { id: "samedeploy", label: "El mismo deploy con Terraform, pero con la imagen anterior (workflow reutilizable)", tags: ["rec"], e: 2,
              pro: "El camino de regreso es el mismo camino ya probado, y Terraform no queda desalineado con AWS.",
              con: "Tarda lo mismo que un deploy (unos minutos)." },
            { id: "updatesvc", label: "<code>aws ecs update-service</code> con la task definition anterior", tags: [], e: 1,
              pro: "Más rápido.",
              con: "Terraform queda desactualizado (drift) hasta el siguiente apply." },
            { id: "bluegreen", label: "Blue/green con CodeDeploy", tags: ["risk"], e: 3,
              warn: "Blue/green con CodeDeploy: mucho trabajo y roles que AWS Academy limita.",
              pro: "Rollback casi instantáneo cambiando el tráfico.",
              con: "Mucho más trabajo y roles que AWS Academy limita." }
          ],
          why: "Un solo camino para ir y volver: menos código y nada de drift."
        },
        {
          id: "panic", title: "¿Cómo es el botón de pánico (rollback manual)?",
          options: [
            { id: "dispatch", label: "Workflow <em>Rollback de emergencia</em> con <code>workflow_dispatch</code>: se elige ambiente y versión (por defecto, la Release anterior)", tags: ["rec", "min"], e: 1, covers: ["cd_rb_manual"],
              pro: "Botón Run workflow en GitHub. Queda registro de quién lo usó y solo lo ve quien tiene permiso de escritura.",
              con: "Hay que entrar a GitHub para usarlo." },
            { id: "appbtn", label: "Un botón dentro de la app que llama a la API de GitHub", tags: ["risk"], e: 3, covers: ["cd_rb_manual"],
              warn: "Botón en la app: tendría que guardar un token de GitHub con permisos de Actions.",
              pro: "Mucho efecto en la demo.",
              con: "Un token con permisos de Actions dentro de la app es un riesgo de seguridad." },
            { id: "localscript", label: "Un script que alguien corre desde su portátil", tags: ["no"], e: 1,
              warn: "Script local: el botón de pánico debe estar en el pipeline, con registro.",
              pro: "Rápido de hacer.",
              con: "No queda en el pipeline ni en el historial, y depende de una persona." }
          ],
          why: "<code>workflow_dispatch</code> es el botón de pánico estándar en GitHub Actions: simple, auditable y seguro."
        },
        {
          id: "rbapproval", title: "¿El rollback necesita aprobación?",
          options: [
            { id: "noapproval", label: "No: el rollback usa un ambiente aparte (<code>production-rollback</code>) sin revisores", tags: ["rec"], e: 1,
              pro: "Revertir no espera a nadie. La aprobación protege el avance, no el regreso.",
              con: "Hay que crear un ambiente más en GitHub." },
            { id: "sameapproval", label: "Sí, la misma aprobación de <code>production</code>", tags: ["risk"], e: 1,
              warn: "Rollback con aprobación: el rollback automático se quedaría esperando a una persona.",
              pro: "Más control.",
              con: "El rollback automático queda en espera y pierde el sentido." }
          ],
          why: "Es un detalle fino que pocos equipos notan y que se defiende muy bien."
        }
      ]
    },
    {
      id: "modificaciones", title: "Las 3 modificaciones", qs: [
        {
          id: "mods", title: "¿Cuáles son nuestras modificaciones o introducciones?", multi: true, min: 3, req: "p_mods",
          ctx: "Deben ir más allá de lo hecho en los Talleres 2 y 3 y dejar evidencia visible. Elijan al menos 3.",
          options: [
            { id: "devsecops", label: "DevSecOps: gitleaks (secretos) y Trivy (vulnerabilidades críticas en las imágenes)", tags: ["rec"], e: 1,
              pro: "Dos pasos, con evidencia en los logs y en la pestaña Security. Tema de la Unidad 4.",
              con: "Trivy puede bloquear por una vulnerabilidad de la imagen base: hay que actualizarla o justificarla." },
            { id: "semverrel", label: "SemVer automático y GitHub Releases como puntos de restauración", tags: ["rec"], e: 2,
              pro: "Une versionamiento y rollback, y la versión se ve en la app.",
              con: "Pide permiso <code>contents: write</code> solo en ese job." },
            { id: "notify", label: "Avisos a Discord o Slack al desplegar, al fallar y en el rollback", tags: ["rec"], e: 1,
              pro: "Un paso por evento. En la demo suena el celular cuando ocurre el rollback.",
              con: "Un secreto más (la URL del webhook)." },
            { id: "k6", label: "Prueba de carga con k6 en staging (umbral de p95)", tags: ["plus"], e: 2,
              pro: "Suma robustez a las pruebas pre-producción. Buena reserva si el profe no acepta alguna.",
              con: "Hay que elegir umbrales realistas para una tarea Fargate pequeña." },
            { id: "reusable", label: "Workflow reutilizable de despliegue (<code>workflow_call</code>)", tags: ["plus"], e: 2,
              pro: "Staging, producción y los dos rollbacks usan el mismo código.",
              con: "Se nota menos en la demo: se explica con el diagrama." },
            { id: "ecrmod", label: "Amazon ECR en lugar de Docker Hub (arquitectura)", tags: [], e: 2,
              pro: "Registry de la nube con escaneo al subir.",
              con: "El CI necesita credenciales de AWS que vencen cada 4 horas." },
            { id: "cloudwatch", label: "Dashboard y alarma de CloudWatch con Terraform (observabilidad)", tags: [], e: 2,
              pro: "Tema de la Unidad 3 y se ve bien en la arquitectura.",
              con: "Más recursos de Terraform y permisos por verificar." },
            { id: "cache", label: "Caché de dependencias y de capas Docker, midiendo el tiempo antes y después", tags: [], e: 1,
              pro: "Mejora un número real: los minutos del pipeline.",
              con: "Se nota poco si el pipeline ya es rápido." },
            { id: "zap", label: "DAST con OWASP ZAP baseline contra staging", tags: [], e: 1,
              pro: "Prueba de seguridad con la app corriendo.",
              con: "Reporta muchas alertas menores que hay que filtrar." },
            { id: "bluegreenmod", label: "Blue/green con CodeDeploy", tags: ["risk"], e: 3,
              pro: "Despliegue sin riesgo y rollback instantáneo.",
              con: "El cambio más caro de la lista." }
          ],
          why: "Las tres recomendadas cuestan poco, dejan evidencia clara y tocan seguridad, versionamiento y visibilidad. Si sobra tiempo, k6 como cuarta de reserva."
        },
        {
          id: "channel", title: "Si hay avisos, ¿por dónde llegan?",
          options: [
            { id: "discord", label: "Discord (webhook)", tags: ["rec"], e: 1,
              pro: "Se crea en un minuto, es gratis y llega al celular.",
              con: "Menos de empresa que Slack o Teams." },
            { id: "slack", label: "Slack (incoming webhook)", tags: [], e: 1,
              pro: "Herramienta de empresa. El ejemplo de clase usa <code>slack-github-action</code>.",
              con: "Crear el workspace y la app de Slack toma unos minutos más." },
            { id: "teams", label: "Teams (Workflows)", tags: ["risk"], e: 2,
              warn: "Teams: el tenant de EAFIT puede no permitir los webhooks.",
              pro: "Es el canal del curso.",
              con: "Los webhooks clásicos de Teams se están reemplazando por Workflows de Power Automate, y el tenant puede no permitirlos." },
            { id: "email", label: "Correo", tags: [], e: 1,
              pro: "GitHub ya avisa los fallos por correo.",
              con: "No se nota en la demo." }
          ],
          why: "Discord es lo más rápido de montar y se puede mostrar en vivo."
        }
      ]
    },
    {
      id: "app", title: "La app", qs: [
        {
          id: "app", title: "¿Qué app construimos? (puntaje estimado sobre 10)",
          ctx: "Criterios: ajuste a la rúbrica 30%, efecto en la demo 25%, facilidad para vibe-codear y probar 25%, riesgo y costo en AWS Academy 20%.",
          options: [
            { id: "poll", label: "Votación en vivo con QR · 8,8", tags: ["rec"], e: 2,
              pro: "El público vota desde el celular y los resultados se mueven en el proyector. Reglas claras para probar: voto único, encuesta cerrada, porcentajes.",
              con: "Los resultados se refrescan cada 2 segundos (sin websockets) para no complicar." },
            { id: "shortener", label: "Acortador de URLs con QR y estadísticas · 8,0", tags: [], e: 1,
              pro: "Muy fácil de probar y de desplegar.",
              con: "Poco efecto en la demo." },
            { id: "trivia", label: "Trivia en vivo con ranking · 7,6", tags: [], e: 3,
              pro: "Mucho efecto: el público compite.",
              con: "Rondas, tiempos y puntajes: más estado y más pruebas." },
            { id: "booking", label: "Reservas de salas o turnos · 7,2", tags: [], e: 2,
              pro: "Reglas de negocio claras (no cruzar horarios).",
              con: "Se ve como un CRUD más." },
            { id: "dashboard", label: "Panel de releases y artefactos (la idea inicial) · 6,8", tags: [], e: 2,
              pro: "Encaja con el tema del curso: muestra versiones, ambientes y reportes.",
              con: "Depende de la API de GitHub, necesita un token y es difícil de probar sin simulaciones." },
            { id: "rn", label: "App React Native nativa · 4,3", tags: ["risk"], e: 3,
              warn: "React Native nativo: su CD no encaja con ECS/Terraform y el público no puede instalarla en la demo.",
              pro: "Se ve como app de celular.",
              con: "Su CD es distribución (tiendas o Expo EAS), no ECS. iPhone exige cuenta de Apple. Las pruebas E2E móviles son pesadas." }
          ],
          why: "La votación en vivo mete al público en la demo y tiene lógica suficiente para pruebas serias. La idea del panel de artefactos entra como una sección <em>Acerca de esta versión</em> dentro de la app: versión, commit, ambiente y enlaces al run y a la Release."
        },
        {
          id: "front", title: "¿Con qué hacemos el front?",
          options: [
            { id: "reactweb", label: "React + Vite, web pensada para celular", tags: ["rec"], e: 1,
              pro: "Se abre desde el QR en cualquier celular, Android o iPhone, sin instalar nada. Vitest y ESLint para las pruebas.",
              con: "No es una app de tienda." },
            { id: "expoweb", label: "Expo (React Native) exportado a web", tags: [], e: 3,
              pro: "Un solo código para web y celular.",
              con: "Más herramientas, build más lento y pruebas más complejas." },
            { id: "rnnative", label: "React Native nativo (APK)", tags: ["risk"], e: 3,
              warn: "Front nativo: en iPhone no se puede sin cuenta de Apple y el público no la puede instalar en la demo.",
              pro: "App real de celular.",
              con: "iPhone no se puede sin cuenta de Apple, el público no la puede instalar y el despliegue no encaja con ECS." },
            { id: "plainhtml", label: "HTML y JS simples servidos por la API", tags: [], e: 1,
              pro: "Lo más simple.",
              con: "Se ve menos como app y diluye los 2 componentes." }
          ],
          why: "Web pensada para celular: todo el salón participa desde el QR."
        },
        {
          id: "api", title: "¿Con qué hacemos la API?",
          options: [
            { id: "python", label: "Python (FastAPI o Flask)", tags: ["rec"], e: 1,
              pro: "Reusa pytest, cobertura, Black, Flake8, Pylint, SonarCloud y moto. FastAPI valida los datos y genera <code>/docs</code> solo.",
              con: "Quedan dos lenguajes en el repo (Python y JavaScript)." },
            { id: "node", label: "Node (Express)", tags: [], e: 2,
              pro: "Un solo lenguaje con el front.",
              con: "Rehacer las herramientas de calidad que ya funcionan en Python." },
            { id: "otherlang", label: "Otro lenguaje (Go, Java)", tags: ["risk"], e: 3,
              pro: "Variedad.",
              con: "Curva de aprendizaje en 8 días." }
          ],
          why: "Python: todo el CI de los talleres se reusa tal cual."
        },
        {
          id: "data", title: "¿Dónde guardamos los datos?",
          options: [
            { id: "dynamo", label: "DynamoDB bajo demanda, creada con Terraform", tags: ["rec"], e: 1,
              pro: "Casi gratis, sin servidores ni contraseñas, y se crea en segundos. Contadores atómicos para los votos.",
              con: "Hay que confirmar el primer día que <code>LabRole</code> puede leer y escribir la tabla." },
            { id: "rds", label: "RDS PostgreSQL", tags: [], e: 3,
              pro: "SQL conocido.",
              con: "Tarda varios minutos en crearse por ambiente, cuesta más y trae contraseñas que manejar." },
            { id: "memory", label: "En memoria o SQLite dentro del contenedor", tags: ["risk"], e: 1,
              warn: "Datos en memoria: cada deploy o rollback borraría los votos.",
              pro: "Cero infraestructura.",
              con: "Cada deploy o rollback borra los datos, y con 2 tareas cada una tendría datos distintos." }
          ],
          why: "DynamoDB es un componente real con casi cero operación."
        },
        {
          id: "deploycomp", title: "¿Cómo desplegamos los componentes?",
          ctx: "Mínimo: complejidad media, al menos dos componentes.",
          options: [
            { id: "twosvc", label: "Dos servicios ECS (web y api) detrás del mismo ALB, con la regla <code>/api/*</code>", tags: ["rec"], e: 2, covers: ["p_components"],
              pro: "Dos componentes claros, una sola URL por ambiente y sin CORS. El diagrama de arquitectura se explica solo.",
              con: "Dos imágenes, dos servicios y un target group más en Terraform." },
            { id: "onecontainer", label: "Un solo contenedor: la API sirve el front", tags: ["risk"], e: 1, covers: ["p_components"],
              warn: "Un solo contenedor: el profe puede verlo como un solo componente.",
              pro: "Igual al Taller 3, menos trabajo.",
              con: "Se ve como un solo componente, más la base de datos." },
            { id: "s3front", label: "Front en S3 y API en ECS", tags: [], e: 2, covers: ["p_components"],
              pro: "Hosting barato para el front.",
              con: "CORS, permisos públicos de S3 en AWS Academy y un rollback distinto para el front." }
          ],
          why: "Dos servicios detrás de un ALB: lo justo para que la complejidad media sea evidente."
        }
      ]
    },
    {
      id: "demo", title: "Demo", qs: [
        {
          id: "demo", title: "¿Cómo mostramos el rollback en la presentación?",
          options: [
            { id: "mix", label: "Video del rollback automático + botón de pánico en vivo, lanzado al inicio de la demo", tags: ["rec"], e: 1,
              pro: "Si AWS o la red fallan, el video salva la demo. El rollback manual tarda unos minutos: mientras corre, se explican las pruebas.",
              con: "Hay que grabar el video el día antes." },
            { id: "alllive", label: "Todo en vivo", tags: ["risk"], e: 1,
              warn: "Todo en vivo: sin plan B si AWS o la red fallan.",
              pro: "Máximo efecto.",
              con: "El pipeline completo tarda varios minutos y no hay plan B." },
            { id: "screens", label: "Solo capturas", tags: [], e: 1,
              pro: "Cero riesgo.",
              con: "Pierde el efecto, y la diapositiva pide mostrar la app funcionando en cada ambiente." }
          ],
          why: "En vivo lo que se controla, grabado lo que tarda o depende de la suerte."
        }
      ]
    }
  ];
