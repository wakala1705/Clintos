# Las 12 reglas de craft visual

Referencia para revisar UI de alta fidelidad o código de frontend contra patrones que hacen que un diseño se vea genérico, indeciso o "hecho por defecto". Cada regla incluye qué buscar, por qué importa, y valores de reemplazo concretos — no consejos vagos tipo "mejora la jerarquía".

Esta revisión es para **UI terminada o casi terminada** (alta fidelidad, código de producción, componentes). No aplica a wireframes, flujos tempranos, ni conceptos en boceto — ahí el craft visual todavía no es la prioridad.

---

## 1. Sin gradientes

Un gradiente casi siempre es una decisión de color que no se tomó — se usó para evitar elegir un solo tono con intención.

**Buscar:** `background: linear-gradient(...)` o `radial-gradient(...)` usado como relleno de fondo, botones o cards sin una razón funcional clara (ej. simular profundidad, o un degradado de datos real como un heatmap).

**Arreglo concreto:** reemplaza por un color plano bien elegido dentro de la paleta. Si el objetivo era dar "sensación premium" o profundidad, logra eso con sombra de elevación (ver regla 10) o con un tono ligeramente distinto en un elemento vecino, no con degradado.

---

## 2. Sin glow

El énfasis debe venir de tamaño, peso, contraste y espacio — no de resplandor. Las sombras (`box-shadow`) son solo para elevación (indicar que un elemento flota sobre otro), no para llamar la atención.

**Buscar:** `box-shadow` con blur grande y color saturado (ej. `box-shadow: 0 0 24px rgba(0,101,205,.6)`) usado para destacar un botón o card, en vez de para indicar que está "encima" de otra capa.

**Arreglo concreto:** si el objetivo es destacar un CTA, sube su peso tipográfico, tamaño, o usa un color de mayor contraste contra el fondo — no un halo. Reserva `box-shadow` sutil (blur bajo, opacidad baja, sin color saturado) exclusivamente para comunicar elevación real (modales, dropdowns, cards flotantes sobre el fondo).

---

## 3. Nunca "transition: all"

`transition: all` transiciona propiedades que no deberían animarse (como `width` o `height` de forma involuntaria), generando animaciones lentas, imprecisas o con jank.

**Buscar:** `transition: all 0.3s` o similar en cualquier regla CSS.

**Arreglo concreto:** nombra explícitamente las propiedades que deben transicionar y su duración/easing individual. Ejemplo:
```css
/* Mal */
.btn { transition: all .3s; }

/* Bien */
.btn { transition: background-color .15s ease, transform .15s ease; }
```

---

## 4. Elimina la monotonía visual

Cuando todos los elementos tienen el mismo ancho, mismo peso tipográfico, y están todos centrados, el diseño pierde jerarquía — nada le dice al ojo por dónde empezar.

**Buscar:** secciones donde cards, botones o bloques de texto se repiten con exactamente el mismo tratamiento visual (mismo tamaño, mismo peso, misma alineación) sin ninguna variación que indique importancia relativa.

**Arreglo concreto:** aplica el "squint test" — entrecierra los ojos (mentalmente) ante el diseño: ¿algo destaca primero? ¿es lo correcto? Rompe la monotonía variando **uno** de estos ejes de forma intencional: tamaño, peso, alineación, o color — no los cuatro a la vez.

---

## 5. Sin texto placeholder

El microcopy real (etiquetas, mensajes de error, estados vacíos, texto de botones) es parte del diseño, no un detalle de implementación para después. "Lorem ipsum", "Texto de ejemplo", o nombres genéricos ("Usuario 1", "Item") esconden problemas reales de longitud, tono y claridad que solo aparecen con contenido real.

**Buscar:** cualquier placeholder genérico en el diseño o prototipo final — incluyendo estados vacíos sin mensaje real, botones con texto tipo "Botón" o "Acción", mensajes de error genéricos tipo "Ha ocurrido un error".

**Arreglo concreto:** escribe el microcopy real y específico al contexto del producto antes de dar por cerrada la pantalla — incluso si es un borrador, debe ser contenido creíble del dominio real (en tu caso, terminología clínica/hospitalaria real, no genérica).

---

## 6. Contextos de apilamiento contenidos

Un `z-index: 9999` en cualquier parte del código es una señal de que la jerarquía de capas no está controlada — eventualmente algo more importante necesitará estar por encima y no habrá a dónde subir.

**Buscar:** valores de `z-index` altos y arbitrarios (`999`, `9999`, `99999`), múltiples componentes compitiendo por el mismo rango de z-index sin una escala clara.

**Arreglo concreto:** usa `isolation: isolate` en cada componente que forme su propia capa (modales, dropdowns, tooltips), y define una escala pequeña y documentada de z-index (ej. `--z-dropdown: 10; --z-modal: 100; --z-toast: 1000;`) en vez de números arbitrarios.

---

## 7. Nunca negro puro ni blanco puro

`#000000` sobre `#FFFFFF` genera un contraste tan alto que resulta agresivo a la vista, especialmente en bloques grandes de texto. Las interfaces con más craft usan rampas de neutros ligeramente tintados.

**Buscar:** `color: #000` o `#000000`, `background: #fff` o `#ffffff` usado directamente para texto y fondos principales.

**Arreglo concreto:** define una rampa de neutros con un ligero tinte (frío o cálido, según la marca) para texto, fondos y bordes — ej. en vez de `#000000` para texto principal, usa algo como `#101827`; en vez de `#FFFFFF` puro para fondo, un blanco ligeramente cálido o frío como `#FAFAFA` o `#F8F9FB`, reservando el blanco puro solo para superficies elevadas específicas si es necesario.

---

## 8. Espaciado en una escala

Los espacios entre elementos deben seguir una escala consistente (típicamente múltiplos de 4 u 8px), y el espacio *dentro* de un grupo de elementos relacionados debe ser menor que el espacio *entre* grupos distintos — eso es lo que comunica agrupación visual sin necesidad de bordes.

**Buscar:** valores de padding/margin arbitrarios (`13px`, `22px`, `7px`) que no siguen ninguna escala; espacios entre elementos relacionados iguales o mayores que los espacios entre secciones distintas.

**Arreglo concreto:** define una escala de espaciado (ej. 4, 8, 12, 16, 24, 32, 48, 64px) y úsala consistentemente. Verifica que el gap dentro de un grupo (ej. entre un ícono y su label) sea visiblemente menor que el gap entre ese grupo y el siguiente elemento no relacionado.

---

## 9. La tipografía hace el trabajo

La jerarquía visual debe venir principalmente de peso y color tipográfico dentro de una escala pequeña de tamaños — no de tener 8 tamaños de fuente distintos en la misma pantalla. El texto de cuerpo debe tener un ancho de línea (measure) controlado para que siga siendo legible.

**Buscar:** más de 4-5 tamaños de fuente distintos en una misma pantalla; bloques de texto de cuerpo que se extienden a todo el ancho de un contenedor grande (líneas demasiado largas, difíciles de seguir).

**Arreglo concreto:** define una escala tipográfica pequeña (ej. 12/14/16/20/24/32px) y logra jerarquía combinando tamaño con peso (400/500/600/700) y color (texto primario vs. secundario), no solo agregando más tamaños. Limita el ancho de los bloques de texto de cuerpo a ~60-80 caracteres por línea (`max-width` en unidades `ch` o equivalentes).

---

## 10. Un solo lenguaje de elevación

Mezclar bordes y sombras para comunicar el mismo tipo de jerarquía visual genera ruido — elige uno: bordes para estructura (separar secciones en el mismo plano) o sombras para elementos flotantes (que están literalmente sobre otra capa), pero no ambos apilados en el mismo componente.

**Buscar:** cards o secciones con `border` **y** `box-shadow` aplicados simultáneamente sin que exista una razón de capas real (el elemento no está realmente "flotando" sobre otro).

**Arreglo concreto:** decide por componente si pertenece al plano base (usa borde) o está genuinamente elevado sobre otro contenido (usa sombra) — y aplica solo el lenguaje correspondiente, no los dos.

---

## 11. Cada estado diseñado

Un componente interactivo no está terminado si solo se diseñó su estado "normal". Cada control necesita: hover, focus-visible, active, disabled, loading, empty y error (los que apliquen según el tipo de componente).

**Buscar:** botones, inputs o filas de tabla que en el código/prototipo solo tienen estilos para el estado por defecto, sin `:hover`, `:focus-visible`, `:disabled`, ni manejo visual de estado de carga o vacío.

**Arreglo concreto:** para cada componente interactivo, define explícitamente los 7 estados relevantes antes de darlo por terminado. Esto es exactamente lo que ya se señaló como hallazgo en auditorías anteriores de Clintos (ej. foco visible ausente en componentes personalizados) — trátalo como checklist de cierre, no como pulido opcional.

---

## 12. El movimiento obedece física

Las animaciones deben sentirse naturales: duración corta (120-250ms), y animar solo `transform` y `opacity` (las propiedades más baratas de renderizar, sin causar reflow). Además, debe respetarse la preferencia del sistema operativo de reducir movimiento.

**Buscar:** transiciones o animaciones de más de 300-400ms para micro-interacciones; animación de propiedades costosas como `width`, `height`, `top`, `left` en vez de `transform`; ausencia de `@media (prefers-reduced-motion: reduce)`.

**Arreglo concreto:**
```css
.card { transition: transform .15s ease, opacity .15s ease; }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## Cómo reportar

Reporta **solo las violaciones encontradas**, no las 12 reglas completas si no aplican todas. Para cada violación: qué regla se rompe, dónde (elemento/selector específico), y el valor de reemplazo concreto — no una sugerencia vaga. Si el código no está disponible (solo capturas), evalúa lo visualmente detectable (reglas 1, 2, 4, 5, 7, 8, 9, 10) y marca explícitamente cuáles no se pueden verificar sin el código (reglas 3, 6, 11 parcialmente, 12).
