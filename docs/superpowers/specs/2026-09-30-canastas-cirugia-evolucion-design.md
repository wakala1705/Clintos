# Canastas de cirugía — evolución a maestro-detalle con recepción, bloqueo y consumo

Fecha: 2026-09-30 · Ruta: `/programacion-sala-cirugias/canastas`
Referencia visual: artboards `Main.dc.html` (tablet 1194×834) y `Desktop.dc.html` (1440×900) del artefacto de diseño.

## Objetivo

Llevar la pantalla actual (tabla + modal de checklist) al diseño completo de los artboards:
maestro-detalle, recepción con cantidades y novedades, 6 estados de canasta, bloqueo de inicio
informativo con autorización por urgencia, y pestaña de consumo y devolución.

## Decisiones tomadas

1. **Alcance C**: todo el diseño (recepción, bloqueo/urgencia, consumo y devolución).
2. **Modelo A**: extender el ítem y la canasta; el estado se deriva, no se guarda.
3. **Bloqueo solo informativo** en esta pantalla. `bloqueoInicio()` se exporta para conectarlo
   después a la agenda y a `DetalleCirugiaPanel`; esos no se tocan.
4. El **navegador de fecha pasa al header** de la página (como en los artboards), revirtiendo la
   ubicación en la barra de filtros del encargo del 2026-09-29.
5. `DevolucionesCirugiaModal` y `InsumosTab` **no se modifican**.

## Modelo de datos (`src/hooks/ProgramacionSalaCirugias/mockCirugiaData.js`)

Campos nuevos por ítem de `cirugia.canasta.items[]`:

| Campo | Significado |
|---|---|
| `preparado` (bool) | Farmacia ya alistó el ítem (fase "en preparación") |
| `despachado` (number, opcional) | Cantidad que farmacia despachó; presente = la canasta fue despachada |
| `recibido` (number, opcional) | Cantidad que quirófano recibió |
| `novedad` (string, opcional) | Texto de novedad; se calcula al recibir |

Campos nuevos en `cirugia.canasta`:
`recepcion { usuario, fecha, conNovedades }`, `autorizacionUrgencia { usuario, fecha }`,
`consumo { usuario, fecha, usados: { [nombre]: number } }`.

`solicitudFarmacia` se conserva sin cambios de significado, porque lo consumen InsumosTab y
Devoluciones. Al recibir, los ítems pasan a `'entregado'`.

### Estado derivado: `resumenCanasta(cirugia)`

Devuelve `estado` en: `sin-solicitar` · `en-preparacion` · `despachada` · `recibida` ·
`con-novedades` · `consumo-registrado`, más los conteos `total`, `preparados`, `recibidos`.

Reglas:
- `consumo` presente → `consumo-registrado`.
- todos `entregado` con `recepcion.conNovedades` → `con-novedades`; sin novedades → `recibida`.
- algún `solicitado` con `despachado` definido → `despachada`.
- algún `solicitado` sin `despachado` → `en-preparacion`.
- todos `sin-solicitar` → `sin-solicitar`.

### `bloqueoInicio(cirugia)`

`true` si `estado` de la cirugía es `programada` o `urgencia`, la canasta no está en
`recibida`/`con-novedades`/`consumo-registrado`, **y** no hay `autorizacionUrgencia`.
Una cirugía `realizada` nunca está bloqueada. Estado de compuerta para la UI (`gateOf`):
`lista` · `bloqueada` · `urgencia-puede-autorizar` · `urgencia-autorizada` · `realizada`.

### Funciones de acción

Todas devuelven la cirugía actualizada y, donde aplica, el snapshot previo para "Deshacer"
(mismo criterio que `deshacerResolucion`). Lanzan `Error` con mensaje de usuario si la
precondición falla.

- `registrarRecepcion(id, { recibidos: {[nombre]: number}, usuario })`: exige estado `despachada`;
  `recibido` ≤ `despachado` y ≥ 0; calcula `novedad` por ítem (`despachado < cantidad` →
  "Farmacia despachó X de Y"; `recibido < despachado` → "Faltan N en la entrega"); pasa los ítems
  a `entregado`; guarda `recepcion`. Reemplaza el uso de `registrarEntregaInsumos` en esta pantalla
  (esa función se conserva para InsumosTab).
- `despacharCanasta(id)`: fija `despachado = cantidad` en los ítems solicitados (para el prototipo).
- `autorizarInicioUrgencia(id, { usuario })`: solo si la cirugía es de urgencia y sigue bloqueada.
- `registrarConsumo(id, { usados, usuario })`: solo si la cirugía es `realizada` y la canasta está
  recibida. Valida `usado` ≤ `recibido`; llama a `guardarDevolucion` con
  `lineas = [{ nombre, cantidad: recibido − usado }]` (reutiliza topes, código y lote); guarda
  `consumo`. Si no hay nada que devolver, guarda `consumo` sin crear devolución.
- `fetchCanastasDia` deja de excluir `realizada` (sigue excluyendo cancelada e incumplida).

### Semilla del mock

Cubrir en la sala `qx-1` del día actual los 5 casos de los artboards: realizada con canasta
recibida (consumo pendiente), despachada por recibir (con un ítem despachado incompleto),
recibida con novedades, en preparación con urgencia, y en preparación normal (bloqueada).

## UI (`src/Components/ProgramacionSalaCirugias/canastas/`)

Una carpeta por componente con `.jsx` + `.css`. Se **eliminan** `CanastasTable` y
`CanastasFiltrosBar` (su navegador de fecha se mueve al header) y `ConfirmarRecepcionModal`.

| Componente | Responsabilidad |
|---|---|
| `CanastasKpis` | 4 KPIs: recibidas, despachadas por recibir, en preparación, con inicio bloqueado |
| `CanastaAlerta` | Alerta ámbar con "Verificar ahora" (selecciona la cirugía bloqueada) o estado verde sin bloqueos |
| `CanastasLista` | Buscador + `FormSelect` de estado + lista de `CirugiaCard` |
| `CirugiaCard` | Hora, paciente, procedimiento, cirujano, badge de canasta y badge de compuerta |
| `CanastaDetalle` | Cabecera del paciente, banner de estado, `tablist`, footer de acciones |
| `RecepcionTab` | Modos `editar` (despachada), `preparacion`, `lectura` |
| `ConsumoTab` | Recibido · usado (− / +) · devolver; solo lectura tras registrar |

`CanastasCirugia.jsx` (orquestador) conserva `cirugias`, `salaId`, `fecha`, toast con "Deshacer" y
añade `seleccionId`. Los borradores de recepción (`recibido`, OK por ítem) y de consumo (`usado`)
viven en un estado por `cirugiaId`, de modo que cambiar de cirugía no los pierde; se persisten
solo al confirmar.

Reglas de UI:
- "Confirmar recepción" habilitado solo con todos los OK; si algún `recibido < cantidad`
  solicitada, el botón pasa a "Recibir con novedades" (variante ámbar).
- `recibido` acotado a `[0, despachado]`.
- "Autorizar inicio por urgencia" solo en cirugías de urgencia con canasta sin recibir.
- Pestaña "Consumo y devolución" deshabilitada con la leyenda "al finalizar la cirugía" hasta que
  la cirugía esté `realizada`. Al seleccionar una cirugía realizada, la pestaña activa inicial es
  Consumo.
- Errores de acciones: `role="alert"` en el detalle; el estado no cambia.
- Componentes reutilizados: `Button`, `Badge`, `FormSelect`, `EstadoCirugiaBadge` (urgencia).
- Colores solo con tokens de `:root`: `--green-*`, `--amber-*`, `--red-*`, `--blue-*`,
  `--violet-*`, `--gray-*`. Tipografía con `--fs-*`/`--fw-*`. Íconos `react-icons/lu`.
- Los badges de canasta usan tono `success`/`warn`/`info`/`neutral` de `Badge`; el estado
  "consumo registrado" usa violeta vía `className` propio, ya que `Badge` no tiene tono violeta.

### Responsive

Un solo layout con `@media (max-width:1024px)`: lista de 410px, novedad bajo el nombre del
insumo, alerta en su propia fila y scroll vertical de la página (artboard Main). Desde 1024px:
lista de 460px y columna de novedad propia (artboard Desktop).

**Objetivos táctiles de 44px (iteración 2026-09-30):** se aplican con
`@media (max-width:1024px), (pointer:coarse)`. El artboard Main mide 1194px (desktop por ancho),
pero representa un iPad en horizontal, que se maneja con el dedo: por eso los 44px dependen del
tipo de puntero y no solo del ancho. `pointer:coarse` no es un breakpoint de ancho, así que no
rompe el contrato de 768/1024/1440. Con ratón a 1194px el layout denso no cambia.

## Fuera de alcance

- Hacer cumplir el bloqueo en la agenda o `DetalleCirugiaPanel`.
- Cambios en `DevolucionesCirugiaModal` o `InsumosTab`.
- Integración real con farmacia (todo sigue en mock).
- Vista de teléfono (< 768px).

## Verificación

- Tests unitarios de las reglas puras (`resumenCanasta`, `bloqueoInicio`, `registrarRecepcion`,
  `registrarConsumo`) si el proyecto ya tiene runner; si no, se verifican vía Playwright.
- ESLint limpio sobre los archivos tocados.
- Playwright headless recorriendo los 5 casos de la semilla a 1440 y 1194 de ancho, incluyendo
  recepción con novedades, autorización de urgencia y registro de consumo con devolución;
  confirmar que la devolución aparece en `DevolucionesCirugiaModal`.
