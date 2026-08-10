import './AgendaEmptyState.css';
import { LuCalendarX } from 'react-icons/lu';

// Mismo patrón de estado vacío que PatientsEmptyState (icono en círculo +
// título con jerarquía visual, ver AGENTS.md). Props opcionales para que se
// reutilice en toda la feature (agenda sin citas, tab "Historia clínica" sin
// registros, cita no encontrada, panel de Registros sin datos) en vez de
// duplicar el markup — por defecto mantiene el mensaje original de la
// agenda, sin subtítulo/CTA porque no hay una acción de seguimiento clara
// para un día sin citas. `compact` reduce ícono/tipografía/padding para
// encajar en columnas angostas (ver RegistrosPanel).
export default function AgendaEmptyState({ icon: Icon = LuCalendarX, title = 'No hay citas para mostrar.', subtitle, compact = false }) {
  return (
    <div className={`hc-empty-state${compact ? ' compact' : ''}`}>
      <div className="hc-empty-icon"><Icon className="icon" /></div>
      <div className="hc-empty-title">{title}</div>
      {subtitle && <div className="hc-empty-sub">{subtitle}</div>}
    </div>
  );
}
