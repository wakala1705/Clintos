import './PedidosPanel.css';
import SolicitudesSub from '../pedidos/SolicitudesSub/SolicitudesSub';
import RecepcionSub from '../pedidos/RecepcionSub/RecepcionSub';
import DevolucionesSub from '../pedidos/DevolucionesSub/DevolucionesSub';
import { LuClipboardList, LuInbox, LuUndo2 } from 'react-icons/lu';

// Tab "Pedidos": subnavegación Solicitudes / Recepción / Devoluciones.
// legacy-app.js maneja el cambio de sub-panel activo (mismo patrón ARIA de
// tabs que las tabs principales de la card), así que aquí solo se compone el
// shell y los tres sub-paneles como componentes independientes.
export default function PedidosPanel() {
  return (
    <div role="tabpanel" id="panel-pedidos" aria-labelledby="tab-pedidos" tabIndex="0" className="tab-panel">
      <div className="subnav-bar" role="tablist" aria-label="Secciones de pedidos">
        <button type="button" className="subnav-tab active" role="tab" id="subtab-solicitudes" aria-selected="true" aria-controls="subpanel-solicitudes" tabIndex="0">
          <LuClipboardList className="icon" aria-hidden="true" />
          Solicitudes
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-recepcion" aria-selected="false" aria-controls="subpanel-recepcion" tabIndex="-1">
          <LuInbox className="icon" aria-hidden="true" />
          Recepción
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-devoluciones" aria-selected="false" aria-controls="subpanel-devoluciones" tabIndex="-1">
          <LuUndo2 className="icon" aria-hidden="true" />
          Devoluciones
        </button>
      </div>

      <SolicitudesSub />
      <RecepcionSub />
      <DevolucionesSub />
    </div>
  );
}
