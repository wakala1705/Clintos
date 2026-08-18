import './RestanteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuClock, LuInbox } from 'react-icons/lu';

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
        <ModalHeader
          icon={LuInbox}
          tone="primary"
          title="Recepcionar restante"
          titleId="restante-modal-title"
          closeId="restante-modal-close"
          closeLabel="Cerrar formulario"
        />

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
