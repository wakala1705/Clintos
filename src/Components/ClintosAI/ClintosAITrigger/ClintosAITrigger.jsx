'use client';

import './ClintosAITrigger.css';
import { LuSparkles } from 'react-icons/lu';

// Trigger flotante y discreto de Kora, el agente de Clintos AI (STATE 01,
// panel cerrado) — ver AGENTS.md/brief "Responsive": no cubre información
// importante, solo un botón fijo en la esquina inferior derecha. "Kora" es
// el nombre visible del agente (encargo explícito); "Clintos AI" queda como
// nombre técnico/interno del módulo — folder, clases `cai-*`, ids, no
// cambian (ver PanelHeader.jsx).
export default function ClintosAITrigger({ onOpen }) {
  return (
    <button type="button" className="cai-trigger" onClick={onOpen}>
      <LuSparkles className="icon" aria-hidden="true" />
      Kora
    </button>
  );
}
