// Toast de confirmación reutilizable (con botón de acción opcional, p. ej.
// "Devolver a farmacia" tras suspender). legacy-app.js controla su contenido
// y visibilidad vía showToast(message, action).
export default function Toast() {
  return (
    <div className="toast" id="toast" role="status" aria-live="polite">
      <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      <span id="toast-message">Acción completada</span>
      <button type="button" className="toast-action-btn" id="toast-action-btn" style={{display: 'none'}}></button>
    </div>
  );
}
