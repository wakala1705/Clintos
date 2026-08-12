'use client';

import { useState } from 'react';
import './EadDomainEtapa.css';
import EadItem from '../EadItem/EadItem';
import { RANGOS_EAD, contarCorrectos, puntajeDirecto } from '../eadData';
import { LuChevronDown, LuCircleCheck } from 'react-icons/lu';

// UN solo componente reutilizado 4 veces desde EadStep.jsx (Motricidad
// gruesa/fina, Audición y lenguaje, Personal social) — los 4 dominios
// comparten exactamente la misma estructura (12 rangos de edad × 3 ítems +
// card de resultado), solo cambian título/descripción/ítems (ver DOMINIOS
// en eadData.js). No bloquea el avance (encargo: advertencia blanda, ver
// EadStep.jsx).
//
// El selector de rango de edad (select) vive en el riel (EadStepper.jsx,
// debajo de los 5 nodos), no acá arriba de cada dominio — la selección
// sigue siendo estado elevado en EadStep.jsx y se comparte entre los 4
// dominios (los 12 rangos son idénticos en los 4), este componente solo
// recibe `rangoSeleccionado` ya resuelto para saber cuál rango es el
// "vigente" (pill + bloque auto-expandido) — sin pasar por ninguna
// conversión a días.
//
// Cada rango de edad es un bloque colapsable (progressive disclosure,
// encargo explícito: "evitar mostrar toda la información simultáneamente"),
// reutilizando .pf-block-header/.pf-block-chevron/.pf-block-body (mismo
// patrón que Antecedentes familiares/personales, ver AntecedentesStep.jsx)
// en vez de inventar un acordeón nuevo. El rango vigente arranca expandido
// y resaltado; el resto arranca colapsado pero queda a un clic de distancia
// — nunca se ocultan del todo (encargo: "permitir consultar otros rangos
// sin perder el contexto").
export default function EadDomainEtapa({
  dominio, rangoSeleccionado, respuestas, onRespuestaChange, resultado, onResultadoChange,
}) {
  const rangoVigente = rangoSeleccionado;

  const [expandedRangos, setExpandedRangos] = useState(() => (
    rangoVigente ? new Set([rangoVigente]) : new Set()
  ));
  // "Ajustar estado durante el render" (patrón documentado de React para
  // reaccionar a un prop que cambia sin useEffect, ver
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes):
  // si el chip elegido cambia mientras el profesional ya tiene esta etapa
  // abierta, el nuevo rango vigente se auto-expande acá mismo — sin cerrar
  // los que el usuario ya haya abierto manualmente, y sin el efecto
  // secundario en cascada de hacerlo en un useEffect.
  const [prevRangoVigente, setPrevRangoVigente] = useState(rangoVigente);
  if (rangoVigente !== prevRangoVigente) {
    setPrevRangoVigente(rangoVigente);
    if (rangoVigente && !expandedRangos.has(rangoVigente)) {
      setExpandedRangos(new Set(expandedRangos).add(rangoVigente));
    }
  }

  function toggleRango(id) {
    setExpandedRangos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const correctos = contarCorrectos(dominio.items, respuestas);
  const directo = puntajeDirecto(resultado.totalAcumuladoInicio, correctos);

  function updateResultado(patch) {
    onResultadoChange({ ...resultado, ...patch });
  }

  return (
    <div className="ac-wrap">
      <h1 className="pf-section-title">{dominio.label}</h1>
      <p className="pf-section-desc">{dominio.descripcion}</p>

      <section className="pf-card pf-card-split ead-rangos">
        {RANGOS_EAD.map((rango) => {
          const itemsDelRango = dominio.items.filter((it) => it.rango === rango.id);
          const expanded = expandedRangos.has(rango.id);
          const esVigente = rango.id === rangoVigente;
          return (
            <div key={rango.id} className="ead-rango-block">
              <button
                type="button"
                className={`pf-block-header ead-rango-header${esVigente ? ' vigente' : ''}`}
                onClick={() => toggleRango(rango.id)}
                aria-expanded={expanded}
              >
                <span className="pf-block-heading ead-rango-heading">
                  <h3 className="pf-card-title ead-rango-title">{rango.label}</h3>
                  {esVigente && (
                    <span className="ead-rango-vigente-pill">
                      <LuCircleCheck className="icon" aria-hidden="true" />
                      Edad actual
                    </span>
                  )}
                </span>
                <LuChevronDown className={`icon pf-block-chevron${expanded ? '' : ' collapsed'}`} aria-hidden="true" />
              </button>

              {expanded && (
                <div className="pf-block-body">
                  {itemsDelRango.map((it) => (
                    <EadItem
                      key={it.id}
                      id={it.id}
                      texto={it.texto}
                      valor={respuestas[it.id] ?? null}
                      onValorChange={(v) => onRespuestaChange(it.id, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      <section className="pf-card">
        <h2 className="pf-card-title">Resultado del dominio</h2>
        <p className="pf-card-desc">
          Ítems correctos y puntaje directo se calculan solos; puntaje típico, color y clasificación se
          diligencian según la tabla normativa de la EAD.
        </p>
        <div className="pf-grid-2col">
          <div className="form-field">
            <label htmlFor={`${dominio.key}-total-inicio`}>Total acumulado al inicio</label>
            <input
              id={`${dominio.key}-total-inicio`} type="number" min="0"
              value={resultado.totalAcumuladoInicio ?? ''}
              onChange={(e) => updateResultado({ totalAcumuladoInicio: e.target.value === '' ? null : Number(e.target.value) })}
            />
          </div>
          <div className="form-field">
            <label htmlFor={`${dominio.key}-correctos`}>Número de ítems correctos</label>
            <input id={`${dominio.key}-correctos`} type="text" value={correctos} disabled readOnly />
          </div>
          <div className="form-field">
            <label htmlFor={`${dominio.key}-directo`}>Puntaje directo</label>
            <input id={`${dominio.key}-directo`} type="text" value={directo} disabled readOnly />
          </div>
          <div className="form-field">
            <label htmlFor={`${dominio.key}-tipico`}>Puntaje típico</label>
            <input
              id={`${dominio.key}-tipico`} type="text" placeholder="Según tabla normativa"
              value={resultado.puntajeTipico} onChange={(e) => updateResultado({ puntajeTipico: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor={`${dominio.key}-color`}>Color</label>
            <input
              id={`${dominio.key}-color`} type="text" placeholder="Ej. Verde"
              value={resultado.color} onChange={(e) => updateResultado({ color: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor={`${dominio.key}-clasificacion`}>Clasificación</label>
            <input
              id={`${dominio.key}-clasificacion`} type="text" placeholder="Según tabla normativa"
              value={resultado.clasificacion} onChange={(e) => updateResultado({ clasificacion: e.target.value })}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
