'use client';

import { useState } from 'react';
import './NewTaskModal.css';
import {
  AREA_LABEL, PRIORIDADES, RESPONSABLES, TIPOS_TAREA, TURNO_ACTUAL,
} from '@/hooks/GestionEnfermeria/mockTareasData';
import { PACIENTES_PISO, sectorDeCama } from '@/hooks/GestionEnfermeria/mockPanelGeneralData';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCalendarPlus } from 'react-icons/lu';
import FormSelect from '@/Components/FormSelect/FormSelect';

const RECURRENCIAS = [
  { value: 'unica', label: 'Única vez' },
  { value: 'diaria', label: 'Diaria' },
  { value: 'por-turno', label: 'Cada turno' },
  { value: 'semanal', label: 'Semanal' },
];

const VACIO = {
  categoria: 'asistencial',
  tipo: 'signos-vitales',
  nombre: '',
  pacienteId: '',
  ubicacion: '',
  areaOperativa: 'norte',
  prioridad: 'normal',
  responsable: '',
  fecha: '',
  hora: '',
  horaLimite: '',
  recurrencia: 'unica',
  instrucciones: '',
};

// "Nueva tarea" (encargo explícito: modal o drawer — se elige modal, mismo
// scaffolding .modal-overlay/.modal-card que el resto de GestionEnfermeria,
// para no introducir un segundo lenguaje de overlay además del drawer de
// TaskDetailPanel.jsx, que sí necesitaba ser lateral por convivir con la
// tabla ya seleccionada). El toggle "Asistencial/Operativa" decide si el
// formulario pide un paciente real (con cama/área auto-derivadas de
// PACIENTES_PISO, mismo dataset que Panel General) o solo una ubicación +
// área operativa libres — encargo explícito: "una tarea puede estar
// asociada a un paciente o únicamente a un área operativa", nunca ambas ni
// ninguna.
export default function NewTaskModal({ onClose, onCreate }) {
  const [form, setForm] = useState(VACIO);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handlePacienteChange(pacienteId) {
    const p = PACIENTES_PISO.find((x) => x.id === pacienteId);
    setForm((f) => ({
      ...f, pacienteId, areaOperativa: p ? sectorDeCama(p.cama) ?? f.areaOperativa : f.areaOperativa,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (form.categoria === 'asistencial' && !form.pacienteId) {
      window.ncToast?.('Selecciona un paciente para la tarea.');
      return;
    }
    const paciente = form.categoria === 'asistencial' ? PACIENTES_PISO.find((p) => p.id === form.pacienteId) : null;
    onCreate({
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      tipo: form.tipo,
      categoria: form.categoria,
      nombre: form.nombre || TIPOS_TAREA.find((t) => t.value === form.tipo).label,
      paciente: paciente?.paciente ?? null,
      cama: paciente?.cama ?? null,
      ubicacion: form.categoria === 'operativa' ? (form.ubicacion || 'Estación de enfermería') : null,
      areaOperativa: form.areaOperativa,
      prioridad: form.prioridad,
      estado: form.responsable ? 'pendiente' : 'sin-asignar',
      responsable: form.responsable || null,
      turno: 'manana',
      programacion: { label: form.hora ? `Programada · ${form.hora}` : 'Sin programar', tono: 'proxima' },
      ventana: form.hora || 'Sin definir',
      horaLimite: form.horaLimite || form.hora || 'Sin definir',
      instrucciones: form.instrucciones,
    });
  }

  const esAsistencial = form.categoria === 'asistencial';
  const pacienteSeleccionado = PACIENTES_PISO.find((p) => p.id === form.pacienteId);

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-new-modal-card" role="dialog" aria-modal="true" aria-labelledby="new-task-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuCalendarPlus}
            tone="primary"
            title="Nueva tarea"
            titleId="new-task-title"
            subtitle={`${TURNO_ACTUAL.label} · ${TURNO_ACTUAL.rango}`}
            onClose={onClose}
            closeLabel="Cerrar formulario"
          />

          <div className="modal-body">
            <div className="subnav-bar task-new-categoria" role="radiogroup" aria-label="Tipo de vínculo">
              <button type="button" className={`subnav-tab${esAsistencial ? ' active' : ''}`} aria-pressed={esAsistencial} onClick={() => set('categoria', 'asistencial')}>
                Asistencial · con paciente
              </button>
              <button type="button" className={`subnav-tab${!esAsistencial ? ' active' : ''}`} aria-pressed={!esAsistencial} onClick={() => set('categoria', 'operativa')}>
                Operativa · solo área
              </button>
            </div>

            <div className="task-new-grid">
              <div className="form-field">
                <label htmlFor="nt-tipo">Tipo de tarea</label>
                <FormSelect id="nt-tipo" value={form.tipo} onChange={(v) => set('tipo', v)} options={TIPOS_TAREA} />
              </div>
              <div className="form-field">
                <label htmlFor="nt-nombre">Nombre de la tarea</label>
                <input id="nt-nombre" type="text" placeholder="Ej. Control de signos vitales" value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
              </div>

              {esAsistencial ? (
                <>
                  <div className="form-field">
                    <label htmlFor="nt-paciente">Paciente</label>
                    <FormSelect
                      id="nt-paciente"
                      value={form.pacienteId}
                      onChange={handlePacienteChange}
                      placeholder="Selecciona un paciente"
                      options={PACIENTES_PISO.map((p) => ({ value: p.id, label: `${p.paciente} · ${p.cama}` }))}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="nt-cama">Habitación / cama</label>
                    <input id="nt-cama" type="text" disabled value={pacienteSeleccionado?.cama ?? ''} placeholder="Se completa al elegir paciente" />
                  </div>
                </>
              ) : (
                <div className="form-field full">
                  <label htmlFor="nt-ubicacion">Ubicación</label>
                  <input id="nt-ubicacion" type="text" placeholder="Ej. Estación de enfermería" value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="nt-area">Área operativa</label>
                <FormSelect
                  id="nt-area"
                  value={form.areaOperativa}
                  disabled={esAsistencial}
                  onChange={(v) => set('areaOperativa', v)}
                  options={[{ value: 'norte', label: AREA_LABEL.norte }, { value: 'sur', label: AREA_LABEL.sur }]}
                />
              </div>
              <div className="form-field">
                <label htmlFor="nt-prioridad">Prioridad</label>
                <FormSelect id="nt-prioridad" value={form.prioridad} onChange={(v) => set('prioridad', v)} options={PRIORIDADES} />
              </div>

              <div className="form-field">
                <label htmlFor="nt-responsable">Responsable</label>
                <FormSelect
                  id="nt-responsable"
                  value={form.responsable}
                  onChange={(v) => set('responsable', v)}
                  options={[{ value: '', label: 'Sin asignar' }, ...RESPONSABLES.map((r) => ({ value: r, label: r }))]}
                />
              </div>
              <div className="form-field">
                <label htmlFor="nt-recurrencia">Recurrencia</label>
                <FormSelect id="nt-recurrencia" value={form.recurrencia} onChange={(v) => set('recurrencia', v)} options={RECURRENCIAS} />
              </div>

              <div className="form-field">
                <label htmlFor="nt-fecha">Fecha</label>
                <input id="nt-fecha" type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="nt-hora">Hora</label>
                <input id="nt-hora" type="time" value={form.hora} onChange={(e) => set('hora', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="nt-hora-limite">Fecha límite</label>
                <input id="nt-hora-limite" type="time" value={form.horaLimite} onChange={(e) => set('horaLimite', e.target.value)} />
              </div>

              <div className="form-field full">
                <label htmlFor="nt-instrucciones">Instrucciones</label>
                <textarea id="nt-instrucciones" rows={3} placeholder="Detalle lo que la persona responsable debe hacer..." value={form.instrucciones} onChange={(e) => set('instrucciones', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear tarea</button>
          </div>
        </form>
      </div>
    </div>
  );
}
