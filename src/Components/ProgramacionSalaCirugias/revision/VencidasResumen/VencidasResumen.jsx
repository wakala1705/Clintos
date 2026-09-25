'use client';

import { INCONSISTENCIAS, INCONSISTENCIA_ORDEN } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './VencidasResumen.css';

// 3 contadores por tipo de inconsistencia. Clicables: activan el mismo filtro
// que el chip del tipo en VencidasFiltrosBar; click en el activo lo quita.
export default function VencidasResumen({ conteo, tipoActivo, onSelectTipo }) {
  return (
    <div className="rv-resumen" role="group" aria-label="Resumen por tipo de inconsistencia">
      {INCONSISTENCIA_ORDEN.map((tipo) => {
        const meta = INCONSISTENCIAS[tipo];
        const activo = tipoActivo === tipo;
        return (
          <button
            key={tipo}
            type="button"
            className={`rv-resumen-item rv-resumen-${meta.tone}${activo ? ' active' : ''}`}
            aria-pressed={activo}
            onClick={() => onSelectTipo(activo ? 'todas' : tipo)}
          >
            <span className="rv-resumen-valor">{conteo[tipo]}</span>
            <span className="rv-resumen-label">{meta.label}</span>
            <span className="rv-resumen-hint">{meta.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
