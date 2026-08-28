# Programación de turnos — flujo de creación, configuración y asignación Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing "Programación de turnos" calendar screen into a full creation → configuration → assignment → review → publish flow: a period-keyed "programación" data model, a 3-step creation wizard, multi-day assignment, and a borrador/publicada state model — while keeping the existing calendar visuals, filters, and single-cell popover/modals exactly as they are today.

**Architecture:** The existing `schedule`/`NURSES` globals in `mockProgramacionData.js` become a `programaciones` map keyed by period (week or month), resolved per the visible week via a new `resolverProgramacion` helper. `ProgramacionTurnos.jsx` (the orchestrator) holds that map in state and derives the active programación, nurse list, and schedule from it; its existing mutation handlers are rewired to write into the resolved programación's `schedule` instead of a flat one. Two new self-contained modal components (`NuevaProgramacionWizard`, `RevisionProgramacionModal`) plug into the orchestrator's existing `modal`-slot pattern. The 3 existing turno modals (`AsignarTurnoModal`/`EditarTurnoModal`/`ReasignarTurnoModal`) are updated to take their nurse roster as a prop instead of importing the global list, so they can never target a nurse outside the active programación.

**Tech Stack:** Next.js (App Router) + React, plain CSS (no CSS-in-JS/Tailwind) except `@/Components/Button/Button` (CSS Modules), `react-icons/lu` (Lucide) for icons. No test framework is configured in this project (`package.json` only has an `eslint` lint script) — verification steps use `npx eslint` on changed files plus a final manual smoke test in the dev server, per this repo's existing convention (see `docs/superpowers/plans/2026-08-26-gestion-camas-mantenimiento.md`, same approach).

**Spec:** `docs/superpowers/specs/2026-08-28-programacion-turnos-flujo-design.md`

## Global Constraints

- Every new component folder = exactly `ComponentName.jsx` + `ComponentName.css` (AGENTS.md "Component organization").
- Every modal uses `@/Components/ModalHeader/ModalHeader` — never a hand-rolled header.
- No native `<select>` inside a `.form-field` — use `FormSelect`/`AreaSelector`/`FilterDropdown` (already used throughout this feature), never a raw `<select>`.
- `font-size`/`font-weight` in any new/edited CSS use the `--fs-*`/`--fw-*` tokens from `globals.css` — never a raw px/600 value. Headings use `--fw-semibold`, never `--fw-bold`.
- All new components import icons from `react-icons/lu` (`Lu*` names).
- All new `.jsx` files start with `'use client'`.
- No `nurseId` may ever be looked up against the module-global `NURSES` list from inside a turno modal (`AsignarTurnoModal`/`EditarTurnoModal`/`ReasignarTurnoModal`) after this plan — always the `nurses` prop the orchestrator passes in, scoped to the active programación's `nurseIds`. `schedule` only has entries for those ids, so looking up outside that set crashes.
- `programaciones` state in `ProgramacionTurnos.jsx` is never mutated directly — always `setProgramaciones` with a new object, same rule the old `schedule` state already followed.

---

## File Structure

```
src/hooks/GestionTurnos/mockProgramacionData.js                                                    (edit — append period-key helpers + PROGRAMACIONES_SEED)
src/Components/GestionTurnos/ProgramacionTurnos/
  NuevaProgramacionWizard/
    NuevaProgramacionWizard.jsx / .css                                                              (new)
    PeriodoAreaStep/PeriodoAreaStep.jsx / .css                                                       (new)
    SeleccionarPersonalStep/SeleccionarPersonalStep.jsx / .css                                       (new)
    ConfirmarStep/ConfirmarStep.jsx / .css                                                           (new)
  RevisionProgramacionModal/RevisionProgramacionModal.jsx / .css                                     (new)
  AsignarTurnoModal/AsignarTurnoModal.jsx / .css                                                     (edit)
  EditarTurnoModal/EditarTurnoModal.jsx                                                              (edit)
  ReasignarTurnoModal/ReasignarTurnoModal.jsx                                                        (edit)
  ProgramacionTurnos.jsx / .css                                                                      (edit)
```

---

### Task 1: Data model — período-keyed programaciones

**Files:**
- Modify: `src/hooks/GestionTurnos/mockProgramacionData.js` (append at end of file, after the existing `SCHEDULE` export — nothing existing is removed or changed in this task)

**Interfaces:**
- Produces: `periodKeyDeSemana(weekStart: Date): string` (`"week:YYYY-MM-DD"`), `periodKeyDeMes(date: Date): string` (`"month:YYYY-MM"`), `mesLabel(date: Date): string` (`"Septiembre 2026"`), `addMeses(date: Date, n: number): Date` (normalized to day 1), `primerLunesVisibleDelMes(monthStart: Date): Date`, `resolverProgramacion(programaciones: object, weekStart: Date): { periodKey: string, programacion: object } | null`, `PROGRAMACIONES_SEED: { [periodKey: string]: Programacion }` where `Programacion = { id, tipo: 'semana'|'mes', periodKey, periodLabel, area, nurseIds: string[], estado: 'borrador'|'publicada', schedule: { [nurseId]: Cell[7] } }` (same `Cell` shape already used by `SCHEDULE`/`TurnosCalendar`).

- [ ] **Step 1: Append the new helpers and seed to the file**

```js
// ---------- Modelo de "programación" (entidad con período/área/personal
// propio) — ver docs/superpowers/specs/2026-08-28-programacion-turnos-flujo-design.md.
// Reemplaza el criterio anterior de un único SCHEDULE/NURSES global fijo:
// ProgramacionTurnos.jsx pasa a guardar un mapa de programaciones keyed por
// período (`periodKeyDeSemana`/`periodKeyDeMes`), resuelto por
// `resolverProgramacion` según la semana visible.

function pad2(n) {
  return String(n).padStart(2, '0');
}

// "week:2026-08-18" — lunes ISO de la semana (weekStart YA es siempre lunes,
// ver diasDeSemana/SEMANA_ANCLA arriba).
export function periodKeyDeSemana(weekStart) {
  return `week:${weekStart.getFullYear()}-${pad2(weekStart.getMonth() + 1)}-${pad2(weekStart.getDate())}`;
}

// "month:2026-09" — admite tanto un weekStart (para resolver a qué mes
// pertenece la semana visible) como un monthStart de día 1 (para construir
// la clave de una programación de tipo mes en el wizard): en ambos casos
// solo importan año+mes.
export function periodKeyDeMes(date) {
  return `month:${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

// "Septiembre 2026" — paso 1 del wizard cuando tipo==='mes' (encargo,
// ejemplo literal "[ Septiembre 2026 ]").
export function mesLabel(date) {
  const m = MESES_LARGO[date.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}

// Navegación prev/siguiente mes del paso 1 del wizard — siempre normaliza al
// día 1 (monthStart nunca representa "un día" real, solo el mes).
export function addMeses(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

// Lunes de la semana que contiene el día 1 del mes elegido (puede caer en el
// mes anterior) — usado solo para decidir a qué `weekStart` saltar el
// calendario principal al crear una programación de tipo mes, ya que la
// grilla sigue siendo semanal (encargo sección 9: la vista mensual no es el
// foco de edición de V1).
export function primerLunesVisibleDelMes(monthStart) {
  const dow = monthStart.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDias(monthStart, diff);
}

// Resuelve qué programación aplica a la semana visible: match exacto de
// semana primero; si no existe, cae a una programación de tipo mes que
// contenga esa semana (mismo criterio de simplificación que ya tenía la
// navegación de semana antes de este cambio: no se modelan 4-5 semanas de
// datos reales distintos para un período mensual). Devuelve `null` si
// ninguna de las dos existe — dispara el estado vacío en ProgramacionTurnos.jsx.
export function resolverProgramacion(programaciones, weekStart) {
  const weekKey = periodKeyDeSemana(weekStart);
  if (programaciones[weekKey]) return { periodKey: weekKey, programacion: programaciones[weekKey] };
  const monthKey = periodKeyDeMes(weekStart);
  if (programaciones[monthKey]) return { periodKey: monthKey, programacion: programaciones[monthKey] };
  return null;
}

// Semilla inicial: solo la semana 18–24 Ago 2026 (la que ya tenía datos
// completos) viene precargada, ya publicada, con las 8 NURSES/SCHEDULE de
// arriba — cualquier otro período arranca sin entrada (dispara el estado
// vacío de la sección 1 del encargo).
export const PROGRAMACIONES_SEED = {
  [periodKeyDeSemana(SEMANA_ANCLA)]: {
    id: 'prog-semana-ancla',
    tipo: 'semana',
    periodKey: periodKeyDeSemana(SEMANA_ANCLA),
    periodLabel: rangoSemanaLabel(SEMANA_ANCLA),
    area: 'todas',
    nurseIds: NURSES.map((n) => n.id),
    estado: 'publicada',
    schedule: SCHEDULE,
  },
};
```

- [ ] **Step 2: Lint the file**

Run: `npx eslint src/hooks/GestionTurnos/mockProgramacionData.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/GestionTurnos/mockProgramacionData.js
git commit -m "$(cat <<'EOF'
Add period-keyed programación data model to mockProgramacionData

Introduces periodKeyDeSemana/periodKeyDeMes/resolverProgramacion and
PROGRAMACIONES_SEED so the calendar can resolve a distinct programación
per visible week/month instead of one fixed global schedule.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wizard "Nueva programación" (3 pasos)

**Files:**
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/NuevaProgramacionWizard.jsx`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/NuevaProgramacionWizard.css`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/PeriodoAreaStep/PeriodoAreaStep.jsx`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/PeriodoAreaStep/PeriodoAreaStep.css`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/SeleccionarPersonalStep/SeleccionarPersonalStep.jsx`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/SeleccionarPersonalStep/SeleccionarPersonalStep.css`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/ConfirmarStep/ConfirmarStep.jsx`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard/ConfirmarStep/ConfirmarStep.css`

**Interfaces:**
- Consumes (from Task 1): `NURSES`, `AREAS_TURNOS`, `AREA_TURNO_LABEL`, `periodKeyDeSemana`, `periodKeyDeMes`, `mesLabel`, `addMeses`, `primerLunesVisibleDelMes`, `rangoSemanaLabel`, `addDias` — all already exported by `mockProgramacionData.js`.
- Produces: `NuevaProgramacionWizard({ initialWeekStart: Date, initialArea: string, onClose: () => void, onCreate: ({ periodKey: string, programacion: Programacion, weekStart: Date, area: string }) => void })` — default export, mounted unconditionally (own `.modal-overlay`) by whoever renders it, same pattern as the other modals in this feature.

- [ ] **Step 1: Create `SeleccionarPersonalStep.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './SeleccionarPersonalStep.css';
import FilterDropdown from '@/Components/FilterDropdown/FilterDropdown';
import { AREAS_TURNOS, NURSES } from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuSearch } from 'react-icons/lu';

// FilterDropdown espera 'todos' como valor "sin filtro" (hardcoded ahí para
// Tipo de turno/Estado, ver ProgramacionTurnos.jsx) — AREAS_TURNOS usa
// 'todas' para ese mismo rol ("todas las áreas"), así que acá se arma una
// lista propia con el mismo primer valor pero sentinel 'todos', para que el
// estado "activo" del filtro se calcule bien sin tocar FilterDropdown.jsx.
const AREA_OPTIONS = [
  { value: 'todos', label: 'Todas las áreas' },
  ...AREAS_TURNOS.filter((a) => a.value !== 'todas'),
];
const CARGO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'Enfermera profesional', label: 'Enfermera profesional' },
  { value: 'Enfermero profesional', label: 'Enfermero profesional' },
];

// Paso 2 del wizard — lista de personal seleccionable con checkbox, filtros
// locales de Área/Cargo + búsqueda (solo acotan qué fila se ve, no
// persisten en el form del wizard). Lo que sí persiste es `selectedIds`,
// controlado por el padre (NuevaProgramacionWizard). Fila avatar+nombre+
// cargo reutiliza `.npw-nurse-row` (definida en NuevaProgramacionWizard.css,
// ver ese archivo para el porqué de vivir ahí en vez de acá — la reusa
// también ConfirmarStep).
export default function SeleccionarPersonalStep({ selectedIds, onToggle, onToggleAll }) {
  const [query, setQuery] = useState('');
  const [areaFiltro, setAreaFiltro] = useState('todos');
  const [cargoFiltro, setCargoFiltro] = useState('todos');

  const q = query.trim().toLowerCase();
  const visibles = NURSES.filter((n) => {
    if (areaFiltro !== 'todos' && n.area !== areaFiltro) return false;
    if (cargoFiltro !== 'todos' && n.cargo !== cargoFiltro) return false;
    if (q && !n.nombre.toLowerCase().includes(q)) return false;
    return true;
  });

  const todasVisiblesSeleccionadas = visibles.length > 0 && visibles.every((n) => selectedIds.includes(n.id));

  return (
    <div className="sps-step">
      <h4 className="npw-step-title">Selecciona el personal</h4>
      <p className="npw-step-hint">Selecciona las enfermeras que participarán en esta programación.</p>

      <div className="sps-count">{selectedIds.length} enfermeras seleccionadas</div>

      <div className="sps-toolbar">
        <div className="search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar enfermera..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar enfermera"
          />
        </div>
        <FilterDropdown label="Área" options={AREA_OPTIONS} value={areaFiltro} onChange={setAreaFiltro} />
        <FilterDropdown label="Cargo" options={CARGO_OPTIONS} value={cargoFiltro} onChange={setCargoFiltro} />
        <button type="button" className="sps-select-all" onClick={() => onToggleAll(visibles, !todasVisiblesSeleccionadas)}>
          {todasVisiblesSeleccionadas ? 'Quitar todos' : 'Seleccionar todos'}
        </button>
      </div>

      <div className="sps-list">
        {visibles.length === 0 ? (
          <div className="ct-empty-cell">No se encontraron enfermeras con estos filtros.</div>
        ) : visibles.map((n) => (
          <label key={n.id} className="npw-nurse-row">
            <input type="checkbox" checked={selectedIds.includes(n.id)} onChange={() => onToggle(n.id)} />
            <span className="npw-nurse-avatar" aria-hidden="true">{n.iniciales}</span>
            <span className="npw-nurse-info">
              <span className="npw-nurse-name">{n.nombre}</span>
              <span className="npw-nurse-cargo">{n.cargo}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `SeleccionarPersonalStep.css`**

```css
/* .form-field/.search-field/.ct-empty-cell: ver ../../../GestionTurnos.css.
   .npw-nurse-row/.npw-step-title/.npw-step-hint: ver ../NuevaProgramacionWizard.css. */
.sps-step{display:flex;flex-direction:column;gap:14px;min-height:0;}
.sps-count{font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-700);}
.sps-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.sps-select-all{
  margin-left:auto;background:none;border:none;padding:0;font-family:inherit;cursor:pointer;
  font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--primary);white-space:nowrap;
}
.sps-select-all:hover{text-decoration:underline;}
.sps-list{display:flex;flex-direction:column;gap:2px;max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:6px;}
```

- [ ] **Step 3: Create `ConfirmarStep.jsx`**

```jsx
'use client';

import './ConfirmarStep.css';
import {
  AREA_TURNO_LABEL, NURSES, mesLabel, rangoSemanaLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';

// Paso 3 (solo lectura) — resumen antes de crear. La duración se deriva del
// tipo elegido en el paso 1 (nunca se calcula en días: "1 semana"/"1 mes"
// son las únicas 2 duraciones posibles en V1, ver encargo sección 2).
export default function ConfirmarStep({
  tipo, weekStart, monthStart, area, nurseIds,
}) {
  const periodLabel = tipo === 'semana' ? rangoSemanaLabel(weekStart) : mesLabel(monthStart);
  const duracionLabel = tipo === 'semana' ? '1 semana' : '1 mes';
  const seleccionadas = NURSES.filter((n) => nurseIds.includes(n.id));

  return (
    <div className="cs-step">
      <h4 className="npw-step-title">Revisa la programación</h4>

      <div className="cs-summary">
        <div className="cs-summary-row">
          <span className="cs-summary-label">Período</span>
          <span className="cs-summary-value">{periodLabel}</span>
        </div>
        <div className="cs-summary-row">
          <span className="cs-summary-label">Duración</span>
          <span className="cs-summary-value">{duracionLabel}</span>
        </div>
        <div className="cs-summary-row">
          <span className="cs-summary-label">Área</span>
          <span className="cs-summary-value">{AREA_TURNO_LABEL[area]}</span>
        </div>
        <div className="cs-summary-row">
          <span className="cs-summary-label">Personal</span>
          <span className="cs-summary-value">{nurseIds.length} enfermeras</span>
        </div>
      </div>

      <div className="cs-list">
        {seleccionadas.map((n) => (
          <div key={n.id} className="npw-nurse-row readonly">
            <span className="npw-nurse-avatar" aria-hidden="true">{n.iniciales}</span>
            <span className="npw-nurse-info">
              <span className="npw-nurse-name">{n.nombre}</span>
              <span className="npw-nurse-cargo">{n.cargo}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="cs-note">
        Podrás asignar y modificar los turnos desde el calendario después de crear la programación.
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `ConfirmarStep.css`**

```css
/* .npw-nurse-row/.npw-step-title: ver ../NuevaProgramacionWizard.css. */
.cs-step{display:flex;flex-direction:column;gap:16px;}
.cs-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px 20px;padding:14px 16px;background:var(--bg);border-radius:var(--radius);}
.cs-summary-row{display:flex;flex-direction:column;gap:2px;}
.cs-summary-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.cs-summary-value{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.cs-list{display:flex;flex-direction:column;gap:2px;max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:6px;}
.cs-note{background:var(--bg);color:var(--ink-700);border-radius:var(--radius);padding:10px 12px;font-size:var(--fs-sm);line-height:1.4;}
```

- [ ] **Step 5: Create `PeriodoAreaStep.jsx`**

```jsx
'use client';

import './PeriodoAreaStep.css';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import {
  AREAS_TURNOS, addDias, addMeses, mesLabel, rangoSemanaLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Paso 1 del wizard — tipo de período (segmented control reutilizando
// `.chip-group.segmented` ya global, ver GestionTurnos.css) + navegación
// prev/siguiente (reutiliza `.day-nav*` ya global, mismo patrón que el
// header del calendario) + AreaSelector (mismo componente que el filtro de
// header de ProgramacionTurnos.jsx). Siempre válido por default (semana/área
// ya vienen precargadas desde la pantalla activa al abrir el wizard) — no
// hay estado de error que mostrar acá.
export default function PeriodoAreaStep({
  tipo, onTipoChange, weekStart, onWeekStartChange, monthStart, onMonthStartChange, area, onAreaChange,
}) {
  return (
    <div className="pas-step">
      <h4 className="npw-step-title">Define el período de programación</h4>

      <div className="form-field">
        <label>Tipo de período</label>
        <div className="chip-group segmented">
          <button
            type="button"
            className={`chip-filter${tipo === 'semana' ? ' active' : ''}`}
            aria-pressed={tipo === 'semana'}
            onClick={() => onTipoChange('semana')}
          >
            Semana
          </button>
          <button
            type="button"
            className={`chip-filter${tipo === 'mes' ? ' active' : ''}`}
            aria-pressed={tipo === 'mes'}
            onClick={() => onTipoChange('mes')}
          >
            Mes
          </button>
        </div>
      </div>

      {tipo === 'semana' ? (
        <div className="form-field">
          <label>Semana</label>
          <div className="day-nav">
            <button type="button" className="day-nav-btn" aria-label="Semana anterior" onClick={() => onWeekStartChange(addDias(weekStart, -7))}>
              <LuChevronLeft className="icon" />
            </button>
            <span className="day-nav-label">{rangoSemanaLabel(weekStart)}</span>
            <button type="button" className="day-nav-btn" aria-label="Semana siguiente" onClick={() => onWeekStartChange(addDias(weekStart, 7))}>
              <LuChevronRight className="icon" />
            </button>
          </div>
        </div>
      ) : (
        <div className="form-field">
          <label>Mes</label>
          <div className="day-nav">
            <button type="button" className="day-nav-btn" aria-label="Mes anterior" onClick={() => onMonthStartChange(addMeses(monthStart, -1))}>
              <LuChevronLeft className="icon" />
            </button>
            <span className="day-nav-label">{mesLabel(monthStart)}</span>
            <button type="button" className="day-nav-btn" aria-label="Mes siguiente" onClick={() => onMonthStartChange(addMeses(monthStart, 1))}>
              <LuChevronRight className="icon" />
            </button>
          </div>
        </div>
      )}

      <div className="form-field">
        <label>Área o servicio</label>
        <AreaSelector options={AREAS_TURNOS} value={area} onChange={onAreaChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `PeriodoAreaStep.css`**

```css
/* .form-field/.chip-group.segmented/.chip-filter/.day-nav*: ver
   ../../../GestionTurnos.css. .npw-step-title: ver ../NuevaProgramacionWizard.css. */
.pas-step{display:flex;flex-direction:column;gap:20px;}
```

- [ ] **Step 7: Create `NuevaProgramacionWizard.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './NuevaProgramacionWizard.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PeriodoAreaStep from './PeriodoAreaStep/PeriodoAreaStep';
import SeleccionarPersonalStep from './SeleccionarPersonalStep/SeleccionarPersonalStep';
import ConfirmarStep from './ConfirmarStep/ConfirmarStep';
import {
  NURSES, periodKeyDeMes, periodKeyDeSemana, primerLunesVisibleDelMes, rangoSemanaLabel, mesLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuCalendarPlus } from 'react-icons/lu';

const PASOS = [
  { n: 1, label: 'Período y área' },
  { n: 2, label: 'Seleccionar personal' },
  { n: 3, label: 'Confirmar programación' },
];

// Wizard de 3 pasos "Nueva programación de turnos" (encargo sección 2).
// Estado del formulario vive acá y se pasa controlado a cada paso — mismo
// patrón que el resto de modales de formulario del proyecto (form/setForm
// local, sin librería de formularios). `nurseIds` arranca con TODO el
// personal ya tildado (encargo, ejemplo del paso 2: la mayoría ya viene
// marcada) — el usuario destilda a quien no participa, en vez de partir de
// cero y tener que tildar uno por uno.
export default function NuevaProgramacionWizard({
  initialWeekStart, initialArea, onClose, onCreate,
}) {
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState('semana');
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [monthStart, setMonthStart] = useState(
    () => new Date(initialWeekStart.getFullYear(), initialWeekStart.getMonth(), 1),
  );
  const [area, setArea] = useState(initialArea);
  const [nurseIds, setNurseIds] = useState(() => NURSES.map((n) => n.id));

  function toggleNurse(id) {
    setNurseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleTodos(nurseList, marcar) {
    setNurseIds((prev) => {
      const next = new Set(prev);
      nurseList.forEach((n) => { if (marcar) next.add(n.id); else next.delete(n.id); });
      return [...next];
    });
  }

  function handleConfirmar() {
    const periodKey = tipo === 'semana' ? periodKeyDeSemana(weekStart) : periodKeyDeMes(monthStart);
    const periodLabel = tipo === 'semana' ? rangoSemanaLabel(weekStart) : mesLabel(monthStart);
    const schedule = Object.fromEntries(
      nurseIds.map((id) => [id, Array.from({ length: 7 }, () => ({ estado: 'vacio' }))]),
    );
    onCreate({
      periodKey,
      programacion: {
        id: `prog-${periodKey}`,
        tipo,
        periodKey,
        periodLabel,
        area,
        nurseIds,
        estado: 'borrador',
        schedule,
      },
      weekStart: tipo === 'semana' ? weekStart : primerLunesVisibleDelMes(monthStart),
      area,
    });
  }

  const subtitle = PASOS[paso - 1].label;

  return (
    <div className="modal-overlay open">
      <div className="modal-card npw-modal-card" role="dialog" aria-modal="true" aria-labelledby="npw-title">
        <ModalHeader
          icon={LuCalendarPlus}
          tone="primary"
          title="Nueva programación de turnos"
          titleId="npw-title"
          subtitle="Define el período y el personal que participará en esta programación."
          onClose={onClose}
        />

        <div className="npw-progress" aria-label={`Paso ${paso} de 3: ${subtitle}`}>
          {PASOS.map((p) => (
            <div key={p.n} className={`npw-progress-step${paso === p.n ? ' active' : ''}${paso > p.n ? ' done' : ''}`}>
              <span className="npw-progress-dot">{p.n}</span>
              <span className="npw-progress-label">{p.label}</span>
            </div>
          ))}
        </div>

        <div className="modal-body npw-body">
          {paso === 1 && (
            <PeriodoAreaStep
              tipo={tipo}
              onTipoChange={setTipo}
              weekStart={weekStart}
              onWeekStartChange={setWeekStart}
              monthStart={monthStart}
              onMonthStartChange={setMonthStart}
              area={area}
              onAreaChange={setArea}
            />
          )}
          {paso === 2 && (
            <SeleccionarPersonalStep
              selectedIds={nurseIds}
              onToggle={toggleNurse}
              onToggleAll={toggleTodos}
            />
          )}
          {paso === 3 && (
            <ConfirmarStep
              tipo={tipo}
              weekStart={weekStart}
              monthStart={monthStart}
              area={area}
              nurseIds={nurseIds}
            />
          )}
        </div>

        <div className="modal-footer">
          {paso === 1 && <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>}
          {paso > 1 && <button type="button" className="btn btn-secondary" onClick={() => setPaso((p) => p - 1)}>Atrás</button>}
          {paso < 3 && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={paso === 2 && nurseIds.length === 0}
              onClick={() => setPaso((p) => p + 1)}
            >
              Continuar
            </button>
          )}
          {paso === 3 && (
            <button type="button" className="btn btn-primary" onClick={handleConfirmar}>Crear programación</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create `NuevaProgramacionWizard.css`**

```css
/* .modal-overlay/.modal-card/.modal-body/.modal-footer/.btn*/.form-field/
   .chip-group.segmented/.day-nav*/.search-field/.ct-empty-cell: ver
   ../../GestionTurnos.css.
   .npw-nurse-row* viven acá (no en SeleccionarPersonalStep.css/
   ConfirmarStep.css) porque los reusan ambos pasos — mismo criterio de
   shared.css de AGENTS.md, acotado al subárbol de este wizard en vez de a
   todo el feature GestionTurnos (única pareja de consumidores hoy). */
.npw-modal-card{width:640px;max-height:calc(100vh - 48px);}
.npw-body{min-height:360px;}

.npw-step-title{margin:0 0 2px;font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.npw-step-hint{margin:0;font-size:var(--fs-sm);color:var(--ink-500);}

/* ---------- Indicador de progreso (3 pasos, encargo explícito "en la parte
   superior") ---------- */
.npw-progress{display:flex;align-items:flex-start;padding:16px 24px 4px;flex-shrink:0;}
.npw-progress-step{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;
  font-size:var(--fs-xs);color:var(--ink-400);text-align:center;
}
.npw-progress-step:not(:last-child)::after{
  content:'';position:absolute;top:11px;left:calc(50% + 18px);right:calc(-50% + 18px);
  height:2px;background:var(--border);z-index:0;
}
.npw-progress-step.done:not(:last-child)::after{background:var(--primary);}
.npw-progress-dot{
  width:22px;height:22px;border-radius:50%;flex-shrink:0;z-index:1;
  display:flex;align-items:center;justify-content:center;
  background:var(--gray-bg);color:var(--ink-500);font-weight:var(--fw-semibold);font-size:var(--fs-xs);
  border:2px solid var(--surface-modal);
}
.npw-progress-step.active .npw-progress-dot{background:var(--primary);color:#fff;}
.npw-progress-step.done .npw-progress-dot{background:var(--primary-100);color:var(--primary-dark);}
.npw-progress-label{font-weight:var(--fw-medium);}
.npw-progress-step.active .npw-progress-label{color:var(--ink-900);font-weight:var(--fw-semibold);}

/* ---------- Fila avatar+nombre+cargo, reusada por SeleccionarPersonalStep
   (con checkbox) y ConfirmarStep (solo lectura, ver .readonly) — mismos
   valores que .tc-nurse/.tc-avatar de TurnosCalendar.css para verse
   consistente con las filas del propio calendario. ---------- */
.npw-nurse-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius);cursor:pointer;transition:background .15s;}
.npw-nurse-row:hover{background:var(--bg);}
.npw-nurse-row.readonly{cursor:default;}
.npw-nurse-row.readonly:hover{background:none;}
.npw-nurse-row input[type="checkbox"]{width:18px;height:18px;flex-shrink:0;accent-color:var(--primary);}
.npw-nurse-avatar{
  width:30px;height:30px;border-radius:50%;flex-shrink:0;
  background:var(--primary-100);color:var(--primary-dark);
  display:flex;align-items:center;justify-content:center;
  font-weight:var(--fw-medium);font-size:var(--fs-sm);
}
.npw-nurse-info{min-width:0;display:flex;flex-direction:column;}
.npw-nurse-name{font-weight:var(--fw-semibold);color:var(--ink-900);font-size:var(--fs-base);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.npw-nurse-cargo{font-size:var(--fs-sm);color:var(--ink-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

@media (max-width:640px){
  .npw-modal-card{width:100%;}
}
```

- [ ] **Step 9: Lint all 8 new files**

Run: `npx eslint src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/Components/GestionTurnos/ProgramacionTurnos/NuevaProgramacionWizard
git commit -m "$(cat <<'EOF'
Add NuevaProgramacionWizard (3-step programación creation flow)

Standalone wizard: período/área, personal selection with checkboxes, and
a read-only confirm step. Not wired into ProgramacionTurnos.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: RevisionProgramacionModal

**Files:**
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/RevisionProgramacionModal/RevisionProgramacionModal.jsx`
- Create: `src/Components/GestionTurnos/ProgramacionTurnos/RevisionProgramacionModal/RevisionProgramacionModal.css`

**Interfaces:**
- Consumes: nothing from earlier tasks (self-contained, only `ModalHeader` + `react-icons/lu`).
- Produces: `RevisionProgramacionModal({ resumen: { turnos: number, sinAsignar: number, conflictos: number }, onClose: () => void, onPublicar: () => void })` — default export.

- [ ] **Step 1: Create `RevisionProgramacionModal.jsx`**

```jsx
'use client';

import './RevisionProgramacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  LuCheck, LuClipboardCheck, LuTriangleAlert, LuUserRoundX,
} from 'react-icons/lu';

// "Revisar programación" (encargo sección 7) — reutiliza el mismo `resumen`
// que ya alimenta el footer del calendario (turnos/sin asignar/conflictos),
// acá mostrado como checklist con un veredicto único arriba. Sin conflictos
// ni sin-asignar → listo para publicar; si hay algo pendiente, "Publicar
// programación" ni se muestra (encargo explícito: solo deja volver al
// calendario a resolverlo).
export default function RevisionProgramacionModal({ resumen, onClose, onPublicar }) {
  const listo = resumen.sinAsignar === 0 && resumen.conflictos === 0;

  return (
    <div className="modal-overlay open">
      <div className="modal-card rpm-modal-card" role="dialog" aria-modal="true" aria-labelledby="rpm-title">
        <ModalHeader
          icon={LuClipboardCheck}
          tone={listo ? 'primary' : 'warning'}
          title="Revisión de programación"
          titleId="rpm-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className={`rpm-status ${listo ? 'ready' : 'pending'}`}>
            {listo ? 'Listo para publicar' : 'Hay elementos pendientes'}
          </div>

          <div className="rpm-list">
            <div className="rpm-row ok">
              <LuCheck className="icon" aria-hidden="true" />
              {resumen.turnos} turnos programados
            </div>
            <div className={`rpm-row ${resumen.sinAsignar === 0 ? 'ok' : 'warn'}`}>
              {resumen.sinAsignar === 0 ? <LuCheck className="icon" aria-hidden="true" /> : <LuUserRoundX className="icon" aria-hidden="true" />}
              {resumen.sinAsignar} {resumen.sinAsignar === 1 ? 'turno sin asignar' : 'turnos sin asignar'}
            </div>
            <div className={`rpm-row ${resumen.conflictos === 0 ? 'ok' : 'warn'}`}>
              {resumen.conflictos === 0 ? <LuCheck className="icon" aria-hidden="true" /> : <LuTriangleAlert className="icon" aria-hidden="true" />}
              {resumen.conflictos} {resumen.conflictos === 1 ? 'conflicto' : 'conflictos'}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Volver al calendario</button>
          {listo && (
            <button type="button" className="btn btn-primary" onClick={onPublicar}>Publicar programación</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `RevisionProgramacionModal.css`**

```css
/* .modal-overlay/.modal-card/.modal-body/.modal-footer/.btn*: ver
   ../../GestionTurnos.css. */
.rpm-modal-card{width:440px;}
.rpm-status{
  font-size:var(--fs-lg);font-weight:var(--fw-semibold);
  padding:10px 12px;border-radius:var(--radius);text-align:center;
}
.rpm-status.ready{background:var(--green-bg);color:#0d7a3d;}
.rpm-status.pending{background:var(--amber-bg);color:var(--amber-fg);}
.rpm-list{display:flex;flex-direction:column;gap:8px;margin-top:16px;}
.rpm-row{
  display:flex;align-items:center;gap:8px;
  font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);
  padding:8px 10px;border-radius:var(--radius);background:var(--bg);
}
.rpm-row .icon{width:18px;height:18px;flex-shrink:0;}
.rpm-row.ok .icon{color:var(--green);}
.rpm-row.warn .icon{color:var(--amber-fg);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionTurnos/ProgramacionTurnos/RevisionProgramacionModal`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionTurnos/ProgramacionTurnos/RevisionProgramacionModal
git commit -m "$(cat <<'EOF'
Add RevisionProgramacionModal

Checklist of turnos programados/sin asignar/conflictos with a single
"listo para publicar" / "hay elementos pendientes" verdict. Not wired
into ProgramacionTurnos.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: AsignarTurnoModal — asignación múltiple por checkbox de día + roster acotado

**Files:**
- Modify: `src/Components/GestionTurnos/ProgramacionTurnos/AsignarTurnoModal/AsignarTurnoModal.jsx`
- Modify: `src/Components/GestionTurnos/ProgramacionTurnos/AsignarTurnoModal/AsignarTurnoModal.css`

**Interfaces:**
- Consumes: nothing new from earlier tasks.
- Produces (breaking change from today): `AsignarTurnoModal({ nurseId, dayIdx, days, nurses: Nurse[], locked, reemplazaDescanso, onClose, onAssign })` where `onAssign` is now called with `{ nurseId, dayIdxs: number[], tipo, horario }` (was `{ nurseId, dayIdx, tipo, horario }`) — every caller of `onAssign` must be updated in Task 6. `nurses` replaces the old direct `NURSES` import.

- [ ] **Step 1: Replace `AsignarTurnoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './AsignarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuCalendarPlus, LuTriangleAlert } from 'react-icons/lu';

const TIPO_OPTIONS = Object.entries(TIPO_TURNO_META).map(([value, m]) => ({ value, label: m.label }));

// "Asignar turno" — 2 puntos de entrada con distinta cantidad de campos a
// completar (encargo explícito):
//  · Desde una celda puntual ("Sin asignar" o "Asignar turno" dentro del
//    popover de Descanso): enfermera/fecha/área ya están decididas por la
//    celda clickeada, `locked` las muestra de solo lectura y el usuario solo
//    completa tipo + horario. `form.dayIdxs` queda fijo en `[dayIdx]`.
//  · Desde el botón "+ Asignar turno" del header (sin celda de origen):
//    `locked=false`, enfermera se elige entre `nurses` y los días se tildan
//    por checkbox — el mismo tipo/horario se aplica a todos los días
//    marcados en una sola confirmación (encargo sección 5, "asignación
//    múltiple").
// `nurses` siempre viene acotado por el padre a la programación activa
// (ProgramacionTurnos.jsx) — este componente ya no importa NURSES directo,
// así nunca ofrece asignar a alguien fuera de esa programación (`schedule`
// solo tiene entradas para su `nurseIds`).
// `reemplazaDescanso` viene en true cuando se llega desde el popover de
// Descanso — encargo explícito: advertir que se reemplaza el descanso
// existente antes de confirmar.
export default function AsignarTurnoModal({
  nurseId, dayIdx, days, nurses, locked, reemplazaDescanso, onClose, onAssign,
}) {
  const [form, setForm] = useState({
    nurseId: nurseId ?? '',
    dayIdxs: locked ? [dayIdx] : [],
    tipo: 'manana',
    horaInicio: TIPO_TURNO_META.manana.horario.split(' – ')[0],
    horaFin: TIPO_TURNO_META.manana.horario.split(' – ')[1],
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDia(i) {
    setForm((f) => ({
      ...f,
      dayIdxs: f.dayIdxs.includes(i) ? f.dayIdxs.filter((x) => x !== i) : [...f.dayIdxs, i],
    }));
  }

  function handleTipoChange(tipo) {
    const [horaInicio, horaFin] = TIPO_TURNO_META[tipo].horario.split(' – ');
    setForm((f) => ({ ...f, tipo, horaInicio, horaFin }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.nurseId === '' || form.dayIdxs.length === 0) return;
    onAssign({
      nurseId: form.nurseId,
      dayIdxs: form.dayIdxs,
      tipo: form.tipo,
      horario: `${form.horaInicio} – ${form.horaFin}`,
    });
  }

  const nurse = nurses.find((n) => n.id === form.nurseId);
  const puedeEnviar = form.nurseId !== '' && form.dayIdxs.length > 0;

  return (
    <div className="modal-overlay open">
      <div className="modal-card at-modal-card" role="dialog" aria-modal="true" aria-labelledby="asignar-turno-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarPlus}
            tone="primary"
            title="Asignar turno"
            titleId="asignar-turno-title"
            subtitle={locked ? `${nurse?.nombre} · ${diaLargoLabel(days[dayIdx], dayIdx)}` : undefined}
            onClose={onClose}
          />
          <div className="modal-body">
            {reemplazaDescanso && (
              <div className="tf-warning-note at-warning">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                Esta acción reemplazará el descanso programado de {nurse?.nombre} ese día.
              </div>
            )}

            <div className="at-grid">
              {locked ? (
                <>
                  <div className="form-field">
                    <label>Enfermera</label>
                    <div className="tf-readonly-value">{nurse?.nombre}</div>
                  </div>
                  <div className="form-field">
                    <label>Fecha</label>
                    <div className="tf-readonly-value">{diaLargoLabel(days[dayIdx], dayIdx)}</div>
                  </div>
                  <div className="form-field full">
                    <label>Área o servicio</label>
                    <div className="tf-readonly-value">{AREA_TURNO_LABEL[nurse?.area]}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field full">
                    <label htmlFor="at-enfermera">Enfermera</label>
                    <FormSelect
                      id="at-enfermera"
                      value={form.nurseId}
                      onChange={(v) => set('nurseId', v)}
                      placeholder="Selecciona una enfermera"
                      options={nurses.map((n) => ({ value: n.id, label: n.nombre }))}
                    />
                  </div>
                  <div className="form-field full">
                    <label id="at-dias-label">Días</label>
                    <div className="at-dias-group" role="group" aria-labelledby="at-dias-label">
                      {days.map((d, i) => (
                        <label key={i} className={`at-dia-option${form.dayIdxs.includes(i) ? ' checked' : ''}`}>
                          <input type="checkbox" checked={form.dayIdxs.includes(i)} onChange={() => toggleDia(i)} />
                          {d.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-field full">
                    <label>Área o servicio</label>
                    <div className="tf-readonly-value">{nurse ? AREA_TURNO_LABEL[nurse.area] : 'Se completa al elegir enfermera'}</div>
                  </div>
                </>
              )}

              <div className="form-field full">
                <label htmlFor="at-tipo">Tipo de turno</label>
                <FormSelect id="at-tipo" value={form.tipo} onChange={handleTipoChange} options={TIPO_OPTIONS} />
              </div>

              <div className="form-field">
                <label htmlFor="at-hora-inicio">Hora de inicio</label>
                <input id="at-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="at-hora-fin">Hora de finalización</label>
                <input id="at-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeEnviar}>Asignar turno</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `AsignarTurnoModal.css`**

```css
/* .modal-overlay/.modal-card/.form-field/.tf-readonly-value/.tf-warning-note:
   ver ../../GestionTurnos.css. `.form-field.full` se agrega acá porque
   GestionTurnos.css no la define (a diferencia de
   GestionEnfermeria/shared/shared.css) y este modal la necesita para el
   grupo de checkboxes de día + Enfermera en modo sin celda de origen. */
.at-modal-card{width:480px;}
.at-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.form-field.full{grid-column:1 / -1;}
.at-warning{margin-bottom:16px;}

.at-dias-group{display:flex;flex-wrap:wrap;gap:8px;}
.at-dia-option{
  display:inline-flex;align-items:center;gap:6px;
  border:1px solid var(--border);border-radius:var(--radius);padding:7px 10px;cursor:pointer;
  font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-700);
  transition:background .15s,border-color .15s,color .15s;
}
.at-dia-option:hover{background:var(--bg);}
.at-dia-option.checked{background:var(--primary-50);border-color:var(--primary-100);color:var(--primary-dark);font-weight:var(--fw-semibold);}
.at-dia-option input[type="checkbox"]{width:16px;height:16px;accent-color:var(--primary);}

/* El formulario nunca crece más de lo que el modal ya reserva — sin esto,
   el listbox absoluto de FormSelect (ver .form-select-dropdown en
   FormSelect.css) queda recortado por el overflow-y:auto genérico de
   .modal-body en los campos que caen cerca del borde inferior. */
.at-modal-card .modal-body{overflow-y:visible;}

@media (max-width:480px){
  .at-grid{grid-template-columns:1fr;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionTurnos/ProgramacionTurnos/AsignarTurnoModal`
Expected: no errors. This component is not yet wired to updated callers — that happens in Task 6, so a full runtime check isn't possible yet.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionTurnos/ProgramacionTurnos/AsignarTurnoModal
git commit -m "$(cat <<'EOF'
Add multi-day checkbox assignment to AsignarTurnoModal

Unlocked mode (no origin cell) replaces the single-day FormSelect with a
day checkbox group, applying the same tipo/horario to every checked day
in one confirm. nurse lookups now use a `nurses` prop instead of the
global NURSES import, scoping selection to the active programación.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: EditarTurnoModal / ReasignarTurnoModal — acotar roster a la programación activa

**Files:**
- Modify: `src/Components/GestionTurnos/ProgramacionTurnos/EditarTurnoModal/EditarTurnoModal.jsx`
- Modify: `src/Components/GestionTurnos/ProgramacionTurnos/ReasignarTurnoModal/ReasignarTurnoModal.jsx`

**Interfaces:**
- Produces: `EditarTurnoModal({ nurseId, dayIdx, cell, days, nurses: Nurse[], onClose, onSave })` and `ReasignarTurnoModal({ nurseId, dayIdx, cell, schedule, days, nurses: Nurse[], onClose, onConfirm })` — both gain the `nurses` prop, both drop the `NURSES` import. No other prop or behavior changes.

- [ ] **Step 1: Replace `EditarTurnoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './EditarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuPencil } from 'react-icons/lu';

const TIPO_OPTIONS = Object.entries(TIPO_TURNO_META).map(([value, m]) => ({ value, label: m.label }));

// "Editar turno" — prellena enfermera/fecha/tipo/horario/área a partir de la
// celda clickeada (encargo explícito) y permite moverlo de enfermera/día
// además de ajustar tipo y horario custom. `nurses` viene acotado por el
// padre al personal de la programación activa (nunca el roster completo) —
// mismo criterio que AsignarTurnoModal, ver ese componente.
export default function EditarTurnoModal({
  nurseId, dayIdx, cell, days, nurses, onClose, onSave,
}) {
  const nurse = nurses.find((n) => n.id === nurseId);
  const [form, setForm] = useState({
    nurseId,
    dayIdx,
    tipo: cell.tipo,
    horaInicio: cell.horario.split(' – ')[0],
    horaFin: cell.horario.split(' – ')[1],
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTipoChange(tipo) {
    const [horaInicio, horaFin] = TIPO_TURNO_META[tipo].horario.split(' – ');
    setForm((f) => ({ ...f, tipo, horaInicio, horaFin }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(nurseId, dayIdx, {
      nurseId: form.nurseId,
      dayIdx: form.dayIdx,
      tipo: form.tipo,
      horario: `${form.horaInicio} – ${form.horaFin}`,
    });
  }

  const formNurse = nurses.find((n) => n.id === form.nurseId);

  return (
    <div className="modal-overlay open">
      <div className="modal-card et-modal-card" role="dialog" aria-modal="true" aria-labelledby="editar-turno-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuPencil}
            tone="primary"
            title="Editar turno"
            titleId="editar-turno-title"
            subtitle={nurse?.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="et-grid">
              <div className="form-field">
                <label htmlFor="et-enfermera">Enfermera</label>
                <FormSelect
                  id="et-enfermera"
                  value={form.nurseId}
                  onChange={(v) => set('nurseId', v)}
                  options={nurses.map((n) => ({ value: n.id, label: n.nombre }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="et-fecha">Fecha</label>
                <FormSelect
                  id="et-fecha"
                  value={String(form.dayIdx)}
                  onChange={(v) => set('dayIdx', Number(v))}
                  options={days.map((d, i) => ({ value: String(i), label: diaLargoLabel(d, i) }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="et-tipo">Tipo de turno</label>
                <FormSelect id="et-tipo" value={form.tipo} onChange={handleTipoChange} options={TIPO_OPTIONS} />
              </div>
              <div className="form-field">
                <label>Área o servicio</label>
                <div className="tf-readonly-value">{AREA_TURNO_LABEL[formNurse?.area]}</div>
              </div>

              <div className="form-field">
                <label htmlFor="et-hora-inicio">Hora de inicio</label>
                <input id="et-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="et-hora-fin">Hora de finalización</label>
                <input id="et-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `ReasignarTurnoModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './ReasignarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuTriangleAlert, LuUserRoundCog } from 'react-icons/lu';

// "Reasignar turno" — a diferencia de Editar, fecha/horario/tipo/área quedan
// fijos (encargo explícito): lo único que cambia es QUIÉN cubre ese turno.
// "Disponible" se calcula sobre `nurses` (el personal de la programación
// activa, no el roster completo — mismo criterio que AsignarTurnoModal/
// EditarTurnoModal) cuya celda ese mismo día está en Descanso o Sin asignar.
export default function ReasignarTurnoModal({
  nurseId, dayIdx, cell, schedule, days, nurses, onClose, onConfirm,
}) {
  const nurse = nurses.find((n) => n.id === nurseId);
  const disponibles = nurses.filter((n) => (
    n.id !== nurseId && ['vacio', 'descanso'].includes(schedule[n.id][dayIdx].estado)
  ));
  const [nuevaEnfermeraId, setNuevaEnfermeraId] = useState('');

  const nuevaEnfermera = nurses.find((n) => n.id === nuevaEnfermeraId);
  const reemplazaDescanso = nuevaEnfermeraId && schedule[nuevaEnfermeraId][dayIdx].estado === 'descanso';

  function handleSubmit(e) {
    e.preventDefault();
    if (!nuevaEnfermeraId) return;
    onConfirm(nurseId, dayIdx, nuevaEnfermeraId);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card rt-modal-card" role="dialog" aria-modal="true" aria-labelledby="reasignar-turno-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuUserRoundCog}
            tone="primary"
            title="Reasignar turno"
            titleId="reasignar-turno-title"
            subtitle={`${nurse?.nombre} · ${diaLargoLabel(days[dayIdx], dayIdx)}`}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rt-fixed">
              <div className="tf-readonly-value">{TIPO_TURNO_META[cell.tipo].label} · {cell.horario}</div>
              <div className="tf-readonly-value">{AREA_TURNO_LABEL[nurse?.area]}</div>
            </div>

            <div className="form-field">
              <label htmlFor="rt-enfermera">Nueva enfermera</label>
              <FormSelect
                id="rt-enfermera"
                value={nuevaEnfermeraId}
                onChange={setNuevaEnfermeraId}
                placeholder="Selecciona una enfermera disponible"
                options={disponibles.map((n) => ({ value: n.id, label: n.nombre }))}
              />
            </div>

            {reemplazaDescanso && (
              <div className="tf-warning-note">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                Este cambio reemplazará el descanso programado de {nuevaEnfermera.nombre} ese día.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!nuevaEnfermeraId}>Reasignar turno</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionTurnos/ProgramacionTurnos/EditarTurnoModal/EditarTurnoModal.jsx src/Components/GestionTurnos/ProgramacionTurnos/ReasignarTurnoModal/ReasignarTurnoModal.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/GestionTurnos/ProgramacionTurnos/EditarTurnoModal/EditarTurnoModal.jsx src/Components/GestionTurnos/ProgramacionTurnos/ReasignarTurnoModal/ReasignarTurnoModal.jsx
git commit -m "$(cat <<'EOF'
Scope EditarTurnoModal/ReasignarTurnoModal nurse pickers to the active programación

Both modals looked up the global NURSES list directly, which would crash
against the new per-programación schedule (schedule only has entries for
the active programación's nurseIds). Both now take a `nurses` prop instead.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: ProgramacionTurnos.jsx — wire the programaciones map, empty state, and header actions

**Files:**
- Modify: `src/Components/GestionTurnos/ProgramacionTurnos/ProgramacionTurnos.jsx`
- Modify: `src/Components/GestionTurnos/ProgramacionTurnos/ProgramacionTurnos.css`

**Interfaces:**
- Consumes: `PROGRAMACIONES_SEED`, `resolverProgramacion` (Task 1); `NuevaProgramacionWizard` (Task 2); `RevisionProgramacionModal` (Task 3); updated `AsignarTurnoModal`/`EditarTurnoModal`/`ReasignarTurnoModal` (Tasks 4-5).
- Produces: the fully wired screen — no other file depends on this one.

- [ ] **Step 1: Replace `ProgramacionTurnos.jsx`**

```jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionTurnos.css';
import './ProgramacionTurnos.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import GestionTurnosSidebar from '../GestionTurnosSidebar/GestionTurnosSidebar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import FilterDropdown from '@/Components/FilterDropdown/FilterDropdown';
import TurnosCalendar from './TurnosCalendar/TurnosCalendar';
import EditarTurnoModal from './EditarTurnoModal/EditarTurnoModal';
import ReasignarTurnoModal from './ReasignarTurnoModal/ReasignarTurnoModal';
import AsignarTurnoModal from './AsignarTurnoModal/AsignarTurnoModal';
import NuevaProgramacionWizard from './NuevaProgramacionWizard/NuevaProgramacionWizard';
import RevisionProgramacionModal from './RevisionProgramacionModal/RevisionProgramacionModal';
import {
  AREAS_TURNOS, NURSES, PROGRAMACIONES_SEED, SEMANA_ANCLA, addDias, diasDeSemana, rangoSemanaLabel, resolverProgramacion,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import {
  LuCalendarPlus, LuCalendarRange, LuChevronLeft, LuChevronRight, LuClipboardCheck, LuPlus, LuSearch, LuTriangleAlert, LuUserRoundX, LuUsers,
} from 'react-icons/lu';

const TIPO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'manana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];
const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'programado', label: 'Programado' },
  { value: 'sin-asignar', label: 'Sin asignar' },
  { value: 'con-conflicto', label: 'Con conflicto' },
];

// Sección "Planificación → Programación de turnos" de Gestión de turnos (ver
// GestionTurnosSidebar). El calendario ya no lee de un `schedule`/`NURSES`
// globales fijos: `programaciones` es un mapa keyed por período (ver
// mockProgramacionData.js, resolverProgramacion) — cada semana/mes tiene su
// propia programación (período/área/personal/estado/schedule) o ninguna,
// disparando el estado vacío de la sección 1 del encargo (ver
// docs/superpowers/specs/2026-08-28-programacion-turnos-flujo-design.md).
//
// Estado de interacción de celda (sin cambios respecto a antes):
//  - `selectedCell` controla el popover de detalle abierto (turno/
//    conflicto/descanso) — un solo popover a la vez, en toda la grilla.
//  - `modal` controla el modal de formulario abierto (Editar/Reasignar/
//    Asignar) — se reutilizan los 3 mismos componentes sin importar desde
//    qué celda o botón se llegó.
export default function ProgramacionTurnos() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [weekStart, setWeekStart] = useState(SEMANA_ANCLA);
  const [areaOperativa, setAreaOperativa] = useState('todas');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [query, setQuery] = useState('');
  // Mapa de programaciones keyed por período — nunca se muta directamente,
  // mismo criterio que el `schedule` local de siempre.
  const [programaciones, setProgramaciones] = useState(PROGRAMACIONES_SEED);
  const [selectedCell, setSelectedCell] = useState(null);
  const [modal, setModal] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);

  const days = useMemo(() => diasDeSemana(weekStart), [weekStart]);
  const rangeLabel = useMemo(() => rangoSemanaLabel(weekStart), [weekStart]);

  const resuelto = useMemo(() => resolverProgramacion(programaciones, weekStart), [programaciones, weekStart]);
  const programacionActiva = resuelto?.programacion ?? null;
  const activePeriodKey = resuelto?.periodKey ?? null;
  const schedule = programacionActiva?.schedule ?? {};

  // Personal de la programación activa (subconjunto de NURSES) — nada se
  // pinta ni se filtra más abajo sin pasar primero por acá.
  const nursesPrograma = useMemo(() => {
    if (!programacionActiva) return [];
    return NURSES.filter((n) => programacionActiva.nurseIds.includes(n.id));
  }, [programacionActiva]);

  const nursesArea = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nursesPrograma.filter((n) => {
      if (areaOperativa !== 'todas' && n.area !== areaOperativa) return false;
      if (q && !n.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [nursesPrograma, areaOperativa, query]);

  // Enfermeras que de verdad se pintan en la grilla — además de área/
  // búsqueda, aplica Tipo de turno/Estado (incluido el filtro que dispara el
  // footer al hacer click en "sin asignar"/"conflicto", ver
  // handleFiltrarResumen más abajo, ya existente).
  const nurses = useMemo(() => nursesArea.filter((n) => {
    const celdas = schedule[n.id];
    if (tipoFiltro !== 'todos' && !celdas.some((c) => c.estado === 'turno' && c.tipo === tipoFiltro)) return false;
    if (estadoFiltro === 'programado' && !celdas.some((c) => c.estado === 'turno')) return false;
    if (estadoFiltro === 'sin-asignar' && !celdas.some((c) => c.estado === 'vacio')) return false;
    if (estadoFiltro === 'con-conflicto' && !celdas.some((c) => c.conflicto)) return false;
    return true;
  }), [nursesArea, tipoFiltro, estadoFiltro, schedule]);

  const resumen = useMemo(() => {
    let turnos = 0; let sinAsignar = 0; let conflictos = 0;
    nursesArea.forEach((n) => {
      schedule[n.id].forEach((c) => {
        if (c.estado === 'turno') turnos += 1;
        if (c.estado === 'vacio') sinAsignar += 1;
        if (c.conflicto) conflictos += 1;
      });
    });
    return { enfermeras: nursesArea.length, turnos, sinAsignar, conflictos };
  }, [nursesArea, schedule]);

  function nombreDe(nurseId) {
    return NURSES.find((n) => n.id === nurseId)?.nombre;
  }

  // Aplica `updater(scheduleActual)` sobre el schedule de la programación
  // resuelta para la semana visible — punto único de mutación para todos
  // los handlers de abajo, así ninguno necesita saber si `activePeriodKey`
  // es una clave de semana o de mes.
  function updateActiveSchedule(updater) {
    if (!activePeriodKey) return;
    setProgramaciones((prev) => ({
      ...prev,
      [activePeriodKey]: { ...prev[activePeriodKey], schedule: updater(prev[activePeriodKey].schedule) },
    }));
  }

  function handleOpenPopover(nurseId, dayIdx) {
    const misma = selectedCell?.nurseId === nurseId && selectedCell?.dayIdx === dayIdx;
    setSelectedCell(misma ? null : { nurseId, dayIdx });
  }
  function handleClosePopover() {
    setSelectedCell(null);
  }

  function handleOpenAsignar(nurseId, dayIdx, opts) {
    setSelectedCell(null);
    setModal({
      type: 'asignar', nurseId, dayIdx, locked: true, reemplazaDescanso: opts?.reemplazaDescanso ?? false,
    });
  }
  function handleOpenAsignarHeader() {
    setSelectedCell(null);
    setModal({
      type: 'asignar', nurseId: null, dayIdx: null, locked: false, reemplazaDescanso: false,
    });
  }
  function handleEditar(nurseId, dayIdx) {
    setSelectedCell(null);
    setModal({ type: 'editar', nurseId, dayIdx });
  }
  function handleReasignar(nurseId, dayIdx) {
    setSelectedCell(null);
    setModal({ type: 'reasignar', nurseId, dayIdx });
  }
  function handleCloseModal() {
    setModal(null);
  }

  function handleEliminar(nurseId, dayIdx) {
    updateActiveSchedule((sched) => ({
      ...sched,
      [nurseId]: sched[nurseId].map((c, i) => (i === dayIdx ? { estado: 'vacio' } : c)),
    }));
    setSelectedCell(null);
    window.ncToast?.(`Turno de ${nombreDe(nurseId)} eliminado.`);
  }

  function handleResolverConflicto(nurseId, dayIdx) {
    updateActiveSchedule((sched) => ({
      ...sched,
      [nurseId]: sched[nurseId].map((c, i) => {
        if (i !== dayIdx) return c;
        const { conflicto, conflictoNota, conflictoOtro, ...resto } = c;
        return resto;
      }),
    }));
    setSelectedCell(null);
    window.ncToast?.('Conflicto resuelto.');
  }

  function handleEditarDescanso(nurseId) {
    setSelectedCell(null);
    window.ncToast?.(`Editar descanso de ${nombreDe(nurseId)} (en desarrollo).`);
  }

  function handleSaveEditar(originalNurseId, originalDayIdx, updates) {
    updateActiveSchedule((sched) => {
      const moviendo = updates.nurseId !== originalNurseId || updates.dayIdx !== originalDayIdx;
      const next = moviendo
        ? { ...sched, [originalNurseId]: sched[originalNurseId].map((c, i) => (i === originalDayIdx ? { estado: 'vacio' } : c)) }
        : { ...sched };
      const destino = [...next[updates.nurseId]];
      destino[updates.dayIdx] = { estado: 'turno', tipo: updates.tipo, horario: updates.horario };
      next[updates.nurseId] = destino;
      return next;
    });
    setModal(null);
    window.ncToast?.('Turno actualizado.');
  }

  function handleConfirmReasignar(originalNurseId, dayIdx, nuevaEnfermeraId) {
    updateActiveSchedule((sched) => {
      const original = sched[originalNurseId][dayIdx];
      return {
        ...sched,
        [originalNurseId]: sched[originalNurseId].map((c, i) => (i === dayIdx ? { estado: 'vacio' } : c)),
        [nuevaEnfermeraId]: sched[nuevaEnfermeraId].map((c, i) => (
          i === dayIdx ? { estado: 'turno', tipo: original.tipo, horario: original.horario } : c
        )),
      };
    });
    setModal(null);
    window.ncToast?.(`Turno reasignado a ${nombreDe(nuevaEnfermeraId)}.`);
  }

  function handleAssign({
    nurseId, dayIdxs, tipo, horario,
  }) {
    updateActiveSchedule((sched) => ({
      ...sched,
      [nurseId]: sched[nurseId].map((c, i) => (dayIdxs.includes(i) ? { estado: 'turno', tipo, horario } : c)),
    }));
    setModal(null);
    window.ncToast?.(`Turno asignado a ${nombreDe(nurseId)}.`);
  }

  function handleAbrirWizard() {
    setWizardOpen(true);
  }
  function handleCerrarWizard() {
    setWizardOpen(false);
  }
  function handleCrearProgramacion({
    periodKey, programacion, weekStart: nuevoWeekStart, area,
  }) {
    setProgramaciones((prev) => ({ ...prev, [periodKey]: programacion }));
    setWeekStart(nuevoWeekStart);
    setAreaOperativa(area);
    setWizardOpen(false);
    window.ncToast?.('Programación creada.');
  }

  function handlePublicar() {
    if (!activePeriodKey) return;
    setProgramaciones((prev) => ({
      ...prev,
      [activePeriodKey]: { ...prev[activePeriodKey], estado: 'publicada' },
    }));
    setRevisionOpen(false);
    window.ncToast?.('Programación publicada correctamente.');
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de turnos', href: '/gestion-turnos' }]}
          page="Programación de turnos"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ct-content">
          <GestionTurnosSidebar />

          <div className="ct-page-body">
            <div className="tu-header">
              <div>
                <h1>
                  Programación de turnos
                  {programacionActiva?.estado === 'publicada' && <span className="tu-badge-publicada">Publicada</span>}
                </h1>
                <p>Gestiona la asignación y cobertura del personal de enfermería.</p>
              </div>
              <div className="tu-header-actions">
                <AreaSelector label="Área o servicio" options={AREAS_TURNOS} value={areaOperativa} onChange={setAreaOperativa} />
                <button type="button" className="date-picker-btn" onClick={() => window.ncToast?.('Vista mensual en desarrollo.')}>
                  <LuCalendarRange className="icon" />
                  Semana
                </button>
                {programacionActiva?.estado === 'borrador' && (
                  <Button variant="outline" icon={LuClipboardCheck} onClick={() => setRevisionOpen(true)}>Revisar programación</Button>
                )}
                {programacionActiva && (
                  <Button icon={LuPlus} onClick={handleOpenAsignarHeader}>Asignar turno</Button>
                )}
                <Button icon={LuCalendarPlus} onClick={handleAbrirWizard}>Nueva programación</Button>
              </div>
            </div>

            <div className="card tu-calendar-card">
              <div className="tu-calendar-header">
                <div className="day-nav">
                  <button type="button" className="day-nav-btn" aria-label="Semana anterior" onClick={() => setWeekStart((w) => addDias(w, -7))}>
                    <LuChevronLeft className="icon" />
                  </button>
                  <span className="day-nav-label">{rangeLabel}</span>
                  <button type="button" className="day-nav-btn" aria-label="Semana siguiente" onClick={() => setWeekStart((w) => addDias(w, 7))}>
                    <LuChevronRight className="icon" />
                  </button>
                  <button type="button" className="day-nav-today-btn" onClick={() => setWeekStart(SEMANA_ANCLA)}>Hoy</button>
                </div>

                <div className="filter-spacer" />

                <div className="tu-filters">
                  <FilterDropdown label="Tipo de turno" options={TIPO_OPTIONS} value={tipoFiltro} onChange={setTipoFiltro} />
                  <FilterDropdown label="Estado" options={ESTADO_OPTIONS} value={estadoFiltro} onChange={setEstadoFiltro} />
                  <div className="search-field">
                    <LuSearch className="icon" />
                    <input
                      type="text"
                      placeholder="Buscar enfermera..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label="Buscar enfermera"
                    />
                  </div>
                </div>
              </div>

              {!programacionActiva ? (
                <div className="ct-empty-state">
                  <div className="ct-empty-icon"><LuCalendarRange className="icon" aria-hidden="true" /></div>
                  <div className="ct-empty-title">No hay una programación para este período</div>
                  <div className="ct-empty-sub">Selecciona el período, el área y el personal para comenzar a asignar turnos.</div>
                  <Button icon={LuCalendarPlus} onClick={handleAbrirWizard} className="tu-empty-cta">Iniciar programación</Button>
                </div>
              ) : (
                <>
                  <TurnosCalendar
                    nurses={nurses}
                    days={days}
                    schedule={schedule}
                    selectedCell={selectedCell}
                    onOpenPopover={handleOpenPopover}
                    onClosePopover={handleClosePopover}
                    onOpenAsignar={handleOpenAsignar}
                    onEditar={handleEditar}
                    onReasignar={handleReasignar}
                    onEliminar={handleEliminar}
                    onResolverConflicto={handleResolverConflicto}
                    onEditarDescanso={handleEditarDescanso}
                  />

                  <div className="tu-summary" aria-label="Resumen de la programación">
                    <div className="tu-summary-group">
                      <span className="tu-summary-item">
                        <LuUsers className="icon" aria-hidden="true" />
                        {resumen.enfermeras} enfermeras
                      </span>
                      <span className="tu-summary-dot" aria-hidden="true">·</span>
                      <span className="tu-summary-item">
                        <LuClipboardCheck className="icon" aria-hidden="true" />
                        {resumen.turnos} turnos programados
                      </span>
                    </div>

                    {(resumen.sinAsignar > 0 || resumen.conflictos > 0) && (
                      <>
                        <span className="tu-summary-divider" aria-hidden="true" />
                        <div className="tu-summary-group">
                          {resumen.sinAsignar > 0 && (
                            <button
                              type="button"
                              className={`tu-summary-item warn tu-summary-clickable${estadoFiltro === 'sin-asignar' ? ' active' : ''}`}
                              aria-pressed={estadoFiltro === 'sin-asignar'}
                              onClick={() => setEstadoFiltro((f) => (f === 'sin-asignar' ? 'todos' : 'sin-asignar'))}
                            >
                              <LuUserRoundX className="icon" aria-hidden="true" />
                              {resumen.sinAsignar} sin asignar
                            </button>
                          )}
                          {resumen.sinAsignar > 0 && resumen.conflictos > 0 && (
                            <span className="tu-summary-dot" aria-hidden="true">·</span>
                          )}
                          {resumen.conflictos > 0 && (
                            <button
                              type="button"
                              className={`tu-summary-item danger tu-summary-clickable${estadoFiltro === 'con-conflicto' ? ' active' : ''}`}
                              aria-pressed={estadoFiltro === 'con-conflicto'}
                              onClick={() => setEstadoFiltro((f) => (f === 'con-conflicto' ? 'todos' : 'con-conflicto'))}
                            >
                              <LuTriangleAlert className="icon" aria-hidden="true" />
                              {resumen.conflictos} {resumen.conflictos === 1 ? 'conflicto' : 'conflictos'}
                            </button>
                          )}
                          {estadoFiltro === 'sin-asignar' || estadoFiltro === 'con-conflicto' ? (
                            <button type="button" className="tu-summary-reset" onClick={() => setEstadoFiltro('todos')}>
                              Ver todos
                            </button>
                          ) : null}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal?.type === 'editar' && (
        <EditarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          cell={schedule[modal.nurseId][modal.dayIdx]}
          days={days}
          nurses={nursesPrograma}
          onClose={handleCloseModal}
          onSave={handleSaveEditar}
        />
      )}
      {modal?.type === 'reasignar' && (
        <ReasignarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          cell={schedule[modal.nurseId][modal.dayIdx]}
          schedule={schedule}
          days={days}
          nurses={nursesPrograma}
          onClose={handleCloseModal}
          onConfirm={handleConfirmReasignar}
        />
      )}
      {modal?.type === 'asignar' && (
        <AsignarTurnoModal
          nurseId={modal.nurseId}
          dayIdx={modal.dayIdx}
          days={days}
          nurses={nursesPrograma}
          locked={modal.locked}
          reemplazaDescanso={modal.reemplazaDescanso}
          onClose={handleCloseModal}
          onAssign={handleAssign}
        />
      )}
      {wizardOpen && (
        <NuevaProgramacionWizard
          initialWeekStart={weekStart}
          initialArea={areaOperativa}
          onClose={handleCerrarWizard}
          onCreate={handleCrearProgramacion}
        />
      )}
      {revisionOpen && (
        <RevisionProgramacionModal
          resumen={resumen}
          onClose={() => setRevisionOpen(false)}
          onPublicar={handlePublicar}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Append badge/empty-CTA styles to `ProgramacionTurnos.css`**

Append at the end of the file:

```css
/* Badge "Publicada" junto al <h1> (encargo sección 8: "la interfaz debe
   diferenciar visualmente que está publicada") — mismo tono verde que
   .tc-turno-noche en TurnosCalendar.css, reutilizado acá para no inventar
   un color de estado nuevo. */
.tu-badge-publicada{
  display:inline-flex;align-items:center;margin-left:10px;vertical-align:middle;
  font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:#0d7a3d;
  background:var(--green-bg);padding:3px 10px;border-radius:20px;letter-spacing:.02em;
}
/* CTA del estado vacío (.ct-empty-state, ver ../GestionTurnos.css) —
   separación extra sobre el texto de ayuda, ya que Button.jsx usa CSS
   Modules (sin clase global .btn que targetear desde acá). */
.tu-empty-cta{margin-top:4px;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/GestionTurnos/ProgramacionTurnos/ProgramacionTurnos.jsx`
Expected: no errors.

- [ ] **Step 4: Start the dev server and smoke test**

Run: `npm run dev` (leave running), then open `/gestion-turnos/programacion` (or whatever route renders `ProgramacionTurnos` — check `src/app/**` if unsure) in a browser.

Check:
1. Screen loads on 18–24 Ago 2026 with the 8-nurse calendar exactly as before, and a green "Publicada" badge now appears next to the `<h1>`.
2. Click the week's next-arrow (`›`) repeatedly to reach an empty week — the calendar area is replaced by the "No hay una programación para este período" empty state; `[Revisar programación]` and `[Asignar turno]` are gone from the header, `[+ Nueva programación]` remains.
3. Click `[Iniciar programación]` (or `[+ Nueva programación]`) — wizard opens on step 1 with the visible week/area preselected. Continue through step 2 (uncheck a couple of nurses, confirm the counter updates) and step 3 (summary matches), then `[Crear programación]` — wizard closes, calendar now shows only the selected nurses, all cells "Sin asignar", no "Publicada" badge.
4. Click an empty cell → assign a turno (existing single-cell flow, unchanged). Click `[Asignar turno]` in the header → check 3 day checkboxes for one nurse, pick a tipo, submit → all 3 days update in the grid in one action.
5. `[Revisar programación]` with pending sin-asignar cells → only `[Volver al calendario]` is available. Manually assign every remaining cell, reopen `[Revisar programación]` → "Listo para publicar" + `[Publicar programación]` → click it → badge "Publicada" appears, `[Revisar programación]`/`[Asignar turno]` disappear from header (both are `borrador`/`programacionActiva`-gated).

Expected: all 5 checks pass with no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/Components/GestionTurnos/ProgramacionTurnos/ProgramacionTurnos.jsx src/Components/GestionTurnos/ProgramacionTurnos/ProgramacionTurnos.css
git commit -m "$(cat <<'EOF'
Wire programaciones map, empty state, wizard, and revisión/publicación into ProgramacionTurnos

The screen now resolves a programación per visible week/month instead of
a single fixed schedule: empty periods show a call-to-action empty state,
"+ Nueva programación" opens the creation wizard, "Revisar programación"
opens the publish checklist, and a "Publicada" badge marks published
programaciones. All existing single-cell interactions are unchanged.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Post-plan note

This plan does not touch: `TurnosCalendar.jsx`/`TurnosCalendar.css`, `TurnoCellPopover.jsx` (receive the same props shape as before, just sourced differently upstream), the monthly view toggle (`Semana` button keeps its existing "en desarrollo" toast), or any file outside `src/Components/GestionTurnos/ProgramacionTurnos/` and `src/hooks/GestionTurnos/mockProgramacionData.js`. That matches the spec's explicit out-of-scope list (disponibilidad, patrones, restricciones, optimización, drag & drop, edición/despublicación de una programación publicada, vista mensual editable).
