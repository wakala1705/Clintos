'use client';

import { useRef, useState } from 'react';
import '../../shared/shared.css';
import './PlantillaCrecimt2.css';
import AntecedentesNav from './AntecedentesNav/AntecedentesNav';
import ConsultaStep from './ConsultaStep/ConsultaStep';
import AntecedentesStep from './AntecedentesStep/AntecedentesStep';
import RiesgoStep from './RiesgoStep/RiesgoStep';
import AlimentacionStep from './AlimentacionStep/AlimentacionStep';
import VacunacionStep from './VacunacionStep/VacunacionStep';
import FactoresRiesgoStep from './FactoresRiesgoStep/FactoresRiesgoStep';
import ValeStep from './ValeStep/ValeStep';
import EadStep from './EadStep/EadStep';
import { LuArrowLeft } from 'react-icons/lu';

// Plantilla "Atención integral a la primera infancia e infancia" (CRECIMT2),
// abierta desde "Nueva atención" → catálogo de plantillas (ver PlantillaModal
// en AtencionPaciente.jsx). Vive DENTRO de la misma pantalla de atención — no
// es una ruta ni una página aparte: AtencionPaciente.jsx la monta en vez de
// card-tabs-bar/ap-tab-panel cuando hay una plantilla activa, así que Sidebar/
// Topbar/PatientBanner de la atención siguen visibles (ver AGENTS.md, "un
// componente = una carpeta" también cubre vistas que reemplazan el body de
// una card existente en vez de navegar a otra URL). `onSalir` viene del
// padre. No recibe los datos del paciente: PatientBanner (AtencionPaciente.jsx)
// ya los muestra arriba de toda la atención, visibles durante los 12 pasos
// del wizard sin que este componente (ni ninguno de sus pasos) necesite
// pedirlos de nuevo.
//
// Las 12 secciones del formulario original de CRECIMT2. "01 Consulta", "02
// Antecedentes", "03 Riesgo 4505", "04 Alimentación", "05 Vacunación", "06
// Factores de riesgo", "07 VALE" y "08 Desarrollo" tienen contenido real
// (ver ConsultaStep.jsx/AntecedentesStep.jsx/RiesgoStep.jsx/
// AlimentacionStep.jsx/VacunacionStep.jsx/FactoresRiesgoStep.jsx/
// ValeStep.jsx/EadStep.jsx); el resto queda visible-pero-inerte para que el
// mapa completo del formulario se lea igual de real que en un HIS en
// producción, mismo patrón que las pestañas deshabilitadas de
// AtencionPaciente.jsx (title="Próximamente"). Tres ajustes ya aplicados
// sobre la numeración original, ninguno elimina campos: "Factores de
// riesgo" (antes 08, inerte) pasó a 06, justo después de Vacunación, porque
// su contenido real viene del mismo formulario legacy de vacunación;
// "Desarrollo"/"Crecimiento" (07/08) intercambiaron posición porque el
// primer contenido real que se construyó ahí fue VALE — Valoración del
// desarrollo infantil (ver ValeStep.jsx); y ahora que el contenido real de
// "08" es la EAD — Escala Abreviada de Desarrollo (ver EadStep.jsx,
// semánticamente "Desarrollo" tanto o más que VALE) el 07 se relabela a
// "VALE" (mismo contenido, solo el nombre) y el 08 pasa a llamarse
// "Desarrollo" — "Crecimiento" no tenía una fuente legacy verificada en
// este proyecto (fue mi propia aproximación antes de tener las capturas
// reales del formulario), así que no hay contenido que reubicar.
export const SECCIONES = [
  {
    num: '01', label: 'Consulta', status: 'active',
    subsecciones: [
      { id: 'motivo-consulta', label: 'Motivo de consulta' },
    ],
  },
  {
    num: '02', label: 'Antecedentes', status: 'active',
    subsecciones: [
      { id: 'bloque-familiares', label: 'Antecedentes familiares' },
      { id: 'bloque-personales', label: 'Antecedentes personales' },
    ],
  },
  {
    num: '03', label: 'Riesgo 4505', status: 'active',
    subsecciones: [
      { id: 'riesgo-4505', label: 'Riesgo 4505' },
    ],
  },
  {
    num: '04', label: 'Alimentación', status: 'active',
    subsecciones: [
      { id: 'al-alimentacion', label: 'Alimentación' },
      { id: 'al-actual', label: 'Alimentación actual' },
      { id: 'al-consumo', label: 'Consumo día anterior' },
      { id: 'al-historico', label: 'Registro histórico' },
      { id: 'al-evaluacion', label: 'Evaluación de la lactancia' },
    ],
  },
  {
    num: '05', label: 'Vacunación', status: 'active',
    subsecciones: [
      { id: 'vac-esquema', label: 'Antecedentes vacunales' },
    ],
  },
  {
    num: '06', label: 'Factores de riesgo', status: 'active',
    subsecciones: [
      { id: 'fr-hogar', label: 'Factores de riesgo en el hogar' },
    ],
  },
  {
    num: '07', label: 'VALE', status: 'active',
    subsecciones: [
      { id: 'vale-valoracion', label: 'Valoración VALE' },
    ],
  },
  {
    num: '08', label: 'Desarrollo', status: 'active',
    subsecciones: [
      { id: 'ead-evaluacion', label: 'Evaluación EAD' },
    ],
  },
  { num: '09', label: 'Escalas', status: 'inert' },
  { num: '10', label: 'Examen físico', status: 'inert' },
  { num: '11', label: 'Diagnóstico', status: 'inert' },
  { num: '12', label: 'Plan', status: 'inert' },
];

function formatSavedAt(date) {
  const time = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `Hoy, ${time}`;
}

// El formulario es tipo wizard: `currentStep` es el índice (0 = 01 Consulta,
// 1 = 02 Antecedentes, 2 = 03 Riesgo 4505, 3 = 04 Alimentación, 4 = 05
// Vacunación, 5 = 06 Factores de riesgo, 6 = 07 VALE, 7 = 08 Desarrollo/EAD)
// del paso que se está diligenciando ahora — ya no un scroll continuo con
// scrollspy sobre todas las subsecciones del formulario. Un paso solo
// avanza al siguiente si `ConsultaStep.validar()` (ref) confirma que los
// campos obligatorios están completos (ver handleGuardarContinuar); el
// resto de pasos no tiene validación bloqueante propia a este nivel (VALE
// sí valida internamente entre sus propias 5 etapas, EAD solo advierte sin
// bloquear — ver ValeStep.jsx/EadStep.jsx, ninguno de los dos bloquea el
// "Guardar y continuar" externo). "volver" a un paso ya completado no
// exige nada. Los 8 pasos quedan SIEMPRE montados (ver `hidden` en
// ConsultaStep/AntecedentesStep/RiesgoStep/AlimentacionStep/
// VacunacionStep/FactoresRiesgoStep/ValeStep/EadStep) para no perder lo ya
// diligenciado al ir y volver — solo se ocultan con CSS.
export default function PlantillaCrecimt2({ onSalir }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [savedAt, setSavedAt] = useState(() => formatSavedAt(new Date()));

  const contentRef = useRef(null);
  const consultaRef = useRef(null);
  const antecedentesRef = useRef(null);
  const riesgoRef = useRef(null);
  const alimentacionRef = useRef(null);
  const vacunacionRef = useRef(null);
  const factoresRiesgoRef = useRef(null);
  const valeRef = useRef(null);
  const eadRef = useRef(null);

  function goToStep(step) {
    setCurrentStep(step);
    setActiveSubIndex(0);
    contentRef.current?.scrollTo({ top: 0 });
  }

  function handleSelectStep(step) {
    if (step === currentStep) return;
    goToStep(step);
  }

  function handleSelectSub(index) {
    if (currentStep === 0) consultaRef.current?.scrollToSub(index);
    else if (currentStep === 1) antecedentesRef.current?.scrollToSub(index);
    else if (currentStep === 2) riesgoRef.current?.scrollToSub(index);
    else if (currentStep === 3) alimentacionRef.current?.scrollToSub(index);
    else if (currentStep === 4) vacunacionRef.current?.scrollToSub(index);
    else if (currentStep === 5) factoresRiesgoRef.current?.scrollToSub(index);
    else if (currentStep === 6) valeRef.current?.scrollToSub(index);
    else if (currentStep === 7) eadRef.current?.scrollToSub(index);
  }

  function handleGuardarSalir() {
    onSalir();
  }

  function handleGuardarContinuar() {
    if (currentStep === 0) {
      const valido = consultaRef.current?.validar();
      if (!valido) {
        window.ncToast?.('Completa los campos obligatorios de "01 Consulta" para continuar.');
        return;
      }
      setSavedAt(formatSavedAt(new Date()));
      goToStep(1);
      return;
    }

    if (currentStep === 1) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(2);
      return;
    }

    if (currentStep === 2) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(3);
      return;
    }

    if (currentStep === 3) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(4);
      return;
    }

    if (currentStep === 4) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(5);
      return;
    }

    if (currentStep === 5) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(6);
      return;
    }

    if (currentStep === 6) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(7);
      return;
    }

    if (currentStep === 7) {
      setSavedAt(formatSavedAt(new Date()));
      goToStep(8);
      return;
    }

    setSavedAt(formatSavedAt(new Date()));
    window.ncToast?.('Progreso guardado. El resto del formulario (09 a 12) está en desarrollo.');
  }

  return (
    <>
      <div className="pf-titlebar">
        <button type="button" className="pf-titlebar-back" onClick={onSalir} aria-label="Salir de la plantilla">
          <LuArrowLeft className="icon" aria-hidden="true" />
        </button>
        <span className="pf-titlebar-title">Atención integral a la primera infancia e infancia</span>
      </div>

      <div className="pf-body" ref={contentRef}>
        <AntecedentesNav
          secciones={SECCIONES}
          currentStep={currentStep}
          activeSubIndex={activeSubIndex}
          onSelectStep={handleSelectStep}
          onSelectSub={handleSelectSub}
        />

        <div className="pf-content">
          <ConsultaStep ref={consultaRef} hidden={currentStep !== 0} />
          <AntecedentesStep
            ref={antecedentesRef}
            hidden={currentStep !== 1}
            activeSubIndex={activeSubIndex}
            onActiveSubIndexChange={setActiveSubIndex}
            scrollContainerRef={contentRef}
          />
          <RiesgoStep ref={riesgoRef} hidden={currentStep !== 2} />
          <AlimentacionStep
            ref={alimentacionRef}
            hidden={currentStep !== 3}
            activeSubIndex={activeSubIndex}
            onActiveSubIndexChange={setActiveSubIndex}
            scrollContainerRef={contentRef}
          />
          <VacunacionStep ref={vacunacionRef} hidden={currentStep !== 4} />
          <FactoresRiesgoStep ref={factoresRiesgoRef} hidden={currentStep !== 5} />
          <ValeStep ref={valeRef} hidden={currentStep !== 6} scrollContainerRef={contentRef} />
          <EadStep ref={eadRef} hidden={currentStep !== 7} scrollContainerRef={contentRef} />
        </div>
      </div>

      <div className="pf-footer">
        <span className="pf-footer-saved">Último guardado: <b>{savedAt}</b></span>
        <div className="pf-footer-actions">
          <button type="button" className="btn btn-secondary" onClick={handleGuardarSalir}>Guardar y salir</button>
          <button type="button" className="btn btn-primary" onClick={handleGuardarContinuar}>Guardar y continuar →</button>
        </div>
      </div>
    </>
  );
}
