import './AdmisionesEmptyState.css';
import { LuClipboardX } from 'react-icons/lu';

// Mismo patrón que AgendaEmptyState (icono en círculo + título, ver
// AGENTS.md) — sin CTA propio: "limpiar filtros" ya lo resuelve el usuario
// cambiando el estado en StatusFilterDropdown o borrando la búsqueda.
export default function AdmisionesEmptyState({ title = 'No hay admisiones para mostrar.', subtitle }) {
  return (
    <div className="adm-empty-state">
      <div className="adm-empty-icon"><LuClipboardX className="icon" /></div>
      <div className="adm-empty-title">{title}</div>
      {subtitle && <div className="adm-empty-sub">{subtitle}</div>}
    </div>
  );
}
