# Programación de Sala de Cirugía V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder at `ProgramacionSalaCirugias.jsx` with a real surgery-room scheduling screen: a weekly hour-grid agenda with time-positioned surgery cards, a docked (drawer on narrow viewports) detail panel with 6 tabs, and 3 modals (create/urgent, reprogram, cancel) — all backed by an in-memory mock data store with real mutations.

**Architecture:** A new mock data module (`mockCirugiaData.js`) holds catalogs, a mutable in-memory `CIRUGIAS` array, an async `fetchAgendaSemana` and 4 sync mutation functions. `ProgramacionSalaCirugias.jsx` (orchestrator) owns `weekStart`/`sedeId`/`salaId`/`estado`/`cirugias`/`selectedId`/`modal` state, re-fetching on filter change and applying mutation results directly to its `cirugias` array (no re-fetch needed after a mutation). `AgendaSemana` positions `CirugiaCard`s on a CSS Grid (7 day columns × 30-minute row slots) using `gridRow`/`gridColumn` inline styles. `DetalleCirugiaPanel` renders docked inline on desktop and as an overlay drawer below 1024px (same content, wrapper differs), with 6 tab sub-components under `tabs/`. All modals share one `shared/shared.css` for `.modal-overlay`/`.modal-card`/`.form-field` base rules.

**Tech Stack:** Next.js (App Router) + React, plain CSS (no CSS-in-JS/Tailwind) except `@/Components/Button/Button` (CSS Modules), `react-icons/lu` (Lucide) for icons. No test framework is configured (`package.json` only has an `eslint` script) — verification steps use `npx eslint` on changed files plus a final manual smoke test in the dev server, same convention as `docs/superpowers/plans/2026-08-28-programacion-turnos-flujo.md`.

**Spec:** `docs/superpowers/specs/2026-08-31-programacion-sala-cirugia-design.md`

## Global Constraints

- Every new component folder = exactly `ComponentName.jsx` + `ComponentName.css` (AGENTS.md "Component organization").
- Every modal uses `@/Components/ModalHeader/ModalHeader` — never a hand-rolled header.
- No native `<select>` inside a `.form-field` — use `FormSelect`, never a raw `<select>`.
- `font-size`/`font-weight` in any new CSS use the `--fs-*`/`--fw-*` tokens from `globals.css` — never a raw px/600 value. Headings use `--fw-semibold`, never `--fw-bold`.
- Button structure (radius/padding/icon size/focus outline) uses the `--btn-*` tokens from `globals.css` wherever a hand-rolled button-like control is built outside `@/Components/Button/Button` (e.g. split-button toggles, dropdown triggers).
- New buttons that are simple actions use `@/Components/Button/Button` (`variant`/`size`/`icon` props) instead of hand-rolled `<button className="btn ...">`.
- All new components import icons from `react-icons/lu` (`Lu*` names) — every icon name used in this plan has been confirmed to exist in the installed `react-icons/lu` package.
- All new `.jsx` files start with `'use client'`.
- Mock data is deterministic — never `Math.random()` or `Date.now()`-based ids in seed data.
- `CIRUGIAS` (the module-level store in `mockCirugiaData.js`) is never mutated in place — every mutation function reassigns `CIRUGIAS` to a new array (`.map`/`.filter`/spread), same rule as `programaciones` in the turnos-flujo plan.
- Every status badge/card shows the status as text, never color alone (WCAG — matches existing `TurnoBadges`/`EstadoCamaBadge` convention).

---

## File Structure

```
src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js                          (new)

src/Components/ProgramacionSalaCirugias/
  ProgramacionSalaCirugias.jsx / .css                                          (rewrite placeholder)
  shared/shared.css                                                            (new)
  EstadoCirugiaBadge/EstadoCirugiaBadge.jsx / .css                             (new)
  CirugiaCard/CirugiaCard.jsx / .css                                           (new)
  AgendaSemana/AgendaSemana.jsx / .css                                         (new)
  FiltrosBar/FiltrosBar.jsx / .css                                             (new)
  AccionesBar/AccionesBar.jsx / .css                                           (new)
  DetalleCirugiaPanel/
    DetalleCirugiaPanel.jsx / .css                                             (new)
    tabs/
      ResumenTab/ResumenTab.jsx / .css                                        (new)
      ProcedimientosTab/ProcedimientosTab.jsx / .css                          (new)
      PersonalTab/PersonalTab.jsx / .css                                      (new)
      EquiposTab/EquiposTab.jsx / .css                                        (new)
      InsumosTab/InsumosTab.jsx / .css                                        (new)
      FarmaciaTab/FarmaciaTab.jsx / .css                                      (new)
  modals/
    NuevaCirugiaModal/NuevaCirugiaModal.jsx / .css                            (new)
    ReprogramarCirugiaModal/ReprogramarCirugiaModal.jsx / .css                (new)
    CancelarCirugiaModal/CancelarCirugiaModal.jsx / .css                      (new)
```

---

### Task 1: Mock data module — catalogs, seed, fetch, mutations

**Files:**
- Create: `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`

**Interfaces:**
- Produces (all named exports): `SEDES`, `SALAS`, `ESTADO_FILTRO_OPTIONS`, `PROCEDIMIENTOS_CATALOGO`, `SERVICIOS_CATALOGO`, `TIPOS_CIRUGIA_CATALOGO`, `CIRUJANOS_CATALOGO`, `ANESTESIOLOGOS_CATALOGO`, `INSTRUMENTADORAS_CATALOGO`, `CIRCULANTES_CATALOGO`, `EQUIPOS_CATALOGO`, `CANASTAS_CATALOGO`, `EQUIPO_ESTADO_LABEL`, `FARMACIA_ESTADO_LABEL`, `INSUMO_ESTADO_LABEL`, `SEMANA_ANCLA` (Date), `fechaISO(date): string`, `addDias(date, n): Date`, `diasDeSemana(weekStart): {fecha,label,dayNum,isToday}[]`, `numeroSemanaISO(date): number`, `rangoSemanaLabel(weekStart): string`, `fechaLabel(fechaISOStr): string`, `fechaHoraLabel(isoDateTimeStr): string`, `lunesDeSemana(date): Date`, `duracionLabel(horaInicio, horaFin): string`, `fetchAgendaSemana({sedeId, salaId, weekStart, estado}): Promise<Cirugia[]>`, `crearCirugia(datos): Cirugia`, `actualizarCirugia(id, datos): Cirugia`, `actualizarEstadoCirugia(id, nuevoEstado): Cirugia`, `reprogramarCirugia(id, {fecha, horaInicio, horaFin, motivo}): Cirugia`, `cancelarCirugia(id, motivo): Cirugia`, where `Cirugia = { id, sedeId, salaId, paciente:{nombre,documento,edad,sexo,aseguradora}, procedimientoPrincipal, servicio, tipoCirugia, cirujano, fecha, horaInicio, horaFin, estado:'borrador'|'programada'|'urgencia'|'cancelada'|'incumplida', motivoCancelacion?, motivoReprogramacion?, procedimientos:[{nombre,tipo:'principal'|'secundario',duracionMin,notas}], personal:[{rol,nombre}], equipos:[{nombre,estado:'disponible'|'en-uso'|'mantenimiento'}], canasta:{nombre,items:[{nombre,cantidad,estado:'disponible'|'faltante'}]}, farmacia:{numeroPedido,estado:'en-preparacion'|'listo'|'entregado',fechaSolicitud,medicamentos:[{nombre,dosis}]} }`.

- [ ] **Step 1: Create the file**

```js
// Mock data de "Programación de Sala de Cirugía" — sin backend, mismo
// criterio que mockAdmisionesData.js/mockProgramacionData.js: datos
// deterministas (nunca Math.random), estado mutable en memoria vía un
// array module-level + funciones que lo reemplazan (nunca mutado in
// place), se resetea al recargar la página.

export const SEDES = [
  { value: '02', label: '02 - Sede Norte' },
  { value: '01', label: '01 - Sede Central' },
];

export const SALAS = [
  { value: 'qx-1', label: 'Quirófano #1', sedeId: '02' },
  { value: 'qx-2', label: 'Quirófano #2', sedeId: '02' },
  { value: 'qx-3', label: 'Quirófano #1', sedeId: '01' },
];

export const ESTADO_FILTRO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'programada', label: 'Programada' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'incumplida', label: 'Incumplida' },
];

export const PROCEDIMIENTOS_CATALOGO = [
  'Colecistectomía laparoscópica',
  'Apendicectomía',
  'Hernia inguinal',
  'Histerectomía',
  'Laparoscopia diagnóstica',
  'Hernia umbilical',
  'Artroscopia de rodilla',
];

export const SERVICIOS_CATALOGO = ['Cirugía general', 'Ginecología', 'Ortopedia', 'Urología'];
export const TIPOS_CIRUGIA_CATALOGO = ['Programada', 'Ambulatoria', 'Urgencia'];
export const CIRUJANOS_CATALOGO = ['Dr. Juan García', 'Dr. Carlos Martínez', 'Dra. Ana López', 'Dr. Andrés López'];
export const ANESTESIOLOGOS_CATALOGO = ['Dra. Ana López', 'Dr. Pedro Sánchez'];
export const INSTRUMENTADORAS_CATALOGO = ['María Fernández', 'Laura Gómez'];
export const CIRCULANTES_CATALOGO = ['Luis Ramírez', 'Andrés Molina'];

export const EQUIPOS_CATALOGO = [
  'Torre de laparoscopia',
  'Cauterio',
  'Mesa quirúrgica eléctrica',
  'Monitor de signos vitales',
  'Máquina de anestesia',
];

export const CANASTAS_CATALOGO = [
  {
    nombre: 'Colecistectomía estándar',
    items: [
      { nombre: 'Trocar 5mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Trocar 10mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Pinza Maryland', cantidad: 1, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 10, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 2-0', cantidad: 3, estado: 'disponible' },
      { nombre: 'Clips de titanio', cantidad: 6, estado: 'disponible' },
      { nombre: 'Aguja de Veress', cantidad: 1, estado: 'disponible' },
      { nombre: 'Bolsa de extracción', cantidad: 1, estado: 'disponible' },
      { nombre: 'Solución salina 1000ml', cantidad: 2, estado: 'disponible' },
      { nombre: 'Campo quirúrgico', cantidad: 4, estado: 'disponible' },
      { nombre: 'Guantes estériles talla 7', cantidad: 4, estado: 'disponible' },
      { nombre: 'Hoja de bisturí #11', cantidad: 2, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Apendicectomía estándar',
    items: [
      { nombre: 'Trocar 5mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Trocar 10mm', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 0', cantidad: 2, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 8, estado: 'disponible' },
      { nombre: 'Bolsa de extracción', cantidad: 1, estado: 'faltante' },
    ],
  },
  {
    nombre: 'Hernia inguinal estándar',
    items: [
      { nombre: 'Malla de polipropileno', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Prolene 2-0', cantidad: 2, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 6, estado: 'disponible' },
      { nombre: 'Grapadora de malla', cantidad: 1, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Ortopedia menor',
    items: [
      { nombre: 'Artroscopio 4mm', cantidad: 1, estado: 'disponible' },
      { nombre: 'Cánula de irrigación', cantidad: 2, estado: 'disponible' },
      { nombre: 'Sutura PDS 1', cantidad: 2, estado: 'disponible' },
      { nombre: 'Vendaje compresivo', cantidad: 2, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Ginecología mayor',
    items: [
      { nombre: 'Separador de Balfour', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 0', cantidad: 4, estado: 'disponible' },
      { nombre: 'Compresas abdominales', cantidad: 6, estado: 'disponible' },
      { nombre: 'Electrobisturí monopolar', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sonda vesical', cantidad: 1, estado: 'faltante' },
    ],
  },
];

export const EQUIPO_ESTADO_LABEL = { disponible: 'Disponible', 'en-uso': 'En uso', mantenimiento: 'Mantenimiento' };
export const FARMACIA_ESTADO_LABEL = { 'en-preparacion': 'En preparación', listo: 'Listo', entregado: 'Entregado' };
export const INSUMO_ESTADO_LABEL = { disponible: 'Disponible', faltante: 'Faltante' };

function pad2(n) { return String(n).padStart(2, '0'); }

export function fechaISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function addDias(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function lunesDeSemana(date) {
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDias(date, diff);
}

const DIA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function diasDeSemana(weekStart) {
  const hoyISO = fechaISO(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDias(weekStart, i);
    return {
      fecha: fechaISO(d),
      label: DIA_LABEL[d.getDay()],
      dayNum: `${d.getDate()} ${MES_CORTO[d.getMonth()]}`,
      isToday: fechaISO(d) === hoyISO,
    };
  });
}

// Algoritmo ISO 8601 estándar de número de semana (no se hardcodea a un
// valor fijo — cualquier semana navegada calcula el número real).
export function numeroSemanaISO(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function rangoSemanaLabel(weekStart) {
  const fin = addDias(weekStart, 6);
  const mismoMes = weekStart.getMonth() === fin.getMonth();
  const mesFin = mismoMes ? '' : ` - ${MES_LARGO[fin.getMonth()]}`;
  return `Semana ${numeroSemanaISO(weekStart)} - ${MES_LARGO[weekStart.getMonth()]}${mesFin} ${fin.getFullYear()}`;
}

export function fechaLabel(fechaISOStr) {
  const [y, m, d] = fechaISOStr.split('-').map(Number);
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

export function fechaHoraLabel(isoDateTimeStr) {
  const [fecha, hora] = isoDateTimeStr.split('T');
  return `${fechaLabel(fecha)} ${hora}`;
}

export function duracionLabel(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function periodKeyDeSemana(weekStart, salaId) {
  return `week:${fechaISO(weekStart)}:${salaId}`;
}

// Semilla: lunes 31 Ago 2026 (semana usada en la referencia visual del
// encargo). Solo sede '02' / sala 'qx-1' viene con datos completos —
// cualquier otra sala/semana arranca vacía (dispara el estado vacío de la
// agenda, ver spec).
export const SEMANA_ANCLA = new Date(2026, 7, 31);

let CIRUGIAS = [
  {
    id: '12345',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'María Pérez', documento: 'CC 52.123.456', edad: 45, sexo: 'Femenino', aseguradora: 'Salud Total EPS',
    },
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Juan García',
    fecha: '2026-08-31',
    horaInicio: '07:00',
    horaFin: '09:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 120, notas: 'Sin complicaciones esperadas.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Juan García' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'disponible' },
      { nombre: 'Monitor de signos vitales', estado: 'disponible' },
    ],
    canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4582', estado: 'en-preparacion', fechaSolicitud: '2026-08-30T14:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
    },
  },
  {
    id: '12346',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Juan Rodríguez', documento: 'CC 79.456.123', edad: 38, sexo: 'Masculino', aseguradora: 'Nueva EPS',
    },
    procedimientoPrincipal: 'Hernia inguinal',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Andrés López',
    fecha: '2026-08-31',
    horaInicio: '09:30',
    horaFin: '11:30',
    estado: 'borrador',
    procedimientos: [
      { nombre: 'Hernia inguinal', tipo: 'principal', duracionMin: 90, notas: 'Abordaje abierto.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Andrés López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Cauterio', estado: 'disponible' },
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
    ],
    canasta: { nombre: 'Hernia inguinal estándar', items: CANASTAS_CATALOGO[2].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4583', estado: 'listo', fechaSolicitud: '2026-08-30T09:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12347',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Ana Torres', documento: 'CC 41.789.456', edad: 52, sexo: 'Femenino', aseguradora: 'Sura EPS',
    },
    procedimientoPrincipal: 'Artroscopia de rodilla',
    servicio: 'Ortopedia',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-08-31',
    horaInicio: '12:00',
    horaFin: '14:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Artroscopia de rodilla', tipo: 'principal', duracionMin: 110, notas: 'Reparación de menisco.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
      { nombre: 'Monitor de signos vitales', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ortopedia menor', items: CANASTAS_CATALOGO[3].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4584', estado: 'entregado', fechaSolicitud: '2026-08-29T16:00',
      medicamentos: [{ nombre: 'Ketorolaco', dosis: '30mg IV' }],
    },
  },
  {
    id: '12348',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Carlos Gómez', documento: 'CC 11.222.333', edad: 60, sexo: 'Masculino', aseguradora: 'Coomeva EPS',
    },
    procedimientoPrincipal: 'Apendicectomía',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-09-01',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Apendicectomía', tipo: 'principal', duracionMin: 100, notas: 'Apendicitis no complicada.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'disponible' },
    ],
    canasta: { nombre: 'Apendicectomía estándar', items: CANASTAS_CATALOGO[1].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4585', estado: 'en-preparacion', fechaSolicitud: '2026-08-31T08:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Metronidazol', dosis: '500mg IV' }],
    },
  },
  {
    id: '12349',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Laura Sánchez', documento: 'CC 98.765.432', edad: 29, sexo: 'Femenino', aseguradora: 'Sanitas EPS',
    },
    procedimientoPrincipal: 'Laparoscopia diagnóstica',
    servicio: 'Ginecología',
    tipoCirugia: 'Urgencia',
    cirujano: 'Dra. Ana López',
    fecha: '2026-09-01',
    horaInicio: '11:00',
    horaFin: '13:00',
    estado: 'urgencia',
    procedimientos: [
      { nombre: 'Laparoscopia diagnóstica', tipo: 'principal', duracionMin: 110, notas: 'Dolor pélvico agudo, descartar embarazo ectópico.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dra. Ana López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'en-uso' },
      { nombre: 'Monitor de signos vitales', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ginecología mayor', items: CANASTAS_CATALOGO[4].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4586', estado: 'en-preparacion', fechaSolicitud: '2026-09-01T10:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12350',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Pedro Ramírez', documento: 'CC 33.444.555', edad: 47, sexo: 'Masculino', aseguradora: 'Salud Total EPS',
    },
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Juan García',
    fecha: '2026-09-02',
    horaInicio: '07:30',
    horaFin: '10:00',
    estado: 'borrador',
    procedimientos: [
      { nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 130, notas: 'Colecistitis crónica.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Juan García' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'mantenimiento' },
    ],
    canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4587', estado: 'listo', fechaSolicitud: '2026-09-01T15:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12351',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Marta Ruiz', documento: 'CC 22.333.444', edad: 41, sexo: 'Femenino', aseguradora: 'Nueva EPS',
    },
    procedimientoPrincipal: 'Histerectomía',
    servicio: 'Ginecología',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Andrés López',
    fecha: '2026-09-03',
    horaInicio: '08:00',
    horaFin: '10:30',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Histerectomía', tipo: 'principal', duracionMin: 150, notas: 'Vía abdominal.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Andrés López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ginecología mayor', items: CANASTAS_CATALOGO[4].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4588', estado: 'en-preparacion', fechaSolicitud: '2026-09-02T11:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
    },
  },
  {
    id: '12352',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Andrés Molina', documento: 'CC 55.666.777', edad: 34, sexo: 'Masculino', aseguradora: 'Sura EPS',
    },
    procedimientoPrincipal: 'Hernia umbilical',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-09-04',
    horaInicio: '11:00',
    horaFin: '13:00',
    estado: 'borrador',
    procedimientos: [
      { nombre: 'Hernia umbilical', tipo: 'principal', duracionMin: 100, notas: 'Reparación con malla.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Cauterio', estado: 'disponible' },
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
    ],
    canasta: { nombre: 'Hernia inguinal estándar', items: CANASTAS_CATALOGO[2].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4589', estado: 'en-preparacion', fechaSolicitud: '2026-09-03T09:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
];

let nextIdSeq = 12353;

export function fetchAgendaSemana({
  sedeId, salaId, weekStart, estado = 'todos',
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inicio = fechaISO(weekStart);
      const fin = fechaISO(addDias(weekStart, 6));
      const items = CIRUGIAS.filter((c) => {
        if (c.sedeId !== sedeId || c.salaId !== salaId) return false;
        if (c.fecha < inicio || c.fecha > fin) return false;
        if (estado !== 'todos' && c.estado !== estado) return false;
        return true;
      });
      resolve(items);
    }, 250);
  });
}

export function crearCirugia(datos) {
  const id = String(nextIdSeq);
  nextIdSeq += 1;
  const { urgencia, ...resto } = datos;
  const cirugia = { id, estado: urgencia ? 'urgencia' : 'borrador', ...resto };
  CIRUGIAS = [...CIRUGIAS, cirugia];
  return cirugia;
}

export function actualizarCirugia(id, datos) {
  CIRUGIAS = CIRUGIAS.map((c) => (c.id === id ? { ...c, ...datos } : c));
  return CIRUGIAS.find((c) => c.id === id);
}

export function actualizarEstadoCirugia(id, nuevoEstado) {
  return actualizarCirugia(id, { estado: nuevoEstado });
}

export function reprogramarCirugia(id, {
  fecha, horaInicio, horaFin, motivo,
}) {
  return actualizarCirugia(id, {
    fecha, horaInicio, horaFin, motivoReprogramacion: motivo,
  });
}

export function cancelarCirugia(id, motivo) {
  return actualizarCirugia(id, { estado: 'cancelada', motivoCancelacion: motivo });
}
```

- [ ] **Step 2: Lint the file**

Run: `npx eslint src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js
git commit -m "$(cat <<'EOF'
Add mock data module for Programación de Sala de Cirugía

Catalogs (sedes/salas/procedimientos/canastas), date helpers, an
8-record seed for sala qx-1's semana 2026-08-31, an async
fetchAgendaSemana, and 4 sync mutation functions over an in-memory
CIRUGIAS store.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Page tokens + `EstadoCirugiaBadge`

**Files:**
- Modify: `src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.css`
- Create: `src/Components/ProgramacionSalaCirugias/EstadoCirugiaBadge/EstadoCirugiaBadge.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/EstadoCirugiaBadge/EstadoCirugiaBadge.css`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: CSS tokens `--green`/`--green-bg`, `--red`/`--red-bg`, `--violet-bg`/`--violet-fg`, `--blue-bg`/`--blue-fg`, `--amber-bg`/`--amber-fg`, `--interactive-selected-bg`/`--interactive-selected-border`/`--interactive-selected-text`, `--space-2`/`--space-3`, `--z-sticky`/`--z-popover`/`--z-modal` on `ProgramacionSalaCirugias.css`'s `:root` (consumed by every later task in this plan). `EstadoCirugiaBadge({ estado: 'borrador'|'programada'|'urgencia'|'cancelada'|'incumplida', size?: 'base'|'sm' })` — default export.

- [ ] **Step 1: Add the missing tokens to `ProgramacionSalaCirugias.css`**

Find the existing `:root{...}` block (ends right before `--input-lg:44px;\n}`) and insert these lines right after `--radius-lg:12px;`:

```css
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
```

Then find the existing `html[data-theme="dark"]{...}` block (ends right before `--gray-bg:#242c3d;\n}`) and insert these lines right after `--gray-bg:#242c3d;`:

```css
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
```

- [ ] **Step 2: Create `EstadoCirugiaBadge.jsx`**

```jsx
'use client';

import './EstadoCirugiaBadge.css';
import {
  LuCalendarX, LuCircleCheck, LuCircleX, LuPencil, LuTriangleAlert,
} from 'react-icons/lu';

// Ícono + texto siempre visibles (nunca solo color, ver AGENTS.md/WCAG) —
// mismo patrón "píldora" que TurnoBadges/EstadoCamaBadge, un componente por
// feature en vez de una clase .badge genérica compartida.
const META = {
  borrador: { label: 'Borrador', icon: LuPencil, tone: 'blue' },
  programada: { label: 'Programada', icon: LuCircleCheck, tone: 'green' },
  urgencia: { label: 'Urgencia', icon: LuTriangleAlert, tone: 'violet' },
  cancelada: { label: 'Cancelada', icon: LuCircleX, tone: 'red' },
  incumplida: { label: 'Incumplida', icon: LuCalendarX, tone: 'gray' },
};

export default function EstadoCirugiaBadge({ estado, size = 'base' }) {
  const meta = META[estado];
  const Icon = meta.icon;
  return (
    <span className={`esb-badge esb-${meta.tone} esb-${size}`}>
      <Icon className="icon" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
```

- [ ] **Step 3: Create `EstadoCirugiaBadge.css`**

```css
.esb-badge{display:inline-flex;align-items:center;gap:6px;font-weight:var(--fw-semibold);border-radius:20px;padding:4px 10px;white-space:nowrap;}
.esb-badge .icon{flex-shrink:0;}
.esb-base{font-size:var(--fs-xs);}
.esb-base .icon{width:13px;height:13px;}
.esb-sm{font-size:var(--fs-xs);padding:3px 8px;}
.esb-sm .icon{width:11px;height:11px;}

.esb-green{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .esb-green{color:var(--green);}
.esb-blue{background:var(--blue-bg);color:var(--blue-fg);}
.esb-violet{background:var(--violet-bg);color:var(--violet-fg);}
.esb-red{background:var(--red-bg);color:var(--red);}
.esb-gray{background:var(--gray-bg);color:var(--gray-fg);}
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/EstadoCirugiaBadge`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.css src/Components/ProgramacionSalaCirugias/EstadoCirugiaBadge
git commit -m "$(cat <<'EOF'
Add status color tokens and EstadoCirugiaBadge

Adds green/red/violet/blue/amber + interactive-selected + z-index
tokens to the page root, and a status badge (icon+text, never color
alone) for the 5 cirugía states.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: `CirugiaCard`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/CirugiaCard/CirugiaCard.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/CirugiaCard/CirugiaCard.css`

**Interfaces:**
- Consumes (Task 2): `EstadoCirugiaBadge`.
- Produces: `CirugiaCard({ cirugia: Cirugia, selected: boolean, onClick: () => void, style?: object })` — default export. `style` is passed straight to the root element (used by `AgendaSemana` in Task 4 to position it on the grid via `gridColumn`/`gridRow`).

- [ ] **Step 1: Create `CirugiaCard.jsx`**

```jsx
'use client';

import './CirugiaCard.css';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';

// Jerarquía fija horario→paciente→procedimiento→cirujano→estado (spec
// sección "Tarjeta de cirugía"). `style` viene de AgendaSemana (posición en
// la grilla) — este componente no sabe nada de horas/slots.
export default function CirugiaCard({
  cirugia, selected, onClick, style,
}) {
  return (
    <button
      type="button"
      className={`cc-card cc-${cirugia.estado}${selected ? ' selected' : ''}`}
      style={style}
      onClick={onClick}
    >
      <span className="cc-horario">{cirugia.horaInicio} – {cirugia.horaFin}</span>
      <span className="cc-paciente">{cirugia.paciente.nombre}</span>
      <span className="cc-procedimiento">{cirugia.procedimientoPrincipal}</span>
      <span className="cc-cirujano">{cirugia.cirujano}</span>
      <EstadoCirugiaBadge estado={cirugia.estado} size="sm" />
    </button>
  );
}
```

- [ ] **Step 2: Create `CirugiaCard.css`**

```css
.cc-card{
  display:flex;flex-direction:column;gap:2px;text-align:left;
  border-radius:6px;border:1px solid var(--border);border-left-width:3px;
  padding:5px 7px;margin:1px 2px;cursor:pointer;overflow:hidden;
  font-family:inherit;background:var(--surface);min-width:0;z-index:1;position:relative;
}
.cc-card:hover{box-shadow:0 2px 6px rgba(16,24,39,.12);}
.cc-card:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.cc-card.selected{outline:2px solid var(--primary);outline-offset:1px;z-index:2;}

.cc-horario{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-700);}
.cc-paciente{font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-procedimiento{font-size:var(--fs-xs);color:var(--ink-700);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cc-cirujano{font-size:var(--fs-xs);color:var(--ink-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

.cc-programada{background:var(--green-bg);border-left-color:var(--green);}
.cc-borrador{background:var(--blue-bg);border-left-color:var(--blue-fg);}
.cc-urgencia{background:var(--violet-bg);border-left-color:var(--violet-fg);}
.cc-cancelada{background:var(--red-bg);border-left-color:var(--red);}
.cc-incumplida{background:var(--gray-bg);border-left-color:var(--gray-fg);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/CirugiaCard`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/CirugiaCard
git commit -m "$(cat <<'EOF'
Add CirugiaCard

Compact card for the weekly agenda: horario/paciente/procedimiento/
cirujano/estado, tinted by estado, positioned by the caller via style.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: `AgendaSemana`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/AgendaSemana/AgendaSemana.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/AgendaSemana/AgendaSemana.css`

**Interfaces:**
- Consumes (Task 3): `CirugiaCard`. (Task 2): `EstadoCirugiaBadge`.
- Produces: `AgendaSemana({ weekLabel: string, days: {fecha,label,dayNum,isToday}[], cirugias: Cirugia[], selectedId: string|null, onSelect: (id:string) => void, onPrevWeek: () => void, onNextWeek: () => void })` — default export. `days` is `diasDeSemana(weekStart)` from Task 1; `weekLabel` is `rangoSemanaLabel(weekStart)`.

Time range is fixed at 06:00 to 20:00 in 30-minute slots (28 rows), so that horarios like 07:30/09:30 in the seed data position correctly since they are not aligned to whole hours.

- [ ] **Step 1: Create `AgendaSemana.jsx`**

```jsx
'use client';

import './AgendaSemana.css';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const HORA_INICIO = 6;
const HORA_FIN = 20;
const SLOTS_POR_HORA = 2;
const SLOTS = (HORA_FIN - HORA_INICIO) * SLOTS_POR_HORA;
const HORAS = Array.from({ length: HORA_FIN - HORA_INICIO }, (_, i) => HORA_INICIO + i);
const ESTADOS_LEYENDA = ['programada', 'borrador', 'urgencia', 'cancelada', 'incumplida'];

function horaASlot(hora) {
  const [h, m] = hora.split(':').map(Number);
  return (h - HORA_INICIO) * SLOTS_POR_HORA + (m >= 30 ? 1 : 0);
}

export default function AgendaSemana({
  weekLabel, days, cirugias, selectedId, onSelect, onPrevWeek, onNextWeek,
}) {
  return (
    <div className="as-wrap">
      <div className="as-week-nav">
        <button type="button" className="as-nav-btn" aria-label="Semana anterior" onClick={onPrevWeek}>
          <LuChevronLeft className="icon" />
        </button>
        <span className="as-week-label">{weekLabel}</span>
        <button type="button" className="as-nav-btn" aria-label="Semana siguiente" onClick={onNextWeek}>
          <LuChevronRight className="icon" />
        </button>
      </div>

      <div className="as-scroll">
        <div className="as-grid">
          <div className="as-corner" />

          {days.map((d, i) => (
            <div key={d.fecha} className={`as-day-head${d.isToday ? ' today' : ''}`} style={{ gridColumn: i + 2 }}>
              <span className="as-day-label">{d.label}</span>
              <span className="as-day-num">{d.dayNum}</span>
            </div>
          ))}

          {HORAS.map((h, i) => (
            <div key={h} className="as-hour-label" style={{ gridRow: `${i * SLOTS_POR_HORA + 2} / span ${SLOTS_POR_HORA}` }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}

          {days.flatMap((d, dayIdx) => Array.from({ length: SLOTS }, (_, slot) => (
            <div
              key={`${d.fecha}-${slot}`}
              className={`as-slot${d.isToday ? ' today' : ''}${slot % SLOTS_POR_HORA === 0 ? ' hour-start' : ''}`}
              style={{ gridColumn: dayIdx + 2, gridRow: slot + 2 }}
            />
          )))}

          {cirugias.map((c) => {
            const dayIdx = days.findIndex((d) => d.fecha === c.fecha);
            if (dayIdx === -1) return null;
            const startSlot = horaASlot(c.horaInicio);
            const endSlot = horaASlot(c.horaFin);
            return (
              <CirugiaCard
                key={c.id}
                cirugia={c}
                selected={c.id === selectedId}
                onClick={() => onSelect(c.id)}
                style={{
                  gridColumn: dayIdx + 2,
                  gridRow: `${startSlot + 2} / span ${Math.max(endSlot - startSlot, 1)}`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="as-legend">
        <span className="as-legend-title">Estados:</span>
        {ESTADOS_LEYENDA.map((estado) => (
          <EstadoCirugiaBadge key={estado} estado={estado} size="sm" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `AgendaSemana.css`**

```css
.as-wrap{
  display:flex;flex-direction:column;flex:7;min-height:0;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;
}

.as-week-nav{
  display:flex;align-items:center;justify-content:center;gap:12px;
  padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.as-nav-btn{
  width:28px;height:28px;border-radius:7px;border:none;background:none;
  display:flex;align-items:center;justify-content:center;color:var(--ink-500);cursor:pointer;
}
.as-nav-btn:hover{background:var(--gray-bg);color:var(--ink-900);}
.as-nav-btn:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.as-nav-btn .icon{width:18px;height:18px;}
.as-week-label{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);min-width:220px;text-align:center;}

.as-scroll{flex:1;min-height:0;overflow:auto;}

.as-grid{
  display:grid;
  grid-template-columns:64px repeat(7, minmax(130px, 1fr));
  grid-template-rows:56px repeat(28, 30px);
  position:relative;
  min-width:960px;
}

.as-corner{position:sticky;top:0;left:0;z-index:2;background:var(--surface);border-bottom:1px solid var(--border);border-right:1px solid var(--border);grid-column:1;grid-row:1;}

.as-day-head{
  position:sticky;top:0;z-index:1;background:var(--surface);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  border-bottom:1px solid var(--border);border-left:1px solid var(--border);
  grid-row:1;
}
.as-day-head.today{background:var(--primary-50);}
.as-day-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.as-day-num{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.as-day-head.today .as-day-num{color:var(--primary-dark);}

.as-hour-label{
  grid-column:1;position:sticky;left:0;z-index:1;background:var(--surface);
  display:flex;align-items:flex-start;justify-content:flex-end;
  padding:0 8px;font-size:var(--fs-xs);color:var(--ink-500);
  border-right:1px solid var(--border);transform:translateY(-6px);
}

.as-slot{border-left:1px solid var(--border);border-top:1px solid var(--bg);}
.as-slot.hour-start{border-top:1px solid var(--border);}
.as-slot.today{background:rgba(0,101,205,.04);}

.as-legend{
  display:flex;align-items:center;gap:14px;flex-wrap:wrap;
  padding:10px 16px;border-top:1px solid var(--border);flex-shrink:0;
}
.as-legend-title{font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-500);}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/AgendaSemana`
Expected: no errors. Full visual verification happens in Task 12 once the orchestrator wires real data in.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/AgendaSemana
git commit -m "$(cat <<'EOF'
Add AgendaSemana

Weekly hour-grid calendar: 7 day columns x 28 half-hour rows, CirugiaCard
positioned via gridColumn/gridRow spans derived from horaInicio/horaFin.
Not wired into ProgramacionSalaCirugias.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: `FiltrosBar`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/FiltrosBar/FiltrosBar.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/FiltrosBar/FiltrosBar.css`

**Interfaces:**
- Consumes (Task 1): `SEDES`, `SALAS`, `ESTADO_FILTRO_OPTIONS`, `addDias`, `fechaISO`, `fechaLabel`.
- Produces: `FiltrosBar({ sedeId: string, onSedeChange: (v:string) => void, salaId: string, onSalaChange: (v:string) => void, weekStart: Date, onWeekStartChange: (d:Date) => void, estado: string, onEstadoChange: (v:string) => void, onVistaNoDisponible: () => void })` — default export. `onVistaNoDisponible` fires when the user clicks "Día" or "Mes" (only "Semana" is functional in V1).

The `.chip-group.segmented`/`.chip-filter` and `.form-field` base classes referenced here are defined in `shared/shared.css` (Task 7), imported once by `ProgramacionSalaCirugias.jsx` (Task 12) — this component only adds its own layout wrapper class.

- [ ] **Step 1: Create `FiltrosBar.jsx`**

```jsx
'use client';

import './FiltrosBar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  ESTADO_FILTRO_OPTIONS, SALAS, SEDES, addDias, fechaISO, fechaLabel,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

// Vista Día/Mes: solo Semana está implementada en V1 (spec, sección
// "Alcance") — los otros 2 botones quedan visibles y clickeables pero
// jamás quedan "active": onVistaNoDisponible (pasado por el orquestador)
// dispara un toast en vez de cambiar de vista. Conectar una vista real acá
// implica agregar un tercer estado a este control y pasarlo hacia arriba
// como prop adicional, sin tocar el resto del feature.
export default function FiltrosBar({
  sedeId, onSedeChange, salaId, onSalaChange, weekStart, onWeekStartChange, estado, onEstadoChange, onVistaNoDisponible,
}) {
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);

  return (
    <div className="fb-bar">
      <div className="form-field">
        <label htmlFor="fb-sede">Sede</label>
        <FormSelect id="fb-sede" value={sedeId} onChange={onSedeChange} options={SEDES} />
      </div>
      <div className="form-field">
        <label htmlFor="fb-sala">Sala / Quirófano</label>
        <FormSelect
          id="fb-sala"
          value={salaId}
          onChange={onSalaChange}
          options={salasDeSede.map((s) => ({ value: s.value, label: s.label }))}
        />
      </div>
      <div className="form-field">
        <label id="fb-fecha-label">Fecha</label>
        <div className="fb-fecha-nav" role="group" aria-labelledby="fb-fecha-label">
          <button type="button" className="fb-fecha-btn" aria-label="Semana anterior" onClick={() => onWeekStartChange(addDias(weekStart, -7))}>
            <LuChevronLeft className="icon" />
          </button>
          <span className="fb-fecha-value">{fechaLabel(fechaISO(weekStart))}</span>
          <button type="button" className="fb-fecha-btn" aria-label="Semana siguiente" onClick={() => onWeekStartChange(addDias(weekStart, 7))}>
            <LuChevronRight className="icon" />
          </button>
        </div>
      </div>
      <div className="form-field">
        <label id="fb-vista-label">Vista</label>
        <div className="chip-group segmented" role="group" aria-labelledby="fb-vista-label">
          <button type="button" className="chip-filter" onClick={onVistaNoDisponible}>Día</button>
          <button type="button" className="chip-filter active" aria-pressed="true">Semana</button>
          <button type="button" className="chip-filter" onClick={onVistaNoDisponible}>Mes</button>
        </div>
      </div>
      <div className="form-field">
        <label htmlFor="fb-estado">Estado</label>
        <FormSelect id="fb-estado" value={estado} onChange={onEstadoChange} options={ESTADO_FILTRO_OPTIONS} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `FiltrosBar.css`**

```css
.fb-bar{
  display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
  padding:14px 16px;flex-shrink:0;
}
.fb-bar .form-field{min-width:160px;}

.fb-fecha-nav{display:flex;align-items:center;gap:8px;height:var(--input-md);}
.fb-fecha-btn{
  width:26px;height:26px;border-radius:6px;border:none;background:none;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;color:var(--ink-500);cursor:pointer;
}
.fb-fecha-btn:hover{background:var(--gray-bg);color:var(--ink-900);}
.fb-fecha-btn:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.fb-fecha-btn .icon{width:16px;height:16px;}
.fb-fecha-value{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);white-space:nowrap;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/FiltrosBar`
Expected: no errors. `.form-field`/`.chip-group.segmented` do not exist yet (Task 7) so this will not render correctly in isolation — full visual verification happens in Task 12.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/FiltrosBar
git commit -m "$(cat <<'EOF'
Add FiltrosBar

Sede/Sala/Fecha/Vista/Estado filter row. Vista is a 3-button segmented
control where only Semana is active in V1 -- Dia/Mes call
onVistaNoDisponible instead of switching. Not wired into
ProgramacionSalaCirugias.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `AccionesBar`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/AccionesBar/AccionesBar.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/AccionesBar/AccionesBar.css`

**Interfaces:**
- Consumes: `@/Components/Button/Button` (`variant`, `icon`, `disabled`, `onClick` props — confirmed variants `primary`/`secondary`/`outline`/`tinted`/`warning-outline`/`danger`/`danger-outline`).
- Produces: `AccionesBar({ selected: Cirugia|null, onNuevaCirugia: () => void, onNuevaUrgencia: () => void, onReprogramar: () => void, onCancelar: () => void, onMarcarProgramada: () => void, onMarcarIncumplida: () => void, onVerInfo: () => void })` — default export.

Button enablement: Reprogramar/Cancelar need a selection whose `estado` is not `cancelada`/`incumplida`. "Marcar como programada" needs `estado` in `borrador`/`urgencia`. "Marcar como incumplida" needs `estado === 'programada'`. "Más acciones" itself is disabled with no selection at all.

- [ ] **Step 1: Create `AccionesBar.jsx`**

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import './AccionesBar.css';
import Button from '@/Components/Button/Button';
import {
  LuBan, LuCalendarClock, LuChevronDown, LuCircleCheck, LuInfo, LuPlus,
} from 'react-icons/lu';

const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

// Split-button "Nueva cirugía" y menú "Más acciones": mismo patrón
// autocontenido de TurnoRowActionsMenu.jsx (estado local `open` + cierre
// por click-afuera/Escape) en vez de un componente Dropdown genérico, que
// no existe en el proyecto. No se intenta fusionar visualmente el botón
// primario con el toggle de flecha (Button usa CSS Modules — sus clases
// internas no son overrideables desde afuera, ver AGENTS.md "Botones") —
// van uno junto al otro con un gap chico, que ya satisface el pedido del
// encargo ("dropdown ... junto al botón").
export default function AccionesBar({
  selected, onNuevaCirugia, onNuevaUrgencia, onReprogramar, onCancelar, onMarcarProgramada, onMarcarIncumplida, onVerInfo,
}) {
  const [nuevaOpen, setNuevaOpen] = useState(false);
  const [masOpen, setMasOpen] = useState(false);
  const nuevaRef = useRef(null);
  const masRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (nuevaRef.current && !nuevaRef.current.contains(e.target)) setNuevaOpen(false);
      if (masRef.current && !masRef.current.contains(e.target)) setMasOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') { setNuevaOpen(false); setMasOpen(false); }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const puedeAccionar = Boolean(selected) && !ESTADOS_TERMINALES.includes(selected.estado);
  const puedeMarcarProgramada = Boolean(selected) && ['borrador', 'urgencia'].includes(selected.estado);
  const puedeMarcarIncumplida = Boolean(selected) && selected.estado === 'programada';

  return (
    <div className="ab-bar">
      <div className="ab-split" ref={nuevaRef}>
        <Button variant="primary" icon={LuPlus} onClick={onNuevaCirugia}>Nueva cirugía</Button>
        <button
          type="button"
          className="ab-split-toggle"
          aria-haspopup="menu"
          aria-expanded={nuevaOpen}
          aria-label="Más opciones de creación"
          onClick={() => setNuevaOpen((v) => !v)}
        >
          <LuChevronDown className="icon" />
        </button>
        {nuevaOpen && (
          <div className="ab-dropdown" role="menu">
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              onClick={() => { setNuevaOpen(false); onNuevaUrgencia(); }}
            >
              Cirugía de urgencia
            </button>
          </div>
        )}
      </div>

      <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar}>Reprogramar</Button>
      <Button variant="danger-outline" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar}>Cancelar</Button>

      <div className="ab-split" ref={masRef}>
        <Button variant="secondary" icon={LuChevronDown} disabled={!selected} onClick={() => setMasOpen((v) => !v)}>Más acciones</Button>
        {masOpen && selected && (
          <div className="ab-dropdown" role="menu">
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              disabled={!puedeMarcarProgramada}
              onClick={() => { setMasOpen(false); onMarcarProgramada(); }}
            >
              <LuCircleCheck className="icon" aria-hidden="true" />
              Marcar como programada
            </button>
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              disabled={!puedeMarcarIncumplida}
              onClick={() => { setMasOpen(false); onMarcarIncumplida(); }}
            >
              <LuCalendarClock className="icon" aria-hidden="true" />
              Marcar como incumplida
            </button>
            <button
              type="button"
              className="ab-dropdown-item"
              role="menuitem"
              onClick={() => { setMasOpen(false); onVerInfo(); }}
            >
              <LuInfo className="icon" aria-hidden="true" />
              Ver información/historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `AccionesBar.css`**

```css
.ab-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex-shrink:0;}
.ab-split{position:relative;display:inline-flex;align-items:center;gap:4px;}
.ab-split-toggle{
  width:var(--input-md);height:var(--input-md);flex-shrink:0;
  display:inline-flex;align-items:center;justify-content:center;
  border:var(--btn-border-width) solid var(--border);border-radius:var(--btn-radius);
  background:var(--surface);color:var(--ink-700);cursor:pointer;
  transition:var(--btn-transition);
}
.ab-split-toggle:hover{background:var(--bg);}
.ab-split-toggle:focus-visible{outline:var(--btn-focus-outline) solid var(--primary);outline-offset:var(--btn-focus-offset);}
.ab-split-toggle .icon{width:var(--btn-icon-size-sm);height:var(--btn-icon-size-sm);}

.ab-dropdown{
  position:absolute;top:calc(100% + 6px);left:0;min-width:220px;z-index:var(--z-popover);
  background:var(--surface);border-radius:var(--radius);box-shadow:0 8px 24px rgba(16,24,39,.16);padding:6px;
}
.ab-dropdown-item{
  display:flex;align-items:center;gap:10px;width:100%;text-align:left;
  padding:8px 10px;border-radius:7px;border:none;background:none;font-family:inherit;
  font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-700);cursor:pointer;white-space:nowrap;
}
.ab-dropdown-item:hover{background:var(--bg);}
.ab-dropdown-item:disabled{opacity:var(--btn-disabled-opacity);cursor:not-allowed;}
.ab-dropdown-item .icon{width:16px;height:16px;color:var(--ink-500);flex-shrink:0;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/AccionesBar`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/AccionesBar
git commit -m "$(cat <<'EOF'
Add AccionesBar

Nueva cirugia split button (+ Cirugia de urgencia), Reprogramar/Cancelar,
and a Mas acciones menu (marcar programada/incumplida, ver info) with
selection-based enablement rules. Not wired into
ProgramacionSalaCirugias.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: `shared/shared.css`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/shared/shared.css`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure CSS, only reads tokens from `ProgramacionSalaCirugias.css`'s `:root`, already extended in Task 2).
- Produces classes consumed by later tasks: `.modal-overlay`/`.modal-overlay.open`/`.modal-card`/`.modal-card > form`/`.modal-body`/`.modal-footer` (Tasks 10-11), `.form-field`/`.form-field.full`/`.tf-readonly-value`/`.tf-warning-note` (Tasks 10-11), `.chip-group`/`.chip-filter`/`.chip-group.segmented` (Task 5), `.psc-toast`/`.psc-toast.show`/`.psc-toast-dot` (Task 12).

This file is imported once, from `ProgramacionSalaCirugias.jsx` (Task 12) — never from an individual component — same convention as `Admisiones.jsx` importing `./shared/shared.css` (AGENTS.md "Shared/cross-cutting styles").

- [ ] **Step 1: Create `shared/shared.css`**

```css
/* Reglas compartidas por 2+ componentes de este feature: base de modal
   (3 modales, Tasks 10-11), .form-field (filtros + modales), chips
   segmentados (FiltrosBar) y el toast local (orquestador) — ver AGENTS.md
   "Component organization". Se importa una sola vez desde
   ProgramacionSalaCirugias.jsx. */

.modal-overlay{
  position:fixed;inset:0;z-index:var(--z-modal);background:rgba(16,24,39,.45);
  display:none;align-items:center;justify-content:center;padding:24px;
  opacity:0;transition:opacity .15s ease;
  isolation:isolate;
}
.modal-overlay.open{display:flex;opacity:1;}
.modal-card{
  background:var(--surface-modal);border-radius:var(--radius-lg);width:520px;max-width:100%;
  max-height:calc(100vh - 48px);display:flex;flex-direction:column;
  box-shadow:0 24px 64px rgba(16,24,39,.32);
  transform:translateY(8px) scale(.98);opacity:0;transition:transform .15s ease,opacity .15s ease;
}
.modal-overlay.open .modal-card{transform:translateY(0) scale(1);opacity:1;}
.modal-card > form{display:flex;flex-direction:column;min-height:0;overflow:hidden;}
.modal-body{padding:20px 24px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;}
.modal-footer{
  display:flex;align-items:center;justify-content:flex-end;gap:10px;
  padding:16px 24px;border-top:1px solid var(--border);flex-shrink:0;
}

.form-field{display:flex;flex-direction:column;gap:4px;}
.form-field.full{grid-column:1 / -1;}
.form-field label{font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-700);}
.form-field input, .form-field select, .form-field textarea{
  border:1px solid var(--border);border-radius:var(--radius);padding:9px 10px;
  font-family:inherit;font-size:var(--fs-base);color:var(--ink-900);background:var(--surface);width:100%;
}
.form-field input, .form-field select{height:var(--input-md);padding-top:0;padding-bottom:0;}
.form-field textarea{resize:vertical;min-height:72px;}
.form-field input:focus, .form-field select:focus, .form-field textarea:focus{
  outline:2px solid var(--primary);outline-offset:1px;
}

.tf-readonly-value{
  display:flex;align-items:center;height:var(--input-md);
  font-size:var(--fs-base);color:var(--ink-900);padding:0 10px;background:var(--bg);border-radius:var(--radius);
}
.tf-warning-note{
  display:flex;align-items:flex-start;gap:8px;
  background:var(--amber-bg);color:var(--amber-fg);
  border-radius:var(--radius);padding:10px 12px;
  font-size:var(--fs-sm);font-weight:var(--fw-medium);line-height:1.4;
}
.tf-warning-note .icon{width:16px;height:16px;flex-shrink:0;margin-top:1px;}

.chip-group{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.chip-filter{
  display:inline-flex;align-items:center;gap:6px;
  font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-700);
  padding:var(--space-2) var(--space-3);border-radius:20px;border:1px solid var(--border);
  background:var(--surface);cursor:pointer;white-space:nowrap;
  font-family:inherit;transition:background .15s,border-color .15s,color .15s;
}
.chip-filter:hover{background:var(--bg);}
.chip-filter:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.chip-group.segmented{
  display:inline-flex;align-items:center;gap:2px;
  background:var(--bg);border:1px solid var(--border);border-radius:999px;
  padding:3px;
}
.chip-group.segmented .chip-filter{border:1px solid transparent;background:transparent;}
.chip-group.segmented .chip-filter:hover{background:rgba(16,24,39,.05);}
.chip-group.segmented .chip-filter.active{
  background:var(--surface);color:var(--ink-900);
  box-shadow:0 1px 2px rgba(16,24,39,.10);
}
html[data-theme="dark"] .chip-group.segmented{background:#0c0f17;}
html[data-theme="dark"] .chip-group.segmented .chip-filter:hover{background:rgba(255,255,255,.06);}
html[data-theme="dark"] .chip-group.segmented .chip-filter.active{background:#20283a;}

.psc-toast{
  position:fixed;bottom:24px;left:50%;transform:translate(-50%,20px);
  background:var(--ink-900);color:#fff;
  padding:12px 20px;border-radius:var(--radius);
  font-size:var(--fs-base);font-weight:var(--fw-semibold);
  opacity:0;pointer-events:none;
  display:flex;align-items:center;gap:8px;z-index:60;
  transition:opacity .15s,transform .15s;
}
.psc-toast.show{opacity:1;transform:translate(-50%,0);}
.psc-toast-dot{width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0;}
html[data-theme="dark"] .psc-toast{background:var(--surface-modal);border:1px solid var(--border);}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/shared/shared.css`
Expected: eslint does not lint `.css` files in this project (no CSS linter configured) — this step is a no-op safety check; confirm the command exits without crashing.

- [ ] **Step 3: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/shared/shared.css
git commit -m "$(cat <<'EOF'
Add shared.css for Programacion Sala de Cirugia

Modal base, form-field, segmented chip control, and local toast rules
shared by 2+ components in this feature. Not imported anywhere yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Detail panel tabs — Resumen, Procedimientos, Personal, Equipos, Insumos, Farmacia

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/ResumenTab/ResumenTab.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/ResumenTab/ResumenTab.css`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/ProcedimientosTab/ProcedimientosTab.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/ProcedimientosTab/ProcedimientosTab.css`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/PersonalTab/PersonalTab.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/PersonalTab/PersonalTab.css`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/EquiposTab/EquiposTab.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/EquiposTab/EquiposTab.css`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/InsumosTab/InsumosTab.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/InsumosTab/InsumosTab.css`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/FarmaciaTab/FarmaciaTab.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs/FarmaciaTab/FarmaciaTab.css`

**Interfaces:**
- Consumes (Task 1): `EQUIPO_ESTADO_LABEL`, `FARMACIA_ESTADO_LABEL`, `INSUMO_ESTADO_LABEL`, `fechaHoraLabel`.
- Produces: `ResumenTab({ cirugia: Cirugia, onNavigateTab: (tabId:string) => void })`, `ProcedimientosTab({ cirugia })`, `PersonalTab({ cirugia })`, `EquiposTab({ cirugia })`, `InsumosTab({ cirugia })`, `FarmaciaTab({ cirugia })` — all default exports, all read-only (no mutation calls), consumed by `DetalleCirugiaPanel` in Task 9. Tab ids used by `onNavigateTab` are `'personal'`, `'equipos'`, `'insumos'`, `'farmacia'` (must match the `TABS` ids defined in Task 9).

- [ ] **Step 1: Create `ResumenTab.jsx`**

```jsx
'use client';

import './ResumenTab.css';

export default function ResumenTab({ cirugia, onNavigateTab }) {
  const {
    procedimientoPrincipal, personal, equipos, canasta, farmacia,
  } = cirugia;
  const canastaCompleta = canasta.items.every((item) => item.estado === 'disponible');

  return (
    <div className="rt-tab">
      <section className="rt-card">
        <h4 className="rt-card-title">Procedimiento</h4>
        <div className="rt-card-value">{procedimientoPrincipal}</div>
      </section>

      <section className="rt-card">
        <h4 className="rt-card-title">Personal asignado</h4>
        <ul className="rt-list">
          {personal.map((p) => (
            <li key={p.rol}>
              <span className="rt-list-label">{p.rol}</span>
              <span className="rt-list-value">{p.nombre}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="rt-link" onClick={() => onNavigateTab('personal')}>
          Ver todo el personal ({personal.length})
        </button>
      </section>

      <div className="rt-grid-2">
        <section className="rt-card">
          <h4 className="rt-card-title">Equipos</h4>
          <ul className="rt-list">
            {equipos.slice(0, 2).map((e) => (
              <li key={e.nombre}>
                <span className="rt-list-label">{e.nombre}</span>
                <span className={`rt-tag rt-tag-${e.estado}`}>
                  {e.estado === 'disponible' ? 'Disponible' : (e.estado === 'en-uso' ? 'En uso' : 'Mantenimiento')}
                </span>
              </li>
            ))}
          </ul>
          <button type="button" className="rt-link" onClick={() => onNavigateTab('equipos')}>
            Ver todos ({equipos.length})
          </button>
        </section>

        <section className="rt-card">
          <h4 className="rt-card-title">Insumos</h4>
          <div className="rt-card-value">Canasta: {canasta.nombre}</div>
          <div className="rt-insumos-meta">
            <span>{canasta.items.length} insumos</span>
            <span className={`rt-tag rt-tag-${canastaCompleta ? 'disponible' : 'faltante'}`}>
              {canastaCompleta ? 'Completa' : 'Incompleta'}
            </span>
          </div>
          <button type="button" className="rt-link" onClick={() => onNavigateTab('insumos')}>Ver canasta</button>
        </section>
      </div>

      <section className="rt-card">
        <h4 className="rt-card-title">Farmacia</h4>
        <div className="rt-card-value">Pedido #{farmacia.numeroPedido}</div>
        <div className="rt-farmacia-estado">
          {farmacia.estado === 'en-preparacion' ? 'En preparación' : (farmacia.estado === 'listo' ? 'Listo' : 'Entregado')}
        </div>
        <button type="button" className="rt-link" onClick={() => onNavigateTab('farmacia')}>Ver pedido</button>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create `ResumenTab.css`**

```css
.rt-tab{display:flex;flex-direction:column;gap:14px;}
.rt-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.rt-card{
  background:var(--bg);border-radius:var(--radius);padding:12px 14px;
  display:flex;flex-direction:column;gap:6px;min-width:0;
}
.rt-card-title{margin:0;font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.rt-card-value{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.rt-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;}
.rt-list li{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:var(--fs-sm);}
.rt-list-label{color:var(--ink-500);}
.rt-list-value{color:var(--ink-900);font-weight:var(--fw-medium);text-align:right;}
.rt-link{
  align-self:flex-start;background:none;border:none;padding:0;font-family:inherit;cursor:pointer;
  font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--primary);
}
.rt-link:hover{text-decoration:underline;}
.rt-insumos-meta{display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);color:var(--ink-500);}
.rt-farmacia-estado{font-size:var(--fs-sm);color:var(--ink-700);}
.rt-tag{font-size:var(--fs-xs);font-weight:var(--fw-semibold);padding:2px 8px;border-radius:12px;white-space:nowrap;}
.rt-tag-disponible{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .rt-tag-disponible{color:var(--green);}
.rt-tag-en-uso{background:var(--blue-bg);color:var(--blue-fg);}
.rt-tag-mantenimiento{background:var(--amber-bg);color:var(--amber-fg);}
.rt-tag-faltante{background:var(--red-bg);color:var(--red);}

@media (max-width:1200px){
  .rt-grid-2{grid-template-columns:1fr;}
}
```

- [ ] **Step 3: Create `ProcedimientosTab.jsx`**

```jsx
'use client';

import './ProcedimientosTab.css';

export default function ProcedimientosTab({ cirugia }) {
  return (
    <div className="pt-tab">
      <div className="pt-meta">
        <div className="pt-meta-item">
          <span className="pt-meta-label">Servicio</span>
          <span className="pt-meta-value">{cirugia.servicio}</span>
        </div>
        <div className="pt-meta-item">
          <span className="pt-meta-label">Tipo de cirugía</span>
          <span className="pt-meta-value">{cirugia.tipoCirugia}</span>
        </div>
      </div>
      <ul className="pt-list">
        {cirugia.procedimientos.map((p) => (
          <li key={p.nombre} className="pt-item">
            <div className="pt-item-head">
              <span className="pt-item-name">{p.nombre}</span>
              <span className={`pt-badge pt-badge-${p.tipo}`}>{p.tipo === 'principal' ? 'Principal' : 'Secundario'}</span>
            </div>
            <div className="pt-item-meta">{p.duracionMin} min · {p.notas}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Create `ProcedimientosTab.css`**

```css
.pt-tab{display:flex;flex-direction:column;gap:14px;}
.pt-meta{display:flex;gap:24px;}
.pt-meta-item{display:flex;flex-direction:column;gap:2px;}
.pt-meta-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.pt-meta-value{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
.pt-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
.pt-item{background:var(--bg);border-radius:var(--radius);padding:10px 12px;}
.pt-item-head{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.pt-item-name{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.pt-item-meta{margin-top:4px;font-size:var(--fs-sm);color:var(--ink-500);}
.pt-badge{font-size:var(--fs-xs);font-weight:var(--fw-semibold);padding:2px 8px;border-radius:12px;white-space:nowrap;}
.pt-badge-principal{background:var(--blue-bg);color:var(--blue-fg);}
.pt-badge-secundario{background:var(--gray-bg);color:var(--gray-fg);}
```

- [ ] **Step 5: Create `PersonalTab.jsx`**

```jsx
'use client';

import './PersonalTab.css';

function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function PersonalTab({ cirugia }) {
  return (
    <ul className="pst-list">
      {cirugia.personal.map((p) => (
        <li key={p.rol} className="pst-row">
          <span className="pst-avatar" aria-hidden="true">{iniciales(p.nombre)}</span>
          <span className="pst-info">
            <span className="pst-name">{p.nombre}</span>
            <span className="pst-rol">{p.rol}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 6: Create `PersonalTab.css`**

```css
.pst-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px;}
.pst-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius);}
.pst-row:hover{background:var(--bg);}
.pst-avatar{
  width:32px;height:32px;border-radius:50%;flex-shrink:0;
  background:var(--blue-bg);color:var(--blue-fg);
  display:flex;align-items:center;justify-content:center;
  font-weight:var(--fw-semibold);font-size:var(--fs-sm);
}
.pst-info{display:flex;flex-direction:column;min-width:0;}
.pst-name{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.pst-rol{font-size:var(--fs-sm);color:var(--ink-500);}
```

- [ ] **Step 7: Create `EquiposTab.jsx`**

```jsx
'use client';

import './EquiposTab.css';
import { EQUIPO_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function EquiposTab({ cirugia }) {
  return (
    <ul className="eqt-list">
      {cirugia.equipos.map((e) => (
        <li key={e.nombre} className="eqt-row">
          <span className="eqt-name">{e.nombre}</span>
          <span className={`eqt-tag eqt-tag-${e.estado}`}>{EQUIPO_ESTADO_LABEL[e.estado]}</span>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 8: Create `EquiposTab.css`**

```css
.eqt-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;}
.eqt-row{display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg);border-radius:var(--radius);padding:9px 12px;}
.eqt-name{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
.eqt-tag{font-size:var(--fs-xs);font-weight:var(--fw-semibold);padding:3px 9px;border-radius:12px;white-space:nowrap;}
.eqt-tag-disponible{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .eqt-tag-disponible{color:var(--green);}
.eqt-tag-en-uso{background:var(--blue-bg);color:var(--blue-fg);}
.eqt-tag-mantenimiento{background:var(--amber-bg);color:var(--amber-fg);}
```

- [ ] **Step 9: Create `InsumosTab.jsx`**

```jsx
'use client';

import './InsumosTab.css';
import { INSUMO_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function InsumosTab({ cirugia }) {
  const { canasta } = cirugia;
  return (
    <div className="ist-tab">
      <h4 className="ist-title">Canasta: {canasta.nombre}</h4>
      <table className="ist-table">
        <thead>
          <tr><th>Insumo</th><th>Cantidad</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {canasta.items.map((item) => (
            <tr key={item.nombre}>
              <td>{item.nombre}</td>
              <td>{item.cantidad}</td>
              <td><span className={`ist-tag ist-tag-${item.estado}`}>{INSUMO_ESTADO_LABEL[item.estado]}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 10: Create `InsumosTab.css`**

```css
.ist-tab{display:flex;flex-direction:column;gap:10px;}
.ist-title{margin:0;font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ist-table{width:100%;border-collapse:collapse;font-size:var(--fs-sm);}
.ist-table th{text-align:left;color:var(--ink-500);font-weight:var(--fw-semibold);padding:6px 8px;border-bottom:1px solid var(--border);}
.ist-table td{padding:7px 8px;border-bottom:1px solid var(--border);color:var(--ink-900);}
.ist-tag{font-size:var(--fs-xs);font-weight:var(--fw-semibold);padding:2px 8px;border-radius:12px;white-space:nowrap;}
.ist-tag-disponible{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .ist-tag-disponible{color:var(--green);}
.ist-tag-faltante{background:var(--red-bg);color:var(--red);}
```

- [ ] **Step 11: Create `FarmaciaTab.jsx`**

```jsx
'use client';

import './FarmaciaTab.css';
import { FARMACIA_ESTADO_LABEL, fechaHoraLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function FarmaciaTab({ cirugia }) {
  const { farmacia } = cirugia;
  return (
    <div className="ft-tab">
      <div className="ft-head">
        <div className="ft-head-info">
          <span className="ft-label">Pedido</span>
          <span className="ft-value">#{farmacia.numeroPedido}</span>
        </div>
        <span className={`ft-tag ft-tag-${farmacia.estado}`}>{FARMACIA_ESTADO_LABEL[farmacia.estado]}</span>
      </div>
      <div className="ft-solicitud">Solicitado: {fechaHoraLabel(farmacia.fechaSolicitud)}</div>
      <table className="ft-table">
        <thead><tr><th>Medicamento</th><th>Dosis</th></tr></thead>
        <tbody>
          {farmacia.medicamentos.map((m) => (
            <tr key={m.nombre}><td>{m.nombre}</td><td>{m.dosis}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 12: Create `FarmaciaTab.css`**

```css
.ft-tab{display:flex;flex-direction:column;gap:10px;}
.ft-head{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.ft-head-info{display:flex;flex-direction:column;gap:2px;}
.ft-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.ft-value{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ft-solicitud{font-size:var(--fs-sm);color:var(--ink-500);}
.ft-table{width:100%;border-collapse:collapse;font-size:var(--fs-sm);}
.ft-table th{text-align:left;color:var(--ink-500);font-weight:var(--fw-semibold);padding:6px 8px;border-bottom:1px solid var(--border);}
.ft-table td{padding:7px 8px;border-bottom:1px solid var(--border);color:var(--ink-900);}
.ft-tag{font-size:var(--fs-xs);font-weight:var(--fw-semibold);padding:3px 9px;border-radius:12px;white-space:nowrap;}
.ft-tag-en-preparacion{background:var(--amber-bg);color:var(--amber-fg);}
.ft-tag-listo{background:var(--blue-bg);color:var(--blue-fg);}
.ft-tag-entregado{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .ft-tag-entregado{color:var(--green);}
```

- [ ] **Step 13: Lint all 6 folders**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs`
Expected: no errors.

- [ ] **Step 14: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/tabs
git commit -m "$(cat <<'EOF'
Add the 6 DetalleCirugiaPanel tabs

Resumen (with cross-links to the other 5), Procedimientos, Personal,
Equipos, Insumos, and Farmacia -- each with its own full read-only
content. Not wired into a panel shell yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: `DetalleCirugiaPanel`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.css`

**Interfaces:**
- Consumes (Task 1): `fechaLabel`, `duracionLabel`. (Task 2): `EstadoCirugiaBadge`. (Task 8): `ResumenTab`, `ProcedimientosTab`, `PersonalTab`, `EquiposTab`, `InsumosTab`, `FarmaciaTab`. Also `@/Components/ModalHeader/ModalHeader` and `@/Components/Button/Button`.
- Produces: `DetalleCirugiaPanel({ cirugia: Cirugia|null, salaLabel: string, onClose: () => void, onEditar: () => void, onReprogramar: () => void, onCancelar: () => void })` — default export, consumed by `ProgramacionSalaCirugias.jsx` in Task 12. `onClose` deselects the cirugía (works both as the docked panel's own close button, click on the drawer backdrop, and Escape while the drawer is open).

Layout: docked inline `<aside>` (part of `.psc-main-row`'s flex layout) at `>= 1024px`; below that, renders as a fixed overlay drawer with the same content — matches the `TaskDetailPanel`/`AlertDetailDrawer` overlay pattern already used elsewhere in the app (spec, "Panel de detalle" section).

- [ ] **Step 1: Create `DetalleCirugiaPanel.jsx`**

```jsx
'use client';

import { useEffect, useState } from 'react';
import './DetalleCirugiaPanel.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import EstadoCirugiaBadge from '../EstadoCirugiaBadge/EstadoCirugiaBadge';
import ResumenTab from './tabs/ResumenTab/ResumenTab';
import ProcedimientosTab from './tabs/ProcedimientosTab/ProcedimientosTab';
import PersonalTab from './tabs/PersonalTab/PersonalTab';
import EquiposTab from './tabs/EquiposTab/EquiposTab';
import InsumosTab from './tabs/InsumosTab/InsumosTab';
import FarmaciaTab from './tabs/FarmaciaTab/FarmaciaTab';
import { duracionLabel, fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuBan, LuCalendarClock, LuPencil } from 'react-icons/lu';

const NARROW_QUERY = '(max-width:1024px)';
const ESTADOS_TERMINALES = ['cancelada', 'incumplida'];

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'procedimientos', label: 'Procedimientos' },
  { id: 'personal', label: 'Personal' },
  { id: 'equipos', label: 'Equipos' },
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
];

// Docked por defecto (parte del flex row de la página, ver .psc-main-row en
// ProgramacionSalaCirugias.css) -- por debajo de 1024px pasa a overlay
// lateral (mismo patrón que TaskDetailPanel/AlertDetailDrawer de Gestión de
// Enfermería, ver spec). `onClose` siempre deselecciona: en modo docked eso
// vuelve al estado vacío, en modo drawer además cierra el overlay.
export default function DetalleCirugiaPanel({
  cirugia, salaLabel, onClose, onEditar, onReprogramar, onCancelar,
}) {
  const [narrow, setNarrow] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    const mql = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setActiveTab('resumen');
  }, [cirugia?.id]);

  useEffect(() => {
    if (!narrow || !cirugia) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [narrow, cirugia, onClose]);

  function handleTabsKeyDown(e) {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    let next;
    if (e.key === 'ArrowRight') next = (idx + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + TABS.length) % TABS.length;
    else return;
    e.preventDefault();
    setActiveTab(TABS[next].id);
  }

  if (!cirugia) {
    if (narrow) return null;
    return (
      <aside className="dcp-panel dcp-docked">
        <div className="dcp-empty-state">
          <div className="dcp-empty-title">Selecciona una cirugía</div>
          <div className="dcp-empty-sub">Elige una cirugía de la agenda para ver su detalle.</div>
        </div>
      </aside>
    );
  }

  const puedeAccionar = !ESTADOS_TERMINALES.includes(cirugia.estado);

  const body = (
    <>
      <ModalHeader
        title="Detalle de la cirugía"
        titleId="dcp-title"
        trailing={<span className="dcp-id">ID {cirugia.id}</span>}
        onClose={onClose}
        closeLabel="Cerrar detalle"
      />
      <div className="dcp-status-row">
        <EstadoCirugiaBadge estado={cirugia.estado} />
      </div>

      <div className="dcp-info-grid">
        <div className="dcp-info-col">
          <div className="dcp-info-label">Paciente</div>
          <div className="dcp-info-value">{cirugia.paciente.nombre}</div>
          <div className="dcp-info-label">Documento</div>
          <div className="dcp-info-value">{cirugia.paciente.documento}</div>
          <div className="dcp-info-label">Edad / Sexo</div>
          <div className="dcp-info-value">{cirugia.paciente.edad} años / {cirugia.paciente.sexo}</div>
          <div className="dcp-info-label">Aseguradora</div>
          <div className="dcp-info-value">{cirugia.paciente.aseguradora}</div>
        </div>
        <div className="dcp-info-col">
          <div className="dcp-info-label">Procedimiento</div>
          <div className="dcp-info-value">{cirugia.procedimientoPrincipal}</div>
          <div className="dcp-info-label">Cirujano</div>
          <div className="dcp-info-value">{cirugia.cirujano}</div>
          <div className="dcp-info-label">Sala</div>
          <div className="dcp-info-value">{salaLabel}</div>
          <div className="dcp-info-label">Fecha y hora</div>
          <div className="dcp-info-value">
            {fechaLabel(cirugia.fecha)} {cirugia.horaInicio} - {cirugia.horaFin} ({duracionLabel(cirugia.horaInicio, cirugia.horaFin)})
          </div>
        </div>
      </div>

      <div className="dcp-tabs-bar" role="tablist" aria-label="Secciones del detalle de la cirugía" onKeyDown={handleTabsKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`dcp-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={`dcp-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dcp-tab-body" role="tabpanel" id={`dcp-panel-${activeTab}`}>
        {activeTab === 'resumen' && <ResumenTab cirugia={cirugia} onNavigateTab={setActiveTab} />}
        {activeTab === 'procedimientos' && <ProcedimientosTab cirugia={cirugia} />}
        {activeTab === 'personal' && <PersonalTab cirugia={cirugia} />}
        {activeTab === 'equipos' && <EquiposTab cirugia={cirugia} />}
        {activeTab === 'insumos' && <InsumosTab cirugia={cirugia} />}
        {activeTab === 'farmacia' && <FarmaciaTab cirugia={cirugia} />}
      </div>

      <div className="dcp-actions">
        <Button variant="secondary" icon={LuPencil} disabled={!puedeAccionar} onClick={onEditar}>Editar</Button>
        <Button variant="secondary" icon={LuCalendarClock} disabled={!puedeAccionar} onClick={onReprogramar}>Reprogramar</Button>
        <Button variant="danger" icon={LuBan} disabled={!puedeAccionar} onClick={onCancelar}>Cancelar</Button>
      </div>
    </>
  );

  if (narrow) {
    return (
      <div className="dcp-drawer-overlay" onClick={onClose}>
        <aside className="dcp-panel dcp-drawer-panel" onClick={(e) => e.stopPropagation()} aria-label="Detalle de la cirugía">
          {body}
        </aside>
      </div>
    );
  }

  return <aside className="dcp-panel dcp-docked">{body}</aside>;
}
```

- [ ] **Step 2: Create `DetalleCirugiaPanel.css`**

```css
.dcp-panel{
  background:var(--surface-modal);border-radius:var(--radius-lg);
  display:flex;flex-direction:column;min-height:0;overflow:hidden;
}
.dcp-docked{flex:3;border:1px solid var(--border);}

.dcp-drawer-overlay{
  position:fixed;inset:0;z-index:var(--z-modal);background:rgba(16,24,39,.32);
  display:flex;justify-content:flex-end;
  animation:dcp-fade .15s ease;
}
.dcp-drawer-panel{
  width:420px;max-width:100%;height:100%;border-radius:0;
  box-shadow:-16px 0 40px rgba(16,24,39,.20);
  animation:dcp-slide .18s ease;
}
@keyframes dcp-fade{from{opacity:0;}to{opacity:1;}}
@keyframes dcp-slide{from{transform:translateX(24px);opacity:0;}to{transform:translateX(0);opacity:1;}}
@media (prefers-reduced-motion: reduce){
  .dcp-drawer-overlay,.dcp-drawer-panel{animation:none;}
}

.dcp-id{font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-500);}

.dcp-status-row{padding:0 24px 12px;flex-shrink:0;}

.dcp-info-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;
  padding:0 24px 16px;border-bottom:1px solid var(--border);flex-shrink:0;
}
.dcp-info-col{display:flex;flex-direction:column;}
.dcp-info-label{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;margin-top:8px;}
.dcp-info-col .dcp-info-label:first-child{margin-top:0;}
.dcp-info-value{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}

.dcp-tabs-bar{
  display:flex;align-items:center;gap:20px;padding:0 20px;
  border-bottom:1px solid var(--border);flex-shrink:0;
  overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-ms-overflow-style:none;
}
.dcp-tabs-bar::-webkit-scrollbar{display:none;height:0;}
.dcp-tab{
  display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-500);
  cursor:pointer;padding:11px 0;position:relative;white-space:nowrap;transition:color .15s;line-height:1;
  border:none;background:none;font-family:inherit;
}
.dcp-tab:hover{color:var(--ink-900);}
.dcp-tab:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:4px;}
.dcp-tab.active{color:var(--primary);font-weight:var(--fw-semibold);}
.dcp-tab.active::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--primary);}

.dcp-tab-body{flex:1;min-height:0;overflow-y:auto;padding:16px 24px;}

.dcp-actions{
  display:flex;align-items:center;justify-content:flex-end;gap:10px;
  padding:14px 24px;border-top:1px solid var(--border);flex-shrink:0;
}

.dcp-empty-state{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:6px;padding:56px 24px;text-align:center;flex:1;
}
.dcp-empty-title{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);max-width:280px;}
.dcp-empty-sub{font-size:var(--fs-sm);color:var(--ink-500);max-width:280px;line-height:1.5;}

@media (max-width:480px){
  .dcp-drawer-panel{width:100%;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.jsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.jsx src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.css
git commit -m "$(cat <<'EOF'
Add DetalleCirugiaPanel

Docked inline panel (drawer overlay below 1024px) with header, 2-column
info, the 6 tabs, and Editar/Reprogramar/Cancelar actions gated by
estado. Not wired into ProgramacionSalaCirugias.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: `NuevaCirugiaModal` (create, edit, urgencia)

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/modals/NuevaCirugiaModal/NuevaCirugiaModal.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/modals/NuevaCirugiaModal/NuevaCirugiaModal.css`

**Interfaces:**
- Consumes (Task 1): `PROCEDIMIENTOS_CATALOGO`, `SERVICIOS_CATALOGO`, `TIPOS_CIRUGIA_CATALOGO`, `CIRUJANOS_CATALOGO`, `ANESTESIOLOGOS_CATALOGO`, `INSTRUMENTADORAS_CATALOGO`, `CIRCULANTES_CATALOGO`, `EQUIPOS_CATALOGO`, `CANASTAS_CATALOGO`, `SALAS`, `fechaISO`. (Task 7): `.modal-overlay`/`.modal-card`/`.modal-body`/`.modal-footer`/`.form-field`/`.form-field.full`/`.tf-warning-note`.
- Produces: `NuevaCirugiaModal({ sedeId: string, urgencia?: boolean, cirugiaExistente?: Cirugia|null, onClose: () => void, onSubmit: (datos) => void })` — default export, where `datos` matches the `Cirugia` shape minus `id`/`estado` (the caller in Task 12 decides whether to call `crearCirugia` or `actualizarCirugia`). When `cirugiaExistente` is passed, the form is prefilled and the header title changes to "Editar cirugía".

- [ ] **Step 1: Create `NuevaCirugiaModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './NuevaCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  ANESTESIOLOGOS_CATALOGO,
  CANASTAS_CATALOGO,
  CIRCULANTES_CATALOGO,
  CIRUJANOS_CATALOGO,
  EQUIPOS_CATALOGO,
  INSTRUMENTADORAS_CATALOGO,
  PROCEDIMIENTOS_CATALOGO,
  SALAS,
  SERVICIOS_CATALOGO,
  TIPOS_CIRUGIA_CATALOGO,
  fechaISO,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import Button from '@/Components/Button/Button';
import { LuCirclePlus, LuTriangleAlert } from 'react-icons/lu';

function toOptions(values) {
  return values.map((v) => ({ value: v, label: v }));
}

function minutosEntre(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  return Math.max((h2 * 60 + m2) - (h1 * 60 + m1), 0);
}

function formInicial(sedeId, cirugiaExistente) {
  if (cirugiaExistente) {
    const anestesiologo = cirugiaExistente.personal.find((p) => p.rol === 'Anestesiólogo')?.nombre ?? ANESTESIOLOGOS_CATALOGO[0];
    const instrumentadora = cirugiaExistente.personal.find((p) => p.rol === 'Instrumentadora')?.nombre ?? INSTRUMENTADORAS_CATALOGO[0];
    const circulante = cirugiaExistente.personal.find((p) => p.rol === 'Circulante')?.nombre ?? CIRCULANTES_CATALOGO[0];
    return {
      documento: cirugiaExistente.paciente.documento,
      nombrePaciente: cirugiaExistente.paciente.nombre,
      edad: cirugiaExistente.paciente.edad,
      sexo: cirugiaExistente.paciente.sexo,
      aseguradora: cirugiaExistente.paciente.aseguradora,
      procedimientoPrincipal: cirugiaExistente.procedimientoPrincipal,
      servicio: cirugiaExistente.servicio,
      tipoCirugia: cirugiaExistente.tipoCirugia,
      cirujano: cirugiaExistente.cirujano,
      salaId: cirugiaExistente.salaId,
      fecha: cirugiaExistente.fecha,
      horaInicio: cirugiaExistente.horaInicio,
      horaFin: cirugiaExistente.horaFin,
      anestesiologo,
      instrumentadora,
      circulante,
      equiposSeleccionados: cirugiaExistente.equipos.map((e) => e.nombre),
      canastaNombre: cirugiaExistente.canasta.nombre,
    };
  }
  const salaDefault = SALAS.find((s) => s.sedeId === sedeId)?.value ?? '';
  return {
    documento: '',
    nombrePaciente: '',
    edad: '',
    sexo: 'Femenino',
    aseguradora: '',
    procedimientoPrincipal: PROCEDIMIENTOS_CATALOGO[0],
    servicio: SERVICIOS_CATALOGO[0],
    tipoCirugia: TIPOS_CIRUGIA_CATALOGO[0],
    cirujano: CIRUJANOS_CATALOGO[0],
    salaId: salaDefault,
    fecha: fechaISO(new Date()),
    horaInicio: '07:00',
    horaFin: '09:00',
    anestesiologo: ANESTESIOLOGOS_CATALOGO[0],
    instrumentadora: INSTRUMENTADORAS_CATALOGO[0],
    circulante: CIRCULANTES_CATALOGO[0],
    equiposSeleccionados: [],
    canastaNombre: CANASTAS_CATALOGO[0].nombre,
  };
}

// Un solo componente para alta normal, alta de urgencia (prop `urgencia`) y
// edición (prop `cirugiaExistente`) -- las 3 comparten el mismo formulario,
// solo cambia el título/banner y qué función de mutación llama el padre al
// recibir `onSubmit` (ver Task 12). Campos de Paciente son texto simple
// (Documento/Nombre) en vez del buscador de paciente compartido del resto
// del proyecto: el encargo original solo pide estos 2 campos acá, no una
// búsqueda/alta completa (spec, sección "Modales").
export default function NuevaCirugiaModal({
  sedeId, urgencia = false, cirugiaExistente = null, onClose, onSubmit,
}) {
  const [form, setForm] = useState(() => formInicial(sedeId, cirugiaExistente));
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);
  const esEdicion = Boolean(cirugiaExistente);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleEquipo(nombre) {
    setForm((f) => ({
      ...f,
      equiposSeleccionados: f.equiposSeleccionados.includes(nombre)
        ? f.equiposSeleccionados.filter((n) => n !== nombre)
        : [...f.equiposSeleccionados, nombre],
    }));
  }

  const puedeEnviar = form.documento.trim() !== ''
    && form.nombrePaciente.trim() !== ''
    && form.salaId !== ''
    && form.fecha !== ''
    && form.horaInicio !== ''
    && form.horaFin !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    const canastaCatalogo = CANASTAS_CATALOGO.find((c) => c.nombre === form.canastaNombre);
    onSubmit({
      sedeId,
      salaId: form.salaId,
      paciente: {
        nombre: form.nombrePaciente,
        documento: form.documento,
        edad: form.edad === '' ? null : Number(form.edad),
        sexo: form.sexo,
        aseguradora: form.aseguradora,
      },
      procedimientoPrincipal: form.procedimientoPrincipal,
      servicio: form.servicio,
      tipoCirugia: form.tipoCirugia,
      cirujano: form.cirujano,
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      procedimientos: [{
        nombre: form.procedimientoPrincipal,
        tipo: 'principal',
        duracionMin: minutosEntre(form.horaInicio, form.horaFin),
        notas: '',
      }],
      personal: [
        { rol: 'Cirujano', nombre: form.cirujano },
        { rol: 'Anestesiólogo', nombre: form.anestesiologo },
        { rol: 'Instrumentadora', nombre: form.instrumentadora },
        { rol: 'Circulante', nombre: form.circulante },
      ],
      equipos: form.equiposSeleccionados.map((nombre) => ({ nombre, estado: 'disponible' })),
      canasta: {
        nombre: form.canastaNombre,
        items: (canastaCatalogo?.items ?? []).map((i) => ({ ...i })),
      },
      farmacia: esEdicion ? cirugiaExistente.farmacia : {
        numeroPedido: 'Pendiente', estado: 'en-preparacion', fechaSolicitud: `${fechaISO(new Date())}T00:00`, medicamentos: [],
      },
      urgencia,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ncm-modal-card" role="dialog" aria-modal="true" aria-labelledby="ncm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={urgencia ? LuTriangleAlert : LuCirclePlus}
            tone={urgencia ? 'warning' : 'primary'}
            title={esEdicion ? 'Editar cirugía' : (urgencia ? 'Nueva cirugía de urgencia' : 'Nueva cirugía')}
            titleId="ncm-title"
            onClose={onClose}
          />
          <div className="modal-body">
            {urgencia && (
              <div className="tf-warning-note">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                Esta cirugía será registrada como urgencia y puede afectar la programación existente de la sala.
              </div>
            )}

            <h4 className="ncm-section-title">Paciente</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-documento">Documento / ID</label>
                <input id="ncm-documento" type="text" value={form.documento} onChange={(e) => set('documento', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-nombre">Nombre</label>
                <input id="ncm-nombre" type="text" value={form.nombrePaciente} onChange={(e) => set('nombrePaciente', e.target.value)} required />
              </div>
            </div>

            <h4 className="ncm-section-title">Procedimiento</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-procedimiento">Procedimiento</label>
                <FormSelect id="ncm-procedimiento" value={form.procedimientoPrincipal} onChange={(v) => set('procedimientoPrincipal', v)} options={toOptions(PROCEDIMIENTOS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-servicio">Servicio</label>
                <FormSelect id="ncm-servicio" value={form.servicio} onChange={(v) => set('servicio', v)} options={toOptions(SERVICIOS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-tipo">Tipo de cirugía</label>
                <FormSelect id="ncm-tipo" value={form.tipoCirugia} onChange={(v) => set('tipoCirugia', v)} options={toOptions(TIPOS_CIRUGIA_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-cirujano">Cirujano</label>
                <FormSelect id="ncm-cirujano" value={form.cirujano} onChange={(v) => set('cirujano', v)} options={toOptions(CIRUJANOS_CATALOGO)} />
              </div>
            </div>

            <h4 className="ncm-section-title">Programación</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-sala">Sala</label>
                <FormSelect
                  id="ncm-sala"
                  value={form.salaId}
                  onChange={(v) => set('salaId', v)}
                  options={salasDeSede.map((s) => ({ value: s.value, label: s.label }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-fecha">Fecha</label>
                <input id="ncm-fecha" type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-hora-inicio">Hora inicio</label>
                <input id="ncm-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-hora-fin">Hora fin</label>
                <input id="ncm-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
              </div>
            </div>

            <h4 className="ncm-section-title">Recursos</h4>
            <div className="ncm-grid">
              <div className="form-field">
                <label htmlFor="ncm-anestesiologo">Anestesiólogo</label>
                <FormSelect id="ncm-anestesiologo" value={form.anestesiologo} onChange={(v) => set('anestesiologo', v)} options={toOptions(ANESTESIOLOGOS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-instrumentadora">Instrumentadora</label>
                <FormSelect id="ncm-instrumentadora" value={form.instrumentadora} onChange={(v) => set('instrumentadora', v)} options={toOptions(INSTRUMENTADORAS_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-circulante">Circulante</label>
                <FormSelect id="ncm-circulante" value={form.circulante} onChange={(v) => set('circulante', v)} options={toOptions(CIRCULANTES_CATALOGO)} />
              </div>
              <div className="form-field">
                <label htmlFor="ncm-canasta">Canasta de insumos</label>
                <FormSelect id="ncm-canasta" value={form.canastaNombre} onChange={(v) => set('canastaNombre', v)} options={toOptions(CANASTAS_CATALOGO.map((c) => c.nombre))} />
              </div>
              <div className="form-field full">
                <label id="ncm-equipos-label">Equipos</label>
                <div className="ncm-checklist" role="group" aria-labelledby="ncm-equipos-label">
                  {EQUIPOS_CATALOGO.map((nombre) => (
                    <label key={nombre} className="ncm-check-option">
                      <input type="checkbox" checked={form.equiposSeleccionados.includes(nombre)} onChange={() => toggleEquipo(nombre)} />
                      {nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!puedeEnviar}>
              {esEdicion ? 'Guardar cambios' : 'Crear cirugía'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `NuevaCirugiaModal.css`**

```css
.ncm-modal-card{width:680px;}
.ncm-modal-card .modal-body{overflow-y:auto;}
.ncm-section-title{margin:4px 0 0;font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-500);text-transform:uppercase;letter-spacing:.03em;}
.ncm-section-title:first-child{margin-top:0;}
.ncm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;}

.ncm-checklist{display:flex;flex-wrap:wrap;gap:8px;}
.ncm-check-option{
  display:inline-flex;align-items:center;gap:6px;
  border:1px solid var(--border);border-radius:var(--radius);padding:7px 10px;cursor:pointer;
  font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--ink-700);
}
.ncm-check-option:hover{background:var(--bg);}
.ncm-check-option input[type="checkbox"]{width:16px;height:16px;accent-color:var(--primary);}

@media (max-width:720px){
  .ncm-modal-card{width:100%;}
  .ncm-grid{grid-template-columns:1fr;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/NuevaCirugiaModal`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/modals/NuevaCirugiaModal
git commit -m "$(cat <<'EOF'
Add NuevaCirugiaModal

Single form for create, urgencia (alert banner + estado:'urgencia'), and
edit (cirugiaExistente prefill) -- Paciente/Procedimiento/Programacion/
Recursos sections. Not wired into ProgramacionSalaCirugias.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: `ReprogramarCirugiaModal` + `CancelarCirugiaModal`

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal.css`
- Create: `src/Components/ProgramacionSalaCirugias/modals/CancelarCirugiaModal/CancelarCirugiaModal.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/modals/CancelarCirugiaModal/CancelarCirugiaModal.css`

**Interfaces:**
- Consumes (Task 1): `fechaLabel`. (Task 7): `.modal-overlay`/`.modal-card`/`.modal-body`/`.modal-footer`/`.form-field`/`.tf-readonly-value`.
- Produces: `ReprogramarCirugiaModal({ cirugia: Cirugia, onClose: () => void, onSubmit: ({fecha, horaInicio, horaFin, motivo}) => void })` and `CancelarCirugiaModal({ cirugia: Cirugia, onClose: () => void, onSubmit: (motivo:string) => void })` — both default exports, both consumed by `ProgramacionSalaCirugias.jsx` in Task 12. Both require a non-empty `motivo` before the confirm button enables.

- [ ] **Step 1: Create `ReprogramarCirugiaModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './ReprogramarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuCalendarClock } from 'react-icons/lu';

export default function ReprogramarCirugiaModal({ cirugia, onClose, onSubmit }) {
  const [fecha, setFecha] = useState(cirugia.fecha);
  const [horaInicio, setHoraInicio] = useState(cirugia.horaInicio);
  const [horaFin, setHoraFin] = useState(cirugia.horaFin);
  const [motivo, setMotivo] = useState('');

  const puedeEnviar = motivo.trim() !== '' && fecha !== '' && horaInicio !== '' && horaFin !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    onSubmit({
      fecha, horaInicio, horaFin, motivo: motivo.trim(),
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card rcm-modal-card" role="dialog" aria-modal="true" aria-labelledby="rcm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarClock}
            tone="primary"
            title="Reprogramar cirugía"
            titleId="rcm-title"
            subtitle={cirugia.paciente.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rcm-grid">
              <div className="form-field">
                <label>Fecha actual</label>
                <div className="tf-readonly-value">{fechaLabel(cirugia.fecha)}</div>
              </div>
              <div className="form-field">
                <label>Hora actual</label>
                <div className="tf-readonly-value">{cirugia.horaInicio} – {cirugia.horaFin}</div>
              </div>
              <div className="form-field">
                <label htmlFor="rcm-fecha">Nueva fecha</label>
                <input id="rcm-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-inicio">Nueva hora inicio</label>
                <input id="rcm-hora-inicio" type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="rcm-hora-fin">Nueva hora fin</label>
                <input id="rcm-hora-fin" type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="rcm-motivo">Motivo</label>
              <textarea id="rcm-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={!puedeEnviar}>Reprogramar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `ReprogramarCirugiaModal.css`**

```css
.rcm-modal-card{width:520px;}
.rcm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;}

@media (max-width:560px){
  .rcm-modal-card{width:100%;}
  .rcm-grid{grid-template-columns:1fr;}
}
```

- [ ] **Step 3: Create `CancelarCirugiaModal.jsx`**

```jsx
'use client';

import { useState } from 'react';
import './CancelarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuBan } from 'react-icons/lu';

export default function CancelarCirugiaModal({ cirugia, onClose, onSubmit }) {
  const [motivo, setMotivo] = useState('');
  const puedeEnviar = motivo.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeEnviar) return;
    onSubmit(motivo.trim());
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card ccm-modal-card" role="dialog" aria-modal="true" aria-labelledby="ccm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuBan}
            tone="danger"
            title="Cancelar cirugía"
            titleId="ccm-title"
            subtitle={cirugia.paciente.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <p className="ccm-question">¿Deseas cancelar esta cirugía?</p>
            <div className="form-field">
              <label htmlFor="ccm-motivo">Motivo de cancelación *</label>
              <textarea id="ccm-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" variant="danger" disabled={!puedeEnviar}>Cancelar cirugía</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `CancelarCirugiaModal.css`**

```css
.ccm-modal-card{width:440px;}
.ccm-question{margin:0;font-size:var(--fs-base);color:var(--ink-700);}
```

- [ ] **Step 5: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal src/Components/ProgramacionSalaCirugias/modals/CancelarCirugiaModal`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal src/Components/ProgramacionSalaCirugias/modals/CancelarCirugiaModal
git commit -m "$(cat <<'EOF'
Add ReprogramarCirugiaModal and CancelarCirugiaModal

Both require a non-empty motivo before their confirm button enables.
Not wired into ProgramacionSalaCirugias.jsx yet.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Orchestrator — wire everything into `ProgramacionSalaCirugias.jsx`

**Files:**
- Modify: `src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx` (replace entire file — currently the placeholder)
- Modify: `src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.css` (replace entire file)

**Interfaces:**
- Consumes everything from Tasks 1–11: `mockCirugiaData.js` exports, `FiltrosBar`, `AccionesBar`, `AgendaSemana`, `DetalleCirugiaPanel`, `NuevaCirugiaModal`, `ReprogramarCirugiaModal`, `CancelarCirugiaModal`, `shared/shared.css`.
- Produces: the finished `ProgramacionSalaCirugias` page component — no further tasks depend on this one.

- [ ] **Step 1: Replace `ProgramacionSalaCirugias.jsx`**

```jsx
'use client';

import {
  useEffect, useRef, useState,
} from 'react';
import './ProgramacionSalaCirugias.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import FiltrosBar from './FiltrosBar/FiltrosBar';
import AccionesBar from './AccionesBar/AccionesBar';
import AgendaSemana from './AgendaSemana/AgendaSemana';
import DetalleCirugiaPanel from './DetalleCirugiaPanel/DetalleCirugiaPanel';
import NuevaCirugiaModal from './modals/NuevaCirugiaModal/NuevaCirugiaModal';
import ReprogramarCirugiaModal from './modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import CancelarCirugiaModal from './modals/CancelarCirugiaModal/CancelarCirugiaModal';
import {
  SALAS,
  SEMANA_ANCLA,
  actualizarCirugia,
  actualizarEstadoCirugia,
  addDias,
  cancelarCirugia,
  crearCirugia,
  diasDeSemana,
  fechaISO,
  fetchAgendaSemana,
  rangoSemanaLabel,
  reprogramarCirugia,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

export default function ProgramacionSalaCirugias() {
  const [sedeId, setSedeId] = useState('02');
  const [salaId, setSalaId] = useState('qx-1');
  const [weekStart, setWeekStart] = useState(SEMANA_ANCLA);
  const [estado, setEstado] = useState('todos');

  const [cirugias, setCirugias] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAgendaSemana({
      sedeId, salaId, weekStart, estado,
    }).then((items) => {
      if (cancelled) return;
      setCirugias(items);
    });
    return () => { cancelled = true; };
  }, [sedeId, salaId, weekStart, estado]);

  // Decide si una cirugía (recién creada/mutada) pertenece a la vista
  // actualmente visible -- evita un re-fetch completo después de cada
  // mutación: la respuesta de crearCirugia/actualizarCirugia/etc. ya trae
  // el registro completo, solo hace falta decidir si mostrarlo.
  function perteneceAVistaActual(c) {
    if (c.sedeId !== sedeId || c.salaId !== salaId) return false;
    const inicio = fechaISO(weekStart);
    const fin = fechaISO(addDias(weekStart, 6));
    if (c.fecha < inicio || c.fecha > fin) return false;
    if (estado !== 'todos' && c.estado !== estado) return false;
    return true;
  }

  function applyUpdated(actualizada) {
    setCirugias((prev) => {
      if (!perteneceAVistaActual(actualizada)) return prev.filter((c) => c.id !== actualizada.id);
      const existe = prev.some((c) => c.id === actualizada.id);
      return existe ? prev.map((c) => (c.id === actualizada.id ? actualizada : c)) : [...prev, actualizada];
    });
  }

  function handleSedeChange(v) {
    setSedeId(v);
    setSalaId(SALAS.find((s) => s.sedeId === v)?.value ?? '');
    setSelectedId(null);
  }
  function handleSalaChange(v) {
    setSalaId(v);
    setSelectedId(null);
  }
  function handleWeekStartChange(d) {
    setWeekStart(d);
    setSelectedId(null);
  }
  function handleEstadoChange(v) {
    setEstado(v);
    setSelectedId(null);
  }
  function handleVistaNoDisponible() {
    showToast('Esta vista está en desarrollo.');
  }

  const selectedCirugia = cirugias.find((c) => c.id === selectedId) ?? null;
  const salaLabelActual = SALAS.find((s) => s.value === salaId)?.label ?? '';

  function handleSubmitCirugiaForm(datos) {
    // `datos` siempre trae la key `urgencia` (NuevaCirugiaModal la agrega
    // sin importar el modo, ver Task 10) -- crearCirugia la consume para
    // decidir el estado inicial, pero Cirugia no tiene un campo `urgencia`
    // propio, así que en modo edición se descarta explícitamente para no
    // dejarla pegada al registro vía el merge de actualizarCirugia.
    const { urgencia, ...datosCirugia } = datos;
    if (modal.type === 'editar') {
      const actualizada = actualizarCirugia(modal.cirugia.id, datosCirugia);
      applyUpdated(actualizada);
      setSelectedId(actualizada.id);
      showToast('Cirugía actualizada correctamente.');
    } else {
      const nueva = crearCirugia({ ...datosCirugia, urgencia: modal.type === 'urgencia' });
      applyUpdated(nueva);
      setSelectedId(nueva.id);
      showToast(modal.type === 'urgencia' ? 'Cirugía de urgencia registrada.' : 'Cirugía creada correctamente.');
    }
    setModal(null);
  }

  function handleSubmitReprogramar(datos) {
    const actualizada = reprogramarCirugia(modal.cirugia.id, datos);
    applyUpdated(actualizada);
    setModal(null);
    showToast('Cirugía reprogramada correctamente.');
  }

  function handleSubmitCancelar(motivo) {
    const actualizada = cancelarCirugia(modal.cirugia.id, motivo);
    applyUpdated(actualizada);
    setModal(null);
    showToast('Cirugía cancelada correctamente.');
  }

  function handleMarcarProgramada() {
    if (!selectedCirugia) return;
    applyUpdated(actualizarEstadoCirugia(selectedCirugia.id, 'programada'));
    showToast('Cirugía marcada como programada.');
  }
  function handleMarcarIncumplida() {
    if (!selectedCirugia) return;
    applyUpdated(actualizarEstadoCirugia(selectedCirugia.id, 'incumplida'));
    showToast('Cirugía marcada como incumplida.');
  }
  // "Ver información/historial" solo tiene sentido con una cirugía
  // seleccionada (AccionesBar ya deshabilita el ítem del menú sin
  // selección) -- el panel de detalle ya está visible en ese momento, así
  // que no hay ninguna acción adicional que ejecutar en V1 (no existe un
  // historial de auditoría real en el mock, ver spec).
  function handleVerInfo() {}

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Programación sala de cirugías"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Programación sala de cirugías</h1>
              <p>Agenda y gestiona la ocupación de las salas de cirugía.</p>
            </div>
          </div>

          <FiltrosBar
            sedeId={sedeId}
            onSedeChange={handleSedeChange}
            salaId={salaId}
            onSalaChange={handleSalaChange}
            weekStart={weekStart}
            onWeekStartChange={handleWeekStartChange}
            estado={estado}
            onEstadoChange={handleEstadoChange}
            onVistaNoDisponible={handleVistaNoDisponible}
          />

          <AccionesBar
            selected={selectedCirugia}
            onNuevaCirugia={() => setModal({ type: 'nueva' })}
            onNuevaUrgencia={() => setModal({ type: 'urgencia' })}
            onReprogramar={() => selectedCirugia && setModal({ type: 'reprogramar', cirugia: selectedCirugia })}
            onCancelar={() => selectedCirugia && setModal({ type: 'cancelar', cirugia: selectedCirugia })}
            onMarcarProgramada={handleMarcarProgramada}
            onMarcarIncumplida={handleMarcarIncumplida}
            onVerInfo={handleVerInfo}
          />

          <div className="psc-main-row">
            <AgendaSemana
              weekLabel={rangoSemanaLabel(weekStart)}
              days={diasDeSemana(weekStart)}
              cirugias={cirugias}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onPrevWeek={() => handleWeekStartChange(addDias(weekStart, -7))}
              onNextWeek={() => handleWeekStartChange(addDias(weekStart, 7))}
            />
            <DetalleCirugiaPanel
              cirugia={selectedCirugia}
              salaLabel={salaLabelActual}
              onClose={() => setSelectedId(null)}
              onEditar={() => selectedCirugia && setModal({ type: 'editar', cirugia: selectedCirugia })}
              onReprogramar={() => selectedCirugia && setModal({ type: 'reprogramar', cirugia: selectedCirugia })}
              onCancelar={() => selectedCirugia && setModal({ type: 'cancelar', cirugia: selectedCirugia })}
            />
          </div>
        </div>
      </div>

      {(modal?.type === 'nueva' || modal?.type === 'urgencia' || modal?.type === 'editar') && (
        <NuevaCirugiaModal
          sedeId={sedeId}
          urgencia={modal.type === 'urgencia'}
          cirugiaExistente={modal.type === 'editar' ? modal.cirugia : null}
          onClose={() => setModal(null)}
          onSubmit={handleSubmitCirugiaForm}
        />
      )}
      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitReprogramar} />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal.cirugia} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`}>
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `ProgramacionSalaCirugias.css`**

```css
/* Tokens + reset del shell duplicados aquí siguiendo el mismo criterio que
   Admisiones.css / Home.css (cada feature de nivel superior es dueña de su
   propia copia) — ver AGENTS.md. */
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

html,body{margin:0;padding:0;}
body{
  font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";
  background:var(--bg);
}
html[data-theme="dark"] body{background:var(--bg);}

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

.psc-page-header{
  display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;
  flex-shrink:0;
}
.psc-page-header h1{font-size:var(--fs-3xl);font-weight:var(--fw-semibold);color:var(--ink-900);letter-spacing:-.01em;}
.psc-page-header p{font-size:var(--fs-base);color:var(--ink-500);margin-top:2px;}

.psc-main-row{display:flex;gap:16px;flex:1;min-height:0;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx`
Expected: no errors.

- [ ] **Step 4: Start the dev server and smoke test manually**

Run: `npm run dev` (or reuse an already-running instance), then in a browser at `/programacion-sala-cirugias`:

1. Semana 2026-08-31, sala Quirófano #1 loads the 8 seeded cirugías, positioned correctly by horario/duración (María Pérez 07:00–09:00 Monday, etc.).
2. Switch to Quirófano #2 (or navigate to another week) — agenda shows no cards.
3. Click a cirugía card — the detail panel loads with header/info/6 tabs, each tab shows real content (not empty).
4. "Nueva cirugía" — fill the form — new card appears in the agenda as Borrador, auto-selected.
5. "Cirugía de urgencia" (dropdown next to Nueva cirugía) — alert banner visible in the modal — created card shows the violet Urgencia badge.
6. Select a cirugía, click Reprogramar — confirm is disabled with an empty motivo — filling motivo and a new date/time moves the card (or removes it from the visible week if the new date falls outside it).
7. Select a cirugía, click Cancelar — motivo required — after confirming, the card turns red/Cancelada and its Reprogramar/Cancelar buttons (both in AccionesBar and inside the detail panel) become disabled.
8. "Marcar como programada" on a Borrador cirugía updates its badge to Programada; "Marcar como incumplida" on a Programada one updates it to Incumplida.
9. Resize the browser below 1024px width — the detail panel stops being docked and instead appears as a right-side overlay drawer when a cirugía is selected (Escape/backdrop-click closes it).
10. Click "Día" or "Mes" in the Vista segmented control — a toast reading "Esta vista está en desarrollo." appears, Semana stays the only active option.

- [ ] **Step 5: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.css
git commit -m "$(cat <<'EOF'
Wire up Programación de Sala de Cirugía V1

Replaces the ProgramacionSalaCirugias placeholder with the full screen:
filters, actions bar, weekly agenda, docked/drawer detail panel, and the
3 modals, backed by mockCirugiaData's fetch + mutation functions.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
