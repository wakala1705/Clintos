'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/Components/Button/Button';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

// Reemplaza los 2 campos "Desde"/"Hasta" sueltos de la toolbar por un único
// botón + popover (encargo explícito) -- mismas clases .filter-popover-wrap/
// .date-picker-btn/.filter-popover/.fp-title/.fp-date-row/.fp-actions ya
// definidas en ../../shared/shared.css (reusa .filters-more-btn como base
// visual del botón, ver esa hoja), mismo patrón self-contained (sin
// legacy-app.js) que DateRangeFilter.jsx de AlertasEnfermeria/
// DateRangeChips.jsx de Monitoreo en GestionEnfermeria. Sin CSS propio.
export default function DateRangeFilter({ desde, hasta, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftDesde, setDraftDesde] = useState(desde || '');
  const [draftHasta, setDraftHasta] = useState(hasta || '');
  const rootRef = useRef(null);

  // Sembrar el draft con los valores vigentes justo al abrir -- mismo patrón
  // (comparar contra el `open` anterior durante el render) que
  // FiltrosFacturasPopover.jsx, evita el set-state-in-effect síncrono.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) { setDraftDesde(desde || ''); setDraftHasta(hasta || ''); }
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

  const active = !!(desde || hasta);
  const label = active ? `${desde || '…'} – ${hasta || '…'}` : 'Rango personalizado';

  function aplicar() {
    onChange({ desde: draftDesde, hasta: draftHasta });
    setOpen(false);
  }
  function limpiar() {
    setDraftDesde('');
    setDraftHasta('');
    onChange({ desde: '', hasta: '' });
    setOpen(false);
  }

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`date-picker-btn${active ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuCalendar className="icon" aria-hidden="true" />
        {label}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover" role="dialog" aria-label="Seleccionar rango de fechas">
          <div className="fp-title">Seleccionar rango de fechas</div>
          <div className="fp-date-row">
            <div className="fp-date-field">
              <label htmlFor="fvc-rango-desde">Desde</label>
              <input id="fvc-rango-desde" type="date" value={draftDesde} onChange={(e) => setDraftDesde(e.target.value)} />
            </div>
            <div className="fp-date-field">
              <label htmlFor="fvc-rango-hasta">Hasta</label>
              <input id="fvc-rango-hasta" type="date" value={draftHasta} onChange={(e) => setDraftHasta(e.target.value)} />
            </div>
          </div>
          <div className="fp-actions">
            <Button variant="secondary" onClick={limpiar}>Limpiar</Button>
            <Button onClick={aplicar}>Aplicar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
