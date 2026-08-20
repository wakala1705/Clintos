import './ViewToggle.css';
import { LuGrid3X3, LuList } from 'react-icons/lu';

// Alterna tarjetas/tabla de forma explícita (encargo: "dos vistas
// intercambiables") — a diferencia de .pg-cards en PatientsTable.jsx, que es
// un fallback responsive automático por breakpoint, esto es un control que
// el usuario elige a cualquier ancho.
export default function ViewToggle({ view, onChange }) {
  return (
    <div className="cb-view-toggle" role="group" aria-label="Cambiar vista">
      <button
        type="button"
        className={view === 'tarjetas' ? 'active' : undefined}
        aria-pressed={view === 'tarjetas'}
        onClick={() => onChange('tarjetas')}
      >
        <LuGrid3X3 className="icon" aria-hidden="true" />
        Tarjetas
      </button>
      <button
        type="button"
        className={view === 'tabla' ? 'active' : undefined}
        aria-pressed={view === 'tabla'}
        onClick={() => onChange('tabla')}
      >
        <LuList className="icon" aria-hidden="true" />
        Tabla
      </button>
    </div>
  );
}
