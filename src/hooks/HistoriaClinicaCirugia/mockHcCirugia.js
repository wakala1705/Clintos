// Historia clínica de Cirugía (/cirugia/historia-clinica): bandeja de las
// cirugías FINALIZADAS (estado 'realizada') y su informe quirúrgico. La
// cirugía vive en mockCirugiaData.js; acá solo se guarda la HC de cada una
// (en memoria, se pierde al recargar -- mock sin backend). "HC pendiente" =
// cirugía finalizada sin informe quirúrgico; "HC realizada" = con informe.
import {
  SALAS, addDias, fechaHoraRangoLabel, fechaISO, fetchAgendaRango,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Sede fija '02' en todo el módulo de Cirugía (ver PanelGeneral.jsx).
const SEDE_ID = '02';
const SALAS_SEDE = SALAS.filter((s) => s.sedeId === SEDE_ID);
// Ventana de la bandeja: lo finalizado hasta 31 días atrás (cubre el mes en curso).
const DIAS_ATRAS = 31;

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export const ESTADO_HC_LABEL = { pendiente: 'HC pendiente', realizada: 'HC realizada' };

// Informe quirúrgico ya diligenciado de ejemplo: así la bandeja abre con las
// dos columnas de estado (12440 = mastectomía de la semana pasada).
const HC_POR_CIRUGIA = new Map([
  ['12440', {
    id: 'infoqx-12440',
    fecha: '22.OCT.2026',
    hora: '11:05 AM',
    numero: '0201300440',
    tituloNota: 'INFORME QUIRURGICO',
    autor: 'CARLOS MAURICIO BURGOS DURANGO',
    rol: 'Médico',
    especialidad: 'MASTOLOGÍA',
    ambito: 'QX',
    plantilla: 'INFOQX',
    contenido: {
      procedimientoRealizado: 'Mastectomía radical modificada',
      diagnosticoPreoperatorio: 'C509 - TUMOR MALIGNO DE LA MAMA, PARTE NO ESPECIFICADA',
      diagnosticoPosoperatorio: 'C509 - TUMOR MALIGNO DE LA MAMA, PARTE NO ESPECIFICADA',
      hallazgos: 'Tumor de 3 cm en cuadrante superior externo, adherido a fascia pectoral sin invasión muscular.',
      descripcion: 'Incisión elíptica, colgajos cutáneos, disección de fascia pectoral y vaciamiento axilar niveles I-II. Hemostasia, drenaje aspirativo y cierre por planos.',
      complicaciones: 'Ninguna',
      sangrado: '150',
      conteoCompleto: 'si',
      muestrasPatologia: 'si',
      planPosoperatorio: 'Control de drenaje, analgesia, profilaxis antibiótica 24 h y seguimiento por patología.',
    },
  }],
]);

function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const salaLabel = (salaId) => SALAS_SEDE.find((s) => s.value === salaId)?.descripcion ?? salaId;

function formatoFechaHora(date) {
  const dia = String(date.getDate()).padStart(2, '0');
  const hora = date.getHours() % 12 || 12;
  const min = String(date.getMinutes()).padStart(2, '0');
  return {
    fecha: `${dia}.${MESES_CORTOS[date.getMonth()]}.${date.getFullYear()}`,
    hora: `${String(hora).padStart(2, '0')}:${min} ${date.getHours() >= 12 ? 'PM' : 'AM'}`,
  };
}

async function fetchFinalizadas() {
  const hoy = new Date();
  const inicio = fechaISO(addDias(hoy, -DIAS_ATRAS));
  const fin = fechaISO(hoy);
  const porSala = await Promise.all(SALAS_SEDE.map((s) => fetchAgendaRango({
    sedeId: SEDE_ID, salaId: s.value, inicio, fin,
  })));
  return porSala.flat().filter((c) => c.estado === 'realizada');
}

// Filas de la bandeja: la cirugía + su HC (o null), la más reciente primero.
export async function listarCirugiasFinalizadas() {
  const finalizadas = await fetchFinalizadas();
  return finalizadas
    .map((c) => ({ ...c, salaNombre: salaLabel(c.salaId), hc: HC_POR_CIRUGIA.get(c.id) ?? null }))
    .sort((a, b) => `${b.fecha}${b.horaInicio}`.localeCompare(`${a.fecha}${a.horaInicio}`));
}

// Shape de AtencionPaciente (`{ patient, cirugia, hc }`) o null si la cirugía
// no existe o todavía no está finalizada.
export async function getCirugiaHcData(id) {
  const cirugia = (await fetchFinalizadas()).find((c) => c.id === id);
  if (!cirugia) return null;
  const p = cirugia.paciente;
  return {
    cirugia,
    hc: HC_POR_CIRUGIA.get(id) ?? null,
    patient: {
      iniciales: iniciales(p.nombre),
      nombre: p.nombre,
      documento: p.documento.replace(/^CC\s*/, ''),
      edad: `${p.edad} años`,
      sexo: p.sexo,
      eps: p.aseguradora ?? '—',
      fechaHoraCirugia: fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio),
      sala: salaLabel(cirugia.salaId),
      procedimientoPrincipal: cirugia.procedimientoPrincipal,
      cirujano: cirugia.cirujano,
      diagnostico: cirugia.dxIngreso,
    },
  };
}

// Grupos del panel "Historia clínica" de la atención: solo el informe quirúrgico.
export function getRegistrosGruposCirugia(data) {
  return [{ tipo: 'INFOQX', registros: data.hc ? [data.hc] : [] }];
}

// Guarda (o reemplaza) el informe quirúrgico de la cirugía y devuelve el registro.
export function guardarInformeQuirurgico(cirugia, contenido, autor) {
  const previo = HC_POR_CIRUGIA.get(cirugia.id);
  const { fecha, hora } = formatoFechaHora(new Date());
  const registro = {
    id: `infoqx-${cirugia.id}`,
    fecha: previo?.fecha ?? fecha,
    hora: previo?.hora ?? hora,
    numero: previo?.numero ?? `0201${String(300000 + Number(cirugia.id)).slice(-6)}`,
    tituloNota: 'INFORME QUIRURGICO',
    autor,
    rol: 'Médico',
    especialidad: cirugia.servicio.toUpperCase(),
    ambito: 'QX',
    plantilla: 'INFOQX',
    contenido,
  };
  HC_POR_CIRUGIA.set(cirugia.id, registro);
  return registro;
}
