import './ProgramModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCalendarCheck, LuClock, LuShield, LuUser } from 'react-icons/lu';

// Modal "Programar tratamiento": fecha/hora de inicio del esquema + preview de
// las dosis calculadas (agrupadas por día) para cada medicamento pendiente de
// programar. legacy-app.js puebla program-hora-inicio (cada 15 min) y recalcula
// el preview en #program-med-blocks cada vez que cambian fecha u hora.
export default function ProgramModal() {
  return (
    <div className="modal-overlay" id="program-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="program-modal-title">
        <ModalHeader
          icon={LuCalendarCheck}
          tone="primary"
          title="Programar tratamiento"
          titleId="program-modal-title"
          closeId="program-modal-close"
          closeLabel="Cerrar formulario"
        />

        <div className="modal-body">
          <div className="suspend-patient-strip">
            <LuUser className="icon" aria-hidden="true" />
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
            <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
            Programado por <b id="program-por">—</b>
          </div>

          <div className="suspend-audit-note">
            <LuShield className="icon" aria-hidden="true" />
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
