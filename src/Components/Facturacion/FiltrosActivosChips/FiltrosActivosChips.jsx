'use client';

import { CLASE_OPTIONS, TIPO_OPTIONS } from '@/hooks/Facturacion/mockFacturasData';
import ChipFilter from '@/Components/ChipFilter/ChipFilter';

function formatFechaCorta(iso) {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

// Chips removibles individualmente debajo del toolbar (encargo explícito) —
// uno por cada dimensión del popover de Filtros con valor no-"todas"/vacío.
export default function FiltrosActivosChips({ filtros, onRemove }) {
  const chips = [];

  if (filtros.clase && filtros.clase !== 'todas') {
    chips.push({ key: 'clase', label: `Clase: ${CLASE_OPTIONS.find((o) => o.value === filtros.clase)?.label}` });
  }
  if (filtros.tipo && filtros.tipo !== 'todas') {
    chips.push({ key: 'tipo', label: `Tipo: ${TIPO_OPTIONS.find((o) => o.value === filtros.tipo)?.label}` });
  }
  if (filtros.desde || filtros.hasta) {
    const desde = filtros.desde ? formatFechaCorta(filtros.desde) : '…';
    const hasta = filtros.hasta ? formatFechaCorta(filtros.hasta) : '…';
    chips.push({ key: 'fechas', label: `${desde} – ${hasta}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="chip-group">
      {chips.map((chip) => (
        <ChipFilter key={chip.key} size="sm" removable onClick={() => onRemove(chip.key)}>
          {chip.label}
        </ChipFilter>
      ))}
    </div>
  );
}
