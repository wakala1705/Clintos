'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuClipboardList, LuFileText, LuIdCard, LuSparkles,
} from 'react-icons/lu';

// Menú "⋯" de acciones por paciente — @/Components/DropdownMenu (portado,
// se abre hacia arriba en las últimas filas, ver AGENTS.md "Dropdowns").
// Solo acciones que hoy llevan a algo real: detalle de la admisión
// (DetalleAdmisionModal), historia clínica, la pestaña Órdenes médicas de la
// atención y Kora con el contexto de este paciente.
export default function RowActionsMenu({
  paciente, onVerDetalle, onVerHistoria, onVerOrdenes, onPreguntarKora,
}) {
  return (
    <DropdownMenu
      label={`Más acciones para ${paciente}`}
      items={[
        { id: 'detalle', label: 'Ver detalle', icon: LuIdCard, onSelect: onVerDetalle },
        { id: 'historia', label: 'Ver historia clínica', icon: LuFileText, onSelect: onVerHistoria },
        { id: 'ordenes', label: 'Ver órdenes médicas', icon: LuClipboardList, onSelect: onVerOrdenes },
        {
          id: 'kora', label: 'Preguntar a Kora sobre este paciente', icon: LuSparkles, onSelect: onPreguntarKora, dividerBefore: true,
        },
      ]}
    />
  );
}
