'use client';

import { useMemo, useState } from 'react';
import './PatientsPanel.css';
import ListFooter from '@/Components/ListFooter/ListFooter';
import PatientsTable from './PatientsTable/PatientsTable';
import BedBoardModal from '../BedBoardModal/BedBoardModal';
import Button from '@/Components/Button/Button';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import DetalleAdmisionModal from '@/Components/DetalleAdmisionModal/DetalleAdmisionModal';
import { getDetalleAdmision } from '@/hooks/HistoriaClinicaHospitalizacion/mockHospitalizadosData';
import {
  LuGrid2X2, LuMaximize2, LuMinimize2, LuSearch,
} from 'react-icons/lu';

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

// Al extremo derecho de la barra, el botón expandir/contraer (`expandida`,
// controlado desde el padre porque también compacta la fila de KPIs, ver
// PanelGeneral.jsx) — mismo botón que HC Hospitalización.
export default function PatientsPanel({
  pacientes, onOpenAtencion, areaOperativa, onAreaOperativaChange, areaOptions, expandida, onToggleExpandida,
}) {
  const [filtro, setFiltro] = useState('todos');
  const [query, setQuery] = useState('');
  const [bedBoardOpen, setBedBoardOpen] = useState(false);
  // "Ver detalle" del menú "⋯" de la tabla: id del paciente o null. Mismo
  // modal y mismos datos (getDetalleAdmision) que HC Hospitalización y
  // Enfermería → Pacientes — son los mismos pacientes del piso.
  const [detalleId, setDetalleId] = useState(null);
  const ExpandIcon = expandida ? LuMinimize2 : LuMaximize2;
  // Hora de la última carga (footer). Mock: "Actualizar" solo renueva la
  // hora (los datos son fijos); con backend real ahí va el refetch.
  const [actualizadoEn, setActualizadoEn] = useState(() => new Date());

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
      <div className="pg-patients-toolbar">
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

        <div className="filter-spacer" />

        <SegmentedFilterBar
          options={opcionesFiltro}
          value={filtro}
          onChange={setFiltro}
          ariaLabel="Filtrar pacientes en piso"
        />

        <AreaSelector options={areaOptions} value={areaOperativa} onChange={onAreaOperativaChange} />

        <Button variant="secondary" icon={LuGrid2X2} onClick={() => setBedBoardOpen(true)}>
          Mapa de camas
        </Button>

        <button
          type="button"
          className="pg-expand-btn"
          onClick={onToggleExpandida}
          aria-pressed={expandida}
          aria-label={expandida ? 'Contraer tabla' : 'Expandir tabla'}
          title={expandida ? 'Contraer tabla' : 'Expandir tabla'}
        >
          <ExpandIcon className="icon" aria-hidden="true" />
        </button>
      </div>

      <PatientsTable pacientes={filteredPacientes} onOpenAtencion={onOpenAtencion} onVerDetalle={setDetalleId} />

      <ListFooter
        mostrando={filteredPacientes.length}
        total={pacientes.length}
        actualizadoEn={actualizadoEn}
        onActualizar={() => setActualizadoEn(new Date())}
      />

      {detalleId && (
        <DetalleAdmisionModal detalle={getDetalleAdmision(detalleId)} onClose={() => setDetalleId(null)} />
      )}

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
