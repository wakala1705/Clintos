import './OrdenDetalleModal.css';
import { LuClipboardList, LuUser, LuX } from 'react-icons/lu';

// Modal "Ver detalle" de una orden médica (Órdenes médicas > Medicamentos):
// consecutivo/médico/fecha/estado de la orden + lista de sus medicamentos con
// dosis/frecuencia/vía/duración y sus estados de programación/pedido.
// legacy-app.js puebla los campos y #orden-detalle-meds al abrir (openOrdenDetalleModal).
export default function OrdenDetalleModal() {
  return (
    <div className="modal-overlay" id="orden-detalle-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="orden-detalle-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon icon-primary">
              <LuClipboardList className="icon" aria-hidden="true" />
            </div>
            <div>
              <h3 id="orden-detalle-modal-title">Detalle de la orden</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="orden-detalle-modal-close" aria-label="Cerrar detalle">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <LuUser className="icon" aria-hidden="true" />
            <b id="orden-detalle-patient-name">—</b>
            <span className="sps-sep"></span>
            <span>CC <b id="orden-detalle-patient-cc">—</b></span>
          </div>

          <div className="orden-detalle-meta">
            <div className="odm-item">
              <span className="odm-lbl">Consecutivo</span>
              <b id="orden-detalle-consecutivo">—</b>
            </div>
            <div className="odm-item">
              <span className="odm-lbl">Médico</span>
              <b id="orden-detalle-medico">—</b>
            </div>
            <div className="odm-item">
              <span className="odm-lbl">Fecha de la orden</span>
              <b id="orden-detalle-fecha">—</b>
            </div>
            <div className="odm-item">
              <span className="odm-lbl">Estado</span>
              <span id="orden-detalle-estado"></span>
            </div>
          </div>

          <div className="suspend-med-list" id="orden-detalle-meds">{/* filas generadas por legacy-app.js */}</div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="orden-detalle-close-btn">Cerrar</button>
        </div>
      </div>
    </div>
  );
}
