import './RecepcionSub.css';
import { LuCalendar, LuChevronDown, LuFilter, LuSearch } from 'react-icons/lu';

// Sub-panel "Recepción" de Pedidos: acordeón orden → medicamento → artículo/lote,
// completamente generado por legacy-app.js (renderRecepcionList) a partir del
// arreglo recepcionOrdenes — igual patrón que SolicitudesSub/DevolucionesSub/
// OrdenesMedicasPanel. Aquí solo vive el shell (filtros, encabezados) con los
// mismos ids que ese script espera.
export default function RecepcionSub() {
  return (
    <div role="tabpanel" id="subpanel-recepcion" aria-labelledby="subtab-recepcion" tabIndex="0" className="sub-panel">
      <div className="filter-bar">
        <div className="search-field">
          <label htmlFor="search-recepcion" className="sr-only">Buscar recepción por medicamento o insumo</label>
          <LuSearch className="icon" aria-hidden="true" />
          <input type="text" placeholder="Buscar medicamento o insumo..." id="search-recepcion"/>
        </div>
        <div className="filter-spacer"></div>
        <div className="chip-group" id="chipgroup-recepcion-estado">
          <button className="chip-filter active" data-filter="despachado" aria-pressed="true">Pendiente</button>
          <button className="chip-filter" data-filter="parcial" aria-pressed="false">Parcial</button>
          <button className="chip-filter" data-filter="recibido" aria-pressed="false">Recibido</button>
          <button className="chip-filter" data-filter="todas" aria-pressed="false">Todas</button>
        </div>
        <div className="filter-divider"></div>
        <div className="chip-group" id="chipgroup-recepcion-fecha">
          <button className="chip-filter" data-quickdate="hoy" aria-pressed="false">Hoy</button>
          <button className="chip-filter" data-quickdate="semana" aria-pressed="false">Última semana</button>
        </div>
        <div className="filter-popover-wrap" id="recep-date-popover-wrap">
          <button className="date-picker-btn" id="recep-date-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="recep-date-popover">
            <LuCalendar className="icon" />
            <span id="recep-date-range-label">Rango personalizado</span>
            <LuChevronDown className="icon chev" />
          </button>
          <div className="filter-popover" id="recep-date-popover" role="dialog" aria-label="Seleccionar rango de fechas">
            <div className="fp-title">Seleccionar rango de fechas</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="recep-date-from">Desde</label>
                <input type="date" id="recep-date-from"/>
              </div>
              <div className="fp-date-field">
                <label htmlFor="recep-date-to">Hasta</label>
                <input type="date" id="recep-date-to"/>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="recep-date-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="recep-date-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>
        <div className="filter-divider"></div>
        <div className="filter-popover-wrap" id="recep-more-popover-wrap">
          <button className="filters-more-btn" id="recep-more-popover-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="recep-more-popover">
            <LuFilter className="icon" />
            Otros filtros
            <span className="badge-count" id="recep-more-badge-count" style={{display: 'none'}} aria-live="polite">0</span>
          </button>
          <div className="filter-popover filter-popover-right" id="recep-more-popover" role="dialog" aria-label="Otros filtros: tipo">
            <div className="fp-section">
              <div className="fp-section-title">Tipo</div>
              <div className="chip-group" id="recep-tipo-chip-group">
                <button className="chip-filter" data-tipo="medicamento" aria-pressed="false">Medicamento</button>
                <button className="chip-filter" data-tipo="insumo" aria-pressed="false">Insumo</button>
              </div>
            </div>
            <div className="fp-actions">
              <button className="btn btn-secondary" type="button" id="recep-more-clear-btn">Limpiar</button>
              <button className="btn btn-primary" type="button" id="recep-more-apply-btn">Aplicar</button>
            </div>
          </div>
        </div>
      </div>

      <div className="recep-list" id="recepcion-list">{/* filas generadas por legacy-app.js (renderRecepcionList) */}</div>

      <div className="legend-bar">
        <div className="footer-title-block"><div className="ft-sub" id="recepcion-footer-count">3 órdenes · filtro: Pendiente</div></div>
        <div className="footer-updated">Última actualización: <b>14:32h</b></div>
      </div>
    </div>
  );
}
