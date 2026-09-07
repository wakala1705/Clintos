'use client';

import { useState } from 'react';
import './NuevaCirugiaWizard.css';
import InformacionGeneralStep from './InformacionGeneralStep/InformacionGeneralStep';
import ProcedimientosStep from './ProcedimientosStep/ProcedimientosStep';
import InsumosStep from './InsumosStep/InsumosStep';
import EquiposStep from './EquiposStep/EquiposStep';
import ConfirmacionStep from './ConfirmacionStep/ConfirmacionStep';
import Button from '@/Components/Button/Button';
import {
  fechaISO, fechaHoraLocalISO, horaLocal, SALAS, armarCirugiaDesdeWizard, crearCirugia, editarCirugiaDesdeWizard,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuX } from 'react-icons/lu';

const PASOS = [
  { n: 1, titulo: 'Información general', sub: 'Datos administrativos y de admisión de la cirugía.' },
  { n: 2, titulo: 'Procedimientos', sub: 'Procedimiento principal y asociados.' },
  { n: 3, titulo: 'Insumos', sub: 'Canasta e insumos requeridos.' },
  { n: 4, titulo: 'Equipos', sub: 'Equipos requeridos para la cirugía.' },
  { n: 5, titulo: 'Confirmación', sub: 'Resumen antes de guardar.' },
];

// Fecha de programación (campo `fechaInicio`, label "Fecha de
// programación" en InformacionGeneralStep.jsx) precarga la fecha/hora del
// sistema al abrir el wizard (encargo explícito) en vez de arrancar vacía --
// igual que Fecha/Hora solicitud, pero con hora incluida porque
// datetime-local la necesita. Sigue siendo editable: es un punto de partida,
// no un valor fijo. Cuando viene de clickear un slot de la grilla
// (initialFechaHora, ver onSlotClick en ProgramacionSalaCirugias.jsx) toma
// esa fecha/hora en vez de la del sistema -- Fecha/Hora solicitud no se ven
// afectadas por eso: son la fecha/hora en que se está *pidiendo* la cirugía
// (ahora), no la fecha/hora *programada* para operarla.
function datosIniciales(patient, salaId, initialFechaHora) {
  return {
    salaId,
    esAfiliado: true,
    fechaInicio: initialFechaHora ?? fechaHoraLocalISO(new Date()),
    telefonosAviso: patient?.telefono ?? '',
    fechaSolicitud: fechaISO(new Date()),
    horaSolicitud: horaLocal(new Date()),
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
    // `null` hasta que InsumosStep (Paso 3) escribe una primera edición real
    // -- mientras tanto se muestra el cálculo derivado de procedimientos
    // (ver agregarInsumosPrecargados en mockCirugiaData.js) sin persistirlo,
    // así ConfirmacionStep (Paso 5) siempre lee el mismo dato ya editado.
    insumos: null,
    equipos: [],
  };
}

// Wizard "Nueva cirugía" -- se abre al confirmar un paciente en la Lista de
// Pacientes compartida (ver handlePatientConfirmedParaCirugia en
// ProgramacionSalaCirugias.jsx). Mismo patrón riel+contenido que
// NuevaProgramacionWizard (GestionTurnos): React puro con clases `ncw-*`
// propias en vez de reusar el flujo legacy-imperativo de NuevaCitaFlow (ese
// es "Nueva cita", este es un dominio distinto -- ver AGENTS.md "Modales").
// Los 5 pasos (Información general, Procedimientos, Insumos, Equipos,
// Confirmación) ya tienen contenido y son navegables desde el riel --
// Confirmación (Paso 5, el último) resume procedimientos/insumos/equipos/
// personal para revisar antes de guardar (ver ConfirmacionStep.jsx).
// "Guardar cirugía" arma el registro final vía armarCirugiaDesdeWizard +
// crearCirugia (ver handleGuardar más abajo) y notifica al padre por
// `onGuardar` para que lo sume a la vista actual si corresponde (ver
// perteneceAVistaActual/applyUpdated en ProgramacionSalaCirugias.jsx) --
// mismas piezas sin origen real en el wizard hoy (tipoCirugia/servicio/
// nivel/tipoAfiliado/dirección/Instrumentadora/Circulante/farmacia)
// documentadas en el comentario de armarCirugiaDesdeWizard
// (mockCirugiaData.js), no acá. `paso` es estado para poder navegar entre
// los 5 pasos vía el riel o los botones Continuar/Atrás del footer.
//
// "Es afiliado" vive en el header del riel (no en InformacionGeneralStep,
// encargo explícito) porque acompaña al nombre/documento del paciente que ya
// se muestra ahí -- "Id. afiliado" se eliminó del todo (era redundante con
// ese mismo header). Sala de cirugía/No. cirugía también se movieron al
// riel (encargo explícito), como texto plano bajo un divider debajo del
// checkbox -- no son datos editables en este paso, así que no tiene sentido
// que ocupen espacio en el formulario. No. cirugía muestra "--" al crear (el
// número se asigna recién al guardar, no existe todavía en este paso) o el
// id real en modo edición (`cirugiaId`, ver más abajo).
// `cirugiaId`/`initialDatos` (encargo explícito, "Editar cirugía"): mismo
// wizard de creación, reabierto en modo edición -- `initialDatos` viene de
// datosWizardDesdeCirugia (mockCirugiaData.js) y se mergea sobre
// datosIniciales para completar cualquier campo que esa reconstrucción no
// haya podido llenar. `cirugiaId` presente es lo que distingue "editando" de
// "creando": cambia a qué función de guardado se llama (editarCirugiaDesdeWizard
// vs armarCirugiaDesdeWizard+crearCirugia) y los textos del riel/footer.
export default function NuevaCirugiaWizard({
  patient, salaId, onClose, onGuardar, initialFechaHora, initialDatos, cirugiaId,
}) {
  const editando = Boolean(cirugiaId);
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState(() => ({
    ...datosIniciales(patient, salaId, initialFechaHora),
    ...initialDatos,
  }));
  const salaLabel = SALAS.find((s) => s.value === salaId)?.label ?? '—';

  function set(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  function handleGuardar() {
    const resultado = editando
      ? editarCirugiaDesdeWizard(cirugiaId, datos, salaId)
      : crearCirugia(armarCirugiaDesdeWizard(datos, patient, salaId));
    onGuardar?.(resultado);
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="ncw-modal" role="dialog" aria-modal="true" aria-labelledby="ncw-title">
        <div className="ncw-body">
          <nav className="ncw-rail">
            <div className="ncw-rail-header">
              <div className="ncw-rail-eyebrow">{editando ? 'Editar cirugía' : 'Nueva cirugía'}</div>
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
                  <span className="ncw-rail-meta-value">{cirugiaId ?? '--'}</span>
                </div>
              </div>
            </div>

            <div className="ncw-rail-nav">
              {PASOS.map((p) => {
                const active = p.n === paso;
                return (
                  <button
                    key={p.n}
                    type="button"
                    className={`ncw-rail-step${active ? ' active' : ''}`}
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
              {paso === 3 && (
                <InsumosStep datos={datos} onChange={set} />
              )}
              {paso === 4 && (
                <EquiposStep datos={datos} onChange={set} />
              )}
              {paso === 5 && (
                <ConfirmacionStep datos={datos} />
              )}
            </div>

            <div className="ncw-footer">
              {paso === 1 && (
                <>
                  <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                  <Button variant="primary" onClick={() => setPaso(2)}>Continuar</Button>
                </>
              )}
              {paso === 2 && (
                <>
                  <Button variant="secondary" onClick={() => setPaso(1)}>Atrás</Button>
                  <Button variant="primary" onClick={() => setPaso(3)}>Continuar</Button>
                </>
              )}
              {paso === 3 && (
                <>
                  <Button variant="secondary" onClick={() => setPaso(2)}>Atrás</Button>
                  <Button variant="primary" onClick={() => setPaso(4)}>Continuar</Button>
                </>
              )}
              {paso === 4 && (
                <>
                  <Button variant="secondary" onClick={() => setPaso(3)}>Atrás</Button>
                  <Button variant="primary" onClick={() => setPaso(5)}>Continuar</Button>
                </>
              )}
              {paso === 5 && (
                <>
                  <Button variant="secondary" onClick={() => setPaso(4)}>Atrás</Button>
                  <Button variant="primary" onClick={handleGuardar}>{editando ? 'Guardar cambios' : 'Guardar cirugía'}</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
