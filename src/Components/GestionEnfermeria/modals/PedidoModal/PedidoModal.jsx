import './PedidoModal.css';
import { LuBox, LuClock, LuPlus, LuShield, LuUser, LuX } from 'react-icons/lu';

// Modal "Pedido a farmacia": cobertura a solicitar (6/12/24h o personalizada),
// resumen de cantidades calculadas por medicamento según su frecuencia, e
// insumos adicionales agregados desde el Catálogo (ver CatalogModal). Al
// confirmar, legacy-app.js crea una Solicitud nueva y su recepción asociada.
export default function PedidoModal() {
  return (
    <div className="modal-overlay" id="pedido-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="pedido-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon icon-primary">
              <LuBox className="icon" aria-hidden="true" />
            </div>
            <div>
              <h3 id="pedido-modal-title">Pedido a farmacia</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="pedido-modal-close" aria-label="Cerrar formulario">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <LuUser className="icon" aria-hidden="true" />
            <b id="pedido-patient-name">—</b>
            <span className="sps-sep"></span>
            <span>CC <b id="pedido-patient-cc">—</b></span>
          </div>

          <div className="form-field full" style={{marginBottom: '24px'}}>
            <div className="field-label-row">
              <label>Cobertura a solicitar</label>
            </div>
            <div className="chip-group" id="pedido-cobertura-group">
              <button type="button" className="chip-filter" data-cobertura="6">6 horas</button>
              <button type="button" className="chip-filter active" data-cobertura="12">12 horas</button>
              <button type="button" className="chip-filter" data-cobertura="24">24 horas</button>
              <button type="button" className="chip-filter" data-cobertura="custom">Personalizado</button>
            </div>
            <div className="pedido-custom-wrap" id="pedido-cobertura-custom-wrap" style={{display: 'none'}}>
              <input type="number" id="pedido-cobertura-custom" min="1" max="240" placeholder="Ej. 48"/>
              <span>horas de cobertura</span>
            </div>
          </div>

          <div className="form-field full" style={{marginBottom: '16px'}}>
            <label>Resumen de la solicitud</label>
            <div className="suspend-med-list" id="pedido-med-summary" style={{marginTop: '6px'}}>{/* generado por legacy-app.js */}</div>
          </div>

          <div className="form-field full" style={{marginBottom: '16px'}}>
            <div className="field-label-row" >
              <label>Insumos adicionales</label>
            </div>
            <div className="insumos-resumen" id="pedido-insumos-resumen" style={{display: 'none'}}></div>
            <button type="button" className="btn btn-outline" id="pedido-add-insumo-btn" >
              <LuPlus className="icon" aria-hidden="true" />
              <span id="pedido-add-insumo-label">Agregar insumos desde el catálogo</span>
            </button>
          </div>

          <div className="admin-summary-time" style={{marginTop: '8px'}}>
            <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
            Solicitado por <b id="pedido-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <LuShield className="icon" aria-hidden="true" />
            Las cantidades se calculan según la frecuencia de cada medicamento y la cobertura elegida, sin exceder el total del tratamiento.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="pedido-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="pedido-confirm-btn">
            Enviar pedido a farmacia
          </button>
        </div>
      </div>
    </div>
  );
}
