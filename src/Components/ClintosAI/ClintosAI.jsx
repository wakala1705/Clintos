'use client';

import { useEffect, useState } from 'react';
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

// Punto de montaje único de Clintos AI (ver AGENTS.md "Component
// organization" / "Hooks organization" — hoy solo se monta desde
// HistoriaClinicaHospitalizacion.jsx, contextual a esa pantalla). Cerrado:
// trigger flotante (STATE 01). Abierto: panel que se agrega como hermano
// flex de `.content.hh-content` dentro de `.hh-body-row` (debajo del Topbar,
// que queda fijo — ver HistoriaClinicaHospitalizacion.css), así lo encoge en
// vez de taparlo en su modo "Barra lateral" (default).
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
export default function ClintosAI({
  pacientes, areaLabel, userFirstName = 'Camilo', onOpenHistoria, onNavigate, selectedPaciente, screenLabel,
}) {
  const [open, setOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('sidebar');
  const [narrowViewport, setNarrowViewport] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(NARROW_SIDEBAR_BREAKPOINT);
    const update = () => setNarrowViewport(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

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
    />
  );
}
