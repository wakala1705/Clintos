import './FichaSkeleton.css';

// Mismo criterio que PatientsTableSkeleton (Lista de Pacientes): shimmer de
// bloques, no un spinner genérico.
export default function FichaSkeleton() {
  return (
    <div className="fp-skeleton" role="status" aria-label="Cargando ficha del paciente">
      <div className="fp-skel-header">
        <div className="fp-skel-avatar fp-skel-shimmer"></div>
        <div className="fp-skel-lines">
          <div className="fp-skel-bar fp-skel-shimmer" style={{ width: '220px', height: '16px' }}></div>
          <div className="fp-skel-bar fp-skel-shimmer" style={{ width: '160px', height: '12px' }}></div>
        </div>
      </div>
      <div className="fp-skel-body">
        <div className="fp-skel-nav fp-skel-shimmer"></div>
        <div className="fp-skel-sections">
          {[0, 1, 2].map((i) => (
            <div className="fp-skel-card" key={i}>
              <div className="fp-skel-bar fp-skel-shimmer" style={{ width: '140px', height: '14px', marginBottom: '16px' }}></div>
              {[0, 1, 2].map((r) => (
                <div className="fp-skel-bar fp-skel-shimmer" key={r} style={{ width: `${60 + (r % 3) * 10}%`, height: '11px', marginBottom: '10px' }}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
