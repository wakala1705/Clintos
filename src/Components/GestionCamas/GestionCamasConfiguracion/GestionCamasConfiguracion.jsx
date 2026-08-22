'use client';

import { useEffect, useRef, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasConfiguracion.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import ConfigCatalogoCard from './ConfigCatalogoCard/ConfigCatalogoCard';
import CatalogoDetailModal from './CatalogoDetailModal/CatalogoDetailModal';
import CambioDetailModal from './CambioDetailModal/CambioDetailModal';
import ImportarCatalogoModal from './ImportarCatalogoModal/ImportarCatalogoModal';
import ExportarCatalogoModal from './ExportarCatalogoModal/ExportarCatalogoModal';
import RestablecerConfigModal from './RestablecerConfigModal/RestablecerConfigModal';
import DuplicarConfigModal from './DuplicarConfigModal/DuplicarConfigModal';
import ConfiguracionFiltrosPopover from './ConfiguracionFiltrosPopover/ConfiguracionFiltrosPopover';
import ConfiguracionSkeleton from './ConfiguracionSkeleton/ConfiguracionSkeleton';
import ConfiguracionEmptyState from './ConfiguracionEmptyState/ConfiguracionEmptyState';
import {
  CATALOGOS, CAMBIOS_RECIENTES_INICIALES, SEDES, SEDE_LABEL, SERVICIOS, SERVICIO_LABEL, ESTADOS,
  PUEDE_EDITAR, PUEDE_IMPORTAR, PUEDE_EXPORTAR, PUEDE_DUPLICAR, PUEDE_RESTABLECER,
  fetchConfiguracion, formatFechaHora,
} from '@/hooks/GestionCamas/mockConfiguracionData';
import {
  LuArrowRight, LuCircleAlert, LuCopy, LuDownload, LuRotateCcw, LuSearch, LuSearchX, LuUpload,
} from 'react-icons/lu';

function clonarCatalogos() {
  return CATALOGOS.map((c) => (
    c.id === 'reglas-validacion' ? { ...c, ejemplos: c.ejemplos.map((e) => ({ ...e })) } : c
  ));
}

// "Configuración" (encargo sección 22/23/24): administra los CATÁLOGOS y
// REGLAS que gobiernan Camas (registros), Integridad (detección) e
// Indicadores (análisis) — nunca esas tres cosas en sí, por eso esta
// pantalla no tiene KPIs/gráficos ni una tabla de camas individuales.
export default function GestionCamasConfiguracion() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sede, setSede] = useState('todas');
  const [servicio, setServicio] = useState('todos');
  const [estado, setEstado] = useState('todos');
  const [rango, setRango] = useState('cualquiera');

  // Copias locales mutables del mock (nunca se muta CATALOGOS/
  // CAMBIOS_RECIENTES_INICIALES directamente) — activar/desactivar una
  // regla e Importar/Restablecer/Duplicar actualizan acá, retroalimentando
  // el fetch simulado, mismo criterio que "inconsistencias" en
  // GestionCamasIntegridad.jsx.
  const [catalogos, setCatalogos] = useState(clonarCatalogos);
  const [cambiosRecientes, setCambiosRecientes] = useState(CAMBIOS_RECIENTES_INICIALES);

  const [status, setStatus] = useState('loading');
  const [catalogosItems, setCatalogosItems] = useState([]);
  const [cambiosItems, setCambiosItems] = useState([]);
  const [retryToken, setRetryToken] = useState(0);

  const [modal, setModal] = useState(null); // {type:'catalogo'|'cambio'|'importar'|'exportar'|'restablecer'|'duplicar', id}

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
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    fetchConfiguracion({
      dataset: catalogos, cambios: cambiosRecientes, query: debouncedQuery, sede, servicio, estado, rango,
    }).then(({ catalogos: nextCatalogos, cambios: nextCambios }) => {
      if (cancelled) return;
      setCatalogosItems(nextCatalogos);
      setCambiosItems(nextCambios);
      setStatus('ready');
    }).catch(() => {
      if (cancelled) return;
      setStatus('error');
    });
    return () => { cancelled = true; };
  }, [catalogos, cambiosRecientes, debouncedQuery, sede, servicio, estado, rango, retryToken]);

  function handleChangeSede(v) { setStatus('loading'); setSede(v); }
  function handleChangeServicio(v) { setStatus('loading'); setServicio(v); }
  function handleChangeEstado(v) { setStatus('loading'); setEstado(v); }
  function handleAplicarRango(v) { setStatus('loading'); setRango(v); }
  function handleLimpiarRango() { setStatus('loading'); setRango('cualquiera'); }
  function handleLimpiarTodo() {
    setStatus('loading');
    setQuery('');
    setDebouncedQuery('');
    setSede('todas');
    setServicio('todos');
    setEstado('todos');
    setRango('cualquiera');
  }
  function handleRetry() {
    setStatus('loading');
    setRetryToken((t) => t + 1);
  }

  function handleCloseModal() { setModal(null); }
  function handleOpenCatalogo(catalogo) { setModal({ type: 'catalogo', id: catalogo.id }); }
  function handleOpenCambio(cambio) { setModal({ type: 'cambio', id: cambio.id }); }

  function handleAccionNoDisponible(label) { showToast(`${label} (en desarrollo).`); }

  function registrarCambio(entry) {
    setCambiosRecientes((prev) => [{ id: `CFG-CH-${Date.now()}`, fecha: Date.now(), usuario: 'Camilo Grondona', sede: sede !== 'todas' ? sede : 'centro', estadoResultante: 'activo', ...entry }, ...prev]);
  }

  function handleToggleRegla(idx) {
    const reglas = catalogos.find((c) => c.id === 'reglas-validacion');
    const item = reglas?.ejemplos[idx];
    if (!item) return;
    setCatalogos((prev) => prev.map((c) => (
      c.id === 'reglas-validacion'
        ? { ...c, ejemplos: c.ejemplos.map((e, i) => (i === idx ? { ...e, activa: !e.activa } : e)) }
        : c
    )));
    registrarCambio({
      catalogoId: 'reglas-validacion',
      configuracion: `Regla: "${item.texto}"`,
      accion: 'Modificado',
      estadoResultante: item.activa ? 'inactivo' : 'activo',
      valorAnterior: item.activa ? 'Regla activada' : 'Regla desactivada',
      valorNuevo: item.activa ? 'Regla desactivada' : 'Regla activada',
    });
    showToast(`Regla ${item.activa ? 'desactivada' : 'activada'}.`);
  }

  function handleConfirmImportar(fileName) {
    registrarCambio({
      configuracion: `Importación de catálogos${fileName ? ` (${fileName})` : ''}`,
      accion: 'Creado',
      valorNuevo: '42 registros importados, 2 con errores.',
    });
    showToast('Catálogos importados correctamente.');
    setModal(null);
  }
  function handleConfirmExportar() {
    showToast('Exportando catálogos…');
    setModal(null);
  }
  function handleConfirmRestablecer() {
    setCatalogos(clonarCatalogos());
    registrarCambio({
      configuracion: 'Configuración de Gestión de Camas',
      accion: 'Modificado',
      valorNuevo: 'Restablecida a valores predeterminados.',
    });
    showToast('Configuración restablecida.');
    setModal(null);
  }
  function handleConfirmDuplicar({ desde, hacia, elementos }) {
    registrarCambio({
      configuracion: `Duplicación de configuración (${elementos.length} categoría${elementos.length === 1 ? '' : 's'})`,
      accion: 'Creado',
      sede: hacia,
      valorNuevo: `Copiado desde ${SEDE_LABEL[desde]}.`,
    });
    showToast(`Configuración duplicada de ${SEDE_LABEL[desde]} a ${SEDE_LABEL[hacia]}.`);
    setModal(null);
  }

  const hayFiltrosActivos = query.trim() !== '' || sede !== 'todas' || servicio !== 'todos' || estado !== 'todos' || rango !== 'cualquiera';
  const modalCatalogo = modal?.type === 'catalogo' ? catalogos.find((c) => c.id === modal.id) ?? null : null;
  const modalCambio = modal?.type === 'cambio' ? cambiosRecientes.find((c) => c.id === modal.id) ?? null : null;
  const hayAcciones = PUEDE_IMPORTAR || PUEDE_EXPORTAR || PUEDE_RESTABLECER || PUEDE_DUPLICAR;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Configuración"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbc-content">
          <GestionCamasSidebar />

          <div className="cbc-page-body">
            <div className="cbc-header">
              <div>
                <h1>Configuración de Gestión de Camas</h1>
                <p>Administra los catálogos y parámetros del sistema de camas.</p>
              </div>
            </div>

            <div className="card cbc-filterbar-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar catálogos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar catálogos por nombre, descripción o ejemplo"
                  />
                </div>
                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AreaSelector label="Servicio" options={SERVICIOS} value={servicio} onChange={handleChangeServicio} />
                <AreaSelector label="Estado" options={ESTADOS} value={estado} onChange={handleChangeEstado} />
                <ConfiguracionFiltrosPopover rango={rango} onChange={handleAplicarRango} onLimpiar={handleLimpiarRango} />
              </div>
            </div>

            {status === 'error' ? (
              <ConfiguracionEmptyState
                icon={LuCircleAlert}
                title="No fue posible cargar la configuración."
                ctaLabel="Reintentar"
                onCta={handleRetry}
              />
            ) : (
              <>
                {status === 'loading' && <ConfiguracionSkeleton variant="grid" />}

                {status === 'ready' && catalogosItems.length === 0 && (
                  <div className="cbc-grid">
                    <div className="cbc-inline-empty">
                      <LuSearchX className="icon" aria-hidden="true" />
                      No encontramos catálogos con estos filtros.
                      <button type="button" className="btn btn-secondary btn-sm" onClick={handleLimpiarTodo}>Limpiar filtros</button>
                    </div>
                  </div>
                )}

                {status === 'ready' && catalogosItems.length > 0 && (
                  <div className="cbc-grid">
                    {catalogosItems.map((c) => (
                      <ConfigCatalogoCard key={c.id} catalogo={c} onOpen={handleOpenCatalogo} />
                    ))}
                  </div>
                )}

                <div className="cbc-bottom-row">
                  <div className="card cbc-cambios-card">
                    <div className="cbc-section-title">Cambios recientes en la configuración</div>

                    {status === 'loading' && <ConfiguracionSkeleton variant="table" />}

                    {status === 'ready' && cambiosItems.length === 0 && (
                      <div className="cbc-cambios-empty">
                        {hayFiltrosActivos ? 'No encontramos cambios con estos filtros.' : 'No hay cambios recientes en la configuración.'}
                      </div>
                    )}

                    {status === 'ready' && cambiosItems.length > 0 && (
                      <div className="data-table-wrap">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Fecha / Hora</th>
                              <th>Usuario</th>
                              <th>Configuración</th>
                              <th>Acción</th>
                              <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {cambiosItems.map((c) => (
                              <tr
                                key={c.id}
                                className="cbc-row"
                                tabIndex={0}
                                onClick={() => handleOpenCambio(c)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenCambio(c); }
                                }}
                              >
                                <td className="cell-muted">{formatFechaHora(c.fecha)}</td>
                                <td className="cell-primary">{c.usuario}</td>
                                <td>{c.configuracion}</td>
                                <td className="cell-muted">{c.accion}</td>
                                <td className="col-acciones">
                                  <button type="button" className="cbc-row-ver" onClick={(e) => { e.stopPropagation(); handleOpenCambio(c); }}>
                                    Ver detalle<LuArrowRight className="icon" aria-hidden="true" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="card cbc-acciones-card">
                    <div className="cbc-section-title">Acciones rápidas</div>
                    {hayAcciones ? (
                      <div className="cbc-acciones-list">
                        {PUEDE_IMPORTAR && (
                          <button type="button" className="cbc-accion-btn" onClick={() => setModal({ type: 'importar' })}>
                            <span className="cbc-accion-icon"><LuUpload className="icon" aria-hidden="true" /></span>
                            <span className="cbc-accion-text">
                              <span className="cbc-accion-title">Importar catálogos</span>
                              <span className="cbc-accion-desc">Carga masiva de catálogos desde archivo.</span>
                            </span>
                          </button>
                        )}
                        {PUEDE_EXPORTAR && (
                          <button type="button" className="cbc-accion-btn" onClick={() => setModal({ type: 'exportar' })}>
                            <span className="cbc-accion-icon"><LuDownload className="icon" aria-hidden="true" /></span>
                            <span className="cbc-accion-text">
                              <span className="cbc-accion-title">Exportar catálogos</span>
                              <span className="cbc-accion-desc">Exporta los catálogos actuales.</span>
                            </span>
                          </button>
                        )}
                        {PUEDE_RESTABLECER && (
                          <button type="button" className="cbc-accion-btn" onClick={() => setModal({ type: 'restablecer' })}>
                            <span className="cbc-accion-icon"><LuRotateCcw className="icon" aria-hidden="true" /></span>
                            <span className="cbc-accion-text">
                              <span className="cbc-accion-title">Restablecer configuración</span>
                              <span className="cbc-accion-desc">Restaurar valores configurables por defecto.</span>
                            </span>
                          </button>
                        )}
                        {PUEDE_DUPLICAR && (
                          <button type="button" className="cbc-accion-btn" onClick={() => setModal({ type: 'duplicar' })}>
                            <span className="cbc-accion-icon"><LuCopy className="icon" aria-hidden="true" /></span>
                            <span className="cbc-accion-text">
                              <span className="cbc-accion-title">Duplicar configuración</span>
                              <span className="cbc-accion-desc">Copiar catálogos y parámetros a otra sede.</span>
                            </span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="cbc-acciones-sin-permisos">No tienes permisos para ejecutar acciones sobre la configuración.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {modal?.type === 'catalogo' && (
        <CatalogoDetailModal
          catalogo={modalCatalogo}
          onClose={handleCloseModal}
          onToggleRegla={handleToggleRegla}
          onAccionNoDisponible={handleAccionNoDisponible}
          puedeEditar={PUEDE_EDITAR}
        />
      )}
      {modal?.type === 'cambio' && (
        <CambioDetailModal cambio={modalCambio} onClose={handleCloseModal} />
      )}
      {modal?.type === 'importar' && (
        <ImportarCatalogoModal onClose={handleCloseModal} onConfirm={handleConfirmImportar} />
      )}
      {modal?.type === 'exportar' && (
        <ExportarCatalogoModal
          sede={sede}
          servicio={servicio}
          sedeLabel={SEDE_LABEL[sede]}
          servicioLabel={SERVICIO_LABEL[servicio]}
          onClose={handleCloseModal}
          onConfirm={handleConfirmExportar}
        />
      )}
      {modal?.type === 'restablecer' && (
        <RestablecerConfigModal onClose={handleCloseModal} onConfirm={handleConfirmRestablecer} />
      )}
      {modal?.type === 'duplicar' && (
        <DuplicarConfigModal onClose={handleCloseModal} onConfirm={handleConfirmDuplicar} />
      )}

      <div className={`cbc-toast${toast ? ' show' : ''}`}>
        <span className="cbc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
