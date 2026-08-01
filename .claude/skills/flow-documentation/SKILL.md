---
name: flow-documentation
description: Documenta flujos de acciones de un producto (los pasos que sigue un usuario o el sistema para completar una tarea) y genera automáticamente su diagrama de flujo en Mermaid. Úsala siempre que el usuario pida "documentar un flujo", "mapear el flujo de X", "diagrama de flujo", "flowchart", quiera explicar cómo funciona una acción o proceso paso a paso, o describa una secuencia de pantallas/interacciones/decisiones que conviene dejar registrada — incluso si no pide explícitamente un "diagrama". También aplica cuando el usuario tiene un flujo ya diseñado (prototipo, wireframes, o descripción verbal) y quiere convertirlo en documentación formal con su representación visual. No es para journey maps o personas (usa personas-journey-maps) ni para bitácoras de decisiones de diseño (usa design-decision-log); esta skill es específicamente sobre la secuencia lógica de pasos, decisiones y estados de un flujo de acciones.
---

# Flow Documentation

Skill para documentar flujos de acciones de producto y generar su diagrama de flujo correspondiente en Mermaid. El resultado siempre tiene dos partes que van juntas: la documentación estructurada en texto (qué pasa en cada paso, por qué, y qué casos límite existen) y el diagrama (cómo se conectan esos pasos visualmente).

## Cuándo usar esta skill

- El usuario pide documentar cómo funciona un flujo, proceso o acción del producto.
- El usuario pide un "diagrama de flujo" o "flowchart" de algo.
- El usuario describe una secuencia de pasos/pantallas y quiere dejarla registrada formalmente.
- El usuario tiene un prototipo HTML o wireframes y quiere extraer el flujo lógico que representan.

No uses esta skill para: mapas de empatía o personas (→ `personas-journey-maps`), bitácoras de decisiones de diseño (→ `design-decision-log`), auditorías de usabilidad o accesibilidad (→ `nielsen-heuristics-audit`, `wcag-accessibility-audit`).

## Proceso

### Paso 1 — Recopilar la información del flujo

Antes de escribir nada, asegúrate de tener claro lo siguiente. Si el usuario ya lo dio en la conversación (ej. pegó un prototipo, o lo describió en detalle), extráelo de ahí en vez de volver a preguntar. Si falta algo esencial, pregunta solo lo que falta — no repitas lo que ya es obvio por contexto:

1. **Nombre y objetivo del flujo**: ¿qué tarea completa el usuario o el sistema al final de este flujo?
2. **Disparador (trigger)**: ¿qué inicia el flujo? (una acción del usuario, una alerta del sistema, un evento programado, etc.)
3. **Actores involucrados**: ¿quién o qué participa? (ej. enfermera, sistema, farmacia, médico, paciente). Si hay más de un actor, el diagrama se organiza en carriles (swimlanes) — ver `references/mermaid-flowchart-guide.md`.
4. **Pasos secuenciales**: la secuencia principal, en orden, del camino "feliz" (happy path).
5. **Puntos de decisión**: dónde el flujo se bifurca según una condición (ej. "¿stock disponible?", "¿requiere autorización?").
6. **Estados o resultados posibles**: los distintos finales a los que puede llegar el flujo (éxito, error, cancelado, pendiente, etc.).
7. **Casos límite / excepciones**: qué pasa si algo falla, se interrumpe, o hay un caso especial (timeout, permisos insuficientes, datos incompletos, escenario de emergencia).

No sobre-preguntes: si el flujo es simple y lineal (2-4 pasos sin decisiones), puedes avanzar con menos detalle. Si es un flujo clínico o crítico (como los de Clintos), presta especial atención a los puntos 5 y 7 — ahí suele estar el detalle que importa en un sistema hospitalario.

### Paso 2 — Redactar la documentación estructurada

Usa siempre estas secciones (omite las que no apliquen, pero no inventes contenido para llenarlas):

```markdown
# Flujo: [Nombre del flujo]

## Objetivo
[Qué logra este flujo y para quién]

## Disparador
[Qué inicia el flujo]

## Actores
- [Actor 1]: [su rol en el flujo]
- [Actor 2]: [su rol en el flujo]

## Precondiciones
[Qué debe cumplirse antes de que el flujo pueda iniciar, si aplica]

## Pasos
1. [Actor] hace/recibe [acción] → [resultado inmediato]
2. ...

## Puntos de decisión
- **[Pregunta de decisión]**: si [condición A] → [camino A]; si [condición B] → [camino B]

## Estados finales
- ✅ [Estado de éxito]: [qué significa]
- ⚠️ [Estado alterno]: [qué significa]
- ❌ [Estado de error/cancelación]: [qué significa]

## Casos límite y excepciones
- [Caso]: [cómo lo maneja el flujo actualmente, o "no está resuelto" si es un gap detectado]

## Notas / gaps detectados
[Solo si detectas ambigüedades o huecos en el flujo mientras lo documentas — señálalos aquí en vez de asumir una respuesta]
```

Escribe en español, con terminología de producto/UX genérica salvo que el contexto sea explícitamente clínico (en ese caso usa la terminología clínica que el usuario haya usado, sin inventar términos médicos nuevos).

### Paso 3 — Generar el diagrama Mermaid

Lee `references/mermaid-flowchart-guide.md` antes de escribir el diagrama — cubre la sintaxis de nodos, decisiones, y cómo organizar carriles por actor cuando hay más de uno.

Reglas clave:
- Usa `flowchart TD` (top-down) para flujos con pocos actores, o `flowchart LR` cuando hay muchos pasos secuenciales y conviene leer de izquierda a derecha.
- Nodo de inicio y fin siempre marcados como tal (forma redondeada/stadium).
- Los puntos de decisión son siempre rombos (`{}`) con las ramas etiquetadas (Sí/No, o la condición específica).
- Si hay más de un actor, usa `subgraph` por actor para que el diagrama se lea como carriles.
- No sobrecargues un solo diagrama: si el flujo tiene más de ~15-20 nodos o combina varios subflujos, sepáralo en un diagrama principal + diagramas de detalle para las ramas más complejas, y dilo explícitamente.

El diagrama Mermaid va como bloque de código embebido junto con la documentación (mismo artifact/mensaje), no aparte — ambos se entregan juntos porque se explican mutuamente.

### Paso 4 — Entregar en ambos formatos

El usuario pidió que la documentación salga tanto en Markdown como en Word:

1. **Markdown**: crea un artifact `.md` con la documentación completa (secciones del Paso 2) + el bloque de código Mermaid embebido (los artifacts de Markdown renderizan Mermaid automáticamente).
2. **Word (.docx)**: además, genera la versión en Word. Antes de tocar el archivo, lee `/mnt/skills/public/docx/SKILL.md` y sigue su proceso. Como Word no renderiza Mermaid nativamente, usa el Visualizer (herramienta `visualize`) o el intérprete de código para exportar el diagrama como imagen (SVG/PNG) y luego insértala en el documento junto con el texto de cada sección. Si no es viable generar la imagen, incluye el bloque de código Mermaid como texto monoespaciado en el Word y acláralo brevemente.

Guarda ambos archivos en `/mnt/user-data/outputs/` y preséntalos juntos con `present_files`.

### Paso 5 — Revisión rápida antes de entregar

Antes de dar el flujo por terminado, verifica:
- ¿Todos los pasos del texto tienen su nodo correspondiente en el diagrama, y viceversa?
- ¿Cada punto de decisión en el texto tiene su rombo con las ramas correctamente etiquetadas?
- ¿Los estados finales del texto coinciden con los nodos terminales del diagrama?
- ¿Quedó algún caso límite mencionado por el usuario sin reflejar en el diagrama? Si es así, agrégalo o señálalo como nota.

Si detectas una inconsistencia entre lo que el usuario describió y lo que quedó documentado, señálala en vez de resolverla por tu cuenta asumiendo la respuesta más probable.

## Ejemplo rápido de aplicación

Si el usuario dice: *"documenta el flujo de suspensión de un tratamiento prescrito"*, el resultado esperado es un documento con Objetivo ("permitir a enfermería suspender un tratamiento activo con justificación"), Actores (enfermera, sistema, médico si requiere validación), Pasos (selecciona tratamiento → indica motivo → ¿requiere autorización médica? → confirma → sistema actualiza estado y registra en auditoría), Estados finales (suspendido / cancelado por el usuario / rechazado por falta de autorización), y su diagrama Mermaid correspondiente con el rombo de decisión de autorización.
