'use client';

import { useState } from 'react';
import './AsignarPacienteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import {
  AREA_LABEL, PISO_LABEL, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionEnfermeria/mockCamasData';
import { LuUser } from 'react-icons/lu';

// CTA principal de una cama Libre (encargo: "Asignar paciente" reemplaza a
// "Cambiar estado" como acción primaria). Solo pide Nombre + Historia
// clínica — es el mínimo necesario para que la tarjeta Ocupada resultante
// pueda mostrar "¿qué está pasando?" (encargo de la tarjeta Ocupada); no
// colecta más datos clínicos, mismo recorte de alcance que el resto del
// prototipo (sin flujo de admisión completo).
export default function AsignarPacienteModal({ cama, onClose, onAssign }) {
  const [nombre, setNombre] = useState('');
  const [hc, setHc] = useState('');

  const puedeConfirmar = nombre.trim() !== '' && hc.trim() !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onAssign(cama.id, { nombre: nombre.trim(), hc: hc.trim() });
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card task-mini-modal-card ap-modal-card" role="dialog" aria-modal="true" aria-labelledby="asignar-paciente-title">
        <form onSubmit={handleSubmit}>
          <ModalHeader
            icon={LuUser}
            tone="primary"
            title="Asignar paciente"
            titleId="asignar-paciente-title"
            onClose={onClose}
          />
          <div className="modal-body">
            <div className="form-field">
              <label>Cama</label>
              <div className="tf-readonly-value">
                {cama.numero} — {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="ap-nombre">Nombre del paciente</label>
              <input
                id="ap-nombre"
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="ap-hc">Historia clínica</label>
              <input
                id="ap-hc"
                type="text"
                placeholder="HC-00000"
                value={hc}
                onChange={(e) => setHc(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Asignar paciente</button>
          </div>
        </form>
      </div>
    </div>
  );
}
