import { LuClock } from 'react-icons/lu';
import './HoraInput.css';
import { formatearHora, horaAhora } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/hojaGasto';

// Hora 'HH:mm' en 24 h con máscara progresiva + botón "Ahora".
export default function HoraInput({
  id, label, value, onChange, disabled = false, sinAhora = false,
}) {
  return (
    <div className="hgq-hora">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        maxLength={5}
        placeholder="HH:mm"
        autoComplete="off"
        className="hgq-input hgq-hora-input"
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(formatearHora(e.target.value))}
      />
      {!disabled && !sinAhora && (
        <button
          type="button"
          className="hgq-hora-ahora"
          aria-label={`Registrar hora actual en ${label}`}
          onClick={() => onChange(horaAhora())}
        >
          <LuClock className="icon" aria-hidden="true" />
          Ahora
        </button>
      )}
    </div>
  );
}
