'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import './ProximasCitasStep.css';
import SearchableSelect from './SearchableSelect/SearchableSelect';
import DiagnosticoField from './DiagnosticoField/DiagnosticoField';
import {
  PROXIMA_CITA_OPCIONES, PROFESIONAL_OPCIONES, TIPO_DIAGNOSTICO_OPCIONES,
  CAUSA_EXTERNA_OPCIONES, FINALIDAD_OPCIONES, ESPECIALIDAD_OPCIONES, OBSERVACIONES_MAX_LENGTH,
} from './proximasCitasData';
import { LuCalendarCheck, LuNotebookPen, LuSend, LuStethoscope } from 'react-icons/lu';

const SI_NO = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

// Paso 13 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — "Próximas
// citas": seguimiento del paciente (próximo control + profesional),
// diagnóstico de la atención (principal + 3 relacionados, cada uno con
// búsqueda/autocomplete + código CIE, ver DiagnosticoField.jsx), remisión
// (progressive disclosure: Especialidad/Motivo quedan deshabilitados, no
// ocultos, mientras "¿Requiere remisión?" = No — mismo comportamiento del
// legacy, ver captura de referencia) y observaciones clínicas. 4 bloques,
// cada uno su propia card sutil (encargo: "tarjetas o contenedores
// sutiles"). Una sola subsección real, sin scrollspy propio — igual que
// RiesgoStep/FactoresRiesgoStep/MedicamentosStep/RecomendacionesStep,
// expone `scrollToSub` como no-op. Se mantiene SIEMPRE montado (el padre lo
// oculta con `hidden`) para no perder lo ya diligenciado al ir y volver
// entre pasos.
const ProximasCitasStep = forwardRef(function ProximasCitasStep({ hidden }, ref) {
  const [seguimiento, setSeguimiento] = useState({
    proximaCita: '18 a 23 meses', fechaProximaCita: '2026-09-25', profesional: 'Médico',
  });
  const [diagnostico, setDiagnostico] = useState({
    tipo: 'Definitivo', causaExterna: 'ENFERMEDAD GENERAL', finalidad: '10-NO APLICA',
    principal: { texto: 'Abertura artificial, no especificada', codigo: 'Z939' },
    relacionado1: { texto: '', codigo: '' },
    relacionado2: { texto: '', codigo: '' },
    relacionado3: { texto: '', codigo: '' },
  });
  const [remision, setRemision] = useState({ requiere: 'no', especialidad: '', motivo: '' });
  const [observaciones, setObservaciones] = useState('SIMÉTRICAS, MÓVILES, SIN LESIONES NI EDEMA; PULSOS PRESENTES');

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  function updateDiagnosticoField(key, patch) {
    setDiagnostico((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  const requiereRemision = remision.requiere === 'si';

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Próximas citas</h1>
      <p className="pf-section-desc">Registra el seguimiento, el diagnóstico de la atención y, si aplica, la remisión del paciente.</p>

      {/* ---------- Bloque 1: Seguimiento ---------- */}
      <section className="pf-card">
        <div className="pf-card-header-icon">
          <span className="pf-block-icon"><LuCalendarCheck className="icon" aria-hidden="true" /></span>
          <div>
            <h2 className="pf-card-title">Seguimiento</h2>
            <p className="pf-card-desc">El intervalo es el periodo clínico recomendado; la fecha es el control concreto agendado.</p>
          </div>
        </div>

        <div className="pf-grid-3">
          <div className="form-field">
            <label htmlFor="pcs-proxima-cita">Próxima cita</label>
            <select
              id="pcs-proxima-cita" value={seguimiento.proximaCita}
              onChange={(e) => setSeguimiento((p) => ({ ...p, proximaCita: e.target.value }))}
            >
              {PROXIMA_CITA_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="pcs-fecha-proxima-cita">Fecha próxima cita</label>
            <input
              id="pcs-fecha-proxima-cita" type="date" value={seguimiento.fechaProximaCita}
              onChange={(e) => setSeguimiento((p) => ({ ...p, fechaProximaCita: e.target.value }))}
            />
          </div>
          <SearchableSelect
            label="Profesional próxima cita"
            value={seguimiento.profesional}
            onChange={(v) => setSeguimiento((p) => ({ ...p, profesional: v }))}
            options={PROFESIONAL_OPCIONES}
            placeholder="Buscar profesional..."
          />
        </div>
      </section>

      {/* ---------- Bloque 2: Diagnóstico ---------- */}
      <section className="pf-card">
        <div className="pf-card-header-icon">
          <span className="pf-block-icon"><LuStethoscope className="icon" aria-hidden="true" /></span>
          <h2 className="pf-card-title">Diagnóstico</h2>
        </div>

        <div className="pf-grid-3 ac-field-spaced">
          <div className="form-field">
            <label htmlFor="pcs-tipo-diagnostico">Tipo de diagnóstico</label>
            <select
              id="pcs-tipo-diagnostico" value={diagnostico.tipo}
              onChange={(e) => setDiagnostico((p) => ({ ...p, tipo: e.target.value }))}
            >
              {TIPO_DIAGNOSTICO_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="pcs-causa-externa">Causa externa</label>
            <select
              id="pcs-causa-externa" value={diagnostico.causaExterna}
              onChange={(e) => setDiagnostico((p) => ({ ...p, causaExterna: e.target.value }))}
            >
              {CAUSA_EXTERNA_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="pcs-finalidad">Finalidad</label>
            <select
              id="pcs-finalidad" value={diagnostico.finalidad}
              onChange={(e) => setDiagnostico((p) => ({ ...p, finalidad: e.target.value }))}
            >
              {FINALIDAD_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <h3 className="pf-subheading">Diagnósticos</h3>
        <DiagnosticoField
          label="Diagnóstico principal"
          required
          placeholder="Buscar por nombre o código CIE..."
          texto={diagnostico.principal.texto}
          onTextoChange={(v) => updateDiagnosticoField('principal', { texto: v })}
          codigo={diagnostico.principal.codigo}
          onCodigoChange={(v) => updateDiagnosticoField('principal', { codigo: v })}
        />
        <DiagnosticoField
          label="Diagnóstico relacionado 1"
          placeholder="Buscar por nombre o código CIE..."
          texto={diagnostico.relacionado1.texto}
          onTextoChange={(v) => updateDiagnosticoField('relacionado1', { texto: v })}
          codigo={diagnostico.relacionado1.codigo}
          onCodigoChange={(v) => updateDiagnosticoField('relacionado1', { codigo: v })}
        />
        <DiagnosticoField
          label="Diagnóstico relacionado 2"
          placeholder="Buscar por nombre o código CIE..."
          texto={diagnostico.relacionado2.texto}
          onTextoChange={(v) => updateDiagnosticoField('relacionado2', { texto: v })}
          codigo={diagnostico.relacionado2.codigo}
          onCodigoChange={(v) => updateDiagnosticoField('relacionado2', { codigo: v })}
        />
        <DiagnosticoField
          label="Diagnóstico relacionado 3"
          placeholder="Buscar por nombre o código CIE..."
          texto={diagnostico.relacionado3.texto}
          onTextoChange={(v) => updateDiagnosticoField('relacionado3', { texto: v })}
          codigo={diagnostico.relacionado3.codigo}
          onCodigoChange={(v) => updateDiagnosticoField('relacionado3', { codigo: v })}
        />
      </section>

      {/* ---------- Bloque 3: Remisión ---------- */}
      <section className="pf-card">
        <div className="pf-card-header-icon">
          <span className="pf-block-icon"><LuSend className="icon" aria-hidden="true" /></span>
          <h2 className="pf-card-title">Remisión</h2>
        </div>

        <div className="form-field ac-field-spaced">
          <label id="pcs-remision-label">¿Requiere remisión?</label>
          <div className="pf-toggle-group" role="group" aria-labelledby="pcs-remision-label">
            {SI_NO.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`pf-toggle-btn${remision.requiere === o.value ? ' active' : ''}`}
                aria-pressed={remision.requiere === o.value}
                onClick={() => setRemision((p) => ({ ...p, requiere: o.value }))}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pf-grid-2col">
          <SearchableSelect
            label="Especialidad de destino"
            required={requiereRemision}
            disabled={!requiereRemision}
            value={remision.especialidad}
            onChange={(v) => setRemision((p) => ({ ...p, especialidad: v }))}
            options={ESPECIALIDAD_OPCIONES}
            placeholder={requiereRemision ? 'Buscar especialidad...' : 'No aplica'}
          />
          <div className="form-field">
            <label htmlFor="pcs-motivo-remision">
              Motivo de remisión{requiereRemision && <span className="req">*</span>}
            </label>
            <textarea
              id="pcs-motivo-remision" rows={3}
              required={requiereRemision}
              disabled={!requiereRemision}
              placeholder={requiereRemision ? 'Describe el motivo de la remisión' : 'No aplica'}
              value={remision.motivo}
              onChange={(e) => setRemision((p) => ({ ...p, motivo: e.target.value }))}
            />
          </div>
        </div>
      </section>

      {/* ---------- Bloque 4: Observaciones ---------- */}
      <section className="pf-card">
        <div className="pf-card-header-icon">
          <span className="pf-block-icon"><LuNotebookPen className="icon" aria-hidden="true" /></span>
          <h2 className="pf-card-title">Observaciones clínicas</h2>
        </div>

        <div className="form-field">
          <label htmlFor="pcs-observaciones" className="sr-only">Observaciones clínicas</label>
          <textarea
            id="pcs-observaciones" rows={5} maxLength={OBSERVACIONES_MAX_LENGTH}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
          <span className="pcs-char-counter">{observaciones.length}/{OBSERVACIONES_MAX_LENGTH}</span>
        </div>
      </section>
    </div>
  );
});

export default ProximasCitasStep;
