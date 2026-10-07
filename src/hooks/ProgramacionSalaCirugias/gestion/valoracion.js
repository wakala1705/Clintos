// Lógica pura del registro de la valoración preanestésica (paso 3 del chequeo
// de Gestión de cirugías). Sin React ni fecha del sistema.

export const OPCIONES_ASA = ['I', 'II', 'III', 'IV', 'V'].map((v) => ({ value: v, label: `ASA ${v}` }));

export const CONCEPTOS = [
  { value: 'apto', label: 'Apto' },
  { value: 'condiciones', label: 'Apto con condiciones' },
  { value: 'no-apto', label: 'No apto' },
];

// Datos de ejemplo hasta que exista el catálogo real de anestesiólogos.
export const ANESTESIOLOGOS = [
  'Dra. Paula Mendoza',
  'Dr. Ricardo Salazar',
  'Dra. Natalia Ortega',
  'Dr. Camilo Peña',
].map((v) => ({ value: v, label: v }));

const CONCEPTOS_CON_OBSERVACION = ['condiciones', 'no-apto'];

// "2026-10-07" -> "07/10/2026".
export function fechaCorta(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Errores por campo ({} si el formulario es válido). Con "Apto con condiciones"
// o "No apto" las observaciones son obligatorias: son lo que explica la
// restricción o el rechazo.
export function validarValoracion(datos) {
  const errores = {};
  if (!datos.fecha) errores.fecha = 'Indica la fecha de la valoración.';
  if (!datos.anestesiologo) errores.anestesiologo = 'Selecciona el anestesiólogo.';
  if (!datos.asa) errores.asa = 'Selecciona la clasificación ASA.';
  if (!datos.concepto) errores.concepto = 'Selecciona el concepto.';
  if (CONCEPTOS_CON_OBSERVACION.includes(datos.concepto) && !datos.observaciones.trim()) {
    errores.observaciones = datos.concepto === 'no-apto'
      ? 'Indica el motivo por el que no es apto.'
      : 'Indica las condiciones.';
  }
  return errores;
}

function detalleDe(datos) {
  const obs = datos.observaciones.trim();
  const evapre = datos.evapre ? ` · EVAPRE N° ${datos.evapre.numero}` : '';
  const firma = `${datos.anestesiologo} · ${fechaCorta(datos.fecha)}${evapre}`;
  if (datos.concepto === 'no-apto') return `Valoración ASA ${datos.asa}. No apto para anestesia: ${obs}. ${firma}.`;
  if (datos.concepto === 'condiciones') return `Valoración ASA ${datos.asa}. Apto con condiciones: ${obs}. ${firma}.`;
  return `Valoración ASA ${datos.asa}. Apto para anestesia${obs ? `. ${obs}` : ''}. ${firma}.`;
}

// ---- Vínculo con una EVAPRE (evaluación preanestésica de HC Hospitalización) ----

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// "07.OCT.2026" (formato de los registros de HC) -> "2026-10-07".
export function fechaISODeRegistro(fecha) {
  const [d, m, y] = fecha.split('.');
  return `${y}-${String(MESES.indexOf(m) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// El concepto no es un campo de la EVAPRE: se deriva de su clasificación ASA.
// ASA I-II -> apto; III-IV -> apto con condiciones (las recomendaciones de la
// EVAPRE son esas condiciones); V-VI -> no apto. Sin ASA no hay concepto.
export function conceptoDesdeAsa(asa) {
  if (asa === 'I' || asa === 'II') return 'apto';
  if (asa === 'III' || asa === 'IV') return 'condiciones';
  if (asa === 'V' || asa === 'VI') return 'no-apto';
  return '';
}

// Datos de la valoración (mismo shape que el formulario manual) a partir de un
// registro EVAPRE; `evapre` guarda el vínculo para mostrarlo en el detalle.
// Devuelve null si la EVAPRE no tiene ASA (no se puede vincular).
export function datosDesdeEvapre(registro) {
  const asa = registro.contenido?.valores?.estadoFisicoAsa;
  const concepto = conceptoDesdeAsa(asa);
  if (!concepto) return null;
  return {
    fecha: fechaISODeRegistro(registro.fecha),
    anestesiologo: registro.autor,
    asa,
    // Tipo de anestesia planeado en la EVAPRE (value de la plantilla); lo usa el
    // wizard "Nueva cirugía" para precargar el paso 1 (ver datosWizardDesdeSolicitud).
    tipoAnestesia: registro.contenido.valores.tipoAnestesia ?? '',
    concepto,
    observaciones: concepto === 'apto' ? '' : `Ver recomendaciones de la EVAPRE N° ${registro.numero}`,
    evapre: { id: registro.id, numero: registro.numero },
  };
}

// Devuelve una solicitud nueva con el paso "valoracion" resuelto: completo si
// es apto (con o sin condiciones), rechazado si no (eso bloquea la solicitud,
// ver evaluarSolicitud). `registro` guarda lo capturado para "Ver valoración".
export function aplicarValoracion(solicitud, datos) {
  return {
    ...solicitud,
    checklist: {
      ...solicitud.checklist,
      valoracion: {
        ...solicitud.checklist.valoracion,
        estado: datos.concepto === 'no-apto' ? 'rechazada' : 'ok',
        detalle: detalleDe(datos),
        registro: { ...datos },
      },
    },
  };
}
