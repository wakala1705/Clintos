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
              <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/></svg>
            </div>
            <div>
              <h3 id="pedido-modal-title">Pedido a farmacia</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="pedido-modal-close" aria-label="Cerrar formulario">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <b id="pedido-patient-name">—</b>
            <span className="sps-sep"></span>
            <span>CC <b id="pedido-patient-cc">—</b></span>
          </div>

          <div className="form-field full" style={{marginBottom: '16px'}}>
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
            <div className="field-label-row" style={{marginBottom: '8px'}}>
              <label>Insumos adicionales</label>
            </div>
            <div className="insumos-resumen" id="pedido-insumos-resumen" style={{display: 'none'}}></div>
            <button type="button" className="btn btn-primary" id="pedido-add-insumo-btn" style={{marginTop: 'var(--space-2)'}}>
              <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              <span id="pedido-add-insumo-label">Agregar insumos desde el catálogo</span>
            </button>
          </div>

          <div className="admin-summary-time" style={{marginTop: '8px'}}>
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Solicitado por <b id="pedido-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
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
