import {
  LuAtom, LuClipboardList, LuFlaskConical, LuMicroscope, LuPill, LuRadiation,
  LuListChecks, LuScanLine, LuScissors, LuSyringe, LuUserCheck, LuWind,
} from 'react-icons/lu';

// Catálogo único de categorías/secciones de una orden médica: clave, título,
// ícono, tono (ver .op-section-icon.*/.obt-section-icon.* — mismos 6 tonos
// duplicados en OrdenPreview.css y OrdenBuilderTabla.css, criterio de
// duplicación por componente ya establecido en el proyecto para tokens de
// color) y `formulario` ('completo' | 'simple': solo Medicamentos y
// Medicamentos de investigación piden dosis/unidad/presentación/vía, ver
// ItemFormPanel.jsx). Comparten esta lista el riel de "Iniciar nueva orden"
// (CategoriaRail.jsx), la tabla en construcción (OrdenBuilderTabla.jsx) y la
// previsualización de una orden ya guardada (OrdenPreview.jsx) — evita que
// las 3 pantallas diverjan en qué ícono/color/etiqueta representa cada
// categoría.
export const SECCIONES_ORDEN = [
  {
    clave: 'ordenesGenerales', titulo: 'Órdenes generales', icon: LuClipboardList, tono: 'azul', formulario: 'simple',
  },
  {
    clave: 'medicamentos', titulo: 'Medicamentos', icon: LuPill, tono: 'azul', formulario: 'completo',
  },
  {
    clave: 'laboratorios', titulo: 'Laboratorios', icon: LuMicroscope, tono: 'naranja', formulario: 'simple',
  },
  {
    clave: 'procedimientosQuimioterapias', titulo: 'Procedimientos quimioterapias', icon: LuSyringe, tono: 'violeta', formulario: 'simple',
  },
  {
    clave: 'imagenologias', titulo: 'Imagenologías', icon: LuScanLine, tono: 'gris', formulario: 'simple',
  },
  {
    clave: 'cirugias', titulo: 'Cirugías', icon: LuScissors, tono: 'rojo', formulario: 'simple',
  },
  {
    clave: 'consultas', titulo: 'Consultas', icon: LuUserCheck, tono: 'verde', formulario: 'simple',
  },
  {
    clave: 'radioterapiaBraquiterapia', titulo: 'Radioterapia/Braquiterapia', icon: LuRadiation, tono: 'rojo', formulario: 'simple',
  },
  {
    clave: 'medicamentosInvestigacion', titulo: 'Medicamentos de investigación', icon: LuFlaskConical, tono: 'violeta', formulario: 'completo',
  },
  {
    clave: 'medicinaNuclear', titulo: 'Medicina nuclear', icon: LuAtom, tono: 'gris', formulario: 'simple',
  },
  {
    clave: 'oxigeno', titulo: 'Oxígeno', icon: LuWind, tono: 'azul', formulario: 'simple',
  },
  {
    clave: 'protocolosQuimioterapia', titulo: 'Protocolos de quimioterapia', icon: LuListChecks, tono: 'violeta', formulario: 'simple',
  },
];
