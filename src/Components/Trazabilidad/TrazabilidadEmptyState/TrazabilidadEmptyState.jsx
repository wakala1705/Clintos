import './TrazabilidadEmptyState.css';
import { LuSearchX } from 'react-icons/lu';

// Mismo patrón que AdmisionesEmptyState/AgendaEmptyState (icono en círculo +
// título, ver AGENTS.md) -- sin CTA propio: "limpiar filtros" ya lo resuelve
// el botón Limpiar del toolbar.
export default function TrazabilidadEmptyState({ title = 'No hay trabajos para mostrar.', subtitle }) {
  return (
    <div className="traz-empty-state">
      <div className="traz-empty-icon"><LuSearchX className="icon" /></div>
      <div className="traz-empty-title">{title}</div>
      {subtitle && <div className="traz-empty-sub">{subtitle}</div>}
    </div>
  );
}
