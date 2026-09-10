'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { TIPO_ARTICULO_OPTIONS, PROCEDENCIA_OPTIONS } from '@/hooks/InsumosFarmacia/mockSolicitudesData';
import { LuFilter } from 'react-icons/lu';

const FILTROS_LIMPIOS = { tipoArticulo: 'todos', procedencia: 'todos' };

// Botón "Filtros" + popover (mismo patrón .filters-more-btn/.filter-popover
// que FiltrosFacturasPopover, ver AGENTS.md "Barra de filtros de listado")
// -- agrupa Tipo Artículo/Procedencia en vez de 2 selects sueltos en la
// fila. Los cambios quedan en `draft` hasta "Aplicar"; `filtros`/`onApply`
// solo cubren estas 2 claves (no el objeto de filtros completo de la
// página), así "Limpiar" no pisa Estado/No. Doc.
export default function MovimientosFiltrosPopover({ filtros, onApply, activeCount }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filtros);
  const rootRef = useRef(null);

  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(filtros);
  }

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      // El listbox de FormSelect se porta a document.body (ver
      // FormSelect.jsx) -- sin este guard, un click en una opción cierra el
      // popover en el mousedown antes de que dispare onChange (ver AGENTS.md
      // "Selects de formulario", bug ya documentado en CamasFiltrosPopover).
      if (e.target.closest('.form-select-dropdown')) return;
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

  function handleAplicar() {
    onApply(draft);
    setOpen(false);
  }
  function handleLimpiar() {
    setDraft(FILTROS_LIMPIOS);
    onApply(FILTROS_LIMPIOS);
    setOpen(false);
  }

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
        Filtros
        {activeCount > 0 && <span className="badge-count">{activeCount}</span>}
      </button>

      {open && (
        <div className="filter-popover" role="dialog" aria-label="Filtros de movimientos">
          <div className="fp-section">
            <div className="fp-section-title">Tipo Artículo</div>
            <FormSelect
              id="mig-fp-tipo-articulo"
              ariaLabel="Tipo Artículo"
              value={draft.tipoArticulo}
              onChange={(v) => setDraft((d) => ({ ...d, tipoArticulo: v }))}
              options={TIPO_ARTICULO_OPTIONS}
            />
          </div>

          <div className="fp-section">
            <div className="fp-section-title">Procedencia</div>
            <FormSelect
              id="mig-fp-procedencia"
              ariaLabel="Procedencia"
              value={draft.procedencia}
              onChange={(v) => setDraft((d) => ({ ...d, procedencia: v }))}
              options={PROCEDENCIA_OPTIONS}
            />
          </div>

          <div className="fp-actions">
            <Button variant="secondary" onClick={handleLimpiar}>Limpiar</Button>
            <Button onClick={handleAplicar}>Aplicar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
