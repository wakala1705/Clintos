// Datos del paso "Recomendaciones al cuidador" (ver RecomendacionesStep.jsx)
// — 8 categorías exactas del legacy (ver captura de referencia), cada una
// con su plantilla de contenido clínico predefinido (mismo texto, sin
// resumir ni modificar). "Otras recomendaciones" es la única sin plantilla
// real: el legacy la deja como campo de texto libre para que el
// profesional agregue recomendaciones personalizadas.
export const RECOMENDACIONES = [
  {
    id: 'alimentacion',
    label: 'Alimentación',
    plantilla: [
      'Importancia de la lactancia materna exclusiva durante los primeros seis meses de vida.',
      'Técnica adecuada de lactancia materna.',
      'Técnica adecuada de extracción, conservación y suministro de la leche materna extraída.',
      'Iniciar alimentación complementaria de la leche materna a partir de los seis meses empezando desde lo más blando a lo más consistente.',
      'Proporcionar a los niños cantidades suficientes de micronutrientes.',
    ],
  },
  {
    id: 'buen-trato',
    label: 'Recomendaciones sobre buen trato',
    plantilla: [
      'Tener reglas claras acerca de los deberes y aplicar siempre las mismas reglas.',
      'No decir al menor que es tonto o bruto. Los niños pueden equivocarse y si cometen faltas debe corregirlas, pero no de manera violenta, sino explicando por qué estuvo mal, escuchar sus motivos antes de reprenderlo.',
      'Expresar disgusto con la voz sin necesidad de gritar o usar castigo físico. Hable siempre a su misma altura.',
    ],
  },
  {
    id: 'controles',
    label: 'Importancia de asistir puntualmente a los controles',
    plantilla: [
      'Acudir puntualmente a los controles es una muestra de amor a sus hijos y le permite tener pautas para el cuidado adecuado del niño desde que nace hasta que entra en la adolescencia, para que sea individuo con alta autoestima, autónomo, feliz, solidario, saludable, creativo.',
    ],
  },
  {
    id: 'signos-alarma',
    label: 'Educación en signos de alarma: Debe traer al niño enfermo de inmediato si:',
    plantilla: [
      'No puede beber o tomar el pecho o vomita todo.',
      'Si empeora o desarrolla fiebre.',
      'Tiene convulsiones, está muy dormido o no se despierta.',
      'Si tiene diarrea y aparece sangre en las heces o presenta dificultad para beber o tiene algún signo de deshidratación.',
      'Si tiene tos y presenta dificultad para respirar.',
    ],
  },
  {
    id: 'salud-oral',
    label: 'Educación en salud oral',
    plantilla: [
      'Remisión a odontología al mayor de dos años.',
      'Remisión a odontología al menor de dos años por AIEPI.',
      'Realizar limpieza y masaje de las encías al menos una vez al día, usando un paño limpio humedecido en agua, preferiblemente en la noche antes de acostarlo a dormir.',
      'Inicie el hábito del cepillado de forma temprana, es decir, desde la salida del primer diente usando cepillos de cerdas suaves, de tamaño acorde a la boca del niño y usando una gota pequeña de crema dental.',
    ],
  },
  {
    id: 'abuso-sexual',
    label: 'Prevención de abuso sexual',
    plantilla: [
      'No deje a sus niños solo o con personas desconocidas o que no le tenga confianza.',
      'Sospeche que su niño ha sido abusado si se encierra en sí mismo, tiene conductas regresivas o se vuelve temeroso a cuestiones específicas, habla de partes sexuales o de actos sexuales cuando aún no comprende adecuadamente el contenido o si es inadecuado para su edad.',
    ],
  },
  {
    id: 'accidentes-hogar',
    label: 'Prevención de accidentes en el hogar',
    plantilla: [
      'No deje tanques con agua sin tapa donde el niño se pueda sumergir total o parcialmente.',
      'Tenga cuidado con las instalaciones eléctricas, desconecte los electrodomésticos si no los está utilizando.',
      'Mantenga fuera del alcance objetos y juguetes pequeños como fríjoles, botones, monedas, bolitas de cristal.',
      'Corte en trozos pequeños la comida y acompañe al niño mientras come.',
    ],
  },
  {
    id: 'otras',
    label: 'Otras recomendaciones',
    plantilla: [],
  },
];

// Texto inicial del textarea al marcar una recomendación — mismas viñetas
// "- " del legacy (ver captura de referencia). "Otras recomendaciones" no
// tiene plantilla real: arranca vacía para texto libre.
export function buildPlantilla(id) {
  const rec = RECOMENDACIONES.find((r) => r.id === id);
  if (!rec || rec.plantilla.length === 0) return '';
  return rec.plantilla.map((linea) => `- ${linea}`).join('\n');
}
