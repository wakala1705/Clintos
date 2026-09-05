// Fuente única de los medicamentos de "Atención de enfermería": antes
// legacy-app.js (Gestión de medicamentos) tenía su propio MEDS con 14
// medicamentos y HojaMedicamentosTab (Monitoreo) leía un mock estático
// separado de solo 5 filas — así divergían (9 dosis ya administradas en
// Gestión vs. 4 filas en Hoja, sin relación 1:1 entre ambas). MEDS vive acá
// para que las dos vistas lean el mismo dato: legacy-app.js sigue mutando
// este mismo arreglo (administrar/suspender/deshacer...) y getHojaMedicamentosRows()
// deriva la hoja histórica leyendo esas mismas dosis.

export const MEDS = [
  { name:'ENOXAPARINA SODICA 40 MG SOLUCION INYECTABLE', dose:'40 mg', freq:'c/12h', via:'SC', estado:'activo',
    lote:'ENX-2291', vencimiento:'11/2026', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'OMEPRAZOL SODICO 40 MG SOLUCION INYECTABLE', dose:'40 mg', freq:'c/12h', via:'IV', estado:'activo',
    lote:'OMZ-0457', vencimiento:'03/2027', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'METAMIZOL 2.5 G / 5 ML SOLUCION INYECTABLE - NOVALGINA', dose:'1 g', freq:'c/8h', via:'IV', estado:'activo',
    lote:'MTZ-1188', vencimiento:'08/2026', profesional:'Enf. Carlos Ruiz',
    markersByDate:{} },
  { name:'CEFTRIAXONA SODICA 1 G SOLUCION INYECTABLE', dose:'1 g', freq:'c/12h', via:'IV', estado:'activo',
    lote:'CFX-3305', vencimiento:'01/2027', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'DEXAMETASONA 4 MG SOLUCION INYECTABLE', dose:'8 mg', freq:'c/8h', via:'IV', estado:'suspendido',
    lote:'DXM-0876', vencimiento:'05/2026', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'ONDANSETRON 8MG / 4ML SOLUCION INYECTABLE', dose:'8 mg', freq:'c/12h', via:'IV', estado:'activo',
    lote:'OND-2210', vencimiento:'09/2026', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'ACETAMINOFEN 500 MG TABLETA', dose:'500 mg', freq:'c/6h', via:'VO', estado:'finalizado',
    lote:'ACT-5541', vencimiento:'12/2026', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'VANCOMICINA 1 G SOLUCION INYECTABLE', dose:'1 g', freq:'c/12h', via:'IV', estado:'activo',
    lote:'VCM-4402', vencimiento:'02/2027', profesional:'Enf. Carlos Ruiz',
    markersByDate:{} },
  { name:'INSULINA CRISTALINA 100 UI/ML SOLUCION INYECTABLE', dose:'según esquema', freq:'c/8h', via:'SC', estado:'activo',
    lote:'INS-7790', vencimiento:'06/2026', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'FUROSEMIDA 20 MG SOLUCION INYECTABLE', dose:'20 mg', freq:'c/24h', via:'IV', estado:'activo',
    lote:'FRS-1123', vencimiento:'04/2027', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'METOCLOPRAMIDA 10 MG SOLUCION INYECTABLE', dose:'10 mg', freq:'c/8h', via:'IV', estado:'activo',
    lote:'MTC-9021', vencimiento:'09/2027', profesional:'Enf. Camilo Grondona',
    markersByDate:{} },
  { name:'HIDROCORTISONA 100 MG SOLUCION INYECTABLE', dose:'100 mg', freq:'c/6h', via:'IV', estado:'suspendido',
    lote:'HDC-6654', vencimiento:'07/2026', profesional:'Enf. Carlos Ruiz',
    markersByDate:{} },
  { name:'TRAMADOL 50 MG SOLUCION INYECTABLE - PRN', dose:'50 mg', freq:'PRN c/8h', via:'IV', estado:'activo',
    lote:'TRM-9081', vencimiento:'10/2026', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
  { name:'COMPLEJO B MULTIVITAMINICO TABLETA', dose:'1 tableta', freq:'c/24h', via:'VO', estado:'finalizado',
    lote:'CBM-3317', vencimiento:'01/2027', profesional:'Enf. Laura Gómez',
    markersByDate:{} },
];

// markersByDate se llena con la fecha del sistema en tiempo de carga (mismo
// TODAY_DATE que calcula legacy-app.js) — así el mock siempre "hoy tiene
// dosis" sin importar cuándo se abra la app, en vez de quedar hardcodeado a
// una fecha fija que expira.
function getSystemTodayDate(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
const TODAY_DATE = getSystemTodayDate();
const INITIAL_MARKERS_BY_MED_NAME = {
  'ENOXAPARINA SODICA 40 MG SOLUCION INYECTABLE': {8:'administered', 20:'scheduled'},
  'OMEPRAZOL SODICO 40 MG SOLUCION INYECTABLE': {10:'incident', 22:'scheduled'},
  'METAMIZOL 2.5 G / 5 ML SOLUCION INYECTABLE - NOVALGINA': {6:'administered', 12:'upcoming', 18:'scheduled'},
  'CEFTRIAXONA SODICA 1 G SOLUCION INYECTABLE': {8:'administered', 20:'scheduled'},
  'DEXAMETASONA 4 MG SOLUCION INYECTABLE': {6:'administered', 14:'suspended', 22:'suspended'},
  'ONDANSETRON 8MG / 4ML SOLUCION INYECTABLE': {8:'administered', 20:'scheduled'},
  'ACETAMINOFEN 500 MG TABLETA': {0:'administered', 6:'administered', 12:'administered', 18:'administered'},
  'VANCOMICINA 1 G SOLUCION INYECTABLE': {2:'administered', 14:'upcoming'},
  'INSULINA CRISTALINA 100 UI/ML SOLUCION INYECTABLE': {6:'administered', 14:'administered', 22:'scheduled'},
  'FUROSEMIDA 20 MG SOLUCION INYECTABLE': {8:'administered'},
  'METOCLOPRAMIDA 10 MG SOLUCION INYECTABLE': {8:'administered', 16:'scheduled', 0:'scheduled'},
  'HIDROCORTISONA 100 MG SOLUCION INYECTABLE': {0:'administered', 6:'suspended', 12:'suspended', 18:'suspended'},
  'TRAMADOL 50 MG SOLUCION INYECTABLE - PRN': {14:'upcoming', 22:'scheduled'},
  'COMPLEJO B MULTIVITAMINICO TABLETA': {8:'administered'},
};
MEDS.forEach((med) => {
  med.markersByDate[TODAY_DATE] = { ...INITIAL_MARKERS_BY_MED_NAME[med.name] };
});

const listeners = new Set();

// legacy-app.js llama a esto al final de renderMedRows() — el único punto
// por el que pasan todas las mutaciones de MEDS (administrar, deshacer,
// suspender, devolver, registro múltiple, nueva prescripción...) antes de
// pintar el timeline, así que es el hook natural para avisarle a React que
// los datos derivados (Hoja de medicamentos) quedaron desactualizados.
export function notifyMedicamentosChanged() {
  listeners.forEach((fn) => fn());
}

export function subscribeMedicamentos(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function turnoPorHora(hour) {
  if (hour >= 6 && hour < 14) return 'manana';
  if (hour >= 14 && hour < 20) return 'tarde';
  return 'noche';
}

function hourLabel(h) {
  return String(h).padStart(2, '0') + ':00';
}

// Filas "resueltas" de una toma: Hoja de medicamentos es un registro
// histórico de lo ya ocurrido, así que solo entran los 3 estados que ya se
// resolvieron (administrada/con incidencia/suspendida) — 'scheduled' y
// 'upcoming' todavía no pasaron y no son parte de esta hoja.
const ESTADOS_HOJA = new Set(['administered', 'incident', 'suspended']);

export function getHojaMedicamentosRows() {
  const rows = [];
  MEDS.forEach((med) => {
    if (!med.markersByDate) return;
    Object.keys(med.markersByDate).sort().forEach((dateStr) => {
      const dayMarkers = med.markersByDate[dateStr];
      Object.keys(dayMarkers)
        .map(Number)
        .sort((a, b) => a - b)
        .forEach((hour) => {
          const estado = dayMarkers[hour];
          if (!ESTADOS_HOJA.has(estado)) return;
          const reg = med.registrations && med.registrations[dateStr] && med.registrations[dateStr][hour];
          rows.push({
            id: `${med.lote}-${dateStr}-${hour}`,
            medicamento: { nombre: med.name, dosis: med.dose, via: med.via, frecuencia: med.freq },
            programado: hourLabel(hour),
            real: reg ? reg.horaReal : null,
            administradoPor: reg ? reg.profesional : null,
            estado,
            nota: (reg && reg.observaciones) || (estado === 'suspended' ? 'Suspendido por orden médica.' : null),
            turno: turnoPorHora(hour),
          });
        });
    });
  });
  return rows;
}
