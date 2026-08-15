'use client';

import './SiNoField.css';
import { useFieldSelectionMode } from '@/hooks/HistoriaClinica/fieldSelectionMode';

// Reemplaza un <select> Sí/No(/Desconoce/No aplica) controlado por un
// .form-field vertical (label arriba, control abajo) cuyo control real
// depende de la preferencia "Selección rápida" (ver Configuración > Clínico,
// ConfigModal.jsx): select nativo (modo 'select', markup idéntico al que
// reemplaza) o segmented control de botones (modo 'rapida', mismas clases
// .pf-toggle-group/.pf-toggle-btn que ya usan TriStateField/ValeQuestion/
// EadItem — ver PlantillaCrecimt2.css). No reutiliza TriStateField: ese
// componente asume el layout horizontal .pf-condition-row (label a la
// izquierda, botones a la derecha), mientras estos campos viven en
// .pf-grid-3/.pf-grid-4 como .form-field verticales — este componente
// preserva ese layout en ambos modos para que la grilla no salte de tamaño
// al cambiar el modo. `rowLayout` cubre el otro caso real (AlimentacionStep):
// preguntas largas con respuesta corta dentro de .form-field.pf-question-row
// (label a la izquierda, control de 200px a la derecha) — en modo 'rapida'
// usa un <p> (no <label>, no hay un único control al que apuntar con
// htmlFor) + aria-labelledby en el grupo, mismo criterio que ValeQuestion.jsx/
// CrecimientoStep (cuestionario APGAR). 4+ consumidores reales
// (AntecedentesStep, AlimentacionStep, FactoresRiesgoStep, RiesgoStep), por
// eso vive en su propia carpeta compartida (ver AGENTS.md).
export default function SiNoField({ id, label, value, onChange, options, rowLayout = false }) {
  const mode = useFieldSelectionMode();
  const wrapperClass = rowLayout ? 'form-field pf-question-row' : 'form-field';

  if (mode === 'select') {
    return (
      <div className={wrapperClass}>
        <label htmlFor={id}>{label}</label>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }

  const labelId = `${id}-label`;
  return (
    <div className={wrapperClass}>
      <p className="pf-condition-label" id={labelId}>{label}</p>
      <div className="pf-toggle-group" role="group" aria-labelledby={labelId}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`pf-toggle-btn${value === o.value ? ' active' : ''}`}
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
