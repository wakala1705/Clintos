'use client';

import { useEffect, useState } from 'react';
import './CatalogoItemsModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ITEMS_CATALOGO } from '@/hooks/Facturacion/mockFacturasData';

// Picker fijo (sin búsqueda/paginación, mismo criterio que
// CatalogoTipoTerceroModal) para el campo "Código" de AgregarItemModal
// (paso 2 "Ítems y servicios" de FacturaAgregarModalClasico, encargo
// explícito, ver imagen de referencia) -- reusa ITEMS_CATALOGO
// (referencia/descripción), el mismo dataset que ya arma los ítems mock de
// cada factura en mockFacturasData.js. `onSelect` entrega la fila completa
// ({ referencia, descripcion }) para que AgregarItemModal precargue el
// código y la descripción a la vez, un solo click.
export default function CatalogoItemsModal({ onSelect, onClose }) {
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleElegir() {
    if (!seleccion) return;
    onSelect(seleccion);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal cim-modal" role="dialog" aria-modal="true" aria-labelledby="cim-title">
        <ModalHeader
          title="Catálogo de ítems"
          titleId="cim-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="modal-body">
          <div className="cim-table">
            <div className="cim-row cim-row-head">
              <span>Referencia</span>
              <span>Descripción</span>
            </div>
            <div className="cim-list" role="listbox" aria-labelledby="cim-title">
              {ITEMS_CATALOGO.map((it) => {
                const active = seleccion?.referencia === it.referencia;
                return (
                  <button
                    type="button"
                    key={it.referencia}
                    role="option"
                    aria-selected={active}
                    className={`cim-row cim-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(it)}
                  >
                    <span className="cim-referencia">{it.referencia}</span>
                    <span className="cim-descripcion">{it.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleElegir} disabled={!seleccion}>Elegir</Button>
        </div>
      </div>
    </div>
  );
}
