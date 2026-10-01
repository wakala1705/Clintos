# Hoja de gasto quirúrgico — diseño

## Objetivo
Registrar todo lo usado y cobrable en una cirugía (tiempos, honorarios, insumos,
medicamentos, implantes, equipos/derechos de sala, conteo quirúrgico, firmas),
para descargar inventario y generar los cargos de la cuenta de la admisión.

## Acceso
Botón "Hoja de gasto" en `.dcp-actions` de `DetalleCirugiaPanel`. Deshabilitado
si la cirugía está `cancelada` o `incumplida`. Abre un modal grande
(`modal-overlay`/`modal-card`): índice de secciones a la izquierda, cuerpo con
scroll, pie fijo con total y acciones.

## Secciones
1. **Encabezado**: N° hoja, N° programación, N° admisión, estado (Borrador/Cerrada), paciente, aseguradora/contrato, sala, servicio, tipo de cirugía.
2. **Tiempos**: ingreso a sala, inicio anestesia, inicio/fin cirugía, salida de sala; calcula duración de cirugía, anestesia y ocupación de sala. Tipo de anestesia, ASA, complejidad.
3. **Procedimientos**: nombre, CUPS, vía (única/bilateral/distinta), diagnóstico pre y posoperatorio.
4. **Equipo quirúrgico y honorarios**: rol, nombre, registro profesional, tiempo, valor (precarga de `cirugia.personal`).
5. **Insumos y materiales**: precarga de `cirugia.canasta`; entregado / usado / devuelto (calculado) / valor unitario / total; permite agregar ítems no contemplados.
6. **Medicamentos y anestésicos**: precarga de `cirugia.farmacia.medicamentos`; dosis, cantidad, valor.
7. **Implantes y material especial**: registro INVIMA, lote, serie, proveedor, valor.
8. **Equipos y derechos de sala**: equipos (precarga de `cirugia.equipos`) con tiempo de uso; derechos de sala por tiempo.
9. **Conteo quirúrgico**: gasas, compresas, agujas, instrumental; conteo inicial/final; "correcto" o "discrepancia".
10. **Observaciones y firmas**: circulante, instrumentadora, cirujano, con fecha y hora.
11. **Resumen**: subtotal por categoría y total.

## Acciones
Guardar borrador, Imprimir, Cerrar hoja. Cerrar valida: tiempos coherentes,
conteo correcto, sin insumos sin conciliar, firmas completas. Cerrada = solo
lectura + aviso "Cargos generados en la cuenta de la admisión".

## Estructura de código
- `src/Components/ProgramacionSalaCirugias/modals/HojaGastoQuirurgicoModal/`: modal + una carpeta por sección (`.jsx` + `.css` cada una); estilos compartidos en `shared`.
- `src/hooks/ProgramacionSalaCirugias/hojaGasto/`: catálogos mock (tarifas, CUPS), construcción de la hoja inicial desde la cirugía, cálculos de totales/tiempos, validaciones de cierre.
- Reusa `ModalHeader`, `Button`, `Badge`, `FormSelect`, `DatePicker`; tokens de tipografía y color del proyecto. Fechas con hora: "DD.MES.AAAA - HH:mm".

## Alcance
Estado en memoria con datos mock, sin persistencia real; tarifas de ejemplo en COP.
