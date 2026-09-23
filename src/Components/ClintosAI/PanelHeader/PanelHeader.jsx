'use client';

import './PanelHeader.css';
import Badge from '@/Components/Badge/Badge';
import LayoutSwitcher from '../LayoutSwitcher/LayoutSwitcher';
import {
  LuArrowLeft, LuSparkles, LuSquarePen, LuX,
} from 'react-icons/lu';

// Header propio del panel (no <ModalHeader>: este es un panel lateral
// persistente, no un diálogo modal — mismo criterio ya usado para el rail de
// wizard, ver AGENTS.md "Modales" > Fuera de este componente). Reusa el
// mismo lenguaje visual (ícono en círculo, botón cerrar 30px/radio 8px con
// hover --gray-bg) para que se sienta parte del mismo sistema.
//
// Segunda iteración: con conversación activa se antepone un botón "←" al
// bloque título (mismo efecto que "Nuevo chat": reinicia a la bienvenida),
// el título "Kora" queda siempre visible. El acceso directo a Pantalla
// completa se retiró (encargo explícito: ya vive en LayoutSwitcher, que
// ofrece los 3 modos — no duplicarlo acá).
//
// "Kora": nombre visible del agente (encargo explícito) — el id
// `clintos-ai-title`/las clases `cai-*` quedan igual, son el nombre técnico
// del módulo, no lo que ve el usuario (ver ClintosAITrigger.jsx).
export default function PanelHeader({
  onClose, layoutMode, onLayoutModeChange, onNewChat, hasConversation,
}) {
  return (
    <div className="cai-header">
      <div className="cai-header-titles">
        {hasConversation && (
          <button type="button" className="cai-back-btn" onClick={onNewChat} aria-label="Volver">
            <LuArrowLeft className="icon" aria-hidden="true" />
          </button>
        )}
        <div className="cai-icon-circle cai-header-icon">
          <LuSparkles className="icon" aria-hidden="true" />
        </div>
        <h3 id="clintos-ai-title">
          Kora
          <Badge tone="info" className="cai-beta-badge">BETA</Badge>
        </h3>
      </div>
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
        <LayoutSwitcher mode={layoutMode} onChange={onLayoutModeChange} />
        <button type="button" className="cai-close-btn" onClick={onClose} aria-label="Cerrar Kora">
          <LuX className="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
