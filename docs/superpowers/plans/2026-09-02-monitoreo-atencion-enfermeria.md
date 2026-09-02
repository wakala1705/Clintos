# Monitoreo (Atención de Enfermería) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate the existing disabled "Monitoreo" tab in Atención de Enfermería with two working subtabs — Hoja de medicamentos (read-only historical dose log) and Signos vitales (manual vitals log with table/chart views).

**Architecture:** Pure React (state/props/hooks) mounted into the existing imperative tab shell (`legacy-app.js`) at its two existing generic extension points — `.card-tab`/`.tab-panel` (main tabs) and `.subnav-bar`/`.sub-panel` (subtabs) — both already handle any matching DOM elements found at mount time, so no changes to `legacy-app.js` itself are needed. Two new shared components (`ClinicalStatusBadge`, `ViewToggle`) are added to `GestionEnfermeria/shared/` for reuse; a new npm dependency (`recharts`) renders the multi-parameter vitals chart.

**Tech Stack:** Next.js (App Router), React 19, plain CSS (project design tokens in `globals.css` / `GestionEnfermeria/shared/shared.css`), `react-icons/lu` (Lucide icons), Recharts (new).

**Spec:** `docs/superpowers/specs/2026-09-02-monitoreo-atencion-enfermeria-design.md`

## Global Constraints

- One component = one folder containing exactly `ComponentName.jsx` + `ComponentName.css` (import the CSS from the JSX file itself).
- No native `<select>` inside a `.form-field` — use `@/Components/FormSelect/FormSelect` (`onChange` receives the raw value, not an event).
- Every modal header uses `@/Components/ModalHeader/ModalHeader` — never a hand-rolled `.modal-header`.
- Buttons use `@/Components/Button/Button` (`variant`/`size`/`icon`/`disabled`/`onClick`), not raw `<button className="btn ...">`.
- Icons: `react-icons/lu` (`Lu*` components) only — no hand-written `<svg>`. All icons used in this plan (`LuActivity`, `LuDownload`, `LuList`, `LuChartLine`, `LuPlus`, `LuCalendar`, `LuChevronDown`) are confirmed present in `node_modules/react-icons/lu/index.mjs`.
- Font sizes/weights only via `--fs-*`/`--fw-*` tokens (`src/app/globals.css`) — never a raw px `font-size` or numeric `font-weight`.
- No new colors: reuse existing tokens already declared in `GestionEnfermeria/shared/shared.css` (`--green`/`--green-bg`, `--amber`/`--amber-bg`/`--amber-fg`, `--red`/`--red-bg`, `--gray-bg`, `--ink-500`, `--orange`, `--blue`, `--violet-fg`, `--cyan`).
- No automated test runner exists in this project (only ESLint, `eslint.config.mjs` → `eslint-config-next/core-web-vitals`). Verification per task is `npm run lint` (must pass with zero errors) plus, where noted, a manual check with `npm run dev` in the browser — there is no unit-test framework to add tests to, and installing one is out of scope for this feature.
- Global toast: `window.ncToast?.('message')` (optional-chained; used by other pure-React components in this feature, e.g. `TareasEnfermeria.jsx:85,91,118,141`) — use this for any placeholder/confirmation feedback, never `window.alert`.

---

### Task 1: Mock data + injectable abnormality function

**Files:**
- Create: `src/hooks/GestionEnfermeria/mockMonitoreo.js`
- Create: `src/hooks/GestionEnfermeria/vitalAbnormality.js`

**Interfaces:**
- Produces: `HOJA_MEDICAMENTOS: Array<{ id, medicamento: {nombre, dosis, via, frecuencia}, programado, real, administradoPor, estado: 'administered'|'incident'|'suspended', nota, turno: 'manana'|'tarde'|'noche' }>`
- Produces: `VITALES_READINGS: Array<{ id, fecha, hora, tas, tad, tam, fr, pulso, temp, satO2, tomadoPor, observacion, areaFuncional }>`
- Produces: `isVitalAbnormal(paramKey: string, value: number|null, patientProfile: object): boolean`

- [ ] **Step 1: Create the mock data file**

`src/hooks/GestionEnfermeria/mockMonitoreo.js`:

```js
// Datos mock de la pantalla Monitoreo (Atención de Enfermería) — sin
// persistencia real, ver docs/superpowers/specs/2026-09-02-monitoreo-atencion-enfermeria-design.md.

export const HOJA_MEDICAMENTOS = [
  {
    id: 'hm-1',
    medicamento: { nombre: 'Paracetamol', dosis: '500 mg', via: 'VO', frecuencia: 'c/8h' },
    programado: '08:00',
    real: '08:05',
    administradoPor: 'Marcela Ríos',
    estado: 'administered',
    nota: null,
    turno: 'manana',
  },
  {
    id: 'hm-2',
    medicamento: { nombre: 'Ondansetrón', dosis: '4 mg', via: 'IV', frecuencia: 'c/8h' },
    programado: '10:00',
    real: null,
    administradoPor: null,
    estado: 'incident',
    nota: 'Paciente presentó náuseas antes de la administración.',
    turno: 'manana',
  },
  {
    id: 'hm-3',
    medicamento: { nombre: 'Dexametasona', dosis: '4 mg', via: 'IV', frecuencia: 'c/12h' },
    programado: '06:00',
    real: '06:10',
    administradoPor: 'Marcela Ríos',
    estado: 'administered',
    nota: null,
    turno: 'manana',
  },
  {
    id: 'hm-4',
    medicamento: { nombre: 'Morfina', dosis: '2 mg', via: 'IV', frecuencia: 'c/6h' },
    programado: '12:00',
    real: null,
    administradoPor: null,
    estado: 'suspended',
    nota: 'Suspendido por orden médica — dolor controlado.',
    turno: 'tarde',
  },
  {
    id: 'hm-5',
    medicamento: { nombre: 'Enoxaparina', dosis: '40 mg', via: 'SC', frecuencia: 'c/24h' },
    programado: '20:00',
    real: '20:05',
    administradoPor: 'Julián Pardo',
    estado: 'administered',
    nota: null,
    turno: 'noche',
  },
];

export const VITALES_READINGS = [
  {
    id: 'vt-1',
    fecha: '2026-09-02',
    hora: '08:00',
    tas: 120, tad: 80, tam: 93, fr: 16, pulso: 78, temp: 36.8, satO2: 98,
    tomadoPor: 'Marcela Ríos',
    observacion: null,
    areaFuncional: 'Hospitalización',
  },
  {
    id: 'vt-2',
    fecha: '2026-09-02',
    hora: '12:00',
    tas: 150, tad: 95, tam: 113, fr: 18, pulso: 92, temp: 37.1, satO2: 96,
    tomadoPor: 'Marcela Ríos',
    observacion: 'Paciente refiere cefalea leve.',
    areaFuncional: 'Hospitalización',
  },
  {
    id: 'vt-3',
    fecha: '2026-09-02',
    hora: '16:00',
    tas: 118, tad: 76, tam: 90, fr: 15, pulso: 74, temp: 36.6, satO2: 91,
    tomadoPor: 'Julián Pardo',
    observacion: null,
    areaFuncional: 'Hospitalización',
  },
];
```

- [ ] **Step 2: Create the abnormality function**

`src/hooks/GestionEnfermeria/vitalAbnormality.js`:

```js
// Función inyectable (encargo explícito): hoy usa rangos fijos de
// referencia de adulto; la lógica clínica real (dependiente de
// patientProfile: edad, diagnóstico, etc.) se conecta después sin cambiar
// esta firma ni sus call sites — ver
// docs/superpowers/specs/2026-09-02-monitoreo-atencion-enfermeria-design.md.
const ADULT_RANGES = {
  tas: [90, 140],
  tad: [60, 90],
  tam: [70, 105],
  fr: [12, 20],
  pulso: [60, 100],
  temp: [36, 37.5],
  satO2: [95, 100],
};

export function isVitalAbnormal(paramKey, value, patientProfile) {
  void patientProfile; // no usado en el mock, reservado para la lógica real futura
  if (value == null || Number.isNaN(value)) return false;
  const range = ADULT_RANGES[paramKey];
  if (!range) return false;
  const [min, max] = range;
  return value < min || value > max;
}
```

- [ ] **Step 3: Verify both files load and behave correctly**

Run (from the repo root, no build step needed — plain ESM eval):

```bash
node --input-type=module -e "
import { HOJA_MEDICAMENTOS, VITALES_READINGS } from './src/hooks/GestionEnfermeria/mockMonitoreo.js';
import { isVitalAbnormal } from './src/hooks/GestionEnfermeria/vitalAbnormality.js';
console.assert(HOJA_MEDICAMENTOS.length === 5, 'HOJA_MEDICAMENTOS debe tener 5 filas');
console.assert(VITALES_READINGS.length === 3, 'VITALES_READINGS debe tener 3 filas');
console.assert(isVitalAbnormal('tas', 150, {}) === true, 'tas 150 debe ser anormal');
console.assert(isVitalAbnormal('tas', 120, {}) === false, 'tas 120 debe ser normal');
console.assert(isVitalAbnormal('satO2', 91, {}) === true, 'satO2 91 debe ser anormal');
console.log('OK');
"
```

Expected output: `OK` with no assertion failures printed above it.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors for the two new files.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/GestionEnfermeria/mockMonitoreo.js src/hooks/GestionEnfermeria/vitalAbnormality.js
git commit -m "feat(monitoreo): add mock data and injectable vital-abnormality function"
```

---

### Task 2: Shared components — `ClinicalStatusBadge` and `ViewToggle`

**Files:**
- Create: `src/Components/GestionEnfermeria/shared/ClinicalStatusBadge/ClinicalStatusBadge.jsx`
- Create: `src/Components/GestionEnfermeria/shared/ClinicalStatusBadge/ClinicalStatusBadge.css`
- Create: `src/Components/GestionEnfermeria/shared/ViewToggle/ViewToggle.jsx`
- Create: `src/Components/GestionEnfermeria/shared/ViewToggle/ViewToggle.css`

**Interfaces:**
- Produces: `<ClinicalStatusBadge status="administered"|"upcoming"|"incident"|"scheduled"|"suspended" />`
- Produces: `<ViewToggle view={string} onChange={(value: string) => void} options={Array<{value: string, label: string, icon: Component}>} />`

- [ ] **Step 1: Create `ClinicalStatusBadge.jsx`**

Reuses the existing `.dp-status-badge`/`.st-*`/`.dot` CSS already defined in `GestionEnfermeria/shared/shared.css:624-638` (dark-mode variant at `895-904`) — this component adds no new colors, only a reusable React wrapper around those classes so the 5 medication-dose states have one source of truth instead of being repeated ad hoc.

```jsx
import './ClinicalStatusBadge.css';

const STATUS_LABEL = {
  administered: 'Administrado',
  upcoming: 'Próximo',
  incident: 'Incidencia',
  scheduled: 'Programado',
  suspended: 'Suspendido',
};

// Envuelve las clases ya existentes .dp-status-badge/.st-*/.dot
// (GestionEnfermeria/shared/shared.css:624-638) en un componente propio —
// no define ningún color nuevo.
export default function ClinicalStatusBadge({ status }) {
  const label = STATUS_LABEL[status];
  return (
    <span className={`dp-status-badge st-${status}`}>
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Create `ClinicalStatusBadge.css`**

```css
/* Sin reglas propias: .dp-status-badge/.st-*/.dot ya viven en
   GestionEnfermeria/shared/shared.css (importado una vez desde
   AtencionEnfermeria.jsx) — este archivo existe solo para cumplir la
   convención de un .css por componente. */
```

- [ ] **Step 3: Create `ViewToggle.jsx`**

Same `.segmented-control`/`.segmented-btn` visual pattern already used by the Timeline/Lista toggle in `MedicamentosPanel.jsx:114-117`, but rendered directly in the controls row (no popover wrapper) — `options` is a prop (not hardcoded) so it can drive any 2-way (or N-way) toggle.

```jsx
export default function ViewToggle({ view, onChange, options }) {
  return (
    <div className="segmented-control">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={`segmented-btn${view === value ? ' active' : ''}`}
          aria-pressed={view === value}
          onClick={() => onChange(value)}
        >
          <Icon className="icon" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}
```

Note: `ViewToggle.jsx` does not `import './ViewToggle.css'` — `.segmented-control`/`.segmented-btn` already live in `GestionEnfermeria/shared/shared.css` (same source `MedicamentosPanel.jsx` already draws from). Still create the empty `.css` file per the one-folder convention.

- [ ] **Step 4: Create `ViewToggle.css`**

```css
/* Sin reglas propias: .segmented-control/.segmented-btn ya viven en
   GestionEnfermeria/shared/shared.css — este archivo existe solo para
   cumplir la convención de un .css por componente. */
```

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Components/GestionEnfermeria/shared/ClinicalStatusBadge src/Components/GestionEnfermeria/shared/ViewToggle
git commit -m "feat(monitoreo): add reusable ClinicalStatusBadge and ViewToggle components"
```

---

### Task 3: Activate the Monitoreo tab (navigation shell only)

Wires the tab into the app with placeholder content in each subtab, so the riskiest part (does the existing imperative tab/subnav wiring actually pick up new markup?) is verified in the browser before any real UI is built on top of it.

**Files:**
- Create: `src/Components/GestionEnfermeria/Monitoreo/Monitoreo.jsx`
- Create: `src/Components/GestionEnfermeria/Monitoreo/Monitoreo.css`
- Modify: `src/Components/GestionEnfermeria/AtencionEnfermeria/AtencionEnfermeria.jsx:25` (icon import already includes `LuActivity`, no change needed there), `:110-113`, `:120-122`

**Interfaces:**
- Produces: `<Monitoreo />` — self-contained `tab-panel` (id `panel-monitoreo`), mountable exactly like `<MedicamentosPanel />`/`<PedidosPanel />`/`<OrdenesMedicasPanel />`.

- [ ] **Step 1: Create `Monitoreo.jsx` with placeholder subtabs**

```jsx
import './Monitoreo.css';

// Shell del tab "Monitoreo": subnav Hoja de medicamentos/Signos vitales,
// mismo mecanismo genérico que ya usa PedidosPanel (legacy-app.js:882-910
// resuelve el show/hide de cualquier .subnav-bar/.sub-panel encontrado al
// montar — no hace falta tocar legacy-app.js). Contenido real de cada
// subtab llega en tareas siguientes de este plan.
export default function Monitoreo() {
  return (
    <div role="tabpanel" id="panel-monitoreo" aria-labelledby="tab-monitoreo" tabIndex="0" className="tab-panel">
      <div className="subnav-bar" role="tablist" aria-label="Secciones de monitoreo">
        <button type="button" className="subnav-tab active" role="tab" id="subtab-hoja-medicamentos" aria-selected="true" aria-controls="subpanel-hoja-medicamentos" tabIndex="0">
          Hoja de medicamentos
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-signos-vitales" aria-selected="false" aria-controls="subpanel-signos-vitales" tabIndex="-1">
          Signos vitales
        </button>
      </div>

      <div role="tabpanel" id="subpanel-hoja-medicamentos" aria-labelledby="subtab-hoja-medicamentos" tabIndex="0" className="sub-panel active">
        Hoja de medicamentos (en construcción)
      </div>
      <div role="tabpanel" id="subpanel-signos-vitales" aria-labelledby="subtab-signos-vitales" tabIndex="0" className="sub-panel">
        Signos vitales (en construcción)
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `Monitoreo.css`**

```css
/* Sin reglas propias todavía: .tab-panel/.subnav-bar/.subnav-tab/.sub-panel
   ya viven en GestionEnfermeria/shared/shared.css. Se completa en tareas
   siguientes si el layout del shell necesita algo propio. */
```

- [ ] **Step 3: Activate the tab button in `AtencionEnfermeria.jsx`**

In `src/Components/GestionEnfermeria/AtencionEnfermeria/AtencionEnfermeria.jsx`, replace lines 110-113 (the disabled Monitoreo button) with an enabled one shaped like `tab-medicamentos` (`:98`, the only currently-working reference with `aria-controls`):

```jsx
          <button type="button" className="card-tab" role="tab" id="tab-monitoreo" aria-selected="false" aria-controls="panel-monitoreo" tabIndex="-1">
            <LuActivity className="icon" aria-hidden="true" />
            Monitoreo
          </button>
```

(Removes `disabled`, `aria-disabled="true"`, and `title="Próximamente"`; adds `aria-controls="panel-monitoreo"`.)

- [ ] **Step 4: Import and mount `Monitoreo`**

Add near the top of `AtencionEnfermeria.jsx` (alongside the other panel imports, e.g. after the `PedidosPanel` import at line 10):

```jsx
import Monitoreo from '@/Components/GestionEnfermeria/Monitoreo/Monitoreo';
```

Then add `<Monitoreo />` next to the other panels (after `<PedidosPanel />` at line 121):

```jsx
        <MedicamentosPanel />
        <PedidosPanel />
        <OrdenesMedicasPanel />
        <Monitoreo />
```

- [ ] **Step 5: Manual verification in the browser**

Run: `npm run dev`, open the Atención de Enfermería screen (`/gestion-enfermeria/atencion/[id]`, any id).

Check:
1. "Monitoreo" tab is no longer greyed out / no longer shows the "Próximamente" tooltip.
2. Clicking it switches away from "Gestión de medicamentos" and shows "Hoja de medicamentos (en construcción)".
3. Keyboard: focus the tab row, press → repeatedly — Monitoreo receives focus/selection like the other tabs.
4. Inside Monitoreo, click "Signos vitales" — the panel switches to "Signos vitales (en construcción)" and back.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/Components/GestionEnfermeria/Monitoreo/Monitoreo.jsx src/Components/GestionEnfermeria/Monitoreo/Monitoreo.css src/Components/GestionEnfermeria/AtencionEnfermeria/AtencionEnfermeria.jsx
git commit -m "feat(monitoreo): activate the Monitoreo tab with placeholder subtabs"
```

---

### Task 4: `HojaMedicamentosTab` (real content, replaces the placeholder)

**Files:**
- Create: `src/Components/GestionEnfermeria/Monitoreo/HojaMedicamentosTab/HojaMedicamentosTab.jsx`
- Create: `src/Components/GestionEnfermeria/Monitoreo/HojaMedicamentosTab/HojaMedicamentosTab.css`
- Modify: `src/Components/GestionEnfermeria/Monitoreo/Monitoreo.jsx` (mount `HojaMedicamentosTab` instead of the placeholder text)

**Interfaces:**
- Consumes: `HOJA_MEDICAMENTOS` from `@/hooks/GestionEnfermeria/mockMonitoreo` (Task 1); `ClinicalStatusBadge` from `@/Components/GestionEnfermeria/shared/ClinicalStatusBadge/ClinicalStatusBadge` (Task 2); `FormSelect` from `@/Components/FormSelect/FormSelect`; `Button` from `@/Components/Button/Button`.
- Produces: `<HojaMedicamentosTab />` (no props — owns its own filter state).

- [ ] **Step 1: Create `HojaMedicamentosTab.jsx`**

```jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import './HojaMedicamentosTab.css';
import { HOJA_MEDICAMENTOS } from '@/hooks/GestionEnfermeria/mockMonitoreo';
import ClinicalStatusBadge from '@/Components/GestionEnfermeria/shared/ClinicalStatusBadge/ClinicalStatusBadge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { LuDownload } from 'react-icons/lu';

const RANGO_OPTIONS = [
  { value: 'estancia', label: 'Estancia completa' },
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Última semana' },
  { value: 'custom', label: 'Rango personalizado' },
];
const TURNO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];
const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'administered', label: 'Administrado' },
  { value: 'incident', label: 'Incidencia' },
  { value: 'suspended', label: 'Suspendido' },
];

// Vista histórica de solo lectura (a diferencia de Gestión de medicamentos,
// que es operativa) — default "Estancia completa" en vez de "Hoy". El
// filtro "Rango" no recorta HOJA_MEDICAMENTOS (dataset mock fijo, sin campo
// de fecha por fila) — queda cableado a UI/estado para cuando este módulo
// deje de ser un mock, mismo criterio que otras pantallas de este proyecto
// que documentan esa misma limitación de datos de prototipo.
export default function HojaMedicamentosTab() {
  const [rango, setRango] = useState('estancia');
  const [turno, setTurno] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filas = useMemo(
    () => HOJA_MEDICAMENTOS.filter(
      (f) => (turno === '' || f.turno === turno) && (estado === '' || f.estado === estado),
    ),
    [turno, estado],
  );

  return (
    <div role="tabpanel" id="subpanel-hoja-medicamentos" aria-labelledby="subtab-hoja-medicamentos" tabIndex="0" className="sub-panel active">
      <div className="filter-bar">
        <FormSelect id="hm-rango" value={rango} onChange={setRango} options={RANGO_OPTIONS} />
        <FormSelect id="hm-turno" value={turno} onChange={setTurno} options={TURNO_OPTIONS} placeholder="Turno" />
        <FormSelect id="hm-estado" value={estado} onChange={setEstado} options={ESTADO_OPTIONS} placeholder="Estado" />
        <div className="filter-spacer" />
        <Button
          variant="outline"
          icon={LuDownload}
          onClick={() => window.ncToast?.('Exportar / Imprimir: función en desarrollo.')}
        >
          Exportar / Imprimir
        </Button>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Programado</th>
              <th>Real</th>
              <th>Administrado por</th>
              <th>Estado</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {loading && [0, 1, 2].map((i) => (
              <tr key={`skeleton-${i}`}>
                <td colSpan={6}><span className="hm-skeleton-row" /></td>
              </tr>
            ))}
            {!loading && filas.map((f) => (
              <tr key={f.id}>
                <td>
                  <span className="cell-primary">{f.medicamento.nombre} {f.medicamento.dosis}</span>
                  <span className="cell-sub">{f.medicamento.via} · {f.medicamento.frecuencia}</span>
                </td>
                <td>{f.programado}</td>
                <td>{f.real ?? '—'}</td>
                <td>{f.administradoPor ?? '—'}</td>
                <td><ClinicalStatusBadge status={f.estado} /></td>
                <td className={f.nota ? undefined : 'cell-muted'}>{f.nota ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filas.length === 0 && (
          <div className="hm-empty-state">No hay registros para el rango y los filtros seleccionados.</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `HojaMedicamentosTab.css`**

```css
.hm-skeleton-row {
  display: block;
  height: 14px;
  width: 60%;
  border-radius: 4px;
  background: var(--gray-bg);
  animation: hm-skeleton-pulse 1.2s ease-in-out infinite;
}
@keyframes hm-skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .45; }
}
.hm-empty-state {
  padding: 32px 16px;
  text-align: center;
  color: var(--ink-500);
  font-size: var(--fs-base);
}
```

- [ ] **Step 3: Mount it in `Monitoreo.jsx`**

Replace the placeholder `div#subpanel-hoja-medicamentos` in `Monitoreo.jsx` with the real component (add the import, then swap the JSX):

```jsx
import HojaMedicamentosTab from './HojaMedicamentosTab/HojaMedicamentosTab';
```

```jsx
      <HojaMedicamentosTab />
      <div role="tabpanel" id="subpanel-signos-vitales" aria-labelledby="subtab-signos-vitales" tabIndex="0" className="sub-panel">
        Signos vitales (en construcción)
      </div>
```

(`HojaMedicamentosTab` now owns its own `id="subpanel-hoja-medicamentos"`/`className="sub-panel active"` wrapper, so it fully replaces the old placeholder `<div>`.)

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, navigate to Atención de Enfermería → Monitoreo → Hoja de medicamentos.

Check:
1. Table shows 5 rows by default (Rango = "Estancia completa", Turno/Estado = "Todos"), each with the correct badge color/label (green "Administrado", red "Incidencia", gray "Suspendido").
2. Setting Turno to "Tarde" shows only the Morfina row; setting Estado to "Incidencia" shows only the Ondansetrón row.
3. Combine filters to a set with no matches (e.g. Turno "Noche" + Estado "Incidencia") — empty-state message appears instead of an empty table.
4. On initial mount/refresh, a brief skeleton-row flash is visible before the real rows render.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Components/GestionEnfermeria/Monitoreo/HojaMedicamentosTab src/Components/GestionEnfermeria/Monitoreo/Monitoreo.jsx
git commit -m "feat(monitoreo): implement Hoja de medicamentos read-only subtab"
```

---

### Task 5: `DateRangeChips` (standalone)

**Files:**
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/DateRangeChips/DateRangeChips.jsx`
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/DateRangeChips/DateRangeChips.css`

**Interfaces:**
- Produces: `<DateRangeChips value={{mode: 'hoy'|'semana'|'custom', desde: string|null, hasta: string|null}} onChange={(next) => void} />`

- [ ] **Step 1: Create `DateRangeChips.jsx`**

Same markup/classes as the Hoy/Última semana + custom-range popover already used in `MedicamentosPanel.jsx:42-70` (`.chip-group.segmented`, `.filter-popover-wrap`, `.date-picker-btn`, `.filter-popover`, `.fp-date-row`, `.fp-actions`), reimplemented in plain React state — no `legacy-app.js` involved. Click-outside/Escape handling mirrors `GestionCamas/ViewToggle/ViewToggle.jsx:14-32`.

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import './DateRangeChips.css';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

export default function DateRangeChips({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [desde, setDesde] = useState(value.desde ?? '');
  const [hasta, setHasta] = useState(value.hasta ?? '');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
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

  const label = value.mode === 'custom' && value.desde && value.hasta
    ? `${value.desde} – ${value.hasta}`
    : 'Rango personalizado';

  return (
    <>
      <div className="chip-group segmented">
        <button
          type="button"
          className={`chip-filter${value.mode === 'hoy' ? ' active' : ''}`}
          aria-pressed={value.mode === 'hoy'}
          onClick={() => onChange({ mode: 'hoy', desde: null, hasta: null })}
        >
          Hoy
        </button>
        <button
          type="button"
          className={`chip-filter${value.mode === 'semana' ? ' active' : ''}`}
          aria-pressed={value.mode === 'semana'}
          onClick={() => onChange({ mode: 'semana', desde: null, hasta: null })}
        >
          Última semana
        </button>
      </div>

      <div className="filter-popover-wrap" ref={rootRef}>
        <button
          type="button"
          className="date-picker-btn"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <LuCalendar className="icon" aria-hidden="true" />
          <span>{label}</span>
          <LuChevronDown className="icon chev" aria-hidden="true" />
        </button>

        {open && (
          <div className="filter-popover open" role="dialog" aria-label="Seleccionar rango de fechas">
            <div className="fp-title">Seleccionar rango de fechas</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="svt-date-from">Desde</label>
                <input id="svt-date-from" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="fp-date-field">
                <label htmlFor="svt-date-to">Hasta</label>
                <input id="svt-date-to" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>
            <div className="fp-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setDesde(''); setHasta(''); }}
              >
                Limpiar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { onChange({ mode: 'custom', desde, hasta }); setOpen(false); }}
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Create `DateRangeChips.css`**

```css
/* Sin reglas propias: .chip-group/.chip-filter/.filter-popover-wrap/
   .date-picker-btn/.filter-popover/.fp-date-row/.fp-actions ya viven en
   GestionEnfermeria/shared/shared.css. Este archivo existe solo para
   cumplir la convención de un .css por componente. */
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/DateRangeChips
git commit -m "feat(monitoreo): add DateRangeChips control for Signos vitales"
```

---

### Task 6: Recharts + `vitalParams.js` + `VitalesChart`

**Files:**
- Modify: `package.json` (add `recharts` dependency)
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/vitalParams.js`
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/VitalesChart/VitalesChart.jsx`
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/VitalesChart/VitalesChart.css`

**Interfaces:**
- Produces: `VITAL_PARAMS: Array<{key: 'tas'|'tad'|'tam'|'fr'|'pulso'|'temp'|'satO2', label: string, color: string}>` (single source of truth for labels/colors, consumed by both the chart and the table/chips in Task 8).
- Produces: `<VitalesChart readings={VITALES_READINGS-shape array} activeParams={string[]} />`

- [ ] **Step 1: Install Recharts**

Run: `npm install recharts`

This is the project's first charting dependency (previously all charts were hand-rolled SVG, e.g. `TendenciaChart.jsx`) — needed here because the vitals chart must overlay several simultaneously-selected series with independent scales, which is impractical to hand-roll well.

If npm reports an `ERESOLVE` peer-dependency conflict (the project runs React 19; some `recharts` releases pin an older React peer range), re-run as `npm install recharts --legacy-peer-deps`. Only use that flag if the plain install actually fails — don't add it preemptively.

- [ ] **Step 2: Verify the install**

Run: `npm run dev` and confirm the dev server still boots with no errors (a bad install would fail module resolution immediately). Stop the server after confirming.

- [ ] **Step 3: Create `vitalParams.js`**

```js
// Única fuente de verdad para label/color de los 7 parámetros de signos
// vitales — la usan tanto VitalesChart (líneas) como SignosVitalesTab
// (chips selectores y encabezados de tabla), para que ninguno de los tres
// pueda desalinearse. Colores: tokens ya existentes en
// GestionEnfermeria/shared/shared.css:16-65, ninguno nuevo.
export const VITAL_PARAMS = [
  { key: 'tas', label: 'T.A.S.', color: 'var(--red)' },
  { key: 'tad', label: 'T.A.D.', color: 'var(--orange)' },
  { key: 'tam', label: 'T.A.M.', color: 'var(--amber)' },
  { key: 'fr', label: 'F.R.', color: 'var(--blue)' },
  { key: 'pulso', label: 'Pulso', color: 'var(--violet-fg)' },
  { key: 'temp', label: 'Temp.', color: 'var(--cyan)' },
  { key: 'satO2', label: 'Sat. O2', color: 'var(--green)' },
];
```

- [ ] **Step 4: Create `VitalesChart.jsx`**

```jsx
'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import './VitalesChart.css';
import { VITAL_PARAMS } from '../vitalParams';

// Un <YAxis hide> por parámetro activo en vez de un solo eje compartido:
// T.A.S. (~120) y Temp. (~37) tienen escalas incompatibles, así que cada
// serie se autoescala a su propio rango visible en vez de aplastar a las
// demás. El tooltip sigue mostrando el valor real de cada serie (no hace
// falta normalizar los datos).
export default function VitalesChart({ readings, activeParams }) {
  const data = readings.map((r) => ({ ...r, etiqueta: `${r.hora}` }));
  const activos = VITAL_PARAMS.filter((p) => activeParams.includes(p.key));

  return (
    <div className="vch-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="etiqueta" stroke="var(--ink-500)" fontSize={12} />
          {activos.map((p) => (
            <YAxis key={p.key} yAxisId={p.key} hide domain={['auto', 'auto']} />
          ))}
          <Tooltip />
          {activos.map((p) => (
            <Line
              key={p.key}
              yAxisId={p.key}
              dataKey={p.key}
              name={p.label}
              stroke={p.color}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Create `VitalesChart.css`**

```css
.vch-wrap {
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
}
```

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/vitalParams.js src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/VitalesChart
git commit -m "feat(monitoreo): add Recharts-based multi-series VitalesChart"
```

---

### Task 7: `RegistrarSignosVitalesModal`

**Files:**
- Create: `src/Components/GestionEnfermeria/Monitoreo/modals/RegistrarSignosVitalesModal/RegistrarSignosVitalesModal.jsx`
- Create: `src/Components/GestionEnfermeria/Monitoreo/modals/RegistrarSignosVitalesModal/RegistrarSignosVitalesModal.css`

**Interfaces:**
- Consumes: `ModalHeader` (`@/Components/ModalHeader/ModalHeader`), `Button` (`@/Components/Button/Button`).
- Produces: `<RegistrarSignosVitalesModal onClose={() => void} onConfirm={(reading: {fecha, hora, tas, tad, tam, fr, pulso, temp, satO2, tomadoPor, observacion, areaFuncional}) => void} registradoPor={string} />`

- [ ] **Step 1: Create `RegistrarSignosVitalesModal.jsx`**

T.A.S./T.A.D. drive a live-computed, non-editable T.A.M. (`(tas + 2*tad) / 3`, rounded) using the existing `.tf-readonly-value` read-only-field pattern (`GestionEnfermeria/shared/shared.css:714-717`) — same pattern reused for "Registrado por". Field grid/overlay classes mirror `CompleteVitalsModal.jsx` (a different, 4-field modal in `TareasEnfermeria` — not reused directly, see spec's "Contexto" section on why these are two separate modals).

```jsx
'use client';

import { useState } from 'react';
import './RegistrarSignosVitalesModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuActivity } from 'react-icons/lu';

function horaActual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function RegistrarSignosVitalesModal({ onClose, onConfirm, registradoPor }) {
  const [form, setForm] = useState({
    hora: horaActual(), tas: '', tad: '', fr: '', pulso: '', temp: '', satO2: '', observacion: '',
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const tasNum = Number(form.tas);
  const tadNum = Number(form.tad);
  const tam = form.tas !== '' && form.tad !== ''
    ? Math.round((tasNum + 2 * tadNum) / 3)
    : null;

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({
      fecha: new Date().toISOString().slice(0, 10),
      hora: form.hora,
      tas: tasNum,
      tad: tadNum,
      tam,
      fr: Number(form.fr),
      pulso: Number(form.pulso),
      temp: Number(form.temp),
      satO2: Number(form.satO2),
      tomadoPor: registradoPor,
      observacion: form.observacion || null,
      areaFuncional: 'Hospitalización',
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card rsv-modal-card" role="dialog" aria-modal="true" aria-labelledby="rsv-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuActivity}
            tone="primary"
            title="Registrar signos vitales"
            titleId="rsv-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rsv-grid">
              <div className="form-field">
                <label htmlFor="rsv-tas">T.A.S.</label>
                <input id="rsv-tas" type="number" min="0" required value={form.tas} onChange={(e) => set('tas', e.target.value)} autoFocus />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-tad">T.A.D.</label>
                <input id="rsv-tad" type="number" min="0" required value={form.tad} onChange={(e) => set('tad', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-tam">T.A.M. (calculada)</label>
                <div id="rsv-tam" className="tf-readonly-value">{tam ?? '—'}</div>
              </div>
              <div className="form-field">
                <label htmlFor="rsv-fr">F.R.</label>
                <input id="rsv-fr" type="number" min="0" required value={form.fr} onChange={(e) => set('fr', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-pulso">Pulso</label>
                <input id="rsv-pulso" type="number" min="0" required value={form.pulso} onChange={(e) => set('pulso', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-temp">Temp.</label>
                <input id="rsv-temp" type="number" min="0" step="0.1" required value={form.temp} onChange={(e) => set('temp', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-sato2">Sat. O2</label>
                <input id="rsv-sato2" type="number" min="0" max="100" required value={form.satO2} onChange={(e) => set('satO2', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-hora">Hora</label>
                <input id="rsv-hora" type="time" required value={form.hora} onChange={(e) => set('hora', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-registrado-por">Registrado por</label>
                <div id="rsv-registrado-por" className="tf-readonly-value">{registradoPor}</div>
              </div>
              <div className="form-field full">
                <label htmlFor="rsv-observacion">Observación</label>
                <textarea id="rsv-observacion" rows={3} value={form.observacion} onChange={(e) => set('observacion', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit">Registrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `RegistrarSignosVitalesModal.css`**

```css
.rsv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionEnfermeria/Monitoreo/modals/RegistrarSignosVitalesModal
git commit -m "feat(monitoreo): add RegistrarSignosVitalesModal for manual vitals entry"
```

---

### Task 8: `SignosVitalesTab` (wires everything together, replaces the placeholder)

**Files:**
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/SignosVitalesTab.jsx`
- Create: `src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/SignosVitalesTab.css`
- Modify: `src/Components/GestionEnfermeria/Monitoreo/Monitoreo.jsx` (mount `SignosVitalesTab` instead of the placeholder)

**Interfaces:**
- Consumes: `VITALES_READINGS` (Task 1), `isVitalAbnormal` (Task 1), `ViewToggle` (Task 2), `DateRangeChips` (Task 5), `VITAL_PARAMS` (Task 6), `VitalesChart` (Task 6), `RegistrarSignosVitalesModal` (Task 7), `Button` (`@/Components/Button/Button`).
- Produces: `<SignosVitalesTab />` (no props — owns all local state).

- [ ] **Step 1: Create `SignosVitalesTab.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './SignosVitalesTab.css';
import { VITALES_READINGS } from '@/hooks/GestionEnfermeria/mockMonitoreo';
import { isVitalAbnormal } from '@/hooks/GestionEnfermeria/vitalAbnormality';
import ViewToggle from '@/Components/GestionEnfermeria/shared/ViewToggle/ViewToggle';
import Button from '@/Components/Button/Button';
import { LuList, LuChartLine, LuPlus } from 'react-icons/lu';
import DateRangeChips from './DateRangeChips/DateRangeChips';
import VitalesChart from './VitalesChart/VitalesChart';
import RegistrarSignosVitalesModal from '../modals/RegistrarSignosVitalesModal/RegistrarSignosVitalesModal';
import { VITAL_PARAMS } from './vitalParams';

const VIEW_OPTIONS = [
  { value: 'tabla', label: 'Tabla', icon: LuList },
  { value: 'grafica', label: 'Gráfica', icon: LuChartLine },
];

// patientProfile es un placeholder — AtencionEnfermeria.jsx todavía no pasa
// datos reales de paciente a sus tabs (ver su propio comentario sobre `id`
// sin conectar aún), así que isVitalAbnormal recibe un objeto vacío hasta
// que ese dato exista.
const patientProfile = {};

export default function SignosVitalesTab() {
  const [view, setView] = useState('tabla');
  // dateRange queda cableado a UI/estado pero no recorta `readings` — mismo
  // criterio y misma razón que el filtro "Rango" de HojaMedicamentosTab.jsx
  // (dataset mock fijo, sin rango de fechas real que filtrar todavía).
  const [dateRange, setDateRange] = useState({ mode: 'hoy', desde: null, hasta: null });
  const [activeParams, setActiveParams] = useState(['tas', 'pulso']);
  const [readings, setReadings] = useState(VITALES_READINGS);
  const [showModal, setShowModal] = useState(false);

  function toggleParam(key) {
    setActiveParams((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function handleConfirmRegistro(reading) {
    setReadings((prev) => [...prev, { id: `vt-${prev.length + 1}`, ...reading }]);
    setShowModal(false);
    window.ncToast?.('Signos vitales registrados.');
  }

  return (
    <div role="tabpanel" id="subpanel-signos-vitales" aria-labelledby="subtab-signos-vitales" tabIndex="0" className="sub-panel">
      <div className="filter-bar">
        <ViewToggle view={view} onChange={setView} options={VIEW_OPTIONS} />
        <DateRangeChips value={dateRange} onChange={setDateRange} />
        <div className="filter-spacer" />
        <Button variant="primary" icon={LuPlus} onClick={() => setShowModal(true)}>
          Registrar signos vitales
        </Button>
      </div>

      {view === 'tabla' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fe. Toma</th>
                <th>Hora Toma</th>
                {VITAL_PARAMS.map((p) => <th key={p.key}>{p.label}</th>)}
                <th>Tomado por</th>
                <th>Observación</th>
                <th>Área funcional</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.hora}</td>
                  {VITAL_PARAMS.map((p) => (
                    <td key={p.key} className={isVitalAbnormal(p.key, r[p.key], patientProfile) ? 'svt-cell-alert' : undefined}>
                      {r[p.key]}
                    </td>
                  ))}
                  <td>{r.tomadoPor}</td>
                  <td className={r.observacion ? undefined : 'cell-muted'}>{r.observacion ?? '—'}</td>
                  <td>{r.areaFuncional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'grafica' && (
        <>
          <div className="chip-group svt-param-chips">
            {VITAL_PARAMS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`chip-filter${activeParams.includes(p.key) ? ' active' : ''}`}
                aria-pressed={activeParams.includes(p.key)}
                onClick={() => toggleParam(p.key)}
              >
                <span className="svt-chip-swatch" style={{ background: p.color }} />
                {p.label}
              </button>
            ))}
          </div>
          <VitalesChart readings={readings} activeParams={activeParams} />
        </>
      )}

      {showModal && (
        <RegistrarSignosVitalesModal
          registradoPor="Camilo Grondona"
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmRegistro}
        />
      )}
    </div>
  );
}
```

Note: `"Camilo Grondona"` is the same fixed session-user name `Topbar` already uses in `AtencionEnfermeria.jsx:56` — kept as a literal here for the same reason the rest of this screen hardcodes patient/session data (no auth/session layer yet).

- [ ] **Step 2: Create `SignosVitalesTab.css`**

```css
.svt-cell-alert {
  background: var(--red-bg);
  color: var(--red);
  border-radius: 4px;
}
.svt-param-chips {
  margin-bottom: 12px;
}
.svt-chip-swatch {
  width: 10px;
  height: 3px;
  display: inline-block;
  border-radius: 2px;
  margin-right: 6px;
}
```

- [ ] **Step 3: Mount it in `Monitoreo.jsx`**

Replace the remaining placeholder `div#subpanel-signos-vitales` with the real component:

```jsx
import SignosVitalesTab from './SignosVitalesTab/SignosVitalesTab';
```

```jsx
      <HojaMedicamentosTab />
      <SignosVitalesTab />
```

(`Monitoreo.jsx` no longer renders any inline placeholder `<div>` — both subtabs now own their full markup.)

- [ ] **Step 4: Manual verification in the browser**

Run: `npm run dev`, navigate to Atención de Enfermería → Monitoreo → Signos vitales.

Check:
1. Vista Tabla shows 3 rows; the `tas=150`/`tad=95`/`tam=113` row and the `satO2=91` cell are highlighted in red (out of the mock adult ranges), the rest are not.
2. Toggle to Vista Gráfica: T.A.S. and Pulso chips start active, their lines are visible with different colors; toggling Temp. on as well adds a third line without visually flattening the other two (independent per-parameter Y scale).
3. Click "Registrar signos vitales": typing T.A.S. `130` and T.A.D. `80` live-updates "T.A.M. (calculada)" to `97`; "Registrado por" is not an editable field; submitting adds a new row to Vista Tabla (and, if its parameters are active, a new point on the chart) and shows a "Signos vitales registrados." toast.
4. Switching back to Hoja de medicamentos and back to Signos vitales preserves the view/date-range/active-params state (subtabs stay mounted, not remounted).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/SignosVitalesTab.jsx src/Components/GestionEnfermeria/Monitoreo/SignosVitalesTab/SignosVitalesTab.css src/Components/GestionEnfermeria/Monitoreo/Monitoreo.jsx
git commit -m "feat(monitoreo): implement Signos vitales subtab (table, chart, manual entry)"
```

---

### Task 9: Final end-to-end verification

No new files — this is the comprehensive manual pass mirroring the spec's "Testing" section now that every piece is wired together, plus a production-build sanity check.

**Files:** none (verification only).

- [ ] **Step 1: Full production build**

Run: `npm run build`
Expected: build succeeds with no errors (this is the strongest available signal that `recharts` and every new import resolve correctly, since there is no test suite).

- [ ] **Step 2: Full manual QA pass**

Run: `npm run dev`, open Atención de Enfermería, and walk through:

1. "Monitoreo" tab is enabled and behaves like the other 3 tabs (click + arrow-key navigation).
2. Default subtab is "Hoja de medicamentos"; PatientBanner at the top stays visible and unchanged across both subtabs.
3. Hoja de medicamentos: Rango/Turno/Estado filters work as described in Task 4; empty-state reachable; badges match Administrado(green)/Incidencia(red)/Suspendido(gray).
4. Signos vitales, Vista Tabla: abnormal cells highlighted red per the mock ranges in `vitalAbnormality.js`.
5. Signos vitales, Vista Gráfica: multi-chip selection adds/removes lines; mixing very different scales (e.g. Temp. + T.A.S.) does not flatten either line.
6. "+ Registrar signos vitales": T.A.M. auto-calculates live and is not editable; Hora is pre-filled with the current time and is editable; Registrado por is fixed; submitting updates both the table and (if applicable) the chart.
7. Resize the window to tablet width (768–1024px, per `--bp-tablet`/`--bp-desktop`): the two `.data-table`s gain horizontal scroll inside their own wrapper, never on `body`.
8. Confirm nothing from the "fuera de alcance" list is present: no collapsible columns on the vitals table, no device-integration UI, no pain-scale field.

- [ ] **Step 3: Fix any issues found**

If any check in Step 2 fails, fix it in the relevant component file from Tasks 1-8 (not here) and re-run the affected check.

- [ ] **Step 4: Final commit (only if fixes were needed in Step 3)**

```bash
git add -A
git commit -m "fix(monitoreo): address final QA pass findings"
```
