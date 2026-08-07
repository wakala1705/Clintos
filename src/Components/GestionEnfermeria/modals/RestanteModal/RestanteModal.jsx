import './RestanteModal.css';
import { LuClock, LuInbox, LuX } from 'react-icons/lu';

// Modal "Recepcionar restante": lista los ítems faltantes de una orden de
// Recepción parcial junto con el artículo/lote/vencimiento que farmacia ya
// despachó para completarlos (mismos datos que el detalle de recepción) y
// registra esa entrega en una tanda — puede repetirse hasta completar la
// orden. Es solo lectura: nada de esto lo escribe la enfermera, ya viene del
// despacho de farmacia (ver item.pendiente en legacy-app.js). legacy-app.js
// llena #restante-items-list según los ítems incompletos de la orden abierta.
export default function RestanteModal() {
  return (
    <div className="modal-overlay" id="restante-modal-overlay">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="restante-modal-title">
        <div className="modal-header">
          <div className="modal-header-titles">
            <div className="suspend-header-icon icon-primary">
              <LuInbox className="icon" aria-hidden="true" />
            </div>
            <div>
              <h3 id="restante-modal-title">Recepcionar restante</h3>
            </div>
          </div>
          <button className="modal-close-btn" type="button" id="restante-modal-close" aria-label="Cerrar formulario">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div id="restante-items-list">{/* filas generadas por legacy-app.js */}</div>

          <div className="admin-summary-time" style={{marginTop: '14px'}}>
            <LuClock className="icon" aria-hidden="true" strokeWidth="2.2" />
            Quedará registrada con hora <b id="restante-hora-registro">--:--</b> · por <b id="restante-por">—</b>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" id="restante-cancel-btn">Cancelar</button>
          <button className="btn btn-primary" type="button" id="restante-confirm-btn">Confirmar recepción parcial</button>
        </div>
      </div>
    </div>
  );
}
