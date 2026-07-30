// Tab "Gestión de medicamentos": navegación de día, filtros del cronograma,
// barra de selección masiva y la tabla-línea-de-tiempo (encabezado de horas y
// cuerpo se inyectan por legacy-app.js vía los ids hour-header-row/timeline-body).
export default function MedicamentosPanel() {
  return (
    <div role="tabpanel" id="panel-medicamentos" aria-labelledby="tab-medicamentos" tabIndex="0" className="tab-panel active">
      <div className="filter-bar">
        <div className="day-nav" id="day-nav">
          <button type="button" className="day-nav-btn" id="day-prev-btn" title="Día anterior" aria-label="Ver día anterior">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="day-nav-label" id="day-nav-label">02 May 2026</span>
          <button type="button" className="day-nav-btn" id="day-next-btn" title="Día siguiente" aria-label="Ver día siguiente">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
          <button type="button" className="day-nav-today-btn" id="day-nav-today-btn" style={{display: 'none'}}>Hoy</button>
        </div>

        <div className="filter-divider"></div>

        <div className="search-field">
          <label htmlFor="search-input" className="sr-only">Buscar medicamento por nombre</label>
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
          <input type="text" placeholder="Buscar medicamento..." id="search-input"/>
        </div>

        <div className="chip-group" id="estado-chip-group">
          <button className="chip-filter active" data-estado="" aria-pressed="true">Todos</button>
          <button className="chip-filter" data-estado="activo" aria-pressed="false">Activos</button>
          <button className="chip-filter" data-estado="suspendido" aria-pressed="false">Suspendidos</button>
          <button className="chip-filter" data-estado="finalizado" aria-pressed="false">Finalizados</button>
        </div>

        <div className="filter-divider"></div>

        <div className="chip-group">
          <button className="chip-filter active" data-quickdate="hoy" aria-pressed="true">Hoy</button>
          <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
        </div>

        <div className="filter-popover-wrap" id="date-popover-wrap">
          <button className="date-picker-btn" id="date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="date-popover">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
            <span id="date-range-label">Rango personalizado</span>
            <svg className="icon chev" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div className="filter-popover" id="date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
            <div className="fp-title">Seleccionar rango de fechas</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="date-from">Desde</label>
                <input type="date" id="date-from"/>
              </div>
              <div className="fp-date-field">
                <label htmlFor="date-to">Hasta</label>
                <input type="date" id="date-to"/>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="date-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="date-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>

        <div className="filter-divider"></div>

        <div className="filter-popover-wrap" id="more-popover-wrap">
          <button className="filters-more-btn" id="more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="more-popover">
            <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Otros filtros
            <span className="badge-count" id="more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
          </button>
          <div className="filter-popover filter-popover-wide" id="more-popover" role="dialog" aria-label="Otros filtros: turno y vía">
            <div className="fp-section">
              <div className="fp-section-title">Turno</div>
              <div className="chip-group" id="turno-chip-group">
                <button className="chip-filter" data-turno="manana" aria-pressed="false">Mañana</button>
                <button className="chip-filter" data-turno="tarde" aria-pressed="false">Tarde</button>
                <button className="chip-filter" data-turno="noche" aria-pressed="false">Noche</button>
              </div>
            </div>
            <div className="fp-section">
              <div className="fp-section-title">Vía</div>
              <div className="chip-group" id="via-chip-group">
                <button className="chip-filter" data-via="VO" aria-pressed="false">VO</button>
                <button className="chip-filter" data-via="IV" aria-pressed="false">IV</button>
                <button className="chip-filter" data-via="IM" aria-pressed="false">IM</button>
                <button className="chip-filter" data-via="SC" aria-pressed="false">SC</button>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="more-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="more-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>

        <div className="filter-spacer"></div>

        <div className="view-toggle-group">
          <button className="view-btn" type="button" id="view-compact-btn" title="Compactar filas" aria-label="Compactar filas">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
          </button>
          <button className="view-btn" type="button" id="view-expand-btn" title="Expandir filas" aria-label="Expandir filas">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
          <div className="view-toggle-divider"></div>
          <button className="view-btn active" type="button" id="view-columns-btn" title="Ver todas las horas" aria-label="Ver todas las horas" aria-pressed="true">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="18" x="14" y="3" rx="1"/></svg>
          </button>
          <button className="view-btn" type="button" id="view-split-btn" title="Ver solo horas pares" aria-label="Ver solo horas pares" aria-pressed="false">
            <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
          </button>
        </div>
      </div>

      <div className="selection-toolbar" id="selection-toolbar">
        <div className="sel-info" aria-live="polite"><b id="sel-count">0</b> medicamento(s) seleccionado(s)</div>
        <div className="sel-actions" id="sel-actions"></div>
        <div className="sel-hint" id="sel-hint" aria-live="polite"></div>
        <div className="sel-spacer"></div>
        <button className="sel-cancel-btn" type="button" id="sel-cancel-btn">Cancelar selección</button>
      </div>

      <div className="timeline-wrap" id="timeline-wrap">
        <table className="timeline-table">
          <thead>
            <tr id="hour-header-row">
              <th className="check-col-head"><input type="checkbox" className="select-all-check" id="select-all-check" title="Seleccionar todos" aria-label="Seleccionar todos los medicamentos visibles"/></th>
              <th className="med-col-head">Medicamentos</th>
              {/* hour headers injected by legacy-app.js */}
            </tr>
          </thead>
          <tbody id="timeline-body">
            {/* rows injected by legacy-app.js */}
          </tbody>
        </table>
      </div>

      <div className="legend-bar">
        <div className="footer-title-block">
          <div className="ft-sub" id="ft-sub">7 medicamentos · ronda del 02 May 2026</div>
        </div>
        <div className="legend-divider"></div>
        <div className="legend-items">
          <div className="legend-item"><span className="legend-marker scheduled"></span>Programado</div>
          <div className="legend-item"><span className="legend-marker administered"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>Administrado</div>
          <div className="legend-item"><span className="legend-marker upcoming"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>Próximo</div>
          <div className="legend-item"><span className="legend-marker incident"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg></span>Incidencia</div>
          <div className="legend-item"><span className="legend-marker suspended"><svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg></span>Suspendido</div>
        </div>
        <div className="footer-updated">Última actualización: <b>14:32h</b></div>
      </div>
    </div>
  );
}
