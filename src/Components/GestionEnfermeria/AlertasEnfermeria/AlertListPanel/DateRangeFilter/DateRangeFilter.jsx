'use client';

import { useEffect, useRef, useState } from 'react';
import { LuCalendar, LuChevronDown } from 'react-icons/lu';

// Filtro "Rango de fechas" de la barra de filtros del Centro de Alertas —
// mismas clases .filter-popover/.fp-date-row/.fp-date-field ya definidas en
// shared/shared.css (reutilizadas por Medicamentos/Órdenes/Pedidos), pero
// controlado por React (useState) en vez del patrón id+legacy-app.js que usa
// MedicamentosPanel.jsx — no hay necesidad de ese acoplamiento acá, mismo
// criterio que FilterDropdown.jsx (self-contained, open/cierre por
// click-afuera/Escape).
export default function DateRangeFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [desde, setDesde] = useState(value?.desde ?? '');
  const [hasta, setHasta] = useState(value?.hasta ?? '');
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
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

  const active = !!(value?.desde || value?.hasta);

  function aplicar() {
    onChange({ desde, hasta });
    setOpen(false);
  }
  function limpiar() {
    setDesde('');
    setHasta('');
    onChange(null);
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
        {active ? `${value.desde || '…'} – ${value.hasta || '…'}` : 'Rango de fechas'}
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {open && (
        <div className="filter-popover open" role="dialog" aria-label="Seleccionar rango de fechas">
          <div className="fp-title">Seleccionar rango de fechas</div>
          <div className="fp-date-row">
            <div className="fp-date-field">
              <label htmlFor="alertas-fecha-desde">Desde</label>
              <input id="alertas-fecha-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="fp-date-field">
              <label htmlFor="alertas-fecha-hasta">Hasta</label>
              <input id="alertas-fecha-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
          </div>
          <div className="fp-actions">
            <button type="button" className="btn btn-secondary" onClick={limpiar}>Limpiar</button>
            <button type="button" className="btn btn-primary" onClick={aplicar}>Aplicar</button>
          </div>
        </div>
      )}
    </div>
  );
}
