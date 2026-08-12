'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import './PlantillaModal.css';
import { PLANTILLAS } from '@/hooks/HistoriaClinica/mockPlantillas';
import { LuCheck, LuSearch, LuX } from 'react-icons/lu';

// Selector de elementos que pueden recibir foco de teclado dentro del modal
// — usado para el focus trap (ver efecto de Tab más abajo) y para decidir a
// quién devolver el foco no aplica acá (eso lo maneja AtencionPaciente.jsx,
// que sabe cuál botón disparó la apertura).
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Catálogo de plantillas de historia clínica — se abre desde "Nueva
// atención" en RegistrosPanel. Elegir una plantilla es, por ahora, el final
// del flujo (onElegir queda como hook listo, ver AtencionPaciente.jsx): el
// editor de la nota a partir de la plantilla todavía no está definido.
export default function PlantillaModal({ open, onClose, onElegir }) {
  const [query, setQuery] = useState('');
  const [selectedCodigo, setSelectedCodigo] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      // Focus trap: el modal no tiene backdrop inerte propio, así que sin
      // esto Tab/Shift+Tab se escapa hacia el contenido de AtencionPaciente
      // que sigue montado (solo tapado visualmente por el overlay).
      const focusable = cardRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PLANTILLAS;
    return PLANTILLAS.filter((p) => p.codigo.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
  }, [query]);

  if (!open) return null;

  const selected = PLANTILLAS.find((p) => p.codigo === selectedCodigo) ?? null;

  function handleClose() {
    setQuery('');
    setSelectedCodigo(null);
    onClose();
  }

  function handleElegir(plantilla) {
    const chosen = plantilla ?? selected;
    if (!chosen) return;
    onElegir(chosen);
    setQuery('');
    setSelectedCodigo(null);
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={handleClose}>
      <div
        className="modal-card pm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-title"
        onClick={(e) => e.stopPropagation()}
        ref={cardRef}
      >
        <div className="modal-header">
          <h3 id="pm-title">Catálogo de plantillas de historia clínica</h3>
          <button type="button" className="modal-close-btn" onClick={handleClose} aria-label="Cerrar catálogo">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body pm-body">
          <div className="search-field pm-search">
            <LuSearch className="icon" />
            <input
              type="text"
              placeholder="Buscar por código o descripción"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar plantilla"
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="pm-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pm-col-codigo">Clase plantilla</th>
                  <th>Descripción plantilla</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isSelected = selectedCodigo === p.codigo;
                  return (
                    <tr
                      key={p.codigo}
                      className={isSelected ? 'selected' : undefined}
                      onClick={() => setSelectedCodigo(p.codigo)}
                      onDoubleClick={() => handleElegir(p)}
                      aria-selected={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter' && e.key !== ' ') return;
                        e.preventDefault();
                        // Enter selecciona la fila (como un clic); sobre una
                        // fila ya seleccionada y enfocada, un segundo Enter
                        // la elige — mismo mapeo que clic/doble clic con
                        // mouse, sin depender de él (WCAG 2.1.1).
                        if (isSelected) handleElegir(p);
                        else setSelectedCodigo(p.codigo);
                      }}
                    >
                      <td className="pm-cell-codigo">{p.codigo}</td>
                      <td className="pm-cell-desc">{p.descripcion}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr className="pm-empty-row">
                    <td colSpan={2} className="pm-empty-cell">No encontramos plantillas que coincidan con tu búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" disabled={!selected} onClick={() => handleElegir()}>
            <LuCheck className="icon" />
            Elegir
          </button>
        </div>
      </div>
    </div>
  );
}
