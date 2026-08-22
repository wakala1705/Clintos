'use client';

import { useEffect, useRef, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasIntegridad.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import ImpactoBadge from './ImpactoBadge/ImpactoBadge';
import EstadoInconsistenciaBadge from './EstadoInconsistenciaBadge/EstadoInconsistenciaBadge';
import InconsistenciaRowActionsMenu from './InconsistenciaRowActionsMenu/InconsistenciaRowActionsMenu';
import InconsistenciasFiltrosPopover from './InconsistenciasFiltrosPopover/InconsistenciasFiltrosPopover';
import InconsistenciasPagination from './InconsistenciasPagination/InconsistenciasPagination';
import InconsistenciasTableSkeleton from './InconsistenciasTableSkeleton/InconsistenciasTableSkeleton';
import InconsistenciasEmptyState from './InconsistenciasEmptyState/InconsistenciasEmptyState';
import InconsistenciaDetailModal from './InconsistenciaDetailModal/InconsistenciaDetailModal';
import CorregirInconsistenciaModal from './CorregirInconsistenciaModal/CorregirInconsistenciaModal';
import IgnorarInconsistenciaModal from './IgnorarInconsistenciaModal/IgnorarInconsistenciaModal';
import InconsistenciaHistorialModal from './InconsistenciaHistorialModal/InconsistenciaHistorialModal';
import HistorialVerificacionesModal from './HistorialVerificacionesModal/HistorialVerificacionesModal';
import {
  ESTADOS, IMPACTOS, INCONSISTENCIAS_INICIALES, HISTORIAL_VERIFICACIONES_INICIAL, SEDES, TIPOS,
  ULTIMA_VERIFICACION_INICIAL, SEDE_LABEL, SERVICIO_LABEL, TIPO_LABEL,
  fetchInconsistencias, formatHoraRelativa, formatFecha,
} from '@/hooks/GestionCamas/mockIntegridadData';
import {
  LuCircleAlert, LuCircleCheck, LuHistory, LuInfo, LuRefreshCw, LuSearch, LuSearchX, LuShieldCheck, LuTriangleAlert,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = { servicio: 'todos', detectado: 'cualquiera' };

// "Integridad" — requerimiento #32 (Control de inconsistencias). Detectar →
// ver → corregir/ignorar → registrar, nunca operar (eso es el Bed Board, ver
// encargo sección 17) ni tratar esto como alerta clínica (sección 16): por
// eso ImpactoBadge/EstadoInconsistenciaBadge usan el mismo lenguaje
// administrativo rojo/ámbar/azul del resto del módulo, no el de TriageBadge.
export default function GestionCamasIntegridad() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [tipo, setTipo] = useState('todos');
  const [impacto, setImpacto] = useState('todos');
  // Default "Activas" (encargo, sección 9) — es lo que un administrador
  // necesita ver primero al entrar a la pantalla.
  const [estadoFiltro, setEstadoFiltro] = useState('activa');
  const [sede, setSede] = useState('todas');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Copia local mutable del mock (nunca se muta INCONSISTENCIAS_INICIALES
  // directamente) — Corregir/Ignorar/Verificar ahora actualizan acá, y eso
  // retroalimenta el fetch simulado + los KPIs de abajo.
  const [inconsistencias, setInconsistencias] = useState(INCONSISTENCIAS_INICIALES);
  const [historialVerificaciones, setHistorialVerificaciones] = useState(HISTORIAL_VERIFICACIONES_INICIAL);
  const [ultimaVerificacion, setUltimaVerificacion] = useState(ULTIMA_VERIFICACION_INICIAL);
  const [verificando, setVerificando] = useState(false);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  const [modal, setModal] = useState(null); // {type:'detalle'|'corregir'|'ignorar'|'historial', inconsistencia}
  const [historialVerifOpen, setHistorialVerifOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setStatus('loading');
      setPage(1);
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchInconsistencias({
      dataset: inconsistencias,
      query: debouncedQuery,
      tipo,
      impacto,
      estado: estadoFiltro,
      sede,
      servicio: filtrosAvanzados.servicio,
      detectado: filtrosAvanzados.detectado,
      page,
      pageSize,
    }).then(({ items: nextItems, total: nextTotal }) => {
      if (cancelled) return;
      setItems(nextItems);
      setTotal(nextTotal);
      setStatus('ready');
    }).catch(() => {
      if (cancelled) return;
      setStatus('error');
    });
    return () => { cancelled = true; };
  }, [inconsistencias, debouncedQuery, tipo, impacto, estadoFiltro, sede, filtrosAvanzados, page, pageSize, retryToken]);

  function handleChangeTipo(v) { setStatus('loading'); setPage(1); setTipo(v); }
  function handleChangeImpacto(v) { setStatus('loading'); setPage(1); setImpacto(v); }
  function handleChangeEstadoFiltro(v) { setStatus('loading'); setPage(1); setEstadoFiltro(v); }
  function handleChangeSede(v) { setStatus('loading'); setPage(1); setSede(v); }
  function handleAplicarFiltrosAvanzados(next) { setStatus('loading'); setPage(1); setFiltrosAvanzados(next); }
  function handleLimpiarFiltrosAvanzados() { setStatus('loading'); setPage(1); setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES); }
  function handleChangePage(p) { setStatus('loading'); setPage(p); }
  function handleChangePageSize(n) { setStatus('loading'); setPage(1); setPageSize(n); }
  function handleLimpiarTodo() {
    setStatus('loading');
    setPage(1);
    setQuery('');
    setDebouncedQuery('');
    setTipo('todos');
    setImpacto('todos');
    setEstadoFiltro('activa');
    setSede('todas');
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
  }
  function handleRetry() {
    setStatus('loading');
    setRetryToken((t) => t + 1);
  }

  function handleCloseModal() { setModal(null); }
  function handleVer(inconsistencia) { setModal({ type: 'detalle', inconsistencia }); }
  function handleCorregir(inconsistencia) { setModal({ type: 'corregir', inconsistencia }); }
  function handleIgnorar(inconsistencia) { setModal({ type: 'ignorar', inconsistencia }); }
  function handleVerHistorial(inconsistencia) { setModal({ type: 'historial', inconsistencia }); }

  function handleConfirmCorregir(id) {
    const inc = inconsistencias.find((i) => i.id === id);
    setInconsistencias((prev) => prev.map((i) => (i.id === id ? {
      ...i, estado: 'corregida', resueltoPor: 'Camilo Grondona', resueltoEn: Date.now(),
    } : i)));
    showToast(`"${inc?.titulo}" corregida.`);
    setModal(null);
  }
  function handleConfirmIgnorar(id, motivo) {
    const inc = inconsistencias.find((i) => i.id === id);
    setInconsistencias((prev) => prev.map((i) => (i.id === id ? {
      ...i, estado: 'ignorada', resueltoPor: 'Camilo Grondona', resueltoEn: Date.now(), motivo,
    } : i)));
    showToast(`"${inc?.titulo}" ignorada.`);
    setModal(null);
  }

  // Verificar ahora (encargo, sección 12): estado de proceso ("Verificando
  // integridad de camas...") mientras corre, después mensaje según haya o no
  // inconsistencias activas — y actualiza contador/listado/última
  // verificación + historial de corridas (sección 13), todo derivado del
  // estado real en vez de simulado, para que quede consistente con lo que el
  // administrador ya corrigió/ignoró en esta sesión.
  function handleVerificar() {
    setVerificando(true);
    window.setTimeout(() => {
      const nowMs = Date.now();
      const activasAhora = inconsistencias.filter((i) => i.estado === 'activa').length;
      const corregidasTotal = inconsistencias.filter((i) => i.estado === 'corregida').length;
      const resultado = activasAhora === 0
        ? 'No se encontraron inconsistencias.'
        : `Se detectaron ${activasAhora} inconsistencia${activasAhora === 1 ? '' : 's'} que requiere${activasAhora === 1 ? '' : 'n'} revisión.`;
      setHistorialVerificaciones((prev) => [
        {
          id: `VER-${nowMs}`, fecha: nowMs, usuario: 'Camilo Grondona', encontradas: activasAhora, corregidas: corregidasTotal, resultado,
        },
        ...prev,
      ]);
      setUltimaVerificacion(nowMs);
      setVerificando(false);
      setRetryToken((t) => t + 1);
      showToast(resultado);
    }, 1200);
  }

  const hayFiltrosActivos = tipo !== 'todos' || impacto !== 'todos' || estadoFiltro !== 'activa' || sede !== 'todas'
    || query.trim() !== '' || filtrosAvanzados.servicio !== 'todos' || filtrosAvanzados.detectado !== 'cualquiera';

  const modalType = modal?.type ?? null;
  const modalInconsistencia = modal?.inconsistencia ?? null;

  const kpiTotal = inconsistencias.filter((i) => i.estado === 'activa').length;
  const kpiCriticas = inconsistencias.filter((i) => i.estado === 'activa' && i.impacto === 'critico').length;
  const kpiAdvertencias = inconsistencias.filter((i) => i.estado === 'activa' && i.impacto === 'advertencia').length;
  const kpiInformativas = inconsistencias.filter((i) => i.estado === 'activa' && i.impacto === 'informativa').length;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Integridad"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbi-content">
          <GestionCamasSidebar />

          <div className="cbi-page-body">
            <div className="cbi-header">
              <div>
                <h1>Control de integridad de camas</h1>
                <p>Identifica y corrige inconsistencias en la configuración y el estado de las camas.</p>
              </div>
              <div className="cbi-header-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setHistorialVerifOpen(true)}>
                  <LuHistory className="icon" aria-hidden="true" />Ver historial de verificaciones
                </button>
                <button type="button" className="btn btn-primary" onClick={handleVerificar} disabled={verificando}>
                  <LuRefreshCw className={`icon${verificando ? ' cbi-spin' : ''}`} aria-hidden="true" />
                  {verificando ? 'Verificando…' : 'Verificar ahora'}
                </button>
              </div>
            </div>

            {verificando && (
              <div className="cbi-verificando-banner">
                <LuRefreshCw className="icon cbi-spin" aria-hidden="true" />
                Verificando integridad de camas...
              </div>
            )}

            <div className="cbi-kpi-row">
              <KpiCard icon={LuTriangleAlert} label="Inconsistencias totales" value={kpiTotal} description="Requieren revisión" variant="neutral" />
              <KpiCard icon={LuCircleAlert} label="Críticas" value={kpiCriticas} description="Acción recomendada" variant="danger" />
              <KpiCard icon={LuTriangleAlert} label="Advertencias" value={kpiAdvertencias} description="Revisión sugerida" variant="warning" />
              <KpiCard icon={LuInfo} label="Informativas" value={kpiInformativas} description="Sin impacto operativo" variant="info" />
              <KpiCard icon={LuShieldCheck} label="Última verificación" value={formatHoraRelativa(ultimaVerificacion)} description={formatFecha(ultimaVerificacion)} variant="neutral" />
            </div>

            <div className="card cbi-table-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar inconsistencia..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar inconsistencia por descripción, cama, paciente, habitación, servicio o sede"
                  />
                </div>

                <AreaSelector label="Tipo" options={TIPOS} value={tipo} onChange={handleChangeTipo} />
                <AreaSelector label="Impacto" options={IMPACTOS} value={impacto} onChange={handleChangeImpacto} />
                <AreaSelector label="Estado" options={ESTADOS} value={estadoFiltro} onChange={handleChangeEstadoFiltro} />
                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <InconsistenciasFiltrosPopover
                  servicio={filtrosAvanzados.servicio}
                  detectado={filtrosAvanzados.detectado}
                  onChange={handleAplicarFiltrosAvanzados}
                  onLimpiar={handleLimpiarFiltrosAvanzados}
                />
              </div>

              {status === 'loading' && <InconsistenciasTableSkeleton />}

              {status === 'error' && (
                <InconsistenciasEmptyState
                  icon={LuCircleAlert}
                  title="No fue posible completar la verificación."
                  ctaLabel="Reintentar"
                  onCta={handleRetry}
                />
              )}

              {status === 'ready' && total === 0 && kpiTotal === 0 && !hayFiltrosActivos && (
                <InconsistenciasEmptyState
                  icon={LuCircleCheck}
                  tone="positive"
                  title="No hay inconsistencias"
                  subtitle="El sistema no detectó problemas de integridad en la última verificación."
                  ctaLabel="Verificar nuevamente"
                  onCta={handleVerificar}
                />
              )}

              {status === 'ready' && total === 0 && (kpiTotal > 0 || hayFiltrosActivos) && (
                <InconsistenciasEmptyState
                  icon={LuSearchX}
                  title="No encontramos inconsistencias con estos criterios."
                  ctaLabel="Limpiar filtros"
                  onCta={handleLimpiarTodo}
                />
              )}

              {status === 'ready' && total > 0 && (
                <>
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th>Ubicación</th>
                          <th>Impacto</th>
                          <th>Detectado</th>
                          <th>Estado</th>
                          <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((i) => (
                          <tr key={i.id}>
                            <td className="cbi-tipo-cell">{TIPO_LABEL[i.tipo]}</td>
                            <td>
                              <span className="cell-primary">{i.titulo}</span>
                              <span className="cell-sub">{i.descripcion}</span>
                            </td>
                            <td className="cell-muted">
                              {SEDE_LABEL[i.sede]}
                              {i.servicio && <span className="cell-sub">{SERVICIO_LABEL[i.servicio]}</span>}
                            </td>
                            <td><ImpactoBadge impacto={i.impacto} /></td>
                            <td className="cell-muted">{formatHoraRelativa(i.detectadoEn)}</td>
                            <td><EstadoInconsistenciaBadge estado={i.estado} /></td>
                            <td className="col-acciones cbi-acciones-cell">
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleVer(i)}>Ver</button>
                              {i.estado === 'activa' && (
                                <button type="button" className="btn btn-primary btn-sm" onClick={() => handleCorregir(i)}>Corregir</button>
                              )}
                              <InconsistenciaRowActionsMenu
                                inconsistencia={i}
                                onVer={handleVer}
                                onCorregir={handleCorregir}
                                onIgnorar={handleIgnorar}
                                onVerHistorial={handleVerHistorial}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <InconsistenciasPagination
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onChangePage={handleChangePage}
                    onChangePageSize={handleChangePageSize}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalType === 'detalle' && (
        <InconsistenciaDetailModal
          inconsistencia={modalInconsistencia}
          onClose={handleCloseModal}
          onIgnorar={handleIgnorar}
          onCorregir={handleCorregir}
        />
      )}
      {modalType === 'corregir' && (
        <CorregirInconsistenciaModal
          inconsistencia={modalInconsistencia}
          onClose={handleCloseModal}
          onConfirm={handleConfirmCorregir}
        />
      )}
      {modalType === 'ignorar' && (
        <IgnorarInconsistenciaModal
          inconsistencia={modalInconsistencia}
          onClose={handleCloseModal}
          onConfirm={handleConfirmIgnorar}
        />
      )}
      {modalType === 'historial' && (
        <InconsistenciaHistorialModal inconsistencia={modalInconsistencia} onClose={handleCloseModal} />
      )}
      {historialVerifOpen && (
        <HistorialVerificacionesModal historial={historialVerificaciones} onClose={() => setHistorialVerifOpen(false)} />
      )}

      <div className={`cbi-toast${toast ? ' show' : ''}`}>
        <span className="cbi-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
