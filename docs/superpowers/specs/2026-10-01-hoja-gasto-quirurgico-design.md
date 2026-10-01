# Hoja de gasto quirúrgico — diseño

> **Revisión 2026-10-01 (iteración A+B):** la hoja la llena la **circulante en la
> sala** (de pie, con guantes, en tablet); la **liquidación se genera después**,
> fuera de esta pantalla. Se eliminó todo el dinero (tarifas, valores, totales,
> derechos de sala valorizados) y se agregaron controles de seguridad (firma con
> PIN, confirmación y reapertura con motivo, conteo en 3 momentos). La iteración
> C (atajos de conciliación de insumos) queda pendiente. Detalle en
> `docs/superpowers/plans/2026-10-01-hoja-gasto-iteracion-ab.md`.

## Objetivo
Registrar en la sala lo que pasó en una cirugía (tiempos, equipo, procedimientos,
consumo de insumos/medicamentos/implantes, equipos usados, conteo quirúrgico,
firmas). Es el insumo de la liquidación posterior; **no valoriza**.

## Acceso
Botón "Hoja de gasto" en `.dcp-actions` de `DetalleCirugiaPanel`. Deshabilitado
si la cirugía está `cancelada` o `incumplida`. Abre un modal grande: banner fijo
del paciente, índice de secciones con estado en vivo, cuerpo con scroll y pie
con progreso.

## Secciones (orden cronológico)
1. **Encabezado**: N° hoja, N° programación, estado, fecha/hora programada, sala, servicio, tipo de cirugía, N° de admisión. (La identidad del paciente va en el banner fijo.)
2. **Tiempos y anestesia**: ingreso a sala, inicio de anestesia, inicio/fin de cirugía, salida de sala, en 24 h con botón "Ahora". Lo programado se muestra como referencia, no prellenado. Duraciones calculadas. Tipo de anestesia, ASA, complejidad.
3. **Conteo quirúrgico**: gasas, compresas, agujas, instrumental, en 3 momentos (inicial, previo a cierre de cavidad —opcional—, final). Discrepancia = alerta + nota obligatoria.
4. **Equipo quirúrgico**: rol, nombre, registro profesional (sin tiempos ni tarifas).
5. **Procedimientos**: nombre, CUPS, vía, Dx pre/pos.
6. **Insumos y materiales**: entregado / usado / devuelto (calculado); lo entregado se asume usado salvo corrección; ítems manuales permitidos.
7. **Medicamentos y anestésicos**: nombre, dosis, cantidad.
8. **Implantes y material especial**: nombre, INVIMA, lote, serie, proveedor.
9. **Equipos usados**: nombre, identificación, tiempo de uso.
10. **Observaciones y firmas**: firma de circulante, instrumentadora y cirujano **con PIN**.
11. **Resumen del registro**: conteos (sin dinero) para revisar antes de cerrar.

## Flujo y seguridad
- Autoguardado (se muestra "Guardado · HH:mm"); sin botón "Guardar borrador".
- Pie: "X de Y secciones listas" + Imprimir + "Cerrar hoja". El índice marca cada sección como completa/pendiente en vivo.
- Cerrar: diálogo de confirmación con resumen; valida tiempos coherentes, anestesia, CUPS/Dx pos, cirujano, insumos conciliados, implantes con INVIMA+lote, conteo completo y sin discrepancia sin nota, 3 firmas. La hoja cerrada queda de solo lectura, "pendiente de liquidación".
- Reabrir: botón "Reabrir hoja" pide un motivo, deja registro (motivo + fecha/hora), invalida las firmas y vuelve a borrador.

## Táctil
Controles de ≥44 px, steppers −/+ en cantidades, formato 24 h, banner del paciente fijo.

## Estructura de código
- `src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal/`: modal + `comunes/` + `secciones/` + modales de PIN/confirmación/reapertura.
- `src/hooks/ProgramacionSalaCirugias/hojaGasto/`: modelo, validaciones, progreso, tests.
- Reusa `ModalHeader`, `Button`, `Badge`, `FormSelect`, `PatientBanner`; tokens del proyecto. Fechas con hora: "DD.MES.AAAA - HH:mm".

## Alcance
Estado en memoria con datos mock. El PIN es simulado (acepta 4 dígitos); la verificación real depende de la autenticación del producto.
