// Datos mock de la pantalla Monitoreo (Atención de Enfermería) — sin
// persistencia real, ver docs/superpowers/specs/2026-09-02-monitoreo-atencion-enfermeria-design.md.
// La hoja de medicamentos ya no vive acá como mock estático: se deriva en
// vivo de MEDS en @/hooks/GestionEnfermeria/medicamentosStore (ver
// getHojaMedicamentosRows), la misma fuente que usa el timeline de Gestión
// de medicamentos — así ambas vistas quedan 1:1.

export const VITALES_READINGS = [
  {
    id: 'vt-1',
    fecha: '2026-09-02',
    hora: '08:00',
    tas: 120, tad: 80, tam: 93, fr: 16, pulso: 78, temp: 36.8, satO2: 98,
    tomadoPor: 'Marcela Ríos',
    observacion: null,
    areaFuncional: 'Hospitalización',
  },
  {
    id: 'vt-2',
    fecha: '2026-09-02',
    hora: '12:00',
    tas: 150, tad: 95, tam: 113, fr: 18, pulso: 92, temp: 37.1, satO2: 96,
    tomadoPor: 'Marcela Ríos',
    observacion: 'Paciente refiere cefalea leve.',
    areaFuncional: 'Hospitalización',
  },
  {
    id: 'vt-3',
    fecha: '2026-09-02',
    hora: '16:00',
    tas: 118, tad: 76, tam: 90, fr: 15, pulso: 74, temp: 36.6, satO2: 91,
    tomadoPor: 'Julián Pardo',
    observacion: null,
    areaFuncional: 'Hospitalización',
  },
];
