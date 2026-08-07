import './CerrarParcialModal.css';
import { LuBan, LuClock, LuShield, LuX } from 'react-icons/lu';

// Modal "Cerrar parcial con justificación": cierre definitivo de una orden de
// Recepción que quedó parcial y no va a completarse (desabasto, cambio de
// orden médica, etc.). Requiere motivo obligatorio (con detalle libre si es
// "Otro"). legacy-app.js llena #cerrar-parcial-items-list con los ítems que
// quedarán sin recibir y decide el título según la orden abierta.
export default function CerrarParcialModal() {
  return (
    <div className="modal-overlay" id="cerrar-parcial-modal-overlay">
      <div className="modal-card danger-scope" role="dialog" aria-modal="true" aria-labelledby="cerrar-parcial-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon">
              <LuBan className="icon" aria-hidden="true" />
            </div>
            <div>
              <h3 id="cerrar-parcial-modal-title">Cerrar recepción parcial</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="cerrar-parcial-modal-close" aria-label="Cerrar formulario">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            Orden <b id="cerrar-parcial-order-number">—</b>
          </div>

          <div className="suspend-med-list" id="cerrar-parcial-items-list">{/* filas generadas por legacy-app.js */}</div>

          <div className="form-field full" style={{marginBottom: '14px'}}>
            <div className="field-label-row">
              <label htmlFor="cerrar-parcial-motivo">Motivo de cierre</label>
              <span className="required-pill" id="cerrar-parcial-motivo-required" style={{display: 'none'}}>Requerido</span>
            </div>
            <select id="cerrar-parcial-motivo">
              <option value="">Selecciona un motivo...</option>
              <option value="producto_agotado">Producto agotado en farmacia</option>
              <option value="cambio_orden">Cambio de orden médica</option>
              <option value="paciente_alta">Paciente dado de alta o trasladado</option>
              <option value="solicitud_cancelada">Solicitud cancelada</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-field full" id="cerrar-parcial-detalle-wrap" style={{display: 'none', marginBottom: '14px'}}>
            <div className="field-label-row">
              <label htmlFor="cerrar-parcial-detalle">Especifica el motivo</label>
              <span className="required-pill" id="cerrar-parcial-detalle-required" style={{display: 'none'}}>Requerido</span>
            </div>
            <textarea id="cerrar-parcial-detalle" rows="2" placeholder="Describe brevemente el motivo del cierre..."></textarea>
          </div>

          <div className="admin-summary-time" style={{marginTop: '0'}}>
            <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
            Quedará registrada con hora <b id="cerrar-parcial-hora-registro">--:--</b> · por <b id="cerrar-parcial-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <LuShield className="icon" aria-hidden="true" />
            Esta orden quedará cerrada sin recepción completa. Las unidades ya recibidas conservan su lote/vencimiento en el Cronograma; las unidades faltantes no ingresarán a farmacia para este pedido.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="cerrar-parcial-cancel-btn">Cancelar</button>
          <button className="btn btn-danger" type="button" id="cerrar-parcial-confirm-btn">Cerrar parcial</button>
        </div>
      </div>
    </div>
  );
}
