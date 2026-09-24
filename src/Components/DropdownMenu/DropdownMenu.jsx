'use client';

import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import { LuEllipsis } from 'react-icons/lu';
import panel from '@/Components/DropdownPanel/DropdownPanel.module.css';
import styles from './DropdownMenu.module.css';

// Menú de acciones "⋯" homologado (ver AGENTS.md "Dropdowns") — reemplaza
// a los ~17 RowActionsMenu/*RowMenu que cada feature tenía copiados con su
// propio CSS y su propia lógica de apertura (6 sombras, 3 tamaños de ícono,
// hover en hex, 11 sin :focus-visible...).
//
// items: [{ id, label, icon?, onSelect, tone?: 'danger'|'warn', disabled?,
//           dividerBefore? }]
//
// - Siempre portado a document.body con position:fixed: dentro de una tabla
//   con overflow:auto (o una card con overflow:hidden, BedCard) un dropdown
//   absoluto quedaba recortado en las últimas filas. Se abre hacia arriba si
//   no entra abajo y sigue al botón en scroll/resize.
// - z-index calc(--z-modal + 1): funciona igual en la página y dentro de un
//   modal (LoteRowMenu vive en AlistarPedidoModal).
// - Frena la propagación de click/doble click/teclado del botón y del menú:
//   casi todos viven en filas clicables (selección, doble click abre), y el
//   menú portado igual burbujea por el árbol de React hasta la fila.
// - Teclado (patrón ARIA menu button): al abrir, foco en el primer ítem;
//   ↑/↓/Home/End navegan (saltando deshabilitados), Escape cierra y devuelve
//   el foco al botón, Tab cierra.
//
// size: 'base' (28px, default) | 'sm' (22px — espacios muy apretados:
// tarjeta compacta de BedCard, tarjeta de cirugía). Mismo criterio que
// Button size="sm".
// onOpenChange(open): opcional, para el padre que necesita saber si el
// menú está abierto (ej. CirugiaCardMenu mantiene visible el "⋯" que la
// tarjeta solo muestra en hover mientras el menú sigue abierto).
export default function DropdownMenu({
  label, items, emptyLabel = 'Sin acciones disponibles', size = 'base', className = '', onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  const calcularPosicion = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const r = trigger.getBoundingClientRect();
    // El botón salió del viewport (scroll del contenedor): cerrar en vez
    // de dejar el menú flotando desanclado.
    if (r.bottom < 0 || r.top > window.innerHeight) {
      setOpen(false);
      return;
    }
    const gap = 4;
    const cabeAbajo = r.bottom + gap + menu.offsetHeight <= window.innerHeight - 8;
    setPos({
      top: cabeAbajo ? r.bottom + gap : Math.max(8, r.top - gap - menu.offsetHeight),
      left: Math.max(8, Math.min(r.right - menu.offsetWidth, window.innerWidth - menu.offsetWidth - 8)),
    });
  }, []);

  // Al abrir: posicionar antes del paint y, ya visible (siguiente frame),
  // foco en el primer ítem habilitado. Solo al abrir — no en cada
  // reposicionamiento por scroll, que movería el foco del usuario.
  useLayoutEffect(() => {
    if (!open) return undefined;
    calcularPosicion();
    const frame = requestAnimationFrame(() => {
      menuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, calcularPosicion]);

  useEffect(() => {
    if (!open) return undefined;
    function handleMouseDown(e) {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', calcularPosicion, true);
    window.addEventListener('resize', calcularPosicion);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', calcularPosicion, true);
      window.removeEventListener('resize', calcularPosicion);
    };
  }, [open, calcularPosicion]);

  function cerrar({ devolverFoco = true } = {}) {
    setOpen(false);
    if (devolverFoco) triggerRef.current?.focus();
  }

  function handleSelect(item) {
    cerrar();
    item.onSelect?.();
  }

  function handleMenuKeyDown(e) {
    e.stopPropagation();
    const enabled = [...menuRef.current.querySelectorAll('[role="menuitem"]:not(:disabled)')];
    const idx = enabled.indexOf(document.activeElement);
    let next = null;
    if (e.key === 'ArrowDown') next = enabled[(idx + 1) % enabled.length];
    else if (e.key === 'ArrowUp') next = enabled[(idx - 1 + enabled.length) % enabled.length];
    else if (e.key === 'Home') next = enabled[0];
    else if (e.key === 'End') next = enabled[enabled.length - 1];
    else if (e.key === 'Escape') {
      e.preventDefault();
      cerrar();
      return;
    } else if (e.key === 'Tab') {
      cerrar({ devolverFoco: false });
      return;
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }

  const stop = (e) => e.stopPropagation();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={[styles.trigger, size === 'sm' && styles.sm, open && styles.triggerOpen, className].filter(Boolean).join(' ')}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) setPos(null);
          setOpen(!open);
        }}
        onDoubleClick={stop}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape' && open) cerrar();
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title="Más acciones"
      >
        <LuEllipsis className={styles.triggerIcon} aria-hidden="true" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className={`${styles.menu} ${panel.panel}`}
          role="menu"
          aria-label={label}
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
          onClick={stop}
          onDoubleClick={stop}
          onMouseDown={stop}
          onKeyDown={handleMenuKeyDown}
        >
          {items.length === 0 && <span className={panel.empty}>{emptyLabel}</span>}
          {items.map((item) => {
            const Icon = item.icon;
            const toneClass = item.tone ? panel[item.tone] : '';
            return (
              <div key={item.id} className={styles.itemWrap}>
                {item.dividerBefore && <div className={panel.divider} role="separator" />}
                <button
                  type="button"
                  role="menuitem"
                  className={`${panel.item} ${toneClass}`.trim()}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                >
                  {Icon && <Icon className={panel.icon} aria-hidden="true" />}
                  {item.label}
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}
