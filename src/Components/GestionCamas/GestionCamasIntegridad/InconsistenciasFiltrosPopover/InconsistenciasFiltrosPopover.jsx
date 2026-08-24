'use client';

import { useEffect, useRef, useState } from 'react';
import './InconsistenciasFiltrosPopover.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { SERVICIOS } from '@/hooks/GestionCamas/mockIntegridadData';
import { LuFilter } from 'react-icons/lu';

const DETECTADO_OPTIONS = [
  { value: 'cualquiera', label: 'Cualquier fecha' },
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
];

// Progressive disclosure (encargo, sección 9): Servicio + rango de
// "Detectado" quedan acá para no sobrecargar la barra principal — Tipo/
// Impacto/Estado/Sede ya tienen su propio selector fijo (ver
// GestionCamasIntegridad.jsx). Mismo patrón borrador+Aplicar/Limpiar que
// CamasFiltrosPopover (Camas).
export default function InconsistenciasFiltrosPopover({ servicio, detectado, onChange, onLimpiar }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ servicio, detectado });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      // Ver AGENTS.md, "Selects de formulario" — el listbox de FormSelect se
      // porta a document.body, así que un click en una opción no cuenta como
      // "adentro" de rootRef; sin este chequeo el popover se cerraba antes
      // de que la selección llegara a aplicarse.
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

  function handleToggleOpen() {
    if (!open) setDraft({ servicio, detectado });
    setOpen((v) => !v);
  }
  function handleAplicar() { onChange(draft); setOpen(false); }
  function handleLimpiarTodo() { onLimpiar(); setOpen(false); }

  const activos = (servicio !== 'todos' ? 1 : 0) + (detectado !== 'cualquiera' ? 1 : 0);

  return (
    <div className="filter-popover-wrap" ref={rootRef}>
      <button
        type="button"
        className={`filters-more-btn${activos > 0 ? ' active' : ''}`}
        onClick={handleToggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <LuFilter className="icon" aria-hidden="true" />
        Más filtros
        {activos > 0 && <span className="badge-count">{activos}</span>}
      </button>

      {open && (
        <div className="filter-popover filter-popover-right open">
          <div className="fp-section">
            <div className="form-field">
              <label htmlFor="cbi-fp-servicio" className="fp-section-title">Servicio</label>
              <FormSelect
                id="cbi-fp-servicio"
                value={draft.servicio}
                onChange={(v) => setDraft((d) => ({ ...d, servicio: v }))}
                options={SERVICIOS}
              />
            </div>
          </div>

          <div className="fp-section">
            <div className="form-field">
              <label htmlFor="cbi-fp-detectado" className="fp-section-title">Detectado</label>
              <FormSelect
                id="cbi-fp-detectado"
                value={draft.detectado}
                onChange={(v) => setDraft((d) => ({ ...d, detectado: v }))}
                options={DETECTADO_OPTIONS}
              />
            </div>
          </div>

          <div className="fp-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleLimpiarTodo}>Limpiar todo</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAplicar}>Aplicar filtros</button>
          </div>
        </div>
      )}
    </div>
  );
}
