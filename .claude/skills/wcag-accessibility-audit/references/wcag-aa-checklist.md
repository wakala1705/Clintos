# Checklist WCAG 2.1 nivel AA — guía de verificación

Referencia para auditar prototipos contra WCAG 2.1 AA. Organizada por las 4 categorías POUR (Perceptible, Operable, Comprensible, Robusto). Para cada criterio: qué verificar, cómo verificarlo según el tipo de input disponible, y el peso de severidad orientativo si falla.

Nota sobre severidad: un fallo de un criterio nivel A suele ser más grave que uno de nivel AA (bloquea el acceso básico, no solo lo dificulta). Usa esto como guía, no como regla absoluta — el contexto del producto importa (ej. en software clínico, un fallo que ralentiza una tarea urgente puede ser crítico aunque el criterio sea "solo" AA).

---

## Perceptible

### 1.1.1 Contenido no textual (A)
Toda imagen, ícono funcional o gráfico con significado debe tener un texto alternativo equivalente.
- Verificar en código: atributo `alt` en `<img>`, `aria-label`/`aria-labelledby` en íconos funcionales (botones solo-ícono, ej. un ícono de "eliminar" sin texto visible).
- Verificar visualmente: identificar íconos que son el único medio de entender una acción (sin tooltip ni texto adyacente).
- Severidad si falla: Alto (bloquea a usuarios de lector de pantalla para entender la acción).

### 1.3.1 Información y relaciones (A)
La estructura y relaciones visuales (agrupaciones, encabezados, tablas, campos de formulario) deben estar codificadas semánticamente, no solo mediante estilos visuales.
- Verificar en código: uso de `<table>` con `<th>` para datos tabulares (no divs estilizados como tabla), jerarquía de encabezados `<h1>-<h6>` real, `<label>` asociado a cada `<input>` (por `for`/`id` o envolviendo el input).
- Verificar visualmente: agrupaciones que dependen solo de espaciado/color para transmitir relación (ej. un badge de estado que visualmente pertenece a una fila pero no está semánticamente asociado).
- Severidad si falla: Alto.

### 1.4.1 Uso del color (A)
El color no debe ser el único medio para transmitir información, indicar una acción o distinguir un elemento.
- Verificar: estados que solo se distinguen por color (ej. badges de "vencido"/"próximo" que dependen únicamente de rojo/ámbar sin ícono o texto), campos de error marcados solo con borde rojo sin texto de error.
- Severidad si falla: Alto (en contextos clínicos, la distinción de estado por solo color es especialmente riesgosa).

### 1.4.3 Contraste (mínimo) (AA)
Texto normal: relación de contraste mínima 4.5:1 contra su fondo. Texto grande (≥18pt o ≥14pt negrita): mínimo 3:1.
- Verificar en código: si hay valores hex/rgb disponibles, calcula la relación de contraste real usando la fórmula de luminancia relativa (L1, L2 → (L1+0.05)/(L2+0.05)). No estimes a ojo si tienes los valores exactos.
- Verificar visualmente: si no hay código, identifica pares texto/fondo que visualmente parecen bajos en contraste (texto gris claro sobre blanco, texto sobre badges de color pastel) y márcalos para verificación con herramienta.
- Severidad si falla: Alto si es texto de lectura habitual; Medio si es texto decorativo o deshabilitado (los elementos deshabilitados están exentos del criterio, pero conviene revisar si realmente están marcados como disabled).

### 1.4.4 Cambio de tamaño de texto (AA)
El texto debe poder ampliarse hasta 200% sin pérdida de contenido o funcionalidad.
- Verificar en código: unidades de tamaño de fuente relativas (`rem`/`em`) vs. fijas (`px`) que puedan romper el layout al hacer zoom; contenedores con `overflow:hidden` que corten texto ampliado.
- Severidad si falla: Medio.

### 1.4.10 Reflow (AA)
El contenido debe adaptarse a un viewport de 320px de ancho sin scroll horizontal ni pérdida de funcionalidad (excepto contenido que requiere layout en 2D, como tablas de datos complejas).
- Verificar en código: anchos fijos en `px` en contenedores principales, `min-width` que fuerza scroll horizontal en pantallas angostas.
- Severidad si falla: Medio-Alto según cuánta funcionalidad se pierde.

### 1.4.11 Contraste de contenido no textual (AA)
Componentes de interfaz (bordes de inputs, íconos funcionales, indicadores de estado) e ilustraciones informativas necesitan mínimo 3:1 de contraste contra su fondo.
- Verificar: bordes de campos de formulario, íconos de acción, indicadores de foco — no solo el texto.
- Severidad si falla: Medio-Alto.

---

## Operable

### 2.1.1 Teclado (A)
Toda la funcionalidad debe estar disponible desde el teclado, sin requerir tiempos específicos de pulsación.
- Verificar en código: elementos interactivos implementados con `<div onclick>` en vez de `<button>`/`<a>` (no reciben foco de teclado ni responden a Enter/Espacio por defecto); presencia de `tabindex` faltante en controles custom.
- Severidad si falla: Crítico — sin acceso por teclado, ciertos usuarios no pueden completar la tarea en absoluto.

### 2.1.2 Sin trampa de teclado (A)
El foco de teclado no debe quedar atrapado en un componente (ej. un modal) sin forma de salir.
- Verificar en código: modales que capturan foco pero no gestionan la tecla Escape ni el retorno de foco al cerrarse.
- Severidad si falla: Crítico.

### 2.4.3 Orden del foco (A)
El orden en que el foco se mueve por teclado (Tab) debe seguir una secuencia lógica y coherente con el orden visual/de lectura.
- Verificar en código: orden del DOM vs. orden visual (ej. un layout con `order` de CSS o posicionamiento absoluto que desalinea el orden de tabulación del orden visual).
- Severidad si falla: Alto.

### 2.4.6 Encabezados y etiquetas (AA)
Los encabezados y etiquetas deben describir el tema o propósito del contenido.
- Verificar: etiquetas de campos de formulario genéricas o ambiguas ("Nombre" sin contexto cuando hay varios campos de nombre en la misma pantalla), encabezados de sección que no describen el contenido real.
- Severidad si falla: Medio.

### 2.4.7 Foco visible (AA)
Cualquier elemento que reciba foco de teclado debe tener un indicador visual claro.
- Verificar en código: reglas CSS que eliminan el outline de foco (`outline:none`) sin un reemplazo visible equivalente.
- Verificar visualmente: si hay captura de estados de foco, confirmar que se distinguen claramente del estado normal/hover.
- Severidad si falla: Alto.

### 2.5.3 Etiqueta en el nombre (A)
Si un control tiene una etiqueta de texto visible, su nombre accesible (para tecnología de asistencia) debe contener ese texto visible.
- Verificar en código: botones donde el `aria-label` no coincide con el texto visible (ej. botón que dice "Guardar" pero tiene `aria-label="Confirmar"`).
- Severidad si falla: Medio.

---

## Comprensible

### 3.1.1 Idioma de la página (A)
El idioma principal del contenido debe estar declarado (`<html lang="es">`).
- Verificar en código: atributo `lang` presente y correcto.
- Severidad si falla: Bajo-Medio (fácil de arreglar, pero afecta pronunciación de lectores de pantalla).

### 3.2.1 Al recibir el foco (A) / 3.2.2 Al recibir entradas (A)
Un elemento no debe disparar un cambio de contexto inesperado (navegación, envío, apertura de modal) solo por recibir foco o cambiar su valor, sin acción explícita del usuario.
- Verificar: selects o inputs que navegan o envían automáticamente al cambiar de valor, sin un botón de confirmación.
- Severidad si falla: Alto (rompe la previsibilidad, especialmente grave para usuarios de lector de pantalla).

### 3.3.1 Identificación de errores (A)
Los errores de un formulario deben identificarse en texto, indicando qué campo falló.
- Verificar: mensajes de error genéricos (ej. un alert nativo sin especificar el campo) vs. mensajes específicos vinculados al campo.
- Severidad si falla: Alto.

### 3.3.2 Etiquetas o instrucciones (A)
Los campos de formulario que requieren un formato específico deben indicarlo (ej. formato de fecha, unidades).
- Verificar: campos numéricos o de fecha sin indicación de formato esperado; campos obligatorios sin marcar como tal.
- Severidad si falla: Medio.

---

## Robusto

### 4.1.2 Nombre, función, valor (A)
Los componentes de interfaz personalizados (custom dropdowns, tabs, modales, tooltips) deben exponer su nombre, rol y estado mediante ARIA cuando no usan elementos HTML nativos.
- Verificar en código: componentes custom (`<div class="dropdown">`, `<div class="tab">`) sin `role`, `aria-expanded`, `aria-selected`, etc.; modales sin `role="dialog"` ni `aria-modal="true"`.
- Severidad si falla: Alto — sin esto, tecnología de asistencia no puede interpretar el componente en absoluto.

### 4.1.3 Mensajes de estado (AA)
Los cambios de estado que no reciben foco (mensajes de confirmación, errores de validación, contadores actualizados) deben anunciarse mediante regiones live (`aria-live`) para que el lector de pantalla los detecte sin que el usuario tenga que buscarlos.
- Verificar en código: toasts, contadores de resultados de búsqueda, mensajes de éxito/error que se insertan en el DOM sin `aria-live="polite"` o `role="status"`/`role="alert"`.
- Severidad si falla: Medio-Alto.

---

## Cómo evaluar según el tipo de input

- **Código HTML/prototipo interactivo disponible**: prioriza los checks de código (semántica, ARIA, foco, contraste calculado con valores exactos) — son verificables con certeza, no estimación.
- **Solo capturas de pantalla**: evalúa lo visualmente detectable (contraste aparente, uso del color como único indicador, tamaños de texto, jerarquía visual) y marca explícitamente qué criterios (teclado, ARIA, foco, orden del DOM) no se pueden verificar sin el código, en vez de asumir que están bien o mal.
- **Descripción en texto**: evalúa lo que la descripción permite inferir (ej. "el modal no tiene botón de cerrar" → 2.1.2) y señala qué queda fuera de alcance sin ver la implementación real.
