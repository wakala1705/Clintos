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
import BloquearCamaModal from './BloquearCamaModal/BloquearCamaModal';
import TrasladarCamaModal from './TrasladarCamaModal/TrasladarCamaModal';
import BedDetailModal from './BedDetailModal/BedDetailModal';
import HistorialCamaModal from './HistorialCamaModal/HistorialCamaModal';
import DesactivarCamaModal from './DesactivarCamaModal/DesactivarCamaModal';
import PacienteActualModal from './PacienteActualModal/PacienteActualModal';
import NuevaCamaModal from './NuevaCamaModal/NuevaCamaModal';
import GestionCamasSidebar from './GestionCamasSidebar/GestionCamasSidebar';
import CamasPagination from './CamasPagination/CamasPagination';
import { horaAhora } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  ACTIVIDAD_INICIAL, AREAS, CAMAS, ESTADOS, ESTADO_LABEL, HOY_ADMISION, PISOS,
  SECTORES, SEDES, TIPOS,
} from '@/hooks/GestionCamas/mockCamasData';
import {
  LuBedDouble, LuFilterX, LuPlus, LuSearch, LuUser,
} from 'react-icons/lu';

// Solo `habitacion` — Temporal/Con reserva/Aislamiento/Bloqueada/Limpieza/
// Mantenimiento se quitaron de "Más filtros" (salvo Temporal/Con reserva,
// duplicaban valores que ya cubre el filtro "Estado", ver MasFiltrosPopover.jsx).
const FILTROS_AVANZADOS_INICIALES = {
  habitacion: '',
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
// 'historial' ya no vive acá — tiene pantalla propia (HistorialCamaModal).
const ACCIONES_EN_DESARROLLO = {
  'ver-mantenimiento': (cama) => `Detalle de mantenimiento de cama ${cama.numero} (en desarrollo).`,
  // Acciones del modal "Paciente actual" (ver PacienteActualModal) — ninguna
  // tiene pantalla propia todavía: "Ver paciente" ahí es la ficha clínica
  // completa (más allá de este snapshot), distinta del "Ver paciente" que
  // dispara la propia apertura de ese modal desde BedDetailModal.
  'ver-ficha-paciente': (cama) => `Ficha clínica de ${cama.paciente?.nombre ?? 'paciente'} (en desarrollo).`,
  'ver-admision': (cama) => `Admisión ${cama.paciente?.admisionId ?? ''} (en desarrollo).`,
  'iniciar-alta': (cama) => `Alta de ${cama.paciente?.nombre ?? 'paciente'} (en desarrollo).`,
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
  // Default "tabla" (Lista) — encargo explícito, a diferencia del resto del
  // Bed Board que arrancaba en tarjetas.
  const [view, setView] = useState('tabla');
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
  // Libre y eso cascada a KPIs (derivados de `camas`, ya reactivos) y
  // Actividad reciente, en ese orden.
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
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function iniciarLimpieza(camaId, extra = {}) {
    mutarCama(camaId, { estado: 'limpieza', limpiezaDesde: horaAhora(), ...extra });
    setLimpiezaEta((prev) => ({ ...prev, [camaId]: Date.now() + LIMPIEZA_DURACION_MS }));
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
    const total = camasEnAlcance.length;
    const ocupadas = camasEnAlcance.filter((c) => c.estado === 'ocupada').length;
    return {
      total,
      libres: camasEnAlcance.filter((c) => c.estado === 'libre').length,
      ocupadas,
      ocupacionPct: total > 0 ? Math.round((ocupadas / total) * 100) : 0,
    };
  }, [camasEnAlcance]);

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
      if (!q) return true;
      return (
        c.numero.toLowerCase().includes(q)
        || (c.paciente?.nombre.toLowerCase().includes(q) ?? false)
        || (c.paciente?.hc.toLowerCase().includes(q) ?? false)
        || (c.paciente?.admision.toLowerCase().includes(q) ?? false)
      );
    });
  }, [camas, sede, area, piso, sector, estado, tipo, filtrosAvanzados, query]);

  // Paginación (mismo componente/patrón que "Camas" admin, ver
  // CamasPagination.jsx) — client-side acá (a diferencia de fetchCamas en
  // GestionCamasCamas.jsx) porque este tablero ya tiene todo `camas` en
  // memoria, sin simulación de latencia/red de por medio.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const camasPaginadas = useMemo(() => {
    const start = (page - 1) * pageSize;
    return camasFiltradas.slice(start, start + pageSize);
  }, [camasFiltradas, page, pageSize]);
  function handleChangePageSize(n) {
    setPageSize(n);
    setPage(1);
  }
  // `page` se resetea a 1 en cada handler que cambia un filtro (nunca en un
  // efecto — react-hooks/set-state-in-effect, mismo criterio que
  // handleChangeSede/handleChangeEstadoFiltro en GestionCamasCamas.jsx).
  function handleChangeSede(v) { setPage(1); setSede(v); }
  function handleChangeArea(v) { setPage(1); setArea(v); }
  function handleChangeEstado(v) { setPage(1); setEstado(v); }
  function handleChangeQuery(v) { setPage(1); setQuery(v); }
  function handleChangePiso(v) { setPage(1); setPiso(v); }
  function handleChangeSector(v) { setPage(1); setSector(v); }
  function handleChangeTipo(v) { setPage(1); setTipo(v); }

  const modalCama = modal ? camas.find((c) => c.id === modal.camaId) : null;

  function mutarCama(camaId, cambios) {
    setCamas((prev) => prev.map((c) => (c.id !== camaId ? c : { ...c, ...cambios })));
  }

  function handleCambioFiltroAvanzado(key, value) {
    setPage(1);
    setFiltrosAvanzados((prev) => ({ ...prev, [key]: value }));
  }
  // Piso/Sector/Tipo ahora viven dentro de "Más filtros" (ver render) — su
  // "Limpiar filtros" resetea todo lo que ese popover contiene, no solo los
  // checkboxes/habitación que tenía antes de agruparlos.
  function handleLimpiarFiltrosAvanzados() {
    setPage(1);
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
    setPiso('todos');
    setSector('todos');
    setTipo('todos');
  }
  // Botón "Limpiar filtros" persistente del filter-bar (mismo criterio que
  // handleLimpiarTodo en GestionCamasCamas.jsx) — limpia TODO (Sede/Área/
  // Estado/búsqueda + los de "Más filtros"), a diferencia de
  // handleLimpiarFiltrosAvanzados de arriba, que solo resetea ese popover.
  const cantidadFiltrosActivos = (sede !== 'todas' ? 1 : 0) + (area !== 'todas' ? 1 : 0) + (estado !== 'todos' ? 1 : 0)
    + (query.trim() !== '' ? 1 : 0) + (piso !== 'todos' ? 1 : 0) + (sector !== 'todos' ? 1 : 0) + (tipo !== 'todos' ? 1 : 0)
    + (filtrosAvanzados.habitacion.trim() !== '' ? 1 : 0);
  const hayFiltrosActivos = cantidadFiltrosActivos > 0;
  function handleLimpiarTodo() {
    setQuery('');
    setSede('todas');
    setArea('todas');
    setEstado('todos');
    handleLimpiarFiltrosAvanzados();
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
      case 'historial':
        setModal({ type: 'historial', camaId });
        return;
      case 'editar':
        setModal({ type: 'editar-cama', camaId });
        return;
      case 'ver-paciente':
        setModal({ type: 'ver-paciente', camaId });
        return;
      case 'asignar-paciente':
        setModal({ type: 'asignar-paciente', camaId });
        return;
      case 'trasladar':
        setModal({ type: 'trasladar', camaId });
        return;
      case 'mantenimiento':
        setModal({ type: 'cambiar-estado', camaId, presetEstado: 'mantenimiento' });
        return;
      // Atajo directo a "Cambiar estado" preseleccionado en Limpieza (mismo
      // patrón que 'mantenimiento') — solo llega acá desde Libre (único
      // estado con esta entrada en el menú, ver MENU_ACCIONES en
      // mockCamasData.js); Ocupada/Mantenimiento ya resuelven esta misma
      // transición vía 'liberar'/'finalizar-mantenimiento'.
      case 'limpieza':
        setModal({ type: 'cambiar-estado', camaId, presetEstado: 'limpieza' });
        return;
      // Modal dedicado (encargo sección 19), a diferencia de 'mantenimiento'/
      // 'limpieza' arriba: Motivo es un catálogo cerrado + Fecha inicio/
      // Fecha fin/Observación propios, no el genérico "Cambiar estado" (ver
      // BloquearCamaModal.jsx).
      case 'bloquear':
        setModal({ type: 'bloquear', camaId });
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
          window.ncToast?.(`Reserva de cama ${cama.numero} utilizada.`);
        } else {
          setModal({ type: 'asignar-paciente', camaId });
        }
        return;
      case 'cancelar-reserva':
        mutarCama(camaId, { estado: 'libre', reserva: null });
        pushActivity('cama-liberada', `Reserva de cama ${cama.numero} cancelada`, 'La cama queda libre');
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
        window.ncToast?.(`Cama ${cama.numero} lista — limpieza finalizada.`);
        return;
      case 'finalizar-mantenimiento':
        iniciarLimpieza(camaId, { mantenimientoTipo: undefined });
        pushActivity('limpieza-iniciada', `Cama ${cama.numero} en limpieza`, 'Mantenimiento finalizado');
        window.ncToast?.(`Mantenimiento de cama ${cama.numero} finalizado — pasa a limpieza.`);
        return;
      case 'desbloquear':
        mutarCama(camaId, { estado: 'libre', motivo: undefined, bloqueo: undefined });
        pushActivity('cama-liberada', `Cama ${cama.numero} habilitada`, 'La cama vuelve a estar libre');
        window.ncToast?.(`Cama ${cama.numero} desbloqueada.`);
        return;
      case 'desactivar':
        setModal({ type: 'desactivar', camaId });
        return;
      // Sin modal de confirmación (mismo criterio que 'desbloquear' arriba)
      // — la confirmación con motivo obligatorio ya se hizo al desactivar,
      // reactivar no la repite (encargo #30 solo describe el diálogo para
      // desactivar).
      case 'activar':
        mutarCama(camaId, { estado: 'libre', motivo: undefined });
        pushActivity('cama-activada', `Cama ${cama.numero} activada`, 'La cama vuelve a estar disponible');
        window.ncToast?.(`Cama ${cama.numero} activada.`);
        return;
      default:
    }
  }

  // Activar/desactivar cama (encargo #30): nunca DELETE — pasa a
  // `estado: 'inactiva'` con el motivo capturado en DesactivarCamaModal,
  // mismo mecanismo de soft-delete que ya usa Bloqueada.
  function handleConfirmDesactivar(camaId, motivo) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, { estado: 'inactiva', motivo });
    setModal(null);
    pushActivity('cama-desactivada', `Cama ${cama.numero} desactivada`, motivo);
    window.ncToast?.(`Cama ${cama.numero} desactivada.`);
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
    window.ncToast?.(`${nombre} asignado a cama ${cama.numero}.`);
  }

  function handleReservar(camaId, reserva) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, { estado: 'reservada', reserva });
    setModal(null);
    pushActivity('cama-reservada', `Cama ${cama.numero} reservada`, reserva.motivo);
    window.ncToast?.(`Cama ${cama.numero} reservada.`);
  }

  // "Bloquear cama" (encargo sección 19) — `motivo` queda en el campo plano
  // compartido con 'desactivar' (mismo criterio que ya usaba el atajo viejo
  // vía CambiarEstadoModal, ver BedDetailModal.jsx/mockHistorialCamaData.js);
  // fechaInicio/fechaFin/observacion van agrupados en `bloqueo` porque son
  // exclusivos de este estado (mismo criterio que `reserva` arriba). Nunca
  // queda con paciente asociado, mismo motivo que handleConfirmCambioEstado.
  function handleConfirmBloqueo(camaId, {
    motivo, fechaInicio, fechaFin, observacion,
  }) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, {
      estado: 'bloqueada', motivo, bloqueo: { fechaInicio, fechaFin, observacion }, paciente: null,
    });
    setModal(null);
    pushActivity(EVENTO_POR_ESTADO.bloqueada, `Cama ${cama.numero} bloqueada`, motivo);
    window.ncToast?.(`Cama ${cama.numero} bloqueada.`);
  }

  // La cama de origen sigue el mismo criterio que "Liberar" (case 'liberar'
  // más arriba): nunca queda Libre directo, pasa por Limpieza primero (vía
  // iniciarLimpieza, que ya trae su propio limpiezaEta). La de destino
  // hereda el `paciente` completo tal cual, sin recalcular horaIngreso — esa
  // fecha sigue siendo la de ingreso al hospital, no la de este traslado
  // puntual entre camas.
  function handleConfirmTraslado(camaOrigenId, camaDestinoId, fecha) {
    const camaOrigen = camas.find((c) => c.id === camaOrigenId);
    const camaDestino = camas.find((c) => c.id === camaDestinoId);
    if (!camaOrigen || !camaDestino) return;
    const { paciente } = camaOrigen;
    mutarCama(camaDestinoId, { estado: 'ocupada', reserva: null, paciente });
    iniciarLimpieza(camaOrigenId, { paciente: null });
    setModal(null);
    const fechaTexto = new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    pushActivity('traslado', `Paciente trasladado de cama ${camaOrigen.numero} a ${camaDestino.numero}`, `${paciente?.nombre ?? 'Paciente'} · ${fechaTexto}`);
    window.ncToast?.(`${paciente?.nombre ?? 'Paciente'} trasladado a cama ${camaDestino.numero}.`);
  }

  // Misma lógica que "Nueva cama" en GestionCamasCamas.jsx (encargo):
  // formulario validado en modal (NuevaCamaModal) → arma el registro
  // completo → lo antepone a `camas` (nunca muta CAMAS directamente, mismo
  // criterio que handleSubmitForm en GestionCamasCamas.jsx) → toast.
  function handleNuevaCama() {
    setModal({ type: 'nueva-cama' });
  }

  // `datos.estadoInicial` llega validado contra ESTADO_INICIAL_OPTIONS (sin
  // ocupada/reservada, ver NuevaCamaModal.jsx) — si nace en limpieza, se
  // engancha al mismo tick de "tiempo real" que `iniciarLimpieza` (si no,
  // quedaría atascada en limpieza para siempre, a diferencia de cualquier
  // otra cama que entra a ese estado). `keepOpen` (desde "Guardar y crear
  // otra") deja el modal abierto — NuevaCamaModal ya se resetea solo.
  function handleSubmitNuevaCama(datos, { keepOpen } = {}) {
    const { estadoInicial, ...resto } = datos;
    const nueva = {
      id: `CAM-${Date.now()}`,
      ...resto,
      estado: estadoInicial,
      paciente: null,
      reserva: null,
      motivo: undefined,
      limpiezaDesde: estadoInicial === 'limpieza' ? horaAhora() : undefined,
      mantenimientoTipo: estadoInicial === 'mantenimiento' ? (datos.observaciones ?? undefined) : undefined,
      ultimaLimpieza: undefined,
      aislamiento: false,
    };
    setCamas((prev) => [nueva, ...prev]);
    if (estadoInicial === 'limpieza') {
      setLimpiezaEta((prev) => ({ ...prev, [nueva.id]: Date.now() + LIMPIEZA_DURACION_MS }));
    }
    pushActivity('cama-liberada', `Cama ${nueva.numero} registrada`, 'Nueva cama creada');
    window.ncToast?.(`Cama ${nueva.numero} creada.`);
    if (!keepOpen) setModal(null);
  }

  // Mismo NuevaCamaModal, en modo edición (prop `cama`) — el payload no
  // trae `estadoInicial` (esa sección va oculta, ver NuevaCamaModal.jsx), así
  // que acá solo se pisan los datos maestros y estado/paciente/reserva/etc.
  // de la cama existente quedan intactos.
  function handleSubmitEditarCama(camaId, datos) {
    mutarCama(camaId, datos);
    pushActivity('cama-liberada', `Cama ${datos.numero} actualizada`, 'Datos de la cama editados');
    window.ncToast?.(`Cama ${datos.numero} actualizada.`);
    setModal(null);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Procesos', { label: 'Gestión de Camas', href: '/gestion-camas' }]}
          page="Camas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cb-content">
          <GestionCamasSidebar />

          <div className="cb-page-body">
            <div className="cb-header">
              <div>
                <h1>Camas</h1>
                <p>Estado en tiempo real de las camas del hospital.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={handleNuevaCama}>
                <LuPlus className="icon" aria-hidden="true" />
                Nueva cama
              </button>
            </div>

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
                        onChange={(e) => handleChangeQuery(e.target.value)}
                        aria-label="Buscar cama, paciente, historia clínica o admisión"
                      />
                    </div>

                    <div className="filter-spacer" />

                    <AreaSelector label="Sede" options={SEDES} value={sede} onChange={handleChangeSede} />
                    <AreaSelector label="Área" options={AREAS} value={area} onChange={handleChangeArea} />
                    <AreaSelector label="Estado" options={ESTADOS} value={estado} onChange={handleChangeEstado} />
                    {/* Piso/Sector/Tipo se agrupan dentro de "Más filtros"
                        (encargo) — MasFiltrosPopover los recibe como props
                        propias, separados de `filtros`/`onChange` (esos
                        siguen siendo solo los booleanos + habitación). */}
                    <MasFiltrosPopover
                      piso={piso}
                      pisoOptions={PISOS}
                      onChangePiso={handleChangePiso}
                      sector={sector}
                      sectorOptions={SECTORES}
                      onChangeSector={handleChangeSector}
                      tipo={tipo}
                      tipoOptions={TIPOS}
                      onChangeTipo={handleChangeTipo}
                      filtros={filtrosAvanzados}
                      onChange={handleCambioFiltroAvanzado}
                      onLimpiar={handleLimpiarFiltrosAvanzados}
                    />
                    {/* Persistente en el filter-bar (a diferencia de "Limpiar
                        todo" dentro de MasFiltrosPopover, que solo resetea
                        los filtros avanzados) — mismo patrón que
                        .cba-limpiar-filtros-btn en GestionCamasCamas.jsx. */}
                    {hayFiltrosActivos && (
                      <button type="button" className="btn btn-secondary btn-sm cb-limpiar-filtros-btn" onClick={handleLimpiarTodo}>
                        <LuFilterX className="icon" aria-hidden="true" />
                        Limpiar filtros
                        <span className="badge-count">{cantidadFiltrosActivos}</span>
                      </button>
                    )}

                    <ViewToggle view={view} onChange={setView} />
                  </div>

                  {camasFiltradas.length === 0 ? (
                    <div className="cb-empty-state">No se encontraron camas con estos filtros.</div>
                  ) : (
                    <div className="cb-body-wrap">
                      {view === 'tabla' ? (
                        <BedTable camas={camasPaginadas} onAction={handleCardAction} />
                      ) : (
                        <div className="cb-grid">
                          {camasPaginadas.map((c) => (
                            <BedCard key={c.id} cama={c} onAction={handleCardAction} etaTimestamp={limpiezaEta[c.id]} now={now} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <CamasPagination
                    page={page}
                    pageSize={pageSize}
                    total={camasFiltradas.length}
                    onChangePage={setPage}
                    onChangePageSize={handleChangePageSize}
                  />
                </div>
              </div>
            </div>
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
      {modal?.type === 'bloquear' && modalCama && (
        <BloquearCamaModal
          cama={modalCama}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBloqueo}
        />
      )}
      {modal?.type === 'trasladar' && modalCama && (
        <TrasladarCamaModal
          cama={modalCama}
          camas={camas}
          onClose={handleCloseModal}
          onConfirm={handleConfirmTraslado}
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
        />
      )}
      {modal?.type === 'historial' && modalCama && (
        <HistorialCamaModal
          cama={modalCama}
          onClose={handleCloseModal}
        />
      )}
      {modal?.type === 'desactivar' && modalCama && (
        <DesactivarCamaModal
          cama={modalCama}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDesactivar}
        />
      )}
      {modal?.type === 'ver-paciente' && modalCama?.paciente && (
        <PacienteActualModal
          cama={modalCama}
          onClose={handleCloseModal}
          onAction={handleCardAction}
        />
      )}
      {modal?.type === 'nueva-cama' && (
        <NuevaCamaModal
          camasExistentes={camas}
          onClose={handleCloseModal}
          onSubmit={handleSubmitNuevaCama}
        />
      )}
      {modal?.type === 'editar-cama' && modalCama && (
        <NuevaCamaModal
          camasExistentes={camas}
          cama={modalCama}
          onClose={handleCloseModal}
          onSubmit={(datos) => handleSubmitEditarCama(modalCama.id, datos)}
        />
      )}
    </div>
  );
}
