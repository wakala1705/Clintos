'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockReservasData';
import { LuBan, LuEye } from 'react-icons/lu';

const ACCION_ICONO = {
  ver: LuEye,
  cancelar: LuBan,
};

// Menú "⋯" — @/Components/DropdownMenu (ver AGENTS.md "Dropdowns"). Solo
// Pendiente/Confirmada tienen entradas (Ver/Cancelar, encargo sección 8) —
// Utilizada/Vencida/Cancelada no tienen menú, así que el trigger ni siquiera
// se monta (ver ReservaRowActionsMenu({ estado }) en
// GestionCamasReservas.jsx). "Cancelar" en tono danger, mismo criterio que
// el resto de menús.
export default function ReservaRowActionsMenu({ estado, paciente, onAction }) {
  return (
    <DropdownMenu
      label={`Más acciones para la reserva de ${paciente}`}
      items={(MENU_ACCIONES[estado] || []).map((item) => ({
        id: item.action,
        label: item.label,
        icon: ACCION_ICONO[item.action] ?? LuEye,
        tone: item.action === 'cancelar' ? 'danger' : undefined,
        onSelect: () => onAction(item.action),
      }))}
    />
  );
}
