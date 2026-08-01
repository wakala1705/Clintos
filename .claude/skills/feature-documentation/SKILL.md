---
name: feature-documentation
description: Documenta las funcionalidades de un producto o aplicativo, organizadas por submódulo, en un documento único que se va acumulando a medida que se documenta cada submódulo. Cada funcionalidad se registra con su descripción funcional, roles/permisos (quién puede hacerlo) y reglas de negocio/validaciones. Úsala cuando el usuario pida "documentar las funcionalidades" de un módulo/submódulo/aplicativo, "qué se puede hacer aquí", "documentación funcional", o describa una lista de acciones que ofrece una pantalla o sección del producto (ej. "registrar dosis, suspender, no aplicar, reprogramar") y quiera dejarlo registrado formalmente. Aplica tanto si se documenta un submódulo a la vez como si se da todo el listado de una vez. No es para flujos paso a paso con decisiones/bifurcaciones (usa flow-documentation), ni para auditorías de usabilidad o accesibilidad (usa nielsen-heuristics-audit o wcag-accessibility-audit), ni para bitácora de decisiones de diseño (usa design-decision-log).
---

# Documentación funcional por submódulo

Documenta qué puede hacer un usuario dentro de cada submódulo de un producto (funcionalidades disponibles), acumulando los submódulos en un único documento vivo — igual que se va construyendo el aplicativo, la documentación crece junto con él.

## Cuándo usar esta skill

- El usuario pide documentar las funcionalidades de un módulo, submódulo o pantalla.
- El usuario describe una lista de acciones disponibles en una sección del producto y quiere formalizarla.
- El usuario pregunta "¿qué necesito para documentar esto?" en el contexto de especificar qué hace un submódulo.

No uses esta skill para: secuencias de pasos con puntos de decisión (→ `flow-documentation`), evaluaciones de usabilidad/accesibilidad (→ `nielsen-heuristics-audit`, `wcag-accessibility-audit`), o registro de por qué se tomó una decisión de diseño (→ `design-decision-log`).

## Proceso

### 1. Verificar si ya existe el documento para este producto

Antes de crear un archivo nuevo, pregunta si ya existe una documentación funcional previa para este producto/aplicativo (puede que el usuario la suba). Si existe, léela y añade el submódulo nuevo al final sin modificar los submódulos ya documentados — cada submódulo documentado es estable a menos que el usuario pida explícitamente actualizarlo porque cambió el aplicativo. Si no existe, créalo desde cero con el nombre del aplicativo como título.

Si el usuario trabaja en varios aplicativos en paralelo (ej. distintos módulos de Clintos como eMAR e IREP), confirma a qué documento pertenece el submódulo antes de escribir.

### 2. Recopilar la información de cada submódulo

Para cada submódulo, antes de escribir necesitas:

1. **Nombre del submódulo** (ej. "Gestión de medicamentos").
2. **Propósito general**: qué resuelve este submódulo en una frase, y para qué rol principal existe (ej. enfermería, farmacia, médico).
3. **Lista de funcionalidades**: las acciones que el usuario puede realizar aquí (ej. registrar dosis, suspender, no aplicar, reprogramar).
4. Para **cada funcionalidad** de la lista:
   - **Qué hace**: descripción funcional breve — qué logra esa acción y en qué contexto se usa.
   - **Quién puede hacerlo (roles/permisos)**: qué rol(es) tienen acceso a esta acción. Si el usuario no lo especifica, pregúntalo — no asumas el rol clínico por defecto.
   - **Reglas de negocio / validaciones**: condiciones que deben cumplirse para ejecutar la acción, restricciones, o qué pasa en el sistema como consecuencia (ej. requiere motivo obligatorio, requiere autorización médica, actualiza el estado de la dosis, queda registrado en auditoría).

Extrae lo que ya esté en la conversación (prototipos, decisiones previas, flujos ya documentados) antes de preguntar — el usuario no debería repetir algo que ya explicó. Si falta el detalle de roles o reglas de negocio para una funcionalidad puntual, pregúntalo específicamente por esa funcionalidad en vez de pedir todo el submódulo de nuevo.

No sobre-preguntes en funcionalidades simples y evidentes por el nombre (ej. una acción de solo lectura sin restricciones); enfoca las preguntas en las acciones que modifican estado clínico o requieren permisos especiales — ahí es donde más importa no asumir.

### 3. Formato del documento

Documento markdown único por aplicativo, con un encabezado por submódulo. Usa siempre esta estructura (omite una sub-sección solo si genuinamente no aplica, nunca inventes contenido para llenarla):

```markdown
# Documentación funcional — [Nombre del aplicativo]

## [Nombre del submódulo]

**Propósito:** [qué resuelve este submódulo y para quién]

### [Nombre de la funcionalidad 1]

- **Qué hace:** [descripción funcional]
- **Roles con acceso:** [rol(es)]
- **Reglas de negocio:**
  - [regla/validación 1]
  - [regla/validación 2]

### [Nombre de la funcionalidad 2]
...

---

## [Siguiente submódulo, agregado en otra sesión]
...
```

Escribe en español, con la terminología clínica que el usuario ya haya usado (no inventes términos médicos nuevos). Mantén cada funcionalidad concisa — esto es documentación funcional de referencia, no un flujo paso a paso (para eso existe `flow-documentation`, y puedes enlazar a un flujo ya documentado si aplica en vez de repetirlo aquí).

### 4. Entrega

Guarda el documento como `.md` en `/mnt/user-data/outputs/` salvo que el usuario pida explícitamente Word (en ese caso consulta primero `/mnt/skills/public/docx/SKILL.md`). Si el documento ya existía, actualiza el mismo archivo en vez de crear uno nuevo con otro nombre. Presenta el archivo con `present_files`.

### 5. Revisión rápida antes de entregar

- ¿Cada funcionalidad tiene las tres partes (qué hace, roles, reglas de negocio) o se omitió alguna con razón explícita?
- ¿Los roles fueron confirmados por el usuario o asumidos? Si fueron asumidos, señálalo.
- ¿Quedó algún submódulo previamente documentado intacto (no reescrito)?

## Ejemplo rápido

Si el usuario dice *"en gestión de medicamentos puedo: registrar dosis, suspender, no aplicar, reprogramar"*, el resultado esperado es una sección `## Gestión de medicamentos` con propósito breve, y cuatro sub-secciones (una por acción), cada una preguntando/documentando quién puede ejecutarla y qué reglas de negocio aplican (ej. "Suspender" requiere motivo obligatorio y puede requerir autorización médica según el tipo de tratamiento — como ya se definió en el modal de suspensión de tratamiento de Clintos).
