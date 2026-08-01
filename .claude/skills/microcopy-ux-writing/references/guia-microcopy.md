# Guía de microcopy por categoría

Principios y ejemplos (bien/mal) para cada categoría de microcopy. Usa esto tanto para auditar texto existente como para redactar texto nuevo.

Convención de idioma por defecto: español neutro, tratamiento de **usted** salvo que el producto ya use **tú** de forma consistente (verifícalo en el texto existente antes de asumir). Evita anglicismos innecesarios cuando existe un término claro en español ("Guardar" no "Save", pero términos técnicos ya asentados como "email" o "dashboard" pueden mantenerse si son los que el usuario real usa).

---

## Etiquetas (labels)

**Principio:** la etiqueta debe decir qué información se espera, no cómo se llama internamente el campo en la base de datos o el código.

- Debe ser corta pero inequívoca — si dos campos podrían confundirse (ej. dos campos de fecha, dos campos de "nombre"), la etiqueta debe distinguirlos explícitamente en vez de depender del orden o la posición.
- Si el campo tiene un formato esperado no obvio (fecha, unidades, longitud), inclúyelo como texto de ayuda (hint) junto a la etiqueta, no solo como placeholder — el placeholder desaparece al escribir.
- Evita que la misma palabra tenga dos significados distintos en pantallas distintas del mismo producto (esto ya ha aparecido como hallazgo real en Clintos: un campo llamado igual que otro pero mostrando datos distintos).

Mal: `Fecha` (sin contexto de cuál fecha, ni formato esperado)
Bien: `Fecha de vencimiento (DD/MM/AAAA)`

---

## Mensajes de error

**Principio:** un mensaje de error debe responder tres preguntas — qué pasó, por qué (si ayuda a resolverlo), y qué hacer ahora. Nunca debe ser un código técnico ni un genérico "Ha ocurrido un error".

Estructura recomendada:
```
[Qué pasó, específico al campo/acción] + [qué hacer para resolverlo]
```

- Vincula el error al campo específico que falló — no un error general en la parte superior de un formulario largo sin indicar cuál campo.
- Usa lenguaje humano, no técnico: evita códigos de error, nombres de variables, o mensajes que solo tendrían sentido para quien programó el sistema.
- Para acciones riesgosas en contexto clínico/operativo, sé explícito sobre la consecuencia, no solo sobre la regla técnica ("La cantidad excede el disponible en bodega (12 unidades)" es mejor que "Valor inválido").
- Nunca uses `alert()` nativo del navegador ni mecanismos que rompan el lenguaje visual del resto del producto — esto ya se ha señalado como hallazgo real en Clintos.

Mal: `Error de validación`
Bien: `La cantidad ingresada (25) supera el disponible en bodega (12 unidades). Ajusta la cantidad para continuar.`

---

## CTAs / botones

**Principio:** el texto del botón debe describir la acción que ocurre al presionarlo, con un verbo en infinitivo o imperativo claro — no una palabra genérica que podría significar cualquier cosa.

- Evita "Aceptar", "OK", "Confirmar" sin contexto cuando hay una acción más específica disponible ("Guardar cambios", "Eliminar reposición", "Confirmar pedido").
- Si la acción es destructiva o irreversible, el texto del botón debe dejarlo claro ("Eliminar permanentemente" en vez de solo "Eliminar", cuando la irreversibilidad no es obvia por otro medio).
- Mantén el mismo verbo para la misma acción en todo el producto — si en una pantalla se usa "Guardar" y en otra "Grabar" para lo mismo, es inconsistencia, no variedad.
- El botón principal (primario) de una pantalla debe usar el verbo más específico posible; el secundario/cancelar puede ser más genérico ("Cancelar", "Volver").

Mal: `Aceptar` (en un modal de confirmación de una acción destructiva, sin especificar qué se acepta)
Bien: `Eliminar reposición`

---

## Estados vacíos (empty states)

**Principio:** un estado vacío no es solo "no hay nada aquí" — es una oportunidad de explicar por qué está vacío y qué puede hacer el usuario al respecto.

- Distingue entre "vacío porque aún no hay datos" (ej. primera vez que se usa la función) y "vacío porque el filtro/búsqueda no arrojó resultados" — el mensaje y la acción sugerida son distintos en cada caso.
- Si hay una acción clara que resuelve el vacío (crear el primer registro, ajustar el filtro), inclúyela como CTA dentro del estado vacío, no solo como texto pasivo.

Mal: `Sin resultados`
Bien (sin datos aún): `Todavía no has registrado reposiciones. Crea la primera para empezar a hacer seguimiento.` + botón "Nueva reposición"
Bien (búsqueda sin resultados): `No se encontraron artículos para "tornillo cortical". Verifica la ortografía o ajusta los filtros.`

---

## Confirmaciones y mensajes de éxito

**Principio:** confirmar una acción completada da tranquilidad, pero no debe ser ruido — debe ser proporcional a la importancia de la acción.

- Acciones de bajo riesgo/frecuentes: confirmación breve y no bloqueante (toast, no modal).
- Acciones de alto riesgo/infrecuentes: confirmación más visible, puede incluir un resumen de lo que se hizo (ej. "Reposición REP-004521 creada con 8 artículos").
- Evita mensajes de éxito genéricos que no dicen qué se logró ("Listo", "Hecho") cuando se puede ser específico sin costo adicional.

Mal: `Guardado`
Bien: `Reposición REP-004521 guardada correctamente.`

---

## Ayuda contextual / tooltips

**Principio:** la ayuda debe estar cerca del momento y lugar donde se necesita, y ser específica a la tarea — no un manual genérico.

- Reserva los tooltips para términos o campos cuyo significado no es evidente para alguien fuera del dominio específico (esto ya se ha señalado como hallazgo real en auditorías de accesibilidad de Clintos, ej. "CNS Movimiento").
- No uses tooltips para repetir información que ya es obvia por el label — eso es ruido.
- Mantén el texto de ayuda corto (una o dos oraciones); si necesita más, es indicio de que el diseño de la pantalla necesita resolverlo de otra forma, no que necesita más texto explicativo.

---

## Consistencia de voz y tono

- Mantén el mismo tratamiento (usted/tú) en todo el producto — mezclar es una de las inconsistencias más notorias para el usuario, aunque sea "solo texto".
- Mantén el mismo nivel de formalidad: si el resto del producto es profesional/neutro, evita que un solo mensaje de error suene casual o gracioso, y viceversa.
- Un mismo concepto debe llamarse siempre igual en todo el producto (esto es tanto microcopy como el hallazgo de heurística de "consistencia y estándares" — se solapan a propósito).
