'use client';

import { useRef, useState } from 'react';
import { LuCalendarX, LuTriangleAlert } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { CAUSALES_REPROGRAMACION_CIRUGIA } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import './MarcarIncumplidaModal.css';

// Mismo catálogo de causales que ReprogramarCirugiaModal (CAU). Se guarda el
// idCausal.
const CAUSAL_OPTIONS = CAUSALES_REPROGRAMACION_CIRUGIA.map((c) => ({ value: c.idCausal, label: c.descripcion }));

// Sirve para 1 programación (menú de fila / acción sugerida) o para N (barra
// de lote): la causal elegida se aplica a todas.
export default function MarcarIncumplidaModal({ cirugias, onClose, onSubmit }) {
  const [causal, setCausal] = useState('');
  const [observacion, setObservacion] = useState('');
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  const cantidad = cirugias.length;
  const conInsumos = cirugias.filter((c) => c.farmacia?.numeroPedido).length;
  const titulo = cantidad === 1 ? 'Marcar como incumplida' : `Marcar ${cantidad} programaciones como incumplidas`;
  let avisoInsumos = null;
  if (conInsumos > 0) {
    avisoInsumos = cantidad === 1
      ? 'Esta programación tiene pedido de insumos; se marcará para devolución.'
      : `${conInsumos} de las programaciones tienen pedido de insumos; se marcarán para devolución.`;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!causal) return;
    onSubmit({ causal, observacion: observacion.trim() });
  }

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={cardRef} className="modal-card mim-modal-card" role="dialog" aria-modal="true" aria-labelledby="mim-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarX}
            tone="warning"
            title={titulo}
            titleId="mim-title"
            subtitle={cantidad === 1 ? cirugias[0].paciente.nombre : undefined}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="mim-causal">Causal *</label>
              <FormSelect
                id="mim-causal"
                value={causal}
                onChange={setCausal}
                options={CAUSAL_OPTIONS}
                placeholder="Selecciona una causal"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="mim-observacion">Observación</label>
              <textarea
                id="mim-observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            {avisoInsumos && (
              <p className="tf-warning-note">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                {avisoInsumos}
              </p>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" disabled={!causal}>Marcar incumplida</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
