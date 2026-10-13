'use client';

import { useId, useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import './Accordion.css';

// Bloque expandible/contraíble (acordeón de un solo ítem; se apilan varios para
// hacer un acordeón múltiple). El título es un <h4> con el botón adentro, así
// los lectores de pantalla lo anuncian como encabezado y como control
// expandible (`aria-expanded` + `aria-controls`). `meta` es un texto de
// resumen a la derecha, visible aun contraído ("21 insumos"). Solo consume
// tokens (--border/--surface/--ink-*/--primary/--bg/--gray-bg) del :root de la
// feature donde se monta.
//
//   <Accordion title="Equipos" meta="3 equipos" defaultOpen={false}>...</Accordion>
export default function Accordion({
  title, meta, defaultOpen = true, children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const triggerId = `${uid}-trigger`;
  const bodyId = `${uid}-body`;

  return (
    <section className="acc">
      <h4 className="acc-heading">
        <button
          type="button"
          id={triggerId}
          className="acc-trigger"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="acc-title">{title}</span>
          {meta && <span className="acc-meta">{meta}</span>}
          <LuChevronDown className={`acc-chevron${open ? '' : ' collapsed'}`} aria-hidden="true" />
        </button>
      </h4>
      {open && (
        <div id={bodyId} className="acc-body" role="region" aria-labelledby={triggerId}>
          {children}
        </div>
      )}
    </section>
  );
}
