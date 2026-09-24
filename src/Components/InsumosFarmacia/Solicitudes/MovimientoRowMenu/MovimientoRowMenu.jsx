'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuBan, LuEye, LuPackage, LuPencil, LuPrinter,
} from 'react-icons/lu';

// Menú "⋯" que agrupa Editar/Ver detalle/Imprimir/Anular —
// @/Components/DropdownMenu (ver AGENTS.md "Dropdowns"). "Editar" vivía como
// botón directo en la fila (MovimientosGrid.jsx); se movió acá (encargo
// explícito) para no repartir las acciones de la columna en dos
// disparadores distintos. "Ver detalle" abre MovimientoDetalleModal (único
// ítem con efecto real); Editar/Imprimir/Anular siguen visual-only (sin
// modales todavía, ver spec). "Alistar pedido" (encargo explícito) solo
// aparece para movimientos en estado "Sin Confirmar" — es la acción
// principal de esa fila, por eso va primera en la lista; abre
// AlistarPedidoModal, mismo trigger que el doble clic en la fila
// (MovimientosGrid.jsx).
export default function MovimientoRowMenu({
  consecutivo, estado, onVerDetalle, onAlistarPedido,
}) {
  return (
    <DropdownMenu
      label={`Más opciones para el movimiento ${consecutivo}`}
      items={[
        estado === 'sin-confirmar' && {
          id: 'alistar', label: 'Alistar pedido', icon: LuPackage, onSelect: onAlistarPedido,
        },
        { id: 'editar', label: 'Editar', icon: LuPencil },
        {
          id: 'detalle', label: 'Ver detalle', icon: LuEye, onSelect: onVerDetalle,
        },
        { id: 'imprimir', label: 'Imprimir', icon: LuPrinter },
        {
          id: 'anular', label: 'Anular', icon: LuBan, tone: 'danger',
        },
      ].filter(Boolean)}
    />
  );
}
