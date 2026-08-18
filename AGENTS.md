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
