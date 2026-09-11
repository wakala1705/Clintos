'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import TipoFacturaFilter from '../TipoFacturaFilter/TipoFacturaFilter';
import { LuChevronDown, LuFilter } from 'react-icons/lu';

// Botón único "Otros filtros" + popover (mismo patrón .filters-more-btn/
// .filter-popover que FiltrosFacturasPopover, vista nueva -- ver AGENTS.md
// "Barra de filtros de listado") -- agrupa Clase/Tipo Factura en vez de 2
// controles sueltos en la fila (encargo explícito). Sin CSS propio: solo
// consume clases ya compartidas por feature (mismo criterio que
// SegmentedFilterBar.jsx). A diferencia de FiltrosFacturasPopover (draft +
// "Aplicar"), acá cada control sigue aplicando al toque como ya hacía suelto
// en el toolbar -- "Limpiar" es la única acción del popover.
export default function OtrosFiltrosPopover({
  clase, onChangeClase, claseOptions,
  tipo, onChangeTipo, tipoOptions,
  onLimpiar, activeCount,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    // Blindaje contra el gotcha ya documentado (AGENTS.md "Selects de
    // formulario"): el listado de FormSelect/TipoFacturaFilter se porta a
    // document.body (position:fixed), así que un click en una opción no
    // cuenta como "adentro" de rootRef -- sin este chequeo el popover se
    // cierra en el mousedown antes de que el click de la opción dispare
    // onChange.
    function handleClickOutside(e) {
      if (e.target.closest('.form-select-dropdown') || e.target.closest('.tff-dropdown')) return;
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`filters-more-btn${activeCount > 0 ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuFilter className="icon" aria-hidden="true" />
        Otros filtros
        {activeCount > 0 && <span className="badge-count">{activeCount}</span>}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover" role="dialog" aria-label="Otros filtros">
          <div className="fp-section">
            <div className="fp-section-title">Clase</div>
            <FormSelect id="fvc-fp-clase" ariaLabel="Clase" value={clase} onChange={onChangeClase} options={claseOptions} />
          </div>

          <div className="fp-section">
            <div className="fp-section-title">Tipo Factura</div>
            <TipoFacturaFilter id="fvc-fp-tipo" ariaLabel="Tipo Factura" value={tipo} onChange={onChangeTipo} options={tipoOptions} />
          </div>

          <div className="fp-actions">
            <Button variant="secondary" onClick={onLimpiar}>Limpiar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
