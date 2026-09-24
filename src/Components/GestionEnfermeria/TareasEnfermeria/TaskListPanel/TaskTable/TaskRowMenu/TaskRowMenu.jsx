'use client';

import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuBan, LuCalendarClock, LuCircleSlash, LuEye, LuHistory, LuUserRoundCog,
} from 'react-icons/lu';

// Menú "⋯" de acciones por tarea — @/Components/DropdownMenu (ver AGENTS.md
// "Dropdowns"). Reservado para acciones SECUNDARIAS (encargo explícito):
// "Iniciar"/"Completar" se movieron a un botón primario directo en la fila
// (ver accionPrimariaDeTarea en TaskTable.jsx) y ya no viven acá. "Ver
// historial" abre el mismo panel de detalle que "Ver detalle"
// (TaskDetailPanel ya incluye la sección Trazabilidad, ver encargo punto 11
// — no se duplica esa vista en un modal aparte) — 2 entradas al mismo panel
// porque son 2 intenciones distintas del usuario ("revisar la tarea" vs.
// "revisar qué pasó"), aunque el destino sea idéntico.
export default function TaskRowMenu({
  tarea, disabled, onVerDetalle, onReasignar, onReprogramar, onNoRealizada, onCancelar,
}) {
  const d = disabled ?? {};
  return (
    <DropdownMenu
      label={`Más acciones para ${tarea.nombre}`}
      items={[
        { id: 'detalle', label: 'Ver detalle', icon: LuEye, onSelect: onVerDetalle },
        { id: 'historial', label: 'Ver historial', icon: LuHistory, onSelect: onVerDetalle },
        {
          id: 'reasignar', label: 'Reasignar', icon: LuUserRoundCog, onSelect: onReasignar, dividerBefore: true,
        },
        {
          id: 'reprogramar', label: 'Reprogramar', icon: LuCalendarClock, onSelect: onReprogramar, disabled: d.reprogramar,
        },
        {
          id: 'no-realizada', label: 'Marcar como no realizada', icon: LuCircleSlash, onSelect: onNoRealizada, disabled: d.noRealizada, tone: 'warn', dividerBefore: true,
        },
        {
          id: 'cancelar', label: 'Cancelar', icon: LuBan, onSelect: onCancelar, disabled: d.cancelar, tone: 'danger',
        },
      ]}
    />
  );
}
