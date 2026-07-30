// Modal "Devolver a farmacia": reutiliza el patrón visual del modal de
// Suspender. legacy-app.js calcula automáticamente, por medicamento, qué dosis
// quedaron en estado "suspended" (nunca administradas) y las agrupa por fecha
// dentro de #return-med-list — la cantidad/lote/vencimiento no se piden a mano.
export default function ReturnModal() {
  return (
    <div className="modal-overlay" id="return-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon icon-primary">
              <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
            </div>
            <div>
              <h3 id="return-modal-title">Devolver a farmacia</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="return-modal-close" aria-label="Cerrar formulario">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <b id="return-patient-name">—</b>
            <span className="sps-sep"></span>
            <span>CC <b id="return-patient-cc">—</b></span>
          </div>

          <div className="suspend-med-list" id="return-med-list">{/* filas generadas por legacy-app.js */}</div>

          <div className="form-field full" style={{marginBottom: '14px'}}>
            <div className="field-label-row">
              <label htmlFor="return-motivo">Motivo de la devolución</label>
              <span className="required-pill" id="return-motivo-required" style={{display: 'none'}}>Requerido</span>
            </div>
            <select id="return-motivo">
              <option value="suspension_tratamiento">Suspensión de tratamiento</option>
              <option value="cambio_orden">Cambio de orden médica</option>
              <option value="sobrante">Sobrante de dispensación</option>
              <option value="vencimiento_proximo">Vencimiento próximo</option>
              <option value="error_dispensacion">Error en dispensación</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-field full" id="return-detalle-wrap" style={{display: 'none', marginBottom: '14px'}}>
            <div className="field-label-row">
              <label htmlFor="return-detalle">Especifica el motivo</label>
              <span className="required-pill" id="return-detalle-required" style={{display: 'none'}}>Requerido</span>
            </div>
            <textarea id="return-detalle" rows="2" placeholder="Describe brevemente el motivo de la devolución..."></textarea>
          </div>

          <div className="admin-summary-time" style={{marginTop: '0'}}>
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Quedará registrada con hora <b id="return-hora-registro">--:--</b> · Devuelto por <b id="return-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            Este registro aparecerá en Pedidos → Devoluciones con estado &quot;Pendiente&quot; hasta que farmacia lo procese. Las dosis, lote y vencimiento se toman automáticamente de lo que quedó suspendido en el Cronograma.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="return-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="return-confirm-btn">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
            Confirmar devolución
          </button>
        </div>
      </div>
    </div>
  );
}
