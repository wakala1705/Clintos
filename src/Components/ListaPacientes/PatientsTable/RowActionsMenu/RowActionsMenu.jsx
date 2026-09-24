'use client';

import './RowActionsMenu.css';
import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuPencil, LuUserX } from 'react-icons/lu';

// Menú "⋯" de una fila — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). Sin ninguna acción permitida no se pinta el botón, pero sí
// un hueco del mismo tamaño para que la columna no baile entre filas.
export default function RowActionsMenu({
  canEdit, canInactivate, onEditar, onInactivar,
}) {
  if (!canEdit && !canInactivate) return <span className="lp-row-menu-spacer" aria-hidden="true"></span>;

  return (
    <DropdownMenu
      label="Más acciones"
      items={[
        canEdit && {
          id: 'editar', label: 'Editar datos', icon: LuPencil, onSelect: onEditar,
        },
        canInactivate && {
          id: 'inactivar', label: 'Inactivar', icon: LuUserX, onSelect: onInactivar, tone: 'danger',
        },
      ].filter(Boolean)}
    />
  );
}
