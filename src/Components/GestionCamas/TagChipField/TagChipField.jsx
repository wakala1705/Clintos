'use client';

import './TagChipField.css';
import { LuPlus, LuCheck, LuX } from 'react-icons/lu';

// Selector de chips predefinidos + alta de una etiqueta nueva
// (Características/Restricciones, formulario "Nueva cama") — reemplaza el
// textarea de texto libre que tenían antes (encargo: habilitar filtrar
// camas por atributo en el Bed Board a futuro). El catálogo semilla es una
// propuesta pendiente de validación clínica/operativa (ver
// CARACTERISTICAS_CAMA/RESTRICCIONES_CAMA en mockCamasData.js) —
// "Agregar etiqueta" no está limitado a esa lista.
export default function TagChipField({
  label, tags, onToggle, adding, draft, onDraftChange, onAddOpen, onAddConfirm, onAddCancel,
}) {
  function handleDraftKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddConfirm();
    }
  }

  return (
    <div className="form-field">
      <label>{label}</label>
      <div className="cb-tag-group">
        {tags.map((tag, i) => (
          <button
            type="button"
            key={`${tag.label}-${i}`}
            className={`cb-tag-chip${tag.selected ? ' selected' : ''}`}
            onClick={() => onToggle(i)}
          >
            {tag.label}
          </button>
        ))}
        {!adding && (
          <button type="button" className="cb-tag-add-btn" onClick={onAddOpen}>
            <LuPlus className="icon" aria-hidden="true" />
            Agregar etiqueta
          </button>
        )}
        {adding && (
          <div className="cb-tag-add-row">
            <input
              type="text"
              autoFocus
              placeholder="Nueva etiqueta"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={handleDraftKeyDown}
            />
            <button type="button" className="cb-tag-add-confirm" onClick={onAddConfirm} aria-label="Agregar etiqueta">
              <LuCheck className="icon" aria-hidden="true" />
            </button>
            <button type="button" className="cb-tag-add-cancel" onClick={onAddCancel} aria-label="Cancelar">
              <LuX className="icon" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
