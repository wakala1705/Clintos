'use client';

import { useState } from 'react';

// Transcrito de "INSPECCION GENERAL"/"EXAMEN FISICO"/"SIGNOS VITALES" de la
// captura del sistema legado (INGHOSP). "Signos vitales" (6 medidas) y
// "Examen físico por sistemas" (9 campos + ayudas diagnósticas) son dos
// subgrupos separados por un ancla propia en el legado ("SIGNO VITALES") —
// acá se representan como subtítulos, no como campos. Tensión arterial se
// deja como un solo campo de texto (ej. "120/80"), igual que el legado — no
// se divide en sistólica/diastólica como en PlantillaCrecimt2/ExamenFisicoStep
// (esa plantilla es una fuente distinta, con su propio formulario). Se
// mantiene SIEMPRE montado (`hidden`, ver PlantillaIngresoHospitalizacion.jsx).
const SISTEMAS = [
  { key: 'cabezaOjosOrl', label: 'Cabeza / Ojos / ORL' },
  { key: 'cuello', label: 'Cuello' },
  { key: 'torax', label: 'Tórax' },
  { key: 'abdomen', label: 'Abdomen' },
  { key: 'extremidades', label: 'Extremidades' },
  { key: 'genitourinario', label: 'Genitourinario' },
  { key: 'neurologico', label: 'Neurológico' },
  { key: 'osteomuscular', label: 'Osteo-muscular / Tejidos blandos' },
  { key: 'tegumentario', label: 'Tegumentario' },
  { key: 'ayudasDiagnosticas', label: 'Ayudas diagnósticas / Paraclínicos' },
];

function estadoInicialSistemas() {
  return Object.fromEntries(SISTEMAS.map((s) => [s.key, '']));
}

export default function ExamenFisicoStep({ hidden }) {
  const [inspeccionGeneral, setInspeccionGeneral] = useState('');
  const [signosVitales, setSignosVitales] = useState({
    frecuenciaCardiaca: '', frecuenciaRespiratoria: '', tensionArterial: '', temperatura: '', peso: '', talla: '',
  });
  const [sistemas, setSistemas] = useState(estadoInicialSistemas);

  function updateSignoVital(campo, value) {
    setSignosVitales((prev) => ({ ...prev, [campo]: value }));
  }

  function updateSistema(key, value) {
    setSistemas((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div style={hidden ? { display: 'none' } : undefined}>
      <h3 className="pih-section-title">Examen físico</h3>
      <p className="pih-section-desc">Inspección general, signos vitales y examen físico por sistemas.</p>

      <div className="pih-fields">
        <div className="form-field">
          <label htmlFor="ef-inspeccion-general">Inspección general</label>
          <textarea
            id="ef-inspeccion-general"
            rows={3}
            value={inspeccionGeneral}
            onChange={(e) => setInspeccionGeneral(e.target.value)}
          />
        </div>

        <h4 className="pih-subsection-title">Signos vitales</h4>
        <div className="pih-grid-3">
          <div className="form-field">
            <label htmlFor="ef-fc">Frecuencia cardiaca (lpm)</label>
            <input
              id="ef-fc" type="number" min="0"
              value={signosVitales.frecuenciaCardiaca}
              onChange={(e) => updateSignoVital('frecuenciaCardiaca', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ef-fr">Frecuencia respiratoria (x min)</label>
            <input
              id="ef-fr" type="number" min="0"
              value={signosVitales.frecuenciaRespiratoria}
              onChange={(e) => updateSignoVital('frecuenciaRespiratoria', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ef-ta">Tensión arterial (mmHg)</label>
            <input
              id="ef-ta" type="text" placeholder="Ej. 120/80"
              value={signosVitales.tensionArterial}
              onChange={(e) => updateSignoVital('tensionArterial', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ef-temp">Temperatura (°C)</label>
            <input
              id="ef-temp" type="number" step="0.1" min="0"
              value={signosVitales.temperatura}
              onChange={(e) => updateSignoVital('temperatura', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ef-peso">Peso (kg)</label>
            <input
              id="ef-peso" type="number" step="0.1" min="0"
              value={signosVitales.peso}
              onChange={(e) => updateSignoVital('peso', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="ef-talla">Talla (cm)</label>
            <input
              id="ef-talla" type="number" step="0.1" min="0"
              value={signosVitales.talla}
              onChange={(e) => updateSignoVital('talla', e.target.value)}
            />
          </div>
        </div>

        <h4 className="pih-subsection-title">Examen físico por sistemas</h4>
        {SISTEMAS.map((sistema) => (
          <div className="form-field" key={sistema.key}>
            <label htmlFor={`ef-${sistema.key}`}>{sistema.label}</label>
            <textarea
              id={`ef-${sistema.key}`}
              rows={3}
              value={sistemas[sistema.key]}
              onChange={(e) => updateSistema(sistema.key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
