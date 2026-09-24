'use client';

import { useEffect, useState } from 'react';
import './RecetarioVozModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import {
  PRESENTACIONES, UNIDADES_MEDIDA, UNIDADES_TIEMPO, VIAS_ADMINISTRACION,
} from '@/hooks/HistoriaClinica/mockCatalogoOrdenes';
import { PROCESAMIENTO_MS, RECETA_VOZ_MOCK, TRANSCRIPCION_MOCK } from '@/hooks/HistoriaClinica/mockRecetarioVoz';
import {
  LuCheck, LuLoaderCircle, LuMic, LuRotateCcw, LuSquare,
} from 'react-icons/lu';

// 4 ticks por segundo: el cronómetro avanza cada 4 y la transcripción suma
// una palabra cada 2 (~2 palabras/s, ritmo de dictado pausado).
const TICK_MS = 250;
const PALABRAS = TRANSCRIPCION_MOCK.split(' ');

function formatTiempo(segundos) {
  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function labelDe(opciones, value) {
  return opciones.find((o) => o.value === value)?.label ?? value;
}

// Modal "Recetario por voz" (encargo explícito, ver referencias) — se abre
// desde el botón de micrófono de ItemFormPanel. Dictado SIMULADO (sin
// reconocimiento de voz real, ver @/hooks/HistoriaClinica/mockRecetarioVoz):
//   inicial    → "Grabar receta"
//   grabando   → cronómetro + "Grabando…" + transcripción que aparece palabra
//                a palabra; "Detener" (danger) corta
//   procesando → spinner breve mientras "interpreta" la receta
//   resultado  → transcripción + campos reconocidos; "Usar receta" los
//                devuelve vía `onUsarReceta` (NuevaOrdenForm precarga
//                Medicamentos con ellos) o "Grabar de nuevo"
// El padre lo monta solo mientras está abierto (`{open && <RecetarioVozModal/>}`
// en ItemFormPanel.jsx), así cada apertura arranca de cero sin reset manual.
// Scaffolding .modal-overlay/.modal-card/... de HistoriaClinica/shared/shared.css.
export default function RecetarioVozModal({ onClose, onUsarReceta }) {
  const [estado, setEstado] = useState('inicial');
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (estado !== 'grabando') return undefined;
    const id = setInterval(() => setTicks((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, [estado]);

  useEffect(() => {
    if (estado !== 'procesando') return undefined;
    const id = setTimeout(() => setEstado('resultado'), PROCESAMIENTO_MS);
    return () => clearTimeout(id);
  }, [estado]);

  const segundos = Math.floor(ticks / 4);
  const palabrasVisibles = Math.min(PALABRAS.length, Math.floor(ticks / 2));
  const transcripcionParcial = PALABRAS.slice(0, palabrasVisibles).join(' ');

  function grabar() {
    setTicks(0);
    setEstado('grabando');
  }

  const r = RECETA_VOZ_MOCK;
  const campos = [
    { label: 'Medicamento', value: r.item.nombre },
    { label: 'Dosis', value: `${r.dosis} ${labelDe(UNIDADES_MEDIDA, r.unidad).toLowerCase()}` },
    { label: 'Presentación', value: labelDe(PRESENTACIONES, r.presentacion) },
    { label: 'Vía', value: labelDe(VIAS_ADMINISTRACION, r.via) },
    { label: 'Frecuencia', value: `Cada ${r.frecuenciaValor} ${labelDe(UNIDADES_TIEMPO, r.frecuenciaUnidad).toLowerCase()}` },
    { label: 'Duración', value: `${r.duracionValor} ${labelDe(UNIDADES_TIEMPO, r.duracionUnidad).toLowerCase()}` },
  ];

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card rvm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rvm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Recetario por voz" titleId="rvm-title" onClose={onClose} autoFocusClose />

        <div className="modal-body rvm-body">
          {estado !== 'resultado' && (
            <p className="rvm-hint">
              Diga la receta claramente. Ejemplo:{' '}
              <em>Amoxicilina 500 miligramos cada 8 horas por 7 días oral</em>
            </p>
          )}

          {estado === 'inicial' && (
            <Button variant="primary" icon={LuMic} onClick={grabar}>Grabar receta</Button>
          )}

          {estado === 'grabando' && (
            <>
              <Button variant="danger" icon={LuSquare} onClick={() => setEstado('procesando')}>Detener</Button>
              <div className="rvm-timer" role="timer" aria-label={`Tiempo de grabación ${formatTiempo(segundos)}`}>
                {formatTiempo(segundos)}
              </div>
              <span className="rvm-status" aria-live="polite">
                <span className="rvm-rec-dot" aria-hidden="true" />
                Grabando…
              </span>
              <p className="rvm-transcript" aria-live="polite">
                {transcripcionParcial || <span className="rvm-transcript-placeholder">Escuchando…</span>}
              </p>
            </>
          )}

          {estado === 'procesando' && (
            <div className="rvm-processing" aria-live="polite">
              <LuLoaderCircle className="icon rvm-spin" aria-hidden="true" />
              Interpretando receta…
            </div>
          )}

          {estado === 'resultado' && (
            <div className="rvm-result" aria-live="polite">
              <span className="rvm-result-label">Transcripción</span>
              <p className="rvm-result-transcript">“{TRANSCRIPCION_MOCK}”</p>
              <dl className="rvm-fields">
                {campos.map((c) => (
                  <div key={c.label} className="rvm-field">
                    <dt>{c.label}</dt>
                    <dd>{c.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {estado === 'resultado' ? (
            <>
              <Button variant="secondary" icon={LuRotateCcw} onClick={grabar}>Grabar de nuevo</Button>
              <Button variant="primary" icon={LuCheck} onClick={() => onUsarReceta(RECETA_VOZ_MOCK)}>Usar receta</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          )}
        </div>
      </div>
    </div>
  );
}
