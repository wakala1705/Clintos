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
//   destacarse con color propio. `className="kora-topbar-secondary-btn"`
//   (ver KoraTopbarButton.css) solo pisa su :hover con el mismo borde
//   degradado que .cai-suggestion-card — no se toca Button.module.css
//   directo: ese variant lo usan 46+ botones del proyecto (ver AGENTS.md
//   "Botones"), este acento es una decisión puntual de este botón.
//
// Switch (encargo explícito): `active` = el panel de Kora está abierto. El
// padre lo toma del `onOpenChange` de <ClintosAI/> (no de un estado propio
// de este botón), así refleja también aperturas/cierres hechos desde el
// trigger flotante o la ✕ del panel; el padre decide en `onClick` si abre o
// cierra. `aria-pressed` anuncia el estado a lectores de pantalla.
export default function KoraTopbarButton({ onClick, variant = 'gradient', active = false }) {
  if (variant === 'secondary-accent') {
    return (
      <Button
        variant="secondary-accent"
        size="sm"
        icon={LuSparkles}
        onClick={onClick}
        aria-pressed={active}
        className={`kora-topbar-secondary-btn${active ? ' is-active' : ''}`}
      >
        Preguntar a Kora
      </Button>
    );
  }

  return (
    <button type="button" className="kora-topbar-btn" onClick={onClick} aria-pressed={active}>
      <LuSparkles className="icon" aria-hidden="true" />
      Preguntar a Kora
    </button>
  );
}
