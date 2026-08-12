'use client';

import './ValeStepper.css';
import { LuCheck } from 'react-icons/lu';

// Riel lateral izquierdo INTERNO de VALE — 5 etapas (Perinatal, Estructural,
// Comprensión/Expresión/Interacción, Vestibular, Resultado), distinto del
// nav externo de 12 secciones del wizard (AntecedentesNav.jsx): ese nav ya
// trata a VALE como un único paso ("07 Desarrollo" con una sola
// subsección, ver PlantillaCrecimt2.jsx) — la navegación real entre las 5
// secciones de VALE vive acá. Mismo criterio "clicable solo si done" y
// misma receta visual de riel sticky que AntecedentesNav.jsx (.an-nav),
// bajo un prefijo propio (vale-*, cada feature dueña de su copia).
export default function ValeStepper({ etapas, etapaActual, onSelectEtapa }) {
  return (
    <nav className="vale-rail" aria-label="Secciones de VALE">
      <div className="vale-rail-sticky">
        <p className="vale-rail-caption">
          VALE — <b>{etapaActual}</b> de {etapas.length} secciones completadas
        </p>
        <ol className="vale-rail-list">
          {etapas.map((etapa, index) => {
            const state = index < etapaActual ? 'done' : index === etapaActual ? 'active' : 'locked';
            return (
              <li key={etapa.id} className={`vale-rail-node ${state}`}>
                <button
                  type="button"
                  className="vale-rail-btn"
                  disabled={state === 'locked'}
                  aria-current={state === 'active' ? 'step' : undefined}
                  onClick={state === 'done' ? () => onSelectEtapa(index) : undefined}
                >
                  <span className="vale-rail-indicator">
                    <span className="vale-rail-circle">
                      {state === 'done' ? <LuCheck className="icon" aria-hidden="true" /> : index + 1}
                    </span>
                    {index < etapas.length - 1 && <span className="vale-rail-line" aria-hidden="true"></span>}
                  </span>
                  <span className="vale-rail-label">{etapa.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
