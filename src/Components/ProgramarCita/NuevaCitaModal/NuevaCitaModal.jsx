import './NuevaCitaModal.css';
import { DOCTORS } from '@/hooks/ProgramarCita/agendaMockData';
import { LuX } from 'react-icons/lu';

// Markup estático — sin lógica de apertura/cierre ni de guardado todavía
// (ver plan "Rediseño de /programar-cita"). `open` se deja como prop para
// que la siguiente iteración solo tenga que empezar a pasarle estado real.
export default function NuevaCitaModal({ open = false }) {
  return (
    <div className={`pc-modal-overlay${open ? ' open' : ''}`}>
      <div className="pc-modal">
        <div className="pc-modal-header">
          <h3>Agendar cita</h3>
          <button type="button" className="pc-close-x" aria-label="Cerrar"><LuX className="icon" /></button>
        </div>
        <div className="pc-modal-body">
          <div className="pc-field">
            <label htmlFor="nc-paciente">Paciente</label>
            <input type="text" id="nc-paciente" placeholder="Nombre completo" />
          </div>
          <div className="pc-field-row">
            <div className="pc-field">
              <label htmlFor="nc-documento">Documento</label>
              <input type="text" id="nc-documento" placeholder="CC / TI" />
            </div>
            <div className="pc-field">
              <label htmlFor="nc-eps">EPS</label>
              <input type="text" id="nc-eps" placeholder="Aseguradora" />
            </div>
          </div>
          <div className="pc-field">
            <label htmlFor="nc-medico">Médico</label>
            <select id="nc-medico" defaultValue={DOCTORS[0]?.id}>
              {DOCTORS.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>
          <div className="pc-field-row">
            <div className="pc-field">
              <label htmlFor="nc-hora">Hora de inicio</label>
              <select id="nc-hora">
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
              </select>
            </div>
            <div className="pc-field">
              <label htmlFor="nc-duracion">Duración</label>
              <select id="nc-duracion">
                <option value="1">30 min</option>
                <option value="2">60 min</option>
              </select>
            </div>
          </div>
          <div className="pc-field">
            <label htmlFor="nc-tipo">Tipo de consulta</label>
            <select id="nc-tipo">
              <option value="primera">Primera vez</option>
              <option value="control">Control</option>
              <option value="urgencia">Urgencia</option>
            </select>
          </div>
          <div className="pc-field">
            <label htmlFor="nc-motivo">Motivo de consulta</label>
            <textarea id="nc-motivo" rows={2} placeholder="Describe brevemente el motivo"></textarea>
          </div>
        </div>
        <div className="pc-modal-footer">
          <button type="button" className="btn btn-secondary">Cancelar</button>
          <button type="button" className="btn btn-primary">Agendar cita</button>
        </div>
      </div>
    </div>
  );
}
