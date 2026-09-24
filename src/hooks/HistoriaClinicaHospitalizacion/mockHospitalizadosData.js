// Datos de ejemplo para Historia Clínica de Hospitalización (ver
// src/Components/HistoriaClinicaHospitalizacion/) — tablero del MÉDICO sobre
// los pacientes hospitalizados a su cargo, distinto del Panel General de
// Enfermería (que mira medicación/dosis) y de Historia Clínica de Consulta
// Externa (agenda de citas). Reutiliza los 14 pacientes del piso
// (PACIENTES_PISO, mockPanelGeneralData.js) para que camas/diagnósticos/días
// de estancia coincidan 1:1 con Enfermería — solo agrega lo clínico propio del
// médico: pendientes (evolución, órdenes por firmar, resultados) y alta
// probable. Todo el módulo es ficticio.
//
// Los KPIs, los contadores de filtro y el panel "Pendientes clínicos" se
// DERIVAN de `pendientes` (nunca un número aparte que pueda desincronizarse
// de la lista real de pacientes) — mismo criterio que PanelGeneral.jsx. A
// diferencia de Enfermería, acá todo (incluido el panel lateral) sí se puede
// recortar por sector, porque cada pendiente pertenece a un paciente con
// cama.
// NOMBRE_COMPLETO/documentoDe/numeroAdmisionDe viven en el mock de
// Enfermería porque sus pantallas también los muestran.
import {
  documentoDe, estanciaLabel, fechaIngresoLarga, NOMBRE_COMPLETO, numeroAdmisionDe, PACIENTES_PISO,
} from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { DOCTOR } from '@/hooks/HistoriaClinica/mockAgendaData';
import { ADMISIONES_PISO } from '@/hooks/GestionEnfermeria/mockPacientesEnfermeriaData';
import { AREAS_FUNCIONALES, datosAdministrativos } from '@/hooks/DetalleAdmision/datosAdministrativos';

export {
  AREAS_OPERATIVAS, estanciaLabel, fechaIngresoLarga, sectorDeCama,
} from '@/hooks/GestionEnfermeria/mockPanelGeneralData';

// tipo: 'evolucion' (nota de evolución del día sin registrar), 'orden'
// (orden médica por firmar/validar), 'resultado' (resultado sin revisar,
// `critico` lo marca fuera de rango). `min` = minutos desde que quedó
// pendiente (alimenta "Hace X" y el orden del panel lateral).
const PENDIENTES_POR_PACIENTE = {
  'HC-48291': [
    { tipo: 'evolucion', detalle: 'Evolución del turno mañana', min: 200 },
    { tipo: 'orden', detalle: 'Ajuste de dosis de antibiótico IV', min: 45 },
  ],
  'HC-48307': [
    { tipo: 'resultado', detalle: 'Glucemia en ayunas', min: 30 },
  ],
  'HC-48192': [
    { tipo: 'evolucion', detalle: 'Evolución del turno mañana', min: 260 },
    { tipo: 'resultado', critico: true, detalle: 'BNP elevado (1.850 pg/mL)', min: 15 },
  ],
  'HC-48321': [
    { tipo: 'orden', detalle: 'Solicitud de ecografía abdominal', min: 90 },
  ],
  'HC-47984': [
    { tipo: 'evolucion', detalle: 'Evolución del turno mañana', min: 320 },
  ],
  'HC-48266': [],
  'HC-48031': [
    { tipo: 'orden', detalle: 'Analgesia postoperatoria', min: 60 },
    { tipo: 'orden', detalle: 'Cuadro hemático de control', min: 120 },
  ],
  'HC-48345': [],
  'HC-47892': [
    { tipo: 'resultado', critico: true, detalle: 'INR 4,8 — fuera de rango', min: 10 },
    { tipo: 'evolucion', detalle: 'Evolución del turno mañana', min: 240 },
  ],
  'HC-48215': [
    { tipo: 'orden', detalle: 'Interconsulta a fisiatría', min: 75 },
  ],
  'HC-48176': [],
  'HC-48302': [
    { tipo: 'resultado', detalle: 'Lipasa sérica de control', min: 70 },
  ],
  'HC-47765': [
    { tipo: 'evolucion', detalle: 'Evolución del turno mañana', min: 150 },
    { tipo: 'resultado', detalle: 'Creatinina y electrolitos', min: 55 },
  ],
  'HC-48254': [],
};

// Pacientes marcados por el médico para egreso hoy/mañana.
const ALTAS_PROBABLES = new Set(['HC-48266', 'HC-48345', 'HC-48254']);

export const TIPO_PENDIENTE_LABEL = {
  evolucion: 'Evolución pendiente',
  orden: 'Orden por firmar',
  resultado: 'Resultado nuevo',
  'resultado-critico': 'Resultado crítico',
};

// critica > alta > media > baja — mismo orden y tonos que las alertas de
// Enfermería (pg-alert-*), aplicado a pendientes clínicos.
const PRIORIDAD_ORDEN = { critica: 0, alta: 1, media: 2, baja: 3 };

function prioridadDe(p) {
  if (p.tipo === 'resultado') return p.critico ? 'critica' : 'baja';
  if (p.tipo === 'evolucion') return 'alta';
  return 'media';
}

export function haceLabel(min) {
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `Hace ${h} h` : `Hace ${h} h ${m} min`;
}

export const PACIENTES_HOSPITALIZADOS = PACIENTES_PISO.map((p) => {
  const pendientes = (PENDIENTES_POR_PACIENTE[p.id] ?? []).map((x, i) => ({
    ...x,
    id: `${p.id}-${i}`,
    prioridad: prioridadDe(x),
    tipoLabel: TIPO_PENDIENTE_LABEL[x.tipo === 'resultado' && x.critico ? 'resultado-critico' : x.tipo],
    hace: haceLabel(x.min),
  }));
  return {
    ...p,
    paciente: NOMBRE_COMPLETO[p.id] ?? p.paciente,
    pendientes,
    evolucionPendiente: pendientes.some((x) => x.tipo === 'evolucion'),
    ordenesPorFirmar: pendientes.filter((x) => x.tipo === 'orden').length,
    resultadosNuevos: pendientes.filter((x) => x.tipo === 'resultado').length,
    resultadosCriticos: pendientes.filter((x) => x.tipo === 'resultado' && x.critico).length,
    altaProbable: ALTAS_PROBABLES.has(p.id),
  };
});

// Pendientes de un conjunto de pacientes, ya aplanados con el contexto del
// paciente (cama/nombre) y ordenados por prioridad y luego antigüedad — es
// lo que consume el panel lateral (top N) y su contador.
export function pendientesOrdenados(pacientes) {
  return pacientes
    .flatMap((p) => p.pendientes.map((x) => ({
      ...x, paciente: p.paciente, cama: p.cama, pacienteId: p.id,
    })))
    .sort((a, b) => PRIORIDAD_ORDEN[a.prioridad] - PRIORIDAD_ORDEN[b.prioridad] || b.min - a.min);
}

// ---------- Detalle de un paciente hospitalizado (ruta [id]) ----------
// Arma el shape que espera PatientBanner (ver getAtencionData en
// mockAgendaData.js, su equivalente para citas de Consulta Externa) a partir
// del paciente del piso. `documento` es un CC ficticio derivado del id de
// historia (no hay documento real en PACIENTES_PISO), y no coincide con
// ningún documento de mockHistoriaClinicaRecords.js — por eso la pestaña
// "Historia clínica" no busca por documento acá: AtencionPaciente usa
// getRegistrosGruposHospitalizacion() (mismo set de registros de ejemplo que
// Consulta Externa) para todos los hospitalizados.
// Con nombre completo de 4 palabras (2 nombres + 2 apellidos) las iniciales
// son primer nombre + primer apellido (la 1ª y la 3ª), no las dos primeras
// palabras (que serían los dos nombres de pila).
function iniciales(nombre) {
  const partes = nombre.split(' ').filter(Boolean);
  const elegidas = partes.length >= 4 ? [partes[0], partes[2]] : partes.slice(0, 2);
  return elegidas.map((w) => w[0]).join('').toUpperCase();
}

// Alergias de ejemplo por paciente — solo María Fernanda tiene, para ver el
// chip "Alergias" de PatientBanner; el resto no muestra el chip. Mismo shape
// que `allergies` en mockAgendaData.js.
const ALERGIAS_POR_PACIENTE = {
  'HC-48291': [
    { name: 'Penicilina', reaction: 'Reacción cutánea moderada' },
    { name: 'Ibuprofeno', reaction: 'Broncoespasmo leve' },
  ],
};

// Fila completa de PACIENTES_HOSPITALIZADOS (pendientes/evolucionPendiente/
// ordenesPorFirmar/resultadosNuevos incluidos) para UN paciente por id — a
// diferencia de getHospitalizadoData() de abajo, que arma el shape distinto
// que espera PatientBanner (patient.nombre, no .paciente). Consumida por
// AtencionPaciente.jsx para darle a <ClintosAI/> el mismo shape de paciente
// que ya usa clintosAiEngine.js (answerForSelectedPatient/buildDraftText),
// en vez de traducir entre los dos shapes.
export function getPacienteHospitalizado(id) {
  return PACIENTES_HOSPITALIZADOS.find((p) => p.id === id) ?? null;
}

// Versión síncrona de getHospitalizadoData — la usa AtencionEnfermeria.jsx
// para que el banner de Enfermería muestre el mismo paciente (mismo nombre,
// documento, admisión y cama) que Historia Clínica de Hospitalización.
export function buildHospitalizadoData(id) {
  const p = PACIENTES_HOSPITALIZADOS.find((x) => x.id === id);
  if (!p) return null;
  return {
    hospitalizacion: {
      cama: p.cama,
      admision: p.admision,
      diasEstancia: p.diasEstancia,
      diagnostico: p.diagnostico,
      medico: `Dr. ${DOCTOR.nombre}`,
    },
    patient: {
      iniciales: iniciales(p.paciente),
      nombre: p.paciente,
      documento: documentoDe(p.id),
      numeroAdmision: numeroAdmisionDe(p.id),
      // Campo fijo de PatientBanner (fila 2, entre N° Admisión y Cama).
      fechaIngreso: `${fechaIngresoLarga(p.ingreso)} (${estanciaLabel(p).toLowerCase()})`,
      edad: `${p.edad} años`,
      sexo: p.genero === 'femenino' ? 'Femenino' : 'Masculino',
      // Mismo contratante que el modal "Ver detalle" (getDetalleAdmision) y
      // Enfermería → Pacientes: la administradora de su admisión, no un
      // valor fijo igual para todos.
      eps: ADMISIONES_PISO.find((a) => a.id === p.id)?.administradora ?? '—',
      cama: p.cama,
      diagnostico: p.diagnostico,
      medicoTratante: `Dr. ${DOCTOR.nombre}`,
      allergies: ALERGIAS_POR_PACIENTE[p.id],
    },
  };
}

export function getHospitalizadoData(id) {
  return Promise.resolve(buildHospitalizadoData(id));
}

// ---------- Detalle de admisión (menú "⋯" → "Ver detalle") ----------
// Shape que consume @/Components/DetalleAdmisionModal (compartido con
// Admisiones, ver detalleDesdeAdmision en mockAdmisionesData.js).
// Contratante y tipo de contrato salen de ADMISIONES_PISO (la misma admisión
// que muestra Enfermería → Pacientes); médico de ingreso, acompañante,
// usuarios y régimen de datosAdministrativos (ficticios, estables por
// paciente).
function horaDe(fecha) {
  return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function getDetalleAdmision(id) {
  const p = PACIENTES_HOSPITALIZADOS.find((x) => x.id === id);
  if (!p) return null;
  const adm = ADMISIONES_PISO.find((a) => a.id === id);
  const n = Number(id.replace(/\D/g, ''));
  const admin = datosAdministrativos(n);
  // Algunos pacientes entraron por Urgencias y luego subieron a piso.
  const ingresoPorUrgencias = n % 3 !== 0;

  return {
    id: p.id,
    iniciales: iniciales(p.paciente),
    nombre: p.paciente,
    documento: documentoDe(p.id),
    // Edad detallada "33 años 6 meses 30 días" (formato del panel de
    // Admisiones) — meses/días ficticios estables por paciente.
    edadDetallada: `${p.edad} años ${n % 12} meses ${n % 28} días`,
    sexo: p.genero === 'femenino' ? 'Femenino' : 'Masculino',
    numeroAdmision: numeroAdmisionDe(p.id),
    historia: p.id,
    fechaIngreso: fechaIngresoLarga(p.ingreso),
    horaIngreso: horaDe(p.ingreso),
    estancia: estanciaLabel(p),
    nuevoIngreso: p.nuevoIngreso,
    prolongada: p.prolongada,
    diagnostico: p.diagnostico,
    cama: p.cama,
    habitacion: `P${p.cama.split('-')[0]}`,
    areaIngreso: ingresoPorUrgencias ? AREAS_FUNCIONALES.urgencias : AREAS_FUNCIONALES.hospitalizacion,
    areaActual: AREAS_FUNCIONALES.hospitalizacion,
    medicoTratante: `Dr. ${DOCTOR.nombre}`,
    contratante: adm?.administradora ?? null,
    tipoContrato: adm?.tipoContrato ?? null,
    regimen: admin.regimen,
    medicoIngreso: admin.medicoIngreso,
    acompanante: admin.acompanante,
    usuarioIngresa: admin.usuarioIngresa,
    // Sigue hospitalizado: nadie le ha dado alta todavía.
    usuarioAlta: null,
  };
}
