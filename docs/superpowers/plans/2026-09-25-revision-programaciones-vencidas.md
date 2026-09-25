# Revisión de programaciones vencidas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nueva subruta `/programacion-sala-cirugias/revision` que lista las cirugías en estado `programada` con fecha anterior a hoy, clasificadas por tipo de inconsistencia, con acciones individuales y en lote para cerrarlas, más un banner de aviso en la agenda.

**Architecture:** Lógica pura (clasificar/filtrar/ordenar/paginar) en un módulo sin dependencias bajo `src/hooks/ProgramacionSalaCirugias/`, mutaciones en el mock existente. Componentes presentacionales bajo `src/Components/ProgramacionSalaCirugias/revision/`, un orquestador `RevisionVencidas` que tiene todo el estado (filtros, orden, página, selección, modal, toast) y reusa `CancelarCirugiaModal`/`ReprogramarCirugiaModal`.

**Tech Stack:** Next.js 16 (App Router), React, CSS global por componente + CSS Modules de los componentes app-wide (`Button`, `Badge`, `DropdownMenu`), `react-icons/lu`.

**Spec:** `docs/superpowers/specs/2026-09-25-revision-programaciones-vencidas-design.md`

**Desvíos deliberados respecto del spec** (detectados al leer el código, no cambian el comportamiento):
- `clasificarInconsistencia` vive en `revisionVencidas.js` junto a filtrar/ordenar/paginar (todo lógica pura de la misma pantalla) en vez de un archivo propio, y el mock NO lo importa: así el módulo puro se puede probar con `node` sin resolver imports sin extensión.
- El filtro de Sala usa `FormSelect` en vez de `FilterDropdown`: esta feature no define las clases `.filters-more-btn`/`.filter-popover` que `FilterDropdown` necesita, y `FormSelect` es el estándar del proyecto para selects de filtros de header.

## Global Constraints

- Un componente = una carpeta con `Nombre.jsx` + `Nombre.css`; el `.jsx` importa su `.css` (AGENTS.md "Component organization").
- Lógica no visual solo en `src/hooks/ProgramacionSalaCirugias/`.
- Botones con `@/Components/Button/Button`, badges con `@/Components/Badge/Badge`, menú "⋯" con `@/Components/DropdownMenu/DropdownMenu`, header de modal con `@/Components/ModalHeader/ModalHeader`, selects con `@/Components/FormSelect/FormSelect` (`onChange` recibe el value, no un evento).
- Íconos solo de `react-icons/lu`; nunca `<svg>` a mano.
- `font-size` solo con `var(--fs-*)`, `font-weight` solo con `var(--fw-*)`; títulos en `--fw-semibold`, cifras KPI en `--fw-bold`.
- `<th>` de tabla: `var(--th-fs)`/`var(--th-fw)`/`var(--th-color)`, fondo `var(--table-header-bg)`, sticky con `z-index:var(--z-sticky)`, padding horizontal igual al del `td`; columnas numéricas con la misma clase de alineación en `th` y `td`.
- Colores solo con tokens del `:root` de `ProgramacionSalaCirugias.css` (nunca hex nuevo, nunca `#fff`: usar `var(--surface)`).
- `@media` solo con 768/1024/1440px.
- Textos de UI en español, exactamente como están en este plan.
- Sin suite de tests en el proyecto: la lógica pura se verifica con scripts `node` ad-hoc (no se commitean); la UI con `npx eslint <archivos>` + `curl` al dev server + verificación manual.

---

### Task 1: Lógica pura + datos mock

**Files:**
- Create: `src/hooks/ProgramacionSalaCirugias/revisionVencidas.js`
- Modify: `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js` (semilla tras el array `CIRUGIAS`, `cancelarCirugia`, funciones nuevas al final)

**Interfaces:**
- Produces (`revisionVencidas.js`):
  - `INCONSISTENCIAS: { [tipo]: { id, label, hint, tone, prioridad } }` con tipos `'insumos' | 'trasladado' | 'sin-actividad'`
  - `INCONSISTENCIA_ORDEN: ['insumos', 'trasladado', 'sin-actividad']`
  - `clasificarInconsistencia(cirugia) → tipo`
  - `contarPorTipo(cirugias) → { total, insumos, trasladado, 'sin-actividad' }`
  - `filtrarVencidas(cirugias, { tipo, salaId, busqueda, desde, hasta }) → cirugias` (`tipo`/`salaId` usan `'todas'` como "sin filtro"; `desde`/`hasta` ISO o `''`)
  - `ordenarVencidas(cirugias, orden) → cirugias` (`orden = null | { columna: 'inconsistencia'|'paciente'|'fecha'|'sala'|'duracion', direccion: 'asc'|'desc' }`)
  - `duracionMin(cirugia) → number`
  - `antiguedadLabel(fechaISO, hoyISO) → string`
  - `paginar(items, pagina, porPagina) → items`
- Produces (`mockCirugiaData.js`):
  - `fetchVencidas({ hoy }) → Promise<cirugia[]>` (registros crudos, sin campo de tipo)
  - `marcarRealizadas(ids) → snapshot` · `marcarIncumplidas(ids, { causal, observacion }) → snapshot` · `deshacerResolucion(snapshot) → void` (`snapshot` = array de registros previos)
  - Campos nuevos en registros: `numeroProgramacion`, `consecutivo`, `traslado: { numeroAdmision } | null`, `farmacia.resolucionInsumos: 'consumido' | 'devolucion'`

- [ ] **Step 1: Escribir el script de verificación de la lógica pura (debe fallar)**

Ejecutar desde la raíz del repo (Git Bash):

```bash
node --input-type=module <<'EOF'
import assert from 'node:assert/strict';
import * as r from './src/hooks/ProgramacionSalaCirugias/revisionVencidas.js';

const base = { paciente: { nombre: 'PEREZ, ANA', documento: 'CC 1' }, salaId: 'qx-1', fecha: '2022-09-02', horaInicio: '07:00', horaFin: '07:20' };
const trasladada = { ...base, id: 'a', traslado: { numeroAdmision: '0200000627' }, farmacia: { numeroPedido: '1' } };
const conPedido = { ...base, id: 'b', traslado: null, farmacia: { numeroPedido: '2' }, fecha: '2022-09-03' };
const sinNada = { ...base, id: 'c', traslado: null, farmacia: null, salaId: 'gastroenterologia', paciente: { nombre: 'ZAPATA, LUIS', documento: 'CC 998' }, numeroProgramacion: '5617' };

assert.equal(r.clasificarInconsistencia(trasladada), 'trasladado');
assert.equal(r.clasificarInconsistencia(conPedido), 'insumos');
assert.equal(r.clasificarInconsistencia(sinNada), 'sin-actividad');
assert.deepEqual(r.contarPorTipo([trasladada, conPedido, sinNada]), { total: 3, insumos: 1, trasladado: 1, 'sin-actividad': 1 });

const todas = [sinNada, trasladada, conPedido];
const F = { tipo: 'todas', salaId: 'todas', busqueda: '', desde: '', hasta: '' };
assert.equal(r.filtrarVencidas(todas, F).length, 3);
assert.deepEqual(r.filtrarVencidas(todas, { ...F, tipo: 'insumos' }).map((c) => c.id), ['b']);
assert.deepEqual(r.filtrarVencidas(todas, { ...F, salaId: 'gastroenterologia' }).map((c) => c.id), ['c']);
assert.deepEqual(r.filtrarVencidas(todas, { ...F, busqueda: '5617' }).map((c) => c.id), ['c']);
assert.deepEqual(r.filtrarVencidas(todas, { ...F, busqueda: 'zapata' }).map((c) => c.id), ['c']);
assert.deepEqual(r.filtrarVencidas(todas, { ...F, desde: '2022-09-03' }).map((c) => c.id), ['b']);
assert.deepEqual(r.filtrarVencidas(todas, { ...F, hasta: '2022-09-02' }).map((c) => c.id).sort(), ['a', 'c']);

assert.deepEqual(r.ordenarVencidas(todas, null).map((c) => c.id), ['b', 'a', 'c']);
assert.deepEqual(r.ordenarVencidas(todas, { columna: 'paciente', direccion: 'asc' }).map((c) => c.id), ['a', 'b', 'c']);
assert.deepEqual(r.ordenarVencidas(todas, { columna: 'paciente', direccion: 'desc' }).map((c) => c.id)[0], 'c');
assert.equal(todas[0].id, 'c', 'ordenarVencidas no debe mutar el array de entrada');

assert.equal(r.duracionMin(base), 20);
assert.equal(r.duracionMin({ horaInicio: '23:30', horaFin: '00:30' }), 60);
assert.equal(r.antiguedadLabel('2022-09-02', '2026-09-25'), 'vencida hace 4 años');
assert.equal(r.antiguedadLabel('2026-07-25', '2026-09-25'), 'vencida hace 2 meses');
assert.equal(r.antiguedadLabel('2026-09-20', '2026-09-25'), 'vencida hace 5 días');
assert.equal(r.antiguedadLabel('2026-09-24', '2026-09-25'), 'vencida hace 1 día');
assert.deepEqual(r.paginar([1, 2, 3, 4, 5], 2, 2), [3, 4]);
console.log('OK revisionVencidas');
EOF
```

- [ ] **Step 2: Correrlo y confirmar que falla**

Expected: `ERR_MODULE_NOT_FOUND` (el archivo no existe todavía).

- [ ] **Step 3: Crear `src/hooks/ProgramacionSalaCirugias/revisionVencidas.js`**

```js
// Lógica pura de "Revisión de programaciones vencidas" (ver spec
// 2026-09-25-revision-programaciones-vencidas-design.md): cirugías en estado
// 'programada' con fecha anterior a hoy. Sin imports a propósito -- ni
// siquiera de mockCirugiaData.js -- para poder verificarla con `node` suelto
// y para que el mock no dependa de la pantalla.

// `prioridad` define el orden por defecto del listado: primero lo más costoso
// de dejar abierto (insumos pedidos que nadie usó ni devolvió).
export const INCONSISTENCIAS = {
  insumos: {
    id: 'insumos', label: 'Insumos comprometidos', hint: 'Pedido de insumos sin traslado a cirugía', tone: 'danger', prioridad: 0,
  },
  trasladado: {
    id: 'trasladado', label: 'Trasladado sin cierre', hint: 'Paciente trasladado, falta cerrar la programación', tone: 'info', prioridad: 1,
  },
  'sin-actividad': {
    id: 'sin-actividad', label: 'Sin actividad', hint: 'Sin pedido ni traslado registrados', tone: 'neutral', prioridad: 2,
  },
};

export const INCONSISTENCIA_ORDEN = ['insumos', 'trasladado', 'sin-actividad'];

// Se evalúa en orden, gana la primera regla que cumple: un traslado implica
// que el paciente llegó a cirugía aunque también tenga pedido de insumos.
export function clasificarInconsistencia(cirugia) {
  if (cirugia.traslado) return 'trasladado';
  if (cirugia.farmacia?.numeroPedido) return 'insumos';
  return 'sin-actividad';
}

export function contarPorTipo(cirugias) {
  const conteo = {
    total: cirugias.length, insumos: 0, trasladado: 0, 'sin-actividad': 0,
  };
  cirugias.forEach((c) => { conteo[clasificarInconsistencia(c)] += 1; });
  return conteo;
}

export function filtrarVencidas(cirugias, {
  tipo = 'todas', salaId = 'todas', busqueda = '', desde = '', hasta = '',
}) {
  const q = busqueda.trim().toLowerCase();
  return cirugias.filter((c) => {
    if (tipo !== 'todas' && clasificarInconsistencia(c) !== tipo) return false;
    if (salaId !== 'todas' && c.salaId !== salaId) return false;
    if (desde && c.fecha < desde) return false;
    if (hasta && c.fecha > hasta) return false;
    if (q) {
      const texto = [c.paciente.nombre, c.paciente.documento, c.numeroProgramacion ?? c.id, c.consecutivo ?? '']
        .join(' ').toLowerCase();
      if (!texto.includes(q)) return false;
    }
    return true;
  });
}

function minutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Módulo 1440: una cirugía que cruza la medianoche (calcularHoraFin en el mock
// no rueda de día) igual da una duración positiva.
export function duracionMin(cirugia) {
  return (minutos(cirugia.horaFin) - minutos(cirugia.horaInicio) + 1440) % 1440;
}

const COMPARADORES = {
  inconsistencia: (a, b) => INCONSISTENCIAS[clasificarInconsistencia(a)].prioridad
    - INCONSISTENCIAS[clasificarInconsistencia(b)].prioridad,
  paciente: (a, b) => a.paciente.nombre.localeCompare(b.paciente.nombre, 'es'),
  fecha: (a, b) => `${a.fecha}T${a.horaInicio}`.localeCompare(`${b.fecha}T${b.horaInicio}`),
  sala: (a, b) => a.salaId.localeCompare(b.salaId, 'es'),
  duracion: (a, b) => duracionMin(a) - duracionMin(b),
};

// `orden` null = orden por defecto del spec (prioridad de tipo, luego la más
// antigua primero). Con columna elegida, la fecha desempata.
export function ordenarVencidas(cirugias, orden) {
  const copia = [...cirugias];
  if (!orden) {
    return copia.sort((a, b) => COMPARADORES.inconsistencia(a, b) || COMPARADORES.fecha(a, b));
  }
  const signo = orden.direccion === 'desc' ? -1 : 1;
  return copia.sort((a, b) => signo * COMPARADORES[orden.columna](a, b) || COMPARADORES.fecha(a, b));
}

export function antiguedadLabel(fechaISO, hoyISO) {
  const dias = Math.round((new Date(`${hoyISO}T00:00:00`) - new Date(`${fechaISO}T00:00:00`)) / 86400000);
  if (dias < 1) return 'vencida hoy';
  if (dias === 1) return 'vencida hace 1 día';
  if (dias < 30) return `vencida hace ${dias} días`;
  if (dias < 365) {
    const meses = Math.floor(dias / 30);
    return meses === 1 ? 'vencida hace 1 mes' : `vencida hace ${meses} meses`;
  }
  const anios = Math.floor(dias / 365);
  return anios === 1 ? 'vencida hace 1 año' : `vencida hace ${anios} años`;
}

export function paginar(items, pagina, porPagina) {
  const inicio = (pagina - 1) * porPagina;
  return items.slice(inicio, inicio + porPagina);
}
```

- [ ] **Step 4: Correr el script del Step 1**

Expected: `OK revisionVencidas` (un warning `MODULE_TYPELESS_PACKAGE_JSON` en stderr es normal).

- [ ] **Step 5: Escribir el script de verificación del mock (debe fallar)**

```bash
node --input-type=module <<'EOF'
import assert from 'node:assert/strict';
import * as m from './src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js';

const hoy = '2026-09-25';
const vencidas = await m.fetchVencidas({ hoy });
assert.ok(vencidas.length >= 43, `esperaba >= 43 vencidas, hubo ${vencidas.length}`);
assert.ok(vencidas.every((c) => c.estado === 'programada' && c.fecha < hoy));
const v5617 = vencidas.find((c) => c.id === 'v-5617');
assert.equal(v5617.traslado.numeroAdmision, '0200000627');
assert.equal(v5617.consecutivo, '0200000042');
assert.equal(v5617.horaFin, '07:40');
const v5744 = vencidas.find((c) => c.id === 'v-5744');
assert.equal(v5744.traslado, null);
assert.ok(v5744.farmacia.numeroPedido);

const snap = m.marcarRealizadas(['v-5744']);
assert.equal(snap[0].estado, 'programada');
let despues = await m.fetchVencidas({ hoy });
assert.ok(!despues.some((c) => c.id === 'v-5744'));
m.deshacerResolucion(snap);
despues = await m.fetchVencidas({ hoy });
assert.ok(despues.some((c) => c.id === 'v-5744'));

const snap2 = m.marcarIncumplidas(['v-5744', 'v-5620'], { causal: '23', observacion: 'x' });
assert.equal(snap2.length, 2);
const tras = await m.fetchVencidas({ hoy });
assert.ok(!tras.some((c) => c.id === 'v-5744' || c.id === 'v-5620'));
m.deshacerResolucion(snap2);

const cancelada = m.cancelarCirugia('v-5744', 'motivo');
assert.equal(cancelada.farmacia.resolucionInsumos, 'devolucion');
console.log('OK mock');
EOF
```

- [ ] **Step 6: Correrlo y confirmar que falla**

Expected: `TypeError: m.fetchVencidas is not a function`.

- [ ] **Step 7: Agregar la semilla de vencidas al mock**

En `src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`, insertar inmediatamente después del `];` que cierra `let CIRUGIAS = [` (la línea anterior a `let nextIdSeq = 12353;`):

```js
// Semilla de "Revisión de programaciones vencidas" (spec 2026-09-25):
// transcripción de la captura del sistema legado "Listado de Programaciones
// - Revisión" (mismos No. programación/consecutivo/sala/fecha/hora/duración/
// pedido/admisión/paciente), sin la fila "PACIENTE DE PRUEBAS". Todas quedan
// en 'programada' con fecha de 2022, así que fetchVencidas las devuelve.
// Tupla: [No. programación, consecutivo, salaId, fecha, hora inicio,
// duración (min), tiene pedido de inventario, No. admisión | null,
// Id. afiliado, "APELLIDOS, NOMBRES"].
const VENCIDAS_LEGACY = [
  [5584, '0200000009', 'gastroenterologia', '2022-09-01', '10:05', 20, false, '0200000005', '15042902', 'ALVARADO CARDOZO, NAUN DE JESUS'],
  [5591, '0200000016', 'gastroenterologia', '2022-09-01', '10:25', 20, false, '0200000006', '30563036', 'MONTES RIVERA, RUTH MARIA'],
  [5576, '0200000001', 'gastroenterologia', '2022-09-02', '07:00', 20, false, '0200000648', '30567236', 'JIMENEZ MARTINEZ, ARGELIA MARIA'],
  [5617, '0200000042', 'gastroenterologia', '2022-09-02', '07:20', 20, true, '0200000627', '98598507', 'HERNANDEZ MENDEZ, FILADELFO MIGUEL'],
  [5620, '0200000045', 'gastroenterologia', '2022-09-02', '07:40', 20, false, null, '45443416', 'COGOLLO PORTILLO, LUZ ESTER'],
  [5621, '0200000046', 'gastroenterologia', '2022-09-02', '08:00', 20, false, null, '15015206', 'TORDECILLA CORREA, JOSE MARIA'],
  [5624, '0200000049', 'gastroenterologia', '2022-09-02', '08:40', 20, true, '0200000601', '1007535893', 'PACHECO MESTRA, ANDREA CAROLINA'],
  [5577, '0200000002', 'gastroenterologia', '2022-09-02', '14:00', 20, true, '0200000858', '34956054', 'URANGO VILLALBA, CARMEN ALICIA'],
  [5579, '0200000004', 'gastroenterologia', '2022-09-02', '14:20', 20, true, '0200000881', '25988394', 'SEÑA RICARDO, CEVERINA SEGUNDA'],
  [5581, '0200000006', 'gastroenterologia', '2022-09-02', '14:40', 20, true, '0200000933', '30671061', 'PAYARES HERNANDEZ, GRISAIDA CARMEN'],
  [5582, '0200000007', 'gastroenterologia', '2022-09-02', '15:00', 20, true, '0200000877', '26039243', 'HERNANDEZ GOMEZ, LUCINA DEL SOCORRO'],
  [5583, '0200000008', 'gastroenterologia', '2022-09-02', '15:20', 20, true, '0200000872', '34959829', 'GARAVITO VARGAS, ANA FELISA'],
  [5640, '0200000064', 'gastroenterologia', '2022-09-02', '15:40', 20, false, null, '26037063', 'TABORDA GARAY, ADIS ESTHER'],
  [5641, '0200000065', 'gastroenterologia', '2022-09-02', '16:00', 20, false, null, '6884333', 'BUELVAS BERROCAL, JOSE LUIS'],
  [5642, '0200000066', 'gastroenterologia', '2022-09-02', '16:20', 20, false, '0200000848', '50892332', 'JIMENEZ CORREA, DAIRA ELENA'],
  [5644, '0200000068', 'gastroenterologia', '2022-09-02', '17:00', 20, false, null, '34991821', 'VERGARA SERPA, DIANA MARGARITA'],
  [5645, '0200000069', 'gastroenterologia', '2022-09-02', '17:20', 20, false, null, '34986661', 'WILCHEZ GALEANO, SARA REBECA'],
  [5585, '0200000010', 'gastroenterologia', '2022-09-03', '07:00', 20, false, null, '15041717', 'MONTALVO GUERRA, MANUEL FRANCISCO'],
  [5627, '0200000052', 'qx-1', '2022-09-03', '07:00', 60, false, null, '73078260', 'SANCHEZ CALVO, ALVARO ENRIQUE'],
  [5586, '0200000011', 'gastroenterologia', '2022-09-03', '07:20', 20, false, '0200000968', '10985069', 'NUÑEZ, MANUEL FELIPE'],
  [5587, '0200000012', 'gastroenterologia', '2022-09-03', '07:40', 20, false, null, '25762818', 'GALVAN LOPEZ, AMADA ROSA'],
  [5588, '0200000013', 'gastroenterologia', '2022-09-03', '08:00', 20, false, null, '1067938627', 'SUAREZ RUBIO, DANYS MAILER'],
  [5589, '0200000014', 'gastroenterologia', '2022-09-03', '08:20', 20, false, '0200000972', '25956001', 'MORATO SIERRA, GLADYS'],
  [5590, '0200000015', 'gastroenterologia', '2022-09-03', '08:40', 20, false, null, '1104258526', 'PATERNINA VERGARA, IVAN ANDRES'],
  [5592, '0200000017', 'gastroenterologia', '2022-09-03', '09:00', 20, false, null, '1067885903', 'LOPEZ MORON, YODIS'],
  [5593, '0200000018', 'gastroenterologia', '2022-09-03', '09:20', 20, false, null, '50880944', 'HERNANDEZ MEJIA, FANNY'],
  [5594, '0200000019', 'gastroenterologia', '2022-09-03', '09:40', 20, false, '0200000971', '15663747', 'ALVAREZ BELTRAN, SERVIO AUGUSTO'],
  [5648, '0200000072', 'gastroenterologia', '2022-09-03', '10:00', 20, false, null, '1072526353', 'CAICEDO JULIO, ESPERANZA EDITH'],
  [5649, '0200000073', 'gastroenterologia', '2022-09-03', '10:20', 20, false, '0200000973', '1137975838', 'VERGARA ESCUDERO, MARIA ELIZABETH'],
  [5736, '0200000160', 'qx-1', '2022-09-03', '18:00', 60, false, null, '1104256622', 'MONTERROSA PEREZ, MARIA ALEJANDRA'],
  [5744, '0200000168', 'qx-1', '2022-09-04', '07:00', 60, true, null, '7486686', 'ATENCIO ARRIETA, MIGUEL'],
  [5725, '0200000149', 'qx-1', '2022-09-05', '00:00', 60, false, null, '1579842', 'GUERRA MARTINEZ, MANUEL DEL CRISTO'],
  [5726, '0200000150', 'qx-1', '2022-09-05', '01:00', 60, false, null, '15072173', 'CORREA BABILONIA, GABRIEL'],
  [5727, '0200000151', 'qx-1', '2022-09-05', '02:00', 40, false, null, '2823314', 'VIDAL RODRIGUEZ, GUALBERTO JOSE'],
  [5728, '0200000152', 'qx-1', '2022-09-05', '02:40', 40, true, null, '1065380090', 'MORELO FERNANDEZ, SHAROL LUCIA'],
  [5729, '0200000153', 'qx-1', '2022-09-05', '03:20', 40, true, null, '1062538007', 'BERROCAL PAYARES, PAULINA'],
  [5730, '0200000154', 'qx-1', '2022-09-05', '04:00', 40, true, null, '1041271202', 'HERNANDEZ MARTINEZ, ALEXANDRA'],
  [5731, '0200000155', 'qx-1', '2022-09-05', '04:40', 40, true, null, '1064797597', 'SUAREZ HERNANDEZ, MARIA ALEJANDRA'],
  [5743, '0200000167', 'qx-2', '2022-09-05', '05:00', 60, true, null, '6878270', 'ARIZA MEZA, JAIME ALFONSO'],
  [5694, '0200000118', 'qx-1', '2022-09-05', '06:00', 60, true, null, '33173971', 'OTERO PADILLA, RUBBY ESTHER'],
  [5738, '0200000162', 'qx-2', '2022-09-05', '06:00', 120, false, null, '26057070', 'RIVERA DE PRADO, CLEOTILDE DEL CARMEN'],
  [5595, '0200000020', 'gastroenterologia', '2022-09-05', '07:00', 20, false, null, '11330499', 'NADER SIMONDS, ALBERTO AGUSTIN DEMETRIO'],
  [5706, '0200000130', 'qx-1', '2022-09-05', '07:00', 60, false, null, '50954877', 'CASTILLO IBARRA, LOURDES PETRONA'],
];

// Procedimiento/cirujano/medicamentos por sala: la captura legada no los
// muestra, se asigna uno representativo por sala para que el detalle de
// insumos y los modales de cancelar/reprogramar tengan datos.
const BASE_VENCIDA_POR_SALA = {
  gastroenterologia: {
    procedimiento: 'Esofagogastroduodenoscopia',
    servicio: 'Gastroenterología',
    cirujano: 'Dr. Andrés López',
    medicamentos: [{ nombre: 'Propofol', dosis: '200mg IV' }, { nombre: 'Lidocaína spray', dosis: '10%' }],
  },
  'qx-1': {
    procedimiento: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    cirujano: 'Dr. Juan García',
    medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
  },
  'qx-2': {
    procedimiento: 'Herniorrafia inguinal',
    servicio: 'Cirugía general',
    cirujano: 'Dr. Carlos Martínez',
    medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
  },
};

function vencidaLegacy([
  numeroProgramacion, consecutivo, salaId, fecha, horaInicio, duracionMin, conPedido, numeroAdmision, idAfiliado, nombre,
]) {
  const base = BASE_VENCIDA_POR_SALA[salaId];
  return {
    id: `v-${numeroProgramacion}`,
    sedeId: '02',
    salaId,
    numeroProgramacion: String(numeroProgramacion),
    consecutivo,
    paciente: { nombre, documento: `CC ${idAfiliado}` },
    procedimientoPrincipal: base.procedimiento,
    servicio: base.servicio,
    tipoCirugia: 'Programada',
    cirujano: base.cirujano,
    fecha,
    horaInicio,
    horaFin: calcularHoraFin(horaInicio, duracionMin),
    estado: 'programada',
    procedimientos: [{
      nombre: base.procedimiento, tipo: 'principal', duracionMin, notas: '',
    }],
    personal: [{ rol: 'Cirujano', nombre: base.cirujano }],
    equipos: [],
    canasta: { nombre: 'Sin canasta asignada', items: [] },
    farmacia: conPedido ? {
      numeroPedido: `PED-${consecutivo.slice(-4)}`,
      estado: 'listo',
      fechaSolicitud: `${fecha}T06:00`,
      medicamentos: base.medicamentos.map((med) => ({ ...med })),
    } : null,
    traslado: numeroAdmision ? { numeroAdmision } : null,
  };
}

CIRUGIAS = [...CIRUGIAS, ...VENCIDAS_LEGACY.map(vencidaLegacy)];
```

(`calcularHoraFin` y `pad2` son declaraciones `function`, hoisteadas: se pueden usar acá aunque estén definidas más abajo.)

- [ ] **Step 8: Hacer que cancelar marque los insumos para devolución**

Reemplazar la función `cancelarCirugia` al final de `mockCirugiaData.js`:

```js
export function cancelarCirugia(id, motivo) {
  const actual = CIRUGIAS.find((c) => c.id === id);
  return actualizarCirugia(id, {
    estado: 'cancelada',
    motivoCancelacion: motivo,
    farmacia: conResolucionInsumos(actual, 'devolucion'),
  });
}
```

- [ ] **Step 9: Agregar las funciones de revisión al final de `mockCirugiaData.js`**

```js
// ---------- Revisión de programaciones vencidas (spec 2026-09-25) ----------

// Registros crudos: la clasificación por tipo la hace revisionVencidas.js en
// la pantalla, así el mock no depende de ella.
export function fetchVencidas({ hoy }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CIRUGIAS.filter((c) => c.estado === 'programada' && c.fecha < hoy));
    }, 250);
  });
}

// Qué pasa con el pedido de insumos al cerrar la programación: realizada ->
// 'consumido'; incumplida/cancelada -> 'devolucion'. Solo una marca en el
// mock, sin integración real con inventario (fuera de alcance del spec).
function conResolucionInsumos(cirugia, resolucion) {
  if (!cirugia?.farmacia?.numeroPedido) return cirugia?.farmacia;
  return { ...cirugia.farmacia, resolucionInsumos: resolucion };
}

// Devuelve los registros tal como estaban antes del cambio: es el snapshot
// que usa "Deshacer" (ver deshacerResolucion).
function resolverVarias(ids, cambios) {
  const snapshot = CIRUGIAS.filter((c) => ids.includes(c.id));
  CIRUGIAS = CIRUGIAS.map((c) => (ids.includes(c.id) ? { ...c, ...cambios(c) } : c));
  return snapshot;
}

export function marcarRealizadas(ids) {
  return resolverVarias(ids, (c) => ({
    estado: 'realizada',
    farmacia: conResolucionInsumos(c, 'consumido'),
  }));
}

export function marcarIncumplidas(ids, { causal, observacion = '' }) {
  return resolverVarias(ids, (c) => ({
    estado: 'incumplida',
    causalIncumplimiento: causal,
    observacionIncumplimiento: observacion,
    farmacia: conResolucionInsumos(c, 'devolucion'),
  }));
}

export function deshacerResolucion(snapshot) {
  const previos = new Map(snapshot.map((c) => [c.id, c]));
  CIRUGIAS = CIRUGIAS.map((c) => previos.get(c.id) ?? c);
}
```

- [ ] **Step 10: Correr los dos scripts (Step 1 y Step 5)**

Expected: `OK revisionVencidas` y `OK mock`.

- [ ] **Step 11: Lint**

Run: `npx eslint src/hooks/ProgramacionSalaCirugias/revisionVencidas.js src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`
Expected: sin errores.

- [ ] **Step 12: Commit**

```bash
git add src/hooks/ProgramacionSalaCirugias/revisionVencidas.js src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js
git commit -m "feat(sala-cirugias): datos y lógica de revisión de programaciones vencidas"
```

---

### Task 2: Componentes presentacionales de la revisión

Todos son "tontos": reciben datos y callbacks, no llaman al mock (salvo catálogos/formatters). Se verifican con lint en esta task y en pantalla en la Task 3.

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/revision/InconsistenciaBadge/InconsistenciaBadge.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/revision/InsumosComprometidosRow/InsumosComprometidosRow.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/revision/VencidasResumen/VencidasResumen.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/revision/VencidasFiltrosBar/VencidasFiltrosBar.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/revision/VencidasTable/VencidasTable.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/revision/AccionesLoteBar/AccionesLoteBar.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/revision/ConfirmarRealizadasDialog/ConfirmarRealizadasDialog.jsx` + `.css`
- Create: `src/Components/ProgramacionSalaCirugias/modals/MarcarIncumplidaModal/MarcarIncumplidaModal.jsx` + `.css`
- Modify: `src/Components/ProgramacionSalaCirugias/shared/shared.css` (agregar la receta de `.filter-bar`)

**Interfaces:**
- Consumes (Task 1): `INCONSISTENCIAS`, `INCONSISTENCIA_ORDEN`, `clasificarInconsistencia`, `duracionMin`, `antiguedadLabel` de `@/hooks/ProgramacionSalaCirugias/revisionVencidas`; `SALAS`, `CAUSALES_REPROGRAMACION_CIRUGIA`, `FARMACIA_ESTADO_LABEL`, `fechaLabel`, `fechaHoraLabel` de `@/hooks/ProgramacionSalaCirugias/mockCirugiaData`.
- Produces (los consume la Task 3):
  - `<InconsistenciaBadge tipo />`
  - `<InsumosComprometidosRow id cirugia colSpan />` (renderiza un `<tr>`)
  - `<VencidasResumen conteo tipoActivo onSelectTipo(tipo) />`
  - `<VencidasFiltrosBar filtros conteo onChange(cambiosParciales) onLimpiar() />`
  - `<VencidasTable items hoy orden onOrdenar(columna) seleccion(Set) onToggleSeleccion(id) onToggleTodas() expandidas(Set) onToggleExpandida(id) onAccion(accion, cirugia) />` con `accion ∈ 'realizada'|'incumplida'|'reprogramar'|'cancelar'`
  - `<AccionesLoteBar cantidad onMarcarRealizadas() onMarcarIncumplidas() onDeseleccionar() />`
  - `<ConfirmarRealizadasDialog cantidad conInsumos onCancel() onConfirm() />`
  - `<MarcarIncumplidaModal cirugias onClose() onSubmit({ causal, observacion }) />`

- [ ] **Step 1: Receta de `.filter-bar` en `shared/shared.css`**

Agregar al final de `src/Components/ProgramacionSalaCirugias/shared/shared.css` (misma receta que `GestionTurnos.css`, ver AGENTS.md "Barra de filtros de listado"; hoy solo la usa la revisión, pero es la clase compartida del proyecto para el toolbar y vive en `shared.css` por esa convención):

```css
/* Barra de filtros de listado -- receta estándar del proyecto (ver AGENTS.md
   "Barra de filtros de listado", referencia GestionTurnos.css). Una sola
   fila con wrap: buscador, spacer, chips, resto de filtros. */
.filter-bar{
  display:flex;align-items:center;flex-wrap:wrap;gap:10px 16px;padding:14px 20px;
  border-bottom:1px solid var(--border);flex-shrink:0;
}
.search-field{position:relative;width:280px;flex-shrink:0;}
.search-field .icon{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--ink-500);width:17px;height:17px;}
.search-field input{
  width:100%;height:var(--input-md);padding:0 10px 0 32px;border:1px solid var(--border);border-radius:var(--radius);
  font-family:inherit;font-size:var(--fs-base);color:var(--ink-900);background:var(--bg);
}
.search-field input::placeholder{color:var(--ink-400);}
.search-field input:focus{outline:2px solid var(--primary);outline-offset:1px;background:var(--surface);}
.filter-spacer{flex:1;}
.filter-cluster{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
```

- [ ] **Step 2: `InconsistenciaBadge`**

`revision/InconsistenciaBadge/InconsistenciaBadge.jsx`:

```jsx
'use client';

import Badge from '@/Components/Badge/Badge';
import { INCONSISTENCIAS } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './InconsistenciaBadge.css';

// Tipo de inconsistencia de una programación vencida -- texto + punto de
// color, nunca solo color (ver AGENTS.md "Badges").
export default function InconsistenciaBadge({ tipo }) {
  const meta = INCONSISTENCIAS[tipo];
  return (
    <Badge tone={meta.tone} dot className="rv-inconsistencia-badge">
      {meta.label}
    </Badge>
  );
}
```

`InconsistenciaBadge.css`:

```css
.rv-inconsistencia-badge{white-space:nowrap;}
```

- [ ] **Step 3: `InsumosComprometidosRow`**

`revision/InsumosComprometidosRow/InsumosComprometidosRow.jsx`:

```jsx
'use client';

import { LuInfo } from 'react-icons/lu';
import { FARMACIA_ESTADO_LABEL, fechaHoraLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './InsumosComprometidosRow.css';

// Subfila expandida bajo una programación "Insumos comprometidos": el pedido
// que quedó hecho sin que el paciente pasara a cirugía. Es el contexto que
// hace falta para decidir entre cancelar o marcar incumplida.
export default function InsumosComprometidosRow({ id, cirugia, colSpan }) {
  const { farmacia } = cirugia;
  const medicamentos = farmacia.medicamentos ?? [];
  return (
    <tr id={id} className="rv-insumos-row">
      <td colSpan={colSpan}>
        <div className="rv-insumos-box">
          <dl className="rv-insumos-meta">
            <div>
              <dt>N° de pedido</dt>
              <dd>{farmacia.numeroPedido}</dd>
            </div>
            <div>
              <dt>Estado del pedido</dt>
              <dd>{FARMACIA_ESTADO_LABEL[farmacia.estado] ?? '—'}</dd>
            </div>
            <div>
              <dt>Solicitado</dt>
              <dd>{farmacia.fechaSolicitud ? fechaHoraLabel(farmacia.fechaSolicitud) : '—'}</dd>
            </div>
          </dl>
          {medicamentos.length > 0 ? (
            <ul className="rv-insumos-list">
              {medicamentos.map((med) => (
                <li key={med.nombre}>
                  <span className="rv-insumos-nombre">{med.nombre}</span>
                  <span className="rv-insumos-dosis">{med.dosis}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rv-insumos-vacio">Sin ítems registrados en el pedido.</p>
          )}
          <p className="rv-insumos-nota">
            <LuInfo className="icon" aria-hidden="true" />
            Al cancelar o marcar incumplida, el pedido se marca para devolución.
          </p>
        </div>
      </td>
    </tr>
  );
}
```

`InsumosComprometidosRow.css`:

```css
.rv-insumos-row > td{padding:0 12px 12px 52px;background:var(--bg);border-bottom:1px solid var(--border);}
.rv-insumos-box{
  display:flex;flex-direction:column;gap:10px;padding:12px 16px;
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
}
.rv-insumos-meta{display:flex;flex-wrap:wrap;gap:8px 32px;margin:0;}
.rv-insumos-meta dt{font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-500);}
.rv-insumos-meta dd{margin:2px 0 0;font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
.rv-insumos-list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px;}
.rv-insumos-list li{
  display:flex;align-items:center;gap:6px;padding:4px 10px;
  background:var(--bg);border-radius:var(--radius);font-size:var(--fs-sm);
}
.rv-insumos-nombre{font-weight:var(--fw-medium);color:var(--ink-900);}
.rv-insumos-dosis{color:var(--ink-500);}
.rv-insumos-vacio{margin:0;font-size:var(--fs-sm);color:var(--ink-500);}
.rv-insumos-nota{
  display:flex;align-items:center;gap:6px;margin:0;
  font-size:var(--fs-sm);color:var(--amber-fg);
}
.rv-insumos-nota .icon{width:15px;height:15px;flex-shrink:0;}
```

- [ ] **Step 4: `VencidasResumen`**

`revision/VencidasResumen/VencidasResumen.jsx`:

```jsx
'use client';

import { INCONSISTENCIAS, INCONSISTENCIA_ORDEN } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './VencidasResumen.css';

// 3 contadores por tipo de inconsistencia. Clicables: activan el mismo filtro
// que el chip del tipo en VencidasFiltrosBar; click en el activo lo quita.
export default function VencidasResumen({ conteo, tipoActivo, onSelectTipo }) {
  return (
    <div className="rv-resumen" role="group" aria-label="Resumen por tipo de inconsistencia">
      {INCONSISTENCIA_ORDEN.map((tipo) => {
        const meta = INCONSISTENCIAS[tipo];
        const activo = tipoActivo === tipo;
        return (
          <button
            key={tipo}
            type="button"
            className={`rv-resumen-item rv-resumen-${meta.tone}${activo ? ' active' : ''}`}
            aria-pressed={activo}
            onClick={() => onSelectTipo(activo ? 'todas' : tipo)}
          >
            <span className="rv-resumen-valor">{conteo[tipo]}</span>
            <span className="rv-resumen-label">{meta.label}</span>
            <span className="rv-resumen-hint">{meta.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
```

`VencidasResumen.css`:

```css
.rv-resumen{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;flex-shrink:0;}
.rv-resumen-item{
  display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;
  padding:14px 18px;background:var(--surface);color:inherit;font-family:inherit;cursor:pointer;
  border:1px solid var(--border);border-left:4px solid var(--ink-400);border-radius:var(--radius-lg);
  transition:border-color .15s,background .15s;
}
.rv-resumen-danger{border-left-color:var(--red);}
.rv-resumen-info{border-left-color:var(--primary);}
.rv-resumen-neutral{border-left-color:var(--ink-400);}
.rv-resumen-item:hover{background:var(--bg);}
.rv-resumen-item:focus-visible{outline:2px solid var(--primary);outline-offset:2px;}
.rv-resumen-item.active{background:var(--interactive-selected-bg);border-color:var(--interactive-selected-border);}
.rv-resumen-item.active.rv-resumen-danger{border-left-color:var(--red);}
.rv-resumen-item.active.rv-resumen-info{border-left-color:var(--primary);}
.rv-resumen-item.active.rv-resumen-neutral{border-left-color:var(--ink-400);}
.rv-resumen-valor{font-size:var(--fs-3xl);font-weight:var(--fw-bold);color:var(--ink-900);line-height:1.1;}
.rv-resumen-label{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.rv-resumen-hint{font-size:var(--fs-sm);color:var(--ink-500);}
```

- [ ] **Step 5: `VencidasFiltrosBar`**

`revision/VencidasFiltrosBar/VencidasFiltrosBar.jsx`:

```jsx
'use client';

import { LuSearch, LuX } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import { SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { INCONSISTENCIAS, INCONSISTENCIA_ORDEN } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './VencidasFiltrosBar.css';

// Sede fija '02' en todo el módulo (ver ProgramacionSalaCirugias.jsx).
const SALA_OPTIONS = [
  { value: 'todas', label: 'Todas las salas' },
  ...SALAS.filter((s) => s.sedeId === '02').map((s) => ({ value: s.value, label: s.descripcion })),
];

// Una sola fila (AGENTS.md "Barra de filtros de listado"): buscador, spacer,
// chips por tipo, sala + rango de fechas, "Limpiar filtros" si hay alguno.
// `onChange` recibe solo las claves que cambian.
export default function VencidasFiltrosBar({
  filtros, conteo, onChange, onLimpiar,
}) {
  const hayFiltrosActivos = filtros.tipo !== 'todas' || filtros.salaId !== 'todas'
    || filtros.busqueda !== '' || filtros.desde !== '' || filtros.hasta !== '';
  const tipoOptions = [
    { value: 'todas', label: 'Todas', count: conteo.total },
    ...INCONSISTENCIA_ORDEN.map((tipo) => ({ value: tipo, label: INCONSISTENCIAS[tipo].label, count: conteo[tipo] })),
  ];

  return (
    <div className="filter-bar rv-filter-bar">
      <div className="search-field">
        <LuSearch className="icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar paciente, documento o No. programación"
          aria-label="Buscar paciente, documento o número de programación"
          value={filtros.busqueda}
          onChange={(e) => onChange({ busqueda: e.target.value })}
        />
      </div>
      <div className="filter-spacer" />
      <SegmentedFilterBar
        options={tipoOptions}
        value={filtros.tipo}
        onChange={(tipo) => onChange({ tipo })}
        ariaLabel="Tipo de inconsistencia"
      />
      <div className="filter-cluster">
        <div className="rv-filtro-sala">
          <FormSelect
            id="rv-filtro-sala"
            ariaLabel="Sala"
            value={filtros.salaId}
            onChange={(salaId) => onChange({ salaId })}
            options={SALA_OPTIONS}
          />
        </div>
        <div className="rv-filtro-fechas">
          <input
            type="date"
            className="rv-date-input"
            aria-label="Fecha programada desde"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(e) => onChange({ desde: e.target.value })}
          />
          <span className="rv-filtro-fechas-sep" aria-hidden="true">–</span>
          <input
            type="date"
            className="rv-date-input"
            aria-label="Fecha programada hasta"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(e) => onChange({ hasta: e.target.value })}
          />
        </div>
        {hayFiltrosActivos && (
          <Button variant="secondary" size="sm" icon={LuX} onClick={onLimpiar}>Limpiar filtros</Button>
        )}
      </div>
    </div>
  );
}
```

`VencidasFiltrosBar.css`:

```css
/* .filter-bar/.search-field/.filter-spacer/.filter-cluster viven en
   shared/shared.css -- acá solo lo propio de esta barra. */
.rv-filter-bar .search-field{width:300px;}
.rv-filtro-sala{width:190px;}
.rv-filtro-fechas{display:flex;align-items:center;gap:6px;}
.rv-filtro-fechas-sep{color:var(--ink-500);}
.rv-date-input{
  height:var(--input-md);padding:0 8px;border:1px solid var(--border);border-radius:var(--radius);
  font-family:inherit;font-size:var(--fs-base);color:var(--ink-900);background:var(--surface);
}
.rv-date-input:focus{outline:2px solid var(--primary);outline-offset:1px;}
```

- [ ] **Step 6: `VencidasTable`**

`revision/VencidasTable/VencidasTable.jsx`:

```jsx
'use client';

import { Fragment, useEffect, useRef } from 'react';
import {
  LuArrowDown, LuArrowUp, LuArrowUpDown, LuBan, LuCalendarClock, LuCalendarX,
  LuCheckCheck, LuChevronRight, LuDoorOpen, LuPackage,
} from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import InconsistenciaBadge from '../InconsistenciaBadge/InconsistenciaBadge';
import InsumosComprometidosRow from '../InsumosComprometidosRow/InsumosComprometidosRow';
import { SALAS, fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { antiguedadLabel, clasificarInconsistencia, duracionMin } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './VencidasTable.css';

const TOTAL_COLUMNAS = 9;

// Acción sugerida por tipo (spec, tabla de clasificación). "Ver insumos" no
// resuelve nada: expande la fila, porque ahí conviene mirar antes de decidir.
const SUGERIDA = {
  trasladado: { accion: 'realizada', label: 'Marcar realizada', icon: LuCheckCheck },
  'sin-actividad': { accion: 'incumplida', label: 'Marcar incumplida', icon: LuCalendarX },
  insumos: { accion: 'ver-insumos', label: 'Ver insumos', icon: LuPackage },
};

function salaDescripcion(salaId) {
  return SALAS.find((s) => s.value === salaId)?.descripcion ?? salaId;
}

export default function VencidasTable({
  items, hoy, orden, onOrdenar,
  seleccion, onToggleSeleccion, onToggleTodas,
  expandidas, onToggleExpandida, onAccion,
}) {
  const checkTodasRef = useRef(null);
  const seleccionadasEnPagina = items.filter((c) => seleccion.has(c.id)).length;
  const todasSeleccionadas = items.length > 0 && seleccionadasEnPagina === items.length;

  useEffect(() => {
    if (checkTodasRef.current) {
      checkTodasRef.current.indeterminate = seleccionadasEnPagina > 0 && !todasSeleccionadas;
    }
  }, [seleccionadasEnPagina, todasSeleccionadas]);

  function thOrdenable(columna, label, className = '') {
    const activa = orden?.columna === columna;
    let Icono = LuArrowUpDown;
    if (activa) Icono = orden.direccion === 'asc' ? LuArrowUp : LuArrowDown;
    let ariaSort = 'none';
    if (activa) ariaSort = orden.direccion === 'asc' ? 'ascending' : 'descending';
    return (
      <th className={className} aria-sort={ariaSort}>
        <button type="button" className={`rv-sort-btn${activa ? ' active' : ''}`} onClick={() => onOrdenar(columna)}>
          {label}
          <Icono className="icon" aria-hidden="true" />
        </button>
      </th>
    );
  }

  return (
    <div className="rv-table-wrap">
      <table className="rv-table">
        <thead>
          <tr>
            <th className="rv-col-check">
              <input
                ref={checkTodasRef}
                type="checkbox"
                checked={todasSeleccionadas}
                onChange={onToggleTodas}
                aria-label="Seleccionar todas las de esta página"
              />
            </th>
            {thOrdenable('inconsistencia', 'Inconsistencia')}
            {thOrdenable('paciente', 'Paciente')}
            {thOrdenable('fecha', 'Fecha programada')}
            {thOrdenable('sala', 'Sala')}
            {thOrdenable('duracion', 'Duración', 'rv-num')}
            <th>No. Prog. / Consecutivo</th>
            <th>Trazabilidad</th>
            <th className="rv-col-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const tipo = clasificarInconsistencia(c);
            const numero = c.numeroProgramacion ?? c.id;
            const seleccionada = seleccion.has(c.id);
            const expandida = expandidas.has(c.id);
            const detalleId = `rv-insumos-${c.id}`;
            const sugerida = SUGERIDA[tipo];
            const sugeridaLabel = tipo === 'insumos' && expandida ? 'Ocultar insumos' : sugerida.label;
            return (
              <Fragment key={c.id}>
                <tr className={`rv-row${seleccionada ? ' selected' : ''}`}>
                  <td className="rv-col-check">
                    <input
                      type="checkbox"
                      checked={seleccionada}
                      onChange={() => onToggleSeleccion(c.id)}
                      aria-label={`Seleccionar programación ${numero}`}
                    />
                  </td>
                  <td>
                    <div className="rv-tipo-cell">
                      {tipo === 'insumos' ? (
                        <button
                          type="button"
                          className="rv-expand-btn"
                          aria-expanded={expandida}
                          aria-controls={detalleId}
                          aria-label={expandida ? 'Ocultar insumos' : 'Ver insumos'}
                          onClick={() => onToggleExpandida(c.id)}
                        >
                          <LuChevronRight className={`icon${expandida ? ' open' : ''}`} aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="rv-expand-spacer" />
                      )}
                      <InconsistenciaBadge tipo={tipo} />
                    </div>
                  </td>
                  <td>
                    <div className="rv-cell-primary">{c.paciente.nombre}</div>
                    <div className="rv-cell-secondary">{c.paciente.documento}</div>
                  </td>
                  <td className="rv-nowrap">
                    <div className="rv-cell-primary">{fechaLabel(c.fecha)} · {c.horaInicio}</div>
                    <div className="rv-cell-secondary">{antiguedadLabel(c.fecha, hoy)}</div>
                  </td>
                  <td>{salaDescripcion(c.salaId)}</td>
                  <td className="rv-num rv-nowrap">{duracionMin(c)} min</td>
                  <td>
                    <div className="rv-cell-primary">{numero}</div>
                    <div className="rv-cell-secondary">{c.consecutivo ?? '—'}</div>
                  </td>
                  <td>
                    <div className="rv-trazabilidad">
                      {c.farmacia?.numeroPedido && (
                        <span>
                          <LuPackage className="icon" aria-hidden="true" />
                          Pedido {c.farmacia.numeroPedido}
                        </span>
                      )}
                      {c.traslado && (
                        <span>
                          <LuDoorOpen className="icon" aria-hidden="true" />
                          Adm. {c.traslado.numeroAdmision}
                        </span>
                      )}
                      {!c.farmacia?.numeroPedido && !c.traslado && <span className="rv-cell-secondary">—</span>}
                    </div>
                  </td>
                  <td className="rv-col-acciones">
                    <div className="rv-acciones">
                      <Button
                        size="sm"
                        variant="outline"
                        icon={sugerida.icon}
                        aria-expanded={tipo === 'insumos' ? expandida : undefined}
                        aria-controls={tipo === 'insumos' ? detalleId : undefined}
                        onClick={() => (tipo === 'insumos' ? onToggleExpandida(c.id) : onAccion(sugerida.accion, c))}
                      >
                        {sugeridaLabel}
                      </Button>
                      <DropdownMenu
                        label={`Más acciones para ${c.paciente.nombre}`}
                        items={[
                          {
                            id: 'realizada', label: 'Marcar realizada', icon: LuCheckCheck, onSelect: () => onAccion('realizada', c),
                          },
                          {
                            id: 'incumplida', label: 'Marcar incumplida', icon: LuCalendarX, tone: 'warn', onSelect: () => onAccion('incumplida', c),
                          },
                          {
                            id: 'reprogramar', label: 'Reprogramar', icon: LuCalendarClock, onSelect: () => onAccion('reprogramar', c),
                          },
                          {
                            id: 'cancelar', label: 'Cancelar', icon: LuBan, tone: 'danger', dividerBefore: true, onSelect: () => onAccion('cancelar', c),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
                {tipo === 'insumos' && expandida && (
                  <InsumosComprometidosRow id={detalleId} cirugia={c} colSpan={TOTAL_COLUMNAS} />
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

`VencidasTable.css`:

```css
.rv-table-wrap{flex:1;min-height:0;overflow:auto;}
.rv-table{width:100%;border-collapse:separate;border-spacing:0;font-size:var(--fs-base);}
/* th y td comparten padding horizontal (12px) -- AGENTS.md "Encabezados de tabla". */
.rv-table th{
  position:sticky;top:0;z-index:var(--z-sticky);
  text-align:left;padding:10px 12px;white-space:nowrap;
  background:var(--table-header-bg);border-bottom:1px solid var(--border);
  font-size:var(--th-fs);font-weight:var(--th-fw);color:var(--th-color);
}
.rv-table td{padding:6px 12px;height:44px;border-bottom:1px solid var(--border);color:var(--ink-700);vertical-align:middle;}
.rv-table .rv-num{text-align:right;}
.rv-table .rv-nowrap{white-space:nowrap;}
.rv-row:hover > td{background:var(--bg);}
.rv-row.selected > td{background:var(--primary-50);}

.rv-col-check{width:40px;}
.rv-col-check input{width:16px;height:16px;accent-color:var(--primary);cursor:pointer;}
.rv-col-acciones{width:1%;white-space:nowrap;}

.rv-sort-btn{
  display:inline-flex;align-items:center;gap:4px;padding:0;border:none;background:none;cursor:pointer;
  font:inherit;color:inherit;
}
.rv-num .rv-sort-btn{flex-direction:row-reverse;}
.rv-sort-btn .icon{width:14px;height:14px;color:var(--ink-400);}
.rv-sort-btn.active .icon{color:var(--primary);}
.rv-sort-btn:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:4px;}

.rv-tipo-cell{display:flex;align-items:center;gap:6px;}
.rv-expand-btn, .rv-expand-spacer{width:24px;height:24px;flex-shrink:0;}
.rv-expand-btn{
  display:flex;align-items:center;justify-content:center;padding:0;
  border:none;border-radius:6px;background:none;color:var(--ink-500);cursor:pointer;
}
.rv-expand-btn:hover{background:var(--gray-bg);color:var(--ink-900);}
.rv-expand-btn:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.rv-expand-btn .icon{width:16px;height:16px;transition:transform .15s;}
.rv-expand-btn .icon.open{transform:rotate(90deg);}

.rv-cell-primary{font-weight:var(--fw-medium);color:var(--ink-900);}
.rv-cell-secondary{font-size:var(--fs-sm);color:var(--ink-500);}

.rv-trazabilidad{display:flex;flex-direction:column;gap:2px;font-size:var(--fs-sm);}
.rv-trazabilidad span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;}
.rv-trazabilidad .icon{width:14px;height:14px;color:var(--ink-500);}

.rv-acciones{display:flex;align-items:center;justify-content:flex-end;gap:6px;}

@media (prefers-reduced-motion:reduce){
  .rv-expand-btn .icon{transition:none;}
}
```

- [ ] **Step 7: `AccionesLoteBar`**

`revision/AccionesLoteBar/AccionesLoteBar.jsx`:

```jsx
'use client';

import { LuCalendarX, LuCheckCheck } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import './AccionesLoteBar.css';

// Barra al pie de la card cuando hay filas seleccionadas. En lote solo
// Realizada e Incumplida (spec): cancelar/reprogramar piden datos por fila.
export default function AccionesLoteBar({
  cantidad, onMarcarRealizadas, onMarcarIncumplidas, onDeseleccionar,
}) {
  return (
    <div className="rv-lote-bar" role="region" aria-label="Acciones en lote">
      <span className="rv-lote-count" aria-live="polite">
        <strong>{cantidad}</strong> {cantidad === 1 ? 'seleccionada' : 'seleccionadas'}
      </span>
      <div className="rv-lote-actions">
        <Button size="sm" icon={LuCheckCheck} onClick={onMarcarRealizadas}>Marcar realizadas</Button>
        <Button size="sm" variant="warning-outline" icon={LuCalendarX} onClick={onMarcarIncumplidas}>Marcar incumplidas</Button>
        <Button size="sm" variant="secondary" onClick={onDeseleccionar}>Deseleccionar</Button>
      </div>
    </div>
  );
}
```

`AccionesLoteBar.css`:

```css
.rv-lote-bar{
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;flex-shrink:0;
  padding:10px 20px;background:var(--primary-50);border-top:1px solid var(--interactive-selected-border);
}
.rv-lote-count{font-size:var(--fs-base);color:var(--ink-700);}
.rv-lote-count strong{font-weight:var(--fw-semibold);color:var(--ink-900);}
.rv-lote-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
```

- [ ] **Step 8: `ConfirmarRealizadasDialog`**

`revision/ConfirmarRealizadasDialog/ConfirmarRealizadasDialog.jsx`:

```jsx
'use client';

import { useRef } from 'react';
import { LuCheckCheck, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import './ConfirmarRealizadasDialog.css';

// Confirmación centrada sin fila de header (patrón .nc-discard-modal, fuera
// de ModalHeader por AGENTS.md "Modales"): solo para "Marcar realizadas" en
// lote -- la acción individual es directa con Deshacer.
export default function ConfirmarRealizadasDialog({
  cantidad, conInsumos, onCancel, onConfirm,
}) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div
      className="modal-overlay open"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <div
        ref={cardRef}
        className="modal-card rv-confirm-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="rv-confirm-title"
        aria-describedby="rv-confirm-desc"
      >
        <div className="rv-confirm-icon"><LuCheckCheck className="icon" aria-hidden="true" /></div>
        <h3 id="rv-confirm-title" className="rv-confirm-title">
          ¿Marcar {cantidad} programaciones como realizadas?
        </h3>
        <p id="rv-confirm-desc" className="rv-confirm-text">
          Esta acción queda registrada en la trazabilidad de cada una.
        </p>
        {conInsumos > 0 && (
          <p className="tf-warning-note">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            {conInsumos} {conInsumos === 1 ? 'tiene' : 'tienen'} insumos pedidos; se registrarán como consumidos.
          </p>
        )}
        <div className="rv-confirm-actions">
          <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button icon={LuCheckCheck} onClick={onConfirm}>Marcar realizadas</Button>
        </div>
      </div>
    </div>
  );
}
```

`ConfirmarRealizadasDialog.css`:

```css
/* .modal-overlay/.modal-card/.tf-warning-note viven en shared/shared.css. */
.rv-confirm-card{width:420px;padding:24px;gap:12px;align-items:center;text-align:center;}
.rv-confirm-icon{
  width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--primary-50);color:var(--primary);
}
.rv-confirm-icon .icon{width:22px;height:22px;}
.rv-confirm-title{margin:0;font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.rv-confirm-text{margin:0;font-size:var(--fs-base);color:var(--ink-500);}
.rv-confirm-card .tf-warning-note{text-align:left;align-self:stretch;}
.rv-confirm-actions{display:flex;justify-content:center;gap:10px;margin-top:8px;}
```

- [ ] **Step 9: `MarcarIncumplidaModal`**

`modals/MarcarIncumplidaModal/MarcarIncumplidaModal.jsx`:

```jsx
'use client';

import { useRef, useState } from 'react';
import { LuCalendarX, LuTriangleAlert } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { CAUSALES_REPROGRAMACION_CIRUGIA } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './MarcarIncumplidaModal.css';

// Mismo catálogo de causales que ReprogramarCirugiaModal (CAU). Se guarda el
// idCausal.
const CAUSAL_OPTIONS = CAUSALES_REPROGRAMACION_CIRUGIA.map((c) => ({ value: c.idCausal, label: c.descripcion }));

// Sirve para 1 programación (menú de fila / acción sugerida) o para N (barra
// de lote): la causal elegida se aplica a todas.
export default function MarcarIncumplidaModal({ cirugias, onClose, onSubmit }) {
  const [causal, setCausal] = useState('');
  const [observacion, setObservacion] = useState('');
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  const cantidad = cirugias.length;
  const conInsumos = cirugias.filter((c) => c.farmacia?.numeroPedido).length;
  const titulo = cantidad === 1 ? 'Marcar como incumplida' : `Marcar ${cantidad} programaciones como incumplidas`;
  let avisoInsumos = null;
  if (conInsumos > 0) {
    avisoInsumos = cantidad === 1
      ? 'Esta programación tiene pedido de insumos; se marcará para devolución.'
      : `${conInsumos} de las programaciones tienen pedido de insumos; se marcarán para devolución.`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!causal) return;
    onSubmit({ causal, observacion: observacion.trim() });
  }

  return (
    <div className="modal-overlay open">
      <div ref={cardRef} className="modal-card mim-modal-card" role="dialog" aria-modal="true" aria-labelledby="mim-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarX}
            tone="warning"
            title={titulo}
            titleId="mim-title"
            subtitle={cantidad === 1 ? cirugias[0].paciente.nombre : undefined}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="mim-causal">Causal *</label>
              <FormSelect
                id="mim-causal"
                value={causal}
                onChange={setCausal}
                options={CAUSAL_OPTIONS}
                placeholder="Selecciona una causal"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="mim-observacion">Observación</label>
              <textarea
                id="mim-observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            {avisoInsumos && (
              <p className="tf-warning-note">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                {avisoInsumos}
              </p>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" disabled={!causal}>Marcar incumplida</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

`MarcarIncumplidaModal.css`:

```css
/* .modal-overlay/.modal-card/.modal-body/.modal-footer/.form-field/
   .tf-warning-note viven en shared/shared.css. */
.mim-modal-card{width:480px;}
.mim-modal-card .tf-warning-note{margin:0;}
```

- [ ] **Step 10: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/revision src/Components/ProgramacionSalaCirugias/modals/MarcarIncumplidaModal`
Expected: sin errores.

- [ ] **Step 11: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/revision src/Components/ProgramacionSalaCirugias/modals/MarcarIncumplidaModal src/Components/ProgramacionSalaCirugias/shared/shared.css
git commit -m "feat(sala-cirugias): componentes de la revisión de programaciones vencidas"
```

---

### Task 3: Página de revisión (orquestador + ruta)

**Files:**
- Create: `src/app/programacion-sala-cirugias/revision/page.jsx`
- Create: `src/Components/ProgramacionSalaCirugias/RevisionVencidas/RevisionVencidas.jsx` + `.css`
- Modify: `src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal.jsx` + `.css` (prop opcional `fechaMinima`)
- Modify: `src/Components/Sidebar/Sidebar.jsx:62` (activo también en la subruta)

**Interfaces:**
- Consumes (Task 1): `fetchVencidas`, `marcarRealizadas`, `marcarIncumplidas`, `deshacerResolucion`, `cancelarCirugia`, `reprogramarCirugia`, `fechaISO`, `addDias`, `fechaLabel`; `contarPorTipo`, `filtrarVencidas`, `ordenarVencidas`, `paginar`.
- Consumes (Task 2): todos los componentes listados en su bloque "Produces".
- Produces: ruta `/programacion-sala-cirugias/revision`; `ReprogramarCirugiaModal` acepta `fechaMinima` (ISO `YYYY-MM-DD`, opcional; sin él se comporta igual que hoy).

- [ ] **Step 1: `fechaMinima` en `ReprogramarCirugiaModal`**

En `ReprogramarCirugiaModal.jsx`:

1. Cambiar la firma y el estado inicial de la fecha:

```jsx
export default function ReprogramarCirugiaModal({
  cirugia, onClose, onSubmit, fechaMinima,
}) {
  // `fechaMinima` (opcional, lo pasa la revisión de vencidas): la fecha
  // actual de una programación vencida ya es pasada, así que arranca vacía
  // en vez de precargada con un valor que no se puede enviar.
  const [fecha, setFecha] = useState(
    fechaMinima && cirugia.fecha < fechaMinima ? '' : cirugia.fecha,
  );
```

(reemplaza la línea `export default function ReprogramarCirugiaModal({ cirugia, onClose, onSubmit }) {` y la línea `const [fecha, setFecha] = useState(cirugia.fecha);`).

2. Reemplazar la definición de `puedeEnviar`:

```jsx
  const fechaInvalida = Boolean(fechaMinima) && fecha !== '' && fecha < fechaMinima;
  const puedeEnviar = causal !== '' && salaId !== '' && cirujano.trim() !== ''
    && fecha !== '' && horaInicio !== '' && horaFin !== '' && !fechaInvalida;
```

3. Reemplazar el `.form-field` de "Nueva fecha":

```jsx
              <div className="form-field">
                <label htmlFor="rcm-fecha">Nueva fecha</label>
                <input
                  id="rcm-fecha"
                  type="date"
                  value={fecha}
                  min={fechaMinima}
                  onChange={(e) => setFecha(e.target.value)}
                  aria-invalid={fechaInvalida || undefined}
                  aria-describedby={fechaInvalida ? 'rcm-fecha-error' : undefined}
                  required
                />
                {fechaInvalida && (
                  <span id="rcm-fecha-error" className="rcm-field-error">La nueva fecha debe ser posterior a hoy.</span>
                )}
              </div>
```

En `ReprogramarCirugiaModal.css`, agregar al final:

```css
.rcm-field-error{font-size:var(--fs-sm);color:var(--red);}
```

- [ ] **Step 2: Sidebar activo en la subruta**

En `src/Components/Sidebar/Sidebar.jsx`, línea 62:

```jsx
  const isProgramacionSalaCirugias = pathname.startsWith('/programacion-sala-cirugias');
```

- [ ] **Step 3: Ruta**

`src/app/programacion-sala-cirugias/revision/page.jsx`:

```jsx
import RevisionVencidas from '@/Components/ProgramacionSalaCirugias/RevisionVencidas/RevisionVencidas';

export default function RevisionVencidasPage() {
  return <RevisionVencidas />;
}
```

- [ ] **Step 4: Orquestador `RevisionVencidas.jsx`**

`src/Components/ProgramacionSalaCirugias/RevisionVencidas/RevisionVencidas.jsx`:

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LuArrowLeft, LuChevronLeft, LuChevronRight, LuCircleCheck, LuSearchX,
} from 'react-icons/lu';
// Tokens (:root), reset del shell y reglas compartidas de la feature: los
// mismos 2 archivos que carga ProgramacionSalaCirugias.jsx, porque esta
// subruta es otra página de la misma feature.
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './RevisionVencidas.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import VencidasResumen from '../revision/VencidasResumen/VencidasResumen';
import VencidasFiltrosBar from '../revision/VencidasFiltrosBar/VencidasFiltrosBar';
import VencidasTable from '../revision/VencidasTable/VencidasTable';
import AccionesLoteBar from '../revision/AccionesLoteBar/AccionesLoteBar';
import ConfirmarRealizadasDialog from '../revision/ConfirmarRealizadasDialog/ConfirmarRealizadasDialog';
import MarcarIncumplidaModal from '../modals/MarcarIncumplidaModal/MarcarIncumplidaModal';
import CancelarCirugiaModal from '../modals/CancelarCirugiaModal/CancelarCirugiaModal';
import ReprogramarCirugiaModal from '../modals/ReprogramarCirugiaModal/ReprogramarCirugiaModal';
import {
  addDias,
  cancelarCirugia,
  deshacerResolucion,
  fechaISO,
  fechaLabel,
  fetchVencidas,
  marcarIncumplidas,
  marcarRealizadas,
  reprogramarCirugia,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  contarPorTipo, filtrarVencidas, ordenarVencidas, paginar,
} from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';

const POR_PAGINA = 50;
const FILTROS_INICIALES = {
  tipo: 'todas', salaId: 'todas', busqueda: '', desde: '', hasta: '',
};

function etiqueta(cirugia) {
  return cirugia.numeroProgramacion ?? cirugia.id;
}

// "Revisión de programaciones vencidas" (spec 2026-09-25): cirugías en
// 'programada' con fecha anterior a hoy. Todo el estado de la pantalla vive
// acá; los componentes de ../revision/ son presentacionales.
export default function RevisionVencidas() {
  const router = useRouter();
  const [hoy] = useState(() => fechaISO(new Date()));
  const [manana] = useState(() => fechaISO(addDias(new Date(), 1)));
  const [vencidas, setVencidas] = useState(null); // null = cargando
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [orden, setOrden] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [seleccion, setSeleccion] = useState(() => new Set());
  const [expandidas, setExpandidas] = useState(() => new Set());
  // { type: 'incumplida' | 'confirmar-realizadas' | 'cancelar' | 'reprogramar', cirugias: [...] }
  const [modal, setModal] = useState(null);
  // { message, snapshot } -- con snapshot el toast ofrece "Deshacer".
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchVencidas({ hoy }).then((items) => {
      if (!cancelled) setVencidas(items);
    });
    return () => { cancelled = true; };
  }, [hoy]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const lista = vencidas ?? [];
  const conteo = contarPorTipo(lista);
  const filtradas = ordenarVencidas(filtrarVencidas(lista, filtros), orden);
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = paginar(filtradas, paginaActual, POR_PAGINA);
  const seleccionadas = lista.filter((c) => seleccion.has(c.id));
  const desdeN = filtradas.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1;
  const hastaN = Math.min(paginaActual * POR_PAGINA, filtradas.length);

  function showToast(message, snapshot = null) {
    setToast({ message, snapshot });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), snapshot ? 5000 : 2600);
  }

  // La selección se limpia al cambiar filtro o página (spec): evita actuar
  // sobre filas que ya no están a la vista.
  function handleFiltrosChange(cambios) {
    setFiltros((f) => ({ ...f, ...cambios }));
    setPagina(1);
    setSeleccion(new Set());
  }
  function handleLimpiarFiltros() {
    setFiltros(FILTROS_INICIALES);
    setPagina(1);
    setSeleccion(new Set());
  }
  function handlePagina(n) {
    setPagina(n);
    setSeleccion(new Set());
  }
  // asc -> desc -> orden por defecto.
  function handleOrdenar(columna) {
    setOrden((o) => {
      if (o?.columna !== columna) return { columna, direccion: 'asc' };
      if (o.direccion === 'asc') return { columna, direccion: 'desc' };
      return null;
    });
  }
  function toggleEnSet(setter, id) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function handleToggleTodas() {
    const todas = visibles.length > 0 && visibles.every((c) => seleccion.has(c.id));
    setSeleccion(todas ? new Set() : new Set(visibles.map((c) => c.id)));
  }

  function quitarResueltas(ids) {
    setVencidas((prev) => prev.filter((c) => !ids.includes(c.id)));
    const sinIds = (prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    };
    setSeleccion(sinIds);
    setExpandidas(sinIds);
  }

  function resolverRealizadas(cirugias) {
    const ids = cirugias.map((c) => c.id);
    const snapshot = marcarRealizadas(ids);
    quitarResueltas(ids);
    showToast(
      ids.length === 1
        ? `Programación ${etiqueta(cirugias[0])} marcada como realizada`
        : `${ids.length} programaciones marcadas como realizadas`,
      snapshot,
    );
  }

  function handleSubmitIncumplida({ causal, observacion }) {
    const { cirugias } = modal;
    const ids = cirugias.map((c) => c.id);
    const snapshot = marcarIncumplidas(ids, { causal, observacion });
    quitarResueltas(ids);
    setModal(null);
    showToast(
      ids.length === 1
        ? `Programación ${etiqueta(cirugias[0])} marcada como incumplida`
        : `${ids.length} programaciones marcadas como incumplidas`,
      snapshot,
    );
  }

  function handleConfirmarRealizadas() {
    const { cirugias } = modal;
    setModal(null);
    resolverRealizadas(cirugias);
  }

  function handleSubmitCancelar(motivo) {
    const cirugia = modal.cirugias[0];
    cancelarCirugia(cirugia.id, motivo);
    quitarResueltas([cirugia.id]);
    setModal(null);
    showToast(`Programación ${etiqueta(cirugia)} cancelada`);
  }

  function handleSubmitReprogramar(datos) {
    const cirugia = modal.cirugias[0];
    reprogramarCirugia(cirugia.id, datos);
    quitarResueltas([cirugia.id]);
    setModal(null);
    showToast(`Programación ${etiqueta(cirugia)} reprogramada para el ${fechaLabel(datos.fecha)}`);
  }

  function handleDeshacer() {
    const { snapshot } = toast;
    deshacerResolucion(snapshot);
    setVencidas((prev) => [...prev.filter((c) => !snapshot.some((s) => s.id === c.id)), ...snapshot]);
    window.clearTimeout(toastTimerRef.current);
    setToast(null);
  }

  function handleAccion(accion, cirugia) {
    if (accion === 'realizada') resolverRealizadas([cirugia]);
    else setModal({ type: accion, cirugias: [cirugia] });
  }

  let cuerpo;
  if (vencidas === null) {
    cuerpo = <div className="rv-card rv-estado" role="status">Cargando programaciones…</div>;
  } else if (lista.length === 0) {
    cuerpo = (
      <div className="rv-card rv-estado">
        <LuCircleCheck className="rv-estado-icon rv-estado-icon-ok" aria-hidden="true" />
        <h2 className="rv-estado-title">No hay programaciones vencidas</h2>
        <p className="rv-estado-text">La agenda está al día.</p>
        <Button variant="secondary" icon={LuArrowLeft} onClick={() => router.push('/programacion-sala-cirugias')}>
          Volver a la agenda
        </Button>
      </div>
    );
  } else {
    cuerpo = (
      <>
        <VencidasResumen
          conteo={conteo}
          tipoActivo={filtros.tipo}
          onSelectTipo={(tipo) => handleFiltrosChange({ tipo })}
        />
        <div className="rv-card rv-list-card">
          <VencidasFiltrosBar
            filtros={filtros}
            conteo={conteo}
            onChange={handleFiltrosChange}
            onLimpiar={handleLimpiarFiltros}
          />
          {filtradas.length === 0 ? (
            <div className="rv-estado rv-estado-filtros">
              <LuSearchX className="rv-estado-icon" aria-hidden="true" />
              <p className="rv-estado-text">Ninguna programación coincide con los filtros.</p>
              <Button variant="secondary" onClick={handleLimpiarFiltros}>Limpiar filtros</Button>
            </div>
          ) : (
            <VencidasTable
              items={visibles}
              hoy={hoy}
              orden={orden}
              onOrdenar={handleOrdenar}
              seleccion={seleccion}
              onToggleSeleccion={(id) => toggleEnSet(setSeleccion, id)}
              onToggleTodas={handleToggleTodas}
              expandidas={expandidas}
              onToggleExpandida={(id) => toggleEnSet(setExpandidas, id)}
              onAccion={handleAccion}
            />
          )}
          <div className="rv-footer">
            <span className="rv-paginacion-label">{desdeN}–{hastaN} de {filtradas.length}</span>
            <div className="rv-paginacion-btns">
              <button
                type="button"
                className="psc-agenda-nav-btn"
                aria-label="Página anterior"
                disabled={paginaActual === 1}
                onClick={() => handlePagina(paginaActual - 1)}
              >
                <LuChevronLeft className="icon" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="psc-agenda-nav-btn"
                aria-label="Página siguiente"
                disabled={paginaActual === totalPaginas}
                onClick={() => handlePagina(paginaActual + 1)}
              >
                <LuChevronRight className="icon" aria-hidden="true" />
              </button>
            </div>
          </div>
          {seleccion.size > 0 && (
            <AccionesLoteBar
              cantidad={seleccion.size}
              onMarcarRealizadas={() => setModal({ type: 'confirmar-realizadas', cirugias: seleccionadas })}
              onMarcarIncumplidas={() => setModal({ type: 'incumplida', cirugias: seleccionadas })}
              onDeseleccionar={() => setSeleccion(new Set())}
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
          page="Revisión de programaciones vencidas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">
          <nav className="rv-breadcrumb" aria-label="Ruta de navegación">
            <Link href="/programacion-sala-cirugias">Programación sala de cirugías</Link>
            <LuChevronRight className="icon" aria-hidden="true" />
            <span aria-current="page">Revisión de vencidas</span>
          </nav>
          <div className="psc-page-header">
            <div>
              <h1>Programaciones vencidas sin cerrar</h1>
              <p>Estado Programada con fecha anterior a hoy. Resuelve cada una para liberar insumos y cerrar la agenda.</p>
            </div>
          </div>
          {cuerpo}
        </div>
      </div>

      {modal?.type === 'incumplida' && (
        <MarcarIncumplidaModal cirugias={modal.cirugias} onClose={() => setModal(null)} onSubmit={handleSubmitIncumplida} />
      )}
      {modal?.type === 'confirmar-realizadas' && (
        <ConfirmarRealizadasDialog
          cantidad={modal.cirugias.length}
          conInsumos={modal.cirugias.filter((c) => c.farmacia?.numeroPedido).length}
          onCancel={() => setModal(null)}
          onConfirm={handleConfirmarRealizadas}
        />
      )}
      {modal?.type === 'cancelar' && (
        <CancelarCirugiaModal cirugia={modal.cirugias[0]} onClose={() => setModal(null)} onSubmit={handleSubmitCancelar} />
      )}
      {modal?.type === 'reprogramar' && (
        <ReprogramarCirugiaModal
          cirugia={modal.cirugias[0]}
          fechaMinima={manana}
          onClose={() => setModal(null)}
          onSubmit={handleSubmitReprogramar}
        />
      )}

      <div className={`psc-toast rv-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast?.message}</span>
        {toast?.snapshot && (
          <button type="button" className="rv-toast-undo" onClick={handleDeshacer}>Deshacer</button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: `RevisionVencidas.css`**

```css
/* Shell (.app/.main/.content), tokens y .psc-page-header vienen de
   ../ProgramacionSalaCirugias.css; .psc-toast/.psc-agenda-nav-btn de
   ../shared/shared.css. Acá solo lo propio de la página de revisión. */
.rv-breadcrumb{display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);color:var(--ink-500);flex-shrink:0;}
.rv-breadcrumb a{color:var(--primary);text-decoration:none;font-weight:var(--fw-medium);}
.rv-breadcrumb a:hover{text-decoration:underline;}
.rv-breadcrumb a:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:4px;}
.rv-breadcrumb .icon{width:14px;height:14px;}
.rv-breadcrumb [aria-current]{color:var(--ink-700);}

.rv-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);}
.rv-list-card{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}

.rv-estado{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  padding:48px 24px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);
}
.rv-estado-filtros{flex:1;}
.rv-estado-icon{width:36px;height:36px;color:var(--ink-400);}
.rv-estado-icon-ok{color:var(--green);}
.rv-estado-title{margin:0;font-size:var(--fs-xl);font-weight:var(--fw-semibold);color:var(--ink-900);}
.rv-estado-text{margin:0 0 8px;}

.rv-footer{
  display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-shrink:0;
  padding:8px 20px;border-top:1px solid var(--border);
}
.rv-paginacion-label{font-size:var(--fs-sm);color:var(--ink-500);}
.rv-paginacion-btns{display:flex;gap:4px;}
.rv-paginacion-btns .psc-agenda-nav-btn:disabled{opacity:.4;cursor:default;background:none;}

/* .psc-toast lleva pointer-events:none (solo informa); con "Deshacer" hay
   que poder clickearlo. */
.rv-toast.show{pointer-events:auto;}
.rv-toast-undo{
  margin-left:8px;padding:2px 8px;border:none;border-radius:6px;background:none;cursor:pointer;
  font:inherit;font-weight:var(--fw-semibold);color:var(--primary-100);text-decoration:underline;
}
.rv-toast-undo:hover{background:rgba(255,255,255,.12);}
.rv-toast-undo:focus-visible{outline:2px solid var(--primary-100);outline-offset:1px;}

@media (max-width:1024px){
  .rv-resumen{grid-template-columns:1fr;}
}
```

- [ ] **Step 6: Lint**

Run: `npx eslint src/app/programacion-sala-cirugias src/Components/ProgramacionSalaCirugias/RevisionVencidas src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal src/Components/Sidebar/Sidebar.jsx`
Expected: sin errores.

- [ ] **Step 7: La ruta responde**

Con el dev server corriendo (`npm run dev` en background si no lo está):
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/programacion-sala-cirugias/revision`
Expected: `200`. Y `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/programacion-sala-cirugias` sigue en `200`.

- [ ] **Step 8: Verificación manual en el navegador** (`/programacion-sala-cirugias/revision`)

1. Cargan los 3 contadores y la tabla; primero las filas "Insumos comprometidos" (más antigua primero).
2. Los chips y los contadores filtran; el conteo de cada chip coincide con su contador. Click en un contador activo lo quita.
3. "Marcar realizada" en una fila "Trasladado sin cierre" → sale del listado, toast con "Deshacer" → "Deshacer" la devuelve.
4. Seleccionar 5 filas → barra de lote → "Marcar incumplidas" → sin causal el botón está deshabilitado → con causal salen las 5.
5. Seleccionar filas → "Marcar realizadas" → diálogo de confirmación con aviso de insumos si corresponde → confirmar.
6. Fila "Insumos comprometidos" → chevron y "Ver insumos" expanden el pedido; "Ocultar insumos" lo cierra.
7. "⋯" → Reprogramar → la fecha arranca vacía; una fecha de hoy o anterior muestra "La nueva fecha debe ser posterior a hoy." y bloquea; una futura saca la fila.
8. "⋯" → Cancelar → motivo obligatorio → sale la fila.
9. Ordenar por cada columna: asc → desc → orden por defecto.
10. Cambiar de página o de filtro limpia la selección.
11. Sidebar: "Programación sala de cirugías" queda activo; el breadcrumb vuelve a la agenda.
12. Ventana de 1280px de ancho: sin scroll horizontal de página.

- [ ] **Step 9: Commit**

```bash
git add src/app/programacion-sala-cirugias/revision src/Components/ProgramacionSalaCirugias/RevisionVencidas src/Components/ProgramacionSalaCirugias/modals/ReprogramarCirugiaModal src/Components/Sidebar/Sidebar.jsx
git commit -m "feat(sala-cirugias): página de revisión de programaciones vencidas"
```

---

### Task 4: Banner en la agenda

**Files:**
- Create: `src/Components/ProgramacionSalaCirugias/RevisionPendienteBanner/RevisionPendienteBanner.jsx` + `.css`
- Modify: `src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx` (import + montaje tras `.psc-page-header`)

**Interfaces:**
- Consumes: `fetchVencidas`, `fechaISO` (mock); `contarPorTipo` (revisionVencidas); ruta de la Task 3.
- Produces: `<RevisionPendienteBanner />` sin props.

- [ ] **Step 1: Componente**

`RevisionPendienteBanner/RevisionPendienteBanner.jsx`:

```jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LuArrowRight, LuTriangleAlert } from 'react-icons/lu';
import { fechaISO, fetchVencidas } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { contarPorTipo } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './RevisionPendienteBanner.css';

// Aviso en la agenda cuando hay programaciones vencidas sin cerrar (spec
// 2026-09-25): no bloquea el trabajo diario, pero el pendiente siempre se
// ve. Se calcula al montar -- volver desde la revisión lo remonta y refleja
// lo resuelto allá.
export default function RevisionPendienteBanner() {
  const [conteo, setConteo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchVencidas({ hoy: fechaISO(new Date()) }).then((items) => {
      if (!cancelled) setConteo(contarPorTipo(items));
    });
    return () => { cancelled = true; };
  }, []);

  if (!conteo || conteo.total === 0) return null;

  return (
    <div className="rpb-banner" role="status">
      <LuTriangleAlert className="rpb-icon" aria-hidden="true" />
      <p className="rpb-text">
        <strong>
          {conteo.total} {conteo.total === 1 ? 'programación vencida sin cerrar' : 'programaciones vencidas sin cerrar'}
        </strong>
        {conteo.insumos > 0 && <span> · {conteo.insumos} con insumos comprometidos</span>}
      </p>
      <Link href="/programacion-sala-cirugias/revision" className="rpb-link">
        Revisar
        <LuArrowRight className="rpb-link-icon" aria-hidden="true" />
      </Link>
    </div>
  );
}
```

`RevisionPendienteBanner.css`:

```css
.rpb-banner{
  display:flex;align-items:center;gap:10px;flex-shrink:0;
  padding:10px 16px;background:var(--amber-bg);color:var(--amber-fg);
  border-radius:var(--radius);font-size:var(--fs-base);
}
.rpb-icon{width:18px;height:18px;flex-shrink:0;}
.rpb-text{margin:0;flex:1;min-width:0;}
.rpb-text strong{font-weight:var(--fw-semibold);}
.rpb-link{
  display:inline-flex;align-items:center;gap:4px;flex-shrink:0;
  padding:4px 10px;border-radius:var(--radius);
  color:var(--amber-fg);font-weight:var(--fw-semibold);text-decoration:none;
}
.rpb-link:hover{background:rgba(164,90,5,.10);}
.rpb-link:focus-visible{outline:2px solid var(--amber-fg);outline-offset:1px;}
.rpb-link-icon{width:16px;height:16px;}
```

- [ ] **Step 2: Montarlo en la agenda**

En `ProgramacionSalaCirugias.jsx`:

1. Agregar el import después de `import NuevaUrgenciaModal from './modals/NuevaUrgenciaModal/NuevaUrgenciaModal';`:

```jsx
import RevisionPendienteBanner from './RevisionPendienteBanner/RevisionPendienteBanner';
```

2. Insertar `<RevisionPendienteBanner />` entre el cierre del `<div className="psc-page-header">…</div>` y `<div className="psc-workspace">`:

```jsx
          </div>

          <RevisionPendienteBanner />

          <div className="psc-workspace">
```

- [ ] **Step 3: Lint + ruta**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/RevisionPendienteBanner src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx`
Expected: sin errores.
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/programacion-sala-cirugias`
Expected: `200`.

- [ ] **Step 4: Verificación manual**

1. `/programacion-sala-cirugias` muestra el banner ámbar con el total y "· N con insumos comprometidos".
2. "Revisar" navega a la revisión.
3. En la revisión, resolver todas (seleccionar página por página → Marcar realizadas) → estado vacío "No hay programaciones vencidas" → "Volver a la agenda" → el banner ya no aparece.

- [ ] **Step 5: Commit**

```bash
git add src/Components/ProgramacionSalaCirugias/RevisionPendienteBanner src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx
git commit -m "feat(sala-cirugias): banner de programaciones vencidas en la agenda"
```
