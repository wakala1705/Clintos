'use client';

import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import '../GestionCamas.css';
import './GestionCamasCamas.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import EstadoAdminBadge from './EstadoAdminBadge/EstadoAdminBadge';
import CamaRowActionsMenu from './CamaRowActionsMenu/CamaRowActionsMenu';
import CamasFiltrosPopover from './CamasFiltrosPopover/CamasFiltrosPopover';
import CamasPagination from './CamasPagination/CamasPagination';
import CamasTableSkeleton from './CamasTableSkeleton/CamasTableSkeleton';
import CamasEmptyState from './CamasEmptyState/CamasEmptyState';
import CamaFormModal from './CamaFormModal/CamaFormModal';
import CamaDetailModal from './CamaDetailModal/CamaDetailModal';
import CamaHistorialModal from './CamaHistorialModal/CamaHistorialModal';
import CambiarEstadoAdminModal from './CambiarEstadoAdminModal/CambiarEstadoAdminModal';
import {
  CAMAS, ESTADOS, SEDES, SERVICIOS, SEDE_LABEL, SERVICIO_LABEL, TIPO_LABEL,
  formatFechaHora, fetchCamas, filterCamas,
} from '@/hooks/GestionCamas/mockCamasAdminData';
import {
  LuBedDouble, LuCircleAlert, LuFilterX, LuPlus, LuSearch, LuSearchX,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = {
  habitacion: '', tipo: 'todos', piso: 'todos', sector: 'todos', fechaActualizacion: 'todas',
};

// "Camas" — maestro ADMINISTRATIVO del módulo Gestión de Camas (encargo
// completo, ver Prompt "Navegación Camas"): responde "qué camas existen y
// cómo están configuradas", nunca "qué está pasando ahora" (eso es el Bed
// Board — Mapa de camas en Gestión de Enfermería). Por eso esta pantalla no
// tiene pacientes, ocupación en vivo ni actividad en tiempo real; ver
// mockCamasAdminData.js para el porqué del estado administrativo de 4
// valores (vs. los 6 operativos del Bed Board).
export default function GestionCamasCamas() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [sede, setSede] = useState('todas');
  const [servicio, setServicio] = useState('todos');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Copia local mutable del mock (nunca se muta CAMAS directamente, mismo
  // criterio que `camas` en GestionCamas.jsx) — crear/editar/cambiar estado
  // actualizan acá, y eso retroalimenta el fetch simulado de abajo.
  const [camasState, setCamasState] = useState(CAMAS);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  const [modal, setModal] = useState(null); // {type:'crear'|'editar'|'detalle'|'historial'|'cambiar-estado', cama?}

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  // Debounce de búsqueda (~300ms, mismo criterio que Admisiones.jsx) —
  // "loading" se marca acá (async, dentro del setTimeout) o en los
  // handlers de evento de abajo, nunca de forma síncrona en el cuerpo de
  // un efecto (ver AGENTS.md / react-hooks/set-state-in-effect).
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
    fetchCamas({
      dataset: camasState,
      query: debouncedQuery,
      sede,
      servicio,
      estado: estadoFiltro,
      tipo: filtrosAvanzados.tipo,
      habitacion: filtrosAvanzados.habitacion,
      piso: filtrosAvanzados.piso,
      sector: filtrosAvanzados.sector,
      fechaActualizacion: filtrosAvanzados.fechaActualizacion,
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
  }, [camasState, debouncedQuery, sede, servicio, estadoFiltro, filtrosAvanzados, page, pageSize, retryToken]);

  function handleChangeSede(v) { setStatus('loading'); setPage(1); setSede(v); }
  function handleChangeServicio(v) { setStatus('loading'); setPage(1); setServicio(v); }
  function handleChangeEstadoFiltro(v) { setStatus('loading'); setPage(1); setEstadoFiltro(v); }
  function handleAplicarFiltrosAvanzados(next) { setStatus('loading'); setPage(1); setFiltrosAvanzados(next); }
  function handleLimpiarFiltrosAvanzados() { setStatus('loading'); setPage(1); setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES); }
  function handleChangePage(p) { setStatus('loading'); setPage(p); }
  function handleChangePageSize(n) { setStatus('loading'); setPage(1); setPageSize(n); }
  function handleLimpiarTodo() {
    setStatus('loading');
    setPage(1);
    setQuery('');
    setDebouncedQuery('');
    setSede('todas');
    setServicio('todos');
    setEstadoFiltro('todos');
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
  }
  function handleRetry() {
    setStatus('loading');
    setRetryToken((t) => t + 1);
  }

  function handleCloseModal() { setModal(null); }

  function handleCrear() { setModal({ type: 'crear' }); }
  function handleEditar(cama) { setModal({ type: 'editar', cama }); }
  function handleVerDetalle(cama) { setModal({ type: 'detalle', cama }); }
  function handleVerHistorial(cama) { setModal({ type: 'historial', cama }); }
  function handleCambiarEstado(cama) { setModal({ type: 'cambiar-estado', cama }); }
  function handleReservar(cama) { showToast(`Reservas de cama ${cama.codigo} (en desarrollo).`); }
  function handleTrasladar(cama) { showToast(`Traslados de cama ${cama.codigo} (en desarrollo).`); }
  function handleMantenimiento(cama) { showToast(`Mantenimiento de cama ${cama.codigo} (en desarrollo).`); }
  function handleLimpieza(cama) { showToast(`Limpieza de cama ${cama.codigo} (en desarrollo).`); }

  function handleSubmitForm(datos) {
    if (modal?.type === 'editar') {
      setCamasState((prev) => prev.map((c) => (c.id === modal.cama.id ? { ...c, ...datos } : c)));
      showToast(`Cama ${datos.codigo} actualizada.`);
    } else {
      const nueva = {
        id: `CAM-${Date.now()}`,
        estadoDesde: Date.now(),
        fechaCreacion: Date.now(),
        ...datos,
      };
      setCamasState((prev) => [nueva, ...prev]);
      showToast(`Cama ${datos.codigo} creada.`);
    }
    setModal(null);
  }

  function handleConfirmCambioEstado(camaId, nuevoEstado, motivo) {
    setCamasState((prev) => prev.map((c) => (c.id === camaId ? { ...c, estado: nuevoEstado, estadoDesde: Date.now(), motivo } : c)));
    const cama = camasState.find((c) => c.id === camaId);
    showToast(`Cama ${cama?.codigo} actualizada a ${nuevoEstado === 'habilitada' ? 'Habilitada' : ESTADOS.find((e) => e.value === nuevoEstado)?.label}.`);
    setModal(null);
  }

  // Un solo conteo en vez de un booleano: alimenta tanto `hayFiltrosActivos`
  // como el badge del botón "Limpiar filtros" persistente del filter-bar
  // (mismo criterio que `cantidadFiltrosActivos` en TaskListPanel.jsx) — ese
  // botón limpia TODO (sede/servicio/estado/búsqueda + filtros avanzados,
  // via `handleLimpiarTodo`), a diferencia del "Limpiar todo" que vive
  // dentro de `CamasFiltrosPopover`, que solo resetea `filtrosAvanzados`.
  const cantidadFiltrosActivos = (sede !== 'todas' ? 1 : 0) + (servicio !== 'todos' ? 1 : 0) + (estadoFiltro !== 'todos' ? 1 : 0)
    + (query.trim() !== '' ? 1 : 0) + (filtrosAvanzados.habitacion.trim() !== '' ? 1 : 0) + (filtrosAvanzados.tipo !== 'todos' ? 1 : 0)
    + (filtrosAvanzados.piso !== 'todos' ? 1 : 0) + (filtrosAvanzados.sector !== 'todos' ? 1 : 0) + (filtrosAvanzados.fechaActualizacion !== 'todas' ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  // KPIs dinámicos (encargo "KPIs dinámicos"): mismo predicado que alimenta
  // la tabla (`filterCamas`, ver mockCamasAdminData.js) pero síncrono sobre
  // `camasState` — a diferencia de `fetchCamas` (usado arriba para `items`/
  // `total` de la tabla), esto NO pasa por la simulación de latencia/fallo
  // de red: las tarjetas son instantáneas porque los datos ya están en
  // memoria (encargo, sin loading state propio para las tarjetas).
  const camasFiltradas = useMemo(() => filterCamas({
    dataset: camasState,
    query: debouncedQuery,
    sede,
    servicio,
    estado: estadoFiltro,
    tipo: filtrosAvanzados.tipo,
    habitacion: filtrosAvanzados.habitacion,
    piso: filtrosAvanzados.piso,
    sector: filtrosAvanzados.sector,
    fechaActualizacion: filtrosAvanzados.fechaActualizacion,
  }), [camasState, debouncedQuery, sede, servicio, estadoFiltro, filtrosAvanzados]);

  // Porcentajes sobre el total FILTRADO, no el global (encargo, punto 3) —
  // con 0 resultados devuelve '0%' en vez de dividir por cero (encargo,
  // punto 5: nunca NaN/Infinity). Si "Estado" ya filtra a un solo valor
  // (ej. "Habilitada"), esto no necesita un caso especial: las otras 2
  // categorías simplemente dan 0/0%, sin porcentajes contradictorios
  // (encargo, punto 4).
  const kpis = useMemo(() => {
    const kpiTotal = camasFiltradas.length;
    const habilitadas = camasFiltradas.filter((c) => c.estado === 'habilitada').length;
    const mantenimiento = camasFiltradas.filter((c) => c.estado === 'mantenimiento').length;
    const fueraServicio = camasFiltradas.filter((c) => c.estado === 'fuera-servicio').length;
    const pct = (n) => (kpiTotal > 0 ? `${((n / kpiTotal) * 100).toFixed(1)}% del total` : '0% del total');
    return {
      total: kpiTotal,
      habilitadas,
      mantenimiento,
      fueraServicio,
      habilitadasPct: pct(habilitadas),
      mantenimientoPct: pct(mantenimiento),
      fueraServicioPct: pct(fueraServicio),
    };
  }, [camasFiltradas]);

  // Variables locales en vez de leer `modal.tipo`/`modal.cama` directo
  // dentro de los `&&` de abajo — con `modal` en null eso es seguro en JS
  // puro (cortocircuito), pero el React Compiler de este proyecto (ver
  // react-hooks/purity en AGENTS.md) puede adelantar esa lectura fuera del
  // cortocircuito al memoizar, y ahí sí revienta contra `null`.
  const modalType = modal?.type ?? null;
  const modalCama = modal?.cama ?? null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Camas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cba-content">
          <GestionCamasSidebar />

          <div className="cba-page-body">
            <div className="cba-header">
              <div>
                <h1>Camas</h1>
                <p>Consulta y administra las camas registradas del hospital.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleCrear}>
                <LuPlus className="icon" aria-hidden="true" />Nueva cama
              </button>
            </div>

            <div className="cba-kpi-row">
              <KpiCard
                icon={LuBedDouble}
                label="Total de camas"
                value={kpis.total}
                description={hayFiltrosActivos ? 'Con los filtros aplicados' : 'En todas las sedes'}
                variant="neutral"
              />
              <KpiCard icon={LuBedDouble} label="Habilitadas" value={kpis.habilitadas} description={kpis.habilitadasPct} variant="neutral" />
              <KpiCard icon={LuBedDouble} label="En mantenimiento" value={kpis.mantenimiento} description={kpis.mantenimientoPct} variant="warning" />
              <KpiCard icon={LuBedDouble} label="Fuera de servicio" value={kpis.fueraServicio} description={kpis.fueraServicioPct} variant="danger" />
            </div>

            <div className="card cba-table-card">
              <div className="filter-bar">
                {/* Orden (mismo criterio que .cb-board-card en
                    GestionCamas.jsx): búsqueda al extremo izquierdo, filtros
                    agrupados al extremo derecho. Grupo propio (.cba-filters-group,
                    margin-left:auto) en vez de .filter-spacer suelto: con 4
                    controles + buscador no siempre entran en una sola línea
                    (ver AGENTS.md, breakpoint 1024px), y así el grupo entero
                    se va como unidad a la línea siguiente y se mantiene
                    pegado a la derecha en vez de partirse control por
                    control empezando desde la izquierda. */}
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar cama por código, habitación..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar cama por código, habitación, servicio o sede"
                  />
                </div>

                <div className="cba-filters-group">
                  <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                  <AreaSelector label="Servicio" options={SERVICIOS} value={servicio} onChange={handleChangeServicio} />
                  <AreaSelector label="Estado" options={ESTADOS} value={estadoFiltro} onChange={handleChangeEstadoFiltro} />
                  <CamasFiltrosPopover
                    habitacion={filtrosAvanzados.habitacion}
                    tipo={filtrosAvanzados.tipo}
                    piso={filtrosAvanzados.piso}
                    sector={filtrosAvanzados.sector}
                    fechaActualizacion={filtrosAvanzados.fechaActualizacion}
                    onChange={handleAplicarFiltrosAvanzados}
                    onLimpiar={handleLimpiarFiltrosAvanzados}
                  />
                  {/* Persistente en el filter-bar (a diferencia de "Limpiar
                      todo" dentro de CamasFiltrosPopover, que solo resetea
                      los filtros avanzados): antes, filtrar por Sede/
                      Servicio/Estado directamente en el header no dejaba
                      forma de limpiarlos sin abrir "Más filtros". */}
                  {hayFiltrosActivos && (
                    <button type="button" className="btn btn-secondary btn-sm cba-limpiar-filtros-btn" onClick={handleLimpiarTodo}>
                      <LuFilterX className="icon" aria-hidden="true" />
                      Limpiar filtros
                      <span className="badge-count">{cantidadFiltrosActivos}</span>
                    </button>
                  )}
                </div>
              </div>

              {status === 'loading' && <CamasTableSkeleton />}

              {status === 'error' && (
                <CamasEmptyState
                  icon={LuCircleAlert}
                  title="No pudimos cargar las camas."
                  ctaLabel="Reintentar"
                  onCta={handleRetry}
                />
              )}

              {status === 'ready' && total === 0 && camasState.length === 0 && (
                <CamasEmptyState
                  icon={LuBedDouble}
                  title="No hay camas registradas"
                  ctaLabel="Crear primera cama"
                  onCta={handleCrear}
                />
              )}

              {status === 'ready' && total === 0 && camasState.length > 0 && (
                <CamasEmptyState
                  icon={LuSearchX}
                  title="No encontramos camas con estos criterios."
                  subtitle={hayFiltrosActivos ? undefined : 'Prueba con otro término de búsqueda.'}
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
                          <th>Cama</th>
                          <th>Habitación</th>
                          <th>Servicio</th>
                          <th>Sede</th>
                          <th>Tipo de cama</th>
                          <th>Estado</th>
                          <th>Estado desde</th>
                          <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((c) => (
                          <tr key={c.id}>
                            <td className="cell-primary">
                              {c.codigo}
                              <span className="cell-sub">{c.nombre}</span>
                            </td>
                            <td>
                              {c.habitacionCodigo}
                              <span className="cell-sub">{c.habitacionNombre}</span>
                            </td>
                            <td className="cell-muted">{SERVICIO_LABEL[c.servicio]}</td>
                            <td className="cell-muted">{SEDE_LABEL[c.sede]}</td>
                            <td className="cell-muted">{TIPO_LABEL[c.tipo]}</td>
                            <td><EstadoAdminBadge estado={c.estado} /></td>
                            <td className="cell-muted">{formatFechaHora(c.estadoDesde)}</td>
                            <td className="col-acciones">
                              <CamaRowActionsMenu
                                cama={c}
                                onVerDetalle={handleVerDetalle}
                                onEditar={handleEditar}
                                onCambiarEstado={handleCambiarEstado}
                                onVerHistorial={handleVerHistorial}
                                onReservar={handleReservar}
                                onTrasladar={handleTrasladar}
                                onMantenimiento={handleMantenimiento}
                                onLimpieza={handleLimpieza}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <CamasPagination
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

      {(modalType === 'crear' || modalType === 'editar') && (
        <CamaFormModal
          mode={modalType}
          cama={modalCama}
          camasExistentes={camasState}
          onClose={handleCloseModal}
          onSubmit={handleSubmitForm}
        />
      )}
      {modalType === 'detalle' && (
        <CamaDetailModal
          cama={modalCama}
          onClose={handleCloseModal}
          onVerHistorialCompleto={(cama) => setModal({ type: 'historial', cama })}
        />
      )}
      {modalType === 'historial' && (
        <CamaHistorialModal cama={modalCama} onClose={handleCloseModal} />
      )}
      {modalType === 'cambiar-estado' && (
        <CambiarEstadoAdminModal
          cama={modalCama}
          onClose={handleCloseModal}
          onConfirm={handleConfirmCambioEstado}
        />
      )}

      <div className={`cba-toast${toast ? ' show' : ''}`}>
        <span className="cba-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
