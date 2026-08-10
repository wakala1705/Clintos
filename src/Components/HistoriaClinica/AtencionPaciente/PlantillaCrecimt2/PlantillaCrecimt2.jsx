'use client';

import { useRef, useState } from 'react';
import '../../shared/shared.css';
import './PlantillaCrecimt2.css';
import AntecedentesNav from './AntecedentesNav/AntecedentesNav';
import ConsultaStep from './ConsultaStep/ConsultaStep';
import AntecedentesStep from './AntecedentesStep/AntecedentesStep';
import { LuArrowLeft } from 'react-icons/lu';

// Plantilla "Atención integral a la primera infancia e infancia" (CRECIMT2),
// abierta desde "Nueva atención" → catálogo de plantillas (ver PlantillaModal
// en AtencionPaciente.jsx). Vive DENTRO de la misma pantalla de atención — no
// es una ruta ni una página aparte: AtencionPaciente.jsx la monta en vez de
// card-tabs-bar/ap-tab-panel cuando hay una plantilla activa, así que Sidebar/
// Topbar/PatientBanner de la atención siguen visibles (ver AGENTS.md, "un
// componente = una carpeta" también cubre vistas que reemplazan el body de
// una card existente en vez de navegar a otra URL). patient/onSalir vienen
// del padre, que ya tiene los datos del paciente cargados — este componente
// no vuelve a pedirlos.
//
// Las 11 secciones del formulario original de CRECIMT2. "01 Consulta" y "02
// Antecedentes" tienen contenido real (ver ConsultaStep.jsx/
// AntecedentesStep.jsx); el resto queda visible-pero-inerte para que el mapa
// completo del formulario se lea igual de real que en un HIS en producción,
// mismo patrón que las pestañas deshabilitadas de AtencionPaciente.jsx
// (title="Próximamente").
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
  { num: '03', label: 'Alimentación', status: 'inert' },
  { num: '04', label: 'Vacunación', status: 'inert' },
  { num: '05', label: 'Crecimiento', status: 'inert' },
  { num: '06', label: 'Desarrollo', status: 'inert' },
  { num: '07', label: 'Factores de riesgo', status: 'inert' },
  { num: '08', label: 'Escalas', status: 'inert' },
  { num: '09', label: 'Examen físico', status: 'inert' },
  { num: '10', label: 'Diagnóstico', status: 'inert' },
  { num: '11', label: 'Plan', status: 'inert' },
];

function formatSavedAt(date) {
  const time = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `Hoy, ${time}`;
}

// El formulario es tipo wizard: `currentStep` es el índice (0 = 01 Consulta,
// 1 = 02 Antecedentes) del paso que se está diligenciando ahora — ya no un
// scroll continuo con scrollspy sobre las 3 subsecciones. Un paso solo
// avanza al siguiente si `ConsultaStep.validar()` (ref) confirma que los
// campos obligatorios están completos (ver handleGuardarContinuar); en
// cambio "volver" a un paso ya completado no exige nada. Ambos pasos quedan
// SIEMPRE montados (ver `hidden` en ConsultaStep/AntecedentesStep) para no
// perder lo ya diligenciado al ir y volver — solo se ocultan con CSS.
export default function PlantillaCrecimt2({ onSalir }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [savedAt, setSavedAt] = useState(() => formatSavedAt(new Date()));

  const contentRef = useRef(null);
  const consultaRef = useRef(null);
  const antecedentesRef = useRef(null);

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

    setSavedAt(formatSavedAt(new Date()));
    window.ncToast?.('Progreso guardado. El resto del formulario (03 a 11) está en desarrollo.');
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
