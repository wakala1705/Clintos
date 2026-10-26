'use client';

import { useRef } from 'react';
import './CanastaDetalleModal.css';
import { LuPackageSearch } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import CanastaDetalle from '../CanastaDetalle/CanastaDetalle';

// Detalle de una solicitud de canastas en un modal (vista "Tabla" de
// CanastasCirugia.jsx). Monta el mismo <CanastaDetalle> del maestro-detalle con
// sus mismas props: las acciones y los borradores los lleva el orquestador, así
// que recepción, cierre con faltante, consumo y deshacer funcionan igual. Queda
// abierto tras confirmar (se ve el resultado); lo cierra el usuario.
export default function CanastaDetalleModal({ cirugia, onClose, ...detalleProps }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={cardRef} className="modal-card cdm-card" role="dialog" aria-modal="true" aria-labelledby="cdm-title">
        <ModalHeader
          icon={LuPackageSearch}
          tone="primary"
          title="Canasta de la cirugía"
          titleId="cdm-title"
          subtitle={`${cirugia.paciente.nombre} · ${fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}`}
          onClose={onClose}
          autoFocusClose
        />
        <div className="cdm-body">
          <CanastaDetalle cirugia={cirugia} {...detalleProps} />
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
