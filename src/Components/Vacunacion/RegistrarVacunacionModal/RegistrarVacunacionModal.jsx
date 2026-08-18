'use client';

import { useEffect, useState } from 'react';
import './shared/shared.css';
import './RegistrarVacunacionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuCheck } from 'react-icons/lu';
import PacienteStep from './PacienteStep/PacienteStep';
import VacunaStep from './VacunaStep/VacunaStep';
import AplicacionStep from './AplicacionStep/AplicacionStep';
import ConfirmacionStep from './ConfirmacionStep/ConfirmacionStep';
import ExitoStep from './ExitoStep/ExitoStep';

const STEPS = [
  { key: 'paciente', label: 'Paciente' },
  { key: 'vacuna', label: 'Vacuna' },
  { key: 'aplicacion', label: 'Aplicación' },
];

function defaultAplicacion() {
  const now = new Date();
  const fecha = now.toISOString().slice(0, 10);
  const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return { fecha, hora, lote: '', fechaVencimiento: '', fabricante: '', via: '', sitio: '', observaciones: '' };
}

// CTA principal "+ Registrar vacunación" (VacKpiRow no, ver Vacunacion.jsx
// header) y "Registrar aplicación" del menú de fila (VacRowMenu) — mismo
// modal para ambos disparadores: `pacienteInicial` precarga el paciente y
// arranca directo en el paso "vacuna" cuando se abre desde una fila
// (ya se sabe quién es el paciente, no tiene sentido hacerlo buscarlo de
// nuevo); sin ese prop arranca en "paciente" (CTA de la barra de
// herramientas, sin contexto previo).
//
// Wide modal (no drawer, no página propia — encargo explícito) que mantiene
// TODO el flujo (Paciente → Vacuna → Aplicación → Confirmación → Éxito)
// dentro de una sola instancia montada: cada paso es "tonto" (recibe
// value/onChange) y este componente es la única fuente de verdad, así que
// "Atrás" nunca pierde lo ya diligenciado y "Registrar otra vacunación"
// puede resetear todo de una vez sin desmontar/remontar el modal.
export default function RegistrarVacunacionModal({ pacienteInicial, onClose, onVerEsquema }) {
  const [step, setStep] = useState(pacienteInicial ? 'vacuna' : 'paciente');
  const [paciente, setPaciente] = useState(pacienteInicial || null);
  const [vacunaSel, setVacunaSel] = useState(null); // { origen:'esquema', dosis } | { origen:'fuera-esquema', vacuna, motivo }
  const [aplicacion, setAplicacion] = useState(defaultAplicacion);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSelectPaciente(p) {
    setPaciente(p);
    setStep('vacuna');
  }

  function handleContinuarVacuna() {
    setStep('aplicacion');
  }

  function validateAplicacion() {
    const next = {};
    if (!aplicacion.fecha) next.fecha = 'Ingresa la fecha de aplicación.';
    if (!aplicacion.hora) next.hora = 'Ingresa la hora de aplicación.';
    if (!aplicacion.lote.trim()) next.lote = 'Ingresa el lote del biológico.';
    if (!aplicacion.via) next.via = 'Selecciona la vía de administración.';
    if (!aplicacion.sitio) next.sitio = 'Selecciona el sitio de aplicación.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleRegistrarAplicacionClick() {
    if (!validateAplicacion()) return;
    setStep('confirmacion');
  }

  function handleConfirmarRegistro() {
    setStep('exito');
  }

  function handleRegistrarOtra() {
    setPaciente(null);
    setVacunaSel(null);
    setAplicacion(defaultAplicacion());
    setErrors({});
    setStep('paciente');
  }

  const showStepper = step === 'paciente' || step === 'vacuna' || step === 'aplicacion';
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const headerTitle = step === 'confirmacion' ? 'Revisar aplicación'
    : step === 'exito' ? 'Vacunación registrada'
    : 'Registrar vacunación';

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card rv-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rv-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title={headerTitle}
          titleId="rv-modal-title"
          subtitle={step !== 'confirmacion' && step !== 'exito' ? 'Registra la aplicación de una vacuna al paciente.' : null}
          onClose={onClose}
        />

        {showStepper && (
          <div className="rv-stepper" role="tablist" aria-label="Progreso del registro">
            {STEPS.map((s, i) => {
              const state = i < currentStepIndex ? 'done' : i === currentStepIndex ? 'active' : 'upcoming';
              return (
                <div className="rv-stepper-item" key={s.key}>
                  <span className={`rv-stepper-dot ${state}`} aria-hidden="true">
                    {state === 'done' ? <LuCheck className="icon" /> : i + 1}
                  </span>
                  <span className={`rv-stepper-label ${state}`}>{s.label}</span>
                  {i < STEPS.length - 1 && <span className="rv-stepper-connector" aria-hidden="true" />}
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-body rv-modal-body">
          {step === 'paciente' && (
            <PacienteStep onSelect={handleSelectPaciente} />
          )}
          {step === 'vacuna' && paciente && (
            <VacunaStep paciente={paciente} value={vacunaSel} onChange={setVacunaSel} />
          )}
          {step === 'aplicacion' && paciente && vacunaSel && (
            <AplicacionStep
              paciente={paciente}
              vacunaSel={vacunaSel}
              value={aplicacion}
              onChange={(patch) => setAplicacion((prev) => ({ ...prev, ...patch }))}
              errors={errors}
            />
          )}
          {step === 'confirmacion' && paciente && vacunaSel && (
            <ConfirmacionStep paciente={paciente} vacunaSel={vacunaSel} aplicacion={aplicacion} />
          )}
          {step === 'exito' && paciente && vacunaSel && (
            <ExitoStep
              paciente={paciente}
              vacunaSel={vacunaSel}
              onVerEsquema={() => { onVerEsquema(paciente); onClose(); }}
              onRegistrarOtra={handleRegistrarOtra}
              onCerrar={onClose}
            />
          )}
        </div>

        {step === 'vacuna' && (
          <div className="rv-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setStep('paciente')}>← Atrás</button>
            <div className="rv-footer-end">
              <button
                type="button"
                className="btn btn-primary"
                disabled={!isVacunaSelValida(vacunaSel)}
                onClick={handleContinuarVacuna}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 'aplicacion' && (
          <div className="rv-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setStep('vacuna')}>← Atrás</button>
            <div className="rv-footer-end">
              <button type="button" className="btn btn-primary" onClick={handleRegistrarAplicacionClick}>
                Registrar aplicación
              </button>
            </div>
          </div>
        )}

        {step === 'confirmacion' && (
          <div className="rv-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setStep('aplicacion')}>Volver a editar</button>
            <div className="rv-footer-end">
              <button type="button" className="btn btn-primary" onClick={handleConfirmarRegistro}>
                Registrar aplicación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function isVacunaSelValida(vacunaSel) {
  if (!vacunaSel) return false;
  if (vacunaSel.origen === 'esquema') return Boolean(vacunaSel.dosis);
  if (vacunaSel.origen === 'fuera-esquema') return Boolean(vacunaSel.vacuna) && Boolean(vacunaSel.motivo);
  return false;
}
