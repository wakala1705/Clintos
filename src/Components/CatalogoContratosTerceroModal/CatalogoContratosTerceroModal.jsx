'use client';

import { useEffect, useState } from 'react';
import './CatalogoContratosTerceroModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { CONTRATOS_TERCERO_CATALOGO } from '@/hooks/CatalogoContratosTerceroModal/mockContratosTerceroData';

// 'YYYY-MM-DD' -> 'DD/MM/AAAA'
function fechaCorta(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// "Catálogo de contratos" de un tercero: tabla
// de contratos (ID, vigencia, tipo, régimen, descripción). Componente
// app-wide con chrome propio (.cct-*, mismo criterio que
// CatalogoTipoTerceroModal/.ctc-*), para montarse sin cambios en cualquier
// feature. `onSelect` recibe el
// contrato elegido (objeto completo); clic selecciona, doble clic confirma.
export default function CatalogoContratosTerceroModal({ onSelect, onClose }) {
  const [seleccion, setSeleccion] = useState(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Recibe el registro por parámetro para que el doble clic confirme en el
  // mismo evento; el botón lo llama sin argumentos (usa `seleccion`).
  function handleElegir(item = seleccion) {
    if (!item) return;
    onSelect(item);
    onClose();
  }

  return (
    <div className="cct-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cct-modal" role="dialog" aria-modal="true" aria-labelledby="cct-title">
        <ModalHeader
          title="Catálogo de contratos"
          titleId="cct-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="cct-body">
          <div className="cct-table">
            <div className="cct-grid">
            <div className="cct-row cct-row-head">
              <span className="cct-num">ID</span>
              <span>No. contrato</span>
              <span>Tipo</span>
              <span>Tipo contrato</span>
              <span>Régimen</span>
              <span>Vigencia</span>
              <span>Descripción</span>
            </div>
            <div className="cct-list" role="listbox" aria-labelledby="cct-title">
              {CONTRATOS_TERCERO_CATALOGO.map((c) => {
                const active = seleccion?.id === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    role="option"
                    aria-selected={active}
                    className={`cct-row cct-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(c)}
                    onDoubleClick={() => handleElegir(c)}
                  >
                    <span className="cct-num">{c.id}</span>
                    <span>{c.noContrato}</span>
                    <span>{c.tipo}</span>
                    <span className="cct-tipo-desc">{c.tipoDescripcion}</span>
                    <span>{c.regimen}</span>
                    <span>{fechaCorta(c.vigenciaDesde)} – {fechaCorta(c.vigenciaHasta)}</span>
                    <span>{c.descripcion}</span>
                  </button>
                );
              })}
                          </div>
            </div>
          </div>
        </div>

        <div className="cct-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => handleElegir()} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
