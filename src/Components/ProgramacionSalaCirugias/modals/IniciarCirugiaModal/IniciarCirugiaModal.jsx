'use client';

import { useState } from 'react';
import { LuPlay } from 'react-icons/lu';
import './IniciarCirugiaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { ahoraDemo, horaLocal } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Confirma el inicio de una cirugía: resumen de lo que se va a iniciar y la hora
// real de inicio (editable, por si se registra con retraso). Al confirmar, la
// pantalla abre la hoja de gasto quirúrgico (flujo del circulante).
export default function IniciarCirugiaModal({
  cirugia, salaLabel, onClose, onSubmit,
}) {
  const [hora, setHora] = useState(() => horaLocal(ahoraDemo()));

  function handleSubmit(e) {
    e.preventDefault();
    if (hora) onSubmit(hora);
  }

  const datos = [
    ['Paciente', cirugia.paciente.nombre],
    ['Procedimiento', cirugia.procedimientoPrincipal],
    ['Sala', salaLabel],
    ['Hora programada', `${cirugia.horaInicio} – ${cirugia.horaFin}`],
  ];

  return (
    <div className="modal-overlay open">
      <div className="modal-card icm-modal-card" role="dialog" aria-modal="true" aria-labelledby="icm-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuPlay}
            tone="primary"
            title="Iniciar cirugía"
            titleId="icm-title"
            subtitle={cirugia.paciente.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <dl className="icm-resumen">
              {datos.map(([k, v]) => (
                <div key={k} className="icm-fila">
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="form-field">
              <label htmlFor="icm-hora">Hora real de inicio *</label>
              <input id="icm-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            </div>
            <p className="icm-nota">Al iniciar se abrirá la hoja de gasto quirúrgico para registrar los insumos durante la cirugía.</p>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Volver</Button>
            <Button type="submit" icon={LuPlay} disabled={!hora}>Iniciar cirugía</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
