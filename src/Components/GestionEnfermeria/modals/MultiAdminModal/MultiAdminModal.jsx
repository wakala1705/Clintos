import './MultiAdminModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuClock, LuShieldCheck, LuTriangleAlert } from 'react-icons/lu';

// Modal "Registrar administración" en modo múltiple: wizard de un paso por
// medicamento (mismo resumen/tabla de lotes/insumos/checklist de 5 correctos
// que AdminModal, ver shared/shared.css), para cuando 2+ medicamentos activos
// están programados a la misma hora — ver barra de selección en
// MedicamentosPanel (bulk-registrar-btn). El riel izquierdo (madmin-rail)
// sigue el mismo patrón de riel de pasos que el wizard "Nueva Cita" de
// /asignacion-citas (wizard-rail), adaptado a los tokens de Historia Clínica.
// legacy-app.js llena cada paso al navegar y solo aplica las N
// administraciones al confirmar el último paso (nada se registra si se
// cancela a mitad de camino).
export default function MultiAdminModal() {
  return (
    <div className="modal-overlay" id="madmin-modal-overlay">
      <div className="modal-card madmin-card" role="dialog" aria-modal="true" aria-labelledby="madmin-modal-title">
        <ModalHeader
          icon={LuShieldCheck}
          tone="primary"
          title="Registrar administración"
          titleId="madmin-modal-title"
          closeId="madmin-modal-close"
          closeLabel="Cerrar formulario"
        />

        <div className="madmin-body">
          <nav className="madmin-rail" id="madmin-steps" aria-label="Medicamentos a registrar">
            {/* pasos generados por legacy-app.js */}
          </nav>

          <div className="madmin-main">
            <div className="madmin-progress" id="madmin-modal-subtitle">Medicamento 1 de 1</div>

            <div className="admin-summary">
              <div className="admin-summary-row">
                <div className="admin-summary-name" id="madmin-med-nombre">—</div>
                <div className="admin-summary-meta">
                  <span className="asm-item"><span className="asm-k">Dosis</span><span className="asm-v" id="madmin-dosis-prescrita">—</span></span>
                  <span className="asm-sep"></span>
                  <span className="asm-item"><span className="asm-k">Vía</span><span className="asm-v" id="madmin-via">—</span></span>
                  <span className="asm-sep"></span>
                  <span className="asm-item"><span className="asm-k">Frecuencia</span><span className="asm-v" id="madmin-frecuencia">—</span></span>
                </div>
              </div>
              <div className="admin-summary-row">
                <div className="admin-summary-meta">
                  <span className="asm-item"><span className="asm-k">Fecha</span><span className="asm-v" id="madmin-fecha-programada">—</span></span>
                  <span className="asm-sep"></span>
                  <span className="asm-item"><span className="asm-k">Hora programada</span><span className="asm-v" id="madmin-hora-programada">—</span></span>
                </div>
                <div className="admin-summary-time">
                  <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
                  Se registrará <b id="madmin-fecha-registro">—</b> · <b id="madmin-hora-registro">--:--</b>
                </div>
              </div>
            </div>

            <div className="admin-lote-section">
              <label className="admin-lote-label" id="madmin-lote-label">Selecciona el lote administrado</label>
              <div className="lote-table-wrap">
                <table className="lote-table" role="radiogroup" aria-labelledby="madmin-lote-label">
                  <thead>
                    <tr>
                      <th className="col-radio"><span className="sr-only">Seleccionar</span></th>
                      <th>Lote</th>
                      <th>Vencimiento</th>
                      <th className="col-disp">Disponible</th>
                      <th className="col-estado">Estado</th>
                    </tr>
                  </thead>
                  <tbody id="madmin-lote-list">{/* filas generadas por legacy-app.js */}</tbody>
                </table>
              </div>
              <div className="admin-lote-warning" id="madmin-lote-warning" role="status" aria-live="polite" style={{display: 'none'}}>
                <LuTriangleAlert className="icon" aria-hidden="true" />
                <span id="madmin-lote-warning-text"></span>
              </div>
            </div>

            <div className="admin-lote-section" id="madmin-insumos-section">
              <label className="admin-lote-label" id="madmin-insumos-label">Insumos utilizados <span className="ome-muted" style={{fontWeight: 500}}>(opcional)</span></label>
              <div className="lote-table-wrap">
                <table className="lote-table" aria-labelledby="madmin-insumos-label">
                  <thead>
                    <tr>
                      <th className="col-radio"><input type="checkbox" id="madmin-insumos-select-all" aria-label="Seleccionar todos los insumos"/></th>
                      <th>Insumo</th>
                      <th className="col-disp">Disponible</th>
                    </tr>
                  </thead>
                  <tbody id="madmin-insumos-list">{/* filas generadas por legacy-app.js */}</tbody>
                </table>
              </div>
            </div>

            <div className="form-field full">
              <label htmlFor="madmin-observaciones">Observaciones (opcional)</label>
              <textarea id="madmin-observaciones" rows="3" placeholder="Ej. Paciente toleró bien la administración, sitio de punción sin signos de infección..."></textarea>
            </div>

            <div className="admin-safety-check" id="madmin-safety-check-block" role="group" aria-labelledby="madmin-safety-check-title">
              <div className="admin-safety-check-title" id="madmin-safety-check-title">
                <LuShieldCheck className="icon" aria-hidden="true" />
                Verificación obligatoria de los 5 correctos
              </div>
              <label className="admin-safety-check-item">
                <input type="checkbox" id="madmin-check-paciente" data-safety-check/>
                Paciente correcto
              </label>
              <label className="admin-safety-check-item">
                <input type="checkbox" id="madmin-check-medicamento" data-safety-check/>
                Medicamento correcto
              </label>
              <label className="admin-safety-check-item">
                <input type="checkbox" id="madmin-check-dosis" data-safety-check/>
                Dosis correcta
              </label>
              <label className="admin-safety-check-item">
                <input type="checkbox" id="madmin-check-via" data-safety-check/>
                Vía correcta
              </label>
              <label className="admin-safety-check-item">
                <input type="checkbox" id="madmin-check-hora" data-safety-check/>
                Hora correcta
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="madmin-cancel-btn">Cancelar</button>
          <button className="btn btn-secondary" type="button" id="madmin-back-btn">Atrás</button>
          <button className="btn btn-primary" type="button" id="madmin-next-btn" disabled>Siguiente</button>
        </div>
      </div>
    </div>
  );
}
