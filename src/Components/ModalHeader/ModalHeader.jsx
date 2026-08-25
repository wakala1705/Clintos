'use client';

import './ModalHeader.css';
import { LuArrowLeft, LuX } from 'react-icons/lu';

// Header homologado para todo modal del proyecto — mismo componente para
// las 8 features que antes tenían cada una su propia variante (.adm-modal-
// header, .pc-modal-header, .modal-header suelto x3, .catalog-header,
// .task-detail-header, .config-modal-header, .modal-header .left...). Solo
// consume tokens (--gray-bg/--border/--fs-lg/--primary/...) que cada
// feature ya declara en su propio :root — no define ninguno nuevo, así que
// funciona igual en cualquier feature sin que este componente necesite
// saber en cuál está montado.
//
// Fuera de este componente (son otro tipo de elemento, no un header de
// modal): el diálogo de confirmación centrado sin fila de header
// (.nc-discard-modal) y el rail de wizard (.wizard-rail-header, es
// navegación de pasos) — ver NuevaCitaFlow.jsx.
//
// `onBack` (opcional, encargo "drill-in" de BedDetailModal.jsx): agrega un
// botón "←" al inicio del header, para navegación dentro-del-mismo-modal
// (detalle → historial) — distinto del rail de wizard de arriba: acá sigue
// siendo el título de UN diálogo, solo que ese diálogo tiene una vista
// anterior a la que volver, no una serie de pasos. Sin `onBack` el header
// se ve exactamente igual que siempre (opt-in, mismo criterio que
// `trailing`). `backButtonRef`/`closeButtonRef` (opcionales): el consumidor
// los usa para mover el foco imperativamente al cambiar de vista (la
// gestión de foco vive en BedDetailModal.jsx, no acá — este componente no
// sabe qué es una "vista"). `titleLive` agrega aria-live="polite" al <h3>
// para que un lector de pantalla anuncie el cambio de título al hacer
// drill-in/volver.
export default function ModalHeader({
  icon: Icon, tone = 'neutral', title, titleId, subtitle, onClose, closeLabel = 'Cerrar', autoFocusClose = false,
  // Algunos modales de GestionEnfermeria todavía se abren/cierran vía
  // legacy-app.js (document.getElementById(closeId).addEventListener(...))
  // en vez de un onClose de React — closeId preserva ese id en el botón
  // sin que este componente necesite saber quién lo escucha.
  closeId,
  // Contenido opcional entre el bloque de título y el botón cerrar — hoy
  // solo lo usa DetalleModal (SolicitudConsumo) para un badge de estado
  // junto al cierre, ver AGENTS.md/homologación de modales.
  trailing,
  onBack, backLabel = 'Volver', backButtonRef, closeButtonRef, titleLive = false,
}) {
  return (
    <div className="modal-header">
      <div className="modal-header-titles">
        {onBack && (
          <button
            type="button"
            ref={backButtonRef}
            className="modal-back-btn"
            onClick={onBack}
            aria-label={backLabel}
          >
            <LuArrowLeft className="icon" aria-hidden="true" />
          </button>
        )}
        {Icon && (
          <div className={`modal-header-icon tone-${tone}`}>
            <Icon className="icon" aria-hidden="true" />
          </div>
        )}
        <div>
          <h3 id={titleId} aria-live={titleLive ? 'polite' : undefined}>{title}</h3>
          {subtitle && <div className="modal-header-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="modal-header-end">
        {trailing}
        <button
          type="button"
          id={closeId}
          ref={closeButtonRef}
          className="modal-close-btn"
          onClick={onClose}
          aria-label={closeLabel}
          autoFocus={autoFocusClose}
        >
          <LuX className="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
