# Spec — KPI expandido / contraído

Especificación del comportamiento "expandir / contraer" de las tarjetas KPI.
Fuente de verdad en código: `src/Components/KpiCard/KpiCard.jsx` y `KpiCard.css`.
Los valores de este documento salen de ese código y de los tokens de `src/app/globals.css`
y del `:root` de cada feature (modo claro salvo que se indique).

---

## 1. Resumen

Una tarjeta KPI tiene **dos estados visuales**:

| Estado | Nombre en código | Para qué sirve |
|---|---|---|
| **Expandido** (por defecto) | `compact = false` | Lectura completa: ícono, label, valor, descripción y (solo Ocupación) barra de progreso. |
| **Contraído** | `compact = true` | Una sola línea: ícono + label a la izquierda, valor a la derecha. Libera alto para la tabla o panel de debajo. |

> Nota de nomenclatura: en la UI el botón dice *"Expandir tabla" / "Contraer tabla"*.
> Es decir, **cuando la tabla está expandida, los KPIs están contraídos** (y viceversa).
> En código, el estado vive en el padre como `tablaExpandida` y se pasa al KPI como `compact={tablaExpandida}`.

**El KPI no tiene botón propio.** El estado lo controla un botón que está en la barra de la tabla (o un menú de vista) y lo recibe el KPI por prop. El KPI es un componente "tonto".

---

## 2. Guía visual

### 2.1 Expandido (`compact = false`)

```
┌──────────────────────────────────┐   padding 16px
│ ┌────┐                           │
│ │ ◉  │  TOTAL PACIENTES          │   fila superior: ícono 34×34 + label (gap 10px)
│ └────┘                           │
│                                  │   gap vertical 8px entre bloques
│  42                              │   valor 24px / bold
│                                  │
│  En piso                         │   descripción 13px / ink-500
│                                  │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░  (solo        │   barra 6px alto (solo Ocupación)
│                      Ocupación)  │
└──────────────────────────────────┘
   borde 1px, radio 12px
   Alto aprox.: 127px (sin barra) · ~143px (con barra)
```

### 2.2 Contraído (`compact = true`)

```
┌──────────────────────────────────────────────┐   padding 10px 14px
│ ┌──┐                                         │
│ │◉ │  TOTAL PACIENTES               42       │   una sola fila (flex-direction: row)
│ └──┘                                         │   ícono 28×28 · label a la izq. · valor a la der.
└──────────────────────────────────────────────┘
   Alto aprox.: 50px   →   se liberan ~77px por tarjeta (≈ 93px en Ocupación)
```

Ocultos en contraído: **descripción** y **barra de progreso** (`display:none`).

### 2.3 Cambio entre estados

```
EXPANDIDO                                   CONTRAÍDO
┌───────────┐ ┌───────────┐ ┌───────────┐   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ◉ LABEL   │ │ ◉ LABEL   │ │ ◉ LABEL   │   │◉ LABEL   42 │ │◉ LABEL   07 │ │◉ LABEL  18% │
│ 42        │ │ 07        │ │ 18%       │   └─────────────┘ └─────────────┘ └─────────────┘
│ desc      │ │ desc      │ │ ▓▓░░░     │   ┌────────────────────────────────────────────────┐
└───────────┘ └───────────┘ └───────────┘   │                                                │
┌────────────────────────────────────────┐  │   TABLA (ocupa el alto liberado)               │
│ TABLA                                  │  │                                                │
└────────────────────────────────────────┘  └────────────────────────────────────────────────┘
        ↑ botón [⤢] "Expandir tabla"                ↑ botón [⤡] "Contraer tabla" (activo, azul)
```

---

## 3. Especificación de medidas

### 3.1 Tarjeta (`.pg-kpi-card`)

| Propiedad | Expandido | Contraído |
|---|---|---|
| `display` / dirección | `flex` / `column` | `flex` / `row` |
| `align-items` | (stretch) | `center` |
| `padding` | `16px` | `10px 14px` |
| `gap` | `8px` | `10px` |
| Borde | `1px solid var(--border)` | igual |
| Radio | `var(--radius-lg)` = **12px** | igual |
| Fondo | `var(--surface)` | igual |
| `min-width` | `0` (permite truncar el label) | igual |

### 3.2 Ícono (`.pg-kpi-icon`)

| | Expandido | Contraído |
|---|---|---|
| Contenedor | **34 × 34 px** | **28 × 28 px** |
| Radio | `var(--radius)` = 8px | igual |
| Glifo (`.icon`) | **18 × 18 px** | **16 × 16 px** |
| Librería | `react-icons/lu` (Lucide) | igual |

### 3.3 Tipografía

Familia: la del proyecto (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, ...`). No se define en el KPI; la hereda del `body`.

| Elemento | Token de tamaño | Valor | Peso | Color | Otros |
|---|---|---|---|---|---|
| **Label** | `--fs-xs` | 11px | `--fw-bold` (700) | `--ink-500` | `uppercase`, `letter-spacing: .04em`, una línea con `ellipsis` |
| **Valor** (expandido) | `--fs-3xl` | 24px | `--fw-bold` (700) | `--ink-900` | `line-height: 1.1`, `font-variant-numeric: tabular-nums` |
| **Valor** (contraído) | `--fs-xl` | 18px | `--fw-bold` (700) | `--ink-900` | igual |
| **Descripción** | `--fs-sm` | 13px | regular (400) | `--ink-500` | solo expandido |

El label usa `--fw-bold` a propósito: es una etiqueta en mayúsculas de dato, no un título (la regla "títulos en semibold" no aplica).

### 3.4 Barra de progreso (solo KPI "Ocupación", solo expandido)

| Propiedad | Valor |
|---|---|
| Alto | 6px, `width: 100%`, `margin-top: 2px` |
| Radio | 999px (píldora) |
| Fondo (pista) | `var(--gray-bg)` |
| Relleno | `var(--primary)`, ancho = `progress.percent` % |
| Accesibilidad | `role="progressbar"`, `aria-valuenow/min(0)/max(100)`, `aria-label` = label |

### 3.5 Variantes de color (solo afectan al **ícono**)

| `variant` | Fondo del ícono | Color del glifo | Uso típico |
|---|---|---|---|
| `neutral` (default) | `--primary-50` | `--primary` | Conteos generales, ocupación |
| `warning` | `--amber-bg` | `--amber-fg` | Pendientes, atención |
| `danger` | `--red-bg` | `--red` | Críticos, vencidos |
| `info` | `--blue-bg` | `--blue-fg` | Informativos |
| `success` | `--green-bg` | `--green` | Confirmados, completados |
| `violet` | `--purple-bg` | `--purple-fg` | Estados distintos a los anteriores (ej. "Utilizadas") |
| `muted` | `--gray-bg` | `--ink-500` | Estados "en espera" |

El valor y el label **no** cambian de color con la variante.

---

## 4. Layout de la fila de KPIs

La fila (grid) es **propia de cada pantalla**, no del componente. El componente solo define la tarjeta. Cada pantalla define columnas y el `gap`:

| Estado de la fila | `gap` |
|---|---|
| Expandida | `16px` |
| Contraída (`.compact`) | `12px` |

Ejemplo canónico (Enfermería → Panel general, `PanelGeneral.css`):

```css
.pg-kpi-row{ display:grid; grid-template-columns:repeat(5,1fr); gap:16px; flex-shrink:0; }
.pg-kpi-row.compact{ gap:12px; }                       /* solo el gap; la tarjeta la compacta la prop */
@media (max-width:1280px){ .pg-kpi-row{ grid-template-columns:repeat(3,1fr); } }
```

Reglas:
- La fila lleva `flex-shrink:0` para que nunca se aplaste.
- La tabla/panel de debajo tiene `flex:1; min-height:0`, así **absorbe el alto liberado** sin código extra.
- Las columnas **no cambian** entre expandido y contraído; solo cambian el `gap` y la altura de las tarjetas.

---

## 5. Comportamiento lógico

### 5.1 Contrato del componente

```jsx
<KpiCard
  icon={LuUsers}              // componente de ícono (obligatorio)
  label="Total pacientes"     // obligatorio; también va como title (tooltip si se trunca)
  value={42}                  // obligatorio
  description="En piso"       // opcional; se oculta en contraído
  variant="neutral"           // neutral | warning | danger | info | success | violet | muted
  progress={{ percent: 72 }}  // opcional, solo Ocupación; se oculta en contraído
  compact={false}             // false = expandido · true = contraído
  active={false}              // solo si es botón-filtro
  onClick={...}               // si se pasa, la tarjeta pasa de <div> a <button> (filtro toggle)
  className="..."             // extra opcional
/>
```

- `compact` **no** tiene estado interno: es 100 % controlado por el padre.
- Sin `onClick` → `<div>` informativo. Con `onClick` → `<button type="button" aria-pressed={active}>`.
  Esto es independiente de expandir/contraer: una tarjeta filtro también se contrae.

### 5.2 Estado y disparador (en el padre)

```jsx
const [tablaExpandida, setTablaExpandida] = useState(false);   // arranca EXPANDIDO (KPIs completos)

<div className={`pg-kpi-row${tablaExpandida ? ' compact' : ''}`}>
  <KpiCard ... compact={tablaExpandida} />   {/* repetir en CADA tarjeta de la fila */}
</div>

<PatientsPanel
  expandida={tablaExpandida}
  onToggleExpandida={() => setTablaExpandida((v) => !v)}
/>
```

Reglas del estado:
1. **Un único booleano por pantalla** controla a todas las tarjetas de la fila a la vez. Nunca una tarjeta contraída y otra no.
2. Estado inicial por defecto: **expandido** (`false`). Excepción: Programación de cirugía → Panel general arranca **contraído** (encargo explícito).
3. El estado es de sesión de pantalla (`useState`): **no se persiste** en localStorage ni URL; se reinicia al recargar o remontar.
4. El cambio es **instantáneo** (sin animación de altura); solo el botón y el borde de la tarjeta tienen `transition .15s`. Si se agrega animación, respetar `prefers-reduced-motion`.
5. El cambio de estado **no** recalcula datos: el `value` es el mismo, solo cambia la presentación.
6. Cuando se contrae, se pierde la `description`. Si esa descripción contiene información crítica, debe estar también en el `label` o en un `title` (hoy el label ya lleva `title={label}`).

### 5.3 El botón disparador

Vive en la **barra superior de la tabla**, a la derecha, no en los KPIs.

| Propiedad | Valor |
|---|---|
| Tamaño | **36 × 36 px**, `padding:0`, ícono centrado |
| Borde / radio | `var(--btn-border-width)` (1px) / `var(--btn-radius)` (8px) |
| Fondo / color | `var(--surface)` / `var(--ink-700)` |
| Ícono | `LuMaximize2` (tabla expandida = false) → `LuMinimize2` (true), tamaño `var(--btn-icon-size)` = 18px |
| Hover | fondo `var(--gray-bg)` |
| Foco | `outline: var(--btn-focus-outline) solid var(--primary)` (2px), offset `var(--btn-focus-offset)` (2px) |
| **Activo** (`aria-pressed="true"`) | fondo `var(--interactive-selected-bg)`, borde y color `var(--primary)` |
| `aria-pressed` | refleja `tablaExpandida` |
| `aria-label` / `title` | `"Expandir tabla"` (false) · `"Contraer tabla"` (true) |

### 5.4 Máquina de estados

```
                 click en [⤢]                    
   ┌───────────────────────────────┐             
   │  KPIs EXPANDIDOS              │ ─────────────────────▶ ┌───────────────────────────────┐
   │  tablaExpandida = false       │                        │  KPIs CONTRAÍDOS              │
   │  botón: ⤢ "Expandir tabla"    │ ◀───────────────────── │  tablaExpandida = true        │
   │  botón: neutro                │     click en [⤡]       │  botón: ⤡ "Contraer tabla"    │
   └───────────────────────────────┘                        │  botón: azul (pressed)        │
                                                            └───────────────────────────────┘
```

### 5.5 Accesibilidad

- El botón disparador es un `<button>` con `aria-pressed` y `aria-label` que cambia con el estado; el foco visible es obligatorio.
- El label contraído se trunca con `ellipsis`; el texto completo queda en `title`.
- La barra de progreso usa `role="progressbar"` (se oculta junto con el resto en contraído; el valor `%` sigue visible como valor principal).
- El orden de lectura no cambia entre estados (ícono → label → valor → descripción).
- Modo oscuro y alto contraste: no hay valores propios; todo sale de tokens (`--surface`, `--border`, `--ink-*`), que ya cambian con el tema.

---

## 6. Dónde se usa hoy

| Pantalla | Fila de KPIs | Quién dispara | Estado inicial |
|---|---|---|---|
| Enfermería → Panel general | `.pg-kpi-row` (5 col → 3 en ≤1280px) | Botón en barra de `PatientsPanel` | Expandido |
| HC Hospitalización | `.hh-kpi-row` (4 col → 2 en ≤1280px) | Botón en barra de `PatientsPanel` | Expandido |
| HC Consulta externa | `.hc-kpi-row` (3 col) | Botón en el extremo de `hc-agenda-header`; **además compacta el `WeekDatePicker`** | Expandido |
| Interconsulta | `.ic-kpi-row` (6 col) | Botón de la barra de `SolicitudesPanel` | Expandido |
| Cirugía → Panel general | `.pg-cir-kpis` (5 col → 3 en ≤1024px) | Menú **Vista** (`VistaPanelMenu`): *Compacto / Expandido* | **Contraído** |

Pantallas con `KpiCard` **sin** expandir/contraer (siempre expandido): Gestión de Camas (Resumen, Reservas, Limpieza, Mantenimiento, Auditoría, Integridad, Indicadores), Gestión de Turnos, Vacunación, Gestión de Cirugías, Canastas.

---

## 7. Cómo aplicarlo a una pantalla nueva (checklist para desarrollo)

1. Usar `@/Components/KpiCard/KpiCard`; **no** crear una tarjeta KPI propia.
2. En el padre: `const [tablaExpandida, setTablaExpandida] = useState(false)`.
3. En la fila: `className={`<prefijo>-kpi-row${tablaExpandida ? ' compact' : ''}`}` y `compact={tablaExpandida}` en **todas** las tarjetas.
4. CSS de la fila: `display:grid`, columnas de la pantalla, `gap:16px`, `flex-shrink:0`, y `.<prefijo>-kpi-row.compact{gap:12px;}`. **Nada más**: no re-declarar padding/ícono/tipografía compacta (ya está en `KpiCard.css`).
5. El contenedor de debajo con `flex:1; min-height:0` para que absorba el alto liberado.
6. Botón disparador en la barra de la tabla con las medidas de §5.3 (`aria-pressed`, `aria-label`, íconos `LuMaximize2`/`LuMinimize2`).
7. Probar: ambos estados, modo claro/oscuro, ancho ≤1280px (cambio de columnas) y foco por teclado.

---

## 8. Deuda y puntos de atención

- **Duplicación en Interconsulta**: `Interconsulta.css` (`.ic-kpi-row.compact .pg-kpi-card{...}` líneas ~23–28) re-declara a mano las reglas del compacto que ya viven en `KpiCard.css`. Es redundante y puede divergir; debe quedar solo `.ic-kpi-row.compact{gap:12px;}`.
- **`--fs-sm`**: el código define 13px en `globals.css`; la guía de tipografía del proyecto (AGENTS.md) todavía dice 12px. Esta spec usa el valor del código (13px). Conviene alinear la documentación.
- **Dos mecanismos de disparo** (botón de tabla vs. menú Vista en Cirugía): ambos controlan el mismo booleano hacia `compact`. Si se unifica, el botón de tabla es el patrón más extendido.
- **Alturas (127 / 143 / 50 px)** son estimaciones derivadas de padding + tamaños + line-height; validar con el navegador antes de usarlas como contrato de diseño.
- **Sin persistencia** del estado: si se quiere recordar la preferencia del usuario, definirlo aparte (localStorage por pantalla o preferencia de usuario en backend).
- **HC Cirugía** (`.hcq-kpis`) ya tiene `.hcq-kpis.compact{gap:12px}` en CSS; verificar que su JSX también pase `compact` a las tarjetas.
