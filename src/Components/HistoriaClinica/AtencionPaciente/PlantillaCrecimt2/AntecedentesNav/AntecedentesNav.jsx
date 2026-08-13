'use client';

import './AntecedentesNav.css';
import { LuCircle, LuCircleCheck, LuCircleDot } from 'react-icons/lu';

// `secciones` (definida en PlantillaCrecimt2.jsx) trae las 13 secciones del
// formulario; solo las de status:'active' (hoy, las 13) son pasos reales del
// wizard. `currentStep` es el índice — SOLO contando esas secciones activas,
// en orden — del paso que se está diligenciando ahora. `completedSteps` es
// un Set<number> con los índices de los pasos ya completados (se marcan al
// salir de un paso hacia adelante, ver markStepComplete en
// PlantillaCrecimt2.jsx) — un paso es 'done' (check verde) si está en ese
// Set, 'current' si es exactamente currentStep, o 'pending' en cualquier
// otro caso. La navegación es libre: TODA sección activa es clicable sin
// importar su estado — solo "01 Consulta" exige pasar `validar()` antes de
// poder salir de ella (la gate vive en handleSelectStep, no acá). `activeSubIndex`
// es el scrollspy LOCAL del paso current (reinicia en 0 al entrar a cada
// paso, ver ConsultaStep.jsx/AntecedentesStep.jsx) — ya no un índice global
// sobre todas las subsecciones del formulario.
export default function AntecedentesNav({ secciones, currentStep, completedSteps, activeSubIndex, onSelectStep, onSelectSub }) {
  let stepIndex = -1;

  return (
    <nav className="an-nav" aria-label="Secciones de la historia clínica">
      <ol className="an-list">
        {secciones.map((s) => {
          if (s.status !== 'active') {
            return (
              <li key={s.num} className="an-section inert">
                <div className="an-section-head" title="Próximamente" aria-disabled="true">
                  <span className="an-section-icon"><LuCircle className="icon" aria-hidden="true" /></span>
                  <span className="an-section-num">{s.num}</span>
                  <span className="an-section-label">{s.label}</span>
                </div>
              </li>
            );
          }

          stepIndex += 1;
          const thisStep = stepIndex;
          const state = completedSteps.has(thisStep) ? 'done' : thisStep === currentStep ? 'current' : 'pending';

          return (
            <li key={s.num} className={`an-section active ${state}`}>
              <div
                className="an-section-head"
                role="button"
                tabIndex={0}
                onClick={() => onSelectStep(thisStep)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectStep(thisStep); }}
                title={state === 'current' ? undefined : `Ir a ${s.label}`}
                aria-current={state === 'current' ? 'step' : undefined}
              >
                <span className="an-section-icon">
                  {state === 'done' && <LuCircleCheck className="icon" aria-hidden="true" />}
                  {state === 'current' && <LuCircleDot className="icon" aria-hidden="true" />}
                  {state === 'pending' && <LuCircle className="icon" aria-hidden="true" />}
                </span>
                <span className="an-section-num">{s.num}</span>
                <span className="an-section-label">{s.label}</span>
              </div>

              {state === 'current' && (
                <ul className="an-sublist">
                  {s.subsecciones.map((sub, i) => {
                    const subState = i < activeSubIndex ? 'done' : i === activeSubIndex ? 'current' : 'pending';
                    return (
                      <li key={sub.id}>
                        <button
                          type="button"
                          className={`an-subitem ${subState}`}
                          onClick={() => onSelectSub(i)}
                          aria-current={subState === 'current' ? 'true' : undefined}
                          title={sub.label}
                        >
                          <span className="an-subitem-icon">
                            {subState === 'done' && <LuCircleCheck className="icon" aria-hidden="true" />}
                            {subState === 'current' && <span className="an-dot" aria-hidden="true" />}
                            {subState === 'pending' && <LuCircle className="icon" aria-hidden="true" />}
                          </span>
                          <span className="an-subitem-label">{sub.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
