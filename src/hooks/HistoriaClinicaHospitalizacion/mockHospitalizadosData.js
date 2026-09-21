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
import { PACIENTES_PISO } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { DOCTOR } from '@/hooks/HistoriaClinica/mockAgendaData';

export { AREAS_OPERATIVAS, sectorDeCama } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';

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

// Nombre completo (2 nombres + 2 apellidos) por paciente — PACIENTES_PISO
// (compartido con Enfermería, Bed Board y Alertas) solo trae nombre + primer
// apellido, y ese mock no se toca para no alterar las otras pantallas. El
// primer nombre y el primer apellido de cada entrada coinciden con el de
// PACIENTES_PISO, así que es el mismo paciente visto desde Historia Clínica.
const NOMBRE_COMPLETO = {
  'HC-48291': 'María Fernanda González Restrepo',
  'HC-48307': 'Carlos Andrés Rodríguez Molina',
  'HC-48192': 'Ana Lucía Martínez Duque',
  'HC-48321': 'Jorge Iván Ramírez Ospina',
  'HC-47984': 'Patricia Elena López Cardona',
  'HC-48266': 'Luis Alberto Hernández Vélez',
  'HC-48031': 'Sofía Alejandra Torres Bedoya',
  'HC-48345': 'Andrés Felipe Castro Zapata',
  'HC-47892': 'Elena María Vargas Salazar',
  'HC-48215': 'Ricardo Antonio Moreno Giraldo',
  'HC-48176': 'Laura Camila Sánchez Arango',
  'HC-48302': 'Diego Armando Pérez Londoño',
  'HC-47765': 'Carmen Rosa Ruiz Henao',
  'HC-48254': 'Felipe Andrés Gómez Herrera',
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
// ningún documento de mockHistoriaClinicaRecords.js — la pestaña "Historia
// clínica" muestra su estado vacío para estos pacientes.
// Con nombre completo de 4 palabras (2 nombres + 2 apellidos) las iniciales
// son primer nombre + primer apellido (la 1ª y la 3ª), no las dos primeras
// palabras (que serían los dos nombres de pila).
function iniciales(nombre) {
  const partes = nombre.split(' ').filter(Boolean);
  const elegidas = partes.length >= 4 ? [partes[0], partes[2]] : partes.slice(0, 2);
  return elegidas.map((w) => w[0]).join('').toUpperCase();
}

export function getHospitalizadoData(id) {
  const p = PACIENTES_HOSPITALIZADOS.find((x) => x.id === id);
  if (!p) return Promise.resolve(null);
  return Promise.resolve({
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
      documento: `10${p.id.replace(/\D/g, '')}`,
      edad: `${p.edad} años`,
      sexo: p.genero === 'femenino' ? 'Femenino' : 'Masculino',
      eps: 'Salud Total EPS',
      cama: p.cama,
    },
  });
}
