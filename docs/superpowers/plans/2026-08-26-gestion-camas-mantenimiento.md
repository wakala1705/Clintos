# Gestión de Camas — pantalla "Mantenimiento" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Mantenimiento" screen to the Gestión de Camas module — KPI dashboard, filterable/paginated table of maintenance tasks, a creation modal, a detail modal, and 5 state-change action modals — reusing the module's existing visual language and component patterns 1:1.

**Architecture:** A new route (`/gestion-camas/mantenimiento`) rendering a new top-level feature component (`GestionCamasMantenimiento`), following the exact same skeleton as the sibling `GestionCamasLimpieza`/`GestionCamasReservas` screens: local mock data module → badges/menu/filter/pagination subcomponents → main orchestrator component wiring filter state, pagination, and a single `modal` state slot that switches between 7 modal components.

**Tech Stack:** Next.js (App Router) + React, plain CSS (no CSS-in-JS/Tailwind), `react-icons/lu` (Lucide) for icons. No test framework is configured in this project (`package.json` only has an `eslint` lint script) — verification steps use `npx eslint` on changed files plus a final manual smoke test in the dev server, per this repo's existing convention (none of the sibling GestionCamas screens have automated tests either).

**Spec:** `docs/superpowers/specs/2026-08-26-gestion-camas-mantenimiento-design.md`

## Global Constraints

- Every new component folder = exactly `ComponentName.jsx` (+ `ComponentName.css` only if it has rules not already covered by shared classes in `GestionCamas.css`) — see AGENTS.md "Component organization".
- No native `<select>` inside any `.form-field` — use `FormSelect` (modals) or `AreaSelector` (filter-bar). Pagination's page-size `<select>` is exempt (AGENTS.md "Selects de formulario").
- Every modal uses `@/Components/ModalHeader/ModalHeader` — never a hand-rolled header.
- `font-size`/`font-weight` in any new CSS must use the `--fs-*`/`--fw-*` tokens from `globals.css` — never a raw px/600 value. Headings use `--fw-semibold`, never `--fw-bold`.
- All new components import icons from `react-icons/lu` (`Lu*` names).
- All new files use `'use client'` at the top when they use hooks/browser APIs (every `.jsx` file in this plan except `page.jsx` and the two pure-badge components' wrapper, which don't need it but it's harmless — follow the exact pattern shown in each task).
- Mock/state fields: `estado` is a fixed value on each record — this V1 does not compute "vencido" live from the current date (see spec, "Modelo de datos").

---

## File Structure

```
src/app/gestion-camas/mantenimiento/page.jsx                                              (new)
src/hooks/GestionCamas/mockMantenimientoData.js                                            (new)
src/Components/GestionCamas/GestionCamasSidebar/GestionCamasSidebar.jsx                    (edit)
src/Components/GestionCamas/GestionCamasMantenimiento/
  GestionCamasMantenimiento.jsx / .css                                                     (new)
  MantenimientoBadges/MantenimientoBadges.jsx / .css                                       (new)
  MantenimientoRowActionsMenu/MantenimientoRowActionsMenu.jsx / .css                        (new)
  MantenimientoFiltrosPopover/MantenimientoFiltrosPopover.jsx                               (new)
  MantenimientoFechaSelector/MantenimientoFechaSelector.jsx / .css                          (new)
  MantenimientoPagination/MantenimientoPagination.jsx / .css                                (new)
  MantenimientoDetailModal/MantenimientoDetailModal.jsx / .css                              (new)
  ProgramarMantenimientoModal/ProgramarMantenimientoModal.jsx / .css                        (new)
  IniciarMantenimientoModal/IniciarMantenimientoModal.jsx / .css                            (new)
  FinalizarMantenimientoModal/FinalizarMantenimientoModal.jsx / .css                        (new)
  ReprogramarMantenimientoModal/ReprogramarMantenimientoModal.jsx / .css                    (new)
  CancelarMantenimientoModal/CancelarMantenimientoModal.jsx / .css                          (new)
  RegistrarObservacionModal/RegistrarObservacionModal.jsx / .css                            (new)
```

---

### Task 1: Mock data module

**Files:**
- Create: `src/hooks/GestionCamas/mockMantenimientoData.js`

**Interfaces:**
- Produces: `SEDES, AREAS, TIPOS, PRIORIDADES, ESTADOS, PISOS, SECTORES` (option-list arrays, shape `{value,label}`, first entry is always the "todos/as" option); `SEDE_LABEL, AREA_LABEL, TIPO_LABEL, PRIORIDAD_LABEL, ESTADO_LABEL` (value→label maps); `USUARIO_ACTUAL` (`{nombre, rol}`); `formatFecha(ts)`, `formatHoraCorta(ts)`, `formatFechaCorta(ts)` (functions, `ts` = epoch ms); `MANTENIMIENTOS_SEED` (array of maintenance records, shape documented inline); `KPIS`, `OFFSETS` (`{programados, enProceso, vencidos, finalizados}`); `MENU_ACCIONES` (map of `estado` → array of `{action, label}`, **excludes** `'ver-detalle'` — that's a standalone icon button, not a menu item, mirroring `BedTable.jsx`).

- [ ] **Step 1: Create the file**

```js
// Datos mock de "Mantenimiento" — tareas de mantenimiento preventivo/
// correctivo sobre camas, independientes del tablero de Estados visuales en
// GestionCamas.jsx (mismo criterio de pantalla propia que Limpieza/Reservas).
// SEDES/AREAS propias (no se importan de mockCamasData.js) — mismo criterio
// de duplicación por pantalla que mockLimpiezaData.js/mockReservasData.js.
//
// `cama` usa el mismo valor que el campo `numero` de mockCamasData.js — es
// el punto de enganche para la sincronización futura Mantenimiento↔Camas
// (encargo sección 13): esta pantalla no la implementa, solo deja la
// estructura de datos lista para ese cruce.
export const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: 'central', label: 'Sede Central' },
  { value: 'norte', label: 'Sede Norte' },
  { value: 'sur', label: 'Sede Sur' },
];

export const AREAS = [
  { value: 'todas', label: 'Todas las áreas' },
  { value: 'urgencias', label: 'Urgencias' },
  { value: 'uci', label: 'UCI' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'pediatria', label: 'Pediatría' },
];

export const TIPOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
];

export const PRIORIDADES = [
  { value: 'todas', label: 'Todas' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'programado', label: 'Programado' },
  { value: 'en-proceso', label: 'En proceso' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const PISOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'piso-1', label: 'Piso 1' },
  { value: 'piso-2', label: 'Piso 2' },
];

export const SECTORES = [
  { value: 'todos', label: 'Todos' },
  { value: 'sector-a', label: 'Sector A' },
  { value: 'sector-b', label: 'Sector B' },
  { value: 'sector-c', label: 'Sector C' },
];

export const SEDE_LABEL = Object.fromEntries(SEDES.slice(1).map((s) => [s.value, s.label]));
export const AREA_LABEL = Object.fromEntries(AREAS.slice(1).map((a) => [a.value, a.label]));
export const TIPO_LABEL = Object.fromEntries(TIPOS.slice(1).map((t) => [t.value, t.label]));
export const PRIORIDAD_LABEL = Object.fromEntries(PRIORIDADES.slice(1).map((p) => [p.value, p.label]));
export const ESTADO_LABEL = Object.fromEntries(ESTADOS.slice(1).map((e) => [e.value, e.label]));

export const USUARIO_ACTUAL = { nombre: 'Camilo Grondona', rol: 'Administrador' };

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// "26 Ago 2026" — columna Fecha programada de la tabla (junto con
// formatHoraCorta) y bloque Detalle del modal (junto con " · ").
export function formatFecha(ts) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// "10:00"
export function formatHoraCorta(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "26 Ago" — sin año/hora, para la lista de Historial (encargo sección 11,
// ejemplo literal: "26 Ago · Programado").
export function formatFechaCorta(ts) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`;
}

// Fechas de la semilla, todas en Agosto 2026 — constructor local (no
// `new Date('2026-08-26')`, que Date parsea como UTC y puede correrse un día
// según el huso horario del navegador).
function fechaAgosto2026(dia, hora, minuto = 0) {
  return new Date(2026, 7, dia, hora, minuto).getTime();
}

let historialSeq = 0;
function evento(tipo, titulo, dia, hora, usuario) {
  historialSeq += 1;
  return {
    id: `H-${historialSeq}`, tipo, titulo, fecha: fechaAgosto2026(dia, hora), usuario,
  };
}

// Semilla visible de la tabla (encargo sección 6, los 8 registros de ejemplo
// literal). KPIS/OFFSETS abajo cubren el resto del universo "global" que no
// forma parte de esta muestra — mismo patrón que mockLimpiezaData.js.
export const MANTENIMIENTOS_SEED = [
  {
    id: 'MNT-1',
    cama: '101-A',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    tipo: 'preventivo',
    prioridad: 'media',
    estado: 'programado',
    fechaProgramada: fechaAgosto2026(26, 10, 0),
    responsable: 'Juan Pérez',
    descripcion: 'Revisión general de estructura, ruedas y mecanismos de elevación.',
    historial: [
      evento('creado', 'Creado por Administrador', 25, 8, 'Administrador'),
      evento('programado', 'Programado', 25, 8, 'Administrador'),
    ],
  },
  {
    id: 'MNT-2',
    cama: '102-B',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'en-proceso',
    fechaProgramada: fechaAgosto2026(26, 14, 0),
    responsable: 'María Gómez',
    descripcion: 'Reparación de freno de rueda delantera derecha, reportado por enfermería.',
    historial: [
      evento('creado', 'Creado por Administrador', 25, 11, 'Administrador'),
      evento('programado', 'Programado', 25, 11, 'Administrador'),
      evento('iniciado', 'Mantenimiento iniciado', 26, 14, 'María Gómez'),
    ],
  },
  {
    id: 'MNT-3',
    cama: '103-C',
    ubicacion: 'Piso 2 · Sector B',
    piso: 'piso-2',
    sector: 'sector-b',
    sede: 'central',
    area: 'uci',
    tipo: 'preventivo',
    prioridad: 'baja',
    estado: 'vencido',
    fechaProgramada: fechaAgosto2026(24, 9, 0),
    responsable: 'Carlos Ruiz',
    descripcion: 'Revisión periódica de barandas y sistema eléctrico de la cama.',
    historial: [
      evento('creado', 'Creado por Administrador', 22, 9, 'Administrador'),
      evento('programado', 'Programado', 22, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-4',
    cama: '104-A',
    ubicacion: 'Piso 1 · Sector B',
    piso: 'piso-1',
    sector: 'sector-b',
    sede: 'norte',
    area: 'hospitalizacion',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'en-proceso',
    fechaProgramada: fechaAgosto2026(25, 16, 0),
    responsable: 'Luis Martínez',
    descripcion: 'Cambio de actuador eléctrico de la sección de respaldo.',
    historial: [
      evento('creado', 'Creado por Administrador', 24, 10, 'Administrador'),
      evento('programado', 'Programado', 24, 10, 'Administrador'),
      evento('iniciado', 'Mantenimiento iniciado', 25, 16, 'Luis Martínez'),
    ],
  },
  {
    id: 'MNT-5',
    cama: '105-B',
    ubicacion: 'Piso 2 · Sector A',
    piso: 'piso-2',
    sector: 'sector-a',
    sede: 'norte',
    area: 'uci',
    tipo: 'preventivo',
    prioridad: 'media',
    estado: 'programado',
    fechaProgramada: fechaAgosto2026(27, 8, 0),
    responsable: 'Ana Rodríguez',
    descripcion: 'Revisión general de estructura, ruedas y mecanismos de elevación.',
    historial: [
      evento('creado', 'Creado por Administrador', 26, 9, 'Administrador'),
      evento('programado', 'Programado', 26, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-6',
    cama: '106-C',
    ubicacion: 'Piso 1 · Sector C',
    piso: 'piso-1',
    sector: 'sector-c',
    sede: 'sur',
    area: 'pediatria',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'vencido',
    fechaProgramada: fechaAgosto2026(24, 11, 0),
    responsable: 'Javier López',
    descripcion: 'Reparación de motor de elevación de cabecera, cama inmovilizada.',
    historial: [
      evento('creado', 'Creado por Administrador', 23, 9, 'Administrador'),
      evento('programado', 'Programado', 23, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-7',
    cama: '107-A',
    ubicacion: 'Piso 1 · Sector B',
    piso: 'piso-1',
    sector: 'sector-b',
    sede: 'sur',
    area: 'hospitalizacion',
    tipo: 'preventivo',
    prioridad: 'baja',
    estado: 'programado',
    fechaProgramada: fechaAgosto2026(28, 10, 0),
    responsable: 'Pedro Silva',
    descripcion: 'Revisión periódica de barandas y sistema eléctrico de la cama.',
    historial: [
      evento('creado', 'Creado por Administrador', 26, 9, 'Administrador'),
      evento('programado', 'Programado', 26, 9, 'Administrador'),
    ],
  },
  {
    id: 'MNT-8',
    cama: '108-B',
    ubicacion: 'Piso 1 · Sector A',
    piso: 'piso-1',
    sector: 'sector-a',
    sede: 'central',
    area: 'urgencias',
    tipo: 'correctivo',
    prioridad: 'media',
    estado: 'finalizado',
    fechaProgramada: fechaAgosto2026(25, 9, 0),
    responsable: 'María Gómez',
    descripcion: 'Ajuste de rueda trasera izquierda, ruido al desplazar la cama.',
    historial: [
      evento('creado', 'Creado por Administrador', 24, 8, 'Administrador'),
      evento('programado', 'Programado', 24, 8, 'Administrador'),
      evento('iniciado', 'Mantenimiento iniciado', 25, 9, 'María Gómez'),
      evento('finalizado', 'Mantenimiento finalizado', 25, 10, 'María Gómez'),
    ],
  },
];

// KPIs = universo global (encargo sección 4), no el conteo de la tabla ya
// filtrada — mismo patrón OFFSETS que mockLimpiezaData.js: valor fijo,
// calculado una sola vez contra la semilla de arriba.
export const KPIS = {
  programados: 12, enProceso: 4, vencidos: 2, finalizados: 25,
};

const PROGRAMADOS_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'programado').length;
const EN_PROCESO_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'en-proceso').length;
const VENCIDOS_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'vencido').length;
const FINALIZADOS_INICIALES = MANTENIMIENTOS_SEED.filter((m) => m.estado === 'finalizado').length;

export const OFFSETS = {
  programados: KPIS.programados - PROGRAMADOS_INICIALES,
  enProceso: KPIS.enProceso - EN_PROCESO_INICIALES,
  vencidos: KPIS.vencidos - VENCIDOS_INICIALES,
  finalizados: KPIS.finalizados - FINALIZADOS_INICIALES,
};

// Acciones del menú "⋯" por estado (encargo sección 9) — "ver-detalle" NO
// vive acá: es el botón-ícono 👁 aparte, mismo patrón que BedTable.jsx
// (Camas). "Cancelado" no está en el encargo original; se deja solo-lectura
// por consistencia con Finalizado.
export const MENU_ACCIONES = {
  programado: [
    { action: 'iniciar-mantenimiento', label: 'Iniciar mantenimiento' },
    { action: 'reprogramar', label: 'Reprogramar' },
    { action: 'cancelar', label: 'Cancelar' },
  ],
  'en-proceso': [
    { action: 'finalizar-mantenimiento', label: 'Finalizar mantenimiento' },
    { action: 'registrar-observacion', label: 'Registrar observación' },
  ],
  vencido: [
    { action: 'iniciar-mantenimiento', label: 'Iniciar mantenimiento' },
    { action: 'reprogramar', label: 'Reprogramar' },
    { action: 'cancelar', label: 'Cancelar' },
  ],
  finalizado: [
    { action: 'ver-historial', label: 'Ver historial' },
  ],
  cancelado: [],
};
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/hooks/GestionCamas/mockMantenimientoData.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/GestionCamas/mockMantenimientoData.js
git commit -m "feat(gestion-camas): add Mantenimiento mock data module"
```

---

### Task 2: Badges (`EstadoMantenimientoBadge`, `PrioridadBadge`)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoBadges/MantenimientoBadges.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoBadges/MantenimientoBadges.css`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `EstadoMantenimientoBadge({ estado })`, `PrioridadBadge({ prioridad })` — both exported from `MantenimientoBadges.jsx`, `estado` ∈ the 5 values from Task 1's `ESTADOS`, `prioridad` ∈ Task 1's `PRIORIDADES`.

- [ ] **Step 1: Create `MantenimientoBadges.jsx`**

```jsx
import './MantenimientoBadges.css';
import {
  LuBan, LuCalendarClock, LuCircleCheck, LuTriangleAlert, LuWrench,
} from 'react-icons/lu';

const ESTADO_CONFIG = {
  programado: { label: 'Programado', icon: LuCalendarClock, tono: 'blue' },
  'en-proceso': { label: 'En proceso', icon: LuWrench, tono: 'amber' },
  vencido: { label: 'Vencido', icon: LuTriangleAlert, tono: 'red' },
  finalizado: { label: 'Finalizado', icon: LuCircleCheck, tono: 'green' },
  cancelado: { label: 'Cancelado', icon: LuBan, tono: 'neutral' },
};

export function EstadoMantenimientoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span className={`cbm-badge cbm-tono-${cfg.tono}`}>
      <Icon className="icon" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

const PRIORIDAD_CONFIG = {
  alta: { label: 'Alta', tono: 'red' },
  media: { label: 'Media', tono: 'amber' },
  baja: { label: 'Baja', tono: 'neutral' },
};

// Sin ícono (encargo sección 8: "no utilizar iconos grandes") — a diferencia
// de EstadoMantenimientoBadge, esta píldora es solo texto.
export function PrioridadBadge({ prioridad }) {
  const cfg = PRIORIDAD_CONFIG[prioridad];
  return <span className={`cbm-badge cbm-tono-${cfg.tono}`}>{cfg.label}</span>;
}
```

- [ ] **Step 2: Create `MantenimientoBadges.css`**

```css
.cbm-badge{
  display:inline-flex;align-items:center;gap:6px;
  font-size:var(--fs-xs);font-weight:var(--fw-semibold);padding:4px 10px;border-radius:20px;white-space:nowrap;
}
.cbm-badge .icon{width:13px;height:13px;}
.cbm-tono-blue{background:var(--blue-bg);color:var(--blue-fg);}
.cbm-tono-amber{background:var(--amber-bg);color:var(--amber-fg);}
.cbm-tono-red{background:var(--red-bg);color:var(--red);}
.cbm-tono-green{background:var(--green-bg);color:#0d7a3d;}
.cbm-tono-neutral{background:var(--gray-bg);color:var(--gray-fg);}

html[data-theme="dark"] .cbm-tono-green{color:var(--green);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoBadges/MantenimientoBadges.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoBadges
git commit -m "feat(gestion-camas): add Mantenimiento estado/prioridad badges"
```

---

### Task 3: Sidebar nav item

**Files:**
- Modify: `src/Components/GestionCamas/GestionCamasSidebar/GestionCamasSidebar.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: a new nav link to `/gestion-camas/mantenimiento` in the "Operación" group, so Task 15/16's route shows as selected when visited.

- [ ] **Step 1: Add the `LuWrench` import**

In `src/Components/GestionCamas/GestionCamasSidebar/GestionCamasSidebar.jsx`, the import block currently reads:

```js
import {
  LuBedDouble, LuCalendarClock, LuChartColumn, LuHistory, LuLayoutGrid, LuPanelLeftClose, LuPanelLeftOpen,
  LuSettings, LuShieldCheck, LuSprayCan,
} from 'react-icons/lu';
```

Change it to:

```js
import {
  LuBedDouble, LuCalendarClock, LuChartColumn, LuHistory, LuLayoutGrid, LuPanelLeftClose, LuPanelLeftOpen,
  LuSettings, LuShieldCheck, LuSprayCan, LuWrench,
} from 'react-icons/lu';
```

- [ ] **Step 2: Add the "Mantenimiento" item to the `operacion` section**

Find this block (the `operacion` section's `items` array):

```js
      {
        id: 'limpieza', label: 'Limpieza', href: '/gestion-camas/limpieza', icon: LuSprayCan,
      },
    ],
  },
```

Change it to:

```js
      {
        id: 'limpieza', label: 'Limpieza', href: '/gestion-camas/limpieza', icon: LuSprayCan,
      },
      {
        id: 'mantenimiento', label: 'Mantenimiento', href: '/gestion-camas/mantenimiento', icon: LuWrench,
      },
    ],
  },
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasSidebar/GestionCamasSidebar.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasSidebar/GestionCamasSidebar.jsx
git commit -m "feat(gestion-camas): add Mantenimiento item to internal sidebar"
```

---

### Task 4: Row actions menu (`MantenimientoRowActionsMenu`)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoRowActionsMenu/MantenimientoRowActionsMenu.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoRowActionsMenu/MantenimientoRowActionsMenu.css`

**Interfaces:**
- Consumes: `MENU_ACCIONES` from Task 1 (`@/hooks/GestionCamas/mockMantenimientoData`).
- Produces: `MantenimientoRowActionsMenu({ estado, cama, onAction })` default export — `onAction(action)` fires with one of the action strings from `MENU_ACCIONES[estado]`. Used by Task 15.

- [ ] **Step 1: Create `MantenimientoRowActionsMenu.jsx`**

```jsx
'use client';

import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './MantenimientoRowActionsMenu.css';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockMantenimientoData';
import {
  LuBan, LuCalendarClock, LuCircleCheck, LuEllipsis, LuHistory, LuMessageSquare, LuWrench,
} from 'react-icons/lu';

const ACCION_ICONO = {
  'iniciar-mantenimiento': LuWrench,
  reprogramar: LuCalendarClock,
  cancelar: LuBan,
  'finalizar-mantenimiento': LuCircleCheck,
  'registrar-observacion': LuMessageSquare,
  'ver-historial': LuHistory,
};

// Menú "⋯" de la fila — mismo patrón autocontenido (portal a document.body +
// position:fixed, reposicionado en 2 pasadas) que LimpiezaRowActionsMenu.jsx/
// BedActionsMenu.jsx. "Ver detalle" vive en el botón-ícono 👁 aparte (ver
// GestionCamasMantenimiento.jsx), nunca acá — mismo patrón que BedTable.jsx
// (encargo sección 9). Los botones cortan la propagación del click porque la
// fila entera también abre el detalle al hacer clic (encargo sección 11).
export default function MantenimientoRowActionsMenu({ estado, cama, onAction }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  function calcularPosicion() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight ?? 0;
    const openUp = dropdownHeight > 0 && rect.bottom + 4 + dropdownHeight > window.innerHeight;
    setPos({
      openUp,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      right: window.innerWidth - rect.right,
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    calcularPosicion();
    calcularPosicion();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (
        btnRef.current && !btnRef.current.contains(e.target)
        && dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    function handleReposition() { calcularPosicion(); }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open]);

  function handleItem(action) {
    setOpen(false);
    onAction(action);
  }

  const acciones = MENU_ACCIONES[estado] || [];

  return (
    <div className="cbm-actions-menu">
      <button
        type="button"
        ref={btnRef}
        className="cbm-actions-menu-btn"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Más acciones para cama ${cama}`}
        title="Más acciones"
      >
        <LuEllipsis className="icon" />
      </button>

      {open && pos && createPortal(
        <div
          ref={dropdownRef}
          className={`cbm-actions-menu-dropdown${pos.openUp ? ' menu-up' : ''}`}
          role="menu"
          style={{ top: pos.top, bottom: pos.bottom, right: pos.right }}
        >
          {acciones.length === 0 ? (
            <span className="cbm-actions-menu-empty">Sin acciones disponibles</span>
          ) : acciones.map((item) => {
            const Icon = ACCION_ICONO[item.action] ?? LuHistory;
            return (
              <button
                type="button"
                key={item.action}
                className="cbm-actions-menu-item"
                role="menuitem"
                onClick={(e) => { e.stopPropagation(); handleItem(item.action); }}
              >
                <Icon className="icon" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `MantenimientoRowActionsMenu.css`**

```css
/* Mismo lenguaje visual que LimpiezaRowActionsMenu.css/BedActionsMenu.css —
   redeclarado con su propio nombre de clase porque vive en otro
   sub-componente (ver AGENTS.md "Component organization"). */
.cbm-actions-menu{flex-shrink:0;}
.cbm-actions-menu-btn{
  width:28px;height:28px;border-radius:7px;flex-shrink:0;
  display:inline-flex;align-items:center;justify-content:center;
  color:var(--ink-500);cursor:pointer;border:none;background:transparent;padding:0;
}
.cbm-actions-menu-btn .icon{width:17px;height:17px;}
.cbm-actions-menu-btn:hover{background:var(--gray-bg);color:var(--ink-900);}
.cbm-actions-menu-btn:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.cbm-actions-menu-dropdown{
  position:fixed;min-width:200px;z-index:calc(var(--z-modal, 50) + 1);
  background:var(--surface);border-radius:var(--radius);
  box-shadow:0 8px 24px rgba(16,24,39,.16);padding:6px;
}
.cbm-actions-menu-item{
  display:flex;align-items:center;gap:8px;width:100%;
  padding:8px 10px;border-radius:7px;border:none;background:none;font-family:inherit;
  font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-700);cursor:pointer;text-align:left;white-space:nowrap;
}
.cbm-actions-menu-item .icon{width:15px;height:15px;color:var(--ink-500);flex-shrink:0;}
.cbm-actions-menu-item:hover{background:var(--bg);}
.cbm-actions-menu-item:focus-visible{outline:2px solid var(--primary);outline-offset:-2px;background:var(--bg);}
.cbm-actions-menu-empty{
  display:block;padding:8px 10px;font-size:var(--fs-base);color:var(--ink-500);white-space:nowrap;
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoRowActionsMenu/MantenimientoRowActionsMenu.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoRowActionsMenu
git commit -m "feat(gestion-camas): add Mantenimiento row actions menu"
```

---

### Task 5: "Más filtros" popover (Piso/Sector)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFiltrosPopover/MantenimientoFiltrosPopover.jsx`

(No `.css` file — every class it uses (`filter-popover-wrap`, `filters-more-btn`, `badge-count`, `filter-popover`, `fp-section`, `fp-section-title`, `chip-group`, `chip-filter`, `fp-actions`, `.btn`) is already defined in the shared `../../GestionCamas.css`, same as `LimpiezaFiltrosPopover.jsx` which also has no CSS file of its own.)

**Interfaces:**
- Consumes: `PISOS`, `SECTORES` from Task 1.
- Produces: `MantenimientoFiltrosPopover({ piso, sector, onChange, onLimpiar })` default export — `onChange(key, value)` fires with `key` ∈ `'piso'|'sector'`; `onLimpiar()` fires with no args. Used by Task 15.

- [ ] **Step 1: Create the file**

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { LuFilter } from 'react-icons/lu';
import { PISOS, SECTORES } from '@/hooks/GestionCamas/mockMantenimientoData';

// "Más filtros" — Piso/Sector (mismo patrón borrador+aplicar que
// LimpiezaFiltrosPopover.jsx/MasFiltrosPopover.jsx): los clics acá solo
// tocan `draft`, recién se confirman al hacer clic en "Aplicar filtros".
export default function MantenimientoFiltrosPopover({
  piso, sector, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ piso, sector });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleToggleOpen() {
    if (!open) setDraft({ piso, sector });
    setOpen((v) => !v);
  }

  function handleAplicar() {
    onChange('piso', draft.piso);
    onChange('sector', draft.sector);
    setOpen(false);
  }

  function handleLimpiarTodo() {
    onLimpiar();
    setOpen(false);
  }

  const activos = (piso !== 'todos' ? 1 : 0) + (sector !== 'todos' ? 1 : 0);

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`filters-more-btn${activos > 0 ? ' active' : ''}`}
        onClick={handleToggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuFilter className="icon" aria-hidden="true" />
        Más filtros
        {activos > 0 && <span className="badge-count">{activos}</span>}
      </button>

      {open && (
        <div className="filter-popover filter-popover-right open">
          <div className="fp-section">
            <span className="fp-section-title">Piso</span>
            <div className="chip-group">
              {PISOS.slice(1).map((o) => (
                <button
                  type="button"
                  key={o.value}
                  role="option"
                  aria-selected={o.value === draft.piso}
                  className={`chip-filter${o.value === draft.piso ? ' active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, piso: o.value === d.piso ? 'todos' : o.value }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fp-section">
            <span className="fp-section-title">Sector</span>
            <div className="chip-group">
              {SECTORES.slice(1).map((o) => (
                <button
                  type="button"
                  key={o.value}
                  role="option"
                  aria-selected={o.value === draft.sector}
                  className={`chip-filter${o.value === draft.sector ? ' active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, sector: o.value === d.sector ? 'todos' : o.value }))}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLimpiarTodo}>
              Limpiar todo
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAplicar}>
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFiltrosPopover/MantenimientoFiltrosPopover.jsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFiltrosPopover
git commit -m "feat(gestion-camas): add Mantenimiento Piso/Sector filtros popover"
```

---

### Task 6: Date-range selector (`MantenimientoFechaSelector`)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFechaSelector/MantenimientoFechaSelector.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFechaSelector/MantenimientoFechaSelector.css`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `MantenimientoFechaSelector({ desde, hasta, onChange, onLimpiar })` default export — `desde`/`hasta` are ISO date strings (`'yyyy-mm-dd'` or `''`), `onChange(key, value)` fires with `key` ∈ `'desde'|'hasta'`. Used by Task 15.

- [ ] **Step 1: Create `MantenimientoFechaSelector.jsx`**

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import './MantenimientoFechaSelector.css';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

function ddmm(iso) {
  if (!iso) return null;
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function labelRango(desde, hasta) {
  if (!desde && !hasta) return 'Todas';
  if (desde && hasta) return `${ddmm(desde)} – ${ddmm(hasta)}`;
  if (desde) return `Desde ${ddmm(desde)}`;
  return `Hasta ${ddmm(hasta)}`;
}

// "Fecha: <rango>" — mismo patrón trigger+popover que FechaSelector.jsx
// (Reservas), pero con Desde/Hasta en vez de una fecha única (encargo
// sección 5: "el filtro de fecha debe permitir seleccionar un rango").
export default function MantenimientoFechaSelector({
  desde, hasta, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const activo = Boolean(desde || hasta);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`date-picker-btn${activo ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuCalendar className="icon" aria-hidden="true" />
        {`Fecha: ${labelRango(desde, hasta)}`}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover open" role="dialog" aria-label="Filtrar por rango de fecha">
          <div className="fp-section">
            <span className="fp-section-title">Desde</span>
            <input
              type="date"
              className="cbm-fecha-input"
              value={desde}
              onChange={(e) => onChange('desde', e.target.value)}
              aria-label="Fecha desde"
            />
          </div>
          <div className="fp-section">
            <span className="fp-section-title">Hasta</span>
            <input
              type="date"
              className="cbm-fecha-input"
              value={hasta}
              onChange={(e) => onChange('hasta', e.target.value)}
              aria-label="Fecha hasta"
            />
          </div>
          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { onLimpiar(); setOpen(false); }}>
              Limpiar
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `MantenimientoFechaSelector.css`**

```css
/* .filter-popover-wrap/.date-picker-btn/.filter-popover/.fp-section/
   .fp-section-title/.fp-actions/.btn: definidas en ../../GestionCamas.css —
   acá solo el input de fecha, exclusivo de este selector. */
.cbm-fecha-input{
  width:100%;height:var(--input-md);padding:0 8px;border:1px solid var(--border);border-radius:var(--radius);
  font-family:inherit;font-size:var(--fs-base);color:var(--ink-900);background:var(--bg);
}
.cbm-fecha-input:focus{outline:2px solid var(--primary);outline-offset:1px;background:#fff;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFechaSelector/MantenimientoFechaSelector.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoFechaSelector
git commit -m "feat(gestion-camas): add Mantenimiento date-range filter"
```

---

### Task 7: Pagination (`MantenimientoPagination`)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoPagination/MantenimientoPagination.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoPagination/MantenimientoPagination.css`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `MantenimientoPagination({ page, pageSize, total, onChangePage, onChangePageSize })` default export — `onChangePage(pageNumber)`, `onChangePageSize(size)`. Used by Task 15. Renders nothing when `total === 0`.

- [ ] **Step 1: Create `MantenimientoPagination.jsx`**

```jsx
'use client';

import './MantenimientoPagination.css';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

// Mismo componente/patrón que ReservasPagination.jsx — número de páginas
// clicables + selector de cantidad, con su propio prefijo de clase (ver
// AGENTS.md "Component organization").
function rangoPaginas(page, totalPages) {
  const delta = 1;
  const rango = [];
  const desde = Math.max(2, page - delta);
  const hasta = Math.min(totalPages - 1, page + delta);

  rango.push(1);
  if (desde > 2) rango.push('...');
  for (let p = desde; p <= hasta; p += 1) rango.push(p);
  if (hasta < totalPages - 1) rango.push('...');
  if (totalPages > 1) rango.push(totalPages);
  return rango;
}

export default function MantenimientoPagination({
  page, pageSize, total, onChangePage, onChangePageSize,
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const paginas = rangoPaginas(page, totalPages);

  return (
    <div className="cbm-pagination">
      <span className="cbm-pagination-label">
        Mostrando <b>{start}–{end}</b> de <b>{total}</b> mantenimientos
      </span>

      <div className="cbm-pagination-controls">
        <button
          type="button"
          className="cbm-pagination-nav-btn"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
        >
          <LuChevronLeft className="icon" />
        </button>

        {paginas.map((p, i) => (
          p === '...' ? <span key={`ellipsis-${i}`} className="cbm-pagination-ellipsis">…</span> : (
            <button
              type="button"
              key={p}
              className={`cbm-pagination-page${p === page ? ' active' : ''}`}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChangePage(p)}
            >
              {p}
            </button>
          )
        ))}

        <button
          type="button"
          className="cbm-pagination-nav-btn"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onChangePage(page + 1)}
        >
          <LuChevronRight className="icon" />
        </button>
      </div>

      <label className="cbm-pagination-size">
        <select value={pageSize} onChange={(e) => onChangePageSize(Number(e.target.value))} aria-label="Mantenimientos por página">
          {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Create `MantenimientoPagination.css`**

```css
.cbm-pagination{
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  padding:12px 20px;border-top:1px solid var(--border);flex-shrink:0;
}
.cbm-pagination-label{font-size:var(--fs-sm);color:var(--ink-500);}
.cbm-pagination-label b{font-weight:var(--fw-semibold);color:var(--ink-900);}

.cbm-pagination-controls{display:flex;align-items:center;gap:4px;}
.cbm-pagination-nav-btn{
  width:28px;height:28px;border-radius:50%;flex-shrink:0;
  display:inline-flex;align-items:center;justify-content:center;
  border:1px solid var(--border);background:var(--surface);color:var(--ink-700);cursor:pointer;
}
.cbm-pagination-nav-btn .icon{width:15px;height:15px;}
.cbm-pagination-nav-btn:hover{background:#f3f5f9;border-color:#d7dce6;}
.cbm-pagination-nav-btn:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.cbm-pagination-nav-btn[disabled]{opacity:.4;cursor:not-allowed;}

.cbm-pagination-page{
  min-width:28px;height:28px;padding:0 6px;border-radius:var(--radius);border:1px solid transparent;
  background:none;font-family:inherit;font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-700);cursor:pointer;
}
.cbm-pagination-page:hover{background:var(--gray-bg);}
.cbm-pagination-page:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.cbm-pagination-page.active{background:var(--interactive-selected-bg);color:var(--interactive-selected-text);font-weight:var(--fw-semibold);}
.cbm-pagination-ellipsis{color:var(--ink-400);padding:0 4px;font-size:var(--fs-sm);}

/* appearance:none + chevron propio en vez de FormSelect (AGENTS.md, "Selects
   de formulario" — los selects de paginación quedan afuera de esa regla). */
.cbm-pagination-size select{
  appearance:none;-webkit-appearance:none;cursor:pointer;
  height:var(--input-sm);border:1px solid var(--border);border-radius:var(--radius);
  font-family:inherit;font-size:var(--fs-sm);color:var(--ink-700);background:var(--surface);padding:0 28px 0 8px;
  background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>');
  background-repeat:no-repeat;background-position:right 8px center;
}
.cbm-pagination-size select:focus{outline:2px solid var(--primary);outline-offset:1px;}

@media (max-width:768px){
  .cbm-pagination{justify-content:center;text-align:center;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoPagination/MantenimientoPagination.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoPagination
git commit -m "feat(gestion-camas): add Mantenimiento pagination"
```

---

### Task 8: Detail modal (`MantenimientoDetailModal`)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoDetailModal/MantenimientoDetailModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoDetailModal/MantenimientoDetailModal.css`

**Interfaces:**
- Consumes: `EstadoMantenimientoBadge`, `PrioridadBadge` (Task 2); `AREA_LABEL, SEDE_LABEL, TIPO_LABEL, formatFecha, formatFechaCorta, formatHoraCorta` (Task 1); `ModalHeader` from `@/Components/ModalHeader/ModalHeader`.
- Produces: `MantenimientoDetailModal({ mantenimiento, onClose, onFinalizar })` default export. `mantenimiento` is a full record from Task 1's shape (or `null`, in which case it renders nothing). `onFinalizar(mantenimiento)` fires only when the record's `estado === 'en-proceso'` and the user clicks the contextual footer button. Used by Task 15 for both "Ver detalle" and "Ver historial".

- [ ] **Step 1: Create `MantenimientoDetailModal.jsx`**

```jsx
'use client';

import './MantenimientoDetailModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { EstadoMantenimientoBadge, PrioridadBadge } from '../MantenimientoBadges/MantenimientoBadges';
import {
  AREA_LABEL, SEDE_LABEL, TIPO_LABEL, formatFecha, formatFechaCorta, formatHoraCorta,
} from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuWrench } from 'react-icons/lu';

// "Ver" (encargo sección 11) — el mismo modal cubre "Ver detalle" y "Ver
// historial" del menú "⋯" (ambos abren esta pantalla; HISTORIAL siempre está
// presente, así que no hace falta un modal de historial aparte). Acción
// contextual "Finalizar mantenimiento" solo si `estado === 'en-proceso'`
// (encargo, literal).
export default function MantenimientoDetailModal({ mantenimiento, onClose, onFinalizar }) {
  if (!mantenimiento) return null;
  const m = mantenimiento;

  const eventos = [...m.historial].sort((a, b) => b.fecha - a.fecha);
  const tone = m.estado === 'vencido' ? 'danger' : m.estado === 'cancelado' ? 'neutral' : 'primary';

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbm-detail-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-detail-title">
        <ModalHeader
          icon={LuWrench}
          tone={tone}
          title={`Mantenimiento ${TIPO_LABEL[m.tipo].toLowerCase()}`}
          titleId="cbm-detail-title"
          onClose={onClose}
        />
        <div className="modal-body cbm-detail-body">
          <EstadoMantenimientoBadge estado={m.estado} />

          <div className="cbm-detail-section">
            <span className="cbm-detail-section-title">Cama</span>
            <div className="cbm-detail-cama-block">
              <span className="cbm-detail-cama-code">{m.cama}</span>
              <span className="cbm-detail-cama-meta">{SEDE_LABEL[m.sede]}</span>
              <span className="cbm-detail-cama-meta">{AREA_LABEL[m.area]}</span>
              <span className="cbm-detail-cama-meta">{m.ubicacion}</span>
            </div>
          </div>

          <div className="cbm-detail-section">
            <span className="cbm-detail-section-title">Detalle</span>
            <div className="cbm-detail-grid">
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Tipo</span>
                <span className="cbm-detail-value">{TIPO_LABEL[m.tipo]}</span>
              </div>
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Prioridad</span>
                <PrioridadBadge prioridad={m.prioridad} />
              </div>
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Fecha programada</span>
                <span className="cbm-detail-value">{`${formatFecha(m.fechaProgramada)} · ${formatHoraCorta(m.fechaProgramada)}`}</span>
              </div>
              <div className="cbm-detail-field">
                <span className="cbm-detail-label">Responsable</span>
                <span className="cbm-detail-value">{m.responsable}</span>
              </div>
            </div>
            <div className="cbm-detail-field cbm-detail-descripcion">
              <span className="cbm-detail-label">Descripción</span>
              <span className="cbm-detail-value">{m.descripcion}</span>
            </div>
          </div>

          <div className="cbm-detail-section">
            <span className="cbm-detail-section-title">Historial</span>
            <ul className="cbm-historial-list">
              {eventos.map((ev) => (
                <li key={ev.id} className="cbm-historial-item">
                  <span className="cbm-historial-fecha">{formatFechaCorta(ev.fecha)}</span>
                  <span className="cbm-historial-titulo">{ev.titulo}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {m.estado === 'en-proceso' && (
            <button type="button" className="btn btn-primary" onClick={() => onFinalizar(m)}>Finalizar mantenimiento</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `MantenimientoDetailModal.css`**

```css
.cbm-detail-modal-card{width:520px;}
.cbm-detail-body{display:flex;flex-direction:column;gap:16px;}

.cbm-detail-section{display:flex;flex-direction:column;gap:10px;padding-top:14px;border-top:1px solid var(--border);}
.cbm-detail-body > .cbm-detail-section:first-of-type{padding-top:0;border-top:none;}
.cbm-detail-section-title{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;}

.cbm-detail-cama-block{display:flex;flex-direction:column;gap:2px;}
.cbm-detail-cama-code{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.cbm-detail-cama-meta{font-size:var(--fs-sm);color:var(--ink-500);}

.cbm-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;}
.cbm-detail-field{display:flex;flex-direction:column;gap:3px;min-width:0;}
.cbm-detail-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.cbm-detail-value{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);line-height:1.45;}
.cbm-detail-descripcion{margin-top:2px;}

.cbm-historial-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;}
.cbm-historial-item{display:flex;align-items:baseline;gap:10px;padding:8px 0;}
.cbm-historial-item + .cbm-historial-item{border-top:1px solid var(--border);}
.cbm-historial-fecha{flex-shrink:0;font-size:var(--fs-sm);color:var(--ink-500);min-width:52px;}
.cbm-historial-titulo{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoDetailModal/MantenimientoDetailModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/MantenimientoDetailModal
git commit -m "feat(gestion-camas): add Mantenimiento detail modal"
```

---

### Task 9: Create modal (`ProgramarMantenimientoModal`)

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/ProgramarMantenimientoModal/ProgramarMantenimientoModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/ProgramarMantenimientoModal/ProgramarMantenimientoModal.css`

**Interfaces:**
- Consumes: `AREAS, PRIORIDADES, SEDES, TIPOS` (Task 1); `FormSelect` from `@/Components/FormSelect/FormSelect`; `ModalHeader`.
- Produces: `ProgramarMantenimientoModal({ onClose, onSubmit })` default export. `onSubmit(datos)` fires with `{cama, sede, area, tipo, prioridad, fechaProgramada (epoch ms), responsable, descripcion}` once client-side validation passes. Used by Task 15 (the header CTA).

- [ ] **Step 1: Create `ProgramarMantenimientoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './ProgramarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREAS, PRIORIDADES, SEDES, TIPOS,
} from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuWrench } from 'react-icons/lu';

const SEDE_OPTIONS = SEDES.filter((s) => s.value !== 'todas');
const AREA_OPTIONS = AREAS.filter((a) => a.value !== 'todas');
const TIPO_OPTIONS = TIPOS.filter((t) => t.value !== 'todos');
const PRIORIDAD_OPTIONS = PRIORIDADES.filter((p) => p.value !== 'todas');

const CAMPOS_INICIALES = {
  cama: '', sede: '', area: '', tipo: '', prioridad: '', fecha: '', hora: '', responsable: '', descripcion: '',
};

// "+ Programar mantenimiento" — único CTA primario del header (encargo
// sección 3). Nace siempre en estado `programado` — mismo criterio que
// NuevaReservaModal.jsx (un registro recién creado no arranca en otro
// estado).
export default function ProgramarMantenimientoModal({ onClose, onSubmit }) {
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [errores, setErrores] = useState({});

  function setCampo(key, value) {
    setCampos((prev) => ({ ...prev, [key]: value }));
  }

  function validar() {
    const nuevos = {};
    if (!campos.cama.trim()) nuevos.cama = 'La cama es obligatoria.';
    if (!campos.sede) nuevos.sede = 'Selecciona una sede.';
    if (!campos.area) nuevos.area = 'Selecciona un área.';
    if (!campos.tipo) nuevos.tipo = 'Selecciona un tipo de mantenimiento.';
    if (!campos.prioridad) nuevos.prioridad = 'Selecciona una prioridad.';
    if (!campos.fecha || !campos.hora) nuevos.fecha = 'La fecha y hora programada son obligatorias.';
    if (!campos.responsable.trim()) nuevos.responsable = 'El responsable es obligatorio.';
    if (!campos.descripcion.trim()) nuevos.descripcion = 'La descripción es obligatoria.';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    const [anio, mes, dia] = campos.fecha.split('-').map(Number);
    const [hora, minuto] = campos.hora.split(':').map(Number);
    onSubmit({
      cama: campos.cama.trim(),
      sede: campos.sede,
      area: campos.area,
      tipo: campos.tipo,
      prioridad: campos.prioridad,
      fechaProgramada: new Date(anio, mes - 1, dia, hora, minuto).getTime(),
      responsable: campos.responsable.trim(),
      descripcion: campos.descripcion.trim(),
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cbm-form-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-form-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuWrench}
            tone="primary"
            title="Programar mantenimiento"
            titleId="cbm-form-title"
            onClose={onClose}
          />
          <div className="modal-body cbm-form-body">
            <div className="cbm-form-row">
              <div className="form-field">
                <label htmlFor="cbm-form-cama">Cama<span className="cbm-required-mark">*</span></label>
                <input
                  id="cbm-form-cama"
                  type="text"
                  placeholder="Ej. 101-A"
                  value={campos.cama}
                  onChange={(e) => setCampo('cama', e.target.value)}
                />
                {errores.cama && <span className="cbm-form-error">{errores.cama}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbm-form-sede">Sede<span className="cbm-required-mark">*</span></label>
                <FormSelect
                  id="cbm-form-sede"
                  value={campos.sede}
                  onChange={(v) => setCampo('sede', v)}
                  placeholder="Selecciona una sede"
                  options={SEDE_OPTIONS}
                />
                {errores.sede && <span className="cbm-form-error">{errores.sede}</span>}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="cbm-form-area">Área<span className="cbm-required-mark">*</span></label>
              <FormSelect
                id="cbm-form-area"
                value={campos.area}
                onChange={(v) => setCampo('area', v)}
                placeholder="Selecciona un área"
                options={AREA_OPTIONS}
              />
              {errores.area && <span className="cbm-form-error">{errores.area}</span>}
            </div>

            <div className="cbm-form-row">
              <div className="form-field">
                <label htmlFor="cbm-form-tipo">Tipo de mantenimiento<span className="cbm-required-mark">*</span></label>
                <FormSelect
                  id="cbm-form-tipo"
                  value={campos.tipo}
                  onChange={(v) => setCampo('tipo', v)}
                  placeholder="Selecciona un tipo"
                  options={TIPO_OPTIONS}
                />
                {errores.tipo && <span className="cbm-form-error">{errores.tipo}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="cbm-form-prioridad">Prioridad<span className="cbm-required-mark">*</span></label>
                <FormSelect
                  id="cbm-form-prioridad"
                  value={campos.prioridad}
                  onChange={(v) => setCampo('prioridad', v)}
                  placeholder="Selecciona una prioridad"
                  options={PRIORIDAD_OPTIONS}
                />
                {errores.prioridad && <span className="cbm-form-error">{errores.prioridad}</span>}
              </div>
            </div>

            <div className="cbm-form-row">
              <div className="form-field">
                <label htmlFor="cbm-form-fecha">Fecha programada<span className="cbm-required-mark">*</span></label>
                <input
                  id="cbm-form-fecha"
                  type="date"
                  value={campos.fecha}
                  onChange={(e) => setCampo('fecha', e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="cbm-form-hora">&nbsp;</label>
                <input
                  id="cbm-form-hora"
                  type="time"
                  value={campos.hora}
                  onChange={(e) => setCampo('hora', e.target.value)}
                />
              </div>
            </div>
            {errores.fecha && <span className="cbm-form-error">{errores.fecha}</span>}

            <div className="form-field">
              <label htmlFor="cbm-form-responsable">Responsable<span className="cbm-required-mark">*</span></label>
              <input
                id="cbm-form-responsable"
                type="text"
                placeholder="Nombre del responsable"
                value={campos.responsable}
                onChange={(e) => setCampo('responsable', e.target.value)}
              />
              {errores.responsable && <span className="cbm-form-error">{errores.responsable}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="cbm-form-descripcion">Descripción<span className="cbm-required-mark">*</span></label>
              <textarea
                id="cbm-form-descripcion"
                rows="3"
                placeholder="Describe el trabajo a realizar..."
                value={campos.descripcion}
                onChange={(e) => setCampo('descripcion', e.target.value)}
              />
              {errores.descripcion && <span className="cbm-form-error">{errores.descripcion}</span>}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Programar mantenimiento</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ProgramarMantenimientoModal.css`**

```css
.cbm-form-modal-card{width:560px;}
.cbm-form-row{display:flex;gap:12px;}
.cbm-form-row .form-field{flex:1;min-width:0;}
.cbm-form-body > .cbm-form-error{margin-top:-8px;}
.cbm-required-mark{color:var(--red);margin-left:2px;}
.cbm-form-error{font-size:var(--fs-sm);color:var(--red);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/ProgramarMantenimientoModal/ProgramarMantenimientoModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/ProgramarMantenimientoModal
git commit -m "feat(gestion-camas): add Programar mantenimiento create modal"
```

---

### Task 10: `IniciarMantenimientoModal`

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/IniciarMantenimientoModal/IniciarMantenimientoModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/IniciarMantenimientoModal/IniciarMantenimientoModal.css`

**Interfaces:**
- Consumes: `AREA_LABEL, SEDE_LABEL` (Task 1); `ModalHeader`.
- Produces: `IniciarMantenimientoModal({ mantenimiento, onClose, onConfirm })` default export. `onConfirm(mantenimiento.id)` fires on confirm. Used by Task 15.

- [ ] **Step 1: Create `IniciarMantenimientoModal.jsx`**

```jsx
'use client';

import './IniciarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { AREA_LABEL, SEDE_LABEL } from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuWrench } from 'react-icons/lu';

// Confirmación simple antes de mutar estado — mismo patrón que
// IniciarLimpiezaModal.jsx: sin campos que editar, .modal-card alcanza sin
// el fix de "`.modal-card > form`" que sí necesitan los modales con inputs.
export default function IniciarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-iniciar-title">
        <ModalHeader
          icon={LuWrench}
          tone="primary"
          title="Iniciar mantenimiento"
          titleId="cbm-iniciar-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-field">
            <label>Cama</label>
            <div className="tf-readonly-value">
              {`${mantenimiento.cama} — ${SEDE_LABEL[mantenimiento.sede]} · ${AREA_LABEL[mantenimiento.area]} · ${mantenimiento.ubicacion}`}
            </div>
          </div>
          <p className="cbm-modal-msg">
            Al iniciar el mantenimiento la cama pasará a estado &quot;En proceso&quot;.
          </p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={() => onConfirm(mantenimiento.id)}>
            <LuWrench className="icon" aria-hidden="true" />
            Iniciar mantenimiento
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `IniciarMantenimientoModal.css`**

```css
/* .modal-overlay/.modal-card/.task-mini-modal-card/.modal-body/.modal-footer/
   .form-field/.tf-readonly-value/.btn: definidas en ../../GestionCamas.css —
   acá solo el mensaje de confirmación, exclusivo de este modal. */
.cbm-modal-msg{margin:12px 0 0;font-size:var(--fs-base);color:var(--ink-700);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/IniciarMantenimientoModal/IniciarMantenimientoModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/IniciarMantenimientoModal
git commit -m "feat(gestion-camas): add Iniciar mantenimiento confirm modal"
```

---

### Task 11: `FinalizarMantenimientoModal`

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/FinalizarMantenimientoModal/FinalizarMantenimientoModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/FinalizarMantenimientoModal/FinalizarMantenimientoModal.css`

**Interfaces:**
- Consumes: `ModalHeader`.
- Produces: `FinalizarMantenimientoModal({ mantenimiento, onClose, onConfirm })` default export. `onConfirm(mantenimiento.id, observacionOrUndefined)` fires on submit. Used by Task 15 (both from the row menu and from the detail modal's contextual footer button).

- [ ] **Step 1: Create `FinalizarMantenimientoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './FinalizarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCircleCheck } from 'react-icons/lu';

// Observación opcional al finalizar (no está en el encargo, pero da lugar a
// dejar una nota sin necesitar "Registrar observación" después) — mismo
// criterio de campo opcional que IgnorarInconsistenciaModal.jsx.
export default function FinalizarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [observacion, setObservacion] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(mantenimiento.id, observacion.trim() || undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-finalizar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCircleCheck}
            tone="primary"
            title="Finalizar mantenimiento"
            titleId="cbm-finalizar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbm-modal-msg">{`¿Deseas finalizar el mantenimiento de la cama ${mantenimiento.cama}?`}</p>
            <div className="form-field">
              <label htmlFor="cbm-finalizar-obs">Observación (opcional)</label>
              <textarea
                id="cbm-finalizar-obs"
                rows="2"
                placeholder="Notas sobre el trabajo realizado..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              <LuCircleCheck className="icon" aria-hidden="true" />
              Finalizar mantenimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `FinalizarMantenimientoModal.css`**

```css
/* .modal-overlay/.modal-card/.task-mini-modal-card/.modal-body/.modal-footer/
   .form-field/.btn: definidas en ../../GestionCamas.css — acá solo el
   mensaje, exclusivo de este modal. */
.cbm-modal-msg{margin:0;font-size:var(--fs-base);color:var(--ink-700);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/FinalizarMantenimientoModal/FinalizarMantenimientoModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/FinalizarMantenimientoModal
git commit -m "feat(gestion-camas): add Finalizar mantenimiento modal"
```

---

### Task 12: `ReprogramarMantenimientoModal`

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/ReprogramarMantenimientoModal/ReprogramarMantenimientoModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/ReprogramarMantenimientoModal/ReprogramarMantenimientoModal.css`

**Interfaces:**
- Consumes: `formatFecha, formatHoraCorta` (Task 1); `ModalHeader`.
- Produces: `ReprogramarMantenimientoModal({ mantenimiento, onClose, onConfirm })` default export. `onConfirm(mantenimiento.id, nuevaFechaEpochMs)` fires once both date and time are filled. Used by Task 15.

- [ ] **Step 1: Create `ReprogramarMantenimientoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './ReprogramarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { formatFecha, formatHoraCorta } from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuCalendarClock } from 'react-icons/lu';

export default function ReprogramarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!fecha || !hora) {
      setError('La fecha y hora son obligatorias.');
      return;
    }
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const [hh, mm] = hora.split(':').map(Number);
    onConfirm(mantenimiento.id, new Date(anio, mes - 1, dia, hh, mm).getTime());
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-reprogramar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Reprogramar mantenimiento"
            titleId="cbm-reprogramar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Fecha actual</label>
              <div className="tf-readonly-value">
                {`${formatFecha(mantenimiento.fechaProgramada)} · ${formatHoraCorta(mantenimiento.fechaProgramada)}`}
              </div>
            </div>
            <div className="cbm-reprogramar-row">
              <div className="form-field">
                <label htmlFor="cbm-reprogramar-fecha">Nueva fecha<span className="cbm-required-mark">*</span></label>
                <input id="cbm-reprogramar-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="cbm-reprogramar-hora">Hora<span className="cbm-required-mark">*</span></label>
                <input id="cbm-reprogramar-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
            {error && <span className="cbm-form-error">{error}</span>}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Reprogramar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ReprogramarMantenimientoModal.css`**

```css
.cbm-reprogramar-row{display:flex;gap:12px;margin-top:12px;}
.cbm-reprogramar-row .form-field{flex:1;min-width:0;}
.cbm-required-mark{color:var(--red);margin-left:2px;}
.cbm-form-error{font-size:var(--fs-sm);color:var(--red);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/ReprogramarMantenimientoModal/ReprogramarMantenimientoModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/ReprogramarMantenimientoModal
git commit -m "feat(gestion-camas): add Reprogramar mantenimiento modal"
```

---

### Task 13: `CancelarMantenimientoModal`

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/CancelarMantenimientoModal/CancelarMantenimientoModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/CancelarMantenimientoModal/CancelarMantenimientoModal.css`

**Interfaces:**
- Consumes: `ModalHeader`.
- Produces: `CancelarMantenimientoModal({ mantenimiento, onClose, onConfirm })` default export. `onConfirm(mantenimiento.id, motivoOrUndefined)` fires on submit. Used by Task 15.

- [ ] **Step 1: Create `CancelarMantenimientoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './CancelarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuBan } from 'react-icons/lu';

// tone="danger" + btn-danger (mismo patrón que RestablecerConfigModal.jsx) —
// acción destructiva sobre un mantenimiento programado, nunca ejecutable sin
// pasar por esta confirmación.
export default function CancelarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(mantenimiento.id, motivo.trim() || undefined);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-cancelar-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuBan}
            tone="danger"
            title="Cancelar mantenimiento"
            titleId="cbm-cancelar-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbm-cancelar-texto">
              {`¿Deseas cancelar el mantenimiento programado para la cama ${mantenimiento.cama}? Esta acción quedará registrada en el historial.`}
            </p>
            <div className="form-field">
              <label htmlFor="cbm-cancelar-motivo">Motivo (opcional)</label>
              <textarea
                id="cbm-cancelar-motivo"
                rows="2"
                placeholder="Describe brevemente por qué se cancela..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Volver</button>
            <button type="submit" className="btn btn-danger">Cancelar mantenimiento</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `CancelarMantenimientoModal.css`**

```css
.cbm-cancelar-texto{margin:0 0 12px;font-size:var(--fs-base);color:var(--ink-700);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/CancelarMantenimientoModal/CancelarMantenimientoModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/CancelarMantenimientoModal
git commit -m "feat(gestion-camas): add Cancelar mantenimiento modal"
```

---

### Task 14: `RegistrarObservacionModal`

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/RegistrarObservacionModal/RegistrarObservacionModal.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/RegistrarObservacionModal/RegistrarObservacionModal.css`

**Interfaces:**
- Consumes: `ModalHeader`.
- Produces: `RegistrarObservacionModal({ mantenimiento, onClose, onConfirm })` default export. `onConfirm(mantenimiento.id, texto)` fires only once `texto` is non-empty (submit button is disabled otherwise). Used by Task 15.

- [ ] **Step 1: Create `RegistrarObservacionModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './RegistrarObservacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuMessageSquare } from 'react-icons/lu';

// Mismo patrón de campo requerido + `required-pill` que
// IgnorarInconsistenciaModal.jsx.
export default function RegistrarObservacionModal({ mantenimiento, onClose, onConfirm }) {
  const [observacion, setObservacion] = useState('');
  const puedeConfirmar = observacion.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(mantenimiento.id, observacion.trim());
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-observacion-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuMessageSquare}
            tone="neutral"
            title="Registrar observación"
            titleId="cbm-observacion-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="cbm-observacion-texto">{`Cama ${mantenimiento.cama} — la observación quedará agregada al historial del mantenimiento.`}</p>
            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="cbm-observacion-texto">Observación</label>
                <span className="required-pill">Requerido</span>
              </div>
              <textarea
                id="cbm-observacion-texto"
                rows="3"
                placeholder="Describe lo observado durante el mantenimiento..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Registrar observación</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `RegistrarObservacionModal.css`**

```css
.cbm-observacion-texto{margin:0 0 12px;font-size:var(--fs-base);color:var(--ink-700);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/RegistrarObservacionModal/RegistrarObservacionModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/RegistrarObservacionModal
git commit -m "feat(gestion-camas): add Registrar observación modal"
```

---

### Task 15: Main screen (`GestionCamasMantenimiento`)

This wires every component from Tasks 1–14 together. It is the last piece before the route can render.

**Files:**
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/GestionCamasMantenimiento.jsx`
- Create: `src/Components/GestionCamas/GestionCamasMantenimiento/GestionCamasMantenimiento.css`

**Interfaces:**
- Consumes: everything from Tasks 1–14, plus `Sidebar` (`@/Components/Sidebar/Sidebar`), `Topbar` (`@/Components/Topbar/Topbar`), `KpiCard` (`@/Components/KpiCard/KpiCard`), `AreaSelector` (`@/Components/AreaSelector/AreaSelector`), `GestionCamasSidebar` (`../GestionCamasSidebar/GestionCamasSidebar`), `initShellChrome` (`@/hooks/Shell/legacy-shell-chrome`).
- Produces: `GestionCamasMantenimiento()` default export, a full page component with no props. Used by Task 16's route.

- [ ] **Step 1: Create `GestionCamasMantenimiento.jsx`**

```jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasMantenimiento.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import MantenimientoFiltrosPopover from './MantenimientoFiltrosPopover/MantenimientoFiltrosPopover';
import MantenimientoFechaSelector from './MantenimientoFechaSelector/MantenimientoFechaSelector';
import MantenimientoRowActionsMenu from './MantenimientoRowActionsMenu/MantenimientoRowActionsMenu';
import MantenimientoPagination from './MantenimientoPagination/MantenimientoPagination';
import { EstadoMantenimientoBadge, PrioridadBadge } from './MantenimientoBadges/MantenimientoBadges';
import MantenimientoDetailModal from './MantenimientoDetailModal/MantenimientoDetailModal';
import ProgramarMantenimientoModal from './ProgramarMantenimientoModal/ProgramarMantenimientoModal';
import IniciarMantenimientoModal from './IniciarMantenimientoModal/IniciarMantenimientoModal';
import FinalizarMantenimientoModal from './FinalizarMantenimientoModal/FinalizarMantenimientoModal';
import ReprogramarMantenimientoModal from './ReprogramarMantenimientoModal/ReprogramarMantenimientoModal';
import CancelarMantenimientoModal from './CancelarMantenimientoModal/CancelarMantenimientoModal';
import RegistrarObservacionModal from './RegistrarObservacionModal/RegistrarObservacionModal';
import {
  AREAS, AREA_LABEL, ESTADOS, MANTENIMIENTOS_SEED, OFFSETS, PRIORIDADES, SEDES, SEDE_LABEL,
  TIPOS, TIPO_LABEL, USUARIO_ACTUAL, formatFecha, formatHoraCorta,
} from '@/hooks/GestionCamas/mockMantenimientoData';
import {
  LuCalendarClock, LuCircleCheck, LuEye, LuFilterX, LuSearch, LuTriangleAlert, LuWrench,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = { piso: 'todos', sector: 'todos' };
const RANGO_FECHA_INICIAL = { desde: '', hasta: '' };

// `new Date('yyyy-mm-dd')` parsea como UTC y puede correrse un día según el
// huso horario del navegador — se fuerza hora local agregando "T00:00:00",
// mismo cuidado que fechaAgosto2026() en mockMantenimientoData.js.
function enRangoFecha(ts, desde, hasta) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  if (desde) {
    const dDesde = new Date(`${desde}T00:00:00`);
    if (d < dDesde) return false;
  }
  if (hasta) {
    const dHasta = new Date(`${hasta}T00:00:00`);
    if (d > dHasta) return false;
  }
  return true;
}

// "Mantenimiento" — cola de tareas de mantenimiento preventivo/correctivo
// sobre camas (encargo: pantalla nueva de Gestión de Camas, mismo esqueleto
// KPI row → filter-bar → tabla → paginación que Limpieza/Reservas). Fila
// entera clicable → abre el detalle (encargo sección 11), botón 👁 + menú
// "⋯" en la última celda (encargo sección 9, mismo patrón que BedTable.jsx).
export default function GestionCamasMantenimiento() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [mantenimientos, setMantenimientos] = useState(MANTENIMIENTOS_SEED);
  const [nextId, setNextId] = useState(MANTENIMIENTOS_SEED.length + 1);

  const [query, setQuery] = useState('');
  const [sede, setSede] = useState('todas');
  const [area, setArea] = useState('todas');
  const [tipo, setTipo] = useState('todos');
  const [estado, setEstado] = useState('todos');
  const [prioridad, setPrioridad] = useState('todas');
  const [rangoFecha, setRangoFecha] = useState(RANGO_FECHA_INICIAL);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(null); // { type, id } | null

  function withReset(setter) {
    return (v) => { setter(v); setPage(1); };
  }
  const handleChangeSede = withReset(setSede);
  const handleChangeArea = withReset(setArea);
  const handleChangeTipo = withReset(setTipo);
  const handleChangeEstado = withReset(setEstado);
  const handleChangePrioridad = withReset(setPrioridad);

  function handleCambioFiltroAvanzado(key, value) {
    setFiltrosAvanzados((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }
  function handleLimpiarFiltrosAvanzados() {
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
    setPage(1);
  }
  function handleCambioFecha(key, value) {
    setRangoFecha((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }
  function handleLimpiarFecha() {
    setRangoFecha(RANGO_FECHA_INICIAL);
    setPage(1);
  }

  const kpis = useMemo(() => {
    const programados = mantenimientos.filter((m) => m.estado === 'programado').length;
    const enProceso = mantenimientos.filter((m) => m.estado === 'en-proceso').length;
    const vencidos = mantenimientos.filter((m) => m.estado === 'vencido').length;
    const finalizados = mantenimientos.filter((m) => m.estado === 'finalizado').length;
    return {
      programados: OFFSETS.programados + programados,
      enProceso: OFFSETS.enProceso + enProceso,
      vencidos: OFFSETS.vencidos + vencidos,
      finalizados: OFFSETS.finalizados + finalizados,
    };
  }, [mantenimientos]);

  const mantenimientosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mantenimientos.filter((m) => {
      if (sede !== 'todas' && m.sede !== sede) return false;
      if (area !== 'todas' && m.area !== area) return false;
      if (tipo !== 'todos' && m.tipo !== tipo) return false;
      if (estado !== 'todos' && m.estado !== estado) return false;
      if (prioridad !== 'todas' && m.prioridad !== prioridad) return false;
      if (filtrosAvanzados.piso !== 'todos' && m.piso !== filtrosAvanzados.piso) return false;
      if (filtrosAvanzados.sector !== 'todos' && m.sector !== filtrosAvanzados.sector) return false;
      if (!enRangoFecha(m.fechaProgramada, rangoFecha.desde, rangoFecha.hasta)) return false;
      if (!q) return true;
      return (
        m.cama.toLowerCase().includes(q)
        || TIPO_LABEL[m.tipo].toLowerCase().includes(q)
        || m.responsable.toLowerCase().includes(q)
      );
    });
  }, [mantenimientos, query, sede, area, tipo, estado, prioridad, filtrosAvanzados, rangoFecha]);

  const total = mantenimientosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginaSegura = Math.min(page, totalPages);
  const mantenimientosPagina = useMemo(
    () => mantenimientosFiltrados.slice((paginaSegura - 1) * pageSize, paginaSegura * pageSize),
    [mantenimientosFiltrados, paginaSegura, pageSize],
  );

  const cantidadFiltrosActivos = (sede !== 'todas' ? 1 : 0) + (area !== 'todas' ? 1 : 0)
    + (tipo !== 'todos' ? 1 : 0) + (estado !== 'todos' ? 1 : 0) + (prioridad !== 'todas' ? 1 : 0)
    + (query.trim() !== '' ? 1 : 0) + (filtrosAvanzados.piso !== 'todos' ? 1 : 0)
    + (filtrosAvanzados.sector !== 'todos' ? 1 : 0) + (rangoFecha.desde || rangoFecha.hasta ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  function handleLimpiarTodo() {
    setQuery('');
    setSede('todas');
    setArea('todas');
    setTipo('todos');
    setEstado('todos');
    setPrioridad('todas');
    handleLimpiarFiltrosAvanzados();
    handleLimpiarFecha();
  }

  function handleCloseModal() { setModal(null); }
  function abrirModal(type, id) { setModal({ type, id }); }

  function agregarEvento(id, tipoEvento, titulo, usuario, motivo) {
    setMantenimientos((prev) => prev.map((m) => (m.id !== id ? m : {
      ...m,
      historial: [
        ...m.historial,
        {
          id: `H-${m.id}-${m.historial.length + 1}`, tipo: tipoEvento, titulo, fecha: Date.now(), usuario, motivo,
        },
      ],
    })));
  }

  function handleCrear(datos) {
    const id = `MNT-${nextId}`;
    setNextId((n) => n + 1);
    const ahora = Date.now();
    setMantenimientos((prev) => [
      {
        id,
        cama: datos.cama,
        ubicacion: '—',
        piso: null,
        sector: null,
        sede: datos.sede,
        area: datos.area,
        tipo: datos.tipo,
        prioridad: datos.prioridad,
        estado: 'programado',
        fechaProgramada: datos.fechaProgramada,
        responsable: datos.responsable,
        descripcion: datos.descripcion,
        historial: [
          {
            id: `H-${id}-1`, tipo: 'creado', titulo: `Creado por ${USUARIO_ACTUAL.nombre}`, fecha: ahora, usuario: USUARIO_ACTUAL.nombre,
          },
          {
            id: `H-${id}-2`, tipo: 'programado', titulo: 'Programado', fecha: ahora, usuario: USUARIO_ACTUAL.nombre,
          },
        ],
      },
      ...prev,
    ]);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${datos.cama} programado.`);
  }

  function handleConfirmIniciar(id) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : { ...x, estado: 'en-proceso' })));
    agregarEvento(id, 'iniciado', 'Mantenimiento iniciado', USUARIO_ACTUAL.nombre);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} iniciado.`);
  }

  function handleConfirmFinalizar(id, observacion) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : { ...x, estado: 'finalizado' })));
    agregarEvento(id, 'finalizado', 'Mantenimiento finalizado', USUARIO_ACTUAL.nombre, observacion);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} finalizado.`);
  }

  function handleConfirmReprogramar(id, nuevaFecha) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    const fechaAnterior = `${formatFecha(m.fechaProgramada)} · ${formatHoraCorta(m.fechaProgramada)}`;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : {
      ...x, estado: 'programado', fechaProgramada: nuevaFecha,
    })));
    agregarEvento(id, 'reprogramado', 'Reprogramado', USUARIO_ACTUAL.nombre, `Fecha anterior: ${fechaAnterior}`);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} reprogramado.`);
  }

  function handleConfirmCancelar(id, motivo) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : { ...x, estado: 'cancelado' })));
    agregarEvento(id, 'cancelado', 'Cancelado', USUARIO_ACTUAL.nombre, motivo);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} cancelado.`);
  }

  function handleConfirmObservacion(id, texto) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    agregarEvento(id, 'observacion', 'Observación registrada', USUARIO_ACTUAL.nombre, texto);
    setModal(null);
    window.ncToast?.(`Observación registrada para cama ${m.cama}.`);
  }

  // "ver-detalle" no pasa por acá: el botón 👁 llama abrirModal('detalle', ...)
  // directamente (ver JSX abajo); este handler solo cubre lo que viene del
  // menú "⋯" (MENU_ACCIONES en mockMantenimientoData.js), que nunca emite
  // esa acción.
  function handleAction(action, id) {
    if (action === 'ver-historial') { abrirModal('detalle', id); return; }
    if (action === 'iniciar-mantenimiento') { abrirModal('iniciar', id); return; }
    if (action === 'finalizar-mantenimiento') { abrirModal('finalizar', id); return; }
    if (action === 'reprogramar') { abrirModal('reprogramar', id); return; }
    if (action === 'cancelar') { abrirModal('cancelar', id); return; }
    if (action === 'registrar-observacion') { abrirModal('observacion', id); }
  }

  const mantenimientoModal = modal ? mantenimientos.find((m) => m.id === modal.id) : null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Mantenimiento"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbm-content">
          <GestionCamasSidebar />

          <div className="cbm-page-body">
            <div className="cbm-header">
              <div>
                <h1>Mantenimiento</h1>
                <p>Gestión de mantenimientos preventivos y correctivos de las camas.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => abrirModal('crear')}>
                <LuWrench className="icon" aria-hidden="true" />
                Programar mantenimiento
              </button>
            </div>

            <div className="cbm-kpi-row">
              <KpiCard icon={LuCalendarClock} label="Programados" value={kpis.programados} description="Por ejecutar" variant="info" />
              <KpiCard icon={LuWrench} label="En proceso" value={kpis.enProceso} description="Actualmente en ejecución" variant="warning" />
              <KpiCard icon={LuTriangleAlert} label="Vencidos" value={kpis.vencidos} description="Requieren atención" variant="danger" />
              <KpiCard icon={LuCircleCheck} label="Finalizados" value={kpis.finalizados} description="Completados" variant="success" />
            </div>

            <div className="card cbm-table-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar cama, mantenimiento, responsable..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    aria-label="Buscar cama, mantenimiento o responsable"
                  />
                </div>

                <div className="filter-spacer" />

                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AreaSelector label="Área" options={AREAS} value={area} onChange={handleChangeArea} />
                <AreaSelector label="Tipo" options={TIPOS} value={tipo} onChange={handleChangeTipo} />
                <AreaSelector label="Estado" options={ESTADOS} value={estado} onChange={handleChangeEstado} />
                <AreaSelector label="Prioridad" options={PRIORIDADES} value={prioridad} onChange={handleChangePrioridad} />
                <MantenimientoFechaSelector
                  desde={rangoFecha.desde}
                  hasta={rangoFecha.hasta}
                  onChange={handleCambioFecha}
                  onLimpiar={handleLimpiarFecha}
                />
                <MantenimientoFiltrosPopover
                  piso={filtrosAvanzados.piso}
                  sector={filtrosAvanzados.sector}
                  onChange={handleCambioFiltroAvanzado}
                  onLimpiar={handleLimpiarFiltrosAvanzados}
                />
                {hayFiltrosActivos && (
                  <button type="button" className="btn btn-secondary btn-sm cbm-limpiar-filtros-btn" onClick={handleLimpiarTodo}>
                    <LuFilterX className="icon" aria-hidden="true" />
                    Limpiar filtros
                    <span className="badge-count">{cantidadFiltrosActivos}</span>
                  </button>
                )}
              </div>

              {mantenimientosPagina.length === 0 ? (
                <div className="cb-empty-state">No se encontraron mantenimientos con estos filtros.</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table cbm-table">
                    <thead>
                      <tr>
                        <th>Cama</th>
                        <th>Sede</th>
                        <th>Área</th>
                        <th>Mantenimiento</th>
                        <th>Prioridad</th>
                        <th>Fecha programada</th>
                        <th>Estado</th>
                        <th>Responsable</th>
                        <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mantenimientosPagina.map((m) => (
                        <tr key={m.id} className="cbm-row-clickable" onClick={() => abrirModal('detalle', m.id)}>
                          <td>
                            <span className="cell-primary">{m.cama}</span>
                            <span className="cell-sub">{m.ubicacion}</span>
                          </td>
                          <td className="cell-muted">{SEDE_LABEL[m.sede]}</td>
                          <td className="cell-muted">{AREA_LABEL[m.area]}</td>
                          <td className="cell-muted">{TIPO_LABEL[m.tipo]}</td>
                          <td><PrioridadBadge prioridad={m.prioridad} /></td>
                          <td>
                            <span className="cell-primary">{formatFecha(m.fechaProgramada)}</span>
                            <span className="cell-sub">{formatHoraCorta(m.fechaProgramada)}</span>
                          </td>
                          <td><EstadoMantenimientoBadge estado={m.estado} /></td>
                          <td>{m.responsable}</td>
                          <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                            <div className="cbm-table-actions">
                              <button
                                type="button"
                                className="cbm-actions-menu-btn"
                                onClick={() => abrirModal('detalle', m.id)}
                                aria-label={`Ver detalle de cama ${m.cama}`}
                                title="Ver detalle"
                              >
                                <LuEye className="icon" />
                              </button>
                              <MantenimientoRowActionsMenu estado={m.estado} cama={m.cama} onAction={(action) => handleAction(action, m.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <MantenimientoPagination
                page={paginaSegura}
                pageSize={pageSize}
                total={total}
                onChangePage={setPage}
                onChangePageSize={(n) => { setPageSize(n); setPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      {modal?.type === 'crear' && (
        <ProgramarMantenimientoModal onClose={handleCloseModal} onSubmit={handleCrear} />
      )}
      {modal?.type === 'detalle' && mantenimientoModal && (
        <MantenimientoDetailModal
          mantenimiento={mantenimientoModal}
          onClose={handleCloseModal}
          onFinalizar={(m) => abrirModal('finalizar', m.id)}
        />
      )}
      {modal?.type === 'iniciar' && mantenimientoModal && (
        <IniciarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmIniciar} />
      )}
      {modal?.type === 'finalizar' && mantenimientoModal && (
        <FinalizarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmFinalizar} />
      )}
      {modal?.type === 'reprogramar' && mantenimientoModal && (
        <ReprogramarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmReprogramar} />
      )}
      {modal?.type === 'cancelar' && mantenimientoModal && (
        <CancelarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmCancelar} />
      )}
      {modal?.type === 'observacion' && mantenimientoModal && (
        <RegistrarObservacionModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmObservacion} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `GestionCamasMantenimiento.css`**

```css
/* Selector compuesto (.content.cbm-content), no solo .cbm-content — pisa a
   .content (definida en ../GestionCamas.css) y su prioridad no puede
   depender del orden de import entre rutas, mismo bug real ya documentado
   en GestionCamasLimpieza.css/GestionCamasAuditoria.css. */
.content.cbm-content{padding:0;gap:0;flex-direction:row;overflow:hidden;}
.cbm-page-body{
  flex:1;min-width:0;min-height:0;
  display:flex;flex-direction:column;gap:16px;
  padding:16px;overflow-y:auto;
}

.cbm-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-shrink:0;flex-wrap:wrap;}
.cbm-header h1{margin:0 0 4px;font-size:var(--fs-3xl);font-weight:var(--fw-semibold);color:var(--ink-900);}
.cbm-header p{margin:0;font-size:var(--fs-base);color:var(--ink-500);}

.cbm-kpi-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;flex-shrink:0;}

.cbm-table-card{flex:1;min-height:0;}

.cbm-limpiar-filtros-btn .badge-count{
  background:var(--primary);color:#fff;font-size:var(--fs-xs);font-weight:var(--fw-bold);min-width:16px;height:16px;
  border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;
}

/* Sin esto la columna de Acciones queda con ancho "auto" sobrado — mismo fix
   que .cb-table .col-acciones (BedTable.css) / .cbl-table .col-acciones
   (GestionCamasLimpieza.css). */
.cbm-table .col-acciones{width:1%;white-space:nowrap;text-align:right;}
.cbm-table-actions{display:inline-flex;align-items:center;gap:4px;}

/* Fila completa clicable → abre el detalle (encargo sección 11) — el botón
   👁 y el menú "⋯" cortan la propagación del click (ver
   GestionCamasMantenimiento.jsx) para no reabrir el mismo modal ni
   interferir con el dropdown. */
.cbm-row-clickable{cursor:pointer;}
.cbm-row-clickable:hover td{background:var(--gray-bg);}

@media (max-width:1440px){
  .cbm-kpi-row{grid-template-columns:repeat(2,1fr);}
}
@media (max-width:1024px){
  .cbm-header{width:100%;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionCamas/GestionCamasMantenimiento/GestionCamasMantenimiento.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionCamas/GestionCamasMantenimiento/GestionCamasMantenimiento.jsx src/Components/GestionCamas/GestionCamasMantenimiento/GestionCamasMantenimiento.css
git commit -m "feat(gestion-camas): wire up Mantenimiento main screen"
```

---

### Task 16: Route

**Files:**
- Create: `src/app/gestion-camas/mantenimiento/page.jsx`

**Interfaces:**
- Consumes: `GestionCamasMantenimiento` default export (Task 15).
- Produces: the `/gestion-camas/mantenimiento` route.

- [ ] **Step 1: Create the file**

```jsx
import GestionCamasMantenimiento from '@/Components/GestionCamas/GestionCamasMantenimiento/GestionCamasMantenimiento';

export default function GestionCamasMantenimientoPage() {
  return <GestionCamasMantenimiento />;
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/app/gestion-camas/mantenimiento/page.jsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/gestion-camas/mantenimiento/page.jsx
git commit -m "feat(gestion-camas): add Mantenimiento route"
```

---

### Task 17: Full lint pass + manual smoke test

**Files:** none (verification only).

- [ ] **Step 1: Full project lint**

Run: `npm run lint`
Expected: no errors (warnings pre-existing elsewhere in the repo are acceptable; nothing new from the `Mantenimiento` files).

- [ ] **Step 2: Start the dev server**

Run: `npm run dev` (background)
Expected: server starts on its default port with no compile errors, especially none referencing any `Mantenimiento*` file.

- [ ] **Step 3: Manual smoke test in the browser**

Navigate to `/gestion-camas/mantenimiento` and confirm, against the original encargo:

1. Sidebar interno: "Mantenimiento" aparece en Operación, después de "Limpieza", y queda resaltado (fondo azul claro + barra izquierda) al estar en esta ruta.
2. Breadcrumb: "Procesos / Gestión de Camas / Mantenimiento" con "Mantenimiento" activo.
3. Header: título "Mantenimiento", descripción, botón azul "+ Programar mantenimiento" como único CTA.
4. 4 KPI cards: Programados (12, azul), En proceso (4, ámbar), Vencidos (2, rojo/mayor peso), Finalizados (25, verde).
5. Filtros: buscador + Sede/Área/Tipo/Estado/Prioridad + selector de rango de fecha + "Más filtros" (Piso/Sector) — todos funcionan y "Limpiar filtros" aparece solo cuando hay algo activo.
6. Tabla: 8 filas con las columnas Cama/Sede/Área/Mantenimiento/Prioridad/Fecha programada/Estado/Responsable/Acciones, coincidiendo con los datos de ejemplo del encargo.
7. Clic en una fila (fuera de la celda de Acciones) abre `MantenimientoDetailModal`; clic en 👁 hace lo mismo.
8. Menú "⋯" muestra las acciones correctas por estado (Programado/Vencido: Iniciar/Reprogramar/Cancelar; En proceso: Finalizar/Registrar observación; Finalizado: Ver historial) y cada una abre su modal correspondiente sin recargar la página.
9. Confirmar "Iniciar mantenimiento" en un registro Programado lo mueve a "En proceso" (badge ámbar) y el KPI "En proceso" sube en 1.
10. Confirmar "Finalizar mantenimiento" en un registro En proceso lo mueve a "Finalizado" (badge verde).
11. "Reprogramar" cambia la fecha mostrada en la fila y, si el registro estaba Vencido, lo vuelve a Programado.
12. "Cancelar" mueve el registro a estado Cancelado (badge gris).
13. "Registrar observación" en un registro En proceso no cambia su estado, pero la nueva entrada aparece en HISTORIAL al reabrir el detalle.
14. "+ Programar mantenimiento" crea una fila nueva en estado Programado al completar el formulario, y aparece primera en la tabla (página 1).
15. Paginación: cambiar "por página" y navegar entre páginas actualiza la tabla y el texto "Mostrando X–Y de Z mantenimientos".
16. No hay errores en la consola del navegador durante ninguno de los pasos anteriores.

- [ ] **Step 4: Stop the dev server**

Stop the background `npm run dev` process once the smoke test passes.
