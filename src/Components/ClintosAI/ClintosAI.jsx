'use client';

import {
  forwardRef, useEffect, useImperativeHandle, useState,
} from 'react';
import './shared/shared.css';
import ClintosAITrigger from './ClintosAITrigger/ClintosAITrigger';
import ClintosAIPanel from './ClintosAIPanel/ClintosAIPanel';

// Ancho debajo del cual "Barra lateral" se renderiza como "Flotante" aunque
// sea el modo elegido — mismo umbral que --bp-desktop y el mismo patrón
// (matchMedia + listener) que AUTO_COLLAPSE_BREAKPOINT en
// GestionCamasSidebar.jsx/GestionEnfermeriaSidebar.jsx. Hallazgo de la
// auditoría UX de este panel: a 1024px "Barra lateral" (420px fijos) deja la
// tabla de pacientes casi inusable y el sistema no se adaptaba.
const NARROW_SIDEBAR_BREAKPOINT = '(max-width:1024px)';

// Componente de Clintos AI (ver AGENTS.md "Component organization" /
// "Hooks organization"), montado en 2 pantallas hoy: HistoriaClinicaHospitalizacion.jsx
// (lista de pacientes del piso) y AtencionPaciente.jsx en su variante
// "hospitalizacion" (un paciente puntual, contexto fijo — ver
// `hideFaq`/`selectedPaciente` sin `onClearPaciente` ahí). Cerrado: trigger
// flotante (STATE 01). Abierto: panel que se agrega como hermano flex de
// `.content` dentro de una fila propia de cada pantalla (`.hh-body-row`/
// `.ap-body-row`, debajo del Topbar que queda fijo), así lo encoge en vez de
// taparlo en su modo "Barra lateral" (default).
//
// `hideFaq`: oculta "Pregúntame" (preguntas generales, no acotadas a un
// paciente) cuando el contexto es fijo a un único paciente — esas preguntas
// (ej. "¿Cuántos pacientes hay?") no tienen sentido en esa pantalla. Ver
// FaqSection en ClintosAIPanel.jsx/FullscreenWelcome.jsx.
//
// `layoutMode` vive acá (no en ClintosAIPanel) para que sobreviva a
// cerrar/reabrir el panel: cerrar desmonta ClintosAIPanel, pero este
// componente raíz sigue montado siempre. Ver LayoutSwitcher.jsx (en
// PanelHeader) para el selector Flotante/Barra lateral/Pantalla completa.
//
// `narrowViewport` viaja aparte de `layoutMode`: el modo que el usuario
// eligió no cambia (el check del LayoutSwitcher sigue mostrando "Barra
// lateral"), solo el renderizado efectivo — ver el cálculo de
// `effectiveLayoutMode` en ClintosAIPanel.jsx. Apenas la ventana vuelve a
// ensanchar, "Barra lateral" se renderiza como tal de nuevo sin que el
// usuario tenga que volver a elegirla.
//
// `forwardRef`/`askExternal` (encargo explícito): el botón "Resumen" de un
// registro en HistoriaClinicaTab.jsx vive fuera de este árbol (es hermano de
// <ClintosAI/>, no hijo — ver AtencionPaciente.jsx), así que necesita una
// forma de empujarle una pregunta+respuesta desde afuera. `open` vive acá
// (no en ClintosAIPanel), así que abrir el panel Y encolarle la pregunta
// tienen que pasar por el mismo componente: `externalAsk` viaja como prop
// hacia ClintosAIPanel (que la consume en un efecto, ver
// pushTurnWithAnswer/onExternalAskHandled ahí) sin importar si el panel ya
// estaba abierto o si este método lo abre recién ahora.
const ClintosAI = forwardRef(function ClintosAI({
  pacientes, areaLabel, userFirstName = 'Camilo', onOpenHistoria, onNavigate, selectedPaciente, screenLabel,
  onClearPaciente, hideFaq,
}, ref) {
  const [open, setOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('sidebar');
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [externalAsk, setExternalAsk] = useState(null);

  useEffect(() => {
    const mql = window.matchMedia(NARROW_SIDEBAR_BREAKPOINT);
    const update = () => setNarrowViewport(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useImperativeHandle(ref, () => ({
    // Consumido por KoraTopbarButton.jsx (segundo punto de entrada, ver
    // AtencionPaciente.jsx/HistoriaClinicaHospitalizacion.jsx) — solo abre,
    // idempotente si ya estaba abierto.
    open() {
      setOpen(true);
    },
    askExternal(prompt, response) {
      setExternalAsk({ prompt, response });
      setOpen(true);
    },
  }), []);

  if (!open) {
    return <ClintosAITrigger onOpen={() => setOpen(true)} />;
  }

  return (
    <ClintosAIPanel
      onClose={() => setOpen(false)}
      userFirstName={userFirstName}
      pacientes={pacientes}
      areaLabel={areaLabel}
      onOpenHistoria={onOpenHistoria}
      onNavigate={onNavigate}
      layoutMode={layoutMode}
      onLayoutModeChange={setLayoutMode}
      narrowViewport={narrowViewport}
      selectedPaciente={selectedPaciente}
      screenLabel={screenLabel}
      onClearPaciente={onClearPaciente}
      hideFaq={hideFaq}
      externalAsk={externalAsk}
      onExternalAskHandled={() => setExternalAsk(null)}
    />
  );
});

export default ClintosAI;
