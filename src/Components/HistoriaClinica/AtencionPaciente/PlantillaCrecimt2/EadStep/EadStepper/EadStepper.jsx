'use client';

import './EadStepper.css';
import { RANGOS_EAD } from '../eadData';
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
// El selector de edad (antes chips, ahora select) vive acá abajo de los 5
// nodos, separado por un borde — ya no arriba de cada dominio (ver
// EadDomainEtapa.jsx). Es el mismo estado elevado en EadStep.jsx que se
// comparte entre los 4 dominios (los 12 rangos son idénticos en los 4),
// solo cambia dónde se renderiza el control.
export default function EadStepper({ nodos, etapaActual, onSelectEtapa, rangoSeleccionado, onRangoChange }) {
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

        <div className="ead-rail-rango">
          <label className="ead-rail-rango-label" htmlFor="ead-rail-rango-select">Edad del paciente</label>
          <select
            id="ead-rail-rango-select"
            className="ead-rail-rango-input"
            value={rangoSeleccionado ?? ''}
            onChange={(e) => onRangoChange(e.target.value)}
          >
            <option value="" disabled>Selecciona un rango de edad</option>
            {RANGOS_EAD.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <p className="ead-rail-rango-hint">Resalta el rango de edad vigente en cada dominio.</p>
        </div>
      </div>
    </nav>
  );
}
