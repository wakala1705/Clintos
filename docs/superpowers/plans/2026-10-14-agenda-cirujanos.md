# Agenda de cirujanos — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar la configuración independiente "Agenda de cirujanos" (Cirugía → Configuración) que define cuándo está disponible cada cirujano, con listado, editor (horario semanal + excepciones) y vista previa semanal con cirugías en conflicto.

**Architecture:** Lógica de disponibilidad como funciones puras en `src/hooks/AgendaCirujanos/` (intervalos → disponibilidad efectiva → conflictos), probadas con `node --test` y tipadas con JSDoc + `@ts-check`. Una capa de servicio async sobre un store en memoria aísla los datos (reemplazable por la API). La UI son componentes de React en `src/Components/AgendaCirujanos/` sobre una sola ruta (`?cirujano=` abre el editor), que reutiliza el shell, los tokens y los componentes compartidos de la jornada de cirugía.

**Tech Stack:** Next.js 16 (App Router, React 19 + React Compiler), JavaScript con JSDoc, `react-icons/lu`, `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-14-agenda-cirujanos-design.md` (el plan precisa algunos detalles del spec; ver "Ajustes respecto del spec" al final).

## Global Constraints

- Fechas `'YYYY-MM-DD'`, horas `'HH:mm'`, días de la semana con índice 0 = lunes. Las funciones puras reciben `hoy` por parámetro; **nunca** llaman a `new Date()` (solo `hoyISO()` del servicio, en el borde).
- Jornada operativa configurable 07:00–19:00 (la de `JORNADAS.operativa`), bloques con inicio/fin cada 30 min.
- Estado de agenda: `sin-configurar` (sin horario), `vencida` (hasta < hoy), `por-vencer` (hoy <= hasta <= hoy + 30 días), `configurada` (el resto, incluida "sin fecha de fin").
- Solo cuentan como conflicto las cirugías en estado `programada` o `urgencia` con fecha >= hoy.
- Si un cambio deja cirugías fuera de agenda **solo se advierte** (modal con lista y motivo). Nunca se cancela ni se reprograma nada.
- El horario semanal se guarda con botón; las excepciones se guardan al instante. Salir con horario sin guardar pide confirmación.
- Configuran ambos: Programación de cirugía (cualquier cirujano de su sede) y el propio cirujano (solo la suya).
- Fecha + hora se muestran como `DD.MES.AAAA - HH:mm` (`fechaHoraRangoLabel`).
- UI en español. Tipografía solo con `--fs-*` / `--fw-*`; botones con `<Button>` (`--btn-*`); modales con `<ModalHeader>`; selects con `<FormSelect>`; fechas con `<DatePicker>` (nunca `<select>` ni `<input type="date">` nativos).
- Breakpoints solo 768 / 1024 / 1440 px (en `@media`: `max-width:1024px`).
- Un componente = una carpeta con `Nombre.jsx` + `Nombre.css`. Nada de `.jsx`/`.css` sueltos.
- Ids de sede: el catálogo del Topbar (`SEDES_CATALOGO`, `'01'` = Norte) y `mockCirugiaData.SEDES` (`'02'` = Norte) **no coinciden**: la sede se resuelve por nombre, solo en `agendaCirujanosService.js`.
- El árbol de trabajo ya tiene cambios sin commitear de trabajo anterior (menú "Vista" de Programación). **No los incluyas en los commits**: usa siempre `git add <rutas explícitas>`, nunca `git add -A` / `git add .`.
- Mensajes de commit terminan con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Antes de escribir código en archivos de ruta de Next, la guía `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` aplica (en este plan ya está resuelta con `Suspense`).

## Convenciones de verificación

**Línea base (antes de la Tarea 1):** corre `npm test` y `npx eslint src` y anota el resultado. El repo puede tener tests o avisos de lint previos y ajenos a esta feature; las tareas piden "sin errores nuevos" respecto de esa base, y los archivos de la feature (que son nuevos) deben quedar sin errores ni avisos. No arregles lo preexistente.

Comandos que se repiten en las tareas (desde la raíz del repo, Git Bash):

```bash
# Tests de la feature (rápido)
node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/*.test.mjs

# Type-check estricto de la lógica pura (sin instalar TypeScript en el repo; excluye el hook de React)
npx -y -p typescript tsc --allowJs --noEmit --strict --target es2022 --module esnext --moduleResolution bundler --skipLibCheck --lib es2022,dom $(ls src/hooks/AgendaCirujanos/*.js | grep -v useAgendaEditor)

# Lint de la feature
npx eslint src/Components/AgendaCirujanos src/hooks/AgendaCirujanos src/app/cirugia/configuracion
```

Para la verificación en navegador (Tareas 5–9) se usa Playwright headless contra `npm run dev` (puerto 3000), con una carpeta de trabajo **fuera del repo**. Se prepara una sola vez en la Tarea 5. La fecha del navegador se fija en `2026-10-14` para que los datos de demo (cirugías del mock) sean deterministas.

---

## Mapa de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/hooks/AgendaCirujanos/tipos.js` | Solo `@typedef` JSDoc del modelo |
| `.../intervalos.js` | Aritmética de intervalos en minutos (unir, restar, cubrir) |
| `.../horario.js` | Fechas ISO + operaciones inmutables sobre el horario semanal |
| `.../formato.js` | Textos de horas, fechas, rangos y pluralización |
| `.../disponibilidad.js` | Disponibilidad efectiva de un día = base + aperturas − bloqueos |
| `.../conflictos.js` | Cirugías fuera de agenda, su motivo y los conflictos "nuevos" |
| `.../validaciones.js` | Errores de día, vigencia y excepción |
| `.../excepciones.js` | Motivos, borrador de excepción, orden |
| `.../estadoAgenda.js` | Estado de la agenda, días para vencer, próxima excepción |
| `.../listado.js` | Búsqueda sin tildes, filtro por estado, conteos |
| `.../permisos.js` | Quién edita la agenda de quién |
| `.../mockAgendaCirujanos.js` | Datos de ejemplo relativos a `hoy` |
| `.../agendaCirujanosService.js` | Capa async sobre un store en memoria (lo único que usa la UI) |
| `.../useAgendaEditor.js` | Estado del editor (borrador, guardado, excepciones, conflictos) |
| `src/Components/AgendaCirujanos/AgendaCirujanos.jsx` | Orquestador: shell, listado ↔ editor, toast |
| `.../ListadoCirujanos`, `CirujanosTable` | Listado con búsqueda, chips y tabla |
| `.../EditorAgenda` | Editor de un cirujano: cabecera, pestañas, modales |
| `.../PanelConfiguracion`, `HorarioSemanal`, `DiaHorario`, `CopiarADias` | Pestaña de horario semanal |
| `.../Excepciones`, `ExcepcionItem`, `modals/ExcepcionModal` | Pestaña de excepciones |
| `.../VistaPreviaSemanal`, `CalendarioSemanal` | Vista previa semanal |
| `.../modals/ImpactoModal`, `modals/SalirSinGuardarDialog` | Advertencia de conflictos y confirmación de salida |
| `src/Components/ToggleSwitch/` | `ToggleSwitch` movido a app-wide |
| `src/app/cirugia/configuracion/agenda-cirujanos/page.jsx` | Ruta (con `Suspense`) |

---

### Task 1: Intervalos, horario y formato (lógica pura)

**Files:**
- Create: `src/hooks/AgendaCirujanos/tipos.js`, `intervalos.js`, `horario.js`, `formato.js`
- Test: `src/hooks/AgendaCirujanos/__tests__/intervalos.test.mjs`, `horario.test.mjs`, `formato.test.mjs`

**Interfaces:**
- Consumes: `JORNADAS`, `MINUTOS_FRANJA`, `parseISO` de `src/hooks/ProgramacionSalaCirugias/gestion/agenda.js` (ya existen).
- Produces:
  - `intervalos.js`: `aMinutos(hora: string): number`, `deMinutos(min: number): string`, `unirIntervalos(Intervalo[]): Intervalo[]`, `restarIntervalos(a, b): Intervalo[]`, `cubre(intervalos, inicio, fin): boolean`; tipo `Intervalo = [number, number]`.
  - `horario.js`: constantes `INICIO_JORNADA` (420), `FIN_JORNADA` (1140), `DIAS_SEMANA`, `DIAS_SEMANA_CORTO`, `BLOQUE_POR_DEFECTO`; `aISO(Date)`, `sumarDias(fecha, n)`, `diaSemana(fecha)`, `lunesDe(fecha)`, `diasEntre(desde, hasta)`, `opcionesHora(desdeMin, hastaMin)`, `horarioVacio(hoy)`, `copiarDia(horario, origen, destinos)`, `alternarDia(horario, i, activo)`, `bloqueSiguiente(bloques)`, `agregarBloque(h, i)`, `quitarBloque(h, i, pos)`, `cambiarBloque(h, i, pos, campo, valor)`, `alternarSinFecha(h, sinFin)`, `horariosIguales(a, b)`.
  - `formato.js`: `formatoHoras(min)`, `cantidadCirugias(n)`, `resumenDia(dia)`, `fechaLabel(iso)`, `fechaCorta(iso)`, `rangoExcepcionLabel(excepcion)`, `rangoSemanaLabel(lunes)`.
  - Tipos del modelo (`tipos.js`): `Bloque`, `DiaHorario`, `HorarioSemanal`, `Excepcion`, `BorradorExcepcion`, `AgendaCirujano`, `Cirujano`, `FilaCirujano`, `EstadoAgenda`, `CirugiaAgenda`, `Conflicto`, `MotivoConflicto`, `AgendaEvaluable`, `UsuarioAgenda`.

- [ ] **Step 1: Escribir los tests (fallan porque los módulos no existen)**

Crea `src/hooks/AgendaCirujanos/__tests__/intervalos.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aMinutos, cubre, deMinutos, restarIntervalos, unirIntervalos,
} from '../intervalos.js';

test('aMinutos / deMinutos son inversas', () => {
  assert.equal(aMinutos('07:30'), 450);
  assert.equal(aMinutos('00:00'), 0);
  assert.equal(deMinutos(450), '07:30');
  assert.equal(deMinutos(aMinutos('19:00')), '19:00');
  assert.equal(deMinutos(5), '00:05');
});

test('unirIntervalos: une los que se tocan y los que se solapan', () => {
  assert.deepEqual(unirIntervalos([[420, 480], [480, 540]]), [[420, 540]]);
  assert.deepEqual(unirIntervalos([[0, 10], [5, 20], [30, 40]]), [[0, 20], [30, 40]]);
});

test('unirIntervalos: ordena la entrada y no la modifica', () => {
  const entrada = [[600, 660], [420, 480]];
  assert.deepEqual(unirIntervalos(entrada), [[420, 480], [600, 660]]);
  assert.deepEqual(entrada, [[600, 660], [420, 480]]);
  assert.deepEqual(unirIntervalos([]), []);
});

test('unirIntervalos: un intervalo contenido en otro no lo agranda', () => {
  assert.deepEqual(unirIntervalos([[420, 720], [480, 540]]), [[420, 720]]);
});

test('restarIntervalos: un hueco en el medio divide el intervalo', () => {
  assert.deepEqual(restarIntervalos([[420, 720]], [[480, 540]]), [[420, 480], [540, 720]]);
});

test('restarIntervalos: recorta bordes y elimina lo cubierto por completo', () => {
  assert.deepEqual(restarIntervalos([[420, 720]], [[400, 480]]), [[480, 720]]);
  assert.deepEqual(restarIntervalos([[420, 720]], [[600, 800]]), [[420, 600]]);
  assert.deepEqual(restarIntervalos([[420, 720]], [[400, 800]]), []);
});

test('restarIntervalos: lo que no se solapa (incluso si solo se toca) no cambia nada', () => {
  assert.deepEqual(restarIntervalos([[420, 480]], [[480, 540]]), [[420, 480]]);
  assert.deepEqual(restarIntervalos([[420, 480]], [[300, 420]]), [[420, 480]]);
  assert.deepEqual(restarIntervalos([[420, 480]], []), [[420, 480]]);
});

test('restarIntervalos: varios recortes seguidos', () => {
  assert.deepEqual(
    restarIntervalos([[420, 1080]], [[480, 540], [600, 660]]),
    [[420, 480], [540, 600], [660, 1080]],
  );
});

test('cubre: exige que UN solo intervalo contenga toda la franja', () => {
  assert.equal(cubre([[420, 720]], 480, 540), true);
  assert.equal(cubre([[420, 720]], 420, 720), true);
  assert.equal(cubre([[420, 720]], 400, 540), false);
  assert.equal(cubre([[420, 480], [540, 720]], 450, 600), false);
  assert.equal(cubre([], 450, 500), false);
});
```

Crea `src/hooks/AgendaCirujanos/__tests__/horario.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  agregarBloque, alternarDia, alternarSinFecha, aISO, bloqueSiguiente, cambiarBloque, copiarDia,
  diaSemana, diasEntre, FIN_JORNADA, horarioVacio, horariosIguales, INICIO_JORNADA, lunesDe,
  opcionesHora, quitarBloque, sumarDias,
} from '../horario.js';

const HOY = '2026-10-14'; // miércoles

test('la jornada operativa es 07:00–19:00 (420–1140 min)', () => {
  assert.equal(INICIO_JORNADA, 420);
  assert.equal(FIN_JORNADA, 1140);
});

test('sumarDias cruza fin de mes y de año', () => {
  assert.equal(sumarDias('2026-10-31', 1), '2026-11-01');
  assert.equal(sumarDias('2026-12-31', 1), '2027-01-01');
  assert.equal(sumarDias('2026-10-14', -14), '2026-09-30');
  assert.equal(sumarDias(HOY, 0), HOY);
});

test('aISO formatea en hora local con ceros', () => {
  assert.equal(aISO(new Date(2026, 0, 5)), '2026-01-05');
});

test('diaSemana: lunes = 0 y domingo = 6', () => {
  assert.equal(diaSemana('2026-10-12'), 0);
  assert.equal(diaSemana(HOY), 2);
  assert.equal(diaSemana('2026-10-18'), 6);
});

test('lunesDe devuelve el lunes de la semana (el domingo pertenece a la semana que termina)', () => {
  assert.equal(lunesDe(HOY), '2026-10-12');
  assert.equal(lunesDe('2026-10-12'), '2026-10-12');
  assert.equal(lunesDe('2026-10-18'), '2026-10-12');
  assert.equal(lunesDe('2026-10-19'), '2026-10-19');
});

test('diasEntre', () => {
  assert.equal(diasEntre('2026-10-14', '2026-11-13'), 30);
  assert.equal(diasEntre('2026-10-14', '2026-10-13'), -1);
  assert.equal(diasEntre(HOY, HOY), 0);
});

test('opcionesHora: cada 30 min, extremos incluidos, con forma de FormSelect', () => {
  const ops = opcionesHora(420, 600);
  assert.equal(ops.length, 7);
  assert.deepEqual(ops[0], { value: '07:00', label: '07:00' });
  assert.deepEqual(ops[1], { value: '07:30', label: '07:30' });
  assert.deepEqual(ops[6], { value: '10:00', label: '10:00' });
});

test('horarioVacio: 7 días apagados, vigente desde hoy y sin fecha de fin', () => {
  const h = horarioVacio(HOY);
  assert.equal(h.desde, HOY);
  assert.equal(h.hasta, null);
  assert.equal(h.dias.length, 7);
  assert.ok(h.dias.every((d) => d.activo === false && d.bloques.length === 1));
  h.dias[0].bloques[0].inicio = '09:00';
  assert.equal(horarioVacio(HOY).dias[1].bloques[0].inicio, '07:00', 'cada día tiene su propio bloque');
});

test('copiarDia copia los bloques, activa los destinos y no toca el origen ni el original', () => {
  const base = horarioVacio(HOY);
  const conLunes = alternarDia(cambiarBloque(base, 0, 0, 'fin', '13:00'), 0, true);
  const copiado = copiarDia(conLunes, 0, [1, 2, 0]);
  assert.equal(copiado.dias[1].activo, true);
  assert.deepEqual(copiado.dias[1].bloques, [{ inicio: '07:00', fin: '13:00' }]);
  assert.equal(copiado.dias[3].activo, false);
  assert.equal(conLunes.dias[1].activo, false, 'el original no cambia');
  copiado.dias[1].bloques[0].fin = '08:00';
  assert.equal(copiado.dias[2].bloques[0].fin, '13:00', 'los bloques copiados no se comparten');
});

test('alternarDia: encender un día sin bloques le pone el de partida; apagar conserva los bloques', () => {
  const base = horarioVacio(HOY);
  const sinBloques = { ...base, dias: base.dias.map((d, i) => (i === 3 ? { activo: false, bloques: [] } : d)) };
  assert.deepEqual(alternarDia(sinBloques, 3, true).dias[3], { activo: true, bloques: [{ inicio: '07:00', fin: '12:00' }] });
  const encendido = alternarDia(base, 1, true);
  assert.equal(alternarDia(encendido, 1, false).dias[1].bloques.length, 1);
});

test('bloqueSiguiente arranca donde termina el último y dura 2 h como máximo', () => {
  assert.deepEqual(bloqueSiguiente([]), { inicio: '07:00', fin: '09:00' });
  assert.deepEqual(bloqueSiguiente([{ inicio: '07:00', fin: '12:00' }]), { inicio: '12:00', fin: '14:00' });
  assert.deepEqual(bloqueSiguiente([{ inicio: '07:00', fin: '18:00' }]), { inicio: '18:00', fin: '19:00' });
  assert.deepEqual(bloqueSiguiente([{ inicio: '07:00', fin: '19:00' }]), { inicio: '18:00', fin: '19:00' });
});

test('agregarBloque / quitarBloque / cambiarBloque solo tocan el día indicado', () => {
  const base = alternarDia(horarioVacio(HOY), 0, true);
  const con2 = agregarBloque(base, 0);
  assert.deepEqual(con2.dias[0].bloques, [{ inicio: '07:00', fin: '12:00' }, { inicio: '12:00', fin: '14:00' }]);
  assert.equal(base.dias[0].bloques.length, 1, 'el original no cambia');
  assert.equal(quitarBloque(con2, 0, 0).dias[0].bloques[0].inicio, '12:00');
  assert.equal(cambiarBloque(con2, 0, 1, 'inicio', '13:00').dias[0].bloques[1].inicio, '13:00');
  assert.equal(cambiarBloque(con2, 0, 1, 'inicio', '13:00').dias[1].bloques[0].inicio, '07:00');
});

test('alternarSinFecha: desmarcar propone desde + 90 días; marcar vuelve a null', () => {
  const h = horarioVacio(HOY);
  const conFin = alternarSinFecha(h, false);
  assert.equal(conFin.hasta, '2027-01-12');
  assert.equal(alternarSinFecha(conFin, true).hasta, null);
  assert.equal(alternarSinFecha({ ...h, desde: '' }, false).hasta, '');
});

test('horariosIguales compara por valor', () => {
  assert.equal(horariosIguales(horarioVacio(HOY), horarioVacio(HOY)), true);
  assert.equal(horariosIguales(horarioVacio(HOY), alternarDia(horarioVacio(HOY), 0, true)), false);
});
```

Crea `src/hooks/AgendaCirujanos/__tests__/formato.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cantidadCirugias, fechaCorta, fechaLabel, formatoHoras, rangoSemanaLabel, resumenDia,
} from '../formato.js';

test('cantidadCirugias: singular y plural', () => {
  assert.equal(cantidadCirugias(1), '1 cirugía');
  assert.equal(cantidadCirugias(0), '0 cirugías');
  assert.equal(cantidadCirugias(3), '3 cirugías');
});

test('formatoHoras: enteras sin decimales y medias con coma', () => {
  assert.equal(formatoHoras(420), '7 h');
  assert.equal(formatoHoras(450), '7,5 h');
  assert.equal(formatoHoras(0), '0 h');
});

test('resumenDia: bloques ordenados y total', () => {
  const dia = { activo: true, bloques: [{ inicio: '14:00', fin: '18:00' }, { inicio: '07:00', fin: '12:00' }] };
  assert.equal(resumenDia(dia), '07:00–12:00 · 14:00–18:00 (9 h)');
});

test('resumenDia: ignora bloques inválidos y devuelve vacío si no queda ninguno', () => {
  assert.equal(resumenDia({ activo: true, bloques: [{ inicio: '10:00', fin: '09:00' }] }), '');
  assert.equal(resumenDia({ activo: true, bloques: [] }), '');
  assert.equal(
    resumenDia({ activo: true, bloques: [{ inicio: '10:00', fin: '09:00' }, { inicio: '07:00', fin: '08:30' }] }),
    '07:00–08:30 (1,5 h)',
  );
});

test('fechaLabel y fechaCorta', () => {
  assert.equal(fechaLabel('2026-10-04'), '04/10/2026');
  assert.equal(fechaCorta('2026-10-04'), '4 oct');
  assert.equal(fechaCorta('2026-12-31'), '31 dic');
});

test('rangoSemanaLabel: mismo mes y cruce de mes', () => {
  assert.equal(rangoSemanaLabel('2026-10-12'), '12 – 18 oct 2026');
  assert.equal(rangoSemanaLabel('2026-09-28'), '28 sep – 4 oct 2026');
  assert.equal(rangoSemanaLabel('2026-12-28'), '28 dic – 3 ene 2027');
});
```

- [ ] **Step 2: Ejecutar y confirmar que FALLAN**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/intervalos.test.mjs src/hooks/AgendaCirujanos/__tests__/horario.test.mjs src/hooks/AgendaCirujanos/__tests__/formato.test.mjs`
Expected: los 3 archivos fallan con `ERR_MODULE_NOT_FOUND` (no existen `intervalos.js`, `horario.js`, `formato.js`).

- [ ] **Step 3: Crear los módulos**

Crea `src/hooks/AgendaCirujanos/tipos.js`:

```javascript
// @ts-check
// Solo definiciones de tipo (JSDoc) de la feature "Agenda de cirujanos". Sin
// código en runtime: los demás módulos las importan con
// `/** @typedef {import('./tipos.js').Bloque} Bloque */`.
//
// Convenciones: fechas 'YYYY-MM-DD', horas 'HH:mm', días de la semana con
// índice 0 = lunes. Las funciones puras reciben `hoy` por parámetro y nunca
// llaman a `new Date()`.

/** @typedef {{ inicio: string, fin: string }} Bloque */
/** @typedef {{ activo: boolean, bloques: Bloque[] }} DiaHorario */

/**
 * `hasta === null` significa "sin fecha de fin". `hasta === ''` solo existe
 * mientras se edita (casilla "Sin fecha de fin" desmarcada y fecha aún sin
 * elegir): `errorVigencia` lo marca y el horario no se puede guardar.
 * `dias` siempre tiene 7 elementos.
 * @typedef {{ desde: string, hasta: string|null, dias: DiaHorario[] }} HorarioSemanal
 */

/** @typedef {'bloqueo'|'apertura'} TipoExcepcion */

/**
 * `todoElDia` cubre la jornada operativa completa (07:00–19:00); `inicio` y
 * `fin` solo importan cuando `todoElDia` es false.
 * @typedef {{ id: number, tipo: TipoExcepcion, motivo: string, desde: string, hasta: string,
 *   todoElDia: boolean, inicio: string, fin: string, nota: string }} Excepcion
 */

/** @typedef {Omit<Excepcion, 'id'>} BorradorExcepcion */

/** @typedef {{ idMedico: string, horario: HorarioSemanal|null, excepciones: Excepcion[] }} AgendaCirujano */
/** @typedef {{ idMedico: string, nombre: string, sede: string }} Cirujano */
/** @typedef {{ cirujano: Cirujano, agenda: AgendaCirujano }} FilaCirujano */

/** @typedef {'configurada'|'por-vencer'|'vencida'|'sin-configurar'} EstadoAgenda */

/**
 * Subconjunto estructural de la cirugía de `mockCirugiaData` que usa la lógica.
 * @typedef {{ id: string, fecha: string, horaInicio: string, horaFin: string, estado: string,
 *   cirujano?: string, paciente?: { nombre: string }, procedimientoPrincipal?: string }} CirugiaAgenda
 */

/** @typedef {{ tipo: 'bloqueo', motivo: string }|{ tipo: 'fuera-vigencia' }|{ tipo: 'fuera-horario' }} MotivoConflicto */
/** @typedef {{ cirugia: CirugiaAgenda, motivo: MotivoConflicto }} Conflicto */

/** @typedef {{ horario: HorarioSemanal|null, excepciones: Excepcion[] }} AgendaEvaluable */

/** @typedef {{ rol: 'programacion'|'cirujano', idMedico?: string }} UsuarioAgenda */

export {};
```

Crea `src/hooks/AgendaCirujanos/intervalos.js`:

```javascript
// @ts-check
// Aritmética de intervalos de tiempo, en minutos desde las 00:00. Cada
// intervalo es [inicio, fin) y se tratan como inmutables: ninguna función
// modifica sus argumentos.

/** @typedef {[number, number]} Intervalo */

/**
 * @param {string} hora 'HH:mm'
 * @returns {number}
 */
export function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * @param {number} min
 * @returns {string} 'HH:mm'
 */
export function deMinutos(min) {
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

/**
 * Une los intervalos que se solapan o se tocan y los devuelve ordenados.
 * @param {Intervalo[]} intervalos
 * @returns {Intervalo[]}
 */
export function unirIntervalos(intervalos) {
  const ordenados = intervalos
    .map((iv) => /** @type {Intervalo} */ ([iv[0], iv[1]]))
    .sort((a, b) => a[0] - b[0]);
  /** @type {Intervalo[]} */
  const salida = [];
  ordenados.forEach((iv) => {
    const ultimo = salida[salida.length - 1];
    if (ultimo && iv[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], iv[1]);
    else salida.push(iv);
  });
  return salida;
}

/**
 * Resta de `a` todo lo que cubran los intervalos de `b`.
 * @param {Intervalo[]} a
 * @param {Intervalo[]} b
 * @returns {Intervalo[]}
 */
export function restarIntervalos(a, b) {
  /** @type {Intervalo[]} */
  let resto = a.map((iv) => [iv[0], iv[1]]);
  b.forEach(([bi, bf]) => {
    /** @type {Intervalo[]} */
    const siguiente = [];
    resto.forEach(([ri, rf]) => {
      if (bf <= ri || bi >= rf) {
        siguiente.push([ri, rf]);
        return;
      }
      if (bi > ri) siguiente.push([ri, bi]);
      if (bf < rf) siguiente.push([bf, rf]);
    });
    resto = siguiente;
  });
  return resto;
}

/**
 * ¿Un único intervalo de la lista contiene toda la franja [inicio, fin]?
 * @param {Intervalo[]} intervalos
 * @param {number} inicio
 * @param {number} fin
 * @returns {boolean}
 */
export function cubre(intervalos, inicio, fin) {
  return intervalos.some(([i, f]) => i <= inicio && f >= fin);
}
```

Crea `src/hooks/AgendaCirujanos/horario.js`:

```javascript
// @ts-check
// Fechas ISO y operaciones inmutables sobre el horario semanal. Toda función
// devuelve un horario nuevo: el borrador del editor nunca se muta en sitio.
import { JORNADAS, MINUTOS_FRANJA, parseISO } from '../ProgramacionSalaCirugias/gestion/agenda.js';
import { aMinutos, deMinutos } from './intervalos.js';

/** @typedef {import('./tipos.js').Bloque} Bloque */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */

// Jornada operativa configurable: la misma 07:00–19:00 de la agenda de salas
// (JORNADAS.operativa), en minutos.
export const INICIO_JORNADA = JORNADAS.operativa.desde * MINUTOS_FRANJA;
export const FIN_JORNADA = JORNADAS.operativa.hasta * MINUTOS_FRANJA;

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const DIAS_SEMANA_CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** @type {Bloque} */
export const BLOQUE_POR_DEFECTO = { inicio: '07:00', fin: '12:00' };

const pad2 = (/** @type {number} */ n) => String(n).padStart(2, '0');

/**
 * @param {Date} date
 * @returns {string} 'YYYY-MM-DD' en hora local
 */
export function aISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @param {number} n días (puede ser negativo)
 * @returns {string}
 */
export function sumarDias(fecha, n) {
  const d = parseISO(fecha);
  d.setDate(d.getDate() + n);
  return aISO(d);
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {number} 0 = lunes … 6 = domingo
 */
export function diaSemana(fecha) {
  return (parseISO(fecha).getDay() + 6) % 7;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {string} el lunes de la semana de `fecha`
 */
export function lunesDe(fecha) {
  return sumarDias(fecha, -diaSemana(fecha));
}

/**
 * @param {string} desde 'YYYY-MM-DD'
 * @param {string} hasta 'YYYY-MM-DD'
 * @returns {number} días de `desde` a `hasta` (negativo si `hasta` es anterior)
 */
export function diasEntre(desde, hasta) {
  return Math.round((parseISO(hasta).getTime() - parseISO(desde).getTime()) / 86400000);
}

/**
 * Opciones de hora cada 30 min, de `desdeMin` a `hastaMin` inclusive, con la
 * forma que espera FormSelect.
 * @param {number} desdeMin
 * @param {number} hastaMin
 * @returns {{ value: string, label: string }[]}
 */
export function opcionesHora(desdeMin, hastaMin) {
  const opciones = [];
  for (let m = desdeMin; m <= hastaMin; m += MINUTOS_FRANJA) {
    opciones.push({ value: deMinutos(m), label: deMinutos(m) });
  }
  return opciones;
}

/**
 * Horario de partida para un cirujano sin agenda: los 7 días apagados.
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {HorarioSemanal}
 */
export function horarioVacio(hoy) {
  return {
    desde: hoy,
    hasta: null,
    dias: Array.from({ length: 7 }, () => ({ activo: false, bloques: [{ ...BLOQUE_POR_DEFECTO }] })),
  };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} origen índice del día a copiar
 * @param {number[]} destinos índices que reciben los bloques (se activan)
 * @returns {HorarioSemanal}
 */
export function copiarDia(horario, origen, destinos) {
  const bloques = horario.dias[origen].bloques;
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i !== origen && destinos.includes(i)
        ? { activo: true, bloques: bloques.map((b) => ({ ...b })) }
        : d)),
  };
}

/**
 * Enciende o apaga un día. Al encender uno sin bloques se le pone el de
 * partida; al apagar se conservan los bloques por si se vuelve a encender.
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @param {boolean} activo
 * @returns {HorarioSemanal}
 */
export function alternarDia(horario, indice, activo) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => {
      if (i !== indice) return d;
      const bloques = activo && d.bloques.length === 0 ? [{ ...BLOQUE_POR_DEFECTO }] : d.bloques;
      return { activo, bloques };
    }),
  };
}

/**
 * Bloque que se propone al "Agregar bloque": arranca donde termina el último
 * (dentro de la jornada) y dura 2 h como máximo.
 * @param {Bloque[]} bloques
 * @returns {Bloque}
 */
export function bloqueSiguiente(bloques) {
  const ultimoFin = bloques.length ? Math.max(...bloques.map((b) => aMinutos(b.fin))) : INICIO_JORNADA;
  const inicio = Math.min(Math.max(ultimoFin, INICIO_JORNADA), FIN_JORNADA - 60);
  const fin = Math.min(inicio + 120, FIN_JORNADA);
  return { inicio: deMinutos(inicio), fin: deMinutos(fin) };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @returns {HorarioSemanal}
 */
export function agregarBloque(horario, indice) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i === indice ? { ...d, bloques: [...d.bloques, bloqueSiguiente(d.bloques)] } : d)),
  };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @param {number} posicion
 * @returns {HorarioSemanal}
 */
export function quitarBloque(horario, indice, posicion) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i === indice ? { ...d, bloques: d.bloques.filter((_, j) => j !== posicion) } : d)),
  };
}

/**
 * @param {HorarioSemanal} horario
 * @param {number} indice
 * @param {number} posicion
 * @param {'inicio'|'fin'} campo
 * @param {string} valor 'HH:mm'
 * @returns {HorarioSemanal}
 */
export function cambiarBloque(horario, indice, posicion, campo, valor) {
  return {
    ...horario,
    dias: horario.dias.map((d, i) => (
      i === indice
        ? { ...d, bloques: d.bloques.map((b, j) => (j === posicion ? { ...b, [campo]: valor } : b)) }
        : d)),
  };
}

/**
 * Marca o desmarca "Sin fecha de fin". Al desmarcar propone 90 días de
 * vigencia desde `desde` (o deja la fecha vacía si aún no hay `desde`).
 * @param {HorarioSemanal} horario
 * @param {boolean} sinFin
 * @returns {HorarioSemanal}
 */
export function alternarSinFecha(horario, sinFin) {
  if (sinFin) return { ...horario, hasta: null };
  return { ...horario, hasta: horario.desde ? sumarDias(horario.desde, 90) : '' };
}

/**
 * @param {HorarioSemanal} a
 * @param {HorarioSemanal} b
 * @returns {boolean}
 */
export function horariosIguales(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
```

Crea `src/hooks/AgendaCirujanos/formato.js`:

```javascript
// @ts-check
// Textos de fechas y horas para la UI de la agenda de cirujanos. Las fechas
// con hora (listado de cirugías en conflicto) usan `fechaHoraRangoLabel` de
// mockCirugiaData ("14.OCT.2026 - 08:00 – 09:00"), no este módulo.
import { aMinutos } from './intervalos.js';
import { sumarDias } from './horario.js';

/** @typedef {import('./tipos.js').DiaHorario} DiaHorario */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * @param {number} min
 * @returns {string} "7 h", "7,5 h"
 */
export function formatoHoras(min) {
  const horas = min / 60;
  return `${Number.isInteger(horas) ? horas : horas.toFixed(1).replace('.', ',')} h`;
}

/**
 * @param {number} n
 * @returns {string} "1 cirugía", "3 cirugías"
 */
export function cantidadCirugias(n) {
  return `${n} ${n === 1 ? 'cirugía' : 'cirugías'}`;
}

/**
 * Resumen de los bloques válidos de un día: "07:00–12:00 · 14:00–18:00 (9 h)".
 * Cadena vacía si el día no tiene ningún bloque válido.
 * @param {DiaHorario} dia
 * @returns {string}
 */
export function resumenDia(dia) {
  const validos = dia.bloques
    .filter((b) => aMinutos(b.fin) > aMinutos(b.inicio))
    .sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
  if (!validos.length) return '';
  const total = validos.reduce((suma, b) => suma + aMinutos(b.fin) - aMinutos(b.inicio), 0);
  return `${validos.map((b) => `${b.inicio}–${b.fin}`).join(' · ')} (${formatoHoras(total)})`;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {string} "14/10/2026"
 */
export function fechaLabel(fecha) {
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * @param {string} fecha 'YYYY-MM-DD'
 * @returns {string} "14 oct"
 */
export function fechaCorta(fecha) {
  const [, m, d] = fecha.split('-').map(Number);
  return `${d} ${MESES_CORTOS[m - 1]}`;
}

/**
 * Rango y franja de una excepción: "14/10/2026 – 16/10/2026 · Todo el día" o
 * "17/10/2026 · 08:00–12:00".
 * @param {Pick<Excepcion, 'desde'|'hasta'|'todoElDia'|'inicio'|'fin'>} excepcion
 * @returns {string}
 */
export function rangoExcepcionLabel(excepcion) {
  const fechas = excepcion.hasta !== excepcion.desde
    ? `${fechaLabel(excepcion.desde)} – ${fechaLabel(excepcion.hasta)}`
    : fechaLabel(excepcion.desde);
  return `${fechas} · ${excepcion.todoElDia ? 'Todo el día' : `${excepcion.inicio}–${excepcion.fin}`}`;
}

/**
 * Rango de la semana que empieza en `lunes`: "12 – 18 oct 2026" o, si cruza
 * de mes, "28 sep – 4 oct 2026".
 * @param {string} lunes 'YYYY-MM-DD'
 * @returns {string}
 */
export function rangoSemanaLabel(lunes) {
  const domingo = sumarDias(lunes, 6);
  const [, mi, di] = lunes.split('-').map(Number);
  const [yf, mf, df] = domingo.split('-').map(Number);
  return `${di}${mi !== mf ? ` ${MESES_CORTOS[mi - 1]}` : ''} – ${df} ${MESES_CORTOS[mf - 1]} ${yf}`;
}
```

- [ ] **Step 4: Ejecutar y confirmar que PASAN**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/intervalos.test.mjs src/hooks/AgendaCirujanos/__tests__/horario.test.mjs src/hooks/AgendaCirujanos/__tests__/formato.test.mjs`
Expected: `ℹ pass 29`, `ℹ fail 0` (intervalos 9 + horario 14 + formato 6).

- [ ] **Step 5: Type-check**

Run el comando de type-check de "Convenciones de verificación".
Expected: sin salida (exit 0).

- [ ] **Step 6: Commit**

```bash
git add src/hooks/AgendaCirujanos
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): intervalos, horario semanal y formato (lógica pura)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Disponibilidad efectiva y conflictos

**Files:**
- Create: `src/hooks/AgendaCirujanos/disponibilidad.js`, `conflictos.js`
- Test: `src/hooks/AgendaCirujanos/__tests__/fixtures.mjs` (datos compartidos, no es un test), `disponibilidad.test.mjs`, `conflictos.test.mjs`

**Interfaces:**
- Consumes (Task 1): `aMinutos`, `restarIntervalos`, `unirIntervalos`, `cubre` (`intervalos.js`); `diaSemana`, `INICIO_JORNADA`, `FIN_JORNADA`, `horarioVacio` (`horario.js`).
- Produces:
  - `disponibilidad.js`: `rangoExcepcion(x): Intervalo`, `modeloDia(fecha, horario|null, excepciones): ModeloDia` con `ModeloDia = { base: Intervalo[], aperturas: {intervalo, excepcion}[], bloqueos: {intervalo, excepcion}[], efectivo: Intervalo[], vigente: boolean }`, `minutosDisponibles(fechas, horario|null, excepciones): number`, `minutosSemanales(horario): number`.
  - `conflictos.js`: `ESTADOS_CONFLICTO`, `motivoConflicto(cirugia, modelo): MotivoConflicto`, `textoMotivo(motivo): string`, `cirugiasEnConflicto(cirugias, {horario, excepciones}, hoy): Conflicto[]`, `conflictosNuevos(cirugias, antes, despues, hoy): Conflicto[]`.

- [ ] **Step 1: Escribir fixtures y tests (fallan)**

Crea `src/hooks/AgendaCirujanos/__tests__/fixtures.mjs`:

```javascript
// Datos de prueba compartidos por los tests de AgendaCirujanos (no es un test:
// el script `npm test` solo recoge *.test.mjs).
import { horarioVacio } from '../horario.js';

// Miércoles. La semana del 12 al 18 de octubre de 2026 es la de referencia.
export const HOY = '2026-10-14';

/**
 * Horario con los días indicados activos (índices 0 = lunes) y un bloque por día.
 * @param {number[]} dias
 * @param {{ inicio?: string, fin?: string, desde?: string, hasta?: string|null }} [opciones]
 */
export function horarioCon(dias, {
  inicio = '07:00', fin = '13:00', desde = '2026-10-01', hasta = null,
} = {}) {
  const base = horarioVacio(desde);
  return {
    ...base,
    hasta,
    dias: base.dias.map((d, i) => (dias.includes(i) ? { activo: true, bloques: [{ inicio, fin }] } : d)),
  };
}

/** @param {Record<string, unknown>} [parche] */
export function excepcion(parche = {}) {
  return {
    id: 1,
    tipo: 'bloqueo',
    motivo: 'Vacaciones',
    desde: '2026-10-14',
    hasta: '2026-10-14',
    todoElDia: true,
    inicio: '07:00',
    fin: '19:00',
    nota: '',
    ...parche,
  };
}

/** @param {Record<string, unknown>} [parche] */
export function cirugia(parche = {}) {
  return {
    id: 'c1',
    fecha: '2026-10-14',
    horaInicio: '08:00',
    horaFin: '09:00',
    estado: 'programada',
    cirujano: 'ANIBAL ENRIQUE BADEL RODRIGUEZ',
    paciente: { nombre: 'Paciente Uno' },
    procedimientoPrincipal: 'Biopsia',
    ...parche,
  };
}
```

Crea `src/hooks/AgendaCirujanos/__tests__/disponibilidad.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { minutosDisponibles, minutosSemanales, modeloDia } from '../disponibilidad.js';
import { alternarDia, cambiarBloque, horarioVacio } from '../horario.js';
import { excepcion, horarioCon, HOY } from './fixtures.mjs';

// Miércoles 14 = índice 2. Horario base: lun/mié/vie 07:00–13:00 desde el 1 de octubre.
const horario = horarioCon([0, 2, 4]);

test('modeloDia: día activo dentro de la vigencia devuelve su base', () => {
  const m = modeloDia(HOY, horario, []);
  assert.equal(m.vigente, true);
  assert.deepEqual(m.base, [[420, 780]]);
  assert.deepEqual(m.efectivo, [[420, 780]]);
});

test('modeloDia: día apagado o sin horario no tiene disponibilidad', () => {
  assert.deepEqual(modeloDia('2026-10-15', horario, []).efectivo, []);
  assert.deepEqual(modeloDia(HOY, null, []).efectivo, []);
  assert.equal(modeloDia(HOY, null, []).vigente, false);
});

test('modeloDia: fuera de la vigencia no hay base', () => {
  const acotado = horarioCon([2], { desde: '2026-10-15' });
  assert.equal(modeloDia(HOY, acotado, []).vigente, false);
  const vencido = horarioCon([2], { hasta: '2026-10-13' });
  assert.deepEqual(modeloDia(HOY, vencido, []).efectivo, []);
  assert.equal(modeloDia('2026-10-13', vencido, []).vigente, true);
  assert.equal(modeloDia('2026-10-14', horarioCon([2], { hasta: '2026-10-14' }), []).vigente, true, 'el último día es vigente');
});

test('modeloDia: mientras se edita (hasta vacío) la vista previa no se rompe', () => {
  assert.equal(modeloDia(HOY, { ...horario, hasta: '' }, []).vigente, true);
});

test('modeloDia: un bloqueo de todo el día vacía la jornada', () => {
  const m = modeloDia(HOY, horario, [excepcion()]);
  assert.deepEqual(m.efectivo, []);
  assert.equal(m.bloqueos.length, 1);
  assert.deepEqual(m.bloqueos[0].intervalo, [420, 1140]);
});

test('modeloDia: un bloqueo con franja parte el horario', () => {
  const m = modeloDia(HOY, horario, [excepcion({ todoElDia: false, inicio: '09:00', fin: '10:00' })]);
  assert.deepEqual(m.efectivo, [[420, 540], [600, 780]]);
});

test('modeloDia: una apertura extra suma disponibilidad aunque el día esté apagado', () => {
  const apertura = excepcion({
    tipo: 'apertura', motivo: 'Jornada adicional', desde: '2026-10-15', hasta: '2026-10-15', todoElDia: false, inicio: '08:00', fin: '12:00',
  });
  const m = modeloDia('2026-10-15', horario, [apertura]);
  assert.deepEqual(m.base, []);
  assert.deepEqual(m.efectivo, [[480, 720]]);
  assert.equal(m.aperturas.length, 1);
});

test('modeloDia: una apertura contigua al horario se une con él', () => {
  const apertura = excepcion({
    tipo: 'apertura', todoElDia: false, inicio: '13:00', fin: '15:00',
  });
  assert.deepEqual(modeloDia(HOY, horario, [apertura]).efectivo, [[420, 900]]);
});

test('modeloDia: el bloqueo gana a la apertura', () => {
  const apertura = excepcion({
    id: 1, tipo: 'apertura', todoElDia: false, inicio: '14:00', fin: '16:00',
  });
  const bloqueo = excepcion({ id: 2, todoElDia: false, inicio: '15:00', fin: '17:00' });
  assert.deepEqual(modeloDia(HOY, horario, [apertura, bloqueo]).efectivo, [[420, 780], [840, 900]]);
});

test('modeloDia: una excepción de varios días aplica en cada uno, con la misma franja', () => {
  const x = excepcion({
    desde: '2026-10-12', hasta: '2026-10-14', todoElDia: false, inicio: '07:00', fin: '09:00',
  });
  assert.deepEqual(modeloDia('2026-10-12', horario, [x]).efectivo, [[540, 780]]);
  assert.deepEqual(modeloDia('2026-10-14', horario, [x]).efectivo, [[540, 780]]);
  assert.deepEqual(modeloDia('2026-10-16', horario, [x]).efectivo, [[420, 780]]);
});

test('modeloDia: ignora bloques inválidos (fin <= inicio)', () => {
  const malo = cambiarBloque(alternarDia(horarioVacio('2026-10-01'), 2, true), 2, 0, 'fin', '07:00');
  assert.deepEqual(modeloDia(HOY, malo, []).efectivo, []);
});

test('modeloDia: une bloques contiguos del mismo día', () => {
  const dosBloques = {
    ...horario,
    dias: horario.dias.map((d, i) => (i === 2 ? { activo: true, bloques: [{ inicio: '07:00', fin: '10:00' }, { inicio: '10:00', fin: '13:00' }] } : d)),
  };
  assert.deepEqual(modeloDia(HOY, dosBloques, []).efectivo, [[420, 780]]);
});

test('minutosDisponibles suma la semana y respeta bloqueos', () => {
  const semana = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18'];
  assert.equal(minutosDisponibles(semana, horario, []), 3 * 360);
  assert.equal(minutosDisponibles(semana, horario, [excepcion()]), 2 * 360);
  assert.equal(minutosDisponibles(semana, null, []), 0);
});

test('minutosDisponibles recorta a la jornada operativa', () => {
  const apertura = excepcion({
    tipo: 'apertura', desde: '2026-10-17', hasta: '2026-10-17', todoElDia: false, inicio: '18:00', fin: '19:00',
  });
  assert.equal(minutosDisponibles(['2026-10-17'], null, [apertura]), 60);
});

test('minutosSemanales suma solo días activos con bloques válidos', () => {
  assert.equal(minutosSemanales(horario), 3 * 360);
  assert.equal(minutosSemanales(horarioVacio(HOY)), 0);
  const conInvalido = cambiarBloque(horario, 0, 0, 'fin', '07:00');
  assert.equal(minutosSemanales(conInvalido), 2 * 360);
});
```

Crea `src/hooks/AgendaCirujanos/__tests__/conflictos.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cirugiasEnConflicto, conflictosNuevos, motivoConflicto, textoMotivo,
} from '../conflictos.js';
import { modeloDia } from '../disponibilidad.js';
import { horarioVacio } from '../horario.js';
import {
  cirugia, excepcion, horarioCon, HOY,
} from './fixtures.mjs';

// Lun/mié/vie 07:00–13:00 desde el 1 de octubre, sin fecha de fin.
const horario = horarioCon([0, 2, 4]);
const agenda = { horario, excepciones: [] };

test('una cirugía dentro del horario no es conflicto', () => {
  assert.deepEqual(cirugiasEnConflicto([cirugia()], agenda, HOY), []);
});

test('una cirugía que sobrepasa el horario es conflicto "fuera del horario"', () => {
  const c = cirugia({ horaInicio: '12:00', horaFin: '14:00' });
  const [conflicto] = cirugiasEnConflicto([c], agenda, HOY);
  assert.equal(conflicto.cirugia, c);
  assert.deepEqual(conflicto.motivo, { tipo: 'fuera-horario' });
});

test('un día apagado es conflicto', () => {
  const [conflicto] = cirugiasEnConflicto([cirugia({ fecha: '2026-10-15' })], agenda, HOY);
  assert.deepEqual(conflicto.motivo, { tipo: 'fuera-horario' });
});

test('motivo "bloqueo" gana al resto y nombra la excepción', () => {
  const conBloqueo = { horario, excepciones: [excepcion({ motivo: 'Congreso o capacitación' })] };
  const [conflicto] = cirugiasEnConflicto([cirugia()], conBloqueo, HOY);
  assert.deepEqual(conflicto.motivo, { tipo: 'bloqueo', motivo: 'Congreso o capacitación' });
});

test('un bloqueo que no toca la franja de la cirugía no cuenta como motivo ni como conflicto', () => {
  const franja = { horario, excepciones: [excepcion({ todoElDia: false, inicio: '10:00', fin: '12:00' })] };
  assert.deepEqual(cirugiasEnConflicto([cirugia({ horaInicio: '08:00', horaFin: '09:00' })], franja, HOY), []);
});

test('fuera de la vigencia: motivo "fuera-vigencia"', () => {
  const vencido = { horario: horarioCon([2], { hasta: '2026-10-13' }), excepciones: [] };
  const [conflicto] = cirugiasEnConflicto([cirugia()], vencido, HOY);
  assert.deepEqual(conflicto.motivo, { tipo: 'fuera-vigencia' });
});

test('solo cuentan las cirugías programadas o de urgencia', () => {
  const fuera = { fecha: '2026-10-15' };
  const cirugias = ['programada', 'urgencia', 'realizada', 'cancelada', 'incumplida']
    .map((estado, i) => cirugia({ ...fuera, id: `c${i}`, estado }));
  assert.deepEqual(
    cirugiasEnConflicto(cirugias, agenda, HOY).map((c) => c.cirugia.estado),
    ['programada', 'urgencia'],
  );
});

test('solo cuentan las cirugías desde hoy en adelante (hoy incluido)', () => {
  const sinAgenda = { horario: horarioVacio(HOY), excepciones: [] };
  const ayer = cirugia({ id: 'a', fecha: '2026-10-13' });
  const hoy = cirugia({ id: 'b', fecha: HOY });
  assert.deepEqual(cirugiasEnConflicto([ayer, hoy], sinAgenda, HOY).map((c) => c.cirugia.id), ['b']);
});

test('una cirugía a caballo entre dos bloques contiguos está cubierta; entre dos separados, no', () => {
  const contiguos = {
    ...horario,
    dias: horario.dias.map((d, i) => (i === 2 ? { activo: true, bloques: [{ inicio: '07:00', fin: '10:00' }, { inicio: '10:00', fin: '13:00' }] } : d)),
  };
  const c = cirugia({ horaInicio: '09:00', horaFin: '11:00' });
  assert.deepEqual(cirugiasEnConflicto([c], { horario: contiguos, excepciones: [] }, HOY), []);
  const separados = {
    ...horario,
    dias: horario.dias.map((d, i) => (i === 2 ? { activo: true, bloques: [{ inicio: '07:00', fin: '10:00' }, { inicio: '11:00', fin: '13:00' }] } : d)),
  };
  assert.equal(cirugiasEnConflicto([c], { horario: separados, excepciones: [] }, HOY).length, 1);
});

test('una apertura extra puede cubrir una cirugía que el horario no cubría', () => {
  const c = cirugia({ horaInicio: '14:00', horaFin: '15:00' });
  const apertura = excepcion({
    tipo: 'apertura', todoElDia: false, inicio: '13:00', fin: '16:00',
  });
  assert.equal(cirugiasEnConflicto([c], agenda, HOY).length, 1);
  assert.equal(cirugiasEnConflicto([c], { horario, excepciones: [apertura] }, HOY).length, 0);
});

test('conflictosNuevos devuelve solo lo que aparece con el cambio', () => {
  const ya = cirugia({ id: 'ya', fecha: '2026-10-15' }); // jueves apagado: ya estaba en conflicto
  const nueva = cirugia({ id: 'nueva' }); // miércoles 08:00, hoy cubierta
  const despues = { horario, excepciones: [excepcion()] }; // bloqueo todo el día el 14
  const nuevos = conflictosNuevos([ya, nueva], agenda, despues, HOY);
  assert.deepEqual(nuevos.map((c) => c.cirugia.id), ['nueva']);
});

test('conflictosNuevos con un cirujano sin agenda: la línea base es el horario vacío', () => {
  const c = cirugia();
  const antes = { horario: horarioVacio(HOY), excepciones: [] };
  assert.equal(cirugiasEnConflicto([c], antes, HOY).length, 1, 'sin agenda todo está fuera');
  assert.deepEqual(conflictosNuevos([c], antes, { horario, excepciones: [] }, HOY), [], 'configurar el horario no empeora nada');
  const soloLunes = horarioCon([0]);
  assert.deepEqual(conflictosNuevos([c], antes, { horario: soloLunes, excepciones: [] }, HOY), [], 'seguía fuera de agenda: no es nuevo');
});

test('motivoConflicto lee el modelo del día', () => {
  const modelo = modeloDia(HOY, horario, [excepcion({ motivo: 'Permiso' })]);
  assert.deepEqual(motivoConflicto(cirugia(), modelo), { tipo: 'bloqueo', motivo: 'Permiso' });
});

test('textoMotivo', () => {
  assert.equal(textoMotivo({ tipo: 'bloqueo', motivo: 'Vacaciones' }), 'Bloqueo: Vacaciones');
  assert.equal(textoMotivo({ tipo: 'fuera-vigencia' }), 'Fuera de la vigencia de la agenda');
  assert.equal(textoMotivo({ tipo: 'fuera-horario' }), 'Fuera del horario disponible');
});
```

- [ ] **Step 2: Ejecutar y confirmar que FALLAN**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/disponibilidad.test.mjs src/hooks/AgendaCirujanos/__tests__/conflictos.test.mjs`
Expected: ambos fallan con `ERR_MODULE_NOT_FOUND` (`disponibilidad.js`, `conflictos.js`).

- [ ] **Step 3: Crear los módulos**

Crea `src/hooks/AgendaCirujanos/disponibilidad.js`:

```javascript
// @ts-check
// Disponibilidad efectiva de un cirujano: horario base + aperturas − bloqueos.
import {
  aMinutos, restarIntervalos, unirIntervalos,
} from './intervalos.js';
import { diaSemana, FIN_JORNADA, INICIO_JORNADA } from './horario.js';

/** @typedef {import('./intervalos.js').Intervalo} Intervalo */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').Bloque} Bloque */

/**
 * @typedef {{ intervalo: Intervalo, excepcion: Excepcion }} ExcepcionDelDia
 * @typedef {{ base: Intervalo[], aperturas: ExcepcionDelDia[], bloqueos: ExcepcionDelDia[],
 *   efectivo: Intervalo[], vigente: boolean }} ModeloDia
 */

/**
 * @param {Bloque} b
 * @returns {boolean}
 */
const esBloqueValido = (b) => aMinutos(b.fin) > aMinutos(b.inicio);

/**
 * Franja que cubre una excepción en cada uno de sus días.
 * @param {Excepcion} x
 * @returns {Intervalo}
 */
export function rangoExcepcion(x) {
  return x.todoElDia ? [INICIO_JORNADA, FIN_JORNADA] : [aMinutos(x.inicio), aMinutos(x.fin)];
}

/**
 * Qué hay en un día concreto. `efectivo` = (base + aperturas) − bloqueos. Las
 * aperturas extra cuentan aunque el día caiga fuera de la vigencia.
 * @param {string} fecha 'YYYY-MM-DD'
 * @param {HorarioSemanal|null} horario
 * @param {Excepcion[]} excepciones
 * @returns {ModeloDia}
 */
export function modeloDia(fecha, horario, excepciones) {
  const vigente = !!horario
    && fecha >= horario.desde
    && (horario.hasta === null || horario.hasta === '' || fecha <= horario.hasta);
  const dia = horario ? horario.dias[diaSemana(fecha)] : null;
  /** @type {Intervalo[]} */
  const base = vigente && dia && dia.activo
    ? unirIntervalos(dia.bloques.filter(esBloqueValido).map((b) => [aMinutos(b.inicio), aMinutos(b.fin)]))
    : [];

  const delDia = excepciones.filter((x) => fecha >= x.desde && fecha <= x.hasta);
  const aperturas = delDia
    .filter((x) => x.tipo === 'apertura')
    .map((x) => ({ intervalo: rangoExcepcion(x), excepcion: x }));
  const bloqueos = delDia
    .filter((x) => x.tipo === 'bloqueo')
    .map((x) => ({ intervalo: rangoExcepcion(x), excepcion: x }));

  const conAperturas = unirIntervalos([...base, ...aperturas.map((a) => a.intervalo)]);
  const efectivo = restarIntervalos(conAperturas, unirIntervalos(bloqueos.map((b) => b.intervalo)));
  return {
    base, aperturas, bloqueos, efectivo, vigente,
  };
}

/**
 * Minutos disponibles (dentro de la jornada operativa) en un conjunto de fechas.
 * @param {string[]} fechas
 * @param {HorarioSemanal|null} horario
 * @param {Excepcion[]} excepciones
 * @returns {number}
 */
export function minutosDisponibles(fechas, horario, excepciones) {
  return fechas.reduce((total, fecha) => total + modeloDia(fecha, horario, excepciones).efectivo
    .reduce((suma, [i, f]) => suma + Math.max(0, Math.min(f, FIN_JORNADA) - Math.max(i, INICIO_JORNADA)), 0), 0);
}

/**
 * Horas por semana del horario base (columna del listado): suma de los bloques
 * válidos de los días activos, sin considerar vigencia ni excepciones.
 * @param {HorarioSemanal} horario
 * @returns {number} minutos
 */
export function minutosSemanales(horario) {
  return horario.dias.reduce((total, dia) => total + (dia.activo
    ? dia.bloques.filter(esBloqueValido).reduce((suma, b) => suma + aMinutos(b.fin) - aMinutos(b.inicio), 0)
    : 0), 0);
}
```

Crea `src/hooks/AgendaCirujanos/conflictos.js`:

```javascript
// @ts-check
// Cirugías ya programadas que quedan fuera de la agenda de su cirujano. Solo
// se ADVIERTE: nada de esto cancela ni reprograma una cirugía.
import { aMinutos, cubre } from './intervalos.js';
import { modeloDia } from './disponibilidad.js';

/** @typedef {import('./disponibilidad.js').ModeloDia} ModeloDia */
/** @typedef {import('./tipos.js').AgendaEvaluable} AgendaEvaluable */
/** @typedef {import('./tipos.js').CirugiaAgenda} CirugiaAgenda */
/** @typedef {import('./tipos.js').Conflicto} Conflicto */
/** @typedef {import('./tipos.js').MotivoConflicto} MotivoConflicto */

// Solo estas cirugías, desde hoy en adelante, cuentan como conflicto.
export const ESTADOS_CONFLICTO = ['programada', 'urgencia'];

/**
 * Por qué una cirugía no está cubierta, en orden: un bloqueo que la solapa,
 * fecha fuera de la vigencia, fuera del horario disponible.
 * @param {CirugiaAgenda} cirugia
 * @param {ModeloDia} modelo
 * @returns {MotivoConflicto}
 */
export function motivoConflicto(cirugia, modelo) {
  const inicio = aMinutos(cirugia.horaInicio);
  const fin = aMinutos(cirugia.horaFin);
  const bloqueo = modelo.bloqueos.find((b) => b.intervalo[0] < fin && b.intervalo[1] > inicio);
  if (bloqueo) return { tipo: 'bloqueo', motivo: bloqueo.excepcion.motivo };
  if (!modelo.vigente) return { tipo: 'fuera-vigencia' };
  return { tipo: 'fuera-horario' };
}

/**
 * @param {MotivoConflicto} motivo
 * @returns {string}
 */
export function textoMotivo(motivo) {
  if (motivo.tipo === 'bloqueo') return `Bloqueo: ${motivo.motivo}`;
  if (motivo.tipo === 'fuera-vigencia') return 'Fuera de la vigencia de la agenda';
  return 'Fuera del horario disponible';
}

/**
 * @param {CirugiaAgenda[]} cirugias cirugías del cirujano (cualquier fecha/estado)
 * @param {AgendaEvaluable} agenda horario + excepciones a evaluar
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Conflicto[]}
 */
export function cirugiasEnConflicto(cirugias, agenda, hoy) {
  /** @type {Conflicto[]} */
  const conflictos = [];
  cirugias.forEach((cirugia) => {
    if (!ESTADOS_CONFLICTO.includes(cirugia.estado) || cirugia.fecha < hoy) return;
    const modelo = modeloDia(cirugia.fecha, agenda.horario, agenda.excepciones);
    if (!cubre(modelo.efectivo, aMinutos(cirugia.horaInicio), aMinutos(cirugia.horaFin))) {
      conflictos.push({ cirugia, motivo: motivoConflicto(cirugia, modelo) });
    }
  });
  return conflictos;
}

/**
 * Conflictos que aparecen con el cambio y que antes no estaban: es lo que
 * advierte el modal al guardar.
 * @param {CirugiaAgenda[]} cirugias
 * @param {AgendaEvaluable} antes
 * @param {AgendaEvaluable} despues
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Conflicto[]}
 */
export function conflictosNuevos(cirugias, antes, despues, hoy) {
  const previos = new Set(cirugiasEnConflicto(cirugias, antes, hoy).map((c) => c.cirugia.id));
  return cirugiasEnConflicto(cirugias, despues, hoy).filter((c) => !previos.has(c.cirugia.id));
}
```

- [ ] **Step 4: Ejecutar y confirmar que PASAN**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/disponibilidad.test.mjs src/hooks/AgendaCirujanos/__tests__/conflictos.test.mjs`
Expected: `ℹ pass 29`, `ℹ fail 0` (disponibilidad 15 + conflictos 14).

- [ ] **Step 5: Type-check**

Run el comando de type-check. Expected: sin salida.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/AgendaCirujanos
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): disponibilidad efectiva y detección de conflictos

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Validaciones, excepciones, estado, listado y permisos

**Files:**
- Create: `src/hooks/AgendaCirujanos/validaciones.js`, `excepciones.js`, `estadoAgenda.js`, `listado.js`, `permisos.js`
- Test: `__tests__/validaciones.test.mjs`, `__tests__/excepciones.test.mjs`, `__tests__/listado.test.mjs` (este último cubre también `estadoAgenda` y `permisos`)

**Interfaces:**
- Consumes (Tasks 1–2): `aMinutos`; `diasEntre`, `sumarDias`; `fixtures.mjs`; `rangoExcepcionLabel` (`formato.js`).
- Produces:
  - `validaciones.js`: `errorDia(dia): string`, `errorVigencia(horario): string`, `horarioTieneErrores(horario): boolean`, `errorExcepcion(excepcion): string` (cadena vacía = válido).
  - `excepciones.js`: `MOTIVOS_EXCEPCION`, `ETIQUETA_TIPO`, `AYUDA_TIPO`, `excepcionNueva(hoy): BorradorExcepcion`, `cambiarTipoExcepcion(borrador, tipo)`, `ordenarExcepciones(lista)`.
  - `estadoAgenda.js`: `DIAS_POR_VENCER` (30), `ESTADO_AGENDA_LABEL`, `estadoAgenda(horario|null, hoy): EstadoAgenda`, `diasParaVencer(horario|null, hoy): number|null`, `proximaExcepcion(excepciones, hoy): Excepcion|null`.
  - `listado.js`: `normalizarTexto(texto)`, `filtrarCirujanos(filas, {estado, busqueda}, hoy)`, `contarPorEstado(filas, hoy): Record<'todos'|EstadoAgenda, number>`.
  - `permisos.js`: `puedeEditarAgenda(usuario, idMedico): boolean`, `cirujanosVisibles(usuario, filas): FilaCirujano[]`.

- [ ] **Step 1: Escribir los tests (fallan)**

Crea `src/hooks/AgendaCirujanos/__tests__/validaciones.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  errorDia, errorExcepcion, errorVigencia, horarioTieneErrores,
} from '../validaciones.js';
import {
  alternarDia, alternarSinFecha, cambiarBloque, horarioVacio,
} from '../horario.js';
import { horarioCon, HOY } from './fixtures.mjs';

const b = (inicio, fin) => ({ inicio, fin });

test('errorDia: un día apagado nunca tiene error', () => {
  assert.equal(errorDia({ activo: false, bloques: [] }), '');
  assert.equal(errorDia({ activo: false, bloques: [b('10:00', '09:00')] }), '');
});

test('errorDia: activo sin bloques', () => {
  assert.equal(errorDia({ activo: true, bloques: [] }), 'Agrega al menos un bloque o desactiva el día.');
});

test('errorDia: fin igual o anterior al inicio', () => {
  const msg = 'La hora de fin debe ser posterior a la de inicio.';
  assert.equal(errorDia({ activo: true, bloques: [b('10:00', '10:00')] }), msg);
  assert.equal(errorDia({ activo: true, bloques: [b('10:00', '09:00')] }), msg);
});

test('errorDia: bloques que se cruzan (aunque vengan desordenados)', () => {
  const msg = 'Los bloques de un mismo día no pueden cruzarse.';
  assert.equal(errorDia({ activo: true, bloques: [b('07:00', '12:00'), b('11:00', '14:00')] }), msg);
  assert.equal(errorDia({ activo: true, bloques: [b('11:00', '14:00'), b('07:00', '12:00')] }), msg);
});

test('errorDia: bloques que solo se tocan o están separados son válidos', () => {
  assert.equal(errorDia({ activo: true, bloques: [b('07:00', '12:00'), b('12:00', '14:00')] }), '');
  assert.equal(errorDia({ activo: true, bloques: [b('07:00', '12:00'), b('14:00', '18:00')] }), '');
});

test('errorVigencia', () => {
  assert.equal(errorVigencia(horarioVacio(HOY)), '');
  assert.equal(errorVigencia({ ...horarioVacio(HOY), desde: '' }), 'Elige desde qué fecha rige este horario.');
  assert.equal(
    errorVigencia({ ...horarioVacio(HOY), hasta: '' }),
    'Elige la fecha final o marca "Sin fecha de fin".',
  );
  assert.equal(
    errorVigencia({ ...horarioVacio(HOY), hasta: '2026-10-13' }),
    'La fecha final debe ser posterior a la inicial.',
  );
  assert.equal(errorVigencia({ ...horarioVacio(HOY), hasta: HOY }), '', 'un solo día es válido');
  assert.equal(errorVigencia(alternarSinFecha(horarioVacio(HOY), false)), '');
});

test('horarioTieneErrores mira la vigencia y todos los días', () => {
  assert.equal(horarioTieneErrores(horarioVacio(HOY)), false);
  assert.equal(horarioTieneErrores(horarioCon([0, 2])), false);
  assert.equal(horarioTieneErrores({ ...horarioVacio(HOY), hasta: '' }), true);
  const malo = cambiarBloque(alternarDia(horarioVacio(HOY), 3, true), 3, 0, 'fin', '07:00');
  assert.equal(horarioTieneErrores(malo), true);
});

test('errorExcepcion', () => {
  const ok = {
    desde: '2026-10-14', hasta: '2026-10-14', todoElDia: true, inicio: '07:00', fin: '19:00',
  };
  assert.equal(errorExcepcion(ok), '');
  assert.equal(errorExcepcion({ ...ok, desde: '' }), 'Elige la fecha inicial y la final.');
  assert.equal(errorExcepcion({ ...ok, hasta: '' }), 'Elige la fecha inicial y la final.');
  assert.equal(
    errorExcepcion({ ...ok, hasta: '2026-10-13' }),
    'La fecha final debe ser igual o posterior a la inicial.',
  );
  assert.equal(
    errorExcepcion({ ...ok, todoElDia: false, inicio: '10:00', fin: '09:00' }),
    'La hora de fin debe ser posterior a la de inicio.',
  );
  assert.equal(errorExcepcion({ ...ok, todoElDia: true, inicio: '10:00', fin: '09:00' }), '', 'la franja no importa con todo el día');
});
```

Crea `src/hooks/AgendaCirujanos/__tests__/excepciones.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cambiarTipoExcepcion, excepcionNueva, MOTIVOS_EXCEPCION, ordenarExcepciones,
} from '../excepciones.js';
import { rangoExcepcionLabel } from '../formato.js';
import { errorExcepcion } from '../validaciones.js';
import { excepcion, HOY } from './fixtures.mjs';

test('excepcionNueva: un bloqueo de todo el día, hoy, que ya es válido', () => {
  const x = excepcionNueva(HOY);
  assert.equal(x.tipo, 'bloqueo');
  assert.equal(x.motivo, 'Vacaciones');
  assert.equal(x.desde, HOY);
  assert.equal(x.hasta, HOY);
  assert.equal(x.todoElDia, true);
  assert.equal(x.nota, '');
  assert.equal(errorExcepcion(x), '');
});

test('cambiarTipoExcepcion: motivo al primero del tipo; bloqueo = todo el día, apertura = franja', () => {
  const aApertura = cambiarTipoExcepcion(excepcionNueva(HOY), 'apertura');
  assert.equal(aApertura.tipo, 'apertura');
  assert.equal(aApertura.motivo, MOTIVOS_EXCEPCION.apertura[0]);
  assert.equal(aApertura.todoElDia, false);
  const deVuelta = cambiarTipoExcepcion(aApertura, 'bloqueo');
  assert.equal(deVuelta.motivo, 'Vacaciones');
  assert.equal(deVuelta.todoElDia, true);
});

test('cambiarTipoExcepcion al mismo tipo no cambia nada (conserva el motivo elegido)', () => {
  const elegido = { ...excepcionNueva(HOY), motivo: 'Permiso' };
  assert.equal(cambiarTipoExcepcion(elegido, 'bloqueo'), elegido);
});

test('cada tipo tiene motivos y el último es "Otro"', () => {
  assert.equal(MOTIVOS_EXCEPCION.bloqueo.at(-1), 'Otro');
  assert.equal(MOTIVOS_EXCEPCION.apertura.at(-1), 'Otro');
  assert.equal(MOTIVOS_EXCEPCION.bloqueo.length, 5);
});

test('ordenarExcepciones: por fecha de inicio y luego por id, sin mutar la entrada', () => {
  const a = excepcion({ id: 3, desde: '2026-11-01', hasta: '2026-11-02' });
  const b = excepcion({ id: 1, desde: '2026-10-20', hasta: '2026-10-20' });
  const c = excepcion({ id: 2, desde: '2026-10-20', hasta: '2026-10-21' });
  const entrada = [a, b, c];
  assert.deepEqual(ordenarExcepciones(entrada).map((x) => x.id), [1, 2, 3]);
  assert.deepEqual(entrada.map((x) => x.id), [3, 1, 2]);
});

test('rangoExcepcionLabel', () => {
  assert.equal(
    rangoExcepcionLabel(excepcion({ desde: '2026-10-14', hasta: '2026-10-16' })),
    '14/10/2026 – 16/10/2026 · Todo el día',
  );
  assert.equal(
    rangoExcepcionLabel(excepcion({
      desde: '2026-10-17', hasta: '2026-10-17', todoElDia: false, inicio: '08:00', fin: '12:00',
    })),
    '17/10/2026 · 08:00–12:00',
  );
});
```

Crea `src/hooks/AgendaCirujanos/__tests__/listado.test.mjs`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diasParaVencer, estadoAgenda, proximaExcepcion,
} from '../estadoAgenda.js';
import { contarPorEstado, filtrarCirujanos, normalizarTexto } from '../listado.js';
import { cirujanosVisibles, puedeEditarAgenda } from '../permisos.js';
import { excepcion, horarioCon, HOY } from './fixtures.mjs';

test('estadoAgenda: sin horario, sin fecha de fin y fecha lejana', () => {
  assert.equal(estadoAgenda(null, HOY), 'sin-configurar');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: null }), HOY), 'configurada');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-12-31' }), HOY), 'configurada');
});

test('estadoAgenda: límites exactos de "por vencer" (hoy y hoy + 30 días)', () => {
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-10-13' }), HOY), 'vencida');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: HOY }), HOY), 'por-vencer');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-11-13' }), HOY), 'por-vencer');
  assert.equal(estadoAgenda(horarioCon([0], { hasta: '2026-11-14' }), HOY), 'configurada');
});

test('diasParaVencer', () => {
  assert.equal(diasParaVencer(null, HOY), null);
  assert.equal(diasParaVencer(horarioCon([0], { hasta: null }), HOY), null);
  assert.equal(diasParaVencer(horarioCon([0], { hasta: '2026-10-15' }), HOY), 1);
  assert.equal(diasParaVencer(horarioCon([0], { hasta: '2026-10-13' }), HOY), -1);
});

test('proximaExcepcion: la que empieza primero entre las vigentes o futuras', () => {
  const pasada = excepcion({ id: 1, desde: '2026-10-01', hasta: '2026-10-02' });
  const lejana = excepcion({ id: 2, desde: '2026-11-09', hasta: '2026-11-11' });
  const enCurso = excepcion({ id: 3, desde: '2026-10-12', hasta: '2026-10-16' });
  assert.equal(proximaExcepcion([], HOY), null);
  assert.equal(proximaExcepcion([pasada], HOY), null);
  assert.equal(proximaExcepcion([lejana, pasada, enCurso], HOY)?.id, 3);
  assert.equal(proximaExcepcion([lejana, pasada], HOY)?.id, 2);
});

const fila = (idMedico, nombre, horario) => ({
  cirujano: { idMedico, nombre, sede: 'SEDE NORTE' },
  agenda: { idMedico, horario, excepciones: [] },
});
const FILAS = [
  fila('1', 'ANGEL MARIA PARRA LIÑAN', null),
  fila('2', 'ANIBAL ENRIQUE BADEL RODRIGUEZ', horarioCon([0])),
  fila('3', 'AMAURY RAFAEL GARCIA BURGOS', horarioCon([0], { hasta: '2026-11-01' })),
  fila('4', 'CARLOS MANUEL PEREIRA BETANCOURT', horarioCon([0], { hasta: '2026-09-30' })),
];

test('normalizarTexto quita tildes y mayúsculas', () => {
  assert.equal(normalizarTexto('Ángel María Parra Liñan'), 'angel maria parra linan');
});

test('filtrarCirujanos: la búsqueda no distingue tildes ni mayúsculas', () => {
  const buscar = (busqueda) => filtrarCirujanos(FILAS, { estado: 'todos', busqueda }, HOY).map((f) => f.cirujano.idMedico);
  assert.deepEqual(buscar('ángel'), ['1']);
  assert.deepEqual(buscar('LINAN'), ['1']);
  assert.deepEqual(buscar('  ani  '), ['2'], 'recorta espacios antes de buscar');
  assert.deepEqual(buscar('an'), ['1', '2', '4'], 'busca en cualquier parte del nombre (ANGEL, ANIBAL, MANUEL)');
  assert.deepEqual(buscar(''), ['1', '2', '3', '4']);
  assert.deepEqual(buscar('zzz'), []);
});

test('filtrarCirujanos: combina estado y búsqueda', () => {
  const ids = (estado, busqueda = '') => filtrarCirujanos(FILAS, { estado, busqueda }, HOY).map((f) => f.cirujano.idMedico);
  assert.deepEqual(ids('sin-configurar'), ['1']);
  assert.deepEqual(ids('configurada'), ['2']);
  assert.deepEqual(ids('por-vencer'), ['3']);
  assert.deepEqual(ids('vencida'), ['4']);
  assert.deepEqual(ids('vencida', 'amaury'), []);
});

test('contarPorEstado alimenta los chips', () => {
  assert.deepEqual(contarPorEstado(FILAS, HOY), {
    todos: 4, configurada: 1, 'por-vencer': 1, vencida: 1, 'sin-configurar': 1,
  });
  assert.deepEqual(contarPorEstado([], HOY), {
    todos: 0, configurada: 0, 'por-vencer': 0, vencida: 0, 'sin-configurar': 0,
  });
});

test('permisos: Programación edita a todos; un cirujano solo a sí mismo', () => {
  assert.equal(puedeEditarAgenda({ rol: 'programacion' }, '1'), true);
  assert.equal(puedeEditarAgenda({ rol: 'cirujano', idMedico: '2' }, '2'), true);
  assert.equal(puedeEditarAgenda({ rol: 'cirujano', idMedico: '2' }, '1'), false);
  assert.equal(puedeEditarAgenda({ rol: 'cirujano' }, '1'), false);
});

test('cirujanosVisibles', () => {
  assert.equal(cirujanosVisibles({ rol: 'programacion' }, FILAS).length, 4);
  assert.deepEqual(cirujanosVisibles({ rol: 'cirujano', idMedico: '3' }, FILAS).map((f) => f.cirujano.idMedico), ['3']);
  assert.deepEqual(cirujanosVisibles({ rol: 'cirujano', idMedico: '99' }, FILAS), []);
});
```

- [ ] **Step 2: Ejecutar y confirmar que FALLAN**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/validaciones.test.mjs src/hooks/AgendaCirujanos/__tests__/excepciones.test.mjs src/hooks/AgendaCirujanos/__tests__/listado.test.mjs`
Expected: los 3 fallan con `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Crear los módulos**

Crea `src/hooks/AgendaCirujanos/validaciones.js`:

```javascript
// @ts-check
// Validaciones del editor. Cada función devuelve el mensaje de error o una
// cadena vacía si todo está bien.
import { aMinutos } from './intervalos.js';

/** @typedef {import('./tipos.js').DiaHorario} DiaHorario */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */

/**
 * @param {DiaHorario} dia
 * @returns {string}
 */
export function errorDia(dia) {
  if (!dia.activo) return '';
  if (!dia.bloques.length) return 'Agrega al menos un bloque o desactiva el día.';
  if (dia.bloques.some((b) => aMinutos(b.fin) <= aMinutos(b.inicio))) {
    return 'La hora de fin debe ser posterior a la de inicio.';
  }
  const ordenados = [...dia.bloques].sort((a, b) => aMinutos(a.inicio) - aMinutos(b.inicio));
  for (let i = 1; i < ordenados.length; i += 1) {
    if (aMinutos(ordenados[i].inicio) < aMinutos(ordenados[i - 1].fin)) {
      return 'Los bloques de un mismo día no pueden cruzarse.';
    }
  }
  return '';
}

/**
 * @param {HorarioSemanal} horario
 * @returns {string}
 */
export function errorVigencia(horario) {
  if (!horario.desde) return 'Elige desde qué fecha rige este horario.';
  if (horario.hasta !== null) {
    if (!horario.hasta) return 'Elige la fecha final o marca "Sin fecha de fin".';
    if (horario.hasta < horario.desde) return 'La fecha final debe ser posterior a la inicial.';
  }
  return '';
}

/**
 * @param {HorarioSemanal} horario
 * @returns {boolean}
 */
export function horarioTieneErrores(horario) {
  return !!errorVigencia(horario) || horario.dias.some((d) => !!errorDia(d));
}

/**
 * Valida los campos de una excepción antes de guardarla.
 * @param {Pick<Excepcion, 'desde'|'hasta'|'todoElDia'|'inicio'|'fin'>} excepcion
 * @returns {string}
 */
export function errorExcepcion(excepcion) {
  if (!excepcion.desde || !excepcion.hasta) return 'Elige la fecha inicial y la final.';
  if (excepcion.hasta < excepcion.desde) return 'La fecha final debe ser igual o posterior a la inicial.';
  if (!excepcion.todoElDia && aMinutos(excepcion.fin) <= aMinutos(excepcion.inicio)) {
    return 'La hora de fin debe ser posterior a la de inicio.';
  }
  return '';
}
```

Crea `src/hooks/AgendaCirujanos/excepciones.js`:

```javascript
// @ts-check
// Catálogo y utilidades de las excepciones (bloqueos y aperturas extra).

/** @typedef {import('./tipos.js').BorradorExcepcion} BorradorExcepcion */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').TipoExcepcion} TipoExcepcion */

/** @type {Record<TipoExcepcion, string[]>} */
export const MOTIVOS_EXCEPCION = {
  bloqueo: ['Vacaciones', 'Congreso o capacitación', 'Incapacidad', 'Permiso', 'Otro'],
  apertura: ['Jornada adicional', 'Reemplazo', 'Otro'],
};

/** @type {Record<TipoExcepcion, string>} */
export const ETIQUETA_TIPO = { bloqueo: 'Bloqueo', apertura: 'Apertura extra' };

/** @type {Record<TipoExcepcion, string>} */
export const AYUDA_TIPO = {
  bloqueo: 'El cirujano no estará disponible, aunque su horario semanal diga lo contrario.',
  apertura: 'El cirujano estará disponible además de su horario semanal.',
};

/**
 * Borrador de una excepción nueva: un bloqueo de todo el día, hoy.
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {BorradorExcepcion}
 */
export function excepcionNueva(hoy) {
  return {
    tipo: 'bloqueo',
    motivo: MOTIVOS_EXCEPCION.bloqueo[0],
    desde: hoy,
    hasta: hoy,
    todoElDia: true,
    inicio: '07:00',
    fin: '12:00',
    nota: '',
  };
}

/**
 * Cambia el tipo del borrador: el motivo vuelve al primero de ese tipo, un
 * bloqueo arranca "todo el día" y una apertura extra con franja horaria.
 * @param {BorradorExcepcion} borrador
 * @param {TipoExcepcion} tipo
 * @returns {BorradorExcepcion}
 */
export function cambiarTipoExcepcion(borrador, tipo) {
  if (borrador.tipo === tipo) return borrador;
  return { ...borrador, tipo, motivo: MOTIVOS_EXCEPCION[tipo][0], todoElDia: tipo === 'bloqueo' };
}

/**
 * Por fecha de inicio; a igual fecha, por orden de creación.
 * @param {Excepcion[]} excepciones
 * @returns {Excepcion[]}
 */
export function ordenarExcepciones(excepciones) {
  return [...excepciones].sort((a, b) => {
    if (a.desde !== b.desde) return a.desde < b.desde ? -1 : 1;
    return a.id - b.id;
  });
}
```

Crea `src/hooks/AgendaCirujanos/estadoAgenda.js`:

```javascript
// @ts-check
// Estado de la agenda de un cirujano (columna "Estado de agenda" del listado).
import { diasEntre, sumarDias } from './horario.js';

/** @typedef {import('./tipos.js').EstadoAgenda} EstadoAgenda */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */

/** Días antes del fin de la vigencia desde los que se avisa "Por vencer". */
export const DIAS_POR_VENCER = 30;

/** @type {Record<EstadoAgenda, string>} */
export const ESTADO_AGENDA_LABEL = {
  configurada: 'Configurada',
  'por-vencer': 'Por vencer',
  vencida: 'Vencida',
  'sin-configurar': 'Sin configurar',
};

/**
 * `sin-configurar`: no hay horario. `vencida`: la vigencia terminó antes de
 * hoy. `por-vencer`: termina hoy o dentro de los próximos 30 días.
 * `configurada`: el resto, incluido "sin fecha de fin".
 * @param {HorarioSemanal|null} horario
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {EstadoAgenda}
 */
export function estadoAgenda(horario, hoy) {
  if (!horario) return 'sin-configurar';
  if (!horario.hasta) return 'configurada';
  if (horario.hasta < hoy) return 'vencida';
  if (horario.hasta <= sumarDias(hoy, DIAS_POR_VENCER)) return 'por-vencer';
  return 'configurada';
}

/**
 * Días que faltan para que termine la vigencia, o null si no tiene fecha de
 * fin (o no hay horario).
 * @param {HorarioSemanal|null} horario
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {number|null}
 */
export function diasParaVencer(horario, hoy) {
  if (!horario || !horario.hasta) return null;
  return diasEntre(hoy, horario.hasta);
}

/**
 * La excepción vigente o futura que empieza primero (columna "Próxima
 * excepción"). Las ya terminadas no cuentan.
 * @param {Excepcion[]} excepciones
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Excepcion|null}
 */
export function proximaExcepcion(excepciones, hoy) {
  const vigentes = excepciones
    .filter((x) => x.hasta >= hoy)
    .sort((a, b) => (a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : 0));
  return vigentes[0] ?? null;
}
```

Crea `src/hooks/AgendaCirujanos/listado.js`:

```javascript
// @ts-check
// Filtros y conteos del listado de cirujanos.
import { estadoAgenda } from './estadoAgenda.js';

/** @typedef {import('./tipos.js').EstadoAgenda} EstadoAgenda */
/** @typedef {import('./tipos.js').FilaCirujano} FilaCirujano */

/**
 * Minúsculas y sin tildes, para buscar "angel" y encontrar "Ángel".
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * @param {FilaCirujano[]} filas
 * @param {{ estado: 'todos'|EstadoAgenda, busqueda: string }} filtros
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {FilaCirujano[]}
 */
export function filtrarCirujanos(filas, { estado, busqueda }, hoy) {
  const consulta = normalizarTexto(busqueda.trim());
  return filas.filter((fila) => (
    (estado === 'todos' || estadoAgenda(fila.agenda.horario, hoy) === estado)
    && normalizarTexto(fila.cirujano.nombre).includes(consulta)));
}

/**
 * Cantidad de cirujanos por estado, para los chips de filtro.
 * @param {FilaCirujano[]} filas
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {Record<'todos'|EstadoAgenda, number>}
 */
export function contarPorEstado(filas, hoy) {
  const conteo = {
    todos: filas.length, configurada: 0, 'por-vencer': 0, vencida: 0, 'sin-configurar': 0,
  };
  filas.forEach((fila) => { conteo[estadoAgenda(fila.agenda.horario, hoy)] += 1; });
  return conteo;
}
```

Crea `src/hooks/AgendaCirujanos/permisos.js`:

```javascript
// @ts-check
// Quién puede configurar la agenda de quién: Programación de cirugía configura
// la de cualquier cirujano; un cirujano, solo la suya. Todavía no hay
// identidad de usuario en la sesión, así que el usuario lo provee el servicio
// (mock); la regla ya queda aislada y probada para cuando exista.

/** @typedef {import('./tipos.js').UsuarioAgenda} UsuarioAgenda */
/** @typedef {import('./tipos.js').FilaCirujano} FilaCirujano */

/**
 * @param {UsuarioAgenda} usuario
 * @param {string} idMedico
 * @returns {boolean}
 */
export function puedeEditarAgenda(usuario, idMedico) {
  if (usuario.rol === 'programacion') return true;
  return usuario.rol === 'cirujano' && usuario.idMedico === idMedico;
}

/**
 * Filas que ve el usuario: Programación ve todas; un cirujano, solo la suya.
 * @param {UsuarioAgenda} usuario
 * @param {FilaCirujano[]} filas
 * @returns {FilaCirujano[]}
 */
export function cirujanosVisibles(usuario, filas) {
  if (usuario.rol === 'programacion') return filas;
  return filas.filter((fila) => fila.cirujano.idMedico === usuario.idMedico);
}
```

- [ ] **Step 4: Ejecutar y confirmar que PASAN**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/validaciones.test.mjs src/hooks/AgendaCirujanos/__tests__/excepciones.test.mjs src/hooks/AgendaCirujanos/__tests__/listado.test.mjs`
Expected: `ℹ pass 24`, `ℹ fail 0` (validaciones 8 + excepciones 6 + listado 10).

- [ ] **Step 5: Type-check**

Run el comando de type-check. Expected: sin salida.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/AgendaCirujanos
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): validaciones, excepciones, estado de agenda, listado y permisos

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Datos de ejemplo y capa de servicio

**Files:**
- Create: `src/hooks/AgendaCirujanos/mockAgendaCirujanos.js`, `agendaCirujanosService.js`
- Test: `src/hooks/AgendaCirujanos/__tests__/servicio.test.mjs`

**Interfaces:**
- Consumes: `MEDICOS_CATALOGO`, `SEDES`, `fetchAgendaRango` de `mockCirugiaData.js` (existen); `sumarDias`, `aISO` (`horario.js`); `normalizarTexto` (`listado.js`); `estadoAgenda`, `cirugiasEnConflicto`, `contarPorEstado`.
- Produces:
  - `mockAgendaCirujanos.js`: `crearSemilla(hoy): AgendaCirujano[]` (9 agendas; los 3 cirujanos restantes del catálogo quedan "sin configurar"; ids de excepción únicos).
  - `agendaCirujanosService.js` (todo devuelve `Promise`): `USUARIO_ACTUAL: UsuarioAgenda`, `hoyISO(): string`, `restablecerAgendas(hoy)` (solo tests), `listarCirujanos({ sede }): FilaCirujano[]`, `obtenerCirujano(idMedico): Cirujano|null`, `obtenerAgenda(idMedico): AgendaCirujano`, `guardarHorario(idMedico, horario)`, `agregarExcepcion(idMedico, BorradorExcepcion)`, `eliminarExcepcion(idMedico, idExcepcion)`, `listarCirugiasDeCirujano(idMedico): CirugiaAgenda[]`. El store se reemplaza, nunca se muta; todo lo que entra y sale se clona.

- [ ] **Step 1: Escribir el test (falla)**

Crea `src/hooks/AgendaCirujanos/__tests__/servicio.test.mjs`:

```javascript
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  agregarExcepcion, eliminarExcepcion, guardarHorario, listarCirugiasDeCirujano, listarCirujanos,
  obtenerAgenda, obtenerCirujano, restablecerAgendas, USUARIO_ACTUAL,
} from '../agendaCirujanosService.js';
import { crearSemilla } from '../mockAgendaCirujanos.js';
import { estadoAgenda } from '../estadoAgenda.js';
import { cirugiasEnConflicto } from '../conflictos.js';
import { contarPorEstado } from '../listado.js';
import { horarioCon, HOY } from './fixtures.mjs';

beforeEach(() => restablecerAgendas(HOY));

const ABRAHAM = '02757/98';
const ANGEL = '78714413'; // sin configurar

test('el usuario mock es Programación', () => {
  assert.deepEqual(USUARIO_ACTUAL, { rol: 'programacion' });
});

test('la semilla cubre los cuatro estados con datos relativos a hoy', () => {
  const filas = crearSemilla(HOY).map((a) => ({ cirujano: { idMedico: a.idMedico }, agenda: a }));
  const estados = new Set(filas.map((f) => estadoAgenda(f.agenda.horario, HOY)));
  assert.deepEqual([...estados].sort(), ['configurada', 'por-vencer', 'vencida']);
  assert.ok(crearSemilla(HOY).every((a) => a.excepciones.every((x) => Number.isInteger(x.id))));
  const ids = crearSemilla(HOY).flatMap((a) => a.excepciones.map((x) => x.id));
  assert.equal(new Set(ids).size, ids.length, 'ids de excepción únicos');
});

test('listarCirujanos: los 12 cirujanos de SEDE NORTE ordenados por nombre, con los 4 estados', async () => {
  const filas = await listarCirujanos({ sede: 'SEDE NORTE' });
  assert.equal(filas.length, 12);
  const nombres = filas.map((f) => f.cirujano.nombre);
  assert.deepEqual(nombres, [...nombres].sort((a, b) => a.localeCompare(b, 'es')));
  const conteo = contarPorEstado(filas, HOY);
  assert.equal(conteo.todos, 12);
  assert.ok(conteo.configurada > 0 && conteo['por-vencer'] > 0 && conteo.vencida > 0 && conteo['sin-configurar'] > 0);
});

test('listarCirujanos: otra sede no trae cirujanos; la sede no distingue tildes ni mayúsculas', async () => {
  assert.deepEqual(await listarCirujanos({ sede: 'SEDE CENTRO' }), []);
  assert.equal((await listarCirujanos({ sede: 'sede norte' })).length, 12);
});

test('obtenerCirujano', async () => {
  assert.equal((await obtenerCirujano(ABRAHAM))?.nombre, 'ABRAHAM GANEM BECHARA');
  assert.equal(await obtenerCirujano('no-existe'), null);
});

test('obtenerAgenda de un cirujano sin agenda: sin horario ni excepciones', async () => {
  assert.deepEqual(await obtenerAgenda(ANGEL), { idMedico: ANGEL, horario: null, excepciones: [] });
});

test('guardarHorario persiste y no comparte referencias con el store', async () => {
  const horario = horarioCon([1, 3]);
  const guardada = await guardarHorario(ANGEL, horario);
  assert.deepEqual(guardada.horario, horario);
  horario.dias[1].bloques[0].fin = '08:00';
  guardada.horario.dias[3].bloques[0].fin = '08:00';
  const releida = await obtenerAgenda(ANGEL);
  assert.equal(releida.horario?.dias[1].bloques[0].fin, '13:00');
  assert.equal(releida.horario?.dias[3].bloques[0].fin, '13:00');
});

test('guardarHorario conserva las excepciones del cirujano', async () => {
  const antes = await obtenerAgenda('94512888');
  assert.ok(antes.excepciones.length > 0);
  const despues = await guardarHorario('94512888', horarioCon([0]));
  assert.deepEqual(despues.excepciones, antes.excepciones);
});

test('agregarExcepcion asigna ids únicos y eliminarExcepcion la quita', async () => {
  const datos = {
    tipo: 'bloqueo', motivo: 'Permiso', desde: HOY, hasta: HOY, todoElDia: true, inicio: '07:00', fin: '19:00', nota: '',
  };
  const a1 = await agregarExcepcion(ANGEL, datos);
  const a2 = await agregarExcepcion(ANGEL, { ...datos, motivo: 'Otro' });
  assert.equal(a2.excepciones.length, 2);
  const [x1, x2] = a2.excepciones;
  assert.notEqual(x1.id, x2.id);
  assert.equal(a1.excepciones[0].id, x1.id);
  const sinPrimera = await eliminarExcepcion(ANGEL, x1.id);
  assert.deepEqual(sinPrimera.excepciones.map((x) => x.motivo), ['Otro']);
  assert.deepEqual((await obtenerAgenda(ANGEL)).excepciones.map((x) => x.motivo), ['Otro']);
});

test('eliminarExcepcion con un id inexistente no cambia nada', async () => {
  const antes = await obtenerAgenda('94512888');
  const despues = await eliminarExcepcion('94512888', 987654);
  assert.deepEqual(despues.excepciones, antes.excepciones);
});

test('listarCirugiasDeCirujano trae todas sus cirugías y solo las suyas', async () => {
  const cirugias = await listarCirugiasDeCirujano(ABRAHAM);
  assert.ok(cirugias.length > 0);
  assert.ok(cirugias.every((c) => c.cirujano === 'ABRAHAM GANEM BECHARA'));
  assert.deepEqual(await listarCirugiasDeCirujano('no-existe'), []);
});

test('integración: con el horario de la semilla, las cirugías futuras de un cirujano se evalúan', async () => {
  const [cirugias, agenda] = await Promise.all([listarCirugiasDeCirujano(ABRAHAM), obtenerAgenda(ABRAHAM)]);
  const conflictos = cirugiasEnConflicto(cirugias, agenda, '2026-10-14');
  assert.ok(conflictos.every((c) => c.cirugia.fecha >= '2026-10-14'));
  assert.ok(conflictos.every((c) => ['programada', 'urgencia'].includes(c.cirugia.estado)));
});
```

- [ ] **Step 2: Ejecutar y confirmar que FALLA**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/servicio.test.mjs`
Expected: falla con `ERR_MODULE_NOT_FOUND` (`agendaCirujanosService.js`).

- [ ] **Step 3: Crear la semilla y el servicio**

Crea `src/hooks/AgendaCirujanos/mockAgendaCirujanos.js`:

```javascript
// @ts-check
// Datos de ejemplo de "Agenda de cirujanos". Las fechas se calculan a partir
// de `hoy` para que los cuatro estados (configurada, por vencer, vencida y sin
// configurar) siempre aparezcan, sin importar qué día se abra la pantalla.
// Mismo criterio que mockCirugiaData.js: deterministas (nunca Math.random).
import { sumarDias } from './horario.js';

/** @typedef {import('./tipos.js').AgendaCirujano} AgendaCirujano */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */

/**
 * @param {Record<number, [string, string][]>} porDia bloques por índice de día (0 = lunes); los días ausentes quedan apagados
 * @param {string} desde
 * @param {string|null} hasta
 * @returns {HorarioSemanal}
 */
function horarioDe(porDia, desde, hasta) {
  return {
    desde,
    hasta,
    dias: Array.from({ length: 7 }, (_, i) => (porDia[i]
      ? { activo: true, bloques: porDia[i].map(([inicio, fin]) => ({ inicio, fin })) }
      : { activo: false, bloques: [{ inicio: '07:00', fin: '12:00' }] })),
  };
}

/**
 * @param {[string, string][]} bloques
 * @param {number[]} dias
 * @returns {Record<number, [string, string][]>}
 */
const diasCon = (bloques, dias) => Object.fromEntries(dias.map((d) => [d, bloques]));

const LUN_VIE = [0, 1, 2, 3, 4];

/**
 * Agendas de ejemplo, por `idMedico` del catálogo (MEDICOS_CATALOGO).
 * Los cirujanos que no aparecen acá quedan "Sin configurar".
 * @param {string} hoy 'YYYY-MM-DD'
 * @returns {AgendaCirujano[]}
 */
export function crearSemilla(hoy) {
  const d = (/** @type {number} */ n) => sumarDias(hoy, n);
  /** @type {{ idMedico: string, horario: HorarioSemanal, excepciones: Omit<Excepcion, 'id'>[] }[]} */
  const agendas = [
    // Configurada, medio tiempo.
    { idMedico: '02757/98', horario: horarioDe(diasCon([['07:00', '13:00']], [0, 2, 4]), d(-43), null), excepciones: [] },
    // Por vencer (la vigencia termina en 23 días).
    { idMedico: '6874047', horario: horarioDe(diasCon([['08:00', '16:00']], [1, 2, 3]), d(-43), d(23)), excepciones: [] },
    // Por vencer justo en el límite de 30 días.
    { idMedico: '72845103', horario: horarioDe(diasCon([['07:00', '19:00']], LUN_VIE), hoy, d(30)), excepciones: [] },
    // Configurada, con bloques partidos, una apertura extra y un congreso.
    {
      idMedico: '94512888',
      horario: horarioDe({
        0: [['07:00', '12:00'], ['14:00', '18:00']],
        1: [['07:00', '14:00']],
        2: [['07:00', '12:00'], ['14:00', '17:00']],
        3: [['07:00', '12:00']],
        4: [['07:00', '16:00']],
      }, d(-13), null),
      excepciones: [
        {
          tipo: 'apertura', motivo: 'Jornada adicional', desde: d(3), hasta: d(3), todoElDia: false, inicio: '08:00', fin: '12:00', nota: '',
        },
        {
          tipo: 'bloqueo', motivo: 'Congreso o capacitación', desde: d(26), hasta: d(28), todoElDia: true, inicio: '07:00', fin: '19:00', nota: 'Congreso Nacional de Cirugía Oncológica',
        },
      ],
    },
    // Configurada, jornada completa, con vacaciones próximas.
    {
      idMedico: '78036459',
      horario: horarioDe(diasCon([['07:00', '18:00']], LUN_VIE), d(-74), null),
      excepciones: [
        {
          tipo: 'bloqueo', motivo: 'Vacaciones', desde: d(6), hasta: d(10), todoElDia: true, inicio: '07:00', fin: '19:00', nota: '',
        },
      ],
    },
    // Configurada, mañanas.
    { idMedico: '1102812780', horario: horarioDe(diasCon([['07:00', '12:00']], LUN_VIE), d(-29), null), excepciones: [] },
    // Vencida.
    { idMedico: '73133878', horario: horarioDe(diasCon([['08:00', '14:00']], [0, 2]), d(-135), d(-14)), excepciones: [] },
    // Configurada, jornada completa.
    { idMedico: '2757886', horario: horarioDe(diasCon([['07:00', '18:00']], LUN_VIE), d(-73), null), excepciones: [] },
    // Configurada, de miércoles a viernes.
    { idMedico: '43876219', horario: horarioDe(diasCon([['09:00', '17:00']], [2, 3, 4]), d(-13), null), excepciones: [] },
  ];

  let siguienteId = 1;
  return agendas.map((a) => ({
    ...a,
    excepciones: a.excepciones.map((x) => ({ ...x, id: siguienteId++ })),
  }));
}
```

Crea `src/hooks/AgendaCirujanos/agendaCirujanosService.js`:

```javascript
// @ts-check
// Capa de servicio de "Agenda de cirujanos". Hoy lee y escribe un store en
// memoria (se reinicia al recargar, igual que mockCirugiaData.js); cuando
// exista el backend, solo cambia la implementación de estas funciones: la UI
// llama únicamente a lo que se exporta acá y siempre recibe una Promise.
//
// El store se REEMPLAZA, nunca se muta, y todo lo que entra o sale se clona,
// así que un componente no puede alterar el store sin pasar por el servicio.
import { MEDICOS_CATALOGO, SEDES, fetchAgendaRango } from '../ProgramacionSalaCirugias/mockCirugiaData.js';
import { crearSemilla } from './mockAgendaCirujanos.js';
import { aISO } from './horario.js';
import { normalizarTexto } from './listado.js';

/** @typedef {import('./tipos.js').AgendaCirujano} AgendaCirujano */
/** @typedef {import('./tipos.js').Cirujano} Cirujano */
/** @typedef {import('./tipos.js').CirugiaAgenda} CirugiaAgenda */
/** @typedef {import('./tipos.js').Excepcion} Excepcion */
/** @typedef {import('./tipos.js').FilaCirujano} FilaCirujano */
/** @typedef {import('./tipos.js').HorarioSemanal} HorarioSemanal */
/** @typedef {import('./tipos.js').UsuarioAgenda} UsuarioAgenda */

const LATENCIA_MS = 150;

/**
 * Usuario de la sesión. Hoy no hay identidad de usuario: se asume Programación
 * de cirugía (configura a cualquier cirujano). Con backend sale del token.
 * @type {UsuarioAgenda}
 */
export const USUARIO_ACTUAL = { rol: 'programacion' };

/**
 * @template T
 * @param {T} valor
 * @returns {Promise<T>}
 */
function conLatencia(valor) {
  return new Promise((resolve) => { setTimeout(() => resolve(valor), LATENCIA_MS); });
}

/** @returns {string} hoy en 'YYYY-MM-DD' (hora local) */
export function hoyISO() {
  return aISO(new Date());
}

/** @type {AgendaCirujano[]} */
let agendas = crearSemilla(hoyISO());
let siguienteIdExcepcion = 1000;

/**
 * Solo para tests: vuelve a la semilla de `hoy`.
 * @param {string} hoy 'YYYY-MM-DD'
 */
export function restablecerAgendas(hoy) {
  agendas = crearSemilla(hoy);
  siguienteIdExcepcion = 1000;
}

/** @returns {Cirujano[]} */
function cirujanosDelCatalogo() {
  return MEDICOS_CATALOGO
    .filter((m) => m.descripcion === 'Cirujano')
    .map((m) => ({ idMedico: m.idMedico, nombre: m.nombre, sede: m.sede }));
}

/**
 * Las sedes de cirugías y del catálogo de médicos usan ids distintos
 * ('02' vs '01' para Sede Norte), así que se resuelve por nombre, solo acá.
 * @param {string} sede nombre, p. ej. 'SEDE NORTE'
 * @returns {string|undefined} id de sede de las cirugías
 */
function sedeIdDeCirugias(sede) {
  return SEDES.find((s) => normalizarTexto(s.label).includes(normalizarTexto(sede)))?.value;
}

/**
 * @param {string} idMedico
 * @returns {AgendaCirujano}
 */
function agendaDe(idMedico) {
  return agendas.find((a) => a.idMedico === idMedico) ?? { idMedico, horario: null, excepciones: [] };
}

/**
 * @param {string} idMedico
 * @param {Partial<AgendaCirujano>} cambios
 * @returns {AgendaCirujano}
 */
function reemplazarAgenda(idMedico, cambios) {
  const nueva = { ...agendaDe(idMedico), ...cambios, idMedico };
  agendas = agendas.some((a) => a.idMedico === idMedico)
    ? agendas.map((a) => (a.idMedico === idMedico ? nueva : a))
    : [...agendas, nueva];
  return nueva;
}

/**
 * Cirujanos de una sede con el resumen de su agenda, ordenados por nombre.
 * @param {{ sede: string }} filtros nombre de la sede, p. ej. 'SEDE NORTE'
 * @returns {Promise<FilaCirujano[]>}
 */
export function listarCirujanos({ sede }) {
  const filas = cirujanosDelCatalogo()
    .filter((c) => normalizarTexto(c.sede) === normalizarTexto(sede))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    .map((cirujano) => ({ cirujano, agenda: structuredClone(agendaDe(cirujano.idMedico)) }));
  return conLatencia(filas);
}

/**
 * @param {string} idMedico
 * @returns {Promise<Cirujano|null>}
 */
export function obtenerCirujano(idMedico) {
  return conLatencia(cirujanosDelCatalogo().find((c) => c.idMedico === idMedico) ?? null);
}

/**
 * @param {string} idMedico
 * @returns {Promise<AgendaCirujano>} sin horario si el cirujano no tiene agenda
 */
export function obtenerAgenda(idMedico) {
  return conLatencia(structuredClone(agendaDe(idMedico)));
}

/**
 * @param {string} idMedico
 * @param {HorarioSemanal} horario
 * @returns {Promise<AgendaCirujano>}
 */
export function guardarHorario(idMedico, horario) {
  return conLatencia(structuredClone(reemplazarAgenda(idMedico, { horario: structuredClone(horario) })));
}

/**
 * @param {string} idMedico
 * @param {Omit<Excepcion, 'id'>} excepcion
 * @returns {Promise<AgendaCirujano>} la agenda con la excepción ya agregada (con su id)
 */
export function agregarExcepcion(idMedico, excepcion) {
  const nueva = { ...structuredClone(excepcion), id: siguienteIdExcepcion };
  siguienteIdExcepcion += 1;
  const actual = agendaDe(idMedico);
  return conLatencia(structuredClone(reemplazarAgenda(idMedico, { excepciones: [...actual.excepciones, nueva] })));
}

/**
 * @param {string} idMedico
 * @param {number} idExcepcion
 * @returns {Promise<AgendaCirujano>}
 */
export function eliminarExcepcion(idMedico, idExcepcion) {
  const actual = agendaDe(idMedico);
  return conLatencia(structuredClone(reemplazarAgenda(idMedico, {
    excepciones: actual.excepciones.filter((x) => x.id !== idExcepcion),
  })));
}

/**
 * Todas las cirugías del cirujano, de cualquier fecha y estado. Lee el store
 * vivo de cirugías: lo que se programe o reprograme en otra pantalla se
 * refleja sin recargar.
 * @param {string} idMedico
 * @returns {Promise<CirugiaAgenda[]>}
 */
export function listarCirugiasDeCirujano(idMedico) {
  const cirujano = cirujanosDelCatalogo().find((c) => c.idMedico === idMedico);
  const sedeId = cirujano ? sedeIdDeCirugias(cirujano.sede) : undefined;
  if (!cirujano || !sedeId) return conLatencia([]);
  return fetchAgendaRango({
    sedeId, salaId: 'todas', inicio: '0000-01-01', fin: '9999-12-31', cirujano: cirujano.nombre,
  });
}
```

- [ ] **Step 4: Ejecutar y confirmar que PASA**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/servicio.test.mjs`
Expected: `ℹ pass 12`, `ℹ fail 0`.

- [ ] **Step 5: Suite completa de la feature y de todo el repo**

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/*.test.mjs`
Expected: `ℹ pass 94`, `ℹ fail 0`.

Run: `npm test`
Expected: los 94 tests nuevos pasan y no hay fallos nuevos respecto de la línea base (si algún test previo ya fallaba, sigue igual).

- [ ] **Step 6: Type-check**

Run el comando de type-check. Expected: sin salida.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/AgendaCirujanos
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): datos de ejemplo y capa de servicio sobre un store en memoria

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Ruta, menú, shell y listado de cirujanos

**Files:**
- Create: `src/app/cirugia/configuracion/agenda-cirujanos/page.jsx`
- Create: `src/Components/AgendaCirujanos/AgendaCirujanos.jsx`, `AgendaCirujanos.css`, `shared/shared.css`
- Create: `src/Components/AgendaCirujanos/ListadoCirujanos/ListadoCirujanos.jsx`, `.css`
- Create: `src/Components/AgendaCirujanos/CirujanosTable/CirujanosTable.jsx`, `.css`
- Create (stub, se reemplaza en la Tarea 6): `src/Components/AgendaCirujanos/EditorAgenda/EditorAgenda.jsx`
- Modify: `src/Components/HamburgerMenu/HamburgerMenu.jsx`, `src/Components/Sidebar/Sidebar.jsx:70-74`

**Interfaces:**
- Consumes (Tareas 1–4): `listarCirujanos`, `hoyISO`, `USUARIO_ACTUAL`; `puedeEditarAgenda`, `cirujanosVisibles`; `contarPorEstado`, `filtrarCirujanos`; `estadoAgenda`, `ESTADO_AGENDA_LABEL`, `diasParaVencer`, `proximaExcepcion`; `minutosSemanales`; `ETIQUETA_TIPO`; `formatoHoras`, `fechaLabel`, `fechaCorta`. Del proyecto: `Sidebar`, `Topbar`, `Button`, `Badge`, `SearchField`, `SegmentedFilterBar`, `useSedeSeleccionada` (`@/hooks/Sede/sede`), `initShellChrome`, `capitalizarNombre` (`@/hooks/ProgramacionSalaCirugias/gestion/gestion`).
- Produces: `<AgendaCirujanos/>` (default export, sin props); `<ListadoCirujanos filas hoy usuario onAbrir/>`; `<CirujanosTable filas hoy usuario onAbrir/>`; `<EditorAgenda idMedico hoy onVolver onAviso/>` (stub). Clases de `shared.css`: `.ac-card`, `.ac-estado`, `.ac-estado-titulo`, `.ac-err`, `.ac-hint`, `.ac-callout(-info|-warn)`, `.ac-grid-2`, `.ac-check`, `.ac-hora`.

- [ ] **Step 1: Preparar Playwright (una sola vez, fuera del repo)**

```bash
PW="$TEMP/agenda-pw"; mkdir -p "$PW" && cd "$PW" && npm init -y >/dev/null 2>&1 && npm i playwright-core 2>&1 | tail -1
ls ~/AppData/Local/ms-playwright | grep chromium-   # debe listar al menos un chromium-NNNN
```
Si no hay Chromium: `npx -y playwright install chromium` y repite el `ls`. Vuelve a la raíz del repo.

Crea `$TEMP/agenda-pw/lib.mjs`:

```javascript
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const BASE = 'http://localhost:3000';

function chromePath() {
  const raiz = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
  const dir = fs.readdirSync(raiz).filter((d) => d.startsWith('chromium-')).sort().at(-1);
  return path.join(raiz, dir, 'chrome-win64', 'chrome.exe');
}

// Navegador con la fecha fija en 2026-10-14 (miércoles) para que los datos de demo sean deterministas.
export async function iniciar({ ancho = 1920, alto = 940 } = {}) {
  const browser = await chromium.launch({ executablePath: chromePath() });
  const context = await browser.newContext({ viewport: { width: ancho, height: alto } });
  await context.clock.setFixedTime(new Date(2026, 9, 14, 9, 0, 0));
  const page = await context.newPage();
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  return { browser, page, errores };
}

// Abre una ruta y, en una sesión nueva, elige el área funcional que bloquea la pantalla.
export async function abrir(page, ruta) {
  await page.goto(BASE + ruta, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(800);
  if (await page.locator('.afp-overlay').count()) {
    await page.locator('.afp-overlay').getByText('CONSULTA EXTERNA').click();
    await page.locator('.afp-overlay').getByRole('button', { name: 'Seleccionar', exact: true }).click();
    await page.waitForTimeout(600);
  }
}
```

- [ ] **Step 2: Entrada en el menú hamburguesa y en el Sidebar**

En `src/Components/HamburgerMenu/HamburgerMenu.jsx`, agrega `LuScissors` al import (entre `LuReceipt` y `LuSettings`):

```jsx
  LuReceipt,
  LuScissors,
  LuSettings,
```

y agrega el módulo **Cirugía** en `MEGA_MENU`, justo después del bloque de `hospitalizacion` (antes de `ayudas-diagnosticas`):

```jsx
  {
    id: 'cirugia',
    label: 'Cirugía',
    icon: LuScissors,
    columns: [
      {
        id: 'configuracion',
        label: 'Configuración',
        icon: LuSettings,
        items: [
          { id: 'agenda-cirujanos', label: 'Agenda de cirujanos', href: '/cirugia/configuracion/agenda-cirujanos' },
        ],
      },
    ],
  },
```

En `src/Components/Sidebar/Sidebar.jsx` (líneas ~70-74) el grupo "Cirugía" solo se abre en rutas conocidas; agrega la nueva (sin sumar un enlace al Sidebar: la feature vive en el hamburguesa):

```jsx
  const isCirugiaGestion = pathname.startsWith('/cirugia/gestion');
  const isCirugiaConfiguracion = pathname.startsWith('/cirugia/configuracion');
  const isCirugiaProgramacion = pathname.startsWith('/cirugia/programacion') || pathname.startsWith('/cirugia/historial-quirurgico');
  const isCirugia = isCirugiaPanel || isCirugiaProgramacion || isCirugiaCanastas || isCirugiaGestion || isCirugiaConfiguracion;
```

- [ ] **Step 3: Estilos compartidos y tokens de la feature**

Crea `src/Components/AgendaCirujanos/shared/shared.css`:

```css
/* Reglas compartidas por 2+ componentes de "Agenda de cirujanos" (ver AGENTS.md
   "Component organization"). Se importa una sola vez desde la ruta (page.jsx).
   Los tokens de color, el shell (.app/.main/.content/.psc-page-header), el
   toast (.psc-toast), el scaffolding de modales (.modal-overlay/.modal-card/
   .modal-body/.modal-footer/.form-field), los chips (.chip-group) y la barra de
   filtros (.filter-bar/.filter-spacer) vienen de ProgramacionSalaCirugias.css y
   shared/shared.css de esa feature: AgendaCirujanos.jsx los importa antes. */

.ac-card{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);min-height:0;
}

/* Mensajes de carga / vacío / sin permiso. */
.ac-estado{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
  padding:40px 24px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);
}
.ac-estado p{margin:0;}
.ac-estado-titulo{font-size:var(--fs-xl);font-weight:var(--fw-semibold);color:var(--ink-900);}

.ac-err{
  display:flex;align-items:flex-start;gap:6px;margin:8px 0 0;
  font-size:var(--fs-sm);color:var(--red);
}
.ac-err .icon{width:14px;height:14px;flex-shrink:0;margin-top:1px;}
.ac-hint{margin:8px 0 0;font-size:var(--fs-sm);color:var(--ink-500);}

.ac-callout{
  display:flex;gap:10px;padding:12px;border-radius:var(--radius);
  font-size:var(--fs-sm);line-height:1.4;
}
.ac-callout p{margin:0;}
.ac-callout .icon{width:18px;height:18px;flex-shrink:0;margin-top:1px;}
.ac-callout-info{background:var(--status-info-bg);color:var(--status-info-fg);}
.ac-callout-warn{background:var(--amber-bg);color:var(--amber-fg);}

.ac-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.ac-check{
  display:flex;align-items:center;gap:8px;margin-top:10px;
  font-size:var(--fs-base);color:var(--ink-900);cursor:pointer;
}
.ac-check input{width:16px;height:16px;accent-color:var(--primary);margin:0;}
/* Ancho de un selector de hora ("07:00"). */
.ac-hora{width:104px;flex-shrink:0;}
```

Crea `src/Components/AgendaCirujanos/AgendaCirujanos.css`:

```css
/* Tokens propios de la feature, derivados de los de color de la jornada de
   cirugía (ProgramacionSalaCirugias.css) para que hereden el tema oscuro: el
   rayado de "fuera de agenda", las líneas de la grilla de la vista previa y el
   rayado rojo de los bloqueos. `--ac-hora-h` es el alto de una hora en esa
   grilla; CalendarioSemanal.jsx lo fija inline con el mismo valor que usa para
   posicionar. */
:root{
  --ac-hora-h:56px;
  --ac-hatch:color-mix(in srgb,var(--ink-500) 14%,transparent);
  --ac-grid:color-mix(in srgb,var(--ink-500) 18%,transparent);
  --ac-block-a:color-mix(in srgb,var(--red) 24%,transparent);
  --ac-block-b:color-mix(in srgb,var(--red) 9%,transparent);
}
```

- [ ] **Step 4: Listado y tabla**

Crea `src/Components/AgendaCirujanos/ListadoCirujanos/ListadoCirujanos.jsx`:

```jsx
'use client';

import { useState } from 'react';
import './ListadoCirujanos.css';
import SearchField from '@/Components/SearchField/SearchField';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import CirujanosTable from '../CirujanosTable/CirujanosTable';
import { contarPorEstado, filtrarCirujanos } from '@/hooks/AgendaCirujanos/listado';
import { cirujanosVisibles } from '@/hooks/AgendaCirujanos/permisos';

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'configurada', label: 'Configuradas' },
  { value: 'por-vencer', label: 'Por vencer' },
  { value: 'vencida', label: 'Vencidas' },
  { value: 'sin-configurar', label: 'Sin configurar' },
];

// Listado de cirujanos con su estado de agenda. Una sola fila de toolbar (ver
// AGENTS.md "Barra de filtros de listado"): buscador, spacer, chips de estado
// con conteo. `filas` null = cargando.
export default function ListadoCirujanos({
  filas, hoy, usuario, onAbrir,
}) {
  const [estado, setEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const propias = filas ? cirujanosVisibles(usuario, filas) : [];
  const conteo = contarPorEstado(propias, hoy);
  const visibles = filtrarCirujanos(propias, { estado, busqueda }, hoy);
  const opciones = FILTROS.map((f) => ({ ...f, count: conteo[f.value] }));

  return (
    <>
      <div className="psc-page-header">
        <div>
          <h1>Agenda de cirujanos</h1>
          <p>Configura cuándo opera cada cirujano. Programación solo podrá asignarle cirugías dentro de esa disponibilidad.</p>
        </div>
      </div>

      <section className="ac-card ac-lista" aria-label="Listado de cirujanos">
        <div className="filter-bar">
          <SearchField
            className="ac-buscador"
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por nombre del cirujano"
            ariaLabel="Buscar cirujano"
          />
          <div className="filter-spacer" />
          <SegmentedFilterBar
            options={opciones}
            value={estado}
            onChange={setEstado}
            ariaLabel="Filtrar por estado de agenda"
          />
        </div>

        {filas === null ? (
          <p className="ac-estado" role="status">Cargando cirujanos…</p>
        ) : (
          <CirujanosTable filas={visibles} hoy={hoy} usuario={usuario} onAbrir={onAbrir} />
        )}

        <div className="ac-lista-pie">
          <span>Mostrando {visibles.length} de {propias.length} cirujanos</span>
          <span>Un cirujano sin agenda vigente no se puede elegir al programar una cirugía, salvo urgencias.</span>
        </div>
      </section>
    </>
  );
}
```

Crea `src/Components/AgendaCirujanos/ListadoCirujanos/ListadoCirujanos.css`:

```css
/* .ac-card/.ac-estado y .filter-bar/.filter-spacer viven en shared/shared.css
   (esta feature y la de Programación). Acá solo lo propio del listado. */
.ac-lista{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.ac-buscador{width:280px;flex-shrink:0;}
.ac-lista-pie{
  display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px 16px;flex-shrink:0;
  padding:12px 16px;border-top:1px solid var(--border);
  font-size:var(--fs-sm);color:var(--ink-500);
}
```

Crea `src/Components/AgendaCirujanos/CirujanosTable/CirujanosTable.jsx`:

```jsx
'use client';

import './CirujanosTable.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { minutosSemanales } from '@/hooks/AgendaCirujanos/disponibilidad';
import {
  diasParaVencer, ESTADO_AGENDA_LABEL, estadoAgenda, proximaExcepcion,
} from '@/hooks/AgendaCirujanos/estadoAgenda';
import { ETIQUETA_TIPO } from '@/hooks/AgendaCirujanos/excepciones';
import { fechaCorta, fechaLabel, formatoHoras } from '@/hooks/AgendaCirujanos/formato';
import { puedeEditarAgenda } from '@/hooks/AgendaCirujanos/permisos';

const TONO_ESTADO = {
  configurada: 'success', 'por-vencer': 'warn', vencida: 'danger', 'sin-configurar': 'neutral',
};

// Dos líneas: desde cuándo rige y hasta cuándo (con aviso si está por vencer).
function textoVigencia(horario, estado, hoy) {
  const desde = `Desde ${fechaLabel(horario.desde)}`;
  if (!horario.hasta) return [desde, 'Sin fecha de fin'];
  if (estado === 'vencida') return [desde, `Venció el ${fechaLabel(horario.hasta)}`];
  const dias = diasParaVencer(horario, hoy);
  let vence = '';
  if (estado === 'por-vencer') vence = dias === 0 ? ' · vence hoy' : ` · vence en ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return [desde, `Hasta ${fechaLabel(horario.hasta)}${vence}`];
}

const Vacio = () => <span className="ac-sub">—</span>;

// Tabla del listado. Fila clicable como atajo; el botón de la fila es la acción
// accesible por teclado. Cada <th> en sentence case con los tokens --th-*.
export default function CirujanosTable({
  filas, hoy, usuario, onAbrir,
}) {
  return (
    <div className="ac-tabla-wrap">
      <table className="ac-tabla">
        <thead>
          <tr>
            <th scope="col">Cirujano</th>
            <th scope="col">Sede</th>
            <th scope="col">Estado de agenda</th>
            <th scope="col">Horas por semana</th>
            <th scope="col">Vigencia</th>
            <th scope="col">Próxima excepción</th>
            <th scope="col"><span className="ac-sr">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={7}><p className="ac-estado">Ningún cirujano coincide con la búsqueda o el filtro.</p></td>
            </tr>
          )}
          {filas.map(({ cirujano, agenda }) => {
            const horario = agenda?.horario ?? null;
            const estado = estadoAgenda(horario, hoy);
            const sinAgenda = estado === 'sin-configurar';
            const puede = puedeEditarAgenda(usuario, cirujano.idMedico);
            const proxima = proximaExcepcion(agenda?.excepciones ?? [], hoy);
            const [vigDesde, vigHasta] = horario ? textoVigencia(horario, estado, hoy) : [];
            const accion = sinAgenda ? 'Configurar agenda' : 'Editar agenda';
            const nombre = capitalizarNombre(cirujano.nombre);
            return (
              <tr
                key={cirujano.idMedico}
                className={puede ? 'ac-fila-clicable' : undefined}
                onClick={puede ? () => onAbrir(cirujano.idMedico) : undefined}
              >
                <td>
                  <div className="ac-nombre">{nombre}</div>
                  <div className="ac-sub">Cirujano</div>
                </td>
                <td>{cirujano.sede}</td>
                <td><Badge tone={TONO_ESTADO[estado]}>{ESTADO_AGENDA_LABEL[estado]}</Badge></td>
                <td className="ac-num">{horario ? formatoHoras(minutosSemanales(horario)) : <Vacio />}</td>
                <td>
                  {horario ? (
                    <>
                      <div>{vigDesde}</div>
                      <div className="ac-sub">{vigHasta}</div>
                    </>
                  ) : <Vacio />}
                </td>
                <td>
                  {proxima ? (
                    <>
                      <div>{ETIQUETA_TIPO[proxima.tipo]} · {proxima.motivo}</div>
                      <div className="ac-sub">
                        {fechaCorta(proxima.desde)}{proxima.hasta !== proxima.desde ? ` – ${fechaCorta(proxima.hasta)}` : ''}
                      </div>
                    </>
                  ) : <Vacio />}
                </td>
                <td className="ac-col-accion">
                  <Button
                    size="sm"
                    variant={sinAgenda || estado === 'vencida' ? 'primary' : 'outline'}
                    disabled={!puede}
                    aria-label={`${accion} de ${nombre}`}
                    onClick={(e) => { e.stopPropagation(); onAbrir(cirujano.idMedico); }}
                  >
                    {accion}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/CirujanosTable/CirujanosTable.css`:

```css
.ac-tabla-wrap{flex:1;min-height:0;overflow:auto;}
.ac-tabla{width:100%;border-collapse:collapse;min-width:900px;}

/* Encabezado principal (AGENTS.md "Encabezados de tabla"): tokens --th-*,
   sticky, mismo padding horizontal que el td. */
.ac-tabla th{
  position:sticky;top:0;z-index:var(--z-sticky);
  padding:10px 16px;text-align:left;white-space:nowrap;
  font-size:var(--th-fs);font-weight:var(--th-fw);color:var(--th-color);
  background:var(--table-header-bg);border-bottom:1px solid var(--border);
}
.ac-tabla td{
  padding:12px 16px;vertical-align:middle;
  font-size:var(--fs-base);color:var(--ink-900);border-bottom:1px solid var(--border);
}
.ac-fila-clicable{cursor:pointer;}
.ac-fila-clicable:hover{background:var(--bg);}

.ac-nombre{font-weight:var(--fw-semibold);}
.ac-sub{font-size:var(--fs-sm);color:var(--ink-500);}
.ac-num{white-space:nowrap;}
.ac-col-accion{text-align:right;}

/* Texto solo para lectores de pantalla (cabecera de la columna de acciones). */
.ac-sr{
  position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
```

- [ ] **Step 5: Stub del editor (se reemplaza completo en la Tarea 6)**

Crea `src/Components/AgendaCirujanos/EditorAgenda/EditorAgenda.jsx`:

```jsx
'use client';

// STUB: se reemplaza por el editor completo en la Tarea 6.
export default function EditorAgenda({ idMedico, onVolver }) {
  return (
    <div className="ac-card ac-estado">
      <p className="ac-estado-titulo">Editor de la agenda {idMedico}</p>
      <button type="button" onClick={onVolver}>Volver al listado</button>
    </div>
  );
}
```

- [ ] **Step 6: Orquestador y ruta**

Crea `src/Components/AgendaCirujanos/AgendaCirujanos.jsx`:

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Tokens (:root), shell (.app/.main/.content), toast, modales y barra de
// filtros de la jornada de cirugía: los mismos 2 archivos que cargan las demás
// rutas de /cirugia (ver RevisionVencidas.jsx).
import '../ProgramacionSalaCirugias/ProgramacionSalaCirugias.css';
import '../ProgramacionSalaCirugias/shared/shared.css';
import './AgendaCirujanos.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import ListadoCirujanos from './ListadoCirujanos/ListadoCirujanos';
import EditorAgenda from './EditorAgenda/EditorAgenda';
import { useSedeSeleccionada } from '@/hooks/Sede/sede';
import { hoyISO, listarCirujanos, USUARIO_ACTUAL } from '@/hooks/AgendaCirujanos/agendaCirujanosService';
import { puedeEditarAgenda } from '@/hooks/AgendaCirujanos/permisos';

const RUTA = '/cirugia/configuracion/agenda-cirujanos';
const hrefEditor = (idMedico) => `${RUTA}?cirujano=${encodeURIComponent(idMedico)}`;

// "Agenda de cirujanos" (spec 2026-10-14): configuración de la disponibilidad
// de cada cirujano. Una sola ruta: sin `?cirujano=` muestra el listado; con él,
// el editor de ese cirujano. El estado de cada vista vive en su componente; acá
// solo el shell, el listado cargado y el aviso (toast).
export default function AgendaCirujanos() {
  const router = useRouter();
  const idMedico = useSearchParams().get('cirujano');
  const sede = useSedeSeleccionada();
  const [hoy] = useState(() => hoyISO());
  const [filas, setFilas] = useState(null); // null = cargando
  const [aviso, setAviso] = useState(null);
  const avisoTimerRef = useRef(null);

  useEffect(() => {
    const limpiarShell = initShellChrome({ startCollapsed: true });
    return () => limpiarShell?.();
  }, []);

  // Se recarga al volver del editor (idMedico pasa a null) para reflejar lo guardado.
  useEffect(() => {
    if (idMedico) return undefined;
    let cancelado = false;
    listarCirujanos({ sede: sede.descripcion }).then((items) => {
      if (!cancelado) setFilas(items);
    });
    return () => { cancelado = true; };
  }, [idMedico, sede.descripcion]);

  useEffect(() => () => clearTimeout(avisoTimerRef.current), []);

  function mostrarAviso(mensaje) {
    setAviso(mensaje);
    clearTimeout(avisoTimerRef.current);
    avisoTimerRef.current = setTimeout(() => setAviso(null), 2600);
  }

  const irAlListado = () => router.push(RUTA);
  const puedeEditar = idMedico ? puedeEditarAgenda(USUARIO_ACTUAL, idMedico) : false;

  let cuerpo;
  if (!idMedico) {
    cuerpo = (
      <ListadoCirujanos
        filas={filas}
        hoy={hoy}
        usuario={USUARIO_ACTUAL}
        onAbrir={(id) => router.push(hrefEditor(id))}
      />
    );
  } else if (!puedeEditar) {
    cuerpo = (
      <div className="ac-card ac-estado" role="alert">
        <p className="ac-estado-titulo">No tienes permiso para editar esta agenda</p>
        <p>Solo Programación de cirugía o el propio cirujano pueden configurarla.</p>
        <Button variant="outline" onClick={irAlListado}>Volver al listado</Button>
      </div>
    );
  } else {
    cuerpo = (
      <EditorAgenda
        key={idMedico}
        idMedico={idMedico}
        hoy={hoy}
        onVolver={irAlListado}
        onAviso={mostrarAviso}
      />
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Cirugía', 'Configuración']}
          page="Agenda de cirujanos"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content">{cuerpo}</div>
      </div>

      <div className={`psc-toast${aviso ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{aviso}</span>
      </div>
    </div>
  );
}
```

Crea `src/app/cirugia/configuracion/agenda-cirujanos/page.jsx`:

```jsx
import { Suspense } from 'react';
import AgendaCirujanos from '@/Components/AgendaCirujanos/AgendaCirujanos';
import '@/Components/AgendaCirujanos/shared/shared.css';

export default function AgendaCirujanosPage() {
  // Suspense: la pantalla lee ?cirujano= (useSearchParams) para abrir el editor.
  return (
    <Suspense fallback={null}>
      <AgendaCirujanos />
    </Suspense>
  );
}
```

- [ ] **Step 7: Lint**

Run: `npx eslint src/Components/AgendaCirujanos src/app/cirugia/configuracion src/Components/HamburgerMenu src/Components/Sidebar`
Expected: sin errores ni avisos en los archivos de la feature. Si `HamburgerMenu.jsx` o `Sidebar.jsx` muestran avisos que la línea base ya tenía, ignóralos.

- [ ] **Step 8: Verificar en el navegador**

Levanta el servidor si no corre: `npm run dev` (en segundo plano). Si el dev server ya llevaba rato abierto y la ruta nueva da 404, detenlo, borra `.next` y reinícialo (caché de rutas desactualizada en carpetas de OneDrive).

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/cirugia/configuracion/agenda-cirujanos`
Expected: `200`

Crea y corre `$TEMP/agenda-pw/t5.mjs`:

```javascript
import assert from 'node:assert/strict';
import { abrir, iniciar } from './lib.mjs';

const { browser, page, errores } = await iniciar();
await abrir(page, '/cirugia/configuracion/agenda-cirujanos');

// Listado completo con sus cuatro estados.
await page.getByText('Mostrando 12 de 12 cirujanos').waitFor();
assert.equal(await page.getByRole('heading', { level: 1, name: 'Agenda de cirujanos' }).count(), 1);
for (const t of ['Todos', 'Configuradas', 'Por vencer', 'Vencidas', 'Sin configurar']) {
  assert.equal(await page.getByRole('tab', { name: new RegExp(t) }).count(), 1, `chip ${t}`);
}
for (const t of ['Configurada', 'Por vencer', 'Vencida', 'Sin configurar']) {
  assert.ok(await page.locator('tbody').getByText(t, { exact: true }).count() >= 1, `estado ${t}`);
}

// Búsqueda sin tildes ni mayúsculas.
const buscador = page.getByRole('textbox', { name: 'Buscar cirujano' });
await buscador.fill('ángel');
await page.getByText('Mostrando 1 de 12 cirujanos').waitFor();
assert.equal(await page.getByRole('button', { name: 'Configurar agenda de Angel Maria Parra Liñan' }).count(), 1);
await buscador.fill('');

// Filtro por estado.
await page.getByRole('tab', { name: /Vencidas/ }).click();
await page.getByText('Mostrando 1 de 12 cirujanos').waitFor();
await page.getByRole('tab', { name: /Todos/ }).click();

// Abrir el editor (stub): la URL lleva el id y "volver" regresa al listado.
await page.getByRole('button', { name: 'Editar agenda de Abraham Ganem Bechara' }).click();
await page.waitForURL(/cirujano=02757%2F98/);
await page.getByRole('button', { name: 'Volver al listado' }).click();
await page.getByText('Mostrando 12 de 12 cirujanos').waitFor();

// Entrada del menú hamburguesa: Cirugía → Configuración → Agenda de cirujanos.
await page.getByRole('button', { name: 'Menú principal' }).click();
await page.getByRole('menuitem', { name: 'Cirugía' }).hover();
await page.getByRole('menuitem', { name: 'Configuración' }).hover();
assert.equal(await page.getByRole('menuitem', { name: 'Agenda de cirujanos' }).count(), 1);

assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), [], 'sin errores de consola');
await page.screenshot({ path: 'tarea5-listado.png' });
await browser.close();
console.log('T5 OK');
```

Run: `cd "$TEMP/agenda-pw" && node t5.mjs`
Expected: `T5 OK`. Abre `tarea5-listado.png` y confirma a ojo: una sola fila de toolbar (buscador a la izquierda, chips con conteo a la derecha), encabezados en sentence case, badges de color por estado, botón primario solo en "Configurar agenda" y "Editar agenda" de las vencidas.

- [ ] **Step 9: Commit**

```bash
git add src/app/cirugia/configuracion src/Components/AgendaCirujanos src/Components/HamburgerMenu/HamburgerMenu.jsx src/Components/Sidebar/Sidebar.jsx
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): ruta, menú hamburguesa y listado de cirujanos

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Editor — horario semanal, guardado con advertencia y salir sin guardar

**Files:**
- Move: `src/Components/HistoriaClinica/AtencionPaciente/OrdenesMedicasTab/NuevaOrdenForm/ToggleSwitch/` → `src/Components/ToggleSwitch/`
- Modify: `src/Components/HistoriaClinica/AtencionPaciente/OrdenesMedicasTab/NuevaOrdenForm/ItemFormPanel/ItemFormPanel.jsx:7`
- Create: `src/hooks/AgendaCirujanos/useAgendaEditor.js`
- Create (reemplaza el stub): `src/Components/AgendaCirujanos/EditorAgenda/EditorAgenda.jsx`, `EditorAgenda.css`
- Create: `PanelConfiguracion/`, `HorarioSemanal/`, `DiaHorario/`, `CopiarADias/`, `modals/ImpactoModal/`, `modals/SalirSinGuardarDialog/` (cada uno `.jsx` + `.css`)
- Create (stubs, se reemplazan en las Tareas 7 y 8): `Excepciones/Excepciones.jsx`, `modals/ExcepcionModal/ExcepcionModal.jsx`, `VistaPreviaSemanal/VistaPreviaSemanal.jsx`

**Interfaces:**
- Consumes: servicio (`obtenerCirujano`, `obtenerAgenda`, `listarCirugiasDeCirujano`, `guardarHorario`, `agregarExcepcion`, `eliminarExcepcion`); `cirugiasEnConflicto`, `conflictosNuevos`, `textoMotivo`; `horarioVacio`, `horariosIguales`, las operaciones de horario (`alternarDia`, `cambiarBloque`, `agregarBloque`, `quitarBloque`, `copiarDia`, `alternarSinFecha`), `opcionesHora`, `INICIO_JORNADA`, `FIN_JORNADA`, `DIAS_SEMANA`, `DIAS_SEMANA_CORTO`; `errorDia`, `errorVigencia`, `horarioTieneErrores`; `resumenDia`, `cantidadCirugias`, `excepcionNueva`; del proyecto `FormSelect`, `DatePicker`, `ChipFilter`, `Button`, `ModalHeader`, `useModalFocusTrap`, `fechaHoraRangoLabel`, `.ncw-icon-btn`/`.chip-group`/`.form-field`/`.modal-*` (CSS de la jornada de cirugía).
- Produces:
  - `useAgendaEditor(idMedico, hoy)` → `{ cargando, cirujano, tieneAgenda, borrador, setBorrador, excepciones, cirugias, conflictos, sinGuardar, hayErrores, conflictosAlGuardar(), conflictosAlAgregar(datos), conflictosAlEliminar(id), descartar(), guardar(), anadirExcepcion(datos), quitarExcepcion(id) }`.
  - `<EditorAgenda idMedico hoy onVolver onAviso/>`; `<PanelConfiguracion pestana onPestana cantidadExcepciones>{children}</PanelConfiguracion>`; `<HorarioSemanal horario onChange sinAgenda sede onAviso/>`; `<DiaHorario indice dia error onToggle onBloque onAgregarBloque onQuitarBloque onCopiar/>`; `<CopiarADias origen onAplicar onCancelar/>`; `<ImpactoModal titulo intro items textoVolver textoConfirmar? onVolver onConfirmar?/>`; `<SalirSinGuardarDialog onSeguir onSalir/>`.
  - Stubs que las Tareas 7–8 reemplazan con la misma firma: `<Excepciones excepciones hoy onAgregar onEliminar/>`, `<ExcepcionModal inicial onGuardar onCerrar/>`, `<VistaPreviaSemanal horario excepciones cirugias conflictos hoy onVerConflictos/>`.

- [ ] **Step 1: Mover `ToggleSwitch` a app-wide**

```bash
git mv src/Components/HistoriaClinica/AtencionPaciente/OrdenesMedicasTab/NuevaOrdenForm/ToggleSwitch src/Components/ToggleSwitch
```

En `src/Components/HistoriaClinica/AtencionPaciente/OrdenesMedicasTab/NuevaOrdenForm/ItemFormPanel/ItemFormPanel.jsx` cambia la línea 7:

```jsx
import ToggleSwitch from '@/Components/ToggleSwitch/ToggleSwitch';
```

En `src/Components/ToggleSwitch/ToggleSwitch.jsx` reemplaza el comentario que dice que tiene "un solo consumidor" por:

```jsx
// Switch con etiqueta (Prioritario/Única dosis en ItemFormPanel, días de la
// agenda de cirujanos): app-wide porque lo usan 2+ rutas (ver AGENTS.md
// "Component organization").
```

- [ ] **Step 2: Hook del editor**

Crea `src/hooks/AgendaCirujanos/useAgendaEditor.js`:

```javascript
'use client';

import { useEffect, useState } from 'react';
import {
  agregarExcepcion, eliminarExcepcion, guardarHorario, listarCirugiasDeCirujano, obtenerAgenda,
  obtenerCirujano,
} from './agendaCirujanosService';
import { cirugiasEnConflicto, conflictosNuevos } from './conflictos';
import { horarioVacio, horariosIguales } from './horario';
import { horarioTieneErrores } from './validaciones';

// Estado del editor de la agenda de UN cirujano: horario guardado vs borrador,
// excepciones, cirugías del cirujano y los conflictos que cada cambio causaría.
// Es lógica sin JSX; la regla de qué es un conflicto vive en conflictos.js.
//
// El horario semanal se edita como borrador y se guarda con `guardar()`; las
// excepciones se guardan al instante (`anadirExcepcion` / `quitarExcepcion`).
// Los `conflictosAl...` calculan, SIN cambiar nada, lo que empeoraría: la UI los
// muestra en un modal antes de confirmar. Nunca se cancela ni se reprograma
// ninguna cirugía.
//
// Los handlers y los efectos tratan el estado como posiblemente nulo (React
// Compiler: un deps nulo revienta el render, ver memoria del proyecto).
/**
 * @param {string} idMedico
 * @param {string} hoy 'YYYY-MM-DD'
 */
export default function useAgendaEditor(idMedico, hoy) {
  const [cargando, setCargando] = useState(true);
  const [cirujano, setCirujano] = useState(/** @type {import('./tipos.js').Cirujano|null} */ (null));
  const [tieneAgenda, setTieneAgenda] = useState(false);
  const [guardado, setGuardado] = useState(() => horarioVacio(hoy));
  const [borrador, setBorrador] = useState(() => horarioVacio(hoy));
  const [excepciones, setExcepciones] = useState(/** @type {import('./tipos.js').Excepcion[]} */ ([]));
  const [cirugias, setCirugias] = useState(/** @type {import('./tipos.js').CirugiaAgenda[]} */ ([]));

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      obtenerCirujano(idMedico),
      obtenerAgenda(idMedico),
      listarCirugiasDeCirujano(idMedico),
    ]).then(([datosCirujano, agenda, susCirugias]) => {
      if (cancelado) return;
      const inicial = agenda?.horario ?? horarioVacio(hoy);
      setCirujano(datosCirujano);
      setTieneAgenda(!!agenda?.horario);
      setGuardado(inicial);
      setBorrador(inicial);
      setExcepciones(agenda?.excepciones ?? []);
      setCirugias(susCirugias ?? []);
      setCargando(false);
    });
    return () => { cancelado = true; };
  }, [idMedico, hoy]);

  const sinGuardar = !horariosIguales(borrador, guardado);
  const hayErrores = horarioTieneErrores(borrador);
  const conflictos = cirugiasEnConflicto(cirugias, { horario: borrador, excepciones }, hoy);

  /** Conflictos nuevos que causaría guardar el borrador. */
  function conflictosAlGuardar() {
    return conflictosNuevos(
      cirugias,
      { horario: guardado, excepciones },
      { horario: borrador, excepciones },
      hoy,
    );
  }

  /** @param {import('./tipos.js').Excepcion[]} nuevas */
  function conflictosConExcepciones(nuevas) {
    return conflictosNuevos(
      cirugias,
      { horario: borrador, excepciones },
      { horario: borrador, excepciones: nuevas },
      hoy,
    );
  }

  /** @param {import('./tipos.js').BorradorExcepcion} datos */
  function conflictosAlAgregar(datos) {
    return conflictosConExcepciones([...excepciones, { ...datos, id: -1 }]);
  }

  /** @param {number} idExcepcion */
  function conflictosAlEliminar(idExcepcion) {
    return conflictosConExcepciones(excepciones.filter((x) => x.id !== idExcepcion));
  }

  function descartar() {
    setBorrador(guardado);
  }

  async function guardar() {
    const agenda = await guardarHorario(idMedico, borrador);
    if (!agenda?.horario) return;
    setGuardado(agenda.horario);
    setBorrador(agenda.horario);
    setTieneAgenda(true);
  }

  /** @param {import('./tipos.js').BorradorExcepcion} datos */
  async function anadirExcepcion(datos) {
    const agenda = await agregarExcepcion(idMedico, datos);
    setExcepciones(agenda?.excepciones ?? []);
  }

  /** @param {number} idExcepcion */
  async function quitarExcepcion(idExcepcion) {
    const agenda = await eliminarExcepcion(idMedico, idExcepcion);
    setExcepciones(agenda?.excepciones ?? []);
  }

  return {
    cargando,
    cirujano,
    tieneAgenda,
    borrador,
    setBorrador,
    excepciones,
    cirugias,
    conflictos,
    sinGuardar,
    hayErrores,
    conflictosAlGuardar,
    conflictosAlAgregar,
    conflictosAlEliminar,
    descartar,
    guardar,
    anadirExcepcion,
    quitarExcepcion,
  };
}
```

- [ ] **Step 3: Modales de advertencia y de salida**

Crea `src/Components/AgendaCirujanos/modals/ImpactoModal/ImpactoModal.jsx`:

```jsx
'use client';

import { useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './ImpactoModal.css';
import Button from '@/Components/Button/Button';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { textoMotivo } from '@/hooks/AgendaCirujanos/conflictos';

// Advertencia de cirugías que quedan fuera de agenda. SOLO advierte: lista cada
// cirugía con su motivo y deja elegir entre volver o confirmar; nunca cancela ni
// reprograma nada. Un único componente para los tres usos (guardar horario,
// agregar/eliminar una excepción y "ver cirugías fuera de agenda"): sin
// `textoConfirmar` solo se muestra el botón de volver/cerrar.
export default function ImpactoModal({
  titulo, intro, items, textoVolver, textoConfirmar, onVolver, onConfirmar,
}) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onVolver(); }}>
      <div
        ref={cardRef}
        className="modal-card ac-impacto-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ac-impacto-titulo"
      >
        <ModalHeader
          icon={LuTriangleAlert}
          tone="warning"
          title={titulo}
          titleId="ac-impacto-titulo"
          onClose={onVolver}
        />
        <div className="modal-body">
          <div className="ac-callout ac-callout-warn">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            <p>{intro}</p>
          </div>
          <ul className="ac-impacto">
            {items.map(({ cirugia, motivo }) => (
              <li key={cirugia.id}>
                <span className="ac-impacto-cuando">
                  {fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}
                </span>
                <span className="ac-impacto-quien">{cirugia.paciente?.nombre}</span>
                <span className="ac-impacto-cuando">{cirugia.procedimientoPrincipal}</span>
                <span className="ac-impacto-motivo">{textoMotivo(motivo)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onVolver}>{textoVolver}</Button>
          {textoConfirmar && <Button onClick={onConfirmar}>{textoConfirmar}</Button>}
        </div>
      </div>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/modals/ImpactoModal/ImpactoModal.css`:

```css
/* .modal-overlay/.modal-card/.modal-body/.modal-footer: shared de la jornada de
   cirugía. .ac-callout*: shared/shared.css. */
.ac-impacto-card{width:580px;}
.ac-impacto{
  list-style:none;margin:0;padding:0;overflow:hidden;
  border:1px solid var(--border);border-radius:var(--radius);
}
.ac-impacto li{display:grid;gap:2px;padding:10px 12px;border-top:1px solid var(--border);}
.ac-impacto li:first-child{border-top:none;}
.ac-impacto-cuando{font-size:var(--fs-sm);color:var(--ink-500);}
.ac-impacto-quien{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ac-impacto-motivo{font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--amber-fg);}
```

Crea `src/Components/AgendaCirujanos/modals/SalirSinGuardarDialog/SalirSinGuardarDialog.jsx`:

```jsx
'use client';

import { useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './SalirSinGuardarDialog.css';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';

// Confirmación centrada sin fila de header (patrón .nc-discard-modal, fuera de
// ModalHeader por AGENTS.md "Modales"): salir del editor con el horario sin
// guardar. Las excepciones ya guardadas se conservan.
export default function SalirSinGuardarDialog({ onSeguir, onSalir }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onSeguir(); }}>
      <div
        ref={cardRef}
        className="modal-card ac-salir-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ac-salir-titulo"
        aria-describedby="ac-salir-texto"
      >
        <div className="ac-salir-icono"><LuTriangleAlert className="icon" aria-hidden="true" /></div>
        <h3 id="ac-salir-titulo" className="ac-salir-titulo">¿Salir sin guardar el horario?</h3>
        <p id="ac-salir-texto" className="ac-salir-texto">
          Los cambios del horario semanal se perderán. Las excepciones que ya guardaste se conservan.
        </p>
        <div className="ac-salir-acciones">
          <Button variant="outline" onClick={onSeguir}>Seguir editando</Button>
          <Button onClick={onSalir}>Salir sin guardar</Button>
        </div>
      </div>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/modals/SalirSinGuardarDialog/SalirSinGuardarDialog.css`:

```css
/* .modal-overlay/.modal-card: shared de la jornada de cirugía. */
.ac-salir-card{width:420px;padding:24px;gap:12px;align-items:center;text-align:center;}
.ac-salir-icono{
  width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:var(--amber-bg);color:var(--amber-fg);
}
.ac-salir-icono .icon{width:22px;height:22px;}
.ac-salir-titulo{margin:0;font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ac-salir-texto{margin:0;font-size:var(--fs-base);color:var(--ink-500);}
.ac-salir-acciones{display:flex;justify-content:center;gap:10px;margin-top:8px;}
```

- [ ] **Step 4: Pestañas y horario semanal**

Crea `src/Components/AgendaCirujanos/PanelConfiguracion/PanelConfiguracion.jsx`:

```jsx
'use client';

import './PanelConfiguracion.css';

const PESTANAS = [
  { id: 'horario', label: 'Horario semanal' },
  { id: 'excepciones', label: 'Excepciones' },
];

// Contenedor con las dos pestañas de la configuración (Horario semanal /
// Excepciones). Patrón de tabs de la feature: role="tablist" con flechas
// izquierda/derecha entre pestañas; el contenido activo llega como `children`.
export default function PanelConfiguracion({
  pestana, onPestana, cantidadExcepciones, children,
}) {
  function handleKeyDown(e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const actual = PESTANAS.findIndex((p) => p.id === pestana);
    const paso = e.key === 'ArrowRight' ? 1 : -1;
    const siguiente = PESTANAS[(actual + paso + PESTANAS.length) % PESTANAS.length];
    onPestana(siguiente.id);
    document.getElementById(`ac-tab-${siguiente.id}`)?.focus();
  }

  return (
    <section className="ac-card ac-config" aria-label="Configuración de la agenda">
      <div className="ac-tabs" role="tablist" aria-label="Secciones de la agenda" onKeyDown={handleKeyDown}>
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            id={`ac-tab-${p.id}`}
            className="ac-tab"
            aria-selected={pestana === p.id}
            aria-controls="ac-panel-config"
            tabIndex={pestana === p.id ? 0 : -1}
            onClick={() => onPestana(p.id)}
          >
            {p.label}
            {p.id === 'excepciones' && <span className="ac-tab-count">{cantidadExcepciones}</span>}
          </button>
        ))}
      </div>
      <div
        className="ac-config-cuerpo"
        role="tabpanel"
        id="ac-panel-config"
        aria-labelledby={`ac-tab-${pestana}`}
      >
        {children}
      </div>
    </section>
  );
}
```

Crea `src/Components/AgendaCirujanos/PanelConfiguracion/PanelConfiguracion.css`:

```css
.ac-config{display:flex;flex-direction:column;overflow:hidden;}

.ac-tabs{display:flex;gap:4px;padding:0 14px;border-bottom:1px solid var(--border);flex-shrink:0;}
.ac-tab{
  display:flex;align-items:center;gap:8px;margin-bottom:-1px;padding:14px 10px 12px;
  border:none;border-bottom:2px solid transparent;background:none;cursor:pointer;
  font-family:inherit;font-size:var(--fs-base);font-weight:var(--fw-medium);color:var(--ink-500);
}
.ac-tab:hover{color:var(--ink-900);}
.ac-tab[aria-selected="true"]{color:var(--link);border-bottom-color:var(--action-primary);}
.ac-tab:focus-visible{outline:2px solid var(--primary);outline-offset:-2px;border-radius:6px;}
.ac-tab-count{
  min-width:20px;padding:0 6px;border-radius:999px;text-align:center;
  font-size:var(--fs-xs);font-weight:var(--fw-semibold);color:var(--ink-700);background:var(--gray-bg);
}

.ac-config-cuerpo{flex:1;min-height:0;overflow-y:auto;padding:16px 18px 22px;}

@media (max-width:1024px){
  .ac-config{overflow:visible;}
  .ac-config-cuerpo{overflow:visible;}
}
```

Crea `src/Components/AgendaCirujanos/HorarioSemanal/HorarioSemanal.jsx`:

```jsx
'use client';

import { LuInfo, LuTriangleAlert } from 'react-icons/lu';
import './HorarioSemanal.css';
import DatePicker from '@/Components/DatePicker/DatePicker';
import DiaHorario from '../DiaHorario/DiaHorario';
import {
  agregarBloque, alternarDia, alternarSinFecha, cambiarBloque, copiarDia, FIN_JORNADA,
  INICIO_JORNADA, quitarBloque,
} from '@/hooks/AgendaCirujanos/horario';
import { deMinutos } from '@/hooks/AgendaCirujanos/intervalos';
import { errorDia, errorVigencia } from '@/hooks/AgendaCirujanos/validaciones';

// Pestaña "Horario semanal": vigencia (desde / hasta o sin fecha de fin) y los
// 7 días con sus bloques. Controlado: cada cambio llama a `onChange` con un
// horario NUEVO (las operaciones son las funciones puras de horario.js).
export default function HorarioSemanal({
  horario, onChange, sinAgenda, sede, onAviso,
}) {
  const errorDeVigencia = errorVigencia(horario);

  return (
    <div>
      {sinAgenda && (
        <div className="ac-callout ac-callout-info ac-aviso-sin-agenda">
          <LuInfo className="icon" aria-hidden="true" />
          <p>
            Este cirujano aún no tiene agenda. Activa los días en que opera y guarda el horario
            para que Programación pueda asignarle cirugías.
          </p>
        </div>
      )}

      <section className="ac-seccion" aria-labelledby="ac-vigencia-titulo">
        <h3 id="ac-vigencia-titulo" className="ac-seccion-titulo">Vigencia <span>{sede}</span></h3>
        <div className="ac-grid-2">
          <div className="form-field">
            <label htmlFor="ac-vigente-desde">Vigente desde</label>
            <DatePicker
              id="ac-vigente-desde"
              ariaLabel="Vigente desde"
              value={horario.desde}
              invalid={!horario.desde}
              onChange={(iso) => onChange({ ...horario, desde: iso })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ac-vigente-hasta">Hasta</label>
            <DatePicker
              id="ac-vigente-hasta"
              ariaLabel="Vigente hasta"
              value={horario.hasta ?? ''}
              min={horario.desde || undefined}
              disabled={horario.hasta === null}
              invalid={horario.hasta === ''}
              onChange={(iso) => onChange({ ...horario, hasta: iso })}
            />
          </div>
        </div>
        <label className="ac-check">
          <input
            type="checkbox"
            checked={horario.hasta === null}
            onChange={(e) => onChange(alternarSinFecha(horario, e.target.checked))}
          />
          Sin fecha de fin
        </label>
        {errorDeVigencia ? (
          <p className="ac-err" role="alert">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            {errorDeVigencia}
          </p>
        ) : (
          <p className="ac-hint">Fuera de este rango, el cirujano no tiene agenda.</p>
        )}
      </section>

      <section aria-labelledby="ac-dias-titulo">
        <h3 id="ac-dias-titulo" className="ac-seccion-titulo">
          Días y horarios <span>Jornada operativa {deMinutos(INICIO_JORNADA)}–{deMinutos(FIN_JORNADA)}</span>
        </h3>
        {horario.dias.map((dia, i) => (
          <DiaHorario
            // El índice ES la identidad del día (lunes…domingo): la lista nunca se reordena.
            key={i}
            indice={i}
            dia={dia}
            error={errorDia(dia)}
            onToggle={(activo) => onChange(alternarDia(horario, i, activo))}
            onBloque={(posicion, campo, valor) => onChange(cambiarBloque(horario, i, posicion, campo, valor))}
            onAgregarBloque={() => onChange(agregarBloque(horario, i))}
            onQuitarBloque={(posicion) => onChange(quitarBloque(horario, i, posicion))}
            onCopiar={(destinos) => {
              onChange(copiarDia(horario, i, destinos));
              onAviso?.('Horario copiado');
            }}
          />
        ))}
      </section>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/HorarioSemanal/HorarioSemanal.css`:

```css
/* .ac-callout, .ac-grid-2, .ac-check, .ac-err, .ac-hint: shared/shared.css.
   .form-field: shared de la jornada de cirugía. */
.ac-aviso-sin-agenda{margin-bottom:16px;}
.ac-seccion{margin-bottom:20px;}
.ac-seccion-titulo{
  display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:0 0 10px;
  font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);
}
.ac-seccion-titulo span{font-size:var(--fs-sm);font-weight:var(--fw-regular);color:var(--ink-500);}
```

Crea `src/Components/AgendaCirujanos/DiaHorario/DiaHorario.jsx`:

```jsx
'use client';

import { useState } from 'react';
import {
  LuCopy, LuPlus, LuTrash2, LuTriangleAlert,
} from 'react-icons/lu';
import './DiaHorario.css';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ToggleSwitch from '@/Components/ToggleSwitch/ToggleSwitch';
import CopiarADias from '../CopiarADias/CopiarADias';
import {
  DIAS_SEMANA, FIN_JORNADA, INICIO_JORNADA, opcionesHora,
} from '@/hooks/AgendaCirujanos/horario';
import { resumenDia } from '@/hooks/AgendaCirujanos/formato';

// Hora de inicio hasta 18:30 y de fin desde 07:30: el bloque mínimo es de 30 min
// y nada sale de la jornada operativa.
const OPCIONES_INICIO = opcionesHora(INICIO_JORNADA, FIN_JORNADA - 30);
const OPCIONES_FIN = opcionesHora(INICIO_JORNADA + 30, FIN_JORNADA);

// Un día de la semana: interruptor, resumen, bloques (inicio–fin cada 30 min),
// "Agregar bloque" y "Copiar a otros días". Presentacional: todo cambio sube por
// callbacks; solo recuerda si el panel de copia está abierto.
export default function DiaHorario({
  indice, dia, error, onToggle, onBloque, onAgregarBloque, onQuitarBloque, onCopiar,
}) {
  const [copiando, setCopiando] = useState(false);
  const nombre = DIAS_SEMANA[indice];

  return (
    <div className={`ac-dia${dia.activo ? '' : ' off'}`}>
      <div className="ac-dia-cab">
        <ToggleSwitch
          label={nombre}
          checked={dia.activo}
          onChange={(activo) => {
            onToggle(activo);
            if (!activo) setCopiando(false);
          }}
        />
        <span className="ac-dia-resumen">{dia.activo ? resumenDia(dia) : 'No disponible'}</span>
      </div>

      {dia.activo && (
        <>
          <div className="ac-bloques">
            {dia.bloques.map((bloque, j) => (
              <div className="ac-bloque" key={j}>
                <div className="ac-hora">
                  <FormSelect
                    id={`ac-inicio-${indice}-${j}`}
                    ariaLabel={`Inicio del bloque ${j + 1}, ${nombre}`}
                    value={bloque.inicio}
                    onChange={(v) => onBloque(j, 'inicio', v)}
                    options={OPCIONES_INICIO}
                  />
                </div>
                <span className="ac-bloque-sep">a</span>
                <div className="ac-hora">
                  <FormSelect
                    id={`ac-fin-${indice}-${j}`}
                    ariaLabel={`Fin del bloque ${j + 1}, ${nombre}`}
                    value={bloque.fin}
                    onChange={(v) => onBloque(j, 'fin', v)}
                    options={OPCIONES_FIN}
                  />
                </div>
                <button
                  type="button"
                  className="ncw-icon-btn ncw-icon-btn-danger"
                  aria-label={`Quitar bloque ${j + 1}, ${nombre}`}
                  onClick={() => onQuitarBloque(j)}
                >
                  <LuTrash2 className="icon" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <div className="ac-dia-acciones">
            <Button variant="outline" size="sm" icon={LuPlus} onClick={onAgregarBloque}>
              Agregar bloque
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={LuCopy}
              aria-expanded={copiando}
              onClick={() => setCopiando((abierto) => !abierto)}
            >
              Copiar a otros días
            </Button>
          </div>

          {copiando && (
            <CopiarADias
              origen={indice}
              onAplicar={(destinos) => { onCopiar(destinos); setCopiando(false); }}
              onCancelar={() => setCopiando(false)}
            />
          )}
        </>
      )}

      {error && (
        <p className="ac-err" role="alert">
          <LuTriangleAlert className="icon" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/DiaHorario/DiaHorario.css`:

```css
/* .ac-err, .ac-hora: shared/shared.css. .ncw-icon-btn*: shared de la jornada de cirugía. */
.ac-dia{padding:12px 0;border-top:1px solid var(--border);}
.ac-dia:first-of-type{border-top:none;}
.ac-dia-cab{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:28px;}
.ac-dia-resumen{font-size:var(--fs-sm);color:var(--ink-500);text-align:right;}
/* Día apagado: el nombre baja de énfasis. */
.ac-dia.off .ts-label{color:var(--ink-500);font-weight:var(--fw-regular);}

.ac-bloques{display:flex;flex-direction:column;gap:8px;margin-top:10px;}
.ac-bloque{display:flex;align-items:center;gap:8px;}
.ac-bloque-sep{font-size:var(--fs-sm);color:var(--ink-400);}
.ac-bloque .icon{width:16px;height:16px;}
.ac-dia-acciones{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
```

Crea `src/Components/AgendaCirujanos/CopiarADias/CopiarADias.jsx`:

```jsx
'use client';

import { useState } from 'react';
import './CopiarADias.css';
import Button from '@/Components/Button/Button';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';
import { DIAS_SEMANA, DIAS_SEMANA_CORTO } from '@/hooks/AgendaCirujanos/horario';

const LUN_VIE = [0, 1, 2, 3, 4];

// Panel "Copiar el horario del <día> a:" — elige los días de destino (chips) y
// aplica. El horario del día de origen se copia tal cual y activa los destinos.
export default function CopiarADias({ origen, onAplicar, onCancelar }) {
  const [destinos, setDestinos] = useState([]);

  function alternar(indice) {
    setDestinos((previos) => (
      previos.includes(indice) ? previos.filter((d) => d !== indice) : [...previos, indice]));
  }

  return (
    <div className="ac-copiar">
      <p>Copiar el horario del {DIAS_SEMANA[origen].toLowerCase()} a:</p>
      <div className="chip-group" role="group" aria-label="Días de destino">
        {DIAS_SEMANA_CORTO.map((nombre, i) => (
          i === origen ? null : (
            <ChipFilter
              key={nombre}
              active={destinos.includes(i)}
              aria-pressed={destinos.includes(i)}
              onClick={() => alternar(i)}
            >
              {nombre}
            </ChipFilter>
          )
        ))}
      </div>
      <div className="ac-copiar-acciones">
        <Button variant="outline" size="sm" onClick={() => setDestinos(LUN_VIE.filter((d) => d !== origen))}>
          Lun–Vie
        </Button>
        <Button size="sm" disabled={destinos.length === 0} onClick={() => onAplicar(destinos)}>
          Aplicar copia
        </Button>
        <Button variant="outline" size="sm" onClick={onCancelar}>Cancelar</Button>
      </div>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/CopiarADias/CopiarADias.css`:

```css
/* .chip-group: shared de la jornada de cirugía. */
.ac-copiar{
  margin-top:10px;padding:12px;border:1px solid var(--border);
  border-radius:var(--radius-lg);background:var(--bg);
}
.ac-copiar p{margin:0 0 8px;font-size:var(--fs-sm);color:var(--ink-500);}
.ac-copiar .chip-group{margin-bottom:10px;}
.ac-copiar-acciones{display:flex;flex-wrap:wrap;gap:6px;}
```

- [ ] **Step 5: Stubs de lo que llega en las Tareas 7 y 8**

Crea `src/Components/AgendaCirujanos/Excepciones/Excepciones.jsx`:

```jsx
'use client';

// STUB: se reemplaza por la pestaña completa en la Tarea 7.
export default function Excepciones({ excepciones }) {
  return <p className="ac-hint">Excepciones: {excepciones.length}</p>;
}
```

Crea `src/Components/AgendaCirujanos/modals/ExcepcionModal/ExcepcionModal.jsx`:

```jsx
'use client';

// STUB: se reemplaza por el formulario completo en la Tarea 7.
export default function ExcepcionModal({ onCerrar }) {
  return <button type="button" onClick={onCerrar}>Cerrar (stub)</button>;
}
```

Crea `src/Components/AgendaCirujanos/VistaPreviaSemanal/VistaPreviaSemanal.jsx`:

```jsx
'use client';

// STUB: se reemplaza por la vista previa completa en la Tarea 8.
export default function VistaPreviaSemanal({ conflictos }) {
  return <section className="ac-card ac-estado"><p>Vista previa ({conflictos.length} en conflicto)</p></section>;
}
```

- [ ] **Step 6: Editor (reemplaza el stub de la Tarea 5)**

Reemplaza el contenido de `src/Components/AgendaCirujanos/EditorAgenda/EditorAgenda.jsx`:

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { LuChevronLeft } from 'react-icons/lu';
import './EditorAgenda.css';
import Button from '@/Components/Button/Button';
import PanelConfiguracion from '../PanelConfiguracion/PanelConfiguracion';
import HorarioSemanal from '../HorarioSemanal/HorarioSemanal';
import Excepciones from '../Excepciones/Excepciones';
import VistaPreviaSemanal from '../VistaPreviaSemanal/VistaPreviaSemanal';
import ExcepcionModal from '../modals/ExcepcionModal/ExcepcionModal';
import ImpactoModal from '../modals/ImpactoModal/ImpactoModal';
import SalirSinGuardarDialog from '../modals/SalirSinGuardarDialog/SalirSinGuardarDialog';
import useAgendaEditor from '@/hooks/AgendaCirujanos/useAgendaEditor';
import { excepcionNueva } from '@/hooks/AgendaCirujanos/excepciones';
import { cantidadCirugias } from '@/hooks/AgendaCirujanos/formato';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

const AVISO_SOLO_ADVIERTE = 'Las cirugías ya programadas no se cancelan ni se reprograman automáticamente. Programación de cirugía deberá gestionarlas.';

// Editor de la agenda de UN cirujano: panel de configuración (horario semanal /
// excepciones) + vista previa. Todo el estado de datos vive en useAgendaEditor;
// acá solo la pestaña activa y el modal abierto. Los cambios que dejarían
// cirugías fuera de agenda solo ADVIERTEN (ImpactoModal): nada se cancela ni
// se reprograma. `modal` es null o uno de:
//   { tipo: 'excepcion', inicial }
//   { tipo: 'impacto', titulo, intro, items, textoVolver, textoConfirmar?, onVolver?, onConfirmar? }
//   { tipo: 'salir' }
export default function EditorAgenda({
  idMedico, hoy, onVolver, onAviso,
}) {
  const editor = useAgendaEditor(idMedico, hoy);
  const [pestana, setPestana] = useState('horario');
  const [modal, setModal] = useState(null);
  const tituloRef = useRef(null);

  // Con horario sin guardar, cerrar o recargar la pestaña pide confirmación.
  useEffect(() => {
    if (!editor.sinGuardar) return undefined;
    const avisar = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [editor.sinGuardar]);

  // Al terminar de cargar, el foco va al título (como al entrar a una pantalla nueva).
  useEffect(() => {
    if (!editor.cargando) tituloRef.current?.focus();
  }, [editor.cargando]);

  if (editor.cargando) return <p className="ac-estado" role="status">Cargando agenda…</p>;
  if (!editor.cirujano) {
    return (
      <div className="ac-card ac-estado" role="alert">
        <p className="ac-estado-titulo">No se encontró el cirujano</p>
        <Button variant="outline" onClick={onVolver}>Volver al listado</Button>
      </div>
    );
  }

  const nombre = capitalizarNombre(editor.cirujano.nombre);
  const cerrarModal = () => setModal(null);

  function handleVolver() {
    if (editor.sinGuardar) setModal({ tipo: 'salir' });
    else onVolver();
  }

  function abrirImpacto(items, opciones) {
    setModal({
      tipo: 'impacto',
      items,
      intro: AVISO_SOLO_ADVIERTE,
      textoVolver: 'Volver a editar',
      ...opciones,
    });
  }

  function confirmarGuardado() {
    editor.guardar().then(() => {
      cerrarModal();
      onAviso('Horario guardado');
    });
  }

  function handleGuardar() {
    const nuevos = editor.conflictosAlGuardar();
    if (nuevos.length === 0) {
      confirmarGuardado();
      return;
    }
    abrirImpacto(nuevos, {
      titulo: `Este horario deja ${cantidadCirugias(nuevos.length)} fuera de agenda`,
      textoConfirmar: 'Guardar de todos modos',
      onConfirmar: confirmarGuardado,
    });
  }

  function handleGuardarExcepcion(datos) {
    const aplicar = () => editor.anadirExcepcion(datos).then(() => {
      cerrarModal();
      onAviso(datos.tipo === 'bloqueo' ? 'Bloqueo agregado' : 'Apertura agregada');
    });
    const nuevos = editor.conflictosAlAgregar(datos);
    if (nuevos.length === 0) {
      aplicar();
      return;
    }
    abrirImpacto(nuevos, {
      titulo: `Esto deja ${cantidadCirugias(nuevos.length)} fuera de agenda`,
      textoConfirmar: 'Guardar de todos modos',
      // Volver a editar reabre el formulario con lo que el usuario ya había escrito.
      onVolver: () => setModal({ tipo: 'excepcion', inicial: datos }),
      onConfirmar: aplicar,
    });
  }

  function handleEliminarExcepcion(idExcepcion) {
    const aplicar = () => editor.quitarExcepcion(idExcepcion).then(() => {
      cerrarModal();
      onAviso('Excepción eliminada');
    });
    const nuevos = editor.conflictosAlEliminar(idExcepcion);
    if (nuevos.length === 0) {
      aplicar();
      return;
    }
    abrirImpacto(nuevos, {
      titulo: `Esto deja ${cantidadCirugias(nuevos.length)} fuera de agenda`,
      textoVolver: 'Cancelar',
      textoConfirmar: 'Eliminar de todos modos',
      onConfirmar: aplicar,
    });
  }

  function handleVerConflictos() {
    if (editor.conflictos.length === 0) return;
    abrirImpacto(editor.conflictos, {
      titulo: `${cantidadCirugias(editor.conflictos.length)} fuera de agenda`,
      intro: `Estas cirugías ya programadas quedan fuera de la disponibilidad actual. ${AVISO_SOLO_ADVIERTE}`,
      textoVolver: 'Cerrar',
    });
  }

  return (
    <div className="ac-editor">
      <div className="psc-page-header">
        <div>
          <button type="button" className="ac-volver" onClick={handleVolver}>
            <LuChevronLeft className="icon" aria-hidden="true" />
            Agenda de cirujanos
          </button>
          <h1 ref={tituloRef} tabIndex={-1}>Agenda de {nombre}</h1>
          <p>Define cuándo está disponible para que Programación le asigne cirugías.</p>
        </div>
        <div className="psc-page-header-actions">
          {editor.sinGuardar && (
            <span className={`ac-pendiente${editor.hayErrores ? ' error' : ''}`} role="status">
              {editor.hayErrores ? 'Hay errores por corregir' : 'Horario sin guardar'}
            </span>
          )}
          <Button variant="outline" disabled={!editor.sinGuardar} onClick={editor.descartar}>
            Descartar cambios
          </Button>
          <Button
            disabled={!editor.sinGuardar || editor.hayErrores}
            title={editor.hayErrores ? 'Corrige los errores marcados para guardar' : undefined}
            onClick={handleGuardar}
          >
            Guardar horario
          </Button>
        </div>
      </div>

      <div className="ac-layout">
        <PanelConfiguracion
          pestana={pestana}
          onPestana={setPestana}
          cantidadExcepciones={editor.excepciones.length}
        >
          {pestana === 'horario' ? (
            <HorarioSemanal
              horario={editor.borrador}
              onChange={editor.setBorrador}
              sinAgenda={!editor.tieneAgenda}
              sede={editor.cirujano.sede}
              onAviso={onAviso}
            />
          ) : (
            <Excepciones
              excepciones={editor.excepciones}
              hoy={hoy}
              onAgregar={() => setModal({ tipo: 'excepcion', inicial: excepcionNueva(hoy) })}
              onEliminar={handleEliminarExcepcion}
            />
          )}
        </PanelConfiguracion>

        <VistaPreviaSemanal
          horario={editor.borrador}
          excepciones={editor.excepciones}
          cirugias={editor.cirugias}
          conflictos={editor.conflictos}
          hoy={hoy}
          onVerConflictos={handleVerConflictos}
        />
      </div>

      {modal?.tipo === 'excepcion' && (
        <ExcepcionModal inicial={modal.inicial} onGuardar={handleGuardarExcepcion} onCerrar={cerrarModal} />
      )}
      {modal?.tipo === 'impacto' && (
        <ImpactoModal
          titulo={modal.titulo}
          intro={modal.intro}
          items={modal.items}
          textoVolver={modal.textoVolver}
          textoConfirmar={modal.textoConfirmar}
          onVolver={modal.onVolver ?? cerrarModal}
          onConfirmar={modal.onConfirmar}
        />
      )}
      {modal?.tipo === 'salir' && (
        <SalirSinGuardarDialog onSeguir={cerrarModal} onSalir={onVolver} />
      )}
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/EditorAgenda/EditorAgenda.css`:

```css
/* .psc-page-header, .ac-card, .ac-estado: ver shell de la feature y shared/shared.css. */
.ac-editor{flex:1;min-height:0;display:flex;flex-direction:column;gap:16px;}
.ac-editor h1:focus{outline:none;}

.ac-volver{
  display:inline-flex;align-items:center;gap:4px;margin-bottom:6px;padding:0;
  border:none;background:none;cursor:pointer;
  font-family:inherit;font-size:var(--fs-sm);font-weight:var(--fw-medium);color:var(--link);
}
.ac-volver:hover{text-decoration:underline;}
.ac-volver:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:4px;}
.ac-volver .icon{width:16px;height:16px;}

.ac-pendiente{
  display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;
  font-size:var(--fs-sm);font-weight:var(--fw-medium);
  color:var(--amber-fg);background:var(--amber-bg);border:1px solid var(--amber);
}
.ac-pendiente.error{color:var(--red);background:var(--red-bg);border-color:var(--red);}

/* La fila única se contrae a la altura disponible: cada panel scrollea por dentro. */
.ac-layout{
  display:grid;grid-template-columns:minmax(340px,430px) minmax(0,1fr);grid-template-rows:minmax(0,1fr);
  gap:16px;flex:1;min-height:0;
}

/* Tablet (--bp-desktop): los dos paneles se apilan y la página scrollea. */
@media (max-width:1024px){
  .ac-layout{grid-template-columns:1fr;grid-template-rows:none;overflow-y:auto;}
}
```

- [ ] **Step 7: Lint y tests**

Run: `npx eslint src/Components/AgendaCirujanos src/hooks/AgendaCirujanos src/Components/ToggleSwitch src/Components/HistoriaClinica/AtencionPaciente/OrdenesMedicasTab`
Expected: sin errores ni warnings. Si el compilador de React reporta algo en `useAgendaEditor.js` o `EditorAgenda.jsx`, corrígelo sin cambiar el comportamiento (los handlers tratan el estado como posiblemente nulo con `?.`).

Run: `node --no-warnings --test src/hooks/AgendaCirujanos/__tests__/*.test.mjs`
Expected: `ℹ pass 94`.

- [ ] **Step 8: Verificar en el navegador**

Crea y corre `$TEMP/agenda-pw/t6.mjs` (Abraham Ganem Bechara trabaja lun/mié/vie 07:00–13:00 y tiene cirugías futuras):

```javascript
import assert from 'node:assert/strict';
import { abrir, iniciar } from './lib.mjs';

const { browser, page, errores } = await iniciar();
await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');

await page.getByRole('heading', { level: 1, name: 'Agenda de Abraham Ganem Bechara' }).waitFor();
const guardar = page.getByRole('button', { name: 'Guardar horario' });
const descartar = page.getByRole('button', { name: 'Descartar cambios' });
assert.equal(await guardar.isDisabled(), true, 'sin cambios no se puede guardar');
assert.equal(await descartar.isDisabled(), true);

// Encender el jueves no deja cirugías fuera de agenda: guarda directo.
await page.getByRole('switch', { name: 'Jueves' }).click();
await page.getByText('Horario sin guardar').waitFor();
await guardar.click();
await page.getByText('Horario guardado').waitFor();
assert.equal(await guardar.isDisabled(), true);

// Apagar el miércoles deja cirugías fuera de agenda: advierte y no guarda.
const miercoles = page.getByRole('switch', { name: 'Miércoles' });
await miercoles.click();
await guardar.click();
const advertencia = page.getByRole('dialog');
await advertencia.getByRole('heading', { name: /Este horario deja \d+ cirugías? fuera de agenda/ }).waitFor();
assert.ok(await advertencia.locator('li').count() >= 1, 'lista las cirugías');
assert.ok(await advertencia.getByText(/Fuera del horario disponible/).count() >= 1, 'con el motivo');
assert.ok(await advertencia.getByText(/\.OCT\.2026 - /).count() >= 1, 'fecha y hora con el formato del proyecto');
await advertencia.getByRole('button', { name: 'Volver a editar' }).click();
assert.equal(await page.getByRole('dialog').count(), 0);
assert.equal(await descartar.isEnabled(), true, 'sigue con cambios sin guardar');

// Descartar restaura el borrador.
await descartar.click();
assert.equal(await miercoles.getAttribute('aria-checked'), 'true');

// "Guardar de todos modos" guarda aunque haya conflictos (solo advierte).
await miercoles.click();
await guardar.click();
await page.getByRole('dialog').getByRole('button', { name: 'Guardar de todos modos' }).click();
await page.getByText('Horario guardado').waitFor();

// Error de validación: la hora de fin no puede ser anterior al inicio.
await page.locator('#ac-fin-0-0').click();
await page.getByRole('option', { name: '07:30', exact: true }).click();
await page.locator('#ac-inicio-0-0').click();
await page.getByRole('option', { name: '09:00', exact: true }).click();
await page.getByText('La hora de fin debe ser posterior a la de inicio.').waitFor();
await page.getByText('Hay errores por corregir').waitFor();
assert.equal(await guardar.isDisabled(), true);
await descartar.click();

// Copiar el lunes a martes y jueves.
await page.getByRole('button', { name: 'Copiar a otros días' }).first().click();
await page.getByRole('group', { name: 'Días de destino' }).getByRole('button', { name: 'Mar' }).click();
await page.getByRole('button', { name: 'Aplicar copia' }).click();
await page.getByText('Horario copiado').waitFor();
assert.equal(await page.getByRole('switch', { name: 'Martes' }).getAttribute('aria-checked'), 'true');

// Salir con cambios pide confirmación; "Seguir editando" se queda, "Salir sin guardar" vuelve.
await page.getByRole('button', { name: 'Agenda de cirujanos' }).click();
const salir = page.getByRole('alertdialog');
await salir.getByText('¿Salir sin guardar el horario?').waitFor();
await salir.getByRole('button', { name: 'Seguir editando' }).click();
assert.equal(await page.getByRole('alertdialog').count(), 0);
await page.getByRole('button', { name: 'Agenda de cirujanos' }).click();
await page.getByRole('alertdialog').getByRole('button', { name: 'Salir sin guardar' }).click();
await page.getByText('Mostrando 12 de 12 cirujanos').waitFor();

assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), [], 'sin errores de consola');
await browser.close();
console.log('T6 OK');
```

Run: `cd "$TEMP/agenda-pw" && node t6.mjs`
Expected: `T6 OK`. Si un localizador falla porque el DOM real difiere (p. ej. el id del disparador de `FormSelect`), ajusta **solo el localizador**, nunca la aserción.

- [ ] **Step 9: Commit**

```bash
git add src/Components/ToggleSwitch src/Components/HistoriaClinica/AtencionPaciente/OrdenesMedicasTab src/Components/AgendaCirujanos src/hooks/AgendaCirujanos/useAgendaEditor.js
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): editor con horario semanal, advertencia al guardar y salida sin guardar

Mueve ToggleSwitch a un componente app-wide.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Excepciones (bloqueos y aperturas extra)

**Files:**
- Replace (stubs de la Tarea 6): `src/Components/AgendaCirujanos/Excepciones/Excepciones.jsx`, `modals/ExcepcionModal/ExcepcionModal.jsx`
- Create: `Excepciones/Excepciones.css`, `ExcepcionItem/ExcepcionItem.jsx|.css`, `modals/ExcepcionModal/ExcepcionModal.css`

**Interfaces:**
- Consumes: `ordenarExcepciones`, `ETIQUETA_TIPO`, `AYUDA_TIPO`, `MOTIVOS_EXCEPCION`, `cambiarTipoExcepcion`, `excepcionNueva`; `rangoExcepcionLabel`; `errorExcepcion`; `opcionesHora`, `INICIO_JORNADA`, `FIN_JORNADA`; `ChipFilter`, `DatePicker`, `FormSelect`, `ModalHeader`, `Button`, `useModalFocusTrap`. El flujo de guardado con advertencia ya está en `EditorAgenda.jsx` (Tarea 6).
- Produces: `<Excepciones excepciones hoy onAgregar onEliminar/>` y `<ExcepcionModal inicial onGuardar onCerrar/>` con la misma firma que los stubs; `<ExcepcionItem excepcion pasada onEliminar/>`.

- [ ] **Step 1: Pestaña y lista**

Reemplaza `src/Components/AgendaCirujanos/Excepciones/Excepciones.jsx`:

```jsx
'use client';

import { LuPlus } from 'react-icons/lu';
import './Excepciones.css';
import Button from '@/Components/Button/Button';
import ExcepcionItem from '../ExcepcionItem/ExcepcionItem';
import { ordenarExcepciones } from '@/hooks/AgendaCirujanos/excepciones';

// Pestaña "Excepciones": bloqueos y aperturas puntuales que prevalecen sobre
// el horario semanal. Se guardan al instante (no hay borrador); la advertencia
// de cirugías en conflicto la maneja EditorAgenda antes de llamar a `onAgregar`
// / `onEliminar`.
export default function Excepciones({
  excepciones, hoy, onAgregar, onEliminar,
}) {
  return (
    <div>
      <div className="ac-exc-top">
        <p>Bloqueos y aperturas puntuales que prevalecen sobre el horario semanal.</p>
        <Button size="sm" icon={LuPlus} onClick={onAgregar}>Agregar excepción</Button>
      </div>

      {excepciones.length === 0 ? (
        <div className="ac-exc-vacio">
          Aún no hay excepciones. Agrega un bloqueo por vacaciones, congreso o permiso, o una apertura extra.
        </div>
      ) : (
        <ul className="ac-exc-lista">
          {ordenarExcepciones(excepciones).map((x) => (
            <li key={x.id}>
              <ExcepcionItem excepcion={x} pasada={x.hasta < hoy} onEliminar={() => onEliminar(x.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/Excepciones/Excepciones.css`:

```css
.ac-exc-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;}
.ac-exc-top p{margin:0;max-width:240px;font-size:var(--fs-sm);color:var(--ink-500);}
.ac-exc-lista{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;}
.ac-exc-vacio{
  padding:28px 12px;text-align:center;color:var(--ink-500);font-size:var(--fs-base);
  border:1px dashed var(--border);border-radius:var(--radius-lg);
}
```

Crea `src/Components/AgendaCirujanos/ExcepcionItem/ExcepcionItem.jsx`:

```jsx
'use client';

import { LuBan, LuPlus, LuTrash2 } from 'react-icons/lu';
import './ExcepcionItem.css';
import { ETIQUETA_TIPO } from '@/hooks/AgendaCirujanos/excepciones';
import { rangoExcepcionLabel } from '@/hooks/AgendaCirujanos/formato';

// Una excepción de la lista: ícono por tipo (bloqueo rojo / apertura verde),
// motivo, fechas y franja, nota y botón de eliminar. `pasada` la atenúa.
export default function ExcepcionItem({ excepcion, pasada, onEliminar }) {
  const esBloqueo = excepcion.tipo === 'bloqueo';
  const Icono = esBloqueo ? LuBan : LuPlus;
  return (
    <div className={`ac-exc ac-exc-${excepcion.tipo}${pasada ? ' ac-exc-pasada' : ''}`}>
      <div className="ac-exc-icono" aria-hidden="true">
        <Icono className="icon" />
      </div>
      <div className="ac-exc-cuerpo">
        <div className="ac-exc-titulo">{ETIQUETA_TIPO[excepcion.tipo]} · {excepcion.motivo}</div>
        <div className="ac-exc-rango">{rangoExcepcionLabel(excepcion)}</div>
        {excepcion.nota && <div className="ac-exc-nota">{excepcion.nota}</div>}
      </div>
      <button
        type="button"
        className="ncw-icon-btn ncw-icon-btn-danger"
        aria-label={`Eliminar excepción: ${excepcion.motivo}`}
        onClick={onEliminar}
      >
        <LuTrash2 className="icon" aria-hidden="true" />
      </button>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/ExcepcionItem/ExcepcionItem.css`:

```css
/* .ncw-icon-btn*: shared de la jornada de cirugía. */
.ac-exc{
  display:flex;align-items:flex-start;gap:12px;padding:12px;
  border:1px solid var(--border);border-radius:var(--radius-lg);
}
.ac-exc-pasada{opacity:.6;}
.ac-exc-icono{
  width:32px;height:32px;border-radius:var(--radius);flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.ac-exc-icono .icon{width:16px;height:16px;}
.ac-exc-bloqueo .ac-exc-icono{background:var(--red-bg);color:var(--red);}
.ac-exc-apertura .ac-exc-icono{background:var(--green-bg);color:#0d7a3d;}
.ac-exc-cuerpo{flex:1;min-width:0;}
.ac-exc-titulo{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ac-exc-rango{margin-top:2px;font-size:var(--fs-sm);color:var(--ink-500);}
.ac-exc-nota{margin-top:4px;font-size:var(--fs-sm);color:var(--ink-700);}
.ac-exc .ncw-icon-btn .icon{width:16px;height:16px;}
```

- [ ] **Step 2: Formulario de excepción**

Reemplaza `src/Components/AgendaCirujanos/modals/ExcepcionModal/ExcepcionModal.jsx`:

```jsx
'use client';

import { useRef, useState } from 'react';
import { LuCalendarPlus, LuTriangleAlert } from 'react-icons/lu';
import './ExcepcionModal.css';
import Button from '@/Components/Button/Button';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';
import DatePicker from '@/Components/DatePicker/DatePicker';
import FormSelect from '@/Components/FormSelect/FormSelect';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  AYUDA_TIPO, cambiarTipoExcepcion, ETIQUETA_TIPO, MOTIVOS_EXCEPCION,
} from '@/hooks/AgendaCirujanos/excepciones';
import { FIN_JORNADA, INICIO_JORNADA, opcionesHora } from '@/hooks/AgendaCirujanos/horario';
import { errorExcepcion } from '@/hooks/AgendaCirujanos/validaciones';

const TIPOS = ['bloqueo', 'apertura'];
const OPCIONES_INICIO = opcionesHora(INICIO_JORNADA, FIN_JORNADA - 30);
const OPCIONES_FIN = opcionesHora(INICIO_JORNADA + 30, FIN_JORNADA);

// Formulario de una excepción (bloqueo o apertura extra). Es controlado por un
// borrador local inicializado desde `inicial` (así "Volver a editar" desde la
// advertencia reabre el formulario con lo que el usuario ya había escrito).
// Valida con errorExcepcion y, si es válido, entrega el borrador a `onGuardar`;
// guardar y advertir de conflictos lo resuelve EditorAgenda.
export default function ExcepcionModal({ inicial, onGuardar, onCerrar }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);
  const [form, setForm] = useState(inicial);
  const [error, setError] = useState('');

  const cambiar = (parche) => { setForm((actual) => ({ ...actual, ...parche })); setError(''); };
  const opcionesMotivo = MOTIVOS_EXCEPCION[form.tipo].map((m) => ({ value: m, label: m }));

  function enviar(e) {
    e.preventDefault();
    const mensaje = errorExcepcion(form);
    if (mensaje) {
      setError(mensaje);
      return;
    }
    onGuardar({ ...form, nota: form.nota.trim() });
  }

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onCerrar(); }}>
      <div
        ref={cardRef}
        className="modal-card ac-exc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ac-exc-titulo"
      >
        <form onSubmit={enviar} noValidate>
          <ModalHeader
            icon={LuCalendarPlus}
            tone="primary"
            title="Agregar excepción"
            titleId="ac-exc-titulo"
            onClose={onCerrar}
          />
          <div className="modal-body">
            <div className="chip-group segmented" role="group" aria-label="Tipo de excepción">
              {TIPOS.map((tipo) => (
                <ChipFilter
                  key={tipo}
                  variant="segmented"
                  active={form.tipo === tipo}
                  aria-pressed={form.tipo === tipo}
                  onClick={() => { setForm((actual) => cambiarTipoExcepcion(actual, tipo)); setError(''); }}
                >
                  {ETIQUETA_TIPO[tipo]}
                </ChipFilter>
              ))}
            </div>
            <p className="ac-hint ac-exc-ayuda">{AYUDA_TIPO[form.tipo]}</p>

            <div className="form-field">
              <label htmlFor="ac-exc-motivo">Motivo</label>
              <FormSelect
                id="ac-exc-motivo"
                value={form.motivo}
                onChange={(motivo) => cambiar({ motivo })}
                options={opcionesMotivo}
              />
            </div>

            <div className="ac-grid-2">
              <div className="form-field">
                <label htmlFor="ac-exc-desde">Desde</label>
                <DatePicker
                  id="ac-exc-desde"
                  ariaLabel="Desde"
                  value={form.desde}
                  onChange={(desde) => cambiar({ desde })}
                />
              </div>
              <div className="form-field">
                <label htmlFor="ac-exc-hasta">Hasta</label>
                <DatePicker
                  id="ac-exc-hasta"
                  ariaLabel="Hasta"
                  value={form.hasta}
                  min={form.desde || undefined}
                  onChange={(hasta) => cambiar({ hasta })}
                />
              </div>
            </div>

            <label className="ac-check ac-exc-todo-dia">
              <input
                type="checkbox"
                checked={form.todoElDia}
                onChange={(e) => cambiar({ todoElDia: e.target.checked })}
              />
              Todo el día
            </label>

            {!form.todoElDia && (
              <div className="ac-grid-2">
                <div className="form-field">
                  <label htmlFor="ac-exc-inicio">Hora de inicio</label>
                  <FormSelect
                    id="ac-exc-inicio"
                    value={form.inicio}
                    onChange={(inicio) => cambiar({ inicio })}
                    options={OPCIONES_INICIO}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="ac-exc-fin">Hora de fin</label>
                  <FormSelect
                    id="ac-exc-fin"
                    value={form.fin}
                    onChange={(fin) => cambiar({ fin })}
                    options={OPCIONES_FIN}
                  />
                </div>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="ac-exc-nota">Nota (opcional)</label>
              <input
                id="ac-exc-nota"
                type="text"
                maxLength={140}
                placeholder="Ej. Congreso en Bogotá"
                value={form.nota}
                onChange={(e) => cambiar({ nota: e.target.value })}
              />
            </div>

            {error && (
              <p className="ac-err" role="alert">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                {error}
              </p>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="outline" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit">Guardar excepción</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/modals/ExcepcionModal/ExcepcionModal.css`:

```css
/* .modal-*, .form-field, .chip-group: shared de la jornada de cirugía.
   .ac-grid-2, .ac-check, .ac-err, .ac-hint: shared/shared.css. */
.ac-exc-modal{width:580px;}
.ac-exc-ayuda{margin:-4px 0 0;}
.ac-exc-todo-dia{margin-top:0;}
```

- [ ] **Step 3: Lint**

Run: `npx eslint src/Components/AgendaCirujanos`
Expected: sin errores ni warnings.

- [ ] **Step 4: Verificar en el navegador**

Crea y corre `$TEMP/agenda-pw/t7.mjs`:

```javascript
import assert from 'node:assert/strict';
import { abrir, iniciar } from './lib.mjs';

const { browser, page, errores } = await iniciar();
await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');
await page.getByRole('heading', { level: 1, name: 'Agenda de Abraham Ganem Bechara' }).waitFor();

// Pestaña de excepciones: vacía al principio, contador en 0.
await page.getByRole('tab', { name: /Excepciones/ }).click();
await page.getByText('Aún no hay excepciones').waitFor();

// Cambiar de tipo: bloqueo → apertura muestra la franja horaria.
await page.getByRole('button', { name: 'Agregar excepción' }).click();
const modal = page.getByRole('dialog', { name: 'Agregar excepción' });
await modal.waitFor();
assert.equal(await modal.getByText('Hora de inicio').count(), 0, 'un bloqueo arranca "todo el día"');
await modal.getByRole('button', { name: 'Apertura extra' }).click();
await modal.getByText('Hora de inicio').waitFor();
await modal.getByRole('button', { name: 'Bloqueo', exact: true }).click();

// Un bloqueo de hoy (todo el día) deja cirugías fuera de agenda: advierte.
await modal.getByRole('button', { name: 'Guardar excepción' }).click();
const aviso = page.getByRole('dialog');
await aviso.getByRole('heading', { name: /Esto deja \d+ cirugías? fuera de agenda/ }).waitFor();
assert.ok(await aviso.getByText(/Bloqueo: Vacaciones/).count() >= 1, 'el motivo nombra el bloqueo');

// "Volver a editar" reabre el formulario con lo que ya estaba escrito.
await aviso.getByRole('button', { name: 'Volver a editar' }).click();
await page.getByRole('dialog', { name: 'Agregar excepción' }).waitFor();

// Confirmar: se guarda al instante.
await page.getByRole('button', { name: 'Guardar excepción' }).click();
await page.getByRole('dialog').getByRole('button', { name: 'Guardar de todos modos' }).click();
await page.getByText('Bloqueo agregado').waitFor();
await page.getByText('Bloqueo · Vacaciones').waitFor();
assert.equal(await page.getByRole('tab', { name: /Excepciones/ }).getByText('1', { exact: true }).count(), 1, 'contador de la pestaña');

// Eliminar: quitar un bloqueo nunca agrega conflictos, así que no advierte.
await page.getByRole('button', { name: 'Eliminar excepción: Vacaciones' }).click();
await page.getByText('Excepción eliminada').waitFor();
await page.getByText('Aún no hay excepciones').waitFor();

assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), [], 'sin errores de consola');
await browser.close();
console.log('T7 OK');
```

Run: `cd "$TEMP/agenda-pw" && node t7.mjs`
Expected: `T7 OK`.

- [ ] **Step 5: Commit**

```bash
git add src/Components/AgendaCirujanos
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): excepciones (bloqueos y aperturas extra) con guardado inmediato

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Vista previa semanal

**Files:**
- Replace (stub de la Tarea 6): `src/Components/AgendaCirujanos/VistaPreviaSemanal/VistaPreviaSemanal.jsx`
- Create: `VistaPreviaSemanal/VistaPreviaSemanal.css`, `CalendarioSemanal/CalendarioSemanal.jsx|.css`

**Interfaces:**
- Consumes: `modeloDia`, `minutosDisponibles`; `textoMotivo`; `lunesDe`, `sumarDias`, `DIAS_SEMANA_CORTO`, `INICIO_JORNADA`, `FIN_JORNADA`; `aMinutos`; `formatoHoras`, `rangoSemanaLabel`, `fechaCorta`; `KpiCard`, `Button`; `.psc-agenda-nav-btn` (CSS de la jornada de cirugía). `EditorAgenda` ya le pasa `conflictos` y `onVerConflictos`.
- Produces: `<VistaPreviaSemanal horario excepciones cirugias conflictos hoy onVerConflictos/>` y `<CalendarioSemanal fechas modelos cirugias motivos hoy/>` (`modelos[i]` = `modeloDia(fechas[i])`; `motivos`: `Map<idCirugia, MotivoConflicto>`).

- [ ] **Step 1: Calendario y vista previa**

Crea `src/Components/AgendaCirujanos/CalendarioSemanal/CalendarioSemanal.jsx`:

```jsx
'use client';

import { LuTriangleAlert } from 'react-icons/lu';
import './CalendarioSemanal.css';
import { textoMotivo } from '@/hooks/AgendaCirujanos/conflictos';
import { fechaCorta } from '@/hooks/AgendaCirujanos/formato';
import { DIAS_SEMANA_CORTO, FIN_JORNADA, INICIO_JORNADA } from '@/hooks/AgendaCirujanos/horario';
import { aMinutos } from '@/hooks/AgendaCirujanos/intervalos';

// Alto de una hora en píxeles: el mismo valor se publica como --ac-hora-h para
// las líneas de la grilla.
const HORA_PX = 56;
const HORAS = (FIN_JORNADA - INICIO_JORNADA) / 60;
const ALTO_PX = HORAS * HORA_PX;

// Posición vertical (en px) de una franja, recortada a la jornada operativa;
// null si queda fuera de ella.
function posicion(inicio, fin) {
  const desde = Math.max(inicio, INICIO_JORNADA);
  const hasta = Math.min(fin, FIN_JORNADA);
  if (hasta <= desde) return null;
  return {
    top: ((desde - INICIO_JORNADA) / 60) * HORA_PX,
    height: ((hasta - desde) / 60) * HORA_PX,
  };
}

// Una cirugía pasada o realizada va en azul, una urgencia en violeta y el resto
// (programada) en verde: los mismos colores que la agenda de Programación.
function tonoCirugia(cirugia, hoy) {
  if (cirugia.fecha < hoy || cirugia.estado === 'realizada') return 'realizada';
  return cirugia.estado === 'urgencia' ? 'urgencia' : 'programada';
}

// Grilla semanal 07:00–19:00. Fondo = fuera de agenda; encima, en capas: lo
// disponible, las aperturas extra, las líneas de hora, los bloqueos (rayados) y
// las cirugías. Lun–Vie siempre; sábado/domingo solo si tienen algo que mostrar.
// `modelos[i]` es el modeloDia de `fechas[i]`; `motivos` mapea id de cirugía →
// motivo de conflicto.
export default function CalendarioSemanal({
  fechas, modelos, cirugias, motivos, hoy,
}) {
  const visibles = fechas
    .map((_, i) => i)
    .filter((i) => i < 5
      || modelos[i].efectivo.length > 0
      || modelos[i].aperturas.length > 0
      || modelos[i].bloqueos.length > 0
      || cirugias.some((c) => c.fecha === fechas[i]));

  return (
    <div className="ac-cal-scroll">
      <div
        className="ac-cal"
        style={{
          gridTemplateColumns: `56px repeat(${visibles.length}, minmax(110px, 1fr))`,
          '--ac-hora-h': `${HORA_PX}px`,
        }}
      >
        <div className="ac-cal-esquina" />
        {visibles.map((i) => (
          <div key={fechas[i]} className={`ac-cal-cab${fechas[i] === hoy ? ' hoy' : ''}`}>
            <small>{DIAS_SEMANA_CORTO[i].toUpperCase()}</small>
            <b>{fechaCorta(fechas[i])}</b>
          </div>
        ))}

        <div className="ac-cal-horas" style={{ height: ALTO_PX }}>
          {Array.from({ length: HORAS }, (_, h) => (
            <div key={h} className="ac-cal-hora" style={{ top: h * HORA_PX + 3 }}>
              {String(INICIO_JORNADA / 60 + h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {visibles.map((i) => {
          const fecha = fechas[i];
          const modelo = modelos[i];
          return (
            <div key={fecha} className="ac-cal-col" style={{ height: ALTO_PX }}>
              {modelo.base.map(([inicio, fin]) => {
                const pos = posicion(inicio, fin);
                return pos && <div key={`base-${inicio}-${fin}`} className="ac-seg ac-seg-base" style={pos} />;
              })}
              {modelo.aperturas.map(({ intervalo, excepcion }) => {
                const pos = posicion(intervalo[0], intervalo[1]);
                return pos && (
                  <div
                    key={`apertura-${excepcion.id}`}
                    className="ac-seg ac-seg-apertura"
                    style={pos}
                    title={`Apertura extra: ${excepcion.motivo}`}
                  >
                    <span>Apertura extra</span>
                  </div>
                );
              })}
              <div className="ac-cal-lineas" />
              {modelo.bloqueos.map(({ intervalo, excepcion }) => {
                const pos = posicion(intervalo[0], intervalo[1]);
                return pos && (
                  <div
                    key={`bloqueo-${excepcion.id}`}
                    className="ac-seg ac-seg-bloqueo"
                    style={pos}
                    title={`Bloqueo: ${excepcion.motivo}`}
                  >
                    <span>Bloqueo · {excepcion.motivo}</span>
                  </div>
                );
              })}
              {cirugias.filter((c) => c.fecha === fecha).map((cirugia) => {
                const pos = posicion(aMinutos(cirugia.horaInicio), aMinutos(cirugia.horaFin));
                if (!pos) return null;
                const motivo = motivos.get(cirugia.id);
                const paciente = cirugia.paciente?.nombre ?? '';
                return (
                  <div
                    key={cirugia.id}
                    className={`ac-cir ac-cir-${tonoCirugia(cirugia, hoy)}${motivo ? ' ac-cir-conflicto' : ''}`}
                    style={pos}
                    title={`${paciente} · ${cirugia.procedimientoPrincipal ?? ''}${motivo ? ` · ${textoMotivo(motivo)}` : ''}`}
                  >
                    <div className="ac-cir-hora">{cirugia.horaInicio} – {cirugia.horaFin}</div>
                    <div className="ac-cir-nombre">{paciente}</div>
                    <div className="ac-cir-proc">{cirugia.procedimientoPrincipal}</div>
                    {motivo && (
                      <LuTriangleAlert
                        className="icon ac-cir-alerta"
                        role="img"
                        aria-label={textoMotivo(motivo)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

Crea `src/Components/AgendaCirujanos/CalendarioSemanal/CalendarioSemanal.css`:

```css
.ac-cal-scroll{flex:1;min-height:0;overflow:auto;border-top:1px solid var(--border);}
.ac-cal{display:grid;min-width:640px;}

.ac-cal-esquina,.ac-cal-cab{
  position:sticky;top:0;z-index:8;background:var(--surface);border-bottom:1px solid var(--border);
}
.ac-cal-cab{padding:8px 4px;text-align:center;border-left:1px solid var(--border);}
.ac-cal-cab small{display:block;font-size:var(--fs-xs);color:var(--ink-500);letter-spacing:.02em;}
.ac-cal-cab b{font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ac-cal-cab.hoy{background:var(--interactive-selected-bg);}
.ac-cal-cab.hoy small,.ac-cal-cab.hoy b{color:var(--interactive-selected-text);}

.ac-cal-horas{position:relative;}
.ac-cal-hora{position:absolute;right:8px;font-size:var(--fs-xs);color:var(--ink-400);}

/* Fondo de la columna = fuera de agenda (gris con rayado fino). */
.ac-cal-col{
  position:relative;overflow:hidden;border-left:1px solid var(--border);
  background-color:var(--gray-bg);
  background-image:repeating-linear-gradient(135deg,var(--ac-hatch) 0 1px,transparent 1px 9px);
}
.ac-cal-lineas{
  position:absolute;inset:0;z-index:3;pointer-events:none;
  background-image:linear-gradient(to bottom,var(--ac-grid) 1px,transparent 1px);
  background-size:100% var(--ac-hora-h);
}

.ac-seg{position:absolute;left:0;right:0;}
.ac-seg-base{z-index:1;background:var(--surface);}
.ac-seg-apertura{z-index:2;background:var(--surface);border:1.5px dashed var(--green);}
.ac-seg-bloqueo{
  z-index:4;
  background-image:repeating-linear-gradient(135deg,var(--ac-block-a) 0 6px,var(--ac-block-b) 6px 12px);
}
.ac-seg span{
  position:absolute;top:4px;left:6px;max-width:calc(100% - 12px);padding:1px 6px;border-radius:4px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-size:var(--fs-xs);font-weight:var(--fw-semibold);
}
.ac-seg-apertura span{background:var(--green-bg);color:#0d7a3d;}
.ac-seg-bloqueo span{background:var(--red-bg);color:var(--red);}

.ac-cir{
  position:absolute;left:4px;right:4px;z-index:5;overflow:hidden;
  padding:4px 7px;border-left:3px solid;border-radius:6px;
  font-size:var(--fs-xs);line-height:1.3;
}
.ac-cir-programada{background:var(--green-bg);border-color:var(--green);}
.ac-cir-realizada{background:var(--blue-bg);border-color:var(--blue-fg);}
.ac-cir-urgencia{background:var(--violet-bg);border-color:var(--violet-fg);}
/* Cirugía fuera de agenda: ámbar con contorno, gana al color de su estado. */
.ac-cir-conflicto{background:var(--amber-bg);border-color:var(--amber);outline:2px solid var(--amber);outline-offset:-2px;}
.ac-cir-hora{color:var(--ink-500);}
.ac-cir-nombre{
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-size:var(--fs-sm);font-weight:var(--fw-semibold);color:var(--ink-900);
}
.ac-cir-proc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ink-500);}
.ac-cir-alerta{position:absolute;top:4px;right:5px;width:14px;height:14px;color:var(--amber-fg);}

@media (max-width:1024px){
  .ac-cal-scroll{flex:none;height:560px;}
}
```

Reemplaza `src/Components/AgendaCirujanos/VistaPreviaSemanal/VistaPreviaSemanal.jsx`:

```jsx
'use client';

import { useState } from 'react';
import {
  LuCalendarDays, LuChevronLeft, LuChevronRight, LuClock, LuTriangleAlert,
} from 'react-icons/lu';
import './VistaPreviaSemanal.css';
import Button from '@/Components/Button/Button';
import KpiCard from '@/Components/KpiCard/KpiCard';
import CalendarioSemanal from '../CalendarioSemanal/CalendarioSemanal';
import { minutosDisponibles, modeloDia } from '@/hooks/AgendaCirujanos/disponibilidad';
import { formatoHoras, rangoSemanaLabel } from '@/hooks/AgendaCirujanos/formato';
import { lunesDe, sumarDias } from '@/hooks/AgendaCirujanos/horario';

const LEYENDA = [
  ['disponible', 'Disponible'],
  ['fuera', 'Fuera de agenda'],
  ['bloqueo', 'Bloqueo'],
  ['apertura', 'Apertura extra'],
  ['programada', 'Programada'],
  ['realizada', 'Realizada'],
  ['urgencia', 'Urgencia'],
  ['conflicto', 'Cirugía fuera de agenda'],
];

// Vista previa semanal de lo que verá Programación: disponible vs fuera de
// agenda, bloqueos, aperturas extra y las cirugías del cirujano (las que quedan
// fuera de agenda, resaltadas). Refleja el BORRADOR del horario, no solo lo
// guardado. Navega por semanas; solo guarda cuál se está viendo.
export default function VistaPreviaSemanal({
  horario, excepciones, cirugias, conflictos, hoy, onVerConflictos,
}) {
  const [lunes, setLunes] = useState(() => lunesDe(hoy));
  const fechas = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const modelos = fechas.map((fecha) => modeloDia(fecha, horario, excepciones));
  const disponibles = minutosDisponibles(fechas, horario, excepciones);
  const deLaSemana = cirugias.filter((c) => fechas.includes(c.fecha) && c.estado !== 'cancelada');
  const motivos = new Map(conflictos.map((c) => [c.cirugia.id, c.motivo]));
  const etiquetaConflictos = conflictos.length === 1 ? 'Cirugía fuera de agenda' : 'Cirugías fuera de agenda';

  return (
    <section className="ac-card ac-preview" aria-label="Vista previa de la agenda">
      <div className="ac-preview-cab">
        <div>
          <h2>Vista previa</h2>
          <p>Así verá Programación la disponibilidad de este cirujano.</p>
        </div>
        <div className="ac-semana-nav">
          <Button variant="outline" size="sm" onClick={() => setLunes(lunesDe(hoy))}>Hoy</Button>
          <button
            type="button"
            className="psc-agenda-nav-btn"
            aria-label="Semana anterior"
            onClick={() => setLunes((actual) => sumarDias(actual, -7))}
          >
            <LuChevronLeft className="icon" aria-hidden="true" />
          </button>
          <span className="ac-semana-rango" aria-live="polite">{rangoSemanaLabel(lunes)}</span>
          <button
            type="button"
            className="psc-agenda-nav-btn"
            aria-label="Semana siguiente"
            onClick={() => setLunes((actual) => sumarDias(actual, 7))}
          >
            <LuChevronRight className="icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="ac-stats">
        <KpiCard compact icon={LuClock} label="Disponibles esta semana" value={formatoHoras(disponibles)} variant="neutral" />
        <KpiCard compact icon={LuCalendarDays} label="Cirugías esta semana" value={deLaSemana.length} variant="info" />
        {conflictos.length > 0 ? (
          <KpiCard
            compact
            icon={LuTriangleAlert}
            label={`${etiquetaConflictos} · Ver`}
            value={conflictos.length}
            variant="warning"
            onClick={onVerConflictos}
          />
        ) : (
          <KpiCard compact icon={LuTriangleAlert} label="Cirugías fuera de agenda" value={0} variant="success" />
        )}
      </div>

      <ul className="ac-leyenda" aria-label="Leyenda">
        {LEYENDA.map(([clave, texto]) => (
          <li key={clave}>
            <i className={`ac-sw ac-sw-${clave}`} aria-hidden="true" />
            {texto}
          </li>
        ))}
      </ul>

      <CalendarioSemanal
        fechas={fechas}
        modelos={modelos}
        cirugias={deLaSemana}
        motivos={motivos}
        hoy={hoy}
      />
    </section>
  );
}
```

Crea `src/Components/AgendaCirujanos/VistaPreviaSemanal/VistaPreviaSemanal.css`:

```css
/* .ac-card: shared/shared.css. .psc-agenda-nav-btn: shared de la jornada de cirugía.
   Los colores de los segmentos del calendario viven en CalendarioSemanal.css;
   la leyenda los repite con los mismos tokens. */
.ac-preview{display:flex;flex-direction:column;overflow:hidden;}
.ac-preview-cab{
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;
  padding:14px 18px 10px;
}
.ac-preview-cab h2{margin:0;font-size:var(--fs-lg);font-weight:var(--fw-semibold);color:var(--ink-900);}
.ac-preview-cab p{margin:2px 0 0;font-size:var(--fs-sm);color:var(--ink-500);}
.ac-semana-nav{display:flex;align-items:center;gap:6px;}
.ac-semana-rango{
  min-width:150px;text-align:center;
  font-size:var(--fs-base);font-weight:var(--fw-semibold);color:var(--ink-900);
}

.ac-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:0 18px 10px;}

.ac-leyenda{
  list-style:none;margin:0;padding:0 18px 12px;display:flex;flex-wrap:wrap;gap:6px 14px;
  font-size:var(--fs-sm);color:var(--ink-500);
}
.ac-leyenda li{display:inline-flex;align-items:center;gap:6px;}
.ac-sw{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid var(--border);}
.ac-sw-disponible{background:var(--surface);}
.ac-sw-fuera{background:var(--gray-bg);}
.ac-sw-bloqueo{background-image:repeating-linear-gradient(135deg,var(--ac-block-a) 0 4px,var(--ac-block-b) 4px 8px);}
.ac-sw-apertura{background:var(--surface);border:1.5px dashed var(--green);}
.ac-sw-programada{background:var(--green-bg);border-color:var(--green);}
.ac-sw-realizada{background:var(--blue-bg);border-color:var(--blue-fg);}
.ac-sw-urgencia{background:var(--violet-bg);border-color:var(--violet-fg);}
.ac-sw-conflicto{background:var(--amber-bg);border-color:var(--amber);}

@media (max-width:1024px){
  .ac-preview{overflow:visible;}
  .ac-stats{grid-template-columns:1fr;}
}
```

- [ ] **Step 2: Lint**

Run: `npx eslint src/Components/AgendaCirujanos`
Expected: sin errores ni warnings.

- [ ] **Step 3: Verificar en el navegador**

Crea y corre `$TEMP/agenda-pw/t8.mjs`:

```javascript
import assert from 'node:assert/strict';
import { abrir, iniciar } from './lib.mjs';

const { browser, page, errores } = await iniciar();
await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');
await page.getByRole('heading', { level: 1, name: 'Agenda de Abraham Ganem Bechara' }).waitFor();

// Semana actual y métricas.
await page.getByText('12 – 18 oct 2026').waitFor();
await page.getByText('Disponibles esta semana').waitFor();
const verConflictos = page.getByRole('button', { name: /fuera de agenda · Ver/ });
await verConflictos.waitFor();
const conflictosAntes = Number((await verConflictos.innerText()).match(/\d+/)?.[0]);
assert.ok(conflictosAntes >= 1, 'Abraham tiene cirugías fuera de agenda con los datos de demo');

// La grilla pinta cirugías, y las que están fuera de agenda se resaltan.
assert.ok(await page.locator('.ac-cir').count() >= 1, 'hay cirugías en la semana');
assert.ok(await page.locator('.ac-cir-conflicto').count() >= 1, 'hay cirugías resaltadas');
assert.ok(await page.locator('.ac-seg-base').count() >= 1, 'hay zonas disponibles');

// El botón abre el listado informativo (solo "Cerrar", sin confirmar) y Escape lo cierra.
await verConflictos.click();
const listado = page.getByRole('dialog');
await listado.getByRole('heading', { name: new RegExp(`${conflictosAntes} cirugías? fuera de agenda`) }).waitFor();
// El pie tiene un único botón ("Cerrar"); la X de la cabecera también se llama "Cerrar", por eso se acota al pie.
const pie = listado.locator('.modal-footer');
assert.equal(await pie.getByRole('button').count(), 1);
assert.equal(await pie.getByRole('button', { name: 'Cerrar', exact: true }).count(), 1);
assert.equal(await listado.getByRole('button', { name: /de todos modos/ }).count(), 0);
await page.keyboard.press('Escape');
assert.equal(await page.getByRole('dialog').count(), 0);

// La vista previa refleja el BORRADOR: apagar el viernes sube el conteo sin guardar.
await page.getByRole('switch', { name: 'Viernes' }).click();
await page.waitForTimeout(200);
const conflictosDespues = Number((await page.getByRole('button', { name: /fuera de agenda · Ver/ }).innerText()).match(/\d+/)?.[0]);
assert.ok(conflictosDespues >= conflictosAntes, 'apagar un día no puede reducir los conflictos');
await page.getByRole('button', { name: 'Descartar cambios' }).click();

// Navegación de semanas.
await page.getByRole('button', { name: 'Semana siguiente' }).click();
await page.getByText('19 – 25 oct 2026').waitFor();
await page.getByRole('button', { name: 'Semana anterior' }).click();
await page.getByRole('button', { name: 'Semana anterior' }).click();
await page.getByText('5 – 11 oct 2026').waitFor();
await page.getByRole('button', { name: 'Hoy', exact: true }).click();
await page.getByText('12 – 18 oct 2026').waitFor();

// Una apertura extra aparece en la grilla como segmento punteado.
await page.getByRole('tab', { name: /Excepciones/ }).click();
await page.getByRole('button', { name: 'Agregar excepción' }).click();
const modal = page.getByRole('dialog', { name: 'Agregar excepción' });
await modal.getByRole('button', { name: 'Apertura extra' }).click();
await modal.getByRole('button', { name: 'Guardar excepción' }).click();
await page.getByText('Apertura agregada').waitFor();
assert.ok(await page.locator('.ac-seg-apertura').count() >= 1, 'la apertura se dibuja');

await page.screenshot({ path: 'tarea8-editor.png' });
assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), [], 'sin errores de consola');
await browser.close();
console.log('T8 OK');
```

Run: `cd "$TEMP/agenda-pw" && node t8.mjs`
Expected: `T8 OK`. Abre `tarea8-editor.png` y confirma a ojo: grilla 07:00–19:00 con fondo gris rayado fuera de agenda, blanco en lo disponible, cirugías de color por estado, las que están fuera de agenda con contorno ámbar y ícono de alerta, leyenda con los 8 elementos.

- [ ] **Step 4: Commit**

```bash
git add src/Components/AgendaCirujanos
git commit -m "$(cat <<'EOF'
feat(agenda-cirujanos): vista previa semanal con cirugías fuera de agenda resaltadas

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Pulido, verificación integral y documentación

**Files:**
- Modify: `AGENTS.md` (nueva sección al final)
- Verificar (sin crear código): responsive, tema oscuro, accesibilidad por teclado, suite completa

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: la sección "Agenda de cirujanos" en `AGENTS.md`.

- [ ] **Step 1: Verificación integral y responsive**

Crea y corre `$TEMP/agenda-pw/t9.mjs`:

```javascript
import assert from 'node:assert/strict';
import { abrir, iniciar } from './lib.mjs';

// ---- Escritorio (1920): sin desbordes, paneles lado a lado ----
{
  const { browser, page, errores } = await iniciar({ ancho: 1920, alto: 940 });
  await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');
  await page.getByRole('heading', { level: 1, name: 'Agenda de Abraham Ganem Bechara' }).waitFor();
  const config = await page.locator('.ac-config').boundingBox();
  const preview = await page.locator('.ac-preview').boundingBox();
  assert.ok(preview.x > config.x + config.width - 1, 'escritorio: la vista previa va a la derecha');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'sin scroll horizontal de página');
  await page.screenshot({ path: 'tarea9-1920.png' });
  assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), []);
  await browser.close();
}

// ---- Tablet (1000 < --bp-desktop): paneles apilados, página usable ----
{
  const { browser, page, errores } = await iniciar({ ancho: 1000, alto: 800 });
  await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');
  await page.getByRole('heading', { level: 1, name: 'Agenda de Abraham Ganem Bechara' }).waitFor();
  const config = await page.locator('.ac-config').boundingBox();
  const preview = await page.locator('.ac-preview').boundingBox();
  assert.ok(preview.y > config.y + config.height - 1, 'tablet: la vista previa baja debajo de la configuración');
  await page.screenshot({ path: 'tarea9-1000.png' });
  // El listado también es usable.
  await page.getByRole('button', { name: 'Agenda de cirujanos' }).click();
  await page.getByText('Mostrando 12 de 12 cirujanos').waitFor();
  await page.screenshot({ path: 'tarea9-1000-listado.png' });
  assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), []);
  await browser.close();
}

// ---- Teclado: las pestañas se mueven con flechas; Escape cierra los modales ----
{
  const { browser, page, errores } = await iniciar();
  await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');
  await page.getByRole('tab', { name: /Horario semanal/ }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab', { name: /Excepciones/ }).getAttribute('aria-selected'), 'true');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.getByRole('tab', { name: /Horario semanal/ }).getAttribute('aria-selected'), 'true');
  await page.getByRole('tab', { name: /Excepciones/ }).click();
  await page.getByRole('button', { name: 'Agregar excepción' }).click();
  await page.getByRole('dialog', { name: 'Agregar excepción' }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0, 'Escape cierra el modal');
  assert.deepEqual(errores.filter((e) => !/favicon/i.test(e)), []);
  await browser.close();
}

// ---- Tema oscuro: la vista previa conserva contraste (se revisa a ojo) ----
{
  const { browser, page } = await iniciar();
  await abrir(page, '/cirugia/configuracion/agenda-cirujanos?cirujano=02757%2F98');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'tarea9-oscuro.png' });
  await browser.close();
}

console.log('T9 OK');
```

Run: `cd "$TEMP/agenda-pw" && node t9.mjs`
Expected: `T9 OK`. Revisa a ojo `tarea9-1920.png`, `tarea9-1000.png`, `tarea9-1000-listado.png` y `tarea9-oscuro.png`: nada cortado ni superpuesto, texto legible en el tema oscuro (el rayado de "fuera de agenda", los bloqueos y las cirugías usan tokens derivados, así que deben seguir el tema), el calendario de la tablet con scroll propio de 560px. Corrige cualquier problema de CSS que veas (siempre con tokens, nunca hex sueltos, salvo el `#0d7a3d` de texto sobre `--green-bg` que es la convención del proyecto).

- [ ] **Step 2: Documentar en `AGENTS.md`**

Agrega al final de `AGENTS.md`:

```markdown
# Agenda de cirujanos

Configuración independiente (menú hamburguesa → Cirugía → Configuración →
Agenda de cirujanos, ruta `/cirugia/configuracion/agenda-cirujanos`) que
define cuándo está disponible cada cirujano para que Programación de cirugía
solo le asigne cirugías dentro de esa disponibilidad. Código en
`@/Components/AgendaCirujanos/` y lógica en `@/hooks/AgendaCirujanos/`. Spec:
`docs/superpowers/specs/2026-10-14-agenda-cirujanos-design.md`.

- **Una sola ruta**: sin parámetro muestra el listado; `?cirujano=<idMedico>`
  abre el editor de ese cirujano (la página va envuelta en `Suspense` por
  `useSearchParams`). El `idMedico` es el del `MEDICOS_CATALOGO`.
- **Lógica pura y tests**: toda la regla (intervalos, disponibilidad efectiva =
  horario base + aperturas − bloqueos, conflictos, validaciones, estado de
  agenda) vive en módulos sin React ni `new Date()` y se prueba con
  `node --test` (`npm test`). Tipada con JSDoc + `// @ts-check`; el repo no
  tiene TypeScript, así que se verifica con
  `npx -y -p typescript tsc --allowJs --noEmit --strict --target es2022 --module esnext --moduleResolution bundler --skipLibCheck --lib es2022,dom $(ls src/hooks/AgendaCirujanos/*.js | grep -v useAgendaEditor)`.
- **Solo advierte**: un cambio de horario o una excepción que deje cirugías
  `programada`/`urgencia` (desde hoy) fuera de agenda muestra `ImpactoModal`
  con la lista y el motivo. Nunca cancela ni reprograma nada. El horario se
  guarda con botón; las excepciones al instante.
- **Datos**: `agendaCirujanosService.js` es la única puerta de la UI (todo
  `async`, store en memoria que se reemplaza, nunca se muta). Para conectar la
  API real basta reimplementar ese archivo. Los datos de ejemplo
  (`mockAgendaCirujanos.js`) se calculan relativos a `hoy`.
- **Sede**: `SEDES_CATALOGO` (Topbar) usa `'01'` = Norte y
  `mockCirugiaData.SEDES` usa `'02'` = Norte. El servicio resuelve la sede por
  **nombre**, en un solo lugar; no compares ids de sede entre ambos catálogos.
- **Vínculo con cirugías**: por nombre (`cirugia.cirujano === medico.nombre`),
  porque las cirugías no guardan id del cirujano. Con backend debe pasar a id.
- **Roles**: `permisos.js` aísla la regla (Programación edita a todos; un
  cirujano, solo a sí mismo). Hoy no hay identidad de usuario en la sesión:
  `USUARIO_ACTUAL` es un mock (`rol: 'programacion'`), sin UI para cambiarlo.
- **Estilos**: no declara su propio `:root`; `AgendaCirujanos.jsx` importa
  `ProgramacionSalaCirugias.css` y `shared/shared.css` (tokens, shell, toast,
  modales, `.filter-bar`) como las demás rutas de `/cirugia`, y solo agrega
  tokens `--ac-*` derivados (rayado, líneas de la grilla, bloqueos). Las reglas
  que repiten 2+ componentes van en `AgendaCirujanos/shared/shared.css`,
  importado una vez desde `page.jsx`.
- **`ToggleSwitch`** es ahora app-wide (`@/Components/ToggleSwitch/ToggleSwitch`);
  antes era local a Historia Clínica.
- **Límites conocidos**: la confirmación de "salir sin guardar" cubre el botón
  "volver" y `beforeunload`, pero no la navegación por el menú lateral o el
  breadcrumb (no hay precedente en el repo). Una urgencia fuera de 07:00–19:00
  siempre cuenta como fuera de agenda (la jornada configurable llega a las
  19:00). Las aperturas extra cuentan aunque el día caiga fuera de la vigencia.
- **Fuera de alcance (pendiente)**: bloquear en el wizard de programación a un
  cirujano sin agenda vigente (salvo urgencias) y sombrear las zonas fuera de
  agenda en la vista "Médicos" de Programación.
```

- [ ] **Step 3: Verificación final**

Run: `npm test`
Expected: los 94 tests nuevos pasan y no hay fallos nuevos respecto de la línea base.

Run: `npx eslint src`
Expected: sin errores ni avisos nuevos respecto de la línea base.

Run el comando de type-check. Expected: sin salida.

Run: `git status --short`
Expected: los archivos nuevos/modificados de esta feature están commiteados; solo quedan los cambios previos no relacionados (menú "Vista" de Programación) sin commitear.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs(agenda-cirujanos): documenta la feature en AGENTS.md

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
EOF
)"
```

---

## Cobertura del spec

| Requisito del spec | Tarea |
|---|---|
| Listado: sede, estado, horas/semana, vigencia, próxima excepción, acción por fila | 5 |
| Filtros por estado con conteos y búsqueda sin tildes | 3 (lógica), 5 (UI) |
| Estados Configurada / Por vencer (≤30 d) / Vencida / Sin configurar | 3, 5 |
| Horario semanal: interruptor, bloques c/30 min en 07–19, copiar, vigencia | 1, 3, 6 |
| Excepciones: bloqueo/apertura, rango, todo el día o franja, nota | 3, 7 |
| Vista previa: disponible vs fuera, bloqueos, aperturas, cirugías, conflictos resaltados | 2, 8 |
| Solo advertir con modal (lista + motivo); nunca cancelar/reprogramar | 2, 6, 7, 8 |
| Horario con botón / excepciones instantáneas / confirmar salida | 6, 7 |
| Solo `programada`/`urgencia` desde hoy cuentan | 2 |
| Permisos (Programación todos; cirujano solo el suyo) | 3, 4, 5 |
| Lógica pura, tipada, con tests, separada de la UI | 1–4 |
| Capa de servicio con mock reemplazable | 4 |
| Entrada en menú hamburguesa; breadcrumb | 5 |
| Documentación | 9 |
| Fuera de alcance (wizard, sombreado en "Médicos", backend) | no se implementa; documentado en la Tarea 9 |

## Ajustes respecto del spec

Decisiones tomadas al detallar el plan (el spec se actualizó para reflejarlas):

1. **Estilos**: no hay `:root` propio. Se importan `ProgramacionSalaCirugias.css` y `shared/shared.css` como hacen `GestionCirugias`, `CanastasCirugia`, `RegistrarOrdenExterna` y `RevisionVencidas`; solo se agregan tokens `--ac-*`.
2. **`EstadoAgendaBadge`** no es un componente: es un `<Badge>` con un mapa de tonos dentro de `CirujanosTable`.
3. **Módulos nuevos de lógica** no previstos en el spec: `formato.js` (textos) y `excepciones.js` (motivos, borrador, orden); las constantes de la jornada (`INICIO_JORNADA`/`FIN_JORNADA`) viven en `horario.js`, no en `disponibilidad.js`.
4. **Firmas**: `cirugiasEnConflicto(cirugias, { horario, excepciones }, hoy)` y `conflictosNuevos(cirugias, antes, despues, hoy)` con `antes`/`despues` = `{ horario, excepciones }`.
5. **Copiar a otros días** es estado local de `DiaHorario`/`CopiarADias` más la función pura `copiarDia`; no vive en `useAgendaEditor`.
6. **Servicio**: se agregó `obtenerCirujano(idMedico)`.
