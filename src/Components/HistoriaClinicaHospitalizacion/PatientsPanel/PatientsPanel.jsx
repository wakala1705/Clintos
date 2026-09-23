'use client';

import { useMemo, useState } from 'react';
import './PatientsPanel.css';
import PatientsTable from './PatientsTable/PatientsTable';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import { LuSearch } from 'react-icons/lu';

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendientes', label: 'Con pendientes' },
  { value: 'prolongados', label: 'Prolongados' },
  { value: 'alta', label: 'Alta probable' },
];

function matchesFiltro(p, filtro) {
  if (filtro === 'pendientes') return p.pendientes.length > 0;
  if (filtro === 'prolongados') return p.prolongada;
  if (filtro === 'alta') return p.altaProbable;
  return true;
}

// Barra de una sola fila (AGENTS.md "Barra de filtros de listado"): buscador
// a la izquierda, .filter-spacer, chips rápidos y selector de área. El
// filtro rápido es controlado desde el padre (`filtro`/`onFiltroChange`)
// porque el panel lateral de pendientes también puede activarlo.
export default function PatientsPanel({
  pacientes, onOpenHistoria, filtro, onFiltroChange, areaOperativa, onAreaOperativaChange, areaOptions,
  selectedId, onSelectRow,
}) {
  const [query, setQuery] = useState('');

  const opcionesFiltro = useMemo(() => FILTROS.map((f) => ({
    ...f,
    count: pacientes.filter((p) => matchesFiltro(p, f.value)).length,
  })), [pacientes]);

  const filteredPacientes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pacientes.filter((p) => {
      if (!matchesFiltro(p, filtro)) return false;
      if (!q) return true;
      return p.paciente.toLowerCase().includes(q)
        || p.cama.toLowerCase().includes(q)
        || p.id.toLowerCase().includes(q)
        || p.diagnostico.toLowerCase().includes(q);
    });
  }, [pacientes, filtro, query]);

  return (
    <section className="card hh-patients-card">
      <div className="filter-bar hh-patients-toolbar">
        <div className="search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar paciente, cama, diagnóstico..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar paciente, cama o diagnóstico"
          />
        </div>

        <div className="filter-spacer" />

        <SegmentedFilterBar
          options={opcionesFiltro}
          value={filtro}
          onChange={onFiltroChange}
          ariaLabel="Filtrar pacientes hospitalizados"
        />

        <AreaSelector options={areaOptions} value={areaOperativa} onChange={onAreaOperativaChange} />
      </div>

      <PatientsTable
        pacientes={filteredPacientes}
        onOpenHistoria={onOpenHistoria}
        selectedId={selectedId}
        onSelectRow={onSelectRow}
      />
    </section>
  );
}
