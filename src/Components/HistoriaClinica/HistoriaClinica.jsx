'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './HistoriaClinica.css';
import './shared/shared.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import KpiFilterCard from './KpiFilterCard/KpiFilterCard';
import WeekDatePicker from './WeekDatePicker/WeekDatePicker';
import AgendaTable from './AgendaTable/AgendaTable';
import AgendaTableSkeleton from './AgendaTableSkeleton/AgendaTableSkeleton';
import AgendaEmptyState from './AgendaEmptyState/AgendaEmptyState';
import { DOCTOR, fetchAgenda, fullDateLabel, todayISO } from '@/hooks/HistoriaClinica/mockAgendaData';
import { LuCalendarDays, LuCircleCheckBig, LuClipboardList, LuRefreshCw, LuSearch, LuUser } from 'react-icons/lu';

const KPI_DEFS = [
  { key: 'en-sala', label: 'Pacientes en sala', icon: LuClipboardList, variant: 'warning' },
  { key: 'atendido', label: 'Pacientes atendidos', icon: LuCircleCheckBig, variant: 'success' },
  { key: 'dia', label: 'Pacientes del día', icon: LuCalendarDays, variant: 'info' },
];

export default function HistoriaClinica() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(() => todayISO());
  const [kpiFilter, setKpiFilter] = useState('en-sala');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('loading'); // loading | ready
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ enSala: 0, atendidos: 0, delDia: 0 });
  // Empujarlo repite el efecto de carga sin agregar una función "loadAgenda"
  // separada que el efecto tendría que invocar — mismo patrón que
  // reloadToken en ListaPacientes.jsx (ver AGENTS.md / react-hooks/set-state-in-effect).
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const cleanup = initShellChrome({ startCollapsed: true });
    return cleanup;
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchAgenda({ dateISO: selectedDate, kpiFilter }).then(({ items: fetched, counts: fetchedCounts }) => {
      if (cancelled) return;
      setItems(fetched);
      setCounts(fetchedCounts);
      setStatus('ready');
    });
    return () => { cancelled = true; };
  }, [selectedDate, kpiFilter, reloadToken]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((a) => a.nombreAfiliado.toLowerCase().includes(q) || a.idAfiliado.toLowerCase().includes(q));
  }, [items, query]);

  function handleRefresh() {
    setStatus('loading');
    setReloadToken((t) => t + 1);
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Consulta Externa"
          page="Historias Clínicas"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content hc-content">
          <div className="hc-welcome">
            <span className="hc-welcome-hi">¡Bienvenido!</span>
            <h1 className="hc-doctor-name">DR. {DOCTOR.nombre.toUpperCase()}</h1>
          </div>

          <div className="hc-top-row">
            <div className="hc-kpi-row">
              {KPI_DEFS.map((kpi) => (
                <KpiFilterCard
                  key={kpi.key}
                  icon={kpi.icon}
                  label={kpi.label}
                  value={kpi.key === 'en-sala' ? counts.enSala : kpi.key === 'atendido' ? counts.atendidos : counts.delDia}
                  variant={kpi.variant}
                  active={kpiFilter === kpi.key}
                  onClick={() => setKpiFilter(kpi.key)}
                />
              ))}
            </div>
            <WeekDatePicker selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div className="hc-card-shell">
            <div className="hc-agenda-header">
              <h2>Agenda del día</h2>
              <span className="hc-date-pill">{fullDateLabel(selectedDate)}</span>
            </div>

            <div className="hc-actions-bar">
              <div className="search-field">
                <LuSearch className="icon" />
                <input
                  type="text"
                  placeholder="Buscar"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Buscar en la agenda del día"
                />
              </div>
              <div className="hc-actions-bar-buttons">
                <button type="button" className="btn btn-secondary" onClick={handleRefresh}>
                  <LuRefreshCw className="icon" />
                  Refrescar
                </button>
                <button type="button" className="btn btn-outline" onClick={() => router.push('/lista-pacientes')}>
                  <LuUser className="icon" />
                  Ver Lista Pacientes
                </button>
              </div>
            </div>

            <div className="hc-table-frame">
              {status === 'loading' && <AgendaTableSkeleton />}
              {status === 'ready' && filteredItems.length === 0 && <AgendaEmptyState />}
              {status === 'ready' && filteredItems.length > 0 && (
                <AgendaTable items={filteredItems} onOpenAtencion={(citaId) => router.push(`/historia-clinica/atencion/${citaId}`)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
