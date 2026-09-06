'use client';

import './IniciarMantenimientoModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import { AREA_LABEL, SEDE_LABEL } from '@/hooks/GestionCamas/mockMantenimientoData';
import { LuWrench } from 'react-icons/lu';

// Confirmación simple antes de mutar estado — mismo patrón que
// IniciarLimpiezaModal.jsx: sin campos que editar, .modal-card alcanza sin
// el fix de "`.modal-card > form`" que sí necesitan los modales con inputs.
export default function IniciarMantenimientoModal({ mantenimiento, onClose, onConfirm }) {
  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card" role="dialog" aria-modal="true" aria-labelledby="cbm-iniciar-title">
        <ModalHeader
          icon={LuWrench}
          tone="primary"
          title="Iniciar mantenimiento"
          titleId="cbm-iniciar-title"
          onClose={onClose}
        />
        <div className="modal-body">
          <div className="form-field">
            <label>Cama</label>
            <div className="tf-readonly-value">
              {`${mantenimiento.cama} — ${SEDE_LABEL[mantenimiento.sede]} · ${AREA_LABEL[mantenimiento.area]} · ${mantenimiento.ubicacion}`}
            </div>
          </div>
          <p className="cbm-iniciar-msg">
            Al iniciar el mantenimiento la cama pasará a estado &quot;En proceso&quot;.
          </p>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" icon={LuWrench} onClick={() => onConfirm(mantenimiento.id)}>
            Iniciar mantenimiento
          </Button>
        </div>
      </div>
    </div>
  );
}
