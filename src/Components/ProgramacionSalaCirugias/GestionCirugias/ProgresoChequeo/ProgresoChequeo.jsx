import { TONO_GENERAL } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import './ProgresoChequeo.css';

// Barra de progreso + "completos/total" de los ítems obligatorios. El color
// de la barra sale del estado general (clinical-status).
export default function ProgresoChequeo({ evaluacion }) {
  const { completos, total, porcentaje, estado } = evaluacion;
  return (
    <div className="pc-wrap">
      <div
        className={`pc-bar pc-${TONO_GENERAL[estado]}`}
        role="progressbar"
        aria-valuenow={completos}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Obligatorios completos"
      >
        <div className="pc-fill" style={{ width: `${porcentaje}%` }} />
      </div>
      <span className="pc-count">
        <strong>{completos}/{total}</strong> obligatorios completos
      </span>
    </div>
  );
}
