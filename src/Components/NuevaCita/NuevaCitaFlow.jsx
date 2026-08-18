import './NuevaCitaFlow.css';
import {
  LuArrowRight,
  LuCheck,
  LuChevronLeft,
  LuHistory,
  LuIdCard,
  LuScanLine,
  LuSearch,
  LuSquarePen,
  LuTrash2,
  LuTriangleAlert,
  LuUser,
  LuUserPlus,
  LuUserX,
  LuUsers,
  LuX,
} from 'react-icons/lu';

// Flujo "Nueva cita" (búsqueda/alta de paciente + wizard de agendamiento),
// compartido por /asignacion-citas y /programar-cita — ver AGENTS.md, mismo
// criterio que Sidebar/UserMenu/Topbar/PatientBanner. Es puro shell/chrome:
// todo el contenido de cada paso se inyecta vía innerHTML por
// initNuevaCita() (src/hooks/NuevaCita/legacy-nueva-cita.js), que cada
// página inicializa en su propio useEffect. Los botones de disparo ("Nueva
// cita", "Agendar cita", "+ Agendar") solo necesitan llamar
// window.ncOpen() — este componente no expone props porque no las necesita.
export default function NuevaCitaFlow() {
  return (
    <>
      {/* MENÚ CONTEXTUAL DE FILA DE PACIENTE */}
      <div className="context-menu" id="ps-context-menu" role="menu" onClick={(e) => e.stopPropagation()}>
        <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.psAccionEditar()}>
          <LuSquarePen className="icon" />Editar
        </div>
        <div className="context-menu-item" tabIndex="0" role="menuitem" onClick={() => window.psAccionHistorial()}>
          <LuHistory className="icon" />Historial de citas
        </div>
        <div className="context-menu-divider"></div>
        <div className="context-menu-item danger" tabIndex="0" role="menuitem" onClick={() => window.psAccionDesactivar()}>
          <LuUserX className="icon" />Desactivar usuario
        </div>
      </div>

      {/* MODAL: BÚSQUEDA DE PACIENTES */}
      <div className="modal-overlay" id="ps-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.closePatientSearch(); }}>
        <div className="ps-modal">
          <div className="ps-header">
            <div className="ps-header-title">
              <LuUsers className="icon" />
              Lista de Pacientes
            </div>
            <button className="wizard-close" onClick={() => window.closePatientSearch()} aria-label="Cerrar" title="Cerrar">
              <LuX className="icon" />
            </button>
          </div>
          <div className="ps-search-row">
            <div className="ps-search-field">
              <LuSearch className="icon" />
              <input type="text" placeholder="Buscar por nombre o documento..." onInput={(e) => window.filterPatients(e.target.value)} autoFocus />
            </div>
            <button className="icon-btn-circle" onClick={() => window.ncToast('Escaneo de QR de cédula en desarrollo.')} aria-label="Buscar por QR de cédula" title="Buscar por QR de cédula">
              <LuScanLine className="icon" />
            </button>
          </div>
          <div className="ps-table-wrap">
            <table>
              <thead><tr>
                <th>Paciente</th><th style={{width:'150px'}}>Documento</th><th style={{width:'130px'}}>Ciudad</th><th style={{width:'130px'}}>EPS</th><th style={{width:'120px'}}>Estado</th><th style={{width:'44px'}}></th>
              </tr></thead>
              <tbody id="ps-tbody"></tbody>
            </table>
          </div>

          <div className="wizard-footer">
            <button className="btn btn-secondary" onClick={() => window.apOpen()}>
              <LuUserPlus className="icon" />
              Agregar paciente
            </button>
            <div className="wizard-footer-actions">
              {/* Sin `disabled` literal acá a propósito: openPatientSearch()/
                  setPsSelected() (legacy-nueva-cita.js) ya manejan
                  habilitado/deshabilitado por su cuenta mutando
                  el.disabled directamente en el DOM (fuera de React, como el
                  resto de este flujo imperativo). Si el JSX también fija
                  `disabled` como literal estático, React nunca vuelve a
                  tocar ese atributo (no hay re-render de este componente),
                  pero su sistema de eventos sintéticos igual descarta el
                  click basado en el prop que recuerda del último render
                  (`true`) en vez del valor real del DOM — el botón queda
                  visualmente habilitado pero el clic nunca dispara
                  onClick. Confirmado con un doble clic sobre la fila (que
                  sí funciona: llama confirmPatientSelection() directo,
                  sin pasar por el sistema sintético de React) mientras un
                  solo clic + "Aceptar" no hacía nada. */}
              <button className="btn btn-primary" id="ps-accept-btn" onClick={() => window.confirmPatientSelection()}>
                <LuCheck className="icon" />
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WIZARD: AGREGAR PACIENTE */}
      <div className="modal-overlay" id="ap-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.apClose(); }}>
        <div className="wizard-modal">

          <div className="wizard-body">
            <nav className="wizard-rail">
              <div className="wizard-rail-header">
                <div className="rh-eyebrow" id="ap-rail-eyebrow">Nuevo registro</div>
                <div className="rh-title" id="ap-rail-title">Agregar Paciente</div>
                <div className="rh-sub">
                  <LuUser className="icon" />
                  <span id="ap-rail-sub">Historia clínica nueva</span>
                </div>
              </div>
              <div className="wizard-rail-nav" id="ap-rail"></div>
            </nav>

            <div className="wizard-main">
              <div className="wizard-main-header">
                <div className="t" id="ap-progress-text">Paso 1 de 4</div>
                <button className="wizard-close" onClick={() => window.apClose()} aria-label="Cerrar" title="Cerrar">
                  <LuX className="icon" />
                </button>
              </div>

              <form id="ap-form" onSubmit={(e) => e.preventDefault()}>
                <div className="wizard-content" id="ap-content"></div>
              </form>

              <div className="wizard-footer">
                <button type="button" className="btn btn-secondary" id="ap-back-btn" onClick={() => window.apBack()}>
                  <LuChevronLeft className="icon" />Atrás
                </button>
                <div className="wizard-footer-actions">
                  <button type="button" className="btn btn-primary" id="ap-continue-btn">Siguiente
                    <LuArrowRight className="icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* WIZARD: NUEVO AGENDAMIENTO */}
      <div className="modal-overlay" id="nc-overlay" onClick={(e) => { if (e.target === e.currentTarget) window.ncClose(); }}>
        <div className="wizard-modal">

          <div className="wizard-body">
            <nav className="wizard-rail">
              <div className="wizard-rail-header">
                <div className="rh-eyebrow">Nueva Cita</div>
                <div className="rh-title" id="nc-rail-patient-name">—</div>
                <div className="rh-sub">
                  <LuIdCard className="icon" />
                  <span id="nc-rail-patient-doc">—</span>
                </div>
              </div>
              <div className="wizard-rail-nav" id="nc-rail"></div>
            </nav>

            <div className="wizard-main">
              <div className="wizard-main-header">
                <div>
                  <div className="t" id="nc-main-title">Régimen</div>
                  <div className="sub" id="nc-progress-text">Paso 1 de 7</div>
                </div>
                <button className="wizard-close" onClick={() => window.ncClose()} aria-label="Cerrar" title="Cerrar">
                  <LuX className="icon" />
                </button>
              </div>

              <nav className="wiz-stepper" id="nc-stepper"></nav>

              <div className="wizard-content" id="nc-content"></div>

              <div className="wizard-footer">
                <button className="btn btn-secondary" id="nc-back-btn" onClick={() => window.ncBack()}>
                  <LuChevronLeft className="icon" />Atrás
                </button>
                <div className="wizard-footer-actions">
                  <button className="btn btn-primary" id="nc-continue-btn" disabled>Continuar</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CONFIRMACIÓN: DESCARTAR CITA (cerrar el wizard con progreso sin guardar) */}
      <div
        className="modal-overlay nc-discard-overlay"
        id="nc-discard-overlay"
        onClick={(e) => { if (e.target === e.currentTarget) window.ncCancelDiscard(); }}
      >
        <div className="nc-discard-modal" role="alertdialog" aria-modal="true" aria-labelledby="nc-discard-title" aria-describedby="nc-discard-desc">
          <div className="nc-discard-icon"><LuTriangleAlert className="icon" /></div>
          <h3 id="nc-discard-title">¿Descartar esta cita?</h3>
          <p id="nc-discard-desc">Perderás la información ingresada en este agendamiento. Esta acción no se puede deshacer.</p>
          <div className="nc-discard-actions">
            <button type="button" className="btn btn-secondary" onClick={() => window.ncCancelDiscard()}>Seguir editando</button>
            <button type="button" className="btn btn-danger-outline" onClick={() => window.ncConfirmDiscard()}>
              <LuTrash2 className="icon" />Sí, descartar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
