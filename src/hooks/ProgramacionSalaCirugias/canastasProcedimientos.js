// Canastas por procedimiento oncológico, agrupadas por complejidad: lo que ofrece
// "Vincular canasta" (Paso 3 del wizard "Nueva cirugía" y tab Insumos del detalle)
// bajo cada tarjeta de complejidad. Cada procedimiento tiene su propia canasta
// (insumos y cantidades distintos), tomada de las canastas reales de las cirugías
// oncológicas del mock (ver insumosOncologia.js) para que coincidan con lo que
// se ve en Canastas de cirugía. Datos puros.
import { INSUMOS_ONCO } from './insumosOncologia.js';

// Los insumos de insumosOncologia.js son [nombre, cantidad] sin código; la canasta
// del wizard usa { codigo, nombre, cantidad }. El código se asigna una sola vez por
// nombre, en orden de aparición (estable mientras no cambie esta lista).
const codigos = new Map();
function codigoDe(nombre) {
  if (!codigos.has(nombre)) codigos.set(nombre, `DM${String(1001 + codigos.size).padStart(6, '0')}`);
  return codigos.get(nombre);
}
const items = (tuplas) => tuplas.map(([nombre, cantidad]) => ({ codigo: codigoDe(nombre), nombre, cantidad }));

function procedimiento(id, nombre, complejidad, especialidad, cirugiaMockId) {
  return {
    id, nombre, complejidad, especialidad, items: items(INSUMOS_ONCO[cirugiaMockId]),
  };
}

export const PROCEDIMIENTOS_CANASTA = [
  // ---- Baja: cirugía menor / ambulatoria, anestesia local o sedación ----
  procedimiento('onco-port', 'Colocación de port-a-cath (reservorio venoso)', 'Baja', 'Oncología clínica', 12405),
  procedimiento('onco-biopsia-ganglio', 'Biopsia excisional de ganglio cervical', 'Baja', 'Cabeza y cuello', 12415),
  procedimiento('onco-melanoma', 'Escisión amplia de melanoma con ganglio centinela', 'Baja', 'Cirugía oncológica', 12407),
  procedimiento('onco-colonoscopia-polipectomia', 'Colonoscopia con polipectomía', 'Baja', 'Gastroenterología', 12409),
  // ---- Media: resecciones con drenaje y ligadura, laparoscopia estándar ----
  procedimiento('onco-mastectomia-centinela', 'Mastectomía radical modificada con ganglio centinela', 'Media', 'Mastología', 12401),
  procedimiento('onco-cuadrantectomia', 'Cuadrantectomía con ganglio centinela', 'Media', 'Mastología', 12402),
  procedimiento('onco-tiroidectomia', 'Tiroidectomía total con vaciamiento central y neuromonitoreo', 'Media', 'Cabeza y cuello', 12406),
  procedimiento('onco-hemicolectomia-lap', 'Hemicolectomía derecha laparoscópica', 'Media', 'Cirugía oncológica', 12404),
  // ---- Alta: resecciones mayores con grapado, sellado vascular y reconstrucción ----
  procedimiento('onco-gastrectomia-d2', 'Gastrectomía subtotal con linfadenectomía D2', 'Alta', 'Cirugía oncológica', 12403),
  procedimiento('onco-whipple', 'Duodenopancreatectomía cefálica (Whipple)', 'Alta', 'Cirugía hepatobiliar', 12408),
  procedimiento('onco-hepatectomia-derecha', 'Hepatectomía derecha por metástasis colorrectales', 'Alta', 'Cirugía hepatobiliar', 12421),
  procedimiento('onco-resec-anterior-recto', 'Resección anterior baja de recto con ileostomía de protección', 'Alta', 'Coloproctología', 12412),
];

export const procedimientosDeComplejidad = (complejidad) => PROCEDIMIENTOS_CANASTA.filter((p) => p.complejidad === complejidad);

const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

// Procedimientos de la cirugía (nombres) que coinciden con alguno de la lista: un
// nombre contiene al otro ("Tiroidectomía total" ~ "Tiroidectomía total con
// vaciamiento central…"). Devuelve los ids, para sugerirlos en el modal.
export function procedimientosCoincidentes(nombres = []) {
  const buscados = nombres.map(normalizar).filter(Boolean);
  return PROCEDIMIENTOS_CANASTA
    .filter((p) => {
      const n = normalizar(p.nombre);
      return buscados.some((b) => n.includes(b) || b.includes(n));
    })
    .map((p) => p.id);
}
