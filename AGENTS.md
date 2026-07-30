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
