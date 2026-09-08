import './NuevaCitaFlow.css';
import Button from '@/Components/Button/Button';
import {
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuHistory,
  LuIdCard,
  LuScanLine,
  LuSearch,
  LuSlidersHorizontal,
  LuSquarePen,
  LuTrash2,
  LuTriangleAlert,
  LuUser,
  LuUserPlus,
  LuUserX,
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
//
// Los botones propios de este flujo (Aceptar/Agregar paciente/Atrás/
// Continuar/Descartar) usan `@/Components/Button/Button` en vez de
// `className="btn btn-primary"` -- a diferencia del resto del contenido
// (inyectado vía innerHTML por legacy-nueva-cita.js), estos SÍ son JSX
// normal, así que sufrían la misma deuda documentada en AGENTS.md
// "Botones": dependían de que la página anfitriona todavía definiera
// `.btn`/`.btn-primary` global, y esas clases ya se borraron en las
// features migradas a `<Button>` (ProgramarCita, Admisiones...) — el modal
// quedaba con estilo nativo del navegador en cualquier página migrada.
// `<Button>` no tiene ese problema (CSS Modules, hash único), y sigue
// funcionando igual con los `id` que legacy-nueva-cita.js necesita para
// mutar `.disabled`/`.onclick`/`.innerHTML` de forma imperativa (Button solo
// controla el render inicial; ver AGENTS.md "Modales legacy-imperativos").
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
              Lista de Pacientes
            </div>
            <button className="wizard-close" onClick={() => window.closePatientSearch()} aria-label="Cerrar" title="Cerrar">
              <LuX className="icon" />
            </button>
          </div>
          {/* Bloque 2 de 3 del modal (ver ps-header/wizard-footer): búsqueda +
              tabla + su paginador, todo dentro de .ps-table-wrap en vez de
              tener .ps-search-row como bloque hermano suelto. */}
          <div className="ps-table-wrap">
            <div className="ps-search-row">
              {/* Búsqueda simple (por N° de documento) -- oculta cuando se
                  activa la búsqueda avanzada (ver .ps-search-advanced abajo),
                  nunca las dos a la vez. Su visibilidad/reset la maneja
                  togglePsAdvancedSearch()/openPatientSearch() en
                  legacy-nueva-cita.js, no React (mismo criterio imperativo
                  que el resto de este modal). */}
              <div className="ps-search-field" id="ps-search-simple">
                <LuSearch className="icon" />
                <input type="text" placeholder="Buscar por número de documento..." onInput={(e) => window.filterPatients(e.target.value)} autoFocus />
              </div>

              {/* Búsqueda avanzada: 4 campos de nombre en vez del único
                  campo libre de arriba -- encargo explícito. Cada paciente
                  mock trae `nombre` como un string único (ver PATIENTS en
                  legacy-nueva-cita.js); nombrePartes() ahí mismo lo separa
                  en primer/segundo nombre + primer/segundo apellido para
                  poder filtrar campo por campo. */}
              <div className="ps-search-advanced" id="ps-search-advanced" hidden>
                <input type="text" id="ps-adv-nombre1" placeholder="Primer nombre" aria-label="Primer nombre" onInput={() => window.filterPatientsAdvanced()} />
                <input type="text" id="ps-adv-nombre2" placeholder="Segundo nombre" aria-label="Segundo nombre" onInput={() => window.filterPatientsAdvanced()} />
                <input type="text" id="ps-adv-apellido1" placeholder="Primer apellido" aria-label="Primer apellido" onInput={() => window.filterPatientsAdvanced()} />
                <input type="text" id="ps-adv-apellido2" placeholder="Segundo apellido" aria-label="Segundo apellido" onInput={() => window.filterPatientsAdvanced()} />
              </div>

              <button type="button" className="ps-adv-toggle" id="ps-adv-toggle" onClick={() => window.togglePsAdvancedSearch()}>
                <LuSlidersHorizontal className="icon" />
                <span id="ps-adv-toggle-label">Búsqueda avanzada</span>
              </button>
              <button className="icon-btn-circle" onClick={() => window.ncToast('Escaneo de QR de cédula en desarrollo.')} aria-label="Buscar por QR de cédula" title="Buscar por QR de cédula">
                <LuScanLine className="icon" />
              </button>
            </div>
            <div className="ps-table-card">
              <div className="ps-table-scroll">
                <table>
                  <thead><tr>
                    <th style={{width:'130px'}}>Documento</th><th>Paciente</th><th style={{width:'90px'}}>Sexo</th><th style={{width:'210px'}}>Aseguradora</th><th style={{width:'110px'}}>Ciudad</th><th style={{width:'110px'}}>Estado</th><th style={{width:'44px'}}></th>
                  </tr></thead>
                  <tbody id="ps-tbody"></tbody>
                </table>
              </div>
            </div>

            {/* Paginador fuera de .ps-table-card (mismo criterio que
                .cdm-pagination/CatalogoDiagnosticosModal.jsx, encargo
                explícito): antes vivía dentro de la card, pegado a la tabla
                con su propia barra de fondo — ahora es una fila hermana
                suelta, separada de la tabla por el mismo gap que el resto de
                bloques de .ps-table-wrap. */}
            <div className="ps-table-footer">
              <span className="ps-pagination-label" id="ps-pagination-label">
                Mostrando <b>0</b> de <b>0</b> pacientes
              </span>
              <div className="ps-pagination-controls">
                <button type="button" className="icon-btn-circle" aria-label="Página anterior" disabled>
                  <LuChevronLeft className="icon" />
                </button>
                <span className="ps-pagination-page">Página 1 de 1</span>
                <button
                  type="button"
                  className="icon-btn-circle"
                  aria-label="Página siguiente"
                  title="Vista de demostración: no hay más páginas cargadas"
                  disabled
                >
                  <LuChevronRight className="icon" />
                </button>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <Button variant="secondary-accent" icon={LuUserPlus} onClick={() => window.apOpen()}>
              Agregar paciente
            </Button>
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
              <Button variant="primary" id="ps-accept-btn" icon={LuCheck} onClick={() => window.confirmPatientSelection()}>
                Aceptar
              </Button>
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
                <Button variant="secondary" id="ap-back-btn" icon={LuChevronLeft} onClick={() => window.apBack()}>
                  Atrás
                </Button>
                <div className="wizard-footer-actions">
                  <Button variant="primary" id="ap-continue-btn">Siguiente</Button>
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
                <Button variant="secondary" id="nc-back-btn" icon={LuChevronLeft} onClick={() => window.ncBack()}>
                  Atrás
                </Button>
                <div className="wizard-footer-actions">
                  <Button variant="primary" id="nc-continue-btn" disabled>Continuar</Button>
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
            <Button variant="secondary" onClick={() => window.ncCancelDiscard()}>Seguir editando</Button>
            <Button variant="danger-outline" icon={LuTrash2} onClick={() => window.ncConfirmDiscard()}>
              Sí, descartar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
