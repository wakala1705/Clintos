// Modal "Suspender tratamiento": lista de medicamentos a suspender (uno desde
// el popover de dosis, o varios desde la selección masiva), motivo obligatorio
// (con detalle libre si es "Otro") y nota de auditoría. legacy-app.js decide el
// título/plural según cuántos medicamentos vengan en suspendModalMeds.
export default function SuspendModal() {
  return (
    <div className="modal-overlay" id="suspend-modal-overlay">
      <div className="modal-card danger-scope" role="dialog" aria-modal="true" aria-labelledby="suspend-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon">
              <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <div>
              <h3 id="suspend-modal-title">Suspender tratamiento</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="suspend-modal-close" aria-label="Cerrar formulario">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <b id="suspend-patient-name">—</b>
            <span className="sps-sep"></span>
            <span>CC <b id="suspend-patient-cc">—</b></span>
          </div>

          <div className="suspend-med-list" id="suspend-med-list">{/* filas generadas por legacy-app.js */}</div>

          <div className="form-field full" style={{marginBottom: '14px'}}>
            <div className="field-label-row">
              <label htmlFor="suspend-motivo">Motivo de suspensión</label>
              <span className="required-pill" id="suspend-motivo-required" style={{display: 'none'}}>Requerido</span>
            </div>
            <select id="suspend-motivo">
              <option value="">Selecciona un motivo...</option>
              <option value="orden_medica">Orden médica de suspensión</option>
              <option value="reaccion_adversa">Reacción adversa / alergia</option>
              <option value="cambio_via">Cambio de vía de administración</option>
              <option value="ayuno_procedimiento">Paciente en ayuno / procedimiento</option>
              <option value="sin_stock">Suspensión temporal — sin stock en farmacia</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="form-field full" id="suspend-detalle-wrap" style={{display: 'none', marginBottom: '14px'}}>
            <div className="field-label-row">
              <label htmlFor="suspend-detalle">Especifica el motivo</label>
              <span className="required-pill" id="suspend-detalle-required" style={{display: 'none'}}>Requerido</span>
            </div>
            <textarea id="suspend-detalle" rows="2" placeholder="Describe brevemente el motivo de la suspensión..."></textarea>
          </div>

          <div className="admin-summary-time" style={{marginTop: '0'}}>
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Quedará registrada con hora <b id="suspend-hora-registro">--:--</b> · Suspendido por <b id="suspend-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            Esta suspensión quedará registrada en el historial clínico del paciente y notificará a farmacia. Las dosis ya administradas no se modifican.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="suspend-cancel-btn">Cancelar</button>
          <button className="btn btn-danger" type="button" id="suspend-confirm-btn">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="9" y2="15"/><line x1="14" x2="14" y1="9" y2="15"/></svg>
            <span id="suspend-confirm-label">Suspender tratamiento</span>
          </button>
        </div>
      </div>
    </div>
  );
}
