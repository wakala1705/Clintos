import './ReturnModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuClock, LuShield, LuUndo2, LuUser } from 'react-icons/lu';

// Modal "Devolver a farmacia": reutiliza el patrón visual del modal de
// Suspender. legacy-app.js calcula automáticamente, por medicamento, qué dosis
// quedaron en estado "suspended" (nunca administradas) y las agrupa por fecha
// dentro de #return-med-list — la cantidad/lote/vencimiento no se piden a mano.
export default function ReturnModal() {
  return (
    <div className="modal-overlay" id="return-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
        <ModalHeader
          icon={LuUndo2}
          tone="primary"
          title="Devolver a farmacia"
          titleId="return-modal-title"
          closeId="return-modal-close"
          closeLabel="Cerrar formulario"
        />

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <LuUser className="icon" aria-hidden="true" />
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
            <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
            Quedará registrada con hora <b id="return-hora-registro">--:--</b> · Devuelto por <b id="return-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <LuShield className="icon" aria-hidden="true" />
            Este registro aparecerá en Pedidos → Devoluciones con estado &quot;Pendiente&quot; hasta que farmacia lo procese. Las dosis, lote y vencimiento se toman automáticamente de lo que quedó suspendido en el Cronograma.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="return-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="return-confirm-btn">
            <LuUndo2 className="icon" aria-hidden="true" />
            Confirmar devolución
          </button>
        </div>
      </div>
    </div>
  );
}
