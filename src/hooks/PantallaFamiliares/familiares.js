// Lógica pura de la "Pantalla de familiares" (televisor de la sala de espera):
// qué cirugías se proyectan, con qué datos mínimos y con qué estado. Sin React
// ni acceso al mock, para probarla aislada (ver __tests__/familiares.test.mjs).
//
// Privacidad: la pantalla es pública, así que solo expone un código, el nombre
// abreviado, la hora programada y el estado. Nada clínico (diagnóstico,
// procedimiento, cirujano), ni documento, ni sala.

import { enTableroPorEstado, etapaDe } from '../ProgramacionSalaCirugias/tablero/etapas.js';

// Primer nombre + inicial de un apellido: "Claudia Patricia Ospina Henao" ->
// "Claudia O.", "Marta Elena Cifuentes" -> "Marta C.", "Laura Gómez" ->
// "Laura G.". Con 3+ palabras se toma la tercera (el primer apellido más
// habitual en 4 palabras y el único en 3); con 2, la segunda.
export function nombreAbreviado(nombre) {
  const palabras = String(nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '';
  if (palabras.length === 1) return palabras[0];
  const apellido = palabras[Math.min(2, palabras.length - 1)];
  return `${palabras[0]} ${apellido.charAt(0).toUpperCase()}.`;
}

// Estado en palabras para una familia (no el nombre interno de la etapa).
// "programada" no se proyecta. La derivación (alta/UCI/hospitalización) es un
// dato clínico: se muestra neutro.
export const ESTADO_FAMILIAR = {
  'en-preparacion': { label: 'En preparación', tone: 'preparacion', activa: true },
  'en-quirofano': { label: 'En cirugía', tone: 'cirugia', activa: true },
  'en-recuperacion': { label: 'En recuperación', tone: 'recuperacion', activa: true },
  finalizado: { label: 'Cirugía finalizada', tone: 'finalizada', activa: false },
  derivado: { label: 'Con el equipo médico', tone: 'neutro', activa: false },
};

// Filas de hoy para la pantalla: sin programadas ni canceladas/incumplidas;
// primero las que están en curso (preparación, cirugía, recuperación) y luego
// las ya cerradas, cada grupo por hora programada.
export function filasFamiliares(cirugias) {
  return cirugias
    .filter(enTableroPorEstado)
    .map((c) => ({ cirugia: c, etapa: etapaDe(c) }))
    .filter(({ etapa }) => ESTADO_FAMILIAR[etapa])
    .map(({ cirugia, etapa }) => ({
      id: cirugia.id,
      codigo: String(cirugia.id),
      nombre: nombreAbreviado(cirugia.paciente?.nombre),
      hora: cirugia.horaInicio,
      etapa,
      ...ESTADO_FAMILIAR[etapa],
    }))
    .sort((a, b) => Number(b.activa) - Number(a.activa) || a.hora.localeCompare(b.hora));
}

// Páginas de `tam` filas (la última puede quedar corta). Siempre al menos una.
export function paginar(filas, tam) {
  const paginas = [];
  for (let i = 0; i < filas.length; i += tam) paginas.push(filas.slice(i, i + tam));
  return paginas.length ? paginas : [[]];
}
