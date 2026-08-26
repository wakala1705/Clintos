'use client';

import { useEffect, useMemo, useState } from 'react';
import '../GestionCamas.css';
import './GestionCamasReservas.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import GestionCamasSidebar from '../GestionCamasSidebar/GestionCamasSidebar';
import FechaSelector from './FechaSelector/FechaSelector';
import ReservaFiltrosPopover from './ReservaFiltrosPopover/ReservaFiltrosPopover';
import ReservaRowActionsMenu from './ReservaRowActionsMenu/ReservaRowActionsMenu';
import ReservasPagination from './ReservasPagination/ReservasPagination';
import NuevaReservaModal from './NuevaReservaModal/NuevaReservaModal';
import EstadoReservaBadge from './EstadoReservaBadge/EstadoReservaBadge';
import { horaAhora } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  AREAS, AREA_LABEL, ESTADOS, KPIS, RESERVAS_SEED, SEDES, USUARIO_ACTUAL,
} from '@/hooks/GestionCamas/mockReservasData';
import {
  LuBan, LuBedDouble, LuCalendarClock, LuCirclePlus, LuFilterX, LuSearch, LuTriangleAlert,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = { piso: 'todos', sector: 'todos' };
// Fecha "de hoy" del universo mock (ver mockReservasData.js: los 15 registros
// de ejemplo están anchados al 26/08/2025, no al reloj real) — arrancar
// filtrado en esa fecha en vez de Date.now() evita una pantalla vacía si el
// reloj real del entorno no coincide con la fecha de ejemplo.
const FECHA_INICIAL = '2025-08-26';

function fechaISOaDDMMAAAA(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function fechaHoyDDMMAAAA() {
  const hoy = new Date();
  const d = String(hoy.getDate()).padStart(2, '0');
  const m = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${hoy.getFullYear()}`;
}

// Acción primaria en fila por estado (encargo sección 8): Pendiente →
// Confirmar, Confirmada → Utilizar, cualquier otro estado (Utilizada/
// Vencida/Cancelada) → Ver, sin menú "⋯" adicional para esos 3 últimos (ver
// MENU_ACCIONES en mockReservasData.js).
function accionPrimariaDeReserva(r) {
  if (r.estado === 'pendiente') return 'confirmar';
  if (r.estado === 'confirmada') return 'utilizar';
  return 'ver';
}

// "Reservas" — disponibilidad FUTURA de camas (encargo sección 9), distinta
// de "Camas" (estado actual) y de "Limpieza" (recuperación de disponibilidad).
// Flujo: Pendiente → Confirmada → Utilizada, con Cancelar desde Pendiente/
// Confirmada. "Utilizar" representa la transición conceptual reserva
// confirmada → asignación de cama → cama ocupada (el toast la describe; esta
// pantalla no muta el mock de GestionCamas.jsx, son datasets independientes).
export default function GestionCamasReservas() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [reservas, setReservas] = useState(RESERVAS_SEED);
  const [query, setQuery] = useState('');
  const [fecha, setFecha] = useState(FECHA_INICIAL);
  const [sede, setSede] = useState('todas');
  const [area, setArea] = useState('todas');
  const [estado, setEstado] = useState('todos');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalNueva, setModalNueva] = useState(false);

  function handleChangeSede(v) { setPage(1); setSede(v); }
  function handleChangeArea(v) { setPage(1); setArea(v); }
  function handleChangeEstado(v) { setPage(1); setEstado(v); }
  function handleChangeFecha(v) { setPage(1); setFecha(v); }
  function handleCambioFiltroAvanzado(key, value) {
    setPage(1);
    setFiltrosAvanzados((prev) => ({ ...prev, [key]: value }));
  }
  function handleLimpiarFiltrosAvanzados() { setPage(1); setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES); }
  function handleChangePageSize(n) { setPage(1); setPageSize(n); }

  const reservasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fechaDDMMAAAA = fechaISOaDDMMAAAA(fecha);
    return reservas.filter((r) => {
      if (fecha && r.inicioFecha !== fechaDDMMAAAA) return false;
      if (sede !== 'todas' && r.sede !== sede) return false;
      if (area !== 'todas' && r.area !== area) return false;
      if (estado !== 'todos' && r.estado !== estado) return false;
      if (filtrosAvanzados.piso !== 'todos' && r.piso !== filtrosAvanzados.piso) return false;
      if (filtrosAvanzados.sector !== 'todos' && r.sector !== filtrosAvanzados.sector) return false;
      if (!q) return true;
      return (
        r.paciente.toLowerCase().includes(q)
        || r.hc.toLowerCase().includes(q)
        || r.cama.toLowerCase().includes(q)
      );
    });
  }, [reservas, query, fecha, sede, area, estado, filtrosAvanzados]);

  const reservasPaginadas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return reservasFiltradas.slice(start, start + pageSize);
  }, [reservasFiltradas, page, pageSize]);

  const cantidadFiltrosActivos = (sede !== 'todas' ? 1 : 0) + (area !== 'todas' ? 1 : 0) + (estado !== 'todos' ? 1 : 0)
    + (query.trim() !== '' ? 1 : 0) + (fecha ? 1 : 0)
    + (filtrosAvanzados.piso !== 'todos' ? 1 : 0) + (filtrosAvanzados.sector !== 'todos' ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;
  function handleLimpiarTodo() {
    setPage(1);
    setQuery('');
    setFecha('');
    setSede('todas');
    setArea('todas');
    setEstado('todos');
    handleLimpiarFiltrosAvanzados();
  }

  // Dispatcher único para el CTA principal de la fila y el menú "⋯" (mismo
  // criterio que handleAction en GestionCamasLimpieza.jsx) — sin modal de
  // confirmación en esta V1 (no se pidió, a diferencia del encargo de
  // Iniciar/Finalizar limpieza).
  function handleAction(action, id) {
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) return;

    switch (action) {
      case 'confirmar':
        setReservas((prev) => prev.map((r) => (r.id !== id ? r : { ...r, estado: 'confirmada' })));
        window.ncToast?.(`Reserva de ${reserva.paciente} confirmada.`);
        return;
      case 'utilizar':
        setReservas((prev) => prev.map((r) => (r.id !== id ? r : { ...r, estado: 'utilizada' })));
        window.ncToast?.(`Cama ${reserva.cama} asignada — reserva de ${reserva.paciente} utilizada.`);
        return;
      case 'cancelar':
        setReservas((prev) => prev.map((r) => (r.id !== id ? r : { ...r, estado: 'cancelada' })));
        window.ncToast?.(`Reserva de ${reserva.paciente} cancelada.`);
        return;
      case 'ver':
        window.ncToast?.(`Detalle de la reserva de ${reserva.paciente} (en desarrollo).`);
        return;
      default:
    }
  }

  function handleSubmitNuevaReserva(datos) {
    const nueva = {
      id: `RES-${Date.now()}`,
      ...datos,
      estado: 'pendiente',
      creadaPor: USUARIO_ACTUAL.nombre,
      creadaPorRol: USUARIO_ACTUAL.rol,
      creadaElFecha: fechaHoyDDMMAAAA(),
      creadaElHora: horaAhora(),
    };
    setReservas((prev) => [nueva, ...prev]);
    setModalNueva(false);
    window.ncToast?.(`Reserva de ${nueva.paciente} creada — pendiente de confirmar.`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Reservas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cbr-content">
          <GestionCamasSidebar />

          <div className="cbr-page-body">
            <div className="cbr-header">
              <div>
                <h1>Reservas</h1>
                <p>Gestión y seguimiento de reservas de camas.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setModalNueva(true)}>
                <LuCirclePlus className="icon" aria-hidden="true" />
                Nueva reserva
              </button>
            </div>

            <div className="cbr-kpi-row">
              <KpiCard icon={LuCalendarClock} label="Pendientes" value={KPIS.pendientes} description="Reservas pendientes de confirmar" variant="info" />
              <KpiCard icon={LuBedDouble} label="Confirmadas" value={KPIS.confirmadas} description="Reservas confirmadas" variant="success" />
              <KpiCard icon={LuBedDouble} label="Utilizadas hoy" value={KPIS.utilizadasHoy} description="Reservas utilizadas hoy" variant="violet" />
              <KpiCard icon={LuTriangleAlert} label="Vencidas" value={KPIS.vencidas} description="No utilizadas a tiempo" variant="warning" />
              <KpiCard icon={LuBan} label="Canceladas" value={KPIS.canceladas} description="Reservas canceladas" variant="danger" />
            </div>

            <div className="card cbr-table-card">
              <div className="filter-bar">
                <div className="search-field">
                  <LuSearch className="icon" />
                  <input
                    type="text"
                    placeholder="Buscar paciente, HC o cama..."
                    value={query}
                    onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                    aria-label="Buscar paciente, historia clínica o cama"
                  />
                </div>

                <div className="filter-spacer" />

                <FechaSelector
                  value={fecha}
                  labelValue={fecha ? fechaISOaDDMMAAAA(fecha) : 'Todas'}
                  onChange={handleChangeFecha}
                  onLimpiar={() => handleChangeFecha('')}
                />
                <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                <AreaSelector label="Área" options={AREAS} value={area} onChange={handleChangeArea} />
                <AreaSelector label="Estado" options={ESTADOS} value={estado} onChange={handleChangeEstado} />
                <ReservaFiltrosPopover
                  piso={filtrosAvanzados.piso}
                  sector={filtrosAvanzados.sector}
                  onChange={handleCambioFiltroAvanzado}
                  onLimpiar={handleLimpiarFiltrosAvanzados}
                />
                {hayFiltrosActivos && (
                  <button type="button" className="btn btn-secondary btn-sm cbr-limpiar-filtros-btn" onClick={handleLimpiarTodo}>
                    <LuFilterX className="icon" aria-hidden="true" />
                    Limpiar filtros
                    <span className="badge-count">{cantidadFiltrosActivos}</span>
                  </button>
                )}
              </div>

              {reservasFiltradas.length === 0 ? (
                <div className="cb-empty-state">No se encontraron reservas con estos filtros.</div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table cbr-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Cama</th>
                        <th>Área</th>
                        <th>Inicio</th>
                        <th>Vencimiento</th>
                        <th>Estado</th>
                        <th>Creada por</th>
                        <th>Creada el</th>
                        <th className="col-acciones"><span className="sr-only">Acciones</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservasPaginadas.map((r) => {
                        const accionPrimaria = accionPrimariaDeReserva(r);
                        return (
                          <tr key={r.id}>
                            <td>
                              <span className="cell-primary">{r.paciente}</span>
                              <span className="cell-sub">{r.hc}</span>
                            </td>
                            <td>
                              <span className="cell-primary">{r.cama}</span>
                              <span className="cell-sub">{r.ubicacion}</span>
                            </td>
                            <td className="cell-muted">{AREA_LABEL[r.area]}</td>
                            <td>
                              <span className="cell-primary">{r.inicioHora}</span>
                              <span className="cell-sub">{r.inicioFecha}</span>
                            </td>
                            <td>
                              <span className="cell-primary">{r.vencimientoHora}</span>
                              <span className="cell-sub">{r.vencimientoFecha}</span>
                            </td>
                            <td><EstadoReservaBadge estado={r.estado} /></td>
                            <td>
                              {r.creadaPor}
                              <span className="cell-sub">{r.creadaPorRol}</span>
                            </td>
                            <td>
                              <span className="cell-primary">{r.creadaElFecha}</span>
                              <span className="cell-sub">{r.creadaElHora}</span>
                            </td>
                            <td className="col-acciones">
                              <div className="cbr-table-actions">
                                {accionPrimaria === 'confirmar' && (
                                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleAction('confirmar', r.id)}>
                                    Confirmar
                                  </button>
                                )}
                                {accionPrimaria === 'utilizar' && (
                                  <button type="button" className="btn btn-sm btn-primary" onClick={() => handleAction('utilizar', r.id)}>
                                    Utilizar
                                  </button>
                                )}
                                {accionPrimaria === 'ver' && (
                                  <button type="button" className="btn btn-sm btn-outline" onClick={() => handleAction('ver', r.id)}>
                                    Ver
                                  </button>
                                )}
                                <ReservaRowActionsMenu estado={r.estado} paciente={r.paciente} onAction={(action) => handleAction(action, r.id)} />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <ReservasPagination
                page={page}
                pageSize={pageSize}
                total={reservasFiltradas.length}
                onChangePage={setPage}
                onChangePageSize={handleChangePageSize}
              />
            </div>
          </div>
        </div>
      </div>

      {modalNueva && (
        <NuevaReservaModal onClose={() => setModalNueva(false)} onSubmit={handleSubmitNuevaReserva} />
      )}
    </div>
  );
}
