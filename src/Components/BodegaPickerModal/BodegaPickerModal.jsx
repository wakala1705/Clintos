'use client';

import { useEffect, useState } from 'react';
import './BodegaPickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { BODEGAS_CATALOGO } from '@/hooks/Bodega/bodega';

// Picker fijo (sin búsqueda/paginación, catálogo corto), app-wide porque lo
// disparan tanto BodegaPickerButton (gate post-login de Home + meta-item
// "Bodega:" de Solicitudes) -- ver AGENTS.md "Component organization".
// Scaffolding de overlay/modal propio (.bdg-overlay/.bdg-modal/.bdg-body/
// .bdg-footer), no el .modal-overlay/.modal genérico de un shared.css por
// feature: al montarse desde 2+ features (Home, InsumosFarmacia) no hay
// garantía de que ese shared.css esté cargado -- mismo criterio que
// AllModulesModal.css (.amm-overlay/.amm-modal).
export default function BodegaPickerModal({ bodega, onSelect, onClose }) {
  const [seleccion, setSeleccion] = useState(bodega);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function confirmar(b) {
    onSelect(b);
    onClose();
  }

  function handleElegir() {
    if (!seleccion) return;
    confirmar(seleccion);
  }

  return (
    <div className="bdg-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bdg-modal" role="dialog" aria-modal="true" aria-labelledby="bdg-title">
        <ModalHeader
          title="Seleccionar bodega"
          titleId="bdg-title"
          onClose={onClose}
          closeLabel="Cerrar selección de bodega"
        />

        <div className="bdg-body">
          <div className="bdg-table">
            <div className="bdg-row bdg-row-head">
              <span>Id. Grupo</span>
              <span>Descripción</span>
            </div>
            <div className="bdg-list" role="listbox" aria-labelledby="bdg-title">
              {BODEGAS_CATALOGO.map((b) => {
                const active = seleccion?.idGrupo === b.idGrupo;
                return (
                  <button
                    type="button"
                    key={b.idGrupo}
                    role="option"
                    aria-selected={active}
                    className={`bdg-row bdg-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(b)}
                    onDoubleClick={() => confirmar(b)}
                  >
                    <span className="bdg-id">{b.idGrupo}</span>
                    <span className="bdg-descripcion">{b.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bdg-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleElegir} disabled={!seleccion}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
