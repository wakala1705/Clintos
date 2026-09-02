# Historial Quirúrgico del Paciente — V1

Fecha: 2026-09-02

## Contexto

Rediseño de una pantalla clínica de escritorio que hoy solo existe fuera de
este repo (encargo con spec funcional detallado, sin mockup HTML). Es
**exclusivamente de consulta**: ver qué cirugías tuvo un paciente, cuándo,
qué procedimiento(s), y los recursos asociados a cada procedimiento
(insumos, farmacia, personal clínico, equipos). No programa, no crea, no
edita — cero superficie de mutación.

Modelo conceptual (jerarquía fija de navegación):

```
Paciente → Intervenciones → Intervención seleccionada → Procedimientos
  → Procedimiento seleccionado → { Insumos | Farmacia | Personal | Equipos }
```

Todo ocurre en una sola pantalla con scroll vertical — sin modales para ver
detalle, sin navegar a otra ruta al seleccionar intervención/procedimiento.

**Punto de entrada** (encargo explícito, conecta con el ícono de búsqueda
agregado a `ProgramacionSalaCirugias.jsx`): el botón `icon-btn-circle`
"Buscar" del header de Programación de Sala de Cirugías (hoy dispara un
toast placeholder "Búsqueda de cirugías en desarrollo.") pasa a abrir un
modal nuevo de búsqueda de paciente; al confirmar una selección, navega a
esta pantalla.

Decisiones ya validadas con el usuario (brainstorming previo):
- No existe un buscador de paciente genérico en el proyecto — cada feature
  arma el suyo (ver `BuscarPacienteModal` de Gestión de Camas, específico
  de admisiones). Se construye uno nuevo, propio de esta feature.
- Los datos clínicos del historial (intervenciones/procedimientos/
  insumos/farmacia/personal/equipos) son **siempre el mismo dataset fijo
  de demo** (paciente Berrocal Payares), sin importar qué paciente se
  busque/seleccione en el modal — no se construye historial quirúrgico
  real por cada uno de los ~46 pacientes mock de `mockPatientsData.js`.
  Limitación de datos de prototipo, conocida y aceptada.
- Sin botón "Volver" explícito — navegación resuelta por el breadcrumb del
  Topbar únicamente.

## Alcance

**Sí, en V1:**
- Modal de búsqueda de paciente (nuevo) disparado desde el ícono de lupa
  de Programación de Sala de Cirugías.
- Ruta `/historial-quirurgico/[id]` con cabecera de paciente compacta.
- Tabla de intervenciones quirúrgicas (maestro), seleccionable.
- Resumen de la intervención seleccionada.
- Lista de procedimientos de la intervención seleccionada, seleccionable.
- Detalle del procedimiento seleccionado en 4 tabs: Insumos, Farmacia,
  Personal clínico, Equipos.
- Estados vacíos para cada nivel sin datos (procedimientos/insumos/
  farmacia/personal/equipos).
- Responsive tablet (`--bp-tablet`/`--bp-desktop`).

**No en V1** (fuera de alcance, pantalla puramente de consulta):
- Cualquier acción de crear/editar/eliminar/cancelar/reprogramar.
- Botón "Finalizar" o cualquier CTA de cierre de proceso.
- Historial quirúrgico real por paciente (dataset único fijo, ver Contexto).
- Paginación en el modal de búsqueda (46 registros caben con scroll interno
  de la lista, mismo criterio que `BuscarPacienteModal` de Gestión de
  Camas).

## Modelo de datos (mock)

Archivo nuevo `src/hooks/HistorialQuirurgico/mockHistorialQuirurgico.js`,
estructura anidada estática (no period-keyed, no hay agenda — es historial
fijo):

```js
export const PACIENTE_DEMO = {
  nombre: 'Berrocal Payares Yuri del Carmen',
  idAfiliado: '55222523',
};

export const INTERVENCIONES = [
  {
    id: 'cirugia-0200018616',
    codigoCirugia: '0200018616',
    fecha: '2023-10-25',       // 'YYYY-MM-DD'
    horaInicio: '14:15',
    procedimientoPrincipal: '...',   // nombre a mostrar en Resumen
    medico: 'Lorena Cecilia Arrieta Yanez',
    sala: '01',
    quirofano: '#1',
    estado: 'realizada',       // único estado de V1, deja lugar a futuros
    procedimientos: [
      {
        id: 'proc-1',
        nombre: 'Exploración y descompresión del canal raquídeo',
        codigo: '030208C',
        insumos: [{ nombre, cantidad, unidad, codigo }],
        farmacia: [{ medicamento, cantidad, unidad, estado }], // [] posible
        personal: [{ nombre, rol, tipoProfesional }],
        equipos: [{ nombre, tipo, identificacion }],
      },
      // una intervención puede tener 1+ procedimientos
    ],
  },
  // 3 intervenciones sembradas (25 oct 2023, 21 nov 2023 x2), datos del
  // encargo — insumos/personal/equipos/farmacia ficticios adicionales para
  // completar las 3, no solo la primera.
];
```

Nombre de campo `procedimientoPrincipal` reutiliza la misma convención que
`mockCirugiaData.js` (Programación de Sala de Cirugías) para no introducir
un vocabulario paralelo dentro del dominio "cirugía" del proyecto.

**Dataset del modal de búsqueda**: reusa `PATIENTS` de
`src/hooks/ListaPacientes/mockPatientsData.js` tal cual (sin modificarlo) —
es un array ya existente de ~46 pacientes con
`{ id, nombre, documento, fechaNacimiento, sexo, eps, estado, sede }`.

## Flujo de entrada — modal de búsqueda

**`src/Components/ProgramacionSalaCirugias/modals/BuscarPacienteModal/BuscarPacienteModal.jsx`**
(vive junto a los demás catálogos de esa feature, porque el botón que lo
abre vive ahí):

- Mismo patrón visual que `CatalogoMedicosModal`/`CatalogoAseguradorasModal`:
  `ModalHeader` (título "Buscar paciente") + input de búsqueda con
  `LuSearch` (filtra en vivo por nombre o documento, normalizando tildes
  igual que esos catálogos) + tabla (`Nombre`, `Documento`, `Edad`
  derivada de `fechaNacimiento`, `EPS`) + fila seleccionable (click resalta,
  doble click o botón "Confirmar" del footer selecciona) + footer
  Cancelar/Confirmar.
- Sin paginación — lista con scroll interno (`max-height` + overflow),
  46 registros.
- Props: `{ onSelect, onClose }`. `onSelect(paciente)` se llama al
  confirmar con el registro completo de `PATIENTS`.

**Cambios en `ProgramacionSalaCirugias.jsx`**:
- Nuevo estado local `buscandoPaciente` (bool).
- El botón `icon-btn-circle` "Buscar" (hoy dispara el toast placeholder)
  pasa a `onClick={() => setBuscandoPaciente(true)}`.
- `{buscandoPaciente && <BuscarPacienteModal onClose={...} onSelect={handleSeleccionarPacienteHistorial} />}`.
- `handleSeleccionarPacienteHistorial(paciente)`: cierra el modal y
  `router.push(`/historial-quirurgico/${paciente.id}`)` (`useRouter` de
  `next/navigation`, mismo patrón que `ListaPacientes.jsx:148-150`).

## Layout general — `HistorialQuirurgico.jsx`

Ruta `src/app/historial-quirurgico/[id]/page.jsx` (delgada, recibe `id` de
`params` y lo pasa como prop — no se usa para resolver datos clínicos, solo
queda disponible para una futura conexión real) →
`src/Components/HistorialQuirurgico/HistorialQuirurgico.jsx`:

```
.app → Sidebar + .main → Topbar (breadcrumb: Hospitalización / Historial quirúrgico)
  .content
   ├─ PacienteHeader
   ├─ section "Intervenciones quirúrgicas" → IntervencionesTable
   ├─ section "Detalle de la intervención" → IntervencionResumen
   ├─ section "Procedimientos realizados" → ProcedimientosList
   └─ section "Detalle del procedimiento" → ProcedimientoDetalle (tabs)
```

Una sola columna, apilado verticalmente, cada sección una card discreta
(`.hq-card`: borde sutil + padding generoso, sin bloques de color grandes).

Estado en `HistorialQuirurgico.jsx`:
- `selectedIntervencionId` — default: primera intervención del array.
- `selectedProcedimientoId` — default: primer procedimiento de la
  intervención seleccionada. Al cambiar `selectedIntervencionId`, se
  resetea al primer procedimiento de la nueva intervención **sin
  `useEffect`** — mismo patrón "ajustar estado durante el render" que ya
  usa `DetalleCirugiaPanel.jsx:62-66` (compara contra el id anterior
  guardado en estado, evita el warning de React sobre `set-state-in-effect`).
- `activeTab` — default `'insumos'`. Se resetea a `'insumos'` con el mismo
  mecanismo cuando cambia `selectedProcedimientoId`.

## `PacienteHeader/PacienteHeader.jsx`

Header dedicado y minimal — **no reusa `PatientBanner`** (ese componente
trae chips de EDAD/SEXO/EPS/alergias pensados para atención clínica en
vivo compartida entre Asignación de Citas y Gestión de Enfermería, mucho
más pesado que lo que pide este spec; forzar su reuso aquí violaría el
pedido explícito de "cabecera limpia y compacta", "no mostrar como
formulario antiguo").

Estructura, mismo patrón tipográfico que `.psc-page-header` (h1 + p, ver
`ProgramacionSalaCirugias.css:121-126`):

```jsx
<div className="hq-header">
  <div className="hq-header-patient">{paciente.nombre}</div>
  <div className="hq-header-affiliate">ID de afiliado: {paciente.idAfiliado}</div>
  <h1>Historial quirúrgico</h1>
  <p>{intervenciones.length} intervenciones</p>
</div>
```

`paciente` = `PACIENTE_DEMO` fijo (ver Contexto — el `id` de ruta no se usa
para resolver esto en V1).

## `IntervencionesTable/IntervencionesTable.jsx`

Tabla de solo lectura, fila seleccionable — mismo patrón que
`AdmisionesTable` (`aria-selected`, `tabIndex={0}`, `onClick`/`onKeyDown`
Enter/Espacio, clase `.selected` con borde+fondo+peso de fuente):

- Columnas: **Fecha** (`25 oct 2023 · 14:15`, formateada), **Cirugía**
  (código, ej. `Cirugía 0200018616` — texto regular, no dominante),
  **Médico**, **Estado** (badge ícono+texto, único valor `Realizada` en V1,
  tono verde reusando `--green`/`--green-bg`, mismo criterio de tokens que
  `EstadoCirugiaBadge` de Programación de Sala de Cirugías — sin inventar
  un color nuevo).
- Doble render tabla-desktop + cards-mobile del mismo dataset (CSS decide
  cuál mostrar bajo `--bp-tablet`), mismo criterio que `PatientsTable`/
  `AdmisionesTable`.
- Fila activa = `selectedIntervencionId`.

## `IntervencionResumen/IntervencionResumen.jsx`

Bloque de solo lectura, sin tabla — la intervención seleccionada como
texto jerárquico:

```
{procedimientoPrincipal}          ← título, --fs-lg/--fw-semibold
{fecha} · {horaInicio}
Médico: {medico}   Sala: {sala}   Quirófano: {quirofano}   Estado: {badge}
```

## `ProcedimientosList/ProcedimientosList.jsx`

Lista seleccionable de `intervencionSeleccionada.procedimientos` — filas
tipo card compacta (nombre + código secundario), mismo patrón `.active`
que el resto del proyecto para el ítem seleccionado. Si `procedimientos`
tiene un solo elemento, igual se muestra (seleccionado por defecto, sin
necesidad de interacción) para mantener la jerarquía visual explícita.
Vacío → mensaje "No hay procedimientos registrados para esta intervención."
(empty state estándar del proyecto, ícono en círculo + título, ver
`AdmisionesEmptyState`).

## `ProcedimientoDetalle/ProcedimientoDetalle.jsx`

Shell de tabs, mismo patrón ARIA que `dcp-tabs-bar`
(`DetalleCirugiaPanel.jsx:79-87,133-148`): `role="tablist"`, roving
tabindex, flechas ←/→ para moverse entre tabs.

```js
const TABS = [
  { id: 'insumos', label: 'Insumos' },
  { id: 'farmacia', label: 'Farmacia' },
  { id: 'personal', label: 'Personal clínico' },
  { id: 'equipos', label: 'Equipos' },
];
```

Subcomponentes en `ProcedimientoDetalle/tabs/`, cada uno una tabla simple
de solo lectura (sin botones de agregar/editar/eliminar) + su empty state:

- **`InsumosTab`** — columnas Insumo / Cantidad (código como info
  secundaria opcional). Vacío: "No hay insumos registrados."
- **`FarmaciaTab`** — columnas Medicamento/producto / Cantidad / Unidad /
  Estado. Vacío: "No hay pedidos a farmacia registrados para este
  procedimiento."
- **`PersonalTab`** — columnas Nombre / Rol / Tipo de profesional. Vacío:
  "No hay personal clínico registrado."
- **`EquiposTab`** — columnas Equipo / Tipo / Identificación. Vacío: "No
  hay equipos registrados."

## Qué NO lleva (verificación negativa explícita)

Sin: botón "+", botón "-", ícono de papelera, "Agregar procedimiento",
"Eliminar procedimiento", "Cancelar programación", cualquier acción de
edición/programación, botón "Finalizar", botón "Volver" explícito, modales
para ver detalle.

## Responsive

Por debajo de `--bp-tablet`/`--bp-desktop` (768/1024, tokens ya definidos
en `globals.css`): `IntervencionesTable` y las 4 tablas de
`ProcedimientoDetalle/tabs` ganan `overflow-x:auto` en su contenedor en vez
de comprimir columnas — nunca scroll horizontal en `body` (regla general
del proyecto). El resto de la jerarquía (header → intervenciones → resumen
→ procedimientos → detalle) se mantiene apilada igual que en desktop, no
hay reflow a 2 columnas en ningún breakpoint (pedido explícito: "mantener
la jerarquía").

## Estructura de archivos

```
src/app/historial-quirurgico/[id]/page.jsx
src/Components/HistorialQuirurgico/
  HistorialQuirurgico.jsx / .css
  PacienteHeader/PacienteHeader.jsx / .css
  IntervencionesTable/IntervencionesTable.jsx / .css
  IntervencionResumen/IntervencionResumen.jsx / .css
  ProcedimientosList/ProcedimientosList.jsx / .css
  ProcedimientoDetalle/
    ProcedimientoDetalle.jsx / .css
    tabs/
      InsumosTab/InsumosTab.jsx / .css
      FarmaciaTab/FarmaciaTab.jsx / .css
      PersonalTab/PersonalTab.jsx / .css
      EquiposTab/EquiposTab.jsx / .css
  shared/shared.css   (empty-state genérico + reglas de tabla reusadas por los 4 tabs)
src/hooks/HistorialQuirurgico/mockHistorialQuirurgico.js

# Modificados:
src/Components/ProgramacionSalaCirugias/ProgramacionSalaCirugias.jsx   (botón lupa abre BuscarPacienteModal)
src/Components/ProgramacionSalaCirugias/modals/BuscarPacienteModal/BuscarPacienteModal.jsx / .css   (nuevo)
```

## Testing

Sin suite automatizada en este proyecto — verificación manual con el
servidor de desarrollo (Playwright headless vía `chromium-cli`/script
puntual, mismo criterio ya usado en esta sesión):

1. Desde Programación de Sala de Cirugías, click en la lupa → abre
   `BuscarPacienteModal` (no más el toast placeholder).
2. Buscar por nombre/documento filtra la lista en vivo; seleccionar un
   paciente y confirmar navega a `/historial-quirurgico/{id}`.
3. La pantalla carga con la cabecera del paciente demo, 3 intervenciones
   en la tabla, la primera seleccionada por defecto.
4. Seleccionar otra intervención actualiza el resumen y la lista de
   procedimientos (con el primer procedimiento ya seleccionado).
5. Seleccionar otro procedimiento actualiza las 4 tabs; cambiar de tab
   conserva el procedimiento seleccionado.
6. Verificar que no existe ningún botón de crear/editar/eliminar/
   Finalizar/Volver en toda la pantalla.
7. Redimensionar a ancho tablet (768–1024px): las tablas anchas activan
   scroll horizontal interno, sin overflow de `body`.
