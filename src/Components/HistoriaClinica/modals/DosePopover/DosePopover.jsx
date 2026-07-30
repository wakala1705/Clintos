import './DosePopover.css';
import { LuBan, LuCalendarDays, LuCirclePause, LuPackageCheck } from 'react-icons/lu';

// Popover flotante (hover/click/focus) sobre cada marcador de dosis del
// cronograma. legacy-app.js lo posiciona vía JS (top/left inline) y llena
// todos los campos con textContent/estilos según la dosis seleccionada.
export default function DosePopover() {
  return (
    <div className="dose-popover" id="dose-popover">
      <div className="dp-header">
        <span className="dp-time" id="dp-time">--:--</span>
        <span className="dp-status-badge" id="dp-status-badge"><span className="dot"></span><span id="dp-status-label">—</span></span>
      </div>
      <div className="dp-info" id="dp-info">
        <div className="dp-info-row"><span className="k">Fecha</span><span className="v" id="dp-fecha">—</span></div>
        <div className="dp-info-row"><span className="k">Hora programada</span><span className="v" id="dp-hora-programada">—</span></div>
        <div className="dp-info-row" id="dp-row-hora-real" style={{display: 'none'}}><span className="k">Hora real</span><span className="v" id="dp-hora-real">—</span></div>
        <div className="dp-info-row" id="dp-row-dosis-real" style={{display: 'none'}}><span className="k">Dosis administrada</span><span className="v" id="dp-dosis-real">—</span></div>
        <div className="dp-info-row" id="dp-row-via-real" style={{display: 'none'}}><span className="k">Vía administrada</span><span className="v" id="dp-via-real">—</span></div>
        <div className="dp-info-row"><span className="k">Profesional</span><span className="v" id="dp-profesional">—</span></div>
        <div className="dp-info-row" id="dp-row-lote"><span className="k">Lote</span><span className="v" id="dp-lote">—</span></div>
        <div className="dp-info-row" id="dp-row-vencimiento"><span className="k">Vencimiento</span><span className="v" id="dp-vencimiento">—</span></div>
        <div className="dp-pending-note" id="dp-lote-pending-note" style={{display: 'none'}}>El lote y vencimiento se seleccionan al registrar la administración.</div>
        <div className="dp-observaciones" id="dp-observaciones" style={{display: 'none'}}></div>
      </div>
      <div className="dp-divider" id="dp-divider"></div>
      <div className="dp-resolved-note" id="dp-resolved-note" style={{display: 'none'}}></div>
      <div className="dp-actions" id="dp-actions">
        <button className="dp-action" type="button" id="dp-action-registrar">
          <LuPackageCheck className="icon" />
          Registrar administración
        </button>
        <button className="dp-action" type="button">
          <LuCalendarDays className="icon" />
          Reprogramar
        </button>
        <button className="dp-action" type="button" id="dp-action-suspender">
          <LuCirclePause className="icon" />
          Suspender
        </button>
        <button className="dp-action danger" type="button">
          <LuBan className="icon" />
          No aplicar
        </button>
      </div>
    </div>
  );
}
