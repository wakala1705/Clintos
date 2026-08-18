'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './ConfigModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuBell, LuLock, LuLogOut, LuMoon, LuShieldCheck, LuUser } from 'react-icons/lu';
import { getFieldSelectionMode, setFieldSelectionMode } from '@/hooks/HistoriaClinica/fieldSelectionMode';

const SECTIONS = [
  { id: 'perfil', label: 'Perfil', icon: LuUser },
  { id: 'apariencia', label: 'Apariencia', icon: LuMoon },
  { id: 'notificaciones', label: 'Notificaciones', icon: LuBell },
  { id: 'clinico', label: 'Clínico', icon: LuShieldCheck },
  { id: 'seguridad', label: 'Seguridad', icon: LuLock },
];

// Fuente de verdad de "Verificación de los 5 correctos", leída por AdminModal
// vía src/hooks/GestionEnfermeria/legacy-app.js (isVerificacionClinicaEnabled).
// Vive en window (no localStorage, igual que el resto del estado de esta app)
// para que sobreviva a la navegación entre /asignacion-citas y
// /gestion-enfermeria dentro de la misma sesión — ConfigModal se abre desde
// UserMenu en ambas rutas, pero solo Gestión de Enfermería tiene AdminModal.
function isVerificacionClinicaEnabled() {
  if (typeof window === 'undefined') return false;
  return window.__clintosVerificacionClinica === true;
}
function setVerificacionClinicaEnabled(enabled) {
  window.__clintosVerificacionClinica = enabled;
  window.dispatchEvent(new CustomEvent('clintos:verificacion-clinica-change', { detail: enabled }));
}

// Modal de configuración del aplicativo, abierto desde UserMenu. Nav lateral
// de secciones + panel de contenido a la derecha (mismo patrón de dos
// columnas que un modal de settings). Apariencia tiene tres preferencias con
// efecto real: el tema oscuro (misma lógica que applyTheme en
// legacy-app.js, para que quede en sync con el switch del Sidebar), el
// resaltado ámbar de campos obligatorios (atributo data-required-highlight
// en <html>, leído por ConsultaStep.css y NuevaCitaFlow.css) y el alto
// contraste (atributo data-contrast en <html>, leído por globals.css y por
// el bloque --border/--ink-500/--ink-400 que cada feature de nivel superior
// duplica junto a su propio html[data-theme="dark"], ver AGENTS.md). El
// resto de campos son configuración del perfil/notificaciones sin backend,
// igual de "demo" que el resto del aplicativo. Clínico también tiene
// "Selección rápida en formularios clínicos" (ver src/hooks/HistoriaClinica/
// fieldSelectionMode.js), que decide si los campos Sí/No del wizard CRECIMT2
// (SiNoField.jsx) se ven como botones o como <select> — mismo criterio de
// window+CustomEvent que "Verificación de los 5 correctos", pero con
// suscripción reactiva porque acá sí hay que re-renderizar campos ya
// montados si el ajuste cambia con el wizard abierto.
export default function ConfigModal({ open, onClose, name, role, initials }) {
  const [section, setSection] = useState('perfil');
  const [isDark, setIsDark] = useState(false);
  const [requiredHighlight, setRequiredHighlightState] = useState(true);
  const [highContrast, setHighContrastState] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifApp, setNotifApp] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [verificacionClinica, setVerificacionClinica] = useState(false);
  const [fieldSelectionMode, setFieldSelectionModeState] = useState('rapida');
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    setRequiredHighlightState(document.documentElement.getAttribute('data-required-highlight') !== 'off');
    setHighContrastState(document.documentElement.getAttribute('data-contrast') === 'high');
    setVerificacionClinica(isVerificacionClinicaEnabled());
    setFieldSelectionModeState(getFieldSelectionMode());
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) themeSwitch.checked = dark;
    setIsDark(dark);
  }

  function setRequiredHighlight(enabled) {
    document.documentElement.setAttribute('data-required-highlight', enabled ? 'on' : 'off');
    setRequiredHighlightState(enabled);
  }

  function setHighContrast(enabled) {
    document.documentElement.setAttribute('data-contrast', enabled ? 'high' : 'normal');
    setHighContrastState(enabled);
  }

  function toggleVerificacionClinica(enabled) {
    setVerificacionClinicaEnabled(enabled);
    setVerificacionClinica(enabled);
  }

  function handleFieldSelectionModeChange(useRapida) {
    const mode = useRapida ? 'rapida' : 'select';
    setFieldSelectionMode(mode);
    setFieldSelectionModeState(mode);
  }

  function handleLogoutEverywhere() {
    onClose();
    router.push('/Login');
  }

  return (
    <div className="config-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="config-modal-card" role="dialog" aria-modal="true" aria-labelledby="config-modal-title">
        <ModalHeader
          title="Configuración"
          titleId="config-modal-title"
          onClose={onClose}
          closeLabel="Cerrar configuración"
        />

        <div className="config-modal-body">
          <nav className="config-nav" aria-label="Secciones de configuración">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`config-nav-item${section === id ? ' active' : ''}`}
                onClick={() => setSection(id)}
              >
                <Icon className="icon" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <div className="config-panel">
            {section === 'perfil' && (
              <div className="config-section">
                <div className="config-section-title">Perfil</div>
                <div className="config-profile-row">
                  <div className="config-profile-avatar">{initials}</div>
                  <div>
                    <div className="config-profile-name">{name}</div>
                    <div className="config-profile-role">{role}</div>
                  </div>
                </div>
                <div className="config-field">
                  <label htmlFor="config-nombre">Nombre completo</label>
                  <input type="text" id="config-nombre" defaultValue={name} />
                </div>
                <div className="config-field">
                  <label htmlFor="config-rol">Cargo</label>
                  <input type="text" id="config-rol" defaultValue={role} />
                </div>
              </div>
            )}

            {section === 'apariencia' && (
              <div className="config-section">
                <div className="config-section-title">Apariencia</div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Modo oscuro</div>
                    <div className="config-toggle-hint">Cambia el tema de toda la aplicación.</div>
                  </div>
                  <label className="config-switch">
                    <input type="checkbox" checked={isDark} onChange={(e) => setTheme(e.target.checked)} />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Resaltado de campos obligatorios</div>
                    <div className="config-toggle-hint">
                      Marca en color ámbar los campos obligatorios vacíos mientras se completa un
                      formulario.
                    </div>
                  </div>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      checked={requiredHighlight}
                      onChange={(e) => setRequiredHighlight(e.target.checked)}
                    />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Alto contraste</div>
                    <div className="config-toggle-hint">
                      Aumenta el contraste de bordes y texto secundario en toda la aplicación.
                    </div>
                  </div>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      checked={highContrast}
                      onChange={(e) => setHighContrast(e.target.checked)}
                    />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {section === 'notificaciones' && (
              <div className="config-section">
                <div className="config-section-title">Notificaciones</div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Notificaciones por correo</div>
                    <div className="config-toggle-hint">Recibe un resumen de la actividad de tus pacientes.</div>
                  </div>
                  <label className="config-switch">
                    <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Notificaciones en la aplicación</div>
                    <div className="config-toggle-hint">Alertas dentro de Clintos (órdenes, pedidos, alergias).</div>
                  </div>
                  <label className="config-switch">
                    <input type="checkbox" checked={notifApp} onChange={(e) => setNotifApp(e.target.checked)} />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Sonido de alertas</div>
                    <div className="config-toggle-hint">Reproduce un sonido al recibir una notificación urgente.</div>
                  </div>
                  <label className="config-switch">
                    <input type="checkbox" checked={notifSound} onChange={(e) => setNotifSound(e.target.checked)} />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {section === 'clinico' && (
              <div className="config-section">
                <div className="config-section-title">Clínico</div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Verificación de los 5 correctos</div>
                    <div className="config-toggle-hint">
                      Exige marcar paciente, medicamento, dosis, vía y hora correctos antes de poder
                      confirmar una administración en el cronograma de medicamentos.
                    </div>
                  </div>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      checked={verificacionClinica}
                      onChange={(e) => toggleVerificacionClinica(e.target.checked)}
                    />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
                <div className="config-toggle-row">
                  <div>
                    <div className="config-toggle-label">Selección rápida en formularios clínicos</div>
                    <div className="config-toggle-hint">
                      Muestra los campos Sí/No como botones en vez de listas desplegables en el
                      formulario de primera infancia.
                    </div>
                  </div>
                  <label className="config-switch">
                    <input
                      type="checkbox"
                      checked={fieldSelectionMode === 'rapida'}
                      onChange={(e) => handleFieldSelectionModeChange(e.target.checked)}
                    />
                    <span className="config-switch-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {section === 'seguridad' && (
              <div className="config-section">
                <div className="config-section-title">Seguridad</div>
                <div className="config-security-row">
                  <div>
                    <div className="config-toggle-label">Cerrar sesión en todos los dispositivos</div>
                    <div className="config-toggle-hint">Terminarás la sesión actual y cualquier otra sesión activa.</div>
                  </div>
                  <button type="button" className="config-danger-btn" onClick={handleLogoutEverywhere}>
                    <LuLogOut className="icon" aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
