'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import './FactoresRiesgoStep.css';

const SI_NO = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

// Paso 6 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — antes vivía
// como una subsección más dentro de "05 Vacunación" (mismo formulario
// legacy, punto 7 del encargo: "Crear una sección independiente después de
// antecedentes vacunales"); se separó a su propio paso porque el scrollspy
// compartido entre dos bloques tan distintos (matriz de vacunación + estos
// 5 campos) disparaba saltos de scroll al navegar entre subsecciones — ver
// AGENTS.md/historial de esta pantalla. Una sola card sin subsecciones que
// necesiten scrollspy propio — igual que RiesgoStep, expone `scrollToSub`
// como no-op porque AntecedentesNav lo invoca para cualquier paso 'active'
// con subsecciones (ver handleSelectSub en PlantillaCrecimt2.jsx).
const FactoresRiesgoStep = forwardRef(function FactoresRiesgoStep({ hidden }, ref) {
  const [factoresRiesgo, setFactoresRiesgo] = useState({
    animalesDomesticos: 0, animalesVacunados: 0, fumadores: 'no', vectores: 'no', hacinamiento: 'no',
  });

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  function updateAnimalesDomesticos(value) {
    const n = Math.max(0, Number(value) || 0);
    setFactoresRiesgo((prev) => ({
      ...prev,
      animalesDomesticos: n,
      // "¿Cuántos vacunados?" está relacionado con la cantidad de animales
      // domésticos — no puede quedar por encima del total ni tener valor si
      // el total baja a 0 (prevención de errores).
      animalesVacunados: Math.min(prev.animalesVacunados, n),
    }));
  }

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Factores de riesgo</h1>
      <p className="pf-section-desc">Factores de riesgo en el hogar</p>

      <section className="pf-card">
        <div className="pf-group">
          <h2 className="pf-card-title">Factores de riesgo en el hogar</h2>
          <div className="pf-grid-4">
            <div className="form-field">
              <label htmlFor="fr-animales">Animales domésticos</label>
              <input
                id="fr-animales" type="number" min="0"
                value={factoresRiesgo.animalesDomesticos}
                onChange={(e) => updateAnimalesDomesticos(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fr-animales-vacunados">¿Cuántos vacunados?</label>
              <input
                id="fr-animales-vacunados" type="number" min="0" max={factoresRiesgo.animalesDomesticos}
                value={factoresRiesgo.animalesVacunados}
                disabled={factoresRiesgo.animalesDomesticos === 0}
                onChange={(e) => {
                  const n = Math.max(0, Math.min(factoresRiesgo.animalesDomesticos, Number(e.target.value) || 0));
                  setFactoresRiesgo((prev) => ({ ...prev, animalesVacunados: n }));
                }}
              />
            </div>
            <div className="form-field">
              <label htmlFor="fr-fumadores">Fumadores en el hogar</label>
              <select
                id="fr-fumadores" value={factoresRiesgo.fumadores}
                onChange={(e) => setFactoresRiesgo((prev) => ({ ...prev, fumadores: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="fr-vectores">Vectores en el hogar</label>
              <select
                id="fr-vectores" value={factoresRiesgo.vectores}
                onChange={(e) => setFactoresRiesgo((prev) => ({ ...prev, vectores: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="fr-hacinamiento">Hacinamiento</label>
              <select
                id="fr-hacinamiento" value={factoresRiesgo.hacinamiento}
                onChange={(e) => setFactoresRiesgo((prev) => ({ ...prev, hacinamiento: e.target.value }))}
              >
                {SI_NO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

export default FactoresRiesgoStep;
