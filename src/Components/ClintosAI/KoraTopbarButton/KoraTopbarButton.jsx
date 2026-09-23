'use client';

import './KoraTopbarButton.css';
import { LuSparkles } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Segundo punto de entrada a Kora, además del trigger flotante (ambos
// conviven — mismo criterio que "Nuevo chat"/"← Volver" en PanelHeader.jsx,
// ver AGENTS.md). Pensado para pasarse como `children` del Topbar de
// cualquier pantalla que ya monte <ClintosAI/> (hoy: Hospitalización ·
// Historia Clínica y Atención del paciente; escalable a futuras pantallas
// agregando este mismo botón a su propio Topbar, encargo explícito).
//
// Dos variantes (encargo explícito):
// - "gradient" (default): mismo degradado azul primary/--accent-teal que
//   ClintosAITrigger.css, para que se lea como el mismo agente en los dos
//   lugares — look propio, no un botón más del Topbar.
// - "secondary-accent": el <Button variant="secondary-accent"> ya existente
//   del proyecto (ver AGENTS.md "Botones" — nunca una clase `.btn` a mano),
//   mismo estilo que usan "Resumen"/"Imprimir"/etc. en HistoriaClinicaTab —
//   más discreto, se funde con el resto de controles del Topbar en vez de
//   destacarse con color propio.
export default function KoraTopbarButton({ onClick, variant = 'gradient' }) {
  if (variant === 'secondary-accent') {
    return (
      <Button variant="secondary-accent" size="sm" icon={LuSparkles} onClick={onClick}>
        Preguntar a Kora
      </Button>
    );
  }

  return (
    <button type="button" className="kora-topbar-btn" onClick={onClick}>
      <LuSparkles className="icon" aria-hidden="true" />
      Preguntar a Kora
    </button>
  );
}
