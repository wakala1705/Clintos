'use client';

import './IniciarLimpiezaModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { AREA_LABEL, SEDE_LABEL } from '@/hooks/GestionCamas/mockLimpiezaData';
import { LuSprayCan } from 'react-icons/lu';

// Confirmación antes de mutar estado (encargo sección 2) — sin <form>: es un
// diálogo de confirmación puro, sin campos que editar, así que .modal-card
// (ya flex-column) alcanza sin el fix de "`.modal-card > form`" que sí
// necesitan los modales con inputs (ver CambiarEstadoModal.jsx).
export default function IniciarLimpiezaModal({ tarea, onClose, onConfirm }) {
  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="iniciar-limpieza-title">
        <ModalHeader
          icon={LuSprayCan}
          tone="primary"
          title="Iniciar limpieza"
          titleId="iniciar-limpieza-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-field">
            <label>Cama</label>
            <div className="tf-readonly-value">
              {`${tarea.cama} — ${SEDE_LABEL[tarea.sede]} · ${AREA_LABEL[tarea.area]} · ${tarea.ubicacion}`}
            </div>
          </div>
          <p className="cbl-modal-msg">
            Al iniciar la limpieza se registrará la hora de inicio y quedarás asignado como responsable.
          </p>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" icon={LuSprayCan} onClick={() => onConfirm(tarea.id)}>
            Iniciar limpieza
          </Button>
        </div>
      </div>
    </div>
  );
}
