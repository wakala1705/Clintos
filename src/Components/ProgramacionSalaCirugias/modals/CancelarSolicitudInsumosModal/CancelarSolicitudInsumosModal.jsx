'use client';

import { useEffect, useState } from 'react';
import { LuCheck, LuPackageX } from 'react-icons/lu';
import './CancelarSolicitudInsumosModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import CatalogPickerTrigger from '../../CatalogPickerTrigger/CatalogPickerTrigger';
import CatalogoCausalesModal from '../CatalogoCausalesModal/CatalogoCausalesModal';
import { CAUSALES_REPROGRAMACION_CIRUGIA } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Réplica de la ventana legada "Causal de Cancelación de Programación"
// (encargo explícito, captura adjunta), abierta desde "Cancelar solicitud"
// en la tab Insumos del detalle: Causal de anulación (con su buscador "…" =
// CatalogoCausalesModal, la misma ventana "Causales de anulación (CAU)" que
// ya usa Reprogramar) + Observación + Validar/Cancelar. La causal es
// obligatoria; la observación, opcional.
export default function CancelarSolicitudInsumosModal({ onClose, onSubmit }) {
  const [causal, setCausal] = useState('');
  const [observacion, setObservacion] = useState('');
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const causalSeleccionada = CAUSALES_REPROGRAMACION_CIRUGIA.find((c) => c.idCausal === causal);

  // Con el catálogo abierto, Escape cierra solo el catálogo (su propio
  // listener), no también esta ventana.
  useEffect(() => {
    if (catalogoAbierto) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [catalogoAbierto, onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!causalSeleccionada) return;
    onSubmit({ causal: causalSeleccionada, observacion: observacion.trim() });
  }

  return (
    <>
      <div className="modal-overlay open">
        <div className="modal-card csim-modal-card" role="dialog" aria-modal="true" aria-labelledby="csim-title">
          <form onSubmit={handleSubmit}>
            <ModalHeader
              icon={LuPackageX}
              tone="danger"
              title="Causal de Cancelación de Programación"
              titleId="csim-title"
              onClose={onClose}
            />
            <div className="modal-body">
              <div className="form-field">
                <label htmlFor="csim-causal">Causal de anulación</label>
                <CatalogPickerTrigger
                  id="csim-causal"
                  label={causalSeleccionada ? `${causalSeleccionada.idCausal} - ${causalSeleccionada.descripcion}` : undefined}
                  placeholder="Selecciona una causal"
                  open={catalogoAbierto}
                  onClick={() => setCatalogoAbierto(true)}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="csim-observacion">Observación</label>
                <textarea
                  id="csim-observacion"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="submit" icon={LuCheck} disabled={!causalSeleccionada}>Validar</Button>
            </div>
          </form>
        </div>
      </div>

      {catalogoAbierto && (
        <CatalogoCausalesModal
          causales={CAUSALES_REPROGRAMACION_CIRUGIA}
          value={causal}
          onSelect={setCausal}
          onClose={() => setCatalogoAbierto(false)}
        />
      )}
    </>
  );
}
