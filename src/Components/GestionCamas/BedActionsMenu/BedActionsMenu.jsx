'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import { MENU_ACCIONES } from '@/hooks/GestionCamas/mockCamasData';
import {
  LuArrowRightLeft, LuBedDouble, LuCalendarX, LuCircleCheck, LuClock, LuEye,
  LuHistory, LuLock, LuLockOpen, LuLogOut, LuPencil, LuPowerOff, LuSprayCan, LuUser, LuUserPlus, LuWrench,
} from 'react-icons/lu';

// Un ícono por acción, reusando el mismo vocabulario visual ya establecido
// en el resto del módulo en vez de inventar uno nuevo por acción — mismo
// criterio en los 3 casos: ver-paciente/trasladar (BedDetailModal.jsx,
// "Paciente actual"), reservar/asignar-paciente (ícono del ModalHeader de
// ReservarCamaModal/AsignarPacienteModal) y mantenimiento/limpieza/bloquear
// (ícono de EstadoCamaBadge para ese mismo estado). "Finalizar..."/
// "Utilizar reserva" comparten LuCircleCheck (completan/resuelven un estado
// pendiente) — nunca aparecen juntos en el mismo dropdown (cada uno vive en
// el menú de un solo estado, ver MENU_ACCIONES), así que no hay ambigüedad
// visual dentro de una misma lista.
const ACCION_ICONO = {
  'ver-detalle': LuEye,
  editar: LuPencil,
  reservar: LuClock,
  'asignar-paciente': LuUserPlus,
  mantenimiento: LuWrench,
  'ver-mantenimiento': LuWrench,
  'finalizar-mantenimiento': LuCircleCheck,
  limpieza: LuSprayCan,
  'finalizar-limpieza': LuCircleCheck,
  bloquear: LuLock,
  desbloquear: LuLockOpen,
  desactivar: LuPowerOff,
  activar: LuPowerOff,
  'cambiar-estado': LuBedDouble,
  historial: LuHistory,
  'ver-paciente': LuUser,
  trasladar: LuArrowRightLeft,
  liberar: LuLogOut,
  'utilizar-reserva': LuCircleCheck,
  'cancelar-reserva': LuCalendarX,
};

// "Cancelar reserva"/"Desactivar" en tono danger, mismo criterio que el
// resto de menús (acción que deshace o saca de servicio).
const ACCIONES_DANGER = new Set(['cancelar-reserva', 'desactivar']);

// Menú "⋯" — @/Components/DropdownMenu (ver AGENTS.md "Dropdowns"). Las
// opciones vienen de MENU_ACCIONES[estado] (mockCamasData.js): solo las
// válidas para el estado actual de la cama (encargo explícito), nunca una
// lista fija. El portal de DropdownMenu evita que el overflow:hidden de
// .cb-card (BedCard.css) recorte el menú, más alto que la tarjeta compacta.
//
// `MENU_ACCIONES[estado] || []`: Aislamiento tiene color/label
// (ESTADO_COLOR, mockCamasData.js) pero a propósito no tiene entrada acá
// todavía (reglas de negocio sin confirmar) — sin el fallback, una cama en
// ese estado rompería este menú (muestra "Sin acciones disponibles").
export default function BedActionsMenu({
  estado, numero, onAction, size,
}) {
  return (
    <DropdownMenu
      label={`Más acciones para cama ${numero}`}
      size={size}
      items={(MENU_ACCIONES[estado] || []).map((item) => ({
        id: item.action,
        label: item.label,
        icon: ACCION_ICONO[item.action],
        tone: ACCIONES_DANGER.has(item.action) ? 'danger' : undefined,
        onSelect: () => onAction(item.action),
      }))}
    />
  );
}
