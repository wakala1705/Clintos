'use client';

import './EquiposTable.css';
import Badge from '@/Components/Badge/Badge';

// Tabla de equipos reutilizada entre Programación Sala de Cirugías
// (DetalleCirugiaPanel/tabs/EquiposTab) e HistorialQuirurgico
// (ProcedimientoDetalle/tabs/EquiposTab) -- encargo explícito de
// homologación: mismas 4 columnas en las 2 features (Equipo/Tipo/
// Identificación/Estado), aunque el dato "estado" antes solo existía en
// Programación (disponible/en-uso/mantenimiento); HistorialQuirurgico -- que
// es un registro histórico, no de disponibilidad -- usa 'usado' como único
// valor fijo (ver mockHistorialQuirurgico.js). App-wide component (2
// features distintas la consumen, ver AGENTS.md "Component organization").
const ESTADO_META = {
  disponible: { label: 'Disponible', tone: 'success' },
  'en-uso': { label: 'En uso', tone: 'info' },
  mantenimiento: { label: 'Mantenimiento', tone: 'warn' },
  usado: { label: 'Usado', tone: 'neutral' },
};

export default function EquiposTable({ equipos }) {
  return (
    <table className="eqtb-table">
      <thead>
        <tr>
          <th>Equipo</th>
          <th>Tipo</th>
          <th>Identificación</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {equipos.map((e) => {
          const meta = ESTADO_META[e.estado] ?? { label: e.estado, tone: 'neutral' };
          return (
            <tr key={e.identificacion}>
              <td className="cell-primary">{e.nombre}</td>
              <td className="cell-muted">{e.tipo}</td>
              <td className="cell-muted">{e.identificacion}</td>
              <td><Badge tone={meta.tone}>{meta.label}</Badge></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
