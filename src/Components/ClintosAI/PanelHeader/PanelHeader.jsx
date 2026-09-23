'use client';

import './PanelHeader.css';
import Badge from '@/Components/Badge/Badge';
import LayoutSwitcher from '../LayoutSwitcher/LayoutSwitcher';
import {
  LuArrowLeft, LuMaximize2, LuMinimize2, LuSparkles, LuSquarePen, LuX,
} from 'react-icons/lu';

// Header propio del panel (no <ModalHeader>: este es un panel lateral
// persistente, no un diálogo modal — mismo criterio ya usado para el rail de
// wizard, ver AGENTS.md "Modales" > Fuera de este componente). Reusa el
// mismo lenguaje visual (ícono en círculo, botón cerrar 30px/radio 8px con
// hover --gray-bg) para que se sienta parte del mismo sistema.
//
// Segunda iteración: con conversación activa, el bloque título se reemplaza
// por "← Volver" (brief STATE 03) — mismo efecto que "Nuevo chat" (reinicia
// a la bienvenida), pero el lápiz se conserva igual a la derecha (encargo
// explícito: las dos vías conviven). "Expandir" es un acceso directo a
// Pantalla completa aparte del LayoutSwitcher (que sigue ofreciendo los 3
// modos) — ver ClintosAIPanel.jsx para `expanded`/`onToggleExpand`.
export default function PanelHeader({
  onClose, layoutMode, onLayoutModeChange, onNewChat, hasConversation, expanded, onToggleExpand,
}) {
  return (
    <div className="cai-header">
      {hasConversation ? (
        <button type="button" className="cai-back-btn" onClick={onNewChat}>
          <LuArrowLeft className="icon" aria-hidden="true" />
          Volver
        </button>
      ) : (
        <div className="cai-header-titles">
          <div className="cai-icon-circle cai-header-icon">
            <LuSparkles className="icon" aria-hidden="true" />
          </div>
          <h3 id="clintos-ai-title">
            Clintos AI
            <Badge tone="info" className="cai-beta-badge">BETA</Badge>
          </h3>
        </div>
      )}
      <div className="cai-header-end">
        <button
          type="button"
          className="cai-newchat-btn"
          onClick={onNewChat}
          disabled={!hasConversation}
          aria-label="Nuevo chat"
          title="Nuevo chat"
        >
          <LuSquarePen className="icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="cai-expand-btn"
          onClick={onToggleExpand}
          aria-label={expanded ? 'Contraer Clintos AI' : 'Expandir Clintos AI'}
          title={expanded ? 'Contraer' : 'Expandir'}
          aria-pressed={expanded}
        >
          {expanded
            ? <LuMinimize2 className="icon" aria-hidden="true" />
            : <LuMaximize2 className="icon" aria-hidden="true" />}
        </button>
        <LayoutSwitcher mode={layoutMode} onChange={onLayoutModeChange} />
        <button type="button" className="cai-close-btn" onClick={onClose} aria-label="Cerrar Clintos AI">
          <LuX className="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
