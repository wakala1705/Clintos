'use client';

import { useRef } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import './SalirSinGuardarDialog.css';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';

// Confirmación centrada sin fila de header (patrón .nc-discard-modal, fuera de
// ModalHeader por AGENTS.md "Modales"): salir del editor con el horario sin
// guardar. Las excepciones ya guardadas se conservan.
export default function SalirSinGuardarDialog({ onSeguir, onSalir }) {
  const cardRef = useRef(null);
  useModalFocusTrap(cardRef);

  return (
    <div className="modal-overlay open" onKeyDown={(e) => { if (e.key === 'Escape') onSeguir(); }}>
      <div
        ref={cardRef}
        className="modal-card ac-salir-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ac-salir-titulo"
        aria-describedby="ac-salir-texto"
      >
        <div className="ac-salir-icono"><LuTriangleAlert className="icon" aria-hidden="true" /></div>
        <h3 id="ac-salir-titulo" className="ac-salir-titulo">¿Salir sin guardar el horario?</h3>
        <p id="ac-salir-texto" className="ac-salir-texto">
          Los cambios del horario semanal se perderán. Las excepciones que ya guardaste se conservan.
        </p>
        <div className="ac-salir-acciones">
          <Button variant="outline" onClick={onSeguir}>Seguir editando</Button>
          <Button onClick={onSalir}>Salir sin guardar</Button>
        </div>
      </div>
    </div>
  );
}
