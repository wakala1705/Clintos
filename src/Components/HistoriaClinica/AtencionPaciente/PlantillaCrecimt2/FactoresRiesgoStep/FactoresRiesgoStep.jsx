'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import './FactoresRiesgoStep.css';
import SiNoField from '../SiNoField/SiNoField';

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

      <div className="pf-group">
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
          <SiNoField
            id="fr-fumadores" label="Fumadores en el hogar" options={SI_NO}
            value={factoresRiesgo.fumadores}
            onChange={(v) => setFactoresRiesgo((prev) => ({ ...prev, fumadores: v }))}
          />
          <SiNoField
            id="fr-vectores" label="Vectores en el hogar" options={SI_NO}
            value={factoresRiesgo.vectores}
            onChange={(v) => setFactoresRiesgo((prev) => ({ ...prev, vectores: v }))}
          />
          <SiNoField
            id="fr-hacinamiento" label="Hacinamiento" options={SI_NO}
            value={factoresRiesgo.hacinamiento}
            onChange={(v) => setFactoresRiesgo((prev) => ({ ...prev, hacinamiento: v }))}
          />
        </div>
      </div>
    </div>
  );
});

export default FactoresRiesgoStep;
