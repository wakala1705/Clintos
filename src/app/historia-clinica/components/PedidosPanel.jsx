import SolicitudesSub from './pedidos/SolicitudesSub';
import RecepcionSub from './pedidos/RecepcionSub';
import DevolucionesSub from './pedidos/DevolucionesSub';

// Tab "Pedidos": subnavegación Solicitudes / Recepción / Devoluciones.
// legacy-app.js maneja el cambio de sub-panel activo (mismo patrón ARIA de
// tabs que las tabs principales de la card), así que aquí solo se compone el
// shell y los tres sub-paneles como componentes independientes.
export default function PedidosPanel() {
  return (
    <div role="tabpanel" id="panel-pedidos" aria-labelledby="tab-pedidos" tabIndex="0" className="tab-panel">
      <div className="subnav-bar" role="tablist" aria-label="Secciones de pedidos">
        <button type="button" className="subnav-tab active" role="tab" id="subtab-solicitudes" aria-selected="true" aria-controls="subpanel-solicitudes" tabIndex="0">
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
          Solicitudes
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-recepcion" aria-selected="false" aria-controls="subpanel-recepcion" tabIndex="-1">
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
          Recepción
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-devoluciones" aria-selected="false" aria-controls="subpanel-devoluciones" tabIndex="-1">
          <svg className="icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
          Devoluciones
        </button>
      </div>

      <SolicitudesSub />
      <RecepcionSub />
      <DevolucionesSub />
    </div>
  );
}
