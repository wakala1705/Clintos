'use client';

import { useRef, useState } from 'react';
import {
  LuCheck, LuClipboardCheck, LuInfo, LuTrash2, LuTriangleAlert, LuX,
} from 'react-icons/lu';
import '../modals/NuevaCirugiaWizard/NuevaCirugiaWizard.css';
import './RegistrarOrdenExterna.css';
import Button from '@/Components/Button/Button';
import PdfViewerModal from '@/Components/PdfViewerModal/PdfViewerModal';
import PasoPaciente from './PasoPaciente/PasoPaciente';
import PasoOrden from './PasoOrden/PasoOrden';
import PasoProcedimientos from './PasoProcedimientos/PasoProcedimientos';
import PasoRevision from './PasoRevision/PasoRevision';
import useModalFocusTrap from '@/hooks/ProgramacionSalaCirugias/useModalFocusTrap';
import { pacienteDesdeAfiliado } from '@/hooks/ProgramacionSalaCirugias/gestion/afiliado';
import { armarChecklist } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { aplicarAutorizacion } from '@/hooks/ProgramacionSalaCirugias/gestion/autorizacion';
import { ESTADO_GENERAL_LABEL, evaluarSolicitud } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { agregarSolicitud, siguienteId } from '@/hooks/ProgramacionSalaCirugias/gestion/store';
import { fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const PASOS = [
  { n: 1, titulo: 'Paciente', sub: 'Busca al afiliado en el buscador.' },
  { n: 2, titulo: 'Orden externa', sub: 'Institución, médico y autorización de la EPS.' },
  { n: 3, titulo: 'Procedimientos CUPS', sub: 'Procedimientos y fecha tentativa.' },
  { n: 4, titulo: 'Revisión', sub: 'Lista de chequeo antes de registrar.' },
];
const ORDEN_VACIA = {
  institucion: '', medico: '', fecha: '', dx: '', adjunto: '', adjuntoUrl: '', autorizacion: null,
};

// Qué falta para pasar de paso (también alimenta el texto bajo "Siguiente").
function faltantesDelPaso(paso, { paciente, orden, procedimientos }) {
  if (paso === 1) return paciente ? [] : ['seleccionar un paciente'];
  if (paso === 2) {
    return [
      !orden.institucion && 'la institución que remite',
      !orden.medico.trim() && 'el médico que ordena',
      !orden.fecha && 'la fecha de la orden',
      !orden.dx && 'el diagnóstico',
      !orden.autorizacion && 'la autorización de la EPS',
    ].filter(Boolean);
  }
  if (paso === 3) {
    if (procedimientos.length === 0) return ['agregar un procedimiento'];
    return procedimientos.some((p) => !p.fecha) ? ['la fecha tentativa de cada procedimiento'] : [];
  }
  return [];
}

// "Registrar orden externa": modal con riel de pasos (mismo patrón que
// NuevaCirugiaWizard) para pacientes que llegan con una orden de otra
// institución. Al terminar, la orden entra a Gestión de cirugías con su lista
// de chequeo armada a partir de la historia clínica. `onRegistrada(aviso)`
// avisa al padre para que refresque la lista; `onAviso(texto)` muestra el
// toast de las acciones aún por conectar.
export default function RegistrarOrdenExterna({
  afiliado, usuario, onBuscarAfiliado, onClose, onRegistrada, onAviso,
}) {
  const [hoy] = useState(() => fechaISO(new Date()));
  // El paso 1 (Paciente) ya se hizo en el buscador de afiliados que abre el
  // asistente; arranca en el paso 2 y el paso 1 queda para revisar/cambiar.
  const [paso, setPaso] = useState(2);
  const [orden, setOrden] = useState(ORDEN_VACIA);
  const [procedimientos, setProcedimientos] = useState([]);
  const [mostrarDescartar, setMostrarDescartar] = useState(false);
  const [verDocumento, setVerDocumento] = useState(null); // 'orden' | 'autorizacion' | null
  const paciente = pacienteDesdeAfiliado(afiliado);

  const modalRef = useRef(null);
  const discardRef = useRef(null);
  useModalFocusTrap(modalRef);
  useModalFocusTrap(discardRef, mostrarDescartar);


  const estado = { paciente, orden, procedimientos };
  const faltantes = faltantesDelPaso(paso, estado);
  const pasoCompleto = (n) => faltantesDelPaso(n, estado).length === 0;
  // Se puede volver a un paso ya visitado; avanzar exige los anteriores completos.
  function puedeIrA(n) {
    if (n <= paso) return true;
    for (let i = 1; i < n; i += 1) if (!pasoCompleto(i)) return false;
    return true;
  }

  const checklistBase = paciente && procedimientos.length > 0
    ? armarChecklist({
      historia: paciente.historia,
      procedimientos,
      ordenAdjunta: Boolean(orden.adjunto),
      ordenArchivo: { nombre: orden.adjunto, url: orden.adjuntoUrl },
      eps: paciente.eps,
    })
    : null;
  // Si ya se registró la autorización de la EPS, el requisito queda al día (mismo cálculo que Gestión).
  const checklist = checklistBase && orden.autorizacion
    ? aplicarAutorizacion({ checklist: checklistBase }, orden.autorizacion).checklist
    : checklistBase;
  const evaluacion = checklist ? evaluarSolicitud({ checklist }) : null;

  function haCambiado() {
    return procedimientos.length > 0
      || Object.keys(ORDEN_VACIA).some((k) => orden[k] !== ORDEN_VACIA[k]);
  }
  function handleIntentarCerrar() {
    if (haCambiado()) setMostrarDescartar(true);
    else onClose();
  }

  function handleAgregarProcedimiento(c) {
    // La fecha tentativa se hereda de un procedimiento que ya la tenga.
    setProcedimientos((prev) => [...prev, {
      ...c,
      lateralidad: 'na',
      fecha: prev.find((p) => p.fecha)?.fecha ?? '',
    }]);
  }

  function handleRegistrar() {
    if (!paciente || !checklist || !evaluacion) return;
    const principal = procedimientos[0];
    const id = siguienteId();
    agregarSolicitud({
      id,
      origen: 'orden-externa',
      paciente: {
        nombre: paciente.nombre,
        tipoDocumento: paciente.tipoDocumento,
        numeroDocumento: paciente.numeroDocumento,
        edad: paciente.edad,
      },
      eps: paciente.eps,
      regimen: paciente.regimen,
      contrato: paciente.contrato,
      especialidad: principal.especialidad,
      procedimiento: principal.nombre,
      cups: principal.cups,
      procedimientos,
      cirujano: orden.medico.trim(),
      medicoOrdena: orden.medico.trim(),
      institucionRemite: orden.institucion,
      ordenNumero: `OE-2026-${id.split('-')[1]}`,
      fechaTentativa: principal.fecha,
      dxOrden: orden.dx,
      checklist,
    });
    onRegistrada(`Orden registrada para ${paciente.nombre} · ${ESTADO_GENERAL_LABEL[evaluacion.estado]}`);
  }

  const ultimo = paso === PASOS.length;

  return (
    <>
      <div className="modal-overlay open">
        <div ref={modalRef} className="ncw-modal" role="dialog" aria-modal="true" aria-labelledby="ro-eyebrow ro-title">
          <div className="ncw-body">
            <nav className="ncw-rail" aria-label="Pasos del registro de la orden">
              <div className="ncw-rail-header">
                <div id="ro-eyebrow" className="ncw-rail-eyebrow">Registrar orden externa</div>
                <h3 id="ro-title" className="ncw-rail-title">{paciente?.nombre ?? 'Paciente sin seleccionar'}</h3>
                {paciente && (
                  <p className="ncw-rail-desc">{paciente.tipoDocumento} {paciente.numeroDocumento} · {paciente.edad} años</p>
                )}

                <div className="ncw-rail-divider" />

                <div className="ncw-rail-meta">
                  <div className="ncw-rail-meta-item">
                    <span className="ncw-rail-meta-label">Entidad</span>
                    <span className="ncw-rail-meta-value">{paciente?.eps ?? '--'}</span>
                  </div>
                  <div className="ncw-rail-meta-item">
                    <span className="ncw-rail-meta-label">Institución que remite</span>
                    <span className="ncw-rail-meta-value">{orden.institucion || '--'}</span>
                  </div>
                  <div className="ncw-rail-meta-item">
                    <span className="ncw-rail-meta-label">Procedimientos</span>
                    <span className="ncw-rail-meta-value">{procedimientos.length || '--'}</span>
                  </div>
                </div>
              </div>

              <div className="ncw-rail-nav">
                {PASOS.map((p) => {
                  const active = p.n === paso;
                  const done = p.n < paso && pasoCompleto(p.n);
                  const locked = !puedeIrA(p.n);
                  return (
                    <button
                      key={p.n}
                      type="button"
                      className={`ncw-rail-step${active ? ' active' : ''}${done ? ' done' : ''}${locked ? ' locked' : ''}`}
                      disabled={locked}
                      aria-current={active ? 'step' : undefined}
                      onClick={() => setPaso(p.n)}
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
                <span className="ncw-main-progress">Paso {paso} de {PASOS.length}</span>
                <button type="button" className="ncw-close" onClick={handleIntentarCerrar} aria-label="Cerrar" title="Cerrar">
                  <LuX className="icon" />
                </button>
              </div>

              <div className="ncw-content ro-content" aria-label={`Paso ${paso} de ${PASOS.length}: ${PASOS[paso - 1].titulo}`}>
                {paso === 1 && (
                  <PasoPaciente paciente={paciente} onBuscarAfiliado={onBuscarAfiliado} />
                )}
                {paso === 2 && (
                  <PasoOrden
                    orden={orden}
                    onChange={(cambio) => setOrden((o) => ({ ...o, ...cambio }))}
                    hoy={hoy}
                    onVerAdjunto={() => setVerDocumento('orden')}
                    onVerAutorizacion={() => setVerDocumento('autorizacion')}
                    paciente={paciente}
                    usuario={usuario}
                  />
                )}
                {paso === 3 && (
                  <PasoProcedimientos
                    procedimientos={procedimientos}
                    desde={hoy}
                    onAgregar={handleAgregarProcedimiento}
                    onCambiar={(id, cambio) => setProcedimientos((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambio } : p)))}
                    onQuitar={(id) => setProcedimientos((prev) => prev.filter((p) => p.id !== id))}
                  />
                )}
                {paso === 4 && checklist && evaluacion && (
                  <PasoRevision
                    checklist={checklist}
                    evaluacion={evaluacion}
                    onVerDocumento={setVerDocumento}
                    onAccion={(accion, item) => onAviso(`${accion} · ${item}: pantalla por conectar`)}
                  />
                )}
                {faltantes.length > 0 && (
                  <p className="gc-aviso ro-faltante" id="ro-faltante" role="status">
                    <LuInfo className="icon" aria-hidden="true" />
                    <span>Para continuar falta: {faltantes.join(', ')}.</span>
                  </p>
                )}
              </div>

              <div className="ncw-footer">
                <div className="ncw-footer-actions">
                  {paso === 1 ? (
                    <Button variant="secondary" onClick={handleIntentarCerrar}>Cancelar</Button>
                  ) : (
                    <Button variant="secondary" onClick={() => setPaso((p) => p - 1)}>Atrás</Button>
                  )}
                  {ultimo ? (
                    <Button icon={LuClipboardCheck} onClick={handleRegistrar}>Registrar orden</Button>
                  ) : (
                    <Button
                      disabled={faltantes.length > 0}
                      aria-describedby={faltantes.length > 0 ? 'ro-faltante' : undefined}
                      onClick={() => setPaso((p) => p + 1)}
                    >
                      Continuar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {verDocumento === 'orden' && orden.adjuntoUrl && (
        <PdfViewerModal
          src={orden.adjuntoUrl}
          title="Orden médica"
          subtitle={`${paciente?.nombre ?? ''} · ${orden.adjunto}`}
          onClose={() => setVerDocumento(null)}
        />
      )}
      {verDocumento === 'autorizacion' && orden.autorizacion?.archivo?.url && (
        <PdfViewerModal
          src={orden.autorizacion.archivo.url}
          title="Autorización"
          subtitle={`${paciente?.nombre ?? ''} · N° ${orden.autorizacion.numero}`}
          onClose={() => setVerDocumento(null)}
        />
      )}
      {mostrarDescartar && (
        <div
          className="modal-overlay open"
          onClick={(e) => { if (e.target === e.currentTarget) setMostrarDescartar(false); }}
        >
          <div
            ref={discardRef}
            className="ncw-discard-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ro-discard-title"
            aria-describedby="ro-discard-desc"
          >
            <div className="ncw-discard-icon"><LuTriangleAlert className="icon" /></div>
            <h3 id="ro-discard-title">¿Descartar esta orden?</h3>
            <p id="ro-discard-desc">Perderás la información ingresada en este formulario. Esta acción no se puede deshacer.</p>
            <div className="ncw-discard-actions">
              <Button variant="secondary" onClick={() => setMostrarDescartar(false)}>Seguir editando</Button>
              <Button variant="danger-outline" icon={LuTrash2} onClick={onClose}>Sí, descartar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
