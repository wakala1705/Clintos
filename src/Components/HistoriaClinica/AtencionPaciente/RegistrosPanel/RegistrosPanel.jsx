'use client';

import { useState } from 'react';
import './RegistrosPanel.css';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import { LuChevronRight, LuFolderOpen, LuPlus, LuPrinter } from 'react-icons/lu';

// true = varios grupos pueden quedar expandidos a la vez; false = acordeón
// (expandir uno colapsa los demás). Constante a propósito, no prop — así
// alternar el comportamiento es un cambio de una línea (ver prompt de esta
// pantalla).
const ALLOW_MULTIPLE_EXPANDED_GROUPS = false;

export default function RegistrosPanel({
  grupos,
  nuevaAtencionLabel = 'Nueva atención',
  onNuevaAtencion,
  selectedRegistroId,
  onSelectRegistro,
}) {
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [expandedTipos, setExpandedTipos] = useState(() => new Set());

  function toggleGroup(tipo) {
    setExpandedTipos((prev) => {
      const isOpen = prev.has(tipo);
      if (ALLOW_MULTIPLE_EXPANDED_GROUPS) {
        const next = new Set(prev);
        if (isOpen) next.delete(tipo); else next.add(tipo);
        return next;
      }
      return isOpen ? new Set() : new Set([tipo]);
    });
  }

  return (
    <div className="rg-panel">
      <div className="rg-top">
        <button
          type="button"
          className="btn btn-primary rg-nueva-atencion-btn"
          onClick={onNuevaAtencion}
          title={`${nuevaAtencionLabel} (+)`}
        >
          <span className="rg-nueva-atencion-label">
            <LuPlus className="icon" />
            {nuevaAtencionLabel}
          </span>
          <span className="rg-shortcut-hint" aria-hidden="true">+</span>
        </button>
      </div>

      <div className="rg-header">
        <button
          type="button"
          className="rg-header-btn"
          onClick={() => setPanelCollapsed((v) => !v)}
          aria-expanded={!panelCollapsed}
        >
          <span className="rg-header-title">Registros</span>
          <LuChevronRight className={`icon rg-header-chevron${panelCollapsed ? '' : ' open'}`} />
        </button>
      </div>

      {!panelCollapsed && (
        grupos.length === 0 ? (
          <AgendaEmptyState icon={LuFolderOpen} title="Sin registros" compact />
        ) : (
          <div className="rg-groups">
            {grupos.map((grupo) => {
              const isOpen = expandedTipos.has(grupo.tipo);
              return (
                <div className="rg-group" key={grupo.tipo}>
                  <div className={`rg-group-row${isOpen ? ' expanded' : ''}`}>
                    <button
                      type="button"
                      className="rg-group-row-btn"
                      onClick={() => toggleGroup(grupo.tipo)}
                      aria-expanded={isOpen}
                    >
                      <LuChevronRight className={`icon rg-group-chevron${isOpen ? ' open' : ''}`} />
                      <span className="rg-group-count">{grupo.registros.length}</span>
                      <span className="rg-group-name">{grupo.tipo}</span>
                      {grupo.estado && <span className="rg-badge-activa">{grupo.estado}</span>}
                    </button>
                    <div className="rg-group-actions">
                      <button type="button" className="rg-group-action-btn" aria-label={`Imprimir ${grupo.tipo}`} title="Imprimir">
                        <LuPrinter className="icon" />
                      </button>
                      <button type="button" className="rg-group-action-btn" aria-label={`Agregar registro de ${grupo.tipo}`} title="Agregar">
                        <LuPlus className="icon" />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="rg-subrows">
                      {grupo.registros.map((registro) => (
                        <button
                          type="button"
                          key={registro.id}
                          className={`rg-subrow${selectedRegistroId === registro.id ? ' selected' : ''}`}
                          onClick={() => onSelectRegistro(registro)}
                          aria-selected={selectedRegistroId === registro.id}
                        >
                          <span className="rg-subrow-datetime">{registro.fecha} · {registro.hora}</span>
                          <span className="rg-subrow-title">{registro.tituloNota}</span>
                          <span className="rg-subrow-author">{registro.autor}</span>
                          <span className="rg-subrow-role">{registro.rol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
