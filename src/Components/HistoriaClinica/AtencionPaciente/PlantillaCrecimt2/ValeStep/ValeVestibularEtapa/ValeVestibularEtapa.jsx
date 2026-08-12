'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './ValeVestibularEtapa.css';
import ValeQuestion from '../ValeQuestion/ValeQuestion';
import { getPreguntasVestibularAplicables } from '../valeData';
import { LuSearchX } from 'react-icons/lu';

// Etapa 4 de VALE — Valoración vestibular. Misma regla de bloqueo que
// ValeDesarrolloEtapa.jsx (no avanza si queda alguna pregunta sin
// responder), pero el filtrado por edad sí es distinto: RANGOS_VESTIBULAR
// no coincide con los cortes de RANGOS_CEI, así que esta etapa sigue
// resolviendo por número (`edadMeses`, derivado del chip elegido en
// Comprensión/Expresión/Interacción — ver edadMesesDesdeRangoCEI en
// ValeStep.jsx) en vez de por coincidencia directa de rango. Estas
// preguntas no llevan código C/E/I (ver encargo) — el campo "Observaciones"
// final NO es obligatorio.
const ValeVestibularEtapa = forwardRef(function ValeVestibularEtapa(
  {
    edadMeses, respuestas, onAnswerChange, onObservacionChange,
    observacionesFinal, onObservacionesFinalChange,
  },
  ref,
) {
  const [errors, setErrors] = useState({});
  const questionRefs = useRef({});

  const preguntas = getPreguntasVestibularAplicables(edadMeses);

  useImperativeHandle(ref, () => ({
    validar() {
      const next = {};
      let firstInvalidId = null;
      preguntas.forEach((p) => {
        if (respuestas[p.id]?.valor == null) {
          next[p.id] = true;
          if (!firstInvalidId) firstInvalidId = p.id;
        }
      });
      setErrors(next);
      if (firstInvalidId) {
        questionRefs.current[firstInvalidId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return Object.keys(next).length === 0;
    },
  }));

  function clearError(id) {
    setErrors((prev) => (prev[id] ? { ...prev, [id]: undefined } : prev));
  }

  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">Valoración vestibular</h1>
      <p className="pf-section-desc">
        {edadMeses != null
          ? 'Preguntas correspondientes al rango de edad seleccionado del paciente.'
          : 'Selecciona el rango de edad del paciente en "Comprensión, expresión e interacción" para ver las preguntas aplicables.'}
      </p>

      <section className="pf-card">
        {edadMeses == null ? (
          <div className="vale-dev-empty">
            <LuSearchX className="icon" aria-hidden="true" />
            <p>Aún no se ha seleccionado el rango de edad del paciente.</p>
          </div>
        ) : preguntas.length === 0 ? (
          <div className="vale-dev-empty">
            <LuSearchX className="icon" aria-hidden="true" />
            <p>El instrumento VALE no tiene preguntas vestibulares definidas para esta edad (aplica de 3 a 12 años 11 meses).</p>
          </div>
        ) : (
          <div className="vale-dev-list">
            {preguntas.map((p) => (
              <ValeQuestion
                key={p.id}
                id={p.id}
                texto={p.texto}
                valor={respuestas[p.id]?.valor ?? null}
                onValorChange={(v) => { onAnswerChange(p.id, v); clearError(p.id); }}
                observacionDirecta={respuestas[p.id]?.observacionDirecta ?? false}
                onObservacionDirectaChange={(v) => onObservacionChange(p.id, v)}
                error={Boolean(errors[p.id])}
                setNodeRef={(el) => { questionRefs.current[p.id] = el; }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="pf-card">
        <div className="form-field">
          <label htmlFor="vale-vest-observaciones">Observaciones</label>
          <textarea
            id="vale-vest-observaciones"
            rows={4}
            placeholder="Observaciones adicionales de la valoración vestibular (opcional)"
            value={observacionesFinal}
            onChange={(e) => onObservacionesFinalChange(e.target.value)}
          />
        </div>
      </section>
    </div>
  );
});

export default ValeVestibularEtapa;
