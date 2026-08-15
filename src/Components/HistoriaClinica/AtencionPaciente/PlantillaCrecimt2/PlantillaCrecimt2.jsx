'use client';

import { useMemo, useRef, useState } from 'react';
import '../../shared/shared.css';
import './PlantillaCrecimt2.css';
import AntecedentesNav from './AntecedentesNav/AntecedentesNav';
import ConsultaStep from './ConsultaStep/ConsultaStep';
import AntecedentesStep from './AntecedentesStep/AntecedentesStep';
import RiesgoStep from './RiesgoStep/RiesgoStep';
import AlimentacionStep from './AlimentacionStep/AlimentacionStep';
import VacunacionStep from '@/Components/EsquemaVacunacion/EsquemaVacunacion';
import FactoresRiesgoStep from './FactoresRiesgoStep/FactoresRiesgoStep';
import ValeStep from './ValeStep/ValeStep';
import EadStep from './EadStep/EadStep';
import ExamenFisicoStep, { calcularIMC } from './ExamenFisicoStep/ExamenFisicoStep';
import CrecimientoStep from './CrecimientoStep/CrecimientoStep';
import MedicamentosStep from './MedicamentosStep/MedicamentosStep';
import RecomendacionesStep from './RecomendacionesStep/RecomendacionesStep';
import ProximasCitasStep from './ProximasCitasStep/ProximasCitasStep';
import ViewSettingsMenu from './ViewSettingsMenu/ViewSettingsMenu';
import { LuArrowLeft } from 'react-icons/lu';

// Plantilla "Atención integral a la primera infancia e infancia" (CRECIMT2),
// abierta desde "Nueva atención" → catálogo de plantillas (ver PlantillaModal
// en AtencionPaciente.jsx). Vive DENTRO de la misma pantalla de atención — no
// es una ruta ni una página aparte: AtencionPaciente.jsx la monta en vez de
// card-tabs-bar/ap-tab-panel cuando hay una plantilla activa, así que Sidebar/
// Topbar/PatientBanner de la atención siguen visibles (ver AGENTS.md, "un
// componente = una carpeta" también cubre vistas que reemplazan el body de
// una card existente en vez de navegar a otra URL). `onSalir` viene del
// padre, igual que `maximizada`/`onToggleMaximizar` (ver ViewSettingsMenu →
// "Maximizar"): ese estado vive en AtencionPaciente.jsx porque también
// compacta PatientBanner, hermano de la card, no algo interno a este
// componente. Tampoco recibe el resto de los datos del paciente —
// PatientBanner (AtencionPaciente.jsx) ya los muestra arriba de toda la
// atención, visibles durante los 11 pasos del wizard sin que este componente
// (ni la mayoría de sus pasos) necesite pedirlos de nuevo — salvo `patient`
// (solo se usa `patient.sexo`, ver "09 Examen físico" abajo): el desarrollo
// puberal (Tanner) necesita saber a qué sexo pertenece el paciente para
// mostrar el set de campos correcto.
//
// Las 13 secciones del wizard (12 del formulario original de CRECIMT2 +
// "13 Próximas citas", agregada después — ver más abajo). Las 13 secciones
// tienen contenido real (ver ConsultaStep.jsx/AntecedentesStep.jsx/
// RiesgoStep.jsx/AlimentacionStep.jsx/VacunacionStep.jsx/
// FactoresRiesgoStep.jsx/ValeStep.jsx/EadStep.jsx/ExamenFisicoStep.jsx/
// CrecimientoStep.jsx/MedicamentosStep.jsx/RecomendacionesStep.jsx/
// ProximasCitasStep.jsx) — ningún paso visible-pero-inerte (el patrón
// sigue documentado acá y en AtencionPaciente.jsx, title="Próximamente",
// por si un futuro paso vuelve a necesitarlo).
// "10 Crecimiento y APGAR familiar" (verificación de indicadores de
// crecimiento + síntesis histórica + cuestionario APGAR familiar de
// Smilkstein, ver crecimientoData.js) se insertó después de "09 Examen
// físico" — encargo explícito de reordenar los dos, ambos habían sido
// construidos en el orden opuesto originalmente — sin perder ningún campo
// ya construido en ninguno de los dos. "11 Medicamentos" reemplazó al
// antiguo "11 Diagnóstico" (placeholder inerte, sin fuente legacy
// verificada) — prescripción de los 3 medicamentos del esquema pediátrico
// estándar (ver MedicamentosStep.jsx). "12 Recomendaciones al cuidador"
// reemplazó al antiguo "12 Plan" (mismo motivo) — 8 categorías de
// recomendación con plantilla clínica predefinida por categoría (ver
// recomendacionesData.js). "13 Próximas citas" es una sección nueva sin
// número original en el legacy de 12 (seguimiento + diagnóstico de la
// atención + remisión + observaciones clínicas, ver proximasCitasData.js) —
// se agregó al final del wizard en vez de intercalarse entre las 12
// existentes.
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
      { id: 'al-consumo', label: 'Consumo día anterior' },
      { id: 'al-actual', label: 'Alimentación actual' },
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
    num: '08', label: 'Escala de desarrollo', status: 'active',
    subsecciones: [
      { id: 'ead-evaluacion', label: 'Evaluación EAD' },
    ],
  },
  {
    num: '09', label: 'Examen físico', status: 'active',
    subsecciones: [
      { id: 'ef-antropometria', label: 'Medidas antropométricas' },
      { id: 'ef-signos-vitales', label: 'Signos vitales' },
      { id: 'ef-condiciones-generales', label: 'Condiciones generales' },
      { id: 'ef-sistemas', label: 'Examen físico por sistemas' },
      { id: 'ef-agudeza-visual', label: 'Tamizaje de agudeza visual' },
      { id: 'ef-tanner', label: 'Desarrollo puberal' },
    ],
  },
  {
    num: '10', label: 'Crecimiento y APGAR familiar', status: 'active',
    subsecciones: [
      { id: 'cre-verificar', label: 'Verificar el crecimiento' },
      { id: 'cre-sintesis', label: 'Síntesis de evaluaciones' },
      { id: 'cre-apgar', label: 'Clasificación APGAR Familiar' },
    ],
  },
  {
    num: '11', label: 'Medicamentos', status: 'active',
    subsecciones: [
      { id: 'med-medicamentos', label: 'Medicamentos' },
    ],
  },
  {
    num: '12', label: 'Recomendaciones al cuidador', status: 'active',
    subsecciones: [
      { id: 'rec-recomendaciones', label: 'Recomendaciones al cuidador' },
    ],
  },
  {
    num: '13', label: 'Próximas citas', status: 'active',
    subsecciones: [
      { id: 'pcs-proximas-citas', label: 'Próximas citas' },
    ],
  },
];

function formatSavedAt(date) {
  const time = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `Hoy, ${time}`;
}

// El formulario es tipo wizard: `currentStep` es el índice (0 = 01 Consulta,
// 1 = 02 Antecedentes, 2 = 03 Riesgo 4505, 3 = 04 Alimentación, 4 = 05
// Vacunación, 5 = 06 Factores de riesgo, 6 = 07 VALE, 7 = 08 Escala de
// desarrollo/EAD, 8 = 09 Examen físico, 9 = 10 Crecimiento y APGAR
// familiar, 10 = 11 Medicamentos, 11 = 12 Recomendaciones al cuidador,
// 12 = 13 Próximas citas) del paso que se está diligenciando ahora — ya no
// un scroll continuo con scrollspy sobre todas las subsecciones del
// formulario. La navegación por el sidebar (AntecedentesNav) es libre: se
// puede saltar a cualquier sección sin completar las anteriores en orden
// (encargo explícito) — la única excepción es "01 Consulta"
// (motivo/enfermedad/fecha), que sigue siendo obligatoria: `validar()`
// (ref) debe pasar antes de poder salir de ella, tanto por "Guardar y
// continuar" como por un click directo en el sidebar (ver
// handleSelectStep/handleGuardarContinuar). Ningún otro paso bloquea salir
// de él — ExamenFisicoStep ya no bloquea tampoco (dejó de ser el caso
// especial que era) — "Diagnóstico principal" y "Motivo/Especialidad de
// remisión" (y los rangos clínicos de Examen físico) solo se marcan
// visualmente como obligatorios, ver .req/:required:placeholder-shown en
// PlantillaCrecimt2.css. `completedSteps` (Set de índices) es lo único que
// controla el check verde en el sidebar — un paso entra ahí cuando se sale
// de él hacia adelante (por "Guardar y continuar" o por click), nunca se
// quita, y saltar directo a una sección sin pasar por las anteriores no las
// marca completas. Los 13 pasos quedan SIEMPRE montados (ver `hidden` en ConsultaStep/
// AntecedentesStep/RiesgoStep/AlimentacionStep/VacunacionStep/
// FactoresRiesgoStep/ValeStep/EadStep/ExamenFisicoStep/CrecimientoStep/
// MedicamentosStep/RecomendacionesStep/ProximasCitasStep) para no perder lo
// ya diligenciado al ir y volver — solo se ocultan con CSS.
export default function PlantillaCrecimt2({ onSalir, maximizada, onToggleMaximizar, patient }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(() => new Set());
  const [activeSubIndex, setActiveSubIndex] = useState(0);
  const [savedAt, setSavedAt] = useState(() => formatSavedAt(new Date()));
  // "Tipo de formulario" (ver ViewSettingsMenu.jsx) — controla la altura de
  // TODOS los inputs/selects de los 13 pasos a la vez vía --pf-input-height
  // en .pf-content (ver PlantillaCrecimt2.css), reutilizando las 3 variantes
  // de tamaño ya definidas para el proyecto (--input-sm/md/lg) en vez de una
  // escala propia de este formulario.
  const [densidad, setDensidad] = useState('normal');
  // Único pedazo de estado de "09 Examen físico" que sube hasta acá (el
  // resto sigue 100% local a ExamenFisicoStep, ver su propio comentario) —
  // "10 Crecimiento y APGAR familiar" necesita leer Peso/Talla/PC/IMC ya
  // diligenciados, así que no pueden quedar aislados en el estado interno
  // del paso anterior.
  const [antropometria, setAntropometria] = useState({ peso: '', talla: '', pc: '', pt: '', perimetroBrazo: '' });
  const imcExamenFisico = useMemo(
    () => calcularIMC(antropometria.peso, antropometria.talla),
    [antropometria.peso, antropometria.talla],
  );
  // Memoizado (no un objeto literal inline en el JSX de abajo): PlantillaCrecimt2
  // re-renderiza seguido por scroll/activeSubIndex de OTROS pasos, y sin esto
  // CrecimientoStep recibiría una referencia nueva de `examenFisico` en cada
  // uno de esos renders aunque Peso/Talla/PC/IMC no hayan cambiado.
  const examenFisicoParaCrecimiento = useMemo(
    () => ({ peso: antropometria.peso, talla: antropometria.talla, pc: antropometria.pc, imc: imcExamenFisico }),
    [antropometria.peso, antropometria.talla, antropometria.pc, imcExamenFisico],
  );

  const contentRef = useRef(null);
  const consultaRef = useRef(null);
  const antecedentesRef = useRef(null);
  const riesgoRef = useRef(null);
  const alimentacionRef = useRef(null);
  const vacunacionRef = useRef(null);
  const factoresRiesgoRef = useRef(null);
  const valeRef = useRef(null);
  const eadRef = useRef(null);
  const examenFisicoRef = useRef(null);
  const crecimientoRef = useRef(null);
  const medicamentosRef = useRef(null);
  const recomendacionesRef = useRef(null);
  const proximasCitasRef = useRef(null);

  function goToStep(step) {
    setCurrentStep(step);
    setActiveSubIndex(0);
    contentRef.current?.scrollTo({ top: 0 });
  }

  function markStepComplete(step) {
    setCompletedSteps((prev) => (prev.has(step) ? prev : new Set(prev).add(step)));
  }

  // Único paso con navegación bloqueante: "01 Consulta" debe validar antes
  // de poder salir de él, sea por click directo en el sidebar (acá) o por
  // "Guardar y continuar" (ver handleGuardarContinuar) — el resto de
  // secciones se puede visitar libremente en cualquier orden.
  function handleSelectStep(step) {
    if (step === currentStep) return;
    if (currentStep === 0) {
      const valido = consultaRef.current?.validar();
      if (!valido) {
        window.ncToast?.('Completa los campos obligatorios de "01 Consulta" para continuar.');
        return;
      }
      markStepComplete(0);
    }
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
    else if (currentStep === 8) examenFisicoRef.current?.scrollToSub(index);
    else if (currentStep === 9) crecimientoRef.current?.scrollToSub(index);
    else if (currentStep === 10) medicamentosRef.current?.scrollToSub(index);
    else if (currentStep === 11) recomendacionesRef.current?.scrollToSub(index);
    else if (currentStep === 12) proximasCitasRef.current?.scrollToSub(index);
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
      markStepComplete(0);
      setSavedAt(formatSavedAt(new Date()));
      goToStep(1);
      return;
    }

    // 1-11: ningún otro paso bloquea el avance (ver comentario sobre
    // `completedSteps` más arriba) — ExamenFisicoStep incluido, ya dejó de
    // ser un caso especial con validación propia acá.
    if (currentStep >= 1 && currentStep <= 11) {
      markStepComplete(currentStep);
      setSavedAt(formatSavedAt(new Date()));
      goToStep(currentStep + 1);
      return;
    }

    // currentStep === 12 ("13 Próximas citas") es el último paso real del
    // wizard — ya no queda ningún paso inerte al que avanzar, así que
    // "Guardar y continuar" acá solo guarda y confirma que el formulario
    // completo quedó diligenciado (mismo botón, comportamiento distinto en
    // el último paso, sin necesitar una acción separada tipo "Finalizar").
    markStepComplete(12);
    setSavedAt(formatSavedAt(new Date()));
    window.ncToast?.('Formulario completo. Toda la información fue guardada.');
  }

  return (
    <>
      <div className="pf-titlebar">
        <button type="button" className="pf-titlebar-icon-btn pf-titlebar-back" onClick={onSalir} aria-label="Salir de la plantilla">
          <LuArrowLeft className="icon" aria-hidden="true" />
        </button>
        <span className="pf-titlebar-title">Atención integral a la primera infancia e infancia</span>
        <ViewSettingsMenu
          maximizada={maximizada}
          onToggleMaximizar={onToggleMaximizar}
          densidad={densidad}
          onDensidadChange={setDensidad}
        />
      </div>

      <div className="pf-body" ref={contentRef}>
        <AntecedentesNav
          secciones={SECCIONES}
          currentStep={currentStep}
          completedSteps={completedSteps}
          activeSubIndex={activeSubIndex}
          onSelectStep={handleSelectStep}
          onSelectSub={handleSelectSub}
        />

        <div className="pf-content" data-densidad={densidad}>
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
          <ExamenFisicoStep
            ref={examenFisicoRef}
            hidden={currentStep !== 8}
            activeSubIndex={activeSubIndex}
            onActiveSubIndexChange={setActiveSubIndex}
            scrollContainerRef={contentRef}
            patientSexo={patient?.sexo}
            antropometria={antropometria}
            onAntropometriaChange={setAntropometria}
            imc={imcExamenFisico}
          />
          <CrecimientoStep
            ref={crecimientoRef}
            hidden={currentStep !== 9}
            activeSubIndex={activeSubIndex}
            onActiveSubIndexChange={setActiveSubIndex}
            scrollContainerRef={contentRef}
            patientSexo={patient?.sexo}
            patientEdad={patient?.edad}
            patientNombre={patient?.nombre}
            examenFisico={examenFisicoParaCrecimiento}
          />
          <MedicamentosStep ref={medicamentosRef} hidden={currentStep !== 10} />
          <RecomendacionesStep ref={recomendacionesRef} hidden={currentStep !== 11} />
          <ProximasCitasStep ref={proximasCitasRef} hidden={currentStep !== 12} />
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
