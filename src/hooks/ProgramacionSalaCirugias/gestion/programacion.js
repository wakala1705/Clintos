// Puente Gestión de cirugías -> wizard "Nueva cirugía": traduce una solicitud
// con la lista de chequeo completa a lo que NuevaCirugiaWizard espera
// (`patient` + `initialDatos`). Lógica pura; el wizard sigue siendo el dueño
// de la captura y del guardado (armarCirugiaDesdeWizard + crearCirugia).
import { DURACIONES_CIRUGIA_CATALOGO } from '../mockCirugiaData.js';
import { esAmbulatorio, listaProcedimientos } from './ordenes.js';

const DURACION_POR_DEFECTO_MIN = 120;

// Menor duración del catálogo del wizard que cubre el tiempo estimado.
export function duracionEstimadaMin(solicitud) {
  const total = listaProcedimientos(solicitud)
    .reduce((acc, p) => acc + (p.tiempo ?? DURACION_POR_DEFECTO_MIN), 0);
  const opciones = [...DURACIONES_CIRUGIA_CATALOGO].sort((a, b) => a - b);
  return opciones.find((d) => d >= total) ?? opciones[opciones.length - 1];
}

// El wizard calcula la edad desde `fechaNacimiento`; la solicitud solo trae
// la edad, así que se usa el 1 de enero del año correspondiente.
export function pacienteDeSolicitud(solicitud, hoy) {
  const { paciente } = solicitud;
  return {
    nombre: paciente.nombre,
    documento: paciente.numeroDocumento,
    telefono: '',
    sexo: '',
    eps: solicitud.eps,
    fechaNacimiento: `${hoy.getFullYear() - paciente.edad}-01-01`,
  };
}

export function datosWizardDesdeSolicitud(solicitud, fechaInicioHora = '07:00') {
  const autorizada = solicitud.checklist.autorizacion.estado === 'ok';
  return {
    fechaInicio: `${solicitud.fechaTentativa}T${fechaInicioHora}`,
    duracionEstimada: String(duracionEstimadaMin(solicitud)),
    dxIngreso: solicitud.dxOrden ?? '',
    idAseguradora: solicitud.eps,
    noAutorizacion: autorizada ? '[N° autorización]' : '',
    procedimientos: listaProcedimientos(solicitud).map((p) => ({
      idCirugia: `${p.cups} - ${p.nombre}`,
      idCirujano: solicitud.cirujano ?? '',
      idAnestesiologo: '',
      tipoCirugia: '',
      insumos: [],
    })),
    // Vínculo que queda guardado en la cirugía (ver armarCirugiaDesdeWizard).
    solicitud: {
      id: solicitud.id,
      ordenNumero: solicitud.ordenNumero,
      origen: solicitud.origen,
      medicoOrdena: solicitud.medicoOrdena,
      institucionRemite: solicitud.institucionRemite ?? '',
      ambulatorio: esAmbulatorio(solicitud),
    },
  };
}
