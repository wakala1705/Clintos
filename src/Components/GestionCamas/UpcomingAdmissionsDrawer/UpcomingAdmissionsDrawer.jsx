'use client';

import './UpcomingAdmissionsDrawer.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { TIPO_INGRESO_LABEL } from '@/hooks/GestionCamas/mockCamasData';
import { LuCalendarClock } from 'react-icons/lu';

// Drawer de "Próximos ingresos · N" (encargo: "¿qué pacientes están próximos
// a ingresar o trasladarse?") — mismo shell .cb-drawer-* que ActivityDrawer.
// El CTA "Asignar cama" dispara `onAsignar` (GestionCamas.jsx decide qué
// hacer, hoy el mismo aviso "en desarrollo" que el resto de acciones sin
// pantalla propia, ver ACCIONES_EN_DESARROLLO) — este componente no conoce
// esa lógica, solo la dispara.
export default function UpcomingAdmissionsDrawer({
  open, ingresos, onClose, onAsignar,
}) {
  return (
    <div className={`cb-drawer-overlay${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cb-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="ingresos-drawer-title">
        <ModalHeader icon={LuCalendarClock} title="Próximos ingresos" titleId="ingresos-drawer-title" onClose={onClose} />
        <div className="cb-drawer-count">{ingresos.length} pendientes</div>
        <div className="cb-drawer-body">
          {ingresos.length === 0 ? (
            <div className="cb-activity-empty">No hay ingresos ni traslados próximos.</div>
          ) : ingresos.map((ing) => (
            <div className="cb-ingreso-item" key={ing.id}>
              <div className="cb-ingreso-hora">{ing.hora}</div>
              <div className="cb-ingreso-body">
                <div className="cb-ingreso-tipo">{TIPO_INGRESO_LABEL[ing.tipo]}</div>
                <div className="cb-ingreso-ruta">{ing.origen} → {ing.destino}</div>
                <div className="cb-ingreso-detalle">{ing.detalle}</div>
                {ing.estado === 'pendiente' && (
                  <button type="button" className="btn btn-primary btn-sm cb-ingreso-cta" onClick={() => onAsignar(ing)}>
                    Asignar cama
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
