# Historial Quirúrgico del Paciente V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new read-only "Historial quirúrgico del paciente" screen — a 3-level master-detail (intervenciones → procedimientos → recursos en 4 tabs) — reachable by clicking the search icon already added to Programación de Sala de Cirugías, which opens a new patient-search modal and navigates to the new screen on selection.

**Architecture:** A new static mock module (`mockHistorialQuirurgico.js`) holds one fixed demo patient and 3 nested intervenciones (each with 1 procedimiento carrying insumos/farmacia/personal/equipos). `HistorialQuirurgico.jsx` (orchestrator) owns `selectedIntervencionId`/`selectedProcedimientoId` and renders 4 stacked `.hq-card` sections in a single scrolling column: `IntervencionesTable` (selectable rows) → `IntervencionResumen` (derived text) → `ProcedimientosList` (selectable items) → `ProcedimientoDetalle` (4-tab shell, tabs live under `ProcedimientoDetalle/tabs/`). Selecting a new intervención resets the procedimiento selection to that intervención's first procedimiento using the same "adjust state during render" trick already used by `DetalleCirugiaPanel.jsx` — no `useEffect`. Entry point: `ProgramacionSalaCirugias.jsx`'s existing "Buscar" icon button (currently a placeholder toast) opens a new `BuscarPacienteModal` (reuses the existing `PATIENTS` mock from Lista de Pacientes); confirming a selection does `router.push('/historial-quirurgico/${paciente.id}')`. The route itself receives but does not use the `id` — the clinical content is always the one fixed demo dataset (explicit product decision, see spec).

**Tech Stack:** Next.js (App Router) + React, plain CSS (no CSS-in-JS/Tailwind) except `@/Components/Button/Button` (CSS Modules), `react-icons/lu` (Lucide) for icons. No test framework is configured (`package.json` has no `test` script) — verification steps use `npx eslint` on changed files plus manual smoke tests in the dev server, same convention as `docs/superpowers/plans/2026-08-31-programacion-sala-cirugia.md`.

**Spec:** `docs/superpowers/specs/2026-09-02-historial-quirurgico-design.md`

## Global Constraints

- Every new component folder = exactly `ComponentName.jsx` + `ComponentName.css` (AGENTS.md "Component organization").
- `BuscarPacienteModal` uses `@/Components/ModalHeader/ModalHeader` — never a hand-rolled header.
- `font-size`/`font-weight` in any new CSS use the `--fs-*`/`--fw-*` tokens from `globals.css` — never a raw px/600 value. Headings (`h1`, `h2`, `.hq-card h2`) use `--fw-semibold`, never `--fw-bold`.
- New simple-action buttons (`BuscarPacienteModal`'s Cancelar/Confirmar) use `@/Components/Button/Button` instead of a hand-rolled `<button className="btn ...">`.
- All new components import icons from `react-icons/lu` (`Lu*` names) — every icon used in this plan (`LuSearch`, `LuCircleCheck`, `LuListX`, `LuPackageX`, `LuPill`, `LuUserX`, `LuServerOff`) has been confirmed to exist in the installed `react-icons/lu` package.
- All new `.jsx` files start with `'use client'`.
- Mock data (`PACIENTE_DEMO`, `INTERVENCIONES`) is fully static — no `Math.random()`/`Date.now()`-based ids. This is a read-only historical dataset (no mutation functions), unlike `mockCirugiaData.js`.
- `EstadoIntervencionBadge` shows status as icon+text, never color alone (WCAG — matches existing `EstadoCirugiaBadge`/`TurnoBadges` convention).
- `HistorialQuirurgico.css` declares its own `:root` token duplicate (same values as `ProgramacionSalaCirugias.css`) — same per-feature duplication criterion as the rest of the project (AGENTS.md).
- This screen has no form fields at all (pure read-only consulta) — `BuscarPacienteModal`'s only input is a free-text search box, not a `.form-field`/`FormSelect`.

---

## File Structure

```
src/hooks/HistorialQuirurgico/mockHistorialQuirurgico.js                          (new)

src/Components/HistorialQuirurgico/
  HistorialQuirurgico.jsx / .css                                                  (new)
  shared/shared.css                                                               (new)
  EstadoIntervencionBadge/EstadoIntervencionBadge.jsx / .css                      (new)
  EmptyState/EmptyState.jsx / .css                                                (new)
  PacienteHeader/PacienteHeader.jsx / .css                                        (new)
  IntervencionesTable/IntervencionesTable.jsx / .css                              (new)
  IntervencionResumen/IntervencionResumen.jsx / .css                              (new)
  ProcedimientosList/ProcedimientosList.jsx / .css                                (new)
  ProcedimientoDetalle/
    ProcedimientoDetalle.jsx / .css                                               (new)
    tabs/
      InsumosTab/InsumosTab.jsx / .css                                           (new)
      FarmaciaTab/FarmaciaTab.jsx / .css                                         (new)
      PersonalTab/PersonalTab.jsx / .css                                         (new)
      EquiposTab/EquiposTab.jsx / .css                                           (new)

src/app/historial-quirurgico/[id]/page.jsx                                        (new)

src/Components/ProgramacionSalaCirugias/
  ProgramacionSalaCirugias.jsx                                                    (modify)
  modals/BuscarPacienteModal/BuscarPacienteModal.jsx / .css                       (new)
```

---

### Task 1: Mock data module

**Files:**
- Create: `src/hooks/HistorialQuirurgico/mockHistorialQuirurgico.js`

**Interfaces:**
- Produces (named exports): `PACIENTE_DEMO: {nombre, idAfiliado}`, `INTERVENCIONES: Intervencion[]`, `fechaCortaLabel(fechaISO): string`, `fechaHoraCortaLabel(fechaISO, hora): string`, where `Intervencion = { id, codigoCirugia, fecha, horaInicio, procedimientoPrincipal, medico, sala, quirofano, estado:'realizada', procedimientos: Procedimiento[] }` and `Procedimiento = { id, nombre, codigo, insumos:[{nombre,cantidad,unidad,codigo}], farmacia:[{medicamento,cantidad,unidad,estado}], personal:[{nombre,rol,tipoProfesional}], equipos:[{nombre,tipo,identificacion}] }`.

- [ ] **Step 1: Create the file**

```js
// Mock data de "Historial Quirúrgico del Paciente" — pantalla de solo
// consulta, sin backend. A diferencia de mockCirugiaData.js (agenda futura,
// mutable) esto es historial fijo: un único paciente de demo con 3
// intervenciones ya realizadas, sin funciones de mutación (nada se puede
// crear/editar/eliminar acá, ver spec).

export const PACIENTE_DEMO = {
  nombre: 'Berrocal Payares Yuri del Carmen',
  idAfiliado: '55222523',
};

const MESES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function fechaCortaLabel(fechaISO) {
  const [y, m, d] = fechaISO.split('-').map(Number);
  return `${d} ${MESES_ABREV[m - 1]} ${y}`;
}

export function fechaHoraCortaLabel(fechaISO, hora) {
  return `${fechaCortaLabel(fechaISO)} · ${hora}`;
}

export const INTERVENCIONES = [
  {
    id: 'cirugia-0200018616',
    codigoCirugia: '0200018616',
    fecha: '2023-10-25',
    horaInicio: '14:15',
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    medico: 'Lorena Cecilia Arrieta Yanez',
    sala: '01',
    quirofano: '#1',
    estado: 'realizada',
    procedimientos: [
      {
        id: 'proc-0200018616-1',
        nombre: 'Colecistectomía laparoscópica',
        codigo: '0231301',
        insumos: [
          { nombre: 'Trocar 5mm', cantidad: 2, unidad: 'unidades', codigo: 'INS-1001' },
          { nombre: 'Trocar 10mm', cantidad: 2, unidad: 'unidades', codigo: 'INS-1002' },
          { nombre: 'Pinza Maryland', cantidad: 1, unidad: 'unidad', codigo: 'INS-1003' },
          { nombre: 'Gasas estériles', cantidad: 10, unidad: 'unidades', codigo: 'INS-1004' },
          { nombre: 'Sutura Vicryl 2-0', cantidad: 3, unidad: 'unidades', codigo: 'INS-1005' },
        ],
        farmacia: [
          { medicamento: 'Cefazolina 1g', cantidad: 1, unidad: 'ampolla', estado: 'Entregado' },
          { medicamento: 'Ondansetrón 4mg', cantidad: 2, unidad: 'ampolla', estado: 'Entregado' },
        ],
        personal: [
          { nombre: 'Lorena Cecilia Arrieta Yanez', rol: 'Cirujano', tipoProfesional: 'Médico especialista' },
          { nombre: 'Ricardo Fabián Nieto Salcedo', rol: 'Anestesiólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Marcela Isabel Duarte Peña', rol: 'Instrumentadora', tipoProfesional: 'Instrumentación quirúrgica' },
          { nombre: 'Jhon Édison Pabón Rico', rol: 'Circulante', tipoProfesional: 'Enfermería' },
        ],
        equipos: [
          { nombre: 'Torre de laparoscopia', tipo: 'Video/Imagen', identificacion: 'EQ-0412' },
          { nombre: 'Electrobisturí monopolar', tipo: 'Energía quirúrgica', identificacion: 'EQ-0087' },
          { nombre: 'Monitor multiparámetro', tipo: 'Monitoreo', identificacion: 'EQ-0231' },
        ],
      },
    ],
  },
  {
    id: 'cirugia-0200019747',
    codigoCirugia: '0200019747',
    fecha: '2023-11-21',
    horaInicio: '11:05',
    procedimientoPrincipal: 'Exploración y descompresión del canal raquídeo',
    medico: 'Humberto Alfonso Aragón González',
    sala: '01',
    quirofano: '#1',
    estado: 'realizada',
    procedimientos: [
      {
        id: 'proc-0200019747-1',
        nombre: 'Exploración y descompresión del canal raquídeo',
        codigo: '030208C',
        insumos: [
          { nombre: 'Aguja para pistola Promag 18 x 20', cantidad: 2, unidad: 'unidades', codigo: 'INS-3001' },
          { nombre: 'Bata quirúrgica estéril', cantidad: 2, unidad: 'unidades', codigo: 'INS-3002' },
          { nombre: 'Bureta 150 ml', cantidad: 1, unidad: 'unidad', codigo: 'INS-3003' },
          { nombre: 'Cánula de Guedel #3', cantidad: 1, unidad: 'unidad', codigo: 'INS-3004' },
          { nombre: 'Cánula de Guedel #4', cantidad: 1, unidad: 'unidad', codigo: 'INS-3005' },
          { nombre: 'Cánula de Guedel #5', cantidad: 1, unidad: 'unidad', codigo: 'INS-3006' },
          { nombre: 'Cánula nasal adulto', cantidad: 1, unidad: 'unidad', codigo: 'INS-3007' },
          { nombre: 'Cartucho Kaolin', cantidad: 2, unidad: 'unidades', codigo: 'INS-3008' },
          { nombre: 'Catéter intravenoso #20G', cantidad: 1, unidad: 'unidad', codigo: 'INS-3009' },
        ],
        // Vacío a propósito -- ejercita el empty state de FarmaciaTab (ver spec).
        farmacia: [],
        personal: [
          { nombre: 'Humberto Alfonso Aragón González', rol: 'Cirujano', tipoProfesional: 'Médico especialista' },
          { nombre: 'Claudia Patricia Reyes Molano', rol: 'Anestesiólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Wilmer Andrés Ospina Cuartas', rol: 'Circulante', tipoProfesional: 'Enfermería' },
        ],
        equipos: [
          { nombre: 'Neuronavegador', tipo: 'Neuronavegación', identificacion: 'EQ-0559' },
          { nombre: 'Microscopio quirúrgico', tipo: 'Visualización', identificacion: 'EQ-0163' },
          { nombre: 'Monitor de potenciales evocados', tipo: 'Neuromonitoreo', identificacion: 'EQ-0298' },
        ],
      },
    ],
  },
  {
    id: 'cirugia-0200019776',
    codigoCirugia: '0200019776',
    fecha: '2023-11-21',
    horaInicio: '02:00',
    procedimientoPrincipal: 'Artroplastia total de cadera',
    medico: 'Diego Alejandro Quintero Rueda',
    sala: '02',
    quirofano: '#1',
    estado: 'realizada',
    procedimientos: [
      {
        id: 'proc-0200019776-1',
        nombre: 'Artroplastia total de cadera',
        codigo: '815200',
        insumos: [
          { nombre: 'Prótesis de cadera no cementada', cantidad: 1, unidad: 'unidad', codigo: 'INS-2101' },
          { nombre: 'Cemento óseo con antibiótico', cantidad: 2, unidad: 'unidades', codigo: 'INS-2102' },
          { nombre: 'Sutura Vicryl 0', cantidad: 4, unidad: 'unidades', codigo: 'INS-2103' },
          { nombre: 'Compresas abdominales', cantidad: 6, unidad: 'unidades', codigo: 'INS-2104' },
        ],
        farmacia: [
          { medicamento: 'Ácido tranexámico 1g', cantidad: 2, unidad: 'ampolla', estado: 'Entregado' },
          { medicamento: 'Cefazolina 1g', cantidad: 1, unidad: 'ampolla', estado: 'En preparación' },
        ],
        personal: [
          { nombre: 'Diego Alejandro Quintero Rueda', rol: 'Cirujano', tipoProfesional: 'Médico especialista' },
          { nombre: 'Paola Andrea Villamizar Roa', rol: 'Anestesiólogo', tipoProfesional: 'Médico especialista' },
          { nombre: 'Fabián Camilo Torres Higuera', rol: 'Instrumentadora', tipoProfesional: 'Instrumentación quirúrgica' },
        ],
        // Vacío a propósito -- ejercita el empty state de EquiposTab (ver spec).
        equipos: [],
      },
    ],
  },
];
```

- [ ] **Step 2: Lint the file**

Run: `npx eslint src/hooks/HistorialQuirurgico/mockHistorialQuirurgico.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/HistorialQuirurgico/mockHistorialQuirurgico.js
git commit -m "$(cat <<'EOF'
Add mock data for Historial Quirúrgico del Paciente

Fixed demo dataset (1 patient, 3 intervenciones with nested procedimientos,
insumos, farmacia, personal, equipos) for the new read-only surgical
history screen.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Shared styles + `EstadoIntervencionBadge` + `EmptyState`

**Files:**
- Create: `src/Components/HistorialQuirurgico/shared/shared.css`
- Create: `src/Components/HistorialQuirurgico/EstadoIntervencionBadge/EstadoIntervencionBadge.jsx`
- Create: `src/Components/HistorialQuirurgico/EstadoIntervencionBadge/EstadoIntervencionBadge.css`
- Create: `src/Components/HistorialQuirurgico/EmptyState/EmptyState.jsx`
- Create: `src/Components/HistorialQuirurgico/EmptyState/EmptyState.css`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: CSS classes `.hq-card`, `.hq-card h2`, `.hq-table-wrap`, `.hq-table-wrap.selectable`, `.data-table` (+ `.cell-primary`/`.cell-muted`/`.hq-item-codigo`) for later tasks to use. `EstadoIntervencionBadge({ estado: string })` component. `EmptyState({ icon: IconComponent, title: string })` component.

- [ ] **Step 1: Create `shared/shared.css`**

```css
/* Estilos cross-cutting de Historial Quirúrgico -- importado una sola vez
   desde HistorialQuirurgico.jsx (ver AGENTS.md "Component organization").
   .hq-card: una sección de la pantalla (Intervenciones/Resumen/
   Procedimientos/Detalle del procedimiento). .data-table/.hq-table-wrap:
   tabla de solo lectura reusada por IntervencionesTable y los 4 tabs de
   ProcedimientoDetalle. */
.hq-card{
  border:1px solid var(--border);border-radius:var(--radius-lg);
  background:var(--surface);padding:20px 24px;
}
.hq-card h2{
  font-size:var(--fs-xl);font-weight:var(--fw-semibold);color:var(--ink-900);
  margin-bottom:14px;
}

.hq-table-wrap{overflow-x:auto;}
.data-table{width:100%;border-collapse:collapse;font-size:var(--fs-base);}
.data-table thead th{
  text-align:left;padding:8px 14px;background:var(--bg);
  font-size:var(--fs-xs);font-weight:var(--fw-bold);color:var(--ink-500);
  text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid var(--border);
}
.data-table td{padding:10px 14px;border-bottom:1px solid var(--border);vertical-align:middle;color:var(--ink-900);}
.data-table tbody tr:last-child td{border-bottom:none;}
.data-table .cell-primary{font-weight:var(--fw-semibold);color:var(--ink-900);}
.data-table .cell-muted{color:var(--ink-500);}
.hq-item-codigo{display:block;font-size:var(--fs-xs);font-weight:var(--fw-regular);color:var(--ink-400);margin-top:2px;}

/* Filas interactivas -- solo IntervencionesTable envuelve su tabla con
   .hq-table-wrap.selectable; las 4 tablas de solo lectura de
   ProcedimientoDetalle/tabs no lo usan, sus filas no reaccionan al click. */
.hq-table-wrap.selectable .data-table tbody tr{cursor:pointer;}
.hq-table-wrap.selectable .data-table tbody tr:hover{background:var(--bg);}
.hq-table-wrap.selectable .data-table tbody tr.selected{background:var(--interactive-selected-bg);}
.hq-table-wrap.selectable .data-table tbody tr.selected:hover{background:var(--interactive-selected-bg);}
.hq-table-wrap.selectable .data-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px;}

@media (max-width:768px){
  .hq-card{padding:16px;}
}
```

- [ ] **Step 2: Create `EstadoIntervencionBadge.jsx`**

```jsx
'use client';

import './EstadoIntervencionBadge.css';
import { LuCircleCheck } from 'react-icons/lu';

const ESTADO_LABEL = { realizada: 'Realizada' };

// Único estado en V1 (toda intervención del historial ya se realizó) --
// mapa de labels dejado explícito, no un string fijo, para que agregar un
// segundo estado a futuro sea un dato nuevo en este mapa, no una
// reescritura del componente. Ícono+texto siempre (nunca solo color), ver
// EstadoCirugiaBadge (Programación de Sala de Cirugías).
export default function EstadoIntervencionBadge({ estado }) {
  return (
    <span className="hq-estado-badge">
      <LuCircleCheck className="icon" aria-hidden="true" />
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  );
}
```

- [ ] **Step 3: Create `EstadoIntervencionBadge.css`**

```css
.hq-estado-badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:3px 9px;border-radius:999px;
  font-size:var(--fs-sm);font-weight:var(--fw-medium);
  color:var(--green);background:var(--green-bg);
  white-space:nowrap;
}
.hq-estado-badge .icon{width:14px;height:14px;}
```

- [ ] **Step 4: Create `EmptyState.jsx`**

```jsx
'use client';

import './EmptyState.css';

// Esqueleto ícono-en-círculo + título, mismo patrón que AdmisionesEmptyState/
// AgendaEmptyState (ver AGENTS.md). Un solo componente compartido por
// ProcedimientosList y los 4 tabs de ProcedimientoDetalle -- las 5 listas de
// esta pantalla son de solo lectura y usan el mismo esqueleto vacío, solo
// cambia el ícono/texto.
export default function EmptyState({ icon: Icon, title }) {
  return (
    <div className="hq-empty-state">
      <div className="hq-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="hq-empty-title">{title}</div>
    </div>
  );
}
```

- [ ] **Step 5: Create `EmptyState.css`**

```css
.hq-empty-state{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:8px;padding:32px 24px;text-align:center;
}
.hq-empty-icon{
  width:44px;height:44px;border-radius:50%;
  background:var(--gray-bg);color:var(--ink-500);
  display:flex;align-items:center;justify-content:center;margin-bottom:2px;
}
.hq-empty-icon .icon{width:20px;height:20px;}
.hq-empty-title{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-500);max-width:340px;}
```

- [ ] **Step 6: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/EstadoIntervencionBadge src/Components/HistorialQuirurgico/EmptyState`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/Components/HistorialQuirurgico/shared src/Components/HistorialQuirurgico/EstadoIntervencionBadge src/Components/HistorialQuirurgico/EmptyState
git commit -m "$(cat <<'EOF'
Add shared styles, EstadoIntervencionBadge and EmptyState for Historial Quirúrgico

Foundational pieces reused across the screen's tables/tabs: card/table CSS
scaffolding, the single status badge, and the read-only empty-state skeleton.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `PacienteHeader`

**Files:**
- Create: `src/Components/HistorialQuirurgico/PacienteHeader/PacienteHeader.jsx`
- Create: `src/Components/HistorialQuirurgico/PacienteHeader/PacienteHeader.css`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure presentational).
- Produces: `PacienteHeader({ paciente: {nombre, idAfiliado}, totalIntervenciones: number })`, class `.hq-header`.

- [ ] **Step 1: Create `PacienteHeader.jsx`**

```jsx
'use client';

import './PacienteHeader.css';

// Header dedicado y minimal -- no reusa PatientBanner (ese componente trae
// chips de EDAD/SEXO/EPS/alergias pensados para atención clínica en vivo,
// mucho más pesado de lo que pide esta pantalla de consulta, ver spec).
// Mismo patrón tipográfico que .psc-page-header (h1 + p) con 2 líneas de
// identidad del paciente arriba.
export default function PacienteHeader({ paciente, totalIntervenciones }) {
  return (
    <div className="hq-header">
      <div className="hq-header-patient">{paciente.nombre}</div>
      <div className="hq-header-affiliate">ID de afiliado: {paciente.idAfiliado}</div>
      <h1>Historial quirúrgico</h1>
      <p>{totalIntervenciones} {totalIntervenciones === 1 ? 'intervención' : 'intervenciones'}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create `PacienteHeader.css`**

```css
.hq-header{flex-shrink:0;padding-bottom:4px;}
.hq-header-patient{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.hq-header-affiliate{font-size:var(--fs-sm);color:var(--ink-500);margin-top:2px;}
.hq-header h1{font-size:var(--fs-2xl);font-weight:var(--fw-semibold);color:var(--ink-900);letter-spacing:-.01em;margin-top:14px;}
.hq-header p{font-size:var(--fs-base);color:var(--ink-500);margin-top:2px;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/PacienteHeader`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/HistorialQuirurgico/PacienteHeader
git commit -m "$(cat <<'EOF'
Add PacienteHeader for Historial Quirúrgico

Compact, permanent patient-identity header (name, affiliate id, screen
title, intervention count) — deliberately not reusing PatientBanner, which
carries clinical-encounter chips this consulta screen doesn't need.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `IntervencionesTable`

**Files:**
- Create: `src/Components/HistorialQuirurgico/IntervencionesTable/IntervencionesTable.jsx`
- Create: `src/Components/HistorialQuirurgico/IntervencionesTable/IntervencionesTable.css`

**Interfaces:**
- Consumes: `EstadoIntervencionBadge` (Task 2), `fechaHoraCortaLabel` (Task 1), classes `.hq-table-wrap`/`.data-table` (Task 2).
- Produces: `IntervencionesTable({ intervenciones: Intervencion[], selectedId: string|null, onSelect: (id:string)=>void })`.

- [ ] **Step 1: Create `IntervencionesTable.jsx`**

```jsx
'use client';

import './IntervencionesTable.css';
import EstadoIntervencionBadge from '../EstadoIntervencionBadge/EstadoIntervencionBadge';
import { fechaHoraCortaLabel } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset -- CSS
// decide cuál mostrar bajo 768px (--bp-tablet), mismo patrón que
// AdmisionesTable/PatientsTable. Selección controlada por el padre
// (selectedId/onSelect), no estado propio -- el padre también necesita
// saber qué intervención está activa para derivar Resumen/Procedimientos.
export default function IntervencionesTable({ intervenciones, selectedId, onSelect }) {
  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <>
      <div className="hq-table-wrap selectable">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cirugía</th>
              <th>Médico</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {intervenciones.map((i) => (
              <tr
                key={i.id}
                className={selectedId === i.id ? 'selected' : undefined}
                aria-selected={selectedId === i.id}
                tabIndex={0}
                onClick={() => onSelect(i.id)}
                onKeyDown={(e) => handleRowKeyDown(e, i.id)}
              >
                <td className="cell-primary">{fechaHoraCortaLabel(i.fecha, i.horaInicio)}</td>
                <td className="cell-muted">Cirugía {i.codigoCirugia}</td>
                <td className="cell-muted">{i.medico}</td>
                <td><EstadoIntervencionBadge estado={i.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hq-interv-cards">
        {intervenciones.map((i) => (
          <div
            className={`hq-interv-card${selectedId === i.id ? ' selected' : ''}`}
            key={i.id}
            aria-selected={selectedId === i.id}
            tabIndex={0}
            onClick={() => onSelect(i.id)}
            onKeyDown={(e) => handleRowKeyDown(e, i.id)}
          >
            <div className="hq-interv-card-top">
              <span className="hq-interv-card-fecha">{fechaHoraCortaLabel(i.fecha, i.horaInicio)}</span>
              <EstadoIntervencionBadge estado={i.estado} />
            </div>
            <div className="hq-interv-card-codigo">Cirugía {i.codigoCirugia}</div>
            <div className="hq-interv-card-medico">{i.medico}</div>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `IntervencionesTable.css`**

```css
/* .hq-table-wrap/.data-table se resuelven en HistorialQuirurgico/shared/
   shared.css. */
.hq-interv-cards{display:none;flex-direction:column;gap:10px;}

.hq-interv-card{
  border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;
  display:flex;flex-direction:column;gap:6px;cursor:pointer;background:var(--surface);
}
.hq-interv-card:hover{background:var(--bg);}
.hq-interv-card.selected{background:var(--interactive-selected-bg);border-color:var(--interactive-selected-border);}
.hq-interv-card:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.hq-interv-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.hq-interv-card-fecha{font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-700);}
.hq-interv-card-codigo{font-size:var(--fs-sm);color:var(--ink-500);}
.hq-interv-card-medico{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}

@media (max-width:768px){
  .hq-table-wrap{display:none;}
  .hq-interv-cards{display:flex;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/IntervencionesTable`
Expected: no errors. Full visual verification happens in Task 9 once the orchestrator wires real data in.

- [ ] **Step 4: Commit**

```bash
git add src/Components/HistorialQuirurgico/IntervencionesTable
git commit -m "$(cat <<'EOF'
Add IntervencionesTable for Historial Quirúrgico

Selectable, read-only table of a patient's past surgeries (desktop table +
mobile cards of the same dataset), selection controlled by the parent.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `IntervencionResumen`

**Files:**
- Create: `src/Components/HistorialQuirurgico/IntervencionResumen/IntervencionResumen.jsx`
- Create: `src/Components/HistorialQuirurgico/IntervencionResumen/IntervencionResumen.css`

**Interfaces:**
- Consumes: `EstadoIntervencionBadge` (Task 2), `fechaHoraCortaLabel` (Task 1).
- Produces: `IntervencionResumen({ intervencion: Intervencion })`.

- [ ] **Step 1: Create `IntervencionResumen.jsx`**

```jsx
'use client';

import './IntervencionResumen.css';
import EstadoIntervencionBadge from '../EstadoIntervencionBadge/EstadoIntervencionBadge';
import { fechaHoraCortaLabel } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

export default function IntervencionResumen({ intervencion }) {
  return (
    <div className="hq-resumen">
      <div className="hq-resumen-title">{intervencion.procedimientoPrincipal}</div>
      <div className="hq-resumen-fecha">{fechaHoraCortaLabel(intervencion.fecha, intervencion.horaInicio)}</div>
      <div className="hq-resumen-meta">
        <div className="hq-resumen-item">
          <span className="lbl">Médico</span>
          <span className="val">{intervencion.medico}</span>
        </div>
        <div className="hq-resumen-item">
          <span className="lbl">Sala</span>
          <span className="val">{intervencion.sala}</span>
        </div>
        <div className="hq-resumen-item">
          <span className="lbl">Quirófano</span>
          <span className="val">{intervencion.quirofano}</span>
        </div>
        <div className="hq-resumen-item">
          <span className="lbl">Estado</span>
          <EstadoIntervencionBadge estado={intervencion.estado} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `IntervencionResumen.css`**

```css
.hq-resumen{display:flex;flex-direction:column;gap:10px;}
.hq-resumen-title{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.hq-resumen-fecha{font-size:var(--fs-base);color:var(--ink-500);}
.hq-resumen-meta{display:flex;flex-wrap:wrap;gap:24px;margin-top:4px;}
.hq-resumen-item{display:flex;flex-direction:column;gap:3px;}
.hq-resumen-item .lbl{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.hq-resumen-item .val{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/IntervencionResumen`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/HistorialQuirurgico/IntervencionResumen
git commit -m "$(cat <<'EOF'
Add IntervencionResumen for Historial Quirúrgico

Read-only summary block for the selected intervención (title, date, médico,
sala, quirófano, estado).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `ProcedimientosList`

**Files:**
- Create: `src/Components/HistorialQuirurgico/ProcedimientosList/ProcedimientosList.jsx`
- Create: `src/Components/HistorialQuirurgico/ProcedimientosList/ProcedimientosList.css`

**Interfaces:**
- Consumes: `EmptyState` (Task 2).
- Produces: `ProcedimientosList({ procedimientos: Procedimiento[], selectedId: string|null, onSelect: (id:string)=>void })`.

- [ ] **Step 1: Create `ProcedimientosList.jsx`**

```jsx
'use client';

import './ProcedimientosList.css';
import EmptyState from '../EmptyState/EmptyState';
import { LuListX } from 'react-icons/lu';

export default function ProcedimientosList({ procedimientos, selectedId, onSelect }) {
  if (procedimientos.length === 0) {
    return <EmptyState icon={LuListX} title="No hay procedimientos registrados para esta intervención." />;
  }

  return (
    <div className="hq-proc-list" role="list">
      {procedimientos.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            type="button"
            key={p.id}
            role="listitem"
            aria-pressed={active}
            className={`hq-proc-item${active ? ' active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <span className="hq-proc-nombre">{p.nombre}</span>
            <span className="hq-proc-codigo">Código: {p.codigo}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create `ProcedimientosList.css`**

```css
.hq-proc-list{display:flex;flex-direction:column;gap:8px;}
.hq-proc-item{
  display:flex;flex-direction:column;gap:2px;text-align:left;
  border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;
  background:var(--surface);font-family:inherit;cursor:pointer;
}
.hq-proc-item:hover{background:var(--bg);}
.hq-proc-item.active{background:var(--interactive-selected-bg);border-color:var(--interactive-selected-border);}
.hq-proc-item:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.hq-proc-nombre{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.hq-proc-item.active .hq-proc-nombre{color:var(--primary-dark);}
.hq-proc-codigo{font-size:var(--fs-sm);color:var(--ink-500);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/ProcedimientosList`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/HistorialQuirurgico/ProcedimientosList
git commit -m "$(cat <<'EOF'
Add ProcedimientosList for Historial Quirúrgico

Selectable list of procedimientos belonging to the selected intervención,
with the "sin procedimientos" empty state.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `ProcedimientoDetalle/tabs` — Insumos, Farmacia, Personal, Equipos

**Files:**
- Create: `src/Components/HistorialQuirurgico/ProcedimientoDetalle/tabs/InsumosTab/InsumosTab.jsx` / `.css`
- Create: `src/Components/HistorialQuirurgico/ProcedimientoDetalle/tabs/FarmaciaTab/FarmaciaTab.jsx` / `.css`
- Create: `src/Components/HistorialQuirurgico/ProcedimientoDetalle/tabs/PersonalTab/PersonalTab.jsx` / `.css`
- Create: `src/Components/HistorialQuirurgico/ProcedimientoDetalle/tabs/EquiposTab/EquiposTab.jsx` / `.css`

**Interfaces:**
- Consumes: `EmptyState` (Task 2), classes `.hq-table-wrap`/`.data-table` (Task 2).
- Produces: `InsumosTab({ procedimiento })`, `FarmaciaTab({ procedimiento })`, `PersonalTab({ procedimiento })`, `EquiposTab({ procedimiento })` — each reads `procedimiento.insumos`/`.farmacia`/`.personal`/`.equipos` respectively.

- [ ] **Step 1: Create `InsumosTab.jsx`**

```jsx
'use client';

import './InsumosTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuPackageX } from 'react-icons/lu';

export default function InsumosTab({ procedimiento }) {
  const insumos = procedimiento.insumos ?? [];
  if (insumos.length === 0) {
    return <EmptyState icon={LuPackageX} title="No hay insumos registrados." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((item) => (
            <tr key={item.nombre}>
              <td className="cell-primary">
                {item.nombre}
                <span className="hq-item-codigo">{item.codigo}</span>
              </td>
              <td className="cell-muted">{item.cantidad} {item.unidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create `InsumosTab.css`**

```css
/* .hq-table-wrap/.data-table/.hq-item-codigo se resuelven en
   HistorialQuirurgico/shared/shared.css -- sin reglas propias a este tab. */
```

- [ ] **Step 3: Create `FarmaciaTab.jsx`**

```jsx
'use client';

import './FarmaciaTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuPill } from 'react-icons/lu';

export default function FarmaciaTab({ procedimiento }) {
  const farmacia = procedimiento.farmacia ?? [];
  if (farmacia.length === 0) {
    return <EmptyState icon={LuPill} title="No hay pedidos a farmacia registrados para este procedimiento." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Medicamento / producto</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {farmacia.map((m) => (
            <tr key={m.medicamento}>
              <td className="cell-primary">{m.medicamento}</td>
              <td className="cell-muted">{m.cantidad}</td>
              <td className="cell-muted">{m.unidad}</td>
              <td><span className="hq-farmacia-estado">{m.estado}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create `FarmaciaTab.css`**

```css
/* .hq-table-wrap/.data-table se resuelven en HistorialQuirurgico/shared/
   shared.css. */
.hq-farmacia-estado{
  display:inline-flex;align-items:center;padding:3px 9px;border-radius:999px;
  font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-700);background:var(--gray-bg);
  white-space:nowrap;
}
```

- [ ] **Step 5: Create `PersonalTab.jsx`**

```jsx
'use client';

import './PersonalTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuUserX } from 'react-icons/lu';

export default function PersonalTab({ procedimiento }) {
  const personal = procedimiento.personal ?? [];
  if (personal.length === 0) {
    return <EmptyState icon={LuUserX} title="No hay personal clínico registrado." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Tipo de profesional</th>
          </tr>
        </thead>
        <tbody>
          {personal.map((p) => (
            <tr key={p.nombre}>
              <td className="cell-primary">{p.nombre}</td>
              <td className="cell-muted">{p.rol}</td>
              <td className="cell-muted">{p.tipoProfesional}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 6: Create `PersonalTab.css`**

```css
/* .hq-table-wrap/.data-table se resuelven en HistorialQuirurgico/shared/
   shared.css -- sin reglas propias a este tab. */
```

- [ ] **Step 7: Create `EquiposTab.jsx`**

```jsx
'use client';

import './EquiposTab.css';
import EmptyState from '../../../EmptyState/EmptyState';
import { LuServerOff } from 'react-icons/lu';

export default function EquiposTab({ procedimiento }) {
  const equipos = procedimiento.equipos ?? [];
  if (equipos.length === 0) {
    return <EmptyState icon={LuServerOff} title="No hay equipos registrados." />;
  }
  return (
    <div className="hq-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>Tipo</th>
            <th>Identificación</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((e) => (
            <tr key={e.nombre}>
              <td className="cell-primary">{e.nombre}</td>
              <td className="cell-muted">{e.tipo}</td>
              <td className="cell-muted">{e.identificacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 8: Create `EquiposTab.css`**

```css
/* .hq-table-wrap/.data-table se resuelven en HistorialQuirurgico/shared/
   shared.css -- sin reglas propias a este tab. */
```

- [ ] **Step 9: Lint all 4 folders**

Run: `npx eslint src/Components/HistorialQuirurgico/ProcedimientoDetalle/tabs`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/Components/HistorialQuirurgico/ProcedimientoDetalle/tabs
git commit -m "$(cat <<'EOF'
Add Insumos/Farmacia/Personal/Equipos tabs for Historial Quirúrgico

4 read-only tables (no create/edit/delete actions) with their empty states,
each rendering one resource type of the selected procedimiento.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: `ProcedimientoDetalle` (tabs shell)

**Files:**
- Create: `src/Components/HistorialQuirurgico/ProcedimientoDetalle/ProcedimientoDetalle.jsx`
- Create: `src/Components/HistorialQuirurgico/ProcedimientoDetalle/ProcedimientoDetalle.css`

**Interfaces:**
- Consumes: `InsumosTab`, `FarmaciaTab`, `PersonalTab`, `EquiposTab` (Task 7).
- Produces: `ProcedimientoDetalle({ procedimiento: Procedimiento|null })`.

- [ ] **Step 1: Create `ProcedimientoDetalle.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './ProcedimientoDetalle.css';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import FarmaciaTab from './tabs/FarmaciaTab/FarmaciaTab';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';

const TABS = [
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
  { id: 'personal', label: 'Personal clínico' },
  { id: 'equipos', label: 'Equipos' },
];

// Mismo patrón ARIA que .dcp-tabs-bar de DetalleCirugiaPanel (Programación
// de Sala de Cirugías): role="tablist" + roving tabindex + flechas ←/→.
// `activeTab` se resetea a "insumos" al cambiar de procedimiento con el
// mismo truco "ajustar estado durante el render" que usa DetalleCirugiaPanel
// para `lastCirugiaId` (evita el warning de React sobre set-state-in-effect)
// -- estas 4 tabs representan perspectivas del mismo procedimiento, no pasos
// de un proceso, ver spec.
export default function ProcedimientoDetalle({ procedimiento }) {
  const [activeTab, setActiveTab] = useState('insumos');
  const [lastProcedimientoId, setLastProcedimientoId] = useState(procedimiento?.id ?? null);
  if ((procedimiento?.id ?? null) !== lastProcedimientoId) {
    setLastProcedimientoId(procedimiento?.id ?? null);
    setActiveTab('insumos');
  }

  function handleTabsKeyDown(e) {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
  }

  if (!procedimiento) return null;

  return (
    <div className="hq-detalle">
      <div className="hq-tabs-bar" role="tablist" aria-label="Detalle del procedimiento" onKeyDown={handleTabsKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`hq-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`hq-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="hq-tab-body" role="tabpanel" id={`hq-panel-${activeTab}`}>
        {activeTab === 'insumos' && <InsumosTab procedimiento={procedimiento} />}
        {activeTab === 'farmacia' && <FarmaciaTab procedimiento={procedimiento} />}
        {activeTab === 'personal' && <PersonalTab procedimiento={procedimiento} />}
        {activeTab === 'equipos' && <EquiposTab procedimiento={procedimiento} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ProcedimientoDetalle.css`**

```css
.hq-detalle{display:flex;flex-direction:column;gap:14px;}

.hq-tabs-bar{display:flex;gap:4px;border-bottom:1px solid var(--border);flex-shrink:0;}
.hq-tab{
  padding:9px 14px;border:none;background:none;cursor:pointer;font-family:inherit;
  font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-500);
  border-bottom:2px solid transparent;margin-bottom:-1px;
}
.hq-tab:hover{color:var(--ink-900);}
.hq-tab.active{color:var(--primary-dark);font-weight:var(--fw-semibold);border-bottom-color:var(--primary);}
.hq-tab:focus-visible{outline:2px solid var(--primary);outline-offset:2px;}

.hq-tab-body{min-height:0;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/ProcedimientoDetalle/ProcedimientoDetalle.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/HistorialQuirurgico/ProcedimientoDetalle/ProcedimientoDetalle.jsx src/Components/HistorialQuirurgico/ProcedimientoDetalle/ProcedimientoDetalle.css
git commit -m "$(cat <<'EOF'
Add ProcedimientoDetalle tabs shell for Historial Quirúrgico

Wires the 4 resource tabs (Insumos/Farmacia/Personal/Equipos) with
roving-tabindex ARIA tablist behavior, resetting to Insumos whenever the
selected procedimiento changes.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Orchestrator `HistorialQuirurgico.jsx` + route

**Files:**
- Create: `src/Components/HistorialQuirurgico/HistorialQuirurgico.jsx`
- Create: `src/Components/HistorialQuirurgico/HistorialQuirurgico.css`
- Create: `src/app/historial-quirurgico/[id]/page.jsx`

**Interfaces:**
- Consumes: `PacienteHeader` (3), `IntervencionesTable` (4), `IntervencionResumen` (5), `ProcedimientosList` (6), `ProcedimientoDetalle` (8), `PACIENTE_DEMO`/`INTERVENCIONES` (1).
- Produces: default-exported `HistorialQuirurgico` page component, mounted at route `/historial-quirurgico/[id]`.

- [ ] **Step 1: Create `HistorialQuirurgico.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './HistorialQuirurgico.css';
import './shared/shared.css';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import PacienteHeader from './PacienteHeader/PacienteHeader';
import IntervencionesTable from './IntervencionesTable/IntervencionesTable';
import IntervencionResumen from './IntervencionResumen/IntervencionResumen';
import ProcedimientosList from './ProcedimientosList/ProcedimientosList';
import ProcedimientoDetalle from './ProcedimientoDetalle/ProcedimientoDetalle';
import { PACIENTE_DEMO, INTERVENCIONES } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

// Pantalla de solo consulta -- sin mutaciones, sin modales de detalle, todo
// apilado en una sola página con scroll (ver spec). El `id` de la ruta
// (src/app/historial-quirurgico/[id]/page.jsx) no llega hasta acá a
// propósito: el contenido clínico es siempre el mismo dataset de demo fijo
// (encargo explícito -- no existe historial real por cada uno de los ~46
// pacientes mock de ListaPacientes).
export default function HistorialQuirurgico() {
  const [selectedIntervencionId, setSelectedIntervencionId] = useState(INTERVENCIONES[0]?.id ?? null);
  const [selectedProcedimientoId, setSelectedProcedimientoId] = useState(
    INTERVENCIONES[0]?.procedimientos[0]?.id ?? null,
  );

  const intervencionSeleccionada = INTERVENCIONES.find((i) => i.id === selectedIntervencionId) ?? null;

  // Al cambiar de intervención, el procedimiento seleccionado se resetea al
  // primero de la nueva intervención -- mismo truco "ajustar estado durante
  // el render" que usa DetalleCirugiaPanel para `lastCirugiaId`.
  const [lastIntervencionId, setLastIntervencionId] = useState(selectedIntervencionId);
  if (selectedIntervencionId !== lastIntervencionId) {
    setLastIntervencionId(selectedIntervencionId);
    setSelectedProcedimientoId(intervencionSeleccionada?.procedimientos[0]?.id ?? null);
  }

  const procedimientos = intervencionSeleccionada?.procedimientos ?? [];
  const procedimientoSeleccionado = procedimientos.find((p) => p.id === selectedProcedimientoId) ?? null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Historial quirúrgico"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <PacienteHeader paciente={PACIENTE_DEMO} totalIntervenciones={INTERVENCIONES.length} />

          <div className="hq-body">
            <section className="hq-card">
              <h2>Intervenciones quirúrgicas</h2>
              <IntervencionesTable
                intervenciones={INTERVENCIONES}
                selectedId={selectedIntervencionId}
                onSelect={setSelectedIntervencionId}
              />
            </section>

            {intervencionSeleccionada && (
              <section className="hq-card">
                <h2>Detalle de la intervención</h2>
                <IntervencionResumen intervencion={intervencionSeleccionada} />
              </section>
            )}

            {intervencionSeleccionada && (
              <section className="hq-card">
                <h2>Procedimientos realizados</h2>
                <ProcedimientosList
                  procedimientos={procedimientos}
                  selectedId={selectedProcedimientoId}
                  onSelect={setSelectedProcedimientoId}
                />
              </section>
            )}

            {procedimientoSeleccionado && (
              <section className="hq-card">
                <h2>Detalle del procedimiento</h2>
                <ProcedimientoDetalle procedimiento={procedimientoSeleccionado} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `HistorialQuirurgico.css`**

```css
/* Tokens + reset del shell duplicados aquí siguiendo el mismo criterio que
   ProgramacionSalaCirugias.css/Admisiones.css (cada feature de nivel
   superior es dueña de su propia copia) -- ver AGENTS.md. */
:root{
  --primary:#0065CD;
  --primary-dark:#004E9E;
  --primary-50:#eef4ff;
  --primary-100:#dbe8fe;
  --sidebar:#0065CD;
  --sidebar-active:rgba(255,255,255,.20);
  --accent-teal:#58c2dc;
  --ink-900:#101827;
  --ink-700:#374151;
  --ink-500:#6b7280;
  --ink-400:#838a99;
  --border:#e5e8ef;
  --surface:#ffffff;
  --surface-modal:#ffffff;
  --bg:#f4f6fb;
  --gray-fg:#6b7280;
  --gray-bg:#eef0f4;
  --radius:8px;
  --radius-lg:12px;

  --green:#12a150;
  --green-bg:#e6f8ee;
  --red:#c02b2b;
  --red-bg:#fdeceb;
  --violet-bg:#f1ecff;
  --violet-fg:#6d3fd6;
  --blue-bg:#e0f2fe;
  --blue-fg:#0369a1;
  --amber-bg:#fff4e0;
  --amber-fg:#a45a05;

  --interactive-selected-bg:var(--primary-50);
  --interactive-selected-border:var(--primary-100);
  --interactive-selected-text:var(--primary-dark);

  --space-2:8px;
  --space-3:12px;
  --z-sticky:10;
  --z-popover:20;
  --z-modal:50;

  --input-sm:32px;
  --input-md:36px;
  --input-lg:44px;
}
html[data-theme="dark"]{
  --primary-50:rgba(0,101,205,.16);
  --primary-100:rgba(0,101,205,.30);
  --ink-900:#f1f4f9;
  --ink-700:#c6cbd6;
  --ink-500:#8b93a3;
  --ink-400:#7b8394;
  --border:#2a3242;
  --surface:#161c2b;
  --surface-modal:#1c2333;
  --bg:#0c0f17;
  --gray-fg:#9aa3b2;
  --gray-bg:#242c3d;
  --green:#34d399;
  --green-bg:rgba(52,211,153,.16);
  --red:#ff8a8a;
  --red-bg:rgba(192,43,43,.20);
  --violet-bg:rgba(109,63,214,.24);
  --violet-fg:#b79bf7;
  --blue-bg:rgba(2,132,199,.20);
  --blue-fg:#7dd3fc;
  --amber-bg:rgba(224,138,0,.18);
  --amber-fg:#f5b942;
}
html[data-contrast="high"]{
  --border:#cbd3dd;
  --ink-500:#4b5563;
  --ink-400:#5b6474;
}
html[data-theme="dark"][data-contrast="high"]{
  --border:#5b6a85;
  --ink-500:#b7bfcc;
  --ink-400:#9aa5b8;
}

html,body{margin:0;padding:0;}
body{
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";
  background:var(--bg);
}
html[data-theme="dark"] body{background:var(--bg);}

*{scrollbar-width:thin;scrollbar-color:#d7dce6 transparent;}
*::-webkit-scrollbar{width:5px;height:5px;}
*::-webkit-scrollbar-track{background:transparent;}
*::-webkit-scrollbar-thumb{background:#d7dce6;border-radius:10px;}
*::-webkit-scrollbar-thumb:hover{background:#c3c9d6;}
html[data-theme="dark"] *{scrollbar-color:#333e54 transparent;}
html[data-theme="dark"] *::-webkit-scrollbar-thumb{background:#333e54;}
html[data-theme="dark"] *::-webkit-scrollbar-thumb:hover{background:#454e60;}

.app{
  display:flex;
  height:100vh;
  min-width:768px;
  overflow:hidden;
}
.main{flex:1;display:flex;flex-direction:column;min-width:0;height:100%;overflow:hidden;}
.content{
  padding:20px 24px;
  display:flex;flex-direction:column;gap:16px;
  flex:1;min-height:0;
  overflow:hidden;
}

/* La cabecera (PacienteHeader) queda fija -- solo .hq-body scrollea, mismo
   criterio que .fp-sections en FichaPaciente.css (contexto permanente
   arriba, contenido largo scrolleable debajo). */
.hq-body{flex:1;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:16px;padding-right:2px;}
```

- [ ] **Step 3: Create the route file `src/app/historial-quirurgico/[id]/page.jsx`**

```jsx
import HistorialQuirurgico from '@/Components/HistorialQuirurgico/HistorialQuirurgico';

export default async function Page({ params }) {
  await params;
  return <HistorialQuirurgico />;
}
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/Components/HistorialQuirurgico/HistorialQuirurgico.jsx src/app/historial-quirurgico`
Expected: no errors.

- [ ] **Step 5: Start the dev server and smoke test manually**

Run: `npm run dev` (or reuse an already-running instance), then in a browser at `/historial-quirurgico/pac-1`:

1. Header shows "Berrocal Payares Yuri del Carmen", "ID de afiliado: 55222523", "Historial quirúrgico", "3 intervenciones".
2. Intervenciones table shows 3 rows (25 oct 2023 · 14:15 / 21 nov 2023 · 11:05 / 21 nov 2023 · 02:00), first row selected by default (highlighted).
3. "Detalle de la intervención" shows "Colecistectomía laparoscópica" with the first row's médico/sala/quirófano/estado badge.
4. "Procedimientos realizados" shows 1 item ("Colecistectomía laparoscópica", código 0231301), auto-selected.
5. "Detalle del procedimiento" shows 4 tabs (Insumos active by default) with 5 insumos listed.
6. Click the second row (21 nov 2023 · 11:05, Humberto Alfonso Aragón González) — Resumen/Procedimientos/Detalle all update; Procedimientos shows "Exploración y descompresión del canal raquídeo" (código 030208C); its Insumos tab shows the 9 items from the spec; its Farmacia tab shows the "No hay pedidos a farmacia registrados para este procedimiento." empty state.
7. Click the third row — its Equipos tab shows "No hay equipos registrados."
8. Click through all 4 tabs (Insumos/Farmacia/Personal/Equipos) on any procedimiento — each renders real content or its own empty state, none crash.
9. Confirm no button/control anywhere reads "+", "-", trash icon, "Agregar", "Eliminar", "Cancelar programación", "Finalizar", or "Volver".
10. Resize the browser to ~800px width — tables get their own horizontal scroll, `body` itself never scrolls horizontally.

- [ ] **Step 6: Commit**

```bash
git add src/Components/HistorialQuirurgico/HistorialQuirurgico.jsx src/Components/HistorialQuirurgico/HistorialQuirurgico.css src/app/historial-quirurgico
git commit -m "$(cat <<'EOF'
Wire up Historial Quirúrgico del Paciente screen

New route /historial-quirurgico/[id] rendering the full 3-level
master-detail (intervenciones → procedimientos → recursos), backed by the
fixed demo dataset.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `BuscarPacienteModal`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/modals/BuscarPacienteModal/BuscarPacienteModal.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/modals/BuscarPacienteModal/BuscarPacienteModal.css`

**Interfaces:**
- Consumes: `ModalHeader` (`@/Components/ModalHeader/ModalHeader`), `Button` (`@/Components/Button/Button`), `PATIENTS`/`calcularEdad` (`@/hooks/ListaPacientes/mockPatientsData`). Relies on `.modal-overlay`/`.modal-card`/`.modal-body`/`.modal-footer` already defined in `ProgramacionSalaCirugias/shared/shared.css` (already imported by `ProgramacionSalaCirugias.jsx`).
- Produces: `BuscarPacienteModal({ onSelect: (paciente)=>void, onClose: ()=>void })` — `onSelect` is called with the full matched record from `PATIENTS` (`{id, nombre, documento, ...}`).

- [ ] **Step 1: Create `BuscarPacienteModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './BuscarPacienteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { PATIENTS, calcularEdad } from '@/hooks/ListaPacientes/mockPatientsData';
import { LuSearch } from 'react-icons/lu';

// Quita tildes -- mismo helper que CatalogoMedicosModal.jsx/
// CatalogoDiagnosticosModal.jsx (no compartido entre modales, ver AGENTS.md
// "Component organization").
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Buscador de paciente para acceder al Historial Quirúrgico desde
// Programación de Sala de Cirugías (encargo explícito) -- no existe un
// buscador de paciente genérico en el proyecto (ver AGENTS.md "Component
// organization"), así que este vive junto a los demás catálogos de esta
// feature. Mismo look que CatalogoMedicosModal (buscador + tabla + fila
// seleccionable) pero sin paginación -- 46 registros de PATIENTS caben con
// scroll interno de la lista, mismo criterio que BuscarPacienteModal de
// Gestión de Camas.
export default function BuscarPacienteModal({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState(null);

  const qTrim = query.trim();
  const qNorm = normalizar(qTrim);
  const filtered = PATIENTS.filter((p) => (
    !qNorm || normalizar(p.nombre).includes(qNorm) || p.documento.includes(qTrim)
  ));

  function handleConfirm() {
    if (!seleccion) return;
    onSelect(seleccion);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card bpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="bpm-title">
        <ModalHeader
          title="Buscar paciente"
          titleId="bpm-title"
          onClose={onClose}
          closeLabel="Cerrar búsqueda de paciente"
        />
        <div className="modal-body bpm-body">
          <div className="bpm-search">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o documento"
              aria-label="Buscar por nombre o documento"
            />
          </div>

          <div className="bpm-table">
            <div className="bpm-row bpm-row-head">
              <span>Nombre</span>
              <span>Documento</span>
              <span>Edad</span>
              <span>EPS</span>
            </div>
            <div className="bpm-list" role="listbox" aria-labelledby="bpm-title">
              {filtered.length === 0 && (
                <div className="bpm-empty">Sin resultados para la búsqueda.</div>
              )}
              {filtered.map((p) => {
                const active = seleccion?.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    role="option"
                    aria-selected={active}
                    className={`bpm-row bpm-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(p)}
                  >
                    <span className="bpm-nombre">{p.nombre}</span>
                    <span className="bpm-documento">{p.tipoDocumento} {p.documento}</span>
                    <span className="bpm-edad">{calcularEdad(p.fechaNacimiento)} años</span>
                    <span className="bpm-eps">{p.eps}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!seleccion}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `BuscarPacienteModal.css`**

```css
/* Homologado al look de CatalogoMedicosModal.css (buscador + tabla con
   borde + fila-botón seleccionable) -- clases propias (.bpm-*). Sin bloque
   de paginación (a diferencia de CatalogoMedicosModal): 46 registros caben
   con scroll interno de .bpm-list. */
.bpm-modal-card{width:760px;}
.bpm-modal-card > .modal-body{overflow:hidden;}
.bpm-body{padding:16px 24px 20px;gap:10px;flex:1;min-height:0;display:flex;flex-direction:column;}

.bpm-search{
  display:flex;align-items:center;gap:8px;flex-shrink:0;
  height:var(--input-md);padding:0 12px;
  border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);
}
.bpm-search .icon{width:16px;height:16px;color:var(--ink-500);flex-shrink:0;}
.bpm-search input{
  flex:1;min-width:0;border:none;background:transparent;
  font-family:inherit;font-size:var(--fs-base);color:var(--ink-900);outline:none;
}
.bpm-search input::placeholder{color:var(--ink-400);}

.bpm-table{
  border:1px solid var(--border);border-radius:var(--radius);
  flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;
}
.bpm-row{
  display:grid;grid-template-columns:1fr 140px 70px 140px;align-items:center;gap:10px;
  padding:9px 12px;
}
.bpm-row-head{
  background:#f7f8fb;border-bottom:1px solid var(--border);flex-shrink:0;
  font-size:var(--fs-xs);font-weight:var(--fw-bold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;
}
html[data-theme="dark"] .bpm-row-head{background:#1c2333;}

.bpm-list{flex:1;min-height:0;overflow-y:auto;max-height:420px;}
.bpm-option{
  width:100%;border:none;background:transparent;border-bottom:1px solid var(--bg);
  text-align:left;cursor:pointer;font-family:inherit;
}
.bpm-option:last-child{border-bottom:none;}
.bpm-option:hover{background:var(--bg);}
.bpm-option:focus-visible{outline:2px solid var(--primary);outline-offset:-2px;}
.bpm-option.active{background:var(--primary-50);}
.bpm-nombre{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bpm-documento{font-size:var(--fs-sm);color:var(--ink-500);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bpm-edad{font-size:var(--fs-sm);color:var(--ink-500);}
.bpm-eps{font-size:var(--fs-sm);color:var(--ink-700);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.bpm-empty{padding:28px 14px;text-align:center;font-size:var(--fs-base);color:var(--ink-500);}

@media (max-width:768px){
  .bpm-modal-card{width:100%;}
  .bpm-row{grid-template-columns:1fr 90px 50px;}
  .bpm-eps{display:none;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/BuscarPacienteModal`
Expected: no errors. Full interaction verification happens in Task 11 once wired to the "Buscar" button.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/modals/BuscarPacienteModal
git commit -m "$(cat <<'EOF'
Add BuscarPacienteModal to Programación de Sala de Cirugías

Patient search modal (search + selectable table, no pagination) sourced
from the existing Lista de Pacientes mock dataset — entry point for
Historial Quirúrgico.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Wire the "Buscar" icon to open the modal and navigate

**Files:**
- Modify: `src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx`

**Interfaces:**
- Consumes: `BuscarPacienteModal` (Task 10), existing `modal`/`setModal` state (already in the file, pattern `{ type, cirugia? }`).
- Produces: end-to-end flow from the "Buscar" icon to `/historial-quirurgico/[id]`.

- [ ] **Step 1: Add the `useRouter` and `BuscarPacienteModal` imports**

In `src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx`, change the top of the file (currently lines 1-8):

```jsx
'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { LuSearch } from 'react-icons/lu';
import './ProgramacionSalaCirugias.css';
import './shared/shared.css';
```

And add the modal import next to the other `modals/` imports (currently lines 18-21):

```jsx
import CancelarCirugiaModal from './modals/CancelarCirugiaModal/CancelarCirugiaModal';
import NuevaCirugiaWizard from './modals/NuevaCirugiaWizard/NuevaCirugiaWizard';
import BuscarPacienteModal from './modals/BuscarPacienteModal/BuscarPacienteModal';
```

- [ ] **Step 2: Add the router instance and the selection handler**

Right after `export default function ProgramacionSalaCirugias() {` (currently line 41), add:

```jsx
export default function ProgramacionSalaCirugias() {
  const router = useRouter();
```

Then, next to the other handler functions (right after `handleEditarCirugia`, currently ending at line 237, before the `return (`), add:

```jsx
  function handleSeleccionarPacienteHistorial(paciente) {
    setModal(null);
    router.push(`/historial-quirurgico/${paciente.id}`);
  }
```

- [ ] **Step 3: Change the "Buscar" button's `onClick` and add the modal render**

Replace the button (currently lines 256-263):

```jsx
              <button
                type="button"
                className="icon-btn-circle"
                aria-label="Buscar"
                onClick={() => window.ncToast?.('Búsqueda de cirugías en desarrollo.')}
              >
                <LuSearch className="icon" />
              </button>
```

with:

```jsx
              <button
                type="button"
                className="icon-btn-circle"
                aria-label="Buscar"
                onClick={() => setModal({ type: 'buscarPaciente' })}
              >
                <LuSearch className="icon" />
              </button>
```

Then add the modal render next to the other `modal?.type === '...'` blocks (currently lines 344-349):

```jsx
      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal?.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}
      {modal?.type === 'buscarPaciente' && (
        <BuscarPacienteModal onClose={() => setModal(null)} onSelect={handleSeleccionarPacienteHistorial} />
      )}
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx`
Expected: no errors.

- [ ] **Step 5: Start the dev server and smoke test the full flow**

Run: `npm run dev` (or reuse an already-running instance), then in a browser at `/programacion-sala-cirugias`:

1. Click the lupa in the page header — `BuscarPacienteModal` opens (no more toast).
2. Type part of a patient's name or document — the list filters live.
3. Click a row (highlights), click "Confirmar" — the browser navigates to `/historial-quirurgico/{id}` and the Historial Quirúrgico screen loads (Task 9's screen).
4. Go back, reopen the modal, click "Cancelar" — modal closes without navigating.
5. Reopen the modal, select a row, then click a *different* row before confirming — selection moves, "Confirmar" still enabled, navigates to the newly selected patient's id.

- [ ] **Step 6: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx
git commit -m "$(cat <<'EOF'
Wire the search icon to BuscarPacienteModal and Historial Quirúrgico

Clicking "Buscar" in Programación de Sala de Cirugías now opens the patient
search modal; confirming a selection navigates to that patient's surgical
history screen.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
