import './CriteriosInmediatosStep.css';
import { CRITERIOS_INMEDIATOS, CRITERIO_NINGUNO } from '@/hooks/Triage/triageData';

// Paso 1 de la valoración: "Criterios de atención inmediata". Selección única
// entre 6 criterios + "Ninguno de los anteriores" (fila completa). Qué pasa
// al elegir lo decide ValoracionTriageModal (`onElegir`).
//
// Las opciones son <input type="radio"> reales dentro de un <label>-tarjeta:
// el navegador ya da la navegación con flechas del grupo y el foco, sin
// reimplementar un radiogroup a mano.
export default function CriteriosInmediatosStep({ criterio, onElegir }) {
  function renderOpcion(o, extraClass = '') {
    const checked = criterio === o.value;
    return (
      <label key={o.value} className={`tg-ci-opcion${checked ? ' selected' : ''}${extraClass}`}>
        <input
          type="radio"
          name="tg-ci-criterio"
          className="sr-only"
          value={o.value}
          checked={checked}
          onChange={() => onElegir(o.value)}
        />
        {o.label}
      </label>
    );
  }

  return (
    <fieldset className="tg-ci-criterios">
      <legend className="tg-ci-title">Criterios de atención inmediata</legend>
      <div className="tg-ci-grid">
        {CRITERIOS_INMEDIATOS.map((o) => renderOpcion(o))}
        {renderOpcion(CRITERIO_NINGUNO, ' ninguno')}
      </div>
    </fieldset>
  );
}
