// Lógica pura del selector de fecha (@/Components/DatePicker): fechas como
// 'YYYY-MM-DD' (sin hora ni zona horaria), semanas que arrancan en lunes.
// Sin JSX para poder probarla con node:test.

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
export const DIAS_CORTOS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const pad = (n) => String(n).padStart(2, '0');

// `m` es 0-based y `d` puede desbordar (d = 0 → último día del mes anterior).
export function aISO(y, m, d) {
  const dt = new Date(y, m, d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function desdeISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
}

export function esISOValido(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { y, m, d } = desdeISO(iso);
  return aISO(y, m, d) === iso;
}

export function hoyISO() {
  const h = new Date();
  return aISO(h.getFullYear(), h.getMonth(), h.getDate());
}

export function sumarDias(iso, n) {
  const { y, m, d } = desdeISO(iso);
  return aISO(y, m, d + n);
}

// Conserva el día, o el último del mes destino si no existe (31 ene + 1 → 28 feb).
export function sumarMeses(iso, n) {
  const { y, m, d } = desdeISO(iso);
  const ultimo = new Date(y, m + n + 1, 0).getDate();
  return aISO(y, m + n, Math.min(d, ultimo));
}

export function inicioDeSemana(iso) {
  const { y, m, d } = desdeISO(iso);
  return sumarDias(iso, -((new Date(y, m, d).getDay() + 6) % 7));
}

export function finDeSemana(iso) {
  return sumarDias(inicioDeSemana(iso), 6);
}

export function tituloMes(iso) {
  const { y, m } = desdeISO(iso);
  return `${MESES[m][0].toUpperCase()}${MESES[m].slice(1)} ${y}`;
}

// Siempre 6 filas (42 celdas): el panel no cambia de alto al cambiar de mes.
// `fuera` = día de un mes vecino.
export function celdasMes(iso) {
  const { y, m } = desdeISO(iso);
  const primerDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const dias = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => {
    const d = i - primerDow + 1;
    const celda = aISO(y, m, d);
    return { iso: celda, n: desdeISO(celda).d, fuera: d < 1 || d > dias };
  });
}

export function dentroDeRango(iso, min, max) {
  return (!min || iso >= min) && (!max || iso <= max);
}

// "30/09/2026" -- texto por defecto del disparador.
export function fechaCorta(iso) {
  const { y, m, d } = desdeISO(iso);
  return `${pad(d)}/${pad(m + 1)}/${y}`;
}
