'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import './VitalesChart.css';
import { VITAL_PARAMS } from '../vitalParams';

// Un <YAxis hide> por parámetro activo en vez de un solo eje compartido:
// T.A.S. (~120) y Temp. (~37) tienen escalas incompatibles, así que cada
// serie se autoescala a su propio rango visible en vez de aplastar a las
// demás. El tooltip sigue mostrando el valor real de cada serie (no hace
// falta normalizar los datos).
export default function VitalesChart({ readings, activeParams }) {
  const data = readings.map((r) => ({ ...r, etiqueta: `${r.hora}` }));
  const activos = VITAL_PARAMS.filter((p) => activeParams.includes(p.key));

  return (
    <div className="vch-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <XAxis dataKey="etiqueta" stroke="var(--ink-500)" fontSize={12} />
          {activos.map((p) => (
            <YAxis key={p.key} yAxisId={p.key} hide domain={['auto', 'auto']} />
          ))}
          <Tooltip />
          {activos.map((p) => (
            <Line
              key={p.key}
              yAxisId={p.key}
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
