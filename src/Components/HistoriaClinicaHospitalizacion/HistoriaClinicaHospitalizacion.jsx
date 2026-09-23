'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './HistoriaClinicaHospitalizacion.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import ClintosAI from '@/Components/ClintosAI/ClintosAI';
import PatientsPanel from './PatientsPanel/PatientsPanel';
import PendientesPanel from './PendientesPanel/PendientesPanel';
import {
  AREAS_OPERATIVAS, PACIENTES_HOSPITALIZADOS, pendientesOrdenados, sectorDeCama,
} from '@/hooks/HistoriaClinicaHospitalizacion/mockHospitalizadosData';
import {
  LuClipboardList, LuFilePen, LuFlaskConical, LuLogOut, LuUsers,
} from 'react-icons/lu';

// El panel lateral "Pendientes clínicos" queda oculto en esta versión (encargo
// explícito) — el componente y sus datos siguen intactos; poner en true
// para volver a mostrarlo (la tabla vuelve a ocupar ~70% del ancho).
const MOSTRAR_PENDIENTES = false;

// Tablero del médico sobre sus pacientes hospitalizados — mismo layout que
// el Panel General de Enfermería (PanelGeneral.jsx: encabezado, fila de 5
// KPIs, tabla de pacientes ~70% + panel lateral ~30%), pero con contenido
// clínico en vez de operativo (evolución, órdenes por firmar, resultados,
// altas). Todo (KPIs, tabla y panel de pendientes) se deriva de
// `pacientesFiltrados`, ya recortado por el selector de área, así que nunca
// hay un número que no cuadre con la lista que se ve. El filtro rápido vive
// acá (no en PatientsPanel) porque el botón del panel lateral también lo
// controla ("Ver pacientes con pendientes").
export default function HistoriaClinicaHospitalizacion() {
  const router = useRouter();
  const [areaOperativa, setAreaOperativa] = useState('todo');
  const [filtro, setFiltro] = useState('todos');

  // Theme claro/oscuro + colapsar/expandir el Sidebar — mismo init que
  // PanelGeneral.jsx/HistoriaClinica.jsx: sin este efecto los onClick de
  // Sidebar.jsx (window.toggleTheme/toggleSidebar/toggleNavGroup) quedan
  // sin definir.
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  function goToHistoria(pacienteId) {
    router.push(`/hospitalizacion/historia-clinica/${pacienteId}`);
  }

  const pacientesFiltrados = useMemo(() => (
    areaOperativa === 'todo'
      ? PACIENTES_HOSPITALIZADOS
      : PACIENTES_HOSPITALIZADOS.filter((p) => sectorDeCama(p.cama) === areaOperativa)
  ), [areaOperativa]);

  const pendientes = useMemo(() => pendientesOrdenados(pacientesFiltrados), [pacientesFiltrados]);
  const areaLabel = AREAS_OPERATIVAS.find((a) => a.value === areaOperativa)?.label;

  const kpis = useMemo(() => ({
    total: pacientesFiltrados.length,
    evolucionPendiente: pacientesFiltrados.filter((p) => p.evolucionPendiente).length,
    ordenesPorFirmar: pacientesFiltrados.reduce((n, p) => n + p.ordenesPorFirmar, 0),
    resultadosNuevos: pacientesFiltrados.reduce((n, p) => n + p.resultadosNuevos, 0),
    resultadosCriticos: pacientesFiltrados.reduce((n, p) => n + p.resultadosCriticos, 0),
    altasProbables: pacientesFiltrados.filter((p) => p.altaProbable).length,
  }), [pacientesFiltrados]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Historia Clínica"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="hh-body-row">
          <div className="content hh-content">
            <div className="hh-header">
              <h1>Historia Clínica - Hospitalización</h1>
              <p>Mis pacientes hospitalizados y pendientes clínicos</p>
            </div>

            <div className="hh-kpi-row">
              <KpiCard
                icon={LuUsers}
                label="Mis pacientes"
                value={kpis.total}
                description="En piso"
                variant="neutral"
              />
              <KpiCard
                icon={LuFilePen}
                label="Evolución pendiente"
                value={kpis.evolucionPendiente}
                description="Sin nota del día"
                variant="warning"
              />
              <KpiCard
                icon={LuClipboardList}
                label="Órdenes por firmar"
                value={kpis.ordenesPorFirmar}
                description="Órdenes pendientes"
                variant="warning"
              />
              <KpiCard
                icon={LuFlaskConical}
                label="Resultados nuevos"
                value={kpis.resultadosNuevos}
                description={kpis.resultadosCriticos > 0
                  ? `${kpis.resultadosCriticos} ${kpis.resultadosCriticos === 1 ? 'crítico' : 'críticos'}`
                  : 'Sin críticos'}
                variant={kpis.resultadosCriticos > 0 ? 'danger' : 'info'}
              />
              <KpiCard
                icon={LuLogOut}
                label="Altas probables"
                value={kpis.altasProbables}
                description="Egreso hoy o mañana"
                variant="success"
              />
            </div>

            <div className="hh-main-row">
              <PatientsPanel
                pacientes={pacientesFiltrados}
                onOpenHistoria={goToHistoria}
                filtro={filtro}
                onFiltroChange={setFiltro}
                areaOperativa={areaOperativa}
                onAreaOperativaChange={setAreaOperativa}
                areaOptions={AREAS_OPERATIVAS}
              />
              {MOSTRAR_PENDIENTES && (
                <PendientesPanel
                  pendientes={pendientes}
                  onOpenHistoria={goToHistoria}
                  onVerPacientesConPendientes={() => setFiltro('pendientes')}
                />
              )}
            </div>
          </div>

          <ClintosAI
            pacientes={pacientesFiltrados}
            areaLabel={areaLabel}
            userFirstName="Camilo"
            onOpenHistoria={goToHistoria}
            onNavigate={router.push}
          />
        </div>
      </div>
    </div>
  );
}
