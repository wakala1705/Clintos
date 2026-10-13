// Lógica pura del registro de la autorización de la EPS (paso Autorización del
// chequeo de Gestión de cirugías). Sin React ni fecha del sistema: la fecha del
// registro la pasa quien llama.

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// Date -> "13.OCT.2026 - 14:05" (formato de fecha con hora del proyecto).
export function formatoFechaHora(fecha) {
  const dd = String(fecha.getDate()).padStart(2, '0');
  const hh = String(fecha.getHours()).padStart(2, '0');
  const mm = String(fecha.getMinutes()).padStart(2, '0');
  return `${dd}.${MESES[fecha.getMonth()]}.${fecha.getFullYear()} - ${hh}:${mm}`;
}

// Errores por campo ({} si es válido). El documento de soporte es opcional.
export function validarAutorizacion(datos) {
  const errores = {};
  if (!datos.numero.trim()) errores.numero = 'Ingresa el N° de autorización.';
  return errores;
}

// Devuelve una solicitud nueva con el paso "autorizacion" completo. `registro`
// guarda el N°, el documento y quién lo registró: el wizard "Nueva cirugía"
// los precarga en "No. autorización" y "Quién autoriza" (ver
// datosWizardDesdeSolicitud). `archivoUrl` (si el soporte es un PDF) lo abre
// "Ver autorización".
export function aplicarAutorizacion(solicitud, datos) {
  const numero = datos.numero.trim();
  const { registradoPor, archivo, fechaRegistro } = datos;
  const soporte = archivo ? ` Soporte: ${archivo.nombre}.` : '';
  return {
    ...solicitud,
    checklist: {
      ...solicitud.checklist,
      autorizacion: {
        ...solicitud.checklist.autorizacion,
        estado: 'ok',
        detalle: `Autorización N° ${numero} registrada por ${registradoPor.nombre} (${registradoPor.rol}) el ${fechaRegistro}.${soporte}`,
        archivoUrl: archivo?.url,
        registro: {
          numero, archivo: archivo ?? null, registradoPor, fechaRegistro,
        },
      },
    },
  };
}
