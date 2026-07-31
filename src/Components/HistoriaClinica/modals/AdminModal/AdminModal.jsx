import './AdminModal.css';
import { LuClock, LuTriangleAlert, LuX } from 'react-icons/lu';

// Modal "Registrar administración": resumen del medicamento, selección de
// lote disponible (FEFO), insumos utilizados (opcional) y checklist de los
// 5 correctos. legacy-app.js llena admin-lote-list / admin-insumos-list y
// habilita admin-confirm-btn solo cuando hay lote elegido + checklist marcado.
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
              <span className="asm-item"><span className="asm-k">Hora programada</span><span className="asm-v" id="admin-hora-programada">—</span></span>
            </div>
            <div className="admin-summary-time">
              <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
              Quedará registrada con hora <b id="admin-hora-registro">--:--</b>
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
                    <th className="col-radio"><span className="sr-only">Seleccionar</span></th>
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

          <label className="admin-checklist">
            <input type="checkbox" id="admin-5-correctos"/>
            Confirmo los 5 correctos: paciente correcto, medicamento correcto, dosis correcta, vía correcta y hora correcta
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="admin-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="admin-confirm-btn" disabled>Confirmar administración</button>
        </div>
      </div>
    </div>
  );
}
