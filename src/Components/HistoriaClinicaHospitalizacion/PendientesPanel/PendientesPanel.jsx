import './PendientesPanel.css';
import Button from '@/Components/Button/Button';
import {
  LuClipboardList, LuClipboardCheck, LuFilePen, LuFlaskConical, LuTriangleAlert,
} from 'react-icons/lu';

const PREVIEW_MAX = 5;

function iconoDe(p) {
  if (p.tipo === 'evolucion') return LuFilePen;
  if (p.tipo === 'orden') return LuClipboardList;
  return p.critico ? LuTriangleAlert : LuFlaskConical;
}

// Panel lateral "Pendientes clínicos" — equivalente de "Alertas críticas" en
// el Panel General de Enfermería (AlertsPanel.jsx), pero para lo que el
// médico debe resolver: evoluciones sin registrar, órdenes por firmar y
// resultados sin revisar. Un widget de dashboard es para un vistazo rápido,
// no para gestionar: se listan solo los PREVIEW_MAX más urgentes (ya llegan
// ordenados por prioridad y antigüedad, ver pendientesOrdenados), el badge
// muestra el total real. Cada fila abre la historia clínica de ese paciente;
// el botón del pie filtra la tabla a "Con pendientes" (no hay una pantalla
// aparte de pendientes a la cual navegar).
export default function PendientesPanel({ pendientes, onOpenHistoria, onVerPacientesConPendientes }) {
  const preview = pendientes.slice(0, PREVIEW_MAX);

  return (
    <section className="card hh-pendientes-card">
      <div className="hh-pend-header">
        <h2>
          <LuClipboardCheck className="icon" aria-hidden="true" />
          Pendientes clínicos
        </h2>
        <span className="hh-pend-count-badge" aria-label={`${pendientes.length} pendientes clínicos`}>{pendientes.length}</span>
      </div>

      <div className="hh-pend-body">
        {preview.length === 0 ? (
          <p className="hh-pend-empty">No hay pendientes clínicos. ¡Todo al día!</p>
        ) : (
          <>
            <h3 className="hh-pend-section-title">Más urgentes</h3>
            {preview.map((p) => {
              const Icon = iconoDe(p);
              return (
                <button
                  type="button"
                  key={p.id}
                  className={`hh-pend-item hh-pend-${p.prioridad}`}
                  onClick={() => onOpenHistoria(p.pacienteId)}
                >
                  <Icon className="icon hh-pend-icon" aria-hidden="true" />
                  <span className="hh-pend-text">
                    <span className="hh-pend-title">{p.tipoLabel}</span>
                    <span className="hh-pend-detail">{p.detalle} · {p.paciente} · Cama {p.cama}</span>
                  </span>
                  <span className="hh-pend-time">{p.hace}</span>
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="hh-pend-footer">
        <Button variant="secondary" className="hh-pend-footer-btn" onClick={onVerPacientesConPendientes}>
          Ver pacientes con pendientes
        </Button>
      </div>
    </section>
  );
}
