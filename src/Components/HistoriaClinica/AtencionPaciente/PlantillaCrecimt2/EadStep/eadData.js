// Datos + cálculo mecánico del instrumento EAD (Escala Abreviada de
// Desarrollo) — paso "08 Desarrollo" del wizard CRECIMT2. Vive como módulo de
// datos plano (no como componente) por su tamaño: 4 dominios × 12 rangos de
// edad × 3 ítems = 144 ítems, mucho más grande que cualquier `const` inline
// usada hasta ahora en este wizard — mismo criterio que valeData.js/
// mockAgendaData.js para datos de este tamaño.
//
// El contenido (rangos de edad, ítems clínicos de los 4 dominios) se
// transcribió literalmente de las capturas del formulario legacy real
// (ventanas "HISTORIA CLÍNICA — Atención Integral...", pestañas EAD MG/MF/
// AL/PS) que trajo el encargo — no se resumió, tradujo ni reinterpretó
// ningún texto clínico. Dos ítems de la captura "EAD PS" quedan cortados por
// el borde de la ventana legacy y su texto exacto no se alcanza a leer con
// certeza total — se transcriben con la compleción más plausible y quedan
// marcados abajo con "// verificar texto exacto contra el instrumento EAD
// original" para que el profesional los confirme o corrija.
//
// Las tablas normativas reales de la EAD (qué Puntaje Típico/Color/
// Clasificación corresponde a cada Puntaje Directo, por edad y dominio) no
// están disponibles en este proyecto — las capturas de referencia las traen
// tachadas/en negro. Por eso este módulo solo calcula lo mecánico (conteo de
// ítems correctos, suma del puntaje directo); Puntaje Típico/Color/
// Clasificación/Valoración global quedan como campos de texto libre que
// diligencia el profesional con su propia tabla de referencia (ver
// EadStep.jsx) — decisión confirmada con el usuario.

// ---------- RANGOS DE EDAD ----------
// El profesional elige directamente el chip del rango (ver
// EadDomainEtapa.jsx) — no hay conversión de una edad exacta a días: el
// chip elegido ES el rango vigente.
export const RANGOS_EAD = [
  { id: '0d-1m', label: '0 días a 1 mes y 0 días' },
  { id: '1m1d-3m', label: '1 mes 1 día a 3 meses y 0 días' },
  { id: '3m1d-6m', label: '3 meses 1 día a 6 meses y 0 días' },
  { id: '6m1d-9m', label: '6 meses 1 día a 9 meses y 0 días' },
  { id: '9m1d-12m', label: '9 meses 1 día a 12 meses y 0 días' },
  { id: '12m1d-18m', label: '12 meses 1 día a 18 meses y 0 días' },
  { id: '18m1d-24m', label: '18 meses 1 día a 24 meses y 0 días' },
  { id: '24m1d-36m', label: '24 meses 1 día a 36 meses y 0 días' },
  { id: '36m1d-48m', label: '36 meses 1 día a 48 meses y 0 días' },
  { id: '48m1d-60m', label: '48 meses y 1 día a 60 meses y 0 días' },
  { id: '60m1d-72m', label: '60 meses y 1 día a 72 meses y 0 días' },
  { id: '72m1d-84m', label: '72 meses 1 día a 84 meses y 0 días' },
];

// ---------- MOTRICIDAD GRUESA ----------
export const ITEMS_MOTRICIDAD_GRUESA = [
  { id: 'mg-0d1m-1', rango: '0d-1m', texto: 'Realiza reflejo de búsqueda y de succión' },
  { id: 'mg-0d1m-2', rango: '0d-1m', texto: 'Reflejo de moro está presente y es simétrico' },
  { id: 'mg-0d1m-3', rango: '0d-1m', texto: 'Mueve sus extremidades' },
  { id: 'mg-1m1d3m-1', rango: '1m1d-3m', texto: 'Sostiene la cabeza al levantarlo de brazos' },
  { id: 'mg-1m1d3m-2', rango: '1m1d-3m', texto: 'Levanta la cabeza y pecho en prono' },
  { id: 'mg-1m1d3m-3', rango: '1m1d-3m', texto: 'Gira la cabeza desde la línea media' },
  { id: 'mg-3m1d6m-1', rango: '3m1d-6m', texto: 'Control de cabeza sentado con apoyo' },
  { id: 'mg-3m1d6m-2', rango: '3m1d-6m', texto: 'Se voltea' },
  { id: 'mg-3m1d6m-3', rango: '3m1d-6m', texto: 'Se mantiene sentado momentáneamente' },
  { id: 'mg-6m1d9m-1', rango: '6m1d-9m', texto: 'Se mantiene sentado sin apoyo' },
  { id: 'mg-6m1d9m-2', rango: '6m1d-9m', texto: 'Adopta la posición de sentado' },
  { id: 'mg-6m1d9m-3', rango: '6m1d-9m', texto: 'Se arrastra en posición prono' },
  { id: 'mg-9m1d12m-1', rango: '9m1d-12m', texto: 'Gatea con desp cruzado alterna rodillas,manos' },
  { id: 'mg-9m1d12m-2', rango: '9m1d-12m', texto: 'Adopta pos.bípeda,se sostiene depie con apoyo' },
  { id: 'mg-9m1d12m-3', rango: '9m1d-12m', texto: 'Se sostiene de pie sin apoyo' },
  { id: 'mg-12m1d18m-1', rango: '12m1d-18m', texto: 'Se pone de pie sin ayuda' },
  { id: 'mg-12m1d18m-2', rango: '12m1d-18m', texto: 'Da pasos solo(a)' },
  { id: 'mg-12m1d18m-3', rango: '12m1d-18m', texto: 'Camina desp.cruzado sin ayuda alt.brazos,pies' },
  { id: 'mg-18m1d24m-1', rango: '18m1d-24m', texto: 'Corre' },
  { id: 'mg-18m1d24m-2', rango: '18m1d-24m', texto: 'Lanza la pelota' },
  { id: 'mg-18m1d24m-3', rango: '18m1d-24m', texto: 'Patea la pelota' },
  { id: 'mg-24m1d36m-1', rango: '24m1d-36m', texto: 'Salta con los pies juntos' },
  { id: 'mg-24m1d36m-2', rango: '24m1d-36m', texto: 'Se empina en ambos pies' },
  { id: 'mg-24m1d36m-3', rango: '24m1d-36m', texto: 'Sube dos escalones sin apoyo' },
  { id: 'mg-36m1d48m-1', rango: '36m1d-48m', texto: 'Camina en puntas de pies' },
  { id: 'mg-36m1d48m-2', rango: '36m1d-48m', texto: 'Se para en un solo pie' },
  { id: 'mg-36m1d48m-3', rango: '36m1d-48m', texto: 'Baja 2 escalones con apoyo mínimo alt.los pie' },
  { id: 'mg-48m1d60m-1', rango: '48m1d-60m', texto: 'Camina sobre una línea recta sin apoyo visual' },
  { id: 'mg-48m1d60m-2', rango: '48m1d-60m', texto: 'Salta en tres o más ocasiones en un pie' },
  { id: 'mg-48m1d60m-3', rango: '48m1d-60m', texto: 'Hace rebotar y agarra la pelota' },
  { id: 'mg-60m1d72m-1', rango: '60m1d-72m', texto: 'Hace "caballitos" (alternando los pies)' },
  { id: 'mg-60m1d72m-2', rango: '60m1d-72m', texto: 'Salta de lado a lado 1 línea con pies juntos' },
  { id: 'mg-60m1d72m-3', rango: '60m1d-72m', texto: 'Salta desplazándose con ambos pies' },
  { id: 'mg-72m1d84m-1', rango: '72m1d-84m', texto: 'Se equilibra en punta de pies con ojos cerrados' },
  { id: 'mg-72m1d84m-2', rango: '72m1d-84m', texto: 'Realiza saltos alternados en secuencia' },
  { id: 'mg-72m1d84m-3', rango: '72m1d-84m', texto: 'Realiza alguna actividad de integración motora' },
];

// ---------- MOTRICIDAD FINA ADAPTATIVA ----------
export const ITEMS_MOTRICIDAD_FINA = [
  { id: 'mf-0d1m-1', rango: '0d-1m', texto: 'Reflejo de prensión palmar' },
  { id: 'mf-0d1m-2', rango: '0d-1m', texto: 'Reacciona ante luz y sonidos' },
  { id: 'mf-0d1m-3', rango: '0d-1m', texto: 'Sigue movimiento horizontal' },
  { id: 'mf-1m1d3m-1', rango: '1m1d-3m', texto: 'Abre y mira sus manos' },
  { id: 'mf-1m1d3m-2', rango: '1m1d-3m', texto: 'Sostiene objeto en la mano' },
  { id: 'mf-1m1d3m-3', rango: '1m1d-3m', texto: 'Se lleva un objeto a la boca' },
  { id: 'mf-3m1d6m-1', rango: '3m1d-6m', texto: 'Agarra objetos voluntariamente' },
  // verificar texto exacto contra el instrumento EAD original (borde de ventana cortaba "quita[r]")
  { id: 'mf-3m1d6m-2', rango: '3m1d-6m', texto: 'Retiene un objeto cuando se lo intentan quitar' },
  { id: 'mf-3m1d6m-3', rango: '3m1d-6m', texto: 'Pasa objeto de una mano a otra' },
  { id: 'mf-6m1d9m-1', rango: '6m1d-9m', texto: 'Sostiene un objeto en cada mano' },
  { id: 'mf-6m1d9m-2', rango: '6m1d-9m', texto: 'Deja caer los objetos intencionalmente' },
  { id: 'mf-6m1d9m-3', rango: '6m1d-9m', texto: 'Agarra con pulgar e índice (pinza)' },
  { id: 'mf-9m1d12m-1', rango: '9m1d-12m', texto: 'Agarra tercer objeto sin soltar otros' },
  { id: 'mf-9m1d12m-2', rango: '9m1d-12m', texto: 'Saca objetos del contenedor' },
  { id: 'mf-9m1d12m-3', rango: '9m1d-12m', texto: 'Busca objetos escondidos' },
  { id: 'mf-12m1d18m-1', rango: '12m1d-18m', texto: 'Hace torre de dos cubos' },
  { id: 'mf-12m1d18m-2', rango: '12m1d-18m', texto: 'Pasa hojas de un libro' },
  { id: 'mf-12m1d18m-3', rango: '12m1d-18m', texto: 'Agarra una cuchara y se la lleva a la boca' },
  { id: 'mf-18m1d24m-1', rango: '18m1d-24m', texto: 'Garabatea espontáneamente' },
  { id: 'mf-18m1d24m-2', rango: '18m1d-24m', texto: 'Quita la tapa del frasco de muestra de orina' },
  { id: 'mf-18m1d24m-3', rango: '18m1d-24m', texto: 'Hace torre de cinco cubos' },
  { id: 'mf-24m1d36m-1', rango: '24m1d-36m', texto: 'Ensarta cuentas perforadas con pinza' },
  { id: 'mf-24m1d36m-2', rango: '24m1d-36m', texto: 'Rasga papel con pinza de ambas manos' },
  { id: 'mf-24m1d36m-3', rango: '24m1d-36m', texto: 'Copia línea horizontal y vertical' },
  { id: 'mf-36m1d48m-1', rango: '36m1d-48m', texto: 'Hace una bola de papel con sus dedos' },
  { id: 'mf-36m1d48m-2', rango: '36m1d-48m', texto: 'Copia círculo' },
  { id: 'mf-36m1d48m-3', rango: '36m1d-48m', texto: 'Figura humana rudimentaria' },
  { id: 'mf-48m1d60m-1', rango: '48m1d-60m', texto: 'Imita el dibujo de una escalera' },
  { id: 'mf-48m1d60m-2', rango: '48m1d-60m', texto: 'Corta papel con las tijeras' },
  { id: 'mf-48m1d60m-3', rango: '48m1d-60m', texto: 'Figura humana 2' },
  { id: 'mf-60m1d72m-1', rango: '60m1d-72m', texto: 'Dibuja el lugar en el que vive' },
  { id: 'mf-60m1d72m-2', rango: '60m1d-72m', texto: 'Modelo de cubos (escalera)' },
  { id: 'mf-60m1d72m-3', rango: '60m1d-72m', texto: 'Copia un triángulo' },
  { id: 'mf-72m1d84m-1', rango: '72m1d-84m', texto: 'Copia una figura de puntos' },
  { id: 'mf-72m1d84m-2', rango: '72m1d-84m', texto: 'Puede hacer una figura plegada' },
  { id: 'mf-72m1d84m-3', rango: '72m1d-84m', texto: 'Ensarta cordón cruzado (como amarrarse zapatos)' },
];

// ---------- AUDICIÓN Y LENGUAJE ----------
export const ITEMS_AUDICION_LENGUAJE = [
  { id: 'al-0d1m-1', rango: '0d-1m', texto: 'Se sobresalta con un ruido' },
  { id: 'al-0d1m-2', rango: '0d-1m', texto: 'Contempla momentáneamente a una persona' },
  { id: 'al-0d1m-3', rango: '0d-1m', texto: 'Llora para expresar necesidades' },
  { id: 'al-1m1d3m-1', rango: '1m1d-3m', texto: 'Se tranquiliza con la voz humana' },
  { id: 'al-1m1d3m-2', rango: '1m1d-3m', texto: 'Produce sonidos guturales indiferenciados' },
  { id: 'al-1m1d3m-3', rango: '1m1d-3m', texto: 'Busca el sonido con la mirada' },
  { id: 'al-3m1d6m-1', rango: '3m1d-6m', texto: 'Busca diferentes sonidos con la mirada' },
  { id: 'al-3m1d6m-2', rango: '3m1d-6m', texto: 'Pone atención a la conversación' },
  { id: 'al-3m1d6m-3', rango: '3m1d-6m', texto: 'Produce cuatro o más sonidos diferentes' },
  { id: 'al-6m1d9m-1', rango: '6m1d-9m', texto: 'Pronuncia tres o más sílabas' },
  { id: 'al-6m1d9m-2', rango: '6m1d-9m', texto: 'Reacciona cuando se le llama por su nombre' },
  { id: 'al-6m1d9m-3', rango: '6m1d-9m', texto: 'Reacciona a tres palabras familiares' },
  { id: 'al-9m1d12m-1', rango: '9m1d-12m', texto: 'Reacciona a la palabra no' },
  { id: 'al-9m1d12m-2', rango: '9m1d-12m', texto: 'Llama al cuidador' },
  { id: 'al-9m1d12m-3', rango: '9m1d-12m', texto: 'Responde a una instrucción sencilla' },
  { id: 'al-12m1d18m-1', rango: '12m1d-18m', texto: 'Aproxim. a una palabra con intención comunicativa' },
  { id: 'al-12m1d18m-2', rango: '12m1d-18m', texto: 'Reconoce al menos 6 objetos o imágenes' },
  { id: 'al-12m1d18m-3', rango: '12m1d-18m', texto: 'Sigue instrucciones de dos pasos' },
  { id: 'al-18m1d24m-1', rango: '18m1d-24m', texto: 'Nombre cinco objetos de una imagen' },
  { id: 'al-18m1d24m-2', rango: '18m1d-24m', texto: 'Utiliza más de 20 palabras' },
  { id: 'al-18m1d24m-3', rango: '18m1d-24m', texto: 'Usa frases de dos palabras' },
  { id: 'al-24m1d36m-1', rango: '24m1d-36m', texto: 'Dice su nombre completo' },
  { id: 'al-24m1d36m-2', rango: '24m1d-36m', texto: 'Dice frases de 3 palabras' },
  { id: 'al-24m1d36m-3', rango: '24m1d-36m', texto: 'Reconoce cualidades de los objetos' },
  { id: 'al-36m1d48m-1', rango: '36m1d-48m', texto: 'Define por su uso cinco objetos' },
  { id: 'al-36m1d48m-2', rango: '36m1d-48m', texto: 'Hace comparativos' },
  { id: 'al-36m1d48m-3', rango: '36m1d-48m', texto: 'Describe el dibujo' },
  { id: 'al-48m1d60m-1', rango: '48m1d-60m', texto: 'Reconoce 5 colores' },
  { id: 'al-48m1d60m-2', rango: '48m1d-60m', texto: 'Responde tres preguntas sobre el relato' },
  { id: 'al-48m1d60m-3', rango: '48m1d-60m', texto: 'Elabora un relato a partir de una imagen' },
  { id: 'al-60m1d72m-1', rango: '60m1d-72m', texto: 'Expresa opiniones' },
  { id: 'al-60m1d72m-2', rango: '60m1d-72m', texto: 'Repite palabras con pronunciación correcta' },
  { id: 'al-60m1d72m-3', rango: '60m1d-72m', texto: 'Absurdos visuales' },
  { id: 'al-72m1d84m-1', rango: '72m1d-84m', texto: 'Identifica palabras q inician con sonido parecido' },
  { id: 'al-72m1d84m-2', rango: '72m1d-84m', texto: 'Conoce: ayer, hoy y mañana' },
  { id: 'al-72m1d84m-3', rango: '72m1d-84m', texto: 'Ordena una historia y la relata' },
];

// ---------- PERSONAL SOCIAL ----------
export const ITEMS_PERSONAL_SOCIAL = [
  { id: 'ps-0d1m-1', rango: '0d-1m', texto: 'Se tranquiliza cuando se toma entre los brazos' },
  { id: 'ps-0d1m-2', rango: '0d-1m', texto: 'Responde a las caricias' },
  { id: 'ps-0d1m-3', rango: '0d-1m', texto: 'El bebé ya está registrado(a)' },
  { id: 'ps-1m1d3m-1', rango: '1m1d-3m', texto: 'Reconoce la voz del cuidador principal' },
  { id: 'ps-1m1d3m-2', rango: '1m1d-3m', texto: 'Sonrisa social' },
  { id: 'ps-1m1d3m-3', rango: '1m1d-3m', texto: 'Responde a una conversación' },
  { id: 'ps-3m1d6m-1', rango: '3m1d-6m', texto: 'Coge las manos del examinador' },
  { id: 'ps-3m1d6m-2', rango: '3m1d-6m', texto: 'Ríe a carcajadas' },
  { id: 'ps-3m1d6m-3', rango: '3m1d-6m', texto: 'Busca la continuación del juego' },
  { id: 'ps-6m1d9m-1', rango: '6m1d-9m', texto: 'Reacciona con desconfianza ante el extraño' },
  { id: 'ps-6m1d9m-2', rango: '6m1d-9m', texto: 'Busca apoyo del cuidador' },
  { id: 'ps-6m1d9m-3', rango: '6m1d-9m', texto: 'Reacciona a su imagen en el espejo' },
  { id: 'ps-9m1d12m-1', rango: '9m1d-12m', texto: 'Participa en juegos' },
  { id: 'ps-9m1d12m-2', rango: '9m1d-12m', texto: 'Muestra interés,intención en alimentarse solo' },
  { id: 'ps-9m1d12m-3', rango: '9m1d-12m', texto: 'Explora el entorno' },
  { id: 'ps-12m1d18m-1', rango: '12m1d-18m', texto: 'Seguimiento de rutinas' },
  { id: 'ps-12m1d18m-2', rango: '12m1d-18m', texto: 'Ayuda a desvestirse' },
  { id: 'ps-12m1d18m-3', rango: '12m1d-18m', texto: 'Señala 5 partes de su cuerpo' },
  { id: 'ps-18m1d24m-1', rango: '18m1d-24m', texto: 'Tolera contacto de su piel con dif. texturas' },
  { id: 'ps-18m1d24m-2', rango: '18m1d-24m', texto: 'Expresa su satisfacción cuando logra algo' },
  { id: 'ps-18m1d24m-3', rango: '18m1d-24m', texto: 'Identifica emociones básicas en una imagen' },
  { id: 'ps-24m1d36m-1', rango: '24m1d-36m', texto: 'Identifica qué es de él y qué es de otros' },
  { id: 'ps-24m1d36m-2', rango: '24m1d-36m', texto: 'Dice nombres de personas con quien vive' },
  // verificar texto exacto contra el instrumento EAD original (borde de ventana cortaba "m[iedo]")
  { id: 'ps-24m1d36m-3', rango: '24m1d-36m', texto: 'Expr.verbalmente emociones(tristeza,alegría,miedo)' },
  // verificar texto exacto contra el instrumento EAD original (borde de ventana cortaba "po[dría...]")
  { id: 'ps-36m1d48m-1', rango: '36m1d-48m', texto: 'Rechaza ayuda de cuidador cuando hace algo que podría hacer solo(a)' },
  { id: 'ps-36m1d48m-2', rango: '36m1d-48m', texto: 'Comparte juego con otros(as) niños(as)' },
  { id: 'ps-36m1d48m-3', rango: '36m1d-48m', texto: 'Reconoce emociones básicas de los otros(as)' },
  { id: 'ps-48m1d60m-1', rango: '48m1d-60m', texto: 'Puede vestirse y desvestirse solo(a)' },
  { id: 'ps-48m1d60m-2', rango: '48m1d-60m', texto: 'Propone juegos' },
  { id: 'ps-48m1d60m-3', rango: '48m1d-60m', texto: 'Sabe cuántos años tiene' },
  { id: 'ps-60m1d72m-1', rango: '60m1d-72m', texto: 'Participa en juegos respetando reglas y turno' },
  { id: 'ps-60m1d72m-2', rango: '60m1d-72m', texto: 'Comenta vida familiar' },
  { id: 'ps-60m1d72m-3', rango: '60m1d-72m', texto: 'Colabora por iniciativa propia con actividades' },
  { id: 'ps-72m1d84m-1', rango: '72m1d-84m', texto: 'Manifiesta emoción ante acontecimientos importantes' },
  { id: 'ps-72m1d84m-2', rango: '72m1d-84m', texto: 'Reconocimiento de normas o prohibiciones' },
  { id: 'ps-72m1d84m-3', rango: '72m1d-84m', texto: 'Reconoce emociones como(culpa,pena,frustración)' },
];

// ---------- DOMINIOS ----------
// Config que recorre EadDomainEtapa.jsx (un solo componente reutilizado 4
// veces desde EadStep.jsx) — los 4 dominios comparten exactamente la misma
// estructura (12 rangos × 3 ítems), solo cambian título/descripción/ítems.
export const DOMINIOS = [
  {
    key: 'motricidadGruesa',
    label: 'Motricidad gruesa',
    descripcion: 'Evalúa habilidades relacionadas con el control postural, desplazamiento, equilibrio y coordinación motora.',
    items: ITEMS_MOTRICIDAD_GRUESA,
  },
  {
    key: 'motricidadFina',
    label: 'Motricidad fina adaptativa',
    descripcion: 'Evalúa coordinación óculo-manual, manipulación de objetos y habilidades de precisión.',
    items: ITEMS_MOTRICIDAD_FINA,
  },
  {
    key: 'audicionLenguaje',
    label: 'Audición y lenguaje',
    descripcion: 'Evalúa respuestas auditivas, comprensión, comunicación y desarrollo del lenguaje.',
    items: ITEMS_AUDICION_LENGUAJE,
  },
  {
    key: 'personalSocial',
    label: 'Personal social',
    descripcion: 'Evalúa interacción social, autonomía, reconocimiento emocional y adaptación al entorno.',
    items: ITEMS_PERSONAL_SOCIAL,
  },
];

// ---------- CÁLCULO (solo lo mecánico, ver nota arriba) ----------
export function contarCorrectos(items, respuestas) {
  return items.filter((it) => respuestas[it.id] === 'logrado').length;
}

export function contarRespondidos(items, respuestas) {
  return items.filter((it) => respuestas[it.id] != null).length;
}

export function puntajeDirecto(totalAcumuladoInicio, itemsCorrectos) {
  return (totalAcumuladoInicio ?? 0) + itemsCorrectos;
}
