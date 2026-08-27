'use client';

import { useState } from 'react';
import './BloquearCamaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import Button from '@/Components/Button/Button';
import { AREA_LABEL, MOTIVOS_BLOQUEO, PISO_LABEL, SECTOR_LABEL, SEDE_LABEL } from '@/hooks/GestionCamas/mockCamasData';
import { LuLock } from 'react-icons/lu';

// "Bloquear cama" (encargo sección 19) — reemplaza el atajo anterior que
// abría el modal genérico "Cambiar estado" preseleccionado en Bloqueada (ver
// GestionCamas.jsx, case 'bloquear'): a diferencia de ese modal, acá Motivo
// es un catálogo cerrado (MOTIVOS_BLOQUEO, mockCamasData.js) en vez de texto
// libre, y suma Fecha inicio/Fecha fin/Observación — los 4 campos exactos
// del encargo. Motivo arranca en la primera opción del catálogo (mismo
// criterio que el mock del encargo, que ya trae "Infraestructura"
// preseleccionado) en vez de un placeholder vacío.
export default function BloquearCamaModal({ cama, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState(MOTIVOS_BLOQUEO[0].value);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [observacion, setObservacion] = useState('');

  const rangoInvalido = fechaInicio !== '' && fechaFin !== '' && fechaFin < fechaInicio;
  const puedeConfirmar = motivo !== '' && fechaInicio !== '' && fechaFin !== '' && !rangoInvalido;

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onConfirm(cama.id, {
      motivo, fechaInicio, fechaFin, observacion: observacion.trim() || undefined,
    });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card bc-modal-card" role="dialog" aria-modal="true" aria-labelledby="bloquear-cama-title">
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuLock}
            tone="warning"
            title="Bloquear cama"
            titleId="bloquear-cama-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama</label>
              <div className="tf-readonly-value">
                {cama.numero} — {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="bc-motivo">Motivo</label>
              <FormSelect
                id="bc-motivo"
                value={motivo}
                onChange={setMotivo}
                options={MOTIVOS_BLOQUEO}
              />
            </div>

            <div className="bc-row">
              <div className="form-field">
                <label htmlFor="bc-fecha-inicio">Fecha inicio</label>
                <input
                  id="bc-fecha-inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="bc-fecha-fin">Fecha fin</label>
                <input
                  id="bc-fecha-fin"
                  type="date"
                  min={fechaInicio || undefined}
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
            {rangoInvalido && <span className="bc-error">La fecha fin no puede ser anterior a la fecha inicio.</span>}

            <div className="form-field">
              <label htmlFor="bc-observacion">Observación</label>
              <textarea
                id="bc-observacion"
                rows="3"
                placeholder="Detalle adicional del bloqueo (opcional)..."
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={!puedeConfirmar}>Bloquear</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
