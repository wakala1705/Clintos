'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { LuEye, LuPencil } from 'react-icons/lu';

// Menú "⋯" de la fila con "Ver detalle" y "Editar" (en ese orden), que antes
// eran dos columnas de botón-ícono sueltas — @/Components/DropdownMenu (ver
// AGENTS.md "Dropdowns"), que ya resuelve el portal a document.body para
// que el overflow de .adm-table-wrap no lo recorte, el foco en el primer
// ítem al abrir y la navegación con flechas (este menú fue el que definió
// ese comportamiento).
export default function RowMoreMenu({ nombre, onDetalle, onEditar }) {
  return (
    <DropdownMenu
      label={`Más opciones para ${nombre}`}
      items={[
        { id: 'detalle', label: 'Ver detalle', icon: LuEye, onSelect: onDetalle },
        { id: 'editar', label: 'Editar', icon: LuPencil, onSelect: onEditar },
      ]}
    />
  );
}
