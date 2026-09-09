'use client';

import { useEffect, useState } from 'react';
import './CatalogoTipoTerceroModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';

// "Catálogo de TERTTEC" (encargo explícito, ver imagen de referencia) --
// picker fijo (sin búsqueda/paginación, a diferencia de
// @/Components/CatalogoAseguradorasModal) para el campo "Régimen" de
// FacturaAgregarModalClasico. Vive en FacturaVistaClasica (no app-wide, ver
// AGENTS.md "Component organization") porque hoy solo lo dispara ese modal
// -- si otro modal de Facturación lo llega a necesitar, se reusa desde acá
// igual que FacturaEditarModalClasico ya reusa CatalogoAseguradorasModal.
// Reusa el scaffolding .modal-overlay/.modal/.modal-body/.modal-footer de
// ../../shared/shared.css en vez del propio (.cam-*) de
// CatalogoAseguradorasModal, porque ese sí necesita ser 100% autocontenido
// para montarse en cualquier feature del proyecto y este no.
const TIPOS_TERCERO_CONTABLE = [
  { tipo: 'EPS', detalle: 'Empresa Promotora de Salud Contributiva' },
  { tipo: 'EPSS', detalle: 'Empresa Promotora de Salud Subsidiada' },
  { tipo: 'PARTJ', detalle: 'Personas naturales juridicas' },
  { tipo: 'ASEG', detalle: 'Aseguradora' },
];

export default function CatalogoTipoTerceroModal({ onSelect, onClose }) {
  const [seleccion, setSeleccion] = useState(TIPOS_TERCERO_CONTABLE[0]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleElegir() {
    if (!seleccion) return;
    onSelect(seleccion.tipo);
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal ctc-modal" role="dialog" aria-modal="true" aria-labelledby="ctc-title">
        <ModalHeader
          title="Catálogo de TERTTEC"
          titleId="ctc-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="modal-body">
          <div className="ctc-table">
            <div className="ctc-row ctc-row-head">
              <span>Tipo</span>
              <span>Detalle</span>
            </div>
            <div className="ctc-list" role="listbox" aria-labelledby="ctc-title">
              {TIPOS_TERCERO_CONTABLE.map((t) => {
                const active = seleccion?.tipo === t.tipo;
                return (
                  <button
                    type="button"
                    key={t.tipo}
                    role="option"
                    aria-selected={active}
                    className={`ctc-row ctc-option${active ? ' active' : ''}`}
                    onClick={() => setSeleccion(t)}
                  >
                    <span className="ctc-tipo">{t.tipo}</span>
                    <span className="ctc-detalle">{t.detalle}</span>
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
