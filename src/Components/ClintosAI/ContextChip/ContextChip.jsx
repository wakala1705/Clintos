import './ContextChip.css';

// Etiqueta de contexto (brief "Contexto dinámico") — deja explícito, sin
// texto de más, dónde está parado el usuario: la pantalla completa (sin
// selección) o un paciente puntual (con selección en la tabla, ver
// PatientsTable.jsx → HistoriaClinicaHospitalizacion.jsx →
// ClintosAI.jsx). Reusado por WelcomeState y FullscreenWelcome — misma
// pieza, dos lugares donde arranca la conversación.
export default function ContextChip({ selectedPaciente, screenLabel }) {
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
    </div>
  );
}
