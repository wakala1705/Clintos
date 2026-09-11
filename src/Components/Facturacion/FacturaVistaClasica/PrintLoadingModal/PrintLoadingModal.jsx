'use client';

import './PrintLoadingModal.css';
import { LuLoaderCircle } from 'react-icons/lu';

// Paso 1 del flujo de impresión (ver FacturaVistaClasica.jsx) -- diálogo
// transitorio sin fila de título/cerrar (excepción documentada en AGENTS.md
// "Modales", mismo criterio que .nc-discard-modal): no hay nada que cerrar,
// se autodesmonta cuando termina el delay simulado en el padre. Sin backend
// real (mockFacturasData.js: "solo pinta el front"), el delay es artificial.
export default function PrintLoadingModal({ numero }) {
  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="modal fvc-print-loading-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={`Generando impresión de la factura ${numero}`}
      >
        <LuLoaderCircle className="icon fvc-print-loading-spinner" />
        <p className="fvc-print-loading-text">Generando impresión...</p>
        <span className="fvc-print-loading-sub">Factura {numero}</span>
      </div>
    </div>
  );
}
