# Documentación funcional — Clintos

## Acceso - Pantalla de ingreso (estado de carga al iniciar sesión)

**Propósito:** cubrir el tiempo que el sistema tarda en cargar el home después del login. Hoy, al elegir el área funcional, el backend tarda entre 3 y 4 segundos en dejar listo el home y el usuario veía el login congelado, sin saber si algo estaba pasando. La **pantalla de ingreso** le confirma que su sesión fue aceptada ("Hola, Camilo"), le dice dónde va a quedar parado (área funcional y sede) y le muestra que el sistema está cargando.

**Dónde vive:** no es una ruta. Es una pantalla a pantalla completa que se monta **encima del login** (`/Login`) cuando el usuario termina de autenticarse y se desmonta sola cuando el home está listo. Código de referencia: `src/Components/Login/PantallaIngreso/` (presentación) y `src/Components/Login/login.jsx` (lógica de tiempos y navegación).

**Alcance:** escritorio (diseño centrado, probado a 1440×900). Teléfono no está en alcance todavía, igual que el resto del login.

---

### Regla principal: tiempo mínimo de 4 segundos

La pantalla se muestra **como mínimo 4 segundos, aunque el backend responda en 300 ms**. El motivo es doble: que el saludo y el contexto alcancen a leerse, y evitar un parpadeo (pantalla que aparece y desaparece al instante).

La navegación al home ocurre cuando se cumplen **las dos condiciones a la vez**:

1. pasaron al menos 4 000 ms desde que apareció la pantalla, **y**
2. la carga inicial del backend terminó.

Lo que ocurra más tarde manda:

| Escenario | Tiempo que se ve la pantalla |
|---|---|
| Backend responde en 300 ms | **4 s** (se espera el mínimo) |
| Backend responde en 3 s | **4 s** (el backend llegó antes del mínimo) |
| Backend responde en 6 s | **6 s** (se espera al backend) |
| Backend falla (a cualquier segundo) | Se sale de inmediato, sin esperar el mínimo: vuelve al login con un mensaje de error |

Tras iniciar la navegación, la pantalla **sigue visible hasta que la ruta del home esté lista** (no se tapa el login y se deja ver la transición). El tiempo real puede sumar un poco más por el render del home.

La implementación de referencia es esta (en `login.jsx`):

```js
const INGRESO_MIN_MS = 4000;
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Punto de enganche del backend: devolver acá la promesa real.
const cargarDatosIniciales = () => Promise.resolve();

const iniciarIngreso = async () => {
  setStep('ingresando');                       // monta la pantalla
  try {
    await Promise.all([esperar(INGRESO_MIN_MS), cargarDatosIniciales()]);
    startTransition(() => router.push(route)); // la pantalla sigue hasta que el home esté listo
  } catch {
    setStep('login');
    setError('No pudimos cargar tu sesión. Intenta de nuevo.');
  }
};
```

`Promise.all` rechaza apenas una de las dos promesas falla, por eso un error del backend no espera los 4 segundos.

---

### Cuándo se dispara

| Módulo elegido | Flujo |
|---|---|
| Asistencial HIS | Login → picker de área funcional → el usuario elige el área y pulsa "Seleccionar" → **pantalla de ingreso** → home |
| Contable | Login (botón con spinner 1,2 s) → **pantalla de ingreso** (sin fila de área) → home |
| Administrador | Igual que Contable |

Al elegir el área se cierra el picker, se guarda el área funcional seleccionada y se monta la pantalla en el mismo instante.

---

### Contenido de la pantalla

De arriba hacia abajo, centrado en el viewport, ancho máximo del contenido **480 px**:

1. **Check de éxito:** círculo verde de 72 px con un check blanco de 36 px, dentro de un halo verde claro de 112 px.
2. **Saludo:** "Hola, {nombre}" en `--fs-4xl` / `--fw-semibold`.
3. **Rol:** `Badge` con `tone="info"` (azul claro).
4. **Tarjeta "Iniciando en":** etiqueta "INICIANDO EN" en mayúsculas (`--fs-xs`), ícono de ubicación azul, **área funcional** como título (`--fs-lg` / `--fw-semibold`) y **sede** como subtítulo (`--fs-base`).
5. **Progreso:** texto "Redirigiendo automáticamente…" con spinner, y una barra de 4 px debajo.

**Datos que recibe el componente** (props de `PantallaIngreso`):

| Prop | Qué es | De dónde sale hoy |
|---|---|---|
| `nombre` | Nombre de pila del usuario | Primera palabra del campo "Nombre" del login, con la primera letra en mayúscula (`camilo` → `Camilo`) |
| `rol` | Texto del badge | Etiqueta del módulo elegido: "Asistencial HIS", "Contable" o "Administrador" |
| `area` | Área funcional | Descripción del área elegida en el picker, en minúsculas (el CSS la muestra con la primera letra de cada palabra en mayúscula: `URGENCIAS` → "Urgencias"). **Vacía** en Contable y Administrador: la tarjeta muestra solo la sede, como título |
| `sede` | Sede | `Sede 1` o `Sede 2` según el selector del login. Si no coincide, "Sede 1" |

> Con backend, `nombre`, `rol` y `sede` deberían venir de la respuesta de autenticación (nombre real del usuario, rol real, nombre de la sede), no del formulario.

---

### Animaciones

| Elemento | Animación | Duración |
|---|---|---|
| Pantalla completa | Aparece con fundido (`opacity` 0 → 1) | 0,25 s |
| Círculo del check | Aparece con un pequeño "pop" (escala .8 → 1 con leve rebote) | 0,45 s |
| Spinner | Giro continuo | 0,8 s por vuelta, en bucle |
| Barra de progreso | Avanza de 0 a 92 % de ancho con curva de frenado | 4 s |

**La barra de progreso no es un porcentaje real.** No sabemos cuánto tarda el backend, así que no se muestra un avance falso proporcional: avanza rápido al principio y se frena en 92 %, quedándose ahí si el backend tarda más de 4 s. La duración de la barra (4 s) coincide con el mínimo, así que en el caso normal termina de llenarse justo cuando se navega.

**Movimiento reducido:** con `prefers-reduced-motion: reduce` se quitan el fundido y el "pop", el spinner pasa a 2 s por vuelta y la barra a 8 s.

---

### Estados y errores

| Situación | Qué pasa |
|---|---|
| Normal | Pantalla visible ≥ 4 s, luego navegación al home |
| Backend lento (> 4 s) | La pantalla se mantiene; la barra queda en 92 % y el spinner sigue girando |
| Backend falla | Vuelve al login (paso "Inicio de sesión") con el mensaje **"No pudimos cargar tu sesión. Intenta de nuevo."** |

La pantalla **no tiene botones**: el usuario no puede cancelar ni retroceder mientras carga.

---

### Accesibilidad

- El contenedor tiene `role="status"` y `aria-live="polite"`, para que un lector de pantalla anuncie "Hola, Camilo … Iniciando en … Redirigiendo automáticamente…".
- El halo, el check y la barra son decorativos (`aria-hidden="true"`); la información está en el texto.
- Contraste: texto principal `#101827` sobre `#f7f9fd`; texto secundario `#48546e`.

---

### Estilos y tokens

- Overlay: `position: fixed; inset: 0; z-index: 1000`, fondo `#f7f9fd`.
- Tipografía y pesos: solo tokens del proyecto (`--fs-*`, `--fw-*`), sin tamaños sueltos.
- Colores de la pantalla (locales, no son tokens): verde del check `#1f9d55`, halo `#d9ece3`, azul `#0065cd`, tarjeta con fondo `#fff` y borde `#e5e8ef`, radio 12 px, pista de la barra `#e5e8ef`.
- Dependencia de tokens: el `Badge` con `tone="info"` necesita `--status-info-bg` y `--status-info-fg` en el `:root` de la feature. Login los declara en `login.module.css` (`#dbe8fe` / `#0050a3`).
- Íconos: Lucide vía `react-icons/lu` (`LuCheck`, `LuMapPin`, `LuLoaderCircle`).

---

### Cómo conectar el backend real

Hoy no hay llamado real: `cargarDatosIniciales()` devuelve `Promise.resolve()`, así que la pantalla dura exactamente los 4 s. Para conectarlo:

1. Reemplazar `cargarDatosIniciales` por la llamada (o llamadas) que dejan el home listo, devolviendo **una promesa que rechace si falla**.
2. No tocar `INGRESO_MIN_MS`: el mínimo de 4 s ya se combina solo con la promesa.
3. Si la respuesta trae nombre, rol y sede del usuario, pasarlos a `PantallaIngreso` en lugar de los valores del formulario.

---

### Límites conocidos

- **Atrás del navegador:** si el usuario pulsa "Atrás" mientras la pantalla está visible, no se cancela la carga (no hay manejo especial).
- **Sin foco atrapado:** la pantalla no gestiona el foco del teclado; el login queda montado de fondo.
- **Sede y rol salen del formulario**, no de una sesión real (hay un mock).
- **Sin botón "Reintentar":** ante un error se vuelve al login y el usuario vuelve a iniciar sesión.
- **Teléfono:** no hay adaptación móvil; el diseño es de escritorio.
- **Colores locales:** los colores de la pantalla son valores fijos, no tokens, y no tienen variante de tema oscuro.

---

## Prompt para crear el front de esta pantalla

Copiar y pegar a quien implemente el front:

````text
Implementá la "pantalla de ingreso": una pantalla de carga a pantalla completa
(escritorio) que se muestra después del login y antes del home, mientras el
backend prepara la sesión.

CONTEXTO
Tras autenticarse (y, en el módulo Asistencial, elegir el área funcional) el
backend tarda ~3-4 s en dejar listo el home. Hoy el usuario ve el login
congelado. Esta pantalla confirma que el ingreso fue exitoso, muestra dónde va
a quedar parado y comunica que se está cargando.

NO ES UNA RUTA
Es un overlay (position: fixed; inset: 0; z-index: 1000; fondo #f7f9fd) que se
monta encima del login y se desmonta solo cuando el home está listo.

REGLA DE TIEMPO (lo más importante)
- Tiempo mínimo visible: 4000 ms, aunque el backend responda en 300 ms.
  (Que se lea el saludo y no haya parpadeo.)
- Navegar al home cuando se cumplan las dos cosas: pasaron 4000 ms Y terminó
  la carga del backend. Manda lo que ocurra más tarde:
    backend 300 ms -> 4 s | backend 3 s -> 4 s | backend 6 s -> 6 s
- Implementación: Promise.all([esperar(4000), cargarDatosIniciales()]) y luego
  navegar. En React/Next, navegar dentro de startTransition para que la
  pantalla siga visible hasta que la ruta nueva esté lista.
- Si la carga falla: salir de inmediato (sin esperar los 4 s), volver al paso
  "Inicio de sesión" y mostrar "No pudimos cargar tu sesión. Intenta de nuevo."
  (Promise.all ya rechaza apenas una promesa falla.)
- La pantalla no tiene botones: no se puede cancelar.

CUÁNDO SE DISPARA
- Asistencial: al pulsar "Seleccionar" en el picker de área funcional.
- Contable / Administrador (no piden área): al terminar el login. En estos
  casos se omite el área y la tarjeta muestra solo la sede.

CONTENIDO (de arriba hacia abajo, centrado, ancho máx. 480 px)
1. Check de éxito: círculo verde #1f9d55 de 72 px con check blanco de 36 px,
   dentro de un halo #d9ece3 de 112 px. Margen inferior 28 px.
2. Título "Hola, {nombre}": --fs-4xl (28 px), --fw-semibold, color #101827.
3. Badge de rol (tone="info": fondo #dbe8fe, texto #0050a3).
4. Tarjeta "Iniciando en" (margen superior 40 px; fondo #fff; borde 1 px
   #e5e8ef; radio 12 px; padding 16x20; alineada a la izquierda):
   - "INICIANDO EN": --fs-xs, --fw-medium, mayúsculas, letter-spacing .04em,
     color #6b7280.
   - Fila con ícono de ubicación (LuMapPin, 20 px, #0065cd) + área funcional
     (--fs-lg, --fw-semibold, #101827, capitalizada) + debajo la sede
     (--fs-base, #48546e). Sin área: la sede pasa a ser el título.
5. Bloque de progreso (margen superior 40 px):
   - Texto "Redirigiendo automáticamente…" (--fs-base, #48546e) + spinner
     (LuLoaderCircle 16 px, #0065cd) al lado.
   - Barra: pista de 4 px #e5e8ef, relleno #0065cd con bordes redondeados.

DATOS
- nombre: nombre de pila del usuario, primera letra en mayúscula.
- rol: "Asistencial HIS" | "Contable" | "Administrador".
- area: descripción del área funcional (opcional).
- sede: nombre de la sede.
Idealmente vienen de la respuesta de autenticación.

ANIMACIONES
- Pantalla: fundido 0,25 s.
- Círculo del check: "pop" (scale .8 -> 1 con rebote, cubic-bezier(.2,.9,.3,1.2))
  0,45 s.
- Spinner: giro lineal 0,8 s en bucle.
- Barra: 0 -> 92 % de ancho en 4 s con cubic-bezier(.1,.7,.2,1). NO es un
  porcentaje real (no sabemos cuánto tarda el backend): se frena en 92 % y se
  queda ahí si el backend tarda más.
- prefers-reduced-motion: sin fundido ni "pop"; spinner 2 s por vuelta;
  barra 8 s.

ACCESIBILIDAD
- Contenedor con role="status" y aria-live="polite".
- Halo, check y barra decorativos: aria-hidden="true".

REGLAS DEL PROYECTO
- Íconos de Lucide (react-icons/lu), nunca SVG a mano.
- Tipografía solo con tokens --fs-* / --fw-* (sin px sueltos ni pesos
  numéricos). Familia: system-ui stack del proyecto.
- Un componente = una carpeta con su .jsx y su .css
  (src/Components/Login/PantallaIngreso/).
- Badge desde @/Components/Badge/Badge; requiere --status-info-bg y
  --status-info-fg declarados en el :root de la feature.

CRITERIOS DE ACEPTACIÓN
- Con backend de 300 ms la pantalla se ve 4 s, no menos.
- Con backend de 6 s se ve 6 s y la barra queda en 92 %.
- Con backend en error vuelve al login con el mensaje, sin esperar 4 s.
- Sin errores de consola; funciona a 1440x900.
````
