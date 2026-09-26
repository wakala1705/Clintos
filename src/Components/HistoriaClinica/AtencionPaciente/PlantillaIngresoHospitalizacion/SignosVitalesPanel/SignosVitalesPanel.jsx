'use client';

import { useId, useState } from 'react';
import './SignosVitalesPanel.css';
import { LuChevronDown, LuHeartPulse } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import {
  calcularDerivados, categoriaImc, descripcionRango, evaluarRango,
} from '@/hooks/HistoriaClinica/signosVitales';

const VITALES = [
  { key: 'temperatura', label: 'Temperatura', unit: '°C' },
  { key: 'frecuenciaCardiaca', label: 'Frecuencia cardiaca', unit: 'bpm' },
  { key: 'frecuenciaRespiratoria', label: 'Frecuencia respiratoria', unit: 'rpm' },
];

// Input numérico de un signo + su unidad + punto de estado. El punto marca
// valores fuera de rango (ámbar = alterado, rojo = crítico, ver
// @/hooks/HistoriaClinica/signosVitales) y su texto ("Valor alto"/"Valor
// bajo") queda para lector de pantalla vía aria-describedby.
function VitalInput({ id, campo, value, onChange, ariaLabel, estadoId }) {
  const estado = evaluarRango(campo, value);
  const descripcion = descripcionRango(campo, value);
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      placeholder="—"
      aria-label={ariaLabel}
      aria-describedby={descripcion && estadoId ? estadoId : undefined}
      className={`svp-input${estado ? ` is-${estado}` : ''}`}
      value={value ?? ''}
      onChange={(e) => onChange(campo, e.target.value)}
    />
  );
}

function EstadoDot({ id, campos, valores }) {
  const estados = campos.map((c) => evaluarRango(c, valores[c]));
  const estado = estados.includes('danger') ? 'danger' : estados.includes('warn') ? 'warn' : null;
  const descripcion = campos.map((c) => descripcionRango(c, valores[c])).filter(Boolean).join(', ');
  return (
    <span className="svp-dot-slot">
      {estado && <span className={`svp-dot is-${estado}`} title={descripcion} aria-hidden="true" />}
      {descripcion && <span id={`${id}-estado`} className="sr-only">{descripcion}</span>}
    </span>
  );
}

// Bloque "Signos vitales" de la columna derecha de pih-body, encima de
// Diagnósticos (encargo explícito). Dos grupos: medidas corporales (IMC/ISC
// calculados de estatura + peso, solo lectura para que no puedan
// contradecirlos) y signos vitales (presión arterial en una sola fila
// sistólica/diastólica, notación clínica). Colapsable con el patrón de
// acordeón WAI (<h3><button aria-expanded>).
export default function SignosVitalesPanel({ inicial }) {
  const [abierto, setAbierto] = useState(true);
  const [valores, setValores] = useState(() => ({ ...inicial }));
  const uid = useId();
  const bodyId = `${uid}-body`;
  const { imc, isc } = calcularDerivados(valores);
  const catImc = categoriaImc(imc);

  function update(campo, value) {
    setValores((prev) => ({ ...prev, [campo]: value }));
  }

  return (
    <section className="svp-panel">
      <div className="pih-aside-title-row">
        <span className="pih-aside-title-icon"><LuHeartPulse className="icon" aria-hidden="true" /></span>
        <h3 className="pih-section-title pih-aside-title">
          <button
            type="button"
            className="pih-aside-toggle"
            aria-expanded={abierto}
            aria-controls={bodyId}
            onClick={() => setAbierto((v) => !v)}
          >
            Signos vitales
            <LuChevronDown className={`icon pih-aside-chev${abierto ? ' open' : ''}`} aria-hidden="true" />
          </button>
        </h3>
      </div>

      {abierto && (
        <div id={bodyId} className="svp-body">
          <div className="svp-group" role="group" aria-labelledby={`${uid}-g1`}>
            <p id={`${uid}-g1`} className="svp-group-label">Medidas corporales</p>

            {[
              { key: 'estatura', label: 'Estatura', unit: 'cm' },
              { key: 'peso', label: 'Peso', unit: 'kg' },
            ].map(({ key, label, unit }) => (
              <div className="svp-row" key={key}>
                <label htmlFor={`${uid}-${key}`} className="svp-label">{label}</label>
                <div className="svp-control">
                  <VitalInput id={`${uid}-${key}`} campo={key} value={valores[key]} onChange={update} ariaLabel={`${label} (${unit})`} estadoId={`${uid}-${key}-estado`} />
                  <span className="svp-unit">{unit}</span>
                  <span className="svp-dot-slot" />
                </div>
              </div>
            ))}

            <div className="svp-row">
              <span className="svp-label">
                IMC <span className="svp-calc-hint">Calculado</span>
              </span>
              <div className="svp-control">
                {catImc && <Badge tone={catImc.tone}>{catImc.label}</Badge>}
                <output className={`svp-calc${imc == null ? ' is-empty' : ''}`} aria-label="IMC calculado">
                  {imc == null ? '—' : imc.toFixed(1)}
                </output>
                <span className="svp-unit">kg/m²</span>
                <span className="svp-dot-slot" />
              </div>
            </div>

            <div className="svp-row">
              <span className="svp-label">
                ISC <span className="svp-calc-hint">Calculado</span>
              </span>
              <div className="svp-control">
                <output className={`svp-calc${isc == null ? ' is-empty' : ''}`} aria-label="ISC calculado">
                  {isc == null ? '—' : isc.toFixed(2)}
                </output>
                <span className="svp-unit">m²</span>
                <span className="svp-dot-slot" />
              </div>
            </div>
          </div>

          <div className="svp-group" role="group" aria-labelledby={`${uid}-g2`}>
            <p id={`${uid}-g2`} className="svp-group-label">Signos vitales</p>

            {VITALES.map(({ key, label, unit }) => (
              <div className="svp-row" key={key}>
                <label htmlFor={`${uid}-${key}`} className="svp-label">{label}</label>
                <div className="svp-control">
                  <VitalInput id={`${uid}-${key}`} campo={key} value={valores[key]} onChange={update} ariaLabel={`${label} (${unit})`} estadoId={`${uid}-${key}-estado`} />
                  <span className="svp-unit">{unit}</span>
                  <EstadoDot id={`${uid}-${key}`} campos={[key]} valores={valores} />
                </div>
              </div>
            ))}

            <div className="svp-row">
              <label htmlFor={`${uid}-sistolica`} className="svp-label">Presión arterial</label>
              <div className="svp-control svp-pa">
                <VitalInput id={`${uid}-sistolica`} campo="sistolica" value={valores.sistolica} onChange={update} ariaLabel="Presión sistólica (mmHg)" estadoId={`${uid}-pa-estado`} />
                <span className="svp-pa-sep" aria-hidden="true">/</span>
                <VitalInput id={`${uid}-diastolica`} campo="diastolica" value={valores.diastolica} onChange={update} ariaLabel="Presión diastólica (mmHg)" estadoId={`${uid}-pa-estado`} />
                <span className="svp-unit">mmHg</span>
                <EstadoDot id={`${uid}-pa`} campos={['sistolica', 'diastolica']} valores={valores} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
