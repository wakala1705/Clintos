'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuBan, LuCopy, LuDollarSign, LuEye, LuFileMinus, LuFileStack, LuPencil,
} from 'react-icons/lu';

// Acciones sin handler real todavía (solo cierran el menú, ver comentario
// del componente) -- todas en tono primary (encargo explícito), a
// diferencia de "Anular" que va aparte al final en tono danger.
const ACCIONES = [
  { id: 'otras-monedas', label: 'Otras monedas', icon: LuDollarSign },
  { id: 'admisiones-masivas', label: 'Admisiones masivas', icon: LuFileStack },
  { id: 'razon-anulacion', label: 'Razón anulación', icon: LuFileMinus },
  { id: 'copias', label: 'Copias', icon: LuCopy },
];

// Menú "⋯" por fila de la grilla — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). Agrupa las acciones que antes vivían sueltas en la fila
// fvc-acciones-bar del panel de detalle (sin funcionalidad real, ver
// FacturaDetalleClasico).
//
// "Editar" es la única entrada real del menú además de "Ver detalle"; las de
// ACCIONES todavía no tienen handler.
//
// `onVerDetalle` (opcional, encargo explícito: "pasa la opción del ícono de
// Ver detalle al botón kabah") -- reemplaza el botón de ojo suelto que vivía
// en `.fvc-row-actions` (ver FacturasGridClasica.jsx); sigue siendo opcional
// porque el modo "Dividida" no lo pasa (el detalle ya se ve en el panel
// inferior, ver comentario de ese archivo) -- sin él, el ítem no se muestra.
//
// Tonos de ícono (encargo explícito): todo el menú en `iconTone="primary"`
// salvo "Anular", que usa `tone="danger"` (tiñe ícono + texto + hover, ver
// AGENTS.md "Dropdowns": el tono danger es para acciones que anulan/
// cancelan/desactivan) -- va al final de la lista, separado del resto con
// `dividerBefore`, para no mezclar la única acción destructiva con las
// demás.
export default function RowActionsMenu({ numero, onVerDetalle, onEditar }) {
  return (
    <DropdownMenu
      label={`Más opciones para la factura ${numero}`}
      items={[
        {
          id: 'editar', label: 'Editar', icon: LuPencil, iconTone: 'primary', onSelect: onEditar,
        },
        ...(onVerDetalle ? [{
          id: 'ver-detalle', label: 'Ver detalle', icon: LuEye, iconTone: 'primary', onSelect: onVerDetalle,
        }] : []),
        ...ACCIONES.map((a) => ({ ...a, iconTone: 'primary' })),
        {
          id: 'anular', label: 'Anular', icon: LuBan, tone: 'danger', dividerBefore: true,
        },
      ]}
    />
  );
}
