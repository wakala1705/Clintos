'use client';

import './MovimientosGrid.css';
import Badge from '@/Components/Badge/Badge';
import MovimientoRowMenu from '../MovimientoRowMenu/MovimientoRowMenu';
import { formatFecha } from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuPencil } from 'react-icons/lu';

const COLUMNS = [
  'Estado', 'Consecutivo', 'No.Admisión', 'No.Prestación', 'Fecha', 'Hora',
  'Procedencia', 'Movimiento', 'Paciente', 'Ubicación', 'Id.Contrato',
];

// Tono/label del Badge por fila -- distinto de ESTADO_OPTIONS (plural,
// pensado para los chips del toolbar), acá singular porque es el estado de
// UN movimiento puntual.
const ESTADO_BADGE = {
  confirmado: { tone: 'success', label: 'Confirmado' },
  'sin-confirmar': { tone: 'warn', label: 'Sin Confirmar' },
  anulado: { tone: 'danger', label: 'Anulado' },
};

// Réplica de la grilla principal de la pantalla legacy de referencia --
// mismo esqueleto .mig-grid/.mig-ellipsis/.mig-num que MovimientoItemsTable
// (ver Solicitudes/shared/shared.css), fila seleccionable con el mismo
// patrón de teclado/aria que FacturasGridClasica/AdmisionesTable. Columna
// "Acciones": "Editar" queda como botón directo (mismo patrón .col-acciones/
// icon-btn + stopPropagation que AdmisionesTable), Ver detalle/Imprimir/
// Anular se agrupan en el menú "⋮" (MovimientoRowMenu) -- V1 sigue siendo
// visual-only (sin modales todavía, ver spec), por eso sin onClick con
// efecto real.
export default function MovimientosGrid({
  movimientos, selectedId, onSelect, onVerDetalle,
}) {
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
            {COLUMNS.map((c) => <th key={c}>{c}</th>)}
            <th className="col-acciones"><span className="sr-only">Acciones</span></th>
          </tr>
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
              <td><Badge tone={ESTADO_BADGE[m.estado].tone}>{ESTADO_BADGE[m.estado].label}</Badge></td>
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
              <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                <div className="mig-row-actions">
                  <button type="button" className="mig-icon-btn" onClick={(e) => e.stopPropagation()} aria-label={`Editar movimiento ${m.consecutivo}`} title="Editar">
                    <LuPencil className="icon" />
                  </button>
                  <MovimientoRowMenu consecutivo={m.consecutivo} onVerDetalle={() => onVerDetalle(m)} />
                </div>
              </td>
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
