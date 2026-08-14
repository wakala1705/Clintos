'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './PanelGeneral.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from './KpiCard/KpiCard';
import PatientsPanel from './PatientsPanel/PatientsPanel';
import AlertsPanel from './AlertsPanel/AlertsPanel';
import AreaSelector from './AreaSelector/AreaSelector';
import {
  AREAS_OPERATIVAS, CAMAS_POR_AREA, DOSIS_PROGRAMADAS_HOY, ORDENES_PENDIENTES,
  PACIENTES_PISO, sectorDeCama,
} from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import {
  LuBedDouble, LuClipboardList, LuHourglass, LuListChecks, LuPill, LuUsers,
} from 'react-icons/lu';

// Dashboard operativo del piso — reemplaza a AtencionEnfermeria.jsx como
// pantalla principal de /gestion-enfermeria (esa pantalla, atención a UN
// paciente, se movió a /gestion-enfermeria/atencion/[id], ver AGENTS.md).
// Total pacientes/Estancias prolongadas/Ocupación se derivan de
// `pacientesFiltrados` (nunca un número aparte que pueda desincronizarse de
// la lista real, ver mockPanelGeneralData.js) — ya filtrados por el
// selector "Área operativa" (encargo explícito), así que también deciden
// qué le llega a PatientsPanel (sus contadores de tabs y buscador operan
// sobre la lista ya acotada, sin filtro propio de sector). Medicación/
// Órdenes médicas (KPIs) y AlertsPanel se quedan como estadísticas
// independientes del piso completo, sin filtrar por sector: el mock no
// modela dosis/órdenes/alertas por paciente (ver comentario en
// mockPanelGeneralData.js), así que no hay de dónde derivar un recorte real
// por sector sin inventar un número desconectado de la fuente de verdad.
export default function PanelGeneral() {
  const router = useRouter();
  const [areaOperativa, setAreaOperativa] = useState('todo');

  // Theme claro/oscuro + colapsar/expandir el Sidebar (con auto-colapso
  // responsive por debajo de 1024px) — mismo init que AtencionEnfermeria.jsx
  // (ahí llega vía initGestionEnfermeria, ver legacy-app.js) e
  // HistoriaClinica.jsx: sin este efecto, los onClick de Sidebar.jsx
  // (window.toggleTheme/toggleSidebar/toggleNavGroup) quedan sin definir.
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  function goToAtencion(pacienteId) {
    router.push(`/gestion-enfermeria/atencion/${pacienteId}`);
  }

  const pacientesFiltrados = useMemo(() => (
    areaOperativa === 'todo'
      ? PACIENTES_PISO
      : PACIENTES_PISO.filter((p) => sectorDeCama(p.cama) === areaOperativa)
  ), [areaOperativa]);

  const camasTotales = CAMAS_POR_AREA[areaOperativa];

  const kpis = useMemo(() => {
    const total = pacientesFiltrados.length;
    const prolongadas = pacientesFiltrados.filter((p) => p.prolongada).length;
    const ocupacionPct = Math.round((total / camasTotales) * 100);
    return { total, prolongadas, ocupacionPct };
  }, [pacientesFiltrados, camasTotales]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Gestión de Enfermería"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content pg-content">
          <div className="pg-header">
            <div>
              <h1>Panel General - Enfermería</h1>
              <p>Resumen de actividad y estado del piso</p>
            </div>
            <div className="pg-header-actions">
              <button type="button" className="btn btn-secondary" onClick={() => router.push('/gestion-enfermeria/tareas')}>
                <LuListChecks className="icon" />
                Tareas
              </button>
              <AreaSelector options={AREAS_OPERATIVAS} value={areaOperativa} onChange={setAreaOperativa} />
            </div>
          </div>

          <div className="pg-kpi-row">
            <KpiCard
              icon={LuUsers}
              label="Total pacientes"
              value={kpis.total}
              description="En piso"
              variant="neutral"
            />
            <KpiCard
              icon={LuHourglass}
              label="Estancias prolongadas"
              value={kpis.prolongadas}
              description="> 7 días ingresados"
              variant="warning"
            />
            <KpiCard
              icon={LuPill}
              label="Medicación"
              value={DOSIS_PROGRAMADAS_HOY}
              description="Dosis programadas hoy"
              variant="warning"
            />
            <KpiCard
              icon={LuClipboardList}
              label="Órdenes médicas"
              value={ORDENES_PENDIENTES}
              description="Órdenes pendientes"
              variant="warning"
            />
            <KpiCard
              icon={LuBedDouble}
              label="Ocupación"
              value={`${kpis.ocupacionPct}%`}
              description={`${kpis.total}/${camasTotales} camas ocupadas`}
              variant="neutral"
              progress={{ percent: kpis.ocupacionPct }}
            />
          </div>

          <div className="pg-main-row">
            <PatientsPanel pacientes={pacientesFiltrados} onOpenAtencion={goToAtencion} />
            <AlertsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
