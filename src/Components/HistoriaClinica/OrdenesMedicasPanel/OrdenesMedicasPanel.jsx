import './OrdenesMedicasPanel.css';
import { LuCalendar, LuChevronDown, LuClipboardList, LuFilter, LuFolderCheck, LuSearch } from 'react-icons/lu';

// Tab "Órdenes médicas": subnavegación Medicamentos / Otros ordenamientos.
// Las filas de cada tabla (ordenes-list / otros-ordenamientos-tbody) se
// inyectan por legacy-app.js; aquí solo vive el shell (filtros, cabeceras,
// contenedores vacíos) con los mismos ids que ese script espera.
export default function OrdenesMedicasPanel() {
  return (
    <div role="tabpanel" id="panel-ordenes" aria-labelledby="tab-ordenes" tabIndex="0" className="tab-panel">
      <div className="subnav-bar" role="tablist" aria-label="Tipo de orden">
        <button type="button" className="subnav-tab active" role="tab" id="subtab-ome-medicamentos" aria-selected="true" aria-controls="subpanel-ome-medicamentos" tabIndex="0">
          <LuFolderCheck className="icon" aria-hidden="true" />
          Medicamentos
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-ome-otros" aria-selected="false" aria-controls="subpanel-ome-otros" tabIndex="-1">
          <LuClipboardList className="icon" aria-hidden="true" />
          Otros ordenamientos
        </button>
      </div>

      {/* SUB-PANEL: MEDICAMENTOS (órdenes de medicación) */}
      <div role="tabpanel" id="subpanel-ome-medicamentos" aria-labelledby="subtab-ome-medicamentos" tabIndex="0" className="sub-panel active">
        <div className="filter-bar">
          <div className="search-field">
            <label htmlFor="search-ordenes" className="sr-only">Buscar orden por consecutivo, medicamento o médico</label>
            <LuSearch className="icon" aria-hidden="true" />
            <input type="text" placeholder="Buscar por consecutivo, medicamento o médico..." id="search-ordenes"/>
          </div>
          <div className="filter-spacer"></div>
          <div className="chip-group segmented" id="chipgroup-ordenes-estado">
            <button className="chip-filter active" data-filter="todas" aria-pressed="true">Todas</button>
            <button className="chip-filter" data-filter="pendiente" aria-pressed="false">Pendientes de programar</button>
            <button className="chip-filter" data-filter="programada" aria-pressed="false">Programadas</button>
            
          </div>
          <div className="filter-divider"></div>
          <div className="chip-group segmented" id="chipgroup-ordenes-fecha">
            <button className="chip-filter" data-quickdate="hoy" aria-pressed="false">Hoy</button>
            <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
          </div>
          <div className="filter-popover-wrap" id="ome-date-popover-wrap">
            <button className="date-picker-btn" id="ome-date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="ome-date-popover">
              <LuCalendar className="icon" />
              <span id="ome-date-range-label">Rango personalizado</span>
              <LuChevronDown className="icon chev" />
            </button>
            <div className="filter-popover" id="ome-date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
              <div className="fp-title">Seleccionar rango de fechas</div>
              <div className="fp-date-row">
                <div className="fp-date-field">
                  <label htmlFor="ome-date-from">Desde</label>
                  <input type="date" id="ome-date-from"/>
                </div>
                <div className="fp-date-field">
                  <label htmlFor="ome-date-to">Hasta</label>
                  <input type="date" id="ome-date-to"/>
                </div>
              </div>
              <div className="fp-actions">
                <button className="btn btn-secondary" type="button" id="ome-date-clear-btn">Limpiar</button>
                <button className="btn btn-primary" type="button" id="ome-date-apply-btn">Aplicar</button>
              </div>
            </div>
          </div>
          <div className="filter-divider"></div>
          <div className="filter-popover-wrap" id="ome-more-popover-wrap">
            <button className="filters-more-btn" id="ome-more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="ome-more-popover">
              <LuFilter className="icon" />
              Otros filtros
              <span className="badge-count" id="ome-more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
            </button>
            <div className="filter-popover filter-popover-right" id="ome-more-popover" role="dialog" aria-label="Otros filtros: prioridad">
              <div className="fp-section">
                <div className="fp-section-title">Prioridad</div>
                <div className="chip-group" id="ome-prioridad-chip-group">
                  <button className="chip-filter" data-prioridad="Normal" aria-pressed="false">Normal</button>
                  <button className="chip-filter" data-prioridad="Urgente" aria-pressed="false">Urgente</button>
                </div>
              </div>
              <div className="fp-actions">
                <button className="btn btn-secondary" type="button" id="ome-more-clear-btn">Limpiar</button>
                <button className="btn btn-primary" type="button" id="ome-more-apply-btn">Aplicar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="selection-toolbar" id="ome-selection-toolbar">
          <div className="sel-info" aria-live="polite"><b id="ome-sel-count">0</b> medicamento(s) seleccionado(s)</div>
          <div className="sel-actions" id="ome-sel-actions"></div>
          <div className="sel-spacer"></div>
          <button className="sel-cancel-btn" type="button" id="ome-sel-cancel-btn">Cancelar selección</button>
        </div>

        <div className="ome-header-row ome-grid-cols">
          <span></span>
          <span>Consecutivo</span>
          <span>Medicamentos</span>
          <span>Estado</span>
          <span>Médico</span>
          <span>Fecha de la orden</span>
          <span className="col-actions">Acciones</span>
        </div>
        <div className="ome-list" id="ordenes-list">{/* filas generadas por legacy-app.js */}</div>

        <div className="legend-bar">
          <div className="footer-title-block"><div className="ft-sub" id="ordenes-footer-count">3 órdenes · turno actual</div></div>
          <div className="footer-updated">Última actualización: <b>14:32h</b></div>
        </div>
      </div>

      {/* SUB-PANEL: OTROS ORDENAMIENTOS (exámenes, procedimientos, interconsultas...) */}
      <div role="tabpanel" id="subpanel-ome-otros" aria-labelledby="subtab-ome-otros" tabIndex="0" className="sub-panel">
        <div className="filter-bar">
          <div className="search-field">
            <label htmlFor="search-otros-ordenamientos" className="sr-only">Buscar ordenamiento por descripción o médico</label>
            <LuSearch className="icon" aria-hidden="true" />
            <input type="text" placeholder="Buscar por descripción o médico..." id="search-otros-ordenamientos"/>
          </div>
          <div className="filter-spacer"></div>
          <div className="chip-group segmented" id="chipgroup-otros-estado">
            <button className="chip-filter active" data-filter="todas" aria-pressed="true">Todas</button>
            <button className="chip-filter" data-filter="pendiente" aria-pressed="false">Pendientes</button>
            <button className="chip-filter" data-filter="programado" aria-pressed="false">Programados</button>
            <button className="chip-filter" data-filter="realizado" aria-pressed="false">Realizados</button>
          </div>
          <div className="filter-divider"></div>
          <div className="chip-group segmented" id="chipgroup-otros-fecha">
            <button className="chip-filter" data-quickdate="hoy" aria-pressed="false">Hoy</button>
            <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
          </div>
          <div className="filter-popover-wrap" id="otros-date-popover-wrap">
            <button className="date-picker-btn" id="otros-date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="otros-date-popover">
              <LuCalendar className="icon" />
              <span id="otros-date-range-label">Rango personalizado</span>
              <LuChevronDown className="icon chev" />
            </button>
            <div className="filter-popover" id="otros-date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
              <div className="fp-title">Seleccionar rango de fechas</div>
              <div className="fp-date-row">
                <div className="fp-date-field">
                  <label htmlFor="otros-date-from">Desde</label>
                  <input type="date" id="otros-date-from"/>
                </div>
                <div className="fp-date-field">
                  <label htmlFor="otros-date-to">Hasta</label>
                  <input type="date" id="otros-date-to"/>
                </div>
              </div>
              <div className="fp-actions">
                <button className="btn btn-secondary" type="button" id="otros-date-clear-btn">Limpiar</button>
                <button className="btn btn-primary" type="button" id="otros-date-apply-btn">Aplicar</button>
              </div>
            </div>
          </div>
          <div className="filter-divider"></div>
          <div className="filter-popover-wrap" id="otros-more-popover-wrap">
            <button className="filters-more-btn" id="otros-more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="otros-more-popover">
              <LuFilter className="icon" />
              Otros filtros
              <span className="badge-count" id="otros-more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
            </button>
            <div className="filter-popover filter-popover-right" id="otros-more-popover" role="dialog" aria-label="Otros filtros: tipo de ordenamiento">
              <div className="fp-section">
                <div className="fp-section-title">Tipo</div>
                <div className="chip-group" id="otros-tipo-chip-group">
                  <button className="chip-filter" data-tipo="Laboratorio" aria-pressed="false">Laboratorio</button>
                  <button className="chip-filter" data-tipo="Imagenología" aria-pressed="false">Imagenología</button>
                  <button className="chip-filter" data-tipo="Interconsulta" aria-pressed="false">Interconsulta</button>
                  <button className="chip-filter" data-tipo="Procedimiento" aria-pressed="false">Procedimiento</button>
                </div>
              </div>
              <div className="fp-actions">
                <button className="btn btn-secondary" type="button" id="otros-more-clear-btn">Limpiar</button>
                <button className="btn btn-primary" type="button" id="otros-more-apply-btn">Aplicar</button>
              </div>
            </div>
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>Médico</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody id="otros-ordenamientos-tbody">{/* filas generadas por legacy-app.js */}</tbody>
          </table>
        </div>
        <div className="legend-bar">
          <div className="footer-title-block"><div className="ft-sub" id="otros-ordenamientos-footer-count">3 ordenamientos · turno actual</div></div>
          <div className="footer-updated">Última actualización: <b>14:32h</b></div>
        </div>
      </div>
    </div>
  );
}
