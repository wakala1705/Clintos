'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockLimpiezaData';
import { LuEye, LuHistory } from 'react-icons/lu';

// Solo acciones secundarias de solo-lectura en esta V1 (encargo sección 5) —
// Iniciar/Finalizar limpieza permanecen como CTA principal de la fila, nunca
// acá.
const ACCION_ICONO = {
  'ver-detalle': LuEye,
  'ver-historial': LuHistory,
};

// Menú "⋯" de la fila — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"): acciones secundarias que varían según MENU_ACCIONES[estado]
// (mockLimpiezaData.js), nunca una lista fija.
export default function LimpiezaRowActionsMenu({ estado, cama, onAction }) {
  return (
    <DropdownMenu
      label={`Más acciones para cama ${cama}`}
      items={(MENU_ACCIONES[estado] || []).map((item) => ({
        id: item.action,
        label: item.label,
        icon: ACCION_ICONO[item.action] ?? LuEye,
        onSelect: () => onAction(item.action),
      }))}
    />
  );
}
