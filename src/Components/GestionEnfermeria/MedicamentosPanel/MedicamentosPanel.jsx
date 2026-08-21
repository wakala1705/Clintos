import './MedicamentosPanel.css';
import { LuCalendar, LuCheck, LuChevronDown, LuChevronLeft, LuChevronRight, LuCircleDotDashed, LuClock, LuFilter, LuMinus, LuPlus, LuSearch, LuSlidersHorizontal, LuTriangleAlert } from 'react-icons/lu';

// Tab "Gestión de medicamentos": navegación de día, filtros del cronograma,
// barra de selección masiva y la tabla-línea-de-tiempo (encabezado de horas y
// cuerpo se inyectan por legacy-app.js vía los ids hour-header-row/timeline-body).
export default function MedicamentosPanel() {
  return (
    <div role="tabpanel" id="panel-medicamentos" aria-labelledby="tab-medicamentos" tabIndex="0" className="tab-panel active">
      <div className="filter-bar">

        <div className="search-field">
          <label htmlFor="search-input" className="sr-only">Buscar medicamento por nombre</label>
          <LuSearch className="icon" aria-hidden="true" />
          <input type="text" placeholder="Buscar medicamento..." id="search-input"/>
        </div>



        <div className="day-nav" id="day-nav">
          <button type="button" className="day-nav-btn" id="day-prev-btn" title="Día anterior" aria-label="Ver día anterior">
            <LuChevronLeft className="icon" aria-hidden="true" />
          </button>
          <span className="day-nav-label" id="day-nav-label">02 May 2026</span>
          <button type="button" className="day-nav-btn" id="day-next-btn" title="Día siguiente" aria-label="Ver día siguiente">
            <LuChevronRight className="icon" aria-hidden="true" />
          </button>
          <button type="button" className="day-nav-today-btn" id="day-nav-today-btn" style={{display: 'none'}}>Hoy</button>
        </div>

        <div className="filter-spacer"></div>

        <div className="chip-group segmented" id="estado-chip-group">
          <button className="chip-filter active" data-estado="activo" aria-pressed="true">Activos</button>
          <button className="chip-filter" data-estado="finalizado" aria-pressed="false">Finalizados</button>
          <button className="chip-filter" data-estado="suspendido" aria-pressed="false">Suspendidos</button>
          <button className="chip-filter" data-estado="" aria-pressed="false">Todos</button>
        </div>

        <div className="filter-divider"></div>

        <div className="chip-group segmented">
          <button className="chip-filter active" data-quickdate="hoy" aria-pressed="true">Hoy</button>
          <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
        </div>

        <div className="filter-popover-wrap" id="date-popover-wrap">
          <button className="date-picker-btn" id="date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="date-popover">
            <LuCalendar className="icon" />
            <span id="date-range-label">Rango personalizado</span>
            <LuChevronDown className="icon chev" />
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
            <LuFilter className="icon" />
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

        <div className="filter-popover-wrap" id="view-popover-wrap">
          <button className="date-picker-btn" id="view-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="view-popover">
            <LuSlidersHorizontal className="icon" aria-hidden="true" />
            Vista
            <LuChevronDown className="icon chev" aria-hidden="true" />
          </button>
          <div className="filter-popover filter-popover-right" id="view-popover" role="dialog" aria-label="Ajustes de vista del cronograma">
            <div className="fp-section">
              <div className="fp-section-title">Modo de vista</div>
              <div className="segmented-control">
                <button type="button" className="segmented-btn active" id="view-mode-timeline-btn" aria-pressed="true">Timeline</button>
                <button type="button" className="segmented-btn" id="view-mode-list-btn" aria-pressed="false">Lista</button>
              </div>
            </div>
            <div id="view-timeline-settings">
              <div className="fp-section">
                <div className="fp-section-title">Densidad de columnas</div>
                <div className="density-stepper">
                  <button type="button" className="density-step-btn" id="view-compact-btn" title="Reducir densidad" aria-label="Reducir densidad de columnas">
                    <LuMinus className="icon" aria-hidden="true" />
                  </button>
                  <span className="density-level-label" id="density-level-label">Media</span>
                  <button type="button" className="density-step-btn" id="view-expand-btn" title="Aumentar densidad" aria-label="Aumentar densidad de columnas">
                    <LuPlus className="icon" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="fp-section">
                <div className="fp-section-title">Intervalo de tiempo</div>
                <div className="segmented-control">
                  <button type="button" className="segmented-btn active" id="view-columns-btn" aria-pressed="true">Todas las horas</button>
                  <button type="button" className="segmented-btn" id="view-split-btn" aria-pressed="false">Horas pares</button>
                </div>
              </div>
            </div>
          </div>
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

      {/* Vista "Lista": alternativa al timeline horizontal, una fila por toma
          (no por medicamento) — ver renderDoseList en legacy-app.js. Oculta
          por defecto; view-mode-list-btn la activa. */}
      <ul className="dose-list" id="dose-list" style={{display: 'none'}}>
        {/* filas y estado vacío generados por legacy-app.js */}
      </ul>

      <div className="legend-bar">
        <div className="footer-title-block">
          <div className="ft-sub" id="ft-sub">7 medicamentos · ronda del 02 May 2026</div>
        </div>
        <div className="legend-divider"></div>
        <div className="legend-items">
          <div className="legend-item"><span className="legend-marker scheduled"><LuCircleDotDashed className="icon" strokeWidth="3" /></span>Programado</div>
          <div className="legend-item"><span className="legend-marker administered"><LuCheck className="icon" strokeWidth="3" /></span>Administrado</div>
          <div className="legend-item"><span className="legend-marker upcoming"><LuClock className="icon" strokeWidth="3" /></span>Próximo</div>
          <div className="legend-item"><span className="legend-marker incident"><LuTriangleAlert className="icon" strokeWidth="3" /></span>Incidencia</div>
          <div className="legend-item"><span className="legend-marker suspended"><LuMinus className="icon" strokeWidth="3" /></span>Suspendido</div>
        </div>
        <div className="footer-updated">Última actualización: <b>14:32h</b></div>
      </div>
    </div>
  );
}
