# Monitoreo (Atención de Enfermería) — V1

Fecha: 2026-09-02

## Contexto

Nueva pestaña "Monitoreo" dentro de Atención de Enfermería
(`src/Components/GestionEnfermeria/AtencionEnfermeria/AtencionEnfermeria.jsx`),
al mismo nivel que Gestión de medicamentos / Órdenes médicas / Pedidos /
Notas de enfermería. **No es una pestaña nueva desde cero**: ya existe un
placeholder deshabilitado (`AtencionEnfermeria.jsx:110-113`, id
`tab-monitoreo`, ícono `LuActivity`, `title="Próximamente"`) — este trabajo
lo activa.

Dos subtabs internas: **Hoja de medicamentos** (registro histórico de solo
lectura) y **Signos vitales** (registro manual + consulta en tabla/gráfica).

Decisiones ya validadas con el usuario (brainstorming previo):
- Badge de estado clínico (Administrado/Incidencia/Suspendido/Programado/
  Próximo): se extrae un componente reutilizable nuevo.
- Control de rango de fechas Hoy/Última semana/Rango personalizado: se
  construye nuevo, con scope acotado solo a Monitoreo (no se toca el control
  imperativo existente de Gestión de medicamentos).
- Toggle Tabla|Gráfica: componente nuevo en `GestionEnfermeria/shared/`.
- Gráfica multi-serie: se agrega **Recharts** como dependencia nueva
  (`npm install recharts`) — el proyecto no tenía librería de gráficos hasta
  ahora (todo era SVG a mano, ver `TendenciaChart.jsx`), pero para
  comparar N series simultáneas con escalas distintas Recharts evita
  reimplementar ejes/tooltips a mano.

**Correcciones a dos supuestos del encargo original** (verificados contra el
código, no asumidos):
- **No existe una categoría de tokens `--clinical-status-*` genérica para
  todo el sistema.** Sí existe ese prefijo (`shared/shared.css:66-99`), pero
  es específico del sistema de 8 estados de ocupación de camas de BedCard
  (occupied-male/female/pediatric, available, reserved, maintenance,
  out-of-service, cleaning, unknown) — un dominio distinto. Los 5 estados de
  dosis de medicamento (Administrado/Próximo/Incidencia/Programado/
  Suspendido) ya tienen su propio patrón CSS establecido y homologado
  (`.dp-status-badge.st-*`, `shared/shared.css:624-638`, mismos colores que
  `.legend-marker.*` en `MedicamentosPanel.css:193-197`) que consume los
  primitivos (`--green`/`--amber`/`--red`/`--gray-bg`/`--ink-500`)
  directamente — sin capa `--clinical-status-` intermedia. `ClinicalStatusBadge`
  reutiliza `.dp-status-badge`/`.st-*` tal cual, no introduce un tercer
  sistema de nombres.
- **Ya existe un modal "Registrar signos vitales"** —
  `TareasEnfermeria/CompleteVitalsModal/CompleteVitalsModal.jsx` — pero es
  de un flujo distinto (completar una tarea de tipo "Toma de signos
  vitales") con solo 4 campos (FC/FR/PA sistólica-diastólica/Temperatura,
  vocabulario de examen físico). El de Monitoreo es un registro
  independiente con los 7 parámetros exactos pedidos (T.A.S./T.A.D./T.A.M./
  F.R./Pulso/Temp./Sat. O2, vocabulario de hoja de enfermería) y sin
  vínculo a ninguna tarea. Queda documentada la superposición conceptual
  Pulso≈FC entre ambos flujos — reconciliarlos es una decisión de producto
  aparte, fuera de alcance acá.

## Alcance

**Sí, en V1:**
- Activar el tab "Monitoreo" (quitar `disabled` del botón existente,
  agregar su panel).
- Subtab "Hoja de medicamentos": tabla de solo lectura + filtros (Rango/
  Turno/Estado) + exportar/imprimir (placeholder de acción). Estados vacío
  y cargando.
- Subtab "Signos vitales": toggle Tabla/Gráfica, selector Hoy/Semana/
  Rango personalizado, tabla con resaltado de anormal (función inyectable
  mockeada), gráfica multi-serie con Recharts, modal de registro manual.
- Componentes nuevos reutilizables: `ClinicalStatusBadge`, `ViewToggle`
  (ambos en `GestionEnfermeria/shared/`).

**No en V1 (explícito):**
- Columnas colapsables/expandibles en la tabla de vitales.
- Integración con dispositivos/monitores automáticos.
- Escala de dolor / EVA.
- Lógica clínica real de umbrales por perfil de paciente — queda mockeada
  tras una función inyectable.
- Migrar `MedicamentosPanel.jsx` a `ClinicalStatusBadge`/`ViewToggle`
  (deuda documentada, mismo criterio que la migración de botones pendiente
  en AGENTS.md).
- Reconciliar `CompleteVitalsModal` con el nuevo modal de Monitoreo.
- Backend/persistencia real — todo dato nuevo registrado vive solo en
  estado de React de sesión (se pierde al recargar), igual que el resto de
  `GestionEnfermeria` sobre `legacy-app.js`.

## Arquitectura — activar el tab existente

`legacy-app.js:856` calcula `cardTabs` como
`document.querySelectorAll('.card-tab:not([disabled])')` **una sola vez**,
al montar (`initGestionEnfermeria()` corre en el `useEffect` de
`AtencionEnfermeria.jsx:39-42`). Por eso alcanza con quitarle `disabled`/
`aria-disabled`/`title` al botón de Monitoreo y darle el mismo shape que
`tab-medicamentos` (que es el único de los 4 tabs existentes con
`aria-controls` correctamente cableado, `AtencionEnfermeria.jsx:98`):

```jsx
<button type="button" className="card-tab" role="tab" id="tab-monitoreo"
  aria-selected="false" aria-controls="panel-monitoreo" tabIndex="-1">
  <LuActivity className="icon" aria-hidden="true" />
  Monitoreo
</button>
```

Y montar `<Monitoreo />` junto a los otros paneles (`AtencionEnfermeria.jsx:120-122`).
`selectCardTab` (`legacy-app.js:857-869`) ya hace el resto (toggla `.active`/
`aria-selected` del tab y `.active` del `.tab-panel` cuyo id coincide) — no
se toca `legacy-app.js`.

El subnav interno (Hoja de medicamentos/Signos vitales) usa el mismo
mecanismo genérico ya usado por `PedidosPanel` (`legacy-app.js:882-910`,
`.subnav-bar`/`.subnav-tab` + hermanos `.sub-panel`, ver
`PedidosPanel.jsx:14-26` y `SolicitudesSub.jsx:10`) — **cero código nuevo
en `legacy-app.js`**, el `querySelectorAll('.subnav-bar')` ya barre
cualquier `.subnav-bar` presente en el DOM al montar.

`PatientBanner` no se toca — ya está montado una sola vez a nivel
`AtencionEnfermeria` (`AtencionEnfermeria.jsx:69-93`), visible en los 5 tabs.

## Estructura de archivos

```
src/Components/GestionEnfermeria/Monitoreo/
  Monitoreo.jsx / .css                      — shell: tab-panel + subnav-bar
  HojaMedicamentosTab/HojaMedicamentosTab.jsx / .css
  SignosVitalesTab/
    SignosVitalesTab.jsx / .css
    DateRangeChips/DateRangeChips.jsx / .css
    VitalesChart/VitalesChart.jsx / .css
  modals/
    RegistrarSignosVitalesModal/RegistrarSignosVitalesModal.jsx / .css

src/Components/GestionEnfermeria/shared/
  ClinicalStatusBadge/ClinicalStatusBadge.jsx / .css
  ViewToggle/ViewToggle.jsx / .css

src/hooks/GestionEnfermeria/
  mockMonitoreo.js       — HOJA_MEDICAMENTOS[], VITALES_READINGS[] iniciales
  vitalAbnormality.js    — isVitalAbnormal(paramKey, value, patientProfile)

# Modificados:
src/Components/GestionEnfermeria/AtencionEnfermeria/AtencionEnfermeria.jsx  (activar tab)
package.json   (+ recharts)
```

## `Monitoreo.jsx` — shell

```jsx
<div role="tabpanel" id="panel-monitoreo" aria-labelledby="tab-monitoreo" tabIndex="0" className="tab-panel">
  <div className="subnav-bar" role="tablist" aria-label="Secciones de monitoreo">
    <button ... id="subtab-hoja-medicamentos" aria-controls="subpanel-hoja-medicamentos" className="subnav-tab active">Hoja de medicamentos</button>
    <button ... id="subtab-signos-vitales" aria-controls="subpanel-signos-vitales" className="subnav-tab">Signos vitales</button>
  </div>
  <HojaMedicamentosTab />   {/* id="subpanel-hoja-medicamentos", className="sub-panel active" */}
  <SignosVitalesTab />      {/* id="subpanel-signos-vitales", className="sub-panel" */}
</div>
```

Mismo patrón exacto que `PedidosPanel.jsx`/`SolicitudesSub.jsx` — ambos
subtabs montan siempre, visibilidad la resuelve el CSS `.sub-panel.active`
vía el toggle de clases que ya hace `legacy-app.js`.

## Subtab 1 — `HojaMedicamentosTab`

Toolbar (`filter-bar`, una sola fila): `FormSelect` Rango (opciones:
Estancia completa [default] / Hoy / Última semana / Rango personalizado) →
`FormSelect` Turno (Todos [default]/Mañana/Tarde/Noche) → `FormSelect`
Estado (Todos [default]/Administrado/Incidencia/Suspendido) → `filter-spacer`
→ `Button variant="outline" icon={LuDownload}` "Exportar / Imprimir"
(placeholder: `console.log`/toast, sin generación real de PDF en V1).

Tabla (`.data-table-wrap`/`.data-table`, `shared/shared.css:774-790` — el
mismo patrón ya usado por `OrdenesMedicasPanel.jsx:186`, no una tabla
nueva):

| Medicamento | Programado | Real | Administrado por | Estado | Nota |
|---|---|---|---|---|---|

- Medicamento: `.cell-primary` (nombre+dosis+vía) + `.cell-sub`
  (frecuencia), mismo patrón que otras filas de `.data-table`.
- Estado: `<ClinicalStatusBadge status="administered|incident|suspended" />`.
- Nota: `.cell-muted` si vacía (`—`).

Estados: vacío = mensaje centrado (ícono + texto, "No hay registros para
el rango seleccionado.") si el array filtrado da `[]`; cargando = 3-4 filas
skeleton (`.cell-block`-style placeholder, incorporado a `.data-table` como
regla nueva ya que no existe skeleton para esta tabla en el proyecto).

Dataset: `HOJA_MEDICAMENTOS` en `mockMonitoreo.js`, forma:
```js
{ id, medicamento: { nombre, dosis, via, frecuencia }, programado: 'HH:mm',
  real: 'HH:mm' | null, administradoPor: string | null,
  estado: 'administered'|'incident'|'suspended', nota: string | null,
  turno: 'manana'|'tarde'|'noche' }
```

## Subtab 2 — `SignosVitalesTab`

Fila de controles: `ViewToggle` (Tabla|Gráfica) + `DateRangeChips`
(Hoy/Última semana/Rango personalizado) + `filter-spacer` +
`Button variant="primary" icon={LuPlus}` "Registrar signos vitales" (abre
`RegistrarSignosVitalesModal`).

**7 parámetros fijos** (clave interna → columna):
`tas`(T.A.S.) · `tad`(T.A.D.) · `tam`(T.A.M., calculado) · `fr`(F.R.) ·
`pulso`(Pulso) · `temp`(Temp.) · `satO2`(Sat. O2).

### `DateRangeChips/DateRangeChips.jsx`

Mismo markup/clases que `MedicamentosPanel.jsx:42-70` (`.chip-group.segmented`
para Hoy/Semana + `.filter-popover-wrap`/`.date-picker-btn`/`.filter-popover`
para el rango personalizado con `.fp-date-row`/`.fp-actions`), pero
reimplementado en React puro con `useState`/`useRef` — mismo mecanismo de
click-outside/Escape que `GestionCamas/ViewToggle/ViewToggle.jsx:14-32` (la
única diferencia real: acá es el control de fechas, no el de vista). Props:
`{ value: {mode:'hoy'|'semana'|'custom', desde, hasta}, onChange }`.

### Vista Tabla

`.data-table` con columnas: Fe. Toma, Hora Toma, T.A.S., T.A.D., T.A.M.,
F.R., Pulso, Temp., Sat. O2, Tomado por, Observación, Área funcional. Sin
colapsables (explícito, layout fijo). Celda de cada parámetro:
```jsx
<td className={isAbnormal(param, value, patientProfile) ? 'vital-cell-alert' : undefined}>{value}</td>
```
`.vital-cell-alert{background:var(--red-bg);color:var(--red);border-radius:4px;}`
— mismo token que `.dp-status-badge.st-incident`, ninguna paleta nueva.
`isAbnormal` default = `isVitalAbnormal` de `vitalAbnormality.js`, pero
recibido como prop opcional (`isAbnormal = isVitalAbnormal`) para que la
lógica clínica real se conecte después sin tocar la tabla.

### Vista Gráfica — `VitalesChart/VitalesChart.jsx`

Chips multi-select (`.chip-group` + `.chip-filter.active` por parámetro
activo, mismo patrón visual que `turno-chip-group`/`via-chip-group` de
`MedicamentosPanel.jsx:83-96` pero con toggle multi en vez de single),
viven en `SignosVitalesTab` (un solo consumidor, no se extraen a
componente aparte).

`VitalesChart` recibe `{ readings, activeParams }` y arma un
`<LineChart>` de Recharts con:
- Un `<XAxis dataKey="fechaHora" />` compartido.
- **Un `<YAxis yAxisId={param} hide />` por parámetro activo** (en vez de
  un solo eje compartido) — T.A.S. (~120) y Temp. (~37) tienen escalas
  incompatibles; con eje propio por serie cada línea se autoescala a su
  propio rango visible sin aplastar a las demás. El tooltip muestra el
  valor real de cada serie activa (no hay que normalizar los datos).
- Un `<Line yAxisId={param} dataKey={param} stroke={PARAM_COLOR[param]} />`
  por parámetro activo.
- Paleta `PARAM_COLOR` (7 colores, uno por parámetro, tokens ya existentes
  en `shared/shared.css:16-99`, ninguno nuevo): T.A.S.→`--red`,
  T.A.D.→`--orange`, T.A.M.→`--amber`, F.R.→`--blue`, Pulso→`--violet-fg`,
  Temp.→`--cyan`, Sat. O2→`--green`.

Dependencia nueva: `recharts` en `package.json` (proyecto no tenía librería
de gráficos — confirmado, ver `TendenciaChart.jsx` como único precedente
SVG-a-mano).

### `RegistrarSignosVitalesModal`

`ModalHeader` (`icon={LuActivity}`, `tone="primary"`, título "Registrar
signos vitales") + `modal-body` con grid de `form-field` (mismo patrón que
`CompleteVitalsModal.jsx:41-63`, pero con los 7 campos de este spec en vez
de los 4 de esa modal):
- T.A.S., T.A.D. (inputs numéricos) → T.A.M. se recalcula en cada `onChange`
  de esos dos: `Math.round((tas + 2 * tad) / 3)`, mostrado en un
  `form-field` con input `disabled`/`readOnly` (no editable a mano).
- F.R., Pulso, Temp., Sat. O2 (inputs numéricos).
- Observación (`textarea`).
- Hora: autocompletada con la hora actual al abrir (`new Date()`),
  editable.
- Registrado por: usuario de sesión (mismo `{name: 'Camilo Grondona', ...}`
  que ya usa `Topbar` en `AtencionEnfermeria.jsx:56`), texto plano no
  editable.

Footer: `Button variant="secondary"` Cancelar + `Button variant="primary"
type="submit"` Registrar. Sin `FormSelect` (no hay ningún desplegable en
este formulario). Al confirmar, agrega el registro al estado local de
`SignosVitalesTab` (sin persistencia real, ver Alcance).

## Componentes compartidos nuevos

### `ClinicalStatusBadge/ClinicalStatusBadge.jsx`

```jsx
<ClinicalStatusBadge status="administered" />
// → <span className="dp-status-badge st-administered"><span className="dot"/>Administrado</span>
```

Props: `{ status: 'administered'|'upcoming'|'incident'|'scheduled'|'suspended' }`.
Config interna (label por key) espejo de `STATUS_META` en
`legacy-app.js:225-231`, pero como componente React — no se importa
`legacy-app.js` desde acá (es imperativo/legacy, ver Contexto). CSS: ningún
archivo nuevo de reglas de color — consume `.dp-status-badge`/`.st-*`/`.dot`
ya definidas en `shared/shared.css:624-638` (con su variante dark en
`shared/shared.css:895-904`); `ClinicalStatusBadge.css` queda vacío o solo
con el import comentado a `shared.css` si hace falta layout extra.

### `ViewToggle/ViewToggle.jsx`

```jsx
<ViewToggle view={view} onChange={setView} options={[
  { value: 'tabla', label: 'Tabla', icon: LuList },
  { value: 'grafica', label: 'Gráfica', icon: LuLineChart },
]} />
```

Mismo patrón visual (`.segmented-control`/`.segmented-btn`) que el toggle
Timeline/Lista de `MedicamentosPanel.jsx:114-117`, pero **visible directo
en la fila de controles** (no detrás de un popover "Vista" como el de
`GestionCamas/ViewToggle/ViewToggle.jsx` o el de Medicamentos) — match con
el wireframe, que muestra el pill de 2 opciones sin trigger/dropdown.
`options` como prop (no hardcodeado a Tabla/Gráfica) para que sea
reutilizable si `MedicamentosPanel` migra su Timeline/Lista más adelante
(deuda documentada, no se hace ahora).

## `vitalAbnormality.js`

```js
// Mock: rangos fijos de adulto. Reemplazar por lógica real dependiente de
// patientProfile (edad, diagnóstico...) sin cambiar la firma ni los
// call sites — es la función inyectable pedida en el encargo.
export function isVitalAbnormal(paramKey, value, patientProfile) {
  const RANGES = {
    tas: [90, 140], tad: [60, 90], tam: [70, 105],
    fr: [12, 20], pulso: [60, 100], temp: [36, 37.5], satO2: [95, 100],
  };
  const [min, max] = RANGES[paramKey] ?? [];
  return value != null && (value < min || value > max);
}
```

## Testing

Sin suite automatizada en este proyecto — verificación manual con el
servidor de desarrollo:

1. El tab "Monitoreo" ya no aparece deshabilitado; al hacer click se activa
   igual que los otros tabs (mismo comportamiento de teclado ←/→/Home/End).
2. Subtab "Hoja de medicamentos" por defecto; cambiar a "Signos vitales" y
   volver conserva el estado de cada uno (no se resetean los filtros).
3. Hoja de medicamentos: cambiar Rango/Turno/Estado filtra la tabla;
   forzar el dataset a `[]` muestra el estado vacío.
4. Signos vitales, vista Tabla: un valor fuera de rango mockeado se resalta
   en rojo; el resto no.
5. Toggle a vista Gráfica: activar/desactivar chips agrega/quita líneas;
   activar T.A.S. + Temp. simultáneamente no aplasta ninguna de las dos
   (cada una escala a su propio eje).
6. "+ Registrar signos vitales": T.A.M. se recalcula en vivo al tipear
   T.A.S./T.A.D.; "Registrado por" no es editable; al confirmar, la nueva
   lectura aparece en la tabla y en la gráfica (si su parámetro está
   activo).
7. Verificar que `npm run build`/`npm run dev` no rompen tras agregar
   `recharts`.
