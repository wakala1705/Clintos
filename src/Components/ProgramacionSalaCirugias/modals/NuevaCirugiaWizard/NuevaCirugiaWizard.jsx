'use client';

import { useState } from 'react';
import './NuevaCirugiaWizard.css';
import InformacionGeneralStep from './InformacionGeneralStep/InformacionGeneralStep';
import ProcedimientosStep from './ProcedimientosStep/ProcedimientosStep';
import Button from '@/Components/Button/Button';
import { fechaISO, fechaHoraLocalISO, SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuX } from 'react-icons/lu';

const PASOS = [
  { n: 1, titulo: 'Información general', sub: 'Datos administrativos y de admisión de la cirugía.' },
  { n: 2, titulo: 'Procedimientos', sub: 'Procedimiento principal y asociados.' },
  { n: 3, titulo: 'Insumos', sub: 'Canasta e insumos requeridos.' },
];

// Fecha inicio precarga la fecha/hora del sistema al abrir el wizard
// (encargo explícito) en vez de arrancar vacía -- igual que Fecha solicitud
// (fechaISO(new Date())), pero con hora incluida porque datetime-local la
// necesita. Sigue siendo editable: es un punto de partida, no un valor fijo.
function datosIniciales(patient, salaId) {
  return {
    salaId,
    esAfiliado: true,
    fechaInicio: fechaHoraLocalISO(new Date()),
    telefonosAviso: patient?.telefono ?? '',
    fechaSolicitud: fechaISO(new Date()),
    horaSolicitud: '',
    duracionEstimada: '',
    duracionPostquirurgica: '',
    duracionRecuperacion: '',
    dxIngreso: '',
    clase: '',
    idAseguradora: '',
    tipoAnestesia: '',
    complejidad: '',
    noAutorizacion: '',
    asa: '',
    quienAutoriza: '',
    reservaHabitacion: false,
    seVenceAutorizacion: false,
    diasCama: 0,
    fechaVence: '',
    horaVence: '',
    observaciones: '',
    procedimientos: [],
  };
}

// Wizard "Nueva cirugía" -- se abre al confirmar un paciente en la Lista de
// Pacientes compartida (ver handlePatientConfirmedParaCirugia en
// ProgramacionSalaCirugias.jsx). Mismo patrón riel+contenido que
// NuevaProgramacionWizard (GestionTurnos): React puro con clases `ncw-*`
// propias en vez de reusar el flujo legacy-imperativo de NuevaCitaFlow (ese
// es "Nueva cita", este es un dominio distinto -- ver AGENTS.md "Modales").
// Pasos 1 (Información general) y 2 (Procedimientos) tienen formulario
// (encargo explícito, paso 2 activado después) -- Insumos queda listado en
// el riel pero bloqueado (`locked`), y "Continuar" del paso 2 queda
// deshabilitado sin importar el estado del formulario hasta que ese paso
// exista. `paso` es estado (no una constante como antes) para poder navegar
// entre 1 y 2 vía el riel o los botones Continuar/Atrás del footer.
//
// "Es afiliado" vive en el header del riel (no en InformacionGeneralStep,
// encargo explícito) porque acompaña al nombre/documento del paciente que ya
// se muestra ahí -- "Id. afiliado" se eliminó del todo (era redundante con
// ese mismo header). Sala de cirugía/No. cirugía también se movieron al
// riel (encargo explícito), como texto plano bajo un divider debajo del
// checkbox -- no son datos editables en este paso, así que no tiene sentido
// que ocupen espacio en el formulario. No. cirugía siempre muestra "--"
// porque este wizard solo crea cirugías nuevas (el número se asigna al
// guardar, nunca existe en este paso).
export default function NuevaCirugiaWizard({
  patient, salaId, onClose,
}) {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState(() => datosIniciales(patient, salaId));
  const salaLabel = SALAS.find((s) => s.value === salaId)?.label ?? '—';

  function set(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  return (
    <div className="modal-overlay open">
      <div className="ncw-modal" role="dialog" aria-modal="true" aria-labelledby="ncw-title">
        <div className="ncw-body">
          <nav className="ncw-rail">
            <div className="ncw-rail-header">
              <div className="ncw-rail-eyebrow">Nueva cirugía</div>
              <h3 id="ncw-title" className="ncw-rail-title">{patient?.nombre ?? 'Paciente'}</h3>
              {patient?.documento && <p className="ncw-rail-desc">CC {patient.documento}</p>}
              <label className="ncw-rail-checkbox">
                <input
                  type="checkbox"
                  checked={datos.esAfiliado}
                  onChange={(e) => set('esAfiliado', e.target.checked)}
                />
                Es afiliado
              </label>

              <div className="ncw-rail-divider" />

              <div className="ncw-rail-meta">
                <div className="ncw-rail-meta-item">
                  <span className="ncw-rail-meta-label">Sala de cirugía</span>
                  <span className="ncw-rail-meta-value">{salaLabel}</span>
                </div>
                <div className="ncw-rail-meta-item">
                  <span className="ncw-rail-meta-label">No. cirugía</span>
                  <span className="ncw-rail-meta-value">--</span>
                </div>
              </div>
            </div>

            <div className="ncw-rail-nav">
              {PASOS.map((p) => {
                const active = p.n === paso;
                const locked = p.n > 2;
                return (
                  <button
                    key={p.n}
                    type="button"
                    className={`ncw-rail-step${active ? ' active' : ''}${locked ? ' locked' : ''}`}
                    disabled={locked}
                    onClick={() => setPaso(p.n)}
                  >
                    <span className="ncw-rail-circle">{p.n}</span>
                    <span className="ncw-rail-step-text">
                      <span className="ncw-rail-step-title">{p.titulo}</span>
                      <span className="ncw-rail-step-sub">{p.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="ncw-main">
            <div className="ncw-main-header">
              <span className="ncw-main-progress">
                Paso
                {' '}
                {paso}
                {' '}
                de
                {' '}
                {PASOS.length}
              </span>
              <button type="button" className="ncw-close" onClick={onClose} aria-label="Cerrar" title="Cerrar">
                <LuX className="icon" />
              </button>
            </div>

            <div className="ncw-content">
              {paso === 1 && (
                <InformacionGeneralStep datos={datos} onChange={set} />
              )}
              {paso === 2 && (
                <ProcedimientosStep datos={datos} onChange={set} patient={patient} />
              )}
            </div>

            <div className="ncw-footer">
              {paso === 1 ? (
                <>
                  <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                  <Button variant="primary" onClick={() => setPaso(2)}>Continuar</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setPaso(1)}>Atrás</Button>
                  <Button variant="primary" disabled>Continuar</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
