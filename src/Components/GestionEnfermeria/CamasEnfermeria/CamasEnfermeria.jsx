'use client';

import { useEffect, useMemo, useState } from 'react';
import './CamasEnfermeria.css';
import '@/Components/GestionEnfermeria/shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import GestionEnfermeriaNav from '@/Components/GestionEnfermeria/GestionEnfermeriaNav/GestionEnfermeriaNav';
import KpiCard from '../PanelGeneral/KpiCard/KpiCard';
import FilterDropdown from '../TareasEnfermeria/TaskListPanel/FilterDropdown/FilterDropdown';
import MasFiltrosPopover from './MasFiltrosPopover/MasFiltrosPopover';
import ViewToggle from './ViewToggle/ViewToggle';
import BedCard from './BedCard/BedCard';
import BedTable from './BedTable/BedTable';
import CambiarEstadoModal from './CambiarEstadoModal/CambiarEstadoModal';
import AsignarPacienteModal from './AsignarPacienteModal/AsignarPacienteModal';
import {
  AREAS, CAMAS, ESTADOS, ESTADO_LABEL, HOY_ADMISION, PISOS, SECTORES, SEDES, TIPOS,
} from '@/hooks/GestionEnfermeria/mockCamasData';
import {
  LuBedDouble, LuClock, LuLock, LuSearch, LuSprayCan, LuUser, LuWrench,
} from 'react-icons/lu';

const FILTROS_AVANZADOS_INICIALES = {
  habitacion: '', temporal: false, reserva: false, aislamiento: false, mantenimiento: false, bloqueada: false,
};

// Acciones que hoy no tienen pantalla propia (fuera del alcance de este
// cambio, ver MENU_ACCIONES en mockCamasData.js) — mismo aviso "en
// desarrollo" que el resto del proyecto (window.ncToast, ver AGENTS.md).
const ACCIONES_EN_DESARROLLO = {
  'ver-detalle': (cama) => `Detalle de cama ${cama.numero} (en desarrollo).`,
  'ver-paciente': (cama) => `Ficha de ${cama.paciente?.nombre ?? 'paciente'} (en desarrollo).`,
  historial: (cama) => `Historial de cama ${cama.numero} (en desarrollo).`,
  'ver-mantenimiento': (cama) => `Detalle de mantenimiento de cama ${cama.numero} (en desarrollo).`,
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
export default function CamasEnfermeria() {
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

  const kpis = useMemo(() => {
    const contarPorEstado = (est) => camas.filter((c) => c.estado === est).length;
    const total = camas.length;
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
  }, [camas]);

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
  function handleLimpiarFiltrosAvanzados() {
    setFiltrosAvanzados(FILTROS_AVANZADOS_INICIALES);
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
        mutarCama(camaId, { estado: 'reservada' });
        window.ncToast?.(`Cama ${cama.numero} reservada.`);
        return;
      case 'liberar':
        mutarCama(camaId, { estado: 'limpieza', paciente: null });
        window.ncToast?.(`Cama ${cama.numero} liberada — pasa a limpieza.`);
        return;
      case 'utilizar-reserva':
        mutarCama(camaId, {
          estado: 'ocupada',
          reserva: null,
          paciente: cama.reserva ? { nombre: cama.reserva.paciente, hc: cama.reserva.hc ?? '—', admision: HOY_ADMISION } : cama.paciente,
        });
        window.ncToast?.(`Reserva de cama ${cama.numero} utilizada.`);
        return;
      case 'cancelar-reserva':
        mutarCama(camaId, { estado: 'libre', reserva: null });
        window.ncToast?.(`Reserva de cama ${cama.numero} cancelada.`);
        return;
      case 'finalizar-limpieza':
        mutarCama(camaId, { estado: 'libre', limpiezaDesde: undefined });
        window.ncToast?.(`Cama ${cama.numero} lista — limpieza finalizada.`);
        return;
      case 'finalizar-mantenimiento':
        mutarCama(camaId, { estado: 'limpieza', mantenimientoTipo: undefined });
        window.ncToast?.(`Mantenimiento de cama ${cama.numero} finalizado — pasa a limpieza.`);
        return;
      case 'desbloquear':
        mutarCama(camaId, { estado: 'libre', motivo: undefined });
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
    });
    setModal(null);
    window.ncToast?.(`Cama ${cama.numero} actualizada a ${ESTADO_LABEL[nuevoEstado]}.`);
  }

  function handleAssignPaciente(camaId, { nombre, hc }) {
    const cama = camas.find((c) => c.id === camaId);
    mutarCama(camaId, { estado: 'ocupada', paciente: { nombre, hc, admision: HOY_ADMISION } });
    setModal(null);
    window.ncToast?.(`${nombre} asignado a cama ${cama.numero}.`);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section={['Hospitalización', { label: 'Gestión de Enfermería', href: '/gestion-enfermeria' }]}
          page="Camas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content cb-content">
          <div className="cb-header">
            <div>
              <h1>Bed Board</h1>
              <p>Estado en tiempo real de las camas del hospital.</p>
            </div>
          </div>

          <GestionEnfermeriaNav />

          {/* Jerarquía de KPIs en 3 grupos (encargo: "diferenciar visualmente
              capacidad principal / estados operativos / métrica", los 4
              primeros con mayor jerarquía) — mismos 8 indicadores de antes,
              agrupados y con tamaño distinto en vez de una fila plana. */}
          <div className="cb-kpi-row">
            <div className="cb-kpi-group cb-kpi-group-primary">
              <span className="filter-label">Capacidad</span>
              <div className="cb-kpi-group-cards">
                <KpiCard icon={LuBedDouble} label="Total" value={kpis.total} description="Camas registradas" variant="neutral" />
                <KpiCard icon={LuBedDouble} label="Disponibles" value={kpis.libres} description="Camas listas para asignar" variant="neutral" />
                <KpiCard icon={LuUser} label="Ocupadas" value={kpis.ocupadas} description="Con paciente" variant="warning" />
                <KpiCard icon={LuClock} label="Reservadas" value={kpis.reservadas} description="Reserva activa" variant="warning" />
              </div>
            </div>

            <div className="cb-kpi-group cb-kpi-group-secondary">
              <span className="filter-label">Estados operativos</span>
              <div className="cb-kpi-group-cards">
                <KpiCard icon={LuSprayCan} label="Limpieza" value={kpis.limpieza} description="En limpieza" variant="warning" />
                <KpiCard icon={LuWrench} label="Mantenim." value={kpis.mantenimiento} description="En mantenimiento" variant="warning" />
                <KpiCard icon={LuLock} label="Bloqueadas" value={kpis.bloqueadas} description="Fuera de servicio" variant="warning" />
              </div>
            </div>

            <div className="cb-kpi-group cb-kpi-group-metric">
              <span className="filter-label">Métrica</span>
              <div className="cb-kpi-group-cards">
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
              <FilterDropdown label="Sede" options={SEDES} value={sede} onChange={setSede} />
              <FilterDropdown label="Área" options={AREAS} value={area} onChange={setArea} />
              <FilterDropdown label="Piso" options={PISOS} value={piso} onChange={setPiso} />
              <FilterDropdown label="Sector" options={SECTORES} value={sector} onChange={setSector} />
              <FilterDropdown label="Estado" options={ESTADOS} value={estado} onChange={setEstado} />
              <FilterDropdown label="Tipo" options={TIPOS} value={tipo} onChange={setTipo} />
              <MasFiltrosPopover filtros={filtrosAvanzados} onChange={handleCambioFiltroAvanzado} onLimpiar={handleLimpiarFiltrosAvanzados} />

              <div className="filter-spacer" />

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
                      <BedCard key={c.id} cama={c} onAction={handleCardAction} />
                    ))}
                  </div>
                )}
              </div>
            )}
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
    </div>
  );
}
