import { TONO_GENERAL } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import './ProgresoChequeo.css';

// Barra de progreso + "completos/total" de los ítems obligatorios. El color
// de la barra sale del estado general (clinical-status).
// `compacto`: barra y "n/total" en una sola fila (para ganar alto en las tablas);
// el texto "obligatorios completos" queda en el tooltip y para lectores de pantalla.
export default function ProgresoChequeo({ evaluacion, compacto = false }) {
  const { completos, total, porcentaje, estado } = evaluacion;
  return (
    <div
      className={compacto ? 'pc-wrap pc-compacto' : 'pc-wrap'}
      title={compacto ? `${completos}/${total} obligatorios completos` : undefined}
    >
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
        <strong>{completos}/{total}</strong>
        <span className={compacto ? 'pc-sr' : undefined}> obligatorios completos</span>
      </span>
    </div>
  );
}
