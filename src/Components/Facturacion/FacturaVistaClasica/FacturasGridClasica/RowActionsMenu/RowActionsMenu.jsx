'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuBan, LuCopy, LuDollarSign, LuFileMinus, LuFileStack, LuPencil,
} from 'react-icons/lu';

const ACCIONES = [
  { id: 'otras-monedas', label: 'Otras monedas', icon: LuDollarSign },
  { id: 'admisiones-masivas', label: 'Admisiones masivas', icon: LuFileStack },
  { id: 'anular', label: 'Anular', icon: LuBan },
  { id: 'razon-anulacion', label: 'Razón anulación', icon: LuFileMinus },
  { id: 'copias', label: 'Copias', icon: LuCopy },
];

// Menú "⋯" por fila de la grilla — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). Agrupa las acciones que antes vivían sueltas en la fila
// fvc-acciones-bar del panel de detalle (sin funcionalidad real, ver
// FacturaDetalleClasico).
//
// "Editar" (encargo explícito: se saca del botón suelto de lápiz en
// fvc-row-actions y se mueve acá) es la única entrada real del menú; las de
// ACCIONES todavía no tienen handler (solo cierran el menú). Antes el botón
// "⋯" de esta grilla era azul (--primary), único en el proyecto — ahora usa
// el gris estándar del resto.
export default function RowActionsMenu({ numero, onEditar }) {
  return (
    <DropdownMenu
      label={`Más opciones para la factura ${numero}`}
      items={[
        { id: 'editar', label: 'Editar', icon: LuPencil, onSelect: onEditar },
        ...ACCIONES.map((a, i) => ({ ...a, dividerBefore: i === 0 })),
      ]}
    />
  );
}
