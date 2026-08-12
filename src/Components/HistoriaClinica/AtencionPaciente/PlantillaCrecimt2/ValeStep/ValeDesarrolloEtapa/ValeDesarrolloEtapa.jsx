'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './ValeDesarrolloEtapa.css';
import ValeQuestion from '../ValeQuestion/ValeQuestion';
import { RANGOS_CEI, getPreguntasCEIPorRango } from '../valeData';
import { LuCircleAlert, LuSearchX } from 'react-icons/lu';

// Etapa 3 de VALE — Comprensión, expresión e interacción. Es la ÚNICA etapa
// de VALE con un condicional de edad: el profesional elige un rango
// directamente en los chips de abajo (RANGOS_CEI) en vez de escribir una
// edad exacta, y eso filtra qué preguntas se muestran (encargo: "no mostrar
// preguntas que no apliquen por edad"). A diferencia de Perinatal/
// Estructural, esta etapa SÍ bloquea el avance — primero exige un rango
// seleccionado y luego que no quede ninguna pregunta aplicable sin
// responder (alimenta directamente el cálculo de clasificación, ver
// valeData.js): mismo patrón validar()+scroll-al-primer-error que ya usa
// ConsultaStep.jsx.
const ValeDesarrolloEtapa = forwardRef(function ValeDesarrolloEtapa(
  { rangoCEI, onRangoCEIChange, respuestas, onAnswerChange, onObservacionChange },
  ref,
) {
  const [errors, setErrors] = useState({});
  const [rangoError, setRangoError] = useState(false);
  const questionRefs = useRef({});
  const rangoRef = useRef(null);

  const preguntas = rangoCEI ? getPreguntasCEIPorRango(rangoCEI) : [];
  const rangoActual = RANGOS_CEI.find((r) => r.id === rangoCEI);

  useImperativeHandle(ref, () => ({
    validar() {
      if (!rangoCEI) {
        setRangoError(true);
        rangoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      setRangoError(false);

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

  function handleSelectRango(id) {
    onRangoCEIChange(id);
    setRangoError(false);
  }

  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">Comprensión, expresión e interacción</h1>
      <p className="pf-section-desc">
        {rangoActual
          ? `Preguntas correspondientes al rango de edad seleccionado (${rangoActual.label}).`
          : 'Selecciona el rango de edad del paciente para ver las preguntas aplicables.'}
      </p>

      <div className="vale-rango-select" ref={rangoRef}>
        <p className="vale-rango-label" id="vale-rango-label">Rango de edad</p>
        <div className="vale-rango-chips" role="group" aria-labelledby="vale-rango-label">
          {RANGOS_CEI.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`vale-rango-chip${rangoCEI === r.id ? ' active' : ''}`}
              aria-pressed={rangoCEI === r.id}
              onClick={() => handleSelectRango(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        {rangoError && (
          <span className="vale-rango-error">
            <LuCircleAlert className="icon" aria-hidden="true" />
            Selecciona un rango de edad para continuar
          </span>
        )}
      </div>

      <section className="pf-card">
        {!rangoCEI ? (
          <div className="vale-dev-empty">
            <LuSearchX className="icon" aria-hidden="true" />
            <p>Selecciona un rango de edad arriba para ver las preguntas de comprensión, expresión e interacción.</p>
          </div>
        ) : preguntas.length === 0 ? (
          <div className="vale-dev-empty">
            <LuSearchX className="icon" aria-hidden="true" />
            <p>El instrumento VALE no tiene preguntas de comprensión, expresión e interacción definidas para este rango.</p>
          </div>
        ) : (
          <div className="vale-dev-list">
            {preguntas.map((p) => (
              <ValeQuestion
                key={p.id}
                id={p.id}
                codigo={p.categoria}
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
    </div>
  );
});

export default ValeDesarrolloEtapa;
