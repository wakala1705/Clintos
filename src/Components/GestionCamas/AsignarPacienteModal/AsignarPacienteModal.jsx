'use client';

import { useState } from 'react';
import './AsignarPacienteModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import BuscarPacienteModal from '../BuscarPacienteModal/BuscarPacienteModal';
import {
  AREA_LABEL, PISO_LABEL, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionCamas/mockCamasData';
import { LuSearch, LuUser, LuX } from 'react-icons/lu';

// Mismo cálculo que BuscarPacienteModal.jsx/BedDetailModal.jsx (no compartir
// helpers chicos entre componentes, ver AGENTS.md).
function iniciales(nombre) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// CTA principal de una cama Libre (encargo: "Asignar paciente" reemplaza a
// "Cambiar estado" como acción primaria). El paciente se busca/elige en
// BuscarPacienteModal — a propósito NO el buscador global de afiliados de
// toda la clínica, sino solo pacientes ya Admitidos (Admisiones, estado
// 'admitido'): asignar una cama es para alguien que ya pasó por el proceso
// de admisión/triage, no para cualquier afiliado registrado (ver
// BuscarPacienteModal.jsx). El registro elegido trae la forma de una
// Admisión (nombreAfiliado/documento/numeroAdmision/administradora/
// tipoAdmision), no la de un afiliado — de ahí que ya no se pida "Historia
// clínica" a mano: el documento del paciente pasa a ser el identificador
// (ver handleSubmit). BuscarPacienteModal se renderiza como hermano de este
// modal (nunca anidado dentro de .modal-card) — mismo criterio de
// composición que el resto de la app: cada modal es su propio
// .modal-overlay de nivel superior.
export default function AsignarPacienteModal({ cama, onClose, onAssign }) {
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const puedeConfirmar = !!pacienteSeleccionado;

  function handleSeleccionarPaciente(admision) {
    setPacienteSeleccionado(admision);
    setBuscando(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!puedeConfirmar) return;
    onAssign(cama.id, { nombre: pacienteSeleccionado.nombreAfiliado, hc: pacienteSeleccionado.documento });
  }

  return (
    <>
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
                <label htmlFor="ap-buscar-paciente">Paciente</label>
                {pacienteSeleccionado ? (
                  <div className="ap-patient-card">
                    <PatientAvatar iniciales={iniciales(pacienteSeleccionado.nombreAfiliado)} className="ap-avatar" />
                    <div className="ap-patient-info">
                      <div className="ap-patient-name">{pacienteSeleccionado.nombreAfiliado}</div>
                      <div className="ap-patient-meta">CC {pacienteSeleccionado.documento} · Admisión {pacienteSeleccionado.numeroAdmision}</div>
                      <div className="ap-patient-meta">{pacienteSeleccionado.administradora} · {pacienteSeleccionado.tipoAdmision}</div>
                    </div>
                    <button
                      type="button"
                      className="ap-patient-clear"
                      onClick={() => setPacienteSeleccionado(null)}
                      aria-label="Quitar paciente seleccionado"
                      title="Cambiar paciente"
                    >
                      <LuX className="icon" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    id="ap-buscar-paciente"
                    className="ap-patient-trigger"
                    onClick={() => setBuscando(true)}
                  >
                    <LuSearch className="icon" />
                    <span>Buscar paciente admitido...</span>
                  </button>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={!puedeConfirmar}>Asignar paciente</button>
            </div>
          </form>
        </div>
      </div>

      {buscando && (
        <BuscarPacienteModal
          onClose={() => setBuscando(false)}
          onSelect={handleSeleccionarPaciente}
        />
      )}
    </>
  );
}
