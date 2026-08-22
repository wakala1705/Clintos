// Mock de "Indicadores" — centro analítico del módulo (encargo: "más
// analítico y profundo que Resumen"), separado de mockResumenData.js: acá
// no hay auditoría/accesos rápidos, solo comparación y series temporales.
// Sedes con "Sede Oriente" (4, no las 3 de Camas/Integridad): la referencia
// visual del encargo trae sus números ya calculados para 4 sedes — se
// documenta acá el motivo de la diferencia en vez de forzar 3 y perder
// fidelidad con los ejemplos exactos del prompt.

export function formatFechaHora(timestampMs) {
  const d = new Date(timestampMs);
  const fecha = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${fecha}, ${hora}`;
}

export const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: 'centro', label: 'Sede Centro' },
  { value: 'norte', label: 'Sede Norte' },
  { value: 'sur', label: 'Sede Sur' },
  { value: 'oriente', label: 'Sede Oriente' },
];
export const SEDE_LABEL = Object.fromEntries(SEDES.map((s) => [s.value, s.label]));

export const SERVICIOS = [
  { value: 'todos', label: 'Todos los servicios' },
  { value: 'uci-adultos', label: 'UCI Adultos' },
  { value: 'uci-neonatal', label: 'UCI Neonatal' },
  { value: 'ginecobstetricia', label: 'Ginecobstetricia' },
  { value: 'hospitalizacion', label: 'Hospitalización' },
  { value: 'pediatria', label: 'Pediatría' },
];
export const SERVICIO_LABEL = Object.fromEntries(SERVICIOS.map((s) => [s.value, s.label]));

export const PERIODOS = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: '90d', label: 'Últimos 90 días' },
  { value: 'anio', label: 'Este año' },
  { value: 'personalizado', label: 'Personalizado' },
];

// KPIs principales (encargo, sección 4) — números fijos de contexto, mismo
// criterio que RESUMEN_KPIS en mockResumenData.js: no se recalculan por
// combinación de filtros (Sede/Servicio/Periodo), documentado también en el
// header de GestionCamasIndicadores.jsx. `favorableWhen` decide el color de
// la comparación (encargo sección 17: "no asumir que todo incremento es
// positivo" — acá SÍ están codificados según el ejemplo del prompt, ninguno
// se infiere).
export const KPI_PRINCIPALES = [
  {
    id: 'ocupacion', label: 'Ocupación promedio', valor: 82.2, unidad: '%', meta: 85, metaLabel: 'Meta: 85%', variacion: -2.4, unidadVariacion: '%', favorableWhen: 'up',
  },
  {
    id: 'disponibilidad', label: 'Disponibilidad promedio', valor: 17.8, unidad: '%', meta: 15, metaLabel: 'Meta: 15%', variacion: 2.4, unidadVariacion: '%', favorableWhen: 'up',
  },
  {
    id: 'rotacion', label: 'Rotación promedio', valor: 1.8, unidad: '', descripcion: 'Pacientes / cama / día', variacion: 0.2, unidadVariacion: '', favorableWhen: 'up',
  },
  {
    id: 'limpieza', label: 'Tiempo promedio de limpieza', valor: 32, unidad: ' min', meta: 30, metaLabel: 'Meta: 30 min', variacion: -5, unidadVariacion: ' min', favorableWhen: 'down',
  },
  {
    id: 'fueraServicio', label: 'Camas fuera de servicio', valor: 32, unidad: '', descripcion: '6.3% del total', variacion: 3, unidadVariacion: '', favorableWhen: 'down',
  },
];

// Indicadores por servicio (encargo, sección 9 — valores EXACTOS del
// prompt). `fueraServicio` guarda cantidad + % ya calculado (no se deriva de
// un total de camas por servicio que el mock no modela).
export const INDICADORES_POR_SERVICIO = [
  {
    servicio: 'uci-adultos', ocupacion: 96, disponibilidad: 4, rotacion: 2.1, limpieza: 28, fueraServicio: 2, fueraServicioPct: 4,
  },
  {
    servicio: 'uci-neonatal', ocupacion: 92, disponibilidad: 8, rotacion: 1.9, limpieza: 25, fueraServicio: 1, fueraServicioPct: 3,
  },
  {
    servicio: 'ginecobstetricia', ocupacion: 88, disponibilidad: 12, rotacion: 1.7, limpieza: 30, fueraServicio: 2, fueraServicioPct: 5,
  },
  {
    servicio: 'hospitalizacion', ocupacion: 82, disponibilidad: 18, rotacion: 1.6, limpieza: 35, fueraServicio: 12, fueraServicioPct: 7,
  },
  {
    servicio: 'pediatria', ocupacion: 68, disponibilidad: 32, rotacion: 1.2, limpieza: 40, fueraServicio: 6, fueraServicioPct: 6,
  },
];

// Indicadores por sede (encargo, sección 10 — valores EXACTOS del prompt).
export const INDICADORES_POR_SEDE = [
  {
    sede: 'centro', ocupacion: 84.6, disponibilidad: 15.4, rotacion: 1.7, limpieza: 31, fueraServicio: 18, fueraServicioPct: 6,
  },
  {
    sede: 'norte', ocupacion: 80.1, disponibilidad: 19.9, rotacion: 1.6, limpieza: 33, fueraServicio: 10, fueraServicioPct: 5,
  },
  {
    sede: 'sur', ocupacion: 78.3, disponibilidad: 21.7, rotacion: 1.5, limpieza: 34, fueraServicio: 8, fueraServicioPct: 4,
  },
  {
    sede: 'oriente', ocupacion: 76.0, disponibilidad: 24.0, rotacion: 1.4, limpieza: 36, fueraServicio: 6, fueraServicioPct: 4,
  },
];

// Tiempos adicionales (encargo, sección 14) — el documento fuente solo
// define estos 3; no se inventan más.
export const TIEMPOS_ADICIONALES = [
  { id: 'limpieza', label: 'Tiempo promedio de limpieza', valor: 32, unidad: ' min' },
  { id: 'liberacion', label: 'Tiempo promedio de liberación', valor: 18, unidad: ' min' },
  { id: 'fueraServicio', label: 'Tiempo promedio fuera de servicio', valor: 4.2, unidad: ' h' },
];

// Motivos de "Fuera de servicio" (encargo, sección 15 — valores exactos).
export const MOTIVOS_FUERA_SERVICIO = [
  { motivo: 'Mantenimiento', pct: 42 },
  { motivo: 'Daño', pct: 27 },
  { motivo: 'Adecuación', pct: 18 },
  { motivo: 'Otros', pct: 13 },
];

// Config de cada tab (encargo sección 5: "estructura común de análisis", no
// 6 páginas independientes) — `campoServicio`/`campoSede` apuntan a la
// columna de INDICADORES_POR_SERVICIO/SEDE que ese tab visualiza en sus
// cards de "Por servicio"/"Por sede"; `favorableWhen` alimenta el mismo
// criterio de color que los KPI principales. "Utilización" no tiene fórmula
// propia en el documento fuente — reusa Ocupación como proxy (documentado
// acá en vez de inventar un segundo modelo de datos).
export const TABS = [
  {
    id: 'ocupacion', label: 'Ocupación', unidad: '%', meta: 85, favorableWhen: 'up', campo: 'ocupacion', decimales: 0,
    tooltip: 'Porcentaje promedio de camas ocupadas respecto al total de camas habilitadas durante el período seleccionado.',
  },
  {
    id: 'disponibilidad', label: 'Disponibilidad', unidad: '%', meta: 15, favorableWhen: 'up', campo: 'disponibilidad', decimales: 0,
    tooltip: 'Porcentaje promedio de camas habilitadas que permanecieron disponibles durante el período seleccionado.',
  },
  {
    id: 'utilizacion', label: 'Utilización', unidad: '%', meta: null, favorableWhen: 'up', campo: 'ocupacion', decimales: 0,
    tooltip: 'Porcentaje de tiempo en que una cama estuvo efectivamente en uso respecto al tiempo total disponible (se calcula igual que Ocupación; el documento de Bed Management no define una fórmula distinta).',
  },
  {
    id: 'rotacion', label: 'Rotación', unidad: '', meta: null, favorableWhen: 'up', campo: 'rotacion', decimales: 1,
    tooltip: 'Número promedio de pacientes atendidos por cada cama durante un día.',
  },
  {
    id: 'tiempos', label: 'Tiempos', unidad: ' min', meta: 30, favorableWhen: 'down', campo: 'limpieza', decimales: 0,
    tooltip: 'Tiempo promedio que transcurre en cada etapa operativa de la cama: limpieza, liberación y fuera de servicio.',
  },
  {
    id: 'fuera-servicio', label: 'Fuera de servicio', unidad: '', meta: null, favorableWhen: 'down', campo: 'fueraServicioPct', decimales: 0,
    tooltip: 'Cantidad de camas fuera de servicio y su distribución por servicio, sede y motivo.',
  },
];
export const TAB_BY_ID = Object.fromEntries(TABS.map((t) => [t.id, t]));

const PUNTOS_POR_GRANULARIDAD = { diario: 14, semanal: 8, mensual: 6 };
const LABEL_POR_GRANULARIDAD = {
  diario: (i, n) => `${i + 1} may`,
  semanal: (i) => `Sem ${i + 1}`,
  mensual: (i) => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'][i % 6],
};

// Serie temporal determinística (sin Math.random en render: se genera una
// sola vez por combinación tab+granularidad, ver useMemo en
// GestionCamasIndicadores.jsx) — oscila suavemente alrededor del valor
// actual del tab, terminando justo en ese valor (mismo criterio que
// TENDENCIA_SERIE en mockResumenData.js: la card de evolución siempre cierra
// en el KPI que ya se muestra arriba, para que ambos no se contradigan).
export function generarSerie(valorActual, granularidad) {
  const n = PUNTOS_POR_GRANULARIDAD[granularidad];
  const labelFn = LABEL_POR_GRANULARIDAD[granularidad];
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const oscilacion = Math.sin(i * 1.3) * (valorActual * 0.05);
    const acercamiento = 1 - Math.abs(1 - t) * 0.4;
    const valor = i === n - 1 ? valorActual : Math.max(0, valorActual + oscilacion * acercamiento - valorActual * 0.03);
    return { label: labelFn(i, n), valor: Math.round(valor * 10) / 10 };
  });
}

export const ULTIMA_ACTUALIZACION = Date.now();
