import './Monitoreo.css';
import HojaMedicamentosTab from './HojaMedicamentosTab/HojaMedicamentosTab';

// Shell del tab "Monitoreo": subnav Hoja de medicamentos/Signos vitales,
// mismo mecanismo genérico que ya usa PedidosPanel (legacy-app.js:882-910
// resuelve el show/hide de cualquier .subnav-bar/.sub-panel encontrado al
// montar — no hace falta tocar legacy-app.js). Contenido real de cada
// subtab llega en tareas siguientes de este plan.
export default function Monitoreo() {
  return (
    <div role="tabpanel" id="panel-monitoreo" aria-labelledby="tab-monitoreo" tabIndex="0" className="tab-panel">
      <div className="subnav-bar" role="tablist" aria-label="Secciones de monitoreo">
        <button type="button" className="subnav-tab active" role="tab" id="subtab-hoja-medicamentos" aria-selected="true" aria-controls="subpanel-hoja-medicamentos" tabIndex="0">
          Hoja de medicamentos
        </button>
        <button type="button" className="subnav-tab" role="tab" id="subtab-signos-vitales" aria-selected="false" aria-controls="subpanel-signos-vitales" tabIndex="-1">
          Signos vitales
        </button>
      </div>

      <HojaMedicamentosTab />
      <div role="tabpanel" id="subpanel-signos-vitales" aria-labelledby="subtab-signos-vitales" tabIndex="0" className="sub-panel">
        Signos vitales (en construcción)
      </div>
    </div>
  );
}
