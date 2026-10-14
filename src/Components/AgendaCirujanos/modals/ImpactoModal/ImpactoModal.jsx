'use client';

import { useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './ImpactoModal.css';
import Button from '@/Components/Button/Button';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { fechaHoraRangoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { textoMotivo } from '@/hooks/AgendaCirujanos/conflictos';

// Advertencia de cirugías que quedan fuera de agenda. SOLO advierte: lista cada
// cirugía con su motivo y deja elegir entre volver o confirmar; nunca cancela ni
// reprograma nada. Un único componente para los tres usos (guardar horario,
// agregar/eliminar una excepción y "ver cirugías fuera de agenda"): sin
// `textoConfirmar` solo se muestra el botón de volver/cerrar.
export default function ImpactoModal({
  titulo, intro, items, textoVolver, textoConfirmar, onVolver, onConfirmar,
}) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onVolver(); }}>
      <div
        ref={cardRef}
        className="modal-card ac-impacto-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ac-impacto-titulo"
      >
        <ModalHeader
          icon={LuTriangleAlert}
          tone="warning"
          title={titulo}
          titleId="ac-impacto-titulo"
          onClose={onVolver}
        />
        <div className="modal-body">
          <div className="ac-callout ac-callout-warn">
            <LuTriangleAlert className="icon" aria-hidden="true" />
            <p>{intro}</p>
          </div>
          <ul className="ac-impacto">
            {items.map(({ cirugia, motivo }) => (
              <li key={cirugia.id}>
                <span className="ac-impacto-cuando">
                  {fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}
                </span>
                <span className="ac-impacto-quien">{cirugia.paciente?.nombre}</span>
                <span className="ac-impacto-cuando">{cirugia.procedimientoPrincipal}</span>
                <span className="ac-impacto-motivo">{textoMotivo(motivo)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="modal-footer">
          <Button variant="outline" onClick={onVolver}>{textoVolver}</Button>
          {textoConfirmar && <Button onClick={onConfirmar}>{textoConfirmar}</Button>}
        </div>
      </div>
    </div>
  );
}
