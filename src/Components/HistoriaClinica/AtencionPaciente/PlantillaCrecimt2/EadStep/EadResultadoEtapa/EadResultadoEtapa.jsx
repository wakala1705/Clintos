'use client';

import './EadResultadoEtapa.css';
import { DOMINIOS, contarCorrectos, puntajeDirecto } from '../eadData';

// Etapa 5 (última) de EAD — Valoración global. Cards estáticas de resumen
// por dominio (Puntaje directo se recalcula solo, ver eadData.js; Puntaje
// típico/Clasificación/Color son los mismos valores de texto libre que el
// profesional ya diligenció en cada EadDomainEtapa — acá solo se reflejan,
// no se vuelven a pedir) + Valoración global/Conducta/Observaciones, mismos
// 3 campos de texto libre que pide el encargo.
export default function EadResultadoEtapa({
  resultados, respuestas,
  valoracionGlobal, onValoracionGlobalChange,
  conducta, onConductaChange,
  observaciones, onObservacionesChange,
}) {
  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">Valoración global EAD</h1>
      <p className="pf-section-desc">Resumen de los 4 dominios de la Escala Abreviada de Desarrollo.</p>

      <div className="ead-res-grid">
        {DOMINIOS.map((d) => {
          const resultado = resultados[d.key];
          const correctos = contarCorrectos(d.items, respuestas[d.key]);
          const directo = puntajeDirecto(resultado.totalAcumuladoInicio, correctos);
          return (
            <div className="ead-res-card" key={d.key}>
              <h2 className="ead-res-card-title">{d.label}</h2>
              <div className="ead-res-card-list">
                <div className="ead-res-card-row">
                  <span className="ead-res-card-label">Puntaje directo</span>
                  <span className="ead-res-card-value">{directo}</span>
                </div>
                <div className="ead-res-card-row">
                  <span className="ead-res-card-label">Puntaje típico</span>
                  <span className="ead-res-card-value">{resultado.puntajeTipico || '—'}</span>
                </div>
                <div className="ead-res-card-row">
                  <span className="ead-res-card-label">Clasificación</span>
                  <span className="ead-res-card-value">{resultado.clasificacion || '—'}</span>
                </div>
                <div className="ead-res-card-row">
                  <span className="ead-res-card-label">Color</span>
                  <span className="ead-res-card-value">{resultado.color || '—'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="pf-card">
        <div className="form-field">
          <label htmlFor="ead-valoracion-global">Valoración global</label>
          <input
            id="ead-valoracion-global" type="text" placeholder="Según tabla normativa de la EAD"
            value={valoracionGlobal} onChange={(e) => onValoracionGlobalChange(e.target.value)}
          />
        </div>
      </section>

      <section className="pf-card">
        <div className="pf-grid-2col">
          <div className="form-field">
            <label htmlFor="ead-conducta">Conducta</label>
            <textarea
              id="ead-conducta" rows={4} placeholder="Conducta observada durante la aplicación de la escala"
              value={conducta} onChange={(e) => onConductaChange(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ead-observaciones">Observaciones</label>
            <textarea
              id="ead-observaciones" rows={4} placeholder="Observaciones clínicas adicionales (opcional)"
              value={observaciones} onChange={(e) => onObservacionesChange(e.target.value)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
