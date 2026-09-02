'use client';

import './IntervencionResumen.css';
import EstadoIntervencionBadge from '../EstadoIntervencionBadge/EstadoIntervencionBadge';
import { fechaHoraCortaLabel } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

export default function IntervencionResumen({ intervencion }) {
  return (
    <div className="hq-resumen">
      <div className="hq-resumen-title">{intervencion.procedimientoPrincipal}</div>
      <div className="hq-resumen-fecha">{fechaHoraCortaLabel(intervencion.fecha, intervencion.horaInicio)}</div>
      <div className="hq-resumen-meta">
        <div className="hq-resumen-item">
          <span className="lbl">Médico</span>
          <span className="val">{intervencion.medico}</span>
        </div>
        <div className="hq-resumen-item">
          <span className="lbl">Sala</span>
          <span className="val">{intervencion.sala}</span>
        </div>
        <div className="hq-resumen-item">
          <span className="lbl">Quirófano</span>
          <span className="val">{intervencion.quirofano}</span>
        </div>
        <div className="hq-resumen-item">
          <span className="lbl">Estado</span>
          <EstadoIntervencionBadge estado={intervencion.estado} />
        </div>
      </div>
    </div>
  );
}
