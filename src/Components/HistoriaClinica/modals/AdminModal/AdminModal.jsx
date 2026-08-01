import './AdminModal.css';
import { LuClock, LuShieldCheck, LuTriangleAlert, LuX } from 'react-icons/lu';

// Modal "Registrar administración": resumen del medicamento (incluida la
// fecha de la dosis, no solo la hora — el cronograma permite navegar a otros
// días), alerta de alergias del paciente (leída del banner, ver
// admin-alergias-row), selección de lote disponible (FEFO), insumos
// utilizados (opcional) y checklist de los 5 correctos como 5 verificaciones
// independientes. legacy-app.js llena admin-lote-list / admin-insumos-list y
// habilita admin-confirm-btn solo cuando hay lote elegido + las 5 verificaciones marcadas.
export default function AdminModal() {
  return (
    <div className="modal-overlay" id="admin-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <div className="modal-header">
          <h3 id="admin-modal-title">Registrar administración</h3>
          <button className="modal-close-btn" type="button" id="admin-modal-close" aria-label="Cerrar formulario">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="admin-summary">
            <div className="admin-summary-name" id="admin-med-nombre">—</div>
            <div className="admin-summary-meta">
              <span className="asm-item"><span className="asm-k">Dosis</span><span className="asm-v" id="admin-dosis-prescrita">—</span></span>
              <span className="asm-sep"></span>
              <span className="asm-item"><span className="asm-k">Vía</span><span className="asm-v" id="admin-via">—</span></span>
              <span className="asm-sep"></span>
              <span className="asm-item"><span className="asm-k">Frecuencia</span><span className="asm-v" id="admin-frecuencia">—</span></span>
              <span className="asm-sep"></span>
              <span className="asm-item"><span className="asm-k">Fecha</span><span className="asm-v" id="admin-fecha-programada">—</span></span>
              <span className="asm-sep"></span>
              <span className="asm-item"><span className="asm-k">Hora programada</span><span className="asm-v" id="admin-hora-programada">—</span></span>
            </div>
            <div className="admin-alergias-row" id="admin-alergias-row" role="alert" style={{display: 'none'}}>
              <LuTriangleAlert className="icon" aria-hidden="true" />
              <span>Alergias registradas: <b id="admin-alergias-list">—</b></span>
            </div>
            <div className="admin-summary-time">
              <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
              Quedará registrada el <b id="admin-fecha-registro">—</b> a las <b id="admin-hora-registro">--:--</b>
            </div>
          </div>

          <div className="admin-lote-section">
            <label className="admin-lote-label" id="admin-lote-label">Selecciona el lote administrado</label>
            <div className="lote-table-wrap">
              <table className="lote-table" role="radiogroup" aria-labelledby="admin-lote-label">
                <thead>
                  <tr>
                    <th className="col-radio"><span className="sr-only">Seleccionar</span></th>
                    <th>Lote</th>
                    <th>Vencimiento</th>
                    <th className="col-disp">Disponible</th>
                    <th className="col-estado">Estado</th>
                  </tr>
                </thead>
                <tbody id="admin-lote-list">{/* filas generadas por legacy-app.js */}</tbody>
              </table>
            </div>
            <div className="admin-lote-warning" id="admin-lote-warning" role="status" aria-live="polite" style={{display: 'none'}}>
              <LuTriangleAlert className="icon" aria-hidden="true" />
              <span id="admin-lote-warning-text"></span>
            </div>
          </div>

          <div className="admin-lote-section" id="admin-insumos-section">
            <label className="admin-lote-label" id="admin-insumos-label">Insumos utilizados <span className="ome-muted" style={{fontWeight: 500}}>(opcional)</span></label>
            <div className="lote-table-wrap">
              <table className="lote-table" aria-labelledby="admin-insumos-label">
                <thead>
                  <tr>
                    <th className="col-radio"><input type="checkbox" id="admin-insumos-select-all" aria-label="Seleccionar todos los insumos"/></th>
                    <th>Insumo</th>
                    <th className="col-disp">Disponible</th>
                  </tr>
                </thead>
                <tbody id="admin-insumos-list">{/* filas generadas por legacy-app.js */}</tbody>
              </table>
            </div>
          </div>

          <div className="form-field full">
            <label htmlFor="admin-observaciones">Observaciones (opcional)</label>
            <textarea id="admin-observaciones" rows="3" placeholder="Ej. Paciente toleró bien la administración, sitio de punción sin signos de infección..."></textarea>
          </div>

          <div className="admin-safety-check" role="group" aria-labelledby="admin-safety-check-title">
            <div className="admin-safety-check-title" id="admin-safety-check-title">
              <LuShieldCheck className="icon" aria-hidden="true" />
              Verificación obligatoria de los 5 correctos
            </div>
            <label className="admin-safety-check-item">
              <input type="checkbox" id="admin-check-paciente" data-safety-check/>
              Paciente correcto
            </label>
            <label className="admin-safety-check-item">
              <input type="checkbox" id="admin-check-medicamento" data-safety-check/>
              Medicamento correcto
            </label>
            <label className="admin-safety-check-item">
              <input type="checkbox" id="admin-check-dosis" data-safety-check/>
              Dosis correcta
            </label>
            <label className="admin-safety-check-item">
              <input type="checkbox" id="admin-check-via" data-safety-check/>
              Vía correcta
            </label>
            <label className="admin-safety-check-item">
              <input type="checkbox" id="admin-check-hora" data-safety-check/>
              Hora correcta
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="admin-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="admin-confirm-btn" disabled>Confirmar administración</button>
        </div>
      </div>
    </div>
  );
}
