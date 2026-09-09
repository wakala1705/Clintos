# Solicitudes de Insumos Farmacia V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `UnderConstruction` placeholder at `/insumos-farmacia/solicitudes` with a working replica of a legacy "Catálogo Movimiento De Inventario Salidas Asistenciales" screen — 5 sections (toolbar, grid, actions panel, movement detail with tabs, totals footer) — built with this project's own components and visual system.

**Architecture:** A static mock module (`mockSolicitudesData.js`) holds a fixed warehouse context plus 7 seeded `MOVIMIENTOS`, each carrying its own `articulos` line items. `Solicitudes.jsx` (orchestrator) owns `filtros` (client-side filter state) and `selectedId`, derives the filtered list and the selected movimiento with `useMemo`/render-time fallback (no `useEffect`), and renders 4 stacked pieces inside one `.card`: `MovimientosToolbar` (dense multi-field toolbar, the deliberate "vista clásica" exception to the project's standard filter-bar — same precedent as `FacturaVistaClasica`), a `.mig-body` row with `MovimientosGrid` (flex:1, scrollable) beside `MovimientoAccionesPanel` (fixed-width action column — a new pattern in this codebase), `MovimientoDetalle` (remounted via `key={selectedId}` so its own tab state resets automatically when the selection changes — no manual reset trick needed) with `MovimientoItemsTable` nested inside its "Detalle" tab, and `MovimientosTotalesFooter` (pure presentational, fed pre-computed totals from the orchestrator).

**Tech Stack:** Next.js (App Router) + React, plain CSS (no CSS-in-JS/Tailwind) except `@/Components/Button/Button` and `@/Components/FormSelect/FormSelect` (existing project components), `react-icons/lu` (Lucide) for icons. No test framework is configured (`package.json` has no `test` script) — verification steps use `npx eslint` on changed files plus manual smoke tests in the dev server, same convention as `docs/superpowers/plans/2026-09-02-historial-quirurgico.md`.

**Spec:** `docs/superpowers/specs/2026-09-09-solicitudes-insumos-farmacia-design.md`

## Global Constraints

- Every new component folder = exactly `ComponentName.jsx` + `ComponentName.css` (AGENTS.md "Component organization").
- Every `<select>` inside a `.form-field`/filter field uses `@/Components/FormSelect/FormSelect` — never a native `<select>` (AGENTS.md "Selects de formulario"). `FormSelect`'s `onChange` receives the value directly, never an event.
- All icons come from `react-icons/lu` (`Lu*` names). Every icon used in this plan (`LuDownload`, `LuRefreshCw`, `LuUndo2`, `LuBan`, `LuPrinter`, `LuPlus`, `LuPencil`) is confirmed to exist in the installed `react-icons/lu` package.
- `font-size`/`font-weight` in any new CSS use the `--fs-*`/`--fw-*` tokens from `globals.css` — never a raw px/600 value. Section headings use `--fw-semibold`, never `--fw-bold`.
- All buttons use `@/Components/Button/Button` — never a hand-rolled `<button className="btn ...">`.
- `Button`'s `danger-outline` variant reads `--red`/`--red-bg` from the mounting feature's own `:root` (`Button.module.css:123-130`) — `InsumosFarmacia/Solicitudes/Solicitudes.css` does not define these yet (only `Facturacion`/`Vacunacion`/`Admisiones` do among features checked). Task 2 adds them, copied verbatim from `Facturacion/shared/shared.css` for project-wide color consistency, or the "Anular" button silently renders with no visible border/hover — same class of gotcha already documented in AGENTS.md for `ModalHeader`/`Badge`.
- All new `.jsx` files start with `'use client'`.
- Mock data (`CONTEXTO_BODEGA`, `MOVIMIENTOS`) is fully static — no `Math.random()`/`Date.now()`-based ids, no simulated backend call (this screen filters the imported array directly with `useMemo`, same as `FacturaVistaClasica.jsx`, not the `fetchX()`-simulated-latency pattern used by "vista nueva" screens like `Facturacion.jsx`).
- V1 has no modals and no real mutation logic (Reversar/Anular/Nuevo/Editar/Cambiar/Ver/Movimiento/"Seleccionar Movimiento" are visual-only) — approved design decision, do not add `onClick` side effects beyond enabling/disabling state.
- Tabs "Línea"/"Prefijos" render a simple empty-state string only — no mock content, no table (approved design decision).
- Responsive: any new scrollable table gets `overflow-x:auto` on its own wrapper, never on `body` (AGENTS.md "Responsive / Breakpoints").

---

## File Structure

```
src/hooks/InsumosFarmacia/mockSolicitudesData.js                                   (new)

src/Components/InsumosFarmacia/Solicitudes/
  Solicitudes.jsx / .css                                                           (modify — replaces UnderConstruction)
  shared/shared.css                                                                (new)
  MovimientosToolbar/MovimientosToolbar.jsx / .css                                 (new)
  MovimientosGrid/MovimientosGrid.jsx / .css                                       (new)
  MovimientoAccionesPanel/MovimientoAccionesPanel.jsx / .css                       (new)
  MovimientoDetalle/
    MovimientoDetalle.jsx / .css                                                   (new)
    MovimientoItemsTable/MovimientoItemsTable.jsx / .css                           (new)
  MovimientosTotalesFooter/MovimientosTotalesFooter.jsx / .css                     (new)
```

---

### Task 1: Mock data module

**Files:**
- Create: `src/hooks/InsumosFarmacia/mockSolicitudesData.js`

**Interfaces:**
- Produces (named exports): `CONTEXTO_BODEGA: {anio, grupoBodega, bodega, idSede}`, `TIPO_OPTIONS`, `TIPO_ARTICULO_OPTIONS`, `PROCEDENCIA_OPTIONS`, `ESTADO_OPTIONS`, `TRNS_OPTIONS` (all `{value, label}[]`), `MOVIMIENTOS: Movimiento[]`, `formatFecha(iso): string`, `formatMoneda(valor): string`, where:
  - `Movimiento = { id, bdg, bodegaColor, grupo, consecutivo, noAdmision, noPrestacion, fecha, hora, procedencia, movimiento, paciente, ubicacion, idContrato, tipo:'debito'|'credito', tipoArticulo:'medicamento'|'insumo'|'dispositivo', procedenciaTipo:'salud'|'particular', estado:'sin-confirmar'|'confirmado', trns:'sal'|'ent', fechaContable, confirmo, permitirEditarCostos, articulos: Articulo[] }`
  - `Articulo = { item, codigo, descripcion, marca, bdg, cantidadSolicitada, cantidadEntregada, costoUnidad:{anterior,unidad,descuento,neto}, costoTotal:{unidad,descuento,neto}, iva:{porcentaje,unitario,total}, confirmado:boolean }`

- [ ] **Step 1: Create the file**

```js
// Mock data de "Solicitudes de Insumos Farmacia" (Módulo Contable → Insumos
// Farmacia → Solicitudes) -- réplica de la pantalla legacy "Catálogo
// Movimiento De Inventario Salidas Asistenciales". Sin backend real (encargo
// explícito: "solo pinta el front", mismo criterio que mockFacturasData.js).
// A diferencia de mockFacturasData.js (que además expone fetchFacturas()
// para la "vista nueva" de Facturación) esta pantalla es puramente una
// "vista clásica" -- se filtra el array de abajo directo con useMemo, igual
// que FacturaVistaClasica.jsx hace con FACTURAS -- así que no se agrega un
// fetchMovimientos() sin consumidor real (YAGNI).

// Contexto fijo de la página (bodega/año/sede activos) -- no son filtros de
// la tabla, son los campos de solo lectura del toolbar (Año/Grp Bdg./
// Bodega/Id.Sede de la referencia). V1 no tiene selector de bodega.
export const CONTEXTO_BODEGA = {
  anio: '2026',
  grupoBodega: '01',
  bodega: 'FARMACIA PISO 3',
  idSede: '01',
};

export const TIPO_OPTIONS = [
  { value: 'debito', label: 'Debito' },
  { value: 'credito', label: 'Credito' },
];

export const TIPO_ARTICULO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'insumo', label: 'Insumo' },
  { value: 'dispositivo', label: 'Dispositivo médico' },
];

export const PROCEDENCIA_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'salud', label: 'Salud' },
  { value: 'particular', label: 'Particular' },
];

export const ESTADO_OPTIONS = [
  { value: 'sin-confirmar', label: 'Sin Confirmar' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'todos', label: 'Todos' },
];

export const TRNS_OPTIONS = [
  { value: 'sal', label: 'SAL' },
  { value: 'ent', label: 'ENT' },
];

// 'dd/mm/aaaa' -- distinto del formatFechaClasica de mockFacturasData.js
// ("3.SEP.2026", con puntos) porque la referencia de esta pantalla usa
// barras, no un criterio compartido entre ambas vistas clásicas.
export function formatFecha(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function formatMoneda(valor) {
  return valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function articulo(overrides) {
  return {
    marca: 'NA',
    bdg: '01',
    costoUnidad: { anterior: 0, unidad: 0, descuento: 0, neto: 0 },
    costoTotal: { unidad: 0, descuento: 0, neto: 0 },
    iva: { porcentaje: 0, unitario: 0, total: 0 },
    confirmado: false,
    ...overrides,
  };
}

export const MOVIMIENTOS = [
  {
    id: '0200203069-2',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203069-2',
    noAdmision: '0200277323',
    noPrestacion: '0200000198',
    fecha: '2026-07-25',
    hora: '5:14 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'GARCIA GARCIA ANGELICA MARIA',
    ubicacion: 'Sede 01 · Área: Urgencias · C.Costo: URGENCIAS',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-27',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000005', descripcion: 'Acetaminofén 500 mg tableta',
        cantidadSolicitada: 3, cantidadEntregada: 3,
      }),
      articulo({
        item: 2, codigo: 'MX0000053', descripcion: 'Amikacina 500 mg solución inyectable',
        cantidadSolicitada: 6, cantidadEntregada: 6,
      }),
    ],
  },
  {
    id: '0200203068',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203068',
    noAdmision: '0200277262',
    noPrestacion: '0201706743',
    fecha: '2026-07-24',
    hora: '5:41 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'UNICIA GOKU',
    ubicacion: 'Sede 01 · Área: Consulta Externa · C.Costo: CONSULTA EXTERNA',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    // Único movimiento con costos/IVA reales y confirmado mixto (encargo del
    // plan) -- ejercita el particionamiento Confir./Sin Confir. del pie de
    // totales, que de otro modo daría 0.00 en las 5 tarjetas con el resto
    // del dataset (fiel a la referencia, que también muestra 0.00 porque su
    // único movimiento visible en el detalle no tiene costo cargado).
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000112', descripcion: 'Carbamazepina 200 mg tableta',
        cantidadSolicitada: 10, cantidadEntregada: 10,
        costoUnidad: { anterior: 850, unidad: 850, descuento: 0, neto: 850 },
        costoTotal: { unidad: 8500, descuento: 0, neto: 8500 },
        confirmado: true,
      }),
      articulo({
        item: 2, codigo: 'MX0000371', descripcion: 'Losartán potásico 50 mg tableta',
        cantidadSolicitada: 20, cantidadEntregada: 18,
        costoUnidad: { anterior: 420, unidad: 420, descuento: 0, neto: 420 },
        costoTotal: { unidad: 7560, descuento: 0, neto: 7560 },
        iva: { porcentaje: 19, unitario: 79.8, total: 1436.4 },
        confirmado: false,
      }),
    ],
  },
  {
    id: '0200203066',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203066',
    noAdmision: '0200277321',
    noPrestacion: '0201706742',
    fecha: '2026-07-24',
    hora: '5:02 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'CARPIO PITALUA ISA',
    ubicacion: 'Sede 01 · Área: Consulta Externa · C.Costo: CONSULTA EXTERNA',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000005', descripcion: 'Acetaminofén 500 mg tableta',
        cantidadSolicitada: 1, cantidadEntregada: 1,
      }),
    ],
  },
  {
    id: '0200203065-1',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203065-1',
    noAdmision: '0200277320',
    noPrestacion: '0200000196',
    fecha: '2026-07-24',
    hora: '4:53 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'DIAZ GONZALEZ JOSE CARLOS',
    ubicacion: 'Sede 01 · Área: Hospitalización Piso 2 · C.Costo: HOSPITALIZACION',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'insumo',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'DM000360', descripcion: 'Jeringa 20 ml',
        cantidadSolicitada: 5, cantidadEntregada: 5,
      }),
    ],
  },
  {
    id: '0200203064',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203064',
    noAdmision: '0200277305',
    noPrestacion: '0200000195',
    fecha: '2026-07-24',
    hora: '3:19 p. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'RODRIGUEZ JAMES',
    ubicacion: 'Sede 01 · Área: Ambulancia · C.Costo: AMBULANCIA',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'dispositivo',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '2026-07-26',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'DM000512', descripcion: 'Cánula nasal adulto',
        cantidadSolicitada: 1, cantidadEntregada: 1,
      }),
    ],
  },
  {
    id: '0200203063-1',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203063-1',
    noAdmision: '0200277225',
    noPrestacion: '0200000194',
    fecha: '2026-07-22',
    hora: '8:56 a. m.',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'AGUSTU JULIO JULIO',
    ubicacion: 'Sede 01 · Área: Hospitalización Piso 2 · C.Costo: HOSPITALIZACION',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    // Único campo que se aparta del default ('sin-confirmar') -- a propósito
    // deja el resto (tipo/procedencia/trns) igual al default para que
    // cambiar SOLO "Estado" lo revele en aislamiento (ver Task 8 Step 4). No
    // sumar más variaciones a este registro sin actualizar ese checklist.
    estado: 'confirmado',
    trns: 'sal',
    fechaContable: '2026-07-23',
    confirmo: 'ROJAS MENDEZ PAOLA',
    permitirEditarCostos: true,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000158', descripcion: 'Clopidogrel bisulfato 75 mg tableta',
        cantidadSolicitada: 30, cantidadEntregada: 30,
        costoUnidad: { anterior: 610, unidad: 610, descuento: 0, neto: 610 },
        costoTotal: { unidad: 18300, descuento: 0, neto: 18300 },
        confirmado: true,
      }),
    ],
  },
  {
    id: '0200203056-2',
    bdg: '01',
    bodegaColor: '#e8801a',
    grupo: '01',
    consecutivo: '0200203056-2',
    noAdmision: '0200277313',
    noPrestacion: '0200000188',
    fecha: '2026-07-22',
    hora: '11:39 a. m.',
    procedencia: 'SALUD',
    movimiento: 'EN-Traslado Entre Bodegas',
    paciente: 'DE LA ESPRIELLA PARRA ALFONSO',
    ubicacion: 'Sede 01 · Área: Hospitalización Piso 2 · C.Costo: HOSPITALIZACION',
    idContrato: '800251440',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    // Trns distinto del default ('sal') a propósito -- ejercita el filtro
    // Trns. (con Trns.=SAL este movimiento queda oculto por defecto).
    estado: 'sin-confirmar',
    trns: 'ent',
    fechaContable: '2026-07-23',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      articulo({
        item: 1, codigo: 'MX0000390', descripcion: 'Metoclopramida 10 mg / 2 ml sol. inyectable',
        cantidadSolicitada: 4, cantidadEntregada: 4,
      }),
    ],
  },
];
```

- [ ] **Step 2: Lint the file**

Run: `npx eslint src/hooks/InsumosFarmacia/mockSolicitudesData.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/InsumosFarmacia/mockSolicitudesData.js
git commit -m "$(cat <<'EOF'
Add mock data for Solicitudes de Insumos Farmacia

7 seeded inventory movements (with warehouse context, filter option lists,
and per-movement línea items) replicating the legacy "Catálogo Movimiento
De Inventario Salidas Asistenciales" screen's dataset shape.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Feature tokens + shared table/grid styles

**Files:**
- Modify: `src/Components/InsumosFarmacia/Solicitudes/Solicitudes.css`
- Create: `src/Components/InsumosFarmacia/Solicitudes/shared/shared.css`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: CSS custom properties `--red`, `--red-bg`, `--interactive-selected-bg`, `--input-sm` (on `Solicitudes.css`'s `:root`, consumed by `Button`'s `danger-outline` variant and by this feature's own table/row-selection rules). Classes `.card`, `.mig-grid` (+ `thead th`/`tbody td`/`tbody tr` incl. `:hover`/`.selected`/`:focus-visible`), `.mig-num`, `.mig-ellipsis`, `.mig-strong`, `.mig-bdg-dot`, `.mig-detail-empty` for later tasks to use.

- [ ] **Step 1: Add the missing tokens to `Solicitudes.css`**

Find the existing `:root{...}` block (ends with `--radius-lg:12px;`) and the `html[data-theme="dark"]{...}` block (ends with `--gray-bg:#242c3d;`) in `src/Components/InsumosFarmacia/Solicitudes/Solicitudes.css`. Add one line to each, right before their closing `}`:

```css
:root{
  /* ...existing lines unchanged... */
  --radius-lg:12px;
  --red:#c02b2b;
  --red-bg:#fdeceb;
  --interactive-selected-bg:var(--primary-100);
  --input-sm:32px;
}
html[data-theme="dark"]{
  /* ...existing lines unchanged... */
  --gray-bg:#242c3d;
  --red:#ff8a8a;
  --red-bg:rgba(192,43,43,.20);
}
```

(`--interactive-selected-bg`/`--input-sm` have no dark-mode override: the first derives from `--primary-100`, already re-themed above it in the dark block via `var()` indirection; the second is a fixed size, same criterion as `--radius`.)

- [ ] **Step 2: Create `shared/shared.css`**

```css
/* Estilos cross-cutting de Solicitudes de Insumos Farmacia -- importado una
   sola vez desde Solicitudes.jsx (ver AGENTS.md "Component organization").
   .card: mismo contrato que Facturacion/shared/shared.css (llena el alto
   restante de .content, cada sección interna decide su propio scroll).
   .mig-grid/.mig-num/.mig-ellipsis: reusadas por MovimientosGrid y
   MovimientoItemsTable -- mismo criterio que .fvc-grid en
   Facturacion/shared/shared.css. */
.card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
  display:flex;flex-direction:column;flex:1;min-height:0;
}

.mig-grid{border-collapse:collapse;width:100%;font-size:var(--fs-sm);white-space:nowrap;}
.mig-grid thead th{
  text-align:left;padding:8px 12px;background:var(--table-header-bg);
  font-size:var(--fs-xs);font-weight:var(--fw-bold);color:var(--ink-500);
  text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid var(--border);
  position:sticky;top:0;
}
.mig-grid tbody td{padding:9px 12px;border-bottom:1px solid var(--border);color:var(--ink-900);}
.mig-grid tbody tr{cursor:pointer;background:var(--surface);}
.mig-grid tbody tr:hover{background:var(--gray-bg);}
.mig-grid tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px;}
.mig-grid tbody tr.selected{background:var(--interactive-selected-bg);box-shadow:inset 3px 0 0 var(--primary);}

.mig-strong{font-weight:var(--fw-semibold);color:var(--ink-900);}
.mig-num{text-align:right;}
.mig-ellipsis{max-width:220px;overflow:hidden;text-overflow:ellipsis;}

.mig-bdg-dot{display:inline-block;width:14px;height:14px;border-radius:3px;flex-shrink:0;}

.mig-detail-empty{
  display:flex;align-items:center;justify-content:center;
  padding:24px;color:var(--ink-500);font-size:var(--fs-base);text-align:center;
}

@media (max-width:1024px){
  .mig-ellipsis{max-width:160px;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/Solicitudes.css src/Components/InsumosFarmacia/Solicitudes/shared/shared.css`
Expected: ESLint only checks JS/JSX by default in this project, so this may report "no files matching" — that's fine, there's no CSS linter configured. Visually re-read both files to confirm no stray braces/typos.

- [ ] **Step 4: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/Solicitudes.css src/Components/InsumosFarmacia/Solicitudes/shared/shared.css
git commit -m "$(cat <<'EOF'
Add feature tokens and shared grid styles for Solicitudes de Insumos Farmacia

Adds the --red/--red-bg/--interactive-selected-bg/--input-sm tokens this
feature was missing (needed by Button's danger-outline variant and row
selection), plus the .card/.mig-grid scaffolding shared by the grid and the
movement's items table.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `MovimientosToolbar`

**Files:**
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientosToolbar/MovimientosToolbar.jsx`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientosToolbar/MovimientosToolbar.css`

**Interfaces:**
- Consumes: `CONTEXTO_BODEGA`, `TIPO_OPTIONS`, `TIPO_ARTICULO_OPTIONS`, `PROCEDENCIA_OPTIONS`, `ESTADO_OPTIONS`, `TRNS_OPTIONS` (Task 1), `@/Components/FormSelect/FormSelect`, `@/Components/Button/Button`.
- Produces: `MovimientosToolbar({ filtros, onChange })` where `filtros = { tipo, tipoArticulo, procedencia, estado, trns, noDoc, noAdmision, noPrestacion }` and `onChange(patch: Partial<typeof filtros>): void` merges `patch` into the parent's filter state.

- [ ] **Step 1: Create `MovimientosToolbar.jsx`**

```jsx
'use client';

import './MovimientosToolbar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import {
  CONTEXTO_BODEGA, TIPO_OPTIONS, TIPO_ARTICULO_OPTIONS, PROCEDENCIA_OPTIONS, ESTADO_OPTIONS, TRNS_OPTIONS,
} from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuDownload, LuRefreshCw } from 'react-icons/lu';

// Réplica del toolbar denso multi-campo de la pantalla legacy de referencia
// (encargo explícito) -- excepción ya validada por FacturaVistaClasica al
// filter-bar estándar de un listado normal (buscador + chips + selects en
// una sola fila, ver AGENTS.md "Barra de filtros de listado"): esta pantalla
// replica la estructura original, no la condensa. Año/Grp Bdg./Bodega/
// Id.Sede son de solo lectura (CONTEXTO_BODEGA) -- V1 no tiene selector de
// bodega, ver spec. "Seleccionar Movimiento" es visual-only (V1 sin backend).
export default function MovimientosToolbar({ filtros, onChange }) {
  return (
    <div className="mig-toolbar">
      <div className="mig-toolbar-row">
        <div className="mig-static-field">
          <span className="lbl">Año:</span>
          <span className="val">{CONTEXTO_BODEGA.anio}</span>
        </div>
        <div className="mig-static-field">
          <span className="lbl">Grp Bdg.:</span>
          <span className="val">{CONTEXTO_BODEGA.grupoBodega}</span>
        </div>
        <div className="mig-static-field">
          <span className="val">{CONTEXTO_BODEGA.bodega}</span>
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-tipo">Tipo:</label>
          <FormSelect id="mig-tipo" value={filtros.tipo} onChange={(v) => onChange({ tipo: v })} options={TIPO_OPTIONS} />
        </div>

        <div className="mig-static-field">
          <span className="lbl">Id.Sede:</span>
          <span className="val">{CONTEXTO_BODEGA.idSede}</span>
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-tipo-articulo">Tipo Artículo:</label>
          <FormSelect id="mig-tipo-articulo" value={filtros.tipoArticulo} onChange={(v) => onChange({ tipoArticulo: v })} options={TIPO_ARTICULO_OPTIONS} />
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-procedencia">Procedencia:</label>
          <FormSelect id="mig-procedencia" value={filtros.procedencia} onChange={(v) => onChange({ procedencia: v })} options={PROCEDENCIA_OPTIONS} />
        </div>

        <div className="mig-filter-field">
          <label htmlFor="mig-estado">Estado:</label>
          <FormSelect id="mig-estado" value={filtros.estado} onChange={(v) => onChange({ estado: v })} options={ESTADO_OPTIONS} />
        </div>
      </div>

      <div className="mig-toolbar-row">
        <Button variant="secondary" size="sm" icon={LuDownload}>Seleccionar Movimiento</Button>

        <div className="mig-filter-field">
          <label htmlFor="mig-trns">Trns.:</label>
          <FormSelect id="mig-trns" value={filtros.trns} onChange={(v) => onChange({ trns: v })} options={TRNS_OPTIONS} />
        </div>

        <input
          type="text"
          className="mig-input"
          placeholder="No. Doc."
          aria-label="No. Doc."
          value={filtros.noDoc}
          onChange={(e) => onChange({ noDoc: e.target.value })}
        />
        <input
          type="text"
          className="mig-input"
          placeholder="Admisión"
          aria-label="Admisión"
          value={filtros.noAdmision}
          onChange={(e) => onChange({ noAdmision: e.target.value })}
        />
        <input
          type="text"
          className="mig-input"
          placeholder="Prestación"
          aria-label="Prestación"
          value={filtros.noPrestacion}
          onChange={(e) => onChange({ noPrestacion: e.target.value })}
        />

        <Button variant="secondary" size="sm" icon={LuRefreshCw} className="mig-refresh-btn">Refrescar</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `MovimientosToolbar.css`**

```css
.mig-toolbar{
  display:flex;flex-direction:column;gap:10px;
  padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.mig-toolbar-row{display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px;}

.mig-static-field{display:flex;align-items:center;gap:5px;flex-shrink:0;font-size:var(--fs-sm);}
.mig-static-field .lbl{color:var(--ink-500);}
.mig-static-field .val{color:var(--ink-900);font-weight:var(--fw-medium);}

.mig-filter-field{display:flex;align-items:center;gap:6px;flex-shrink:0;}
.mig-filter-field label{font-size:var(--fs-sm);color:var(--ink-700);white-space:nowrap;}
.mig-filter-field .form-select{min-width:130px;}

.mig-input{
  border:1px solid var(--border);border-radius:var(--radius);height:var(--input-sm);padding:0 10px;
  font-family:inherit;font-size:var(--fs-base);color:var(--ink-900);background:var(--bg);
  width:130px;flex-shrink:0;
}
.mig-input:focus{outline:2px solid var(--primary);outline-offset:1px;background:var(--surface);}

.mig-refresh-btn{margin-left:auto;flex-shrink:0;}

@media (max-width:1024px){
  .mig-toolbar-row{overflow-x:auto;flex-wrap:nowrap;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/MovimientosToolbar`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/MovimientosToolbar
git commit -m "$(cat <<'EOF'
Add MovimientosToolbar for Solicitudes de Insumos Farmacia

Dense multi-field toolbar replicating the legacy screen's filters (Tipo,
Tipo Artículo, Procedencia, Estado, Trns., No.Doc/Admisión/Prestación),
built with FormSelect/Button instead of native controls.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `MovimientosGrid`

**Files:**
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientosGrid/MovimientosGrid.jsx`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientosGrid/MovimientosGrid.css`

**Interfaces:**
- Consumes: `formatFecha` (Task 1), classes `.mig-grid`/`.mig-strong`/`.mig-num`/`.mig-ellipsis`/`.mig-bdg-dot` (Task 2).
- Produces: `MovimientosGrid({ movimientos: Movimiento[], selectedId: string|null, onSelect: (id:string)=>void })`.

- [ ] **Step 1: Create `MovimientosGrid.jsx`**

```jsx
'use client';

import './MovimientosGrid.css';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const COLUMNS = [
  'Bdg', 'Grupo', 'Consecutivo', 'No.Admisión', 'No.Prestación', 'Fecha', 'Hora',
  'Procedencia', 'Movimiento', 'Paciente', 'Ubicación', 'Id.Contrato',
];

// Réplica de la grilla principal de la pantalla legacy de referencia --
// mismo esqueleto .mig-grid/.mig-ellipsis/.mig-num que MovimientoItemsTable
// (ver Solicitudes/shared/shared.css), fila seleccionable con el mismo
// patrón de teclado/aria que FacturasGridClasica/AdmisionesTable.
export default function MovimientosGrid({ movimientos, selectedId, onSelect }) {
  function handleKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <div className="mig-grid-scroll">
      <table className="mig-grid">
        <thead>
          <tr>{COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr
              key={m.id}
              className={m.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(m.id)}
              onKeyDown={(e) => handleKeyDown(e, m.id)}
              tabIndex={0}
              aria-selected={m.id === selectedId}
            >
              <td><span className="mig-bdg-dot" style={{ background: m.bodegaColor }} title={`Bodega ${m.bdg}`} /></td>
              <td>{m.grupo}</td>
              <td className="mig-strong">{m.consecutivo}</td>
              <td>{m.noAdmision}</td>
              <td>{m.noPrestacion}</td>
              <td>{formatFecha(m.fecha)}</td>
              <td>{m.hora}</td>
              <td>{m.procedencia}</td>
              <td>{m.movimiento}</td>
              <td className="mig-ellipsis" title={m.paciente}>{m.paciente}</td>
              <td className="mig-ellipsis" title={m.ubicacion}>{m.ubicacion}</td>
              <td className="mig-num">{m.idContrato}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {movimientos.length === 0 && (
        <div className="mig-grid-empty">No hay movimientos que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `MovimientosGrid.css`**

```css
/* .mig-grid/.mig-strong/.mig-num/.mig-ellipsis/.mig-bdg-dot: definidas en
   ../shared/shared.css. */
.mig-grid-scroll{flex:1;min-height:0;overflow:auto;}

.mig-grid-empty{padding:32px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/MovimientosGrid`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/MovimientosGrid
git commit -m "$(cat <<'EOF'
Add MovimientosGrid for Solicitudes de Insumos Farmacia

Selectable, scrollable table of inventory movements replicating the legacy
screen's columns (Bdg/Grupo/Consecutivo/Admisión/Prestación/Fecha/Hora/
Procedencia/Movimiento/Paciente/Ubicación/Id.Contrato).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `MovimientoAccionesPanel`

**Files:**
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientoAccionesPanel/MovimientoAccionesPanel.jsx`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientoAccionesPanel/MovimientoAccionesPanel.css`

**Interfaces:**
- Consumes: `@/Components/Button/Button`.
- Produces: `MovimientoAccionesPanel({ hasSelection: boolean })`.

- [ ] **Step 1: Create `MovimientoAccionesPanel.jsx`**

```jsx
'use client';

import './MovimientoAccionesPanel.css';
import Button from '@/Components/Button/Button';
import {
  LuUndo2, LuBan, LuPrinter, LuPlus, LuPencil,
} from 'react-icons/lu';

// Panel de acciones lateral fijo junto a la grilla -- primer uso de este
// patrón en el proyecto (encargo explícito, réplica de la pantalla legacy
// de referencia). V1 es visual-only: sin onClick con efectos reales (sin
// modales de Nuevo/Editar/Reversar/Anular todavía, ver spec). "Reversar"
// queda deshabilitado siempre, igual que en la referencia; el resto se
// deshabilita solo cuando no hay ningún movimiento seleccionado. "Editar"
// usa variant="primary" para marcarla como la acción resaltada/activa de la
// captura de referencia -- no implica que sea la acción por defecto, solo
// replica el estilo visual.
export default function MovimientoAccionesPanel({ hasSelection }) {
  return (
    <div className="mig-acciones-panel">
      <Button variant="secondary" icon={LuUndo2} disabled>Reversar</Button>
      <Button variant="danger-outline" icon={LuBan} disabled={!hasSelection}>Anular</Button>
      <Button variant="secondary" icon={LuPrinter} disabled={!hasSelection}>Imprimir</Button>
      <Button variant="outline" icon={LuPlus}>Nuevo</Button>
      <Button variant="primary" icon={LuPencil} disabled={!hasSelection}>Editar</Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `MovimientoAccionesPanel.css`**

```css
.mig-acciones-panel{
  flex-shrink:0;width:152px;
  display:flex;flex-direction:column;gap:8px;
  padding:12px;border-left:1px solid var(--border);
}
.mig-acciones-panel button{width:100%;justify-content:flex-start;}

@media (max-width:1024px){
  .mig-acciones-panel{
    width:auto;flex-direction:row;flex-wrap:wrap;
    border-left:none;border-top:1px solid var(--border);
  }
  .mig-acciones-panel button{width:auto;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/MovimientoAccionesPanel`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/MovimientoAccionesPanel
git commit -m "$(cat <<'EOF'
Add MovimientoAccionesPanel for Solicitudes de Insumos Farmacia

Vertical action column (Reversar/Anular/Imprimir/Nuevo/Editar) next to the
grid — visual-only in V1, no modals or mutation logic yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `MovimientoDetalle` + `MovimientoItemsTable`

**Files:**
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientoDetalle/MovimientoDetalle.jsx`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientoDetalle/MovimientoDetalle.css`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientoDetalle/MovimientoItemsTable/MovimientoItemsTable.jsx`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientoDetalle/MovimientoItemsTable/MovimientoItemsTable.css`

**Interfaces:**
- Consumes: `formatMoneda` (Task 1), `@/Components/Button/Button`, classes `.mig-grid`/`.mig-num`/`.mig-detail-empty` (Task 2).
- Produces: `MovimientoItemsTable({ articulos: Articulo[] })`. `MovimientoDetalle({ movimiento: Movimiento|null })` — the parent must remount this component on selection change via `key={movimiento?.id ?? 'none'}` so its internal `activeTab` state resets to `'detalle'` automatically (no manual reset logic needed inside).

- [ ] **Step 1: Create `MovimientoItemsTable.jsx`**

```jsx
'use client';

import './MovimientoItemsTable.css';
import { formatMoneda } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const COLUMNS = [
  'Item', 'Código', 'Descripción', 'Marca', 'Bdg', 'Cant. Solicitada', 'Cant. Entregada',
  'Costo Unidad Anterior', 'Costo Unidad', 'Costo Unidad Desc.', 'Costo Unidad Neto',
  'Costo Total Unidad', 'Costo Total Desc.', 'Costo Total Neto',
  'IVA %', 'IVA Unitario', 'IVA Total',
];

// Tabla de artículos del movimiento seleccionado -- reusa el mismo esqueleto
// .mig-grid/.mig-num que MovimientosGrid (ver Solicitudes/shared/shared.css)
// con las columnas propias de este dominio (cantidad solicitada/entregada,
// costo unidad/total, IVA), análoga a FacturaItemsTable de Facturación.
export default function MovimientoItemsTable({ articulos }) {
  return (
    <div className="mig-items-scroll">
      <table className="mig-grid mig-items-grid">
        <thead>
          <tr>{COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {articulos.map((a) => (
            <tr key={a.item}>
              <td>{a.item}</td>
              <td>{a.codigo}</td>
              <td className="mig-ellipsis" title={a.descripcion}>{a.descripcion}</td>
              <td>{a.marca}</td>
              <td>{a.bdg}</td>
              <td className="mig-num">{a.cantidadSolicitada}</td>
              <td className="mig-num">{a.cantidadEntregada}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.anterior)}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.unidad)}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.descuento)}</td>
              <td className="mig-num">{formatMoneda(a.costoUnidad.neto)}</td>
              <td className="mig-num">{formatMoneda(a.costoTotal.unidad)}</td>
              <td className="mig-num">{formatMoneda(a.costoTotal.descuento)}</td>
              <td className="mig-num">{formatMoneda(a.costoTotal.neto)}</td>
              <td className="mig-num">{a.iva.porcentaje}</td>
              <td className="mig-num">{formatMoneda(a.iva.unitario)}</td>
              <td className="mig-num">{formatMoneda(a.iva.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Create `MovimientoItemsTable.css`**

```css
/* .mig-grid/.mig-num/.mig-ellipsis se resuelven en
   ../../shared/shared.css. */
.mig-items-scroll{overflow-x:auto;}
.mig-items-grid{font-size:var(--fs-sm);}
```

- [ ] **Step 3: Create `MovimientoDetalle.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './MovimientoDetalle.css';
import MovimientoItemsTable from './MovimientoItemsTable/MovimientoItemsTable';
import Button from '@/Components/Button/Button';

const TABS = [
  { id: 'detalle', label: 'Detalle' },
  { id: 'linea', label: 'Línea' },
  { id: 'prefijos', label: 'Prefijos' },
];

// El padre (Solicitudes.jsx) monta este componente con key={movimiento?.id}
// -- al cambiar de movimiento seleccionado, React lo desmonta/remonta,
// reseteando `activeTab` a 'detalle' automáticamente sin necesitar el truco
// "ajustar estado durante el render" de otras pantallas (más simple porque
// acá no hay más estado que compartir con el resto del árbol). Tabs "Línea"/
// "Prefijos" son placeholders sin contenido propio en V1 (ver spec).
export default function MovimientoDetalle({ movimiento }) {
  const [activeTab, setActiveTab] = useState('detalle');

  if (!movimiento) {
    return <div className="mig-detail-empty">Selecciona un movimiento en la tabla para ver su detalle.</div>;
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

  return (
    <div className="mig-detalle">
      <div className="mig-meta-bar">
        <div className="mig-meta-item">
          <span className="lbl">Fecha Contable:</span>
          <span className="val mig-meta-link">{movimiento.fechaContable}</span>
        </div>
        <div className="mig-meta-item">
          <span className="lbl">Confirmó:</span>
          <span className="val">{movimiento.confirmo || '—'}</span>
        </div>
        <div className="mig-meta-item">
          <span className="lbl">Fecha:</span>
          <span className="val">{movimiento.fecha}</span>
        </div>
        <label className="mig-meta-checkbox">
          <input type="checkbox" defaultChecked={movimiento.permitirEditarCostos} />
          Permitir editar costos?
        </label>
      </div>

      <div className="mig-tabs-bar" role="tablist" aria-label="Detalle del movimiento" onKeyDown={handleTabsKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`mig-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`mig-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mig-tab-body" role="tabpanel" id={`mig-panel-${activeTab}`}>
        {activeTab === 'detalle' && <MovimientoItemsTable articulos={movimiento.articulos} />}
        {activeTab !== 'detalle' && <div className="mig-tab-empty">Sin información disponible.</div>}
      </div>

      <div className="mig-detalle-actions">
        <Button variant="secondary" size="sm">Cambiar</Button>
        <Button variant="secondary" size="sm">Ver</Button>
        <Button variant="secondary" size="sm">Movimiento</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `MovimientoDetalle.css`**

```css
.mig-detalle{
  display:flex;flex-direction:column;gap:12px;
  border-top:1px solid var(--border);padding:16px;flex-shrink:0;
}

.mig-meta-bar{display:flex;align-items:center;flex-wrap:wrap;gap:10px 20px;}
.mig-meta-item{display:flex;align-items:baseline;gap:6px;font-size:var(--fs-base);}
.mig-meta-item .lbl{color:var(--ink-500);}
.mig-meta-item .val{color:var(--ink-900);font-weight:var(--fw-medium);}
.mig-meta-link{color:var(--primary);text-decoration:underline;cursor:pointer;}
.mig-meta-checkbox{display:flex;align-items:center;gap:6px;font-size:var(--fs-base);color:var(--ink-700);margin-left:auto;}

.mig-tabs-bar{display:flex;gap:4px;border-bottom:1px solid var(--border);}
.mig-tab{
  padding:8px 14px;border:none;background:none;cursor:pointer;font-family:inherit;
  font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-500);
  border-bottom:2px solid transparent;margin-bottom:-1px;
}
.mig-tab:hover{color:var(--ink-900);}
.mig-tab.active{color:var(--primary-dark);font-weight:var(--fw-semibold);border-bottom-color:var(--primary);}
.mig-tab:focus-visible{outline:2px solid var(--primary);outline-offset:2px;}

.mig-tab-body{min-height:0;}
.mig-tab-empty{padding:24px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);}

.mig-detalle-actions{display:flex;justify-content:flex-end;gap:8px;}

@media (max-width:768px){
  .mig-meta-checkbox{margin-left:0;}
}
```

- [ ] **Step 5: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/MovimientoDetalle`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/MovimientoDetalle
git commit -m "$(cat <<'EOF'
Add MovimientoDetalle and MovimientoItemsTable for Solicitudes de Insumos Farmacia

Metadata strip + Detalle/Línea/Prefijos tabs for the selected movement, with
the real items table only under "Detalle" (the other two tabs are V1
placeholders per the approved design).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `MovimientosTotalesFooter`

**Files:**
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientosTotalesFooter/MovimientosTotalesFooter.jsx`
- Create: `src/Components/InsumosFarmacia/Solicitudes/MovimientosTotalesFooter/MovimientosTotalesFooter.css`

**Interfaces:**
- Consumes: `formatMoneda` (Task 1).
- Produces: `MovimientosTotalesFooter({ totales: {costoConfirmado, cantidadConfirmado, costoSinConfirmar, cantidadSinConfirmar, totalIva} })` — pure presentational, all 5 fields are `number`.

- [ ] **Step 1: Create `MovimientosTotalesFooter.jsx`**

```jsx
'use client';

import './MovimientosTotalesFooter.css';
import { formatMoneda } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const CARDS = [
  { key: 'costoConfirmado', label: 'Ttl Costo Art. Confir.' },
  { key: 'cantidadConfirmado', label: 'Ttl Cant. Art. Confir.' },
  { key: 'costoSinConfirmar', label: 'Ttl Costo Art. Sin Confir.' },
  { key: 'cantidadSinConfirmar', label: 'Ttl Cant. Art. Sin Confir.' },
  { key: 'totalIva', label: 'Total IVA' },
];

// Pie de totales -- puramente presentacional, el particionamiento
// Confir./Sin Confir. por artículo.confirmado ya lo hace Solicitudes.jsx
// (ver Task 8) para que este componente no dependa del shape completo de
// Movimiento, solo de los 5 números ya agregados.
export default function MovimientosTotalesFooter({ totales }) {
  return (
    <div className="mig-footer">
      {CARDS.map((c) => (
        <div className="mig-total-card" key={c.key}>
          <span className="mig-total-label">{c.label}</span>
          <span className="mig-total-value">{formatMoneda(totales[c.key])}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `MovimientosTotalesFooter.css`**

```css
.mig-footer{
  display:flex;flex-wrap:wrap;gap:10px;
  border-top:1px solid var(--border);padding:14px 16px;flex-shrink:0;
}
.mig-total-card{
  flex:1;min-width:160px;
  display:flex;flex-direction:column;gap:4px;
  border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;background:var(--bg);
}
.mig-total-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.mig-total-value{font-size:var(--fs-lg);font-weight:var(--fw-bold);color:var(--ink-900);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/MovimientosTotalesFooter`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/MovimientosTotalesFooter
git commit -m "$(cat <<'EOF'
Add MovimientosTotalesFooter for Solicitudes de Insumos Farmacia

5-card totals strip (cost/quantity confirmado & sin confirmar, total IVA),
purely presentational — receives already-aggregated numbers.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Orchestrator — rewire `Solicitudes.jsx`

**Files:**
- Modify: `src/Components/InsumosFarmacia/Solicitudes/Solicitudes.jsx`

**Interfaces:**
- Consumes: `MovimientosToolbar` (3), `MovimientosGrid` (4), `MovimientoAccionesPanel` (5), `MovimientoDetalle` (6), `MovimientosTotalesFooter` (7), `MOVIMIENTOS` (1), `shared/shared.css` (2).
- Produces: the page's default export, unchanged signature (`Solicitudes()`, no props) — still mounted by `src/app/insumos-farmacia/solicitudes/page.jsx` (no changes needed there).

- [ ] **Step 1: Replace `Solicitudes.jsx`'s content**

```jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import './Solicitudes.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import MovimientosToolbar from './MovimientosToolbar/MovimientosToolbar';
import MovimientosGrid from './MovimientosGrid/MovimientosGrid';
import MovimientoAccionesPanel from './MovimientoAccionesPanel/MovimientoAccionesPanel';
import MovimientoDetalle from './MovimientoDetalle/MovimientoDetalle';
import MovimientosTotalesFooter from './MovimientosTotalesFooter/MovimientosTotalesFooter';
import { MOVIMIENTOS } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const FILTROS_INICIALES = {
  tipo: 'debito', tipoArticulo: 'todos', procedencia: 'todos', estado: 'sin-confirmar', trns: 'sal',
  noDoc: '', noAdmision: '', noPrestacion: '',
};

function movimientoCoincide(m, filtros) {
  if (m.tipo !== filtros.tipo) return false;
  if (filtros.tipoArticulo !== 'todos' && m.tipoArticulo !== filtros.tipoArticulo) return false;
  if (filtros.procedencia !== 'todos' && m.procedenciaTipo !== filtros.procedencia) return false;
  if (filtros.estado !== 'todos' && m.estado !== filtros.estado) return false;
  if (m.trns !== filtros.trns) return false;
  if (filtros.noDoc && !m.consecutivo.toLowerCase().includes(filtros.noDoc.trim().toLowerCase())) return false;
  if (filtros.noAdmision && !m.noAdmision.includes(filtros.noAdmision.trim())) return false;
  if (filtros.noPrestacion && !m.noPrestacion.includes(filtros.noPrestacion.trim())) return false;
  return true;
}

function sumBy(list, pick) {
  return list.reduce((acc, item) => acc + pick(item), 0);
}

// Réplica de "Catálogo Movimiento De Inventario Salidas Asistenciales"
// (Módulo Contable -> Insumos Farmacia -> Solicitudes), construida con los
// componentes/tokens de este proyecto -- mismo criterio que
// FacturaVistaClasica: toolbar denso + grilla + detalle, filtrado 100% en
// memoria sobre el array mock (sin fetch simulado, ver mockSolicitudesData.js).
export default function Solicitudes() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [selectedId, setSelectedId] = useState(null);

  const movimientos = useMemo(
    () => MOVIMIENTOS.filter((m) => movimientoCoincide(m, filtros)),
    [filtros],
  );

  // Sin useState/useEffect: si la selección actual ya no está en la lista
  // filtrada (o todavía no hay ninguna), cae a la primera fila visible --
  // mismo patrón "siempre hay algo seleccionado" que FacturaVistaClasica.
  const effectiveSelectedId = movimientos.some((m) => m.id === selectedId) ? selectedId : (movimientos[0]?.id ?? null);
  const selectedMovimiento = movimientos.find((m) => m.id === effectiveSelectedId) ?? null;

  const totales = useMemo(() => {
    const articulos = selectedMovimiento?.articulos ?? [];
    const confirmados = articulos.filter((a) => a.confirmado);
    const sinConfirmar = articulos.filter((a) => !a.confirmado);
    return {
      costoConfirmado: sumBy(confirmados, (a) => a.costoTotal.neto),
      cantidadConfirmado: sumBy(confirmados, (a) => a.cantidadEntregada),
      costoSinConfirmar: sumBy(sinConfirmar, (a) => a.costoTotal.neto),
      cantidadSinConfirmar: sumBy(sinConfirmar, (a) => a.cantidadEntregada),
      totalIva: sumBy(articulos, (a) => a.iva.total),
    };
  }, [selectedMovimiento]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Insumos Farmacia"
          page="Solicitudes"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="card">
            <div className="mig-shell">
              <MovimientosToolbar filtros={filtros} onChange={(patch) => setFiltros((f) => ({ ...f, ...patch }))} />

              <div className="mig-body">
                <MovimientosGrid movimientos={movimientos} selectedId={effectiveSelectedId} onSelect={setSelectedId} />
                <MovimientoAccionesPanel hasSelection={!!selectedMovimiento} />
              </div>

              <MovimientoDetalle key={effectiveSelectedId ?? 'none'} movimiento={selectedMovimiento} />

              <MovimientosTotalesFooter totales={totales} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add the `.mig-shell`/`.mig-body` layout rules to `Solicitudes.css`**

Append to the end of `src/Components/InsumosFarmacia/Solicitudes/Solicitudes.css`:

```css
.mig-shell{display:flex;flex-direction:column;flex:1;min-height:0;}
.mig-body{display:flex;flex:1;min-height:0;}

/* Bajo --bp-desktop (1024px, ver AGENTS.md "Responsive / Breakpoints"):
   .mig-body pasa de fila a columna para que MovimientoAccionesPanel (que ya
   cambia a fila horizontal de botones en su propio CSS, ver
   MovimientoAccionesPanel.css) quede apilado debajo de la grilla con el
   ancho completo, en vez de angostarla compitiendo por espacio horizontal. */
@media (max-width:1024px){
  .mig-body{flex-direction:column;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/InsumosFarmacia/Solicitudes/Solicitudes.jsx`
Expected: no errors. (`LuPill`/`UnderConstruction` imports are gone now — if ESLint flags an unused import, it means Step 1's replacement wasn't applied cleanly; re-check the file matches Step 1 exactly.)

- [ ] **Step 4: Manual verification with the dev server**

Run: `npm run dev` (leave it running), then open `http://localhost:3000/insumos-farmacia/solicitudes` in a browser (or via a headless check) and verify:

1. The page no longer shows "en desarrollo" — it shows the toolbar, grid, action panel, detail, and totals footer.
2. 5 movimientos are visible by default (`0200203069-2`, `0200203068`, `0200203066`, `0200203065-1`, `0200203064`) — the other 2 (`0200203063-1`, `0200203056-2`) are filtered out by the default `estado: 'sin-confirmar'`/`trns: 'sal'` filters.
3. The first row (`0200203069-2`) is selected by default; the detail panel shows its 2 articulos (Acetaminofén/Amikacina) and the totals footer shows `0.00` in all 5 cards (both articulos have zero cost).
4. Click row `0200203068` (UNICIA GOKU) — the detail panel updates to its 2 articulos, and the totals footer now shows: Ttl Costo Art. Confir. `8,500.00`, Ttl Cant. Art. Confir. `10.00`, Ttl Costo Art. Sin Confir. `7,560.00`, Ttl Cant. Art. Sin Confir. `18.00`, Total IVA `1,436.40`.
5. Change "Estado" to "Confirmado" (the only field `0200203063-1` deviates on from the default filters) — the grid now shows only `0200203063-1` (AGUSTU JULIO JULIO); the previously selected row is gone and selection falls back to this one automatically (no console error, no stuck "selected" row). Its detail panel shows "Confirmó: ROJAS MENDEZ PAOLA" and the "Permitir editar costos?" checkbox pre-checked.
6. Change "Tipo" to "Credito" (keep "Estado" on "Confirmado") — the grid shows the empty-state message ("No hay movimientos que coincidan con los filtros seleccionados."), since no seeded movimiento uses `tipo: 'credito'`. This exercises `MovimientosGrid`'s empty-state branch.
7. Reset "Tipo" to "Debito" and "Estado" to "Sin Confirmar", then change "Trns." to "ENT" — the grid now shows only `0200203056-2` (DE LA ESPRIELLA PARRA ALFONSO).
8. Reset "Trns." to "SAL" and change "Tipo Artículo" to "Insumo" — only `0200203065-1` (DIAZ GONZALEZ JOSE CARLOS) remains.
9. In the detail panel, click the "Línea" tab — shows "Sin información disponible." Click "Prefijos" — same. Click "Detalle" — the items table is back. Arrow-Right/Arrow-Left from a focused tab moves focus and selection between the 3 tabs.
10. In the action panel: "Reversar" is disabled at all times; "Anular"/"Imprimir"/"Editar" are enabled whenever a row is selected (which is always, given the fallback-to-first-row behavior); "Nuevo" is always enabled.
11. Resize the browser to ~800px wide (tablet range, between `--bp-tablet` 768px and `--bp-desktop` 1024px): the toolbar rows scroll horizontally instead of wrapping into a taller block, the main grid keeps its own horizontal scroll, and the action panel switches from a right-hand column to a horizontal row of buttons above/below the grid — no horizontal scrollbar appears on the page body itself.

If any check fails, fix the relevant component from Tasks 1–7 (not just this file) and re-run the checklist from the top before moving on.

- [ ] **Step 5: Commit**

```bash
git add src/Components/InsumosFarmacia/Solicitudes/Solicitudes.jsx src/Components/InsumosFarmacia/Solicitudes/Solicitudes.css
git commit -m "$(cat <<'EOF'
Wire up Solicitudes de Insumos Farmacia screen

Replaces the "en desarrollo" placeholder with the full replica: toolbar,
grid, actions panel, movement detail with tabs, and totals footer — all
filtering client-side over the new mock dataset, no backend yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
