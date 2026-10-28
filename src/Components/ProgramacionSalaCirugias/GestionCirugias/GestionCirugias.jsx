'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCircleAlert, LuCircleCheck, LuClipboardList, LuClock, LuPlus } from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './GestionCirugias.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import { initNuevaCita } from '@/hooks/NuevaCita/legacy-nueva-cita';
import NuevaCitaFlow from '@/Components/NuevaCita/NuevaCitaFlow';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import KpiCard from '@/Components/KpiCard/KpiCard';
import FormSelect from '@/Components/FormSelect/FormSelect';
import VistaPanelMenu from '../VistaPanelMenu/VistaPanelMenu';
import SolicitudesTable from './SolicitudesTable/SolicitudesTable';
import SolicitudPanel from './SolicitudPanel/SolicitudPanel';
import SeleccionarHuecoModal from './SeleccionarHuecoModal/SeleccionarHuecoModal';
// RegistrarValoracionModal (formulario manual) queda oculto: 'Vincular valoración'
// ahora vincula una EVAPRE (VincularEvapreModal).
import VincularEvapreModal from './VincularEvapreModal/VincularEvapreModal';
import VincularResultadosModal from './VincularResultadosModal/VincularResultadosModal';
import RegistrarAutorizacionModal from './RegistrarAutorizacionModal/RegistrarAutorizacionModal';
import VincularOrdenModal from './VincularOrdenModal/VincularOrdenModal';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import NuevaCirugiaWizard from '../modals/NuevaCirugiaWizard/NuevaCirugiaWizard';
import RegistrarOrdenExterna from '../RegistrarOrdenExterna/RegistrarOrdenExterna';
import {
  consumirAviso, getSolicitudes, marcarProgramada, registrarValoracion, registrarAutorizacion, vincularOrden, vincularResultados,
} from '@/hooks/ProgramacionSalaCirugias/gestion/store';
import {
  datosWizardDesdeSolicitud, duracionEstimadaMin, pacienteDeSolicitud,
} from '@/hooks/ProgramacionSalaCirugias/gestion/programacion';
import { ORIGEN_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { contarPorEstado, filtrarSolicitudes, ordenarPorPrioridad } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

import SearchField from '@/Components/SearchField/SearchField';
// Usuario en sesión (el mismo del Topbar): queda como autor de los registros que hace.
const USUARIO = { nombre: 'Camilo Grondona', rol: 'Administrador', iniciales: 'CG' };
const FILTROS_INICIALES = {
  busqueda: '', origen: 'todas', diagnostico: 'todas', estado: 'todas',
};

const DIAGNOSTICO_OPCIONES = [
  { value: 'todas', label: 'Todos los diagnósticos' },
  { value: 'primera-vez', label: 'Primera vez' },
  { value: 'recurrente', label: 'Recurrente' },
];

// "Gestión de cirugías": solicitudes de cirugía con su lista de chequeo
// previa (orden, autorización EPS, valoración preanestésica y estudios). Solo
// se puede programar cuando todo lo obligatorio está completo. Los datos son
// de ejemplo (mockSolicitudes, vía store); la lógica de estados vive en
// @/hooks/ProgramacionSalaCirugias/gestion/gestion.
export default function GestionCirugias() {
  const [solicitudes, setSolicitudes] = useState(() => getSolicitudes());
  // Modal "Registrar orden externa" (asistente por pasos).
  const [registrandoOrden, setRegistrandoOrden] = useState(false);
  // Afiliado elegido en el buscador compartido (#ps-overlay) para esa orden.
  const [afiliado, setAfiliado] = useState(null);
  // Programar una solicitud: 1) modal con la agenda para elegir sala/fecha/hora
  // (`programando`), 2) wizard "Nueva cirugía" precargado (`hueco` elegido).
  // Ambos son modales sobre esta pantalla; no se navega a Programación.
  const [programando, setProgramando] = useState(null);
  const [hueco, setHueco] = useState(null);
  // Solicitud cuya valoración preanestésica se está registrando (modal sobre el panel).
  const [valorando, setValorando] = useState(null);
  // Solicitud + estudio ('laboratorios' | 'imagenes') cuyos resultados se vinculan desde una EVAPRE.
  const [vinculandoResultados, setVinculandoResultados] = useState(null);
  const [vinculandoOrden, setVinculandoOrden] = useState(null);
  const [registrandoAut, setRegistrandoAut] = useState(null);
  const [visorPdf, setVisorPdf] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  // Muestra/oculta las 4 columnas de validaciones (Orden, Estudios, Valoración, Autorización).
  const [mostrarValidaciones, setMostrarValidaciones] = useState(false);
  // Tipo de vista (mismo menú que el Panel general): compacto (KPIs de una línea) o expandido.
  const [tipoVista, setTipoVista] = useState('compacto');
  const kpisCompactos = tipoVista === 'compacto';
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    // Mismo buscador de afiliados de Programar cita: elegir uno no agenda una
    // cita, abre el asistente de Registrar orden externa.
    const cleanupNuevaCita = initNuevaCita({
      onPatientConfirmed: (elegido) => { setAfiliado(elegido); setRegistrandoOrden(true); },
    });
    return () => {
      cleanupChrome?.();
      cleanupNuevaCita?.();
    };
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
    diagnostico: filtros.diagnostico === 'todas' ? '' : filtros.diagnostico,
  };
  // Los indicadores cuentan sobre lo que dejan los demás filtros, así su
  // número coincide con las filas que aparecen al pulsarlos.
  const conteo = contarPorEstado(filtrarSolicitudes(solicitudes, efectivos, { ignorarEstado: true }));
  const filas = ordenarPorPrioridad(filtrarSolicitudes(solicitudes, efectivos));
  const seleccionada = solicitudes.find((s) => s.id === selectedId) ?? null;
  // Cola de "Siguiente solicitud": el orden y filtros que se ven en la tabla.
  const indiceSel = seleccionada ? filas.findIndex((s) => s.id === seleccionada.id) : -1;
  const siguiente = indiceSel >= 0 ? filas[indiceSel + 1] : null;
  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  const setFiltro = (cambio) => setFiltros((f) => ({ ...f, ...cambio }));
  const alternarEstado = (estado) => setFiltro({ estado: filtros.estado === estado ? 'todas' : estado });

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  function cerrarPanel() { setSelectedId(null); }

  // El primer paso de "Registrar orden externa" es el buscador de afiliados
  // (#ps-overlay): el asistente solo se abre cuando se elige uno, y arranca en
  // el paso 2. Cerrar el buscador sin elegir no abre nada.
  function abrirBuscadorAfiliados() { window.openPatientSearch?.(); }
  function handleRegistrarOrden() {
    setAfiliado(null);
    setRegistrandoOrden(false);
    abrirBuscadorAfiliados();
  }
  function cerrarRegistroOrden() {
    setRegistrandoOrden(false);
    setAfiliado(null);
  }

  // Acciones del chequeo: "Ver orden" abre el PDF de la orden (`archivoUrl`) en un visor,
  // "Vincular valoración" abre el modal que vincula una EVAPRE y "Vincular
  // resultados" (laboratorios o imágenes) el que toma los resultados de esa EVAPRE; el
  // resto aún no tiene pantalla y avisa.
  function handleAccion(accion, item, clave) {
    const archivoUrl = seleccionada?.checklist[clave]?.archivoUrl;
    if (clave === 'orden' && accion === 'Ver orden' && archivoUrl) {
      setVisorPdf({ src: archivoUrl, title: 'Orden médica', subtitle: `${seleccionada.paciente.nombre} · ${seleccionada.ordenNumero}` });
    }
    else if (clave === 'orden' && accion === 'Vincular orden médica') setVinculandoOrden(seleccionada);
    else if (clave === 'autorizacion' && accion === 'Ver autorización' && archivoUrl) {
      setVisorPdf({ src: archivoUrl, title: 'Autorización', subtitle: `${seleccionada.paciente.nombre} · N° ${seleccionada.checklist.autorizacion.registro?.numero ?? ''}` });
    }
    else if (clave === 'autorizacion' && (accion === 'Registrar autorización' || accion === 'Registrar renovación')) setRegistrandoAut(seleccionada);
    else if (clave === 'valoracion' && accion === 'Vincular valoración') setValorando(seleccionada);
    else if ((clave === 'laboratorios' || clave === 'imagenes') && accion === 'Vincular resultados') {
      setVinculandoResultados({ solicitud: seleccionada, clave });
    }
    else showToast(`${accion} · ${item}: pantalla por conectar`);
  }

  function handleAutorizacionRegistrada(datos) {
    registrarAutorizacion(registrandoAut.id, datos);
    setSolicitudes(getSolicitudes());
    setRegistrandoAut(null);
    showToast(`Autorización N° ${datos.numero.trim()} registrada.`);
  }

  function handleOrdenVinculada(datos) {
    vincularOrden(vinculandoOrden.id, datos);
    setSolicitudes(getSolicitudes());
    setVinculandoOrden(null);
    showToast(`Orden médica N° ${datos.orden.numero} vinculada desde Historia clínica.`);
  }

  function handleResultadosVinculados(datos) {
    vincularResultados(vinculandoResultados.solicitud.id, vinculandoResultados.clave, datos);
    setSolicitudes(getSolicitudes());
    const { clave } = vinculandoResultados;
    setVinculandoResultados(null);
    showToast(`Resultados de ${clave === 'imagenes' ? 'imágenes' : 'laboratorio'} vinculados desde la EVAPRE.`);
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
          user={{ name: USUARIO.nombre, role: USUARIO.rol, initials: USUARIO.iniciales }}
        />

        <div className="content gc-content">
          <div className="psc-page-header">
            <div>
              <h1>Gestión de cirugías</h1>
              <p>Las órdenes de Consulta externa, Internación y Orden externa llegan automáticamente. Verifica la lista de chequeo previa antes de programar.</p>
            </div>
            <div className="psc-page-header-actions">
              <Button icon={LuPlus} onClick={handleRegistrarOrden}>
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
              compact={kpisCompactos}
              active={filtros.estado === 'todas'}
              onClick={() => setFiltro({ estado: 'todas' })}
            />
            <KpiCard
              icon={LuCircleCheck}
              label="Listas para programar"
              value={conteo.lista}
              variant="success"
              compact={kpisCompactos}
              active={filtros.estado === 'lista'}
              onClick={() => alternarEstado('lista')}
            />
            <KpiCard
              icon={LuClock}
              label="Con pendientes"
              value={conteo.pendientes}
              variant="warning"
              compact={kpisCompactos}
              active={filtros.estado === 'pendientes'}
              onClick={() => alternarEstado('pendientes')}
            />
            <KpiCard
              icon={LuCircleAlert}
              label="Bloqueadas"
              value={conteo.bloqueada}
              variant="danger"
              compact={kpisCompactos}
              active={filtros.estado === 'bloqueada'}
              onClick={() => alternarEstado('bloqueada')}
            />
          </div>

          <div className="gc-workspace">
            <section className="gc-lista" aria-label="Solicitudes de cirugía">
              <div className="filter-bar gc-toolbar">
                <SearchField className="psc-search" value={filtros.busqueda} onChange={(v) => setFiltro({ busqueda: v })} placeholder="Paciente, documento o procedimiento" ariaLabel="Buscar por paciente, documento o procedimiento" />
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
                  <div className="gc-filtro gc-filtro-diagnostico">
                    <FormSelect
                      id="gc-diagnostico"
                      ariaLabel="Diagnóstico"
                      value={filtros.diagnostico}
                      onChange={(diagnostico) => setFiltro({ diagnostico })}
                      options={DIAGNOSTICO_OPCIONES}
                    />
                  </div>
                </div>
                {hayFiltros && (
                  <Button variant="secondary" onClick={() => setFiltros(FILTROS_INICIALES)}>
                    Limpiar filtros
                  </Button>
                )}
                <VistaPanelMenu
                  tipo={tipoVista}
                  onChangeTipo={setTipoVista}
                  mostrarValidaciones={mostrarValidaciones}
                  onToggleValidaciones={() => setMostrarValidaciones((v) => !v)}
                />
              </div>

              {filas.length === 0 ? (
                <div className="gc-vacio" role="status">
                  <p>Ninguna solicitud coincide con los filtros.</p>
                  <Button variant="secondary" onClick={() => setFiltros(FILTROS_INICIALES)}>Limpiar filtros</Button>
                </div>
              ) : (
                <SolicitudesTable solicitudes={filas} selectedId={selectedId} onSelect={setSelectedId} mostrarPasos={mostrarValidaciones} />
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
                onSiguiente={siguiente ? () => setSelectedId(siguiente.id) : undefined}
                posicion={{ indice: indiceSel + 1, total: filas.length }}
              />
            )}
          </div>
        </div>
      </div>

      {registrandoOrden && afiliado && (
        <RegistrarOrdenExterna
          afiliado={afiliado}
          usuario={USUARIO}
          onBuscarAfiliado={abrirBuscadorAfiliados}
          onClose={cerrarRegistroOrden}
          onAviso={showToast}
          onRegistrada={(aviso) => {
            setSolicitudes(getSolicitudes());
            cerrarRegistroOrden();
            showToast(aviso);
          }}
        />
      )}
      {valorando && (
        <VincularEvapreModal
          solicitud={valorando}
          onClose={() => setValorando(null)}
          onVincular={handleValoracionGuardada}
        />
      )}
      {visorPdf && <PdfViewerModal {...visorPdf} onClose={() => setVisorPdf(null)} />}
      {registrandoAut && (
        <RegistrarAutorizacionModal
          solicitud={registrandoAut}
          usuario={USUARIO}
          onClose={() => setRegistrandoAut(null)}
          onRegistrar={handleAutorizacionRegistrada}
        />
      )}
      {vinculandoOrden && (
        <VincularOrdenModal
          solicitud={vinculandoOrden}
          onClose={() => setVinculandoOrden(null)}
          onVincular={handleOrdenVinculada}
        />
      )}
      {vinculandoResultados && (
        <VincularResultadosModal
          tipo={vinculandoResultados.clave}
          solicitud={vinculandoResultados.solicitud}
          onClose={() => setVinculandoResultados(null)}
          onVincular={handleResultadosVinculados}
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

      {/* Buscador de afiliados compartido; va después de los modales para quedar encima. */}
      <NuevaCitaFlow />

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
