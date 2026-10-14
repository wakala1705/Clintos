# Agenda de cirujanos — diseño

Fecha: 2026-10-14 · Estado: aprobado; plan en
`docs/superpowers/plans/2026-10-14-agenda-cirujanos.md`

## 1. Objetivo

Definir cuándo está disponible cada cirujano para que Programación de cirugía
solo pueda asignarle cirugías dentro de esa disponibilidad. Es una
**configuración independiente**, accesible desde el menú hamburguesa
(Cirugía → Configuración → Agenda de cirujanos), no parte de la pantalla de
Programación.

Referencia de UX/comportamiento/lógica (no de código ni colores):
`docs/superpowers/prototipos/Clintos · Agenda de cirujanos.html`.

## 2. Alcance

Dentro:

1. **Listado de cirujanos**: tabla con sede, estado de agenda, horas por
   semana, vigencia, próxima excepción y acción por fila. Filtros por estado con
   conteos y búsqueda por nombre sin distinguir tildes.
2. **Editor de agenda por cirujano** (panel de configuración + vista previa):
   - Horario semanal: interruptor por día, bloques cada 30 min dentro de la
     jornada operativa 07:00–19:00, copiar a otros días, vigencia (desde / hasta
     o sin fecha de fin).
   - Excepciones: bloqueo (vacaciones, congreso, incapacidad, permiso, otro) y
     apertura extra; rango de fechas, todo el día o franja, nota.
   - Vista previa semanal: disponible vs fuera de agenda, bloqueos, aperturas
     extra y cirugías superpuestas, con las cirugías en conflicto resaltadas.
3. **Lógica de disponibilidad** como funciones puras, tipadas (JSDoc) y con
   tests, separadas de la UI.
4. **Capa de servicio** async con datos mock, fácil de reemplazar por la API.

Fuera:

- Bloqueo en el wizard de programación ("un cirujano sin agenda vigente no se
  puede elegir, salvo urgencias").
- Sombreado de zonas fuera de agenda en la vista "Médicos" de Programación.
- Backend real, autenticación real y selector de usuario/rol en la UI.

## 3. Reglas de negocio

- Configuran ambos: Programación de cirugía (cualquier cirujano de su sede) y el
  propio cirujano (solo la suya).
- Si un cambio de horario o una excepción deja cirugías ya programadas fuera de
  agenda, **solo se advierte** (modal con lista y motivo). Nunca se cancela ni se
  reprograma nada.
- El horario semanal se guarda con botón; las excepciones se guardan al
  instante. Salir con horario sin guardar pide confirmación.
- Solo cuentan como conflicto las cirugías en estado `programada` o `urgencia`
  con fecha **>= hoy**.
- Estado de agenda: `sin-configurar` (sin horario), `vencida` (hasta < hoy),
  `por-vencer` (hoy <= hasta <= hoy + 30 días), `configurada` (el resto,
  incluida "sin fecha de fin").
- Disponibilidad efectiva de un día = (horario base si el día cae en la
  vigencia y está activo + aperturas) − bloqueos.
- Una cirugía está cubierta si un único intervalo efectivo contiguo contiene
  toda su franja.
- Motivo del conflicto, en orden: bloqueo que la solapa (`Bloqueo: <motivo>`),
  fecha fuera de vigencia, fuera del horario disponible.

## 4. Decisiones de diseño

| Tema | Decisión | Por qué |
|---|---|---|
| Tipado | JSDoc `@typedef` + `// @ts-check`, sin TypeScript | El repo es JS (`jsconfig.json`, sin `typescript`); TS obligaría a agregar dependencias y un `tsconfig` junto al `jsconfig`. |
| Ruta | Una sola: `/cirugia/configuracion/agenda-cirujanos`; `?cirujano=<idMedico>` abre el editor | Mismo patrón que `?solicitud=` en Programación; enlace directo y botón atrás. |
| Ubicación | Carpeta propia `AgendaCirujanos` (componentes y hooks), no dentro de `ProgramacionSalaCirugias` | Es configuración, no parte de Programación. |
| Estilos | **No** declara su propio `:root`: importa `ProgramacionSalaCirugias.css` y `shared/shared.css` y solo agrega tokens `--ac-*` | Es el precedente de las otras rutas de `/cirugia` (`GestionCirugias`, `CanastasCirugia`, `RegistrarOrdenExterna`, `RevisionVencidas`); duplicar ~480 líneas de tokens/shell/modales sería deriva. |
| Identidad del cirujano | `idMedico` de `MEDICOS_CATALOGO` (descripción "Cirujano") | Las cirugías solo guardan el nombre en mayúsculas; el catálogo es la única fuente con id. |
| Vínculo con cirugías | Por nombre: `cirugia.cirujano === medico.nombre` | Es lo que hay hoy; los 10 cirujanos con cirugías coinciden exactos con el catálogo. |
| Roles | Función pura `puedeEditarAgenda(usuario, idMedico)` + usuario mock en el servicio | No existe identidad de usuario en `session.js` (solo módulo activo). |
| Sede | Se resuelve **por nombre** (`SEDE NORTE`) en un único lugar del servicio | `SEDES_CATALOGO` (Topbar) usa `'01'` = Norte y `mockCirugiaData.SEDES` usa `'02'` = Norte: no se puede confiar en el id. |
| Interruptor | `ToggleSwitch` se mueve a `@/Components/ToggleSwitch` | Hoy es local a Historia Clínica; con un segundo consumidor pasa a app-wide (AGENTS.md). |
| Tabs y toast | Locales a la feature | No hay componente compartido; mismo criterio que `RevisionVencidas`. |

## 5. Modelo de datos

Fechas `'YYYY-MM-DD'`, horas `'HH:mm'`, días con índice 0 = lunes. Todas las
funciones puras reciben `hoy` por parámetro: nunca llaman a `new Date()`.

```js
/** @typedef {{ inicio: string, fin: string }} Bloque */
/** @typedef {{ activo: boolean, bloques: Bloque[] }} DiaHorario */
/** @typedef {{ desde: string, hasta: string|null, dias: DiaHorario[] }} HorarioSemanal */
//   hasta === null  ⇒ "sin fecha de fin" (reemplaza noEnd + to del prototipo). dias.length === 7.

/** @typedef {'bloqueo'|'apertura'} TipoExcepcion */
/** @typedef {{ id: number, tipo: TipoExcepcion, motivo: string, desde: string, hasta: string,
 *              todoElDia: boolean, inicio: string, fin: string, nota: string }} Excepcion */
//   todoElDia ⇒ cubre la jornada operativa completa (07:00–19:00).

/** @typedef {{ idMedico: string, horario: HorarioSemanal|null, excepciones: Excepcion[] }} AgendaCirujano */
/** @typedef {{ idMedico: string, nombre: string, sede: string }} Cirujano */
/** @typedef {{ cirujano: Cirujano, agenda: AgendaCirujano }} FilaCirujano */

/** @typedef {'configurada'|'por-vencer'|'vencida'|'sin-configurar'} EstadoAgenda */
/** @typedef {{ tipo: 'bloqueo', motivo: string }|{ tipo: 'fuera-vigencia' }|{ tipo: 'fuera-horario' }} MotivoConflicto */
/** @typedef {{ cirugia: CirugiaAgenda, motivo: MotivoConflicto }} Conflicto */
/** @typedef {{ rol: 'programacion'|'cirujano', idMedico?: string }} UsuarioAgenda */
```

`CirugiaAgenda` es el subconjunto estructural de la cirugía existente que usa la
lógica: `{ id, fecha, horaInicio, horaFin, estado, cirujano, paciente: { nombre },
procedimientoPrincipal }`. No se crea una forma nueva.

## 6. Lógica pura — `src/hooks/AgendaCirujanos/`

| Archivo | Funciones |
|---|---|
| `tipos.js` | solo `@typedef` (arriba) |
| `intervalos.js` | `aMinutos`, `deMinutos`, `unirIntervalos` (une los que se tocan), `restarIntervalos`, `cubre(intervalos, ini, fin)` |
| `horario.js` | `INICIO_JORNADA`/`FIN_JORNADA` (derivados de `JORNADAS.operativa` de `gestion/agenda.js`); fechas ISO (`sumarDias`, `diaSemana`, `lunesDe`, `diasEntre`); operaciones inmutables sobre el horario (`horarioVacio`, `copiarDia`, `alternarDia`, `agregarBloque`, `quitarBloque`, `cambiarBloque`, `alternarSinFecha`, `horariosIguales`); `opcionesHora(min, max)` (cada 30 min) |
| `formato.js` | `formatoHoras`, `cantidadCirugias`, `resumenDia`, `fechaLabel`, `fechaCorta`, `rangoExcepcionLabel`, `rangoSemanaLabel` |
| `disponibilidad.js` | `rangoExcepcion`, `modeloDia(fecha, horario, excepciones)` → `{ base, aperturas, bloqueos, efectivo, vigente }`, `minutosDisponibles(fechas, horario, excepciones)`, `minutosSemanales(horario)` |
| `conflictos.js` | `cirugiasEnConflicto(cirugias, { horario, excepciones }, hoy)`, `conflictosNuevos(cirugias, antes, despues, hoy)` (con `antes`/`despues` = `{ horario, excepciones }`), `motivoConflicto`, `textoMotivo` |
| `validaciones.js` | `errorDia`, `errorVigencia`, `errorExcepcion`, `horarioTieneErrores` |
| `excepciones.js` | `MOTIVOS_EXCEPCION`, `ETIQUETA_TIPO`, `AYUDA_TIPO`, `excepcionNueva(hoy)`, `cambiarTipoExcepcion`, `ordenarExcepciones` |
| `estadoAgenda.js` | `estadoAgenda(horario, hoy)`, `diasParaVencer`, `proximaExcepcion(excepciones, hoy)` |
| `listado.js` | `normalizarTexto` (minúsculas sin tildes), `filtrarCirujanos(filas, { estado, busqueda }, hoy)`, `contarPorEstado(filas, hoy)` |
| `permisos.js` | `puedeEditarAgenda(usuario, idMedico)`, `cirujanosVisibles(usuario, filas)` |

Reutiliza `parseISO` y `JORNADAS` de `gestion/agenda.js` en vez de definir una
tercera jornada 07–19. Las fechas con hora se muestran con `fechaHoraRangoLabel`
de `mockCirugiaData` (`14.OCT.2026 - 08:00 – 09:00`).

Comportamientos heredados del prototipo y fijados aquí:

- `conflictosNuevos(antes, despues)` devuelve los conflictos del "después" que no
  estaban en el "antes". Para un cirujano sin agenda el "antes" es
  `horarioVacio(hoy)` (todos los días apagados), así guardar el primer horario
  solo advierte de lo que *empeora*.
- Las excepciones se evalúan contra el **borrador** del horario (es lo que
  muestra la vista previa), no contra el último horario guardado.
- Las aperturas extra cuentan aunque el día caiga fuera de la vigencia.
- Al desmarcar "Sin fecha de fin" se propone `hasta = desde + 90 días`.

## 7. Capa de servicio

`agendaCirujanosService.js` (async, con latencia simulada como `fetchAgendaRango`).
El store es un array de módulo que se **reemplaza**, nunca se muta, y se resetea
al recargar (mismo criterio que `mockCirugiaData.js`).

```js
listarCirujanos({ sede })              // → Promise<FilaCirujano[]>
obtenerCirujano(idMedico)              // → Promise<Cirujano|null>
obtenerAgenda(idMedico)                // → Promise<AgendaCirujano>
guardarHorario(idMedico, horario)      // → Promise<AgendaCirujano>
agregarExcepcion(idMedico, excepcion)  // → Promise<AgendaCirujano>  (asigna id)
eliminarExcepcion(idMedico, idExcepcion) // → Promise<AgendaCirujano>
listarCirugiasDeCirujano(idMedico)     // → Promise<CirugiaAgenda[]>
```

`listarCirugiasDeCirujano` envuelve `fetchAgendaRango({ salaId: 'todas', cirujano })`
con rango abierto: lee el store vivo de cirugías, así una cirugía programada o
reprogramada en otra pantalla se refleja sin recargar. El mapeo de sede
(nombre → id de cirugías) vive solo aquí.

`mockAgendaCirujanos.js` siembra los 12 cirujanos del catálogo con una mezcla de
los cuatro estados, tomando como base los datos del prototipo.

## 8. UI

### Rutas y menús

- `src/app/cirugia/configuracion/agenda-cirujanos/page.jsx` con `Suspense`
  (lee `useSearchParams`).
- `HamburgerMenu.jsx`: nuevo módulo **Cirugía** en `MEGA_MENU` con la columna
  **Configuración** y el ítem "Agenda de cirujanos" (`href`).
- `Topbar`: `section={['Cirugía','Configuración']}`, `page="Agenda de cirujanos"`.
  `MODULE_MENUS` y el Sidebar no cambian (espejan solo páginas de uso diario).

### Listado

Una sola fila de toolbar (AGENTS.md "Barra de filtros"): `SearchField` →
`filter-spacer` → `SegmentedFilterBar` (Todos / Configuradas / Por vencer /
Vencidas / Sin configurar, con conteo). Tabla con `<th>` en sentence case y los
tokens `--th-*`; estado con `Badge` (success / warn / danger / neutral); botón
por fila: "Configurar agenda" (primary, si falta o venció) o "Editar agenda"
(`Button` tamaño sm). Fila clicable. Pie: "Mostrando X de Y" y la nota sobre
programar sin agenda. Estado vacío cuando el filtro no coincide.

### Editor

Cabecera: enlace "← Agenda de cirujanos", título, píldora de cambios sin guardar
/ errores, "Descartar cambios" y "Guardar horario" (deshabilitado sin cambios o
con errores). Dos paneles: configuración (tabs Horario semanal / Excepciones con
contador) y vista previa.

- **Horario semanal**: bloque Vigencia (`DatePicker` desde / hasta + "Sin fecha de
  fin") y 7 filas de día con `ToggleSwitch`, bloques con `FormSelect` de hora,
  "Agregar bloque", "Copiar a otros días" (chips por día, atajo Lun–Vie).
  Errores en línea por día y por vigencia.
- **Excepciones**: lista ordenada por fecha, las pasadas atenuadas, con
  eliminar. "Agregar excepción" abre `ExcepcionModal` (`ModalHeader`; control
  segmentado Bloqueo/Apertura, motivo, rango, todo el día o franja, nota).
- **Vista previa semanal**: navegación de semana (Hoy / ‹ ›), tres métricas
  (horas disponibles, cirugías de la semana, cirugías fuera de agenda — esta
  última abre el modal informativo), leyenda y grilla 07:00–19:00. Lun–Vie
  siempre; sáb/dom solo si tienen disponibilidad, excepción o cirugía.
  Segmentos con tokens: fuera de agenda = `--gray-bg` + rayado local `--ac-*`;
  bloqueo = `--red-bg`/`--red`; apertura = `--green` punteado; programada =
  verde; realizada = azul; urgencia = violeta; conflicto = `--amber` con ícono.

### Modales

- `ImpactoModal` (un solo componente, tres usos): guardar horario, agregar o
  eliminar excepción, y "ver cirugías fuera de agenda". Lista fecha-hora,
  paciente, procedimiento y motivo; acciones "Volver a editar" / "Guardar de todos
  modos". Solo advierte.
- `SalirSinGuardarDialog`: confirmación centrada, sin header (patrón
  `.nc-discard-modal`). Cubre "volver" y `beforeunload`. **Límite conocido**: no
  intercepta la navegación por el menú lateral/breadcrumb; el repo no tiene
  precedente de hacerlo.
- Todos con `useModalFocusTrap`, Escape y foco inicial.

### Estilos, tipografía y responsive

- `AgendaCirujanos.jsx` importa `ProgramacionSalaCirugias.css` y
  `shared/shared.css` (tokens con su variante oscura, shell, toast, modales,
  `.filter-bar`, tokens de `ModalHeader`) como las demás rutas de `/cirugia`;
  `AgendaCirujanos.css` solo agrega los tokens `--ac-*` derivados. Las reglas que
  repiten 2+ componentes van en `AgendaCirujanos/shared/shared.css`, importado
  una vez desde la ruta.
- Tipografía solo con `--fs-*`/`--fw-*` (el prototipo usa Inter y px sueltos: se
  traducen al stack del proyecto). Botones con `--btn-*`.
- Breakpoints solo 768 / 1024 / 1440. ≥1025px: configuración y vista previa en
  dos columnas; ≤1024px: apiladas. Tabla con scroll horizontal.
- Accesibilidad: `role="tablist"`/`tab`, `role="switch"`, `aria-live` en el rango
  de la semana, etiquetas en cada select de hora, foco que se conserva al
  re-renderizar.

## 9. Estructura de archivos

```
src/app/cirugia/configuracion/agenda-cirujanos/page.jsx
src/Components/ToggleSwitch/ToggleSwitch.jsx|.css          (movido desde HC)
src/Components/AgendaCirujanos/
  AgendaCirujanos.jsx|.css            orquestador + tokens --ac-*
  shared/shared.css
  ListadoCirujanos/  CirujanosTable/        (el estado es un <Badge> dentro de la tabla)
  EditorAgenda/  PanelConfiguracion/  HorarioSemanal/  DiaHorario/  CopiarADias/
  Excepciones/  ExcepcionItem/  VistaPreviaSemanal/  CalendarioSemanal/
  modals/ExcepcionModal/  modals/ImpactoModal/  modals/SalirSinGuardarDialog/
src/hooks/AgendaCirujanos/
  tipos.js  intervalos.js  horario.js  formato.js  disponibilidad.js  conflictos.js
  validaciones.js  excepciones.js  estadoAgenda.js  listado.js  permisos.js
  mockAgendaCirujanos.js  agendaCirujanosService.js  useAgendaEditor.js
  __tests__/*.test.mjs
```

Un componente = una carpeta con `.jsx` + `.css` (AGENTS.md). `useAgendaEditor`
concentra borrador / guardado / cambios sin guardar / excepciones / cirugías y
vive en hooks; "copiar a otros días" es estado local de `DiaHorario` más la
función pura `copiarDia`.

## 10. Pruebas

`node --test` (el script `npm test` ya recoge `src/hooks/**/*.test.mjs`), en TDD
para toda la lógica pura:

- `intervalos`: unión de intervalos que se tocan o solapan, resta que divide,
  `cubre` con intervalos contiguos.
- `disponibilidad`: base − bloqueos + aperturas; día fuera de vigencia; día
  apagado; excepción multi-día con franja; bloqueo "todo el día".
- `conflictos`: solo `programada`/`urgencia` y desde hoy; cada tipo de motivo;
  `conflictosNuevos` con horario previo nulo; cirugía a caballo entre dos
  bloques contiguos (cubierta) y entre bloques separados (conflicto).
- `validaciones`, `estadoAgenda` (límite exacto de 30 días y de hoy),
  `listado` (tildes, mayúsculas, conteos), `permisos`, `horario` (copiar,
  opciones cada 30 min).
- Servicio: guardar, agregar/eliminar excepción, ids únicos, lectura viva de
  cirugías.

UI: verificación en Playwright headless de listado, editor, guardado con
advertencia y salida sin guardar (no basta un `curl` 200: ver el crash de React
Compiler con estado nulo, usar optional chaining en handlers). ESLint limpio.

## 11. Riesgos y supuestos

- **Ids de sede inconsistentes** entre `SEDES_CATALOGO` y `mockCirugiaData.SEDES`
  (ver §4). Contenido en un solo punto del servicio; la API real debería unificar.
- **Vínculo por nombre** cirujano↔cirugía: frágil ante homónimos o cambios de
  nombre; con backend debe pasar a id.
- **Urgencias fuera de 07:00–19:00** siempre serán conflicto (la jornada
  configurable llega solo hasta las 19:00). Se deja como pide la regla.
- Las excepciones evaluadas contra el borrador pueden advertir de cirugías que
  dependen de un horario aún no guardado; es deliberado (coincide con la vista
  previa).
- El control de "salir sin guardar" tiene el límite descrito en §8.
- Los datos del mock se reinician al recargar.

## 12. Documentación

Al terminar se agrega la sección "Agenda de cirujanos" a `AGENTS.md`
(ubicación, `ToggleSwitch` app-wide, límites conocidos), como en las demás
features.
