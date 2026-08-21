'use client';

import './ActivityDrawer.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { formatRelativeTime } from '@/hooks/GestionCamas/formatRelativeTime';
import {
  LuArrowRightLeft, LuBellRing, LuCircleCheck, LuClock, LuLock, LuLogOut, LuSprayCan, LuUserPlus, LuWrench,
} from 'react-icons/lu';

// Mismo mapeo tipo→ícono/color que ActivityPanel.jsx — se duplica acá (en
// vez de importarlo) porque son 2 componentes hermanos dentro del mismo
// feature-folder sin un tercer consumidor todavía; si aparece uno más, esto
// sube a un helper compartido (ver AGENTS.md "Component organization").
const EVENTO_CONFIG = {
  'cama-liberada': { icon: LuCircleCheck, color: 'green' },
  'paciente-asignado': { icon: LuUserPlus, color: 'blue' },
  'paciente-trasladado': { icon: LuArrowRightLeft, color: 'blue' },
  'paciente-alta': { icon: LuLogOut, color: 'green' },
  'limpieza-iniciada': { icon: LuSprayCan, color: 'amber' },
  'limpieza-finalizada': { icon: LuSprayCan, color: 'green' },
  'cama-reservada': { icon: LuClock, color: 'amber' },
  'cama-bloqueada': { icon: LuLock, color: 'gray' },
  'cama-mantenimiento': { icon: LuWrench, color: 'orange' },
  'nueva-admision': { icon: LuUserPlus, color: 'blue' },
};
const EVENTO_CONFIG_DEFAULT = { icon: LuBellRing, color: 'gray' };

// "Ver toda la actividad →" del panel derecho — vista extendida del mismo
// historial (encargo: "puede abrir un drawer o vista extendida de historial
// completo"). Reusa el shell .cb-drawer-* (GestionCamas.css) + ModalHeader
// homologado, mismo patrón que UpcomingAdmissionsDrawer.
export default function ActivityDrawer({ open, eventos, now, onClose }) {
  return (
    <div className={`cb-drawer-overlay${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cb-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="activity-drawer-title">
        <ModalHeader icon={LuBellRing} title="Actividad reciente" titleId="activity-drawer-title" onClose={onClose} />
        <div className="cb-drawer-count">{eventos.length} eventos</div>
        <div className="cb-drawer-body cb-activity-list">
          {eventos.length === 0 ? (
            <div className="cb-activity-empty">Sin actividad registrada todavía.</div>
          ) : eventos.map((ev) => {
            const { icon: Icon, color } = EVENTO_CONFIG[ev.tipo] ?? EVENTO_CONFIG_DEFAULT;
            return (
              <div className="cb-activity-item" key={ev.id}>
                <span className={`cb-activity-dot dot-${color}`}>
                  <Icon className="icon" aria-hidden="true" />
                </span>
                <div className="cb-activity-body">
                  <div className="cb-activity-title">{ev.titulo}</div>
                  <div className="cb-activity-desc">{ev.detalle}</div>
                  <div className="cb-activity-time">{formatRelativeTime(ev.timestamp, now)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
