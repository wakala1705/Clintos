'use client';

import { useId } from 'react';
import './GrowthIndicatorRow.css';
import { estadoDeClasificacion } from '../GrowthChartModal/growthChartData';

// Una fila de indicador de "Verificar el crecimiento" (ver CrecimientoStep.jsx,
// 5 reusos — misma razón de extracción que SystemExamCard.jsx en
// ExamenFisicoStep). NI el rango DE ni la Clasificación son una elección
// manual (encargo explícito: "el usuario no tiene que llenar el paso 10") —
// `opcion` ya viene resuelta desde CrecimientoStep.jsx, que la deriva del
// z-score real de Peso/Talla/PC/IMC de "09 Examen físico" (ver opcionPorZ en
// crecimientoData.js + calcularZ en growthChartData.js) contra la edad y
// sexo del paciente. Ambos campos quedan no editables: el DE con el mismo
// tinte "campo calculado" que .ef-calculated-input (ExamenFisicoStep, IMC);
// la Clasificación tiñe además según su estado clínico (verde/ámbar/rojo/gris
// — mismo criterio de 4 estados que .gcm-interpretation en GrowthChartModal,
// vía el mismo estadoDeClasificacion, para que formulario y modal lean el
// mismo color para el mismo resultado). Sin `opcion` (falta algún dato de
// "09 Examen físico" o la edad no es parseable), ambos campos muestran el
// mismo placeholder explicando de dónde deberían venir. Ya no trae su propio
// botón "ver evolución" (encargo explícito: las 5 filas abrían el mismo
// modal con el mismo selector de indicador por chips — ver
// GrowthChartModal.jsx —, así que ese trigger vive una sola vez en
// CrecimientoStep.jsx en vez de repetirse por fila).
const PLACEHOLDER = 'Pendiente de "09 Examen físico"';

export default function GrowthIndicatorRow({ label, opcion }) {
  const valueId = useId();
  const clasificacionId = useId();

  const clasificacion = opcion?.clasificacion ?? '';
  const estado = clasificacion ? estadoDeClasificacion(clasificacion) : null;

  return (
    <div className="gc-indicator-row">
      <div className="form-field">
        <label htmlFor={valueId}>{label}<span className="pf-field-tag">Calculado</span></label>
        <input
          id={valueId}
          type="text"
          disabled
          readOnly
          className="gc-de-input"
          value={opcion?.label ?? ''}
          placeholder={PLACEHOLDER}
        />
      </div>

      <div className="form-field gc-indicator-clasificacion-field">
        <label htmlFor={clasificacionId}>Clasificación<span className="pf-field-tag">Resultado</span></label>
        <input
          id={clasificacionId}
          type="text"
          disabled
          readOnly
          className={`gc-clasificacion-input${estado ? ` gc-clasificacion-${estado}` : ''}`}
          value={clasificacion}
          placeholder={PLACEHOLDER}
          aria-live="polite"
        />
      </div>
    </div>
  );
}
