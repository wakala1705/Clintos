'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuArrowLeft, LuArrowRight, LuChevronRight, LuClipboardCheck } from 'react-icons/lu';
import '../ProgramacionSalaCirugias.css';
import '../shared/shared.css';
import './RegistrarOrdenExterna.css';
import { initShellChrome } from '@/hooks/Shell/legacy-shell-chrome';
import Sidebar from '@/Components/Sidebar/Sidebar';
import Topbar from '@/Components/Topbar/Topbar';
import Button from '@/Components/Button/Button';
import Stepper from './Stepper/Stepper';
import PasoPaciente from './PasoPaciente/PasoPaciente';
import PasoOrden from './PasoOrden/PasoOrden';
import PasoProcedimientos from './PasoProcedimientos/PasoProcedimientos';
import PasoRevision from './PasoRevision/PasoRevision';
import ResumenOrden from './ResumenOrden/ResumenOrden';
import { PACIENTES_DIRECTORIO, DIAGNOSTICOS } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';
import { armarChecklist } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';
import { ESTADO_GENERAL_LABEL, evaluarSolicitud } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { agregarSolicitud, setAviso, siguienteId } from '@/hooks/ProgramacionSalaCirugias/gestion/store';
import { fechaISO } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

const PASOS = ['Paciente', 'Orden externa', 'Procedimientos CUPS', 'Revisión'];
const ORDEN_VACIA = {
  institucion: '', medico: '', fecha: '', dx: '', adjunto: '',
};
const digitos = (s) => String(s).replace(/\D/g, '');

// Qué falta para pasar de paso (también alimenta el texto bajo "Siguiente").
function faltantesDelPaso(paso, { paciente, orden, procedimientos }) {
  if (paso === 1) return paciente ? [] : ['seleccionar un paciente'];
  if (paso === 2) {
    return [
      !orden.institucion && 'la institución que remite',
      !orden.medico.trim() && 'el médico que ordena',
      !orden.fecha && 'la fecha de la orden',
      !orden.dx && 'el diagnóstico',
      !orden.adjunto && 'el documento de la orden',
    ].filter(Boolean);
  }
  if (paso === 3) {
    if (procedimientos.length === 0) return ['agregar un procedimiento'];
    return procedimientos.some((p) => !p.fecha) ? ['la fecha tentativa de cada procedimiento'] : [];
  }
  return [];
}

// "Registrar orden externa": asistente de 4 pasos para pacientes que llegan
// con una orden de otra institución. Al terminar, la orden entra a Gestión de
// cirugías con su lista de chequeo armada a partir de la historia clínica.
export default function RegistrarOrdenExterna() {
  const router = useRouter();
  const [hoy] = useState(() => fechaISO(new Date()));
  const [paso, setPaso] = useState(1);
  const [tipoDoc, setTipoDoc] = useState('CC');
  const [numDoc, setNumDoc] = useState('');
  const [resultados, setResultados] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [orden, setOrden] = useState(ORDEN_VACIA);
  const [procedimientos, setProcedimientos] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const cleanupChrome = initShellChrome({ startCollapsed: true });
    return () => cleanupChrome?.();
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }

  function handleBuscar() {
    const q = digitos(numDoc);
    setResultados(q
      ? PACIENTES_DIRECTORIO.filter((p) => p.tipoDocumento === tipoDoc && digitos(p.numeroDocumento).includes(q))
      : []);
  }

  const estado = { paciente, orden, procedimientos };
  const faltantes = faltantesDelPaso(paso, estado);
  const checklist = paciente && procedimientos.length > 0
    ? armarChecklist({
      historia: paciente.historia, procedimientos, ordenAdjunta: Boolean(orden.adjunto), eps: paciente.eps,
    })
    : null;
  const evaluacion = checklist ? evaluarSolicitud({ checklist }) : null;

  function handleAgregarProcedimiento(c) {
    setProcedimientos((prev) => [...prev, {
      ...c, lateralidad: 'na', fecha: '',
    }]);
  }

  function handleRegistrar() {
    if (!paciente || !checklist || !evaluacion) return;
    const principal = procedimientos[0];
    const id = siguienteId();
    agregarSolicitud({
      id,
      origen: 'consulta-externa',
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
      ordenNumero: `OE-2026-${id.split("-")[1]}`,
      fechaTentativa: principal.fecha,
      dxOrden: DIAGNOSTICOS.find((d) => d.value === orden.dx)?.label,
      checklist,
    });
    setAviso(`Orden registrada para ${paciente.nombre} · ${ESTADO_GENERAL_LABEL[evaluacion.estado]}`);
    router.push('/cirugia/gestion');
  }

  const ultimo = paso === PASOS.length;

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <Topbar
          section="Cirugía"
          page="Registrar orden externa"
          user={{ name: 'Camilo Grondona', role: 'Administrador', initials: 'CG' }}
        />

        <div className="content ro-content">
          <nav className="gc-breadcrumb" aria-label="Ruta de navegación">
            <Link href="/cirugia/gestion">Gestión de cirugías</Link>
            <LuChevronRight className="icon" aria-hidden="true" />
            <span aria-current="page">Registrar orden externa</span>
          </nav>
          <div className="psc-page-header">
            <div>
              <h1>Registrar orden externa</h1>
              <p>Para pacientes que llegan con una orden de otra institución. Las órdenes de Clintos llegan solas.</p>
            </div>
          </div>

          <Stepper pasos={PASOS} actual={paso} onIr={setPaso} />

          <div className="ro-workspace">
            <section className="gc-card ro-form" aria-label={`Paso ${paso} de ${PASOS.length}: ${PASOS[paso - 1]}`}>
              <div className="ro-form-cuerpo">
                {paso === 1 && (
                  <PasoPaciente
                    tipoDoc={tipoDoc}
                    onTipoDoc={setTipoDoc}
                    numDoc={numDoc}
                    onNumDoc={setNumDoc}
                    resultados={resultados}
                    onBuscar={handleBuscar}
                    paciente={paciente}
                    onSeleccionar={setPaciente}
                    onRegistrarPaciente={() => showToast('Registrar paciente: pantalla por conectar')}
                  />
                )}
                {paso === 2 && (
                  <PasoOrden
                    orden={orden}
                    onChange={(cambio) => setOrden((o) => ({ ...o, ...cambio }))}
                    hoy={hoy}
                    onVerAdjunto={() => showToast('Vista previa del documento: por conectar')}
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
                    onAccion={(accion, item) => showToast(`${accion} · ${item}: pantalla por conectar`)}
                  />
                )}
              </div>

              <footer className="ro-footer">
                {faltantes.length > 0 && (
                  <p className="ro-faltante" id="ro-faltante">Para continuar falta: {faltantes.join(', ')}.</p>
                )}
                <div className="ro-botones">
                  <Button variant="secondary" onClick={() => router.push('/cirugia/gestion')}>Cancelar</Button>
                  <span className="filter-spacer" />
                  {paso > 1 && (
                    <Button variant="secondary" icon={LuArrowLeft} onClick={() => setPaso((p) => p - 1)}>Atrás</Button>
                  )}
                  {ultimo ? (
                    <Button icon={LuClipboardCheck} onClick={handleRegistrar}>Registrar orden</Button>
                  ) : (
                    <Button
                      icon={LuArrowRight}
                      disabled={faltantes.length > 0}
                      aria-describedby={faltantes.length > 0 ? 'ro-faltante' : undefined}
                      onClick={() => setPaso((p) => p + 1)}
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
              </footer>
            </section>

            <ResumenOrden paciente={paciente} orden={orden} procedimientos={procedimientos} />
          </div>
        </div>
      </div>

      <div className={`psc-toast${toast ? ' show' : ''}`} role="status">
        <span className="psc-toast-dot" />
        <span>{toast}</span>
      </div>
    </div>
  );
}
