'use client';

import './EadStepper.css';
import { LuCheck } from 'react-icons/lu';

const ESTADO_LABEL = {
  'no-iniciado': 'No iniciado',
  'en-progreso': 'En progreso',
  completado: 'Completado',
};

// Riel lateral izquierdo INTERNO de EAD — 4 dominios + Resultado, mismo
// criterio que ValeStepper.jsx (riel propio de la escala, distinto del nav
// externo de 12 secciones del wizard). Dos diferencias respecto a
// ValeStepper: (1) el estado de cada nodo NO depende de su posición contra
// `etapaActual` (ver EadStep.jsx) sino de cuántos ítems tiene respondidos
// ese dominio — un dominio ya visitado y dejado a medias debe leerse "En
// progreso", no "Completado" solo por estar detrás del dominio activo; (2)
// como no hay bloqueo duro de avance (ver eadData.js/EadStep.jsx — encargo:
// advertencia blanda, nunca bloquea), TODOS los nodos son clicables siempre,
// a diferencia de ValeStepper (solo los nodos "done" eran clicables).
//
// El selector de edad (chips) ya no vive acá: se movió dentro de cada
// dominio (ver EadDomainEtapa.jsx, arriba de su propio título) — este riel
// solo se ocupa de la navegación entre los 5 nodos.
export default function EadStepper({ nodos, etapaActual, onSelectEtapa }) {
  return (
    <nav className="ead-rail" aria-label="Dominios de EAD">
      <div className="ead-rail-sticky">
        <ol className="ead-rail-list">
          {nodos.map((nodo, index) => {
            const active = index === etapaActual;
            const estado = nodo.estado;
            return (
              <li key={nodo.id} className={`ead-rail-node${active ? ' active' : ''}${estado ? ` ${estado}` : ''}`}>
                <button
                  type="button"
                  className="ead-rail-btn"
                  aria-current={active ? 'step' : undefined}
                  onClick={() => onSelectEtapa(index)}
                >
                  <span className="ead-rail-indicator">
                    <span className="ead-rail-circle">
                      {estado === 'completado' ? <LuCheck className="icon" aria-hidden="true" /> : index + 1}
                    </span>
                    {index < nodos.length - 1 && <span className="ead-rail-line" aria-hidden="true"></span>}
                  </span>
                  <span className="ead-rail-textwrap">
                    <span className="ead-rail-label">{nodo.label}</span>
                    {estado && (
                      <span className={`ead-rail-badge ${estado}`}>{ESTADO_LABEL[estado]}</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
