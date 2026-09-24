// Datos de Enfermería → Pacientes: los mismos 14 pacientes del piso
// (PACIENTES_PISO, ver mockPanelGeneralData.js) que muestran Panel General e
// Historia Clínica de Hospitalización, en el shape de admisión que consume
// la tabla de Admisiones (AdmisionesTable/AdmisionesToolbar, reutilizadas
// tal cual en PacientesEnfermeria.jsx). Nombre, documento, N° de admisión y
// cama salen de las mismas fuentes que esas otras pantallas, así que el
// paciente coincide 1:1. Todo lo que PACIENTES_PISO no modela (hora de
// ingreso, triage, administradora, tipo de contrato) es ficticio pero
// estable por paciente: se deriva del id de historia, no de un random.
import {
  documentoDe, NOMBRE_COMPLETO, numeroAdmisionDe, PACIENTES_PISO,
} from '@/hooks/GestionEnfermeria/mockPanelGeneralData';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const ADMINISTRADORAS = ['NUEVA EPS', 'SURA EPS', 'SALUD TOTAL', 'ENTIDAD PROMOTORA DE SALUD SANITAS S A S', 'COMPENSAR EPS', 'FAMISANAR'];
const TIPO_CONTRATO_LIST = ['Evento', 'Capitado'];
// Todos ya pasaron por triage (están hospitalizados), sin prioridad 1:
// un paciente en resucitación no estaría en un piso general.
const TRIAGE_LIST = [2, 3, 3, 4, 2, 3, 5];

// '12 Ago' → { iso: '2026-08-12', fecha: '12.AGO.2026' } — las admisiones de
// PACIENTES_PISO están ancladas a 2026 (ver diasEstancia en ese mock).
function fechaDe(admision) {
  const [dia, mes] = admision.split(' ');
  const mesNum = MESES.indexOf(mes) + 1;
  return {
    iso: `2026-${String(mesNum).padStart(2, '0')}-${dia.padStart(2, '0')}`,
    fecha: `${dia.padStart(2, '0')}.${mes.toUpperCase()}.2026`,
  };
}

export const ADMISIONES_PISO = PACIENTES_PISO.map((p, i) => {
  const n = Number(p.id.replace(/\D/g, ''));
  const { iso, fecha } = fechaDe(p.admision);
  return {
    id: p.id,
    numeroAdmision: numeroAdmisionDe(p.id),
    fechaISO: iso,
    fecha,
    hora: `${String(6 + (n % 14)).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`,
    triage: TRIAGE_LIST[n % TRIAGE_LIST.length],
    estado: 'admitido',
    documento: documentoDe(p.id),
    nombreAfiliado: (NOMBRE_COMPLETO[p.id] ?? p.paciente).toUpperCase(),
    atendido: true,
    administradora: ADMINISTRADORAS[i % ADMINISTRADORAS.length],
    tipoContrato: TIPO_CONTRATO_LIST[n % TIPO_CONTRATO_LIST.length],
    tipoAdmision: 'HOSPITALIZACIÓN',
    cama: p.cama,
  };
})
  // Más recientes primero, mismo orden que Admisiones.
  .sort((a, b) => `${b.fechaISO} ${b.hora}`.localeCompare(`${a.fechaISO} ${a.hora}`));

const FETCH_DELAY_MS = 300;

// Misma firma que fetchAdmisiones (mockAdmisionesData.js), para que la
// pantalla maneje búsqueda/estado/loading igual que Admisiones.
// TODO: reemplazar por la llamada real al backend.
export function fetchPacientesPiso({ query = '', searchField = 'numeroAdmision', estado = 'admitido' } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.trim().toLowerCase();
      const items = ADMISIONES_PISO.filter((a) => {
        if (estado !== 'todos' && a.estado !== estado) return false;
        if (!q) return true;
        return String(a[searchField] ?? '').toLowerCase().includes(q);
      });
      resolve({ items, total: items.length });
    }, FETCH_DELAY_MS);
  });
}
