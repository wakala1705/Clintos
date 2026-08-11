'use client';

import { useEffect } from 'react';
import './DetalleModal.css';
import { LuCircleX, LuReceiptText, LuX } from 'react-icons/lu';

// Detalle de una reposición: datos de cabecera + tabla de artículos. La
// única acción posible es "Cancelar Pedido" (delega a EliminarModal, ver
// solicitud-consumo.jsx), y solo aplica a reposiciones pendientes — la
// confirmación real la hace la bodega que despacha, no quien solicita.
export default function DetalleModal({ open, rep, onClose, onCancelarPedido }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !rep) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="detalle-modal-title">
        <div className="modal-header">
          <div className="left">
            <div className="card-icon"><LuReceiptText className="icon" aria-hidden="true" /></div>
            <h3 id="detalle-modal-title">Detalle de reposición {rep.id}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge ${rep.estado.cls}`}>{rep.estado.text}</span>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar detalle">
              <LuX className="icon" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="info-grid">
            <div className="info-item"><label>Bodega que pide</label><div>{rep.bodega}</div></div>
            <div className="info-item"><label>Bodega que despacha</label><div>{rep.bodegaDespacha}</div></div>
            <div className="info-item"><label>CNS movimiento</label><div>{rep.cns}</div></div>
            <div className="info-item"><label>Procedencia</label><div>{rep.procedencia}</div></div>
            <div className="info-item"><label>Usuario</label><div>{rep.usuario}</div></div>
            <div className="info-item"><label>Fecha / hora confirmación</label><div>{rep.fecha}</div></div>
          </div>

          <div className="modal-section-title">
            <h4>Artículos de la reposición</h4>
            <span className="footer-note">{rep.articulos.length} artículo{rep.articulos.length === 1 ? '' : 's'}</span>
          </div>
          <div className="modal-table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 140 }}>ID artículo</th>
                  <th>Descripción</th>
                  <th style={{ width: 120 }}>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {rep.articulos.map((a) => (
                  <tr key={a.id}>
                    <td className="strong">{a.id}</td>
                    <td>{a.desc}</td>
                    <td>{a.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          {rep.estado.cls === 'amber' && (
            <button type="button" className="btn btn-danger-outline" onClick={() => onCancelarPedido(rep.id)}>
              <LuCircleX className="icon" aria-hidden="true" />
              Cancelar Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
