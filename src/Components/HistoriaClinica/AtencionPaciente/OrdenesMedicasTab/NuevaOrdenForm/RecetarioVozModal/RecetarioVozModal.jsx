'use client';

import { useEffect, useState } from 'react';
import './RecetarioVozModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { UNIDADES_MEDIDA, VIAS_ADMINISTRACION } from '@/hooks/HistoriaClinica/mockCatalogoOrdenes';
import { parsearReceta, PROCESAMIENTO_MS, TRANSCRIPCION_MOCK } from '@/hooks/HistoriaClinica/mockRecetarioVoz';
import {
  LuCheck, LuLoaderCircle, LuMic, LuRotateCcw, LuSquare, LuTriangleAlert,
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

function tiempoTexto({ valor, unidad }) {
  const singular = valor === '1';
  if (unidad === 'horas') return `${valor} ${singular ? 'hora' : 'horas'}`;
  return `${valor} ${singular ? 'día' : 'días'}`;
}

// camposExtraidos/armarItemOrden viven fuera del componente a propósito: con
// `reactCompiler: true` (next.config.mjs), el compilador memoiza cada closure
// del render usando como dependencias las propiedades que lee (`datos.dosis`,
// `medicamento.id`...) y las evalúa EN CADA RENDER, aunque la función solo
// corra al hacer clic — con `datos === null` (antes de "Parsear") eso
// reventaba con "Cannot read properties of null (reading 'dosis')". Fuera del
// componente, la única dependencia que ve el compilador es `datos` entero.
const CAMPOS_VACIOS = ['Medicamento', 'Dosis', 'Vía', 'Frecuencia', 'Duración']
  .map((label) => ({ label, value: null }));

function camposExtraidos(datos) {
  if (!datos) return CAMPOS_VACIOS;
  return [
    { label: 'Medicamento', value: datos.medicamento ? datos.medicamento.nombre : null },
    { label: 'Dosis', value: datos.dosis && datos.unidad ? `${datos.dosis} ${labelDe(UNIDADES_MEDIDA, datos.unidad).toLowerCase()}` : null },
    { label: 'Vía', value: datos.via ? labelDe(VIAS_ADMINISTRACION, datos.via) : null },
    { label: 'Frecuencia', value: datos.frecuencia ? `Cada ${tiempoTexto(datos.frecuencia)}` : null },
    { label: 'Duración', value: datos.duracion ? tiempoTexto(datos.duracion) : null },
  ];
}

// Mismo shape que handleAgregar de ItemFormPanel.jsx.
function armarItemOrden(datos) {
  const m = datos.medicamento;
  return {
    id: `medicamentos-${m.id}-${Date.now()}`,
    descripcion: m.nombre,
    servicioContratado: m.servicioContratado ?? true,
    dosis: datos.dosis ?? '',
    unidad: datos.unidad ?? '',
    presentacion: datos.presentacion ?? '',
    via: datos.via ?? '',
    frecuencia: datos.frecuencia ? `Cada ${tiempoTexto(datos.frecuencia)}` : '',
    duracion: datos.duracion ? tiempoTexto(datos.duracion) : '',
    cantidad: '',
    prioritario: false,
    observaciones: '',
  };
}

// Modal "Recetario por voz" (encargo explícito, ver referencias) — se abre
// desde el botón de micrófono de ItemFormPanel. Dictado SIMULADO (ver
// @/hooks/HistoriaClinica/mockRecetarioVoz):
//   inicial    → "Grabar receta"
//   grabando   → cronómetro + "Grabando…" + transcripción en vivo; "Detener"
//   procesando → spinner breve mientras "transcribe"
//   revision   → 2 bloques (referencia): "Transcripción detectada" (textarea
//                editable + Regrabar/Parsear) y "Datos extraídos" (5 campos,
//                "No detectado" hasta parsear, aviso ámbar si el medicamento
//                no está en el vademécum). "Confirmar y agregar" sube el ítem
//                ya armado vía `onConfirmar` (NuevaOrdenForm lo agrega a
//                Medicamentos), mismo shape que handleAgregar de ItemFormPanel.
// El padre lo monta solo mientras está abierto, así cada apertura arranca de
// cero. Scaffolding .modal-overlay/.modal-card/... de HistoriaClinica/shared/shared.css.
export default function RecetarioVozModal({ onClose, onConfirmar }) {
  const [estado, setEstado] = useState('inicial');
  const [ticks, setTicks] = useState(0);
  const [transcripcion, setTranscripcion] = useState('');
  const [datos, setDatos] = useState(null);

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
    const id = setTimeout(() => {
      setTranscripcion(TRANSCRIPCION_MOCK);
      setEstado('revision');
    }, PROCESAMIENTO_MS);
    return () => clearTimeout(id);
  }, [estado]);

  const segundos = Math.floor(ticks / 4);
  const palabrasVisibles = Math.min(PALABRAS.length, Math.floor(ticks / 2));
  const transcripcionParcial = PALABRAS.slice(0, palabrasVisibles).join(' ');

  function grabar() {
    setTicks(0);
    setTranscripcion('');
    setDatos(null);
    setEstado('grabando');
  }

  function parsear() {
    setDatos(parsearReceta(transcripcion));
  }

  const medicamento = datos ? datos.medicamento : null;
  const campos = camposExtraidos(datos);

  function confirmar() {
    if (datos && datos.medicamento) onConfirmar(armarItemOrden(datos));
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className={`modal-card rvm-card${estado === 'revision' ? ' rvm-card--revision' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rvm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Recetario por voz" titleId="rvm-title" onClose={onClose} autoFocusClose />

        {estado !== 'revision' ? (
          <div className="modal-body rvm-body">
            <p className="rvm-hint">
              Diga la receta claramente. Ejemplo:{' '}
              <em>Amoxicilina 500 miligramos cada 8 horas por 7 días oral</em>
            </p>

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
                Transcribiendo audio…
              </div>
            )}
          </div>
        ) : (
          <div className="modal-body rvm-body-revision">
            <section className="rvm-block" aria-labelledby="rvm-transcripcion-title">
              <div className="rvm-block-head">
                <h4 id="rvm-transcripcion-title" className="rvm-block-title">Transcripción detectada</h4>
                <p className="rvm-block-subtitle">Revise y ajuste el texto antes de parsearlo.</p>
              </div>
              <textarea
                className="rvm-textarea"
                rows={3}
                value={transcripcion}
                placeholder="Edite la transcripción si es necesario…"
                aria-labelledby="rvm-transcripcion-title"
                // Editar invalida lo ya parseado: "Confirmar y agregar" nunca
                // usa datos de un texto que ya no es el que se ve.
                onChange={(e) => { setTranscripcion(e.target.value); setDatos(null); }}
              />
              <div className="rvm-block-actions">
                <Button variant="secondary" icon={LuRotateCcw} onClick={grabar}>Regrabar</Button>
                <Button variant="primary" onClick={parsear} disabled={!transcripcion.trim()}>Parsear</Button>
              </div>
            </section>

            <section className="rvm-block" aria-labelledby="rvm-datos-title">
              <div className="rvm-block-head">
                <h4 id="rvm-datos-title" className="rvm-block-title">Datos extraídos</h4>
                <p className="rvm-block-subtitle">Confirmación rápida del medicamento y la posología.</p>
              </div>
              <dl className="rvm-fields" aria-live="polite">
                {campos.map((c) => (
                  <div key={c.label} className="rvm-field">
                    <dt>{c.label}</dt>
                    <dd className={c.value ? undefined : 'rvm-field-empty'}>{c.value ?? 'No detectado'}</dd>
                  </div>
                ))}
              </dl>
              {!medicamento && (
                <div className="rvm-warning" role="status">
                  <LuTriangleAlert className="icon" aria-hidden="true" />
                  {datos
                    ? 'Medicamento no encontrado en el vademécum. Revise antes de agregar.'
                    : 'Parsee la transcripción para extraer el medicamento y la posología.'}
                </div>
              )}
            </section>
          </div>
        )}

        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
          {estado === 'revision' && (
            <Button variant="primary" icon={LuCheck} disabled={!medicamento} onClick={confirmar}>
              Confirmar y agregar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
