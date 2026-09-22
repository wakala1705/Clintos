'use client';

import { useState } from 'react';
import FormSelect from '@/Components/FormSelect/FormSelect';

// Transcrito de "PLAN DE TRATAMIENTO" de la captura del sistema legado
// (INGHOSP): análisis/opinión libres + tamizaje nutricional de 3 preguntas.
// Los 3 selects del tamizaje traían un código numérico pegado a cada opción
// en el legado (ej. "No / 0", "no estoy seguro / 2") — acá se muestra solo
// la etiqueta limpia, `value` es el string en minúsculas equivalente (ver
// options de cada FormSelect). "Si ha perdido peso ¿Cuánto?" reordena los
// rangos de kg de forma ascendente (1-5/6-10/11-15/>15): el legado los
// mostraba en un orden alfabético-de-string inconsistente, artefacto de
// cómo ordenaba las opciones esa pantalla, no un orden intencional a
// replicar. Se mantiene SIEMPRE montado (`hidden`, ver
// PlantillaIngresoHospitalizacion.jsx).
const PERDIDA_PESO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
  { value: 'no_estoy_seguro', label: 'No estoy seguro' },
];

const CANTIDAD_PESO_OPTIONS = [
  { value: '1-5', label: '1-5 kg' },
  { value: '6-10', label: '6-10 kg' },
  { value: '11-15', label: '11-15 kg' },
  { value: '>15', label: '> 15 kg' },
];

const SI_NO_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'si', label: 'Sí' },
];

export default function PlanTratamientoStep({ hidden }) {
  const [analisisClinico, setAnalisisClinico] = useState('');
  const [opinionPlanTratamiento, setOpinionPlanTratamiento] = useState('');
  const [perdidaPeso, setPerdidaPeso] = useState('');
  const [cantidadPeso, setCantidadPeso] = useState('');
  const [comidoMenos, setComidoMenos] = useState('');

  return (
    <div style={hidden ? { display: 'none' } : undefined}>
      <h3 className="pih-section-title">Plan de tratamiento</h3>
      <p className="pih-section-desc">Análisis clínico, opinión del plan de tratamiento y tamizaje nutricional.</p>

      <div className="pih-fields">
        <div className="form-field">
          <label htmlFor="pt-analisis-clinico">Análisis clínico</label>
          <textarea
            id="pt-analisis-clinico"
            rows={4}
            value={analisisClinico}
            onChange={(e) => setAnalisisClinico(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="pt-opinion-plan">Opinión plan de tratamiento</label>
          <textarea
            id="pt-opinion-plan"
            rows={4}
            value={opinionPlanTratamiento}
            onChange={(e) => setOpinionPlanTratamiento(e.target.value)}
          />
        </div>

        <div className="form-field" style={{ maxWidth: 320 }}>
          <label htmlFor="pt-perdida-peso">¿Ha perdido peso involuntariamente?</label>
          <FormSelect
            id="pt-perdida-peso"
            value={perdidaPeso}
            onChange={setPerdidaPeso}
            options={PERDIDA_PESO_OPTIONS}
            placeholder="Selecciona una opción"
          />
        </div>

        <div className="form-field" style={{ maxWidth: 320 }}>
          <label htmlFor="pt-cantidad-peso">Si ha perdido peso, ¿cuánto?</label>
          <FormSelect
            id="pt-cantidad-peso"
            value={cantidadPeso}
            onChange={setCantidadPeso}
            options={CANTIDAD_PESO_OPTIONS}
            placeholder="Selecciona una opción"
          />
        </div>

        <div className="form-field" style={{ maxWidth: 320 }}>
          <label htmlFor="pt-comido-menos">¿Ha comido menos a raíz de pérdida de apetito?</label>
          <FormSelect
            id="pt-comido-menos"
            value={comidoMenos}
            onChange={setComidoMenos}
            options={SI_NO_OPTIONS}
            placeholder="Selecciona una opción"
          />
        </div>
      </div>
    </div>
  );
}
