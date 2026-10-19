'use client';

import { useEffect, useState } from 'react';
import './CatalogoTipoTerceroModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';

// "Catálogo de TERTTEC" (tipo de tercero contable) -- picker fijo, sin
// búsqueda/paginación (a diferencia de @/Components/CatalogoAseguradorasModal),
// para los campos "Régimen" (FacturaAgregarModalClasico, Facturación masiva).
// Componente app-wide (ver AGENTS.md "Component organization"): nació en
// Facturación y se promovió acá al necesitarlo también Facturación masiva.
// Chrome de modal autocontenido (.ctc-overlay/.ctc-modal/.ctc-body/
// .ctc-footer, mismo criterio que CatalogoAseguradorasModal/.cam-*) para
// montarse sin cambios en cualquier feature -- solo consume tokens ya
// declarados en el :root de cada una.
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

  // Recibe el registro por parámetro (no lee `seleccion` del state) para que
  // el doble clic de una fila pueda confirmar en el mismo evento sin esperar
  // el próximo render -- mismo patrón que SedePickerModal.jsx ("clic
  // selecciona, doble clic confirma").
  function handleElegir(item = seleccion) {
    if (!item) return;
    onSelect(item.tipo);
    onClose();
  }

  return (
    <div className="ctc-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ctc-modal" role="dialog" aria-modal="true" aria-labelledby="ctc-title">
        <ModalHeader
          title="Catálogo de TERTTEC"
          titleId="ctc-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo"
        />

        <div className="ctc-body">
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
                    onDoubleClick={() => handleElegir(t)}
                  >
                    <span className="ctc-tipo">{t.tipo}</span>
                    <span className="ctc-detalle">{t.detalle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="ctc-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleElegir} disabled={!seleccion}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
