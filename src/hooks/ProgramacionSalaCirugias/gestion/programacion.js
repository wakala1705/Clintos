// Puente Gestión de cirugías -> wizard "Nueva cirugía": traduce una solicitud
// con la lista de chequeo completa a lo que NuevaCirugiaWizard espera
// (`patient` + `initialDatos`). Lógica pura; el wizard sigue siendo el dueño
// de la captura y del guardado (armarCirugiaDesdeWizard + crearCirugia).
import { ASA_CATALOGO, DURACIONES_CIRUGIA_CATALOGO, TIPOS_ANESTESIA_CATALOGO } from '../mockCirugiaData.js';
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

// ASA (romano, como lo registra la EVAPRE) -> opción de "Asa" del wizard (ASA_CATALOGO).
const ASA_WIZARD = {
  I: ASA_CATALOGO[0], II: 'Clase 2', III: 'Clase 3', IV: 'Clase 4', V: 'Clase 5', VI: 'Clase 6',
};

// Tipo de anestesia de la EVAPRE -> opción del wizard (TIPOS_ANESTESIA_CATALOGO).
// 'combinada' no tiene equivalente en el catálogo: queda vacío para elegirlo a mano.
const ANESTESIA_WIZARD = {
  general: 'General', regional: 'Bloqueo', neuroaxial: 'Raquídea', sedacion: 'Local asistida', local: 'Local',
};

// Valor del wizard solo si existe en su catálogo (si el catálogo cambia, no se precarga basura).
const enCatalogo = (valor, catalogo) => (catalogo.includes(valor) ? valor : '');

// `hueco` (opcional) es lo elegido en el modal "Programar cirugía": fecha y
// hora del slot, duración, personal y equipos. Sin él se usa la fecha
// tentativa a las 07:00 y la duración estimada de los procedimientos.
export function datosWizardDesdeSolicitud(solicitud, hueco = {}) {
  const autorizada = solicitud.checklist.autorizacion.estado === 'ok';
  const cirujano = hueco.cirujano ?? solicitud.cirujano ?? '';
  // Valoración vinculada a una EVAPRE (o registrada a mano): precarga Asa y Tipo anestesia.
  const valoracion = solicitud.checklist.valoracion?.registro;
  return {
    fechaInicio: `${hueco.fecha ?? solicitud.fechaTentativa}T${hueco.hora ?? '07:00'}`,
    duracionEstimada: String(hueco.duracionMin ?? duracionEstimadaMin(solicitud)),
    duracionPostquirurgica: String(hueco.duracionPostquirurgicaMin ?? ''),
    duracionRecuperacion: String(hueco.duracionRecuperacionMin ?? ''),
    dxIngreso: solicitud.dxOrden ?? '',
    idAseguradora: solicitud.eps,
    asa: enCatalogo(ASA_WIZARD[valoracion?.asa], ASA_CATALOGO),
    tipoAnestesia: enCatalogo(ANESTESIA_WIZARD[valoracion?.tipoAnestesia], TIPOS_ANESTESIA_CATALOGO),
    noAutorizacion: autorizada ? '[N° autorización]' : '',
    quienAutoriza: autorizada ? 'Marcela Ortiz (Auditoría médica)' : '',
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
