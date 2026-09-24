'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockMantenimientoData';
import {
  LuBan, LuCalendarClock, LuCircleCheck, LuHistory, LuMessageSquare, LuWrench,
} from 'react-icons/lu';

const ACCION_ICONO = {
  'iniciar-mantenimiento': LuWrench,
  reprogramar: LuCalendarClock,
  cancelar: LuBan,
  'finalizar-mantenimiento': LuCircleCheck,
  'registrar-observacion': LuMessageSquare,
  'ver-historial': LuHistory,
};

// Menú "⋯" de la fila — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). "Ver detalle" vive en el botón-ícono 👁 aparte (ver
// GestionCamasMantenimiento.jsx), nunca acá — mismo patrón que BedTable.jsx
// (encargo sección 9). La fila entera también abre el detalle al hacer clic
// (encargo sección 11): DropdownMenu ya corta la propagación del click.
// "Cancelar" en tono danger, mismo criterio que el resto de menús.
export default function MantenimientoRowActionsMenu({ estado, cama, onAction }) {
  return (
    <DropdownMenu
      label={`Más acciones para cama ${cama}`}
      items={(MENU_ACCIONES[estado] || []).map((item) => ({
        id: item.action,
        label: item.label,
        icon: ACCION_ICONO[item.action] ?? LuHistory,
        tone: item.action === 'cancelar' ? 'danger' : undefined,
        onSelect: () => onAction(item.action),
      }))}
    />
  );
}
