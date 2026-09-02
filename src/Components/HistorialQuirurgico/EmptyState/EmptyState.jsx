'use client';

import './EmptyState.css';

// Esqueleto ícono-en-círculo + título, mismo patrón que AdmisionesEmptyState/
// AgendaEmptyState (ver AGENTS.md). Un solo componente compartido por
// ProcedimientosList y los 4 tabs de ProcedimientoDetalle -- las 5 listas de
// esta pantalla son de solo lectura y usan el mismo esqueleto vacío, solo
// cambia el ícono/texto.
export default function EmptyState({ icon: Icon, title }) {
  return (
    <div className="hq-empty-state">
      <div className="hq-empty-icon"><Icon className="icon" aria-hidden="true" /></div>
      <div className="hq-empty-title">{title}</div>
    </div>
  );
}
