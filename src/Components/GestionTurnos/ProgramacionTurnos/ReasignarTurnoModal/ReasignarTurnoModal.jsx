'use client';

import { useState } from 'react';
import './ReasignarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, NURSES, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuTriangleAlert, LuUserRoundCog } from 'react-icons/lu';

// "Reasignar turno" — a diferencia de Editar, fecha/horario/tipo/área quedan
// fijos (encargo explícito): lo único que cambia es QUIÉN cubre ese turno.
// "Disponible" = otra enfermera cuya celda ese mismo día está en Descanso o
// Sin asignar (no ya trabajando otro turno) — evita ofrecer un reemplazo que
// de entrada generaría un conflicto nuevo. Si la disponible elegida está en
// Descanso ese día, se avisa la consecuencia antes de confirmar (encargo
// explícito: "mostrar las posibles consecuencias... si existe conflicto").
export default function ReasignarTurnoModal({
  nurseId, dayIdx, cell, schedule, days, onClose, onConfirm,
}) {
  const nurse = NURSES.find((n) => n.id === nurseId);
  const disponibles = NURSES.filter((n) => (
    n.id !== nurseId && ['vacio', 'descanso'].includes(schedule[n.id][dayIdx].estado)
  ));
  const [nuevaEnfermeraId, setNuevaEnfermeraId] = useState('');

  const nuevaEnfermera = NURSES.find((n) => n.id === nuevaEnfermeraId);
  const reemplazaDescanso = nuevaEnfermeraId && schedule[nuevaEnfermeraId][dayIdx].estado === 'descanso';

  function handleSubmit(e) {
    e.preventDefault();
    if (!nuevaEnfermeraId) return;
    onConfirm(nurseId, dayIdx, nuevaEnfermeraId);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card rt-modal-card" role="dialog" aria-modal="true" aria-labelledby="reasignar-turno-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuUserRoundCog}
            tone="primary"
            title="Reasignar turno"
            titleId="reasignar-turno-title"
            subtitle={`${nurse?.nombre} · ${diaLargoLabel(days[dayIdx], dayIdx)}`}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="rt-fixed">
              <div className="tf-readonly-value">{TIPO_TURNO_META[cell.tipo].label} · {cell.horario}</div>
              <div className="tf-readonly-value">{AREA_TURNO_LABEL[nurse?.area]}</div>
            </div>

            <div className="form-field">
              <label htmlFor="rt-enfermera">Nueva enfermera</label>
              <FormSelect
                id="rt-enfermera"
                value={nuevaEnfermeraId}
                onChange={setNuevaEnfermeraId}
                placeholder="Selecciona una enfermera disponible"
                options={disponibles.map((n) => ({ value: n.id, label: n.nombre }))}
              />
            </div>

            {reemplazaDescanso && (
              <div className="tf-warning-note">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                Este cambio reemplazará el descanso programado de {nuevaEnfermera.nombre} ese día.
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!nuevaEnfermeraId}>Reasignar turno</button>
          </div>
        </form>
      </div>
    </div>
  );
}
