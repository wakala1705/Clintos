'use client';

import { useState } from 'react';
import './AsignarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, NURSES, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuCalendarPlus, LuTriangleAlert } from 'react-icons/lu';

const TIPO_OPTIONS = Object.entries(TIPO_TURNO_META).map(([value, m]) => ({ value, label: m.label }));

// "Asignar turno" — 2 puntos de entrada con distinta cantidad de campos a
// completar (encargo explícito):
//  · Desde una celda puntual ("Sin asignar" o "Asignar turno" dentro del
//    popover de Descanso): enfermera/fecha/área ya están decididas por la
//    celda clickeada, `locked` las muestra de solo lectura y el usuario solo
//    completa tipo + horario.
//  · Desde el botón "+ Asignar turno" del header (sin celda de origen):
//    `locked=false`, enfermera y fecha se eligen acá mismo.
// `reemplazaDescanso` viene en true cuando se llega desde el popover de
// Descanso — encargo explícito: advertir que se reemplaza el descanso
// existente antes de confirmar.
export default function AsignarTurnoModal({
  nurseId, dayIdx, days, locked, reemplazaDescanso, onClose, onAssign,
}) {
  const [form, setForm] = useState({
    nurseId: nurseId ?? '',
    dayIdx: dayIdx ?? '',
    tipo: 'manana',
    horaInicio: TIPO_TURNO_META.manana.horario.split(' – ')[0],
    horaFin: TIPO_TURNO_META.manana.horario.split(' – ')[1],
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
    if (form.nurseId === '' || form.dayIdx === '') return;
    onAssign({
      nurseId: form.nurseId,
      dayIdx: Number(form.dayIdx),
      tipo: form.tipo,
      horario: `${form.horaInicio} – ${form.horaFin}`,
    });
  }

  const nurse = NURSES.find((n) => n.id === form.nurseId);
  const puedeEnviar = form.nurseId !== '' && form.dayIdx !== '';

  return (
    <div className="modal-overlay open">
      <div className="modal-card at-modal-card" role="dialog" aria-modal="true" aria-labelledby="asignar-turno-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarPlus}
            tone="primary"
            title="Asignar turno"
            titleId="asignar-turno-title"
            subtitle={locked ? `${nurse?.nombre} · ${diaLargoLabel(days[dayIdx], dayIdx)}` : undefined}
            onClose={onClose}
          />
          <div className="modal-body">
            {reemplazaDescanso && (
              <div className="tf-warning-note at-warning">
                <LuTriangleAlert className="icon" aria-hidden="true" />
                Esta acción reemplazará el descanso programado de {nurse?.nombre} ese día.
              </div>
            )}

            <div className="at-grid">
              {locked ? (
                <>
                  <div className="form-field">
                    <label>Enfermera</label>
                    <div className="tf-readonly-value">{nurse?.nombre}</div>
                  </div>
                  <div className="form-field">
                    <label>Fecha</label>
                    <div className="tf-readonly-value">{diaLargoLabel(days[dayIdx], dayIdx)}</div>
                  </div>
                  <div className="form-field full">
                    <label>Área o servicio</label>
                    <div className="tf-readonly-value">{AREA_TURNO_LABEL[nurse?.area]}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field">
                    <label htmlFor="at-enfermera">Enfermera</label>
                    <FormSelect
                      id="at-enfermera"
                      value={form.nurseId}
                      onChange={(v) => set('nurseId', v)}
                      placeholder="Selecciona una enfermera"
                      options={NURSES.map((n) => ({ value: n.id, label: n.nombre }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="at-fecha">Fecha</label>
                    <FormSelect
                      id="at-fecha"
                      value={String(form.dayIdx)}
                      onChange={(v) => set('dayIdx', v)}
                      placeholder="Selecciona un día"
                      options={days.map((d, i) => ({ value: String(i), label: diaLargoLabel(d, i) }))}
                    />
                  </div>
                  <div className="form-field full">
                    <label>Área o servicio</label>
                    <div className="tf-readonly-value">{nurse ? AREA_TURNO_LABEL[nurse.area] : 'Se completa al elegir enfermera'}</div>
                  </div>
                </>
              )}

              <div className="form-field full">
                <label htmlFor="at-tipo">Tipo de turno</label>
                <FormSelect id="at-tipo" value={form.tipo} onChange={handleTipoChange} options={TIPO_OPTIONS} />
              </div>

              <div className="form-field">
                <label htmlFor="at-hora-inicio">Hora de inicio</label>
                <input id="at-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
              </div>
              <div className="form-field">
                <label htmlFor="at-hora-fin">Hora de finalización</label>
                <input id="at-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeEnviar}>Asignar turno</button>
          </div>
        </form>
      </div>
    </div>
  );
}
