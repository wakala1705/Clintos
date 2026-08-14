'use client';

import { useMemo, useState } from 'react';
import './PatientsPanel.css';
import PatientsTable from './PatientsTable/PatientsTable';
import { LuGrid2X2, LuSearch } from 'react-icons/lu';

const FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendientes', label: 'Con pendientes' },
  { key: 'prolongados', label: 'Prolongados' },
];

// "Con pendientes" cuenta Pendiente + Retrasada (ambos necesitan acción de
// enfermería) — un estado "Retrasada" ya es, por definición, un pendiente
// sin resolver, así que no se cuenta aparte.
function matchesFiltro(p, filtro) {
  if (filtro === 'pendientes') return p.estadoMedicacion === 'pendiente' || p.estadoMedicacion === 'retrasada';
  if (filtro === 'prolongados') return p.prolongada;
  return true;
}

export default function PatientsPanel({ pacientes, onOpenAtencion }) {
  const [filtro, setFiltro] = useState('todos');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => ({
    todos: pacientes.length,
    pendientes: pacientes.filter((p) => matchesFiltro(p, 'pendientes')).length,
    prolongados: pacientes.filter((p) => matchesFiltro(p, 'prolongados')).length,
  }), [pacientes]);

  const filteredPacientes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pacientes.filter((p) => {
      if (!matchesFiltro(p, filtro)) return false;
      if (!q) return true;
      return p.paciente.toLowerCase().includes(q) || p.cama.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    });
  }, [pacientes, filtro, query]);

  return (
    <section className="card pg-patients-card">
      <div className="pg-patients-header">
        <h2>Pacientes en piso</h2>
      </div>

      <div className="pg-patients-toolbar">
        <div className="chip-group segmented" role="tablist" aria-label="Filtrar pacientes en piso">
          {FILTROS.map((f) => (
            <button
              type="button"
              key={f.key}
              role="tab"
              aria-selected={filtro === f.key}
              className={`chip-filter${filtro === f.key ? ' active' : ''}`}
              onClick={() => setFiltro(f.key)}
            >
              {f.label} <span className="count">({counts[f.key]})</span>
            </button>
          ))}
        </div>

        <div className="filter-spacer" />

        <div className="search-field">
          <LuSearch className="icon" />
          <input
            type="text"
            placeholder="Buscar paciente, habitación..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar paciente u habitación"
          />
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => window.ncToast?.('Mapa de camas en desarrollo.')}>
          <LuGrid2X2 className="icon" />
          Mapa de camas
        </button>
      </div>

      <PatientsTable pacientes={filteredPacientes} onOpenAtencion={onOpenAtencion} />
    </section>
  );
}
