'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuBan, LuEye, LuPrinter } from 'react-icons/lu';

// Menú "⋯" de la fila de Entradas (mismo patrón que MovimientoRowMenu de Salidas).
// "Ver detalle" abre EntradaDetalleModal; Imprimir/Anular son visual-only por ahora y
// "Anular" solo aparece en entradas vigentes.
export default function EntradaRowMenu({ consecutivo, estado, onVerDetalle }) {
  return (
    <DropdownMenu
      label={`Más opciones para la entrada ${consecutivo}`}
      items={[
        {
          id: 'detalle', label: 'Ver detalle', icon: LuEye, onSelect: onVerDetalle,
        },
        { id: 'imprimir', label: 'Imprimir', icon: LuPrinter },
        estado === 'confirmada' && {
          id: 'anular', label: 'Anular', icon: LuBan, tone: 'danger',
        },
      ].filter(Boolean)}
    />
  );
}
