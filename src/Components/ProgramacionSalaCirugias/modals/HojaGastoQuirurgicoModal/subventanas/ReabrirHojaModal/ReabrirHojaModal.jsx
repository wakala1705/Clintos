'use client';

import { useEffect, useState } from 'react';
import { LuLockOpen } from 'react-icons/lu';
import './ReabrirHojaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { reabrirHoja } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

export default function ReabrirHojaModal({ onConfirmar, onClose }) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    // Valida con la misma regla de reabrirHoja (motivo obligatorio).
    const r = reabrirHoja({ reaperturas: [] }, motivo, '');
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onConfirmar(motivo.trim());
  }

  return (
    <div className="modal-overlay open" role="presentation">
      <div className="modal-card rhm-card" role="dialog" aria-modal="true" aria-labelledby="rhm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader icon={LuLockOpen} tone="warning" title="Reabrir hoja de gasto" titleId="rhm-title" onClose={onClose} />
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="rhm-motivo">Motivo de la reapertura</label>
              <textarea
                id="rhm-motivo"
                rows={4}
                autoFocus
                value={motivo}
                aria-invalid={!!error}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  setError('');
                }}
              />
              {error && <div className="rhm-error" role="alert">{error}</div>}
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" icon={LuLockOpen}>Reabrir hoja</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
