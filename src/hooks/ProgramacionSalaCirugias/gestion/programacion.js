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

// `hueco` (opcional) es lo elegido en el modal "Programar cirugía": fecha y
// hora del slot, duración, personal y equipos. Sin él se usa la fecha
// tentativa a las 07:00 y la duración estimada de los procedimientos.
export function datosWizardDesdeSolicitud(solicitud, hueco = {}) {
  const autorizada = solicitud.checklist.autorizacion.estado === 'ok';
  const cirujano = hueco.cirujano ?? solicitud.cirujano ?? '';
  return {
    fechaInicio: `${hueco.fecha ?? solicitud.fechaTentativa}T${hueco.hora ?? '07:00'}`,
    duracionEstimada: String(hueco.duracionMin ?? duracionEstimadaMin(solicitud)),
    duracionPostquirurgica: String(hueco.duracionPostquirurgicaMin ?? ''),
    duracionRecuperacion: String(hueco.duracionRecuperacionMin ?? ''),
    dxIngreso: solicitud.dxOrden ?? '',
    idAseguradora: solicitud.eps,
    noAutorizacion: autorizada ? '[N° autorización]' : '',
    procedimientos: listaProcedimientos(solicitud).map((p) => ({
      idCirugia: `${p.cups} - ${p.nombre}`,
      idCirujano: cirujano,
      idAnestesiologo: hueco.anestesiologo ?? '',
      tipoCirugia: '',
      insumos: [],
    })),
    equipos: hueco.equipos ?? [],
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
