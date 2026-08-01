---
name: visual-craft-review
description: Revisa UI de alta fidelidad o código de frontend (HTML/CSS/React) contra las 12 reglas de craft visual que distinguen un diseño con intención de uno genérico — gradientes sin decidir, glow en vez de jerarquía real, transition:all, monotonía visual, texto placeholder, z-index descontrolado, negro/blanco puro, espaciado sin escala, exceso de tamaños tipográficos, mezcla de bordes y sombras, estados de componente incompletos, y animaciones que no respetan física ni accesibilidad de movimiento. Úsala cuando el usuario pida una revisión de "craft visual", diga que algo "se ve genérico" o pida "que se vea menos genérico/más pulido", pida feedback de código de frontend o de una UI terminada/casi terminada, o mencione específicamente gradientes, sombras, z-index, estados de hover/focus, o consistencia visual de un componente. NO la actives para wireframes, flujos tempranos, o conceptos en boceto — ahí el craft visual todavía no es la prioridad; para eso usa la auditoría de heurísticas de Nielsen en su lugar.
---

# Revisión de craft visual (12 reglas)

Evalúa UI terminada o casi terminada (alta fidelidad o código de producción) contra 12 reglas concretas que distinguen un diseño con intención de uno que se ve "hecho por defecto".

## Cuándo usar esta skill

- El usuario pide explícitamente una revisión de craft visual.
- El usuario dice que algo "se ve genérico" o pide ayuda para que se vea "menos genérico" / "más pulido".
- El usuario pide feedback sobre código de frontend (HTML/CSS/React) o una UI de alta fidelidad ya construida.
- El usuario menciona específicamente alguno de los elementos cubiertos: gradientes, sombras/glow, z-index, estados de hover/focus/disabled, espaciado, tipografía, animaciones.

**No la uses para:** wireframes, flujos de bajo detalle, o conceptos tempranos donde la estructura y el flujo importan más que el pulido visual — en esos casos usa `nielsen-heuristics-audit` en su lugar. Si el input mezcla ambas cosas (ej. un prototipo con partes de alta fidelidad y partes esquemáticas), evalúa craft solo en las partes terminadas y dilo explícitamente.

## Proceso

### 1. Reunir el input

El input puede ser:
- **Código de frontend (HTML/CSS/React)**: el más completo — revisa el código directamente (`view` o leyendo el archivo) para verificar reglas que no son detectables a simple vista (transition:all, z-index arbitrario, ausencia de :hover/:focus-visible/:disabled, prefers-reduced-motion).
- **Capturas de pantalla o imágenes de alta fidelidad**: solo permite evaluar lo visualmente detectable.

Identifica desde el inicio qué reglas se pueden verificar con certeza según el input disponible. No asumas que una regla no visible (como `transition: all` o estados `:focus-visible`) está bien resuelta solo porque no se ve mal en una captura estática.

### 2. Cargar la referencia de las 12 reglas

Antes de evaluar, consulta `references/12-reglas-craft.md`. Contiene cada una de las 12 reglas con qué buscar, por qué importa, y valores de reemplazo concretos — úsalos como base para dar recomendaciones específicas, no vagas.

### 3. Evaluar

Recorre la UI/código contra las 12 reglas. Reporta **solo las que se violan** — no listes las 12 si varias están bien resueltas; eso es ruido, no ayuda.

Para cada violación encontrada:
- Identifica la regla específica que se rompe (por número y nombre).
- Señala dónde ocurre (selector CSS, componente, o zona específica de la pantalla).
- Da el valor de reemplazo concreto según la guía de referencia (ej. una duración de transición específica, una escala de espaciado, un color de neutro tintado) — nunca una sugerencia vaga tipo "mejora el espaciado".

Si el input es solo visual (capturas), evalúa lo detectable y lista aparte, bajo "No verificable sin código", las reglas que requieren ver el CSS/código real (transition:all, z-index, prefers-reduced-motion, y la cobertura completa de estados de interacción).

### 4. Formato del reporte

```
**[Regla N — nombre]:** descripción de la violación, con ubicación específica.
→ Reemplazo: [valor concreto]
```

Si el input mezcla piezas de alta fidelidad con piezas esquemáticas, acláralo al inicio y evalúa solo lo que corresponde.

Cierra con una nota breve de "No verificable sin código" si aplica, listando qué reglas quedaron fuera de alcance.

### 5. Tono

Directo y específico, sin relleno ni elogios previos. Si la UI está genuinamente bien resuelta en la mayoría de las reglas, dilo brevemente y no fuerces hallazgos — el valor de esta revisión está en señalar decisiones no tomadas, no en encontrar problemas donde no los hay.
