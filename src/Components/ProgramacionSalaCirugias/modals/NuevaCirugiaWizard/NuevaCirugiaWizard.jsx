'use client';

import { useRef, useState } from 'react';
import './NuevaCirugiaWizard.css';
import InformacionGeneralStep from './InformacionGeneralStep/InformacionGeneralStep';
import ProcedimientosStep from './ProcedimientosStep/ProcedimientosStep';
import InsumosStep from './InsumosStep/InsumosStep';
import EquiposStep from './EquiposStep/EquiposStep';
import ConfirmacionStep from './ConfirmacionStep/ConfirmacionStep';
import Button from '@/Components/Button/Button';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import {
  fechaISO, fechaHoraLocalISO, horaLocal, SALAS, armarCirugiaDesdeWizard, crearCirugia, editarCirugiaDesdeWizard,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  LuCheck, LuTrash2, LuTriangleAlert, LuX,
} from 'react-icons/lu';

const PASOS = [
  { n: 1, titulo: 'Información general', sub: 'Datos administrativos y de admisión de la cirugía.' },
  { n: 2, titulo: 'Procedimientos', sub: 'Procedimiento principal y asociados.' },
  { n: 3, titulo: 'Insumos', sub: 'Canasta e insumos requeridos.' },
  { n: 4, titulo: 'Equipos', sub: 'Equipos requeridos para la cirugía.' },
  { n: 5, titulo: 'Confirmación', sub: 'Resumen antes de guardar.' },
];

// Labels de los campos obligatorios del Paso 1 (InformacionGeneralStep),
// en el mismo orden en que aparecen en el formulario -- alimenta tanto el
// gate de "Continuar"/"Guardar cirugía" como el mensaje explícito de qué
// falta (heurística "ayudar a reconocer/recuperarse de errores": el
// resaltado ámbar de .form-field ya existente es insuficiente por sí solo,
// se puede desactivar por completo desde Configuración > Apariencia vía
// data-required-highlight, ver shared/shared.css). `vacio()` trata 0/false
// como valores válidos (ej. "Días cama" en 0) -- a diferencia de un simple
// `!valor`, que los marcaría como faltantes.
function vacio(v) {
  return v === '' || v === null || v === undefined;
}
function camposFaltantesPaso1(datos) {
  const faltantes = [];
  if (vacio(datos.fechaInicio)) faltantes.push('Fecha de programación');
  if (vacio(datos.telefonosAviso)) faltantes.push('Teléfonos aviso');
  if (vacio(datos.fechaSolicitud)) faltantes.push('Fecha solicitud');
  if (vacio(datos.horaSolicitud)) faltantes.push('Hora solicitud');
  if (vacio(datos.duracionEstimada)) faltantes.push('Dur. estimada');
  if (vacio(datos.duracionPostquirurgica)) faltantes.push('Dur. postquirúrgica');
  if (vacio(datos.duracionRecuperacion)) faltantes.push('Dur. recuperación');
  if (vacio(datos.clase)) faltantes.push('Clase');
  if (vacio(datos.tipoAnestesia)) faltantes.push('Tipo anestesia');
  if (vacio(datos.complejidad)) faltantes.push('Complejidad');
  if (vacio(datos.asa)) faltantes.push('Asa');
  if (vacio(datos.dxIngreso)) faltantes.push('Dx. ingreso');
  if (vacio(datos.idAseguradora)) faltantes.push('Id. aseguradora');
  if (vacio(datos.noAutorizacion)) faltantes.push('No. autorización');
  if (vacio(datos.quienAutoriza)) faltantes.push('Quién autoriza');
  if (datos.reservaHabitacion && vacio(datos.diasCama)) faltantes.push('Días cama');
  if (datos.seVenceAutorizacion) {
    if (vacio(datos.fechaVence)) faltantes.push('Fecha vence');
    if (vacio(datos.horaVence)) faltantes.push('Hora vence');
  }
  return faltantes;
}

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
  const [mostrarDescartar, setMostrarDescartar] = useState(false);
  const salaLabel = SALAS.find((s) => s.value === salaId)?.label ?? '—';
  // Snapshot del primer `datos` -- `useRef(datos)` solo toma el argumento en
  // el montaje, así que sirve de línea base estable para detectar progreso
  // real del usuario sin recalcularla en cada render (ver haCambiado más
  // abajo).
  const datosInicialesRef = useRef(datos);

  // Foco atrapado dentro del wizard mientras está montado, y dentro de la
  // confirmación de descarte mientras está abierta -- 2 instancias porque
  // son 2 diálogos distintos que pueden estar visibles a la vez (el de
  // descarte se dibuja encima del wizard, ver el JSX más abajo). El del
  // wizard usa el default `active=true` (vive lo mismo que el componente);
  // el de descarte pasa `mostrarDescartar` explícito porque ese diálogo
  // alterna sin desmontar NuevaCirugiaWizard -- ver useModalFocusTrap.js.
  const wizardModalRef = useRef(null);
  const discardModalRef = useRef(null);
  useModalFocusTrap(wizardModalRef);
  useModalFocusTrap(discardModalRef, mostrarDescartar);

  function set(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor }));
  }

  // Paso 3/4 (Insumos/Equipos) no tienen campos obligatorios propios --
  // Paso 2 exige al menos un procedimiento (si no, `armarCirugiaDesdeWizard`
  // guardaría una cirugía sin cirujano/anestesiólogo/procedimiento
  // principal). `puedeIrA` replica el mismo criterio de
  // NuevaProgramacionWizard.jsx (GestionTurnos, wizard hermano): siempre se
  // puede volver a un paso ya visitado/actual, pero saltar hacia adelante
  // exige que todos los pasos anteriores estén completos.
  const faltantesPaso1 = camposFaltantesPaso1(datos);
  const pasoCompleto = {
    1: faltantesPaso1.length === 0,
    2: datos.procedimientos.length > 0,
    3: true,
    4: true,
    5: true,
  };
  function puedeIrA(n) {
    if (n <= paso) return true;
    for (let i = 1; i < n; i += 1) if (!pasoCompleto[i]) return false;
    return true;
  }
  const pasosIncompletos = PASOS.filter((p) => p.n < 5 && !pasoCompleto[p.n]).map((p) => p.titulo);

  // "Con progreso" -- gatea si cerrar pide confirmación de descarte (ver
  // handleIntentarCerrar). `paso > 1` ya implica datos reales cargados (el
  // Paso 1 exige sus campos obligatorios para avanzar), pero se suma la
  // comparación contra el snapshot inicial para cubrir edición sin avanzar
  // de paso (tipear en el Paso 1 sin hacer clic en Continuar todavía).
  function haCambiado() {
    if (paso > 1 || datos.procedimientos.length > 0 || datos.equipos.length > 0 || datos.insumos !== null) return true;
    return Object.keys(datosInicialesRef.current).some((k) => datos[k] !== datosInicialesRef.current[k]);
  }
  function handleIntentarCerrar() {
    if (haCambiado()) setMostrarDescartar(true);
    else onClose();
  }

  function handleGuardar() {
    if (!pasoCompleto[1] || !pasoCompleto[2]) return;
    const resultado = editando
      ? editarCirugiaDesdeWizard(cirugiaId, datos, salaId)
      : crearCirugia(armarCirugiaDesdeWizard(datos, patient, salaId));
    onGuardar?.(resultado);
    onClose();
  }

  return (
    <>
      <div className="modal-overlay open">
        <div ref={wizardModalRef} className="ncw-modal" role="dialog" aria-modal="true" aria-labelledby="ncw-eyebrow ncw-title">
        <div className="ncw-body">
          <nav className="ncw-rail">
            <div className="ncw-rail-header">
              <div id="ncw-eyebrow" className="ncw-rail-eyebrow">{editando ? 'Editar cirugía' : 'Nueva cirugía'}</div>
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
                const done = p.n < paso && pasoCompleto[p.n];
                const locked = !puedeIrA(p.n);
                return (
                  <button
                    key={p.n}
                    type="button"
                    className={`ncw-rail-step${active ? ' active' : ''}${done ? ' done' : ''}${locked ? ' locked' : ''}`}
                    disabled={locked}
                    onClick={() => { if (puedeIrA(p.n)) setPaso(p.n); }}
                  >
                    <span className="ncw-rail-circle">{done ? <LuCheck /> : p.n}</span>
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
              <button type="button" className="ncw-close" onClick={handleIntentarCerrar} aria-label="Cerrar" title="Cerrar">
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
                <div className="ncw-footer-actions">
                  <Button variant="secondary" onClick={handleIntentarCerrar}>Cancelar</Button>
                  <Button variant="primary" disabled={!pasoCompleto[1]} onClick={() => setPaso(2)}>Continuar</Button>
                </div>
              )}
              {paso === 2 && (
                <div className="ncw-footer-actions">
                  <Button variant="secondary" onClick={() => setPaso(1)}>Atrás</Button>
                  <Button variant="primary" disabled={!pasoCompleto[2]} onClick={() => setPaso(3)}>Continuar</Button>
                </div>
              )}
              {paso === 3 && (
                <div className="ncw-footer-actions">
                  <Button variant="secondary" onClick={() => setPaso(2)}>Atrás</Button>
                  <Button variant="primary" onClick={() => setPaso(4)}>Continuar</Button>
                </div>
              )}
              {paso === 4 && (
                <div className="ncw-footer-actions">
                  <Button variant="secondary" onClick={() => setPaso(3)}>Atrás</Button>
                  <Button variant="primary" onClick={() => setPaso(5)}>Continuar</Button>
                </div>
              )}
              {paso === 5 && (
                <>
                  {pasosIncompletos.length > 0 && (
                    <span className="ncw-footer-hint">
                      Faltan datos obligatorios en: {pasosIncompletos.join(', ')}.
                    </span>
                  )}
                  <div className="ncw-footer-actions">
                    <Button variant="secondary" onClick={() => setPaso(4)}>Atrás</Button>
                    <Button
                      variant="primary"
                      disabled={!pasoCompleto[1] || !pasoCompleto[2]}
                      onClick={handleGuardar}
                    >
                      {editando ? 'Guardar cambios' : 'Guardar cirugía'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {mostrarDescartar && (
        <div
          className="modal-overlay open"
          onClick={(e) => { if (e.target === e.currentTarget) setMostrarDescartar(false); }}
        >
          <div
            ref={discardModalRef}
            className="ncw-discard-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ncw-discard-title"
            aria-describedby="ncw-discard-desc"
          >
            <div className="ncw-discard-icon"><LuTriangleAlert className="icon" /></div>
            <h3 id="ncw-discard-title">¿Descartar {editando ? 'los cambios' : 'esta cirugía'}?</h3>
            <p id="ncw-discard-desc">
              Perderás la información ingresada en este {editando ? 'formulario' : 'agendamiento'}. Esta acción no se puede deshacer.
            </p>
            <div className="ncw-discard-actions">
              <Button variant="secondary" onClick={() => setMostrarDescartar(false)}>Seguir editando</Button>
              <Button variant="danger-outline" icon={LuTrash2} onClick={() => { setMostrarDescartar(false); onClose(); }}>
                Sí, descartar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
