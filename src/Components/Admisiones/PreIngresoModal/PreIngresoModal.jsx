'use client';

import { useState } from 'react';
import './PreIngresoModal.css';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';

const TIPO_INGRESO_OPTIONS = [
  { value: 'espontaneo', label: 'Espontáneo' },
  { value: 'ambulancia', label: 'Ambulancia' },
  { value: 'referido', label: 'Referido' },
];

const INFO_RELEVANTE_OPTIONS = [
  { value: 'adulto-mayor', label: 'Adulto Mayor' },
  { value: 'pediatrico', label: 'Pediátrico' },
  { value: 'embarazo', label: 'Estado de Embarazo' },
  { value: 'discapacidad', label: 'Persona con Discapacidad' },
  { value: 'victima-violencia', label: 'Víctima de Violencia' },
  { value: 'accidente-transito', label: 'Accidente de tránsito' },
];

// Mismo estado/etiqueta que PATIENT_ESTADO_LABEL en legacy-nueva-cita.js —
// `patient` acá es el registro que ese mismo módulo compartido le entrega a
// Admisiones.jsx vía onPatientConfirmed (ver ese archivo), así que trae la
// misma forma (activo/inactivo/suspendido), no el estado de una admisión.
const PATIENT_ESTADO_LABEL = { activo: 'Activo', inactivo: 'Inactivo', suspendido: 'Suspendido' };
const PATIENT_ESTADO_TONE = { activo: 'success', inactivo: 'neutral', suspendido: 'warn' };

const OBSERVACION_MAX = 150;

// Paso siguiente a elegir/registrar el paciente en el buscador compartido
// (ver Admisiones.jsx: handlePatientConfirmed abre este modal).
export default function PreIngresoModal({ patient, onClose, onSubmit }) {
  const [tipoIngreso, setTipoIngreso] = useState('espontaneo');
  const [infoRelevante, setInfoRelevante] = useState([]);
  const [observacion, setObservacion] = useState('');

  function toggleInfo(value) {
    setInfoRelevante((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  function handleSubmit() {
    onSubmit({ tipoIngreso, infoRelevante, observacion: observacion.trim() });
  }

  return (
    <div className="adm-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal pi-modal">
        <ModalHeader title="Formulario de Pre-ingreso" onClose={onClose} />

        <div className="adm-modal-body">
          <div className="pi-patient-banner">
            <PatientAvatar iniciales={patient.iniciales} className="pi-avatar" />
            <div className="pi-patient-info">
              <div className="pi-patient-name">{patient.nombre}</div>
              <div className="pi-patient-meta">CC {patient.documento}</div>
              <div className="pi-patient-meta">{patient.edad} años · {patient.sexo}</div>
              <div className="pi-patient-meta">{patient.eps}</div>
            </div>
            <Badge tone={PATIENT_ESTADO_TONE[patient.estado]} dot>
              {PATIENT_ESTADO_LABEL[patient.estado] ?? patient.estado}
            </Badge>
          </div>

          <fieldset className="pi-field">
            <legend>Tipo de ingreso<span className="req">*</span></legend>
            <div className="pi-radio-grid">
              {TIPO_INGRESO_OPTIONS.map((o) => (
                <label key={o.value} className={`pi-radio-card${tipoIngreso === o.value ? ' selected' : ''}`}>
                  <span>{o.label}</span>
                  <input
                    type="radio"
                    name="tipoIngreso"
                    value={o.value}
                    checked={tipoIngreso === o.value}
                    onChange={() => setTipoIngreso(o.value)}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="pi-field">
            <legend>Información relevante <span className="opt">(Opcional)</span></legend>
            <div className="pi-checkbox-card">
              <div className="pi-checkbox-grid">
                {INFO_RELEVANTE_OPTIONS.map((o) => (
                  <label key={o.value} className="pi-checkbox">
                    <input
                      type="checkbox"
                      checked={infoRelevante.includes(o.value)}
                      onChange={() => toggleInfo(o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </fieldset>

          <div className="pi-field">
            <label htmlFor="pi-observacion">Observación inicial <span className="opt">(Opcional)</span></label>
            <textarea
              id="pi-observacion"
              rows={3}
              maxLength={OBSERVACION_MAX}
              placeholder="Ej: Refiere dolor en pecho desde hace 1 hora"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
            <div className="pi-char-count">{observacion.length}/{OBSERVACION_MAX}</div>
          </div>
        </div>

        <div className="adm-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar pre-ingreso</Button>
        </div>
      </div>
    </div>
  );
}
