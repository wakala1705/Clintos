# Revisión de programaciones vencidas — Programación de Sala de Cirugía

## Contexto

El sistema legado tiene una ventana "Listado de Programaciones - Revisión"
que lista las programaciones en estado P (Programada) con fecha anterior a
hoy y pide "verificar el estado y resolver la inconsistencia". Problemas de
usabilidad encontrados en esa pantalla:

1. No dice cuál es la inconsistencia de cada fila — hay que deducirla
   cruzando los checkboxes "Ped. Inventario" y "Traslado a Cirugía".
2. "No. Programación" ocupa ~35% del ancho para 4 dígitos; los nombres
   quedan apretados y hay columnas ocultas con scroll horizontal.
3. Sin conteo de registros ni paginación visible.
4. Sin selección múltiple — "Cambiar estado" actúa fila por fila.
5. "Cambiar estado" no dice a qué estado cambia.
6. Checkboxes de solo lectura con apariencia editable.
7. Densidad excesiva: filas de ~18px, nombre en 4 columnas separadas.
8. Encabezados inconsistentes (unos con lupa, otros con embudo, otros nada).
9. Pendientes de hace años (2022) sin cerrar — la revisión no es visible
   en el trabajo diario.

Este spec rediseña esa pantalla dentro del módulo existente
`programacion-sala-cirugias` (ver
`2026-08-31-programacion-sala-cirugia-design.md`), reusando sus estados
(`realizada`/`incumplida`/`cancelada`) y sus modales de cancelar y
reprogramar.

## Decisiones

| Decisión | Elegido | Descartado |
|---|---|---|
| Punto de acceso | Banner ámbar en la agenda + subruta propia | Modal automático al entrar (interrumpe siempre, no escala a cientos de filas); pestaña dentro de la página (queda escondida) |
| Acciones de resolución | Realizada, Incumplida, Cancelar, Reprogramar; lote solo Realizada e Incumplida | Las 4 en lote (Cancelar/Reprogramar necesitan datos por fila) |
| Señalar la inconsistencia | Tipo derivado (3 tipos) como `<Badge>` + acción sugerida | Solo íconos de pedido/traslado sin clasificar |
| Layout | Tabla + menú "⋯" por fila + barra de lote, con fila expandible para insumos | Maestro-detalle (lento en lote, resta ancho); cola una por una (no escala) |

## Alcance

**Incluye**: banner en la agenda, página `/programacion-sala-cirugias/revision`,
clasificación de inconsistencias, filtros, tabla con selección y fila
expandible, las 4 acciones (individual y en lote donde aplica), deshacer,
estado vacío, datos mock.

**No incluye**: registrar horas reales de inicio/fin al marcar realizada;
integración real con inventario (la "devolución" / "consumo" de insumos
solo se registra como marca en el mock); exportar el listado; permisos por
rol.

## Clasificación de inconsistencias

Función pura `clasificarInconsistencia(programacion)` en
`src/hooks/ProgramacionSalaCirugias/clasificarInconsistencia.js`. Se evalúa
en este orden (la primera que cumple gana):

| Tipo (`id`) | Regla | Badge | Acción sugerida |
|---|---|---|---|
| `trasladado` — Trasladado sin cierre | `traslado != null` | `tone="info"` | Marcar realizada |
| `insumos` — Insumos comprometidos | `pedidoInventario != null` y `traslado == null` | `tone="danger"` | Ver insumos (expande la fila) |
| `sin-actividad` — Sin actividad | sin pedido y sin traslado | `tone="neutral"` | Marcar incumplida |

Orden de prioridad para ordenar el listado: `insumos` → `trasladado` →
`sin-actividad`.

## Modelo de datos (mock)

Se amplía `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`:

- Campo nuevo en el registro de cirugía: `traslado: { numeroAdmision } | null`.
- `pedidoInventario` se deriva de `farmacia?.numeroPedido` (no es campo nuevo).
- Semilla de ~40 programaciones vencidas (fechas 2022-08-24 a 2022-09-05,
  salas Quirófano #1, Quirófano #2 y Gastroenterología, mismos pacientes
  de la captura del sistema legado), cubriendo los 3 tipos.
- Sala nueva en el catálogo: `Gastroenterología`.

Funciones nuevas:

- `fetchVencidas({ hoy })` — cirugías en `programada` con `fecha < hoy`,
  cada una con su `inconsistencia` ya calculada.
- `contarVencidas({ hoy })` — `{ total, insumos, trasladado, sinActividad }`
  para el banner y el resumen.
- `marcarRealizadas(ids)` — pasa a `realizada`; si tenía pedido, marca
  `farmacia.resolucionInsumos = 'consumido'`. Devuelve un `snapshot` para
  deshacer.
- `marcarIncumplidas(ids, { causal, observacion })` — pasa a `incumplida`
  con motivo; si tenía pedido, marca `farmacia.resolucionInsumos =
  'devolucion'`. Devuelve `snapshot`.
- `deshacerResolucion(snapshot)` — restaura los registros previos.

Cancelar y Reprogramar usan `cancelarCirugia`/`reprogramarCirugia` ya
existentes (cancelar también marca `resolucionInsumos = 'devolucion'` si
hay pedido).

## Banner en la agenda (`RevisionPendienteBanner`)

Montado en `ProgramacionSalaCirugias.jsx` entre el page header y
`FiltrosBar`. Solo se renderiza si `total > 0`.

> ⚠ **38 programaciones vencidas sin cerrar** · 6 con insumos comprometidos &nbsp; [Revisar →]

- Tono ámbar (`--amber-bg`/`--amber-fg`), ícono `LuTriangleAlert`.
- "· N con insumos comprometidos" solo si N > 0.
- "Revisar" es un `<Link>` a `/programacion-sala-cirugias/revision`.

## Página (`RevisionVencidas`)

Ruta `src/app/programacion-sala-cirugias/revision/page.jsx` con el shell
del módulo (`Sidebar` + `Topbar` + `.content`), importa `shared.css`.

```
.content
 ├─ Breadcrumb  "Programación sala de cirugías › Revisión de vencidas"
 ├─ Page header "Programaciones vencidas sin cerrar"
 │    subtítulo: "Estado Programada con fecha anterior a hoy. Resuelve cada una para liberar insumos y cerrar la agenda."
 ├─ VencidasResumen: 3 contadores (Insumos comprometidos · Trasladado sin cierre · Sin actividad)
 └─ Card del listado
     ├─ VencidasFiltrosBar
     ├─ VencidasTable
     ├─ Paginación "1–50 de 312" (50 por página)
     └─ AccionesLoteBar (solo con selección)
```

### Filtros (`VencidasFiltrosBar`)

Una sola fila `.filter-bar`, en el orden fijo del proyecto:
buscador (paciente, documento o No. programación) · `.filter-spacer` ·
`SegmentedFilterBar` [Todas | Insumos comprometidos | Trasladado sin cierre
| Sin actividad] con conteo · `FilterDropdown` Sala · rango de fechas ·
"Limpiar filtros" (solo si hay filtros activos).

Los contadores del resumen son clicables y activan el chip del mismo tipo.

### Tabla (`VencidasTable`)

| # | Columna | Contenido |
|---|---|---|
| 1 | ☐ | checkbox; el del header selecciona la página (estado indeterminado si parcial) |
| 2 | Inconsistencia | `InconsistenciaBadge` (`<Badge dot>`) |
| 3 | Paciente | **APELLIDOS, Nombres** / documento debajo (`--fs-sm`, `--ink-500`) |
| 4 | Fecha programada | `02/09/2022 · 07:20` / "vencida hace 4 años" debajo |
| 5 | Sala | texto |
| 6 | Duración | `20 min`, alineada a la derecha (th incluido) |
| 7 | No. Prog. / Consecutivo | `5617` / `0200000042` debajo |
| 8 | Trazabilidad | `LuPackage` Pedido N° · `LuDoorOpen` Adm. N°, o "—" |
| 9 | Acciones | botón de acción sugerida (`<Button size="sm" variant="outline">`) + `DropdownMenu` |

- Encabezado principal con tokens `--th-*`, `--table-header-bg`, sticky con
  `--z-sticky`; columnas ordenables (Inconsistencia, Paciente, Fecha, Sala,
  Duración).
- Orden por defecto: prioridad de tipo, luego fecha ascendente.
- Fila de 44px; sin scroll horizontal a 1280px.
- `DropdownMenu` "⋯": Marcar realizada · Marcar incumplida (`warn`) ·
  Reprogramar · Cancelar (`danger`, `dividerBefore`).
- Filas tipo `insumos` tienen chevron (`aria-expanded`) que abre
  `InsumosComprometidosRow`: N° de pedido, estado del pedido, lista de
  insumos/medicamentos y la nota "Al cancelar o marcar incumplida, el
  pedido se marca para devolución." El botón "Ver insumos" hace lo mismo.

### Estado vacío

"✓ No hay programaciones vencidas. La agenda está al día." + botón
"Volver a la agenda". Con filtros activos sin resultados:
"Ninguna programación coincide con los filtros." + "Limpiar filtros".

## Flujos de resolución

**Marcar realizada**
- Individual: directo, sin modal. Fila sale del listado; toast
  "Programación 5617 marcada como realizada · Deshacer" (5 s, `role="status"`).
- Lote: `ConfirmarRealizadasDialog` (diálogo centrado sin header, patrón
  `.nc-discard-modal`): "¿Marcar 12 programaciones como realizadas? Esta
  acción queda registrada en la trazabilidad de cada una." Si hay filas con
  pedido: "4 tienen insumos pedidos; se registrarán como consumidos."
  → [Cancelar] [Marcar realizadas]. Toast con Deshacer al confirmar.

**Marcar incumplida** — `MarcarIncumplidaModal` (`ModalHeader
tone="warning"`), individual o lote:
- Título: "Marcar como incumplida" / "Marcar 12 programaciones como incumplidas".
- Causal: `FormSelect` obligatorio (catálogo de causales existente).
- Observación: textarea opcional.
- Aviso ámbar si alguna tiene pedido: "3 de las programaciones tienen
  pedido de insumos; se marcarán para devolución."
- Confirmar deshabilitado sin causal. Toast con Deshacer al confirmar.

**Cancelar** — reusa `CancelarCirugiaModal`, solo individual.

**Reprogramar** — reusa `ReprogramarCirugiaModal`, solo individual. Fecha
anterior o igual a hoy bloquea con "La nueva fecha debe ser posterior a
hoy." Al confirmar, la programación sale del listado.

**Barra de lote (`AccionesLoteBar`)** — fija al pie de la card,
`role="region"` + `aria-live="polite"`:
"**12 seleccionadas** · [Marcar realizadas] [Marcar incumplidas] ·
Deseleccionar". La selección se limpia al cambiar filtro o página.

Tras cualquier resolución se recalculan resumen, conteos de chips y banner.

## Estructura de archivos

```
src/app/programacion-sala-cirugias/revision/page.jsx               (nuevo)
src/Components/ProgramacionSalaCirugias/
  ProgramacionSalaCirugias.jsx                                     (monta el banner)
  RevisionPendienteBanner/RevisionPendienteBanner.jsx / .css       (nuevo)
  RevisionVencidas/RevisionVencidas.jsx / .css                     (nuevo)
  revision/
    VencidasResumen/VencidasResumen.jsx / .css
    VencidasFiltrosBar/VencidasFiltrosBar.jsx / .css
    VencidasTable/VencidasTable.jsx / .css
    InconsistenciaBadge/InconsistenciaBadge.jsx / .css
    InsumosComprometidosRow/InsumosComprometidosRow.jsx / .css
    AccionesLoteBar/AccionesLoteBar.jsx / .css
    ConfirmarRealizadasDialog/ConfirmarRealizadasDialog.jsx / .css
  modals/MarcarIncumplidaModal/MarcarIncumplidaModal.jsx / .css     (nuevo)
src/hooks/ProgramacionSalaCirugias/
  mockCirugiaData.js                                               (se amplía)
  clasificarInconsistencia.js                                      (nuevo)
```

Componentes del proyecto reusados: `Button`, `Badge`, `DropdownMenu`,
`ModalHeader`, `FormSelect`, `SegmentedFilterBar`, `FilterDropdown`,
`CancelarCirugiaModal`, `ReprogramarCirugiaModal`. Sin `.btn`/`.badge`/menú
propio; tipografía solo con tokens `--fs-*`/`--fw-*`; íconos Lucide.

## Accesibilidad

- Badge siempre con texto + punto (nunca solo color).
- Checkbox del header: `aria-label="Seleccionar todas las de esta página"`,
  estado indeterminado.
- Chevron de fila expandible con `aria-expanded` + `aria-controls`.
- Barra de lote con `aria-live="polite"`; toast con `role="status"`.
- Trazabilidad con texto visible junto al ícono (ícono `aria-hidden`).

## Verificación

Sin suite automatizada en el proyecto: `npm run lint` limpio + revisión
manual en el dev server:

1. Con vencidas sembradas, el banner aparece en la agenda con sus conteos;
   "Revisar" navega a la subruta.
2. Los chips filtran y sus conteos coinciden con el resumen.
3. "Marcar realizada" en una fila → sale del listado + toast; "Deshacer" la
   devuelve.
4. Seleccionar 5 → "Marcar incumplidas" → sin causal no confirma; con causal
   salen las 5.
5. Fila con insumos → chevron / "Ver insumos" expande el pedido.
6. Reprogramar a fecha pasada → bloqueado; a fecha futura → sale del listado.
7. Resolver todas → estado vacío; al volver a la agenda el banner ya no está.
8. A 1280px de ancho no hay scroll horizontal.
