---
name: wcag-accessibility-audit
description: Audita prototipos, pantallas o flujos de una aplicación (capturas de pantalla, código HTML/prototipos interactivos, o descripciones en texto) contra los criterios de éxito de WCAG 2.1 nivel AA, detectando problemas de accesibilidad y clasificándolos por severidad. Úsala cuando el usuario pida una "auditoría de accesibilidad", "revisión WCAG", "evaluación de accesibilidad", mencione contraste de color, lectores de pantalla, navegación por teclado, ARIA, o quiera saber si una pantalla o flujo "cumple" o "es accesible" — incluso si no menciona WCAG explícitamente pero pregunta por accesibilidad en general. No es para pedir un solo valor de contraste entre dos colores puntuales (eso se responde directo); es para evaluar pantallas o flujos completos.
---

# Auditoría de accesibilidad WCAG 2.1 AA

Evalúa pantallas o flujos contra los criterios de éxito de WCAG 2.1 nivel AA, con hallazgos organizados por severidad (igual que la auditoría de heurísticas de Nielsen, para mantener consistencia entre ambos reportes).

## Cuándo usar esta skill

- El usuario pide explícitamente una auditoría o revisión de accesibilidad/WCAG.
- El usuario pregunta si una pantalla o flujo "cumple" con accesibilidad, sin nombrar WCAG directamente.
- El usuario menciona específicamente contraste, teclado, lectores de pantalla, ARIA, o foco en el contexto de una pantalla/flujo completo.

Si el usuario solo pide verificar el contraste entre dos colores puntuales (ej. "¿este texto gris sobre este fondo cumple contraste?"), respóndelo directo calculando la relación de contraste — no hace falta activar la auditoría completa.

## Proceso

### 1. Reunir el input y su nivel de verificabilidad

El input puede ser:
- **Código HTML/prototipo interactivo**: el más completo — revísalo (`view` o leyendo el código) para extraer estructura semántica, atributos ARIA, manejo de foco, y valores de color exactos.
- **Capturas de pantalla**: solo permite evaluación visual.
- **Descripción en texto**: permite evaluar lo que la descripción cubre explícitamente.

Identifica desde el inicio qué tan a fondo se puede auditar según el input disponible, y dilo en el reporte — no evalúes como "aprobado" un criterio que en realidad no se pudo verificar (ej. no asumas que el foco funciona bien solo porque no se ve mal en una captura). Distingue explícitamente entre "sin hallazgos" (se verificó y está bien) y "no verificable con este input" (no se pudo evaluar).

### 2. Cargar la referencia WCAG

Antes de evaluar, consulta `references/wcag-aa-checklist.md`. Contiene los criterios de éxito de WCAG 2.1 AA organizados en las 4 categorías POUR (Perceptible, Operable, Comprensible, Robusto), con qué verificar, cómo verificarlo según el tipo de input, y el peso de severidad orientativo de cada uno.

### 3. Evaluar

Recorre el flujo/pantalla completo contra los criterios relevantes de cada categoría POUR, usando la guía de verificación del archivo de referencia.

**Contraste de color**: si tienes valores hex/rgb exactos (del código), calcula la relación de contraste real usando la fórmula de luminancia relativa — no la estimes a ojo. Si solo tienes capturas, señala los pares texto/fondo que visualmente parecen riesgosos y acláralo como una sospecha a verificar con herramienta, no como un hallazgo confirmado.

Para cada problema encontrado:
- Identifica el criterio WCAG específico que falla (ej. "1.4.3 Contraste mínimo") y en qué pantalla/elemento.
- Asigna severidad (Crítico/Alto/Medio/Bajo) según la guía de referencia — ajustada al contexto del producto si aplica (ej. un fallo que ralentiza una tarea urgente puede subir de severidad).
- Da una recomendación concreta y accionable (valor de contraste objetivo, atributo ARIA específico a agregar, etc.), no genérica.

### 4. Formato del reporte

Organiza el output por severidad (Crítico → Alto → Medio → Bajo), consistente con el formato de la auditoría de heurísticas de Nielsen. Formato sugerido por hallazgo:

```
**[Severidad] — [criterio WCAG] — [pantalla/elemento]:** Descripción del problema.
→ Recomendación: [acción concreta]
```

Al inicio del reporte, incluye: qué se evaluó, qué tipo de input se usó (y por tanto qué tan a fondo se pudo verificar — deja explícito qué queda fuera de alcance sin código), y un conteo de hallazgos por severidad.

Si hubo criterios que no se pudieron verificar por el tipo de input (ej. no hay código para revisar manejo de foco), lístalos aparte al final bajo "No verificable con este input" en vez de omitirlos silenciosamente.

### 5. Tono

Directo y específico, sin relleno. No autodescalifiques el input del usuario por no tener código disponible — evalúa lo que sí se puede y sé claro sobre los límites de esa evaluación.
