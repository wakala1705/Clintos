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
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="m9 12 2 2 4-4"/></svg>
          Registrar administración
        </button>
        <button className="dp-action" type="button">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>
          Reprogramar
        </button>
        <button className="dp-action" type="button" id="dp-action-suspender">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="9" y2="15"/><line x1="14" x2="14" y1="9" y2="15"/></svg>
          Suspender
        </button>
        <button className="dp-action danger" type="button">
          <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
          No aplicar
        </button>
      </div>
    </div>
  );
}
