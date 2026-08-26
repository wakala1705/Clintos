'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasMantenimiento.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import MantenimientoFiltrosPopover from './MantenimientoFiltrosPopover/MantenimientoFiltrosPopover';
import MantenimientoFechaSelector from './MantenimientoFechaSelector/MantenimientoFechaSelector';
import MantenimientoRowActionsMenu from './MantenimientoRowActionsMenu/MantenimientoRowActionsMenu';
import MantenimientoPagination from './MantenimientoPagination/MantenimientoPagination';
import { EstadoMantenimientoBadge, PrioridadBadge } from './MantenimientoBadges/MantenimientoBadges';
import MantenimientoDetailModal from './MantenimientoDetailModal/MantenimientoDetailModal';
import ProgramarMantenimientoModal from './ProgramarMantenimientoModal/ProgramarMantenimientoModal';
import IniciarMantenimientoModal from './IniciarMantenimientoModal/IniciarMantenimientoModal';
import FinalizarMantenimientoModal from './FinalizarMantenimientoModal/FinalizarMantenimientoModal';
import ReprogramarMantenimientoModal from './ReprogramarMantenimientoModal/ReprogramarMantenimientoModal';
import CancelarMantenimientoModal from './CancelarMantenimientoModal/CancelarMantenimientoModal';
import RegistrarObservacionModal from './RegistrarObservacionModal/RegistrarObservacionModal';
import {
  AREAS, AREA_LABEL, ESTADOS, MANTENIMIENTOS_SEED, OFFSETS, PRIORIDADES, SEDES, SEDE_LABEL,
  TIPOS, TIPO_LABEL, USUARIO_ACTUAL, formatFecha, formatHoraCorta,
} from '@/hooks/GestionCamas/mockMantenimientoData';
import {
  LuCalendarClock, LuCircleCheck, LuEye, LuFilterX, LuSearch, LuTriangleAlert, LuWrench,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = { piso: 'todos', sector: 'todos' };
const RANGO_FECHA_INICIAL = { desde: '', hasta: '' };

// `new Date('yyyy-mm-dd')` parsea como UTC y puede correrse un día según el
// huso horario del navegador — se fuerza hora local agregando "T00:00:00",
// mismo cuidado que fechaAgosto2026() en mockMantenimientoData.js.
function enRangoFecha(ts, desde, hasta) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  if (desde) {
    const dDesde = new Date(`${desde}T00:00:00`);
    if (d < dDesde) return false;
  }
  if (hasta) {
    const dHasta = new Date(`${hasta}T00:00:00`);
    if (d > dHasta) return false;
  }
  return true;
}

// "Mantenimiento" — cola de tareas de mantenimiento preventivo/correctivo
// sobre camas (encargo: pantalla nueva de Gestión de Camas, mismo esqueleto
// KPI row → filter-bar → tabla → paginación que Limpieza/Reservas). Fila
// entera clicable → abre el detalle (encargo sección 11), botón 👁 + menú
// "⋯" en la última celda (encargo sección 9, mismo patrón que BedTable.jsx).
export default function GestionCamasMantenimiento() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [mantenimientos, setMantenimientos] = useState(MANTENIMIENTOS_SEED);
  const [nextId, setNextId] = useState(MANTENIMIENTOS_SEED.length + 1);

  const [query, setQuery] = useState('');
  const [sede, setSede] = useState('todas');
  const [area, setArea] = useState('todas');
  const [tipo, setTipo] = useState('todos');
  const [estado, setEstado] = useState('todos');
  const [prioridad, setPrioridad] = useState('todas');
  const [rangoFecha, setRangoFecha] = useState(RANGO_FECHA_INICIAL);
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modal, setModal] = useState(null); // { type, id } | null

  function withReset(setter) {
    return (v) => { setter(v); setPage(1); };
  }
  const handleChangeSede = withReset(setSede);
  const handleChangeArea = withReset(setArea);
  const handleChangeTipo = withReset(setTipo);
  const handleChangeEstado = withReset(setEstado);
  const handleChangePrioridad = withReset(setPrioridad);

  function handleCambioFiltroAvanzado(key, value) {
    setFiltrosAvanzados((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }
  function handleLimpiarFiltrosAvanzados() {
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
    setPage(1);
  }
  function handleCambioFecha(key, value) {
    setRangoFecha((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }
  function handleLimpiarFecha() {
    setRangoFecha(RANGO_FECHA_INICIAL);
    setPage(1);
  }

  const kpis = useMemo(() => {
    const programados = mantenimientos.filter((m) => m.estado === 'programado').length;
    const enProceso = mantenimientos.filter((m) => m.estado === 'en-proceso').length;
    const vencidos = mantenimientos.filter((m) => m.estado === 'vencido').length;
    const finalizados = mantenimientos.filter((m) => m.estado === 'finalizado').length;
    return {
      programados: OFFSETS.programados + programados,
      enProceso: OFFSETS.enProceso + enProceso,
      vencidos: OFFSETS.vencidos + vencidos,
      finalizados: OFFSETS.finalizados + finalizados,
    };
  }, [mantenimientos]);

  const mantenimientosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mantenimientos.filter((m) => {
      if (sede !== 'todas' && m.sede !== sede) return false;
      if (area !== 'todas' && m.area !== area) return false;
      if (tipo !== 'todos' && m.tipo !== tipo) return false;
      if (estado !== 'todos' && m.estado !== estado) return false;
      if (prioridad !== 'todas' && m.prioridad !== prioridad) return false;
      if (filtrosAvanzados.piso !== 'todos' && m.piso !== filtrosAvanzados.piso) return false;
      if (filtrosAvanzados.sector !== 'todos' && m.sector !== filtrosAvanzados.sector) return false;
      if (!enRangoFecha(m.fechaProgramada, rangoFecha.desde, rangoFecha.hasta)) return false;
      if (!q) return true;
      return (
        m.cama.toLowerCase().includes(q)
        || TIPO_LABEL[m.tipo].toLowerCase().includes(q)
        || m.responsable.toLowerCase().includes(q)
      );
    });
  }, [mantenimientos, query, sede, area, tipo, estado, prioridad, filtrosAvanzados, rangoFecha]);

  const total = mantenimientosFiltrados.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginaSegura = Math.min(page, totalPages);
  const mantenimientosPagina = useMemo(
    () => mantenimientosFiltrados.slice((paginaSegura - 1) * pageSize, paginaSegura * pageSize),
    [mantenimientosFiltrados, paginaSegura, pageSize],
  );

  const cantidadFiltrosActivos = (sede !== 'todas' ? 1 : 0) + (area !== 'todas' ? 1 : 0)
    + (tipo !== 'todos' ? 1 : 0) + (estado !== 'todos' ? 1 : 0) + (prioridad !== 'todas' ? 1 : 0)
    + (query.trim() !== '' ? 1 : 0) + (filtrosAvanzados.piso !== 'todos' ? 1 : 0)
    + (filtrosAvanzados.sector !== 'todos' ? 1 : 0) + (rangoFecha.desde || rangoFecha.hasta ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;

  function handleLimpiarTodo() {
    setQuery('');
    setSede('todas');
    setArea('todas');
    setTipo('todos');
    setEstado('todos');
    setPrioridad('todas');
    handleLimpiarFiltrosAvanzados();
    handleLimpiarFecha();
  }

  function handleCloseModal() { setModal(null); }
  function abrirModal(type, id) { setModal({ type, id }); }

  function agregarEvento(id, tipoEvento, titulo, usuario, motivo) {
    setMantenimientos((prev) => prev.map((m) => (m.id !== id ? m : {
      ...m,
      historial: [
        ...m.historial,
        {
          id: `H-${m.id}-${m.historial.length + 1}`, tipo: tipoEvento, titulo, fecha: Date.now(), usuario, motivo,
        },
      ],
    })));
  }

  function handleCrear(datos) {
    const id = `MNT-${nextId}`;
    setNextId((n) => n + 1);
    const ahora = Date.now();
    setMantenimientos((prev) => [
      {
        id,
        cama: datos.cama,
        ubicacion: '—',
        piso: null,
        sector: null,
        sede: datos.sede,
        area: datos.area,
        tipo: datos.tipo,
        prioridad: datos.prioridad,
        estado: 'programado',
        fechaProgramada: datos.fechaProgramada,
        responsable: datos.responsable,
        descripcion: datos.descripcion,
        historial: [
          {
            id: `H-${id}-1`, tipo: 'creado', titulo: `Creado por ${USUARIO_ACTUAL.nombre}`, fecha: ahora, usuario: USUARIO_ACTUAL.nombre,
          },
          {
            id: `H-${id}-2`, tipo: 'programado', titulo: 'Programado', fecha: ahora, usuario: USUARIO_ACTUAL.nombre,
          },
        ],
      },
      ...prev,
    ]);
    setPage(1);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${datos.cama} programado.`);
  }

  function handleConfirmIniciar(id) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : { ...x, estado: 'en-proceso' })));
    agregarEvento(id, 'iniciado', 'Mantenimiento iniciado', USUARIO_ACTUAL.nombre);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} iniciado.`);
  }

  function handleConfirmFinalizar(id, observacion) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : { ...x, estado: 'finalizado' })));
    agregarEvento(id, 'finalizado', 'Mantenimiento finalizado', USUARIO_ACTUAL.nombre, observacion);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} finalizado.`);
  }

  function handleConfirmReprogramar(id, nuevaFecha) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    const fechaAnterior = `${formatFecha(m.fechaProgramada)} · ${formatHoraCorta(m.fechaProgramada)}`;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : {
      ...x, estado: 'programado', fechaProgramada: nuevaFecha,
    })));
    agregarEvento(id, 'reprogramado', 'Reprogramado', USUARIO_ACTUAL.nombre, `Fecha anterior: ${fechaAnterior}`);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} reprogramado.`);
  }

  function handleConfirmCancelar(id, motivo) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    setMantenimientos((prev) => prev.map((x) => (x.id !== id ? x : { ...x, estado: 'cancelado' })));
    agregarEvento(id, 'cancelado', 'Cancelado', USUARIO_ACTUAL.nombre, motivo);
    setModal(null);
    window.ncToast?.(`Mantenimiento de cama ${m.cama} cancelado.`);
  }

  function handleConfirmObservacion(id, texto) {
    const m = mantenimientos.find((x) => x.id === id);
    if (!m) return;
    agregarEvento(id, 'observacion', 'Observación registrada', USUARIO_ACTUAL.nombre, texto);
    setModal(null);
    window.ncToast?.(`Observación registrada para cama ${m.cama}.`);
  }

  // "ver-detalle" no pasa por acá: el botón 👁 llama abrirModal('detalle', ...)
  // directamente (ver JSX abajo); este handler solo cubre lo que viene del
  // menú "⋯" (MENU_ACCIONES en mockMantenimientoData.js), que nunca emite
  // esa acción.
  function handleAction(action, id) {
    if (action === 'ver-historial') { abrirModal('detalle', id); return; }
    if (action === 'iniciar-mantenimiento') { abrirModal('iniciar', id); return; }
    if (action === 'finalizar-mantenimiento') { abrirModal('finalizar', id); return; }
    if (action === 'reprogramar') { abrirModal('reprogramar', id); return; }
    if (action === 'cancelar') { abrirModal('cancelar', id); return; }
    if (action === 'registrar-observacion') { abrirModal('observacion', id); }
  }

  const mantenimientoModal = modal ? mantenimientos.find((m) => m.id === modal.id) : null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Mantenimiento"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbm-content">
          <GestionCamasSidebar />

          <div className="cbm-page-body">
            <div className="cbm-header">
              <div>
                <h1>Mantenimiento</h1>
                <p>Gestión de mantenimientos preventivos y correctivos de las camas.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => abrirModal('crear')}>
                <LuWrench className="icon" aria-hidden="true" />
                Programar mantenimiento
              </button>
            </div>

            <div className="cbm-kpi-row">
              <KpiCard icon={LuCalendarClock} label="Programados" value={kpis.programados} description="Por ejecutar" variant="info" />
              <KpiCard icon={LuWrench} label="En proceso" value={kpis.enProceso} description="Actualmente en ejecución" variant="warning" />
              <KpiCard icon={LuTriangleAlert} label="Vencidos" value={kpis.vencidos} description="Requieren atención" variant="danger" />
              <KpiCard icon={LuCircleCheck} label="Finalizados" value={kpis.finalizados} description="Completados" variant="success" />
            </div>

            <div className="card cbm-table-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar cama, mantenimiento, responsable..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                    aria-label="Buscar cama, mantenimiento o responsable"
                  />
                </div>

                <div className="filter-spacer" />

                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AreaSelector label="Área" options={AREAS} value={area} onChange={handleChangeArea} />
                <AreaSelector label="Tipo" options={TIPOS} value={tipo} onChange={handleChangeTipo} />
                <AreaSelector label="Estado" options={ESTADOS} value={estado} onChange={handleChangeEstado} />
                <AreaSelector label="Prioridad" options={PRIORIDADES} value={prioridad} onChange={handleChangePrioridad} />
                <MantenimientoFechaSelector
                  desde={rangoFecha.desde}
                  hasta={rangoFecha.hasta}
                  onChange={handleCambioFecha}
                  onLimpiar={handleLimpiarFecha}
                />
                <MantenimientoFiltrosPopover
                  piso={filtrosAvanzados.piso}
                  sector={filtrosAvanzados.sector}
                  onChange={handleCambioFiltroAvanzado}
                  onLimpiar={handleLimpiarFiltrosAvanzados}
                />
                {hayFiltrosActivos && (
                  <button type="button" className="btn btn-secondary btn-sm cbm-limpiar-filtros-btn" onClick={handleLimpiarTodo}>
                    <LuFilterX className="icon" aria-hidden="true" />
                    Limpiar filtros
                    <span className="badge-count">{cantidadFiltrosActivos}</span>
                  </button>
                )}
              </div>

              {mantenimientosPagina.length === 0 ? (
                <div className="cb-empty-state">No se encontraron mantenimientos con estos filtros.</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table cbm-table">
                    <thead>
                      <tr>
                        <th>Cama</th>
                        <th>Sede</th>
                        <th>Área</th>
                        <th>Mantenimiento</th>
                        <th>Prioridad</th>
                        <th>Fecha programada</th>
                        <th>Estado</th>
                        <th>Responsable</th>
                        <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mantenimientosPagina.map((m) => (
                        <tr
                          key={m.id}
                          className="cbm-row-clickable"
                          tabIndex={0}
                          onClick={() => abrirModal('detalle', m.id)}
                          onKeyDown={(ev) => {
                            if (ev.key !== 'Enter' && ev.key !== ' ') return;
                            ev.preventDefault();
                            abrirModal('detalle', m.id);
                          }}
                        >
                          <td>
                            <span className="cell-primary">{m.cama}</span>
                            <span className="cell-sub">{m.ubicacion}</span>
                          </td>
                          <td className="cell-muted">{SEDE_LABEL[m.sede]}</td>
                          <td className="cell-muted">{AREA_LABEL[m.area]}</td>
                          <td className="cell-muted">{TIPO_LABEL[m.tipo]}</td>
                          <td><PrioridadBadge prioridad={m.prioridad} /></td>
                          <td>
                            <span className="cell-primary">{formatFecha(m.fechaProgramada)}</span>
                            <span className="cell-sub">{formatHoraCorta(m.fechaProgramada)}</span>
                          </td>
                          <td><EstadoMantenimientoBadge estado={m.estado} /></td>
                          <td>{m.responsable}</td>
                          <td className="col-acciones" onClick={(e) => e.stopPropagation()}>
                            <div className="cbm-table-actions">
                              <button
                                type="button"
                                className="cbm-actions-menu-btn"
                                onClick={() => abrirModal('detalle', m.id)}
                                aria-label={`Ver detalle de cama ${m.cama}`}
                                title="Ver detalle"
                              >
                                <LuEye className="icon" />
                              </button>
                              <MantenimientoRowActionsMenu estado={m.estado} cama={m.cama} onAction={(action) => handleAction(action, m.id)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <MantenimientoPagination
                page={paginaSegura}
                pageSize={pageSize}
                total={total}
                onChangePage={setPage}
                onChangePageSize={(n) => { setPageSize(n); setPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      {modal?.type === 'crear' && (
        <ProgramarMantenimientoModal onClose={handleCloseModal} onSubmit={handleCrear} />
      )}
      {modal?.type === 'detalle' && mantenimientoModal && (
        <MantenimientoDetailModal
          mantenimiento={mantenimientoModal}
          onClose={handleCloseModal}
          onFinalizar={(m) => abrirModal('finalizar', m.id)}
        />
      )}
      {modal?.type === 'iniciar' && mantenimientoModal && (
        <IniciarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmIniciar} />
      )}
      {modal?.type === 'finalizar' && mantenimientoModal && (
        <FinalizarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmFinalizar} />
      )}
      {modal?.type === 'reprogramar' && mantenimientoModal && (
        <ReprogramarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmReprogramar} />
      )}
      {modal?.type === 'cancelar' && mantenimientoModal && (
        <CancelarMantenimientoModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmCancelar} />
      )}
      {modal?.type === 'observacion' && mantenimientoModal && (
        <RegistrarObservacionModal mantenimiento={mantenimientoModal} onClose={handleCloseModal} onConfirm={handleConfirmObservacion} />
      )}
    </div>
  );
}
