'use client';

import './CurrencyInput.css';

// Separador de miles "." mientras se escribe, formato es-CO (encargo
// explícito: "si ingreso 200000... me muestre 200.000") -- reemplaza los
// <input type="number"> de campos monetarios, que no pueden mostrar "."
// como separador visual. `value`/`onChange` siguen siendo un string
// numérico plano parseable con Number() (punto decimal, ej. "200000.5"),
// igual que antes -- el consumidor no toca su lógica de cálculo/validación
// existente, solo cambia cómo se ve mientras se escribe. Sin componente de
// referencia previo en el proyecto para esto (los `toLocaleString('es-CO')`
// existentes son solo de despliegue, no de un input en vivo) -- primera vez
// que se necesita, ver AGENTS.md "Component organization" (2+ consumidores
// potenciales: cualquier campo "Valor X" del proyecto).
function formatDisplay(raw) {
  if (raw === '' || raw === null || raw === undefined) return '';
  const [intPart, decPart] = String(raw).split('.');
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decPart !== undefined ? `${groupedInt},${decPart}` : groupedInt;
}

// Inverso de formatDisplay: quita los "." de miles, pasa la "," decimal
// (única, la primera que haya) a "." para volver a un string parseable con
// Number(), y descarta cualquier otro caracter no numérico -- así un "-"
// tipiado a mano nunca llega a guardarse (mismo resultado que ya buscaba la
// validación de "no puede ser negativo" de cada consumidor, ahora
// prevenido en vez de solo marcado como error después).
function parseRaw(display) {
  const withoutThousands = display.replace(/\./g, '');
  const firstComma = withoutThousands.indexOf(',');
  if (firstComma === -1) return withoutThousands.replace(/[^0-9]/g, '');
  const intPart = withoutThousands.slice(0, firstComma).replace(/[^0-9]/g, '');
  const decPart = withoutThousands.slice(firstComma + 1).replace(/[^0-9]/g, '');
  return `${intPart}.${decPart}`;
}

export default function CurrencyInput({
  id, value, onChange, placeholder, required, disabled, className,
  'aria-invalid': ariaInvalid,
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      className={className}
      value={formatDisplay(value)}
      onChange={(e) => onChange(parseRaw(e.target.value))}
      // Selecciona todo el texto al enfocar (encargo explícito, bug real:
      // arrancar a escribir desde el "0,00" default insertaba el dígito
      // DENTRO de esos decimales -- tipiar "2" daba "0,002" en vez de "2").
      // Con todo seleccionado, el primer keystroke reemplaza el valor
      // completo en vez de insertarse en el medio -- mismo criterio que un
      // campo de monto de POS/planilla. Sin esto habría que reconstruir la
      // posición del caret en cada reformateo (los "." de miles se
      // insertan/corren con cada dígito), que es justamente el problema que
      // select() evita de raíz.
      onFocus={(e) => e.target.select()}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      aria-invalid={ariaInvalid}
    />
  );
}
