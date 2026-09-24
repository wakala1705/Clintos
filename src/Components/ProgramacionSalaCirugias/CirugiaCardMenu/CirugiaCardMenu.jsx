'use client';

import { useState } from 'react';
import './CirugiaCardMenu.css';
import DropdownMenu from '@/Components/DropdownMenu/DropdownMenu';
import {
  LuBan, LuCalendarClock, LuCalendarX, LuCheckCheck, LuPencil,
} from 'react-icons/lu';
import { ESTADOS_TERMINALES_CIRUGIA } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Menú "⋯" de CirugiaCard (encargo explícito, 2026-09-07) —
// @/Components/DropdownMenu (ver AGENTS.md "Dropdowns"), size="sm" por el
// espacio de la tarjeta. Las 5 acciones son fijas (no hay un catálogo por
// estado) — lo que depende del estado es cuáles quedan deshabilitadas,
// mismo criterio que puedeAccionar/puedeMarcarIncumplida en
// DetalleCirugiaPanel.jsx (ESTADOS_TERMINALES_CIRUGIA vive en
// mockCirugiaData.js para que ambos compartan exactamente la misma regla).
// 3 bloques separados (encargo explícito): editar/reprogramar (ajustan la
// cirugía programada), marcar como realizada/incumplida (resuelven su
// desenlace), cancelar (la da de baja).
//
// `.ccm-wrap.open`: el "⋯" solo se ve en hover de la tarjeta
// (CirugiaCard.css); mientras el menú está abierto se fuerza visible, porque
// el mouse sale de la tarjeta hacia el menú portado a document.body.
export default function CirugiaCardMenu({
  cirugia, onEditar, onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  const [open, setOpen] = useState(false);
  const puedeAccionar = !ESTADOS_TERMINALES_CIRUGIA.includes(cirugia.estado);
  // Mismo criterio que puedeMarcarIncumplida en DetalleCirugiaPanel.jsx: una
  // cirugía en curso/futura solo puede "incumplirse" si estaba programada
  // (urgencia se resuelve o no en el momento, no queda pendiente de
  // cumplirse después).
  const puedeMarcarIncumplida = cirugia.estado === 'programada';

  return (
    <div className={`ccm-wrap${open ? ' open' : ''}`}>
      <DropdownMenu
        label={`Más opciones para la cirugía de ${cirugia.paciente.nombre}`}
        size="sm"
        onOpenChange={setOpen}
        items={[
          {
            id: 'editar', label: 'Editar', icon: LuPencil, disabled: !puedeAccionar, onSelect: () => onEditar(cirugia),
          },
          {
            id: 'reprogramar', label: 'Reprogramar', icon: LuCalendarClock, disabled: !puedeAccionar, onSelect: () => onReprogramar(cirugia),
          },
          {
            id: 'realizada', label: 'Marcar como realizada', icon: LuCheckCheck, disabled: !puedeAccionar, onSelect: () => onMarcarRealizada(cirugia), dividerBefore: true,
          },
          {
            id: 'incumplida', label: 'Marcar como incumplida', icon: LuCalendarX, disabled: !puedeMarcarIncumplida, onSelect: () => onMarcarIncumplida(cirugia),
          },
          {
            id: 'cancelar', label: 'Cancelar', icon: LuBan, tone: 'danger', disabled: !puedeAccionar, onSelect: () => onCancelar(cirugia), dividerBefore: true,
          },
        ]}
      />
    </div>
  );
}
