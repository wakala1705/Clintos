'use client';

import { useRef, useState } from 'react';
import './ImportarCatalogoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  LuCircleCheck, LuRefreshCw, LuTriangleAlert, LuUpload,
} from 'react-icons/lu';

// Encargo, sección 16: "no sobrescribir configuraciones silenciosamente" —
// 3 pasos (seleccionar → validar → confirmar), con conteo de encontrados/
// errores visible ANTES de aplicar cualquier cambio. Los 2 errores de
// ejemplo son fijos (no hay parser real de .xlsx en este prototipo) — el
// paso de validación en sí (spinner + delay) sí es real, para transmitir que
// algo se está revisando antes de habilitar "Confirmar importación".
export default function ImportarCatalogoModal({ onClose, onConfirm }) {
  const [step, setStep] = useState('select'); // select | validating | preview
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }
  function handleContinuar() {
    setStep('validating');
    window.setTimeout(() => setStep('preview'), 900);
  }
  function handleConfirmar() {
    onConfirm(fileName);
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="cbc-imp-title">
        <ModalHeader
          icon={LuUpload}
          tone="primary"
          title="Importar catálogos"
          titleId="cbc-imp-title"
          subtitle="Carga masiva de catálogos desde archivo."
          onClose={onClose}
        />
        <div className="modal-body">
          {step === 'select' && (
            <div className="cbc-imp-drop">
              <LuUpload className="icon" aria-hidden="true" />
              {fileName ? (
                <span className="cbc-imp-filename">{fileName}</span>
              ) : (
                <span className="cbc-imp-hint">Selecciona el archivo que deseas importar.</span>
              )}
              <input ref={inputRef} type="file" accept=".xlsx" className="sr-only" onChange={handleFileChange} id="cbc-imp-input" />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => inputRef.current?.click()}>Seleccionar archivo</button>
              <span className="cbc-imp-formato">Formato permitido: Excel (.xlsx)</span>
            </div>
          )}

          {step === 'validating' && (
            <div className="cbc-imp-validating">
              <LuRefreshCw className="icon cbc-spin" aria-hidden="true" />
              Validando archivo…
            </div>
          )}

          {step === 'preview' && (
            <>
              <div className="cbc-imp-summary">
                <div className="cbc-imp-summary-item">
                  <div className="cbc-imp-summary-value">42</div>
                  <div className="cbc-imp-summary-label">Registros encontrados</div>
                </div>
                <div className="cbc-imp-summary-item">
                  <div className="cbc-imp-summary-value warn">2</div>
                  <div className="cbc-imp-summary-label">Errores detectados</div>
                </div>
              </div>
              <ul className="cbc-imp-errores">
                <li><LuTriangleAlert className="icon" aria-hidden="true" />Fila 12: tipo de cama no reconocido.</li>
                <li><LuTriangleAlert className="icon" aria-hidden="true" />Fila 30: motivo duplicado en el catálogo.</li>
              </ul>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          {step === 'select' && (
            <button type="button" className="btn btn-primary" disabled={!fileName} onClick={handleContinuar}>Continuar</button>
          )}
          {step === 'preview' && (
            <button type="button" className="btn btn-primary" onClick={handleConfirmar}>
              <LuCircleCheck className="icon" aria-hidden="true" />Confirmar importación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
