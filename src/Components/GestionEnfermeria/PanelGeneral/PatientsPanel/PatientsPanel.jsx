'use client';

import { useMemo, useState } from 'react';
import './PatientsPanel.css';
import PatientsTable from './PatientsTable/PatientsTable';
import BedBoardModal from '../BedBoardModal/BedBoardModal';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import { LuGrid2X2, LuSearch } from 'react-icons/lu';

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendientes', label: 'Con pendientes' },
  { value: 'prolongados', label: 'Prolongados' },
];

// "Con pendientes" cuenta Pendiente + Retrasada (ambos necesitan acción de
// enfermería) — un estado "Retrasada" ya es, por definición, un pendiente
// sin resolver, así que no se cuenta aparte.
function matchesFiltro(p, filtro) {
  if (filtro === 'pendientes') return p.estadoMedicacion === 'pendiente' || p.estadoMedicacion === 'retrasada';
  if (filtro === 'prolongados') return p.prolongada;
  return true;
}

export default function PatientsPanel({
  pacientes, onOpenAtencion, areaOperativa, onAreaOperativaChange, areaOptions,
}) {
  const [filtro, setFiltro] = useState('todos');
  const [query, setQuery] = useState('');
  const [bedBoardOpen, setBedBoardOpen] = useState(false);

  const counts = useMemo(() => ({
    todos: pacientes.length,
    pendientes: pacientes.filter((p) => matchesFiltro(p, 'pendientes')).length,
    prolongados: pacientes.filter((p) => matchesFiltro(p, 'prolongados')).length,
  }), [pacientes]);

  const opcionesFiltro = useMemo(() => FILTROS.map((f) => ({ ...f, count: counts[f.value] })), [counts]);

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
        <AreaSelector options={areaOptions} value={areaOperativa} onChange={onAreaOperativaChange} />
      </div>

      <div className="pg-patients-toolbar">
        <SegmentedFilterBar
          options={opcionesFiltro}
          value={filtro}
          onChange={setFiltro}
          ariaLabel="Filtrar pacientes en piso"
        />

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
        <button type="button" className="btn btn-secondary" onClick={() => setBedBoardOpen(true)}>
          <LuGrid2X2 className="icon" />
          Mapa de camas
        </button>
      </div>

      <PatientsTable pacientes={filteredPacientes} onOpenAtencion={onOpenAtencion} />

      {bedBoardOpen && (
        <BedBoardModal
          areaOperativa={areaOperativa}
          onClose={() => setBedBoardOpen(false)}
          onOpenAtencion={onOpenAtencion}
        />
      )}
    </section>
  );
}
