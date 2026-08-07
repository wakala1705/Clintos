import './Toast.css';
import { LuCheck } from 'react-icons/lu';

// Toast de confirmación reutilizable (con botón de acción opcional, p. ej.
// "Devolver a farmacia" tras suspender). legacy-app.js controla su contenido
// y visibilidad vía showToast(message, action).
export default function Toast() {
  return (
    <div className="toast" id="toast" role="status" aria-live="polite">
      <LuCheck className="icon" strokeWidth="2.5" />
      <span id="toast-message">Acción completada</span>
      <button type="button" className="toast-action-btn" id="toast-action-btn" style={{display: 'none'}}></button>
    </div>
  );
}
