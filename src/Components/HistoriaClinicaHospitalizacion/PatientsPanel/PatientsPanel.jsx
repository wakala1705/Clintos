'use client';

import { useMemo, useState } from 'react';
import './PatientsPanel.css';
import ListFooter from '@/Components/ListFooter/ListFooter';
import PatientsTable from './PatientsTable/PatientsTable';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import AreaSelector from '@/Components/AreaSelector/AreaSelector';
import {
  LuMaximize2, LuMinimize2, LuSearch,
} from 'react-icons/lu';

// Filtro "Con pendientes" oculto mientras la columna Pendientes también lo
// esté (encargo explícito: todavía no está definido de qué son esos
// pendientes — ver MOSTRAR_PENDIENTES en PatientsTable.jsx). Sin la columna,
// filtraba 10 pacientes sin ninguna señal visible de por qué. La lógica
// (matchesFiltro) sigue intacta: poner en true para volver a mostrarlo.
const MOSTRAR_FILTRO_PENDIENTES = false;

const FILTROS = [
  { value: 'todos', label: 'Todos' },
  ...(MOSTRAR_FILTRO_PENDIENTES ? [{ value: 'pendientes', label: 'Con pendientes' }] : []),
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
//
// Al extremo derecho de la barra, el botón expandir/contraer (`expandida`,
// controlado desde el padre porque también compacta la fila de KPIs, ver
// HistoriaClinicaHospitalizacion.jsx): le da más alto a la tabla.
//
// Footer: @/Components/ListFooter (conteo + última actualización), también
// ocupa el fondo de la card para que el trigger flotante de Kora no tape la
// última fila (antes se resolvía con un padding-bottom vacío en .hh-table-wrap).
export default function PatientsPanel({
  pacientes, onOpenHistoria, filtro, onFiltroChange, areaOperativa, onAreaOperativaChange, areaOptions,
  selectedId, onSelectRow, onPreguntarKora, onVerDetalle, expandida, onToggleExpandida,
}) {
  const [query, setQuery] = useState('');
  // Hora de la última carga. Mock: "Actualizar" solo renueva la hora (los
  // datos son fijos); con backend real ahí va el refetch.
  const [actualizadoEn, setActualizadoEn] = useState(() => new Date());
  const ExpandIcon = expandida ? LuMinimize2 : LuMaximize2;

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

        <button
          type="button"
          className="hh-expand-btn"
          onClick={onToggleExpandida}
          aria-pressed={expandida}
          aria-label={expandida ? 'Contraer tabla' : 'Expandir tabla'}
          title={expandida ? 'Contraer tabla' : 'Expandir tabla'}
        >
          <ExpandIcon className="icon" aria-hidden="true" />
        </button>
      </div>

      <PatientsTable
        pacientes={filteredPacientes}
        onOpenHistoria={onOpenHistoria}
        selectedId={selectedId}
        onSelectRow={onSelectRow}
        onPreguntarKora={onPreguntarKora}
        onVerDetalle={onVerDetalle}
      />

      <ListFooter
        mostrando={filteredPacientes.length}
        total={pacientes.length}
        actualizadoEn={actualizadoEn}
        onActualizar={() => setActualizadoEn(new Date())}
      />
    </section>
  );
}
