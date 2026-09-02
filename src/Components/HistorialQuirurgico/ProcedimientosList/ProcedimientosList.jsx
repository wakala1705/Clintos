'use client';

import './ProcedimientosList.css';
import EmptyState from '../EmptyState/EmptyState';
import { LuListX } from 'react-icons/lu';

export default function ProcedimientosList({ procedimientos, selectedId, onSelect }) {
  if (procedimientos.length === 0) {
    return <EmptyState icon={LuListX} title="No hay procedimientos registrados para esta intervención." />;
  }

  return (
    <div className="hq-proc-list" role="listbox">
      {procedimientos.map((p) => {
        const active = p.id === selectedId;
        return (
          <button
            type="button"
            key={p.id}
            role="option"
            aria-selected={active}
            className={`hq-proc-item${active ? ' active' : ''}`}
            onClick={() => onSelect(p.id)}
          >
            <span className="hq-proc-nombre">{p.nombre}</span>
            <span className="hq-proc-codigo">Código: {p.codigo}</span>
          </button>
        );
      })}
    </div>
  );
}
