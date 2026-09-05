'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import './VitalesChart.css';
import { VITAL_PARAMS } from '../vitalParams';
import { formatFechaHora } from '../vitalTime';

// Tooltip clínico: muestra TODOS los signos vitales registrados en ese
// instante (no solo la(s) serie(s) de esta gráfica), tomados directamente
// de la lectura completa (payload[0].payload), nunca inventados/interpolados
// — ver encargo de rediseño, punto 7.
function VitalesTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const reading = payload[0].payload;
  return (
    <div className="vch-tooltip">
      <div className="vch-tooltip-time">{formatFechaHora(reading.fecha, reading.hora)}</div>
      {VITAL_PARAMS.map((p) => (
        <div key={p.key} className="vch-tooltip-row">
          <span className="vch-tooltip-swatch" style={{ background: p.color }} />
          <span className="vch-tooltip-label">{p.label}</span>
          <span className="vch-tooltip-value">
            {reading[p.key] != null ? `${reading[p.key]} ${p.unit}` : 'No registrado'}
          </span>
        </div>
      ))}
    </div>
  );
}

// Una gráfica por grupo clínicamente compatible (ver vitalGroups.js) — nunca
// variables con unidades distintas en el mismo eje. Un solo <YAxis> visible
// con la unidad del grupo (T.A.S./T.A.D./T.A.M. sí comparten mmHg y su
// misma escala; los demás grupos tienen un único parámetro).
export default function VitalesChart({ readings, group }) {
  const data = readings.map((r) => ({ ...r, etiqueta: r.hora }));

  return (
    <div className="vch-card">
      <div className="vch-head">
        <h4 className="vch-title">{group.title}</h4>
        <span className="vch-unit">{group.unit}</span>
      </div>
      <div className="vch-legend">
        {group.params.map((p) => (
          <span key={p.key} className="vch-legend-item">
            <span className="vch-legend-swatch" style={{ background: p.color }} />
            {p.label}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <XAxis
            dataKey="etiqueta"
            stroke="var(--ink-500)"
            fontSize={12}
            label={{ value: 'Hora', position: 'insideBottom', offset: -4, fontSize: 11, fill: 'var(--ink-500)' }}
          />
          <YAxis
            stroke="var(--ink-500)"
            fontSize={12}
            domain={['auto', 'auto']}
            label={{ value: group.unit, angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--ink-500)' }}
          />
          <Tooltip content={<VitalesTooltip />} />
          {group.params.map((p) => (
            <Line
              key={p.key}
              dataKey={p.key}
              name={p.label}
              stroke={p.color}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
