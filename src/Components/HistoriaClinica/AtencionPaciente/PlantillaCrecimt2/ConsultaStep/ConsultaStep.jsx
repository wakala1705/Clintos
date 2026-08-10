'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import './ConsultaStep.css';

// Paso 1 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx). Se mantiene
// SIEMPRE montado, incluso cuando no es el paso visible (el padre lo oculta
// con `hidden`) — así no se pierde lo ya escrito si el usuario vuelve acá
// desde "02 Antecedentes" (ver AntecedentesStep.jsx, mismo criterio). El
// padre dispara la validación al hacer clic en "Guardar y continuar" a
// través de `ref` (ver handleGuardarContinuar en PlantillaCrecimt2.jsx): si
// `validar()` devuelve false, este componente marca los campos faltantes y
// el padre no avanza de paso.
const ConsultaStep = forwardRef(function ConsultaStep({ hidden }, ref) {
  const [consulta, setConsulta] = useState({ motivoConsulta: '', enfermedadActual: '' });
  const [datosAtencion, setDatosAtencion] = useState({
    fechaPrimeraAtencion: '', momentoVital: 'primera-infancia', tipoConsulta: 'medico', acompanante: '',
  });
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validar() {
      const next = {};
      if (!consulta.motivoConsulta.trim()) next.motivoConsulta = true;
      if (!consulta.enfermedadActual.trim()) next.enfermedadActual = true;
      if (!datosAtencion.fechaPrimeraAtencion) next.fechaPrimeraAtencion = true;
      setErrors(next);
      return Object.keys(next).length === 0;
    },
  }));

  function clearError(field) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Consulta</h1>
      <p className="pf-section-desc">Registra el motivo de consulta y los datos generales de esta atención.</p>

      <section className="pf-card">
        <div className="pf-group">
          <h2 className="pf-card-title">Motivo de consulta y enfermedad actual</h2>
          <div className="pf-grid-2">
            <div className="form-field">
              <label htmlFor="con-motivo">Motivo de consulta<span className="req">*</span></label>
              <textarea
                id="con-motivo" rows={3} placeholder="Describe brevemente el motivo por el que acude a la atención"
                required
                value={consulta.motivoConsulta}
                aria-invalid={errors.motivoConsulta ? 'true' : undefined}
                onChange={(e) => { setConsulta((p) => ({ ...p, motivoConsulta: e.target.value })); clearError('motivoConsulta'); }}
              />
              {errors.motivoConsulta && <span className="pf-field-error">Campo obligatorio para continuar</span>}
            </div>
            <div className="form-field">
              <label htmlFor="con-enfermedad">Enfermedad actual<span className="req">*</span></label>
              <textarea
                id="con-enfermedad" rows={3} placeholder="Describe el inicio, evolución y características de los síntomas actuales"
                required
                value={consulta.enfermedadActual}
                aria-invalid={errors.enfermedadActual ? 'true' : undefined}
                onChange={(e) => { setConsulta((p) => ({ ...p, enfermedadActual: e.target.value })); clearError('enfermedadActual'); }}
              />
              {errors.enfermedadActual && <span className="pf-field-error">Campo obligatorio para continuar</span>}
            </div>
          </div>
        </div>

        <div className="pf-group">
          <h2 className="pf-card-title">Datos de la atención</h2>
          <div className="pf-grid-4">
            <div className="form-field">
              <label htmlFor="dat-fecha">Fecha de primera atención en la ruta<span className="req">*</span></label>
              <input
                id="dat-fecha" type="date" required value={datosAtencion.fechaPrimeraAtencion}
                aria-invalid={errors.fechaPrimeraAtencion ? 'true' : undefined}
                onChange={(e) => { setDatosAtencion((p) => ({ ...p, fechaPrimeraAtencion: e.target.value })); clearError('fechaPrimeraAtencion'); }}
              />
              {errors.fechaPrimeraAtencion && <span className="pf-field-error">Campo obligatorio para continuar</span>}
            </div>
            <div className="form-field">
              <label htmlFor="dat-momento">Momento vital</label>
              <select
                id="dat-momento" value={datosAtencion.momentoVital}
                onChange={(e) => setDatosAtencion((p) => ({ ...p, momentoVital: e.target.value }))}
              >
                <option value="primera-infancia">Primera infancia</option>
                <option value="infancia">Infancia</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="dat-tipo">Tipo de consulta</label>
              <select
                id="dat-tipo" value={datosAtencion.tipoConsulta}
                onChange={(e) => setDatosAtencion((p) => ({ ...p, tipoConsulta: e.target.value }))}
              >
                <option value="medico">Médico</option>
                <option value="enfermeria">Enfermería</option>
                <option value="nutricion">Nutrición</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="dat-acompanante">Nombre del acompañante</label>
              <input
                id="dat-acompanante" type="text" placeholder="Nombre completo" value={datosAtencion.acompanante}
                onChange={(e) => setDatosAtencion((p) => ({ ...p, acompanante: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default ConsultaStep;
