'use client';

import './IntervencionesTable.css';
import EstadoIntervencionBadge from '../EstadoIntervencionBadge/EstadoIntervencionBadge';
import { fechaHoraCortaLabel } from '@/hooks/HistorialQuirurgico/mockHistorialQuirurgico';

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset -- CSS
// decide cuál mostrar bajo 768px (--bp-tablet), mismo patrón que
// AdmisionesTable/PatientsTable. Selección controlada por el padre
// (selectedId/onSelect), no estado propio -- el padre también necesita
// saber qué intervención está activa para derivar Resumen/Procedimientos.
export default function IntervencionesTable({ intervenciones, selectedId, onSelect }) {
  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <>
      <div className="hq-table-wrap selectable">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cirugía</th>
              <th>Médico</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {intervenciones.map((i) => (
              <tr
                key={i.id}
                className={selectedId === i.id ? 'selected' : undefined}
                aria-selected={selectedId === i.id}
                tabIndex={0}
                onClick={() => onSelect(i.id)}
                onKeyDown={(e) => handleRowKeyDown(e, i.id)}
              >
                <td className="cell-primary">{fechaHoraCortaLabel(i.fecha, i.horaInicio)}</td>
                <td className="cell-muted">Cirugía {i.codigoCirugia}</td>
                <td className="cell-muted">{i.medico}</td>
                <td><EstadoIntervencionBadge estado={i.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hq-interv-cards">
        {intervenciones.map((i) => (
          <div
            className={`hq-interv-card${selectedId === i.id ? ' selected' : ''}`}
            key={i.id}
            aria-selected={selectedId === i.id}
            tabIndex={0}
            onClick={() => onSelect(i.id)}
            onKeyDown={(e) => handleRowKeyDown(e, i.id)}
          >
            <div className="hq-interv-card-top">
              <span className="hq-interv-card-fecha">{fechaHoraCortaLabel(i.fecha, i.horaInicio)}</span>
              <EstadoIntervencionBadge estado={i.estado} />
            </div>
            <div className="hq-interv-card-codigo">Cirugía {i.codigoCirugia}</div>
            <div className="hq-interv-card-medico">{i.medico}</div>
          </div>
        ))}
      </div>
    </>
  );
}
