# Programación de Sala de Cirugía — V1

Fecha: 2026-08-31

## Contexto

`src/app/programacion-sala-cirugias/page.jsx` y
`src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx` hoy
son un placeholder ("Este módulo está en construcción.") creado para dar de
alta el submódulo en el Sidebar general (grupo Hospitalización) y en la
card de Home — ver commit previo. Este spec reemplaza ese placeholder por
la pantalla real, a partir de un encargo con mockup (`Prompt_Rediseño_V1_
Programacion_Sala_Cirugia.md`) que describe una agenda de coordinación
quirúrgica: visualizar/programar/reprogramar/controlar cirugías por sala,
con un panel de detalle contextual.

No existe en el repo ningún calendario por horas con bloques de duración
variable — `TurnosCalendar.jsx` (Gestión de Turnos) es una tabla
enfermera×día sin posicionamiento horario, y `ScheduleGrid.jsx` (Programar
cita) posiciona citas por CSS Grid pero con 1 slot fijo por cita, sin
expandir por duración. Este spec construye esa pieza nueva extendiendo la
técnica de `ScheduleGrid`, no reutilizándolo tal cual.

Decisiones ya validadas con el usuario (brainstorming previo):
- Sin sidebar interno (pedido explícito del encargo).
- La agenda semanal es de **una sola sala a la vez** (el filtro
  Sede/Sala determina qué semana de qué sala se ve — no hay grilla
  multi-sala).
- El toggle Día/Semana/Mes: **solo Semana queda funcional en V1**; Día y
  Mes quedan visibles en el control pero disparan un placeholder "en
  desarrollo" (dejar comentario en código marcando dónde conectar cada
  vista futura).
- Las acciones (reprogramar/cancelar/cambiar estado) **mutan datos reales
  en memoria** (mismo criterio que `AsignarTurnoModal`/
  `ReasignarTurnoModal` de Gestión de Turnos) — no son toasts sin efecto.
- Las 6 tabs del panel de detalle (Resumen/Procedimientos/Personal/
  Equipos/Insumos/Farmacia) llevan **cada una su propio contenido
  expandido**, no placeholders.
- No se agrega ícono de notificaciones al Topbar: ningún otro módulo de
  Clintos lo tiene hoy (`Topbar.jsx` no expone ese slot) — introducirlo es
  un elemento global fuera del alcance de esta pantalla.

## Alcance

**Sí, en V1:**
- Filtros (Sede/Sala/Fecha/Vista/Estado) + navegación de semana.
- Agenda semanal por horas, con tarjetas de cirugía posicionadas por
  hora de inicio + duración.
- Selección de una cirugía → panel de detalle contextual (sin navegar).
- Crear cirugía (normal y de urgencia), editar, reprogramar, cancelar,
  marcar como programada, marcar como incumplida.
- Panel de detalle con 6 tabs, cada una con contenido propio.
- Responsive: el panel de detalle colapsa a overlay lateral por debajo de
  `--bp-desktop`.

**No en V1** (queda estructuralmente preparado, no implementado):
- Vistas Día/Mes funcionales.
- Drag & drop de cirugías en la agenda (todo reagendamiento pasa por el
  modal Reprogramar).
- Reglas de disponibilidad/colisión de recursos, optimización automática,
  desplazamiento automático de otras cirugías al crear una de urgencia.
- Automatización de Farmacia (la tab es de solo lectura).
- Ícono/central de notificaciones en el Topbar.

## Modelo de datos (mock)

Archivo nuevo `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`,
siguiendo el patrón period-keyed de `mockProgramacionData.js` (Gestión de
Turnos):

```js
function periodKeyDeSemana(weekStart, salaId) { ... } // "week:2026-08-31:qx-1"

// registro de cirugía
{
  id, sedeId, salaId,
  paciente: { nombre, documento, edad, sexo, aseguradora },
  procedimientoPrincipal, cirujano,
  fecha,               // 'YYYY-MM-DD'
  horaInicio, horaFin, // 'HH:mm', múltiplos de 30 min
  estado: 'borrador' | 'programada' | 'urgencia' | 'cancelada' | 'incumplida',
  motivoCancelacion, motivoReprogramacion, // solo si aplica
  procedimientos: [{ nombre, tipo: 'principal'|'secundario', duracionMin, notas }],
  personal: [{ rol: 'Cirujano'|'Anestesiólogo'|'Instrumentadora'|'Circulante', nombre }],
  equipos: [{ nombre, estado: 'disponible'|'en-uso'|'mantenimiento' }],
  canasta: { nombre, items: [{ nombre, cantidad, estado: 'disponible'|'faltante' }] },
  farmacia: { numeroPedido, estado: 'en-preparacion'|'listo'|'entregado', fechaSolicitud, medicamentos: [{ nombre, dosis }] },
}
```

Store en memoria (array simple + funciones que lo mutan, sin
`localStorage` ni backend — se resetea al remontar la pantalla, mismo
criterio que el resto de mocks del proyecto):

- `fetchAgendaSemana({ sedeId, salaId, weekStart, estado })` — devuelve las
  cirugías de esa sala/semana (filtradas por estado si no es `'todos'`).
  Semanas/salas sin datos sembrados devuelven `[]` (estado vacío en la
  agenda, no error).
- `crearCirugia(datos)` — agrega con `estado:'borrador'` (o `'urgencia'`
  si se creó desde el flujo de urgencia).
- `actualizarCirugia(id, datos)` — usado por "Editar" (mismos campos que
  `crearCirugia`, sin tocar `estado`).
- `actualizarEstadoCirugia(id, nuevoEstado)` — usado por "Marcar como
  programada"/"Marcar como incumplida".
- `reprogramarCirugia(id, { fecha, horaInicio, horaFin, motivo })`.
- `cancelarCirugia(id, motivo)`.

Semilla inicial: sede `'02'` (Sede Norte), sala `'qx-1'` (Quirófano #1),
semana `2026-08-31` con las 8 cirugías del mockup (mismos
paciente/procedimiento/cirujano/horario/estado que la referencia visual)
para que la pantalla cargue con datos reales al abrir. Sala `'qx-2'` y
cualquier otra semana arrancan vacías.

`Sede`/`Sala`/`Estado` (para los selects de filtro) y catálogos de
`Procedimiento`/`Servicio`/`Tipo de cirugía`/`Cirujano`/`Equipos`/
`Canastas` (para el modal de creación) viven como listas constantes en el
mismo archivo mock.

## Layout general

`ProgramacionSalaCirugias.jsx` mantiene el shell ya existente (`.app` →
`Sidebar` + `.main` → `Topbar` + `.content`), reemplazando el bloque
placeholder por:

```
.content
 ├─ page header ("Programación sala de cirugías" + subtítulo, igual al placeholder actual)
 ├─ FiltrosBar
 ├─ AccionesBar
 └─ .psc-main-row (flex row, flex:1, min-height:0)
     ├─ AgendaSemana        (flex: 7)
     └─ DetalleCirugiaPanel (flex: 3, o estado vacío "Selecciona una cirugía" si no hay selección)
```

`.psc-main-row` sigue el precedente de `PanelGeneral.jsx` (`.pg-main-row`)
— layout docked de página, no un modal/overlay.

## Filtros (`FiltrosBar/FiltrosBar.jsx`)

- Sede — `FormSelect`.
- Sala/Quirófano — `FormSelect`, catálogo dependiente de la sede elegida.
- Fecha — input de fecha + flechas `<`/`>` que avanzan por semana
  completa (la única vista funcional), mostrando la fecha ancla
  (lunes de la semana visible, formato `DD/MM/AAAA` como el mockup).
- Vista — segmented control propio de 3 botones (Día/Semana/Mes). Al
  hacer click en Día o Mes: no cambia la grilla, solo dispara
  `window.ncToast?.('Vista {día|mes} en desarrollo')` y no marca ese botón
  como activo (Semana permanece la única seleccionable/activa) — mismo
  mecanismo de toast ya usado en otras pantallas del proyecto. No se
  reutiliza `SegmentedFilterBar` (siempre renderiza un contador `(n)` que
  no aplica acá).
- Estado — `FormSelect` (`Todos` + los 5 estados).

Cambiar Sede/Sala/Fecha/Estado dispara `fetchAgendaSemana` con los nuevos
valores.

## Barra de acciones (`AccionesBar/AccionesBar.jsx`)

- `Button variant="primary" icon={LuPlus}` "Nueva cirugía" + botón
  pequeño con `LuChevronDown` al lado que abre un menú de 1 ítem
  ("Cirugía de urgencia") — mismo patrón visual de split-button que ya
  usa `TurnoRowActionsMenu.jsx` para menús contextuales.
- `Button variant="secondary"` "Reprogramar" y "Cancelar" —
  `disabled` cuando no hay cirugía seleccionada, o cuando la
  seleccionada está en `cancelada`/`incumplida` (estados terminales).
- `Button variant="secondary" icon={LuChevronDown}` "Más acciones" abre
  un menú con "Marcar como programada" (habilitado solo si la
  seleccionada está en `borrador`/`urgencia`), "Marcar como incumplida"
  (solo si está en `programada`), "Ver información/historial" (abre el
  panel de detalle si no está abierto, sin acción adicional — no hay un
  historial de auditoría real en el mock, así que solo enfoca el tab
  Resumen).

## Agenda semanal (`AgendaSemana/AgendaSemana.jsx`)

Pieza nueva de UI — extiende la técnica de `ScheduleGrid.jsx` (CSS Grid)
para soportar bloques de duración variable:

- `grid-template-columns`: `[gutter] 64px repeat(7, 1fr)`.
- `grid-template-rows`: fila de encabezado (día + fecha, con estado
  `today` resaltado como en `TurnosCalendar`) + N filas de **30 minutos**
  entre 06:00 y 20:00 (28 filas), altura fija por fila (~26px) — la
  granularidad de 30 min es necesaria porque el mockup tiene horarios
  como `07:30`/`09:30`, no solo horas en punto.
- Encabezado propio sobre la grilla: `< Semana 36 - Agosto 2026 >` con
  flechas que mueven `weekStart` (mismo estado que las flechas de la
  fila de filtros — una sola fuente de verdad, ambos controles quedan
  sincronizados).
- Gutter de horas: una etiqueta cada 2 filas (cada hora en punto),
  alineada al `grid-row` correspondiente.
- Cada `CirugiaCard` se posiciona con
  `style={{ gridColumn: dayIdx + 2, gridRow: `${startSlot + 2} / span ${durationSlots}` }}`,
  calculado desde `horaInicio`/`horaFin`.
- Colisión: si dos cirugías de la misma sala/día se solapan en horario
  (caso borde, no debería ocurrir con una sola sala activa), se renderizan
  lado a lado dentro de la misma región de grilla (`display:flex` en un
  contenedor por celda-día) — sin layout de colisión avanzado, es
  suficiente para no ocultar datos.
- Scroll vertical propio dentro de la grilla (el rango 06:00–20:00 no
  necesita entrar completo en pantalla).
- Leyenda de estados al pie (`Estados: ● Programada ● Borrador ●
  Urgencia ● Cancelada ● Incumplida`), reutilizando `EstadoCirugiaBadge`.

## Tarjeta de cirugía (`CirugiaCard/CirugiaCard.jsx`)

Jerarquía fija (horario → paciente → procedimiento → cirujano → estado),
igual al mockup. Click selecciona (resalta con borde/fondo `--primary-50`
y carga el panel de detalle); no navega. Color de fondo por estado
(tokens ya existentes, ver sección de badges) — el texto del estado
siempre visible, nunca solo color.

## Badges de estado (`EstadoCirugiaBadge/EstadoCirugiaBadge.jsx`)

Ícono + texto (nunca solo color), un componente por feature (mismo
criterio que `TurnoBadges`/`EstadoCamaBadge`), mapeando a tokens ya
existentes en el proyecto — no se inventan colores nuevos:

| Estado | Tono | Tokens |
|---|---|---|
| Programada | verde | `--green` / `--green-bg` |
| Borrador | azul | `--primary` / `--primary-50` |
| Urgencia | violeta | `--violet-fg` / `--violet-bg` |
| Cancelada | rojo | `--red` / `--red-bg` |
| Incumplida | gris | `--gray-fg` / `--gray-bg` |

## Panel de detalle (`DetalleCirugiaPanel/DetalleCirugiaPanel.jsx`)

Docked (no overlay) siguiendo el precedente de `PanelGeneral.jsx`
(`.pg-main-row`). Sin selección: estado vacío centrado ("Selecciona una
cirugía de la agenda para ver su detalle"). Con selección:

- Header: "Detalle de la cirugía" + `ID {id}` a la derecha, y
  `EstadoCirugiaBadge` debajo del título.
- Info básica en 2 columnas (Paciente: nombre/documento/edad-sexo/
  aseguradora — Cirugía: procedimiento principal/cirujano/sala/fecha y
  hora/duración).
- Tabs (`card-tabs-bar`/`card-tab`, mismo patrón ARIA de
  `AtencionPaciente.jsx`: `role="tablist"`, roving tabindex, flechas de
  teclado): Resumen | Procedimientos | Personal | Equipos | Insumos |
  Farmacia. Activa por defecto: Resumen.
  - **Resumen**: procedimiento principal, personal asignado resumido (4
    roles) + link "Ver todo el personal (N)" que cambia a la tab
    Personal, equipos resumidos (primeros 2) + "Ver todos (N)" → tab
    Equipos, insumos (nombre de canasta + conteo + estado `Completa`/
    `Incompleta` según si algún ítem está `faltante`) + "Ver canasta" →
    tab Insumos, farmacia (número de pedido + estado) + "Ver pedido" →
    tab Farmacia.
  - **Procedimientos**: lista completa (`procedimientos[]`) con nombre,
    tipo (principal/secundario, con badge), duración estimada y notas.
  - **Personal**: lista completa (`personal[]`) con rol + nombre (mismo
    patrón visual `.tc-nurse`/`.tc-avatar` de `TurnosCalendar.jsx` para el
    avatar circular con iniciales).
  - **Equipos**: lista completa (`equipos[]`) con nombre + estado
    (disponible/en uso/mantenimiento, con color).
  - **Insumos**: nombre de la canasta + tabla de `items[]`
    (nombre/cantidad/estado).
  - **Farmacia**: número de pedido, estado, fecha de solicitud, tabla de
    `medicamentos[]` (nombre/dosis). Solo lectura (sin acción de
    automatización, según alcance).
- Acciones inferiores: `Button variant="secondary"` Editar (reabre el
  modal de creación en modo edición, precargado), `Button
  variant="secondary"` Reprogramar, `Button variant="danger"` Cancelar —
  mismas reglas de habilitación que en `AccionesBar`.

Responsive: por debajo de `--bp-desktop` (1024px), el panel deja de estar
en flujo (`.psc-main-row` pasa a que `AgendaSemana` ocupe todo el ancho) y
se muestra como overlay lateral al seleccionar una cirugía, reutilizando
la forma CSS de `TaskDetailPanel.css`/`AlertDetailDrawer.css`
(`position:fixed;inset:0` + panel `width:400-420px` con
`transform:translateX` de entrada, cierre por Escape/backdrop/X).

## Modales

Los 3 con `ModalHeader` homologado (ver AGENTS.md).

**`modals/NuevaCirugiaModal/NuevaCirugiaModal.jsx`** — mismo componente
para alta normal y de urgencia (prop `urgencia:boolean`):
- Paciente: Documento (texto), Nombre (texto) — campos simples, sin el
  buscador compartido de paciente de otras pantallas (el encargo solo
  pide estos 2 campos, no una búsqueda/alta completa).
- Procedimiento: Procedimiento/Servicio/Tipo de cirugía/Cirujano
  (`FormSelect`, catálogos del mock).
- Programación: Sala (`FormSelect`), Fecha, Hora inicio, Hora fin/
  duración.
- Recursos: Personal (un `FormSelect` por rol: Cirujano ya viene de
  arriba, + Anestesiólogo/Instrumentadora/Circulante), Equipos
  (checklist multi-selección sobre el catálogo mock), Insumos (elegir
  una canasta vía `FormSelect`, mismo concepto que la tab Insumos del
  detalle).
- Si `urgencia === true`: banner de alerta fijo arriba del formulario
  ("Esta cirugía será registrada como urgencia y puede afectar la
  programación existente de la sala.") y `crearCirugia` guarda
  `estado:'urgencia'` en vez de `'borrador'`.
- Confirmar → `crearCirugia`, cierra modal, selecciona la nueva cirugía
  (abre su detalle), toast de confirmación.
- Modo edición (abierto desde "Editar" en el panel de detalle): mismo
  componente con `cirugiaExistente` precargando todos los campos; el
  título del `ModalHeader` cambia a "Editar cirugía" y confirmar llama
  `actualizarCirugia(id, datos)` en vez de `crearCirugia` (sin tocar
  `estado`).

**`modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal.jsx`**:
- Muestra fecha/hora actuales (solo lectura), inputs de nueva fecha/hora,
  motivo (textarea, obligatorio).
- Confirmar deshabilitado sin motivo. Al confirmar:
  `reprogramarCirugia(id, {...})`, mantiene el `estado` actual (no
  cambia a "programada" automáticamente), toast de confirmación.

**`modals/CancelarCirugiaModal/CancelarCirugiaModal.jsx`**:
- Confirmación con motivo obligatorio (textarea), botón destructivo
  "Cancelar cirugía" (`variant="danger"`) deshabilitado sin motivo.
- Al confirmar: `cancelarCirugia(id, motivo)` → `estado:'cancelada'`,
  cierra modal, deselecciona (o mantiene seleccionada mostrando ya el
  estado cancelado — se mantiene seleccionada, para que el usuario vea
  el resultado inmediato en el panel), toast de confirmación.

## Estructura de archivos

```
src/app/programacion-sala-cirugias/page.jsx                      (sin cambios, ya existe)
src/Components/ProgramacionSalaCirugias/
  ProgramacionSalaCirugias.jsx / .css   (reemplaza el placeholder)
  FiltrosBar/FiltrosBar.jsx / .css
  AccionesBar/AccionesBar.jsx / .css
  AgendaSemana/AgendaSemana.jsx / .css
  CirugiaCard/CirugiaCard.jsx / .css
  EstadoCirugiaBadge/EstadoCirugiaBadge.jsx / .css
  DetalleCirugiaPanel/
    DetalleCirugiaPanel.jsx / .css
    tabs/
      ResumenTab/ResumenTab.jsx / .css
      ProcedimientosTab/ProcedimientosTab.jsx / .css
      PersonalTab/PersonalTab.jsx / .css
      EquiposTab/EquiposTab.jsx / .css
      InsumosTab/InsumosTab.jsx / .css
      FarmaciaTab/FarmaciaTab.jsx / .css
  modals/
    NuevaCirugiaModal/NuevaCirugiaModal.jsx / .css
    ReprogramarCirugiaModal/ReprogramarCirugiaModal.jsx / .css
    CancelarCirugiaModal/CancelarCirugiaModal.jsx / .css
src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js
```

## Testing

Sin suite automatizada en este proyecto — verificación manual con el
servidor de desarrollo:
1. Cargar la pantalla → semana 2026-08-31, sala Quirófano #1 carga las 8
   cirugías sembradas, posicionadas correctamente por horario/duración.
2. Cambiar a Quirófano #2 (u otra semana) → estado vacío de agenda.
3. Click en una cirugía → panel de detalle carga info + 6 tabs, cada tab
   muestra su contenido propio (no vacío).
4. Nueva cirugía → completar formulario → aparece en la agenda como
   Borrador, seleccionada.
5. Cirugía de urgencia → banner de alerta visible → aparece con badge
   Urgencia (violeta).
6. Reprogramar una cirugía → motivo vacío bloquea confirmar → con motivo,
   la tarjeta se mueve en la agenda al nuevo horario.
7. Cancelar una cirugía → motivo obligatorio → tarjeta pasa a estado
   Cancelada (rojo), acciones Reprogramar/Cancelar quedan deshabilitadas
   para ella.
8. "Marcar como programada" sobre una en Borrador → badge cambia a
   Programada; "Marcar como incumplida" sobre una Programada → badge
   cambia a Incumplida.
9. Achicar la ventana por debajo de 1024px → el panel de detalle deja de
   estar docked y aparece como overlay al seleccionar una cirugía.
10. Click en Día o Mes del segmented control → toast "en desarrollo",
    Semana sigue siendo la única vista activa.
