'use client';

import { useState } from 'react';
import './PosponerAlertaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { AHORA_LABEL } from '@/hooks/GestionEnfermeria/mockAlertasData';
import { LuTimer } from 'react-icons/lu';

const OPCIONES_RAPIDAS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
];

// Suma minutos sobre AHORA_LABEL ("14:32") para mostrar la hora a la que
// volverá a estar pendiente — mismo criterio de "nunca Date.now() en vivo"
// que el resto del mock (mockAlertasData.js), solo aritmética sobre el
// string fijo.
function sumarMinutos(hhmm, minutos) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const hh = Math.floor((total % 1440) / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// "Posponer alerta" (encargo sección 11): 15/30/60 min como chips rápidos +
// "Personalizado" (fecha/hora explícita) — mismo patrón mínimo que
// RescheduleModal.jsx (Tareas de enfermería).
export default function PosponerAlertaModal({ alerta, onClose, onConfirm }) {
  const [opcion, setOpcion] = useState(15);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const personalizado = opcion === 'personalizado';
  const puedeConfirmar = !personalizado || (fecha && hora);
  const vuelveA = personalizado ? hora : sumarMinutos(AHORA_LABEL, opcion);

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(alerta.id, { minutos: personalizado ? null : opcion, hastaHora: vuelveA, hastaFecha: personalizado ? fecha : null });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="posponer-alerta-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuTimer}
            tone="primary"
            title="Posponer alerta"
            titleId="posponer-alerta-title"
            subtitle={alerta.titulo}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Posponer por</label>
              <div className="chip-group segmented pam-chips">
                {OPCIONES_RAPIDAS.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    className={`chip-filter${opcion === o.value ? ' active' : ''}`}
                    onClick={() => setOpcion(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={`chip-filter${personalizado ? ' active' : ''}`}
                  onClick={() => setOpcion('personalizado')}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {personalizado ? (
              <div className="pam-custom-grid">
                <div className="form-field">
                  <label htmlFor="posponer-fecha">Fecha</label>
                  <input id="posponer-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required autoFocus />
                </div>
                <div className="form-field">
                  <label htmlFor="posponer-hora">Hora</label>
                  <input id="posponer-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
                </div>
              </div>
            ) : (
              <p className="pam-preview">Volverá a estar pendiente a las <b>{vuelveA}</b>.</p>
            )}
          </div>
          <div className="modal-footer">
            <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!puedeConfirmar}>Posponer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
