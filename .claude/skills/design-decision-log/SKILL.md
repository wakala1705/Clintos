---
name: design-decision-log
description: Documenta decisiones de diseño (problema, opciones consideradas, decisión final, y por qué) en un documento único que se va acumulando como un case study vivo del proyecto. Úsala cuando el usuario pida explícitamente "documenta esta decisión", "guarda esto en el case study", "arma mi bitácora de decisiones", o cuando dentro de la conversación se llegue a una resolución clara de una decisión de diseño no trivial (se plantea un problema, se consideran opciones o trade-offs, y se elige un camino con una razón). Aplica especialmente en fases de research/definición de un flujo o producto (arquitectura de información, nomenclatura, jerarquía de contenido, sistemas de color/estado), no solo al cierre del proyecto. No la actives para decisiones triviales de estilo (ej. "usemos 16px en vez de 14px") sin una razón de fondo detrás.
---

# Bitácora de decisiones de diseño (case study vivo)

Captura decisiones de diseño según se van tomando en la conversación, acumulándolas en un único documento que sirve tanto de registro de trabajo como de material crudo para un case study de portafolio.

## Cuándo activar

**Explícito:** el usuario pide documentar, guardar, o armar la bitácora/case study.

**Proactivo:** detectas en la conversación una decisión de diseño real — no cualquier intercambio. Señal de que sí califica: se planteó un problema u objetivo, se consideró más de una opción o trade-off, y se llegó a una resolución con una razón detrás (aunque sea breve). Ejemplos de señales pasadas de este usuario: resolver un conflicto de nomenclatura entre dos usos de la misma palabra, elegir una jerarquía de agrupación de información, definir un sistema de color semántico para evitar colisiones.

Cuando el trigger es proactivo (el usuario no lo pidió), **no escribas el archivo directamente** — ofrécelo en una línea breve al final de tu respuesta normal, ej.: "Esto suena como una decisión que vale la pena dejar en tu bitácora — ¿la agrego?". Solo escribe/actualiza el archivo tras confirmación. Esto evita generar archivos no solicitados y respeta que el usuario decida qué entra al registro.

No actives esto para ajustes de estilo sin razón de fondo, ni para cada micro-decisión de la conversación — solo las que tengan peso suficiente para explicarse después a otra persona (un stakeholder, un reclutador, otro diseñador).

## Proceso

### 1. Verificar si ya existe una bitácora para este proyecto

Antes de crear un archivo nuevo, pregunta si ya existe un documento de bitácora para este proyecto/flujo (puede que el usuario lo tenga que subir). Si existe, léelo primero y añade la nueva entrada al final, sin modificar ni reescribir las entradas anteriores — el historial de decisiones pasadas no debe alterarse retroactivamente. Si no existe, créalo desde cero.

Si no está claro a qué proyecto/flujo pertenece la decisión (el usuario trabaja en varios flujos de Clintos en paralelo), pregunta brevemente a qué bitácora pertenece en lugar de asumir.

### 2. Capturar la entrada

Cada decisión documentada debe registrar:

- **Contexto/Problema**: qué situación o pregunta de diseño se estaba resolviendo.
- **Opciones consideradas**: las alternativas que se evaluaron (aunque sea de forma breve), no solo la ganadora.
- **Decisión final**: qué se eligió.
- **Por qué**: la razón o trade-off que inclinó la decisión.

Extrae esto de lo ya conversado — no le pidas al usuario que lo repita si ya está en el hilo. Si algo quedó implícito (ej. la razón nunca se dijo explícitamente pero se infiere claramente del intercambio), formúlalo como pregunta rápida antes de asumirlo y escribirlo como si el usuario lo hubiera dicho.

### 3. Formato del documento

Estructura por proyecto/flujo, con entradas en orden cronológico. Cada entrada:

```
## [Fecha o etapa del proyecto] — [Título corto de la decisión]

**Contexto:** ...

**Opciones consideradas:**
- Opción A — ...
- Opción B — ...

**Decisión:** ...

**Por qué:** ...
```

Guarda el documento como archivo markdown (`.md`) salvo que el usuario pida explícitamente Word — en ese caso consulta la skill de docx antes de generarlo.

### 4. Versión narrativa para portafolio (solo si se pide)

Si el usuario pide una versión pulida para mostrar a alguien más (case study de portafolio, presentación a un reclutador o stakeholder), reescribe las entradas acumuladas en formato narrativo (Reto → Proceso → Decisión → Resultado/aprendizaje), sin perder la sustancia técnica de las decisiones — esto es una versión derivada para lectura externa, no reemplaza el log crudo, que sigue siendo la fuente de verdad y se mantiene intacto.

### 5. Tono al capturar

Sé fiel a lo que realmente se discutió — no adornes la razón de una decisión ni la hagas sonar más estratégica de lo que fue si en la conversación fue más pragmática. El valor de la bitácora está en que sea un registro honesto, no una narrativa de venta.
