'use client';

import './ProcedimientosList.css';
import EmptyState from '../EmptyState/EmptyState';
import { LuListX } from 'react-icons/lu';

// Tabla (no lista de tarjetas) -- encargo explícito: el panel izquierdo de
// IntervencionDetalleModal debía verse como la referencia adjunta (columnas
// Item/Id. Cirugía/Procedimiento). Reusa .data-table/.hq-table-wrap.selectable,
// el mismo lenguaje visual que ya usa IntervencionesTable, en vez de un
// estilo de "card seleccionable" propio (el .hq-proc-item que tenía antes).
export default function ProcedimientosList({ procedimientos, selectedId, onSelect }) {
  if (procedimientos.length === 0) {
    return <EmptyState icon={LuListX} title="No hay procedimientos registrados para esta intervención." />;
  }

  function handleRowKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <div className="hq-table-wrap selectable">
      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Id. Cirugía</th>
            <th>Procedimiento</th>
          </tr>
        </thead>
        <tbody>
          {procedimientos.map((p, idx) => (
            <tr
              key={p.id}
              className={selectedId === p.id ? 'selected' : undefined}
              aria-selected={selectedId === p.id}
              tabIndex={0}
              onClick={() => onSelect(p.id)}
              onKeyDown={(e) => handleRowKeyDown(e, p.id)}
            >
              <td className="cell-muted">{idx + 1}</td>
              <td className="cell-muted">{p.codigo}</td>
              <td className="cell-primary">{p.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
