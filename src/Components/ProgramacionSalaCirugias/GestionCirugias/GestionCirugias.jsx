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
import SolicitudesTable from './SolicitudesTable/SolicitudesTable';
import SolicitudPanel from './SolicitudPanel/SolicitudPanel';
import SeleccionarHuecoModal from './SeleccionarHuecoModal/SeleccionarHuecoModal';
// RegistrarValoracionModal (formulario manual) queda oculto: 'Registrar valoración'
// ahora vincula una EVAPRE (VincularEvapreModal).
import VincularEvapreModal from './VincularEvapreModal/VincularEvapreModal';
import AdjuntarLaboratoriosModal from './AdjuntarLaboratoriosModal/AdjuntarLaboratoriosModal';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import NuevaCirugiaWizard from '../modals/NuevaCirugiaWizard/NuevaCirugiaWizard';
import {
  adjuntarLaboratorios, consumirAviso, getSolicitudes, marcarProgramada, registrarValoracion,
} from '@/hooks/ProgramacionSalaCirugias/gestion/store';
import {
  datosWizardDesdeSolicitud, duracionEstimadaMin, pacienteDeSolicitud,
} from '@/hooks/ProgramacionSalaCirugias/gestion/programacion';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { contarPorEstado, filtrarSolicitudes } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

const FILTROS_INICIALES = {
  busqueda: '', origen: 'todas', eps: 'todas', especialidad: 'todas', estado: 'todas',
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
  const [solicitudes, setSolicitudes] = useState(() => getSolicitudes());
  // Programar una solicitud: 1) modal con la agenda para elegir sala/fecha/hora
  // (`programando`), 2) wizard "Nueva cirugía" precargado (`hueco` elegido).
  // Ambos son modales sobre esta pantalla; no se navega a Programación.
  const [programando, setProgramando] = useState(null);
  const [hueco, setHueco] = useState(null);
  // Solicitud cuya valoración preanestésica se está registrando (modal sobre el panel).
  const [valorando, setValorando] = useState(null);
  const [adjuntando, setAdjuntando] = useState(null);
  const [visorPdf, setVisorPdf] = useState(null);
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
    origen: filtros.origen === 'todas' ? '' : filtros.origen,
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

  // Acciones del chequeo: "Ver orden" abre el PDF de la orden (`archivoUrl`) en un visor,
  // "Registrar valoración" abre el modal que vincula una EVAPRE y "Adjuntar
  // resultados" de laboratorios el que toma los resultados de esa EVAPRE; el
  // resto aún no tiene pantalla y avisa.
  function handleAccion(accion, item, clave) {
    const archivoUrl = seleccionada?.checklist[clave]?.archivoUrl;
    if (clave === 'orden' && accion === 'Ver orden' && archivoUrl) {
      setVisorPdf({ src: archivoUrl, title: 'Orden médica', subtitle: `${seleccionada.paciente.nombre} · ${seleccionada.ordenNumero}` });
    }
    else if (clave === 'valoracion' && accion === 'Registrar valoración') setValorando(seleccionada);
    else if (clave === 'laboratorios' && accion === 'Adjuntar resultados') setAdjuntando(seleccionada);
    else showToast(`${accion} · ${item}: pantalla por conectar`);
  }

  function handleLaboratoriosAdjuntos(datos) {
    adjuntarLaboratorios(adjuntando.id, datos);
    setSolicitudes(getSolicitudes());
    setAdjuntando(null);
    showToast('Resultados de laboratorio adjuntados desde la EVAPRE.');
  }

  function handleValoracionGuardada(datos) {
    registrarValoracion(valorando.id, datos);
    setSolicitudes(getSolicitudes());
    setValorando(null);
    showToast(datos.concepto === 'no-apto'
      ? 'Valoración registrada: no apto. La solicitud quedó bloqueada.'
      : 'Valoración preanestésica vinculada a la EVAPRE.');
  }

  function handleCirugiaGuardada(solicitud) {
    marcarProgramada(solicitud.id);
    setSolicitudes(getSolicitudes());
    setSelectedId(null);
    setProgramando(null);
    setHueco(null);
    showToast(`Cirugía programada desde la orden ${solicitud.ordenNumero}. Canasta solicitada a farmacia${solicitud.origen === 'internacion' ? '' : ' y admisión creada'}.`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Cirugía"
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
                      id="gc-origen"
                      ariaLabel="Origen"
                      value={filtros.origen}
                      onChange={(origen) => setFiltro({ origen })}
                      options={[{ value: 'todas', label: 'Todos los orígenes' }, ...Object.entries(ORIGEN_LABEL).map(([value, label]) => ({ value, label }))]}
                    />
                  </div>
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
                <SolicitudesTable solicitudes={filas} selectedId={selectedId} onSelect={setSelectedId} />
              )}
              <p className="gc-resumen" aria-live="polite">
                {filas.length} de {solicitudes.length} solicitudes
              </p>
            </section>

            {seleccionada && !programando && (
              <SolicitudPanel
                solicitud={seleccionada}
                onClose={cerrarPanel}
                onAccion={handleAccion}
                onProgramar={setProgramando}
              />
            )}
          </div>
        </div>
      </div>

      {valorando && (
        <VincularEvapreModal
          solicitud={valorando}
          onClose={() => setValorando(null)}
          onVincular={handleValoracionGuardada}
        />
      )}
      {visorPdf && <PdfViewerModal {...visorPdf} onClose={() => setVisorPdf(null)} />}
      {adjuntando && (
        <AdjuntarLaboratoriosModal
          solicitud={adjuntando}
          onClose={() => setAdjuntando(null)}
          onAdjuntar={handleLaboratoriosAdjuntos}
        />
      )}
      {programando && (
        <SeleccionarHuecoModal
          solicitud={programando}
          duracionMin={duracionEstimadaMin(programando)}
          onClose={() => setProgramando(null)}
          onElegir={setHueco}
        />
      )}
      {programando && hueco && (
        <NuevaCirugiaWizard
          patient={pacienteDeSolicitud(programando, new Date())}
          salaId={hueco.salaId}
          initialDatos={datosWizardDesdeSolicitud(programando, hueco)}
          onGuardar={() => handleCirugiaGuardada(programando)}
          onClose={() => setHueco(null)}
        />
      )}

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
