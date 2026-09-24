import { getCatalogoCategoria } from './mockCatalogoOrdenes';

// Dictado simulado de "Recetario por voz" (ver RecetarioVozModal.jsx) — sin
// reconocimiento de voz real: la transcripción se va "escuchando" palabra por
// palabra mientras corre el cronómetro y, al detener, queda en un textarea
// editable. "Parsear" sí interpreta el texto que haya ahí (parsearReceta),
// así que corregir la transcripción cambia los datos extraídos.
export const TRANSCRIPCION_MOCK = 'Amoxicilina 500 miligramos cápsula cada 8 horas por 7 días vía oral';

// Cuánto "tarda" en transcribir el audio tras "Detener" (estado procesando).
export const PROCESAMIENTO_MS = 1400;

// Amoxicilina se suma acá al vademécum y no al catálogo de mockCatalogoOrdenes.js:
// mkItem de ese archivo numera códigos y alterna `servicioContratado` con un
// contador global, así que sumar un ítem ahí corría los códigos/estados de
// todas las categorías siguientes.
const AMOXICILINA = {
  id: 'voz-amoxicilina',
  nombre: 'AMOXICILINA 500 MG CAPSULA',
  codigo: '20007330-01-011PBS - MX0000011PBS',
  servicioContratado: true,
  dosis: '500',
  unidad: 'miligramo(s)',
  presentacion: 'CAPSULA',
  via: 'ORAL',
};

function vademecum() {
  return [...getCatalogoCategoria('medicamentos'), AMOXICILINA];
}

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Principio activo = nombre hasta el primer número ("ACIDO VALPROICO 500 MG..."
// → "acido valproico"), que es lo que se dicta.
function principioActivo(nombre) {
  return normalizar(nombre.split(/\d/)[0].trim());
}

const UNIDADES = [
  { re: /^(miligramos?|mg)$/, value: 'miligramo(s)' },
  { re: /^(gramos?|g|gr)$/, value: 'gramo(s)' },
  { re: /^(mililitros?|ml)$/, value: 'mililitro(s)' },
  { re: /^(unidades?|u|ui)$/, value: 'unidad(es)' },
];

const VIAS = [
  { re: /\b(oral|via oral|vo)\b/, value: 'ORAL' },
  { re: /\b(intravenosa|endovenosa|iv|ev)\b/, value: 'INTRAVENOSA' },
  { re: /\b(intramuscular|im)\b/, value: 'INTRAMUSCULAR' },
  { re: /\b(subcutanea|sc)\b/, value: 'SUBCUTANEA' },
  { re: /\b(topica)\b/, value: 'TOPICA' },
];

const PRESENTACIONES = [
  { re: /\b(tabletas?)\b/, value: 'TABLETA' },
  { re: /\b(capsulas?)\b/, value: 'CAPSULA' },
  { re: /\b(inyectable|ampollas?)\b/, value: 'SOLUCION INYECTABLE' },
  { re: /\b(jarabe)\b/, value: 'JARABE' },
  { re: /\b(crema)\b/, value: 'CREMA' },
];

function unidadTiempo(palabra) {
  return /^h/.test(palabra) ? 'horas' : 'dias';
}

// Interpreta una receta dictada en texto libre. Cada campo que no se reconoce
// queda en null (el modal lo muestra como "No detectado"). Dosis/unidad/
// presentación/vía caen al valor del vademécum si el texto no las dice.
export function parsearReceta(texto) {
  const t = normalizar(texto);

  // Primero el principio activo completo; si no, su primera palabra (se dicta
  // "losartán", no "losartán potásico") salvo genéricas como "ácido".
  const palabras = new Set(t.split(/[^a-z]+/));
  const lista = vademecum();
  const medicamento = lista.find((m) => t.includes(principioActivo(m.nombre)))
    ?? lista.find((m) => {
      const primera = principioActivo(m.nombre).split(' ')[0];
      return primera !== 'acido' && palabras.has(primera);
    })
    ?? null;

  let dosis = null;
  let unidad = null;
  const mDosis = t.match(/(\d+(?:[.,]\d+)?)\s*([a-z]+)/g) ?? [];
  for (const frag of mDosis) {
    const [, num, uni] = frag.match(/(\d+(?:[.,]\d+)?)\s*([a-z]+)/);
    const u = UNIDADES.find((x) => x.re.test(uni));
    if (u) { dosis = num.replace(',', '.'); unidad = u.value; break; }
  }

  const mFrec = t.match(/cada\s+(\d+)\s*(horas?|h|dias?)/);
  const mDur = t.match(/(?:por|durante)\s+(\d+)\s*(dias?|horas?)/);

  return {
    medicamento,
    dosis: dosis ?? medicamento?.dosis ?? null,
    unidad: unidad ?? medicamento?.unidad ?? null,
    presentacion: PRESENTACIONES.find((p) => p.re.test(t))?.value ?? medicamento?.presentacion ?? null,
    via: VIAS.find((v) => v.re.test(t))?.value ?? medicamento?.via ?? null,
    frecuencia: mFrec ? { valor: mFrec[1], unidad: unidadTiempo(mFrec[2]) } : null,
    duracion: mDur ? { valor: mDur[1], unidad: unidadTiempo(mDur[2]) } : null,
  };
}
