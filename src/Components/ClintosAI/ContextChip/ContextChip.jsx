import './ContextChip.css';
import { LuX } from 'react-icons/lu';

// Etiqueta de contexto (brief "Contexto dinámico") — deja explícito, sin
// texto de más, dónde está parado el usuario: la pantalla completa (sin
// selección) o un paciente puntual (con selección en la tabla, ver
// PatientsTable.jsx → HistoriaClinicaHospitalizacion.jsx →
// ClintosAI.jsx). Reusado por WelcomeState y FullscreenWelcome — misma
// pieza, dos lugares donde arranca la conversación.
//
// `onClear` (solo con paciente seleccionado): antes no había forma de volver
// al contexto de pantalla completa sin ir a deseleccionar la fila en la
// tabla — este botón suelta el contexto directo desde el panel. Deseleccionar
// la fila en la tabla (ver toggleSelectRow en PatientsTable.jsx) hace lo
// mismo por el otro lado; ambos caminos conviven.
//
// Sin `onClear` (ver AtencionPaciente.jsx: ahí el paciente es fijo, toda la
// pantalla es sobre él, no hay a qué "volver"): el botón ni se renderiza —
// mostrarlo igual sería una afordancia muerta (un ✕ que no hace nada al
// hacer click), lo que este proyecto viene evitando en todo el panel.
export default function ContextChip({ selectedPaciente, screenLabel, onClear }) {
  return (
    <div className={`cai-context-chip${selectedPaciente ? ' cai-context-chip--paciente' : ''}`}>
      <span className="cai-context-label">{selectedPaciente ? 'Paciente actual' : 'Contexto actual'}</span>
      {selectedPaciente ? (
        <span className="cai-context-value">
          <strong>{selectedPaciente.paciente}</strong>
          <span className="cai-context-sub">Cama {selectedPaciente.cama}</span>
        </span>
      ) : (
        <span className="cai-context-value">{screenLabel}</span>
      )}
      {selectedPaciente && onClear && (
        <button
          type="button"
          className="cai-context-clear"
          onClick={onClear}
          aria-label="Quitar paciente del contexto"
          title="Quitar paciente del contexto"
        >
          <LuX className="icon" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
