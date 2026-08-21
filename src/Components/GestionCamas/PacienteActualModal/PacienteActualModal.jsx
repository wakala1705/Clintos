'use client';

import { useEffect } from 'react';
import './PacienteActualModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import InfoLine from '../InfoLine/InfoLine';
import { AREA_LABEL } from '@/hooks/GestionCamas/mockCamasData';
import { LuUser } from 'react-icons/lu';

// "DD/MM/YYYY HH:MM" (encargo, formato distinto al "16 de ago · 08:40" que
// ya usa InfoLine/formatIngreso en otros lados — este modal es el único
// lugar que pide fecha completa numérica, así que el helper vive acá y no
// en bedContextFormat.js).
function formatIngresoCama(admisionIso, horaIngreso) {
  if (!horaIngreso) return null;
  const [anio, mes, dia] = admisionIso.split('-');
  return `${dia}/${mes}/${anio} ${horaIngreso}`;
}

// "Ver paciente" del modal de detalle de cama abre este snapshot en vez de
// un toast (encargo) — un nivel más abajo que ese detalle, enfocado solo en
// el paciente actual. Reemplaza al modal anterior ("ver-detalle") en el
// mismo slot único `modal` de GestionCamas.jsx, no se apilan.
export default function PacienteActualModal({ cama, onClose, onAction }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const { paciente } = cama;

  function handleAction(action) {
    onClose();
    onAction(action, cama.id);
  }

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div
        className="modal-card task-mini-modal-card cb-paciente-actual-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paciente-actual-title"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={LuUser}
          tone="primary"
          title={paciente.nombre}
          titleId="paciente-actual-title"
          subtitle={`Cama ${cama.numero} · Paciente actual`}
          onClose={onClose}
        />

        <div className="modal-body">
          <div className="fp-section-title">Paciente actual</div>
          <InfoLine label="Historia" value={paciente.hc} />
          <InfoLine label="Admisión" value={paciente.admisionId ?? '—'} />
          <InfoLine label="Ingreso a cama" value={formatIngresoCama(paciente.admision, paciente.horaIngreso)} />
          <InfoLine label="Servicio" value={AREA_LABEL[cama.area]} />
        </div>

        <div className="modal-footer cb-paciente-actual-footer">
          <button type="button" className="btn btn-secondary" onClick={() => handleAction('ver-ficha-paciente')}>Ver paciente</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleAction('ver-admision')}>Ver admisión</button>
          <button type="button" className="btn btn-secondary" onClick={() => handleAction('iniciar-alta')}>Iniciar alta</button>
          <button type="button" className="btn btn-primary" onClick={() => handleAction('trasladar')}>Trasladar</button>
        </div>
      </div>
    </div>
  );
}
