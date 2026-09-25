'use client';

import { LuSearch, LuX } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import SegmentedFilterBar from '@/Components/SegmentedFilterBar/SegmentedFilterBar';
import { SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { INCONSISTENCIAS, INCONSISTENCIA_ORDEN } from '@/hooks/ProgramacionSalaCirugias/revisionVencidas';
import './VencidasFiltrosBar.css';

// Sede fija '02' en todo el módulo (ver ProgramacionSalaCirugias.jsx).
const SALA_OPTIONS = [
  { value: 'todas', label: 'Todas las salas' },
  ...SALAS.filter((s) => s.sedeId === '02').map((s) => ({ value: s.value, label: s.descripcion })),
];

// Una sola fila (AGENTS.md "Barra de filtros de listado"): buscador, spacer,
// chips por tipo, sala + rango de fechas, "Limpiar filtros" si hay alguno.
// `onChange` recibe solo las claves que cambian.
export default function VencidasFiltrosBar({
  filtros, conteo, onChange, onLimpiar,
}) {
  const hayFiltrosActivos = filtros.tipo !== 'todas' || filtros.salaId !== 'todas'
    || filtros.busqueda !== '' || filtros.desde !== '' || filtros.hasta !== '';
  const tipoOptions = [
    { value: 'todas', label: 'Todas', count: conteo.total },
    ...INCONSISTENCIA_ORDEN.map((tipo) => ({ value: tipo, label: INCONSISTENCIAS[tipo].label, count: conteo[tipo] })),
  ];

  return (
    <div className="filter-bar rv-filter-bar">
      <div className="search-field">
        <LuSearch className="icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar paciente, documento o No. programación"
          aria-label="Buscar paciente, documento o número de programación"
          value={filtros.busqueda}
          onChange={(e) => onChange({ busqueda: e.target.value })}
        />
      </div>
      <div className="filter-spacer" />
      <SegmentedFilterBar
        options={tipoOptions}
        value={filtros.tipo}
        onChange={(tipo) => onChange({ tipo })}
        ariaLabel="Tipo de inconsistencia"
      />
      <div className="filter-cluster">
        <div className="rv-filtro-sala">
          <FormSelect
            id="rv-filtro-sala"
            ariaLabel="Sala"
            value={filtros.salaId}
            onChange={(salaId) => onChange({ salaId })}
            options={SALA_OPTIONS}
          />
        </div>
        <div className="rv-filtro-fechas">
          <input
            type="date"
            className="rv-date-input"
            aria-label="Fecha programada desde"
            value={filtros.desde}
            max={filtros.hasta || undefined}
            onChange={(e) => onChange({ desde: e.target.value })}
          />
          <span className="rv-filtro-fechas-sep" aria-hidden="true">–</span>
          <input
            type="date"
            className="rv-date-input"
            aria-label="Fecha programada hasta"
            value={filtros.hasta}
            min={filtros.desde || undefined}
            onChange={(e) => onChange({ hasta: e.target.value })}
          />
        </div>
        {hayFiltrosActivos && (
          <Button variant="secondary" size="sm" icon={LuX} onClick={onLimpiar}>Limpiar filtros</Button>
        )}
      </div>
    </div>
  );
}
