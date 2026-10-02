# Tablero de cirugías del día — diseño

Fecha: 2026-10-02 · Usuario: coordinación de quirófanos

## Objetivo

Pantalla nueva, aparte de la agenda actual (`programacion-sala-cirugias`), para que coordinación supervise las cirugías de un día: una columna por sala, KPIs del día y acciones rápidas por cirugía, incluida la reprogramación.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Relación con la agenda | Vista nueva que convive; no reemplaza nada |
| Layout | Columnas por sala, cirugías del día en orden horario |
| Acciones | Supervisar + cambiar estado + reprogramar |
| Reprogramar | Con `ReprogramarCirugiaModal` existente (sin drag & drop; queda como mejora futura) |
| Día | Navegador de día (‹ Hoy › + `DatePicker`), abre en hoy |
| Sede | Selector de sede en el encabezado; las columnas son las salas de esa sede |
| Estados | No se agregan estados nuevos. Se mantienen programada, urgencia, realizada, cancelada, incumplida |

## Ruta y archivos

- Ruta: `src/app/programacion-sala-cirugias/tablero/page.jsx` (solo monta el componente; mismo patrón que `canastas/` y `revision/`).
- Componentes en `src/Components/ProgramacionSalaCirugias/TableroDia/`, cada uno en su carpeta con `.jsx` + `.css`: `TableroDia`, `TableroKpis`, `ColumnaSala`. Estilos compartidos en `TableroDia/shared/shared.css`, importado desde `page.jsx`.
- Lógica en `src/hooks/ProgramacionSalaCirugias/tablero/`: agrupación por sala, cálculo de KPIs y de "retrasada" (funciones puras con tests en `__tests__/`).
- Hook compartido nuevo `useCirugiasModales` (en `src/hooks/ProgramacionSalaCirugias/`), extraído de `ProgramacionSalaCirugias.jsx`: estado de `cirugias`, `selectedId`, `modal`, `toast` y apertura/cierre de los modales de Reprogramar, Cancelar, Marcar incumplida y Marcar realizada. Ambas pantallas lo consumen. Es el único refactor; la agenda actual debe quedar con el mismo comportamiento.

## Pantalla

1. **Encabezado:** título, selector de sede (`FormSelect`), navegador de día con `DatePicker`.
2. **KPIs** (una fila): total del día, programadas, urgencias, realizadas, canceladas/incumplidas y **retrasadas**.
   - Retrasada (derivada, no es un estado): cirugía en estado programada o urgencia cuya hora de inicio ya pasó y que sigue sin marcarse realizada, cancelada ni incumplida. Solo se calcula cuando el día mostrado es hoy.
3. **Tablero:** una `ColumnaSala` por sala de la sede, con nombre, estado de la sala, número de cirugías y minutos ocupados, y las `CirugiaCard` del día ordenadas por hora. Una sala en mantenimiento se muestra deshabilitada y sin cirugías. Una sala sin cirugías muestra un estado vacío.
4. **Acciones:** clic en una tarjeta abre `DetalleCirugiaPanel`. El "⋯" usa `CirugiaCardMenu` (Reprogramar, Cancelar, Marcar incumplida, Marcar realizada), con las reglas de `ESTADOS_TERMINALES_CIRUGIA`.
5. **Responsive:** contrato de breakpoints del proyecto (768 / 1024 / 1440). En tablet las columnas hacen scroll horizontal.

## Convenciones del proyecto a respetar

`ModalHeader`, `Button`, `Badge`, `FormSelect`, `DatePicker`, íconos `Lu*`, tokens `--fs-*`/`--fw-*`, tokens de color declarados en el `:root` de la feature, fecha+hora con formato `DD.MES.AAAA - HH:mm`.

## Fuera de alcance

Estados "en preparación"/"en curso", arrastrar y soltar, cambios en la agenda semana/mes, backend (se usa el mock existente).

## Pruebas

- Tests unitarios de las funciones puras: agrupar cirugías por sala y día, ordenar por hora, minutos ocupados, KPIs, "retrasada".
- Verificación en navegador headless (Playwright): la ruta carga, cambia de día y de sede, abre el detalle y reprograma una cirugía; la agenda actual sigue funcionando tras extraer el hook.
- ESLint limpio.

## Supuesto a confirmar

"Retrasada" se interpretó como indicador derivado, no como estado nuevo.
