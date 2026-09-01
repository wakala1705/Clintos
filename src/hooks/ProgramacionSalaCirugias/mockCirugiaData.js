// Mock data de "Programación de Sala de Cirugía" — sin backend, mismo
// criterio que mockAdmisionesData.js/mockProgramacionData.js: datos
// deterministas (nunca Math.random), estado mutable en memoria vía un
// array module-level + funciones que lo reemplazan (nunca mutado in
// place), se resetea al recargar la página.

export const SEDES = [
  { value: '02', label: '02 - Sede Norte' },
  { value: '01', label: '01 - Sede Central' },
];

export const SALAS = [
  { value: 'qx-1', label: 'Quirófano #1', sedeId: '02' },
  { value: 'qx-2', label: 'Quirófano #2', sedeId: '02' },
  { value: 'qx-3', label: 'Quirófano #1', sedeId: '01' },
];

export const ESTADO_FILTRO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'programada', label: 'Programada' },
  { value: 'urgencia', label: 'Urgencia' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'incumplida', label: 'Incumplida' },
];

export const PROCEDIMIENTOS_CATALOGO = [
  'Colecistectomía laparoscópica',
  'Apendicectomía',
  'Hernia inguinal',
  'Histerectomía',
  'Laparoscopia diagnóstica',
  'Hernia umbilical',
  'Artroscopia de rodilla',
];

export const SERVICIOS_CATALOGO = ['Cirugía general', 'Ginecología', 'Ortopedia', 'Urología'];
export const TIPOS_CIRUGIA_CATALOGO = ['Programada', 'Ambulatoria', 'Urgencia'];
export const CIRUJANOS_CATALOGO = ['Dr. Juan García', 'Dr. Carlos Martínez', 'Dra. Ana López', 'Dr. Andrés López'];
export const ANESTESIOLOGOS_CATALOGO = ['Dra. Ana López', 'Dr. Pedro Sánchez'];
export const INSTRUMENTADORAS_CATALOGO = ['María Fernández', 'Laura Gómez'];
export const CIRCULANTES_CATALOGO = ['Luis Ramírez', 'Andrés Molina'];

export const EQUIPOS_CATALOGO = [
  'Torre de laparoscopia',
  'Cauterio',
  'Mesa quirúrgica eléctrica',
  'Monitor de signos vitales',
  'Máquina de anestesia',
];

export const CANASTAS_CATALOGO = [
  {
    nombre: 'Colecistectomía estándar',
    items: [
      { nombre: 'Trocar 5mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Trocar 10mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Pinza Maryland', cantidad: 1, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 10, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 2-0', cantidad: 3, estado: 'disponible' },
      { nombre: 'Clips de titanio', cantidad: 6, estado: 'disponible' },
      { nombre: 'Aguja de Veress', cantidad: 1, estado: 'disponible' },
      { nombre: 'Bolsa de extracción', cantidad: 1, estado: 'disponible' },
      { nombre: 'Solución salina 1000ml', cantidad: 2, estado: 'disponible' },
      { nombre: 'Campo quirúrgico', cantidad: 4, estado: 'disponible' },
      { nombre: 'Guantes estériles talla 7', cantidad: 4, estado: 'disponible' },
      { nombre: 'Hoja de bisturí #11', cantidad: 2, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Apendicectomía estándar',
    items: [
      { nombre: 'Trocar 5mm', cantidad: 2, estado: 'disponible' },
      { nombre: 'Trocar 10mm', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 0', cantidad: 2, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 8, estado: 'disponible' },
      { nombre: 'Bolsa de extracción', cantidad: 1, estado: 'faltante' },
    ],
  },
  {
    nombre: 'Hernia inguinal estándar',
    items: [
      { nombre: 'Malla de polipropileno', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Prolene 2-0', cantidad: 2, estado: 'disponible' },
      { nombre: 'Gasas estériles', cantidad: 6, estado: 'disponible' },
      { nombre: 'Grapadora de malla', cantidad: 1, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Ortopedia menor',
    items: [
      { nombre: 'Artroscopio 4mm', cantidad: 1, estado: 'disponible' },
      { nombre: 'Cánula de irrigación', cantidad: 2, estado: 'disponible' },
      { nombre: 'Sutura PDS 1', cantidad: 2, estado: 'disponible' },
      { nombre: 'Vendaje compresivo', cantidad: 2, estado: 'disponible' },
    ],
  },
  {
    nombre: 'Ginecología mayor',
    items: [
      { nombre: 'Separador de Balfour', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sutura Vicryl 0', cantidad: 4, estado: 'disponible' },
      { nombre: 'Compresas abdominales', cantidad: 6, estado: 'disponible' },
      { nombre: 'Electrobisturí monopolar', cantidad: 1, estado: 'disponible' },
      { nombre: 'Sonda vesical', cantidad: 1, estado: 'faltante' },
    ],
  },
];

export const EQUIPO_ESTADO_LABEL = { disponible: 'Disponible', 'en-uso': 'En uso', mantenimiento: 'Mantenimiento' };
export const FARMACIA_ESTADO_LABEL = { 'en-preparacion': 'En preparación', listo: 'Listo', entregado: 'Entregado' };
export const INSUMO_ESTADO_LABEL = { disponible: 'Disponible', faltante: 'Faltante' };

function pad2(n) { return String(n).padStart(2, '0'); }

export function fechaISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function addDias(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function lunesDeSemana(date) {
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDias(date, diff);
}

const DIA_LABEL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MES_LARGO = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function diasDeSemana(weekStart) {
  const hoyISO = fechaISO(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDias(weekStart, i);
    return {
      fecha: fechaISO(d),
      label: DIA_LABEL[d.getDay()],
      dayNum: `${d.getDate()} ${MES_CORTO[d.getMonth()]}`,
      isToday: fechaISO(d) === hoyISO,
    };
  });
}

// Algoritmo ISO 8601 estándar de número de semana (no se hardcodea a un
// valor fijo — cualquier semana navegada calcula el número real).
export function numeroSemanaISO(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export function rangoSemanaLabel(weekStart) {
  const fin = addDias(weekStart, 6);
  const mismoMes = weekStart.getMonth() === fin.getMonth();
  const mesFin = mismoMes ? '' : ` - ${MES_LARGO[fin.getMonth()]}`;
  return `Semana ${numeroSemanaISO(weekStart)} - ${MES_LARGO[weekStart.getMonth()]}${mesFin} ${fin.getFullYear()}`;
}

export function fechaLabel(fechaISOStr) {
  const [y, m, d] = fechaISOStr.split('-').map(Number);
  return `${pad2(d)}/${pad2(m)}/${y}`;
}

export function fechaHoraLabel(isoDateTimeStr) {
  const [fecha, hora] = isoDateTimeStr.split('T');
  return `${fechaLabel(fecha)} ${hora}`;
}

export function duracionLabel(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFin.split(':').map(Number);
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export function periodKeyDeSemana(weekStart, salaId) {
  return `week:${fechaISO(weekStart)}:${salaId}`;
}

// Semilla: lunes 31 Ago 2026 (semana usada en la referencia visual del
// encargo). Solo sede '02' / sala 'qx-1' viene con datos completos —
// cualquier otra sala/semana arranca vacía (dispara el estado vacío de la
// agenda, ver spec).
export const SEMANA_ANCLA = new Date(2026, 7, 31);

let CIRUGIAS = [
  {
    id: '12345',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'María Pérez', documento: 'CC 52.123.456', edad: 45, sexo: 'Femenino', aseguradora: 'Salud Total EPS',
    },
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Juan García',
    fecha: '2026-08-31',
    horaInicio: '07:00',
    horaFin: '09:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 120, notas: 'Sin complicaciones esperadas.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Juan García' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'disponible' },
      { nombre: 'Monitor de signos vitales', estado: 'disponible' },
    ],
    canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4582', estado: 'en-preparacion', fechaSolicitud: '2026-08-30T14:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
    },
  },
  {
    id: '12346',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Juan Rodríguez', documento: 'CC 79.456.123', edad: 38, sexo: 'Masculino', aseguradora: 'Nueva EPS',
    },
    procedimientoPrincipal: 'Hernia inguinal',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Andrés López',
    fecha: '2026-08-31',
    horaInicio: '09:30',
    horaFin: '11:30',
    estado: 'borrador',
    procedimientos: [
      { nombre: 'Hernia inguinal', tipo: 'principal', duracionMin: 90, notas: 'Abordaje abierto.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Andrés López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Cauterio', estado: 'disponible' },
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
    ],
    canasta: { nombre: 'Hernia inguinal estándar', items: CANASTAS_CATALOGO[2].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4583', estado: 'listo', fechaSolicitud: '2026-08-30T09:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12347',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Ana Torres', documento: 'CC 41.789.456', edad: 52, sexo: 'Femenino', aseguradora: 'Sura EPS',
    },
    procedimientoPrincipal: 'Artroscopia de rodilla',
    servicio: 'Ortopedia',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-08-31',
    horaInicio: '12:00',
    horaFin: '14:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Artroscopia de rodilla', tipo: 'principal', duracionMin: 110, notas: 'Reparación de menisco.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
      { nombre: 'Monitor de signos vitales', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ortopedia menor', items: CANASTAS_CATALOGO[3].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4584', estado: 'entregado', fechaSolicitud: '2026-08-29T16:00',
      medicamentos: [{ nombre: 'Ketorolaco', dosis: '30mg IV' }],
    },
  },
  {
    id: '12348',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Carlos Gómez', documento: 'CC 11.222.333', edad: 60, sexo: 'Masculino', aseguradora: 'Coomeva EPS',
    },
    procedimientoPrincipal: 'Apendicectomía',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-09-01',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Apendicectomía', tipo: 'principal', duracionMin: 100, notas: 'Apendicitis no complicada.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'disponible' },
    ],
    canasta: { nombre: 'Apendicectomía estándar', items: CANASTAS_CATALOGO[1].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4585', estado: 'en-preparacion', fechaSolicitud: '2026-08-31T08:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Metronidazol', dosis: '500mg IV' }],
    },
  },
  {
    id: '12349',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Laura Sánchez', documento: 'CC 98.765.432', edad: 29, sexo: 'Femenino', aseguradora: 'Sanitas EPS',
    },
    procedimientoPrincipal: 'Laparoscopia diagnóstica',
    servicio: 'Ginecología',
    tipoCirugia: 'Urgencia',
    cirujano: 'Dra. Ana López',
    fecha: '2026-09-01',
    horaInicio: '11:00',
    horaFin: '13:00',
    estado: 'urgencia',
    procedimientos: [
      { nombre: 'Laparoscopia diagnóstica', tipo: 'principal', duracionMin: 110, notas: 'Dolor pélvico agudo, descartar embarazo ectópico.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dra. Ana López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'en-uso' },
      { nombre: 'Monitor de signos vitales', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ginecología mayor', items: CANASTAS_CATALOGO[4].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4586', estado: 'en-preparacion', fechaSolicitud: '2026-09-01T10:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12350',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Pedro Ramírez', documento: 'CC 33.444.555', edad: 47, sexo: 'Masculino', aseguradora: 'Salud Total EPS',
    },
    procedimientoPrincipal: 'Colecistectomía laparoscópica',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Juan García',
    fecha: '2026-09-02',
    horaInicio: '07:30',
    horaFin: '10:00',
    estado: 'borrador',
    procedimientos: [
      { nombre: 'Colecistectomía laparoscópica', tipo: 'principal', duracionMin: 130, notas: 'Colecistitis crónica.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Juan García' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Torre de laparoscopia', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'mantenimiento' },
    ],
    canasta: { nombre: 'Colecistectomía estándar', items: CANASTAS_CATALOGO[0].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4587', estado: 'listo', fechaSolicitud: '2026-09-01T15:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
  {
    id: '12351',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Marta Ruiz', documento: 'CC 22.333.444', edad: 41, sexo: 'Femenino', aseguradora: 'Nueva EPS',
    },
    procedimientoPrincipal: 'Histerectomía',
    servicio: 'Ginecología',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Andrés López',
    fecha: '2026-09-03',
    horaInicio: '08:00',
    horaFin: '10:30',
    estado: 'programada',
    procedimientos: [
      { nombre: 'Histerectomía', tipo: 'principal', duracionMin: 150, notas: 'Vía abdominal.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Andrés López' },
      { rol: 'Anestesiólogo', nombre: 'Dr. Pedro Sánchez' },
      { rol: 'Instrumentadora', nombre: 'Laura Gómez' },
      { rol: 'Circulante', nombre: 'Luis Ramírez' },
    ],
    equipos: [
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
      { nombre: 'Cauterio', estado: 'disponible' },
    ],
    canasta: { nombre: 'Ginecología mayor', items: CANASTAS_CATALOGO[4].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4588', estado: 'en-preparacion', fechaSolicitud: '2026-09-02T11:00',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }, { nombre: 'Ondansetrón', dosis: '4mg IV' }],
    },
  },
  {
    id: '12352',
    sedeId: '02',
    salaId: 'qx-1',
    paciente: {
      nombre: 'Andrés Molina', documento: 'CC 55.666.777', edad: 34, sexo: 'Masculino', aseguradora: 'Sura EPS',
    },
    procedimientoPrincipal: 'Hernia umbilical',
    servicio: 'Cirugía general',
    tipoCirugia: 'Programada',
    cirujano: 'Dr. Carlos Martínez',
    fecha: '2026-09-04',
    horaInicio: '11:00',
    horaFin: '13:00',
    estado: 'borrador',
    procedimientos: [
      { nombre: 'Hernia umbilical', tipo: 'principal', duracionMin: 100, notas: 'Reparación con malla.' },
    ],
    personal: [
      { rol: 'Cirujano', nombre: 'Dr. Carlos Martínez' },
      { rol: 'Anestesiólogo', nombre: 'Dra. Ana López' },
      { rol: 'Instrumentadora', nombre: 'María Fernández' },
      { rol: 'Circulante', nombre: 'Andrés Molina' },
    ],
    equipos: [
      { nombre: 'Cauterio', estado: 'disponible' },
      { nombre: 'Mesa quirúrgica eléctrica', estado: 'disponible' },
    ],
    canasta: { nombre: 'Hernia inguinal estándar', items: CANASTAS_CATALOGO[2].items.map((i) => ({ ...i })) },
    farmacia: {
      numeroPedido: '4589', estado: 'en-preparacion', fechaSolicitud: '2026-09-03T09:30',
      medicamentos: [{ nombre: 'Cefazolina', dosis: '1g IV' }],
    },
  },
];

let nextIdSeq = 12353;

export function fetchAgendaSemana({
  sedeId, salaId, weekStart, estado = 'todos',
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const inicio = fechaISO(weekStart);
      const fin = fechaISO(addDias(weekStart, 6));
      const items = CIRUGIAS.filter((c) => {
        if (c.sedeId !== sedeId || c.salaId !== salaId) return false;
        if (c.fecha < inicio || c.fecha > fin) return false;
        if (estado !== 'todos' && c.estado !== estado) return false;
        return true;
      });
      resolve(items);
    }, 250);
  });
}

export function crearCirugia(datos) {
  const id = String(nextIdSeq);
  nextIdSeq += 1;
  const { urgencia, ...resto } = datos;
  const cirugia = { id, estado: urgencia ? 'urgencia' : 'borrador', ...resto };
  CIRUGIAS = [...CIRUGIAS, cirugia];
  return cirugia;
}

export function actualizarCirugia(id, datos) {
  CIRUGIAS = CIRUGIAS.map((c) => (c.id === id ? { ...c, ...datos } : c));
  return CIRUGIAS.find((c) => c.id === id);
}

export function actualizarEstadoCirugia(id, nuevoEstado) {
  return actualizarCirugia(id, { estado: nuevoEstado });
}

export function reprogramarCirugia(id, {
  fecha, horaInicio, horaFin, motivo,
}) {
  return actualizarCirugia(id, {
    fecha, horaInicio, horaFin, motivoReprogramacion: motivo,
  });
}

export function cancelarCirugia(id, motivo) {
  return actualizarCirugia(id, { estado: 'cancelada', motivoCancelacion: motivo });
}
