'use client';

import { useRef } from 'react';
import { LuPackageSearch } from 'react-icons/lu';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { CANASTA_ESTADO_LABEL } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { CANASTA_META, badgeProps } from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import { fechaHoraHistorial, insumosDeSolicitud } from '@/hooks/ProgramacionSalaCirugias/canastasHistorial';
import './DetalleSolicitudModal.css';

// Detalle de solo lectura de una solicitud del historial de canastas.
export default function DetalleSolicitudModal({ solicitud, onClose }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);
  const insumos = insumosDeSolicitud(solicitud.solicitud);
  const datos = [
    ['Paciente', solicitud.paciente, true],
    ['Procedimiento', solicitud.procedimiento, true],
    ['Sala', solicitud.sala],
    ['Fecha de solicitud', fechaHoraHistorial(solicitud.fecha)],
    ['Solicitó', solicitud.solicitadoPor],
    ['Recibió', solicitud.recibidoPor],
  ];

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div ref={cardRef} className="modal-card cnc-dsm-card" role="dialog" aria-modal="true" aria-labelledby="cnc-dsm-title">
        <ModalHeader
          icon={LuPackageSearch}
          tone="primary"
          title={`Solicitud ${solicitud.solicitud}`}
          titleId="cnc-dsm-title"
          onClose={onClose}
          autoFocusClose
          trailing={<Badge {...badgeProps(CANASTA_META[solicitud.estado])}>{CANASTA_ESTADO_LABEL[solicitud.estado]}</Badge>}
        />
        <div className="modal-body">
          <dl className="cnc-dsm-info">
            {datos.map(([label, valor, ancho]) => (
              <div key={label} className={`cnc-dsm-item${ancho ? ' wide' : ''}`}>
                <dt>{label}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
          <div className="cnc-tabla-scroll">
            <table className="cnc-tabla">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th className="cnc-num">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {insumos.map((i) => (
                  <tr key={i.nombre}>
                    <td>{i.nombre}</td>
                    <td className="cnc-num">{i.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
}
