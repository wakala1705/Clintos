'use client';

import { useEffect, useRef, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasAuditoria.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import TipoEventoBadge from './TipoEventoBadge/TipoEventoBadge';
import AuditoriaFiltrosPopover from './AuditoriaFiltrosPopover/AuditoriaFiltrosPopover';
import ExportarAuditoriaMenu from './ExportarAuditoriaMenu/ExportarAuditoriaMenu';
import AuditoriaPagination from './AuditoriaPagination/AuditoriaPagination';
import AuditoriaTableSkeleton from './AuditoriaTableSkeleton/AuditoriaTableSkeleton';
import AuditoriaEmptyState from './AuditoriaEmptyState/AuditoriaEmptyState';
import EventoDetailModal from './EventoDetailModal/EventoDetailModal';
import {
  EVENTOS, INDICADORES_ACTIVIDAD, MODULOS, PERIODOS, SEDES, SERVICIOS, TIPOS_EVENTO, USUARIOS,
  MODULO_LABEL, USUARIO_LABEL, fetchEventos, formatFechaHora,
} from '@/hooks/GestionCamas/mockAuditoriaData';
import {
  LuArrowDown, LuArrowUp, LuArrowUpDown, LuBedDouble, LuCalendarClock, LuCircleAlert, LuClipboardX,
  LuFileClock, LuPencilLine, LuSearch, LuSearchX, LuTrash2, LuUsers,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = { servicio: 'todos', habitacion: '' };

const COLUMNAS_ORDENABLES = [
  { key: 'fecha', label: 'Fecha / Hora' },
  { key: 'tipo', label: 'Tipo de evento' },
  null,
  null,
  { key: 'modulo', label: 'Módulo' },
  { key: 'usuario', label: 'Usuario' },
];

// "Auditoría / Historial" — registro central de TRAZABILIDAD del módulo
// (encargo: "qué ocurrió, cuándo, sobre qué entidad, quién y qué cambió").
// Inmutable por diseño (encargo sección 18): ningún componente de esta
// pantalla edita/elimina un evento, todas las acciones son de solo lectura
// (Ver detalle). Distinta de "Actividad reciente" del Bed Board (operación
// en curso) y de "Integridad" (qué está mal AHORA) — acá conviven ambas
// fuentes ya resueltas, como historial permanente (encargo sección 13).
export default function GestionCamasAuditoria() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [modulo, setModulo] = useState('todos');
  const [usuario, setUsuario] = useState('todos');
  const [sede, setSede] = useState('todas');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);
  const [periodo, setPeriodo] = useState('30d');
  const [personalizadoDesde, setPersonalizadoDesde] = useState('');
  const [personalizadoHasta, setPersonalizadoHasta] = useState('');

  const [sort, setSort] = useState({ key: 'fecha', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

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
    fetchEventos({
      dataset: EVENTOS,
      query: debouncedQuery,
      tipo,
      modulo,
      usuario,
      sede,
      servicio: filtrosAvanzados.servicio,
      habitacion: filtrosAvanzados.habitacion,
      sortKey: sort.key,
      sortDir: sort.dir,
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
  }, [debouncedQuery, tipo, modulo, usuario, sede, filtrosAvanzados, periodo, personalizadoDesde, personalizadoHasta, sort, page, pageSize, retryToken]);

  function handleChangeTipo(v) { setStatus('loading'); setPage(1); setTipo(v); }
  function handleChangeModulo(v) { setStatus('loading'); setPage(1); setModulo(v); }
  function handleChangeUsuario(v) { setStatus('loading'); setPage(1); setUsuario(v); }
  function handleChangeSede(v) { setStatus('loading'); setPage(1); setSede(v); }
  function handleChangePeriodo(v) { setStatus('loading'); setPage(1); setPeriodo(v); }
  function handleAplicarFiltrosAvanzados(next) { setStatus('loading'); setPage(1); setFiltrosAvanzados(next); }
  function handleLimpiarFiltrosAvanzados() { setStatus('loading'); setPage(1); setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES); }
  function handleChangePage(p) { setStatus('loading'); setPage(p); }
  function handleChangePageSize(n) { setStatus('loading'); setPage(1); setPageSize(n); }
  function handleSort(key) {
    setStatus('loading');
    setPage(1);
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }));
  }
  function handleLimpiarTodo() {
    setStatus('loading');
    setPage(1);
    setQuery('');
    setDebouncedQuery('');
    setTipo('todos');
    setModulo('todos');
    setUsuario('todos');
    setSede('todas');
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
  }
  function handleRetry() { setStatus('loading'); setRetryToken((t) => t + 1); }
  function handleExport(formato) {
    showToast(`Exportando historial en ${formato.toUpperCase()} (en desarrollo).`);
  }

  const hayFiltrosActivos = tipo !== 'todos' || modulo !== 'todos' || usuario !== 'todos' || sede !== 'todas'
    || query.trim() !== '' || filtrosAvanzados.servicio !== 'todos' || filtrosAvanzados.habitacion.trim() !== '';

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Auditoría / Historial"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbau-content">
          <GestionCamasSidebar />

          <div className="cbau-page-body">
            <div className="cbau-header">
              <div>
                <h1>Auditoría / Historial</h1>
                <p>Consulta los cambios y eventos registrados en el sistema de camas.</p>
              </div>
              <div className="cbau-header-actions">
                <AreaSelector label="Periodo" options={PERIODOS} value={periodo} onChange={handleChangePeriodo} />
                <ExportarAuditoriaMenu onExport={handleExport} />
              </div>
            </div>

            {periodo === 'personalizado' && (
              <div className="cbau-periodo-custom">
                <LuCalendarClock className="icon" aria-hidden="true" />
                <label>
                  Desde
                  <input type="date" value={personalizadoDesde} onChange={(e) => setPersonalizadoDesde(e.target.value)} />
                </label>
                <label>
                  Hasta
                  <input type="date" value={personalizadoHasta} onChange={(e) => setPersonalizadoHasta(e.target.value)} />
                </label>
              </div>
            )}

            <div className="card cbau-table-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar eventos, camas, usuarios..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar eventos, camas, habitaciones, usuarios o ID de evento"
                  />
                </div>
                <AreaSelector label="Tipo de evento" options={TIPOS_EVENTO} value={tipo} onChange={handleChangeTipo} />
                <AreaSelector label="Módulo" options={MODULOS} value={modulo} onChange={handleChangeModulo} />
                <AreaSelector label="Usuario" options={USUARIOS} value={usuario} onChange={handleChangeUsuario} />
                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AuditoriaFiltrosPopover
                  servicio={filtrosAvanzados.servicio}
                  habitacion={filtrosAvanzados.habitacion}
                  onChange={handleAplicarFiltrosAvanzados}
                  onLimpiar={handleLimpiarFiltrosAvanzados}
                />
              </div>

              <div className="cbau-kpi-row">
                <KpiCard icon={LuFileClock} label="Eventos totales" value={INDICADORES_ACTIVIDAD.total.toLocaleString('es-CO')} description="En el período seleccionado" variant="neutral" />
                <KpiCard icon={LuBedDouble} label="Camas afectadas" value={INDICADORES_ACTIVIDAD.camasAfectadas} description="Camas únicas" variant="neutral" />
                <KpiCard icon={LuUsers} label="Usuarios" value={INDICADORES_ACTIVIDAD.usuarios} description="Con actividad" variant="neutral" />
                <KpiCard icon={LuPencilLine} label="Modificaciones" value={INDICADORES_ACTIVIDAD.modificaciones} description={`${((INDICADORES_ACTIVIDAD.modificaciones / INDICADORES_ACTIVIDAD.total) * 100).toFixed(1)}% del total`} variant="neutral" />
                <KpiCard icon={LuTrash2} label="Eliminaciones" value={INDICADORES_ACTIVIDAD.eliminaciones} description={`${((INDICADORES_ACTIVIDAD.eliminaciones / INDICADORES_ACTIVIDAD.total) * 100).toFixed(1)}% del total`} variant="danger" />
                <KpiCard icon={LuClipboardX} label="Consultas" value={INDICADORES_ACTIVIDAD.consultas} description={`${((INDICADORES_ACTIVIDAD.consultas / INDICADORES_ACTIVIDAD.total) * 100).toFixed(1)}% del total`} variant="neutral" />
              </div>

              {status === 'loading' && <AuditoriaTableSkeleton />}

              {status === 'error' && (
                <AuditoriaEmptyState
                  icon={LuCircleAlert}
                  title="No pudimos cargar el historial."
                  ctaLabel="Reintentar"
                  onCta={handleRetry}
                />
              )}

              {status === 'ready' && total === 0 && !hayFiltrosActivos && (
                <AuditoriaEmptyState
                  icon={LuClipboardX}
                  title="No hay eventos registrados"
                  subtitle="No existen eventos de auditoría para el período seleccionado."
                  ctaLabel="Cambiar período"
                  onCta={() => handleChangePeriodo('90d')}
                />
              )}

              {status === 'ready' && total === 0 && hayFiltrosActivos && (
                <AuditoriaEmptyState
                  icon={LuSearchX}
                  title="No encontramos eventos"
                  subtitle="Intenta cambiar los filtros o ampliar el período."
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
                          {COLUMNAS_ORDENABLES.map((col, i) => (
                            col ? (
                              <th key={col.key}>
                                <button type="button" className="cbau-th-sort" onClick={() => handleSort(col.key)}>
                                  {col.label}
                                  {sort.key === col.key
                                    ? (sort.dir === 'desc' ? <LuArrowDown className="icon" /> : <LuArrowUp className="icon" />)
                                    : <LuArrowUpDown className="icon cbau-th-sort-idle" />}
                                </button>
                              </th>
                            ) : <th key={i}>{i === 2 ? 'Descripción' : 'Entidad afectada'}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((e) => (
                          <tr
                            key={e.id}
                            className="cbau-row"
                            tabIndex={0}
                            onClick={() => setEventoSeleccionado(e)}
                            onKeyDown={(ev) => {
                              if (ev.key !== 'Enter' && ev.key !== ' ') return;
                              ev.preventDefault();
                              setEventoSeleccionado(e);
                            }}
                          >
                            <td className="cell-muted">{formatFechaHora(e.fecha)}</td>
                            <td><TipoEventoBadge tipo={e.tipo} /></td>
                            <td>
                              <span className="cell-primary">{e.titulo}</span>
                              <span className="cell-sub">{e.descripcion}</span>
                            </td>
                            <td className="cell-muted">{e.entidadLabel}</td>
                            <td className="cell-muted">{MODULO_LABEL[e.modulo]}</td>
                            <td className="cell-muted">{e.usuarioLabel ?? USUARIO_LABEL[e.usuario]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <AuditoriaPagination
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

      <EventoDetailModal evento={eventoSeleccionado} onClose={() => setEventoSeleccionado(null)} />

      <div className={`cbau-toast${toast ? ' show' : ''}`}>
        <span className="cbau-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
