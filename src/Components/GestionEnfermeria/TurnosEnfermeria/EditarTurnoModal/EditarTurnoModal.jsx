'use client';

import { useState } from 'react';
import './EditarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/GestionEnfermeria/TareasEnfermeria/NewTaskModal/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, NURSES, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionEnfermeria/mockTurnosData';
import { LuPencil } from 'react-icons/lu';

const TIPO_OPTIONS = Object.entries(TIPO_TURNO_META).map(([value, m]) => ({ value, label: m.label }));

// "Editar turno" — prellena enfermera/fecha/tipo/horario/área a partir de la
// celda clickeada (encargo explícito) y permite moverlo de enfermera/día
// además de ajustar tipo y horario custom. Mismo scaffolding .modal-overlay/
// .modal-card + ModalHeader que el resto de GestionEnfermeria (NewTaskModal/
// ReassignModal) — sin patrón visual nuevo. El Área operativa se muestra
// solo-lectura porque es propiedad de la enfermera elegida, no del turno en
// sí (mismo criterio que el campo "Área operativa" de NewTaskModal cuando
// depende del paciente elegido).
export default function EditarTurnoModal({
  nurseId, dayIdx, cell, days, onClose, onSave,
}) {
  const nurse = NURSES.find((n) => n.id === nurseId);
  const [form, setForm] = useState({
    nurseId,
    dayIdx,
    tipo: cell.tipo,
    horaInicio: cell.horario.split(' – ')[0],
    horaFin: cell.horario.split(' – ')[1],
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleTipoChange(tipo) {
    const [horaInicio, horaFin] = TIPO_TURNO_META[tipo].horario.split(' – ');
    setForm((f) => ({ ...f, tipo, horaInicio, horaFin }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(nurseId, dayIdx, {
      nurseId: form.nurseId,
      dayIdx: form.dayIdx,
      tipo: form.tipo,
      horario: `${form.horaInicio} – ${form.horaFin}`,
    });
  }

  const formNurse = NURSES.find((n) => n.id === form.nurseId);

  return (
    <div className="modal-overlay open">
      <div className="modal-card et-modal-card" role="dialog" aria-modal="true" aria-labelledby="editar-turno-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuPencil}
            tone="primary"
            title="Editar turno"
            titleId="editar-turno-title"
            subtitle={nurse?.nombre}
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="et-grid">
              <div className="form-field">
                <label htmlFor="et-enfermera">Enfermera</label>
                <FormSelect
                  id="et-enfermera"
                  value={form.nurseId}
                  onChange={(v) => set('nurseId', v)}
                  options={NURSES.map((n) => ({ value: n.id, label: n.nombre }))}
                />
              </div>
              <div className="form-field">
                <label htmlFor="et-fecha">Fecha</label>
                <FormSelect
                  id="et-fecha"
                  value={String(form.dayIdx)}
                  onChange={(v) => set('dayIdx', Number(v))}
                  options={days.map((d, i) => ({ value: String(i), label: diaLargoLabel(d, i) }))}
                />
              </div>

              <div className="form-field">
                <label htmlFor="et-tipo">Tipo de turno</label>
                <FormSelect id="et-tipo" value={form.tipo} onChange={handleTipoChange} options={TIPO_OPTIONS} />
              </div>
              <div className="form-field">
                <label>Área operativa</label>
                <div className="tf-readonly-value">{AREA_TURNO_LABEL[formNurse?.area]}</div>
              </div>

              <div className="form-field">
                <label htmlFor="et-hora-inicio">Hora de inicio</label>
                <input id="et-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="et-hora-fin">Hora de finalización</label>
                <input id="et-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}
