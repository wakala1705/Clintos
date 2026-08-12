'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';
import './EadStep.css';
import EadStepper from './EadStepper/EadStepper';
import EadDomainEtapa from './EadDomainEtapa/EadDomainEtapa';
import EadResultadoEtapa from './EadResultadoEtapa/EadResultadoEtapa';
import { DOMINIOS, contarRespondidos } from './eadData';

function initialResultados() {
  return Object.fromEntries(
    DOMINIOS.map((d) => [d.key, {
      totalAcumuladoInicio: null, puntajeTipico: '', color: '', clasificacion: '',
    }]),
  );
}
function initialRespuestas() {
  return Object.fromEntries(DOMINIOS.map((d) => [d.key, {}]));
}

function estadoDominio(items, respuestasDominio) {
  const respondidos = contarRespondidos(items, respuestasDominio);
  if (respondidos === 0) return 'no-iniciado';
  if (respondidos === items.length) return 'completado';
  return 'en-progreso';
}

// Paso "08 Desarrollo" del wizard CRECIMT2 — instrumento EAD (Escala
// Abreviada de Desarrollo). Sigue el mismo contrato externo que los demás
// pasos (`hidden` + `forwardRef` + `scrollToSub`, ver PlantillaCrecimt2.jsx)
// y se mantiene SIEMPRE montado.
//
// Por dentro, mismo criterio "wizard-DENTRO-del-wizard" que ValeStep.jsx:
// 5 etapas internas (4 dominios + Resultado) con su propia navegación
// Anterior/Continuar — independiente del pf-footer externo. A diferencia de
// VALE, acá NO hay bloqueo duro: el encargo pide advertencia blanda cuando
// quedan ítems sin responder, nunca impedir avanzar (144 ítems repartidos
// en 12 rangos de edad por dominio — exigir el 100% no es realista
// clínicamente). Tampoco hay un solo "resultado final" calculado al
// terminar: cada dominio calcula su Puntaje directo en vivo apenas se
// responden ítems (ver EadDomainEtapa.jsx) — la etapa de Resultado solo
// refleja lo que cada dominio ya tiene, no dispara ningún cálculo propio.
//
// La edad del paciente se captura una sola vez como select de rango (ver
// EadStepper.jsx, debajo de los 5 nodos del riel): los 12 rangos de los 4
// dominios son idénticos, así que la selección vive elevada acá y se
// reutiliza en los 4 (el rango elegido ES directamente el "vigente" — sin
// pasar por ninguna conversión a días). Sin un paciente real de estas
// edades en los datos de prueba, el rango elegido queda como ejemplo del
// comportamiento — en producción se derivaría automáticamente de la edad
// real del paciente en vez de pedirla acá.
const EadStep = forwardRef(function EadStep({ hidden, scrollContainerRef }, ref) {
  const [etapa, setEtapa] = useState(0);
  const [rangoSeleccionado, setRangoSeleccionado] = useState(null);
  const [respuestas, setRespuestas] = useState(initialRespuestas);
  const [resultados, setResultados] = useState(initialResultados);
  const [valoracionGlobal, setValoracionGlobal] = useState('');
  const [conducta, setConducta] = useState('');
  const [observaciones, setObservaciones] = useState('');

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
    const dominio = DOMINIOS[etapa];
    if (dominio) {
      const respondidos = contarRespondidos(dominio.items, respuestas[dominio.key]);
      const pendientes = dominio.items.length - respondidos;
      if (pendientes > 0) {
        window.ncToast?.(
          `Quedan ${pendientes} ítems sin responder en "${dominio.label}". Puedes continuar de todas formas.`,
        );
      }
    }
    goToEtapa(Math.min(etapa + 1, DOMINIOS.length));
  }

  function updateRespuesta(dominioKey, itemId, valor) {
    setRespuestas((prev) => ({ ...prev, [dominioKey]: { ...prev[dominioKey], [itemId]: valor } }));
  }
  function updateResultado(dominioKey, patch) {
    setResultados((prev) => ({ ...prev, [dominioKey]: patch }));
  }

  const nodos = [
    ...DOMINIOS.map((d) => ({ id: d.key, label: d.label, estado: estadoDominio(d.items, respuestas[d.key]) })),
    { id: 'resultado', label: 'Resultado' },
  ];
  const dominioActual = DOMINIOS[etapa];

  return (
    <div className="ead-step-root" style={hidden ? { display: 'none' } : undefined}>
      <EadStepper
        nodos={nodos}
        etapaActual={etapa}
        onSelectEtapa={handleSelectEtapa}
        rangoSeleccionado={rangoSeleccionado}
        onRangoChange={setRangoSeleccionado}
      />

      <div className="ead-main">
        <div className="ead-body">
          {dominioActual && (
            <EadDomainEtapa
              dominio={dominioActual}
              rangoSeleccionado={rangoSeleccionado}
              respuestas={respuestas[dominioActual.key]}
              onRespuestaChange={(itemId, valor) => updateRespuesta(dominioActual.key, itemId, valor)}
              resultado={resultados[dominioActual.key]}
              onResultadoChange={(patch) => updateResultado(dominioActual.key, patch)}
            />
          )}
          {!dominioActual && (
            <EadResultadoEtapa
              resultados={resultados}
              respuestas={respuestas}
              valoracionGlobal={valoracionGlobal}
              onValoracionGlobalChange={setValoracionGlobal}
              conducta={conducta}
              onConductaChange={setConducta}
              observaciones={observaciones}
              onObservacionesChange={setObservaciones}
            />
          )}
        </div>

        <div className="ead-actionbar">
          <span className="ead-actionbar-caption">Navegación EAD</span>
          <div className="ead-actionbar-buttons">
            <button type="button" className="btn btn-secondary" onClick={handleAnterior} disabled={etapa === 0}>
              Anterior
            </button>
            {dominioActual && (
              <button type="button" className="btn btn-primary" onClick={handleContinuar}>
                {etapa === DOMINIOS.length - 1 ? 'Ver resultado →' : 'Continuar →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default EadStep;
