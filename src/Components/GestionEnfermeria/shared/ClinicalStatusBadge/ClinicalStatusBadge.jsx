import './ClinicalStatusBadge.css';

const STATUS_LABEL = {
  administered: 'Administrado',
  upcoming: 'Próximo',
  incident: 'Incidencia',
  scheduled: 'Programado',
  suspended: 'Suspendido',
};

// Envuelve las clases ya existentes .dp-status-badge/.st-*/.dot
// (GestionEnfermeria/shared/shared.css:624-638) en un componente propio —
// no define ningún color nuevo.
export default function ClinicalStatusBadge({ status }) {
  const label = STATUS_LABEL[status];
  return (
    <span className={`dp-status-badge st-${status}`}>
      <span className="dot" aria-hidden="true" />
      {label}
    </span>
  );
}
