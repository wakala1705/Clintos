---
name: microcopy-ux-writing
description: Audita o redacta microcopy de una interfaz — etiquetas, mensajes de error, texto de botones/CTAs, estados vacíos, confirmaciones y ayuda contextual — organizado por categoría. Úsala cuando el usuario pida revisar, mejorar, redactar o reescribir el texto de una pantalla o flujo (labels, mensajes de error, copy de botones, empty states, confirmaciones, tooltips), pida "UX writing", "microcopy", o feedback sobre qué dice la interfaz (no cómo se ve). También aplica cuando el usuario necesita texto nuevo para un componente que está diseñando (ej. "ayúdame a escribir el mensaje de error de este campo"). No es para revisar la estructura visual o de interacción de una pantalla — para eso usa `nielsen-heuristics-audit` o `visual-craft-review`.
---

# Microcopy / UX writing

Trabaja el texto de la interfaz — no su estructura visual ni de interacción — organizado en seis categorías: etiquetas, mensajes de error, CTAs/botones, estados vacíos, confirmaciones, y ayuda contextual.

## Cuándo usar esta skill

- Se pide auditar o dar feedback sobre el texto de una pantalla/flujo existente.
- Se pide redactar o reescribir microcopy nuevo (un mensaje de error específico, el texto de un botón, un estado vacío).
- Se menciona explícitamente "microcopy" o "UX writing".

No la actives para feedback de estructura visual, interacción o layout — usa `nielsen-heuristics-audit` (flujo) o `visual-craft-review` (UI de alta fidelidad/código) según corresponda. Si el usuario pide ambas cosas a la vez, puedes combinarlas en la misma conversación, pero mantén el análisis de texto separado del de estructura/visual.

## Dos modos

Esta skill funciona en dos modos, según lo que pida el usuario:

**Modo auditoría** — cuando hay texto existente que revisar (capturas, código HTML, o descripción del copy actual). Evalúa contra los principios de `references/guia-microcopy.md` y reporta por categoría.

**Modo redacción** — cuando se pide texto nuevo para un componente que se está diseñando. Pregunta lo mínimo necesario (qué acción/campo es, qué puede salir mal, qué tan riesgosa es la acción) y propone el texto directamente, siguiendo los mismos principios.

Si no está claro cuál modo aplica, infiere del contexto: si hay una interfaz ya construida de por medio, es auditoría; si se está diseñando algo nuevo desde cero, es redacción.

## Proceso — Modo auditoría

### 1. Reunir el input

Puede ser capturas, código HTML/prototipo, o descripción en texto. Si es código, revísalo directamente para extraer el texto real (labels, placeholders, mensajes de alert/error, texto de botones) en vez de asumir.

### 2. Cargar la referencia

Consulta `references/guia-microcopy.md` antes de evaluar — contiene los principios y ejemplos bien/mal de cada una de las seis categorías.

### 3. Evaluar por categoría

Recorre el texto de la pantalla/flujo contra las seis categorías (Etiquetas, Mensajes de error, CTAs/botones, Estados vacíos, Confirmaciones, Ayuda contextual). Reporta solo las categorías donde hay hallazgos reales — no fuerces problemas en categorías que no aplican a esa pantalla (ej. si no hay estados vacíos en el flujo evaluado, simplemente no la menciones).

Para cada hallazgo:
- Cita el texto actual tal cual aparece.
- Explica qué principio de la categoría rompe.
- Propón el texto de reemplazo concreto, no una sugerencia vaga ("mejora la claridad").

### 4. Formato del reporte

Organiza por categoría (no por severidad, salvo que el usuario lo pida distinto):

```
## [Categoría]

**Actual:** "[texto tal cual aparece]"
**Problema:** [qué principio rompe]
**Propuesta:** "[texto de reemplazo]"
```

## Proceso — Modo redacción

1. Identifica la categoría (label, error, CTA, empty state, confirmación, ayuda) y confirma con una pregunta rápida solo si falta contexto esencial (ej. para un mensaje de error: ¿qué causa el error y qué debe hacer el usuario para resolverlo?).
2. Redacta 1-2 opciones siguiendo los principios de la categoría correspondiente en la guía de referencia.
3. Si el texto depende de datos dinámicos (nombres, cantidades, fechas), muestra el patrón con placeholders claros (ej. `"La cantidad ingresada ({cantidad}) supera el disponible ({disponible})."`).

## Tono

Sé específico y da el texto de reemplazo real, no una descripción de cómo debería ser. Respeta el tratamiento (usted/tú) y terminología que ya usa el producto — revísalo en el texto existente antes de asumir cuál es, en vez de imponer un default.
