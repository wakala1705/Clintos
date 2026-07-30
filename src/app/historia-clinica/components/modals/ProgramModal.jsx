// Modal "Programar tratamiento": fecha/hora de inicio del esquema + preview de
// las dosis calculadas (agrupadas por día) para cada medicamento pendiente de
// programar. legacy-app.js puebla program-hora-inicio (cada 15 min) y recalcula
// el preview en #program-med-blocks cada vez que cambian fecha u hora.
export default function ProgramModal() {
  return (
    <div className="modal-overlay" id="program-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="program-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon icon-primary">
              <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="m9 16 2 2 4-4"/></svg>
            </div>
            <div>
              <h3 id="program-modal-title">Programar tratamiento</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="program-modal-close" aria-label="Cerrar formulario">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <b id="program-patient-name">—</b>
            <span className="sps-sep"></span>
            <span>CC <b id="program-patient-cc">—</b></span>
          </div>

          <div className="form-field full program-time-field">
            <div>
              <div className="field-label-row" style={{marginBottom: '2px'}}>
                <label htmlFor="program-fecha-inicio">Fecha de inicio</label>
              </div>
              <input type="date" id="program-fecha-inicio"/>
            </div>
            <div>
              <div className="field-label-row" style={{marginBottom: '2px'}}>
                <label htmlFor="program-hora-inicio">Hora de inicio del esquema</label>
              </div>
              <select id="program-hora-inicio"></select>
            </div>
          </div>

          <div id="program-med-blocks">{/* bloques generados por legacy-app.js: medicamento + preview de horarios */}</div>

          <div className="admin-summary-time" style={{marginTop: '0'}}>
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Programado por <b id="program-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>
            Esta programación generará las dosis correspondientes en el Cronograma, en cada fecha real del esquema. Una vez programado, podrás enviar la solicitud a farmacia como un paso separado.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="program-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="program-confirm-btn">
            <span id="program-confirm-label">Confirmar programación</span>
          </button>
        </div>
      </div>
    </div>
  );
}
