'use client';

import { useEffect, useMemo, useState } from 'react';
import './PlantillaModal.css';
import { PLANTILLAS } from '@/hooks/HistoriaClinica/mockPlantillas';
import { LuCheck, LuSearch, LuX } from 'react-icons/lu';

// Catálogo de plantillas de historia clínica — se abre desde "Nueva
// atención" en RegistrosPanel. Elegir una plantilla es, por ahora, el final
// del flujo (onElegir queda como hook listo, ver AtencionPaciente.jsx): el
// editor de la nota a partir de la plantilla todavía no está definido.
export default function PlantillaModal({ open, onClose, onElegir }) {
  const [query, setQuery] = useState('');
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
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
                {filtered.map((p) => (
                  <tr
                    key={p.codigo}
                    className={selectedCodigo === p.codigo ? 'selected' : undefined}
                    onClick={() => setSelectedCodigo(p.codigo)}
                    onDoubleClick={() => handleElegir(p)}
                    aria-selected={selectedCodigo === p.codigo}
                  >
                    <td className="cell-primary">{p.codigo}</td>
                    <td>{p.descripcion}</td>
                  </tr>
                ))}
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
