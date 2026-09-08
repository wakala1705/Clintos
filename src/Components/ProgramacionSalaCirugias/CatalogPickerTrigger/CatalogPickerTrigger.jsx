'use client';

import '@/Components/FormSelect/FormSelect.css';
import { LuChevronDown } from 'react-icons/lu';

// Mismo look que FormSelect (reusa sus clases .form-select*) para el caso en
// que el trigger no abre el listbox propio de FormSelect sino un modal de
// catálogo (ej. CatalogoSalasModal) — encargo explícito para "sala"/"causal"
// en esta feature (ver ReprogramarCirugiaModal.jsx/FiltrosBar.jsx), no un
// FormSelect con opciones recortadas. Sin CSS propio: no tiene reglas únicas,
// así que en vez de duplicarlas importa FormSelect.css directo (a diferencia
// de antes, cuando FiltrosBar.jsx/ReprogramarCirugiaModal.jsx reusaban las
// clases como string literal y dependían de que FormSelect.jsx estuviera
// importado en algún otro punto del mismo bundle para que la hoja cargara).
// `open` también se cablea al chevron (además del trigger, aunque
// `.form-select-trigger.open` no tiene regla propia) — bug real encontrado
// en la versión a mano: el chevron nunca rotaba al abrir el catálogo.
export default function CatalogPickerTrigger({
  id, label, placeholder = 'Selecciona una opción', open, onClick, ariaLabel, required = false,
}) {
  return (
    <div className="form-select">
      <button
        type="button"
        id={id}
        className={`form-select-trigger${open ? ' open' : ''}`}
        onClick={onClick}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        data-required-empty={required && !label ? 'true' : undefined}
      >
        <span className={label ? 'form-select-value' : 'form-select-placeholder'}>
          {label ?? placeholder}
        </span>
        <LuChevronDown className={`icon form-select-chev${open ? ' open' : ''}`} aria-hidden="true" />
      </button>
    </div>
  );
}
