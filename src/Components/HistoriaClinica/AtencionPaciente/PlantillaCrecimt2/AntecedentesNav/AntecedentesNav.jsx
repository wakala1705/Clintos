'use client';

import './AntecedentesNav.css';
import { LuCircle, LuCircleCheck, LuCircleDot } from 'react-icons/lu';

// `secciones` (definida en PlantillaCrecimt2.jsx) trae las 11 secciones del
// formulario; solo las de status:'active' (01 Consulta, 02 Antecedentes) son
// pasos reales del wizard. `currentStep` es el índice — SOLO contando esas
// secciones activas, en orden — del paso que se está diligenciando ahora:
// un paso queda 'done' si su índice quedó atrás de currentStep (avanzó tras
// pasar la validación, ver handleGuardarContinuar en PlantillaCrecimt2.jsx),
// 'current' si es exactamente currentStep, o 'locked' si todavía no se
// completó el paso anterior — un paso locked se pinta igual que una sección
// status:'inert' (mismo look "próximamente"), solo cambia el tooltip.
// `activeSubIndex` es el scrollspy LOCAL del paso current (reinicia en 0 al
// entrar a cada paso, ver ConsultaStep.jsx/AntecedentesStep.jsx) — ya no un
// índice global sobre todas las subsecciones del formulario.
export default function AntecedentesNav({ secciones, currentStep, activeSubIndex, onSelectStep, onSelectSub }) {
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
          const state = thisStep < currentStep ? 'done' : thisStep === currentStep ? 'current' : 'locked';

          if (state === 'locked') {
            return (
              <li key={s.num} className="an-section inert">
                <div className="an-section-head" title="Completa el paso anterior para continuar" aria-disabled="true">
                  <span className="an-section-icon"><LuCircle className="icon" aria-hidden="true" /></span>
                  <span className="an-section-num">{s.num}</span>
                  <span className="an-section-label">{s.label}</span>
                </div>
              </li>
            );
          }

          const total = s.subsecciones.length;
          const progreso = state === 'done' ? 100 : Math.round((activeSubIndex / total) * 100);
          const clickable = state === 'done';

          return (
            <li key={s.num} className={`an-section active${state === 'done' ? ' done' : ''}`}>
              <div
                className="an-section-head"
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => onSelectStep(thisStep) : undefined}
                onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSelectStep(thisStep); } : undefined}
                title={clickable ? `Volver a ${s.label}` : undefined}
              >
                <span className="an-section-icon">
                  {state === 'done'
                    ? <LuCircleCheck className="icon" aria-hidden="true" />
                    : <LuCircleDot className="icon" aria-hidden="true" />}
                </span>
                <span className="an-section-num">{s.num}</span>
                <span className="an-section-label">{s.label}</span>
                <span className="an-section-progress">{progreso}%</span>
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
