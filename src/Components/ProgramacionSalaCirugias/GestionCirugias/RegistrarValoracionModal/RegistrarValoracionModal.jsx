// OCULTO por ahora: "Registrar valoración" vincula una EVAPRE (ver VincularEvapreModal).
// Este formulario manual ya no se monta desde GestionCirugias.jsx.
'use client';

import { useEffect, useRef, useState } from 'react';
import { LuStethoscope } from 'react-icons/lu';
import './RegistrarValoracionModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import FormSelect from '@/Components/FormSelect/FormSelect';
import DatePicker from '@/Components/DatePicker/DatePicker';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  ANESTESIOLOGOS, CONCEPTOS, OPCIONES_ASA, validarValoracion,
} from '@/hooks/ProgramacionSalaCirugias/gestion/valoracion';

function MensajeError({ id, children }) {
  return children ? <span id={id} className="rvm-error" role="alert">{children}</span> : null;
}

// Modal de "Registrar valoración" del paso 3 del chequeo (Gestión de
// cirugías). Al guardar avisa al padre (`onGuardar(datos)`), que aplica el
// resultado al chequeo (ver aplicarValoracion). Los errores solo se muestran
// tras intentar guardar, para no marcar en rojo un formulario recién abierto.
export default function RegistrarValoracionModal({ solicitud, onClose, onGuardar }) {
  const modalRef = useRef(null);
  useModalFocusTrap(modalRef);

  const [hoy] = useState(() => fechaISO(new Date()));
  const [datos, setDatos] = useState(() => ({
    fecha: hoy, anestesiologo: '', asa: '', concepto: '', observaciones: '',
  }));
  const [intento, setIntento] = useState(false);
  const errores = validarValoracion(datos);
  const campo = (k) => (intento ? errores[k] : undefined);
  const set = (k) => (v) => setDatos((d) => ({ ...d, [k]: v }));

  // Escape cierra (el foco queda atrapado en el modal por useModalFocusTrap).
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e) {
    e.preventDefault();
    setIntento(true);
    if (Object.keys(errores).length > 0) return;
    onGuardar({ ...datos, observaciones: datos.observaciones.trim() });
  }

  const obsObligatoria = datos.concepto === 'condiciones' || datos.concepto === 'no-apto';
  let obsLabel = 'Observaciones';
  if (datos.concepto === 'no-apto') obsLabel = 'Motivo *';
  else if (datos.concepto === 'condiciones') obsLabel = 'Condiciones *';

  return (
    <div className="modal-overlay open">
      <div
        ref={modalRef}
        className="modal-card rvm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rvm-title"
      >
        <form onSubmit={handleSubmit} noValidate>
          <ModalHeader
            icon={LuStethoscope}
            tone="primary"
            title="Registrar valoración preanestésica"
            titleId="rvm-title"
            subtitle={solicitud.paciente.nombre}
            onClose={onClose}
            closeLabel="Cerrar registro de valoración"
          />
          <div className="modal-body rvm-body">
            <div className="rvm-grid">
              <div className="form-field">
                <span className="rvm-label" id="rvm-fecha-label">Fecha de la valoración *</span>
                <DatePicker
                  value={datos.fecha}
                  onChange={set('fecha')}
                  ariaLabel="Fecha de la valoración"
                  max={hoy}
                  required
                  invalid={Boolean(campo('fecha'))}
                />
                <MensajeError>{campo('fecha')}</MensajeError>
              </div>
              <div className="form-field">
                <label htmlFor="rvm-anestesiologo">Anestesiólogo *</label>
                <FormSelect
                  id="rvm-anestesiologo"
                  value={datos.anestesiologo}
                  onChange={set('anestesiologo')}
                  options={ANESTESIOLOGOS}
                  placeholder="Selecciona una opción"
                  required
                />
                <MensajeError>{campo('anestesiologo')}</MensajeError>
              </div>
              <div className="form-field">
                <label htmlFor="rvm-asa">Clasificación ASA *</label>
                <FormSelect
                  id="rvm-asa"
                  value={datos.asa}
                  onChange={set('asa')}
                  options={OPCIONES_ASA}
                  placeholder="Selecciona una opción"
                  required
                />
                <MensajeError>{campo('asa')}</MensajeError>
              </div>
              <div className="form-field">
                <label htmlFor="rvm-concepto">Concepto *</label>
                <FormSelect
                  id="rvm-concepto"
                  value={datos.concepto}
                  onChange={set('concepto')}
                  options={CONCEPTOS}
                  placeholder="Selecciona una opción"
                  required
                />
                <MensajeError>{campo('concepto')}</MensajeError>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="rvm-observaciones">{obsLabel}</label>
              <textarea
                id="rvm-observaciones"
                value={datos.observaciones}
                onChange={(e) => set('observaciones')(e.target.value)}
                required={obsObligatoria}
                aria-invalid={Boolean(campo('observaciones'))}
                aria-describedby={campo('observaciones') ? 'rvm-obs-error' : undefined}
              />
              <MensajeError id="rvm-obs-error">{campo('observaciones')}</MensajeError>
            </div>

            {datos.concepto === 'no-apto' && (
              <p className="rvm-aviso" role="status">
                Al guardar como &quot;No apto&quot;, la solicitud quedará bloqueada hasta registrar una nueva valoración.
              </p>
            )}
          </div>
          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar valoración</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
