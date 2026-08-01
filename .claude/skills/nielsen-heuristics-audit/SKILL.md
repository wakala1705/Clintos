---
name: nielsen-heuristics-audit
description: Analiza el flujo de una aplicación (capturas de pantalla, prototipos HTML/interactivos, o descripciones en texto de pantallas y pasos) y detecta problemas de usabilidad aplicando las 10 heurísticas de usabilidad de Jakob Nielsen. Úsala siempre que el usuario pida una "auditoría de usabilidad", "revisión heurística", "evaluación heurística", "análisis de flujo", "crítica UX", o mencione a Nielsen, heurísticas, o quiera detectar problemas de usabilidad en pantallas, prototipos o flujos de una app — incluso si no usa la palabra "heurística" explícitamente pero pide feedback de UX/UI sobre un flujo completo (varias pantallas o pasos conectados). No es para crítica de un solo elemento aislado (ej. "¿este botón se ve bien?"); para eso responde directamente sin la skill.
---

# Auditoría de usabilidad con heurísticas de Nielsen

Evalúa flujos de aplicaciones (no pantallas aisladas) aplicando las 10 heurísticas de Nielsen de forma sistemática y con severidad asignada a cada hallazgo.

## Cuándo usar esta skill

- El usuario pide explícitamente una revisión/auditoría heurística.
- El usuario pide feedback de UX sobre un flujo de varios pasos o pantallas (screenshots, prototipo HTML, o descripción textual del recorrido).
- El usuario menciona a Nielsen o "las 10 heurísticas".

Si el usuario solo pide feedback de un elemento aislado (un botón, un color, una card suelta) sin flujo, responde directamente sin necesidad de la auditoría completa — esta skill está pensada para flujos.

## Proceso

### 1. Reunir el input del flujo

El input puede ser:
- **Imágenes/capturas**: revisa cada pantalla en orden de flujo.
- **Prototipo HTML interactivo**: si es un archivo, ábrelo/revísalo (`view` o leyendo el código) para entender la estructura, estados e interacciones, no solo el HTML estático.
- **Descripción en texto**: pasos narrados del flujo (ej. "el usuario entra a X, selecciona Y, ve Z...").

Si el usuario menciona un flujo pero no ha adjuntado nada verificable (ni imágenes, ni archivo, ni descripción suficiente), pídele lo que falta antes de evaluar — no inventes pantallas que no has visto.

Si el input es parcial (ej. solo 2 de 5 pantallas), evalúa lo que hay y dilo explícitamente al inicio del reporte, sin fabricar el resto del flujo.

### 2. Cargar la referencia de heurísticas

Antes de evaluar, consulta `references/heuristicas.md`. Contiene las 10 heurísticas completas, preguntas guía para detectar violaciones en cada una, ejemplos típicos de problemas, y la escala de severidad a usar (Crítico/Alto/Medio/Bajo).

### 3. Evaluar el flujo heurística por heurística

Recorre el flujo completo (todas las pantallas/pasos en orden) contra cada una de las 10 heurísticas, usando las preguntas guía del archivo de referencia. No evalúes pantalla por pantalla de forma aislada primero — evalúa el flujo completo contra cada heurística, así detectas también problemas de consistencia entre pantallas (ej. heurística 4) que solo aparecen al comparar varios pasos.

Para cada heurística donde encuentres uno o más problemas:
- Identifica el problema específico y en qué pantalla/paso ocurre.
- Asigna severidad (Crítico/Alto/Medio/Bajo) según la guía de referencia.
- Da una recomendación concreta y accionable, no genérica.

Si una heurística no presenta problemas en el flujo evaluado, dilo brevemente ("Sin hallazgos" o similar) — no fuerces problemas donde no los hay. Un reporte honesto con heurísticas limpias es más útil que uno inflado.

### 4. Formato del reporte

Organiza el output por las 10 heurísticas (esa es la estructura por defecto salvo que el usuario pida otra explícitamente, ej. tabla o solo lista de severidad). Formato sugerido por heurística:

```
## [N]. [Nombre de la heurística]

**[Severidad] — [pantalla/paso]:** Descripción del problema.
→ Recomendación: [acción concreta]

(o "Sin hallazgos relevantes en esta heurística.")
```

Al inicio del reporte, incluye un resumen breve: cuántas pantallas/pasos se evaluaron, y un conteo de hallazgos por severidad (ej. "2 críticos, 4 altos, 3 medios, 1 bajo").

Al final, si hay hallazgos críticos o altos, resáltalos de nuevo en una lista corta de "prioridades" para que el usuario sepa qué atacar primero — el resto queda como referencia en el cuerpo del reporte.

### 5. Tono

Sé directo y específico, evita relleno. No elogies el diseño antes de dar el feedback — ve al grano con los hallazgos. Si el flujo está mayormente bien resuelto, dilo brevemente y sin exagerar el problema para justificar la auditoría.
