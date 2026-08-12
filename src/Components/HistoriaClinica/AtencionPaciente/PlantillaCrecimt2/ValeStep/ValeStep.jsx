'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import './ValeStep.css';
import ValeStepper from './ValeStepper/ValeStepper';
import ValePerinatalEtapa from './ValePerinatalEtapa/ValePerinatalEtapa';
import ValeEstructuralEtapa from './ValeEstructuralEtapa/ValeEstructuralEtapa';
import ValeDesarrolloEtapa from './ValeDesarrolloEtapa/ValeDesarrolloEtapa';
import ValeVestibularEtapa from './ValeVestibularEtapa/ValeVestibularEtapa';
import ValeResultadoEtapa from './ValeResultadoEtapa/ValeResultadoEtapa';
import {
  PERINATAL_MENOR_2_ANIOS, PERINATAL_TODAS_EDADES, CONDICIONES_ESTRUCTURALES,
  computeValeResultado, edadMesesDesdeRangoCEI,
} from './valeData';

const ETAPAS = [
  { id: 'perinatal', label: 'Perinatal y postnatal' },
  { id: 'estructural', label: 'Estructural' },
  { id: 'desarrollo', label: 'Comprensión, expresión e interacción' },
  { id: 'vestibular', label: 'Vestibular' },
  { id: 'resultado', label: 'Resultado' },
];

function initialPerinatal() {
  return Object.fromEntries(
    [...PERINATAL_MENOR_2_ANIOS, ...PERINATAL_TODAS_EDADES].map((c) => [c.key, { valor: null, descripcion: '' }]),
  );
}
function initialEstructural() {
  return Object.fromEntries(CONDICIONES_ESTRUCTURALES.map((c) => [c.key, { presencia: null, integridad: null }]));
}

// Paso "07 Desarrollo" del wizard CRECIMT2 — instrumento VALE (Valoración
// del desarrollo infantil). Sigue el mismo contrato externo que los otros 6
// pasos (`hidden` + `forwardRef` + `scrollToSub`, ver PlantillaCrecimt2.jsx)
// y se mantiene SIEMPRE montado para no perder lo diligenciado al navegar a
// otro paso del wizard y volver.
//
// Por dentro, VALE es distinto: un wizard-DENTRO-del-wizard con 5 etapas
// internas (Perinatal → Estructural → Comprensión/Expresión/Interacción →
// Vestibular → Resultado) que se muestran de a una (encargo explícito: "no
// mostrar toda la evaluación simultáneamente"), con su propia navegación
// Anterior/Continuar/Finalizar evaluación — independiente del pf-footer
// externo, que sigue moviendo entre los 12 pasos del wizard exactamente
// igual que hoy. Todas las respuestas viven acá arriba como estado
// controlado; cada etapa se renderiza condicionalmente (no siempre montada
// + hidden, como el resto del wizard) porque no posee estado propio — nada
// se pierde al cambiar de etapa, la fuente de verdad nunca vivió ahí.
// `scrollToSub` queda como no-op: un único subsección externo ("Valoración
// VALE", ver SECCIONES) — la navegación real es el ValeStepper interno
// (riel lateral izquierdo, ver ValeStepper.jsx), mismo criterio que
// RiesgoStep/VacunacionStep/FactoresRiesgoStep. Sin datos propios del
// paciente en este nivel: el banner de PatientBanner (AtencionPaciente.jsx)
// ya está visible arriba de toda la atención, incluida esta pantalla.
const ValeStep = forwardRef(function ValeStep({ hidden, scrollContainerRef }, ref) {
  const [etapa, setEtapa] = useState(0);
  // El profesional ya no escribe una edad exacta en Perinatal: elige un
  // rango directamente en "Comprensión, expresión e interacción" (ver
  // ValeDesarrolloEtapa.jsx, chips de RANGOS_CEI) — es el único paso donde
  // ese condicional de edad aplica. Vestibular y el cálculo final igual
  // necesitan un número (sus propios rangos no coinciden con los de
  // RANGOS_CEI), así que se deriva de acá (ver edadMesesDesdeRangoCEI).
  const [rangoCEI, setRangoCEI] = useState(null);
  const edadMeses = edadMesesDesdeRangoCEI(rangoCEI);
  const [perinatal, setPerinatal] = useState(initialPerinatal);
  const [estructural, setEstructural] = useState(initialEstructural);
  const [respuestasCEI, setRespuestasCEI] = useState({});
  const [respuestasVestibular, setRespuestasVestibular] = useState({});
  const [observacionesVestibularFinal, setObservacionesVestibularFinal] = useState('');
  const [resultado, setResultado] = useState(null);

  const desarrolloRef = useRef(null);
  const vestibularRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToSub() {},
  }));

  function goToEtapa(index) {
    setEtapa(index);
    scrollContainerRef?.current?.scrollTo({ top: 0 });
  }

  function handleSelectEtapa(index) {
    if (index === etapa) return;
    goToEtapa(index);
  }

  function handleAnterior() {
    goToEtapa(Math.max(etapa - 1, 0));
  }

  function handleContinuar() {
    if (etapa === 2) {
      if (!desarrolloRef.current?.validar()) {
        window.ncToast?.('Responde las preguntas pendientes de esta sección para continuar.');
        return;
      }
    }
    if (etapa === 3) {
      if (!vestibularRef.current?.validar()) {
        window.ncToast?.('Responde las preguntas pendientes de esta sección para continuar.');
        return;
      }
      setResultado(computeValeResultado({ edadMeses, perinatal, estructural, respuestasCEI, respuestasVestibular }));
    }
    goToEtapa(Math.min(etapa + 1, ETAPAS.length - 1));
  }

  function updatePerinatal(key, patch) {
    setPerinatal((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }
  function updateEstructural(key, patch) {
    setEstructural((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }
  function updateRespuestaCEIValor(id, valor) {
    setRespuestasCEI((prev) => ({ ...prev, [id]: { ...prev[id], valor } }));
  }
  function updateRespuestaCEIObservacion(id, observacionDirecta) {
    setRespuestasCEI((prev) => ({ ...prev, [id]: { ...prev[id], observacionDirecta } }));
  }
  function updateRespuestaVestibularValor(id, valor) {
    setRespuestasVestibular((prev) => ({ ...prev, [id]: { ...prev[id], valor } }));
  }
  function updateRespuestaVestibularObservacion(id, observacionDirecta) {
    setRespuestasVestibular((prev) => ({ ...prev, [id]: { ...prev[id], observacionDirecta } }));
  }

  return (
    <div className="vale-step-root" style={hidden ? { display: 'none' } : undefined}>
      <ValeStepper etapas={ETAPAS} etapaActual={etapa} onSelectEtapa={handleSelectEtapa} />

      <div className="vale-main">
        <div className="vale-body">
          {etapa === 0 && (
            <ValePerinatalEtapa data={perinatal} onChange={updatePerinatal} />
          )}
          {etapa === 1 && (
            <ValeEstructuralEtapa data={estructural} onChange={updateEstructural} />
          )}
          {etapa === 2 && (
            <ValeDesarrolloEtapa
              ref={desarrolloRef}
              rangoCEI={rangoCEI}
              onRangoCEIChange={setRangoCEI}
              respuestas={respuestasCEI}
              onAnswerChange={updateRespuestaCEIValor}
              onObservacionChange={updateRespuestaCEIObservacion}
            />
          )}
          {etapa === 3 && (
            <ValeVestibularEtapa
              ref={vestibularRef}
              edadMeses={edadMeses}
              respuestas={respuestasVestibular}
              onAnswerChange={updateRespuestaVestibularValor}
              onObservacionChange={updateRespuestaVestibularObservacion}
              observacionesFinal={observacionesVestibularFinal}
              onObservacionesFinalChange={setObservacionesVestibularFinal}
            />
          )}
          {etapa === 4 && <ValeResultadoEtapa resultado={resultado} />}
        </div>

        <div className="vale-actionbar">
          <span className="vale-actionbar-caption">Navegación VALE</span>
          <div className="vale-actionbar-buttons">
            <button type="button" className="btn btn-secondary" onClick={handleAnterior} disabled={etapa === 0}>
              Anterior
            </button>
            {etapa < ETAPAS.length - 1 && (
              <button type="button" className="btn btn-primary" onClick={handleContinuar}>
                {etapa === 3 ? 'Finalizar evaluación →' : 'Continuar →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ValeStep;
