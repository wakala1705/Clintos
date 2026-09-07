'use client';

import './ProcedimientosSideList.css';

// Columna izquierda del split (ver .dcp-split en DetalleCirugiaPanel.jsx) --
// mismo esquema que ProcedimientosList/.hqd-split-left en HistorialQuirurgico
// (tabla seleccionable, no lista de tarjetas), adaptado a los campos que sí
// tiene este modelo: sin id/código propio por procedimiento (se usa el
// nombre como key/valor de selección), la columna "Duración" reemplaza a
// "Id. Cirugía" del original -- acá no existe un identificador propio por
// procedimiento y duración es el dato análogo más útil que sí tiene. La
// selección es solo visual en Personal/Equipos/Insumos/Farmacia (esas 4
// siguen scopeadas a la cirugía completa, no al procedimiento elegido).
export default function ProcedimientosSideList({ procedimientos, selectedId, onSelect }) {
  function handleRowKeyDown(e, nombre) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(nombre);
  }

  return (
    <div className="dcp-proc-table-wrap">
      <table className="dcp-proc-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Procedimiento</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          {procedimientos.map((p, idx) => (
            <tr
              key={p.nombre}
              className={selectedId === p.nombre ? 'selected' : undefined}
              aria-selected={selectedId === p.nombre}
              tabIndex={0}
              onClick={() => onSelect(p.nombre)}
              onKeyDown={(e) => handleRowKeyDown(e, p.nombre)}
            >
              <td className="cell-muted">{idx + 1}</td>
              <td className="cell-primary">{p.nombre}</td>
              <td className="cell-muted">{p.duracionMin} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
