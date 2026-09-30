# Canastas de cirugía — evolución a maestro-detalle: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la tabla + modal de `/programacion-sala-cirugias/canastas` por un maestro-detalle con recepción por cantidades, 6 estados de canasta, bloqueo de inicio informativo con autorización por urgencia y pestaña de consumo y devolución.

**Architecture:** El modelo se extiende en `mockCirugiaData.js` (campos por ítem + metadatos de canasta) y todo el estado se **deriva** (`resumenCanasta`, `gateCirugia`, `bloqueoInicio`). La lógica pura vive en `src/hooks/ProgramacionSalaCirugias/` y se prueba con `node:test` (sin dependencias nuevas). La UI son 8 componentes nuevos en `canastas/`; `CanastasCirugia.jsx` orquesta y guarda los borradores por cirugía.

**Tech Stack:** Next.js 16 (React 19 + React Compiler), react-icons/lu, CSS plano por componente + `shared.css` de la feature, `node:test` (Node 26) para lógica pura, Playwright (ya disponible vía `npx`) para verificación visual.

**Spec:** `docs/superpowers/specs/2026-09-30-canastas-cirugia-evolucion-design.md`

## Global Constraints

- **Antes de escribir código Next.js** revisar `node_modules/next/dist/docs/` si algo de rutas/`'use client'` no es obvio (AGENTS.md: "This is NOT the Next.js you know"). Esta tarea no cambia rutas ni layouts, solo componentes cliente.
- Un componente = una carpeta con `Nombre.jsx` + `Nombre.css` bajo `src/Components/ProgramacionSalaCirugias/canastas/`; el componente importa su CSS. Reglas usadas por 2+ componentes van **una sola vez** en `src/Components/ProgramacionSalaCirugias/shared/shared.css`.
- Lógica no visual solo en `src/hooks/ProgramacionSalaCirugias/` (nunca junto a la ruta). Los módulos nuevos usan imports **relativos con extensión `.js`** para que `node --test` los cargue.
- Colores solo con tokens de `:root` (`--green-*`, `--amber-*`, `--red-*`, `--blue-*`, `--violet-*`, `--gray-*`, `--primary*`, `--ink-*`, `--border`, `--surface`, `--bg`). Único hex permitido: `#0d7a3d` para texto/ícono `success` sobre `--green-bg` (convención del proyecto), con override `html[data-theme="dark"]` a `var(--green)`.
- Tipografía: solo `font-size:var(--fs-*)` y `font-weight:var(--fw-*)`; títulos en `--fw-semibold`, cifras en `--fw-bold`.
- Íconos: `react-icons/lu` (`LuX`), con `className="icon"`; nunca `<svg>` a mano.
- Reutilizar `@/Components/Button/Button`, `@/Components/Badge/Badge`, `@/Components/FormSelect/FormSelect`, `EstadoCirugiaBadge`. Ningún `<select>` nativo.
- `<th>` de tabla: `font-size:var(--th-fs)`, `font-weight:var(--th-fw)`, `color:var(--th-color)`, `background:var(--table-header-bg)`, sticky con `z-index:var(--z-sticky)`; columnas numéricas con la misma clase de alineación en `<th>` y `<td>`.
- Breakpoints: solo 768 / 1024 / 1440; en `@media` usar `max-width:1024px` (tablet). Ningún breakpoint nuevo.
- Fecha con hora visible: formato `DD.MES.AAAA - HH:mm` (ej. `29.SEP.2026 - 08:10`, mes en mayúsculas de 3 letras). Una hora sola (sin fecha) se muestra `HH:mm`.
- Textos de UI y comentarios en español, en el mismo tono que el código vecino.
- React Compiler: handlers deben usar `?.`/`??` sobre estado nullable (`cirugias` es `null` mientras carga); nunca `new Date()` directo en el render (usar el estado `ahora`).
- Los `Error` que lanzan las acciones del mock llevan mensaje apto para el usuario.

## Notas de implementación (desviaciones menores del spec)

1. **Snapshot para "Deshacer"**: lo captura quien llama (`[cirugia]` antes de la acción), igual que hoy en `CanastasCirugia.jsx`, en vez de que cada acción lo devuelva. `deshacerResolucion(snapshot)` restaura el registro completo (incluye `devoluciones`).
2. **Semilla con fecha dinámica**: hoy es 2026-09-30 y las semillas de "hoy" están fijas en `2026-09-29`, así que la pantalla abriría vacía. Las semillas de esta pantalla pasan a `HOY_ISO = fechaISO(new Date())`.
3. **`bloqueoInicio`** es `true` para gate `bloqueada` **y** `urgencia-puede-autorizar` (técnicamente bloqueadas hasta autorizar). El KPI "Inicio bloqueado" y la alerta cuentan solo gate `bloqueada`, como en el artboard.
4. **"Recibir con novedades"** usa `Button variant="warning-outline"` (no existe variante ámbar sólida en `Button`).
5. **Rama de trabajo**: las Tasks 1–5 dejan la ruta `/canastas` temporalmente inconsistente (`resumenCanasta` cambia sus valores antes de que la UI nueva exista). Trabajar en una rama `feat/canastas-maestro-detalle` y **no mergear antes de terminar la Task 6**.

## Estructura de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `package.json` | Modificar | script `test` (`node --test`) |
| `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js` | Modificar | modelo derivado, semillas, acciones |
| `src/hooks/ProgramacionSalaCirugias/canastaPresentacion.js` | Crear | mapas de tono/label, banners, filtros, KPIs, textos de trazabilidad |
| `src/hooks/ProgramacionSalaCirugias/__tests__/modelo.test.mjs` | Crear | lógica pura del modelo |
| `src/hooks/ProgramacionSalaCirugias/__tests__/semilla.test.mjs` | Crear | los 5 casos de la semilla |
| `src/hooks/ProgramacionSalaCirugias/__tests__/acciones.test.mjs` | Crear | acciones que mutan el mock |
| `src/hooks/ProgramacionSalaCirugias/__tests__/presentacion.test.mjs` | Crear | filtros, KPIs, banners, textos |
| `.../canastas/RecepcionTab/` | Crear | pestaña Recepción (editar / preparación / lectura / vacía) |
| `.../canastas/ConsumoTab/` | Crear | pestaña Consumo y devolución |
| `.../canastas/CanastaDetalle/` | Crear | cabecera, banner, pestañas |
| `.../canastas/CirugiaCard/` | Crear | tarjeta de la lista |
| `.../canastas/CanastasLista/` | Crear | panel izquierdo (buscador, filtro, tarjetas) |
| `.../canastas/CanastasKpis/` | Crear | 4 KPIs |
| `.../canastas/CanastaAlerta/` | Crear | alerta de bloqueo / estado verde |
| `.../canastas/CanastasFechaNav/` | Crear | navegador de fecha (movido al header) |
| `.../CanastasCirugia/CanastasCirugia.jsx` + `.css` | Reescribir | orquestador |
| `.../shared/shared.css` | Modificar | bloque compartido de Canastas |
| `.../canastas/CanastasTable/`, `CanastasFiltrosBar/`, `ConfirmarRecepcionModal/` | Eliminar | reemplazados |

Ruta base de componentes: `src/Components/ProgramacionSalaCirugias/`.

---

### Task 1: Modelo derivado de canasta + runner de tests

**Files:**
- Modify: `package.json` (script `test`)
- Modify: `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js` (bloque `resumenCanasta`, `cantidadDevolvible`, `estadoInsumo`, nuevos helpers)
- Test: `src/hooks/ProgramacionSalaCirugias/__tests__/modelo.test.mjs`

**Interfaces:**
- Consumes: `fechaISO`, `fechaLabel`, `MES_CORTO` (ya existen en el mock).
- Produces (todo `export` del mock):
  - `CANASTA_ESTADO_LABEL: Record<estado, string>`
  - `CANASTA_ESTADOS_RECIBIDOS: string[]` = `['recibida','con-novedades','consumo-registrado']`
  - `cantidadDespachada(item): number`, `cantidadRecibida(item): number`
  - `novedadItem(item, recibido): string`
  - `resumenCanasta(cirugia): { total, porSolicitar, porRecibir, recibidos, preparados, estado }` con `estado` ∈ `sin-solicitar | en-preparacion | despachada | recibida | con-novedades | consumo-registrado`
  - `gateCirugia(cirugia): 'lista'|'bloqueada'|'urgencia-puede-autorizar'|'urgencia-autorizada'|'realizada'|'no-aplica'`
  - `bloqueoInicio(cirugia): boolean`
  - `fechaHoraTrazaLabel(isoDateTime): string` → `29.SEP.2026 - 08:10`
  - `iniciaEnLabel(cirugia, ahora?): string`

- [ ] **Step 1: Crear rama y agregar el script `test`**

```bash
git checkout -b feat/canastas-maestro-detalle
```

En `package.json`, dentro de `"scripts"`, agregar después de `"lint": "eslint"`:

```json
    "lint": "eslint",
    "test": "node --test \"src/hooks/**/*.test.mjs\""
```

- [ ] **Step 2: Escribir los tests que fallan**

Crear `src/hooks/ProgramacionSalaCirugias/__tests__/modelo.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bloqueoInicio, cantidadDespachada, cantidadDevolvible, cantidadRecibida, fechaHoraTrazaLabel,
  gateCirugia, iniciaEnLabel, novedadItem, resumenCanasta,
} from '../mockCirugiaData.js';

const item = (extra = {}) => ({ nombre: 'Gasas', cantidad: 4, ...extra });
const solicitado = (extra = {}) => item({ solicitudFarmacia: 'solicitado', ...extra });
const entregado = (extra = {}) => item({ solicitudFarmacia: 'entregado', ...extra });
// `canasta` recibe los metadatos (recepcion, consumo, autorizacionUrgencia).
const cirugia = (items, { estado = 'programada', ...canasta } = {}) => ({
  id: 'x', estado, fecha: '2026-09-29', horaInicio: '09:30', canasta: { nombre: 'c', items, ...canasta },
});

test('resumenCanasta: sin solicitar', () => {
  const r = resumenCanasta(cirugia([item(), item({ nombre: 'B' })]));
  assert.equal(r.estado, 'sin-solicitar');
  assert.equal(r.total, 2);
});

test('resumenCanasta: en preparación cuenta los preparados', () => {
  const r = resumenCanasta(cirugia([solicitado({ preparado: true }), solicitado({ nombre: 'B' })]));
  assert.equal(r.estado, 'en-preparacion');
  assert.equal(r.preparados, 1);
  assert.equal(r.porRecibir, 2);
});

test('resumenCanasta: despachada solo si TODOS los solicitados tienen despachado', () => {
  const todos = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B', despachado: 3 })]);
  assert.equal(resumenCanasta(todos).estado, 'despachada');
  const falta = cirugia([solicitado({ despachado: 4 }), solicitado({ nombre: 'B' })]);
  assert.equal(resumenCanasta(falta).estado, 'en-preparacion');
});

test('resumenCanasta: recibida, con novedades y consumo registrado', () => {
  assert.equal(resumenCanasta(cirugia([entregado()])).estado, 'recibida');
  assert.equal(
    resumenCanasta(cirugia([entregado()], { recepcion: { usuario: 'u', fecha: '2026-09-29T08:10', conNovedades: true } })).estado,
    'con-novedades',
  );
  assert.equal(
    resumenCanasta(cirugia([entregado()], { consumo: { usuario: 'u', fecha: '2026-09-29T10:00', usados: {} } })).estado,
    'consumo-registrado',
  );
});

test('cantidadDespachada/cantidadRecibida caen a `cantidad` en ítems legados', () => {
  assert.equal(cantidadDespachada(item()), 4);
  assert.equal(cantidadDespachada(item({ despachado: 3 })), 3);
  assert.equal(cantidadRecibida(item()), 4);
  assert.equal(cantidadRecibida(item({ recibido: 2 })), 2);
});

test('cantidadDevolvible parte de lo recibido, no de lo solicitado', () => {
  const c = cirugia([entregado({ recibido: 3 })]);
  assert.equal(cantidadDevolvible(c, c.canasta.items[0]), 3);
});

test('gateCirugia cubre los 6 valores', () => {
  const pend = [solicitado()];
  assert.equal(gateCirugia(cirugia(pend)), 'bloqueada');
  assert.equal(gateCirugia(cirugia(pend, { estado: 'urgencia' })), 'urgencia-puede-autorizar');
  assert.equal(
    gateCirugia(cirugia(pend, { estado: 'urgencia', autorizacionUrgencia: { usuario: 'u', fecha: '2026-09-29T08:00' } })),
    'urgencia-autorizada',
  );
  assert.equal(gateCirugia(cirugia([entregado()])), 'lista');
  assert.equal(gateCirugia(cirugia([entregado()], { estado: 'urgencia' })), 'lista');
  assert.equal(gateCirugia(cirugia(pend, { estado: 'realizada' })), 'realizada');
  assert.equal(gateCirugia(cirugia(pend, { estado: 'cancelada' })), 'no-aplica');
});

test('bloqueoInicio: bloqueada y urgencia sin autorizar', () => {
  assert.equal(bloqueoInicio(cirugia([solicitado()])), true);
  assert.equal(bloqueoInicio(cirugia([solicitado()], { estado: 'urgencia' })), true);
  assert.equal(
    bloqueoInicio(cirugia([solicitado()], { estado: 'urgencia', autorizacionUrgencia: { usuario: 'u', fecha: '2026-09-29T08:00' } })),
    false,
  );
  assert.equal(bloqueoInicio(cirugia([entregado()])), false);
  assert.equal(bloqueoInicio(cirugia([solicitado()], { estado: 'realizada' })), false);
});

test('novedadItem describe faltantes de farmacia y de la entrega', () => {
  assert.equal(novedadItem(item({ despachado: 4 }), 4), '');
  assert.equal(novedadItem(item({ despachado: 3 }), 3), 'Farmacia despachó 3 de 4');
  assert.equal(novedadItem(item({ despachado: 4 }), 3), 'Faltan 1 en la entrega');
  assert.equal(novedadItem(item({ despachado: 3 }), 2), 'Farmacia despachó 3 de 4 · Faltan 1 en la entrega');
});

test('fechaHoraTrazaLabel usa DD.MES.AAAA - HH:mm', () => {
  assert.equal(fechaHoraTrazaLabel('2026-09-29T08:10'), '29.SEP.2026 - 08:10');
  assert.equal(fechaHoraTrazaLabel('2026-08-01T17:05'), '01.AGO.2026 - 17:05');
});

test('iniciaEnLabel', () => {
  const ahora = new Date(2026, 8, 29, 8, 45);
  const en = (horaInicio, extra = {}) => iniciaEnLabel({ estado: 'programada', fecha: '2026-09-29', horaInicio, ...extra }, ahora);
  assert.equal(en('09:30'), 'Inicia en 45 min');
  assert.equal(en('12:00'), 'Inicia en 3 h 15 min');
  assert.equal(en('11:45'), 'Inicia en 3 h');
  assert.equal(en('08:00'), 'Hora de inicio superada');
  assert.equal(en('09:30', { estado: 'realizada' }), 'Finalizada');
  assert.equal(en('09:30', { fecha: '2026-09-30' }), '30/09/2026');
});
```

- [ ] **Step 3: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — `SyntaxError`/`does not provide an export named 'bloqueoInicio'` (los exports nuevos no existen todavía).

- [ ] **Step 4: Implementar en `mockCirugiaData.js`**

4a. Reemplazar el bloque completo desde el comentario `// Resumen agregado de la canasta COMPLETA de una cirugía` hasta el cierre `}` de `export function resumenCanasta(cirugia) { ... }` por:

```js
// ---------- Canastas de cirugía: estado derivado (encargo 2026-09-30) ----------
// Cada ítem puede traer, además de `solicitudFarmacia`: `preparado` (farmacia
// lo alistó), `despachado` (cantidad que farmacia despachó), `recibido`
// (cantidad que quirófano recibió) y `novedad`. La canasta guarda
// `recepcion`, `autorizacionUrgencia` y `consumo`. NADA de esto se guarda como
// "estado": `resumenCanasta`/`gateCirugia` lo derivan, mismo criterio que
// `estadoInsumo` -- así InsumosTab (que solo mueve `solicitudFarmacia`) y esta
// pantalla no quedan desincronizados. Ítems legados sin estos campos caen a
// `cantidad` (cantidadDespachada/cantidadRecibida).
export const CANASTA_ESTADO_LABEL = {
  'sin-solicitar': 'Sin solicitar',
  'en-preparacion': 'En preparación en farmacia',
  despachada: 'Despachada · por recibir',
  recibida: 'Canasta recibida',
  'con-novedades': 'Recibida con novedades',
  'consumo-registrado': 'Consumo registrado',
};

export const CANASTA_ESTADOS_RECIBIDOS = ['recibida', 'con-novedades', 'consumo-registrado'];

export function cantidadDespachada(item) {
  return item.despachado ?? item.cantidad;
}

export function cantidadRecibida(item) {
  return item.recibido ?? item.cantidad;
}

// Texto de novedad de un ítem: lo que farmacia despachó de menos y lo que
// faltó en la entrega. '' si no hay novedad.
export function novedadItem(item, recibido) {
  const despachado = cantidadDespachada(item);
  const partes = [];
  if (despachado < item.cantidad) partes.push(`Farmacia despachó ${despachado} de ${item.cantidad}`);
  if (recibido < despachado) partes.push(`Faltan ${despachado - recibido} en la entrega`);
  return partes.join(' · ');
}

// Resumen agregado de la canasta COMPLETA de una cirugía (a diferencia de
// estadoInsumo, que es por ítem). No usa estadoInsumo/cantidadDevuelta a
// propósito: una devolución posterior no debe volver a marcar la canasta como
// pendiente de recepción.
export function resumenCanasta(cirugia) {
  const { items } = cirugia.canasta;
  const pasos = items.map((i) => i.solicitudFarmacia ?? 'sin-solicitar');
  const total = pasos.length;
  const porSolicitar = pasos.filter((p) => p === 'sin-solicitar').length;
  const porRecibir = pasos.filter((p) => p === 'solicitado').length;
  const recibidos = total - porSolicitar - porRecibir;
  const preparados = items.filter((i) => i.preparado).length;
  let estado;
  if (cirugia.canasta.consumo) {
    estado = 'consumo-registrado';
  } else if (porRecibir > 0) {
    const despachada = items
      .filter((i) => i.solicitudFarmacia === 'solicitado')
      .every((i) => i.despachado !== undefined);
    estado = despachada ? 'despachada' : 'en-preparacion';
  } else if (porSolicitar === total) {
    estado = 'sin-solicitar';
  } else {
    estado = cirugia.canasta.recepcion?.conNovedades ? 'con-novedades' : 'recibida';
  }
  return {
    total, porSolicitar, porRecibir, recibidos, preparados, estado,
  };
}

// Compuerta de inicio de la cirugía según su canasta. 'no-aplica' para
// cirugías que ya no se inician (canceladas, incumplidas).
export function gateCirugia(cirugia) {
  if (cirugia.estado === 'realizada') return 'realizada';
  if (cirugia.estado !== 'programada' && cirugia.estado !== 'urgencia') return 'no-aplica';
  if (CANASTA_ESTADOS_RECIBIDOS.includes(resumenCanasta(cirugia).estado)) return 'lista';
  if (cirugia.estado === 'urgencia') {
    return cirugia.canasta.autorizacionUrgencia ? 'urgencia-autorizada' : 'urgencia-puede-autorizar';
  }
  return 'bloqueada';
}

// true mientras la cirugía NO puede iniciar (bloqueada, o urgencia todavía sin
// autorizar). Solo informativo en "Canastas de cirugía"; la agenda y
// DetalleCirugiaPanel aún no lo consumen (decisión explícita, spec 2026-09-30).
export function bloqueoInicio(cirugia) {
  const gate = gateCirugia(cirugia);
  return gate === 'bloqueada' || gate === 'urgencia-puede-autorizar';
}

// "29.SEP.2026 - 08:10" -- fecha con hora (encargo explícito 2026-09-29).
export function fechaHoraTrazaLabel(isoDateTimeStr) {
  const [fecha, hora] = isoDateTimeStr.split('T');
  const [y, m, d] = fecha.split('-').map(Number);
  return `${pad2(d)}.${MES_CORTO[m - 1].toUpperCase()}.${y} - ${hora}`;
}

// "Inicia en 45 min" / "Inicia en 3 h 15 min" de una cirugía del mismo día.
// `ahora` se recibe como argumento (no `new Date()` acá) para que el render
// sea puro; de otro día devuelve solo la fecha.
export function iniciaEnLabel(cirugia, ahora = new Date()) {
  if (cirugia.estado === 'realizada') return 'Finalizada';
  if (cirugia.fecha !== fechaISO(ahora)) return fechaLabel(cirugia.fecha);
  const [h, m] = cirugia.horaInicio.split(':').map(Number);
  const [y, mo, d] = cirugia.fecha.split('-').map(Number);
  const minutos = Math.round((new Date(y, mo - 1, d, h, m) - ahora) / 60000);
  if (minutos <= 0) return 'Hora de inicio superada';
  if (minutos < 60) return `Inicia en ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `Inicia en ${horas} h` : `Inicia en ${horas} h ${resto} min`;
}
```

4b. En `cantidadDevolvible`, cambiar la línea:

```js
  return item.cantidad - cantidadDevuelta(cirugia, item.nombre, { excepto });
```
por:
```js
  return cantidadRecibida(item) - cantidadDevuelta(cirugia, item.nombre, { excepto });
```

4c. En `estadoInsumo`, cambiar la línea:

```js
  return devuelta >= item.cantidad ? 'devuelto' : 'devuelto-parcial';
```
por:
```js
  return devuelta >= cantidadRecibida(item) ? 'devuelto' : 'devuelto-parcial';
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — 10 tests ok (puede imprimirse un `Warning: MODULE_TYPELESS_PACKAGE_JSON`; es inocuo).

- [ ] **Step 6: Commit**

```bash
git add package.json src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js src/hooks/ProgramacionSalaCirugias/__tests__/modelo.test.mjs
git commit -m "feat(canastas): modelo derivado de canasta (6 estados, compuerta de inicio)"
```

---

### Task 2: Semilla de hoy con los 5 casos + `fetchCanastasDia` incluye realizadas

**Files:**
- Modify: `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js` (bloque antes de `let CIRUGIAS`, entradas `12353`/`12354`/`12355`, nuevas `12356`–`12358`, `fetchCanastasDia`)
- Test: `src/hooks/ProgramacionSalaCirugias/__tests__/semilla.test.mjs`

**Interfaces:**
- Consumes: `resumenCanasta`, `gateCirugia`, `fetchCanastasDia`, `fechaISO`.
- Produces: en sala `qx-1` del día de hoy, en orden por hora: `12353` (07:30, realizada, canasta recibida), `12356` (09:30, despachada), `12355` (13:00, recibida con novedades), `12357` (13:30, urgencia en preparación), `12358` (15:30, en preparación bloqueada). En `qx-2`: `12354` (urgencia, sin solicitar).

- [ ] **Step 1: Escribir el test que falla**

Crear `src/hooks/ProgramacionSalaCirugias/__tests__/semilla.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fechaISO, fetchCanastasDia, gateCirugia, resumenCanasta,
} from '../mockCirugiaData.js';

const HOY = fechaISO(new Date());

test('sala qx-1 de hoy: los 5 casos del diseño, por hora', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.deepEqual(items.map((c) => c.id), ['12353', '12356', '12355', '12357', '12358']);
  assert.deepEqual(
    items.map((c) => resumenCanasta(c).estado),
    ['recibida', 'despachada', 'con-novedades', 'en-preparacion', 'en-preparacion'],
  );
  assert.deepEqual(
    items.map(gateCirugia),
    ['realizada', 'bloqueada', 'lista', 'urgencia-puede-autorizar', 'bloqueada'],
  );
});

test('la cirugía realizada sigue en el listado (su canasta está abierta para consumo)', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  assert.equal(items.find((c) => c.id === '12353').estado, 'realizada');
});

test('sala qx-2: la urgencia sin solicitar', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-2' });
  assert.deepEqual(items.map((c) => [c.id, resumenCanasta(c).estado]), [['12354', 'sin-solicitar']]);
});

test('canasta preparada parcialmente: 3 de 5 preparados en la urgencia', async () => {
  const items = await fetchCanastasDia({ fecha: HOY, salaId: 'qx-1' });
  const r = resumenCanasta(items.find((c) => c.id === '12357'));
  assert.deepEqual([r.preparados, r.total], [3, 5]);
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL en `semilla.test.mjs` (`items.map(...)` da otros ids/estados; el test de `modelo` sigue pasando).

- [ ] **Step 3: Agregar helpers de semilla antes de `let CIRUGIAS = [`**

Justo encima de la línea `let CIRUGIAS = [` insertar:

```js
// Fecha de "hoy" para las semillas de "Canastas de cirugía": dinámica (antes
// eran literales de 2026-09-29 y la pantalla abría vacía al día siguiente).
const HOY_ISO = fechaISO(new Date());

const itemsDe = (catalogo, fn) => CANASTAS_CATALOGO[catalogo].items.map((i, n) => ({ ...i, ...fn(i, n) }));

// Cirugía de sede '02'/sala 'qx-1' de hoy con los datos mínimos que consumen
// las pantallas (mismo shape que las entradas literales de CIRUGIAS).
function cirugiaHoy({
  id, nombre, documento, edad, sexo, procedimiento, cirujano, horaInicio, horaFin, estado = 'programada', canasta, farmacia,
}) {
  return {
    id,
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre, documento, edad, edadMeses: 0, edadDias: 0, sexo, aseguradora: 'Sura EPS', nivel: '1', tipoAfiliado: 'Cotizante', direccion: 'Bogotá', telAviso: '300 000 0000',
    },
    procedimientoPrincipal: procedimiento,
    servicio: 'Cirugía general',
    tipoCirugia: estado === 'urgencia' ? 'Urgencia' : 'Programada',
    cirujano,
    fecha: HOY_ISO,
    horaInicio,
    horaFin,
    estado,
    procedimientos: [{ nombre: procedimiento, tipo: 'principal', duracionMin: 90, notas: '' }],
    personal: [{ rol: 'Cirujano', nombre: cirujano }],
    equipos: [],
    canasta,
    farmacia,
  };
}
```

- [ ] **Step 4: Actualizar el comentario y las 3 semillas existentes**

4a. Reemplazar el bloque de comentario que empieza `// 3 cirugías con fecha de "hoy" fija (2026-09-29` y termina en `// sin cambiar de sala; Jorge Salcedo en 'qx-2' para probar el selector.` por:

```js
  // Cirugías de "hoy" (fecha dinámica, HOY_ISO) para que "Canastas de cirugía"
  // no arranque vacía: 5 casos en 'qx-1' -- realizada con canasta recibida
  // (consumo pendiente, 12353), despachada por recibir (12356), recibida con
  // novedades (12355), urgencia en preparación (12357) y programada en
  // preparación = bloqueada (12358) -- más Jorge Salcedo en 'qx-2' (sin
  // solicitar) para probar el selector de sala.
```

4b. En la entrada `id: '12353'`: cambiar
```js
    fecha: '2026-09-29',
    horaInicio: '07:30',
    horaFin: '09:30',
    estado: 'programada',
```
por
```js
    fecha: HOY_ISO,
    horaInicio: '07:30',
    horaFin: '09:30',
    estado: 'realizada',
```
y reemplazar su bloque `// Todos 'solicitado' -- pendiente de recepción ... canasta: {...},` (comentario + `canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i, solicitudFarmacia: 'solicitado' })), },`) por:

```js
    // Recibida completa y cirugía ya realizada: queda el consumo por registrar.
    canasta: {
      nombre: 'Colecistectomía estándar',
      items: itemsDe(0, (i) => ({
        solicitudFarmacia: 'entregado', preparado: true, despachado: i.cantidad, recibido: i.cantidad,
      })),
      recepcion: { usuario: 'Camilo Grondona', fecha: `${HOY_ISO}T06:48`, conNovedades: false },
    },
```

4c. En `id: '12354'`: cambiar `fecha: '2026-09-29',` (la que está junto a `horaInicio: '10:00',`) por `fecha: HOY_ISO,`.

4d. En `id: '12355'`: cambiar `fecha: '2026-09-29',` (junto a `horaInicio: '13:00',`) por `fecha: HOY_ISO,` y reemplazar su bloque `// Todos 'entregado' -- ya recibida, pestaña "Recibidas". canasta: {...},` por:

```js
    // Recibida con novedades: llegó 1 unidad menos de gasas.
    canasta: {
      nombre: 'Hernia inguinal estándar',
      items: itemsDe(2, (i) => {
        const falta = i.nombre === 'Gasas estériles';
        return {
          solicitudFarmacia: 'entregado',
          preparado: true,
          despachado: i.cantidad,
          recibido: falta ? i.cantidad - 1 : i.cantidad,
          ...(falta ? { novedad: 'Faltan 1 en la entrega' } : {}),
        };
      }),
      recepcion: { usuario: 'Camilo Grondona', fecha: `${HOY_ISO}T08:10`, conNovedades: true },
    },
```

- [ ] **Step 5: Agregar las 3 semillas nuevas**

Después del `},` que cierra la entrada `12355` (justo antes del `];` que cierra `CIRUGIAS`) agregar:

```js
  // Despachada por recibir: farmacia despachó 5 de 6 gasas.
  cirugiaHoy({
    id: '12356',
    nombre: 'Juan Rodríguez',
    documento: 'CC 71.334.902',
    edad: 47,
    sexo: 'Masculino',
    procedimiento: 'Hernioplastia inguinal derecha',
    cirujano: 'Dr. Andrés López',
    horaInicio: '09:30',
    horaFin: '11:30',
    canasta: {
      nombre: 'Hernia inguinal estándar',
      items: itemsDe(2, (i) => ({
        solicitudFarmacia: 'solicitado', preparado: true, despachado: i.nombre === 'Gasas estériles' ? i.cantidad - 1 : i.cantidad,
      })),
    },
    farmacia: {
      numeroPedido: '4593', estado: 'listo', fechaSolicitud: `${HOY_ISO}T07:30`, medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  }),
  // Urgencia con la canasta a medio preparar (3 de 5): puede autorizar inicio.
  cirugiaHoy({
    id: '12357',
    nombre: 'Andrés Mejía',
    documento: 'CC 1.017.228.391',
    edad: 22,
    sexo: 'Masculino',
    procedimiento: 'Apendicectomía laparoscópica',
    cirujano: 'Dr. Carlos Martínez',
    horaInicio: '13:30',
    horaFin: '14:30',
    estado: 'urgencia',
    canasta: {
      nombre: 'Apendicectomía estándar',
      items: itemsDe(1, (_, n) => ({ solicitudFarmacia: 'solicitado', preparado: n < 3 })),
    },
    farmacia: {
      numeroPedido: '4594', estado: 'en-preparacion', fechaSolicitud: `${HOY_ISO}T09:45`, medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  }),
  // Programada con la canasta en preparación: inicio bloqueado.
  cirugiaHoy({
    id: '12358',
    nombre: 'Sofía Castro',
    documento: 'CC 32.118.640',
    edad: 46,
    sexo: 'Femenino',
    procedimiento: 'Histerectomía abdominal',
    cirujano: 'Dr. Andrés López',
    horaInicio: '15:30',
    horaFin: '18:00',
    canasta: {
      nombre: 'Histerectomía abdominal',
      items: [
        ['Sutura Vicryl 1', 4], ['Sutura Vicryl 0', 3], ['Compresas quirúrgicas', 4], ['Gasas estériles', 5],
        ['Hoja de bisturí #22', 2], ['Sonda Foley 16 Fr', 1], ['Bolsa recolectora de orina', 1],
      ].map(([nombre, cantidad]) => ({
        nombre, cantidad, estado: 'disponible', solicitudFarmacia: 'solicitado', preparado: false,
      })),
    },
    farmacia: {
      numeroPedido: '4595', estado: 'en-preparacion', fechaSolicitud: `${HOY_ISO}T10:15`, medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  }),
```

- [ ] **Step 6: `fetchCanastasDia` incluye realizadas**

En `fetchCanastasDia`, reemplazar el comentario que termina en `// una cirugía cancelada/incumplida/realizada ya no tiene nada pendiente de\n// recibir.` (las 3 líneas `... Excluye estados terminales:` / `una cirugía cancelada/...` / `recibir.`) por:

```js
// (ver comentario en VencidasFiltrosBar.jsx). Excluye cancelada/incumplida
// (ya no tienen canasta que gestionar) pero SÍ incluye realizada: su canasta
// sigue abierta para registrar consumo y devolución (encargo 2026-09-30).
```
y la línea del filtro:
```js
          c.sedeId === '02' && c.salaId === salaId && c.fecha === fecha && !ESTADOS_TERMINALES_CIRUGIA.includes(c.estado)
```
por:
```js
          c.sedeId === '02' && c.salaId === salaId && c.fecha === fecha && !['cancelada', 'incumplida'].includes(c.estado)
```

- [ ] **Step 7: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — `modelo` (10) y `semilla` (4).

- [ ] **Step 8: Commit**

```bash
git add src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js src/hooks/ProgramacionSalaCirugias/__tests__/semilla.test.mjs
git commit -m "feat(canastas): semilla de hoy con los 5 casos y realizadas en el listado"
```

---

### Task 3: Acciones del mock (recepción, despacho, urgencia, consumo)

**Files:**
- Modify: `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js` (`avanzarCanasta`, `registrarEntregaInsumos`, funciones nuevas)
- Test: `src/hooks/ProgramacionSalaCirugias/__tests__/acciones.test.mjs`

**Interfaces:**
- Consumes: `resumenCanasta`, `gateCirugia`, `novedadItem`, `cantidadDespachada`, `cantidadRecibida`, `guardarDevolucion`, `actualizarCirugia`, `fechaHoraLocalISO`, `CIRUGIAS`.
- Produces (todas devuelven la cirugía actualizada y lanzan `Error` con mensaje de usuario si falla la precondición):
  - `despacharCanasta(id)`
  - `registrarRecepcion(id, { recibidos: Record<nombre, number>, usuario? })`
  - `autorizarInicioUrgencia(id, { usuario? })`
  - `registrarConsumo(id, { usados: Record<nombre, number>, usuario? })`
  - `registrarEntregaInsumos(id)` (mantiene su firma; ahora fija `preparado/despachado/recibido`)

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/hooks/ProgramacionSalaCirugias/__tests__/acciones.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  autorizarInicioUrgencia, cancelarSolicitudInsumos, cantidadDevuelta, despacharCanasta, gateCirugia,
  registrarConsumo, registrarEntregaInsumos, registrarRecepcion, resumenCanasta, solicitarInsumosFarmacia,
  fetchCanastasDia, fechaISO,
} from '../mockCirugiaData.js';

const HOY = fechaISO(new Date());
const cirugia = async (id, salaId = 'qx-1') => (await fetchCanastasDia({ fecha: HOY, salaId })).find((c) => c.id === id);

test('registrarRecepcion: rechaza recibir más de lo despachado y no cambia nada', async () => {
  assert.throws(
    () => registrarRecepcion('12356', { recibidos: { 'Gasas estériles': 6 }, usuario: 'Ana' }),
    /Gasas estériles: lo recibido debe estar entre 0 y 5/,
  );
  assert.equal(resumenCanasta(await cirugia('12356')).estado, 'despachada');
});

test('registrarRecepcion: exige que farmacia haya despachado', () => {
  assert.throws(() => registrarRecepcion('12358', { recibidos: {}, usuario: 'Ana' }), /todavía no fue despachada/);
});

test('registrarRecepcion: con faltantes → con-novedades y trazabilidad', async () => {
  const c = registrarRecepcion('12356', { recibidos: { 'Gasas estériles': 4 }, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'con-novedades');
  const gasas = c.canasta.items.find((i) => i.nombre === 'Gasas estériles');
  assert.equal(gasas.recibido, 4);
  assert.equal(gasas.novedad, 'Farmacia despachó 5 de 6 · Faltan 1 en la entrega');
  assert.equal(c.canasta.items.every((i) => i.solicitudFarmacia === 'entregado'), true);
  assert.equal(c.canasta.recepcion.usuario, 'Ana');
  assert.equal(c.canasta.recepcion.conNovedades, true);
  assert.equal(gateCirugia(c), 'lista');
});

test('autorizarInicioUrgencia: solo urgencias sin canasta recibida, una vez', () => {
  assert.throws(() => autorizarInicioUrgencia('12358', { usuario: 'Ana' }), /Solo las cirugías de urgencia/);
  const c = autorizarInicioUrgencia('12357', { usuario: 'Ana' });
  assert.equal(gateCirugia(c), 'urgencia-autorizada');
  assert.equal(c.canasta.autorizacionUrgencia.usuario, 'Ana');
  assert.throws(() => autorizarInicioUrgencia('12357', { usuario: 'Ana' }), /Solo las cirugías de urgencia/);
});

test('despacharCanasta + registrarRecepcion sin faltantes → recibida', () => {
  const despachada = despacharCanasta('12357');
  assert.equal(resumenCanasta(despachada).estado, 'despachada');
  const c = registrarRecepcion('12357', { recibidos: {}, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'recibida');
  assert.equal(c.canasta.recepcion.conNovedades, false);
  assert.equal(gateCirugia(c), 'lista');
});

test('registrarConsumo: valida topes y exige cirugía realizada', () => {
  assert.throws(() => registrarConsumo('12356', { usados: {}, usuario: 'Ana' }), /al finalizar la cirugía/);
  assert.throws(
    () => registrarConsumo('12353', { usados: { 'Gasas estériles': 11 }, usuario: 'Ana' }),
    /Gasas estériles: lo usado debe estar entre 0 y 10/,
  );
});

test('registrarConsumo: crea la devolución con recibido − usado y queda consumo-registrado', () => {
  const c = registrarConsumo('12353', { usados: { 'Gasas estériles': 6, 'Trocar 5mm': 1 }, usuario: 'Ana' });
  assert.equal(resumenCanasta(c).estado, 'consumo-registrado');
  assert.equal(c.canasta.consumo.usuario, 'Ana');
  assert.equal(c.canasta.consumo.usados['Gasas estériles'], 6);
  assert.equal(c.devoluciones.length, 1);
  assert.deepEqual(
    c.devoluciones[0].items.map((i) => [i.nombre, i.cantidad]),
    [['Trocar 5mm', 1], ['Gasas estériles', 4]],
  );
  assert.equal(cantidadDevuelta(c, 'Gasas estériles'), 4);
});

test('cancelar la solicitud borra preparado/despachado; volver a pedir → en-preparacion', () => {
  const causal = { idCausal: '1', descripcion: 'Cambio de plan' };
  const cancelada = cancelarSolicitudInsumos('12358', { causal });
  assert.equal(resumenCanasta(cancelada).estado, 'sin-solicitar');
  assert.equal(cancelada.canasta.items.some((i) => 'preparado' in i || 'despachado' in i), false);
  assert.equal(resumenCanasta(solicitarInsumosFarmacia('12358')).estado, 'en-preparacion');
});

test('registrarEntregaInsumos (InsumosTab): deja recibido = cantidad y estado recibida', () => {
  const c = registrarEntregaInsumos('12358');
  assert.equal(resumenCanasta(c).estado, 'recibida');
  assert.equal(c.canasta.items.every((i) => i.recibido === i.cantidad && i.despachado === i.cantidad), true);
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — `does not provide an export named 'autorizarInicioUrgencia'` (y demás).

- [ ] **Step 3: Implementar**

3a. En `avanzarCanasta`, reemplazar:

```js
      items: actual.canasta.items.map((i) => (
        (i.solicitudFarmacia ?? 'sin-solicitar') === desde ? { ...i, solicitudFarmacia: hasta } : i
      )),
```
por:
```js
      items: actual.canasta.items.map((i) => {
        if ((i.solicitudFarmacia ?? 'sin-solicitar') !== desde) return i;
        const avanzado = { ...i, solicitudFarmacia: hasta };
        // Volver a "sin solicitar" borra lo que farmacia ya había avanzado.
        if (hasta === 'sin-solicitar') {
          delete avanzado.preparado;
          delete avanzado.despachado;
        }
        return avanzado;
      }),
```

3b. Reemplazar `registrarEntregaInsumos` (comentario `// "Registrar entrega": farmacia entregó lo solicitado al quirófano.` + función) por:

```js
// "Registrar entrega" (InsumosTab): farmacia entregó lo solicitado al
// quirófano, todo completo -- equivale a despachar y recibir sin novedades.
// La recepción por cantidades (con novedades) vive en registrarRecepcion.
export function registrarEntregaInsumos(id) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    canasta: {
      ...actual.canasta,
      items: actual.canasta.items.map((i) => (
        (i.solicitudFarmacia ?? 'sin-solicitar') === 'solicitado'
          ? {
            ...i,
            solicitudFarmacia: 'entregado',
            preparado: true,
            despachado: i.despachado ?? i.cantidad,
            recibido: i.despachado ?? i.cantidad,
          }
          : i
      )),
    },
  });
}

// Farmacia despachó lo solicitado (mock: no hay integración real): todos los
// solicitados quedan preparados y despachados por su cantidad completa.
export function despacharCanasta(id) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    canasta: {
      ...actual.canasta,
      items: actual.canasta.items.map((i) => (
        i.solicitudFarmacia === 'solicitado' ? { ...i, preparado: true, despachado: i.despachado ?? i.cantidad } : i
      )),
    },
  });
}

// Recepción por cantidades en quirófano. `recibidos`: { [nombre]: cantidad };
// un ítem sin entrada se toma completo (= lo despachado). Valida todo ANTES
// de escribir, así un error no deja la canasta a medias.
export function registrarRecepcion(id, { recibidos, usuario = 'CLINTOS' }) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  if (resumenCanasta(actual).estado !== 'despachada') {
    throw new Error('La canasta todavía no fue despachada por farmacia.');
  }
  let conNovedades = false;
  const items = actual.canasta.items.map((i) => {
    if (i.solicitudFarmacia !== 'solicitado') return i;
    const despachado = cantidadDespachada(i);
    const recibido = recibidos[i.nombre] ?? despachado;
    if (!Number.isInteger(recibido) || recibido < 0 || recibido > despachado) {
      throw new Error(`${i.nombre}: lo recibido debe estar entre 0 y ${despachado}.`);
    }
    if (recibido < i.cantidad) conNovedades = true;
    return {
      ...i, solicitudFarmacia: 'entregado', despachado, recibido, novedad: novedadItem(i, recibido) || undefined,
    };
  });
  return actualizarCirugia(id, {
    canasta: {
      ...actual.canasta,
      items,
      recepcion: { usuario, fecha: fechaHoraLocalISO(new Date()), conNovedades },
    },
  });
}

// Excepción de urgencia: la cirugía puede iniciar sin la canasta. Queda
// registrado quién y cuándo; la recepción sigue pendiente.
export function autorizarInicioUrgencia(id, { usuario = 'CLINTOS' } = {}) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  if (gateCirugia(actual) !== 'urgencia-puede-autorizar') {
    throw new Error('Solo las cirugías de urgencia con la canasta sin recibir pueden autorizarse.');
  }
  return actualizarCirugia(id, {
    canasta: { ...actual.canasta, autorizacionUrgencia: { usuario, fecha: fechaHoraLocalISO(new Date()) } },
  });
}

// Consumo real tras la cirugía. `usados`: { [nombre]: cantidad } (sin entrada
// = se usó todo lo recibido). Lo no usado se devuelve a farmacia creando una
// devolución con guardarDevolucion (reusa topes, código y lote).
export function registrarConsumo(id, { usados, usuario = 'CLINTOS' }) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  if (actual.estado !== 'realizada') throw new Error('El consumo se registra al finalizar la cirugía.');
  if (!['recibida', 'con-novedades'].includes(resumenCanasta(actual).estado)) {
    throw new Error('La canasta debe estar recibida para registrar el consumo.');
  }
  const lineas = [];
  const usadosFinal = {};
  actual.canasta.items.forEach((i) => {
    const recibido = cantidadRecibida(i);
    const usado = usados[i.nombre] ?? recibido;
    if (!Number.isInteger(usado) || usado < 0 || usado > recibido) {
      throw new Error(`${i.nombre}: lo usado debe estar entre 0 y ${recibido}.`);
    }
    usadosFinal[i.nombre] = usado;
    if (recibido - usado > 0) lineas.push({ nombre: i.nombre, cantidad: recibido - usado });
  });
  if (lineas.length > 0) guardarDevolucion(id, { lineas, usuario });
  const despues = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    canasta: { ...despues.canasta, consumo: { usuario, fecha: fechaHoraLocalISO(new Date()), usados: usadosFinal } },
  });
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — `modelo` (10), `semilla` (4), `acciones` (9).

- [ ] **Step 5: Lint del archivo**

Run: `npx eslint src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js src/hooks/ProgramacionSalaCirugias/__tests__/acciones.test.mjs
git commit -m "feat(canastas): acciones de recepción, despacho, urgencia y consumo"
```

---

### Task 4: Módulo de presentación (tonos, banners, filtros, KPIs, trazabilidad)

**Files:**
- Create: `src/hooks/ProgramacionSalaCirugias/canastaPresentacion.js`
- Test: `src/hooks/ProgramacionSalaCirugias/__tests__/presentacion.test.mjs`

**Interfaces:**
- Consumes (de `./mockCirugiaData.js`): `CANASTA_ESTADOS_RECIBIDOS`, `bloqueoInicio`, `cantidadRecibida`, `fechaHoraTrazaLabel`, `gateCirugia`, `resumenCanasta`.
- Produces:
  - `CANASTA_META: Record<estado, { tone, violet? }>`, `GATE_META: Record<gate, { label, tone, violet? }>`, `CANASTA_FARMACIA_LABEL: Record<estado, string>`
  - `badgeProps(meta): { tone, className }`
  - `ESTADO_FILTRO_OPTIONS: {value,label}[]`, `filtrarCanastas(cirugias, { busqueda, estado })`, `kpisCanastas(cirugias): { recibidas, porRecibir, enPreparacion, bloqueadas }`
  - `bannerCanasta(cirugia): { tone, texto, bloqueado } | null` con `tone` ∈ `success|warn|danger|info|violet|neutral`
  - `resumenDevolucion(cirugia, usados?): { unidades, insumos }`
  - `lineaRecepcion(cirugia)`, `lineaAutorizacion(cirugia)`, `lineaConsumo(cirugia): string`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/hooks/ProgramacionSalaCirugias/__tests__/presentacion.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  badgeProps, bannerCanasta, filtrarCanastas, GATE_META, kpisCanastas, lineaAutorizacion, lineaConsumo,
  lineaRecepcion, resumenDevolucion,
} from '../canastaPresentacion.js';

const item = (extra = {}) => ({ nombre: 'Gasas', cantidad: 4, ...extra });
const cirugia = (items, { estado = 'programada', ...resto } = {}) => ({
  id: 'x',
  estado,
  fecha: '2026-09-29',
  horaInicio: '09:30',
  paciente: { nombre: 'Juan Rodríguez', documento: 'CC 71.334.902' },
  procedimientoPrincipal: 'Hernioplastia',
  farmacia: { numeroPedido: '4593' },
  canasta: { nombre: 'c', items, ...resto },
});
const pend = () => item({ solicitudFarmacia: 'solicitado' });
const desp = () => item({ solicitudFarmacia: 'solicitado', despachado: 4 });
const ent = () => item({ solicitudFarmacia: 'entregado' });

test('badgeProps: el tono violeta agrega la clase propia', () => {
  assert.deepEqual(badgeProps({ tone: 'success' }), { tone: 'success', className: '' });
  assert.deepEqual(badgeProps(GATE_META['urgencia-autorizada']), { tone: 'neutral', className: 'cnc-badge-violet' });
});

test('filtrarCanastas: por estado y por texto', () => {
  const lista = [
    cirugia([pend()]), // en preparación, bloqueada
    { ...cirugia([desp()]), id: 'y', paciente: { nombre: 'Laura Gómez', documento: 'CC 1' } },
    { ...cirugia([ent()]), id: 'z', paciente: { nombre: 'Ana', documento: 'CC 2' } },
  ];
  const ids = (f) => filtrarCanastas(lista, f).map((c) => c.id);
  assert.deepEqual(ids({}), ['x', 'y', 'z']);
  assert.deepEqual(ids({ estado: 'en-preparacion' }), ['x']);
  assert.deepEqual(ids({ estado: 'por-recibir' }), ['y']);
  assert.deepEqual(ids({ estado: 'recibidas' }), ['z']);
  assert.deepEqual(ids({ estado: 'bloqueadas' }), ['x', 'y']);
  assert.deepEqual(ids({ busqueda: 'laura' }), ['y']);
  assert.deepEqual(ids({ busqueda: '4593' }), ['x', 'y', 'z']);
});

test('kpisCanastas: la urgencia sin autorizar no cuenta como bloqueada', () => {
  const lista = [cirugia([pend()]), cirugia([desp()]), cirugia([ent()]), cirugia([pend()], { estado: 'urgencia' })];
  assert.deepEqual(kpisCanastas(lista), {
    recibidas: 1, porRecibir: 1, enPreparacion: 2, bloqueadas: 2,
  });
});

test('bannerCanasta por compuerta', () => {
  assert.equal(bannerCanasta(cirugia([pend()])).tone, 'danger');
  assert.equal(bannerCanasta(cirugia([pend()])).bloqueado, true);
  assert.match(bannerCanasta(cirugia([pend()], { estado: 'urgencia' })).texto, /puedes autorizar el inicio/);
  const autorizada = cirugia([pend()], { estado: 'urgencia', autorizacionUrgencia: { usuario: 'Ana', fecha: '2026-09-29T08:45' } });
  assert.match(bannerCanasta(autorizada).texto, /Inicio autorizado por urgencia \(Ana · 29\.SEP\.2026 - 08:45\)/);
  assert.equal(bannerCanasta(cirugia([ent()])).tone, 'success');
  assert.equal(
    bannerCanasta(cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: true } })).tone,
    'warn',
  );
  assert.equal(bannerCanasta(cirugia([ent()], { estado: 'realizada' })).tone, 'info');
  assert.equal(
    bannerCanasta(cirugia([ent()], { estado: 'realizada', consumo: { usuario: 'Ana', fecha: '2026-09-29T10:00', usados: {} } })).tone,
    'neutral',
  );
  assert.equal(bannerCanasta(cirugia([ent()], { estado: 'cancelada' })), null);
});

test('resumenDevolucion: unidades e insumos a devolver', () => {
  const c = cirugia([ent({ nombre: 'A', cantidad: 4 }), ent({ nombre: 'B', cantidad: 2, recibido: 1 })]);
  assert.deepEqual(resumenDevolucion(c), { unidades: 0, insumos: 0 });
  assert.deepEqual(resumenDevolucion(c, { A: 1, B: 0 }), { unidades: 4, insumos: 2 });
});

test('líneas de trazabilidad', () => {
  const conNov = cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: true } });
  assert.equal(lineaRecepcion(conNov), 'Recibida con novedades por Ana · 29.SEP.2026 - 08:10 · Farmacia notificada');
  const sinNov = cirugia([ent()], { recepcion: { usuario: 'Ana', fecha: '2026-09-29T08:10', conNovedades: false } });
  assert.equal(lineaRecepcion(sinNov), 'Recibida completa por Ana · 29.SEP.2026 - 08:10');
  assert.equal(lineaRecepcion(cirugia([ent()])), 'Canasta recibida.');
  const aut = cirugia([pend()], { estado: 'urgencia', autorizacionUrgencia: { usuario: 'Ana', fecha: '2026-09-29T08:45' } });
  assert.equal(lineaAutorizacion(aut), 'Excepción registrada por Ana · 29.SEP.2026 - 08:45. La recepción sigue pendiente.');
  const cons = cirugia([ent({ nombre: 'A', cantidad: 4 })], {
    estado: 'realizada', consumo: { usuario: 'Ana', fecha: '2026-09-29T10:00', usados: { A: 1 } },
  });
  assert.equal(lineaConsumo(cons), 'Consumo registrado por Ana · 29.SEP.2026 - 10:00 · 3 unidades enviadas a devolución');
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run: `npm test`
Expected: FAIL — `Cannot find module '../canastaPresentacion.js'`.

- [ ] **Step 3: Implementar el módulo**

Crear `src/hooks/ProgramacionSalaCirugias/canastaPresentacion.js`:

```js
// Presentación de "Canastas de cirugía": mapas de tono/label, banners, filtros,
// KPIs y líneas de trazabilidad. Lógica pura (sin JSX) para poder probarla con
// node:test y compartirla entre los componentes de canastas/. Imports con
// extensión .js a propósito (node --test no resuelve sin ella).
import {
  CANASTA_ESTADOS_RECIBIDOS, bloqueoInicio, cantidadRecibida, fechaHoraTrazaLabel, gateCirugia, resumenCanasta,
} from './mockCirugiaData.js';

// `violet: true` -> <Badge> no trae tono violeta; se agrega la clase global
// `cnc-badge-violet` (ver shared.css de la feature).
export const CANASTA_META = {
  'sin-solicitar': { tone: 'neutral' },
  'en-preparacion': { tone: 'neutral' },
  despachada: { tone: 'info' },
  recibida: { tone: 'success' },
  'con-novedades': { tone: 'warn' },
  'consumo-registrado': { tone: 'neutral', violet: true },
};

export const GATE_META = {
  lista: { label: 'Lista para iniciar', tone: 'success' },
  bloqueada: { label: 'Inicio bloqueado', tone: 'danger' },
  'urgencia-puede-autorizar': { label: 'Urgencia · puede autorizar inicio', tone: 'neutral', violet: true },
  'urgencia-autorizada': { label: 'Inicio autorizado por urgencia', tone: 'neutral', violet: true },
  realizada: { label: 'Cirugía realizada', tone: 'neutral' },
};

// Valor del campo "Farmacia" del detalle.
export const CANASTA_FARMACIA_LABEL = {
  'sin-solicitar': 'Sin solicitar',
  'en-preparacion': 'En preparación',
  despachada: 'Despachada',
  recibida: 'Entregada',
  'con-novedades': 'Entregada',
  'consumo-registrado': 'Entregada',
};

export function badgeProps(meta) {
  return { tone: meta.tone, className: meta.violet ? 'cnc-badge-violet' : '' };
}

export const ESTADO_FILTRO_OPTIONS = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'por-recibir', label: 'Despachadas por recibir' },
  { value: 'en-preparacion', label: 'En preparación' },
  { value: 'recibidas', label: 'Recibidas' },
  { value: 'bloqueadas', label: 'Inicio bloqueado' },
];

export function filtrarCanastas(cirugias, { busqueda = '', estado = 'todas' } = {}) {
  const texto = busqueda.trim().toLowerCase();
  return cirugias.filter((c) => {
    const e = resumenCanasta(c).estado;
    if (estado === 'por-recibir' && e !== 'despachada') return false;
    if (estado === 'en-preparacion' && e !== 'en-preparacion') return false;
    if (estado === 'recibidas' && !CANASTA_ESTADOS_RECIBIDOS.includes(e)) return false;
    if (estado === 'bloqueadas' && !bloqueoInicio(c)) return false;
    if (!texto) return true;
    return [c.paciente.nombre, c.paciente.documento, c.procedimientoPrincipal, c.farmacia?.numeroPedido ?? '']
      .some((v) => v.toLowerCase().includes(texto));
  });
}

// "Inicio bloqueado" cuenta solo la compuerta `bloqueada` (una urgencia que
// aún puede autorizarse no es un bloqueo firme), igual que el artboard.
export function kpisCanastas(cirugias) {
  const estados = cirugias.map((c) => resumenCanasta(c).estado);
  return {
    recibidas: estados.filter((e) => CANASTA_ESTADOS_RECIBIDOS.includes(e)).length,
    porRecibir: estados.filter((e) => e === 'despachada').length,
    enPreparacion: estados.filter((e) => e === 'en-preparacion').length,
    bloqueadas: cirugias.filter((c) => gateCirugia(c) === 'bloqueada').length,
  };
}

// Banner de estado bajo la cabecera del detalle. null si la cirugía ya no
// aplica (cancelada/incumplida).
export function bannerCanasta(cirugia) {
  const gate = gateCirugia(cirugia);
  const { estado } = resumenCanasta(cirugia);
  switch (gate) {
    case 'realizada':
      return estado === 'consumo-registrado'
        ? { tone: 'neutral', bloqueado: false, texto: 'Cirugía realizada. El consumo y la devolución de insumos ya fueron registrados.' }
        : { tone: 'info', bloqueado: false, texto: 'Cirugía realizada. Registra el consumo real y la devolución de insumos a farmacia.' };
    case 'lista':
      return estado === 'con-novedades'
        ? { tone: 'warn', bloqueado: false, texto: 'Canasta recibida con novedades: la cirugía puede iniciar y farmacia fue notificada.' }
        : { tone: 'success', bloqueado: false, texto: 'Canasta recibida completa: la cirugía puede iniciar.' };
    case 'urgencia-autorizada': {
      const a = cirugia.canasta.autorizacionUrgencia;
      return {
        tone: 'violet',
        bloqueado: false,
        texto: `Inicio autorizado por urgencia (${a.usuario} · ${fechaHoraTrazaLabel(a.fecha)}). Recibe la canasta en cuanto farmacia la despache.`,
      };
    }
    case 'urgencia-puede-autorizar':
      return { tone: 'violet', bloqueado: false, texto: 'Cirugía de urgencia: puedes autorizar el inicio sin la canasta. La excepción queda registrada.' };
    case 'bloqueada':
      return { tone: 'danger', bloqueado: true, texto: 'Inicio bloqueado: confirma la recepción de la canasta para habilitar la cirugía.' };
    default:
      return null;
  }
}

// Unidades e insumos a devolver a farmacia según lo usado (sin entrada en
// `usados` = se usó todo lo recibido, nada que devolver).
export function resumenDevolucion(cirugia, usados = {}) {
  let unidades = 0;
  let insumos = 0;
  cirugia.canasta.items.forEach((i) => {
    const recibido = cantidadRecibida(i);
    const devolver = recibido - (usados[i.nombre] ?? recibido);
    if (devolver > 0) {
      unidades += devolver;
      insumos += 1;
    }
  });
  return { unidades, insumos };
}

export function lineaRecepcion(cirugia) {
  const r = cirugia.canasta.recepcion;
  if (!r) return 'Canasta recibida.';
  const base = `${r.conNovedades ? 'Recibida con novedades' : 'Recibida completa'} por ${r.usuario} · ${fechaHoraTrazaLabel(r.fecha)}`;
  return r.conNovedades ? `${base} · Farmacia notificada` : base;
}

export function lineaAutorizacion(cirugia) {
  const a = cirugia.canasta.autorizacionUrgencia;
  return `Excepción registrada por ${a.usuario} · ${fechaHoraTrazaLabel(a.fecha)}. La recepción sigue pendiente.`;
}

export function lineaConsumo(cirugia) {
  const c = cirugia.canasta.consumo;
  const { unidades } = resumenDevolucion(cirugia, c.usados);
  return `Consumo registrado por ${c.usuario} · ${fechaHoraTrazaLabel(c.fecha)} · ${unidades} unidades enviadas a devolución`;
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run: `npm test`
Expected: PASS — 4 archivos de test, todos ok.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/ProgramacionSalaCirugias/canastaPresentacion.js src/hooks/ProgramacionSalaCirugias/__tests__/presentacion.test.mjs
git commit -m "feat(canastas): módulo de presentación (tonos, banners, filtros, KPIs)"
```

---

### Task 5: Pestañas del detalle (`RecepcionTab`, `ConsumoTab`) + CSS compartido

**Files:**
- Modify: `src/Components/ProgramacionSalaCirugias/shared/shared.css` (bloque nuevo al final)
- Create: `src/Components/ProgramacionSalaCirugias/canastas/RecepcionTab/RecepcionTab.jsx`, `RecepcionTab.css`
- Create: `src/Components/ProgramacionSalaCirugias/canastas/ConsumoTab/ConsumoTab.jsx`, `ConsumoTab.css`

**Interfaces:**
- Consumes: todo lo de Tasks 1 y 4.
- Produces:
  - `<RecepcionTab cirugia draft onDraftChange onRecibir onAutorizar />` — `draft: { ok?: Record<nombre,bool>, recibido?: Record<nombre,number> }`; `onDraftChange(patch)`; `onRecibir(recibidos: Record<nombre,number>)`; `onAutorizar()`. Devuelve un fragmento: `<div className="cnc-tab-body">` + `<div className="cnc-tab-footer">`.
  - `<ConsumoTab cirugia draft onDraftChange onRegistrarConsumo />` — `draft: { usado?: Record<nombre,number> }`; `onRegistrarConsumo(usados)`.
  - Clases compartidas en `shared.css`: `.cnc-panel`, `span.cnc-badge-violet`, `.cnc-tab-body`, `.cnc-tab-footer`, `.cnc-footer-msg`, `.cnc-tabla`, `.cnc-num`, `.cnc-num-alerta`, `.cnc-col-ok`, `.cnc-insumo-nombre`, `.cnc-nov`, `.cnc-nov-inline`, `.cnc-col-nov`, `.cnc-stepper`, `.cnc-stepper-valor`, `.cnc-vacio`.

- [ ] **Step 1: Agregar el bloque compartido a `shared.css`**

Al final de `src/Components/ProgramacionSalaCirugias/shared/shared.css` agregar:

```css

/* ---------- Canastas de cirugía (varios componentes de canastas/) ---------- */
.cnc-panel{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
  display:flex;flex-direction:column;overflow:hidden;min-height:0;
}
/* Tono violeta (urgencia / consumo registrado) que <Badge> no trae. Selector
   con elemento + clase para ganarle en especificidad a la clase del CSS Module. */
span.cnc-badge-violet{background:var(--violet-bg);color:var(--violet-fg);}
html[data-theme="dark"] span.cnc-badge-violet{color:var(--violet-fg);}

/* Cuerpo y pie de cada pestaña del detalle (RecepcionTab / ConsumoTab). */
.cnc-tab-body{flex:1;min-height:0;overflow-y:auto;padding:4px 20px 8px;}
.cnc-tab-footer{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;flex-shrink:0;box-sizing:border-box;
  min-height:64px;padding:12px 20px;border-top:1px solid var(--border);background:var(--bg);
}
.cnc-footer-msg{flex:1;min-width:200px;font-size:var(--fs-base);color:var(--ink-700);}
.cnc-footer-msg strong{color:var(--ink-900);font-weight:var(--fw-semibold);}
.cnc-vacio{padding:40px 16px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);}

/* Tabla de insumos (recepción y consumo). */
.cnc-tabla{width:100%;border-collapse:collapse;}
.cnc-tabla th{
  position:sticky;top:0;z-index:var(--z-sticky);background:var(--table-header-bg);
  font-size:var(--th-fs);font-weight:var(--th-fw);color:var(--th-color);
  text-align:left;padding:10px 8px;border-bottom:1px solid var(--border);
}
.cnc-tabla td{padding:8px;border-bottom:1px solid var(--border);font-size:var(--fs-base);color:var(--ink-900);vertical-align:middle;}
.cnc-tabla .cnc-num{text-align:center;font-variant-numeric:tabular-nums;}
.cnc-tabla .cnc-col-ok{width:52px;padding:0;}
.cnc-num-alerta{color:var(--amber-fg);font-weight:var(--fw-semibold);}
.cnc-insumo-nombre{font-weight:var(--fw-medium);}
.cnc-nov{font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--amber-fg);}
.cnc-nov-inline{display:none;margin-top:2px;}

/* − valor + (recibido en recepción, usado en consumo). */
.cnc-stepper{display:inline-flex;align-items:center;justify-content:center;gap:4px;}
.cnc-stepper button{
  width:32px;height:32px;border:var(--btn-border-width) solid var(--border);background:var(--surface);color:var(--ink-900);
  border-radius:var(--btn-radius);display:flex;align-items:center;justify-content:center;cursor:pointer;
}
.cnc-stepper button:hover:not(:disabled){background:var(--gray-bg);}
.cnc-stepper button:disabled{opacity:var(--btn-disabled-opacity);cursor:not-allowed;}
.cnc-stepper button:focus-visible{outline:var(--btn-focus-outline) solid var(--primary);outline-offset:var(--btn-focus-offset);}
.cnc-stepper .icon{width:14px;height:14px;}
.cnc-stepper-valor{min-width:32px;text-align:center;font-size:var(--fs-lg);font-weight:var(--fw-bold);}

@media (max-width:1024px){
  .cnc-stepper button{width:44px;height:44px;}
  .cnc-tabla .cnc-col-nov{display:none;}
  .cnc-nov-inline{display:block;}
  .cnc-tabla td{padding:6px 8px;}
}
```

- [ ] **Step 2: Crear `RecepcionTab.css`**

`src/Components/ProgramacionSalaCirugias/canastas/RecepcionTab/RecepcionTab.css`:

```css
/* Tabla, stepper, footer y .cnc-nov* viven en ../../shared/shared.css. */
.cnc-check{
  width:44px;height:44px;border:none;background:none;padding:0;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
}
.cnc-check-box{
  width:22px;height:22px;box-sizing:border-box;border-radius:6px;border:2px solid var(--ink-400);
  background:var(--surface);color:#fff;display:flex;align-items:center;justify-content:center;
}
.cnc-check.on .cnc-check-box{background:var(--primary);border-color:var(--primary);}
.cnc-check:focus-visible{outline:var(--btn-focus-outline) solid var(--primary);outline-offset:calc(var(--btn-focus-offset) * -1);border-radius:var(--radius);}
.cnc-check-box .icon{width:14px;height:14px;}

.cnc-prep-progreso{font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-700);}
.cnc-tabla .cnc-col-ico{width:32px;padding-right:0;}
.cnc-ico{width:16px;height:16px;display:block;}
.cnc-ico-ok{color:#0d7a3d;}
html[data-theme="dark"] .cnc-ico-ok{color:var(--green);}
.cnc-ico-warn{color:var(--amber-fg);}
.cnc-tabla .cnc-col-estado{text-align:right;}
/* Texto solo para lectores de pantalla (encabezado de la columna de íconos). */
.cnc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}
```

- [ ] **Step 3: Crear `RecepcionTab.jsx`**

`src/Components/ProgramacionSalaCirugias/canastas/RecepcionTab/RecepcionTab.jsx`:

```jsx
'use client';

import {
  LuCheck, LuMinus, LuPackageCheck, LuPlus, LuShieldCheck, LuTriangleAlert,
} from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import {
  cantidadDespachada, cantidadRecibida, gateCirugia, novedadItem, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { lineaAutorizacion, lineaRecepcion } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './RecepcionTab.css';

// Pestaña "Recepción" del detalle. Un solo componente con 4 modos según el
// estado derivado de la canasta:
//  - despachada     -> editar: verificar cada insumo y ajustar lo recibido.
//  - en-preparacion -> vista de avance de farmacia (+ autorizar si es urgencia).
//  - sin-solicitar  -> aviso vacío.
//  - resto          -> lectura de lo recibido.
// `draft` (borrador por cirugía) lo guarda el orquestador para no perderlo al
// cambiar de cirugía; solo se persiste al confirmar (onRecibir).
function renderEditar({
  cirugia, draft, onDraftChange, onRecibir,
}) {
  const ok = draft.ok ?? {};
  const recibidoDraft = draft.recibido ?? {};
  const filas = cirugia.canasta.items.map((item) => {
    const despachado = cantidadDespachada(item);
    const recibido = recibidoDraft[item.nombre] ?? despachado;
    return {
      item, despachado, recibido, verificado: Boolean(ok[item.nombre]), novedad: novedadItem(item, recibido),
    };
  });
  const verificados = filas.filter((f) => f.verificado).length;
  const todos = verificados === filas.length;
  const conNovedades = filas.some((f) => f.recibido < f.item.cantidad);

  const alternarTodos = () => onDraftChange({
    ok: todos ? {} : Object.fromEntries(filas.map((f) => [f.item.nombre, true])),
  });
  const alternar = (f) => onDraftChange({ ok: { ...ok, [f.item.nombre]: !f.verificado } });
  const ajustar = (f, delta) => onDraftChange({
    recibido: { ...recibidoDraft, [f.item.nombre]: Math.min(f.despachado, Math.max(0, f.recibido + delta)) },
  });
  const confirmar = () => onRecibir(Object.fromEntries(filas.map((f) => [f.item.nombre, f.recibido])));

  return (
    <>
      <div className="cnc-tab-body">
        <table className="cnc-tabla">
          <thead>
            <tr>
              <th className="cnc-col-ok">OK</th>
              <th>Insumo</th>
              <th className="cnc-num">Solicitado</th>
              <th className="cnc-num">Despachado</th>
              <th className="cnc-num">Recibido</th>
              <th className="cnc-col-nov">Novedad</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.item.nombre}>
                <td className="cnc-col-ok">
                  <button
                    type="button"
                    className={`cnc-check${f.verificado ? ' on' : ''}`}
                    aria-pressed={f.verificado}
                    aria-label={`Verificar ${f.item.nombre}`}
                    onClick={() => alternar(f)}
                  >
                    <span className="cnc-check-box">{f.verificado && <LuCheck className="icon" aria-hidden="true" />}</span>
                  </button>
                </td>
                <td>
                  <div className="cnc-insumo-nombre">{f.item.nombre}</div>
                  {f.novedad && <div className="cnc-nov cnc-nov-inline">{f.novedad}</div>}
                </td>
                <td className="cnc-num">{f.item.cantidad}</td>
                <td className={`cnc-num${f.despachado < f.item.cantidad ? ' cnc-num-alerta' : ''}`}>{f.despachado}</td>
                <td className="cnc-num">
                  <div className="cnc-stepper">
                    <button
                      type="button"
                      aria-label={`Disminuir recibido de ${f.item.nombre}`}
                      disabled={f.recibido <= 0}
                      onClick={() => ajustar(f, -1)}
                    >
                      <LuMinus className="icon" aria-hidden="true" />
                    </button>
                    <span className="cnc-stepper-valor">{f.recibido}</span>
                    <button
                      type="button"
                      aria-label={`Aumentar recibido de ${f.item.nombre}`}
                      disabled={f.recibido >= f.despachado}
                      onClick={() => ajustar(f, 1)}
                    >
                      <LuPlus className="icon" aria-hidden="true" />
                    </button>
                  </div>
                </td>
                <td className="cnc-col-nov"><span className="cnc-nov">{f.novedad || '—'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg"><strong>{verificados} de {filas.length}</strong> insumos verificados</span>
        <Button variant="secondary" onClick={alternarTodos}>{todos ? 'Desmarcar todos' : 'Marcar todos'}</Button>
        {!todos && <Button icon={LuPackageCheck} disabled>Confirmar recepción</Button>}
        {todos && !conNovedades && <Button icon={LuPackageCheck} onClick={confirmar}>Confirmar recepción completa</Button>}
        {todos && conNovedades && <Button variant="warning-outline" icon={LuTriangleAlert} onClick={confirmar}>Recibir con novedades</Button>}
      </div>
    </>
  );
}

function renderPreparacion({ cirugia, onAutorizar }) {
  const { preparados, total } = resumenCanasta(cirugia);
  const puedeAutorizar = gateCirugia(cirugia) === 'urgencia-puede-autorizar';
  const autorizada = Boolean(cirugia.canasta.autorizacionUrgencia);
  return (
    <>
      <div className="cnc-tab-body">
        <table className="cnc-tabla">
          <thead>
            <tr>
              <th>Insumo · <span className="cnc-prep-progreso">Preparados {preparados} de {total}</span></th>
              <th className="cnc-num">Solicitado</th>
              <th className="cnc-col-estado">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cirugia.canasta.items.map((item) => (
              <tr key={item.nombre}>
                <td className="cnc-insumo-nombre">{item.nombre}</td>
                <td className="cnc-num">{item.cantidad}</td>
                <td className="cnc-col-estado">
                  <Badge tone={item.preparado ? 'success' : 'neutral'}>{item.preparado ? 'Preparado' : 'Pendiente'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">
          {autorizada ? lineaAutorizacion(cirugia) : 'Podrás verificar la canasta cuando farmacia la despache.'}
        </span>
        {puedeAutorizar && <Button icon={LuShieldCheck} onClick={onAutorizar}>Autorizar inicio por urgencia</Button>}
      </div>
    </>
  );
}

function renderLectura({ cirugia }) {
  return (
    <>
      <div className="cnc-tab-body">
        <table className="cnc-tabla">
          <thead>
            <tr>
              <th className="cnc-col-ico"><span className="cnc-sr">Estado</span></th>
              <th>Insumo</th>
              <th className="cnc-num">Solicitado</th>
              <th className="cnc-num">Despachado</th>
              <th className="cnc-num">Recibido</th>
              <th className="cnc-col-nov">Novedad</th>
            </tr>
          </thead>
          <tbody>
            {cirugia.canasta.items.map((item) => {
              const recibido = cantidadRecibida(item);
              const novedad = item.novedad
                ?? (recibido < item.cantidad ? `Faltan ${item.cantidad - recibido} respecto a lo solicitado` : '');
              return (
                <tr key={item.nombre}>
                  <td className="cnc-col-ico">
                    {novedad
                      ? <LuTriangleAlert className="cnc-ico cnc-ico-warn" aria-label="Con novedad" />
                      : <LuCheck className="cnc-ico cnc-ico-ok" aria-label="Sin novedad" />}
                  </td>
                  <td>
                    <div className="cnc-insumo-nombre">{item.nombre}</div>
                    {novedad && <div className="cnc-nov cnc-nov-inline">{novedad}</div>}
                  </td>
                  <td className="cnc-num">{item.cantidad}</td>
                  <td className="cnc-num">{cantidadDespachada(item)}</td>
                  <td className="cnc-num"><strong>{recibido}</strong></td>
                  <td className="cnc-col-nov"><span className="cnc-nov">{novedad || '—'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">{lineaRecepcion(cirugia)}</span>
      </div>
    </>
  );
}

function renderVacio() {
  return (
    <>
      <div className="cnc-tab-body">
        <p className="cnc-vacio">Esta canasta todavía no fue solicitada a farmacia.</p>
      </div>
      <div className="cnc-tab-footer">
        <span className="cnc-footer-msg">Los insumos se solicitan desde Programación; cuando farmacia los despache podrás recibirlos aquí.</span>
      </div>
    </>
  );
}

export default function RecepcionTab(props) {
  const { estado } = resumenCanasta(props.cirugia);
  if (estado === 'despachada') return renderEditar(props);
  if (estado === 'en-preparacion') return renderPreparacion(props);
  if (estado === 'sin-solicitar') return renderVacio();
  return renderLectura(props);
}
```

- [ ] **Step 4: Crear `ConsumoTab.css`**

`src/Components/ProgramacionSalaCirugias/canastas/ConsumoTab/ConsumoTab.css`:

```css
/* Tabla, stepper y footer viven en ../../shared/shared.css. */
.cnc-dev-cero{color:var(--ink-400);}
.cnc-dev-uno{color:var(--status-info-fg);font-weight:var(--fw-bold);}
.cnc-usado-fijo{font-weight:var(--fw-bold);}
```

- [ ] **Step 5: Crear `ConsumoTab.jsx`**

`src/Components/ProgramacionSalaCirugias/canastas/ConsumoTab/ConsumoTab.jsx`:

```jsx
'use client';

import { LuMinus, LuPackageCheck, LuPlus } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import {
  CANASTA_ESTADOS_RECIBIDOS, cantidadRecibida, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { lineaConsumo, resumenDevolucion } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './ConsumoTab.css';

// Pestaña "Consumo y devolución": por insumo, lo recibido, lo usado (editable
// hasta registrar) y lo que vuelve a farmacia (recibido − usado). Registrar
// crea la devolución (registrarConsumo -> guardarDevolucion), que también se ve
// en la ventana "Devoluciones en Cirugías" de Programación.
export default function ConsumoTab({
  cirugia, draft, onDraftChange, onRegistrarConsumo,
}) {
  const { estado } = resumenCanasta(cirugia);
  if (!CANASTA_ESTADOS_RECIBIDOS.includes(estado)) {
    return (
      <>
        <div className="cnc-tab-body">
          <p className="cnc-vacio">La canasta no fue recibida, no hay consumo que registrar.</p>
        </div>
        <div className="cnc-tab-footer" />
      </>
    );
  }

  const consumo = cirugia.canasta.consumo;
  const usadoDraft = draft.usado ?? {};
  const usados = consumo ? consumo.usados : usadoDraft;
  const filas = cirugia.canasta.items.map((item) => {
    const recibido = cantidadRecibida(item);
    const usado = usados[item.nombre] ?? recibido;
    return {
      item, recibido, usado, devolver: recibido - usado,
    };
  });
  const { unidades, insumos } = resumenDevolucion(cirugia, Object.fromEntries(filas.map((f) => [f.item.nombre, f.usado])));

  const ajustar = (f, delta) => onDraftChange({
    usado: { ...usadoDraft, [f.item.nombre]: Math.min(f.recibido, Math.max(0, f.usado + delta)) },
  });
  const registrar = () => onRegistrarConsumo(Object.fromEntries(filas.map((f) => [f.item.nombre, f.usado])));

  return (
    <>
      <div className="cnc-tab-body">
        <table className="cnc-tabla">
          <thead>
            <tr>
              <th>Insumo</th>
              <th className="cnc-num">Recibido</th>
              <th className="cnc-num">Usado</th>
              <th className="cnc-num">Devolver</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.item.nombre}>
                <td className="cnc-insumo-nombre">{f.item.nombre}</td>
                <td className="cnc-num">{f.recibido}</td>
                <td className="cnc-num">
                  {consumo ? (
                    <span className="cnc-usado-fijo">{f.usado}</span>
                  ) : (
                    <div className="cnc-stepper">
                      <button
                        type="button"
                        aria-label={`Disminuir usado de ${f.item.nombre}`}
                        disabled={f.usado <= 0}
                        onClick={() => ajustar(f, -1)}
                      >
                        <LuMinus className="icon" aria-hidden="true" />
                      </button>
                      <span className="cnc-stepper-valor">{f.usado}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar usado de ${f.item.nombre}`}
                        disabled={f.usado >= f.recibido}
                        onClick={() => ajustar(f, 1)}
                      >
                        <LuPlus className="icon" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </td>
                <td className={`cnc-num ${f.devolver > 0 ? 'cnc-dev-uno' : 'cnc-dev-cero'}`}>{f.devolver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cnc-tab-footer">
        {consumo ? (
          <span className="cnc-footer-msg">{lineaConsumo(cirugia)}</span>
        ) : (
          <>
            <span className="cnc-footer-msg">
              Devolución a farmacia: <strong>{unidades} unidades</strong> en {insumos} insumos
            </span>
            <Button icon={LuPackageCheck} onClick={registrar}>Registrar consumo y devolución</Button>
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 6: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/canastas/RecepcionTab src/Components/ProgramacionSalaCirugias/canastas/ConsumoTab`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/shared/shared.css src/Components/ProgramacionSalaCirugias/canastas/RecepcionTab src/Components/ProgramacionSalaCirugias/canastas/ConsumoTab
git commit -m "feat(canastas): pestañas de recepción y consumo del detalle"
```

---

### Task 6: Shell de la pantalla (orquestador, lista, KPIs, alerta, detalle) y retiro de lo viejo

**Files:**
- Create: `canastas/CanastasFechaNav/CanastasFechaNav.jsx` + `.css`
- Create: `canastas/CanastasKpis/CanastasKpis.jsx` + `.css`
- Create: `canastas/CanastaAlerta/CanastaAlerta.jsx` + `.css`
- Create: `canastas/CirugiaCard/CirugiaCard.jsx` + `.css`
- Create: `canastas/CanastasLista/CanastasLista.jsx` + `.css`
- Create: `canastas/CanastaDetalle/CanastaDetalle.jsx` + `.css`
- Rewrite: `CanastasCirugia/CanastasCirugia.jsx` y `CanastasCirugia.css`
- Delete: `canastas/CanastasTable/`, `canastas/CanastasFiltrosBar/`, `canastas/ConfirmarRecepcionModal/`

(Rutas relativas a `src/Components/ProgramacionSalaCirugias/`.)

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces (props):
  - `<CanastasFechaNav fecha onFechaChange />`
  - `<CanastasKpis cirugias />` (fragmento con 4 `.cnc-kpi`, hijos de un grid)
  - `<CanastaAlerta cirugias ahora onVerificar(id) />`
  - `<CirugiaCard cirugia ahora seleccionada onSelect(id) />`
  - `<CanastasLista titulo subtitulo cirugias filtradas seleccionId ahora filtros onFiltrosChange(cambios) onSelect(id) />`
  - `<CanastaDetalle cirugia draft error onDraftChange(patch) onRecibir(recibidos) onAutorizar() onRegistrarConsumo(usados) />` con `draft.tab ∈ 'recepcion'|'consumo'`

- [ ] **Step 1: `CanastasFechaNav`**

`canastas/CanastasFechaNav/CanastasFechaNav.css`:

```css
/* .psc-agenda-nav-btn viene de ../../shared/shared.css. */
.cnc-date-nav{
  display:flex;align-items:center;gap:2px;flex-shrink:0;height:var(--input-lg);padding:0 2px;
  border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);
}
.cnc-date-nav-label{
  font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);
  white-space:nowrap;min-width:150px;text-align:center;
  background:none;border:none;border-radius:6px;padding:4px 6px;cursor:pointer;
}
.cnc-date-nav-label:hover{background:var(--gray-bg);}
/* Reemplaza al label mientras se elige una fecha puntual -- mismo ancho para
   que la fila no salte. */
.cnc-date-nav-input{
  font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);
  min-width:150px;padding:3px 6px;border:1px solid var(--border);border-radius:6px;background:var(--surface);
}
@media (max-width:1024px){
  .cnc-date-nav .psc-agenda-nav-btn{width:40px;height:40px;}
}
```

`canastas/CanastasFechaNav/CanastasFechaNav.jsx`:

```jsx
'use client';

import { useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { addDias, diaCortoLabel, fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastasFechaNav.css';

// Navegador de fecha del header de "Canastas de cirugía" (antes vivía en la
// barra de filtros; el diseño 2026-09-30 lo lleva al header). El label se
// vuelve un <input type="date"> nativo al clickearlo, para saltar a una fecha
// puntual sin clickear flecha por flecha.
export default function CanastasFechaNav({ fecha, onFechaChange }) {
  const [editando, setEditando] = useState(false);
  const hoyISO = fechaISO(new Date());
  const label = `${fecha === hoyISO ? 'Hoy · ' : ''}${diaCortoLabel(fecha)}`;
  const cambiarDia = (delta) => onFechaChange(fechaISO(addDias(new Date(`${fecha}T00:00:00`), delta)));

  return (
    <div className="cnc-date-nav">
      <button type="button" className="psc-agenda-nav-btn" aria-label="Día anterior" onClick={() => cambiarDia(-1)}>
        <LuChevronLeft className="icon" aria-hidden="true" />
      </button>
      {editando ? (
        <input
          type="date"
          className="cnc-date-nav-input"
          value={fecha}
          aria-label="Ir a una fecha"
          autoFocus
          onChange={(e) => { if (e.target.value) onFechaChange(e.target.value); setEditando(false); }}
          onBlur={() => setEditando(false)}
        />
      ) : (
        <button type="button" className="cnc-date-nav-label" onClick={() => setEditando(true)}>{label}</button>
      )}
      <button type="button" className="psc-agenda-nav-btn" aria-label="Día siguiente" onClick={() => cambiarDia(1)}>
        <LuChevronRight className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: `CanastasKpis`**

`canastas/CanastasKpis/CanastasKpis.css`:

```css
.cnc-kpi{
  display:flex;align-items:center;gap:12px;min-width:0;
  padding:12px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);
}
.cnc-kpi-icon-wrap{
  width:38px;height:38px;border-radius:10px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.cnc-kpi-icon-wrap .icon{width:20px;height:20px;}
.cnc-kpi-success{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .cnc-kpi-success{color:var(--green);}
.cnc-kpi-info{background:var(--status-info-bg);color:var(--status-info-fg);}
.cnc-kpi-neutral{background:var(--gray-bg);color:var(--ink-500);}
.cnc-kpi-danger{background:var(--red-bg);color:var(--red);}
.cnc-kpi-value{font-size:var(--fs-2xl);font-weight:var(--fw-bold);color:var(--ink-900);line-height:1.1;}
.cnc-kpi-label{font-size:var(--fs-sm);color:var(--ink-500);}
```

`canastas/CanastasKpis/CanastasKpis.jsx`:

```jsx
'use client';

import {
  LuClock, LuLock, LuPackage, LuPackageCheck,
} from 'react-icons/lu';
import { kpisCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasKpis.css';

const KPIS = [
  {
    key: 'recibidas', icon: LuPackageCheck, tone: 'success', label: 'Canastas recibidas',
  },
  {
    key: 'porRecibir', icon: LuPackage, tone: 'info', label: 'Despachadas por recibir',
  },
  {
    key: 'enPreparacion', icon: LuClock, tone: 'neutral', label: 'En preparación en farmacia',
  },
  {
    key: 'bloqueadas', icon: LuLock, tone: 'danger', label: 'Cirugías con inicio bloqueado',
  },
];

// Fragmento: las 4 tarjetas son hijos directos del grid `.cnc-resumen` de la
// página (junto a CanastaAlerta).
export default function CanastasKpis({ cirugias }) {
  const kpis = kpisCanastas(cirugias);
  return (
    <>
      {KPIS.map(({
        key, icon: Icon, tone, label,
      }) => (
        <div className="cnc-kpi" key={key}>
          <span className={`cnc-kpi-icon-wrap cnc-kpi-${tone}`}><Icon className="icon" aria-hidden="true" /></span>
          <div>
            <div className="cnc-kpi-value">{kpis[key]}</div>
            <div className="cnc-kpi-label">{label}</div>
          </div>
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 3: `CanastaAlerta`**

`canastas/CanastaAlerta/CanastaAlerta.css`:

```css
.cnc-alerta{
  box-sizing:border-box;display:flex;align-items:center;gap:10px;min-width:0;
  padding:10px 12px 10px 14px;border-radius:var(--radius-lg);font-size:var(--fs-sm);
  background:var(--amber-bg);color:var(--amber-fg);
  border:1px solid color-mix(in srgb,var(--amber-fg) 35%,transparent);
}
.cnc-alerta-icon{width:20px;height:20px;flex-shrink:0;}
.cnc-alerta-text{flex:1;line-height:1.35;}
.cnc-alerta-ok{
  background:var(--green-bg);color:#0d7a3d;font-weight:var(--fw-medium);
  border-color:color-mix(in srgb,#0d7a3d 30%,transparent);
}
html[data-theme="dark"] .cnc-alerta-ok{color:var(--green);}
```

`canastas/CanastaAlerta/CanastaAlerta.jsx`:

```jsx
'use client';

import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import { gateCirugia, iniciaEnLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './CanastaAlerta.css';

// Primera cirugía con inicio bloqueado (compuerta `bloqueada`; una urgencia
// que aún puede autorizarse no cuenta) o, si no hay ninguna, el estado verde.
export default function CanastaAlerta({ cirugias, ahora, onVerificar }) {
  const bloqueada = cirugias.find((c) => gateCirugia(c) === 'bloqueada');
  if (!bloqueada) {
    return (
      <div className="cnc-alerta cnc-alerta-ok" role="status">
        <LuCircleCheck className="cnc-alerta-icon" aria-hidden="true" />
        <span>Ninguna cirugía programada está bloqueada por su canasta.</span>
      </div>
    );
  }
  const cuando = iniciaEnLabel(bloqueada, ahora);
  return (
    <div className="cnc-alerta" role="status">
      <LuTriangleAlert className="cnc-alerta-icon" aria-hidden="true" />
      <span className="cnc-alerta-text">
        <strong>{bloqueada.paciente.nombre} · {bloqueada.horaInicio}</strong> — {cuando.charAt(0).toLowerCase() + cuando.slice(1)}.
        {' '}La cirugía está bloqueada hasta recibir su canasta.
      </span>
      <Button variant="warning-outline" size="sm" onClick={() => onVerificar(bloqueada.id)}>Verificar ahora</Button>
    </div>
  );
}
```

- [ ] **Step 4: `CirugiaCard`**

`canastas/CirugiaCard/CirugiaCard.css`:

```css
.cnc-cir-card{
  width:100%;display:grid;grid-template-columns:64px minmax(0,1fr);gap:12px;text-align:left;
  padding:12px 14px;border-radius:10px;border:1.5px solid var(--border);background:var(--surface);
  color:var(--ink-900);font:inherit;cursor:pointer;
}
.cnc-cir-card:hover{background:var(--bg);}
.cnc-cir-card.selected{border-color:var(--primary);background:var(--primary-50);}
.cnc-cir-card:focus-visible{outline:2px solid var(--primary);outline-offset:2px;}
.cnc-cc-hora{display:flex;flex-direction:column;gap:2px;}
.cnc-cc-hora-valor{font-size:var(--fs-lg);font-weight:var(--fw-bold);}
.cnc-cc-hora-cuando{font-size:var(--fs-xs);color:var(--ink-500);line-height:1.3;}
.cnc-cc-body{display:flex;flex-direction:column;gap:3px;min-width:0;}
.cnc-cc-paciente-row{display:flex;align-items:center;gap:6px;min-width:0;}
.cnc-cc-paciente{font-size:var(--fs-base);font-weight:var(--fw-semibold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cnc-cc-proc{font-size:var(--fs-base);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cnc-cc-cirujano{font-size:var(--fs-sm);color:var(--ink-500);}
.cnc-cc-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:5px;}
.cnc-badge-icon{width:11px;height:11px;margin-right:4px;}
```

`canastas/CirugiaCard/CirugiaCard.jsx`:

```jsx
'use client';

import { LuLock } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import { CANASTA_ESTADO_LABEL, gateCirugia, iniciaEnLabel, resumenCanasta } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { CANASTA_META, GATE_META, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CirugiaCard.css';

export default function CirugiaCard({
  cirugia, ahora, seleccionada, onSelect,
}) {
  const { estado } = resumenCanasta(cirugia);
  const gate = gateCirugia(cirugia);
  const gateMeta = GATE_META[gate];
  return (
    <button
      type="button"
      className={`cnc-cir-card${seleccionada ? ' selected' : ''}`}
      aria-pressed={seleccionada}
      onClick={() => onSelect(cirugia.id)}
    >
      <div className="cnc-cc-hora">
        <span className="cnc-cc-hora-valor">{cirugia.horaInicio}</span>
        <span className="cnc-cc-hora-cuando">{iniciaEnLabel(cirugia, ahora)}</span>
      </div>
      <div className="cnc-cc-body">
        <div className="cnc-cc-paciente-row">
          <span className="cnc-cc-paciente">{cirugia.paciente.nombre}</span>
          {cirugia.estado === 'urgencia' && <EstadoCirugiaBadge estado="urgencia" size="sm" />}
        </div>
        <span className="cnc-cc-proc">{cirugia.procedimientoPrincipal}</span>
        <span className="cnc-cc-cirujano">{cirugia.cirujano}</span>
        <div className="cnc-cc-badges">
          <Badge {...badgeProps(CANASTA_META[estado])}>{CANASTA_ESTADO_LABEL[estado]}</Badge>
          {gateMeta && (
            <Badge {...badgeProps(gateMeta)}>
              {gate === 'bloqueada' && <LuLock className="cnc-badge-icon" aria-hidden="true" />}
              {gateMeta.label}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 5: `CanastasLista`**

`canastas/CanastasLista/CanastasLista.css`:

```css
/* .cnc-panel, .filter-bar y .search-field vienen de ../../shared/shared.css. */
.cnc-lista{width:460px;flex-shrink:0;}
.cnc-lista-header{padding:14px 16px 10px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:10px;}
.cnc-lista-titulo{display:flex;align-items:baseline;justify-content:space-between;gap:8px;}
.cnc-lista-titulo h2{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.cnc-lista-sub{font-size:var(--fs-sm);color:var(--ink-500);}
/* Panel angosto: la fila de filtros no lleva el padding ni el borde propios
   de .filter-bar (el header ya los aporta) y no envuelve. */
.cnc-lista-filtros{padding:0;border-bottom:none;flex-wrap:nowrap;gap:8px;}
.cnc-lista-filtros .search-field{flex:1;width:auto;min-width:0;}
.cnc-lista-estado{width:180px;flex-shrink:0;}
.cnc-lista-items{flex:1;min-height:0;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px;}
.cnc-lista-vacio{padding:32px 16px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);}
@media (max-width:1024px){.cnc-lista{width:410px;}}
```

`canastas/CanastasLista/CanastasLista.jsx`:

```jsx
'use client';

import { LuSearch } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import { ESTADO_FILTRO_OPTIONS } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasLista.css';

// Panel izquierdo: una sola fila de filtros (buscador + estado, ver AGENTS.md
// "Barra de filtros de listado") y las cirugías del día ordenadas por hora.
// `filtradas` es lo que se lista; `cirugias.length` alimenta el subtítulo.
export default function CanastasLista({
  titulo, subtitulo, filtradas, seleccionId, ahora, filtros, onFiltrosChange, onSelect,
}) {
  return (
    <section className="cnc-panel cnc-lista" aria-label="Cirugías del día">
      <div className="cnc-lista-header">
        <div className="cnc-lista-titulo">
          <h2>{titulo}</h2>
          <span className="cnc-lista-sub">{subtitulo}</span>
        </div>
        <div className="filter-bar cnc-lista-filtros">
          <div className="search-field">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar paciente, documento o n.º de solicitud"
              aria-label="Buscar cirugía"
              value={filtros.busqueda}
              onChange={(e) => onFiltrosChange({ busqueda: e.target.value })}
            />
          </div>
          <div className="cnc-lista-estado">
            <FormSelect
              id="cnc-estado"
              ariaLabel="Estado de la canasta"
              value={filtros.estado}
              onChange={(estado) => onFiltrosChange({ estado })}
              options={ESTADO_FILTRO_OPTIONS}
            />
          </div>
        </div>
      </div>
      <div className="cnc-lista-items">
        {filtradas.length === 0 && <p className="cnc-lista-vacio">Ninguna cirugía coincide con los filtros.</p>}
        {filtradas.map((c) => (
          <CirugiaCard key={c.id} cirugia={c} ahora={ahora} seleccionada={c.id === seleccionId} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: `CanastaDetalle`**

`canastas/CanastaDetalle/CanastaDetalle.css`:

```css
/* .cnc-panel viene de ../../shared/shared.css. */
.cnc-detalle{flex:1;min-width:0;}
.cnc-det-head{padding:16px 24px 12px;}
.cnc-det-head-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;}
.cnc-det-paciente-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.cnc-det-paciente-row h2{font-size:var(--fs-xl);font-weight:var(--fw-semibold);color:var(--ink-900);}
.cnc-det-doc{font-size:var(--fs-sm);color:var(--ink-500);margin-top:2px;}
.cnc-det-head-right{display:flex;flex-direction:column;align-items:flex-end;gap:4px;}
.cnc-det-solicitud{font-size:var(--fs-xs);color:var(--ink-500);}
.cnc-det-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:12px;}
.cnc-det-label{display:block;font-size:var(--fs-xs);color:var(--ink-500);text-transform:uppercase;letter-spacing:.04em;}
.cnc-det-value{display:block;font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);margin-top:2px;}

.cnc-banner{
  margin:0 24px;padding:10px 14px;border-radius:var(--radius);
  display:flex;align-items:center;gap:10px;font-size:var(--fs-base);font-weight:var(--fw-medium);
}
.cnc-banner .icon{width:18px;height:18px;flex-shrink:0;}
.cnc-banner-success{background:var(--green-bg);color:#0d7a3d;}
html[data-theme="dark"] .cnc-banner-success{color:var(--green);}
.cnc-banner-warn{background:var(--amber-bg);color:var(--amber-fg);}
.cnc-banner-danger{background:var(--red-bg);color:var(--red);}
.cnc-banner-info{background:var(--status-info-bg);color:var(--status-info-fg);}
.cnc-banner-violet{background:var(--violet-bg);color:var(--violet-fg);}
.cnc-banner-neutral{background:var(--gray-bg);color:var(--ink-700);}
.cnc-error{margin:8px 24px 0;padding:8px 12px;border-radius:var(--radius);background:var(--red-bg);color:var(--red);font-size:var(--fs-base);}

.cnc-tabs{display:flex;gap:4px;padding:0 24px;margin-top:10px;border-bottom:1px solid var(--border);}
.cnc-tab{
  height:44px;padding:0 14px;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-1px;
  font:inherit;font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-500);cursor:pointer;
}
.cnc-tab[aria-selected="true"]{color:var(--primary);border-bottom-color:var(--primary);}
.cnc-tab:disabled{color:var(--ink-400);font-weight:var(--fw-medium);cursor:not-allowed;}
.cnc-tab:focus-visible{outline:2px solid var(--primary);outline-offset:-2px;}
.cnc-tab-nota{font-size:var(--fs-xs);}
.cnc-tabpanel{flex:1;min-height:0;display:flex;flex-direction:column;}

@media (max-width:1024px){
  .cnc-det-head{padding:14px 20px 10px;}
  .cnc-banner,.cnc-error{margin-left:20px;margin-right:20px;}
  .cnc-tabs{padding:0 20px;}
}
```

`canastas/CanastaDetalle/CanastaDetalle.jsx`:

```jsx
'use client';

import { LuInfo, LuLock } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import RecepcionTab from '../RecepcionTab/RecepcionTab';
import ConsumoTab from '../ConsumoTab/ConsumoTab';
import { CANASTA_ESTADO_LABEL, resumenCanasta } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  CANASTA_FARMACIA_LABEL, CANASTA_META, badgeProps, bannerCanasta,
} from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastaDetalle.css';

// Panel derecho: cabecera de la cirugía, banner del estado de la compuerta,
// pestañas Recepción / Consumo y devolución. El estado editable vive en
// `draft` (lo guarda el orquestador por cirugía); esta capa no tiene estado.
export default function CanastaDetalle({
  cirugia, draft, error, onDraftChange, onRecibir, onAutorizar, onRegistrarConsumo,
}) {
  const { estado } = resumenCanasta(cirugia);
  const banner = bannerCanasta(cirugia);
  const consumoDisponible = cirugia.estado === 'realizada';
  const tab = consumoDisponible ? (draft.tab ?? 'consumo') : 'recepcion';
  const BannerIcon = banner?.bloqueado ? LuLock : LuInfo;

  return (
    <section className="cnc-panel cnc-detalle" aria-label="Detalle de la canasta">
      <div className="cnc-det-head">
        <div className="cnc-det-head-top">
          <div>
            <div className="cnc-det-paciente-row">
              <h2>{cirugia.paciente.nombre}</h2>
              {cirugia.estado === 'urgencia' && <EstadoCirugiaBadge estado="urgencia" size="sm" />}
            </div>
            <div className="cnc-det-doc">{cirugia.paciente.documento} · {cirugia.paciente.edad} años</div>
          </div>
          <div className="cnc-det-head-right">
            <Badge {...badgeProps(CANASTA_META[estado])}>{CANASTA_ESTADO_LABEL[estado]}</Badge>
            <span className="cnc-det-solicitud">Solicitud {cirugia.farmacia?.numeroPedido ?? '—'}</span>
          </div>
        </div>
        <div className="cnc-det-grid">
          <div><span className="cnc-det-label">Procedimiento</span><span className="cnc-det-value">{cirugia.procedimientoPrincipal}</span></div>
          <div><span className="cnc-det-label">Horario</span><span className="cnc-det-value">{cirugia.horaInicio} – {cirugia.horaFin}</span></div>
          <div><span className="cnc-det-label">Cirujano</span><span className="cnc-det-value">{cirugia.cirujano}</span></div>
          <div><span className="cnc-det-label">Farmacia</span><span className="cnc-det-value">{CANASTA_FARMACIA_LABEL[estado]}</span></div>
        </div>
      </div>

      {banner && (
        <div className={`cnc-banner cnc-banner-${banner.tone}`}>
          <BannerIcon className="icon" aria-hidden="true" />
          <span>{banner.texto}</span>
        </div>
      )}
      {error && <p className="cnc-error" role="alert">{error}</p>}

      <div className="cnc-tabs" role="tablist" aria-label="Secciones de la canasta">
        <button
          type="button"
          role="tab"
          id="cnc-tab-recepcion"
          aria-controls="cnc-panel-recepcion"
          aria-selected={tab === 'recepcion'}
          className="cnc-tab"
          onClick={() => onDraftChange({ tab: 'recepcion' })}
        >
          Recepción
        </button>
        <button
          type="button"
          role="tab"
          id="cnc-tab-consumo"
          aria-controls="cnc-panel-consumo"
          aria-selected={tab === 'consumo'}
          className="cnc-tab"
          disabled={!consumoDisponible}
          onClick={() => onDraftChange({ tab: 'consumo' })}
        >
          Consumo y devolución
          {!consumoDisponible && <span className="cnc-tab-nota"> · al finalizar la cirugía</span>}
        </button>
      </div>

      <div className="cnc-tabpanel" role="tabpanel" id={`cnc-panel-${tab}`} aria-labelledby={`cnc-tab-${tab}`}>
        {tab === 'recepcion' ? (
          <RecepcionTab cirugia={cirugia} draft={draft} onDraftChange={onDraftChange} onRecibir={onRecibir} onAutorizar={onAutorizar} />
        ) : (
          <ConsumoTab cirugia={cirugia} draft={draft} onDraftChange={onDraftChange} onRegistrarConsumo={onRegistrarConsumo} />
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Reescribir `CanastasCirugia.css`**

Reemplazar TODO el contenido de `CanastasCirugia/CanastasCirugia.css` por:

```css
/* Shell (.app/.main/.content), tokens y .psc-page-header vienen de
   ../ProgramacionSalaCirugias.css; .psc-toast y el bloque .cnc-* compartido de
   ../shared/shared.css. Acá solo lo propio de esta página; cada panel tiene su
   CSS en ../canastas/<Componente>/. */

.cnc-sala-select{width:220px;}

/* KPIs + alerta: en desktop la alerta es la 5.ª celda de la fila; en tablet
   sube a su propia fila arriba (artboard Main). */
.cnc-resumen{
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr)) minmax(0,1.6fr);gap:12px;flex-shrink:0;
}
.cnc-workspace{display:flex;gap:16px;flex:1;min-height:0;}

.cnc-estado{
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  padding:48px 24px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);
}
.cnc-estado-icon{width:36px;height:36px;color:var(--ink-400);}
.cnc-estado-text{margin:0;}

/* .psc-toast lleva pointer-events:none (solo informa); con "Deshacer" hay
   que poder clickearlo -- mismo ajuste que .rv-toast en RevisionVencidas.css. */
.cnc-toast.show{pointer-events:auto;}
.cnc-toast-undo{
  margin-left:8px;padding:2px 8px;border:none;border-radius:6px;background:none;cursor:pointer;
  font:inherit;font-weight:var(--fw-semibold);color:var(--primary-100);text-decoration:underline;
}
.cnc-toast-undo:hover{background:rgba(255,255,255,.12);}
.cnc-toast-undo:focus-visible{outline:2px solid var(--primary-100);outline-offset:1px;}
html[data-theme="dark"] .cnc-toast-undo{color:var(--primary);}
html[data-theme="dark"] .cnc-toast-undo:focus-visible{outline-color:var(--primary);}

@media (max-width:1024px){
  .cnc-resumen{grid-template-columns:repeat(4,minmax(0,1fr));}
  .cnc-resumen > .cnc-alerta{order:-1;grid-column:1 / -1;}
}
```

- [ ] **Step 8: Reescribir `CanastasCirugia.jsx`**

Reemplazar TODO el contenido de `CanastasCirugia/CanastasCirugia.jsx` por:

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuCalendarDays, LuPackageSearch } from 'react-icons/lu';
// Tokens (:root), reset del shell y reglas compartidas de la feature: los
// mismos 2 archivos que carga RevisionVencidas.jsx, porque esta ruta es otra
// página de la misma feature (ProgramacionSalaCirugias).
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './CanastasCirugia.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CanastasFechaNav from '../canastas/CanastasFechaNav/CanastasFechaNav';
import CanastasKpis from '../canastas/CanastasKpis/CanastasKpis';
import CanastaAlerta from '../canastas/CanastaAlerta/CanastaAlerta';
import CanastasLista from '../canastas/CanastasLista/CanastasLista';
import CanastaDetalle from '../canastas/CanastaDetalle/CanastaDetalle';
import {
  SALAS, autorizarInicioUrgencia, deshacerResolucion, fechaISO, fetchCanastasDia, registrarConsumo,
  registrarRecepcion, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { filtrarCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';

// Sede fija '02' en todo el módulo (ver VencidasFiltrosBar.jsx).
const SALA_OPTIONS = SALAS.filter((s) => s.sedeId === '02').map((s) => ({ value: s.value, label: s.descripcion }));
const USUARIO = 'Camilo Grondona';

// "Canastas de cirugía" (maestro-detalle, diseño 2026-09-30): las cirugías de
// UNA sala a la izquierda; a la derecha la canasta de la seleccionada, con
// recepción por cantidades, autorización por urgencia y consumo/devolución.
// El bloqueo de inicio es solo informativo acá (spec 2026-09-30): la agenda no
// lo consume todavía. Los borradores (recibido/OK/usado/pestaña) viven por
// cirugía en `drafts` para no perderse al cambiar de selección.
export default function CanastasCirugia() {
  const router = useRouter();
  const [salaId, setSalaId] = useState('qx-1');
  const [fecha, setFecha] = useState(() => fechaISO(new Date()));
  const [filtros, setFiltros] = useState({ busqueda: '', estado: 'todas' });
  const [cirugias, setCirugias] = useState(null); // null = cargando
  const [seleccionId, setSeleccionId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState(null);
  // { message, snapshot } -- con snapshot el toast ofrece "Deshacer".
  const [toast, setToast] = useState(null);
  // Reloj del render (no `new Date()` directo): alimenta "Inicia en N min".
  const [ahora, setAhora] = useState(() => new Date());
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCanastasDia({ fecha, salaId }).then((items) => {
      if (!cancelled) setCirugias(items);
    });
    return () => { cancelled = true; };
  }, [fecha, salaId]);

  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const lista = cirugias ?? [];
  const filtradas = filtrarCanastas(lista, filtros);
  // La selección sale de la lista completa (no de `filtradas`) para que un
  // filtro no deje el detalle en blanco; sin selección explícita, la primera
  // despachada por recibir (lo accionable) o la primera cirugía.
  const seleccion = lista.find((c) => c.id === seleccionId)
    ?? lista.find((c) => resumenCanasta(c).estado === 'despachada')
    ?? lista[0]
    ?? null;

  function showToast(message, snapshot = null) {
    setToast({ message, snapshot });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), snapshot ? 5000 : 2600);
  }

  function handleSelect(id) {
    setSeleccionId(id);
    setError(null);
  }

  function handleDraftChange(id, patch) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  // Ejecuta una acción del mock; si lanza, deja el estado intacto y muestra el
  // mensaje en el detalle. El snapshot (cirugía ANTES de la acción) alimenta
  // "Deshacer" -- misma forma que usa deshacerResolucion.
  function aplicar(cirugia, accion, mensaje) {
    try {
      const actualizada = accion();
      setCirugias((prev) => (prev ?? []).map((c) => (c.id === actualizada.id ? actualizada : c)));
      setDrafts((d) => {
        const resto = { ...d };
        delete resto[cirugia.id];
        return resto;
      });
      setError(null);
      showToast(mensaje(actualizada), [cirugia]);
    } catch (e) {
      setError(e?.message ?? 'No se pudo completar la acción.');
    }
  }

  function handleRecibir(cirugia, recibidos) {
    aplicar(
      cirugia,
      () => registrarRecepcion(cirugia.id, { recibidos, usuario: USUARIO }),
      (c) => (resumenCanasta(c).estado === 'con-novedades'
        ? `Canasta de ${cirugia.paciente.nombre} recibida con novedades`
        : `Canasta de ${cirugia.paciente.nombre} recibida`),
    );
  }

  function handleAutorizar(cirugia) {
    aplicar(
      cirugia,
      () => autorizarInicioUrgencia(cirugia.id, { usuario: USUARIO }),
      () => `Inicio de ${cirugia.paciente.nombre} autorizado por urgencia`,
    );
  }

  function handleRegistrarConsumo(cirugia, usados) {
    aplicar(
      cirugia,
      () => registrarConsumo(cirugia.id, { usados, usuario: USUARIO }),
      () => `Consumo de ${cirugia.paciente.nombre} registrado`,
    );
  }

  function handleDeshacer() {
    const snapshot = toast?.snapshot;
    if (!snapshot) return;
    deshacerResolucion(snapshot);
    setCirugias((prev) => (prev ?? []).map((c) => (c.id === snapshot[0].id ? snapshot[0] : c)));
    window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  const esHoy = fecha === fechaISO(ahora);
  const salaLabel = SALA_OPTIONS.find((o) => o.value === salaId)?.label ?? salaId;

  // El header (sala/fecha) se muestra siempre, aun sin resultados -- si se
  // ocultara junto con el estado vacío, un día sin cirugías dejaría al usuario
  // sin forma de cambiar de sala/fecha.
  let cuerpo;
  if (cirugias === null) {
    cuerpo = <div className="cnc-estado" role="status">Cargando canastas…</div>;
  } else if (lista.length === 0) {
    cuerpo = (
      <div className="cnc-estado">
        <LuPackageSearch className="cnc-estado-icon" aria-hidden="true" />
        <p className="cnc-estado-text">No hay cirugías programadas en esta sala para esta fecha.</p>
      </div>
    );
  } else {
    cuerpo = (
      <>
        <div className="cnc-resumen">
          <CanastasKpis cirugias={lista} />
          <CanastaAlerta cirugias={lista} ahora={ahora} onVerificar={handleSelect} />
        </div>
        <div className="cnc-workspace">
          <CanastasLista
            titulo={esHoy ? 'Cirugías de hoy' : 'Cirugías del día'}
            subtitulo={`${lista.length} en ${salaLabel} · ordenadas por hora`}
            filtradas={filtradas}
            seleccionId={seleccion?.id ?? null}
            ahora={ahora}
            filtros={filtros}
            onFiltrosChange={(cambios) => setFiltros((f) => ({ ...f, ...cambios }))}
            onSelect={handleSelect}
          />
          {seleccion && (
            <CanastaDetalle
              cirugia={seleccion}
              draft={drafts[seleccion.id] ?? {}}
              error={error}
              onDraftChange={(patch) => handleDraftChange(seleccion.id, patch)}
              onRecibir={(recibidos) => handleRecibir(seleccion, recibidos)}
              onAutorizar={() => handleAutorizar(seleccion)}
              onRegistrarConsumo={(usados) => handleRegistrarConsumo(seleccion, usados)}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Canastas de cirugía"
          user={{ name: USUARIO, role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <div className="psc-page-header">
            <div>
              <h1>Canastas de cirugía</h1>
              <p>Verifica, recibe y legaliza los insumos de las cirugías de tu sala.</p>
            </div>
            <div className="psc-page-header-actions">
              <div className="cnc-sala-select">
                <FormSelect id="cnc-sala" ariaLabel="Sala" value={salaId} onChange={setSalaId} options={SALA_OPTIONS} />
              </div>
              <CanastasFechaNav fecha={fecha} onFechaChange={setFecha} />
              <Button variant="secondary-accent" icon={LuCalendarDays} onClick={() => router.push('/programacion-sala-cirugias')}>
                Ver agenda
              </Button>
            </div>
          </div>

          {cuerpo}
        </div>
      </div>

      <div className={`psc-toast cnc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast?.message}</span>
        {toast?.snapshot && (
          <button type="button" className="cnc-toast-undo" onClick={handleDeshacer}>Deshacer</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Eliminar los componentes reemplazados**

```bash
git rm -r src/Components/ProgramacionSalaCirugias/canastas/CanastasTable src/Components/ProgramacionSalaCirugias/canastas/CanastasFiltrosBar src/Components/ProgramacionSalaCirugias/canastas/ConfirmarRecepcionModal
```

Verificar que nada más los importa:

Run: `grep -rn "CanastasTable\|CanastasFiltrosBar\|ConfirmarRecepcionModal" src --include=*.jsx --include=*.js --include=*.css`
Expected: sin resultados (los comentarios históricos en `mockCirugiaData.js` que nombren `CanastasTable` se pueden dejar o ajustar; no son imports).

- [ ] **Step 10: Lint de toda la feature**

Run: `npx eslint src/Components/ProgramacionSalaCirugias src/hooks/ProgramacionSalaCirugias`
Expected: sin errores. Si el React Compiler marca algo en `CanastasCirugia.jsx`, corregirlo con `?.`/`??` (regla de la memoria del proyecto), no silenciar la regla.

- [ ] **Step 11: Verificación en el navegador**

Levantar el dev server en segundo plano (`npm run dev`) y comprobar `http://localhost:3000/programacion-sala-cirugias/canastas` responde 200. Luego el script de Playwright de la Task 7 cubre el recorrido completo; aquí basta confirmar que la página renderiza sin errores en consola:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:3000/programacion-sala-cirugias/canastas'); await p.waitForSelector('.cnc-cir-card');
  console.log('cards:', await p.locator('.cnc-cir-card').count(), 'errores:', errs);
  await b.close();
})();"
```
Expected: `cards: 5 errores: []`. (Si `require('playwright')` falla, ejecutar con `npx playwright` desde un script `.mjs` en el scratchpad o instalar `playwright` en el scratchpad; no agregarlo al proyecto.)

- [ ] **Step 12: Commit**

```bash
git add -A src/Components/ProgramacionSalaCirugias
git commit -m "feat(canastas): pantalla maestro-detalle con recepción, urgencia y consumo"
```

---

### Task 7: Verificación end-to-end, responsive y limpieza final

**Files:**
- Modify (solo si la verificación revela defectos): CSS/JSX de los componentes de `canastas/`.
- Crear en el scratchpad (NO en el repo): `verificar-canastas.mjs`.

**Interfaces:** consume todo lo anterior; no produce nada nuevo.

- [ ] **Step 1: Escribir el script de recorrido**

Crear `verificar-canastas.mjs` en el directorio scratchpad de la sesión (fuera del repo):

```js
import { chromium } from 'playwright';

const URL = 'http://localhost:3000/programacion-sala-cirugias/canastas';
const errores = [];
const b = await chromium.launch();

async function pagina(ancho, alto) {
  const p = await b.newPage({ viewport: { width: ancho, height: alto } });
  p.on('pageerror', (e) => errores.push(`[${ancho}] ${e.message}`));
  p.on('console', (m) => m.type() === 'error' && errores.push(`[${ancho}] ${m.text()}`));
  await p.goto(URL);
  await p.waitForSelector('.cnc-cir-card');
  return p;
}
const paso = (msg) => console.log('✔', msg);
const card = (p, nombre) => p.locator('.cnc-cir-card', { hasText: nombre });

// ---- Desktop 1440 ----
let p = await pagina(1440, 900);
paso(`5 tarjetas: ${await p.locator('.cnc-cir-card').count()}`);
await p.screenshot({ path: 'canastas-1440-inicial.png' });

// Despachada: verificar todo, bajar 1 gasa → "Recibir con novedades"
await card(p, 'Juan Rodríguez').click();
await p.getByRole('button', { name: 'Marcar todos' }).click();
await p.getByRole('button', { name: 'Disminuir recibido de Malla de polipropileno' }).click().catch(() => {});
await p.getByRole('button', { name: /Recibir con novedades|Confirmar recepción completa/ }).click();
await p.waitForSelector('.psc-toast.show');
paso(`toast: ${await p.locator('.psc-toast').innerText()}`);
await p.getByRole('button', { name: 'Deshacer' }).click();
paso('deshacer restaura la canasta despachada');

// Urgencia: autorizar
await card(p, 'Andrés Mejía').click();
await p.getByRole('button', { name: 'Autorizar inicio por urgencia' }).click();
await p.waitForSelector('.cnc-banner-violet');
paso('urgencia autorizada (banner violeta)');

// Realizada: consumo y devolución
await card(p, 'Sofía Restrepo').click();
await p.getByRole('button', { name: 'Disminuir usado de Gasas estériles' }).click();
await p.getByRole('button', { name: 'Registrar consumo y devolución' }).click();
await p.waitForSelector('.cnc-banner-neutral');
paso('consumo registrado (banner neutral)');
await p.screenshot({ path: 'canastas-1440-consumo.png' });
await p.close();

// ---- Tablet 1194 ----
p = await pagina(1194, 834);
await card(p, 'Juan Rodríguez').click();
const botonStepper = await p.locator('.cnc-stepper button').first().boundingBox();
paso(`stepper táctil: ${botonStepper.width}×${botonStepper.height} (esperado 44×44)`);
paso(`novedad en columna oculta: ${await p.locator('.cnc-col-nov').first().isHidden()}`);
paso(`sin scroll horizontal: ${await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)}`);
await p.screenshot({ path: 'canastas-1194.png' });

console.log(errores.length ? `ERRORES:\n${errores.join('\n')}` : 'sin errores de consola');
await b.close();
```

- [ ] **Step 2: Ejecutar el recorrido**

Con el dev server corriendo: `node verificar-canastas.mjs` (desde el directorio del scratchpad, con `playwright` resoluble; si no, `npx playwright` no basta para un script — instalar `playwright` **en el scratchpad**, no en el proyecto).
Expected: todas las líneas con ✔, stepper `44×44`, columna de novedad oculta en 1194, sin scroll horizontal y "sin errores de consola".

- [ ] **Step 3: Revisar las capturas**

Abrir `canastas-1440-inicial.png`, `canastas-1440-consumo.png` y `canastas-1194.png` y comparar contra los artboards `Desktop.dc.html` (1440) y `Main.dc.html` (1194): lista + detalle lado a lado, KPIs en una fila (alerta como 5.ª celda en 1440 y fila propia arriba en 1194), banners con color por estado, footer fijo abajo. Anotar diferencias y corregirlas en el CSS del componente correspondiente (nunca hex sueltos: tokens).

- [ ] **Step 4: Casos de teclado y accesibilidad rápidos**

En el mismo navegador (o un script corto): Tab llega a cada tarjeta y a los botones OK/− /+ con foco visible; `Enter`/`Space` selecciona una tarjeta; el botón "Confirmar recepción" está `disabled` hasta verificar todos; los `aria-label` de los steppers incluyen el nombre del insumo. Corregir lo que falle.

- [ ] **Step 5: Regresión de las pantallas que comparten el mock**

Run: `npm test` y `npx eslint src`
Expected: tests ok; ESLint sin errores en todo el árbol.

Luego abrir `/programacion-sala-cirugias` (agenda) y su `DetalleCirugiaPanel` → pestaña Insumos de una cirugía con canasta: "Pedir insumos", "Registrar entrega" y "Devolver insumos" siguen funcionando, y una devolución creada desde Canastas (consumo de `12353`) aparece en la ventana "Devoluciones en Cirugías".

- [ ] **Step 6: Commit de ajustes (si los hubo) y cierre**

```bash
git add -A src
git commit -m "fix(canastas): ajustes de verificación responsive y accesibilidad"
```
(Omitir si no hubo cambios.) Con todo verde, invocar `superpowers:finishing-a-development-branch` para decidir la integración de `feat/canastas-maestro-detalle`.

---

## Self-review del plan contra el spec

- **Modelo (campos, estado derivado, `bloqueoInicio`, gate):** Task 1. **Acciones** (`registrarRecepcion`, `despacharCanasta`, `autorizarInicioUrgencia`, `registrarConsumo`, `registrarEntregaInsumos`): Task 3. **`fetchCanastasDia` con realizadas y semilla de 5 casos:** Task 2. **Reutilización de `guardarDevolucion` y `DevolucionesCirugiaModal` intacto:** Task 3 (+ regresión en Task 7 Step 5).
- **UI:** los 8 componentes del spec están en Tasks 5–6 (`CanastasKpis`, `CanastaAlerta`, `CanastasLista`, `CirugiaCard`, `CanastaDetalle`, `RecepcionTab`, `ConsumoTab`, más `CanastasFechaNav` por el traslado al header). Retiro de `CanastasTable`/`CanastasFiltrosBar`/`ConfirmarRecepcionModal`: Task 6 Step 9. Navegador de fecha al header: Task 6 Steps 1 y 8.
- **Reglas de UI:** confirmar solo con todos los OK, "Recibir con novedades", tope `[0, despachado]`, autorizar solo urgencias, consumo deshabilitado hasta `realizada`, errores en `role="alert"`: Tasks 5–6. Borradores por cirugía: Task 6 Step 8 (`drafts`).
- **Responsive (≤1024 / lista 410 vs 460 / 44px / novedad bajo el nombre):** `shared.css` (Task 5), `CanastasLista.css` (Task 6), `CanastasCirugia.css` (grid del resumen); verificado en Task 7.
- **Verificación:** unit tests de las reglas puras (Tasks 1–4), ESLint (Tasks 3, 5, 6, 7), Playwright de los 5 casos a 1440 y 1194 con verificación de la devolución (Task 7).
- **Consistencia de nombres:** `resumenCanasta().estado` ∈ los 6 valores usados en `CANASTA_ESTADO_LABEL`, `CANASTA_META`, `CANASTA_FARMACIA_LABEL`; `gateCirugia` ∈ los valores de `GATE_META` (+ `'no-aplica'`, para el que `GATE_META[gate]` es `undefined` y `CirugiaCard` no renderiza badge); `draft` usa `tab`/`ok`/`recibido`/`usado` de forma idéntica en `CanastaDetalle`, `RecepcionTab`, `ConsumoTab` y el orquestador; `onDraftChange(patch)` recibe parches parciales.
