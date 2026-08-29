'use client';

import { useState } from 'react';
import './AsignarTurnoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import FormSelect from '@/Components/FormSelect/FormSelect';
import {
  AREA_TURNO_LABEL, TIPO_TURNO_META, diaLargoLabel,
} from '@/hooks/GestionTurnos/mockProgramacionData';
import { LuCalendarPlus, LuTriangleAlert } from 'react-icons/lu';

// "Descanso" no sale de TIPO_TURNO_META (esa tabla es solo para tipos de
// turno CON horario, ver su comentario en mockProgramacionData.js) — se
// agrega acá aparte porque una celda de descanso no lleva `tipo`/`horario`
// en el modelo de datos (ver constante `D` en ese mismo archivo), a
// diferencia de una celda de turno.
const TIPO_OPTIONS = [
  ...Object.entries(TIPO_TURNO_META).map(([value, m]) => ({ value, label: m.label })),
  { value: 'descanso', label: 'Descanso' },
];

// "Asignar turno" — 2 puntos de entrada con distinta cantidad de campos a
// completar (encargo explícito):
//  · Desde una celda puntual ("Sin asignar" o "Asignar turno" dentro del
//    popover de Descanso): enfermera/fecha/área ya están decididas por la
//    celda clickeada, `locked` las muestra de solo lectura y el usuario solo
//    completa tipo + horario. `form.dayIdxs` queda fijo en `[dayIdx]`.
//  · Desde el botón "+ Asignar turno" del header (sin celda de origen):
//    `locked=false`, enfermera se elige entre `nurses` y los días se tildan
//    por checkbox — el mismo tipo/horario se aplica a todos los días
//    marcados en una sola confirmación (encargo sección 5, "asignación
//    múltiple").
// `nurses` siempre viene acotado por el padre a la programación activa
// (ProgramacionTurnos.jsx) — este componente ya no importa NURSES directo,
// así nunca ofrece asignar a alguien fuera de esa programación (`schedule`
// solo tiene entradas para su `nurseIds`).
// `reemplazaDescanso` viene en true cuando se llega desde el popover de
// Descanso — encargo explícito: advertir que se reemplaza el descanso
// existente antes de confirmar.
export default function AsignarTurnoModal({
  nurseId, dayIdx, days, nurses, locked, reemplazaDescanso, onClose, onAssign,
}) {
  const [form, setForm] = useState({
    nurseId: nurseId ?? '',
    dayIdxs: locked ? [dayIdx] : [],
    tipo: 'manana',
    horaInicio: TIPO_TURNO_META.manana.horario.split(' – ')[0],
    horaFin: TIPO_TURNO_META.manana.horario.split(' – ')[1],
  });

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleDia(i) {
    setForm((f) => ({
      ...f,
      dayIdxs: f.dayIdxs.includes(i) ? f.dayIdxs.filter((x) => x !== i) : [...f.dayIdxs, i],
    }));
  }

  function handleTipoChange(tipo) {
    if (tipo === 'descanso') {
      setForm((f) => ({ ...f, tipo, horaInicio: '', horaFin: '' }));
      return;
    }
    const [horaInicio, horaFin] = TIPO_TURNO_META[tipo].horario.split(' – ');
    setForm((f) => ({ ...f, tipo, horaInicio, horaFin }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.nurseId === '' || form.dayIdxs.length === 0) return;
    onAssign({
      nurseId: form.nurseId,
      dayIdxs: form.dayIdxs,
      tipo: form.tipo,
      horario: form.tipo === 'descanso' ? undefined : `${form.horaInicio} – ${form.horaFin}`,
    });
  }

  const nurse = nurses.find((n) => n.id === form.nurseId);
  const puedeEnviar = form.nurseId !== '' && form.dayIdxs.length > 0;

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
                  <div className="form-field full">
                    <label htmlFor="at-enfermera">Enfermera</label>
                    <FormSelect
                      id="at-enfermera"
                      value={form.nurseId}
                      onChange={(v) => set('nurseId', v)}
                      placeholder="Selecciona una enfermera"
                      options={nurses.map((n) => ({ value: n.id, label: n.nombre }))}
                    />
                  </div>
                  <div className="form-field full">
                    <label id="at-dias-label">Días</label>
                    <div className="at-dias-group" role="group" aria-labelledby="at-dias-label">
                      {days.map((d, i) => (
                        <label key={i} className={`at-dia-option${form.dayIdxs.includes(i) ? ' checked' : ''}`}>
                          <input type="checkbox" checked={form.dayIdxs.includes(i)} onChange={() => toggleDia(i)} />
                          {d.label}
                        </label>
                      ))}
                    </div>
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

              {form.tipo !== 'descanso' && (
                <>
                  <div className="form-field">
                    <label htmlFor="at-hora-inicio">Hora de inicio</label>
                    <input id="at-hora-inicio" type="time" value={form.horaInicio} onChange={(e) => set('horaInicio', e.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="at-hora-fin">Hora de finalización</label>
                    <input id="at-hora-fin" type="time" value={form.horaFin} onChange={(e) => set('horaFin', e.target.value)} required />
                  </div>
                </>
              )}
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
