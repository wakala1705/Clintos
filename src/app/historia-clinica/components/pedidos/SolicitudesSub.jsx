// Sub-panel "Solicitudes" de Pedidos: filtros + acordeón consecutivo → ítems.
// Las filas se generan por legacy-app.js (renderSolicitudesList) dentro de
// #solicitudes-list — nuevas solicitudes creadas desde "Pedido a farmacia" se
// insertan ahí también, así que este componente solo aporta el shell.
export default function SolicitudesSub() {
  return (
    <div role="tabpanel" id="subpanel-solicitudes" aria-labelledby="subtab-solicitudes" tabIndex="0" className="sub-panel active">
      <div className="filter-bar">
        <div className="search-field">
          <label htmlFor="search-solicitudes" className="sr-only">Buscar solicitud por medicamento o insumo</label>
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input type="text" placeholder="Buscar medicamento o insumo..." id="search-solicitudes"/>
        </div>
        <div className="chip-group" id="chipgroup-solicitudes-estado">
          <button className="chip-filter active" data-filter="todas" aria-pressed="true">Todas</button>
          <button className="chip-filter" data-filter="pendiente" aria-pressed="false">Pendientes</button>
          <button className="chip-filter" data-filter="aprobada" aria-pressed="false">Aprobadas</button>
          <button className="chip-filter" data-filter="despachada" aria-pressed="false">Despachadas</button>
          <button className="chip-filter" data-filter="rechazada" aria-pressed="false">Rechazadas</button>
        </div>
        <div className="filter-divider"></div>
        <div className="chip-group" id="chipgroup-solicitudes-fecha">
          <button className="chip-filter" data-quickdate="hoy" aria-pressed="false">Hoy</button>
          <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
        </div>
        <div className="filter-popover-wrap" id="sol-date-popover-wrap">
          <button className="date-picker-btn" id="sol-date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="sol-date-popover">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span id="sol-date-range-label">Rango personalizado</span>
            <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div className="filter-popover" id="sol-date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
            <div className="fp-title">Seleccionar rango de fechas</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="sol-date-from">Desde</label>
                <input type="date" id="sol-date-from"/>
              </div>
              <div className="fp-date-field">
                <label htmlFor="sol-date-to">Hasta</label>
                <input type="date" id="sol-date-to"/>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="sol-date-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="sol-date-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>
        <div className="filter-divider"></div>
        <div className="filter-popover-wrap" id="sol-more-popover-wrap">
          <button className="filters-more-btn" id="sol-more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="sol-more-popover">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Otros filtros
            <span className="badge-count" id="sol-more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
          </button>
          <div className="filter-popover" id="sol-more-popover" role="dialog" aria-label="Otros filtros: prioridad">
            <div className="fp-section">
              <div className="fp-section-title">Prioridad</div>
              <div className="chip-group" id="sol-prioridad-chip-group">
                <button className="chip-filter" data-prioridad="normal" aria-pressed="false">Normal</button>
                <button className="chip-filter" data-prioridad="urgente" aria-pressed="false">Urgente</button>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="sol-more-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="sol-more-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>
      </div>
      <div className="dev-header-row sol-grid-cols">
        <span></span>
        <span>Consecutivo</span>
        <span>Medicamentos / insumos</span>
        <span>Prioridad</span>
        <span>Solicitado por</span>
        <span>Fecha y hora</span>
        <span>Estado</span>
        <span className="col-actions">Acciones</span>
      </div>
      <div className="dev-list" id="solicitudes-list">{/* filas generadas por legacy-app.js */}</div>
      <div className="legend-bar">
        <div className="footer-title-block"><div className="ft-sub" id="solicitudes-footer-count">5 solicitudes · 9 ítems · turno actual</div></div>
        <div className="footer-updated">Última actualización: <b>14:32h</b></div>
      </div>
    </div>
  );
}
