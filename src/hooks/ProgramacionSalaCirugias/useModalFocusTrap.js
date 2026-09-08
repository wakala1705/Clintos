'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Atrapa el foco de teclado dentro de un modal mientras está activo --
// hallazgo de auditoría WCAG 2.1 AA (2.1.2 Sin trampa de teclado / 2.4.3
// Orden del foco, 2026-09-08): ningún modal de este feature movía el foco
// al abrir ni lo devolvía al cerrar, así que Tab escapaba hacia el
// contenido de la página detrás del overlay oscurecido (visualmente oculto
// pero igual enfocable). `containerRef` debe apuntar al nodo raíz del
// diálogo (ej. `.ncw-modal`, `.modal-card`).
//
// `active` (default `true`): para el caso común -- un componente que solo
// existe mientras el modal está abierto (`{abierto && <Modal/>}`, el resto
// de este feature) -- el default alcanza, mount/unmount ya hacen de on/off.
// Pasalo explícito solo cuando el diálogo vive dentro de un componente que
// se queda montado (ej. la confirmación de descarte de NuevaCirugiaWizard,
// que alterna `mostrarDescartar` sin desmontar el wizard): el efecto
// depende de `[active]`, así que activar/desactivar corre la misma
// captura/restauración de foco sin necesitar mount/unmount real.
export default function useModalFocusTrap(containerRef, active = true) {
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    function focusables() {
      return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
    }

    focusables()[0]?.focus();

    function handleKeyDown(e) {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // El elemento que abrió el modal puede haber desaparecido del DOM
      // mientras tanto (ej. una card de la agenda que se re-renderizó) --
      // `?.focus?.()` evita un throw en ese caso en vez de asumir que sigue vivo.
      previouslyFocusedRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
