'use client';

import { useEffect } from 'react';
import './CabeceraModal.css';
import { TIPOS_ARTICULO } from '@/hooks/SolicitudConsumo/mockSolicitudConsumoData';
import { LuArrowRight, LuX } from 'react-icons/lu';

// Bodega/procedencia del solicitante son fijas en este demo (no hay sesión
// real de usuario/sede — ver AGENTS.md sobre el resto del aplicativo).
export const DEFAULT_BODEGA_PIDE = '03 · Bodega de Consumo';
export const DEFAULT_BODEGA_DESPACHA = 'BI · Bodega Piso 11 Torre 3 Oncomed';
export const DEFAULT_PROCEDENCIA = 'Consulta Externa · Piso 2';

// Paso 1 de "Nueva solicitud de consumo": solo pide el tipo de artículo (los
// demás campos son de solo lectura). Al continuar, solicitud-consumo.jsx abre
// ArticulosModal ya con esta cabecera — la reposición no se crea hasta que el
// paso 2 se confirme (ver handleContinuarACabecera).
export default function CabeceraModal({ open, tipoArticulo, onChangeTipoArticulo, onCancel, onContinuar }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) { if (e.key === 'Escape') onCancel(); }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal modal-md" role="dialog" aria-modal="true" aria-labelledby="cabecera-modal-title">
        <div className="modal-header">
          <div className="left">
            <h3 id="cabecera-modal-title">Nueva solicitud de consumo</h3>
          </div>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Cerrar">
            <LuX className="icon" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-progress-bar">
          <div className="progress-step active"><span className="dot">1</span><span className="label">Datos de la solicitud</span></div>
          <div className="progress-sep"></div>
          <div className="progress-step"><span className="dot">2</span><span className="label">Artículos</span></div>
        </div>

        <div className="modal-body-plain">
          <div className="section-divider" style={{ marginTop: 0 }}>
            <h4>Datos de la solicitud</h4>
            <div className="line"></div>
          </div>

          <div className="form-grid form-grid-2col">
            <div className="field">
              <label>Id. Bodega solicitante</label>
              <input type="text" value={DEFAULT_BODEGA_PIDE} readOnly />
            </div>
            <div className="field">
              <label>Id. Bodega despacho</label>
              <input type="text" value={DEFAULT_BODEGA_DESPACHA} readOnly />
            </div>
            <div className="field">
              <label>Procedencia</label>
              <input type="text" value={DEFAULT_PROCEDENCIA} readOnly />
            </div>
            <div className="field" style={{ gridColumn: '1/-1' }}>
              <label>Tipo artículo</label>
              <select value={tipoArticulo} onChange={(e) => onChangeTipoArticulo(e.target.value)}>
                {TIPOS_ARTICULO.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="field-hint">Determina qué artículos verás en el paso siguiente. Podrás buscarlo libremente una vez avances.</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            <LuX className="icon" aria-hidden="true" />
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={onContinuar}>
            <LuArrowRight className="icon" aria-hidden="true" />
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
