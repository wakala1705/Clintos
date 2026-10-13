// Lógica pura de "Vincular orden médica" del paso Orden del chequeo de Gestión
// de cirugías (simulado): la orden no se escribe a mano, se elige entre las
// órdenes médicas que el paciente ya tiene en el submódulo Órdenes médicas de
// Historia clínica. Sin React ni fecha del sistema.

import { capitalizarNombre } from './gestion.js';

// Tipos de servicio que puede traer una orden de HC (ver mockOrdenesMedicas.js),
// en el orden en que se listan.
const CATEGORIAS = [
  { key: 'cirugias', singular: 'cirugía', plural: 'cirugías', label: 'Cirugía' },
  { key: 'medicamentos', singular: 'medicamento', plural: 'medicamentos', label: 'Medicamento' },
  { key: 'consultas', singular: 'consulta', plural: 'consultas', label: 'Consulta' },
  { key: 'laboratorios', singular: 'laboratorio', plural: 'laboratorios', label: 'Laboratorio' },
];

// Servicios de la orden: [{ id, tipo, descripcion, cantidad }].
export function serviciosDeOrden(orden) {
  return CATEGORIAS.flatMap((c) => (orden[c.key] ?? []).map((i) => ({
    id: `${c.key}-${i.id}`, tipo: c.label, descripcion: i.descripcion, cantidad: i.cantidad,
  })));
}

// "1 cirugía · 2 medicamentos"; '' si la orden no trae servicios.
export function resumenOrden(orden) {
  return CATEGORIAS
    .map((c) => ({ c, n: (orden[c.key] ?? []).length }))
    .filter(({ n }) => n > 0)
    .map(({ c, n }) => `${n} ${n === 1 ? c.singular : c.plural}`)
    .join(' · ');
}

// Una orden con cirugía es la que respalda una solicitud quirúrgica.
export function incluyeCirugia(orden) {
  return (orden.cirugias ?? []).length > 0;
}

// Datos a vincular desde una orden de HC.
export function datosOrdenDesdeHc(orden) {
  return {
    orden: { id: orden.id, numero: orden.numero, fecha: orden.fecha, hora: orden.hora, autor: orden.autor },
  };
}

// Devuelve una solicitud nueva con el paso "orden" completo. `registro` guarda
// la orden de HC vinculada.
export function aplicarOrden(solicitud, datos) {
  const { orden } = datos;
  return {
    ...solicitud,
    checklist: {
      ...solicitud.checklist,
      orden: {
        ...solicitud.checklist.orden,
        estado: 'ok',
        detalle: `Orden médica N° ${orden.numero} vinculada de Historia clínica, emitida el ${orden.fecha} por ${capitalizarNombre(orden.autor)}.`,
        registro: { ...orden },
      },
    },
  };
}
