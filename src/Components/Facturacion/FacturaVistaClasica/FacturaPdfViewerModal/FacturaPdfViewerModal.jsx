'use client';

import { useEffect } from 'react';
import './FacturaPdfViewerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuPrinter } from 'react-icons/lu';

// Paso 2 del flujo de impresión (ver FacturaVistaClasica.jsx) -- sin
// generación real de PDF (mockFacturasData.js: "solo pinta el front"), se
// visualiza siempre el mismo PDF de ejemplo estático (public/mock/
// factura-ejemplo.pdf) vía <iframe> nativo, independiente de la factura
// impresa -- decisión explícita del encargo, no una limitación a resolver.
export default function FacturaPdfViewerModal({ numero, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal fvc-pdf-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="fvc-pdf-viewer-title">
        <ModalHeader
          icon={LuPrinter}
          title="Vista previa de impresión"
          titleId="fvc-pdf-viewer-title"
          subtitle={`Factura ${numero}`}
          onClose={onClose}
        />

        <div className="modal-body">
          <iframe
            className="fvc-pdf-viewer-frame"
            src="/mock/factura-ejemplo.pdf"
            title={`Vista previa de impresión de la factura ${numero}`}
          />
        </div>

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
