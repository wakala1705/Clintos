'use client';

import { useEffect, useRef, useState } from 'react';
import './CamasFiltrosPopover.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  TIPOS_CAMA, PISOS, SECTORES, FECHA_ACTUALIZACION_OPTIONS,
} from '@/hooks/GestionCamas/mockCamasAdminData';
import { LuFilter } from 'react-icons/lu';

// Progressive disclosure (encargo, sección 4): Habitación/Tipo de
// cama/Fecha de actualización quedan acá en vez de la franja siempre
// visible — "Estado" y "Servicio"/"Sede" ya tienen su propio selector fijo
// en el header, así que no se repiten acá (evita 2 controles filtrando lo
// mismo, mismo criterio que Estado/chips en GestionCamas.jsx). Edición en
// BORRADOR + footer Limpiar todo/Aplicar filtros, mismo patrón que
// MasFiltrosPopover (Bed Board).
export default function CamasFiltrosPopover({
  habitacion, tipo, piso, sector, fechaActualizacion, onChange, onLimpiar,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    habitacion, tipo, piso, sector, fechaActualizacion,
  });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      // FormSelect porta su listbox a document.body (ver FormSelect.jsx),
      // así que un click en una opción no está dentro de rootRef aunque
      // visualmente sí lo esté — sin este chequeo, este listener (registrado
      // antes que el propio de FormSelect) cerraba TODO el popover en el
      // mousedown, antes de que el click en la opción llegara a disparar
      // onChange (bug: el dropdown de un filtro dentro de "Más filtros" se
      // cerraba solo, sin aplicar la selección).
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
    if (!open) {
      setDraft({
        habitacion, tipo, piso, sector, fechaActualizacion,
      });
    }
    setOpen((v) => !v);
  }

  function handleAplicar() {
    onChange(draft);
    setOpen(false);
  }
  function handleLimpiarTodo() {
    onLimpiar();
    setOpen(false);
  }

  const activos = (habitacion.trim() !== '' ? 1 : 0) + (tipo !== 'todos' ? 1 : 0) + (piso !== 'todos' ? 1 : 0)
    + (sector !== 'todos' ? 1 : 0) + (fechaActualizacion !== 'todas' ? 1 : 0);

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
            <span className="fp-section-title">Habitación</span>
            <input
              type="text"
              className="cba-fp-input"
              placeholder="Código o nombre de habitación..."
              value={draft.habitacion}
              onChange={(e) => setDraft((d) => ({ ...d, habitacion: e.target.value }))}
            />
          </div>

          <div className="fp-section">
            <div className="form-field">
              <label htmlFor="cba-fp-tipo" className="fp-section-title">Tipo de cama</label>
              <FormSelect
                id="cba-fp-tipo"
                value={draft.tipo}
                onChange={(v) => setDraft((d) => ({ ...d, tipo: v }))}
                options={TIPOS_CAMA}
              />
            </div>
          </div>

          <div className="fp-section">
            <div className="form-field">
              <label htmlFor="cba-fp-piso" className="fp-section-title">Piso</label>
              <FormSelect
                id="cba-fp-piso"
                value={draft.piso}
                onChange={(v) => setDraft((d) => ({ ...d, piso: v }))}
                options={PISOS}
              />
            </div>
          </div>

          <div className="fp-section">
            <div className="form-field">
              <label htmlFor="cba-fp-sector" className="fp-section-title">Sector</label>
              <FormSelect
                id="cba-fp-sector"
                value={draft.sector}
                onChange={(v) => setDraft((d) => ({ ...d, sector: v }))}
                options={SECTORES}
              />
            </div>
          </div>

          <div className="fp-section">
            <div className="form-field">
              <label htmlFor="cba-fp-fecha" className="fp-section-title">Fecha de actualización</label>
              <FormSelect
                id="cba-fp-fecha"
                value={draft.fechaActualizacion}
                onChange={(v) => setDraft((d) => ({ ...d, fechaActualizacion: v }))}
                options={FECHA_ACTUALIZACION_OPTIONS}
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
