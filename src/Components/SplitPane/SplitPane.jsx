'use client';

import { useRef, useState } from 'react';
import './SplitPane.css';
import { LuGripHorizontal } from 'react-icons/lu';

const KEY_STEP = 5;

// Dos paneles apilados (arriba / abajo) con un divisor arrastrable entre
// ellos. Controlado: `ratio` es el % de alto del panel de arriba y
// `onRatioChange` se llama al SOLTAR el divisor (no en cada movimiento, así
// quien persista la proporción no escribe en cada pixel). Mientras se arrastra
// se usa un ratio local.
//
// - Teclado: el divisor es un `role="separator"` enfocable; ↑/↓ lo mueven de
//   a 5%, Home/End lo llevan al mínimo/máximo.
// - Doble clic en el divisor vuelve a `defaultRatio`.
// - `minPx`: alto mínimo de cada panel, para que ninguno se pueda cerrar del
//   todo arrastrando.
// - Cada panel es un flex column con min-height:0 y overflow:hidden: su
//   contenido tiene que manejar su propio scroll (tabla, lista...).
export default function SplitPane({
  top, bottom, ratio, onRatioChange, defaultRatio = 50, minPx = 160,
  label = 'Redimensionar paneles', className = '',
}) {
  const rootRef = useRef(null);
  const [dragRatio, setDragRatio] = useState(null);
  const current = dragRatio ?? ratio;

  function clamp(r) {
    const h = rootRef.current?.clientHeight ?? 0;
    const min = h > 0 ? Math.min(45, (minPx / h) * 100) : 10;
    return Math.min(100 - min, Math.max(min, r));
  }

  function ratioFromPointer(clientY) {
    const rect = rootRef.current.getBoundingClientRect();
    return clamp(((clientY - rect.top) / rect.height) * 100);
  }

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragRatio(ratioFromPointer(e.clientY));
  }

  function handlePointerMove(e) {
    if (dragRatio === null) return;
    setDragRatio(ratioFromPointer(e.clientY));
  }

  function handlePointerEnd() {
    if (dragRatio === null) return;
    onRatioChange(dragRatio);
    setDragRatio(null);
  }

  function handleKeyDown(e) {
    const next = {
      ArrowUp: current - KEY_STEP,
      ArrowDown: current + KEY_STEP,
      Home: 0,
      End: 100,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    onRatioChange(clamp(next));
  }

  return (
    <div
      ref={rootRef}
      className={`split-pane${dragRatio !== null ? ' is-dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{ gridTemplateRows: `minmax(0, ${current}fr) auto minmax(0, ${100 - current}fr)` }}
    >
      <div className="split-pane-panel">{top}</div>
      <div
        className="split-pane-divider"
        role="separator"
        aria-orientation="horizontal"
        aria-label={label}
        aria-valuenow={Math.round(current)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        title="Arrastra para redimensionar · doble clic para volver a 50/50"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={() => onRatioChange(defaultRatio)}
        onKeyDown={handleKeyDown}
      >
        <span className="split-pane-grip" aria-hidden="true">
          <LuGripHorizontal className="icon" />
        </span>
      </div>
      <div className="split-pane-panel">{bottom}</div>
    </div>
  );
}
