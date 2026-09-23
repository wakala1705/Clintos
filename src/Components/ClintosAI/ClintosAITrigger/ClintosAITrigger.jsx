'use client';

import './ClintosAITrigger.css';
import { LuSparkles } from 'react-icons/lu';

// Trigger flotante y discreto de Clintos AI (STATE 01, panel cerrado) — ver
// AGENTS.md/brief "Responsive": no cubre información importante, solo un
// botón fijo en la esquina inferior derecha.
export default function ClintosAITrigger({ onOpen }) {
  return (
    <button type="button" className="cai-trigger" onClick={onOpen}>
      <LuSparkles className="icon" aria-hidden="true" />
      Clintos AI
    </button>
  );
}
