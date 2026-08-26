'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasLimpieza.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import LimpiezaFiltrosPopover from './LimpiezaFiltrosPopover/LimpiezaFiltrosPopover';
import LimpiezaRowActionsMenu from './LimpiezaRowActionsMenu/LimpiezaRowActionsMenu';
import IniciarLimpiezaModal from './IniciarLimpiezaModal/IniciarLimpiezaModal';
import FinalizarLimpiezaModal from './FinalizarLimpiezaModal/FinalizarLimpiezaModal';
import { EstadoLimpiezaBadge, SlaBadge } from './LimpiezaBadges/LimpiezaBadges';
import { formatHora, horaAhora } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  AREAS, AREA_LABEL, calcularSlaInfo, ESTADOS, OFFSETS, SEDES, SEDE_LABEL, SLA_MINUTOS,
  TAREAS_SEED, USUARIO_ACTUAL,
} from '@/hooks/GestionCamas/mockLimpiezaData';
import {
  LuCircleCheck, LuClock, LuEye, LuFilterX, LuSearch, LuSprayCan, LuTriangleAlert,
} from 'react-icons/lu';

// "Tiempo" vive acá adentro (dentro de "Más filtros", junto a Piso/Sector) en
// vez de ser un AreaSelector propio del filter-bar — encargo explícito de
// simplificar la franja de filtros visibles.
const FILTROS_AVANZADOS_INICIALES = { piso: 'todos', sector: 'todos', tiempo: 'todos' };

// Reconstruye `inicioTs` a partir del minutaje de ejemplo del encargo (mismo
// patrón que ACTIVIDAD_INICIAL en mockCamasData.js: ancla haceMs/tiempoMin a
// Date.now() recién al montar) — así el minutaje inicial coincide con el
// ejemplo, y a partir de ahí corre en tiempo real de verdad.
function tareaInicial(seed) {
  if (seed.estado === 'finalizada') return { ...seed };
  return { ...seed, inicioTs: Date.now() - seed.tiempoInicialMin * 60000 };
}

// Acción primaria en fila por estado (mismo criterio que
// accionPrimariaDeTarea en TaskTable.jsx, GestionEnfermeria): Pendiente →
// Iniciar limpieza, En proceso → Finalizar limpieza (CTA principal, encargo
// explícito), Finalizada → Ver detalle.
function accionPrimariaDeTarea(t) {
  if (t.estado === 'pendiente') return 'iniciar-limpieza';
  if (t.estado === 'en-proceso') return 'finalizar-limpieza';
  return 'ver-detalle';
}

// "Limpieza" — cola operativa de recuperación de camas (encargo: pantalla
// nueva de Gestión de Camas, distinta del tablero de Estados visuales en
// GestionCamas.jsx). Prioridad de lectura: tiempo transcurrido + SLA, no
// analítica histórica (eso vive en Indicadores) — mismo criterio que
// "Auditoría / Historial" siendo solo-lectura de eventos ya resueltos, acá es
// lo opuesto: una cola para ACCIONAR ahora.
export default function GestionCamasLimpieza() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [tareas, setTareas] = useState(() => TAREAS_SEED.map(tareaInicial));
  // Tick de "tiempo real" (encargo: "el contador de tiempo debe ser dinámico
  // para los registros en proceso y pendientes") — 15s alcanza para una
  // granularidad de minutos sin re-renderizar de más, mismo espíritu que el
  // tick de 1s de GestionCamas.jsx pero sin necesitar esa precisión acá.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const [query, setQuery] = useState('');
  const [sede, setSede] = useState('todas');
  const [area, setArea] = useState('todas');
  const [estado, setEstado] = useState('todos');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);
  const [modal, setModal] = useState(null); // { type: 'iniciar' | 'finalizar', id } | null

  function handleChangeSede(v) { setSede(v); }
  function handleChangeArea(v) { setArea(v); }
  function handleChangeEstado(v) { setEstado(v); }
  function handleCambioFiltroAvanzado(key, value) {
    setFiltrosAvanzados((prev) => ({ ...prev, [key]: value }));
  }
  function handleLimpiarFiltrosAvanzados() { setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES); }

  // Filas "enriquecidas" con lo que depende de `now` — Pendiente/En proceso
  // calculan tiempo transcurrido y SLA en vivo desde `inicioTs`; Finalizada
  // usa el resultado ya congelado al confirmar "Finalizar limpieza". Tabla,
  // filtros, tabs y KPIs leen SIEMPRE de acá, nunca de `tareas` crudo, para
  // no repetir este cálculo en 4 lugares distintos.
  const filas = useMemo(() => tareas.map((t) => {
    if (t.estado === 'finalizada') {
      return {
        ...t, desdeLabel: t.desdeFinalizada, elapsedMin: t.tiempoTotalMin, sla: t.slaFinal,
      };
    }
    const elapsedMin = Math.max(0, Math.floor((now - t.inicioTs) / 60000));
    return {
      ...t, desdeLabel: formatHora(t.inicioTs), elapsedMin, sla: calcularSlaInfo(elapsedMin),
    };
  }), [tareas, now]);

  // KPIs = resumen global (encargo sección 1), no el conteo de la tabla ya
  // filtrada: offset fijo (la porción "fuera de esta muestra") + conteo en
  // vivo de `filas` — al transicionar una fila, el KPI correspondiente sube/
  // baja solo, sin tocar contadores a mano en cada handler.
  const kpis = useMemo(() => {
    const pendientes = filas.filter((t) => t.estado === 'pendiente');
    const enProceso = filas.filter((t) => t.estado === 'en-proceso').length;
    const finalizadas = filas.filter((t) => t.estado === 'finalizada').length;
    // KPI "Fuera de SLA" = solo pendientes que superaron el SLA (encargo
    // sección 1, literal) — más angosto que el tab de arriba.
    const fueraSlaPendientes = pendientes.filter((t) => t.sla.estado === 'fuera-sla').length;
    return {
      pendientes: OFFSETS.pendientes + pendientes.length,
      enProceso: OFFSETS.enProceso + enProceso,
      finalizadas: OFFSETS.finalizadas + finalizadas,
      fueraSla: OFFSETS.fueraSla + fueraSlaPendientes,
    };
  }, [filas]);

  const tareasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filas.filter((t) => {
      if (sede !== 'todas' && t.sede !== sede) return false;
      if (area !== 'todas' && t.area !== area) return false;
      if (estado !== 'todos' && t.estado !== estado) return false;
      if (filtrosAvanzados.tiempo !== 'todos' && t.sla.estado !== filtrosAvanzados.tiempo) return false;
      if (filtrosAvanzados.piso !== 'todos' && t.piso !== filtrosAvanzados.piso) return false;
      if (filtrosAvanzados.sector !== 'todos' && t.sector !== filtrosAvanzados.sector) return false;
      if (!q) return true;
      return (
        t.cama.toLowerCase().includes(q)
        || (t.responsable?.nombre.toLowerCase().includes(q) ?? false)
      );
    });
  }, [filas, query, sede, area, estado, filtrosAvanzados]);

  const cantidadFiltrosActivos = (sede !== 'todas' ? 1 : 0) + (area !== 'todas' ? 1 : 0) + (estado !== 'todos' ? 1 : 0)
    + (query.trim() !== '' ? 1 : 0) + (filtrosAvanzados.tiempo !== 'todos' ? 1 : 0)
    + (filtrosAvanzados.piso !== 'todos' ? 1 : 0) + (filtrosAvanzados.sector !== 'todos' ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;
  function handleLimpiarTodo() {
    setQuery('');
    setSede('todas');
    setArea('todas');
    setEstado('todos');
    handleLimpiarFiltrosAvanzados();
  }

  function handleCloseModal() { setModal(null); }

  // Confirmar "Iniciar limpieza" (encargo sección 2): pasa a En proceso,
  // registra la hora actual como `inicioTs` (arranca el contador desde 0,
  // resetea el SLA a "en tiempo") y autoasigna al usuario actual como
  // responsable — sin flujo adicional de "Asignar responsable" en esta V1.
  function handleConfirmIniciar(id) {
    const t = tareas.find((x) => x.id === id);
    if (!t) return;
    setTareas((prev) => prev.map((x) => (x.id !== id ? x : {
      ...x, estado: 'en-proceso', inicioTs: Date.now(), responsable: USUARIO_ACTUAL,
    })));
    setModal(null);
    window.ncToast?.(`Limpieza de cama ${t.cama} iniciada — asignada a ${USUARIO_ACTUAL.nombre}.`);
  }

  // Confirmar "Finalizar limpieza" (encargo sección 3): congela el tiempo
  // total y el resultado de SLA con el valor EN VIVO de `filas` al momento de
  // confirmar (no recalcula desde `tareas` crudo) — el responsable que inició
  // la limpieza se conserva, no se pisa.
  function handleConfirmFinalizar(id) {
    const fila = filas.find((x) => x.id === id);
    if (!fila) return;
    setTareas((prev) => prev.map((x) => (x.id !== id ? x : {
      ...x,
      estado: 'finalizada',
      desdeFinalizada: fila.desdeLabel,
      completadaHora: horaAhora(),
      tiempoTotalMin: fila.elapsedMin,
      slaFinal: fila.sla,
    })));
    setModal(null);
    window.ncToast?.(`Cama ${fila.cama} lista — limpieza finalizada.`);
  }

  // Acciones secundarias del menú "⋯" (encargo sección 5: solo lectura, sin
  // pantalla propia todavía) — mismo aviso "en desarrollo" que el resto del
  // proyecto (ver ACCIONES_EN_DESARROLLO en GestionCamas.jsx).
  function handleAction(action, id) {
    const tarea = tareas.find((t) => t.id === id);
    if (!tarea) return;
    if (action === 'ver-detalle') {
      window.ncToast?.(`Detalle de limpieza de cama ${tarea.cama} (en desarrollo).`);
      return;
    }
    if (action === 'ver-historial') {
      window.ncToast?.(`Historial de cama ${tarea.cama} (en desarrollo).`);
    }
  }

  const tareaModal = modal ? filas.find((t) => t.id === modal.id) : null;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Limpieza"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbl-content">
          <GestionCamasSidebar />

          <div className="cbl-page-body">
            <div className="cbl-header">
              <div>
                <h1>Limpieza</h1>
                <p>Control y seguimiento de camas pendientes de limpieza.</p>
              </div>
            </div>

            <div className="cbl-kpi-row">
              <KpiCard icon={LuClock} label="Pendientes" value={kpis.pendientes} description="Camas esperando limpieza" variant="warning" />
              <KpiCard icon={LuSprayCan} label="En proceso" value={kpis.enProceso} description="Actualmente en limpieza" variant="info" />
              <KpiCard icon={LuCircleCheck} label="Finalizadas" value={kpis.finalizadas} description="Limpiezas completadas hoy" variant="neutral" />
              <KpiCard icon={LuTriangleAlert} label="Fuera de SLA" value={kpis.fueraSla} description="Superan los 30 min" variant="danger" />
            </div>

            <div className="card cbl-table-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar cama, paciente, HC o admisión..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Buscar cama, paciente, historia clínica o admisión"
                  />
                </div>

                <div className="filter-spacer" />

                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AreaSelector label="Área" options={AREAS} value={area} onChange={handleChangeArea} />
                <AreaSelector label="Estado" options={ESTADOS} value={estado} onChange={handleChangeEstado} />
                <LimpiezaFiltrosPopover
                  piso={filtrosAvanzados.piso}
                  sector={filtrosAvanzados.sector}
                  tiempo={filtrosAvanzados.tiempo}
                  onChange={handleCambioFiltroAvanzado}
                  onLimpiar={handleLimpiarFiltrosAvanzados}
                />
                {hayFiltrosActivos && (
                  <button type="button" className="btn btn-secondary btn-sm cbl-limpiar-filtros-btn" onClick={handleLimpiarTodo}>
                    <LuFilterX className="icon" aria-hidden="true" />
                    Limpiar filtros
                    <span className="badge-count">{cantidadFiltrosActivos}</span>
                  </button>
                )}
              </div>

              {tareasFiltradas.length === 0 ? (
                <div className="cb-empty-state">No se encontraron camas con estos filtros.</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table cbl-table">
                    <thead>
                      <tr>
                        <th>Cama</th>
                        <th>Sede</th>
                        <th>Área</th>
                        <th>Estado</th>
                        <th>Desde</th>
                        <th>Tiempo</th>
                        <th>SLA</th>
                        <th>Responsable</th>
                        <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tareasFiltradas.map((t) => {
                        const accionPrimaria = accionPrimariaDeTarea(t);
                        const fueraSla = t.sla.estado === 'fuera-sla';
                        return (
                          <tr key={t.id} className={fueraSla ? 'cbl-row-alerta' : undefined}>
                            <td>
                              <span className="cell-primary">{t.cama}</span>
                              <span className="cell-sub">{t.ubicacion}</span>
                            </td>
                            <td className="cell-muted">{SEDE_LABEL[t.sede]}</td>
                            <td className="cell-muted">{AREA_LABEL[t.area]}</td>
                            <td><EstadoLimpiezaBadge estado={t.estado} /></td>
                            <td className="cell-muted">{t.desdeLabel}</td>
                            <td>
                              {t.estado === 'finalizada' ? (
                                <>
                                  <span className="cell-primary">—</span>
                                  <span className="cell-sub">{`Completada ${t.completadaHora}`}</span>
                                </>
                              ) : (
                                <>
                                  <span className={`cell-primary${fueraSla ? ' cbl-tiempo-alerta' : ''}`}>{`${t.elapsedMin} min`}</span>
                                  <span className="cell-sub">{`Desde ${t.desdeLabel}`}</span>
                                </>
                              )}
                            </td>
                            <td><SlaBadge sla={t.sla} slaMinutos={SLA_MINUTOS} /></td>
                            <td>
                              {t.responsable ? (
                                <>
                                  {t.responsable.nombre}
                                  <span className="cell-sub">{t.responsable.rol}</span>
                                </>
                              ) : <span className="cell-muted">—</span>}
                            </td>
                            <td className="col-acciones">
                              <div className="cbl-table-actions">
                                {accionPrimaria === 'iniciar-limpieza' && (
                                  <button type="button" className="btn btn-sm btn-outline" onClick={() => setModal({ type: 'iniciar', id: t.id })}>
                                    <LuSprayCan className="icon" aria-hidden="true" />
                                    Iniciar limpieza
                                  </button>
                                )}
                                {accionPrimaria === 'finalizar-limpieza' && (
                                  <button type="button" className="btn btn-sm btn-primary" onClick={() => setModal({ type: 'finalizar', id: t.id })}>
                                    <LuCircleCheck className="icon" aria-hidden="true" />
                                    Finalizar limpieza
                                  </button>
                                )}
                                {accionPrimaria === 'ver-detalle' && (
                                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleAction('ver-detalle', t.id)}>
                                    <LuEye className="icon" aria-hidden="true" />
                                    Ver detalle
                                  </button>
                                )}
                                <LimpiezaRowActionsMenu estado={t.estado} cama={t.cama} onAction={(action) => handleAction(action, t.id)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal?.type === 'iniciar' && tareaModal && (
        <IniciarLimpiezaModal tarea={tareaModal} onClose={handleCloseModal} onConfirm={handleConfirmIniciar} />
      )}
      {modal?.type === 'finalizar' && tareaModal && (
        <FinalizarLimpiezaModal
          tarea={tareaModal}
          desdeLabel={tareaModal.desdeLabel}
          elapsedMin={tareaModal.elapsedMin}
          sla={tareaModal.sla}
          onClose={handleCloseModal}
          onConfirm={handleConfirmFinalizar}
        />
      )}
    </div>
  );
}
