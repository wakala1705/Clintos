# Clintos design-sync — repo notes

## Scope (2026-09-06 first sync)
This repo is the full Next.js clinical app (`src/Components/` has ~150
feature-specific components across GestionCamas/HistoriaClinica/etc.), not a
standalone component-library package — there's no `dist/` build, no
Storybook, no `.d.ts`. Scope was deliberately narrowed to the 9 truly
app-wide, framework-agnostic building blocks (see AGENTS.md "Component
organization" → "App-wide components"): `Button`, `Badge`, `ModalHeader`,
`FormSelect`, `SegmentedFilterBar`, `FilterDropdown`, `AreaSelector`,
`KpiCard`, `PatientAvatar`.

**Deliberately excluded**: `Sidebar`, `Topbar`, `UserMenu`, `HamburgerMenu` —
all depend on `next/link`/`next/navigation` (`usePathname`, `useRouter`),
which throw/break when rendered outside a real Next.js App Router. Syncing
them needs either an esbuild alias that stubs `next/link`/`next/navigation`
with no-op/inert versions, or a `cfg.provider`-style wrapper — not attempted
this run. Pick this up in a follow-up sync if these become worth including.

## Custom entry (not the auto-synth path)
No `dist/` exists, so the converter's own no-config fallback would
synthesize an entry via `export * from <every src file>` across the WHOLE
`src/` tree — way too broad, and critically **`export *` never re-exports a
default export**, and all 9 scoped components use `export default function
Name(...)`. Worked around it with a hand-written entry at
`.design-sync/.cache/entry.mjs` (gitignored, regenerate by hand — one
`export { default as Name } from '<path>'` line per `componentSrcMap`
entry) passed via `--entry`. **If the component scope changes, this file
must be regenerated to match** — it is not derived automatically from
`componentSrcMap`.

## Re-sync risks
- **`.design-sync/.cache/entry.mjs` can silently go stale.** It's hand-maintained
  and gitignored — if `componentSrcMap` in `config.json` gains/removes a
  component and this file isn't updated to match, the build will either
  miss the new component or (if a stale export path was renamed/deleted)
  fail with an import-resolution error. Always check this file when editing
  `componentSrcMap`.
- **`.design-sync/tokens.css` is a hand-aggregated snapshot, not a live
  reference.** Copied verbatim from `src/app/globals.css` (`--fs-*`/`--fw-*`/
  `--bp-*`/`--btn-*`, single global source, low drift risk) and
  `src/Components/GestionCamas/GestionCamas.css` `:root` (color/radius/input
  tokens — picked as the donor because it's the only feature `:root` that
  already had `--purple-bg`/`--purple-fg` matching `KpiCard`'s "violet"
  variant; every top-level feature keeps its own duplicate copy per
  AGENTS.md, so this is one of many valid snapshots, not *the* canonical
  source). `--status-info-bg`/`--status-info-fg` aren't in `GestionCamas.css`
  at all — added by hand using the same `var(--primary-50)`/
  `var(--primary-dark)` pattern other features (e.g. `asignacion-citas.css`)
  already use for it. **If any of these tokens' values change upstream in
  the app, this file drifts silently** — no automated check ties them
  together. Re-diff against the source files on future syncs.
- **`cfg.dtsPropsFor` values MUST be multi-line, one prop per line, 2-space
  indented, e.g. `"  variant?: 'a' | 'b';\n  label: string;"` — NOT a
  single-line string with `; `-separated props.** Found the hard way: a
  single-line dtsPropsFor value parses fine as TypeScript (the `.d.ts`
  itself looked correct) but `smartDefaultProps`' regex
  (`^ {2}(\w+)(\??):\s*(.+);$` in multiline mode) only matches when each
  prop starts its own 2-space-indented line. A single-line value silently
  matched ZERO props, so every floor card rendered with `h(Component, {})`
  — no crash-preventing stub props at all. Components that don't crash on
  missing data (`Button`, `Badge`, `KpiCard`, `ModalHeader`, `PatientAvatar`)
  then mounted a real-but-empty/invisible DOM node that LOOKED broken
  (blank white space, no visible fallback text) instead of either rendering
  something meaningful or cleanly falling back to the floor card's
  typographic block. Components that DO crash on missing data
  (`AreaSelector`, `FormSelect`, `SegmentedFilterBar`, `FilterDropdown` —
  all call `.map`/`.find` on an undefined `options`) crashed synchronously
  into the floor card regardless, so they looked fine even with the bug.
  Reformatting to one-prop-per-line fixed all 9 in one rebuild.
- **Playwright/Chromium could not be installed in this environment** — every
  `npx playwright install chromium` attempt timed out downloading from
  `cdn.playwright.dev` (confirmed not a sandbox issue — same result with the
  sandbox disabled). `package-validate.mjs` ran with `--no-render-check`;
  the human reviewer (project owner) verified all 9 floor cards manually via
  `http-serve.mjs` + `.review.html` instead of the automated screenshot
  gate. **Retry the Chromium install on the next sync** — if it succeeds,
  run the full render check (drop `--no-render-check`) rather than relying
  on manual review again.
- **All 9 components are on the floor card** (no authored
  `.design-sync/previews/<Name>.tsx` yet) — every one is fully importable
  and its API is accurate (`<Name>.d.ts` was hand-verified against the real
  source props, not auto-extracted, since these are `.jsx` files with no
  TypeScript types), but the claude.ai/design pane will show the plain
  "preview not yet authored" card rather than a realistic composed example.
  Authoring real previews (2-6 stories each, per component) is the natural
  next increment — offer it on the next sync.
- **`@types/react` isn't installed in the app's own `node_modules`** — every
  build prints `[DTS_REACT]`. Harmless here (no real `.d.ts` files exist to
  parse — every component's props come from the hand-written
  `cfg.dtsPropsFor` override, not TS inference), but if a future scoped
  component ships as `.tsx` with real types, install `@types/react` first
  or its props will emit empty.
- All 9 components currently group under `general` (no natural per-feature
  subfolder since they live directly under `src/Components/<Name>/`, one
  level, no grouping directory). Consider `cfg.titleMap` if a more specific
  grouping is wanted later.
