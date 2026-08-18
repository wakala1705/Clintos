import './EstadoChipGroup.css';
import { ESTADO_FILTER_OPTIONS } from '@/hooks/Admisiones/mockAdmisionesData';

// Segmented control (track en píldora + opción activa "elevada", nunca
// relleno azul sólido) en vez del popover con checkmark que tenía antes —
// mismo lenguaje visual que .pc-view-switch (ProgramarCita/AgendaToolbar) y
// .chip-group.segmented (GestionEnfermeria/shared/shared.css), reimplementado
// acá porque esos estilos están scopeados a sus propias features (ver
// AGENTS.md: cada feature es dueña de su propia copia, no se importa entre
// features). Todas las opciones quedan siempre visibles (sin abrir/cerrar
// nada) porque son solo 6 y caben en una sola fila.
export default function EstadoChipGroup({ value, onChange }) {
  return (
    <div className="adm-chip-group" role="radiogroup" aria-label="Filtrar por estado">
      {ESTADO_FILTER_OPTIONS.map((o) => (
        <button
          type="button"
          key={o.value}
          className={`adm-chip${o.value === value ? ' active' : ''}`}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
