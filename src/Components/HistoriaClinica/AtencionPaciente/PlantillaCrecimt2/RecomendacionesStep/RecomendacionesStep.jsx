'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './RecomendacionesStep.css';
import RecomendacionCard from './RecomendacionCard/RecomendacionCard';
import { RECOMENDACIONES, buildPlantilla } from './recomendacionesData';
import { LuX } from 'react-icons/lu';

function initialRecomendaciones() {
  return Object.fromEntries(RECOMENDACIONES.map((r) => [r.id, { checked: false, contenido: '' }]));
}

// Paso 12 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — antes "Plan"
// (placeholder inerte sin fuente legacy verificada, ver comentario de
// arriba de PlantillaCrecimt2.jsx), reemplazado por "Recomendaciones al
// cuidador": 8 categorías exactas del legacy (ver recomendacionesData.js),
// cada una como su propia card seleccionable — marcar el checkbox carga la
// plantilla clínica predefinida y expande el textarea para editarla.
// Desmarcar una card con contenido diligenciado pide confirmación antes de
// perderlo (encargo explícito: "evitar pérdida accidental de información").
// Una sola subsección real, sin scrollspy propio — igual que RiesgoStep/
// FactoresRiesgoStep/MedicamentosStep, expone `scrollToSub` como no-op. Se
// mantiene SIEMPRE montado (el padre lo oculta con `hidden`) para no perder
// lo ya diligenciado al ir y volver entre pasos.
const RecomendacionesStep = forwardRef(function RecomendacionesStep({ hidden }, ref) {
  const [recomendaciones, setRecomendaciones] = useState(initialRecomendaciones);
  // Recomendación pendiente de desmarcar, esperando confirmación (ver modal
  // más abajo) — null cuando no hay ninguna confirmación en curso.
  const [pendingUncheckId, setPendingUncheckId] = useState(null);

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  useEffect(() => {
    if (!pendingUncheckId) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setPendingUncheckId(null);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingUncheckId]);

  function handleCheckedChange(id, nextChecked) {
    // Desmarcar una card con contenido ya diligenciado (plantilla intacta o
    // editada) SIEMPRE pasa por confirmación primero — el estado del
    // checkbox no cambia todavía (sigue controlado por React, así que se ve
    // marcado hasta que el usuario confirma o cancela, ver modal). Si nunca
    // se escribió nada (ej. "Otras recomendaciones" recién marcada y
    // desmarcada sin tocarla), no hay nada que perder: se desmarca directo.
    if (!nextChecked && recomendaciones[id].contenido.trim() !== '') {
      setPendingUncheckId(id);
      return;
    }
    setRecomendaciones((prev) => ({
      ...prev,
      [id]: nextChecked
        ? { checked: true, contenido: buildPlantilla(id) }
        : { checked: false, contenido: '' },
    }));
  }

  function updateContenido(id, value) {
    setRecomendaciones((prev) => ({ ...prev, [id]: { ...prev[id], contenido: value } }));
  }

  function confirmUncheck() {
    setRecomendaciones((prev) => ({ ...prev, [pendingUncheckId]: { checked: false, contenido: '' } }));
    setPendingUncheckId(null);
  }

  const pendingLabel = pendingUncheckId
    ? RECOMENDACIONES.find((r) => r.id === pendingUncheckId)?.label
    : '';

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Recomendaciones al cuidador</h1>
      <p className="pf-section-desc">
        Selecciona las recomendaciones que deseas brindar al cuidador. Puedes revisar y editar el contenido
        antes de guardar.
      </p>

      <div className="rc-grid">
        {RECOMENDACIONES.map((rec) => (
          <RecomendacionCard
            key={rec.id}
            label={rec.label}
            checked={recomendaciones[rec.id].checked}
            onCheckedChange={(v) => handleCheckedChange(rec.id, v)}
            contenido={recomendaciones[rec.id].contenido}
            onContenidoChange={(v) => updateContenido(rec.id, v)}
          />
        ))}
      </div>

      {pendingUncheckId && (
        <div className="modal-overlay" role="presentation" onClick={() => setPendingUncheckId(null)}>
          <div
            className="modal-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="rc-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="rc-confirm-title">¿Ocultar &quot;{pendingLabel}&quot;?</h3>
              <button
                type="button" className="modal-close-btn" onClick={() => setPendingUncheckId(null)}
                aria-label="Cancelar" autoFocus
              >
                <LuX className="icon" aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <p className="rc-confirm-text">
                Esta recomendación tiene contenido diligenciado. Si continúas, se perderá el texto que hayas
                escrito o editado.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPendingUncheckId(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmUncheck}>
                Ocultar y borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default RecomendacionesStep;
