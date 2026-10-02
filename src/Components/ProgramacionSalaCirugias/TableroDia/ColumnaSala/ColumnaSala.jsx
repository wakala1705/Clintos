'use client';

import './ColumnaSala.css';
import Badge from '@/Components/Badge/Badge';
import CirugiaCard from '../../CirugiaCard/CirugiaCard';
import { esRetrasada, minutosLabel } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';

// Una sala del tablero: encabezado (nombre, estado de la sala, cantidad y
// tiempo ocupado) y sus cirugías del día en orden horario. Una sala en
// mantenimiento no recibe cirugías: se muestra deshabilitada. `ahora` solo
// llega cuando el día mostrado es hoy -- sin él no se marca ninguna retrasada.
export default function ColumnaSala({
  grupo, ahora, selectedId, onSelect,
  onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  const { sala, cirugias, minutosOcupados } = grupo;
  const enMantenimiento = sala.estado !== 'Activo';

  return (
    <section
      className={`td-col${enMantenimiento ? ' td-col-off' : ''}`}
      aria-label={sala.label}
    >
      <header className="td-col-header">
        <div className="td-col-title">
          <h3>{sala.descripcion}</h3>
          {enMantenimiento && <Badge tone="warn">{sala.estado}</Badge>}
        </div>
        <span className="td-col-meta">
          {cirugias.length === 1 ? '1 cirugía' : `${cirugias.length} cirugías`}
          {' · '}
          {minutosLabel(minutosOcupados)}
        </span>
      </header>

      <div className="td-col-body">
        {cirugias.length === 0 ? (
          <p className="td-col-empty">
            {enMantenimiento ? 'Sala fuera de servicio' : 'Sin cirugías este día'}
          </p>
        ) : cirugias.map((c) => (
          <div key={c.id} className="td-item">
            {ahora && esRetrasada(c, ahora) && (
              <Badge tone="danger" dot className="td-item-badge">Retrasada</Badge>
            )}
            <CirugiaCard
              cirugia={c}
              selected={c.id === selectedId}
              onClick={() => onSelect(c.id === selectedId ? null : c.id)}
              onReprogramar={onReprogramar}
              onMarcarRealizada={onMarcarRealizada}
              onMarcarIncumplida={onMarcarIncumplida}
              onCancelar={onCancelar}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
