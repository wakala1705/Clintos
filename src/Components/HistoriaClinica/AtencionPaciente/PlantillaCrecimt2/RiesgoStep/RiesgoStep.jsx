'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import './RiesgoStep.css';
import SiNoField from '../SiNoField/SiNoField';

const RIESGO_OPCIONES = [
  { value: 'no_evaluado', label: 'Riesgo no evaluado' },
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
];

const CAMPOS_RIESGO = [
  { key: 'sifilisCongenita', label: 'Sífilis Congénita', valor: 'no_evaluado' },
  { key: 'hipotiroidismo', label: 'Hipotiroidismo', valor: 'no_evaluado' },
  { key: 'sintomaticoRespiratorio', label: 'Sintomático Respiratorio', valor: 'no' },
  { key: 'sintomaticoPiel', label: 'Sintomático De Piel', valor: 'no' },
  { key: 'obesidadDesnutricion', label: 'Obesidad o Desnutrición Proteico Calórica', valor: 'no' },
  { key: 'victimaMaltrato', label: 'Víctima de Maltrato', valor: 'no_evaluado' },
  { key: 'victimaViolenciaSexual', label: 'Víctima de Violencia Sexual', valor: 'no' },
  { key: 'infeccionesTransmisionSexual', label: 'Infecciones de Transmisión Sexual', valor: 'no' },
  { key: 'enfermedadMental', label: 'Enfermedad mental', valor: 'no' },
];

function initialRiesgos() {
  return Object.fromEntries(CAMPOS_RIESGO.map((c) => [c.key, c.valor]));
}

// Paso 3 del wizard (ver SECCIONES en PlantillaCrecimt2.jsx) — igual que
// ConsultaStep, se mantiene SIEMPRE montado (el padre lo oculta con
// `hidden`) para no perder lo ya diligenciado al ir y volver entre pasos.
// Una sola card sin subsecciones que necesiten scrollspy propio (a
// diferencia de AntecedentesStep) — igual expone `scrollToSub` como no-op
// porque AntecedentesNav lo invoca para cualquier paso 'active' con
// subsecciones (ver handleSelectSub en PlantillaCrecimt2.jsx).
const RiesgoStep = forwardRef(function RiesgoStep({ hidden }, ref) {
  const [riesgos, setRiesgos] = useState(initialRiesgos);

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  return (
    <div className="ac-wrap" style={hidden ? { display: 'none' } : undefined}>
      <h1 className="pf-section-title">Riesgo 4505</h1>
      <p className="pf-section-desc">Registra la evaluación de riesgo del paciente según la Resolución 4505.</p>

      <div className="pf-group">
        <div className="pf-grid-3">
          {CAMPOS_RIESGO.map((c) => (
            <SiNoField
              key={c.key}
              id={`rg-${c.key}`} label={c.label} options={RIESGO_OPCIONES}
              value={riesgos[c.key]}
              onChange={(v) => setRiesgos((p) => ({ ...p, [c.key]: v }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default RiesgoStep;
