'use client';

import { useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import './ValoracionTriageModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import PatientAvatar from '@/Components/PatientAvatar/PatientAvatar';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import NivelSugeridoDialog from '../NivelSugeridoDialog/NivelSugeridoDialog';
import CriteriosInmediatosStep from './CriteriosInmediatosStep/CriteriosInmediatosStep';
import DatosValoracionStep from './DatosValoracionStep/DatosValoracionStep';
import {
  CRITERIO_NINGUNO, NIVEL_INMEDIATO, condicionInicial, iniciales,
} from '@/hooks/Triage/triageData';

// Modal de valoración de triage (réplica de la ventana legacy "Triage"). La
// tarjeta del paciente y el footer son fijos; el cuerpo cambia por paso:
//
// 1. `criterios` (CriteriosInmediatosStep):
//    - marcar cualquiera de los 6 criterios abre en el acto el aviso "Nivel
//      sugerido: TRIAGE I" (NivelSugeridoDialog): "Finalizar clasificación"
//      llama a `onClasificar(nivel, criterio)`; "Volver" cierra el aviso y
//      deshace la selección;
//    - marcar "Ninguno de los anteriores" pasa en el acto al paso 2;
//    - "Continuar valoración" repite lo mismo según lo que esté marcado;
//      "Volver" cierra el modal.
// 2. `datos` (DatosValoracionStep): motivo, condición especial y signos
//    vitales. "Volver" regresa al paso 1 sin perder lo escrito (el estado
//    vive acá); "Continuar valoración" → `onContinuar(datos)`.
//
// Tarjeta de paciente: mismo patrón que PreIngresoModal (Admisiones) — no es
// un PatientBanner, ver AGENTS.md.
export default function ValoracionTriageModal({
  paciente, onClose, onContinuar, onClasificar,
}) {
  const [paso, setPaso] = useState('criterios');
  const [criterio, setCriterio] = useState(null);
  const [avisoAbierto, setAvisoAbierto] = useState(false);
  const [datos, setDatos] = useState(() => ({
    motivo: '',
    condicion: condicionInicial(paciente.banderas),
    signos: {},
  }));

  // Con el aviso abierto, Escape lo cierra a él (NivelSugeridoDialog), no a
  // este modal.
  useEffect(() => {
    if (avisoAbierto) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, avisoAbierto]);

  function avanzarDesde(valor) {
    if (valor === CRITERIO_NINGUNO.value) setPaso('datos');
    else setAvisoAbierto(true);
  }

  function elegirCriterio(valor) {
    setCriterio(valor);
    avanzarDesde(valor);
  }

  function handleVolverAviso() {
    setAvisoAbierto(false);
    setCriterio(null);
  }

  function handleVolver() {
    if (paso === 'datos') setPaso('criterios');
    else onClose();
  }

  function handleContinuar() {
    if (paso === 'datos') onContinuar(datos);
    else avanzarDesde(criterio);
  }

  return (
    <div className="tg-vm-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="tg-vm-modal" role="dialog" aria-modal="true" aria-labelledby="tg-vm-title">
        <ModalHeader title="Triage" titleId="tg-vm-title" onClose={onClose} closeLabel="Cerrar valoración" />

        <div className="tg-vm-body">
          <div className="tg-vm-paciente">
            <PatientAvatar iniciales={iniciales(paciente.paciente)} className="tg-vm-avatar" />
            <div className="tg-vm-paciente-info">
              <div className="tg-vm-paciente-nombre">{paciente.paciente}</div>
              <div className="tg-vm-paciente-doc">{paciente.documento}</div>
              <div className="tg-vm-paciente-edad">
                {paciente.edad}
                {paciente.sexo && <><span className="tg-vm-sep" aria-hidden="true">•</span>{paciente.sexo}</>}
              </div>
            </div>
            <Badge tone="success" dot>Activo</Badge>
          </div>

          {paso === 'criterios'
            ? <CriteriosInmediatosStep criterio={criterio} onElegir={elegirCriterio} />
            : <DatosValoracionStep datos={datos} onChange={setDatos} />}
        </div>

        <div className="tg-vm-footer">
          <Button variant="secondary" icon={LuChevronLeft} onClick={handleVolver}>Volver</Button>
          <Button variant="primary" disabled={!criterio} onClick={handleContinuar}>
            Continuar valoración
            <LuChevronRight className="tg-vm-trailing-icon" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {avisoAbierto && (
        <NivelSugeridoDialog
          nivelLabel={NIVEL_INMEDIATO.label}
          onFinalizar={() => onClasificar(NIVEL_INMEDIATO.nivel, criterio)}
          onVolver={handleVolverAviso}
        />
      )}
    </div>
  );
}
