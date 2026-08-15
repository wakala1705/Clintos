'use client';

import './ExitoStep.css';
import { LuCircleCheck } from 'react-icons/lu';
import { resolveVacunaLabel } from '../AplicacionStep/AplicacionStep';

// Próxima dosis pendiente del paciente, distinta a la que se acaba de
// registrar — no muta `paciente.dosisPendientes` (este flujo es 100% mock,
// sin backend, ver mockVacunacionData.js): solo decide qué mostrar en esta
// pantalla de éxito a partir del snapshot que ya tenía el paciente al abrir
// el modal.
function getProximaDosis(paciente, vacunaSel) {
  const aplicadaId = vacunaSel.origen === 'esquema' ? vacunaSel.dosis.id : null;
  return (paciente.dosisPendientes || []).find((d) => d.id !== aplicadaId && d.estado !== 'aplicada') || null;
}

export default function ExitoStep({ paciente, vacunaSel, onVerEsquema, onRegistrarOtra, onCerrar }) {
  const { nombre, dosis } = resolveVacunaLabel(vacunaSel);
  const proximaDosis = getProximaDosis(paciente, vacunaSel);

  return (
    <div className="rv-exito-step">
      <LuCircleCheck className="rv-exito-icon" aria-hidden="true" />
      <h4 className="rv-exito-title">Vacunación registrada</h4>
      <p className="rv-exito-text">La aplicación fue registrada correctamente en el esquema de vacunación del paciente.</p>

      <div className="rv-exito-resumen">
        <span className="rv-exito-paciente">{paciente.nombre}</span>
        <span className="rv-exito-vacuna">{nombre} · {dosis}</span>
        <span className="rv-dosis-badge aplicada"><LuCircleCheck className="icon" aria-hidden="true" />Aplicada</span>
      </div>

      {proximaDosis && (
        <div className="rv-exito-proxima">
          <h4 className="rv-section-title">Próxima dosis</h4>
          <p className="rv-resumen-primary">{proximaDosis.vacuna} · {proximaDosis.dosis}</p>
          <p className="rv-resumen-secondary">{proximaDosis.fechaProgramadaLabel}</p>
        </div>
      )}

      <div className="rv-exito-actions">
        <button type="button" className="btn btn-secondary" onClick={onVerEsquema}>Ver esquema del paciente</button>
        <button type="button" className="btn btn-secondary" onClick={onRegistrarOtra}>Registrar otra vacunación</button>
        <button type="button" className="btn btn-primary" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
}
