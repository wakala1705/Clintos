# Programación de turnos — flujo de creación, configuración y asignación

Fecha: 2026-08-28

## Contexto

`ProgramacionTurnos.jsx` ya implementa la pantalla completa de calendario:
grilla enfermera×día, popover de detalle (`TurnoCellPopover`), 3 modales de
edición (`EditarTurnoModal`/`ReasignarTurnoModal`/`AsignarTurnoModal`),
filtros (área/tipo/estado/búsqueda), y un footer de resumen con conteos
clickeables de "sin asignar"/"conflicto". Todo eso queda intacto — es la
base sobre la que se construye este flujo, no algo a rediseñar.

Lo que falta hoy: no existe el concepto de "una programación" como entidad
con período/área/personal propio. `schedule` es un único mapa global
(`mockProgramacionData.js`) que no varía según la semana visible, y
`NURSES` es una lista fija — navegar de semana en la UI cambia solo las
etiquetas de columna, nunca los datos. Un comentario ya presente en
`ProgramacionTurnos.css` ("el estado de publicación se sacó por ahora")
confirma que el modelo Borrador/Publicada se previó pero nunca se
construyó — no hay una implementación previa real que recuperar del
historial de git (se verificó).

Este spec cubre: entidad "programación" keyed por período, wizard de 3
pasos para crearla, adaptación del calendario para operar sobre la
programación activa del período visible, asignación múltiple por
checkboxes de día, y el flujo de revisión/publicación con el modelo de
estados Borrador → Publicada.

## Alcance

- Nuevo botón `[+ Nueva programación]` + estado vacío en la card del
  calendario cuando el período visible no tiene programación.
- Wizard modal de 3 pasos (Período y área → Seleccionar personal →
  Confirmar) que crea una programación para el período activo.
- El calendario pasa a filtrar por el personal de la programación activa,
  además de los filtros ya existentes.
- `AsignarTurnoModal` en modo sin celda de origen (`locked=false`, disparado
  desde `+ Asignar turno` del header) gana selección de varios días por
  checkbox, para asignar el mismo tipo de turno a varios días de una vez.
- Botón `[Revisar programación]` + modal de revisión con conteos y
  publicación.
- Modelo de estados `borrador` / `publicada` con badge visual.
- Fuera de alcance (explícito en el encargo original): disponibilidad,
  patrones, restricciones, optimización, reglas automáticas de validación,
  drag & drop, edición/despublicación de una programación ya publicada
  (se deja el lugar visual preparado, sin implementar la acción), vista
  mensual funcional para editar (sigue siendo de solo consulta, como hoy).

## Modelo de datos (mock)

Se reemplaza el `schedule`/`NURSES` global fijo por un mapa de
programaciones keyed por período, en `mockProgramacionData.js` (mismo
archivo que ya tiene `SCHEDULE`/`NURSES`/helpers de fecha — no se crea un
mock file nuevo, es una evolución del existente):

```js
// clave de período — "week:2026-08-18" (lunes ISO) o "month:2026-09"
function periodKeyDeSemana(weekStart) { ... }   // "week:YYYY-MM-DD"
function periodKeyDeMes(weekStart) { ... }      // "month:YYYY-MM", mes que contiene weekStart

// programación
{
  id, tipo: 'semana' | 'mes',
  periodKey,                    // clave de almacenamiento (ver arriba)
  periodLabel,                  // "18 – 24 Ago 2026" / "Septiembre 2026"
  area,                         // value del AreaSelector elegido en el wizard (solo display/seed inicial del filtro)
  nurseIds: ['n1', 'n2', ...],
  estado: 'borrador' | 'publicada',
  schedule: { n1: [cell x7], n2: [cell x7], ... },  // mismo shape de celda que ya usa TurnosCalendar hoy
}
```

Resolución de "¿qué programación aplica a la semana visible?" (usado tanto
para decidir el estado vacío como para elegir qué `schedule` pintar):
1. Buscar `programaciones["week:" + lunesISO(weekStart)]` — match exacto.
2. Si no existe, buscar `programaciones["month:" + añoMes(weekStart)]` — una
   programación de tipo mes "cubre" cualquier semana visible dentro de ese
   mes (mismo criterio de simplificación que ya tiene hoy la navegación de
   semana: no se modelan 4-5 semanas de datos reales distintos para un
   período mensual, fuera de alcance de V1 — ver sección 9 del encargo).
3. Si ninguna matchea, no hay programación para el período → estado vacío.

Semilla inicial: `"week:2026-08-18"` (18–24 Ago 2026, la semana que hoy
tiene datos completos) se carga con los 8 `NURSES` actuales, `area:'todas'`,
`estado:'publicada'`, y el `SCHEDULE` mock ya existente tal cual. Ninguna
otra clave de período viene precargada — cualquier otra semana/mes arranca
sin programación, disparando el estado vacío descrito en la sección
siguiente.

Persistencia: estado local en `ProgramacionTurnos.jsx` (`useState`), sin
`localStorage` ni backend — mismo criterio que el `schedule` mutable actual
(se resetea al remontar la pantalla).

## Punto de entrada + estado vacío (sección 1 del encargo)

- `[+ Nueva programación]` (ícono `LuPlus`, mismo patrón que
  `<Button icon={LuPlus}>Asignar turno</Button>` ya existente) se agrega en
  `.tu-header-actions`, después de `+ Asignar turno`.
- Cuando `programacionActiva` es `null` para el período visible: la card
  del calendario reemplaza `<TurnosCalendar>` + `.tu-summary` por un bloque
  de estado vacío centrado (ícono, "No hay una programación para este
  período", "Selecciona el período, el área y el personal para comenzar a
  asignar turnos.", botón `[Iniciar programación]`). El header de la card
  (`day-nav` + filtros) se mantiene visible arriba — el usuario sigue
  pudiendo navegar de semana para encontrar un período que sí tenga datos.
- Tanto `[+ Nueva programación]` como `[Iniciar programación]` abren el
  mismo wizard.

## Wizard de nueva programación (sección 2)

Carpeta nueva `ProgramacionTurnos/NuevaProgramacionWizard/` (un componente
por carpeta, ver AGENTS.md):

```
NuevaProgramacionWizard/
  NuevaProgramacionWizard.jsx / .css       // shell: progreso, paso activo, estado del form
  PeriodoAreaStep/PeriodoAreaStep.jsx / .css
  SeleccionarPersonalStep/SeleccionarPersonalStep.jsx / .css
  ConfirmarStep/ConfirmarStep.jsx / .css
```

- Modal grande (`modal-overlay` + `modal-card` más ancho que el estándar,
  clase propia `npw-modal-card`), header con `ModalHeader` (título "Nueva
  programación de turnos", subtítulo con la descripción del paso activo) +
  indicador de progreso de 3 pasos debajo del header.
- Estado del formulario vive en `NuevaProgramacionWizard` y se pasa a cada
  step como props controladas (mismo patrón que los modales existentes:
  `form`/`setForm` local, sin librería de formularios).

**Paso 1 — Período y área** (`PeriodoAreaStep`):
- Toggle Semana/Mes (por defecto Semana). Semana: label + flechas prev/
  siguiente, reutilizando `addDias`/`rangoSemanaLabel` ya existentes,
  precargado con el `weekStart` que estaba activo en pantalla al abrir el
  wizard. Mes: mismo patrón de flechas sobre un label de mes/año.
- `AreaSelector` (mismo componente ya usado en el header de la pantalla),
  precargado con el `areaOperativa` activo.
- Validación: período y área siempre tienen un valor por defecto (no hace
  falta bloquear "Continuar" por esto — nunca quedan vacíos).

**Paso 2 — Seleccionar personal** (`SeleccionarPersonalStep`):
- Contador "N enfermeras seleccionadas" arriba de la lista.
- Buscador (`.search-field`, mismo patrón que el header de la pantalla) +
  2 `FilterDropdown` simples (Área/Cargo) sobre `NURSES`. El encargo
  original lista un tercer filtro "Estado", pero `NURSES`
  (`mockProgramacionData.js`) no trae ningún campo de estado — el concepto
  más cercano (`configurada`/`pendiente`) vive en `mockEnfermerasData.js`
  (`ENFERMERAS_INICIALES`), un dataset distinto con su propio namespace de
  ids (`ENF-001`) que no se cruza con `NURSES` (`n1`...`n8`). Forzar ese
  campo sobre `NURSES` sería inventar un dato sin fuente real, así que el
  wizard queda con los 2 filtros que sí tienen datos genuinos
  (`Área`/`Cargo`, este último con los 2 valores fijos ya existentes:
  "Enfermera profesional"/"Enfermero profesional").
- Lista de filas checkbox, reutilizando el patrón visual de
  `.tc-nurse`/`.tc-avatar`/`.tc-nurse-id` de `TurnosCalendar.jsx` (avatar
  circular con iniciales + nombre + cargo) en vez del patrón de tabla de
  `AgregarEnfermeraModal` — es una lista de selección, no una tabla de
  acciones.
- `[Seleccionar todos]` tildado/destildado según si ya están todas
  seleccionadas (checkbox tri-state visual simple, no un dropdown).
- Validación: `[Continuar]` deshabilitado si `nurseIds.length === 0`.

**Paso 3 — Confirmar** (`ConfirmarStep`):
- Resumen de solo lectura: período, duración (derivada: "1 semana" si
  tipo semana; "1 mes" si tipo mes — no se calcula en días), área, cantidad
  de personal + listado resumido (nombre + cargo, mismo patrón visual del
  paso 2 sin checkbox).
- Nota fija: "Podrás asignar y modificar los turnos desde el calendario
  después de crear la programación."
- `[Crear programación]`: construye la entrada `programaciones[periodKey]`
  (`estado:'borrador'`, `schedule` con `estado:'vacio'` en las 7 celdas de
  cada `nurseId` elegido — nunca se pre-generan turnos), sobrescribiendo
  sin confirmación adicional si ya existía una entrada para ese período
  (decisión ya validada con el usuario: recrear es la vía de "editar" en
  esta V1, no hay un flujo de edición del wizard aparte). También actualiza
  `areaOperativa`/`weekStart` de la pantalla al valor elegido en el wizard,
  cierra el modal, y deja `selectedPeriodKey` apuntando a la nueva entrada.

`[Atrás]`/`[Cancelar]` en cada paso siguen el patrón ya usado en los
modales existentes (`btn btn-secondary`). Cerrar el wizard sin confirmar
(botón X del `ModalHeader`, o `[Cancelar]` en el paso 1) descarta el form
sin tocar `programaciones`.

## Calendario con programación activa (sección 3) + asignación manual (sección 4)

- `nursesArea` (ya filtra por área+búsqueda) se intersecta además con
  `programacionActiva.nurseIds` antes de aplicar tipo/estado — mismo punto
  del `useMemo` donde ya se combinan los demás filtros.
- `schedule` deja de ser un único `useState(SCHEDULE)`: pasa a derivarse de
  `programaciones[selectedPeriodKey].schedule`, y los handlers de mutación
  existentes (`handleAssign`, `handleSaveEditar`, `handleConfirmReasignar`,
  `handleEliminar`, `handleResolverConflicto`) actualizan esa entrada del
  mapa en vez de un `schedule` plano — misma lógica interna de cada
  handler, solo cambia el nivel de anidamiento del `setState`.
- El resto de la sección 4 (clic en celda vacía → `AsignarTurnoModal`
  `locked`, popover de turno/descanso/conflicto, iconografía y colores por
  tipo) ya está implementado y no se modifica.

## Asignación múltiple (sección 5)

- No se agrega un botón nuevo: `+ Asignar turno` del header (que hoy abre
  `AsignarTurnoModal` con `locked=false`) es el punto de entrada, según lo
  ya acordado.
- En `AsignarTurnoModal`, cuando `locked=false`: el campo "Fecha" deja de
  ser el `FormSelect` de un solo día y pasa a un grupo de checkboxes
  (`☑ Lun ☑ Mar ☑ Mié ...`, usando `DIAS_SEMANA`/`days` ya disponibles).
  `form.dayIdxs` pasa a ser un array en vez de un único valor.
- `handleSubmit`/`onAssign` iteran `form.dayIdxs` aplicando el mismo
  `tipo`/`horario` a cada día tildado de la enfermera elegida, en una sola
  actualización de `schedule` (un solo `setState`, no uno por día).
- Validación: `[Asignar turno]` deshabilitado si no hay enfermera elegida o
  `dayIdxs.length === 0` (reemplaza la validación actual de "un día
  elegido").
- El modo `locked=true` (clic en celda puntual) no cambia: sigue siendo un
  solo día, sin checkboxes — ahí la fecha ya viene fijada por la celda.

## Estados y validaciones (sección 6) — sin cambios de fondo

El footer `.tu-summary` (conteo de enfermeras/turnos/sin asignar/
conflictos, clicks que filtran por estado) y los colores/estados de celda
(turno/descanso/vacío/conflicto) ya están implementados tal como pide el
encargo. Único cambio: el cálculo de `resumen` pasa a iterar sobre
`nursesArea` intersectado con `programacionActiva.nurseIds` (igual que la
grilla), no sobre todas las `NURSES`.

## Revisión y publicación (sección 7) + modelo de estados (sección 8)

- `[Revisar programación]` en `.tu-header-actions`, visible solo si
  `programacionActiva` existe. Si `programacionActiva.estado === 'publicada'`,
  se reemplaza por un badge de solo lectura "Publicada" junto al título
  (`<h1>`) — deja el lugar preparado para acciones futuras de editar/
  despublicar sin implementarlas, tal como pide el encargo.
- Nuevo modal `RevisionProgramacionModal/` (carpeta propia bajo
  `ProgramacionTurnos/`): reutiliza el mismo cálculo de `resumen` que ya
  existe (turnos programados / sin asignar / conflictos), mostrado con
  íconos `✓`/`⚠` (`LuClipboardCheck`/`LuUserRoundX`/`LuTriangleAlert`, ya
  importados en la pantalla).
  - Si `sinAsignar === 0 && conflictos === 0`: título "Listo para
    publicar", botones `[Volver al calendario]` + `[Publicar programación]`.
  - Si no: título "Hay elementos pendientes", solo `[Volver al calendario]`
    (sin acción de publicar disponible).
- `[Publicar programación]`: `programaciones[periodKey].estado` pasa a
  `'publicada'`, cierra el modal, `window.ncToast?.('Programación
  publicada correctamente')` (mismo mecanismo de toast que ya usa el resto
  de la pantalla).

## Semana vs. mes (sección 9) — sin cambios de fondo

Ya cubierto por el modelo de datos (resolución de período por semana con
fallback a mes) y por el wizard (paso 1 permite elegir semana o mes). La
vista mensual del calendario en sí (botón `Semana` del header) sigue siendo
solo de consulta — el toast "Vista mensual en desarrollo" ya existente no
se toca, no es parte de este alcance.

## Testing

No hay suite de tests automatizados en este proyecto (mock/UI de
demostración) — verificación manual con el servidor de desarrollo:
1. Semana 18–24 Ago 2026 carga publicada, con los 8 datos mock intactos.
2. Navegar a otra semana → estado vacío → `[Iniciar programación]` → wizard
   completo → calendario con solo el personal elegido, en borrador.
3. Asignar un turno por celda (existente, no debería romperse) y por
   `+ Asignar turno` con 3 días tildados → se reflejan los 3 en la grilla.
4. `[Revisar programación]` con turnos sin asignar → solo permite volver.
   Completar asignaciones → revisar de nuevo → `[Publicar programación]` →
   badge "Publicada" reemplaza el botón, toast de confirmación.
5. Crear una programación de tipo Mes → verificar que cualquier semana
   dentro de ese mes muestra la misma programación (no estado vacío).
