'use client';

import { useState } from 'react';
import './CompleteVitalsModal.css';
import { LuActivity, LuX } from 'react-icons/lu';

// "Completar tarea" para tareas de tipo Signos vitales abre este registro
// clínico en vez de solo cambiar el estado (encargo explícito: "Toma de
// signos vitales → Completar → Registrar signos vitales... permitir
// registrar los datos clínicos y completar la tarea en una misma
// interacción"). Mismos 4 campos que "09 Examen físico" en HistoriaClinica
// (FC/FR/PA/Temperatura, ver ExamenFisicoStep.jsx) — mismo vocabulario
// clínico del resto del sistema, aunque acá viven en un mock aparte sin
// persistencia real compartida. El resto de tipos de tarea completa
// directo, sin este paso (ver handleCompletar en TareasEnfermeria.jsx).
export default function CompleteVitalsModal({ tarea, onClose, onConfirm }) {
  const [vitals, setVitals] = useState({ fc: '', fr: '', sistolica: '', diastolica: '', temperatura: '' });

  function set(key, value) {
    setVitals((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm(tarea.id);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="vitals-title">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div className="modal-header-titles">
              <div className="suspend-header-icon icon-primary">
                <LuActivity className="icon" aria-hidden="true" />
              </div>
              <div>
                <h3 id="vitals-title">Registrar signos vitales</h3>
                <div className="modal-header-sub">{tarea.paciente} · Hab. {tarea.cama}</div>
              </div>
            </div>
            <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Cerrar">
              <LuX className="icon" aria-hidden="true" />
            </button>
          </div>
          <div className="modal-body">
            <div className="task-vitals-grid">
              <div className="form-field">
                <label htmlFor="vt-fc">Frecuencia cardíaca</label>
                <input id="vt-fc" type="number" min="0" placeholder="lpm" value={vitals.fc} onChange={(e) => set('fc', e.target.value)} autoFocus />
              </div>
              <div className="form-field">
                <label htmlFor="vt-fr">Frecuencia respiratoria</label>
                <input id="vt-fr" type="number" min="0" placeholder="rpm" value={vitals.fr} onChange={(e) => set('fr', e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="vt-sistolica">Presión arterial</label>
                <div className="task-vitals-bp">
                  <input id="vt-sistolica" type="number" min="0" placeholder="Sistólica" value={vitals.sistolica} onChange={(e) => set('sistolica', e.target.value)} />
                  <span>/</span>
                  <input type="number" min="0" placeholder="Diastólica" value={vitals.diastolica} onChange={(e) => set('diastolica', e.target.value)} aria-label="Diastólica" />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="vt-temp">Temperatura</label>
                <input id="vt-temp" type="number" min="0" step="0.1" placeholder="°C" value={vitals.temperatura} onChange={(e) => set('temperatura', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Registrar y completar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
