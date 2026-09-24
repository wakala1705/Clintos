// Dictado simulado de "Recetario por voz" (ver RecetarioVozModal.jsx) — sin
// reconocimiento de voz real: la transcripción se va "escuchando" palabra por
// palabra mientras corre el cronómetro y, al detener, se devuelve siempre esta
// misma receta ya interpretada. El ítem se define acá a mano (no con mkItem de
// mockCatalogoOrdenes.js): mkItem numera códigos y alterna
// `servicioContratado` con un contador global, así que sumar un ítem al
// catálogo corría los códigos/estados de todas las categorías siguientes.
export const TRANSCRIPCION_MOCK = 'Amoxicilina 500 miligramos cápsula cada 8 horas por 7 días vía oral';

export const RECETA_VOZ_MOCK = {
  item: {
    id: 'voz-amoxicilina',
    nombre: 'AMOXICILINA 500 MG CAPSULA',
    codigo: '20007330-01-011PBS - MX0000011PBS',
    servicioContratado: true,
  },
  dosis: '500',
  unidad: 'miligramo(s)',
  presentacion: 'CAPSULA',
  via: 'ORAL',
  frecuenciaValor: '8',
  frecuenciaUnidad: 'horas',
  duracionValor: '7',
  duracionUnidad: 'dias',
};

// Cuánto "tarda" en interpretar la receta tras "Detener" (estado procesando).
export const PROCESAMIENTO_MS = 1400;
