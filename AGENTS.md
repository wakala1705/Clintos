<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Component organization

Never create loose/floating `.jsx` or `.css` files. Everything lives in a
predictable, nested location:

- **All reusable components live under `src/Components/`.** Nothing that
  qualifies as a component (anything that isn't a Next.js route file —
  `page.js(x)`, `layout.js(x)`, `loading`, `error`, `not-found`, `route`,
  `template`) belongs inline in `src/app/**`. Use the `@/*` path alias
  (`@/Components/...`, maps to `./src/*`) to import them.
- **Feature grouping**: components for one feature/route live under a feature
  folder named after that route, e.g. `src/Components/HistoriaClinica/`.
  Sub-groupings (like `modals/` or `pedidos/`) are lowercase subfolders inside
  the feature folder, mirroring how the old inline `components/` tree was laid
  out.
- **App-wide components** (used by 2+ routes, like `Sidebar`) live directly
  under `src/Components/<ComponentName>/`, not nested inside a single
  feature's folder. Derive per-route state (active links, open groups, etc.)
  from `usePathname()` instead of hardcoding it per page.
- **One component = one folder.** Every `.jsx` component gets its own folder
  named after the component, containing exactly `ComponentName.jsx` +
  `ComponentName.css`, e.g. `src/Components/HistoriaClinica/PatientBanner/PatientBanner.jsx`
  and `PatientBanner.css`. The component imports its own CSS file
  (`import './ComponentName.css'`).
- **Shared/cross-cutting styles**: when 2+ components in a feature genuinely
  reuse the same rules (buttons, modal scaffolding, filter bars, tabs, tables,
  popovers...), put those rules once in `<Feature>/shared/shared.css` instead
  of duplicating them into every component's own CSS file. Import
  `shared.css` once from the route's `page.jsx` (not from each component) so
  there's a single source of truth and no import-order surprises. A
  component's own CSS file should contain only the rules unique to that
  component — add a one-line comment pointing to `shared.css` when a class it
  uses is actually styled there.
- **Route files stay in `src/app/...`** per Next.js convention. A route's
  `page.jsx` may keep a small, page-scoped CSS file alongside it (e.g.
  `src/app/historia-clinica/historia-clinica.css`) for markup that belongs to
  the page shell itself and isn't an extracted component (e.g. the outer
  card/tabs wrapper).

Before splitting styles for a new/changed component: check whether a rule is
only ever used by that one component (goes in its own `.css`) or reused by
others (goes in `shared.css`) — don't guess, grep the other components in the
same feature folder first.

# Modales

Todo modal del proyecto usa un único header homologado — no reinventar
`.modal-header`/botón de cerrar por feature. Antes de esto había 13
variantes estructurales distintas repartidas en 8 features (paddings,
radios del botón cerrar, y hasta su color de hover divergían sin querer
entre features — ver bitácora de homologación de modales para el detalle).

- **Componente**: `@/Components/ModalHeader/ModalHeader` — úsalo para la fila
  de título+cerrar de todo modal nuevo, sin excepción.
  ```jsx
  <ModalHeader
    icon={LuTriangleAlert}         // opcional — omití el prop si el modal no necesita ícono
    tone="warning"                 // neutral (default) | primary | warning | danger
    title="Suspender tratamiento"
    titleId="suspend-modal-title"  // opcional, para aria-labelledby del modal
    subtitle="Turno mañana · 07:00–15:00" // opcional, línea secundaria bajo el título
    onClose={onClose}
    closeLabel="Cerrar formulario" // opcional, default "Cerrar"
    trailing={<span className="badge">Confirmado</span>} // opcional, entre título y botón cerrar
    closeId="admin-modal-close"    // solo para modales legacy-imperativos, ver abajo
    autoFocusClose                 // opcional, foco inicial en el botón cerrar
  />
  ```
- **Spec fija** (no se overridea por feature): padding `16px 24px`; heading
  siempre `<h3>` (nunca un `<div>`) en `--fs-lg`/`--fw-semibold`; ícono
  opcional en círculo 34px con 4 tonos semánticos; botón cerrar `30px` de
  lado / radio `8px` con hover `var(--gray-bg)` (nunca un hex hardcodeado
  tipo `#f3f5f9`).
- **Solo consume tokens, no los define**: `ModalHeader.css` lee
  `--gray-bg`/`--border`/`--primary`/`--primary-50`/`--amber-bg`/`--amber-fg`/
  `--red-bg`/`--red`/`--ink-500`/`--ink-700`/`--ink-900` del `:root` de la
  feature donde se monta — por eso funciona igual en cualquier ruta sin que
  el componente sepa dónde está montado. **Toda feature nueva debe declarar
  estos tokens en su propio `:root`** (mismo criterio de duplicación por
  feature que el resto de tokens de color, ver "Component organization"
  arriba) — a SolicitudConsumo le faltaba `--gray-bg` y el hover del botón
  cerrar quedaba sin efecto visible hasta que se agregó.
- **Modales legacy-imperativos** (los que abre/cierra `legacy-app.js` vía
  `document.getElementById(...).addEventListener(...)` en vez de un
  `onClose` de React, ver "Hooks / logic organization" abajo): pasales
  `closeId` para que el botón conserve el id que ese script escucha.
- **Fuera de este componente** (son otro tipo de elemento, no un header de
  modal clásico — no los fuerces al patrón de arriba): diálogos de
  confirmación centrados sin fila de header (ver `.nc-discard-modal` en
  `NuevaCitaFlow.jsx`) y los rails de wizard (`.wizard-rail-header`/
  `.wizard-main-header`, son navegación de pasos, no el título de un
  diálogo).

# Selects de formulario

Ningún `<select>` nativo dentro de un `.form-field` (formularios de modal,
filtros de header, popovers "Más filtros") — el `<select>` del navegador no
respeta el estilo del proyecto (tipografía, radios, dropdown). Usar siempre
`@/Components/FormSelect/FormSelect` en su lugar, sin excepción para
controles nuevos.

```jsx
<div className="form-field">
  <label htmlFor="cba-fp-piso" className="fp-section-title">Piso</label>
  <FormSelect
    id="cba-fp-piso"
    value={draft.piso}
    onChange={(v) => setDraft((d) => ({ ...d, piso: v }))}
    options={PISOS}           // [{ value, label }, ...] — mismo shape que las opciones de <select>
    placeholder="Selecciona una opción" // opcional
    disabled={false}          // opcional
  />
</div>
```

- **Por qué un componente propio y no CSS sobre el `<select>` nativo**: el
  dropdown nativo no se puede re-estilizar de forma consistente entre
  navegadores (padding de las opciones, radios, sombra) — `FormSelect`
  reemplaza el `<select>` por un trigger + listbox propios (mismo criterio
  que `AreaSelector.jsx`: estado local `open`, cierre por click-afuera/
  Escape) que sí toma los tokens del proyecto.
- **`onChange` recibe el value directo**, no un evento — a diferencia del
  `<select>` nativo (`onChange={(v) => ...}`, nunca
  `onChange={(e) => ... e.target.value}`).
- El trigger se porta con `position:fixed` (vía `createPortal` a
  `document.body`) para no romper el `overflow-y:auto` de un `.modal-body`
  — no hace falta nada especial al usarlo dentro de un modal, ya lo resuelve
  el componente.
- **Dentro de un popover con su propio cierre por click-afuera** (patrón
  `filter-popover-wrap`: `document.addEventListener('mousedown', ...)` +
  `rootRef.current.contains(e.target)`, ver `CamasFiltrosPopover.jsx`): ese
  listener también hay que blindarlo con
  `if (e.target.closest('.form-select-dropdown')) return;` al principio del
  handler. Sin eso, un click en una opción de `FormSelect` no cuenta como
  "adentro" — su listbox está en `document.body`, no en el DOM del popover —
  y el popover se cierra en el `mousedown` (antes de que el `click` de la
  opción llegue a disparar `onChange`), o sea: el filtro nunca se aplica,
  solo parece que el dropdown "no deja elegir". Bug real encontrado al migrar
  `CamasFiltrosPopover` — cualquier otro popover de la lista de abajo lo va a
  repetir si se migra sin este chequeo.
- **Migración incremental**: varios `FiltrosPopover` de Gestión de Camas
  (`AuditoriaFiltrosPopover`, `ConfiguracionFiltrosPopover`,
  `InconsistenciasFiltrosPopover`, `MasFiltrosPopover`) todavía usan
  `<select>` nativo — quedan pendientes de migrar, no son el estándar a
  seguir para código nuevo. Los selects de paginación ("X por página") no
  entran en esta regla: son un control de página, no un campo de formulario.

# Barra de filtros de listado

Toda card con tabla/listado principal (Panel General → pacientes, Tareas,
Centro de Alertas...) usa **una sola fila** de toolbar — nunca 2 bloques
separados (uno para tabs/chips rápidos, otro para el resto de los filtros).
Encargo explícito tras encontrar que Centro de Alertas había divergido a 2
filas (`.alert-list-tabs` arriba + `.filter-bar` abajo) mientras el resto del
proyecto (`PatientsPanel.jsx`, referencia canónica) ya usaba 1 sola fila.

- **Orden de izquierda a derecha, fijo**: buscador (`.search-field`) primero,
  después `.filter-spacer` (empuja todo lo demás a la derecha), después los
  chips rápidos de estado/categoría (`@/Components/SegmentedFilterBar/SegmentedFilterBar`,
  no un `chip-group` armado a mano — ver `PatientsPanel.jsx`), después el
  resto de los filtros (`FilterDropdown`/`AreaSelector`/selects propios,
  agrupados en `.filter-cluster` si son varios), y al final, si corresponde,
  el botón "Limpiar filtros" (solo cuando `hayFiltrosActivos`).
- Todo esto vive en un único `<div className="filter-bar ...">` — la clase
  del toolbar-por-feature (ej. `.alert-list-toolbar`, `.pg-patients-toolbar`)
  solo overridea `.search-field{width:...}` y, si hace falta, el wrap de
  `.filter-cluster`; nunca redefine `display:flex`/`gap` (ya vienen de
  `.filter-bar` en `shared.css`, mismo criterio que el resto de tokens
  compartidos por feature).
- Con muchos controles (Centro de Alertas: tabs + 4 filtros + búsqueda) la
  fila envuelve en `flex-wrap:wrap` en vez de forzar un segundo bloque fijo
  — es una fila más densa, no una excepción al patrón de una sola fila.

# Hooks / logic organization

All non-visual logic (custom hooks, imperative init/controller modules like
`legacy-app.js`, anything that isn't JSX) lives under a single centralized
`src/hooks/` folder — never inline next to a route in `src/app/**`.

- **One module = one folder**, named after the feature/route it belongs to,
  matching the same name used under `src/Components/` (e.g.
  `src/hooks/HistoriaClinica/` pairs with `src/Components/HistoriaClinica/`).
- Files inside that folder keep their existing name/exports (e.g.
  `src/hooks/HistoriaClinica/legacy-app.js` exporting `initHistoriaClinica`) —
  don't rename on move unless asked.
- Import via the `@/*` alias: `@/hooks/<Module>/<file>`.
- If a module needs multiple logic files (several hooks, helpers, etc.), they
  all nest inside that same module folder — never as loose files directly
  under `src/hooks/`.

# Tipografía

Todo diseño/componente nuevo debe ajustarse a este sistema tipográfico único
— no introducir una tipografía, un `font-size` en px suelto, ni una escala
paralela.

- **Familia**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  Helvetica, Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"`. Definida
  en el `body` de `src/app/globals.css` (carga en toda ruta vía `layout.js`)
  y repetida en el `body{}` de cada feature de nivel superior — mismo
  criterio de duplicación por feature que los tokens de color (ver
  "Component organization" arriba). Al crear una feature nueva, copia ese
  mismo stack en su propio `body{font-family:...}`; nunca una tipografía
  distinta (`Inter`, `Manrope`, etc.) aunque una referencia de diseño la
  pida — tradúcela a este stack.
- **Escala de `font-size`** (8 pasos, tokens `--fs-*`): a diferencia de los
  tokens de color, esta escala **no se duplica por feature** — vive una sola
  vez en el `:root` de `src/app/globals.css`, porque no tiene variante de
  tema oscuro/alto contraste y ese archivo ya carga en toda ruta.

  | Token | Valor | Uso |
  |---|---|---|
  | `--fs-xs` | 11px | badges/contadores mínimos, etiquetas uppercase, meta, kickers de tabla |
  | `--fs-sm` | 12px | texto secundario, hints, captions |
  | `--fs-base` | 14px | **base**: botones, inputs, labels, tabla, párrafos, `body` |
  | `--fs-lg` | 16px | CTAs primarios, valor destacado pequeño |
  | `--fs-xl` | 18px | subtítulos de sección, headers de panel/wizard |
  | `--fs-2xl` | 20px | `h1` de página |
  | `--fs-3xl` | 24px | valores de KPI grandes, hero |
  | `--fs-4xl` | 28px | heading principal (el más grande del proyecto) |

  Cualquier `font-size` nuevo toma el token más cercano de esta tabla
  (`font-size:var(--fs-base)`, nunca `font-size:14px`) — no crear un paso
  intermedio nuevo; la jerarquía adicional dentro de un mismo tamaño se logra
  con `font-weight`/color.
- **Escala de `font-weight`** (4 pasos, tokens `--fw-*`): mismo criterio de
  no-duplicación por feature que `--fs-*` — vive una sola vez en el `:root`
  de `src/app/globals.css`. El peso lo determina el **rol** del texto, no su
  tamaño: un mismo `--fs-base` puede llevar cualquiera de estos 4 según sea
  cuerpo, dato con énfasis, label o heading.

  | Token | Valor | Uso |
  |---|---|---|
  | `--fw-regular` | 400 | texto de cuerpo plano, labels sin énfasis |
  | `--fw-medium` | 500 | texto de cuerpo con énfasis (nombres, valores de tabla, botones secundarios, tabs activos) |
  | `--fw-semibold` | 600 | **todo título/heading** (página, sección, card, panel, modal), labels de formulario, badges/chips, botones |
  | `--fw-bold` | 700 | valores KPI grandes, cifras destacadas — nunca headings |

  Cualquier `font-weight` nuevo toma uno de estos 4 tokens
  (`font-weight:var(--fw-semibold)`, nunca `font-weight:600`) — no usar
  `bold`/`normal` ni pesos intermedios (300/800/900).

  **Títulos siempre en `--fw-semibold`, nunca `--fw-bold`**: el `h1`/`h2`/`h3`
  o clase `*-title`/`*-header h*` de una página, sección, card, panel o modal
  usa `--fw-semibold` sin importar su `font-size` (un `h1` en `--fs-2xl` pesa
  igual que un `title` de card en `--fs-lg` — la jerarquía visual la da el
  tamaño, no el peso). `--fw-bold` queda reservado para cifras/valores
  destacados (KPIs, resultados numéricos) que necesitan distinguirse de los
  títulos que los rodean, no para headings en sí.

# Botones

Primer paso de un design system de botones — hoy son solo variables, no un
componente `<Button>` (ver "Component organization" para cuándo llega ese
paso). El proyecto tiene 55+ archivos con clases `.btn*` propias y ya
divergen entre sí (`GestionEnfermeria/shared.css` define 6 variantes +
tamaño `sm`; `GestionCamas.css` solo 2) — mismo tipo de deriva que ya pasó
con los headers de modal antes de `ModalHeader` (ver sección "Modales").
Estos tokens fijan los valores estructurales para que la migración
incremental de esos `.btn*` converja a un único set, en vez de que cada
feature seguir inventando los suyos.

- **Escala de estructura de botón** (tokens `--btn-*`): mismo criterio de
  no-duplicación por feature que `--fs-*`/`--fw-*`/`--bp-*` — vive una sola
  vez en el `:root` de `src/app/globals.css`, porque no tiene variante de
  tema oscuro/alto contraste.

  | Token | Valor | Uso |
  |---|---|---|
  | `--btn-radius` | 8px | radio del botón. Independiente de `--radius` (el genérico de cards/inputs/chips por feature) para que no arrastren cambios entre sí. |
  | `--btn-border-width` | 1px | grosor de borde (`.btn-outline`/`.btn-secondary` lo usan con color; `.btn-primary`/`.btn-danger` con `border-color:transparent`). |
  | `--btn-gap` | 8px | separación ícono↔texto, tamaño base. |
  | `--btn-gap-sm` | 6px | ídem, tamaño `sm`. |
  | `--btn-padding` | 8px 16px | padding del botón, tamaño base. |
  | `--btn-padding-sm` | 8px 12px | ídem, tamaño `sm`. |
  | `--btn-icon-size` | 18px | tamaño del ícono dentro del botón, tamaño base. |
  | `--btn-icon-size-sm` | 15px | ídem, tamaño `sm`. |
  | `--btn-disabled-opacity` | .45 | opacity de `.btn[disabled]`. |
  | `--btn-focus-outline` | 2px | grosor del outline en `:focus-visible`. |
  | `--btn-focus-offset` | 2px | offset del outline en `:focus-visible`. |
  | `--btn-transition` | `background .15s, border-color .15s, color .15s, opacity .15s` | transición estándar de todos los estados del botón. |

- **Los colores de rol no están acá**: `--primary`/`--primary-dark`/
  `--primary-50`/`--red`/`--amber-bg`/`--amber-fg`/`--surface`/`--border`/
  `--ink-700` siguen siendo tokens de color por feature (ver "Component
  organization") — `--btn-*` cubre solo estructura (tamaño, espaciado,
  radio, estados), no color.
- **Migración de CSS existente a estos tokens: hecha.** Los `.btn*` de
  `GestionCamas.css`, `GestionCamasConfiguracion.css`,
  `GestionEnfermeria/shared.css`, `HistoriaClinica/shared.css`,
  `SolicitudConsumo/shared.css`, `Vacunacion.css`, `Admisiones.css`,
  `FichaPaciente.css`, `ListaPacientes.css` y `ProgramarCita.css` ya
  consumen `var(--btn-*)` en vez de sus valores hardcodeados.
- **Divergencias reales encontradas al migrar (no forzadas a un solo
  valor — eso cambiaría la apariencia actual, es decisión para cuando se
  construya el componente)**: `outline-offset` en `:focus-visible` es
  `1px` en `Vacunacion`/`Admisiones`/`FichaPaciente`/`ListaPacientes`/
  `ProgramarCita` pero `2px` (= `--btn-focus-offset`) en
  `HistoriaClinica`/`GestionEnfermeria`/`SolicitudConsumo`/`GestionCamas`;
  el ícono de `SolicitudConsumo/shared.css` es `17px` en vez de `18px`;
  `.fp-actions .btn`/`.sel-actions .btn` (`GestionEnfermeria`) y
  `.fp-actions .btn` (`ListaPacientes/FiltersRow`) usan
  `padding:7px 14px`, ni el tamaño base ni `sm`; `.btn-programar`
  (`OrdenesMedicasPanel`) usa `padding:6px var(--space-3)`. Código nuevo
  no debe copiar estos valores sueltos — son deuda pendiente, no el
  estándar.
- **Componente**: `@/Components/Button/Button` — úsalo para botones nuevos
  en vez de escribir `<button className="btn btn-primary">` a mano.

  ```jsx
  <Button
    variant="primary"    // primary (default) | secondary | outline | tinted | warning-outline | danger | danger-outline
    size="base"           // base (default) | sm
    type="button"         // button (default) | submit | reset
    icon={LuPlus}          // opcional, componente de ícono (react-icons/lu o lucide-react)
    disabled={false}
    onClick={...}
    className="cb-limpiar-filtros-btn" // opcional, one-off extra sobre las clases del componente
  >
    Texto del botón
  </Button>
  ```

  - **Por qué CSS Modules y no una clase global `.btn` como el resto del
    proyecto** (excepción deliberada a "Component organization" de
    arriba): 9 features ya definen su propio `.btn`/`.btn-primary` global
    — si `Button.jsx` también definiera esas clases global, colisionaría
    con la del feature donde se monta según el orden de carga de cada
    hoja (mismo bug ya documentado de `.content`). `Button.module.css`
    evita esto por completo: sus clases quedan con hash único.
  - **Resuelve las divergencias listadas arriba** con un valor canónico
    fijo: `outline-offset` siempre `--btn-focus-offset` (2px), ícono
    siempre `--btn-icon-size`, `.secondary:hover` siempre
    `var(--bg)`/`var(--ink-400)` (nunca hex hardcodeado). `.warning-outline`/
    `.danger`/`.danger-outline` sí llevan 2-3 valores hex fijos en
    `Button.module.css` (comentados ahí) porque hoy ninguna feature define
    un tinte de borde ámbar ni un `--red-dark` — son placeholders hasta que
    ese token exista, no una excepción a "nunca hardcodear" sino la falta
    de un token que crear en un esfuerzo aparte.
  - **Migración incremental de `className="btn btn-primary"` a `<Button>`**
    (no es requisito para código nuevo, que ya debe usar `<Button>` directo):
    - **Hecha**: `Admisiones`, `FichaPaciente`, `Vacunacion` (incluye
      `RegistrarVacunacionModal`), `ListaPacientes`, `ProgramarCita`. En
      cada una, una vez migrados todos los call sites de la feature, se
      borró el bloque `.btn`/`.btn-primary`/etc. muerto de su CSS — si una
      de estas features vuelve a tener un `.btn` hardcodeado, es una
      regresión, no una reintroducción válida.
    - **Pendiente**: `GestionCamas` (~90 botones en ~55 archivos — mucho
      más grande que las anteriores porque `GestionCamas.css` es el
      `shared.css` de facto de 9 sub-rutas: dashboard, Reservas, Limpieza,
      Mantenimiento, Auditoría, Configuración, Integridad, Indicadores,
      Resumen — su bloque `.btn` base solo se puede borrar cuando las 9
      queden en cero `className="btn`), y las 3 `shared.css` grandes:
      `GestionEnfermeria/shared.css`, `HistoriaClinica/shared.css`,
      `SolicitudConsumo/shared.css`. Plan acordado: delegar `GestionCamas`
      a un subagente en background (mismo patrón ya usado para las
      features chicas) dado su tamaño; las 3 `shared.css` quedan por
      decidir cuando se retome.
    - **Gotcha recurrente a repetir en cada migración pendiente**: un
      selector contextual `.wrapper .btn{...}` (flex/width/padding) dejaba
      de aplicar apenas el botón pasaba a `<Button>`, porque ya no lleva la
      clase global `.btn` — hay que grepear `.btn` en el CSS de cada
      archivo tocado *antes* de migrar y arreglar el selector (por
      elemento si `.wrapper` no tiene otro `<button>` adentro, por clase
      explícita si sí — ver ejemplos en `AdmisionesTable.css`,
      `VacToolbar.css`, `PatientsTable.css`, `DetalleCitaModal.css`).

# Badges

Antes de este componente, el proyecto tenía el mismo tipo de deriva ya
documentada para Botones/Modales: 5 definiciones distintas de una clase
`.badge` genérica (Facturación, asignación de citas, NuevaCita,
PatientBanner, SolicitudConsumo) con padding/font-size propios y nombres de
tono distintos para el mismo concepto (`danger/warn/success/neutral` vs
`status-active/inactive/suspendido` vs `amber/green/neutral` vs
`eps/neutral`), más ~30 componentes `*Badge`/`-badge` de un solo uso
(`EstadoCamaBadge`, `TriageBadge`, `EstadoCirugiaBadge`...) que sí ya
convergían en los mismos colores mediante tokens (auditoría completa: los
hex sueltos que duplicaban un token existente ya se homologaron a
`var(--red-bg)`/`var(--green-bg)`/`var(--gray-bg)`/`var(--amber)` antes de
construir el componente).

- **Componente**: `@/Components/Badge/Badge` — úsalo para badges nuevos en
  vez de escribir `<span className="badge tono">` a mano.

  ```jsx
  <Badge
    tone="neutral"   // neutral (default) | danger | warn | success | info
    dot              // opcional — punto de color antes del texto, reemplaza .estado-badge
    className="..."  // opcional, one-off extra sobre las clases del componente
  >
    Texto
  </Badge>
  ```

- **Estructura fija**: `padding:4px 10px`, `font-size:var(--fs-xs)`,
  `font-weight:var(--fw-semibold)`, `border-radius:20px` — el valor que ya
  dominaba en más features (asignación de citas, NuevaCita, PatientBanner,
  GestionEnfermeria/`.estado-badge`, ProgramarCita/`.pc-estado-badge`), no
  el de Facturación (`2px 8px`, la definición más chica).
- **`success` usa `#0d7a3d` para el texto, no `var(--green)`**: es la
  convención ya establecida en 30+ archivos del proyecto para texto/ícono
  sobre `--green-bg` (contraste sobre un fondo claro) — Facturación hoy usa
  `var(--green)` en su `.badge.success` y se oscurecerá un poco el día que
  migre a este componente.
- **El punto (`dot`) no es `currentColor`**: replica la convención ya
  existente en `.estado-badge`, donde el punto usa un color más saturado
  que el texto en `warn` (`var(--amber)`, no el `--amber-fg` mate del
  texto) y en `neutral` (`var(--ink-400)`, no el `--gray-fg` del texto).
  `danger`/`success` sí coinciden texto=punto porque ya eran iguales en el
  código migrado.
- **CSS Modules y no clases globales** (mismo motivo que `Button`, ver
  "Botones" arriba): ya hay 5 `.badge` globales definidos por distintas
  features — una clase global de este componente colisionaría con ellas.
- **Dependencia de tokens a vigilar** (mismo contrato que `ModalHeader`):
  el componente asume `--status-info-bg`/`--status-info-fg` (tone="info")
  y `--amber` (color del punto en `dot` + tone="warn") ya declarados en el
  `:root` de la feature donde se monta. Hoy `--status-info-bg`/`fg` solo
  existe en 6 de las 15 features y `--amber` en 4 de 15 — si `tone="info"`
  o `dot` no se ve en una feature nueva, el fix es agregar el token
  faltante ahí (mismo bug que ya pasó una vez con `ModalHeader`/`--gray-bg`
  en SolicitudConsumo), no tocar `Badge.module.css`.
- **Migración de `className="badge tono"`/`.estado-badge` a `<Badge>`:
  - **Hecha**: `Facturacion` (`FacturaRow`, `FacturasGridClasica`,
    `FacturaDetalleModalClasico`) — primera migrada, piloto del
    componente. Gotcha encontrado (mismo tipo que ya documentado para
    `Button`): el selector contextual
    `.fvcd-field .badge{align-self:flex-start;}` dejaba de aplicar al
    perder `.badge` como clase global — se resolvió pasando
    `className="fvcd-badge"` explícito al `<Badge>`.
    `PatientBanner` (único consumo: `statusBadge` en
    `asignacion-citas/page.jsx`) — de paso se simplificó `ESTADO_TONE` para
    emitir directamente los nombres de tono de `<Badge>`
    (`success`/`neutral`/`warn`) en vez de traducirlos con un
    `status-${tone}` intermedio. `SolicitudConsumo`
    (`ReposicionesCard`, `DetalleModal`) — `rep.estado.cls` no es solo
    estilo: `DetalleModal.jsx` también lo usa como flag de negocio
    (`rep.estado.cls === 'amber'` decidía si mostrar "Cancelar Pedido");
    se renombró el valor a `'warn'` en el mock (`solicitud-consumo.jsx`) y
    se actualizó ese check junto con el render. En los 3, se borró el
    bloque `.badge`/tonos muerto de su CSS tras migrar todos sus call
    sites. `Admisiones` (`PreIngresoModal`), `FichaPaciente` (`FichaHeader`),
    `ListaPacientes` (`PatientsTable`, tabla + tarjetas mobile) y
    `GestionEnfermeria` (`AtencionEnfermeria`, único consumo de
    `.badge.status-active` — no tenía regla base en light mode, solo un
    override de dark mode ya muerto que se borró de `shared.css` al migrar).
    Los primeros tres consumían `.estado-badge` de `NuevaCitaFlow.css`
    (activo/inactivo/suspendido → success/neutral/warn); a
    `Admisiones.css` le faltaba el token `--amber` (solo tenía
    `--amber-bg`/`--amber-fg`) para el punto de `tone="warn"` — mismo bug ya
    documentado para `ModalHeader`/`--gray-bg`, se agregó ahí. `NuevaCitaFlow.css`
    no se tocó: `FichaPaciente`/`ListaPacientes` siguen montando
    `<NuevaCitaFlow/>` para sus flujos de "Agendar/Agregar paciente", que
    siguen usando `.estado-badge` desde el módulo imperativo (ver bloqueada
    abajo).
    El contador estático `#servicios-count` de `asignacion-citas/page.jsx`
    (fuera de `renderAgenda()`, solo su texto lo actualiza el módulo
    imperativo vía `id`) también se migró a `<Badge tone="neutral" id=.../>` —
    no así las filas de agenda en sí, ver bloqueada abajo.
  - **Bloqueada (no es un `<Badge>` de React)**: `asignación de citas` y
    `NuevaCita` arman su `.badge`/`.estado-badge` dentro de
    `renderAgenda()`/equivalente en módulos imperativos
    (`hooks/AsignacionCitas/legacy-app.js`, `hooks/NuevaCita/
    legacy-nueva-cita.js`, ver "Hooks / logic organization"), que
    construyen la **fila completa de la tabla como string** (`onclick`
    inline llamando funciones colgadas de `window`, ej.
    `seleccionarCita`/`toggleRowMenu`) e insertan con
    `tbody.innerHTML = ...` — no hay árbol de React en ningún punto de esa
    fila donde insertar `<Badge>` sin convertir antes la tabla entera a
    React (selección, menú contextual y todo). Sus valores de color ya se
    homologaron a los tokens correctos en la auditoría previa; migrar de
    verdad a `<Badge>` es un refactor de arquitectura de esa pantalla
    (innerHTML imperativo → React), decisión aparte y más grande, no
    parte de esta migración de badges — evaluado y pospuesto
    explícitamente (2026-09-03).
  - Los ~30 componentes `*Badge` de un solo uso (con sus propios estados
    de dominio: camas, cirugías, triage...) tampoco son parte de esta
    migración — son otro sistema, con más de 4-5 tonos cada uno, y no
    deben forzarse a la API de `<Badge>` genérico.

# Responsive / Breakpoints

El proyecto es desktop-first y hoy tiene un piso duro de ~1024–1440px (cada
feature define `.app{min-width:...}`). Se está extendiendo el soporte hacia
tablet (min. 768px de ancho) de forma incremental — este es el contrato de
breakpoints único que hay que usar en ese trabajo, para no repetir el caos
actual de valores sueltos (`600/640/720/900/1100/1280/1600px` dispersos sin
coordinar entre componentes).

| Token | Valor | Significado |
|---|---|---|
| `--bp-tablet` | 768px | Piso mínimo soportado. Por debajo de esto (teléfono) la app no está en scope todavía. |
| `--bp-desktop` | 1024px | Techo del rango tablet. Debajo de este ancho aplican las adaptaciones tablet (sidebar colapsado, tablas/grillas reflowadas); en o por encima, la experiencia desktop actual queda intacta. |
| `--bp-wide` | 1440px | Piso de pantallas que necesitan espacio extra (grillas densas tipo `asignacion-citas`), ya usado ahí de forma ad-hoc — formalizado para no inventar un valor nuevo la próxima vez que haga falta. |

Los tres están declarados en el `:root` de `src/app/globals.css` (no se
duplican por feature — mismo criterio que `--fs-*`/`--fw-*`: no tienen
variante de tema oscuro/alto contraste). Sirven para que JS los lea en
runtime vía `getComputedStyle`, pero **no son usables dentro de la condición
de un `@media`** — CSS no permite custom properties ahí y el proyecto no
corre ningún plugin de "custom media". Por eso, dentro de un `@media` hay que
repetir el valor numérico literal (`@media (max-width:1024px)`), pero siempre
uno de estos tres — nunca un breakpoint intermedio nuevo. Si una pantalla
necesita un ajuste que no encaja en ninguno de los tres, es señal de que el
componente necesita un patrón de layout distinto (ver plan de fases), no un
cuarto breakpoint.

Los `@media` ya existentes en componentes individuales con valores fuera de
esta tabla (720/900/1100/1280px, etc.) quedan pendientes de migrar a este
contrato en las fases siguientes del trabajo de responsive — no son el
estándar a seguir para código nuevo.

# Icons

Work the whole project with Lucide icons — never hand-write inline `<svg>`
markup for an icon.

- The Lucide set is used via the `react-icons` package (already installed),
  importing from its `lu` subpath: `import { LuSearch } from 'react-icons/lu';`.
- Exception: real brand/logo marks (e.g. the "clintos" wordmark symbol in
  `Sidebar.jsx`) are not icons and stay as raw SVG.
- Pass `className` (e.g. `"icon"`, `"icon chev"`) the same way plain `<svg>`
  elements did — sizing is controlled by the existing CSS `.icon` rules, not
  by the `size` prop. Only pass `strokeWidth` when a specific instance needs
  to override the default (2).
- When adding a new icon, pick the closest matching `Lu*` component instead of
  pasting a raw SVG path — check `node_modules/react-icons/lu/index.mjs` (or
  lucide.dev) for the exact name.
- Exception: `react-icons` lags behind Lucide's own release (as of `lu`
  v5.7.0, it's missing icons that already exist on lucide.dev — confirmed for
  `mars`/`venus`, used as the gender icons in `BedCard.jsx`). When a needed
  icon exists on lucide.dev but not in `node_modules/react-icons/lu/index.mjs`,
  fall back to the official `lucide-react` package instead of hand-drawing
  SVG or picking an unrelated `Lu*` icon — import by its plain PascalCase name
  (`import { Mars } from 'lucide-react'`, no `Lu` prefix). Prefer `react-icons/lu`
  whenever the icon is available there; only reach for `lucide-react` for the
  specific icons missing from it.
