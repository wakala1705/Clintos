'use client';

import { useEffect, useRef, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import { ESTADO_FILTRO_OPTIONS, agruparCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasLista.css';

// Panel izquierdo: una sola fila de filtros -- selector de sala, filtro de
// estado e ícono de buscar (este último despliega el campo de búsqueda bajo la
// fila) -- y las cirugías del día agrupadas por prioridad (y por hora dentro de
// cada grupo). `filtradas` es lo que se lista; `subtitulo` ya trae el total del
// día. El selector de sala vive acá (no en el header de la página) y este panel
// se monta también con el día vacío, para poder cambiar de sala.
export default function CanastasLista({
  titulo, subtitulo, filtradas, seleccionId, ahora, filtros, onFiltrosChange, onSelect,
  salaId, salaOptions, onSalaChange, mensajeVacio = 'Ninguna cirugía coincide con los filtros.',
}) {
  const [buscando, setBuscando] = useState(Boolean(filtros.busqueda));
  const inputRef = useRef(null);

  useEffect(() => {
    if (buscando) inputRef.current?.focus();
  }, [buscando]);

  // Cerrar el buscador también limpia el texto: un filtro activo no puede quedar oculto.
  function alternarBusqueda() {
    if (buscando) onFiltrosChange({ busqueda: '' });
    setBuscando(!buscando);
  }

  return (
    <section className="cnc-panel cnc-lista" aria-label="Cirugías del día">
      <div className="cnc-lista-header">
        <div className="cnc-lista-titulo">
          <h2>{titulo}</h2>
          <span className="cnc-lista-sub">{subtitulo}</span>
        </div>
        <div className="filter-bar cnc-lista-filtros">
          <div className="cnc-lista-sala">
            <FormSelect id="cnc-sala" ariaLabel="Sala" value={salaId} onChange={onSalaChange} options={salaOptions} />
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
          <button
            type="button"
            className={`cnc-lista-buscar${buscando ? ' activo' : ''}`}
            aria-label={buscando ? 'Cerrar búsqueda' : 'Buscar por paciente o solicitud'}
            aria-expanded={buscando}
            aria-controls="cnc-lista-busqueda"
            onClick={alternarBusqueda}
          >
            <LuSearch className="icon" aria-hidden="true" />
          </button>
        </div>
        {buscando && (
          <div className="search-field cnc-lista-busqueda" id="cnc-lista-busqueda">
            <LuSearch className="icon" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Paciente o solicitud"
              aria-label="Buscar por paciente, documento o n.º de solicitud"
              value={filtros.busqueda}
              onChange={(e) => onFiltrosChange({ busqueda: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Escape') alternarBusqueda(); }}
            />
          </div>
        )}
      </div>
      <div className="cnc-lista-items">
        {filtradas.length === 0 && <p className="cnc-lista-vacio">{mensajeVacio}</p>}
        {agruparCanastas(filtradas).map((g) => (
          <div className="cnc-grupo" key={g.key} role="group" aria-label={g.titulo}>
            <h3 className="cnc-grupo-titulo">{g.titulo} <span className="cnc-grupo-n">{g.items.length}</span></h3>
            {g.items.map((c) => (
              <CirugiaCard key={c.id} cirugia={c} ahora={ahora} seleccionada={c.id === seleccionId} onSelect={onSelect} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
