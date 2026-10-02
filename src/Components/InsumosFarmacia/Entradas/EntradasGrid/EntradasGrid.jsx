'use client';

import './EntradasGrid.css';
import Badge from '@/Components/Badge/Badge';
import { unidadesEntrada } from '@/hooks/InsumosFarmacia/entradasAsistenciales';

const ESTADO_BADGE = {
  confirmada: { tone: 'success', label: 'Confirmada' },
  anulada: { tone: 'danger', label: 'Anulada' },
};

// 'aaaa-mm-dd' -> 'dd/mm/aaaa' (mismo formato que Salidas asistenciales).
const formatFecha = (iso) => iso.split('-').reverse().join('/');

// Grilla de entradas (devoluciones a farmacia): fila seleccionable con el mismo patrón
// de teclado/aria que MovimientosGrid (Salidas asistenciales). Estilos .mig-* de
// ../../Solicitudes/shared/shared.css.
export default function EntradasGrid({ entradas, selectedId, onSelect }) {
  function handleKeyDown(e, id) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onSelect(id);
  }

  return (
    <div className="mig-grid-scroll">
      <table className="mig-grid">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Consecutivo</th>
            <th>Fecha</th>
            <th>Origen</th>
            <th>Referencia</th>
            <th>Paciente</th>
            <th>Ubicación</th>
            <th>Registró</th>
            <th className="mig-num">Unidades</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map((e) => (
            <tr
              key={e.id}
              className={e.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(e.id)}
              onKeyDown={(ev) => handleKeyDown(ev, e.id)}
              tabIndex={0}
              aria-selected={e.id === selectedId}
            >
              <td><Badge tone={ESTADO_BADGE[e.estado].tone}>{ESTADO_BADGE[e.estado].label}</Badge></td>
              <td className="mig-strong">{e.consecutivo}</td>
              <td>{formatFecha(e.fecha)} <span className="ent-sep">·</span> {e.hora}</td>
              <td>{e.origen}</td>
              <td>{e.referencia}</td>
              <td className="mig-ellipsis" title={e.paciente}>{e.paciente}</td>
              <td className="mig-ellipsis" title={e.ubicacion}>{e.ubicacion}</td>
              <td className="mig-ellipsis" title={e.usuario}>{e.usuario}</td>
              <td className="mig-num">{unidadesEntrada(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {entradas.length === 0 && (
        <div className="mig-grid-empty">No hay entradas que coincidan con los filtros seleccionados.</div>
      )}
    </div>
  );
}
