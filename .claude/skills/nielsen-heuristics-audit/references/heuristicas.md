# Las 10 heurísticas de usabilidad de Jakob Nielsen

Referencia completa para evaluar interfaces. Para cada heurística: definición, preguntas guía para detectar violaciones, y ejemplos típicos de problemas.

## 1. Visibilidad del estado del sistema
El sistema debe mantener siempre informado al usuario sobre lo que está pasando, con retroalimentación apropiada en un tiempo razonable.

Preguntas guía:
- ¿El usuario sabe en qué paso del flujo está y cuántos faltan?
- ¿Hay feedback inmediato tras cada acción (clic, envío, carga)?
- ¿Los estados de carga, éxito y error son visibles y claros?
- ¿Los cambios de estado (ej. guardado, sincronizado, pendiente) son perceptibles?

Problemas típicos: falta de indicador de progreso, botones que no muestran estado "cargando", ausencia de confirmación tras una acción crítica, breadcrumbs ausentes en flujos multi-paso.

## 2. Correspondencia entre el sistema y el mundo real
El sistema debe hablar el lenguaje del usuario, con palabras, frases y conceptos familiares, siguiendo convenciones del mundo real.

Preguntas guía:
- ¿La terminología es la que usaría el usuario real (no jerga técnica interna)?
- ¿El orden de la información sigue una lógica natural para el dominio?
- ¿Los íconos y metáforas visuales son reconocibles?

Problemas típicos: nombres de campos ambiguos o técnicos, iconografía que no coincide con la convención del sector, orden de pasos que no corresponde al proceso real.

## 3. Control y libertad del usuario
Los usuarios necesitan una "salida de emergencia" claramente marcada para dejar un estado no deseado, sin tener que pasar por un proceso extenso. Debe soportar deshacer y rehacer.

Preguntas guía:
- ¿Puede el usuario cancelar o retroceder en cualquier punto del flujo?
- ¿Existe confirmación antes de acciones destructivas o irreversibles?
- ¿Hay forma de deshacer una acción reciente?

Problemas típicos: modales sin botón de cierre o cancelar, flujos sin retroceso, acciones destructivas sin confirmación, navegación que atrapa al usuario.

## 4. Consistencia y estándares
Los usuarios no deberían tener que preguntarse si diferentes palabras, situaciones o acciones significan lo mismo. Seguir las convenciones de la plataforma.

Preguntas guía:
- ¿Se usa el mismo término para el mismo concepto en toda la app?
- ¿Los patrones de interacción (botones, badges, iconos) se comportan igual en todas las pantallas?
- ¿Los colores tienen un significado consistente en todo el sistema?

Problemas típicos: mismo estado con dos nombres distintos, mismo color usado para significados distintos (colisión semántica), componentes similares con comportamientos diferentes según la pantalla.

## 5. Prevención de errores
Mejor que buenos mensajes de error es un diseño cuidadoso que prevenga que el problema ocurra. Eliminar condiciones propensas a error o verificarlas y presentar una confirmación antes de comprometerse a la acción.

Preguntas guía:
- ¿El diseño evita que el usuario cometa errores comunes (formatos inválidos, campos obligatorios olvidados)?
- ¿Hay validación en tiempo real antes del envío?
- ¿Se piden confirmaciones para acciones de alto riesgo (borrar, sobrescribir, enviar datos sensibles)?

Problemas típicos: campos numéricos que aceptan texto, ausencia de validación de rangos, falta de confirmación en acciones irreversibles, posibilidad de duplicar registros por doble clic.

## 6. Reconocer antes que recordar
Minimizar la carga de memoria del usuario haciendo visibles objetos, acciones y opciones. El usuario no debería tener que recordar información de una parte de la interfaz a otra.

Preguntas guía:
- ¿La información necesaria para decidir está visible en el momento de la decisión, o el usuario debe recordarla de una pantalla anterior?
- ¿Las opciones disponibles son visibles en vez de requerir que el usuario las recuerde o adivine?
- ¿Hay ayudas contextuales (placeholders, tooltips, ejemplos)?

Problemas típicos: el usuario debe recordar un código visto en otra pantalla, formularios largos sin resumen de lo ya ingresado, falta de contexto persistente (ej. nombre del paciente/registro activo) en flujos largos.

## 7. Flexibilidad y eficiencia de uso
Los aceleradores, invisibles para el usuario novato, pueden acelerar la interacción para el usuario experto, de forma que el sistema atienda tanto a usuarios inexpertos como experimentados.

Preguntas guía:
- ¿Existen atajos, filtros o bulk actions para usuarios frecuentes?
- ¿Se puede personalizar o recordar preferencias (últimos filtros, vistas)?
- ¿El flujo obliga siempre al camino más largo, incluso para tareas repetitivas?

Problemas típicos: ausencia de acciones masivas cuando hay listas largas, falta de atajos de teclado en contextos de uso intensivo, sin opción de guardar filtros/búsquedas frecuentes.

## 8. Diseño estético y minimalista
Las interfaces no deben contener información irrelevante o que se necesita raramente. Cada unidad extra de información compite con las unidades relevantes y disminuye su visibilidad relativa.

Preguntas guía:
- ¿Hay elementos, textos o badges que no aportan valor a la decisión del usuario?
- ¿La jerarquía visual guía la atención hacia lo prioritario?
- ¿Hay ruido visual que compite con la información crítica?

Problemas típicos: exceso de badges o etiquetas en una fila, información secundaria con el mismo peso visual que la crítica, pantallas sobrecargadas de texto.

## 9. Ayudar a los usuarios a reconocer, diagnosticar y recuperarse de errores
Los mensajes de error deben expresarse en lenguaje claro (sin códigos), indicar el problema con precisión y sugerir una solución constructiva.

Preguntas guía:
- ¿Los mensajes de error explican qué pasó y cómo resolverlo?
- ¿Se evita el lenguaje técnico o los códigos de error crípticos?
- ¿El usuario sabe exactamente qué campo o acción causó el error?

Problemas típicos: mensajes genéricos ("Ha ocurrido un error"), errores sin indicar el campo específico, mensajes técnicos con códigos internos, ausencia de sugerencia de solución.

## 10. Ayuda y documentación
Aunque es mejor que el sistema se pueda usar sin documentación, puede ser necesario proporcionar ayuda. Esta debe ser fácil de buscar, centrada en la tarea del usuario, con pasos concretos y no demasiado extensa.

Preguntas guía:
- ¿Hay ayuda contextual disponible en los puntos de mayor fricción o complejidad?
- ¿Es fácil de encontrar y específica a la tarea (no un manual genérico)?
- ¿Los flujos complejos o poco frecuentes tienen alguna guía o explicación?

Problemas típicos: ausencia total de ayuda contextual en flujos complejos, tooltips faltantes en campos con reglas de negocio no obvias, sin acceso a soporte o documentación desde el punto de fricción.

---

## Niveles de severidad sugeridos

Al reportar hallazgos, clasifica cada uno con un nivel de severidad:

- **Crítico**: bloquea al usuario, causa pérdida de datos, o genera riesgo (ej. en contextos de salud, riesgo para el paciente). Debe resolverse antes de lanzar.
- **Alto**: genera fricción significativa o confusión frecuente; afecta a la mayoría de los usuarios.
- **Medio**: genera fricción ocasional o afecta a un subconjunto de usuarios/casos de uso.
- **Bajo**: mejora deseable, pulido visual o de consistencia, sin impacto funcional grave.
