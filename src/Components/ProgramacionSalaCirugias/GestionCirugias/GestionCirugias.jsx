'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LuCircleAlert, LuCircleCheck, LuClipboardList, LuClock, LuPlus, LuSearch,
} from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './GestionCirugias.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import KpiCard from '@/Components/KpiCard/KpiCard';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DatePicker from '@/Components/DatePicker/DatePicker';
import SolicitudesTable from './SolicitudesTable/SolicitudesTable';
import SolicitudPanel from './SolicitudPanel/SolicitudPanel';
import { consumirAviso, getSolicitudes } from '@/hooks/ProgramacionSalaCirugias/gestion/store';
import { contarPorEstado, filtrarSolicitudes } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

const FILTROS_INICIALES = {
  busqueda: '', eps: 'todas', especialidad: 'todas', fecha: '', estado: 'todas',
};

const opciones = (todas, valores) => [
  { value: 'todas', label: todas },
  ...[...new Set(valores)].sort((a, b) => a.localeCompare(b, 'es')).map((v) => ({ value: v, label: v })),
];

// "Gestión de cirugías": solicitudes de cirugía con su lista de chequeo
// previa (orden, autorización EPS, valoración preanestésica y estudios). Solo
// se puede programar cuando todo lo obligatorio está completo. Los datos son
// de ejemplo (mockSolicitudes, vía store); la lógica de estados vive en
// @/hooks/ProgramacionSalaCirugias/gestion/gestion.
export default function GestionCirugias() {
  const router = useRouter();
  const [solicitudes] = useState(() => getSolicitudes());
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);
  // Aviso de otra pantalla del flujo (orden registrada / cirugía programada).
  useEffect(() => {
    const aviso = consumirAviso();
    if (aviso) showToast(aviso);
  }, []);

  // `todas` es el valor del select/chip "sin filtro"; los helpers puros usan ''.
  const efectivos = {
    ...filtros,
    eps: filtros.eps === 'todas' ? '' : filtros.eps,
    especialidad: filtros.especialidad === 'todas' ? '' : filtros.especialidad,
  };
  // Los indicadores cuentan sobre lo que dejan los demás filtros, así su
  // número coincide con las filas que aparecen al pulsarlos.
  const conteo = contarPorEstado(filtrarSolicitudes(solicitudes, efectivos, { ignorarEstado: true }));
  const filas = filtrarSolicitudes(solicitudes, efectivos);
  const seleccionada = solicitudes.find((s) => s.id === selectedId) ?? null;
  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  const setFiltro = (cambio) => setFiltros((f) => ({ ...f, ...cambio }));
  const alternarEstado = (estado) => setFiltro({ estado: filtros.estado === estado ? 'todas' : estado });

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  function cerrarPanel() { setSelectedId(null); }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Programación sala de cirugías"
          page="Gestión de cirugías"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content gc-content">
          <div className="psc-page-header">
            <div>
              <h1>Gestión de cirugías</h1>
              <p>Las órdenes de Consulta externa e Internación llegan automáticamente. Verifica la lista de chequeo previa antes de programar.</p>
            </div>
            <div className="psc-page-header-actions">
              <Button icon={LuPlus} onClick={() => router.push('/cirugia/gestion/registrar-orden')}>
                Registrar orden externa
              </Button>
            </div>
          </div>

          <div className="gc-kpis" role="group" aria-label="Filtrar solicitudes por estado del chequeo">
            <KpiCard
              icon={LuClipboardList}
              label="Todas las solicitudes"
              value={conteo.todas}
              variant="neutral"
              compact
              active={filtros.estado === 'todas'}
              onClick={() => setFiltro({ estado: 'todas' })}
            />
            <KpiCard
              icon={LuCircleCheck}
              label="Listas para programar"
              value={conteo.lista}
              variant="success"
              compact
              active={filtros.estado === 'lista'}
              onClick={() => alternarEstado('lista')}
            />
            <KpiCard
              icon={LuClock}
              label="Con pendientes"
              value={conteo.pendientes}
              variant="warning"
              compact
              active={filtros.estado === 'pendientes'}
              onClick={() => alternarEstado('pendientes')}
            />
            <KpiCard
              icon={LuCircleAlert}
              label="Bloqueadas"
              value={conteo.bloqueada}
              variant="danger"
              compact
              active={filtros.estado === 'bloqueada'}
              onClick={() => alternarEstado('bloqueada')}
            />
          </div>

          <div className="gc-workspace">
            <section className="gc-lista" aria-label="Solicitudes de cirugía">
              <div className="filter-bar gc-toolbar">
                <div className="search-field">
                  <LuSearch className="icon" aria-hidden="true" />
                  <input
                    type="search"
                    value={filtros.busqueda}
                    onChange={(e) => setFiltro({ busqueda: e.target.value })}
                    placeholder="Paciente, documento o procedimiento"
                    aria-label="Buscar por paciente, documento o procedimiento"
                  />
                </div>
                <span className="filter-spacer" />
                <div className="filter-cluster">
                  <div className="gc-filtro">
                    <FormSelect
                      id="gc-eps"
                      ariaLabel="EPS"
                      value={filtros.eps}
                      onChange={(eps) => setFiltro({ eps })}
                      options={opciones('Todas las EPS', solicitudes.map((s) => s.eps))}
                    />
                  </div>
                  <div className="gc-filtro">
                    <FormSelect
                      id="gc-especialidad"
                      ariaLabel="Especialidad"
                      value={filtros.especialidad}
                      onChange={(especialidad) => setFiltro({ especialidad })}
                      options={opciones('Todas las especialidades', solicitudes.map((s) => s.especialidad))}
                    />
                  </div>
                  <DatePicker
                    id="gc-fecha"
                    ariaLabel="Fecha tentativa"
                    value={filtros.fecha}
                    onChange={(fecha) => setFiltro({ fecha })}
                    triggerClassName="gc-fecha"
                    clearable
                    placeholder="Fecha tentativa"
                  />
                </div>
                {hayFiltros && (
                  <Button variant="secondary" onClick={() => setFiltros(FILTROS_INICIALES)}>
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {filas.length === 0 ? (
                <div className="gc-vacio" role="status">
                  <p>Ninguna solicitud coincide con los filtros.</p>
                  <Button variant="secondary" onClick={() => setFiltros(FILTROS_INICIALES)}>Limpiar filtros</Button>
                </div>
              ) : (
                <SolicitudesTable solicitudes={filas} selectedId={selectedId} onSelect={setSelectedId} compacta={seleccionada !== null} />
              )}
              <p className="gc-resumen" aria-live="polite">
                {filas.length} de {solicitudes.length} solicitudes
              </p>
            </section>

            {seleccionada && (
              <SolicitudPanel
                solicitud={seleccionada}
                onClose={cerrarPanel}
                onAccion={(accion, item) => showToast(`${accion} · ${item}: pantalla por conectar`)}
                onProgramar={(s) => router.push(`/cirugia/gestion/programar?id=${s.id}`)}
              />
            )}
          </div>
        </div>
      </div>

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
