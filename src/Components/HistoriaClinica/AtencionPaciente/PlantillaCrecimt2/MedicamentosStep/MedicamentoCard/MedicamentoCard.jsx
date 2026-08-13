'use client';

import { useId } from 'react';
import './MedicamentoCard.css';
import { LuPill } from 'react-icons/lu';

// Opciones reales del select de cada medicamento (ver capturas de
// referencia del legacy) — NO es un select de "qué medicamento" (eso es el
// nombre fijo de la tarjeta, ver `nombre` más abajo): es el estado de
// suministro de ESE medicamento puntual. Sulfato Ferroso/Vitamina A
// comparten las mismas 7 opciones (Sí/No + 4 razones de "no se suministra"
// + "No aplica"); Albendazol en el legacy solo trae 3 (Sí/No/No aplica, sin
// las razones detalladas) — se mantiene esa diferencia tal cual, no se
// homologan a la fuerza.
export const ESTADO_OPCIONES_COMPLETO = [
  'NO',
  'NO APLICA',
  'NO SE SUMINISTRA POR NEGACIÓN DEL USUARIO',
  'NO SE SUMINISTRA POR OTRAS RAZONES',
  'NO SE SUMINISTRA POR UNA CONDICIÓN DE SALUD',
  'NO SE SUMINISTRA POR UNA TRADICIÓN',
  'SI',
];
export const ESTADO_OPCIONES_ALBENDAZOL = ['NO', 'NO APLICA', 'SI'];

// Una tarjeta de prescripción (ver MedicamentosStep.jsx, 3 reusos: Sulfato
// Ferroso/Vitamina A comparten forma — ¿Se suministra? + Fecha + Dosis en 3
// columnas —, Albendazol cambia el último campo a "Otros" en un textarea
// ancho vía `campoExtraWide`, además de su propio set más corto de
// opciones). Mismo criterio de extracción que GrowthIndicatorRow.jsx/
// SystemExamCard.jsx: markup repetido 3 veces con pequeñas variaciones por
// instancia. `nombre` es el título fijo de la tarjeta (Sulfato Ferroso/
// Vitamina A/Albendazol) — a diferencia de una versión anterior de este
// componente, YA NO es un select editable: en el legacy el nombre del
// medicamento es la etiqueta de fila, no un valor que se elija (ver
// capturas de referencia); lo que sí se elige es el estado de suministro.
export default function MedicamentoCard({
  nombre,
  estado, onEstadoChange, opcionesEstado,
  fecha, onFechaChange,
  campoExtraLabel, campoExtraValue, onCampoExtraChange, campoExtraPlaceholder, campoExtraWide,
}) {
  const estadoId = useId();
  const fechaId = useId();
  const extraId = useId();

  return (
    <div className="mc-card">
      <div className="pf-card-header-icon">
        <span className="pf-block-icon"><LuPill className="icon" aria-hidden="true" /></span>
        <h2 className="pf-card-title">{nombre}</h2>
      </div>

      <div className={campoExtraWide ? 'pf-grid-2col' : 'pf-grid-3'}>
        <div className="form-field">
          <label htmlFor={estadoId}>¿Se suministra?</label>
          <select id={estadoId} value={estado} onChange={(e) => onEstadoChange(e.target.value)}>
            <option value=""></option>
            {opcionesEstado.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor={fechaId}>Fecha de prescripción</label>
          <input
            id={fechaId} type="date" value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
          />
        </div>
        {!campoExtraWide && (
          <div className="form-field">
            <label htmlFor={extraId}>{campoExtraLabel}</label>
            <input
              id={extraId} type="text" value={campoExtraValue} placeholder={campoExtraPlaceholder}
              onChange={(e) => onCampoExtraChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {campoExtraWide && (
        <div className="form-field mc-extra-wide">
          <label htmlFor={extraId}>{campoExtraLabel}</label>
          <textarea
            id={extraId} rows={3} value={campoExtraValue} placeholder={campoExtraPlaceholder}
            onChange={(e) => onCampoExtraChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
