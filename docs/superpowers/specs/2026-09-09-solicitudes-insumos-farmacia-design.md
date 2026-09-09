# Solicitudes de Insumos Farmacia — V1

Fecha: 2026-09-09

## Contexto

La ruta `insumos-farmacia/solicitudes` ya existe pero hoy solo renderiza un
`UnderConstruction` (`src/Components/InsumosFarmacia/Solicitudes/Solicitudes.jsx`).
Encargo: reemplazarlo con la réplica de una pantalla legacy de escritorio
(módulo contable → insumo farmacia → solicitudes) — "Catálogo Movimiento De
Inventario Salidas Asistenciales" — dada como captura de referencia, con la
misma estructura de 5 secciones pero construida con los componentes y el
estilo visual de este proyecto.

Precedente directo: `FacturaVistaClasica`
(`src/Components/Facturacion/FacturaVistaClasica/`) ya resolvió el mismo
tipo de encargo para Facturación — réplica de un formulario legacy dense,
re-vestido con `Button`/`FormSelect`/`Badge` y tokens del proyecto, en vez
del `filter-bar` estándar de un listado normal (ver AGENTS.md "Barra de
filtros de listado" — esta pantalla es la excepción ya validada por ese
precedente, no una nueva desviación). Esta spec sigue el mismo criterio.

Decisiones ya validadas con el usuario (brainstorming previo):
- **Solo frontend/mock**: filtros y selección de fila operan sobre datos
  mock en memoria (mismo patrón `fetchX()` simulado que
  `mockFacturasData.js`/`mockCirugiaData.js`). Los botones de acción
  (Reversar/Anular/Nuevo/Editar/Cambiar/Ver/Movimiento) quedan como estados
  visuales habilitado/deshabilitado — sin modales, sin lógica de negocio
  real todavía.
- **Tabs del detalle**: de las 3 pestañas de la referencia (Detalle/Línea/
  Prefijos), solo "Detalle" tiene contenido real (tabla de artículos).
  "Línea" y "Prefijos" son tabs navegables con un estado vacío simple.

## Alcance

**Sí, en V1:**
- Toolbar denso multi-campo (réplica de los filtros de la referencia).
- Tabla principal de movimientos, fila seleccionable.
- Panel de acciones lateral (Reversar/Anular/Imprimir/Nuevo/Editar).
- Detalle del movimiento seleccionado: franja de metadatos + tabs
  (Detalle/Línea/Prefijos) + tabla de artículos + botones Cambiar/Ver/
  Movimiento.
- Pie de 5 totales (Costo/Cantidad Confirmado, Costo/Cantidad Sin
  Confirmar, Total IVA), calculados en memoria sobre los artículos del
  movimiento seleccionado.
- Responsive tablet (`--bp-tablet`/`--bp-desktop`): scroll horizontal
  interno en tabla principal y tabla de artículos, nunca scroll de `body`.

**No en V1:**
- Modales de Nuevo/Editar/Reversar/Anular (botones visuales, sin acción).
- Contenido real en tabs "Línea"/"Prefijos" (placeholder vacío).
- Conexión a backend real — dataset mock fijo.
- Paginación de la tabla principal (dataset mock cabe con scroll interno,
  mismo criterio que otras vistas clásicas del proyecto).

## Modelo de datos (mock)

Archivo nuevo `src/hooks/InsumosFarmacia/mockSolicitudesData.js`, mismo
criterio que `mockFacturasData.js` (dataset + `fetchMovimientos()`
simulado, forma ya lista para reemplazar por un endpoint real más
adelante):

```js
// Contexto fijo de la página (bodega/año/sede activos) -- no son filtros de
// la tabla, son los campos de solo lectura del toolbar (Año/Grp Bdg./
// Bodega/Id.Sede de la referencia). V1 no tiene selector de bodega.
export const CONTEXTO_BODEGA = {
  anio: '2024',
  grupoBodega: '01',
  bodega: 'FARMACIA PISO 3',
  idSede: '01',
};

export const TIPO_OPTIONS = [
  { value: 'debito', label: 'Debito' },
  { value: 'credito', label: 'Credito' },
];

export const TIPO_ARTICULO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'medicamento', label: 'Medicamento' },
  { value: 'insumo', label: 'Insumo' },
  { value: 'dispositivo', label: 'Dispositivo médico' },
];

export const PROCEDENCIA_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'salud', label: 'Salud' },
  { value: 'particular', label: 'Particular' },
];

export const ESTADO_OPTIONS = [
  { value: 'sin-confirmar', label: 'Sin Confirmar' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'todos', label: 'Todos' },
];

export const TRNS_OPTIONS = [
  { value: 'sal', label: 'SAL' },
  { value: 'ent', label: 'ENT' },
];

export const MOVIMIENTOS = [
  {
    id: '0200203069-2',
    bdg: '01',
    bodegaColor: '#e8801a',        // color de la pastilla de bodega
    grupo: '01',
    consecutivo: '0200203069-2',
    noAdmision: '0200277323',
    noPrestacion: '0200000198',
    fecha: '2026-07-25',
    hora: '17:14',
    procedencia: 'SALUD',
    movimiento: 'SA-Ventas a Clientes',
    paciente: 'GARCIA GARCIA ANGELICA MARIA',
    ubicacion: 'Sede 01 Area: URGENCIAS C.Costo: URG...',
    idContrato: '900156264',
    tipo: 'debito',
    tipoArticulo: 'medicamento',
    procedenciaTipo: 'salud',
    estado: 'sin-confirmar',
    trns: 'sal',
    fechaContable: '20260727',
    confirmo: '',
    permitirEditarCostos: false,
    articulos: [
      {
        item: 2,
        codigo: 'MX0000005',
        descripcion: 'ACETAMINOFEN 500 MG TABLETA',
        marca: 'NA',
        bdg: '01',
        cantidadSolicitada: 3,
        cantidadEntregada: 3,
        costoUnidad: { anterior: 0, unidad: 0, descuento: 0, neto: 0 },
        costoTotal: { unidad: 0, descuento: 0, neto: 0 },
        iva: { porcentaje: 0, unitario: 0, total: 0 },
        confirmado: false,
      },
      // ...
    ],
  },
  // 6-8 movimientos sembrados, variando bdg/procedencia/paciente/ubicación
  // (datos de la captura de referencia + variantes) para que la tabla y
  // los filtros tengan con qué trabajar; al menos un movimiento con
  // articulos.confirmado mixto (true/false) para que el pie de totales
  // muestre valores no-cero en ambas columnas.
];

export function fetchMovimientos({ filtros, query } = {}) {
  // simula latencia + filtra MOVIMIENTOS por filtros/búsqueda, misma forma
  // que fetchFacturas() de mockFacturasData.js
}

export function formatFechaClasica(iso) { /* dd/mm/aaaa, mismo criterio que mockFacturasData */ }
```

`bodegaColor` es un dato de la bodega (viene del backend real algún día),
no un tono semántico de `Badge` — se pinta como una pastilla de color
plano (`<span className="mig-bdg-dot" style={{ background: bodegaColor }} />`),
no como `Badge`.

## Layout general — `Solicitudes.jsx`

Reemplaza el `UnderConstruction` actual, conserva el shell existente
(`Sidebar`+`Topbar` con `page="Solicitudes"`):

```
.app → Sidebar + .main → Topbar
  .content
   └─ MovimientosShell (nuevo, dentro de .content)
       ├─ MovimientosToolbar
       ├─ .mig-body (flex row)
       │    ├─ MovimientosGrid        (flex:1)
       │    └─ MovimientoAccionesPanel (columna fija ~140px)
       ├─ MovimientoDetalle
       └─ MovimientosTotalesFooter
```

Estado en `Solicitudes.jsx`:
- `filtros` — `{ tipo, tipoArticulo, procedencia, estado, trns, busqueda:
  { noDoc, noAdmision, noPrestacion } }`. Año/Grp Bdg./Bodega/Id.Sede no
  entran acá: son de solo lectura desde `CONTEXTO_BODEGA`, no filtran nada.
- `movimientos` — `useMemo` filtrando `MOVIMIENTOS` por `filtros` (client-side,
  sin `fetchMovimientos` en el primer render para simplificar — igual
  criterio que `FacturaVistaClasica` que filtra el array importado
  directamente con `useMemo`, no con el `fetch` simulado).
- `selectedId` con fallback a la primera fila visible, **sin `useEffect`**
  (mismo patrón derivado-en-render que `FacturaVistaClasica.jsx:70-71`).
- `activeTab` — default `'detalle'`, reseteado al mismo valor cuando cambia
  `selectedId` (mismo mecanismo "ajustar estado durante el render").

## `MovimientosToolbar/MovimientosToolbar.jsx`

Dos filas dentro de un único `.mig-toolbar` (sin el `filter-bar` estándar —
excepción ya validada, ver Contexto):

**Fila 1** (solo-lectura + selects, `flex-wrap:wrap`):
- Año, Grp Bdg., Bodega (label + valor fijo de `CONTEXTO_BODEGA`, no editable en V1)
- Tipo (`FormSelect`, `TIPO_OPTIONS`)
- Id.Sede (label + valor fijo de `CONTEXTO_BODEGA.idSede`)
- Tipo Artículo (`FormSelect`, `TIPO_ARTICULO_OPTIONS`)
- Procedencia (`FormSelect`, `PROCEDENCIA_OPTIONS`)
- Estado (`FormSelect`, `ESTADO_OPTIONS`, default `'sin-confirmar'`)

**Fila 2** (búsqueda puntual + acciones):
- Botón "Seleccionar Movimiento" (`Button` variant `secondary`, icon
  `LuDownload`) — visual, sin acción real en V1.
- Trns. (`FormSelect`, `TRNS_OPTIONS`)
- No.Doc / Admisión / Prestación — 3 inputs de texto simples
  (`className="mig-input"`, sin `.form-field` porque no llevan label
  visible propio, solo placeholder, igual que los campos puntuales del
  legacy).
- Botón "Refrescar" (`Button` variant `secondary`, icon `LuRefreshCw`,
  alineado a la derecha con `margin-left:auto`).

Cada campo con label usa `<label>` + control, mismo patrón
`.fvc-filter-field` de `FacturaVistaClasica` (clase local `.mig-filter-field`,
sin reusar la de Facturación — son features distintas, mismo criterio que
el resto del proyecto de no compartir CSS entre features).

## `MovimientosGrid/MovimientosGrid.jsx`

Tabla `.mig-grid` (mismo esqueleto que `.fvc-grid`: `overflow-x:auto`
propio, nunca en `body`), columnas: Bdg (pastilla de color), Grupo,
Consecutivo, No.Admisión, No.Prestación, Fecha, Hora, Procedencia,
Movimiento, Paciente (`.mig-ellipsis`), Ubicación (`.mig-ellipsis`),
Id.Contrato.

Fila seleccionable: `onClick`/`onKeyDown` Enter-Espacio, `aria-selected`,
`tabIndex={0}`, clase `.selected` — mismo patrón que `FacturasGridClasica`/
`AdmisionesTable`.

## `MovimientoAccionesPanel/MovimientoAccionesPanel.jsx`

Columna vertical de 5 `Button` (`size="base"`, `justify-content:flex-start`,
ancho completo de la columna) — patrón nuevo en el proyecto, primer uso de
un panel de acciones lateral junto a una grilla:

| Botón | icon | variant | estado |
|---|---|---|---|
| Reversar | `LuUndo2` | `secondary` | `disabled` siempre (igual que la referencia) |
| Anular | `LuBan` | `danger-outline` | habilitado si hay `selectedId` |
| Imprimir | `LuPrinter` | `secondary` | habilitado si hay `selectedId` |
| Nuevo | `LuPlus` | `outline` | siempre habilitado |
| Editar | `LuPencil` | `primary` | habilitado si hay `selectedId` (variant `primary` lo marca como la acción activa, igual que el resaltado de la referencia) |

Todos sin `onClick` real (V1 visual-only) salvo un console/no-op — no se
simulan toasts para no sugerir una acción que no existe todavía.

## `MovimientoDetalle/MovimientoDetalle.jsx`

Sin selección (`selectedMovimiento == null`): mensaje de estado vacío,
mismo criterio que `FacturaDetalleClasico`/`FacturaDetallePanel`
("Selecciona un movimiento en la tabla para ver su detalle.").

Con selección:
- Franja de metadatos (`.mig-meta-bar`): Fecha Contable (texto con
  estilo de link, no navega en V1), Confirmó (valor o `—` si vacío),
  Fecha, checkbox "Permitir editar costos" (controla solo estado visual
  local, sin persistir).
- Tabs (`role="tablist"`, roving tabindex, mismo patrón ARIA que
  `dcp-tabs-bar` de `DetalleCirugiaPanel`): Detalle / Línea / Prefijos.
  - **Detalle** → `MovimientoItemsTable` (ver abajo).
  - **Línea** / **Prefijos** → estado vacío simple ("Sin información
    disponible."), sin tabla ni mock propio (fuera de alcance V1).
- Botones Cambiar / Ver / Movimiento (`Button` variant `secondary`,
  alineados a la derecha del bloque, sin acción real).

### `MovimientoDetalle/MovimientoItemsTable/MovimientoItemsTable.jsx`

Tabla `.mig-grid .mig-items-grid` (mismo prefijo, análoga a
`FacturaItemsTable` pero con las columnas propias de este dominio):
Item, Código, Descripción, Marca, Bdg, Cant. Solicitada, Cant. Entregada,
Costo Unidad (Anterior/Unidad/Descuento/Neto), Costo Total (Unidad/
Descuento/Neto), IVA (%/Unitario/Total). Recibe `articulos` como prop —
único consumidor, vive anidada (ver AGENTS.md "one component = one
folder", subcarpeta porque no se reusa fuera de `MovimientoDetalle`).

## `MovimientosTotalesFooter/MovimientosTotalesFooter.jsx`

5 tarjetas `.mig-total-card` (label + valor, mismo patrón visual que
`.fvc-footer-total-*` pero como tarjetas separadas para calzar con la
referencia): Ttl Costo Art. Confir., Ttl Cant. Art. Confir., Ttl Costo
Art. Sin Confir., Ttl Cant. Art. Sin Confir., Total IVA.

Calculados en `Solicitudes.jsx` con `useMemo` sobre
`selectedMovimiento.articulos`, particionando por `articulo.confirmado`:
- Costo Confir./Sin Confir. = suma de `costoTotal.neto` de los artículos
  con `confirmado === true` / `=== false`.
- Cant. Confir./Sin Confir. = suma de `cantidadEntregada` con el mismo
  particionamiento.
- Total IVA = suma de `iva.total` de todos los artículos (sin particionar,
  igual que la referencia que muestra una sola columna de IVA).
- `selectedMovimiento == null` → los 5 valores en `0.00`.

## Qué NO lleva (verificación negativa explícita)

Sin: modal de Nuevo/Editar/Reversar/Anular, contenido real en tabs Línea/
Prefijos, paginación, conexión a backend, `onClick` con efectos reales en
Cambiar/Ver/Movimiento/Seleccionar Movimiento.

## Responsive

Por debajo de `--bp-tablet`/`--bp-desktop` (768/1024): `MovimientosGrid` y
`MovimientoItemsTable` ganan `overflow-x:auto` en su contenedor (ya lo
tienen por defecto, se verifica que no dependan de un ancho mínimo mayor);
`MovimientosToolbar` pasa a `overflow-x:auto` en una sola fila por bloque
(mismo criterio que `.fvc-toolbar`); `.mig-body` (grid + panel de acciones)
pasa de `flex-direction:row` a `column` bajo 1024px — el panel de acciones
se muestra como una fila horizontal de botones encima/debajo de la grilla
en vez de columna lateral, para no angostar la tabla en tablet.

## Estructura de archivos

```
src/Components/InsumosFarmacia/Solicitudes/
  Solicitudes.jsx / .css                         (modificado — reemplaza UnderConstruction)
  MovimientosToolbar/MovimientosToolbar.jsx / .css
  MovimientosGrid/MovimientosGrid.jsx / .css
  MovimientoAccionesPanel/MovimientoAccionesPanel.jsx / .css
  MovimientoDetalle/
    MovimientoDetalle.jsx / .css
    MovimientoItemsTable/MovimientoItemsTable.jsx / .css
  MovimientosTotalesFooter/MovimientosTotalesFooter.jsx / .css
src/hooks/InsumosFarmacia/mockSolicitudesData.js
```

## Testing

Sin suite automatizada en este proyecto — verificación manual con el
servidor de desarrollo:

1. Entrar a `/insumos-farmacia/solicitudes` — ya no muestra
   "en desarrollo", carga el toolbar + tabla con movimientos sembrados.
2. La primera fila queda seleccionada por defecto; el detalle y el pie de
   totales reflejan ese movimiento.
3. Cambiar Estado/Tipo/Tipo Artículo/Procedencia en el toolbar filtra la
   tabla; si la fila seleccionada desaparece del resultado, la selección
   cae a la primera fila visible sin quedar "colgada".
4. Seleccionar otra fila actualiza detalle + totales sin recargar la
   página.
5. Tab "Detalle" muestra la tabla de artículos del movimiento
   seleccionado; "Línea"/"Prefijos" muestran el estado vacío.
6. Panel de acciones: "Reversar" siempre deshabilitado; el resto
   deshabilitados solo cuando no hay movimiento seleccionado (no debería
   pasar en V1 dado el fallback de selección, pero se verifica el estado
   `disabled` no se rompe si `movimientos` queda vacío por los filtros).
7. Redimensionar a ancho tablet (768–1024px): tabla/tabla de artículos con
   scroll horizontal interno, panel de acciones pasa a fila horizontal,
   sin overflow de `body`.
