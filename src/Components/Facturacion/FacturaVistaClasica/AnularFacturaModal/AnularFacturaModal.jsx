'use client';

import { useState } from 'react';
import './AnularFacturaModal.css';
import Button from '@/Components/Button/Button';
import { LuBan, LuTriangleAlert } from 'react-icons/lu';

// Confirmación de "Anular" (RowActionsMenu, ver FacturaVistaClasica.jsx) --
// diálogo centrado sin fila de header, mismo patrón que `.fvc-discard-modal`
// de FacturaAgregarModalClasico (ver AGENTS.md "Modales": está fuera del
// alcance de ModalHeader/@/Components/ModalHeader). Reusa esas clases
// compartidas de ../../shared/shared.css (ya cargado por la página) en vez
// de definir las propias.
//
// Mensaje (encargo explícito, ver imagen de referencia del diálogo legacy
// "ANULACION DE FACTURA" / código M7): admisión ya facturada -- anular
// obliga a refacturar la admisión y el número de factura no se recupera. Es
// aviso del sistema, no el motivo real -- "Motivo de anulación" (encargo
// explícito) es un campo aparte, obligatorio (`.fam-required-mark`, mismo
// criterio que el resto de campos obligatorios de Facturación), que sí
// captura la razón que da el usuario para el registro de auditoría
// (motivoAnulacion, ver FacturaDetalleModalClasico/FacturaDetalleSplit).
// "Sí, anular factura" queda deshabilitado hasta que haya texto.
//
// El padre (FacturaVistaClasica.jsx) renderiza este componente sin
// desmontarlo entre aperturas (guard `if (!factura) return null` acá
// adentro, no `{anulandoFactura && ...}` en el padre) -- por eso el motivo
// se limpia a mano en cerrar/confirmar en vez de depender de que el mount
// reinicie el useState.
//
// `onConfirm` recibe (id, motivo); FacturaVistaClasica.jsx decide qué mutar
// (estadoOverrides -> 'anulada' + motivo/quién/cuándo, mismo criterio que
// estadoFacturacionOverrides/estadoPEOverrides).
export default function AnularFacturaModal({ factura, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');

  if (!factura) return null;

  function handleClose() {
    setMotivo('');
    onClose();
  }

  function handleConfirmar() {
    const value = motivo.trim();
    if (!value) return;
    onConfirm(factura.id, value);
    setMotivo('');
  }

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className="fvc-discard-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="afm-title"
        aria-describedby="afm-desc"
      >
        <div className="fvc-discard-icon"><LuTriangleAlert className="icon" aria-hidden="true" /></div>
        <h3 id="afm-title">{`¿Anular la factura ${factura.numero}?`}</h3>
        <p id="afm-desc">
          <strong>M7 · Admisión facturada.</strong> Al anular la factura, la admisión debe refacturarse y el número de factura se pierde. Esta acción no se puede deshacer.
        </p>

        <div className="form-field afm-motivo">
          <label htmlFor="afm-motivo-input">Motivo de anulación<span className="fam-required-mark">*</span></label>
          <textarea
            id="afm-motivo-input"
            rows="3"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Describe el motivo de la anulación..."
            required
            autoFocus
          />
        </div>

        <div className="fvc-discard-actions">
          <Button variant="secondary" onClick={handleClose}>Mantener factura</Button>
          <Button variant="danger-outline" icon={LuBan} onClick={handleConfirmar} disabled={!motivo.trim()}>Sí, anular factura</Button>
        </div>
      </div>
    </div>
  );
}
