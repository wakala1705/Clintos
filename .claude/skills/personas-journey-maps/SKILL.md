---
name: personas-journey-maps
description: Ayuda a construir personas, empathy maps, journey maps y storyboards a partir de investigación de usuarios (entrevistas, notas de campo, datos de soporte) o, cuando no hay investigación disponible, como versiones exploratorias claramente marcadas como hipotéticas. Úsala cuando el usuario pida crear una "persona", "mapa de empatía", "journey map", "mapa de experiencia del usuario", "storyboard", o quiera sintetizar research en un artefacto visual/narrativo sobre un tipo de usuario o su recorrido. También aplica cuando el usuario tiene notas de entrevistas o investigación cruda y pide ayuda para organizarlas en alguno de estos formatos.
---

# Personas, empathy maps, journey maps y storyboards

Ayuda a sintetizar investigación de usuarios en artefactos que clarifiquen decisiones de diseño — no en documentos decorativos que se archivan sin usarse. Estos cuatro artefactos suelen usarse juntos: un empathy map sintetiza research crudo, una persona lo convierte en un arquetipo utilizable, un journey map narra su recorrido en el tiempo, y un storyboard visualiza un escenario puntual.

Encajan naturalmente en las fases Discover/Define de `double-diamond-framework` — si el usuario ya está trabajando con esa skill, estos son los entregables típicos que se generan ahí.

## Principio rector: research real vs. exploratorio

**Prioriza siempre construir sobre investigación real** (entrevistas, notas de campo, tickets de soporte, datos de uso) que el usuario aporte en la conversación — no sobre demografía imaginada.

Si el usuario no tiene research previo pero quiere avanzar igual, puedes construir una versión exploratoria — pero:
- Márcala explícitamente como **"proto-persona"** o **"journey hipotético"**, nunca como si fuera research validado.
- Acláralo también al inicio del entregable: "Basado en supuestos, no en investigación validada — usar como punto de partida para validar, no como fuente de verdad."
- Sugiere, sin insistir, qué investigación mínima cerraría la brecha (ej. 3-4 entrevistas cortas) antes de tomar decisiones de diseño importantes sobre esa base.

Si el usuario ya trabajó contigo una fase de Discover (research plan, entrevistas, síntesis), usa ese material como fuente antes de preguntar por más — no le pidas que repita lo que ya está en la conversación.

## Cuándo usar esta skill

- Se pide explícitamente una persona, empathy map, journey map o storyboard.
- Hay notas de investigación cruda (entrevistas, observaciones, tickets) y se pide ayuda para organizarlas/sintetizarlas.
- El usuario pregunta cómo se ve la experiencia de un tipo de usuario a través de un flujo o proceso completo.

No la actives para pedir feedback de una sola pantalla o flujo ya diseñado (para eso está `nielsen-heuristics-audit`) — estos artefactos son sobre personas y su contexto, no sobre la evaluación de una interfaz.

---

## Personas

Una persona debe ser un arquetipo de usuario basado en research, no una demografía inventada. Mantén el contenido enfocado en lo que cambia una decisión de diseño:

- **Objetivos**: qué está tratando de lograr.
- **Frustraciones**: qué le genera fricción hoy.
- **Comportamientos actuales**: cómo resuelve la tarea ahora (con o sin el producto).
- **Contexto de uso**: dónde, cuándo, bajo qué condiciones interactúa (ej. turno, presión de tiempo, dispositivo).
- **Restricciones relevantes para el diseño**: cualquier limitación que condicione decisiones (ej. acceso intermitente a internet, interrupciones frecuentes, nivel de familiaridad tecnológica).

Corta cualquier detalle que no cambiaría una decisión de producto (nombre completo inventado con biografía extensa, hobbies sin relación con el uso del producto, etc.) — eso es ruido, no información útil.

Si hay más de un tipo de usuario claramente distinto, crea personas separadas — no mezcles necesidades contradictorias en una sola.

---

## Empathy maps

Úsalos para sintetizar research cualitativo crudo (transcripciones de entrevistas, notas de campo) antes de llegar a una persona formal. Cuatro cuadrantes:

- **Dice**: lenguaje y citas textuales del usuario.
- **Piensa**: creencias, dudas, supuestos (lo que no necesariamente dijo en voz alta).
- **Hace**: comportamiento observable.
- **Siente**: estado emocional y su razón.

Los insights más valiosos suelen venir de las **contradicciones** entre cuadrantes — por ejemplo, un usuario que dice estar satisfecho pero cuyo comportamiento observado muestra frustración. Señala estas contradicciones explícitamente cuando aparezcan; son más útiles que cualquier cuadrante aislado.

---

## Journey maps

Un journey map es sobre **un actor específico** intentando lograr **un objetivo específico** a lo largo del tiempo. Incluye:

- **Actor**: qué persona/rol (idealmente ligado a una persona ya definida).
- **Escenario y expectativa**: qué está tratando de lograr y qué espera que pase.
- **Fases**: las etapas del recorrido (antes, durante, después de usar el producto, no solo dentro de la pantalla).
- **Acciones**: qué hace en cada fase.
- **Mentalidad**: qué está pensando/decidiendo en cada fase.
- **Altibajos emocionales**: dónde sube y baja la experiencia — esto es lo que suele revelar los puntos de mayor oportunidad.
- **Oportunidades**: qué podría mejorar en cada punto de fricción identificado.

Un journey map representa **un solo punto de vista**. Si hay varios tipos de usuario con recorridos distintos (ej. en Clintos: enfermería vs. bodega vs. médico), crea mapas separados — fusionarlos en uno solo diluye las fricciones específicas de cada rol.

---

## Storyboards

Úsalos cuando el equipo necesita una secuencia visual de un escenario de usuario, no una lista de pasos. Mantenlos acotados:

- Una sola persona.
- Un solo escenario.
- Un solo camino (no ramificaciones).
- Pocos paneles mostrando acción, contexto y emoción — no cada micro-paso.

La fidelidad visual importa poco; lo que importa es que la historia se entienda. Si el usuario no puede dibujar, ayuda describiendo cada panel en texto (contexto + acción + emoción) para que lo bocete después, o genera una versión simple en artifact si aplica.

---

## Proceso

### 1. Identificar qué artefacto encaja

Si el usuario no especifica cuál quiere, infiere del contexto: ¿tiene research crudo sin sintetizar? → empathy map primero. ¿Ya tiene claridad de quién es el usuario pero no un arquetipo formal? → persona. ¿Quiere entender el recorrido completo en el tiempo, no solo el perfil? → journey map. ¿Necesita comunicar un escenario puntual de forma visual/narrativa? → storyboard. Si de verdad no es obvio, pregunta brevemente en vez de asumir.

### 2. Reunir la base

Pide o localiza en la conversación el research disponible (entrevistas, notas, datos de soporte, research plan previo). Si no hay nada, sigue el principio rector: ofrece construir una versión exploratoria, marcada como tal.

### 3. Construir el artefacto

Usa la estructura de la sección correspondiente arriba. Sé fiel a lo que el research realmente mostró — no inventes detalles para "completar" el formato si no hay evidencia. Es mejor un campo corto y honesto ("no determinado con el research actual") que uno inventado para que se vea completo.

### 4. Cerrar con el siguiente paso

Termina señalando qué decisión de diseño se puede tomar con este artefacto, o qué información falta para tomarla — no lo dejes como documento aislado. Si detectas que el artefacto revela una oportunidad de diseño concreta, dilo explícitamente en vez de dejar que el usuario lo infiera solo.
