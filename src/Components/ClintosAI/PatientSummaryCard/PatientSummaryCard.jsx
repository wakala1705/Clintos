import './PatientSummaryCard.css';
import SourcesDisclosure from '../SourcesDisclosure/SourcesDisclosure';

// Resumen clínico estructurado (STATE 05) — siempre deja explícito qué
// información se usó (SourcesDisclosure, brief "Fuentes y trazabilidad") y
// da una vía al dato original, nunca se presenta como la única fuente de
// verdad (brief "Confianza y seguridad"). Nombre+cama agrupados como
// encabezado compacto (segunda iteración) en vez de un campo "Paciente"
// aparte — es el mismo dato que ya identifica al paciente en toda la app
// (ver PatientsTable.jsx: "Cama · nombre").
export default function PatientSummaryCard({
  nombre, cama, estado, diagnostico, resumen, pendientes, fuentes, onVerOriginal,
}) {
  return (
    <div className="cai-summary">
      <p className="cai-summary-title">Resumen del paciente</p>

      <div className="cai-summary-field">
        <span className="cai-summary-value cai-summary-value-strong">{nombre}</span>
        <span className="cai-summary-value cai-summary-value-muted">Cama {cama}</span>
      </div>

      <div className="cai-summary-inline">
        <div className="cai-summary-field">
          <span className="cai-summary-label">Estado</span>
          <span className="cai-summary-value">{estado}</span>
        </div>
        <div className="cai-summary-field">
          <span className="cai-summary-label">Diagnóstico</span>
          <span className="cai-summary-value">{diagnostico}</span>
        </div>
      </div>

      <div className="cai-summary-divider" />

      <div className="cai-summary-field">
        <span className="cai-summary-label">Resumen</span>
        <span className="cai-summary-value">{resumen}</span>
      </div>

      {pendientes.length > 0 && (
        <>
          <div className="cai-summary-divider" />
          <div className="cai-summary-field">
            <span className="cai-summary-label">Pendientes</span>
            <ul className="cai-summary-list">
              {pendientes.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>
        </>
      )}

      <div className="cai-summary-divider" />
      <SourcesDisclosure fuentes={fuentes} />

      <button type="button" className="cai-summary-link" onClick={onVerOriginal}>
        Ver información original
      </button>
    </div>
  );
}
