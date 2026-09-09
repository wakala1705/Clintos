'use client';

import './MovimientosGrid.css';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';

const COLUMNS = [
  'Bdg', 'Grupo', 'Consecutivo', 'No.Admisión', 'No.Prestación', 'Fecha', 'Hora',
  'Procedencia', 'Movimiento', 'Paciente', 'Ubicación', 'Id.Contrato',
];

// Réplica de la grilla principal de la pantalla legacy de referencia --
// mismo esqueleto .mig-grid/.mig-ellipsis/.mig-num que MovimientoItemsTable
// (ver Solicitudes/shared/shared.css), fila seleccionable con el mismo
// patrón de teclado/aria que FacturasGridClasica/AdmisionesTable.
export default function MovimientosGrid({ movimientos, selectedId, onSelect }) {
  function handleKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <div className="mig-grid-scroll">
      <table className="mig-grid">
        <thead>
          <tr>{COLUMNS.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr
              key={m.id}
              className={m.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(m.id)}
              onKeyDown={(e) => handleKeyDown(e, m.id)}
              tabIndex={0}
              aria-selected={m.id === selectedId}
            >
              <td><span className="mig-bdg-dot" style={{ background: m.bodegaColor }} title={`Bodega ${m.bdg}`} aria-label={`Bodega ${m.bdg}`} /></td>
              <td>{m.grupo}</td>
              <td className="mig-strong">{m.consecutivo}</td>
              <td>{m.noAdmision}</td>
              <td>{m.noPrestacion}</td>
              <td>{formatFecha(m.fecha)}</td>
              <td>{m.hora}</td>
              <td>{m.procedencia}</td>
              <td>{m.movimiento}</td>
              <td className="mig-ellipsis" title={m.paciente}>{m.paciente}</td>
              <td className="mig-ellipsis" title={m.ubicacion}>{m.ubicacion}</td>
              <td className="mig-num">{m.idContrato}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {movimientos.length === 0 && (
        <div className="mig-grid-empty">No hay movimientos que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}
