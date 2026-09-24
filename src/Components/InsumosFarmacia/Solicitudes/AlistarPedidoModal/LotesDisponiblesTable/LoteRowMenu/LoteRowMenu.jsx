'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuClipboardCheck, LuPencil, LuTrash2 } from 'react-icons/lu';

// Menú "⋯" de la columna Acciones de LotesDisponiblesTable —
// @/Components/DropdownMenu (ver AGENTS.md "Dropdowns"). Agrupa
// Editar/Movimiento/Borrar (encargo explícito). "Sugerir" se sacó de acá
// (encargo explícito) — pasó a ser el botón directo al lado del trigger (ver
// LotesDisponiblesTable.jsx): es la acción más frecuente del flujo de
// reparto. "Editar" solo abre EditarLoteModal vía `onEditar`;
// Movimiento/Borrar siguen visual-only (mismo criterio que el resto de
// AlistarPedidoModal). El portal + z-index sobre --z-modal de DropdownMenu
// es lo que evita que .mig-lotes-table-scroll (overflow con max-height)
// recorte el último ítem, y que el menú quede debajo del modal.
export default function LoteRowMenu({ itemLabel, onEditar }) {
  return (
    <DropdownMenu
      label={`Más opciones para el lote ${itemLabel}`}
      items={[
        { id: 'editar', label: 'Editar', icon: LuPencil, onSelect: onEditar },
        { id: 'movimiento', label: 'Movimiento', icon: LuClipboardCheck },
        {
          id: 'borrar', label: 'Borrar', icon: LuTrash2, tone: 'danger',
        },
      ]}
    />
  );
}
