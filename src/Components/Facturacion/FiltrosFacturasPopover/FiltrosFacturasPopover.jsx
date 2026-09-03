'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { CLASE_OPTIONS, TIPO_OPTIONS } from '@/hooks/Facturacion/mockFacturasData';
import { LuChevronDown, LuFilter } from 'react-icons/lu';

// Botón único "Filtros" + popover (mismo patrón .filters-more-btn/
// .filter-popover que FiltersRow en ListaPacientes, ver AGENTS.md "Barra de
// filtros de listado") — agrupa Clase/Tipo/rango de fechas en vez de 3
// controles sueltos en la fila. Los cambios quedan en estado local (draft)
// hasta "Aplicar"; "Limpiar" resetea y aplica de una vez.
export default function FiltrosFacturasPopover({ filtros, onApply, activeCount }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filtros);
  const rootRef = useRef(null);

  // Sembrar el draft con los filtros vigentes justo al abrir -- ajustado
  // durante el render (comparando contra el `open` anterior) en vez de un
  // efecto con setState síncrono, mismo patrón que el reset de tab en
  // DetalleCirugiaPanel.jsx (evita el cascading-render que marca la regla
  // react-hooks/set-state-in-effect).
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(filtros);
  }

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
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
    const cleared = { clase: 'todas', tipo: 'todas', desde: '', hasta: '' };
    setDraft(cleared);
    onApply(cleared);
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
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover" role="dialog" aria-label="Filtros de facturas">
          <div className="fp-section">
            <div className="fp-section-title">Clase factura</div>
            <FormSelect
              id="fact-fp-clase"
              ariaLabel="Clase factura"
              value={draft.clase}
              onChange={(v) => setDraft((d) => ({ ...d, clase: v }))}
              options={CLASE_OPTIONS}
            />
          </div>

          <div className="fp-section">
            <div className="fp-section-title">Tipo factura</div>
            <FormSelect
              id="fact-fp-tipo"
              ariaLabel="Tipo factura"
              value={draft.tipo}
              onChange={(v) => setDraft((d) => ({ ...d, tipo: v }))}
              options={TIPO_OPTIONS}
            />
          </div>

          <div className="fp-section">
            <div className="fp-section-title">Facturadas entre el</div>
            <div className="fp-date-row">
              <div className="fp-date-field">
                <label htmlFor="fact-fp-desde">Desde</label>
                <input id="fact-fp-desde" type="date" value={draft.desde} onChange={(e) => setDraft((d) => ({ ...d, desde: e.target.value }))} />
              </div>
              <div className="fp-date-field">
                <label htmlFor="fact-fp-hasta">Y el</label>
                <input id="fact-fp-hasta" type="date" value={draft.hasta} onChange={(e) => setDraft((d) => ({ ...d, hasta: e.target.value }))} />
              </div>
            </div>
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
