import './AlertsPanel.css';
import Link from 'next/link';
import { ICONOS_ALERTA } from '@/Components/GestionEnfermeria/AlertasEnfermeria/AlertBadges/AlertBadges';
import { ALERTAS_ACTIVAS, TIPO_ALERTA_CONFIG, alertasUrgentes } from '@/hooks/GestionEnfermeria/mockAlertasData';
import { LuTriangleAlert } from 'react-icons/lu';

const PREVIEW = alertasUrgentes(5);

// Widget "Alertas críticas" del Panel general — relacionado 1:1 con el
// Centro de Alertas (encargo explícito): antes usaba un mock aparte
// (ALERTAS_MEDICACION/ACTIVIDAD_RECIENTE en mockPanelGeneralData.js) sin
// ninguna relación real con las alertas de AlertasEnfermeria; ahora lee las
// mismas 12 alertas activas (mockAlertasData.js) — el badge es el total real
// (ALERTAS_ACTIVAS.length, igual que la pestaña "Todas" del Centro de
// Alertas), no un número aparte. Un widget de dashboard es para un vistazo
// rápido, no para gestionar: se listan solo las `alertasUrgentes` (top 5 por
// prioridad/antigüedad, ver mockAlertasData.js), nunca las 12 completas —
// "Ver todas las alertas" cubre el resto. Reutiliza ICONOS_ALERTA/
// TIPO_ALERTA_CONFIG (AlertasEnfermeria/AlertBadges.jsx) para que el mismo
// tipo de alerta se vea igual acá que en la tabla del Centro de Alertas.
export default function AlertsPanel() {
  return (
    <section className="card pg-alerts-card">
      <div className="pg-alerts-header">
        <h2>
          <LuTriangleAlert className="icon" aria-hidden="true" />
          Alertas críticas
        </h2>
        <span className="pg-alerts-count-badge" aria-label={`${ALERTAS_ACTIVAS.length} alertas activas`}>{ALERTAS_ACTIVAS.length}</span>
      </div>

      <div className="pg-alerts-body">
        <h3 className="pg-alerts-section-title">Más urgentes</h3>
        {PREVIEW.map((a) => {
          const tipoCfg = TIPO_ALERTA_CONFIG[a.tipo];
          const Icon = ICONOS_ALERTA[tipoCfg.icon];
          return (
            <div key={a.id} className={`pg-alert-item pg-alert-${a.prioridad}`}>
              <Icon className="icon pg-alert-icon" aria-hidden="true" />
              <div className="pg-alert-text">
                <p className="pg-alert-title">{a.titulo}</p>
                <p className="pg-alert-detail">
                  {a.detalle}
                  {a.paciente ? ` · ${a.paciente}` : ''} · Cama {a.cama}
                </p>
              </div>
              <span className="pg-alert-time">{a.hace}</span>
            </div>
          );
        })}
      </div>

      <div className="pg-alerts-footer">
        <Link href="/gestion-enfermeria/alertas" className="btn btn-secondary pg-alerts-footer-btn">
          Ver todas las alertas
        </Link>
      </div>
    </section>
  );
}
