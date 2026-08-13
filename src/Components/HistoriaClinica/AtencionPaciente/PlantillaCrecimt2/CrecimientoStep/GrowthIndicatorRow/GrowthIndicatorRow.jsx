'use client';

import { useId } from 'react';
import './GrowthIndicatorRow.css';
import { LuChartLine } from 'react-icons/lu';

// Una fila de indicador de "Verificar el crecimiento" (ver CrecimientoStep.jsx,
// 5 reusos — misma razón de extracción que SystemExamCard.jsx en
// ExamenFisicoStep). El valor DE es un select de rangos fijos (`opciones`,
// ver crecimientoData.js) en vez de un número libre — Clasificación NO es
// una elección manual (Normal/Anormal/Sin registrar, versión anterior de
// este campo): es un resultado derivado automáticamente de la opción
// elegida, mostrado en un campo no editable con la misma pill "Resultado" +
// relleno tinte primario que .ef-calculated-input (ExamenFisicoStep, IMC) —
// acá el resultado es categórico (texto clínico), no un número calculado,
// pero el mecanismo de "esto no se escribe a mano" es el mismo. "Ver
// evolución" no abre una gráfica real (no hay serie histórica del paciente
// en los datos de prueba ni librería de charts en el proyecto): dispara un
// toast, mismo patrón "visible pero en desarrollo" que el resto del wizard
// (ver handleGuardarContinuar en PlantillaCrecimt2.jsx).
export default function GrowthIndicatorRow({ label, opciones, value, onValueChange, onVerEvolucion }) {
  const valueId = useId();
  const clasificacionId = useId();

  const clasificacion = opciones.find((o) => o.label === value)?.clasificacion ?? '';

  return (
    <div className="gc-indicator-row">
      <div className="form-field gc-indicator-select-field">
        <label htmlFor={valueId}>{label}</label>
        <div className="gc-indicator-select-wrap">
          <select
            id={valueId}
            className="gc-indicator-select"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
          >
            <option value=""></option>
            {opciones.map((o) => <option key={o.label} value={o.label}>{o.label}</option>)}
          </select>

          <button
            type="button"
            className="gc-trend-btn"
            onClick={onVerEvolucion}
            aria-label={`Ver evolución de ${label}`}
            title="Ver evolución"
          >
            <LuChartLine className="icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="form-field gc-indicator-clasificacion-field">
        <label htmlFor={clasificacionId}>Clasificación<span className="pf-field-tag">Resultado</span></label>
        <input
          id={clasificacionId}
          type="text"
          disabled
          readOnly
          className="gc-clasificacion-input"
          value={clasificacion}
          placeholder="Selecciona un valor"
          aria-live="polite"
        />
      </div>
    </div>
  );
}
