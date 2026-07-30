import './DevolucionesSub.css';
import { LuSearch } from 'react-icons/lu';

// Sub-panel "Devoluciones" de Pedidos: filtros + acordeón consecutivo → medicamentos
// devueltos. Las filas se generan por legacy-app.js (renderDevolucionesList) dentro
// de #devoluciones-list; una devolución nueva se agrega ahí mismo cuando se confirma
// el modal "Devolver a farmacia" (abierto desde el Cronograma).
export default function DevolucionesSub() {
  return (
    <div role="tabpanel" id="subpanel-devoluciones" aria-labelledby="subtab-devoluciones" tabIndex="0" className="sub-panel">
      <div className="filter-bar">
        <div className="search-field">
          <label htmlFor="search-devoluciones" className="sr-only">Buscar devolución por consecutivo o medicamento</label>
          <LuSearch className="icon" aria-hidden="true" />
          <input type="text" placeholder="Buscar por consecutivo o medicamento..." id="search-devoluciones"/>
        </div>
        <div className="chip-group" id="chipgroup-devoluciones-estado">
          <button className="chip-filter active" data-filter="todas" aria-pressed="true">Todas</button>
          <button className="chip-filter" data-filter="pendiente" aria-pressed="false">Pendientes</button>
          <button className="chip-filter" data-filter="confirmada" aria-pressed="false">Confirmadas por farmacia</button>
          <button className="chip-filter" data-filter="rechazada" aria-pressed="false">Rechazadas</button>
        </div>
      </div>
      <div className="dev-header-row dev-grid-cols">
        <span></span>
        <span>Consecutivo</span>
        <span>Motivo</span>
        <span>Fecha devolución</span>
        <span>Responsable</span>
        <span>Estado</span>
        <span>Confirma en farmacia</span>
        <span className="col-actions">Acciones</span>
      </div>
      <div className="dev-list" id="devoluciones-list">{/* filas generadas por legacy-app.js */}</div>
      <div className="legend-bar">
        <div className="footer-title-block"><div className="ft-sub" id="devoluciones-footer-count">3 devoluciones · turno actual</div></div>
        <div className="footer-updated">Última actualización: <b>14:32h</b></div>
      </div>
    </div>
  );
}
