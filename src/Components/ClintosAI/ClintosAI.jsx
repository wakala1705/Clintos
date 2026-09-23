'use client';

import { useState } from 'react';
import './shared/shared.css';
import ClintosAITrigger from './ClintosAITrigger/ClintosAITrigger';
import ClintosAIPanel from './ClintosAIPanel/ClintosAIPanel';

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
export default function ClintosAI({
  pacientes, areaLabel, userFirstName = 'Camilo', onOpenHistoria, onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState('sidebar');

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
    />
  );
}
