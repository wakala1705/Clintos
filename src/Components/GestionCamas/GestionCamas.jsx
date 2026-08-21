'use client';

import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import './GestionCamas.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiCard from '@/Components/KpiCard/KpiCard';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import MasFiltrosPopover from './MasFiltrosPopover/MasFiltrosPopover';
import ViewToggle from './ViewToggle/ViewToggle';
import BedCard from './BedCard/BedCard';
import BedTable from './BedTable/BedTable';
import CambiarEstadoModal from './CambiarEstadoModal/CambiarEstadoModal';
import AsignarPacienteModal from './AsignarPacienteModal/AsignarPacienteModal';
import ReservarCamaModal from './ReservarCamaModal/ReservarCamaModal';
import BedDetailModal from './BedDetailModal/BedDetailModal';
import PacienteActualModal from './PacienteActualModal/PacienteActualModal';
import ActivityPanel from './ActivityPanel/ActivityPanel';
import ActivityDrawer from './ActivityPanel/ActivityDrawer/ActivityDrawer';
import UpcomingAdmissionsDrawer from './UpcomingAdmissionsDrawer/UpcomingAdmissionsDrawer';
import LastUpdated from '@/Components/GestionCamas/LastUpdated/LastUpdated';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import { horaAhora } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  ACTIVIDAD_INICIAL, AREAS, CAMAS, ESTADOS, ESTADO_LABEL, HOY_ADMISION, PISOS, PROXIMOS_INGRESOS,
  SECTORES, SEDES, TIPOS, TIPO_INGRESO_LABEL,
} from '@/hooks/GestionCamas/mockCamasData';
import {
  LuBedDouble, LuBellRing, LuCalendarClock, LuSearch, LuUser,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = {
  habitacion: '', temporal: false, reserva: false, aislamiento: false, limpieza: false, mantenimiento: false, bloqueada: false,
};

// Duración simulada de una limpieza (encargo: "comportamiento de tiempo
// real" — al vencer, la cama pasa sola a Libre, ver el efecto de tick más
// abajo). 45s en vez de los ~20min reales de una limpieza para que el
// cambio sea observable dentro de una sesión de demo, no una regla de
// negocio.
const LIMPIEZA_DURACION_MS = 45000;

// tipo de evento (Actividad reciente) por estado destino — usado por el
// modal genérico "Cambiar estado" (CambiarEstadoModal), que puede llegar a
// cualquiera de los 6 estados. Los handlers puntuales (reservar/liberar/...)
// no lo necesitan: ya saben su propio tipo de evento.
const EVENTO_POR_ESTADO = {
  libre: 'cama-liberada',
  ocupada: 'paciente-asignado',
  reservada: 'cama-reservada',
  limpieza: 'limpieza-iniciada',
  mantenimiento: 'cama-mantenimiento',
  bloqueada: 'cama-bloqueada',
};

// Acciones que hoy no tienen pantalla propia (fuera del alcance de este
// cambio, ver MENU_ACCIONES en mockCamasData.js) — mismo aviso "en
// desarrollo" que el resto del proyecto (window.ncToast, ver AGENTS.md).
const ACCIONES_EN_DESARROLLO = {
  historial: (cama) => `Historial de cama ${cama.numero} (en desarrollo).`,
  'ver-mantenimiento': (cama) => `Detalle de mantenimiento de cama ${cama.numero} (en desarrollo).`,
  // Acciones del modal "Paciente actual" (ver PacienteActualModal) — ninguna
  // tiene pantalla propia todavía: "Ver paciente" ahí es la ficha clínica
  // completa (más allá de este snapshot), distinta del "Ver paciente" que
  // dispara la propia apertura de ese modal desde BedDetailModal.
  'ver-ficha-paciente': (cama) => `Ficha clínica de ${cama.paciente?.nombre ?? 'paciente'} (en desarrollo).`,
  'ver-admision': (cama) => `Admisión ${cama.paciente?.admisionId ?? ''} (en desarrollo).`,
  'iniciar-alta': (cama) => `Alta de ${cama.paciente?.nombre ?? 'paciente'} (en desarrollo).`,
  // Traslados quedan fuera del alcance v1 (ver Bed_Management_Define.md,
  // recorte de MVP) — el CTA/menú existen, la pantalla todavía no.
  trasladar: (cama) => `Traslado de cama ${cama.numero} (en desarrollo).`,
};

// Bed Board — MVP v1 (ver Bed_Management_Define.md) evolucionado hacia un
// centro operativo: cada estado tiene una acción principal contextual (CTA
// de la tarjeta) en vez de "Cambiar estado" como botón universal; ese modal
// genérico se mueve al menú "⋯" (ver BedActionsMenu/CambiarEstadoModal).
// Los KPI superiores reflejan el inventario COMPLETO (nunca los filtros de
// abajo) — mismo criterio que `resumen` en TurnosEnfermeria.jsx.
export default function GestionCamas() {
  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  const [sede, setSede] = useState('todas');
  const [area, setArea] = useState('todas');
  const [piso, setPiso] = useState('todos');
  const [sector, setSector] = useState('todos');
  const [estado, setEstado] = useState('todos');
  const [tipo, setTipo] = useState('todos');
  const [filtrosAvanzados, setFiltrosAvanzados] = useState(FILTROS_AVANZADOS_INICIALES);
  const [query, setQuery] = useState('');
  const [view, setView] = useState('tarjetas');
  // Copia local mutable del mock (nunca se muta CAMAS directamente, mismo
  // criterio que SCHEDULE en TurnosEnfermeria.jsx).
  const [camas, setCamas] = useState(CAMAS);
  // `modal` reemplaza al viejo `modalCamaId` único: ahora hay 2 modales
  // posibles (Cambiar estado / Asignar paciente) — mismo patrón
  // `{type, camaId, ...}` que TurnosEnfermeria.jsx.
  const [modal, setModal] = useState(null);

  // ---------- Centro operativo: actividad reciente + "tiempo real" ----------
  // `activity`/`limpiezaEta` empiezan como funciones lazy (anclan `haceMs`/
  // +LIMPIEZA_DURACION_MS a Date.now() recién al montar, ver ACTIVIDAD_INICIAL
  // en mockCamasData.js) para que los "hace N min" sean correctos sin
  // importar cuándo se cargó el bundle. `now` avanza con el tick de abajo y
  // es lo único que estos componentes de solo-lectura necesitan para
  // re-renderizar sus timestamps relativos.
  const [activity, setActivity] = useState(
    () => ACTIVIDAD_INICIAL.map((e) => ({ ...e, timestamp: Date.now() - e.haceMs })),
  );
  const [limpiezaEta, setLimpiezaEta] = useState(() => {
    const map = {};
    CAMAS.filter((c) => c.estado === 'limpieza').forEach((c) => { map[c.id] = Date.now() + LIMPIEZA_DURACION_MS; });
    return map;
  });
  const [now, setNow] = useState(() => Date.now());
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => Date.now());
  const [updateStatus, setUpdateStatus] = useState('idle'); // idle | loading | error
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [ingresosDrawerOpen, setIngresosDrawerOpen] = useState(false);

  // El intervalo de tick vive en un efecto sin deps (no se re-crea en cada
  // render) — lee `camas`/`limpiezaEta` desde refs en vez de closures para
  // no quedarse con una copia vieja, mismo problema que resolvería
  // reiniciar el interval en cada cambio de estado (más simple leer por
  // ref que desmontar/remontar un setInterval 1 vez por segundo).
  const camasRef = useRef(camas);
  useEffect(() => { camasRef.current = camas; }, [camas]);
  const limpiezaEtaRef = useRef(limpiezaEta);
  useEffect(() => { limpiezaEtaRef.current = limpiezaEta; }, [limpiezaEta]);

  function pushActivity(tipo, titulo, detalle) {
    setActivity((prev) => [
      { id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, tipo, titulo, detalle, timestamp: Date.now() },
      ...prev,
    ]);
  }

  // Tick de "tiempo real" (encargo explícito, sección 7): cada segundo
  // avanza `now` (recalcula "hace N min"/ETA restante en cada tarjeta) y
  // revisa si alguna limpieza venció su ETA — si venció, la cama pasa sola a
  // Libre y eso cascada a KPIs (derivados de `camas`, ya reactivos),
  // Actividad reciente y el timestamp de "Última actualización", en ese
  // orden, tal como pide el encargo.
  useEffect(() => {
    const id = setInterval(() => {
      const nowMs = Date.now();
      setNow(nowMs);
      const vencidas = Object.entries(limpiezaEtaRef.current)
        .filter(([, eta]) => eta <= nowMs)
        .map(([camaId]) => camaId);
      if (vencidas.length === 0) return;
      vencidas.forEach((camaId) => {
        const cama = camasRef.current.find((c) => c.id === camaId);
        if (!cama || cama.estado !== 'limpieza') return; // ya se cambió a mano mientras tanto
        setCamas((prev) => prev.map((c) => (
          c.id === camaId ? {
            ...c, estado: 'libre', limpiezaDesde: undefined, ultimaLimpieza: horaAhora(),
          } : c
        )));
        pushActivity('cama-liberada', `Cama ${cama.numero} liberada`, 'La cama está disponible para asignación');
      });
      setLimpiezaEta((prev) => {
        const next = { ...prev };
        vencidas.forEach((camaId) => delete next[camaId]);
        return next;
      });
      setLastUpdatedAt(nowMs);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Botón ↻ / "Reintentar" (encargo: 4 estados — "Actualizando…"/error acá,
  // "Actualizado hace Ns"/"Actualizado ahora" ya salen de formatRelativeTime
  // según qué tan reciente sea `lastUpdatedAt`, ver LastUpdated.jsx). La
  // falla ~1 de cada 8 es deliberada, para poder demostrar el estado de
  // error sin depender de una falla real de red que este prototipo no tiene.
  function handleRefresh() {
    setUpdateStatus('loading');
    window.setTimeout(() => {
      if (Math.random() < 0.12) {
        setUpdateStatus('error');
        return;
      }
      setUpdateStatus('idle');
      const nowMs = Date.now();
      setNow(nowMs);
      setLastUpdatedAt(nowMs);
    }, 700);
  }

  function iniciarLimpieza(camaId, extra = {}) {
    mutarCama(camaId, { estado: 'limpieza', limpiezaDesde: horaAhora(), ...extra });
    setLimpiezaEta((prev) => ({ ...prev, [camaId]: Date.now() + LIMPIEZA_DURACION_MS }));
  }

  function handleAsignarCamaIngreso(ingreso) {
    setIngresosDrawerOpen(false);
    window.ncToast?.(`Asignar cama para ${TIPO_INGRESO_LABEL[ingreso.tipo].toLowerCase()} (en desarrollo).`);
  }

  // KPIs dinámicos por Sede/Área (encargo) — alcance más amplio que
  // `camasFiltradas` a propósito: Estado/Piso/Sector/Tipo/búsqueda no deben
  // achicar los KPIs (si no, "Ocupadas" siempre coincidiría con el chip de
  // Estado activo), pero Sede/Área sí definen QUÉ hospital/área se está
  // mirando, así que los KPIs deben responder a esos dos selectores.
  const camasEnAlcance = useMemo(() => camas.filter((c) => (
    (sede === 'todas' || c.sede === sede) && (area === 'todas' || c.area === area)
  )), [camas, sede, area]);

  const kpis = useMemo(() => {
    const contarPorEstado = (est) => camasEnAlcance.filter((c) => c.estado === est).length;
    const total = camasEnAlcance.length;
    const ocupadas = contarPorEstado('ocupada');
    return {
      total,
      libres: contarPorEstado('libre'),
      ocupadas,
      reservadas: contarPorEstado('reservada'),
      limpieza: contarPorEstado('limpieza'),
      mantenimiento: contarPorEstado('mantenimiento'),
      bloqueadas: contarPorEstado('bloqueada'),
      ocupacionPct: total > 0 ? Math.round((ocupadas / total) * 100) : 0,
    };
  }, [camasEnAlcance]);

  // Chips del filtro Estado (ver render) — franja siempre visible en vez del
  // FilterDropdown con popover que tenía antes (encargo: "chip-group
  // segmented"), mismos valores/labels que ya definía ESTADOS
  // (mockCamasData.js) — solo se les suma el conteo de `kpis` acá.
  // Limpieza/Mantenimiento quedan afuera de esta franja (encargo: "ya viven
  // en los filtros avanzados", ver checkboxes "Operativo de soporte" en
  // MasFiltrosPopover) para no tener dos controles distintos filtrando lo
  // mismo — siguen contando dentro de "Todos" y de los KPIs.
  const CONTEO_POR_ESTADO = {
    todos: kpis.total,
    libre: kpis.libres,
    ocupada: kpis.ocupadas,
    reservada: kpis.reservadas,
    bloqueada: kpis.bloqueadas,
  };
  const estadoOptions = ESTADOS.filter((e) => e.value !== 'limpieza' && e.value !== 'mantenimiento')
    .map((e) => ({ ...e, count: CONTEO_POR_ESTADO[e.value] }));

  const camasFiltradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    const habitacionQ = filtrosAvanzados.habitacion.trim().toLowerCase();
    return camas.filter((c) => {
      if (sede !== 'todas' && c.sede !== sede) return false;
      if (area !== 'todas' && c.area !== area) return false;
      if (piso !== 'todos' && c.piso !== piso) return false;
      if (sector !== 'todos' && c.sector !== sector) return false;
      if (estado !== 'todos' && c.estado !== estado) return false;
      if (tipo !== 'todos' && c.tipo !== tipo) return false;
      if (habitacionQ && !c.numero.toLowerCase().includes(habitacionQ)) return false;
      if (filtrosAvanzados.temporal && !c.temporal) return false;
      if (filtrosAvanzados.reserva && !c.reserva) return false;
      if (filtrosAvanzados.aislamiento && !c.aislamiento) return false;
      if (filtrosAvanzados.limpieza && c.estado !== 'limpieza') return false;
      if (filtrosAvanzados.mantenimiento && c.estado !== 'mantenimiento') return false;
      if (filtrosAvanzados.bloqueada && c.estado !== 'bloqueada') return false;
      if (!q) return true;
      return (
        c.numero.toLowerCase().includes(q)
        || (c.paciente?.nombre.toLowerCase().includes(q) ?? false)
        || (c.paciente?.hc.toLowerCase().includes(q) ?? false)
        || (c.paciente?.admision.toLowerCase().includes(q) ?? false)
      );
    });
  }, [camas, sede, area, piso, sector, estado, tipo, filtrosAvanzados, query]);

  const modalCama = modal ? camas.find((c) => c.id === modal.camaId) : null;

  function mutarCama(camaId, cambios) {
    setCamas((prev) => prev.map((c) => (c.id !== camaId ? c : { ...c, ...cambios })));
  }

  function handleCambioFiltroAvanzado(key, value) {
    setFiltrosAvanzados((prev) => ({ ...prev, [key]: value }));
  }
  // Piso/Sector/Tipo ahora viven dentro de "Más filtros" (ver render) — su
  // "Limpiar filtros" resetea todo lo que ese popover contiene, no solo los
  // checkboxes/habitación que tenía antes de agruparlos.
  function handleLimpiarFiltrosAvanzados() {
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
    setPiso('todos');
    setSector('todos');
    setTipo('todos');
  }

  function handleCloseModal() {
    setModal(null);
  }

  // Dispatcher único para el CTA principal de la tarjeta/fila Y para cada
  // ítem del menú "⋯" (encargo: ambos ejecutan la MISMA acción, solo cambia
  // de dónde se dispara) — ver CTA_PRINCIPAL/MENU_ACCIONES en
  // mockCamasData.js para qué `action` puede llegar según el estado actual.
  function handleCardAction(action, camaId) {
    const cama = camas.find((c) => c.id === camaId);
    if (!cama) return;

    if (ACCIONES_EN_DESARROLLO[action]) {
      window.ncToast?.(ACCIONES_EN_DESARROLLO[action](cama));
      return;
    }

    switch (action) {
      case 'ver-detalle':
        setModal({ type: 'ver-detalle', camaId });
        return;
      case 'ver-paciente':
        setModal({ type: 'ver-paciente', camaId });
        return;
      case 'asignar-paciente':
        setModal({ type: 'asignar-paciente', camaId });
        return;
      case 'mantenimiento':
        setModal({ type: 'cambiar-estado', camaId, presetEstado: 'mantenimiento' });
        return;
      case 'bloquear':
        setModal({ type: 'cambiar-estado', camaId, presetEstado: 'bloqueada' });
        return;
      case 'cambiar-estado':
        setModal({ type: 'cambiar-estado', camaId, presetEstado: undefined });
        return;
      case 'reservar':
        setModal({ type: 'reservar', camaId });
        return;
      case 'liberar':
        iniciarLimpieza(camaId, { paciente: null });
        pushActivity('limpieza-iniciada', `Cama ${cama.numero} en limpieza`, 'Limpieza iniciada');
        setLastUpdatedAt(Date.now());
        window.ncToast?.(`Cama ${cama.numero} liberada — pasa a limpieza.`);
        return;
      case 'utilizar-reserva':
        // Sin paciente nombrado en la reserva (encargo: "Reservada para:
        // Ingreso programado", sin nombre) no hay con qué completar la
        // mutación directa — se abre Asignar paciente en su lugar, mismo
        // modal que "Asignar paciente" en Libre, para capturar el nombre.
        if (cama.reserva?.paciente) {
          mutarCama(camaId, {
            estado: 'ocupada',
            reserva: null,
            paciente: {
              nombre: cama.reserva.paciente,
              hc: cama.reserva.hc ?? '—',
              admisionId: cama.reserva.admisionId,
              admision: HOY_ADMISION,
              horaIngreso: horaAhora(),
            },
          });
          pushActivity('paciente-asignado', `Paciente asignado a cama ${cama.numero}`, `${cama.reserva.paciente} · reserva utilizada`);
          setLastUpdatedAt(Date.now());
          window.ncToast?.(`Reserva de cama ${cama.numero} utilizada.`);
        } else {
          setModal({ type: 'asignar-paciente', camaId });
        }
        return;
      case 'cancelar-reserva':
        mutarCama(camaId, { estado: 'libre', reserva: null });
        pushActivity('cama-liberada', `Reserva de cama ${cama.numero} cancelada`, 'La cama queda libre');
        setLastUpdatedAt(Date.now());
        window.ncToast?.(`Reserva de cama ${cama.numero} cancelada.`);
        return;
      case 'finalizar-limpieza':
        mutarCama(camaId, { estado: 'libre', limpiezaDesde: undefined, ultimaLimpieza: horaAhora() });
        setLimpiezaEta((prev) => {
          if (!(camaId in prev)) return prev;
          const next = { ...prev };
          delete next[camaId];
          return next;
        });
        pushActivity('cama-liberada', `Cama ${cama.numero} liberada`, 'La cama está disponible para asignación');
        setLastUpdatedAt(Date.now());
        window.ncToast?.(`Cama ${cama.numero} lista — limpieza finalizada.`);
        return;
      case 'finalizar-mantenimiento':
        iniciarLimpieza(camaId, { mantenimientoTipo: undefined });
        pushActivity('limpieza-iniciada', `Cama ${cama.numero} en limpieza`, 'Mantenimiento finalizado');
        setLastUpdatedAt(Date.now());
        window.ncToast?.(`Mantenimiento de cama ${cama.numero} finalizado — pasa a limpieza.`);
        return;
      case 'desbloquear':
        mutarCama(camaId, { estado: 'libre', motivo: undefined });
        pushActivity('cama-liberada', `Cama ${cama.numero} habilitada`, 'La cama vuelve a estar libre');
        setLastUpdatedAt(Date.now());
        window.ncToast?.(`Cama ${cama.numero} desbloqueada.`);
        return;
      default:
    }
  }

  function handleConfirmCambioEstado(camaId, nuevoEstado, motivo) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, {
      estado: nuevoEstado,
      motivo,
      // Al salir de ocupada/reservada ya no hay paciente asociado. La
      // transición directa libre→ocupada no recolecta un paciente nuevo acá
      // (usa "Asignar paciente" para eso, ver handleAssignPaciente).
      paciente: (nuevoEstado === 'ocupada' || nuevoEstado === 'reservada') ? cama.paciente : null,
      ...(nuevoEstado === 'limpieza' ? { limpiezaDesde: horaAhora() } : {}),
    });
    if (nuevoEstado === 'limpieza') {
      setLimpiezaEta((prev) => ({ ...prev, [camaId]: Date.now() + LIMPIEZA_DURACION_MS }));
    } else {
      setLimpiezaEta((prev) => {
        if (!(camaId in prev)) return prev;
        const next = { ...prev };
        delete next[camaId];
        return next;
      });
    }
    pushActivity(EVENTO_POR_ESTADO[nuevoEstado], `Cama ${cama.numero} actualizada a ${ESTADO_LABEL[nuevoEstado]}`, motivo || 'Cambio de estado manual');
    setLastUpdatedAt(Date.now());
    setModal(null);
    window.ncToast?.(`Cama ${cama.numero} actualizada a ${ESTADO_LABEL[nuevoEstado]}.`);
  }

  function handleAssignPaciente(camaId, { nombre, hc }) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, {
      estado: 'ocupada', reserva: null, paciente: { nombre, hc, admision: HOY_ADMISION, horaIngreso: horaAhora() },
    });
    setModal(null);
    pushActivity('paciente-asignado', `Paciente asignado a cama ${cama.numero}`, `${nombre} · ${hc}`);
    setLastUpdatedAt(Date.now());
    window.ncToast?.(`${nombre} asignado a cama ${cama.numero}.`);
  }

  function handleReservar(camaId, reserva) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, { estado: 'reservada', reserva });
    setModal(null);
    pushActivity('cama-reservada', `Cama ${cama.numero} reservada`, reserva.motivo);
    setLastUpdatedAt(Date.now());
    window.ncToast?.(`Cama ${cama.numero} reservada.`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Hospitalización"
          page="Gestión de Camas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cb-content">
          <div className="cb-header">
            <div>
              <h1>Gestión de camas</h1>
              <p>Estado en tiempo real de las camas del hospital.</p>
            </div>
            <div className="cb-header-actions">
              {/* Trigger de Actividad solo visible <1024px (ver
                  .cb-activity-mobile-trigger en GestionCamas.css) — en
                  desktop la columna derecha ya está siempre visible. */}
              <button
                type="button"
                className="btn btn-secondary btn-sm cb-activity-mobile-trigger"
                onClick={() => setActivityDrawerOpen(true)}
              >
                <LuBellRing className="icon" aria-hidden="true" />
                Actividad
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIngresosDrawerOpen(true)}>
                <LuCalendarClock className="icon" aria-hidden="true" />
                Próximos ingresos · {PROXIMOS_INGRESOS.length}
              </button>
              <AreaSelector label="Sede" options={SEDES} value={sede} onChange={setSede} />
              <AreaSelector label="Área" options={AREAS} value={area} onChange={setArea} />
            </div>
          </div>

          {/* Bed Board (izquierda) + Actividad reciente (derecha, columna fija
              en desktop — encargo: "panel operativo permanente, no una
              acción"). Debajo de --bp-desktop colapsa a 1 columna y el panel
              se abre como drawer (ver .cb-activity-mobile-trigger arriba y
              @media en GestionCamas.css). */}
          <div className="cb-layout">
            <div className="cb-main">
              {/* Capacidad — hero fijo de 4 tarjetas (Reservadas sale de acá,
                  queda accesible vía el filtro Estado del filter-bar). Los
                  chips de Estados operativos ahora viven dentro del
                  filter-bar, junto al resto de filtros (ver más abajo). */}
              <div className="cb-kpi-row">
                <div className="cb-kpi-group cb-kpi-group-primary">
                    <div className="cb-kpi-group-cards">
                    <KpiCard icon={LuBedDouble} label="Total" value={kpis.total} description="Camas registradas" variant="neutral" />
                    <KpiCard icon={LuBedDouble} label="Disponibles" value={kpis.libres} description="Camas listas para asignar" variant="neutral" />
                    <KpiCard icon={LuUser} label="Ocupadas" value={kpis.ocupadas} description="Con paciente" variant="warning" />
                    <KpiCard
                      icon={LuBedDouble}
                      label="Ocupación"
                      value={`${kpis.ocupacionPct}%`}
                      description={`${kpis.ocupadas} de ${kpis.total} camas`}
                      variant="neutral"
                      progress={{ percent: kpis.ocupacionPct }}
                    />
                  </div>
                </div>
              </div>

              <div className="card cb-board-card">
                <div className="filter-bar">
                  {/* Orden (encargo): búsqueda al extremo izquierdo, filtros +
                      vista agrupados al extremo derecho. */}
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

                  {/* Estado — franja siempre visible en vez de dropdown
                      (encargo: "chip-group segmented"), única fuente de
                      `estado` (reemplaza también al viejo widget de 3 chips
                      "Estados operativos", ya cubierto acá). */}
                  <SegmentedFilterBar
                    options={estadoOptions}
                    value={estado}
                    onChange={setEstado}
                    ariaLabel="Filtrar camas por estado"
                  />
                  {/* Piso/Sector/Tipo se agrupan dentro de "Más filtros"
                      (encargo) — MasFiltrosPopover los recibe como props
                      propias, separados de `filtros`/`onChange` (esos
                      siguen siendo solo los booleanos + habitación). */}
                  <MasFiltrosPopover
                    piso={piso}
                    pisoOptions={PISOS}
                    onChangePiso={setPiso}
                    sector={sector}
                    sectorOptions={SECTORES}
                    onChangeSector={setSector}
                    tipo={tipo}
                    tipoOptions={TIPOS}
                    onChangeTipo={setTipo}
                    filtros={filtrosAvanzados}
                    onChange={handleCambioFiltroAvanzado}
                    onLimpiar={handleLimpiarFiltrosAvanzados}
                  />

                  <ViewToggle view={view} onChange={setView} />
                </div>

                {camasFiltradas.length === 0 ? (
                  <div className="cb-empty-state">No se encontraron camas con estos filtros.</div>
                ) : (
                  <div className="cb-body-wrap">
                    {view === 'tabla' ? (
                      <BedTable camas={camasFiltradas} onAction={handleCardAction} />
                    ) : (
                      <div className="cb-grid">
                        {camasFiltradas.map((c) => (
                          <BedCard key={c.id} cama={c} onAction={handleCardAction} etaTimestamp={limpiezaEta[c.id]} now={now} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="cb-board-footer">
                  <LastUpdated status={updateStatus} lastUpdatedAt={lastUpdatedAt} now={now} onRefresh={handleRefresh} />
                </div>
              </div>
            </div>

            <ActivityPanel eventos={activity} now={now} onVerTodo={() => setActivityDrawerOpen(true)} />
          </div>
        </div>
      </div>

      {modal?.type === 'cambiar-estado' && modalCama && (
        <CambiarEstadoModal
          cama={modalCama}
          presetEstado={modal.presetEstado}
          onClose={handleCloseModal}
          onConfirm={handleConfirmCambioEstado}
        />
      )}
      {modal?.type === 'asignar-paciente' && modalCama && (
        <AsignarPacienteModal
          cama={modalCama}
          onClose={handleCloseModal}
          onAssign={handleAssignPaciente}
        />
      )}
      {modal?.type === 'reservar' && modalCama && (
        <ReservarCamaModal
          cama={modalCama}
          onClose={handleCloseModal}
          onReservar={handleReservar}
        />
      )}
      {modal?.type === 'ver-detalle' && modalCama && (
        <BedDetailModal
          cama={modalCama}
          activity={activity}
          now={now}
          etaTimestamp={limpiezaEta[modalCama.id]}
          onClose={handleCloseModal}
          onAction={handleCardAction}
          onVerActividad={() => setActivityDrawerOpen(true)}
        />
      )}
      {modal?.type === 'ver-paciente' && modalCama?.paciente && (
        <PacienteActualModal
          cama={modalCama}
          onClose={handleCloseModal}
          onAction={handleCardAction}
        />
      )}

      <ActivityDrawer open={activityDrawerOpen} eventos={activity} now={now} onClose={() => setActivityDrawerOpen(false)} />
      <UpcomingAdmissionsDrawer
        open={ingresosDrawerOpen}
        ingresos={PROXIMOS_INGRESOS}
        onClose={() => setIngresosDrawerOpen(false)}
        onAsignar={handleAsignarCamaIngreso}
      />
    </div>
  );
}
