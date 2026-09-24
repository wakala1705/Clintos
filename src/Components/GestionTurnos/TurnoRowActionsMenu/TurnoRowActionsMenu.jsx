'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuPause, LuPencil, LuPlay } from 'react-icons/lu';

// Menú "⋯" de Tipos de turno — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). Sin modal de confirmación para activar/desactivar: no hay
// motivo que capturar a este nivel (a diferencia de "Desactivar cama", que
// sí lo requiere).
export default function TurnoRowActionsMenu({ turno, onEditar, onToggleEstado }) {
  const activo = turno.estado === 'activo';
  return (
    <DropdownMenu
      label={`Más acciones para el turno ${turno.nombre}`}
      items={[
        { id: 'editar', label: 'Editar', icon: LuPencil, onSelect: () => onEditar(turno) },
        {
          id: 'estado', label: activo ? 'Desactivar' : 'Activar', icon: activo ? LuPause : LuPlay, onSelect: () => onToggleEstado(turno),
        },
      ]}
    />
  );
}
