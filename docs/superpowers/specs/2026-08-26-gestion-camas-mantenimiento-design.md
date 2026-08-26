# Gestión de Camas — pantalla "Mantenimiento"

Fecha: 2026-08-26

## Contexto

Gestión de Camas ya tiene un sidebar interno de 3 secciones (Operación /
Planificación / Administración, `GestionCamasSidebar.jsx`) con pantallas
hermanas que siguen todas el mismo esqueleto: KPI row → filter-bar → tabla
densa → paginación, más un set de modales por acción (ver
`GestionCamasLimpieza` y `GestionCamasReservas` como referencia directa).
"Mantenimiento" es una pantalla nueva dentro de ese mismo sidebar, sección
Operación, después de "Limpieza".

`mockCamasData.js` (la pantalla "Camas") ya modela un estado de cama
`mantenimiento` con un campo `mantenimientoTipo` y acciones
`ver-mantenimiento`/`finalizar-mantenimiento` en su menú "⋯" — es el punto de
enganche para la sincronización conceptual que pide la sección 13 del
encargo. Esta pantalla no toca ese código; solo modela sus propios datos de
forma que `cama` coincida con el `numero` de cama usado en `mockCamasData.js`,
dejando la sincronización real como trabajo futuro explícitamente fuera de
alcance.

## Alcance

Pantalla nueva `/gestion-camas/mantenimiento`: dashboard de KPIs, tabla de
tareas de mantenimiento (no de camas), filtros, paginación, modal de
creación, modal de detalle con historial, y 5 modales de acción por cambio de
estado. Ítem nuevo en el sidebar interno del módulo. Sin gráficos, sin
calendario, sin costos/proveedores/SLA — ver sección 14 del encargo original
(principios de diseño), que se adopta tal cual.

## Modelo de datos (mock)

`src/hooks/GestionCamas/mockMantenimientoData.js`, mismo criterio de
duplicación por pantalla que `mockLimpiezaData.js`/`mockReservasData.js` (no
se importa de `mockCamasData.js`):

```js
SEDES = [{ value:'todas', label:'Todas las sedes' }, { value:'central', label:'Sede Central' }, ...]
AREAS = [{ value:'todas', label:'Todas las áreas' }, { value:'urgencias', ... }, ...]
TIPOS = [{ value:'todos', label:'Todos' }, { value:'preventivo', label:'Preventivo' }, { value:'correctivo', label:'Correctivo' }]
PRIORIDADES = [{ value:'todas', label:'Todas' }, { value:'alta', ... }, { value:'media', ... }, { value:'baja', ... }]
ESTADOS = [{ value:'todos', label:'Todos' }, programado, en-proceso, vencido, finalizado, cancelado]
PISOS / SECTORES  // mismas listas que mockLimpiezaData.js, para "Más filtros"
```

Registro de mantenimiento:

```js
{
  id: 'MNT-1',
  cama: '101-A',            // mismo valor que `numero` en mockCamasData.js — punto de enganche futuro
  ubicacion: 'Piso 1 · Sector A',
  piso: 'piso-1', sector: 'sector-a',
  sede: 'central', area: 'urgencias',
  tipo: 'preventivo',       // preventivo | correctivo
  prioridad: 'media',       // alta | media | baja
  estado: 'programado',     // programado | en-proceso | vencido | finalizado | cancelado
  fechaProgramada: <timestamp>,
  responsable: { nombre: 'Juan Pérez', rol: '...' },
  descripcion: 'Revisión general de estructura, ruedas y mecanismos de elevación.',
  historial: [
    { id, tipo: 'creado'|'programado'|'iniciado'|'reprogramado'|'cancelado'|'finalizado'|'observacion', fecha, usuario, motivo? },
  ],
}
```

`estado` es un valor fijo del seed (igual que el resto del módulo) — "Vencido"
no se recalcula en vivo contra la fecha actual; es una condición que ya trae
el registro, mismo criterio que `TAREAS_SEED` en `mockLimpiezaData.js` (no
inventar lógica de vencimiento que el encargo no pidió — ver sección 14,
"no SLA").

Semilla: los 8 registros exactos de la sección 6 del encargo. KPIs con patrón
`OFFSETS` (igual que `mockLimpiezaData.js`): Programados=12, En proceso=4,
Vencidos=2, Finalizados=25 son el total "global"; el seed visible aporta 3/2/
2/1 respectivamente — el resto es offset fijo, igual que el resto del módulo.
La paginación (sección 10 del encargo, "1–10 de 43") es ilustrativa del look
de la UI, no una cantidad de filas a fabricar: `MantenimientoPagination`
pagina sobre el total real filtrado (8 en el seed), mismo componente/patrón
que `ReservasPagination.jsx`.

## Sidebar interno

`GestionCamasSidebar.jsx`, sección `operacion`, nuevo ítem después de
`limpieza`:

```js
{ id: 'mantenimiento', label: 'Mantenimiento', href: '/gestion-camas/mantenimiento', icon: LuWrench }
```

`LuWrench` ya está importado en el sidebar *global* (`Sidebar.jsx`, para
"Utilitarios") pero no en este sidebar interno — se importa acá igual, es un
ícono nuevo en este árbol.

## Layout de la pantalla

`GestionCamasMantenimiento.jsx` (misma estructura que
`GestionCamasLimpieza.jsx`): `<div className="app"><Sidebar/><div
className="main"><Topbar section=[...] page="Mantenimiento"
.../><div className="content cbm-content"><GestionCamasSidebar/><div
className="cbm-page-body">...`. Header con `<h1>Mantenimiento</h1>` +
descripción + botón primario "+ Programar mantenimiento" (abre
`ProgramarMantenimientoModal`).

### KPI row (4 cards, `KpiCard`)

| Card | Ícono | variant | Valor |
|---|---|---|---|
| Programados | `LuCalendarClock` | `info` | 12 |
| En proceso | `LuWrench` | `warning` | 4 |
| Vencidos | `LuTriangleAlert` | `danger` | 2 |
| Finalizados | `LuCircleCheck` | `neutral` | 25 |

`danger` en Vencidos le da el mayor peso visual que pide la sección 4 del
encargo, mismo mecanismo que usa `KpiCard` en el resto del proyecto (no un
tratamiento custom nuevo).

### Filter-bar

Buscador (`cama`/`tipo`/`responsable`) + `filter-spacer` + `AreaSelector` x5
(Sede, Área, Tipo, Estado, Prioridad) + `MantenimientoFechaSelector` (rango,
ver abajo) + `MantenimientoFiltrosPopover` ("Más filtros": Piso, Sector — 
mismo criterio que Limpieza/Camas de mandar el refinamiento de ubicación a
"Más filtros") + botón "Limpiar filtros" condicional (mismo patrón
`cantidadFiltrosActivos`/`badge-count` que `GestionCamasLimpieza.jsx`).

`MantenimientoFechaSelector`: mismo patrón trigger+popover que
`FechaSelector.jsx` (Reservas), pero con dos `<input type="date">` (Desde/
Hasta) en vez de uno — única pieza nueva de interacción de este encargo, el
resto reutiliza componentes/patrones ya existentes tal cual.

### Tabla

Columnas: Cama (código + `cell-sub` ubicación) · Sede · Área · Mantenimiento
(tipo) · Prioridad (`PrioridadBadge`) · Fecha programada · Estado
(`EstadoMantenimientoBadge`) · Responsable · Acciones.

Celda Acciones = mismo patrón que `BedTable.jsx` (Camas), **no** el de
Limpieza: botón ícono `LuEye` ("Ver detalle") + `MantenimientoRowActionsMenu`
("⋯"), sin botones de texto grandes en la fila (encargo sección 9, explícito:
"no colocar botones grandes... alta densidad"). Clic en la fila completa
también abre el detalle (encargo sección 11).

### Badges

`MantenimientoBadges.jsx` (mismo archivo/carpeta para los dos, igual que
`LimpiezaBadges.jsx`):

- `EstadoMantenimientoBadge`: Programado=azul (`blue-bg`/`blue-fg`), En
  proceso=ámbar (`amber-bg`/`amber-fg`), Vencido=rojo (`red-bg`/`red`),
  Finalizado=verde (`green-bg`/`#0d7a3d`, `var(--green)` en dark), Cancelado=
  gris (`gray-bg`/`gray-fg`) — mismos tokens que `cbl-tono-*`
  (`LimpiezaBadges.css`), redeclarados con prefijo propio `cbm-tono-*` (ver
  AGENTS.md, cada badge-component duplica la forma en vez de importar
  cruzado).
- `PrioridadBadge`: Alta=rojo (tratamiento de alerta), Media=ámbar
  (intermedio), Baja=gris (discreto) — mismos 3 tonos, sin íconos grandes
  (encargo sección 8: "no utilizar iconos grandes" → sin ícono, solo texto en
  la píldora, a diferencia de `EstadoMantenimientoBadge` que sí lleva ícono).

### Menú "⋯" por estado (`MENU_ACCIONES` en el mock, mismo patrón mapa-por-
estado que `mockLimpiezaData.js`)

```js
programado: ['ver-detalle', 'iniciar-mantenimiento', 'reprogramar', 'cancelar']
'en-proceso': ['ver-detalle', 'finalizar-mantenimiento', 'registrar-observacion']
vencido: ['ver-detalle', 'iniciar-mantenimiento', 'reprogramar', 'cancelar']
finalizado: ['ver-detalle', 'ver-historial']
cancelado: ['ver-detalle']   // no especificado en el encargo; solo-lectura por consistencia
```

`ver-detalle` y `ver-historial` abren el mismo `MantenimientoDetailModal`
(confirmado con el usuario) — ese modal siempre incluye la sección
HISTORIAL, así que no hace falta un modal de historial aparte.

## Modales

Todos con `ModalHeader` (icon/tone/title acorde) y `modal-overlay`/
`modal-card`, mismo esqueleto que el resto del proyecto.

1. **`ProgramarMantenimientoModal`** (CTA header) — campos: Cama (text,
   requerido), Sede (`FormSelect`), Área (`FormSelect`), Tipo
   (`FormSelect`: Preventivo/Correctivo), Prioridad (`FormSelect`: Alta/
   Media/Baja), Fecha programada (`type="date"` + `type="time"`, mismo split
   que `NuevaReservaModal.jsx`), Responsable (text), Descripción (textarea).
   Nace en estado `programado`. Mismas validaciones/estructura de errores que
   `NuevaReservaModal.jsx`.
2. **`MantenimientoDetailModal`** — secciones MANTENIMIENTO (tipo + badge de
   estado en el header vía `subtitle`), CAMA (código + sede/área/ubicación),
   DETALLE (grid tipo/prioridad/fecha/responsable + descripción en línea
   completa), HISTORIAL (lista de eventos, mismo componente visual que
   `InconsistenciaHistorialModal.cbi-historial-*`, reutilizado con prefijo
   `cbm-`). Si `estado === 'en-proceso'`, footer con botón primario
   "Finalizar mantenimiento" que abre `FinalizarMantenimientoModal` (cierra
   este modal primero, mismo patrón que
   `InconsistenciaDetailModal`→`onCorregir`).
3. **`IniciarMantenimientoModal`** — confirmación simple (mismo patrón que
   `IniciarLimpiezaModal`): pasa a `en-proceso`, agrega evento `iniciado` al
   historial.
4. **`FinalizarMantenimientoModal`** — confirmación (mismo patrón que
   `FinalizarLimpiezaModal`) + campo opcional de observación final; pasa a
   `finalizado`, agrega evento `finalizado`.
5. **`ReprogramarMantenimientoModal`** — form con nueva fecha/hora
   (`type="date"`+`type="time"`); mantiene `estado: 'programado'` (si venía
   `vencido`, vuelve a `programado`), agrega evento `reprogramado` con la
   fecha anterior como `motivo`.
6. **`CancelarMantenimientoModal`** — confirmación `tone="danger"` + motivo
   opcional (textarea); pasa a `cancelado`, agrega evento `cancelado`.
7. **`RegistrarObservacionModal`** — form con un textarea requerido; no
   cambia `estado`, agrega evento `observacion` con el texto como `motivo`.

## Archivos

```
src/app/gestion-camas/mantenimiento/page.jsx
src/hooks/GestionCamas/mockMantenimientoData.js
src/Components/GestionCamas/GestionCamasSidebar/GestionCamasSidebar.jsx        (edit)
src/Components/GestionCamas/GestionCamasMantenimiento/
  GestionCamasMantenimiento.jsx / .css
  MantenimientoBadges/MantenimientoBadges.jsx / .css
  MantenimientoRowActionsMenu/MantenimientoRowActionsMenu.jsx / .css
  MantenimientoFiltrosPopover/MantenimientoFiltrosPopover.jsx
  MantenimientoFechaSelector/MantenimientoFechaSelector.jsx / .css
  MantenimientoPagination/MantenimientoPagination.jsx / .css
  MantenimientoDetailModal/MantenimientoDetailModal.jsx / .css
  ProgramarMantenimientoModal/ProgramarMantenimientoModal.jsx / .css
  IniciarMantenimientoModal/IniciarMantenimientoModal.jsx / .css
  FinalizarMantenimientoModal/FinalizarMantenimientoModal.jsx / .css
  ReprogramarMantenimientoModal/ReprogramarMantenimientoModal.jsx / .css
  CancelarMantenimientoModal/CancelarMantenimientoModal.jsx / .css
  RegistrarObservacionModal/RegistrarObservacionModal.jsx / .css
```

## Fuera de alcance (explícito)

Sincronización real Mantenimiento↔Camas (bloquear asignación de una cama en
mantenimiento en el tablero de Camas): la sección 13 del encargo pide
únicamente dejar la estructura de datos preparada (`cama` como llave
compartida), no implementar la lógica visual en `GestionCamas.jsx`/
`BedTable.jsx`. Gráficos, calendario, costos, proveedores, inventario de
repuestos, SLA, métricas avanzadas — excluidos por la sección 14 del encargo.
