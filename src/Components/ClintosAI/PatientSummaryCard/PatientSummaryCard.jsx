import './PatientSummaryCard.css';

// Resumen clínico estructurado (STATE 05) — siempre deja explícito qué
// información se usó ("Información utilizada") y da una vía al dato
// original, nunca se presenta como la única fuente de verdad (brief
// "Confianza y seguridad").
export default function PatientSummaryCard({
  nombre, estado, diagnostico, resumen, pendientes, fuentes, onVerOriginal,
}) {
  return (
    <div className="cai-summary">
      <p className="cai-summary-title">Resumen del paciente</p>

      <div className="cai-summary-field">
        <span className="cai-summary-label">Paciente</span>
        <span className="cai-summary-value cai-summary-value-strong">{nombre}</span>
      </div>
      <div className="cai-summary-field">
        <span className="cai-summary-label">Estado</span>
        <span className="cai-summary-value">{estado}</span>
      </div>
      <div className="cai-summary-field">
        <span className="cai-summary-label">Diagnóstico</span>
        <span className="cai-summary-value">{diagnostico}</span>
      </div>
      <div className="cai-summary-field">
        <span className="cai-summary-label">Resumen</span>
        <span className="cai-summary-value">{resumen}</span>
      </div>

      {pendientes.length > 0 && (
        <div className="cai-summary-field">
          <span className="cai-summary-label">Pendientes</span>
          <ul className="cai-summary-list">
            {pendientes.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      )}

      <div className="cai-summary-field">
        <span className="cai-summary-label">Información utilizada</span>
        <ul className="cai-summary-list cai-summary-fuentes">
          {fuentes.map((f) => <li key={f}>{f}</li>)}
        </ul>
      </div>

      <button type="button" className="cai-summary-link" onClick={onVerOriginal}>
        Ver información original
      </button>
    </div>
  );
}
