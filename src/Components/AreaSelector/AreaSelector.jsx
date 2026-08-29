'use client';

import {
  Fragment, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import './AreaSelector.css';
import { LuCheck, LuChevronDown, LuMapPin } from 'react-icons/lu';

// Reemplaza el <select> nativo de "Área operativa" (encargo explícito) por
// un dropdown propio — mismo patrón autocontenido que RowActionsMenu.jsx
// (estado local `open` + cierre por click-afuera/Escape) en vez del
// <select> del sistema operativo, para que el trigger se lea igual que el
// resto de botones del header (mismo .btn/.btn-secondary que "Tareas", ver
// AreaSelector.css) y el desplegable siga el mismo look que
// RowActionsMenu/ViewSettingsMenu. `value`/`onChange` controlados desde
// PanelGeneral.jsx — este componente no guarda su propia copia del área
// elegida, igual que lo haría un <select> controlado. `label` es opcional:
// sin él el trigger solo muestra la opción elegida (PanelGeneral/Tareas,
// comportamiento original); con él antepone "<label>: " (ej. Turnos, encargo
// explícito "Área operativa: Todas") — las opciones del listbox nunca
// repiten ese prefijo, solo el trigger.
//
// `group` (opcional, por-opción, ej. ESTADOS en mockCamasData.js) — cuando
// una opción trae `group` distinto de la anterior, se antepone un divider +
// label de sección (encargo: "Estado" del Bed Board, separar clínicos de
// administrativos). Sin `group` en ninguna opción (el resto de consumidores
// de este componente) el listbox se renderiza exactamente igual que antes,
// plano — es un opt-in por dato, no un prop nuevo que haya que tocar en
// cada call site existente.
export default function AreaSelector({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Portado a document.body con position:fixed (mismo motivo que
  // FormSelect.jsx, ver ese componente): si el dropdown quedara
  // position:absolute dentro de .pg-area-select, su alto suma al
  // scrollHeight de cualquier .modal-body (overflow-y:auto) que lo
  // contenga y genera un scroll que desplaza el resto del formulario —
  // bug real encontrado al usar este selector dentro de
  // NuevaProgramacionWizard. `right` (no `left`) porque el trigger vive
  // históricamente pegado al borde derecho de una fila de acciones de
  // header — alinear por la derecha reproduce el `right:0` original que
  // tenía como position:absolute, sin importar el ancho final del listbox.
  useLayoutEffect(() => {
    if (!open) return;
    function updateCoords() {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        minWidth: Math.max(180, rect.width),
      });
    }
    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      const insideTrigger = rootRef.current && rootRef.current.contains(e.target);
      const insideDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideTrigger && !insideDropdown) setOpen(false);
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

  const selected = options.find((o) => o.value === value) ?? options[0];

  function handleSelect(v) {
    setOpen(false);
    if (v !== value) onChange(v);
  }

  return (
    <div className="pg-area-select" ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className="btn btn-secondary pg-area-select-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <LuMapPin className="icon" aria-hidden="true" />
        {label ? `${label}: ${selected.label}` : selected.label}
        <LuChevronDown className={`icon pg-area-select-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>

      {open && coords && createPortal(
        <ul
          ref={dropdownRef}
          className="pg-area-select-dropdown"
          role="listbox"
          aria-label={label ?? 'Área operativa'}
          style={{ top: coords.top, right: coords.right, minWidth: coords.minWidth }}
        >
          {options.map((o, i) => (
            <Fragment key={o.value}>
              {o.group && o.group !== options[i - 1]?.group && (
                <>
                  {i > 0 && <li role="separator" className="pg-area-select-divider" />}
                  <li role="presentation" className="pg-area-select-group-label">{o.group}</li>
                </>
              )}
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  className={`pg-area-select-option${o.value === value ? ' active' : ''}`}
                  onClick={() => handleSelect(o.value)}
                >
                  {o.label}
                  {o.value === value && <LuCheck className="icon" aria-hidden="true" />}
                </button>
              </li>
            </Fragment>
          ))}
        </ul>,
        document.body,
      )}
    </div>
  );
}
