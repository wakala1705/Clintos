## Clintos — building with these components

This is a **subset** of Clintos' real component library: 9 framework-agnostic,
app-wide building blocks (`Button`, `Badge`, `ModalHeader`, `FormSelect`,
`SegmentedFilterBar`, `FilterDropdown`, `AreaSelector`, `KpiCard`,
`PatientAvatar`) extracted from a much larger Next.js clinical app. Feature
screens (patient records, bed management, scheduling…) are NOT in this sync —
only these shared primitives. Every one of them ships fully importable from
`window.Clintos.*`, but none has an authored example story yet, so their
cards show the floor placeholder — read `<Name>.d.ts` for the exact prop
shape and `<Name>.prompt.md` for a one-line summary before using one.

### No provider/wrapper needed
None of these 9 components read from React context, a router, or a theme
provider — mount any of them directly, no wrapping component required.
(The app's own `Sidebar`/`Topbar`/nav components DO depend on Next.js
routing and are intentionally excluded from this sync.)

### Styling idiom: CSS custom properties, not utility classes
Every component reads color/spacing/type from CSS variables defined once in
`styles.css` — never hardcode a hex color or a px value when a token below
covers it:

| Token family | Examples | Use |
|---|---|---|
| Brand/status color | `--primary`, `--primary-dark`, `--primary-50`, `--red`, `--red-bg`, `--green`, `--green-bg`, `--amber`, `--amber-bg`, `--amber-fg`, `--blue-bg`, `--blue-fg`, `--purple-bg`, `--purple-fg` | backgrounds, text, icon fills |
| Neutrals | `--ink-900` (primary text), `--ink-700`, `--ink-500`, `--ink-400`, `--border`, `--surface`, `--bg`, `--gray-bg`, `--gray-fg` | body text, borders, panel/page backgrounds |
| Type scale | `--fs-xs` 11px … `--fs-4xl` 28px (8 steps) | always the nearest token, never a loose px value |
| Weight scale | `--fw-regular` 400, `--fw-medium` 500, `--fw-semibold` 600 (headings/labels/badges/buttons), `--fw-bold` 700 (KPI figures only, never headings) | |
| Shape | `--radius` 8px, `--radius-lg` 12px | cards, inputs, popovers |
| Input sizing | `--input-sm` 32px, `--input-md` 36px, `--input-lg` 44px | form control heights |
| Button structure | `--btn-radius`, `--btn-padding` / `--btn-padding-sm`, `--btn-gap` / `--btn-gap-sm`, `--btn-icon-size` / `--btn-icon-size-sm` | only `Button`'s own CSS should need these |

`Badge`'s `tone="info"` reads `--status-info-bg`/`--status-info-fg` (aliased
to `--primary-50`/`--primary-dark` here).

### Where the real styles live
Read `styles.css` (it `@import`s `_ds_bundle.css`, which holds every
component's compiled CSS plus the full `:root` token block) before writing
new styling — it's the single source of truth for every value in the table
above.

### Composing them together
A typical realistic composition — a filterable list toolbar with a status
badge and a primary action:

```jsx
import { Button, Badge, SegmentedFilterBar } from 'clintos-components';

function Toolbar({ status, onStatusChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--btn-gap)' }}>
      <SegmentedFilterBar
        options={[
          { value: 'todos', label: 'Todos', count: 14 },
          { value: 'pendientes', label: 'Con pendientes', count: 6 },
        ]}
        value={status}
        onChange={onStatusChange}
      />
      <Badge tone="warn" dot>6 pendientes</Badge>
      <Button variant="primary" size="base">Nuevo</Button>
    </div>
  );
}
```

`ModalHeader` always goes at the top of a modal dialog (never rebuild a
title+close row by hand): `<ModalHeader tone="warning" title="…" onClose={…} />`.
`FormSelect`/`AreaSelector` replace native `<select>` inside a form field —
`onChange` receives the raw value, not an event.
