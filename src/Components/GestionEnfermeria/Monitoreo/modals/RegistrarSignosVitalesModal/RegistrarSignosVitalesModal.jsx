'use client';

import { useState } from 'react';
import './RegistrarSignosVitalesModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { LuActivity } from 'react-icons/lu';

function horaActual() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function RegistrarSignosVitalesModal({ onClose, onConfirm, registradoPor }) {
  const [form, setForm] = useState({
    hora: horaActual(), tas: '', tad: '', fr: '', pulso: '', temp: '', satO2: '', observacion: '',
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const tasNum = Number(form.tas);
  const tadNum = Number(form.tad);
  const tam = form.tas !== '' && form.tad !== ''
    ? Math.round((tasNum + 2 * tadNum) / 3)
    : null;

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({
      fecha: new Date().toISOString().slice(0, 10),
      hora: form.hora,
      tas: tasNum,
      tad: tadNum,
      tam,
      fr: Number(form.fr),
      pulso: Number(form.pulso),
      temp: Number(form.temp),
      satO2: Number(form.satO2),
      tomadoPor: registradoPor,
      observacion: form.observacion || null,
      areaFuncional: 'Hospitalización',
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card rsv-modal-card" role="dialog" aria-modal="true" aria-labelledby="rsv-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuActivity}
            tone="primary"
            title="Registrar signos vitales"
            titleId="rsv-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rsv-grid">
              <div className="form-field">
                <label htmlFor="rsv-tas">T.A.S.</label>
                <input id="rsv-tas" type="number" min="0" required value={form.tas} onChange={(e) => set('tas', e.target.value)} autoFocus />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-tad">T.A.D.</label>
                <input id="rsv-tad" type="number" min="0" required value={form.tad} onChange={(e) => set('tad', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-tam">T.A.M. (calculada)</label>
                <div id="rsv-tam" className="tf-readonly-value">{tam ?? '—'}</div>
              </div>
              <div className="form-field">
                <label htmlFor="rsv-fr">F.R.</label>
                <input id="rsv-fr" type="number" min="0" required value={form.fr} onChange={(e) => set('fr', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-pulso">Pulso</label>
                <input id="rsv-pulso" type="number" min="0" required value={form.pulso} onChange={(e) => set('pulso', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-temp">Temp.</label>
                <input id="rsv-temp" type="number" min="0" step="0.1" required value={form.temp} onChange={(e) => set('temp', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-sato2">Sat. O2</label>
                <input id="rsv-sato2" type="number" min="0" max="100" required value={form.satO2} onChange={(e) => set('satO2', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-hora">Hora</label>
                <input id="rsv-hora" type="time" required value={form.hora} onChange={(e) => set('hora', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="rsv-registrado-por">Registrado por</label>
                <div id="rsv-registrado-por" className="tf-readonly-value">{registradoPor}</div>
              </div>
              <div className="form-field full">
                <label htmlFor="rsv-observacion">Observación</label>
                <textarea id="rsv-observacion" rows={3} value={form.observacion} onChange={(e) => set('observacion', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit">Registrar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
