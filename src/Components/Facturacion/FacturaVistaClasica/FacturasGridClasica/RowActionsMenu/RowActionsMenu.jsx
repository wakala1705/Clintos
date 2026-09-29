'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuBan, LuCopy, LuEye, LuPencil, LuPrinter,
} from 'react-icons/lu';

// Acciones sin handler real todavía (solo cierran el menú, ver comentario
// del componente) -- todas en tono primary (encargo explícito), a
// diferencia de "Anular" que va aparte al final en tono danger.
//
// "Otras monedas"/"Admisiones masivas" son variantes de impresión (encargo
// explícito) -- ícono `LuPrinter`, no uno decorativo por opción, para que se
// lean como parte del mismo grupo de impresión que "Imprimir" (columna
// Acciones) en vez de acciones sueltas sin relación entre sí.
//
// "Razón anulación" (encargo explícito: "ya la cubrimos en el flujo") ya no
// va acá -- ese motivo ahora se pide en el propio paso de "Anular" (ver
// AnularFacturaModal.jsx, campo "Motivo de anulación"), tenerlo dos veces
// era redundante.
const ACCIONES = [
  { id: 'otras-monedas', label: 'Otras monedas', icon: LuPrinter },
  { id: 'admisiones-masivas', label: 'Admisiones masivas', icon: LuPrinter },
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
//
// "Anular" abre AnularFacturaModal (`onAnular`, ver FacturaVistaClasica.jsx)
// -- deshabilitado si la factura ya está anulada (`estado`), no tiene
// sentido anular dos veces.
export default function RowActionsMenu({
  numero, estado, onVerDetalle, onEditar, onAnular,
}) {
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
          id: 'anular', label: 'Anular', icon: LuBan, tone: 'danger', dividerBefore: true, disabled: estado === 'anulada', onSelect: onAnular,
        },
      ]}
    />
  );
}
