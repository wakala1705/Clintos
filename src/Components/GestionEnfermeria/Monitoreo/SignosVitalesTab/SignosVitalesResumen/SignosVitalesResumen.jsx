'use client';

import './SignosVitalesResumen.css';
import { VITAL_PARAMS } from '../vitalParams';
import { formatFechaHora, formatRelative } from '../vitalTime';
import VitalStatusTag from '../VitalStatusTag/VitalStatusTag';

// Sección "Signos vitales": último valor registrado de cada signo, con su
// unidad, estado (Normal/Elevada/Baja) y fecha/hora real — para que
// enfermería resuelva en segundos "¿cuáles son los últimos signos y hay
// algo fuera de rango?" sin tener que leer la gráfica o la tabla completa
// (ver encargo de rediseño, punto 4).
export default function SignosVitalesResumen({ latest, getStatus }) {
  if (!latest) return null;

  return (
    <section className="svt-resumen" aria-label="Signos vitales">
      <div className="svt-resumen-grid">
        {VITAL_PARAMS.map((p) => {
          const value = latest[p.key];
          const status = getStatus(p.key, value);
          return (
            <div key={p.key} className="svt-resumen-card">
              <div className="svt-resumen-card-head">
                <span className="svt-resumen-label">{p.label}</span>
                <VitalStatusTag status={status} />
              </div>
              <div className="svt-resumen-value">
                {value != null ? (
                  <>
                    {value}
                    <span className="svt-resumen-unit">{p.unit}</span>
                  </>
                ) : (
                  <span className="svt-resumen-empty">—</span>
                )}
              </div>
              <div className="svt-resumen-time">
                {formatFechaHora(latest.fecha, latest.hora)}
                {' · '}
                {formatRelative(latest.fecha, latest.hora)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
