# Hoja de gasto quirúrgico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modal "Hoja de gasto quirúrgico" abierto desde el detalle de una cirugía, con 11 secciones precargadas desde los datos de la cirugía, totales en COP y cierre con validaciones.

**Architecture:** Lógica pura (modelo, cálculos, validaciones, store en memoria) en `src/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto.js`, probada con `node --test`. UI: un modal shell con el estado de la hoja + componentes de sección por carpeta, apoyados en dos componentes comunes (`SeccionHoja`, `HojaTabla`).

**Tech Stack:** Next.js (ver `node_modules/next/dist/docs/` si algo no encaja), React con React Compiler, `react-icons/lu`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-01-hoja-gasto-quirurgico-design.md`

## Global Constraints

- Todo componente: carpeta propia con `Nombre.jsx` + `Nombre.css` (el `.jsx` importa su `.css`). Nada suelto.
- Rutas de componentes bajo `src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal/`; lógica bajo `src/hooks/ProgramacionSalaCirugias/hojaGasto/`.
- Estilos reutilizados por 2+ componentes van en `src/Components/ProgramacionSalaCirugias/shared/shared.css` (ya se importa desde `ProgramacionSalaCirugias.jsx`); las reglas exclusivas de un componente, en su `.css`.
- Tipografía solo con tokens: `var(--fs-*)` y `var(--fw-*)`; títulos `--fw-semibold`, nunca `--fw-bold`. Nada de `font-size:14px`.
- Modal con `@/Components/ModalHeader/ModalHeader`; botones con `@/Components/Button/Button`; badges con `@/Components/Badge/Badge`; selects con `@/Components/FormSelect/FormSelect` (`onChange` recibe el valor); nada de `<select>` nativo ni `<input type="date">`.
- Íconos solo `Lu*` de `react-icons/lu`.
- Fecha con hora: `DD.MES.AAAA - HH:mm` (ej. `21.AGO.2026 - 07:00`).
- Inputs siempre controlados: `value={x ?? ''}`, nunca `undefined`.
- Handlers que leen estado anulable usan `?.` (React Compiler).
- Breakpoints solo 768/1024/1440px.
- No hacer `git commit` salvo que el usuario lo pida (el árbol ya tiene cambios sin commitear ajenos a esta tarea).
- Textos de UI en español.

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `src/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto.js` | Modelo de la hoja, tarifas mock, cálculos, validaciones, store en memoria |
| `src/hooks/ProgramacionSalaCirugias/hojaGasto/__tests__/hojaGasto.test.mjs` | Tests de lo anterior |
| `.../HojaGastoQuirurgicoModal/HojaGastoQuirurgicoModal.{jsx,css}` | Shell: estado, índice, errores, pie con total y acciones |
| `.../HojaGastoQuirurgicoModal/comunes/SeccionHoja/` | Tarjeta de sección (título, ícono, total) |
| `.../HojaGastoQuirurgicoModal/comunes/HojaTabla/` | Tabla editable genérica por columnas |
| `.../HojaGastoQuirurgicoModal/secciones/EncabezadoSection/` | 1. Encabezado |
| `.../secciones/TiemposSection/` | 2. Tiempos + anestesia |
| `.../secciones/ProcedimientosSection/` | 3. Procedimientos |
| `.../secciones/HonorariosSection/` | 4. Equipo quirúrgico y honorarios |
| `.../secciones/InsumosSection/` | 5. Insumos y materiales |
| `.../secciones/MedicamentosSection/` | 6. Medicamentos y anestésicos |
| `.../secciones/ImplantesSection/` | 7. Implantes y material especial |
| `.../secciones/EquiposSalaSection/` | 8. Equipos y derechos de sala |
| `.../secciones/ConteoSection/` | 9. Conteo quirúrgico |
| `.../secciones/FirmasSection/` | 10. Observaciones y firmas |
| `.../secciones/ResumenSection/` | 11. Resumen |
| Modify `DetalleCirugiaPanel.jsx` | Botón "Hoja de gasto" + montar el modal |
| Modify `shared/shared.css` | Bloque `hgq-` compartido |

---

### Task 1: Lógica de la hoja (TDD)

**Files:**
- Create: `src/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto.js`
- Test: `src/hooks/ProgramacionSalaCirugias/hojaGasto/__tests__/hojaGasto.test.mjs`

**Interfaces:**
- Produces (exports usados por las tareas 3–7):
  `HOJA_ESTADO_LABEL`, `VIAS_OPTIONS`, `ROLES_HONORARIOS`, `CONTEO_ITEMS`,
  `aMinutos(hhmm)`, `minutosEntre(desde, hasta)`, `duracionesHoja(tiempos) -> {sala, anestesia, cirugia}` (minutos o `null`), `duracionTexto(min)`,
  `valorPorTiempo({minutos, tarifaHora})`, `valorDerechosSala({minutos, tarifaHora})`, `devueltoInsumo(i)`, `valorInsumo(i)`, `valorMedicamento(m)`,
  `conteoEstado({inicial, final}) -> 'pendiente'|'correcto'|'discrepancia'`,
  `totalesHoja(hoja)`, `validarCierre(hoja) -> [{seccion, mensaje}]`, `cerrarHoja(hoja, ahoraISO) -> {ok, errores, hoja}`, `firmarHoja(hoja, rol, ahoraISO|null)`,
  `construirHojaInicial(cirugia)`, `obtenerHojaGuardada(programacionId)`, `guardarHoja(hoja)`,
  `nuevoId(prefijo)`, `actualizarFila(rows, id, campo, valor)`, `quitarFila(rows, id)`, `formatoCOP(n)`, `fechaHoraHoja(iso)`.
- `seccion` de los errores ∈ `tiempos|anestesia|procedimientos|honorarios|insumos|implantes|conteo|firmas`.
- Forma de la hoja: `{ numero, programacionId, estado:'borrador'|'cerrada', cerradaEn, admision, tiempos:{ingresoSala,inicioAnestesia,inicioCirugia,finCirugia,salidaSala}, anestesia:{tipo,asa,complejidad}, procedimientos:[{id,nombre,cups,via,dxPre,dxPos}], honorarios:[{id,rol,nombre,registro,minutos,tarifaHora}], insumos:[{id,nombre,entregado,usado,valorUnitario,manual}], medicamentos:[{id,nombre,dosis,cantidad,valorUnitario}], implantes:[{id,nombre,invima,lote,serie,proveedor,valor}], equipos:[{id,nombre,identificacion,minutos,tarifaHora}], derechosSala:{minutos,tarifaHora}, conteo:[{id,item,inicial,final,manual}], observaciones, firmas:{circulante,instrumentadora,cirujano} }`. Los tiempos son `'HH:mm'`; las firmas, `'YYYY-MM-DDTHH:mm'` o `null`.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/hooks/ProgramacionSalaCirugias/hojaGasto/__tests__/hojaGasto.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aMinutos, minutosEntre, duracionesHoja, duracionTexto, valorPorTiempo, valorDerechosSala,
  conteoEstado, totalesHoja, validarCierre, cerrarHoja, firmarHoja, construirHojaInicial,
  obtenerHojaGuardada, guardarHoja, actualizarFila, quitarFila, fechaHoraHoja,
} from '../hojaGasto.js';

const cirugia = () => ({
  id: '99001',
  horaInicio: '07:30',
  horaFin: '09:30',
  procedimientos: [{ nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 120 }],
  personal: [
    { rol: 'Cirujano', nombre: 'Dr. Juan García' },
    { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
    { rol: 'Instrumentadora', nombre: 'María Fernández' },
    { rol: 'Circulante', nombre: 'Luis Ramírez' },
  ],
  equipos: [{ nombre: 'Torre de laparoscopia', identificacion: 'EQ-0412' }],
  canasta: {
    nombre: 'Colecistectomía estándar',
    items: [
      { nombre: 'Gasas estériles', cantidad: 10, solicitudFarmacia: 'entregado', recibido: 10 },
      { nombre: 'Trocar 5mm', cantidad: 2, solicitudFarmacia: 'entregado', recibido: 2 },
      { nombre: 'Clips de titanio', cantidad: 6, solicitudFarmacia: 'solicitado' },
    ],
  },
  farmacia: { medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }] },
  devoluciones: [{ consecutivo: 1, estado: 'activa', items: [{ nombre: 'Gasas estériles', cantidad: 2 }] }],
});

// Hoja que cumple todas las reglas de cierre.
function hojaLista() {
  const h = construirHojaInicial(cirugia());
  h.tiempos = { ingresoSala: '07:10', inicioAnestesia: '07:20', inicioCirugia: '07:30', finCirugia: '09:30', salidaSala: '09:45' };
  h.anestesia.tipo = 'General';
  h.procedimientos[0].cups = '511101';
  h.procedimientos[0].dxPos = 'K80.1';
  h.conteo.forEach((c) => { c.inicial = 10; c.final = 10; });
  h.firmas = { circulante: '2026-10-01T09:50', instrumentadora: '2026-10-01T09:50', cirujano: '2026-10-01T09:55' };
  return h;
}

test('aMinutos / minutosEntre: parsea HH:mm y rechaza vacíos', () => {
  assert.equal(aMinutos('07:30'), 450);
  assert.equal(aMinutos(''), null);
  assert.equal(minutosEntre('07:30', '09:30'), 120);
  assert.equal(minutosEntre('', '09:30'), null);
});

test('duracionesHoja: sala, anestesia y cirugía; null si el orden es inválido o falta un tiempo', () => {
  const d = duracionesHoja({ ingresoSala: '07:10', inicioAnestesia: '07:20', inicioCirugia: '07:30', finCirugia: '09:30', salidaSala: '09:45' });
  assert.deepEqual(d, { sala: 155, anestesia: 130, cirugia: 120 });
  const roto = duracionesHoja({ ingresoSala: '10:00', inicioAnestesia: '', inicioCirugia: '07:30', finCirugia: '09:30', salidaSala: '09:45' });
  assert.deepEqual(roto, { sala: null, anestesia: null, cirugia: 120 });
});

test('duracionTexto', () => {
  assert.equal(duracionTexto(null), '—');
  assert.equal(duracionTexto(45), '45 min');
  assert.equal(duracionTexto(120), '2 h');
  assert.equal(duracionTexto(130), '2 h 10 min');
});

test('valorPorTiempo y valorDerechosSala (bloques de 30 min)', () => {
  assert.equal(valorPorTiempo({ minutos: 120, tarifaHora: 450000 }), 900000);
  assert.equal(valorPorTiempo({ minutos: '', tarifaHora: 450000 }), 0);
  assert.equal(valorDerechosSala({ minutos: 100, tarifaHora: 240000 }), 480000); // 100 min -> 4 bloques = 120 min = 2 h
  assert.equal(valorDerechosSala({ minutos: 0, tarifaHora: 240000 }), 0);
});

test('conteoEstado', () => {
  assert.equal(conteoEstado({ inicial: null, final: 5 }), 'pendiente');
  assert.equal(conteoEstado({ inicial: '', final: '' }), 'pendiente');
  assert.equal(conteoEstado({ inicial: 5, final: 5 }), 'correcto');
  assert.equal(conteoEstado({ inicial: 5, final: 4 }), 'discrepancia');
});

test('construirHojaInicial: precarga desde la cirugía', () => {
  const h = construirHojaInicial(cirugia());
  assert.equal(h.numero, 'HG-99001');
  assert.equal(h.estado, 'borrador');
  assert.equal(h.tiempos.inicioCirugia, '07:30');
  assert.equal(h.tiempos.ingresoSala, '');
  assert.equal(h.honorarios.length, 4);
  assert.equal(h.honorarios[0].minutos, 120);
  assert.equal(h.derechosSala.minutos, 120);
  // solo los insumos ya entregados; usado = entregado - devuelto
  assert.deepEqual(h.insumos.map((i) => [i.nombre, i.entregado, i.usado]), [['Gasas estériles', 10, 8], ['Trocar 5mm', 2, 2]]);
  assert.equal(h.medicamentos[0].nombre, 'Cefazolina');
  assert.equal(h.equipos[0].identificacion, 'EQ-0412');
  assert.equal(h.conteo.length, 4);
  assert.deepEqual(h.firmas, { circulante: null, instrumentadora: null, cirujano: null });
});

test('totalesHoja: suma por categoría', () => {
  const h = construirHojaInicial(cirugia());
  h.implantes = [{ id: 'imp-1', nombre: 'Malla', invima: 'X', lote: 'L1', serie: '', proveedor: '', valor: 500000 }];
  const t = totalesHoja(h);
  // 120 min cada uno: cirujano 900000, anestesiólogo 640000, instrumentadora 180000, circulante 120000
  assert.equal(t.honorarios, 900000 + 640000 + 180000 + 120000);
  assert.equal(t.insumos, 8 * 1800 + 2 * 95000);
  assert.equal(t.implantes, 500000);
  assert.equal(t.total, t.honorarios + t.insumos + t.medicamentos + t.implantes + t.equipos + t.derechosSala);
});

test('validarCierre: hoja completa no tiene errores', () => {
  assert.deepEqual(validarCierre(hojaLista()), []);
});

test('validarCierre: detecta cada regla', () => {
  const h = hojaLista();
  h.tiempos.salidaSala = '09:00'; // antes del fin de cirugía
  h.anestesia.tipo = '';
  h.procedimientos[0].cups = '';
  h.insumos[0].usado = 99;
  h.implantes = [{ id: 'imp-1', nombre: 'Malla', invima: '', lote: '', serie: '', proveedor: '', valor: 1 }];
  h.conteo[0].final = 9;
  h.firmas.cirujano = null;
  const secciones = validarCierre(h).map((e) => e.seccion);
  assert.deepEqual(secciones, ['tiempos', 'anestesia', 'procedimientos', 'insumos', 'implantes', 'conteo', 'firmas']);
});

test('validarCierre: insumo sin cantidad usada cuenta como sin conciliar', () => {
  const h = hojaLista();
  h.insumos[0].usado = '';
  const e = validarCierre(h);
  assert.equal(e.length, 1);
  assert.equal(e[0].seccion, 'insumos');
});

test('cerrarHoja: bloquea con errores y cierra sin ellos', () => {
  const mala = hojaLista();
  mala.firmas.circulante = null;
  const r1 = cerrarHoja(mala, '2026-10-01T10:00');
  assert.equal(r1.ok, false);
  assert.equal(r1.hoja.estado, 'borrador');
  const r2 = cerrarHoja(hojaLista(), '2026-10-01T10:00');
  assert.equal(r2.ok, true);
  assert.equal(r2.hoja.estado, 'cerrada');
  assert.equal(r2.hoja.cerradaEn, '2026-10-01T10:00');
});

test('firmarHoja: firma y quita la firma', () => {
  const h = construirHojaInicial(cirugia());
  const f = firmarHoja(h, 'cirujano', '2026-10-01T09:55');
  assert.equal(f.firmas.cirujano, '2026-10-01T09:55');
  assert.equal(firmarHoja(f, 'cirujano', null).firmas.cirujano, null);
  assert.equal(h.firmas.cirujano, null); // no muta
});

test('store: guarda una copia y la devuelve', () => {
  assert.equal(obtenerHojaGuardada('nunca'), null);
  const h = construirHojaInicial(cirugia());
  guardarHoja(h);
  h.observaciones = 'cambio posterior';
  assert.equal(obtenerHojaGuardada('99001').observaciones, '');
});

test('actualizarFila / quitarFila no mutan', () => {
  const rows = [{ id: 'a', v: 1 }, { id: 'b', v: 2 }];
  assert.deepEqual(actualizarFila(rows, 'b', 'v', 9), [{ id: 'a', v: 1 }, { id: 'b', v: 9 }]);
  assert.deepEqual(quitarFila(rows, 'a'), [{ id: 'b', v: 2 }]);
  assert.equal(rows[1].v, 2);
});

test('fechaHoraHoja: DD.MES.AAAA - HH:mm', () => {
  assert.equal(fechaHoraHoja('2026-08-21T07:00'), '21.AGO.2026 - 07:00');
  assert.equal(fechaHoraHoja('2026-10-01T09:05'), '01.OCT.2026 - 09:05');
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `node --test "src/hooks/ProgramacionSalaCirugias/hojaGasto/__tests__/hojaGasto.test.mjs"`
Expected: FAIL (`Cannot find module '../hojaGasto.js'`).

- [ ] **Step 3: Implementar `hojaGasto.js`**

```js
import { cantidadDevuelta } from '../mockCirugiaData.js';

// Hoja de gasto quirúrgico: modelo, tarifas mock, cálculos, validaciones de
// cierre y store en memoria (sin persistencia real, ver spec).

export const HOJA_ESTADO_LABEL = { borrador: 'Borrador', cerrada: 'Cerrada' };

export const VIAS_OPTIONS = [
  { value: 'unica', label: 'Única' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'distinta', label: 'Distinta vía' },
];

export const ROLES_HONORARIOS = ['Cirujano', 'Ayudante', 'Anestesiólogo', 'Instrumentadora', 'Circulante'];
export const CONTEO_ITEMS = ['Gasas', 'Compresas', 'Agujas', 'Instrumental (sets)'];

// ---------- Tarifas de ejemplo (COP) ----------
const TARIFA_HORA_ROL = {
  Cirujano: 450000, Ayudante: 180000, Anestesiólogo: 320000, Instrumentadora: 90000, Circulante: 60000,
};
const TARIFA_HORA_ROL_DEFECTO = 100000;
const TARIFA_HORA_EQUIPO = 80000;
const TARIFA_HORA_SALA = 250000;
const VALOR_INSUMO = {
  'Gasas estériles': 1800,
  'Trocar 5mm': 95000,
  'Trocar 10mm': 110000,
  'Pinza Maryland': 240000,
  'Sutura Vicryl 2-0': 18500,
  'Clips de titanio': 12000,
  'Aguja de Veress': 38000,
  'Bolsa de extracción': 52000,
  'Solución salina 1000ml': 6500,
  'Campo quirúrgico': 14000,
  'Guantes estériles talla 7': 3800,
  'Hoja de bisturí #11': 2400,
};
const VALOR_INSUMO_DEFECTO = 15000;
const VALOR_MEDICAMENTO = { Cefazolina: 9800, 'Ondansetrón': 4200 };
const VALOR_MEDICAMENTO_DEFECTO = 8000;

// ---------- Utilidades ----------
let secuencia = 1000;
export function nuevoId(prefijo) {
  secuencia += 1;
  return `${prefijo}-${secuencia}`;
}

export const actualizarFila = (rows, id, campo, valor) => rows.map((r) => (r.id === id ? { ...r, [campo]: valor } : r));
export const quitarFila = (rows, id) => rows.filter((r) => r.id !== id);

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
export const formatoCOP = (n) => COP.format(Number(n) || 0);

const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
// 'YYYY-MM-DDTHH:mm' -> 'DD.MES.AAAA - HH:mm'
export function fechaHoraHoja(iso) {
  const [fecha, hora] = iso.split('T');
  const [y, m, d] = fecha.split('-');
  return `${d}.${MES[Number(m) - 1]}.${y} - ${hora}`;
}

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const n0 = (v) => Number(v) || 0;

// ---------- Tiempos ----------
export function aMinutos(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm ?? '')) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function minutosEntre(desde, hasta) {
  const a = aMinutos(desde);
  const b = aMinutos(hasta);
  if (a === null || b === null) return null;
  return b - a;
}

const noNegativo = (min) => (min !== null && min >= 0 ? min : null);

export function duracionesHoja(t) {
  return {
    sala: noNegativo(minutosEntre(t.ingresoSala, t.salidaSala)),
    anestesia: noNegativo(minutosEntre(t.inicioAnestesia, t.finCirugia)),
    cirugia: noNegativo(minutosEntre(t.inicioCirugia, t.finCirugia)),
  };
}

export function duracionTexto(min) {
  if (min === null || min === undefined) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

// ---------- Valores ----------
export const valorPorTiempo = ({ minutos, tarifaHora }) => Math.round((n0(minutos) / 60) * n0(tarifaHora));
// Derechos de sala: se facturan por bloques de 30 min iniciados.
export const valorDerechosSala = ({ minutos, tarifaHora }) => Math.round((Math.ceil(n0(minutos) / 30) * 30 / 60) * n0(tarifaHora));
export const devueltoInsumo = (i) => Math.max(n0(i.entregado) - n0(i.usado), 0);
export const valorInsumo = (i) => n0(i.usado) * n0(i.valorUnitario);
export const valorMedicamento = (m) => n0(m.cantidad) * n0(m.valorUnitario);

export function conteoEstado({ inicial, final }) {
  const a = num(inicial);
  const b = num(final);
  if (a === null || b === null) return 'pendiente';
  return a === b ? 'correcto' : 'discrepancia';
}

const suma = (rows, fn) => rows.reduce((t, r) => t + fn(r), 0);

export function totalesHoja(h) {
  const honorarios = suma(h.honorarios, valorPorTiempo);
  const insumos = suma(h.insumos, valorInsumo);
  const medicamentos = suma(h.medicamentos, valorMedicamento);
  const implantes = suma(h.implantes, (i) => n0(i.valor));
  const equipos = suma(h.equipos, valorPorTiempo);
  const derechosSala = valorDerechosSala(h.derechosSala);
  return {
    honorarios,
    insumos,
    medicamentos,
    implantes,
    equipos,
    derechosSala,
    total: honorarios + insumos + medicamentos + implantes + equipos + derechosSala,
  };
}

// ---------- Cierre ----------
export function validarCierre(h) {
  const errores = [];
  const err = (seccion, mensaje) => errores.push({ seccion, mensaje });

  const t = h.tiempos;
  const orden = [t.ingresoSala, t.inicioAnestesia, t.inicioCirugia, t.finCirugia, t.salidaSala];
  if (orden.some((v) => aMinutos(v) === null)) {
    err('tiempos', 'Completa los 5 tiempos de la cirugía.');
  } else if (orden.some((v, i) => i > 0 && aMinutos(v) < aMinutos(orden[i - 1]))) {
    err('tiempos', 'Los tiempos deben ir en orden: ingreso a sala, inicio de anestesia, inicio y fin de cirugía, salida de sala.');
  }

  if (!h.anestesia.tipo) err('anestesia', 'Selecciona el tipo de anestesia.');

  if (h.procedimientos.length === 0 || h.procedimientos.some((p) => !p.cups.trim() || !p.dxPos.trim())) {
    err('procedimientos', 'Cada procedimiento necesita código CUPS y diagnóstico posoperatorio.');
  }

  if (!h.honorarios.some((f) => f.rol === 'Cirujano' && n0(f.minutos) > 0)) {
    err('honorarios', 'Registra el tiempo del cirujano.');
  }

  if (h.insumos.some((i) => num(i.usado) === null)) {
    err('insumos', 'Hay insumos sin cantidad usada: concilia todos los insumos.');
  } else if (h.insumos.some((i) => !i.manual && n0(i.usado) > n0(i.entregado))) {
    err('insumos', 'Un insumo tiene más cantidad usada que entregada.');
  }

  if (h.implantes.some((i) => !i.invima.trim() || !i.lote.trim())) {
    err('implantes', 'Cada implante necesita registro INVIMA y lote.');
  }

  if (h.conteo.some((c) => conteoEstado(c) !== 'correcto')) {
    err('conteo', 'El conteo quirúrgico debe estar completo y sin discrepancias.');
  }

  [['circulante', 'circulante'], ['instrumentadora', 'instrumentadora'], ['cirujano', 'cirujano']].forEach(([clave, rol]) => {
    if (!h.firmas[clave]) err('firmas', `Falta la firma del ${rol}.`);
  });

  return errores;
}

export function cerrarHoja(hoja, ahoraISO) {
  const errores = validarCierre(hoja);
  if (errores.length > 0) return { ok: false, errores, hoja };
  return { ok: true, errores: [], hoja: { ...hoja, estado: 'cerrada', cerradaEn: ahoraISO } };
}

export const firmarHoja = (hoja, rol, ahoraISO) => ({ ...hoja, firmas: { ...hoja.firmas, [rol]: ahoraISO } });

// ---------- Construcción desde la cirugía ----------
export function construirHojaInicial(cirugia) {
  const duracion = Math.max(minutosEntre(cirugia.horaInicio, cirugia.horaFin) ?? 0, 0);
  return {
    numero: `HG-${cirugia.id}`,
    programacionId: cirugia.id,
    estado: 'borrador',
    cerradaEn: null,
    admision: '',
    tiempos: {
      ingresoSala: '',
      inicioAnestesia: '',
      inicioCirugia: cirugia.horaInicio ?? '',
      finCirugia: cirugia.horaFin ?? '',
      salidaSala: '',
    },
    anestesia: { tipo: '', asa: '', complejidad: '' },
    procedimientos: cirugia.procedimientos.map((p, i) => ({
      id: `proc-${i}`, nombre: p.nombre, cups: '', via: 'unica', dxPre: '', dxPos: '',
    })),
    honorarios: cirugia.personal.map((p, i) => ({
      id: `hon-${i}`, rol: p.rol, nombre: p.nombre, registro: '', minutos: duracion, tarifaHora: TARIFA_HORA_ROL[p.rol] ?? TARIFA_HORA_ROL_DEFECTO,
    })),
    insumos: cirugia.canasta.items
      .filter((i) => i.solicitudFarmacia === 'entregado')
      .map((i, idx) => {
        const entregado = i.recibido ?? i.cantidad;
        return {
          id: `ins-${idx}`,
          nombre: i.nombre,
          entregado,
          usado: Math.max(entregado - cantidadDevuelta(cirugia, i.nombre), 0),
          valorUnitario: VALOR_INSUMO[i.nombre] ?? VALOR_INSUMO_DEFECTO,
          manual: false,
        };
      }),
    medicamentos: (cirugia.farmacia?.medicamentos ?? []).map((m, i) => ({
      id: `med-${i}`, nombre: m.nombre, dosis: m.dosis ?? '', cantidad: 1, valorUnitario: VALOR_MEDICAMENTO[m.nombre] ?? VALOR_MEDICAMENTO_DEFECTO,
    })),
    implantes: [],
    equipos: (cirugia.equipos ?? []).map((e, i) => ({
      id: `eq-${i}`, nombre: e.nombre, identificacion: e.identificacion ?? '', minutos: duracion, tarifaHora: TARIFA_HORA_EQUIPO,
    })),
    derechosSala: { minutos: duracion, tarifaHora: TARIFA_HORA_SALA },
    conteo: CONTEO_ITEMS.map((item, i) => ({
      id: `con-${i}`, item, inicial: '', final: '', manual: false,
    })),
    observaciones: '',
    firmas: { circulante: null, instrumentadora: null, cirujano: null },
  };
}

// ---------- Store en memoria ----------
const hojasGuardadas = new Map();
export const obtenerHojaGuardada = (programacionId) => {
  const h = hojasGuardadas.get(programacionId);
  return h ? structuredClone(h) : null;
};
export const guardarHoja = (hoja) => {
  hojasGuardadas.set(hoja.programacionId, structuredClone(hoja));
};
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `node --test "src/hooks/ProgramacionSalaCirugias/hojaGasto/__tests__/hojaGasto.test.mjs"`
Expected: PASS, todos los tests.

- [ ] **Step 5: Correr toda la suite**

Run: `npm test`
Expected: PASS (los tests existentes no se tocan).

---

### Task 2: Estilos compartidos + componentes comunes (`SeccionHoja`, `HojaTabla`)

**Files:**
- Modify: `src/Components/ProgramacionSalaCirugias/shared/shared.css` (agregar un bloque al final)
- Create: `.../HojaGastoQuirurgicoModal/comunes/SeccionHoja/SeccionHoja.{jsx,css}`
- Create: `.../HojaGastoQuirurgicoModal/comunes/HojaTabla/HojaTabla.{jsx,css}`

**Interfaces:**
- Produces:
  `<SeccionHoja id icon titulo total? error? children />` — `id` es el id DOM de la sección (`hgq-<seccion>`), `total` un número COP opcional, `error` booleano que pinta borde rojo.
  `<HojaTabla ariaLabel columns rows onChangeRow(id, campo, valor) onAddRow? onRemoveRow(id)? canRemove(row)? addLabel emptyLabel readOnly footer? />` con `columns: [{ key, label, type: 'text'|'number'|'select'|'calc', align?: 'right', options?, placeholder?, min?, render?(row), editable?(row) }]`.

- [ ] **Step 1: Agregar al final de `shared/shared.css`**

```css
/* ---------- Hoja de gasto quirúrgico (HojaGastoQuirurgicoModal y sus secciones) ---------- */
/* Reutilizado por 2+ secciones; las reglas exclusivas viven en cada .css. */
.hgq-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px 16px;}
.hgq-grid .wide{grid-column:span 2;}
.hgq-input{width:100%;box-sizing:border-box;height:var(--input-sm, 34px);padding:0 10px;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--ink-900);font:inherit;font-size:var(--fs-base);}
.hgq-input:focus-visible{outline:2px solid var(--primary);outline-offset:1px;}
.hgq-input:disabled{background:var(--gray-bg);color:var(--ink-500);}
.hgq-input-num{text-align:right;}
.hgq-field-label{display:block;margin-bottom:4px;font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-700);}
```

- [ ] **Step 2: `SeccionHoja`**

`SeccionHoja.jsx`:

```jsx
import './SeccionHoja.css';
import { formatoCOP } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Tarjeta de una sección de la hoja: ícono + título (h4) + total opcional
// a la derecha. `id` es el ancla del índice lateral del modal.
export default function SeccionHoja({
  id, icon: Icon, titulo, total, error = false, children,
}) {
  return (
    <section id={id} className={`hgq-section${error ? ' has-error' : ''}`} aria-labelledby={`${id}-titulo`}>
      <header className="hgq-section-head">
        {Icon && <Icon className="icon hgq-section-icon" aria-hidden="true" />}
        <h4 id={`${id}-titulo`}>{titulo}</h4>
        {total !== undefined && <span className="hgq-section-total">{formatoCOP(total)}</span>}
      </header>
      <div className="hgq-section-body">{children}</div>
    </section>
  );
}
```

`SeccionHoja.css`:

```css
.hgq-section{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);scroll-margin-top:8px;}
.hgq-section.has-error{border-color:var(--red);}
.hgq-section-head{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);}
.hgq-section-head h4{margin:0;font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.hgq-section-icon{width:18px;height:18px;color:var(--ink-500);}
.hgq-section-total{margin-left:auto;font-size:var(--fs-base);font-weight:var(--fw-bold);color:var(--ink-900);}
.hgq-section-body{padding:16px;}
```

- [ ] **Step 3: `HojaTabla`**

`HojaTabla.jsx`:

```jsx
'use client';

import { LuPlus, LuTrash2 } from 'react-icons/lu';
import './HojaTabla.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';

function Celda({ col, row, editable, base, onChange }) {
  const valor = row[col.key];
  const esEditable = editable && col.type !== 'calc' && (col.editable ? col.editable(row) : true);
  if (!esEditable) {
    return <span className="hgq-static">{col.render ? col.render(row) : (valor === '' || valor === null || valor === undefined ? '—' : valor)}</span>;
  }
  const aria = `${col.label} (${base})`;
  if (col.type === 'select') {
    return (
      <FormSelect
        id={`${base}-${col.key}`}
        value={valor ?? ''}
        onChange={(v) => onChange(col.key, v)}
        options={col.options}
        placeholder={col.placeholder ?? 'Selecciona'}
      />
    );
  }
  if (col.type === 'number') {
    return (
      <input
        type="number"
        className="hgq-input hgq-input-num"
        min={col.min ?? 0}
        value={valor ?? ''}
        aria-label={aria}
        onChange={(e) => onChange(col.key, e.target.value === '' ? '' : Number(e.target.value))}
      />
    );
  }
  return (
    <input
      type="text"
      className="hgq-input"
      value={valor ?? ''}
      placeholder={col.placeholder}
      aria-label={aria}
      onChange={(e) => onChange(col.key, e.target.value)}
    />
  );
}

export default function HojaTabla({
  ariaLabel, columns, rows, onChangeRow, onAddRow, onRemoveRow, canRemove,
  addLabel = 'Agregar fila', emptyLabel = 'Sin registros', readOnly = false,
}) {
  const editable = !readOnly;
  const conAcciones = editable && Boolean(onRemoveRow);
  return (
    <div className="hgq-table-block">
      <div className="hgq-table-wrap">
        <table className="hgq-table" aria-label={ariaLabel}>
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key} className={c.align === 'right' ? 'hgq-num' : undefined}>{c.label}</th>)}
              {conAcciones && <th className="hgq-col-accion" aria-label="Acciones" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="hgq-empty" colSpan={columns.length + (conAcciones ? 1 : 0)}>{emptyLabel}</td></tr>
            )}
            {rows.map((row, idx) => (
              <tr key={row.id}>
                {columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'hgq-num' : undefined}>
                    <Celda
                      col={c}
                      row={row}
                      editable={editable}
                      base={`${ariaLabel} fila ${idx + 1}`}
                      onChange={(campo, valor) => onChangeRow(row.id, campo, valor)}
                    />
                  </td>
                ))}
                {conAcciones && (
                  <td className="hgq-col-accion">
                    {(!canRemove || canRemove(row)) && (
                      <button
                        type="button"
                        className="hgq-row-remove"
                        aria-label={`Quitar fila ${idx + 1} de ${ariaLabel}`}
                        onClick={() => onRemoveRow(row.id)}
                      >
                        <LuTrash2 className="icon" aria-hidden="true" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editable && onAddRow && (
        <div className="hgq-table-add">
          <Button variant="secondary" size="sm" icon={LuPlus} onClick={onAddRow}>{addLabel}</Button>
        </div>
      )}
    </div>
  );
}
```

`HojaTabla.css`:

```css
.hgq-table-wrap{overflow-x:auto;}
.hgq-table{width:100%;border-collapse:collapse;font-size:var(--fs-base);}
.hgq-table th{padding:8px 10px;text-align:left;white-space:nowrap;background:var(--table-header-bg);border-bottom:1px solid var(--border);font-size:var(--th-fs);font-weight:var(--th-fw);color:var(--th-color);}
.hgq-table td{padding:6px 10px;border-bottom:1px solid var(--border);vertical-align:middle;}
.hgq-table .hgq-num{text-align:right;}
.hgq-static{color:var(--ink-700);}
.hgq-empty{padding:16px 10px;text-align:center;color:var(--ink-500);}
.hgq-col-accion{width:44px;text-align:center;}
.hgq-row-remove{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border:0;border-radius:8px;background:transparent;color:var(--ink-500);cursor:pointer;}
.hgq-row-remove:hover{background:var(--gray-bg);color:var(--red);}
.hgq-row-remove:focus-visible{outline:2px solid var(--primary);outline-offset:2px;}
.hgq-table-add{padding-top:12px;}
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal`
Expected: sin errores.

---

### Task 3: Secciones de formulario (Encabezado, Tiempos, Firmas)

**Files (cada una con `.jsx` + `.css`):**
- Create: `.../secciones/EncabezadoSection/EncabezadoSection.{jsx,css}`
- Create: `.../secciones/TiemposSection/TiemposSection.{jsx,css}`
- Create: `.../secciones/FirmasSection/FirmasSection.{jsx,css}`

**Interfaces:**
- Consumes: Task 1 (`HOJA_ESTADO_LABEL`, `duracionesHoja`, `duracionTexto`, `fechaHoraHoja`), Task 2 (`SeccionHoja`, clases `hgq-grid`, `hgq-input`, `hgq-field-label`).
- Produces:
  `<EncabezadoSection cirugia hoja admision onChangeAdmision readOnly error />`
  `<TiemposSection tiempos anestesia onChangeTiempos(nextTiempos) onChangeAnestesia(nextAnestesia) readOnly errorTiempos errorAnestesia />`
  `<FirmasSection observaciones onChangeObservaciones nombres:{circulante,instrumentadora,cirujano} firmas onFirmar(rol, iso|null) ahoraISO readOnly error />` — `ahoraISO` es una función `() => string` (el modal pasa `() => fechaHoraLocalISO(new Date())`).

- [ ] **Step 1: `EncabezadoSection`**

```jsx
import { LuClipboardList } from 'react-icons/lu';
import './EncabezadoSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import Badge from '@/Components/Badge/Badge';
import { HOJA_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { SALAS, fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

function Dato({ label, children, wide = false }) {
  return (
    <div className={`hgq-dato${wide ? ' wide' : ''}`}>
      <div className="hgq-dato-label">{label}</div>
      <div className="hgq-dato-valor">{children}</div>
    </div>
  );
}

export default function EncabezadoSection({
  cirugia, hoja, admision, onChangeAdmision, readOnly, error,
}) {
  const sala = SALAS.find((s) => s.value === cirugia.salaId)?.descripcion ?? '—';
  return (
    <SeccionHoja id="hgq-encabezado" icon={LuClipboardList} titulo="Encabezado" error={error}>
      <div className="hgq-grid">
        <Dato label="N° de hoja">{hoja.numero}</Dato>
        <Dato label="N° de programación">{cirugia.id}</Dato>
        <Dato label="Estado">
          <Badge tone={hoja.estado === 'cerrada' ? 'success' : 'warn'}>{HOJA_ESTADO_LABEL[hoja.estado]}</Badge>
        </Dato>
        <Dato label="Fecha y hora programada" wide>{fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}</Dato>
        <Dato label="Paciente" wide>{cirugia.paciente.nombre}</Dato>
        <Dato label="Documento">{cirugia.paciente.documento}</Dato>
        <Dato label="Aseguradora / contrato">{cirugia.paciente.aseguradora}</Dato>
        <Dato label="Sala">{sala}</Dato>
        <Dato label="Servicio">{cirugia.servicio}</Dato>
        <Dato label="Tipo de cirugía">{cirugia.tipoCirugia}</Dato>
        <div>
          <label htmlFor="hgq-admision" className="hgq-field-label">N° de admisión</label>
          <input
            id="hgq-admision"
            className="hgq-input"
            value={admision ?? ''}
            disabled={readOnly}
            onChange={(e) => onChangeAdmision(e.target.value)}
          />
        </div>
      </div>
    </SeccionHoja>
  );
}
```

`EncabezadoSection.css`:

```css
.hgq-dato-label{font-size:var(--fs-sm);color:var(--ink-500);margin-bottom:2px;}
.hgq-dato-valor{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
```

- [ ] **Step 2: `TiemposSection`**

```jsx
import { LuTimer } from 'react-icons/lu';
import './TiemposSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { duracionesHoja, duracionTexto } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { ASA_CATALOGO, COMPLEJIDAD_CATALOGO, TIPOS_ANESTESIA_CATALOGO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const TIEMPOS = [
  { key: 'ingresoSala', label: 'Ingreso a sala' },
  { key: 'inicioAnestesia', label: 'Inicio de anestesia' },
  { key: 'inicioCirugia', label: 'Inicio de cirugía' },
  { key: 'finCirugia', label: 'Fin de cirugía' },
  { key: 'salidaSala', label: 'Salida de sala' },
];
const opciones = (lista) => lista.map((v) => ({ value: v, label: v }));

export default function TiemposSection({
  tiempos, anestesia, onChangeTiempos, onChangeAnestesia, readOnly, errorTiempos, errorAnestesia,
}) {
  const d = duracionesHoja(tiempos);
  return (
    <>
      <SeccionHoja id="hgq-tiempos" icon={LuTimer} titulo="Tiempos" error={errorTiempos}>
        <div className="hgq-grid">
          {TIEMPOS.map((t) => (
            <div key={t.key}>
              <label htmlFor={`hgq-${t.key}`} className="hgq-field-label">{t.label}</label>
              <input
                id={`hgq-${t.key}`}
                type="time"
                className="hgq-input"
                value={tiempos[t.key] ?? ''}
                disabled={readOnly}
                onChange={(e) => onChangeTiempos({ ...tiempos, [t.key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <dl className="hgq-duraciones">
          <div><dt>Duración de cirugía</dt><dd>{duracionTexto(d.cirugia)}</dd></div>
          <div><dt>Duración de anestesia</dt><dd>{duracionTexto(d.anestesia)}</dd></div>
          <div><dt>Ocupación de sala</dt><dd>{duracionTexto(d.sala)}</dd></div>
        </dl>
      </SeccionHoja>

      <SeccionHoja id="hgq-anestesia" icon={LuTimer} titulo="Anestesia y clasificación" error={errorAnestesia}>
        <div className="hgq-grid">
          <div className="form-field">
            <label htmlFor="hgq-anestesia-tipo" className="hgq-field-label">Tipo de anestesia</label>
            <FormSelect id="hgq-anestesia-tipo" value={anestesia.tipo} disabled={readOnly} options={opciones(TIPOS_ANESTESIA_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, tipo: v })} />
          </div>
          <div className="form-field wide">
            <label htmlFor="hgq-anestesia-asa" className="hgq-field-label">ASA</label>
            <FormSelect id="hgq-anestesia-asa" value={anestesia.asa} disabled={readOnly} options={opciones(ASA_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, asa: v })} />
          </div>
          <div className="form-field">
            <label htmlFor="hgq-anestesia-complejidad" className="hgq-field-label">Complejidad</label>
            <FormSelect id="hgq-anestesia-complejidad" value={anestesia.complejidad} disabled={readOnly} options={opciones(COMPLEJIDAD_CATALOGO)} placeholder="Selecciona una opción" onChange={(v) => onChangeAnestesia({ ...anestesia, complejidad: v })} />
          </div>
        </div>
      </SeccionHoja>
    </>
  );
}
```

`TiemposSection.css`:

```css
.hgq-duraciones{display:flex;flex-wrap:wrap;gap:12px 32px;margin:16px 0 0;padding-top:12px;border-top:1px solid var(--border);}
.hgq-duraciones dt{font-size:var(--fs-sm);color:var(--ink-500);}
.hgq-duraciones dd{margin:2px 0 0;font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
```

Nota: el id de la sección "anestesia" (`hgq-anestesia`) es el ancla del error `anestesia`; el índice lateral (Task 5) la agrupa con Tiempos.

- [ ] **Step 3: `FirmasSection`**

```jsx
import { LuPenLine } from 'react-icons/lu';
import './FirmasSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import Button from '@/Components/Button/Button';
import { fechaHoraHoja } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const FIRMAS = [
  { rol: 'circulante', label: 'Circulante' },
  { rol: 'instrumentadora', label: 'Instrumentadora' },
  { rol: 'cirujano', label: 'Cirujano' },
];

export default function FirmasSection({
  observaciones, onChangeObservaciones, nombres, firmas, onFirmar, ahoraISO, readOnly, error,
}) {
  return (
    <SeccionHoja id="hgq-firmas" icon={LuPenLine} titulo="Observaciones y firmas" error={error}>
      <div className="form-field">
        <label htmlFor="hgq-observaciones" className="hgq-field-label">Observaciones</label>
        <textarea
          id="hgq-observaciones"
          rows={3}
          className="hgq-input hgq-textarea"
          value={observaciones ?? ''}
          disabled={readOnly}
          onChange={(e) => onChangeObservaciones(e.target.value)}
        />
      </div>
      <div className="hgq-firmas">
        {FIRMAS.map((f) => {
          const firmada = firmas[f.rol];
          return (
            <div key={f.rol} className={`hgq-firma${firmada ? ' firmada' : ''}`}>
              <div className="hgq-firma-rol">{f.label}</div>
              <div className="hgq-firma-nombre">{nombres[f.rol] || '—'}</div>
              <div className="hgq-firma-fecha">{firmada ? `Firmada ${fechaHoraHoja(firmada)}` : 'Pendiente de firma'}</div>
              {!readOnly && (
                <Button
                  variant={firmada ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => onFirmar(f.rol, firmada ? null : ahoraISO())}
                >
                  {firmada ? 'Quitar firma' : 'Firmar'}
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </SeccionHoja>
  );
}
```

`FirmasSection.css`:

```css
.hgq-textarea{height:auto;padding:8px 10px;resize:vertical;}
.hgq-firmas{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:16px;}
.hgq-firma{display:flex;flex-direction:column;gap:4px;align-items:flex-start;padding:12px;border:1px solid var(--border);border-radius:var(--radius);}
.hgq-firma.firmada{border-color:var(--primary);background:var(--primary-50);}
.hgq-firma-rol{font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-500);}
.hgq-firma-nombre{font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-900);}
.hgq-firma-fecha{font-size:var(--fs-sm);color:var(--ink-500);margin-bottom:4px;}
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal`
Expected: sin errores.

---

### Task 4: Secciones con tabla (Procedimientos, Honorarios, Insumos, Medicamentos, Implantes, EquiposSala, Conteo, Resumen)

**Files (cada una `.jsx` + `.css`):** `.../secciones/{ProcedimientosSection,HonorariosSection,InsumosSection,MedicamentosSection,ImplantesSection,EquiposSalaSection,ConteoSection,ResumenSection}/`

**Interfaces:**
- Consumes: Task 1 y 2 (`HojaTabla`, `SeccionHoja`, helpers de filas y valores).
- Produces (todas reciben `readOnly` y `error` donde aplica):
  `<ProcedimientosSection rows onChange(nextRows) readOnly error />`
  `<HonorariosSection rows onChange readOnly error />`
  `<InsumosSection rows onChange readOnly error />`
  `<MedicamentosSection rows onChange readOnly />`
  `<ImplantesSection rows onChange readOnly error />`
  `<EquiposSalaSection equipos derechosSala onChangeEquipos onChangeDerechos readOnly />`
  `<ConteoSection rows onChange readOnly error />`
  `<ResumenSection totales />`

Las 8 siguen el mismo esqueleto; cada `.css` es el comentario `/* Estilos compartidos: shared/shared.css y comunes/HojaTabla. */` salvo donde se indica abajo.

- [ ] **Step 1: `ProcedimientosSection`**

```jsx
import { LuScissors } from 'react-icons/lu';
import './ProcedimientosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { VIAS_OPTIONS, actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Procedimiento' },
  { key: 'cups', label: 'CUPS', placeholder: 'Código' },
  { key: 'via', label: 'Vía', type: 'select', options: VIAS_OPTIONS },
  { key: 'dxPre', label: 'Dx preoperatorio', placeholder: 'CIE-10' },
  { key: 'dxPos', label: 'Dx posoperatorio', placeholder: 'CIE-10' },
];

export default function ProcedimientosSection({ rows, onChange, readOnly, error }) {
  return (
    <SeccionHoja id="hgq-procedimientos" icon={LuScissors} titulo="Procedimientos realizados" error={error}>
      <HojaTabla
        ariaLabel="Procedimientos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('proc'), nombre: '', cups: '', via: 'unica', dxPre: '', dxPos: '' }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar procedimiento"
      />
    </SeccionHoja>
  );
}
```

- [ ] **Step 2: `HonorariosSection`**

```jsx
import { LuUsers } from 'react-icons/lu';
import './HonorariosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  ROLES_HONORARIOS, actualizarFila, formatoCOP, nuevoId, quitarFila, valorPorTiempo,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'rol', label: 'Rol', type: 'select', options: ROLES_HONORARIOS.map((r) => ({ value: r, label: r })) },
  { key: 'nombre', label: 'Profesional' },
  { key: 'registro', label: 'Registro profesional' },
  { key: 'minutos', label: 'Minutos', type: 'number', align: 'right' },
  { key: 'tarifaHora', label: 'Tarifa por hora', type: 'number', align: 'right' },
  { key: 'valor', label: 'Valor', type: 'calc', align: 'right', render: (r) => formatoCOP(valorPorTiempo(r)) },
];

export default function HonorariosSection({ rows, onChange, readOnly, error }) {
  const total = rows.reduce((t, r) => t + valorPorTiempo(r), 0);
  return (
    <SeccionHoja id="hgq-honorarios" icon={LuUsers} titulo="Equipo quirúrgico y honorarios" total={total} error={error}>
      <HojaTabla
        ariaLabel="Honorarios"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('hon'), rol: 'Ayudante', nombre: '', registro: '', minutos: 0, tarifaHora: 180000 }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar profesional"
      />
    </SeccionHoja>
  );
}
```

- [ ] **Step 3: `InsumosSection`**

```jsx
import { LuPackage } from 'react-icons/lu';
import './InsumosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  actualizarFila, devueltoInsumo, formatoCOP, nuevoId, quitarFila, valorInsumo,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Los insumos que vienen de la canasta no se renombran ni cambian su cantidad
// entregada (eso lo fijó farmacia): solo se concilia lo usado. Los agregados
// a mano (`manual`) sí son totalmente editables.
const esManual = (r) => r.manual;
const COLUMNS = [
  { key: 'nombre', label: 'Insumo', editable: esManual },
  { key: 'entregado', label: 'Entregado', type: 'number', align: 'right', editable: esManual },
  { key: 'usado', label: 'Usado', type: 'number', align: 'right' },
  { key: 'devuelto', label: 'Devuelto', type: 'calc', align: 'right', render: (r) => devueltoInsumo(r) },
  { key: 'valorUnitario', label: 'Valor unitario', type: 'number', align: 'right', editable: esManual },
  { key: 'total', label: 'Total', type: 'calc', align: 'right', render: (r) => formatoCOP(valorInsumo(r)) },
];

export default function InsumosSection({ rows, onChange, readOnly, error }) {
  const total = rows.reduce((t, r) => t + valorInsumo(r), 0);
  return (
    <SeccionHoja id="hgq-insumos" icon={LuPackage} titulo="Insumos y materiales" total={total} error={error}>
      <HojaTabla
        ariaLabel="Insumos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        emptyLabel="Aún no hay insumos entregados por farmacia. Agrega los que se usaron."
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('ins'), nombre: '', entregado: 0, usado: 1, valorUnitario: 0, manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar insumo no contemplado"
      />
    </SeccionHoja>
  );
}
```

- [ ] **Step 4: `MedicamentosSection`**

```jsx
import { LuPill } from 'react-icons/lu';
import './MedicamentosSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  actualizarFila, formatoCOP, nuevoId, quitarFila, valorMedicamento,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Medicamento' },
  { key: 'dosis', label: 'Dosis / vía' },
  { key: 'cantidad', label: 'Cantidad', type: 'number', align: 'right' },
  { key: 'valorUnitario', label: 'Valor unitario', type: 'number', align: 'right' },
  { key: 'total', label: 'Total', type: 'calc', align: 'right', render: (r) => formatoCOP(valorMedicamento(r)) },
];

export default function MedicamentosSection({ rows, onChange, readOnly }) {
  const total = rows.reduce((t, r) => t + valorMedicamento(r), 0);
  return (
    <SeccionHoja id="hgq-medicamentos" icon={LuPill} titulo="Medicamentos y anestésicos" total={total}>
      <HojaTabla
        ariaLabel="Medicamentos"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, { id: nuevoId('med'), nombre: '', dosis: '', cantidad: 1, valorUnitario: 0 }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar medicamento"
      />
    </SeccionHoja>
  );
}
```

- [ ] **Step 5: `ImplantesSection`**

```jsx
import { LuBone } from 'react-icons/lu';
import './ImplantesSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { actualizarFila, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Implante / material' },
  { key: 'invima', label: 'Registro INVIMA' },
  { key: 'lote', label: 'Lote' },
  { key: 'serie', label: 'Serie' },
  { key: 'proveedor', label: 'Proveedor' },
  { key: 'valor', label: 'Valor', type: 'number', align: 'right' },
];

export default function ImplantesSection({ rows, onChange, readOnly, error }) {
  const total = rows.reduce((t, r) => t + (Number(r.valor) || 0), 0);
  return (
    <SeccionHoja id="hgq-implantes" icon={LuBone} titulo="Implantes y material especial" total={total} error={error}>
      <HojaTabla
        ariaLabel="Implantes"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        emptyLabel="Sin implantes ni material especial."
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('imp'), nombre: '', invima: '', lote: '', serie: '', proveedor: '', valor: 0,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        addLabel="Agregar implante"
      />
    </SeccionHoja>
  );
}
```

Si `LuBone` no existe en `react-icons/lu`, usar el `Lu*` más cercano (verificar con `grep -c "LuBone" node_modules/react-icons/lu/index.mjs`; alternativa `LuShield`).

- [ ] **Step 6: `EquiposSalaSection`**

```jsx
import { LuMonitorCog } from 'react-icons/lu';
import './EquiposSalaSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import {
  actualizarFila, formatoCOP, nuevoId, quitarFila, valorDerechosSala, valorPorTiempo,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'nombre', label: 'Equipo' },
  { key: 'identificacion', label: 'Identificación' },
  { key: 'minutos', label: 'Minutos de uso', type: 'number', align: 'right' },
  { key: 'tarifaHora', label: 'Tarifa por hora', type: 'number', align: 'right' },
  { key: 'valor', label: 'Valor', type: 'calc', align: 'right', render: (r) => formatoCOP(valorPorTiempo(r)) },
];

export default function EquiposSalaSection({
  equipos, derechosSala, onChangeEquipos, onChangeDerechos, readOnly,
}) {
  const total = equipos.reduce((t, r) => t + valorPorTiempo(r), 0) + valorDerechosSala(derechosSala);
  return (
    <SeccionHoja id="hgq-equipos" icon={LuMonitorCog} titulo="Equipos y derechos de sala" total={total}>
      <HojaTabla
        ariaLabel="Equipos"
        columns={COLUMNS}
        rows={equipos}
        readOnly={readOnly}
        emptyLabel="Sin equipos registrados."
        onChangeRow={(id, campo, valor) => onChangeEquipos(actualizarFila(equipos, id, campo, valor))}
        onAddRow={() => onChangeEquipos([...equipos, {
          id: nuevoId('eq'), nombre: '', identificacion: '', minutos: 0, tarifaHora: 80000,
        }])}
        onRemoveRow={(id) => onChangeEquipos(quitarFila(equipos, id))}
        addLabel="Agregar equipo"
      />
      <div className="hgq-grid hgq-derechos">
        <div>
          <label htmlFor="hgq-sala-min" className="hgq-field-label">Derechos de sala: minutos</label>
          <input id="hgq-sala-min" type="number" min={0} className="hgq-input hgq-input-num" disabled={readOnly}
            value={derechosSala.minutos ?? ''}
            onChange={(e) => onChangeDerechos({ ...derechosSala, minutos: e.target.value === '' ? '' : Number(e.target.value) })} />
        </div>
        <div>
          <label htmlFor="hgq-sala-tarifa" className="hgq-field-label">Tarifa por hora</label>
          <input id="hgq-sala-tarifa" type="number" min={0} className="hgq-input hgq-input-num" disabled={readOnly}
            value={derechosSala.tarifaHora ?? ''}
            onChange={(e) => onChangeDerechos({ ...derechosSala, tarifaHora: e.target.value === '' ? '' : Number(e.target.value) })} />
        </div>
        <div>
          <div className="hgq-field-label">Valor derechos de sala (bloques de 30 min)</div>
          <div className="hgq-derechos-valor">{formatoCOP(valorDerechosSala(derechosSala))}</div>
        </div>
      </div>
    </SeccionHoja>
  );
}
```

`EquiposSalaSection.css`:

```css
.hgq-derechos{margin-top:16px;padding-top:12px;border-top:1px solid var(--border);align-items:end;}
.hgq-derechos-valor{font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
```

- [ ] **Step 7: `ConteoSection`**

```jsx
import { LuListChecks } from 'react-icons/lu';
import './ConteoSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import Badge from '@/Components/Badge/Badge';
import { actualizarFila, conteoEstado, nuevoId, quitarFila } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const ESTADO = {
  pendiente: { tone: 'neutral', label: 'Pendiente' },
  correcto: { tone: 'success', label: 'Correcto' },
  discrepancia: { tone: 'danger', label: 'Discrepancia' },
};
const esManual = (r) => r.manual;
const COLUMNS = [
  { key: 'item', label: 'Elemento', editable: esManual },
  { key: 'inicial', label: 'Conteo inicial', type: 'number', align: 'right' },
  { key: 'final', label: 'Conteo final', type: 'number', align: 'right' },
  {
    key: 'estado',
    label: 'Estado',
    type: 'calc',
    render: (r) => {
      const e = ESTADO[conteoEstado(r)];
      return <Badge tone={e.tone}>{e.label}</Badge>;
    },
  },
];

export default function ConteoSection({ rows, onChange, readOnly, error }) {
  return (
    <SeccionHoja id="hgq-conteo" icon={LuListChecks} titulo="Conteo quirúrgico" error={error}>
      <HojaTabla
        ariaLabel="Conteo quirúrgico"
        columns={COLUMNS}
        rows={rows}
        readOnly={readOnly}
        onChangeRow={(id, campo, valor) => onChange(actualizarFila(rows, id, campo, valor))}
        onAddRow={() => onChange([...rows, {
          id: nuevoId('con'), item: '', inicial: '', final: '', manual: true,
        }])}
        onRemoveRow={(id) => onChange(quitarFila(rows, id))}
        canRemove={esManual}
        addLabel="Agregar elemento"
      />
    </SeccionHoja>
  );
}
```

- [ ] **Step 8: `ResumenSection`**

```jsx
import { LuReceipt } from 'react-icons/lu';
import './ResumenSection.css';
import SeccionHoja from '../../comunes/SeccionHoja/SeccionHoja';
import HojaTabla from '../../comunes/HojaTabla/HojaTabla';
import { formatoCOP } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

const COLUMNS = [
  { key: 'categoria', label: 'Categoría' },
  { key: 'valor', label: 'Subtotal', type: 'calc', align: 'right', render: (r) => formatoCOP(r.subtotal) },
];

export default function ResumenSection({ totales }) {
  const rows = [
    { id: 'honorarios', categoria: 'Honorarios', subtotal: totales.honorarios },
    { id: 'insumos', categoria: 'Insumos y materiales', subtotal: totales.insumos },
    { id: 'medicamentos', categoria: 'Medicamentos y anestésicos', subtotal: totales.medicamentos },
    { id: 'implantes', categoria: 'Implantes y material especial', subtotal: totales.implantes },
    { id: 'equipos', categoria: 'Equipos', subtotal: totales.equipos },
    { id: 'derechos', categoria: 'Derechos de sala', subtotal: totales.derechosSala },
    { id: 'total', categoria: 'Total de la hoja', subtotal: totales.total },
  ];
  return (
    <SeccionHoja id="hgq-resumen" icon={LuReceipt} titulo="Resumen">
      <HojaTabla ariaLabel="Resumen de gastos" columns={COLUMNS} rows={rows} readOnly onChangeRow={() => {}} />
    </SeccionHoja>
  );
}
```

`ResumenSection.css`:

```css
/* La última fila (total) se destaca por peso, no por color (ver AGENTS.md "Tipografía"). */
#hgq-resumen .hgq-table tbody tr:last-child td{font-weight:var(--fw-bold);border-bottom:0;}
```

- [ ] **Step 9: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal`
Expected: sin errores. Verificar que cada icono `Lu*` existe: `grep -c "LuScissors\|LuUsers\|LuPackage\b\|LuPill\|LuMonitorCog\|LuListChecks\|LuReceipt\|LuPenLine\|LuTimer\|LuClipboardList" node_modules/react-icons/lu/index.mjs` y sustituir los que falten por el más cercano.

---

### Task 5: Modal shell

**Files:**
- Create: `.../HojaGastoQuirurgicoModal/HojaGastoQuirurgicoModal.{jsx,css}`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: `<HojaGastoQuirurgicoModal cirugia onClose />` (abre siempre con la hoja guardada o una nueva; cerrar guarda el borrador automáticamente si no está cerrada).

- [ ] **Step 1: `HojaGastoQuirurgicoModal.jsx`**

```jsx
'use client';

import { useEffect, useState } from 'react';
import {
  LuClipboardList, LuLock, LuPrinter, LuSave,
} from 'react-icons/lu';
import './HojaGastoQuirurgicoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import EncabezadoSection from './secciones/EncabezadoSection/EncabezadoSection';
import TiemposSection from './secciones/TiemposSection/TiemposSection';
import ProcedimientosSection from './secciones/ProcedimientosSection/ProcedimientosSection';
import HonorariosSection from './secciones/HonorariosSection/HonorariosSection';
import InsumosSection from './secciones/InsumosSection/InsumosSection';
import MedicamentosSection from './secciones/MedicamentosSection/MedicamentosSection';
import ImplantesSection from './secciones/ImplantesSection/ImplantesSection';
import EquiposSalaSection from './secciones/EquiposSalaSection/EquiposSalaSection';
import ConteoSection from './secciones/ConteoSection/ConteoSection';
import FirmasSection from './secciones/FirmasSection/FirmasSection';
import ResumenSection from './secciones/ResumenSection/ResumenSection';
import {
  HOJA_ESTADO_LABEL, cerrarHoja, construirHojaInicial, firmarHoja, formatoCOP, guardarHoja,
  obtenerHojaGuardada, totalesHoja,
} from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';
import { fechaHoraLocalISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Índice lateral: cada entrada hace scroll a la sección con ese id y se
// marca con punto rojo si el último intento de cierre dejó un error en
// alguna de las `secciones` de validarCierre que agrupa.
const NAV = [
  { id: 'hgq-encabezado', label: 'Encabezado', errores: [] },
  { id: 'hgq-tiempos', label: 'Tiempos y anestesia', errores: ['tiempos', 'anestesia'] },
  { id: 'hgq-procedimientos', label: 'Procedimientos', errores: ['procedimientos'] },
  { id: 'hgq-honorarios', label: 'Equipo y honorarios', errores: ['honorarios'] },
  { id: 'hgq-insumos', label: 'Insumos y materiales', errores: ['insumos'] },
  { id: 'hgq-medicamentos', label: 'Medicamentos', errores: [] },
  { id: 'hgq-implantes', label: 'Implantes', errores: ['implantes'] },
  { id: 'hgq-equipos', label: 'Equipos y sala', errores: [] },
  { id: 'hgq-conteo', label: 'Conteo quirúrgico', errores: ['conteo'] },
  { id: 'hgq-firmas', label: 'Observaciones y firmas', errores: ['firmas'] },
  { id: 'hgq-resumen', label: 'Resumen', errores: [] },
];

const ahoraISO = () => fechaHoraLocalISO(new Date());
const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export default function HojaGastoQuirurgicoModal({ cirugia, onClose }) {
  const [hoja, setHoja] = useState(() => obtenerHojaGuardada(cirugia.id) ?? construirHojaInicial(cirugia));
  const [errores, setErrores] = useState([]);
  const [aviso, setAviso] = useState('');
  const readOnly = hoja.estado === 'cerrada';
  const totales = totalesHoja(hoja);
  const seccionesConError = errores.map((e) => e.seccion);
  const set = (clave, valor) => setHoja((h) => ({ ...h, [clave]: valor }));
  const nombreDe = (rol) => hoja.honorarios.find((f) => f.rol === rol)?.nombre ?? '';

  // Cerrar la ventana guarda el borrador: no se pierde lo digitado.
  function cerrar() {
    if (!readOnly) guardarHoja(hoja);
    onClose();
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') cerrar();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  function guardarBorrador() {
    guardarHoja(hoja);
    setAviso('Borrador guardado.');
  }

  function cerrarLaHoja() {
    const r = cerrarHoja(hoja, ahoraISO());
    if (!r.ok) {
      setErrores(r.errores);
      setAviso('');
      const primera = NAV.find((n) => n.errores.includes(r.errores[0].seccion));
      if (primera) irA(primera.id);
      return;
    }
    setErrores([]);
    setHoja(r.hoja);
    guardarHoja(r.hoja);
    setAviso('Hoja cerrada. Cargos generados en la cuenta de la admisión.');
  }

  return (
    <div className="modal-overlay open" role="presentation" onClick={cerrar}>
      <div
        className="modal-card hgq-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hgq-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuClipboardList}
          tone="primary"
          title="Hoja de gasto quirúrgico"
          titleId="hgq-title"
          subtitle={`Programación ${cirugia.id} · ${cirugia.paciente.nombre}`}
          onClose={cerrar}
          closeLabel="Cerrar hoja de gasto"
          trailing={<Badge tone={readOnly ? 'success' : 'warn'}>{HOJA_ESTADO_LABEL[hoja.estado]}</Badge>}
        />

        <div className="hgq-layout">
          <nav className="hgq-nav" aria-label="Secciones de la hoja">
            {NAV.map((n) => (
              <button key={n.id} type="button" className="hgq-nav-item" onClick={() => irA(n.id)}>
                {n.label}
                {n.errores.some((s) => seccionesConError.includes(s)) && <span className="hgq-nav-dot" aria-label="Con errores" />}
              </button>
            ))}
          </nav>

          <div className="hgq-body">
            {errores.length > 0 && (
              <div className="hgq-errores" role="alert">
                <strong>No se puede cerrar la hoja:</strong>
                <ul>{errores.map((e) => <li key={e.mensaje}>{e.mensaje}</li>)}</ul>
              </div>
            )}
            {aviso && <div className="hgq-aviso" role="status">{aviso}</div>}

            <EncabezadoSection cirugia={cirugia} hoja={hoja} admision={hoja.admision} onChangeAdmision={(v) => set('admision', v)} readOnly={readOnly} />
            <TiemposSection
              tiempos={hoja.tiempos}
              anestesia={hoja.anestesia}
              onChangeTiempos={(v) => set('tiempos', v)}
              onChangeAnestesia={(v) => set('anestesia', v)}
              readOnly={readOnly}
              errorTiempos={seccionesConError.includes('tiempos')}
              errorAnestesia={seccionesConError.includes('anestesia')}
            />
            <ProcedimientosSection rows={hoja.procedimientos} onChange={(v) => set('procedimientos', v)} readOnly={readOnly} error={seccionesConError.includes('procedimientos')} />
            <HonorariosSection rows={hoja.honorarios} onChange={(v) => set('honorarios', v)} readOnly={readOnly} error={seccionesConError.includes('honorarios')} />
            <InsumosSection rows={hoja.insumos} onChange={(v) => set('insumos', v)} readOnly={readOnly} error={seccionesConError.includes('insumos')} />
            <MedicamentosSection rows={hoja.medicamentos} onChange={(v) => set('medicamentos', v)} readOnly={readOnly} />
            <ImplantesSection rows={hoja.implantes} onChange={(v) => set('implantes', v)} readOnly={readOnly} error={seccionesConError.includes('implantes')} />
            <EquiposSalaSection
              equipos={hoja.equipos}
              derechosSala={hoja.derechosSala}
              onChangeEquipos={(v) => set('equipos', v)}
              onChangeDerechos={(v) => set('derechosSala', v)}
              readOnly={readOnly}
            />
            <ConteoSection rows={hoja.conteo} onChange={(v) => set('conteo', v)} readOnly={readOnly} error={seccionesConError.includes('conteo')} />
            <FirmasSection
              observaciones={hoja.observaciones}
              onChangeObservaciones={(v) => set('observaciones', v)}
              nombres={{ circulante: nombreDe('Circulante'), instrumentadora: nombreDe('Instrumentadora'), cirujano: nombreDe('Cirujano') }}
              firmas={hoja.firmas}
              onFirmar={(rol, iso) => setHoja((h) => firmarHoja(h, rol, iso))}
              ahoraISO={ahoraISO}
              readOnly={readOnly}
              error={seccionesConError.includes('firmas')}
            />
            <ResumenSection totales={totales} />
          </div>
        </div>

        <div className="hgq-footer">
          <div className="hgq-footer-total">
            <span>Total de la hoja</span>
            <strong>{formatoCOP(totales.total)}</strong>
          </div>
          <div className="hgq-footer-acciones">
            <Button variant="secondary" icon={LuPrinter} onClick={() => window.print()}>Imprimir</Button>
            {!readOnly && <Button variant="secondary" icon={LuSave} onClick={guardarBorrador}>Guardar borrador</Button>}
            {!readOnly && <Button icon={LuLock} onClick={cerrarLaHoja}>Cerrar hoja</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Si `ModalHeader` no acepta `trailing`, usar el prop equivalente que declare su `.jsx` (el detalle de cirugía usa `titleAdornment`; leer `src/Components/ModalHeader/ModalHeader.jsx` antes y ajustar). Si `Button` no tiene `variant="secondary"` con `size`, usar los valores válidos de su `.jsx`.

- [ ] **Step 2: `HojaGastoQuirurgicoModal.css`**

```css
/* .modal-overlay/.modal-card/.modal-body y los tokens viven en shared/shared.css. */
.modal-card.hgq-card{width:min(1180px,96vw);height:min(860px,94vh);display:flex;flex-direction:column;overflow:hidden;}
.hgq-layout{display:grid;grid-template-columns:208px 1fr;flex:1;min-height:0;}
.hgq-nav{display:flex;flex-direction:column;gap:2px;padding:12px 8px;border-right:1px solid var(--border);overflow-y:auto;}
.hgq-nav-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border:0;border-radius:8px;background:transparent;color:var(--ink-700);font:inherit;font-size:var(--fs-base);font-weight:var(--fw-medium);text-align:left;cursor:pointer;}
.hgq-nav-item:hover{background:var(--gray-bg);}
.hgq-nav-item:focus-visible{outline:2px solid var(--primary);outline-offset:2px;}
.hgq-nav-dot{width:8px;height:8px;border-radius:50%;background:var(--red);}
.hgq-body{display:flex;flex-direction:column;gap:16px;padding:16px 24px;overflow-y:auto;}
.hgq-errores{padding:12px 16px;border:1px solid var(--red);border-radius:var(--radius);background:var(--red-bg);color:var(--red);font-size:var(--fs-base);}
.hgq-errores ul{margin:6px 0 0;padding-left:18px;}
.hgq-aviso{padding:10px 16px;border-radius:var(--radius);background:var(--primary-50);color:var(--primary);font-size:var(--fs-base);font-weight:var(--fw-medium);}
.hgq-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 24px;border-top:1px solid var(--border);}
.hgq-footer-total{display:flex;flex-direction:column;font-size:var(--fs-sm);color:var(--ink-500);}
.hgq-footer-total strong{font-size:var(--fs-xl);font-weight:var(--fw-bold);color:var(--ink-900);}
.hgq-footer-acciones{display:flex;gap:10px;}

/* Tablet: el índice pasa a una tira horizontal sobre el cuerpo. */
@media (max-width:1024px){
  .hgq-layout{grid-template-columns:1fr;grid-template-rows:auto 1fr;}
  .hgq-nav{flex-direction:row;border-right:0;border-bottom:1px solid var(--border);overflow-x:auto;overflow-y:hidden;}
  .hgq-nav-item{white-space:nowrap;}
  .hgq-body{padding:16px;}
}

/* Imprimir: solo la hoja, sin índice ni acciones. */
@media print{
  body *{visibility:hidden;}
  .hgq-card,.hgq-card *{visibility:visible;}
  .modal-overlay{position:static;background:none;}
  .modal-card.hgq-card{position:absolute;inset:0;width:100%;height:auto;overflow:visible;box-shadow:none;}
  .hgq-nav,.hgq-footer-acciones,.hgq-table-add,.hgq-col-accion{display:none;}
  .hgq-layout{display:block;}
  .hgq-body{overflow:visible;}
}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal`
Expected: sin errores. Ojo con `react-hooks/*`: el `useEffect` sin dependencias que llama `cerrar` es intencional (re-suscribe en cada render para ver el `hoja` actual); si ESLint se queja, declarar `cerrar` con `useCallback`/ref o mover el guardado a una `useRef` actualizada en el render.

---

### Task 6: Integración en el detalle de la cirugía

**Files:**
- Modify: `src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.jsx`

**Interfaces:**
- Consumes: `<HojaGastoQuirurgicoModal cirugia onClose />` (Task 5).

- [ ] **Step 1: Import, ícono y estado**

Agregar `LuClipboardList` al import de `react-icons/lu` y:

```jsx
import HojaGastoQuirurgicoModal from '../modals/HojaGastoQuirurgicoModal/HojaGastoQuirurgicoModal';
```

Junto al estado de `cancelarSolicitudAbierto`:

```jsx
const [hojaGastoAbierta, setHojaGastoAbierta] = useState(false);
const subventanaAbierta = cancelarSolicitudAbierto || hojaGastoAbierta;
```

(reemplaza la línea actual `const subventanaAbierta = cancelarSolicitudAbierto;`) y en el bloque que resetea al cambiar de cirugía (`if ((cirugia?.id ?? null) !== lastCirugiaId) {...}`) agregar `setHojaGastoAbierta(false);`.

- [ ] **Step 2: Botón en las acciones**

Dentro de `.dcp-actions-estado`, **antes** del botón "Editar":

```jsx
const puedeVerHojaGasto = !['cancelada', 'incumplida'].includes(cirugia.estado);
```

(declarar junto a `puedeAccionar`) y

```jsx
<Button variant="secondary-accent" icon={LuClipboardList} disabled={!puedeVerHojaGasto} title={puedeVerHojaGasto ? undefined : 'No disponible para cirugías canceladas o incumplidas'} onClick={() => setHojaGastoAbierta(true)}>Hoja de gasto</Button>
```

- [ ] **Step 3: Montar el modal**

Junto al `CancelarSolicitudInsumosModal`, dentro del fragment final:

```jsx
{hojaGastoAbierta && (
  <HojaGastoQuirurgicoModal cirugia={cirugia} onClose={() => setHojaGastoAbierta(false)} />
)}
```

- [ ] **Step 4: Lint**

Run: `npx eslint src/Components/ProgramacionSalaCirugias/DetalleCirugiaPanel/DetalleCirugiaPanel.jsx`
Expected: sin errores.

---

### Task 7: Verificación end-to-end

**Files:** ninguno (no se commitea nada salvo petición explícita).

- [ ] **Step 1: Suite y lint completos**

Run: `npm test` → PASS. Run: `npx eslint src/Components/ProgramacionSalaCirugias src/hooks/ProgramacionSalaCirugias` → sin errores nuevos.

- [ ] **Step 2: Levantar la app y probar en navegador headless (Playwright)**

`curl 200` no alcanza (React Compiler puede romper en runtime). Con el dev server arriba, abrir `/programacion-sala-cirugias`, elegir una cirugía de hoy `realizada` (p. ej. `12353`, Sofía Restrepo) y verificar:

1. El detalle muestra el botón "Hoja de gasto" habilitado; en una cirugía `cancelada` está deshabilitado.
2. El modal abre con el índice y las 11 secciones; consola sin errores ni warnings de "controlled → uncontrolled".
3. Precarga: 4 filas de honorarios con 2 h, insumos del pedido entregado, Cefazolina/Ondansetrón, Torre de laparoscopia, 4 filas de conteo.
4. "Cerrar hoja" con la hoja recién abierta: aparece el resumen de errores, el índice marca puntos rojos y el scroll salta a la primera sección con error.
5. Completar tiempos (07:10, 07:20, 07:30, 09:30, 09:45), tipo de anestesia, CUPS y Dx pos, conteo inicial = final, tres firmas → "Cerrar hoja" funciona: badge "Cerrada", aviso de cargos, campos deshabilitados, sin botones Guardar/Cerrar.
6. Cerrar el modal y reabrirlo: el borrador (o la hoja cerrada) persiste durante la sesión.
7. Viewport 768px: el índice pasa a tira horizontal y no hay scroll horizontal de página.
8. Vista de impresión (`page.emulateMedia({ media: 'print' })`): solo se ve la hoja.

- [ ] **Step 3: Reportar**

Informar al usuario qué se verificó y qué no (p. ej. si la verificación visual no se pudo correr).
