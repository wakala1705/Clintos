'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  LuBriefcaseMedical, LuReceiptText, LuRefreshCw, LuSquareCheckBig, LuSquarePlus, LuTriangleAlert, LuUserSearch,
} from 'react-icons/lu';
import './Interconsulta.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import Button from '@/Components/Button/Button';
import SolicitudesPanel from './SolicitudesPanel/SolicitudesPanel';
import InterconsultaModal from './modals/InterconsultaModal/InterconsultaModal';
import { SOLICITUDES } from '@/hooks/Interconsulta/interconsultaData';
import { aplicarAccion } from '@/hooks/Interconsulta/interconsultaAcciones';

// Bandeja de interconsultas del módulo Hospitalización: solicitudes que otros
// servicios le hacen al médico (por nombre o por especialidad), su respuesta
// clínica y la confirmación del cargo. Mismo esqueleto que Historia Clínica —
// Hospitalización (encabezado, fila de KPIs, card con la lista); todo
// (KPIs y lista) se deriva de `solicitudes`, así nunca hay un número que no
// cuadre con lo que se ve. La lista vive en estado porque el modal de detalle
// (botón "Abrir") la modifica: guardar respuesta, confirmar cargo, anular.
export default function Interconsulta() {
  const [solicitudes, setSolicitudes] = useState(SOLICITUDES);
  // Solicitud abierta en el modal (id o null) — se busca en `solicitudes` para
  // que el modal siempre vea la versión actualizada (ej. un evento nuevo en la
  // trazabilidad tras "Regenerar HC").
  const [abiertaId, setAbiertaId] = useState(null);
  const abierta = solicitudes.find((s) => s.id === abiertaId);

  function handleAccion(tipo, payload) {
    setSolicitudes((lista) => lista.map((s) => (s.id === abiertaId ? aplicarAccion(s, tipo, payload) : s)));
  }

  // Botón expandir de la barra de la tabla (SolicitudesPanel.jsx): compacta
  // los KPIs a una sola línea para darle ese alto a la tabla — mismo
  // comportamiento que HC Hospitalización y Panel General de Enfermería.
  const [tablaExpandida, setTablaExpandida] = useState(false);

  // Theme claro/oscuro + colapsar/expandir el Sidebar — sin este efecto los
  // onClick de Sidebar.jsx (window.toggleTheme/toggleSidebar/toggleNavGroup)
  // quedan sin definir.
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const kpis = useMemo(() => {
    const cuenta = (fn) => solicitudes.filter(fn).length;
    return {
      pendientes: cuenta((s) => s.estado === 'pendientes'),
      porNombre: cuenta((s) => s.estado === 'pendientes' && s.asignacion === 'nombre'),
      porEspecialidad: cuenta((s) => s.estado === 'pendientes' && s.asignacion === 'especialidad'),
      sinCargo: cuenta((s) => s.estado === 'sin-cargo'),
      respondidasHoy: cuenta((s) => s.estado === 'respondidas' && s.esHoy),
      facturadasHoy: cuenta((s) => s.estado === 'facturadas' && s.esHoy),
    };
  }, [solicitudes]);

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización']}
          page="Interconsulta"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ic-content">
          <div className="ic-header">
            <div>
              <h1>Interconsultas</h1>
              <p>Bandeja de solicitudes, respuestas clínicas y confirmación de cargos.</p>
            </div>
            {/* Sin backend todavía: cuando haya fetch, acá vuelve a pedir la bandeja. */}
            <Button variant="outline" icon={LuRefreshCw} onClick={() => {}}>Actualizar</Button>
          </div>

          <div className={`ic-kpi-row${tablaExpandida ? ' compact' : ''}`}>
            <KpiCard icon={LuSquarePlus} label="Pendientes" value={kpis.pendientes} description="Por gestionar" variant="neutral" />
            <KpiCard icon={LuUserSearch} label="Por nombre" value={kpis.porNombre} description="Asignadas al médico" variant="info" />
            <KpiCard icon={LuBriefcaseMedical} label="Por especialidad" value={kpis.porEspecialidad} description="De la especialidad" variant="violet" />
            <KpiCard icon={LuTriangleAlert} label="Sin cargo" value={kpis.sinCargo} description="Listas para confirmar" variant="warning" />
            <KpiCard icon={LuSquareCheckBig} label="Respondidas hoy" value={kpis.respondidasHoy} description="Actividad del día" variant="success" />
            <KpiCard icon={LuReceiptText} label="Facturadas hoy" value={kpis.facturadasHoy} description="Cargo generado" variant="info" />
          </div>

          <SolicitudesPanel
            solicitudes={solicitudes}
            onAbrir={setAbiertaId}
            expandida={tablaExpandida}
            onToggleExpandida={() => setTablaExpandida((v) => !v)}
          />
        </div>
      </div>

      {abierta && (
        <InterconsultaModal
          key={abierta.id}
          solicitud={abierta}
          onClose={() => setAbiertaId(null)}
          onAccion={handleAccion}
        />
      )}
    </div>
  );
}
