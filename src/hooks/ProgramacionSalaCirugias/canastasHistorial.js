// Historial de solicitudes de canastas a farmacia. Datos de ejemplo (mock): no
// hay backend todavía. `estado` usa las mismas claves que resumenCanasta().
const MES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export const HISTORIAL_CANASTAS = [
  { solicitud: '4596', fecha: '2026-09-30T08:10', paciente: 'LAURA PATRICIA MARTÍNEZ GÓMEZ', procedimiento: 'COLECISTECTOMÍA LAPAROSCÓPICA', sala: 'Quirófano #1', estado: 'despachada', solicitadoPor: 'Camilo Grondona', recibidoPor: '—' },
  { solicitud: '4593', fecha: '2026-09-30T07:45', paciente: 'JUAN CARLOS RODRÍGUEZ PÉREZ', procedimiento: 'HERNIORRAFIA INGUINAL', sala: 'Quirófano #1', estado: 'despachada', solicitadoPor: 'Camilo Grondona', recibidoPor: '—' },
  { solicitud: '4590', fecha: '2026-09-30T06:30', paciente: 'MARTA ELENA GÓMEZ RUIZ', procedimiento: 'APENDICECTOMÍA', sala: 'Quirófano #1', estado: 'recibida', solicitadoPor: 'Camilo Grondona', recibidoPor: 'Camilo Grondona' },
  { solicitud: '4588', fecha: '2026-09-29T15:20', paciente: 'PEDRO ANTONIO CASTAÑO LÓPEZ', procedimiento: 'ARTROSCOPIA DE RODILLA', sala: 'Quirófano #2', estado: 'consumo-registrado', solicitadoPor: 'Andrea Ruiz', recibidoPor: 'Andrea Ruiz' },
  { solicitud: '4585', fecha: '2026-09-29T11:05', paciente: 'SOFÍA ALEJANDRA HERRERA DÍAZ', procedimiento: 'CESÁREA SEGMENTARIA', sala: 'Quirófano #3', estado: 'con-novedades', solicitadoPor: 'Camilo Grondona', recibidoPor: 'Luis Ramírez' },
  { solicitud: '4581', fecha: '2026-09-29T09:40', paciente: 'CARLOS ANDRÉS DUARTE MORA', procedimiento: 'PROSTATECTOMÍA ABIERTA', sala: 'Quirófano #2', estado: 'consumo-registrado', solicitadoPor: 'Andrea Ruiz', recibidoPor: 'Andrea Ruiz' },
  { solicitud: '4577', fecha: '2026-09-28T14:15', paciente: 'ANA LUCÍA VÉLEZ OSORIO', procedimiento: 'HISTERECTOMÍA ABDOMINAL', sala: 'Quirófano #3', estado: 'consumo-registrado', solicitadoPor: 'Camilo Grondona', recibidoPor: 'María Fernández' },
  { solicitud: '4574', fecha: '2026-09-28T10:00', paciente: 'JORGE ENRIQUE PATIÑO SOTO', procedimiento: 'REDUCCIÓN ABIERTA DE FÉMUR', sala: 'Quirófano #1', estado: 'con-novedades', solicitadoPor: 'Camilo Grondona', recibidoPor: 'Camilo Grondona' },
  { solicitud: '4570', fecha: '2026-09-27T16:30', paciente: 'ISABEL CRISTINA MORA RAMÍREZ', procedimiento: 'TIROIDECTOMÍA TOTAL', sala: 'Quirófano #2', estado: 'recibida', solicitadoPor: 'Andrea Ruiz', recibidoPor: 'Andrea Ruiz' },
  { solicitud: '4566', fecha: '2026-09-27T08:55', paciente: 'FELIPE ANDRÉS ORTIZ CARDONA', procedimiento: 'LAPAROTOMÍA EXPLORATORIA', sala: 'Quirófano #1', estado: 'en-preparacion', solicitadoPor: 'Camilo Grondona', recibidoPor: '—' },
  { solicitud: '4561', fecha: '2026-09-26T13:25', paciente: 'DANIELA MARÍA RÍOS ARIAS', procedimiento: 'MASTECTOMÍA SIMPLE', sala: 'Quirófano #3', estado: 'consumo-registrado', solicitadoPor: 'Camilo Grondona', recibidoPor: 'Luis Ramírez' },
  { solicitud: '4557', fecha: '2026-09-26T07:20', paciente: 'HÉCTOR FABIO SALAZAR NIETO', procedimiento: 'RESECCIÓN TRANSURETRAL DE PRÓSTATA', sala: 'Quirófano #2', estado: 'en-preparacion', solicitadoPor: 'Andrea Ruiz', recibidoPor: '—' },
];

// "30.SEP.2026 - 08:10" (formato fecha + hora del proyecto).
export function fechaHoraHistorial(iso) {
  const [fecha, hora] = iso.split('T');
  const [y, m, d] = fecha.split('-').map(Number);
  return `${String(d).padStart(2, '0')}.${MES[m - 1]}.${y} - ${hora}`;
}

export function filtrarHistorial(filas, { busqueda = '', estado = 'todas' } = {}) {
  const q = busqueda.trim().toLowerCase();
  return filas.filter((f) => (estado === 'todas' || f.estado === estado)
    && (!q || `${f.solicitud} ${f.paciente} ${f.procedimiento}`.toLowerCase().includes(q)));
}

const INSUMOS_EJEMPLO = [
  { nombre: 'Gasas estériles 10x10', cantidad: 20 },
  { nombre: 'Sutura Vicryl 2-0', cantidad: 4 },
  { nombre: 'Bisturí desechable N.º 11', cantidad: 2 },
  { nombre: 'Guantes quirúrgicos 7.5', cantidad: 6 },
  { nombre: 'Campo quirúrgico desechable', cantidad: 3 },
  { nombre: 'Jeringa 10 ml', cantidad: 5 },
  { nombre: 'Electrodo de cauterio', cantidad: 2 },
];

// Insumos de ejemplo de una solicitud: 4 o 5 ítems, determinístico por número.
export function insumosDeSolicitud(solicitud) {
  const n = Number(solicitud) || 0;
  const cuantos = 4 + (n % 2);
  return Array.from({ length: cuantos }, (_, i) => {
    const base = INSUMOS_EJEMPLO[(n + i) % INSUMOS_EJEMPLO.length];
    return { ...base, cantidad: base.cantidad + (n % 3) };
  });
}
