import './AlertsPanel.css';
import {
  ACTIVIDAD_RECIENTE, ALERTAS_MEDICACION, TOTAL_ALERTAS,
} from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import { LuClock, LuOctagonAlert, LuTriangleAlert } from 'react-icons/lu';

const SEVERIDAD_ICONO = { critico: LuOctagonAlert, advertencia: LuClock };

// Jerarquía de severidad en 2 niveles (encargo explícito): "Medicaciones
// hoy" son alertas accionables ya (card con ícono + tinte, mismo peso visual
// que .pf-note/.gcm-interpretation en HistoriaClinica), "Actividad reciente"
// es un feed informativo de menor prioridad (fila plana con un punto de
// color, sin tinte de fondo) — ambos grupos sumados son el badge rojo del
// header (7, ver TOTAL_ALERTAS en mockPanelGeneralData.js).
export default function AlertsPanel() {
  return (
    <section className="card pg-alerts-card">
      <div className="pg-alerts-header">
        <h2>
          <LuTriangleAlert className="icon" aria-hidden="true" />
          Alertas críticas
        </h2>
        <span className="pg-alerts-count-badge" aria-label={`${TOTAL_ALERTAS} alertas activas`}>{TOTAL_ALERTAS}</span>
      </div>

      <div className="pg-alerts-body">
        <div className="pg-alerts-section">
          <h3 className="pg-alerts-section-title">Medicaciones hoy</h3>
          {ALERTAS_MEDICACION.map((a) => {
            const Icon = SEVERIDAD_ICONO[a.severidad];
            return (
              <div key={a.id} className={`pg-alert-item pg-alert-${a.severidad}`}>
                <Icon className="icon pg-alert-icon" aria-hidden="true" />
                <div className="pg-alert-text">
                  <p className="pg-alert-title">{a.titulo}</p>
                  <p className="pg-alert-detail">{a.detalle}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pg-alerts-section">
          <h3 className="pg-alerts-section-title">Actividad reciente</h3>
          <ul className="pg-activity-list">
            {ACTIVIDAD_RECIENTE.map((ev) => (
              <li key={ev.id} className="pg-activity-item">
                <span className={`pg-activity-dot pg-activity-${ev.tipo}`} aria-hidden="true" />
                <span className="pg-activity-text">{ev.texto}</span>
                <span className="pg-activity-time">{ev.hace}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pg-alerts-footer">
        <button
          type="button"
          className="btn btn-secondary pg-alerts-footer-btn"
          onClick={() => window.ncToast?.('Listado completo de alertas en desarrollo.')}
        >
          Ver todas las alertas
        </button>
      </div>
    </section>
  );
}
