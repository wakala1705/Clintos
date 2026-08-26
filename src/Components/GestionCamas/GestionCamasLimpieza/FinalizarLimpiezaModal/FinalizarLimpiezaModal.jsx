'use client';

import './FinalizarLimpiezaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { SlaBadge } from '../LimpiezaBadges/LimpiezaBadges';
import { SLA_MINUTOS } from '@/hooks/GestionCamas/mockLimpiezaData';
import { LuCircleCheck } from 'react-icons/lu';

// `desdeLabel`/`elapsedMin`/`sla` llegan ya calculados desde el `now` vivo de
// GestionCamasLimpieza.jsx (mismas filas que la tabla) — si el modal queda
// abierto varios minutos, el tiempo transcurrido mostrado sigue avanzando
// igual que en la fila, no queda congelado al momento de abrir.
export default function FinalizarLimpiezaModal({
  tarea, desdeLabel, elapsedMin, sla, onClose, onConfirm,
}) {
  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="finalizar-limpieza-title">
        <ModalHeader
          icon={LuCircleCheck}
          tone="primary"
          title="Finalizar limpieza"
          titleId="finalizar-limpieza-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <p className="cbl-modal-msg">{`¿Deseas finalizar la limpieza de la cama ${tarea.cama}?`}</p>
          <div className="cbl-modal-resumen">
            <span>{`Inicio: ${desdeLabel} · Tiempo transcurrido: ${elapsedMin} min`}</span>
            <SlaBadge sla={sla} slaMinutos={SLA_MINUTOS} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={() => onConfirm(tarea.id)}>
            <LuCircleCheck className="icon" aria-hidden="true" />
            Finalizar limpieza
          </button>
        </div>
      </div>
    </div>
  );
}
