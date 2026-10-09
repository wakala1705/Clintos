'use client';

import { useEffect, useState } from 'react';
import { LuCheck, LuRoute } from 'react-icons/lu';
import './DerivacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { DESTINOS_DERIVACION } from '@/hooks/ProgramacionSalaCirugias/tablero/etapas';

// Al mover una cirugía a "Derivación" en el tablero por estado: pide a dónde
// va el paciente (alta, UCI u hospitalización). El destino queda en
// `cirugia.derivacion` y se muestra en su tarjeta.
export default function DerivacionModal({ cirugia, onClose, onSubmit }) {
  const [destino, setDestino] = useState(cirugia.derivacion ?? '');

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (destino) onSubmit(destino);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card dm-modal-card" role="dialog" aria-modal="true" aria-labelledby="dm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuRoute}
            tone="primary"
            title="Derivación del paciente"
            titleId="dm-title"
            subtitle={cirugia.paciente.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="dm-destino">Destino</label>
              <FormSelect
                id="dm-destino"
                value={destino}
                onChange={setDestino}
                options={DESTINOS_DERIVACION}
                placeholder="Selecciona un destino"
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" icon={LuCheck} disabled={!destino}>Derivar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
