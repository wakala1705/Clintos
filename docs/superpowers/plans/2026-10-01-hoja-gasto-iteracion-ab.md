# Hoja de gasto quirúrgico — Iteración A+B (brief de implementación)

**Spec:** `docs/superpowers/specs/2026-10-01-hoja-gasto-quirurgico-design.md` (revisión 2026-10-01). Parte del commit `867ec2b` (hoja de gasto v1, que SÍ valorizaba en COP). Esta iteración la convierte en un registro de consumo para la circulante en sala, sin dinero.

## Global Constraints
(las del plan `2026-10-01-hoja-gasto-quirurgico.md` siguen vigentes)
- Nada de dinero en la UI ni en el modelo: sin tarifas, valores, totales, `formatoCOP`.
- Controles táctiles ≥ 44 px de alto en `(max-width:1024px), (pointer:coarse)`.
- Horas en 24 h (`HH:mm`), nunca a. m./p. m.
- Sin `git commit` ni `git add`. Archivos nuevos con la herramienta Write.
- Cada componente nuevo: carpeta propia con `.jsx` + `.css`.
- Termina cada tarea con `npx eslint src/Components/ProgramacionSalaCirugias src/hooks/ProgramacionSalaCirugias` limpio y `node --test "src/hooks/ProgramacionSalaCirugias/hojaGasto/__tests__/hojaGasto.test.mjs"` en verde (el único fallo ajeno conocido de `npm test` es `semilla.test.mjs` "sala qx-2").

## Modelo de la hoja (nuevo)

```
{ numero, programacionId, estado: 'borrador'|'cerrada', cerradaEn,
  reaperturas: [{ motivo, en }],
  admision,
  programado: { inicio, fin },                    // referencia, 'HH:mm' o ''
  tiempos: { ingresoSala, inicioAnestesia, inicioCirugia, finCirugia, salidaSala },  // todos '' al inicio
  anestesia: { tipo, asa, complejidad },
  procedimientos: [{ id, nombre, cups, via, dxPre, dxPos }],
  personal: [{ id, rol, nombre, registro }],      // reemplaza a `honorarios`
  insumos: [{ id, nombre, entregado, usado, manual }],
  medicamentos: [{ id, nombre, dosis, cantidad }],
  implantes: [{ id, nombre, invima, lote, serie, proveedor }],
  equipos: [{ id, nombre, identificacion, minutos }],   // minutos = tiempo de uso
  conteo: [{ id, item, inicial, previoCierre, final, nota, manual }],
  observaciones,
  firmas: { circulante, instrumentadora, cirujano }     // ISO 'YYYY-MM-DDTHH:mm' o null
}
```
Se eliminan: `honorarios`, `derechosSala`, `valorUnitario`, `valor`, `tarifaHora`, y los exports `valorPorTiempo`, `valorDerechosSala`, `valorInsumo`, `valorMedicamento`, `totalesHoja`, `formatoCOP`, `ROLES_HONORARIOS` (pasa a `ROLES_PERSONAL`).

---

## Task A1 — Lógica (TDD) en `src/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto.js`

Actualiza primero `__tests__/hojaGasto.test.mjs`, verifica que falla y luego implementa. Cambios:

- `aMinutos(hhmm)`: además del formato `^\d{2}:\d{2}$`, valida rango (horas 00–23, minutos 00–59) → `null` si no.
- `horaAhora(date = new Date())` → `'HH:mm'` (24 h, con ceros).
- `formatearHora(texto)`: máscara progresiva para un input de texto: deja solo dígitos (máx. 4) y mete `:` tras los 2 primeros. `'0'→'0'`, `'073'→'07:3'`, `'0730'→'07:30'`, `'07:30abc'→'07:30'`, `''→''`.
- `construirHojaInicial(cirugia)`: `tiempos` todos `''`; `programado = { inicio: cirugia.horaInicio ?? '', fin: cirugia.horaFin ?? '' }`; `personal` desde `cirugia.personal` (con `registro: ''`); `insumos` sin `valorUnitario`; `medicamentos` sin `valorUnitario` (cantidad 1); `equipos` con `minutos` = duración programada; sin `derechosSala`; `conteo` desde `CONTEO_ITEMS` con `{ inicial:'', previoCierre:'', final:'', nota:'', manual:false }`; `reaperturas: []`.
- `duracionesHoja`, `duracionTexto`, `devueltoInsumo`, `actualizarFila`, `quitarFila`, `nuevoId`, `fechaHoraHoja`, store: sin cambios.
- `conteoEstado({ inicial, previoCierre, final })`: `'pendiente'` si `inicial` o `final` vacíos; si no, compara `inicial` contra `final` y contra `previoCierre` cuando este no está vacío: todos iguales → `'correcto'`, alguno distinto → `'discrepancia'`.
- `validarCierre(h)` — reglas (cada error `{ seccion, mensaje }`, mensajes en español):
  `tiempos` (5 tiempos completos y en orden, igual que antes), `anestesia` (tipo), `procedimientos` (CUPS y Dx pos), `personal` (debe haber un `Cirujano` con nombre no vacío: "Registra al cirujano."), `insumos` (igual que antes), `implantes` (INVIMA y lote), `conteo` (cualquier fila `pendiente` → "Completa el conteo quirúrgico."; cualquier fila `discrepancia` con `nota` vacía → "Documenta con una nota la discrepancia del conteo."; una discrepancia CON nota no bloquea), `firmas` (mensajes: "Falta la firma del circulante." / "de la instrumentadora." / "del cirujano.").
- `progresoHoja(h)` → `{ completas, total, porSeccion }`: `total = 7`; `porSeccion` es `{ tiempos, procedimientos, personal, insumos, implantes, conteo, firmas }` con `true` si esa clave no tiene errores en `validarCierre` (los errores `anestesia` cuentan contra `tiempos`); `completas` = cantidad de `true`.
- `resumenRegistro(h)` → `{ insumosItems, insumosUnidadesUsadas, insumosUnidadesDevueltas, medicamentos, implantes, equipos, conteo: 'correcto'|'discrepancia'|'pendiente' (peor estado entre filas: discrepancia > pendiente > correcto), duraciones: duracionesHoja(tiempos) }`.
- `pinValido(pin)` → `true` si es string de exactamente 4 dígitos (PIN simulado; comentar que la verificación real depende de la autenticación del producto).
- `reabrirHoja(hoja, motivo, ahoraISO)` → `{ ok:false, error:'Escribe el motivo de la reapertura.', hoja }` si `motivo.trim()` vacío; si no `{ ok:true, hoja:{ ...hoja, estado:'borrador', cerradaEn:null, firmas:{circulante:null,instrumentadora:null,cirujano:null}, reaperturas:[...hoja.reaperturas,{ motivo: motivo.trim(), en: ahoraISO }] } }`.
- `cerrarHoja`, `firmarHoja`: sin cambios de contrato.
- Constantes: `ROLES_PERSONAL = ['Cirujano','Ayudante','Anestesiólogo','Instrumentadora','Circulante']`; `VIAS_OPTIONS`, `CONTEO_ITEMS`, `HOJA_ESTADO_LABEL` se mantienen.

Tests a cubrir (mínimo): `aMinutos` rango, `horaAhora`, `formatearHora`, `construirHojaInicial` nueva forma, `conteoEstado` (incl. previoCierre), `validarCierre` por regla (incl. discrepancia con/sin nota), `progresoHoja`, `resumenRegistro`, `pinValido`, `reabrirHoja`, y que los exports de dinero ya no existan.

---

## Task A2 — UI contexto de sala (depende de A1)

Archivos bajo `src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal/`.

1. **Quitar el dinero** de todas las secciones: `HonorariosSection` → renombrar a `PersonalSection` ("Equipo quirúrgico", columnas rol/profesional/registro, id DOM `hgq-personal`); `InsumosSection` sin valor unitario/total; `MedicamentosSection` sin valor/total; `ImplantesSection` sin valor; `EquiposSalaSection` → renombrar a `EquiposSection` ("Equipos usados", columnas nombre/identificación/tiempo de uso, sin tarifa ni derechos de sala, id DOM `hgq-equipos`); `SeccionHoja` ya no recibe `total` (elimínalo); `ResumenSection` pasa a "Resumen del registro" usando `resumenRegistro` (tabla de conteos: insumos usados/devueltos, medicamentos, implantes, equipos, conteo, duración de cirugía y de sala; sin dinero).
2. **Banner fijo del paciente**: usa `@/Components/PatientBanner/PatientBanner` (lee `AGENTS.md` sección "Banner de paciente" y `src/hooks/PatientBanner/variants.js`; agrega una variante nueva —p. ej. `cirugia`— en `variants.js` con N° programación, procedimiento principal, sala y fecha/hora; no armes una fila a mano). Va fijo arriba, fuera del área que scrollea. `EncabezadoSection` pierde paciente/documento/aseguradora (ya están en el banner).
3. **Tiempos**: nuevo componente `comunes/HoraInput/HoraInput.{jsx,css}` — `<input type="text" inputMode="numeric" maxLength={5} placeholder="HH:mm">` con `formatearHora` + botón "Ahora" (usa `horaAhora`), alto ≥44 px; el valor válido es `HH:mm`. `TiemposSection` lo usa para los 5 tiempos, muestra "Programado: 07:30 – 09:30" como referencia (de `hoja.programado`) y ya no prellena. Une visualmente Tiempos y Anestesia en UNA sola tarjeta (`hgq-tiempos`; el error `anestesia` también la marca).
4. **Steppers**: nuevo `comunes/NumeroStepper/NumeroStepper.{jsx,css}` (botones −/+ de 44 px y número editable, `min` configurable, `aria-label`s) y un tipo de columna `'stepper'` en `HojaTabla` que lo usa. Úsalo en: usado/entregado de insumos, cantidad de medicamentos, minutos de uso de equipos, y las celdas de conteo.
5. **Conteo en 3 momentos**: `ConteoSection` con columnas inicial / previo a cierre (opcional) / final / estado; si alguna fila está en `discrepancia`, muestra un aviso `role="alert"` en la sección y una columna "Nota" (input de texto) obligatoria para esa fila.
6. **Orden cronológico** de secciones en el modal y en `NAV`: Encabezado, Tiempos y anestesia, Conteo quirúrgico, Equipo quirúrgico, Procedimientos, Insumos y materiales, Medicamentos, Implantes, Equipos usados, Observaciones y firmas, Resumen.
7. **Progreso y estado en vivo**: el índice (`NAV`) muestra por entrada un ícono completa (check) / pendiente (círculo vacío) usando `progresoHoja(...).porSeccion` (las secciones sin verificación —Encabezado, Medicamentos, Equipos, Resumen— sin ícono). Los puntos rojos de error tras un intento de cierre se mantienen.
8. **Pie**: sin total; muestra "X de 7 secciones listas" + barra de progreso, el indicador "Guardado · HH:mm", y los botones Imprimir y Cerrar hoja. Se elimina el botón "Guardar borrador". **Autoguardado**: guardar en el store (`guardarHoja`) con debounce ~800 ms ante cualquier cambio de la hoja mientras no esté cerrada (más el guardado al cerrar el modal que ya existe) y actualizar `guardadoEn` en estado con `horaAhora()`.
9. **Táctil**: dentro de `@media (max-width:1024px), (pointer:coarse)`, inputs, botones, ítems del índice y filas de `HojaTabla` con `min-height:44px`; el índice horizontal en tablet muestra un degradado en el borde derecho como pista de scroll.
10. Aviso al cerrar con éxito: "Hoja cerrada · pendiente de liquidación." (ya no menciona cargos). Badge de estado cerrada → "Cerrada".

## Task B — UI seguridad (depende de A1 y A2)

1. `FirmaPinModal` (`modals/` propios dentro de `HojaGastoQuirurgicoModal/`, uno por carpeta): "Firmar como {Rol}", nombre del firmante, campo PIN (`type="password"`, `inputMode="numeric"`, 4 dígitos, alto ≥44 px), mensaje de error "PIN inválido" si `!pinValido`, botones Cancelar / Firmar. Reemplaza el clic directo de "Firmar" en `FirmasSection`; "Quitar firma" sigue siendo un clic pero solo en borrador. Escape cierra solo esta ventana. Usa `ModalHeader`.
2. `ConfirmarCierreModal`: centrado, muestra el resumen (`resumenRegistro`: insumos usados, medicamentos, implantes, conteo, duración) y el texto "Al cerrar, la hoja queda de solo lectura y pasa a liquidación." Botones Cancelar / Cerrar hoja. Aparece SOLO si `validarCierre` no tiene errores; con errores se mantiene el comportamiento actual (resumen de errores + scroll).
3. `ReabrirHojaModal`: con la hoja cerrada, el pie muestra "Reabrir hoja" (secundario). Abre una ventana con `textarea` "Motivo de la reapertura" (obligatorio; usa `reabrirHoja`); al confirmar la hoja vuelve a borrador con firmas limpias. `FirmasSection` lista el historial de reaperturas ("DD.MES.AAAA - HH:mm · motivo") y `EncabezadoSection` muestra "Reabierta N veces" si aplica.
4. Subventanas apiladas: con una subventana abierta, Escape cierra solo esa (no el modal de la hoja), mismo patrón que `CancelarSolicitudInsumosModal`.

---
## Verificación final (después de B)
Playwright headless (flujo ya probado en la sesión: elegir área "HOSPITALIZACION GENERAL P4 T1" → "Seleccionar" → clic en "Sofía Restrepo" → "Hoja de gasto"): sin consola con errores; no hay `$` ni "COP" en el modal; los 5 tiempos aceptan "Ahora" y máscara; conteo con discrepancia sin nota bloquea el cierre y con nota no; firma pide PIN de 4 dígitos; cerrar muestra confirmación; reabrir exige motivo y limpia firmas; viewport 768 sin scroll horizontal de página.
