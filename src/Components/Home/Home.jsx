'use client';

import { useEffect, useState } from 'react';
import './Home.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { useActiveModule } from '@/hooks/Session/session';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import BodegaPickerButton from '@/Components/BodegaPickerButton/BodegaPickerButton';
import AreaFuncionalPickerButton from '@/Components/AreaFuncionalPickerButton/AreaFuncionalPickerButton';
import ModuleCard from '@/Components/Home/ModuleCard/ModuleCard';
import AllModulesModal from '@/Components/Home/AllModulesModal/AllModulesModal';
import PillTabs from '@/Components/Home/PillTabs/PillTabs';
import {
  LuActivity,
  LuBed,
  LuCalendarClock,
  LuCalendarDays,
  LuCalendarPlus,
  LuClipboardCheck,
  LuFileText,
  LuFlaskConical,
  LuHeart,
  LuHeartPulse,
  LuChevronDown,
  LuLandmark,
  LuLayoutGrid,
  LuLock,
  LuPill,
  LuReceipt,
  LuScissors,
  LuSiren,
  LuStethoscope,
  LuSyringe,
  LuUsers,
} from 'react-icons/lu';

// Mismo criterio de color por módulo que Login/ModuleCard.jsx (tone
// blue/green/orange) — así se identifica cada módulo por color en todo el
// aplicativo, no solo en el login. Nómina no tiene contenido propio todavía
// (ver "Ayudas DX"/grupo vacío para el mismo caso), pero el tono queda listo
// para cuando lo tenga.
const MODULE_TONES = {
  asistencial: 'blue',
  contable: 'green',
  nomina: 'orange',
};

// Mismos 3 valores/labels que MODULE_LABELS en hooks/Session/session.js
// (sin 'administrador', que no es un módulo elegible acá).
const MODULE_OPTIONS = [
  { value: 'asistencial', label: 'Asistencial' },
  { value: 'contable', label: 'Contable' },
  { value: 'nomina', label: 'Nómina' },
];

const MODULE_GROUPS = [
  {
    title: 'Consulta Externa',
    icon: LuStethoscope,
    module: 'asistencial',
    items: [
      {
        title: 'Asignación de citas',
        description: 'Agenda y gestiona las citas de consulta externa.',
        icon: LuCalendarDays,
        href: '/asignacion-citas',
        enabled: true,
      },
      {
        title: 'Programar cita',
        description: 'Programa una nueva cita para un paciente.',
        icon: LuCalendarPlus,
        href: '/programar-cita',
        enabled: true,
      },
      {
        title: 'Reasignación de citas',
        description: 'Reagenda citas existentes de pacientes.',
        icon: LuCalendarClock,
        enabled: false,
      },
      {
        title: 'Historia clínica',
        description: 'Consulta el historial clínico de pacientes de consulta externa.',
        icon: LuFileText,
        href: '/historia-clinica',
        enabled: true,
      },
      {
        title: 'Signos vitales',
        description: 'Registra y consulta signos vitales de pacientes.',
        icon: LuHeart,
        enabled: false,
      },
      {
        title: 'Lista de pacientes',
        description: 'Consulta y administra el listado de pacientes.',
        icon: LuUsers,
        href: '/lista-pacientes',
        enabled: true,
      },
      {
        title: 'Accidentes de tránsito',
        description: 'Registro de atenciones por accidentes de tránsito.',
        icon: LuSiren,
        enabled: false,
      },
      {
        title: 'PyMS',
        description: 'Registro y seguimiento del esquema de PyMS de pacientes.',
        icon: LuSyringe,
        href: '/vacunacion',
        enabled: true,
      },
    ],
  },
  {
    title: 'Hospitalización',
    icon: LuBed,
    module: 'asistencial',
    items: [
      {
        title: 'Gestión de enfermería',
        description: 'Cronograma de medicamentos, órdenes médicas y pedidos.',
        icon: LuHeartPulse,
        href: '/gestion-enfermeria',
        enabled: true,
      },
      {
        title: 'Triage',
        description: 'Clasificación y priorización de pacientes al ingreso.',
        icon: LuActivity,
        enabled: false,
      },
      {
        title: 'Admisiones',
        description: 'Registro y gestión de ingresos hospitalarios.',
        icon: LuClipboardCheck,
        href: '/admisiones',
        enabled: true,
      },
      {
        title: 'Historia clínica',
        description: 'Diagnósticos, evolución clínica e historial médico del paciente.',
        icon: LuFileText,
        enabled: false,
      },
      {
        title: 'Programación sala de cirugías',
        description: 'Agenda y gestiona la ocupación de las salas de cirugía.',
        icon: LuScissors,
        href: '/programacion-sala-cirugias',
        enabled: true,
      },
    ],
  },
  {
    title: 'Finanzas',
    icon: LuLandmark,
    module: 'asistencial',
    items: [
      {
        title: 'Facturación',
        description: 'Consulta, filtra y gestiona las facturas emitidas.',
        icon: LuReceipt,
        href: '/facturas',
        enabled: true,
      },
    ],
  },
  {
    title: 'Ayudas DX',
    icon: LuFlaskConical,
    module: 'asistencial',
    enabled: false,
    items: [],
  },
  {
    title: 'Inventario',
    icon: LuPill,
    module: 'contable',
    items: [
      {
        title: 'Salidas asistenciales',
        description: 'Registra y gestiona solicitudes de insumos de farmacia.',
        icon: LuFileText,
        href: '/insumos-farmacia/solicitudes',
        enabled: true,
      },
    ],
  },
];

export default function Home() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: false });
    return cleanup;
  }, []);

  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());
  const [previewModule, setPreviewModule] = useState('asistencial');
  const [allModulesOpen, setAllModulesOpen] = useState(false);

  const activeModule = useActiveModule();
  const isAdmin = activeModule === 'administrador';
  // El admin previsualiza cualquier módulo sin tocar su sesión real (ver
  // Sidebar.jsx: isAdmin ya muestra el árbol completo independientemente de
  // activeModule); un usuario de un solo módulo simplemente ve el suyo,
  // igual que ya hace Sidebar.jsx (isContable || isInventario ? contableSubGroups : asistencialSubGroups).
  // activeModule 'inventario' se normaliza a 'contable': el login mantiene ese
  // id por compatibilidad (ver Login.jsx), pero su contenido ya vive bajo el
  // grupo "Inventario" con module:'contable' más abajo.
  const effectiveModule = isAdmin ? previewModule : (activeModule === 'inventario' ? 'contable' : activeModule);
  const visibleGroups = MODULE_GROUPS.filter((group) => group.module === effectiveModule);
  const effectiveModuleLabel = MODULE_OPTIONS.find((opt) => opt.value === effectiveModule)?.label ?? '';

  const toggleGroup = (title) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  return (
    <div className="app">

      <Sidebar />

      <div className="main">

        <Topbar page="Inicio" user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}>
          {effectiveModule === 'contable' && <BodegaPickerButton />}
          {effectiveModule === 'asistencial' && <AreaFuncionalPickerButton />}
        </Topbar>

        <div className="content home-content">
          <div className="home-inner">

            <div className="home-hero">
              <div className="home-hero-text">
                <h1>Bienvenido a Clintos</h1>
                <p>Selecciona un módulo para continuar.</p>
              </div>
              {isAdmin && (
                <div className="home-hero-controls">
                  <PillTabs
                    options={MODULE_OPTIONS}
                    value={previewModule}
                    onChange={setPreviewModule}
                    ariaLabel="Selector rápido de módulo"
                  />
                  <span className="home-hero-controls-divider" aria-hidden="true" />
                  <button
                    type="button"
                    className="home-all-modules-btn"
                    onClick={() => setAllModulesOpen(true)}
                    aria-label="Buscar en todos los módulos"
                    title="Buscar en todos los módulos"
                  >
                    <LuLayoutGrid className="icon" />
                  </button>
                </div>
              )}
            </div>

            {allModulesOpen && (
              <AllModulesModal
                groups={MODULE_GROUPS}
                initialModule={previewModule}
                onClose={() => setAllModulesOpen(false)}
              />
            )}

            {visibleGroups.length === 0 && (
              <p className="home-empty-state">Todavía no hay módulos disponibles para {effectiveModuleLabel}.</p>
            )}

            {visibleGroups.map((group) => {
              const tone = MODULE_TONES[group.module];

              if (group.enabled === false) {
                return (
                  <section className="module-section" key={group.title}>
                    <div className={`module-section-header disabled tone-${tone}`} aria-disabled="true">
                      <group.icon className="icon" />
                      <h2>{group.title}</h2>
                      <span className="module-card-badge"><LuLock className="icon" />Próximamente</span>
                    </div>
                  </section>
                );
              }

              const collapsed = collapsedGroups.has(group.title);
              const bodyId = `module-section-body-${group.title.replace(/\s+/g, '-').toLowerCase()}`;
              return (
                <section className={`module-section${collapsed ? ' collapsed' : ''}`} key={group.title}>
                  <div
                    className={`module-section-header tone-${tone}`}
                    role="button"
                    tabIndex="0"
                    aria-expanded={!collapsed}
                    aria-controls={bodyId}
                    onClick={() => toggleGroup(group.title)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleGroup(group.title);
                      }
                    }}
                  >
                    <group.icon className="icon" />
                    <h2>{group.title}</h2>
                    <LuChevronDown className="icon chev" />
                  </div>
                  <div className="module-section-body" id={bodyId}>
                    <div className="module-grid">
                      {group.items.map((item) => (
                        <ModuleCard
                          key={item.title}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                          href={item.href}
                          enabled={item.enabled}
                          tone={tone}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}
