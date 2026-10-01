'use client';

import { useEffect, useState } from 'react';
import { LuPenLine } from 'react-icons/lu';
import './FirmaPinModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { pinValido } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// El PIN es simulado (acepta cualquier PIN de 4 dígitos); la verificación real
// depende de la autenticación del producto.
export default function FirmaPinModal({ rol, nombre, onConfirmar, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!pinValido(pin)) {
      setError(true);
      return;
    }
    onConfirmar();
  }

  return (
    <div className="modal-overlay open" role="presentation">
      <div className="modal-card fpm-card" role="dialog" aria-modal="true" aria-labelledby="fpm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader icon={LuPenLine} tone="primary" title={`Firmar como ${rol}`} titleId="fpm-title" onClose={onClose} />
          <div className="modal-body">
            <p className="fpm-nombre">{nombre || '—'}</p>
            <div className="form-field">
              <label htmlFor="fpm-pin">PIN de firma (4 dígitos)</label>
              <input
                id="fpm-pin"
                className="fpm-input"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                autoFocus
                value={pin}
                aria-invalid={error}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setError(false);
                }}
              />
              {error && <div className="fpm-error" role="alert">PIN inválido</div>}
            </div>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" icon={LuPenLine}>Firmar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
