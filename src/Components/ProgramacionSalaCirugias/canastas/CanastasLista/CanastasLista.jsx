'use client';

import { LuSearch } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import { ESTADO_FILTRO_OPTIONS } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasLista.css';

// Panel izquierdo: una sola fila de filtros (buscador + estado, ver AGENTS.md
// "Barra de filtros de listado") y las cirugías del día ordenadas por hora.
// `filtradas` es lo que se lista; `subtitulo` ya trae el total del día.
export default function CanastasLista({
  titulo, subtitulo, filtradas, seleccionId, ahora, filtros, onFiltrosChange, onSelect,
}) {
  return (
    <section className="cnc-panel cnc-lista" aria-label="Cirugías del día">
      <div className="cnc-lista-header">
        <div className="cnc-lista-titulo">
          <h2>{titulo}</h2>
          <span className="cnc-lista-sub">{subtitulo}</span>
        </div>
        <div className="filter-bar cnc-lista-filtros">
          <div className="search-field">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar paciente, documento o n.º de solicitud"
              aria-label="Buscar cirugía"
              value={filtros.busqueda}
              onChange={(e) => onFiltrosChange({ busqueda: e.target.value })}
            />
          </div>
          <div className="cnc-lista-estado">
            <FormSelect
              id="cnc-estado"
              ariaLabel="Estado de la canasta"
              value={filtros.estado}
              onChange={(estado) => onFiltrosChange({ estado })}
              options={ESTADO_FILTRO_OPTIONS}
            />
          </div>
        </div>
      </div>
      <div className="cnc-lista-items">
        {filtradas.length === 0 && <p className="cnc-lista-vacio">Ninguna cirugía coincide con los filtros.</p>}
        {filtradas.map((c) => (
          <CirugiaCard key={c.id} cirugia={c} ahora={ahora} seleccionada={c.id === seleccionId} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}
