'use client';

import { useEffect, useRef, useState } from 'react';
import { LuSearch, LuSlidersHorizontal } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import SearchField from '@/Components/SearchField/SearchField';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CirugiaCard from '../CirugiaCard/CirugiaCard';
import { ESTADO_FILTRO_OPTIONS, agruparCanastas } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastasLista.css';

// Panel izquierdo: el navegador de fecha (`fechaNav`, en lugar del título), una fila de dos íconos -- buscar (despliega el campo de
// búsqueda bajo la fila) y filtros (popover con quirófano y estado) -- y las
// cirugías del día agrupadas por prioridad (y por hora dentro de cada grupo).
// `filtradas` es lo que se lista; `subtitulo` ya trae el total del día. El
// selector de sala vive acá (no en el header de la página) y este panel se
// monta también con el día vacío, para poder cambiar de sala.
export default function CanastasLista({
  fechaNav, filtradas, seleccionId, ahora, filtros, onFiltrosChange, onSelect,
  salaId, salaOptions, onSalaChange, mensajeVacio = 'Ninguna cirugía coincide con los filtros.',
}) {
  const [buscando, setBuscando] = useState(Boolean(filtros.busqueda));
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const inputRef = useRef(null);
  const filtrosRef = useRef(null);
  const estadoActivo = filtros.estado !== 'todos';

  useEffect(() => {
    if (buscando) inputRef.current?.focus();
  }, [buscando]);

  // Cierre por click afuera / Escape. Las listas de FormSelect viven en
  // document.body: hay que tratarlas como "adentro" o el popover se cierra antes
  // de que la opción dispare onChange.
  useEffect(() => {
    if (!filtrosAbiertos) return;
    function handleMouseDown(e) {
      if (e.target.closest('.form-select-dropdown')) return;
      if (filtrosRef.current && !filtrosRef.current.contains(e.target)) setFiltrosAbiertos(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setFiltrosAbiertos(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filtrosAbiertos]);

  // Cerrar el buscador también limpia el texto: un filtro activo no puede quedar oculto.
  function alternarBusqueda() {
    if (buscando) onFiltrosChange({ busqueda: '' });
    setBuscando(!buscando);
  }

  return (
    <section className="cnc-panel cnc-lista" aria-label="Cirugías del día">
      <div className="cnc-lista-header">
        {fechaNav}
        <div className="filter-bar cnc-lista-filtros">
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
          <div className="cnc-lista-filtros-wrap" ref={filtrosRef}>
            <button
              type="button"
              className={`cnc-lista-buscar${filtrosAbiertos || estadoActivo ? ' activo' : ''}`}
              aria-label="Filtros: sala y estado"
              aria-haspopup="dialog"
              aria-expanded={filtrosAbiertos}
              onClick={() => setFiltrosAbiertos((v) => !v)}
            >
              <LuSlidersHorizontal className="icon" aria-hidden="true" />
              {estadoActivo && <span className="cnc-lista-filtros-dot" aria-hidden="true" />}
            </button>
            {filtrosAbiertos && (
              <div className="cnc-lista-popover" role="dialog" aria-label="Filtros de la lista">
                <div className="form-field">
                  <label htmlFor="cnc-sala" className="cnc-lista-label">Quirófano</label>
                  <FormSelect id="cnc-sala" value={salaId} onChange={onSalaChange} options={salaOptions} />
                </div>
                <div className="form-field">
                  <label htmlFor="cnc-estado" className="cnc-lista-label">Estado de la canasta</label>
                  <FormSelect
                    id="cnc-estado"
                    value={filtros.estado}
                    onChange={(estado) => onFiltrosChange({ estado })}
                    options={ESTADO_FILTRO_OPTIONS}
                  />
                </div>
                {estadoActivo && (
                  <Button variant="secondary" size="sm" onClick={() => onFiltrosChange({ estado: 'todos' })}>
                    Limpiar estado
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {buscando && (
          <SearchField
            className="cnc-lista-busqueda"
            id="cnc-lista-busqueda"
            inputRef={inputRef}
            placeholder="Paciente o solicitud"
            ariaLabel="Buscar por paciente, documento o n.º de solicitud"
            value={filtros.busqueda}
            onChange={(v) => onFiltrosChange({ busqueda: v })}
            onKeyDown={(e) => { if (e.key === 'Escape') alternarBusqueda(); }}
          />
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
