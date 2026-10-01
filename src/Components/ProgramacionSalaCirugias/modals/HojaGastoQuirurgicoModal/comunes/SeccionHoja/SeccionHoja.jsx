'use client';

import { LuChevronDown } from 'react-icons/lu';
import './SeccionHoja.css';
import { useSeccion } from '@/hooks/ProgramacionSalaCirugias/hojaGasto/SeccionesContext';

const TONO_TEXTO = { ok: 'completa', error: 'con errores' };

// Tarjeta colapsable de una sección de la hoja: el header es un botón disclosure
// (h4 > button) con ícono tonal, título y chevron. `id` es el ancla del índice lateral
// del modal y la clave de su estado de plegado (context).
export default function SeccionHoja({
  id, icon: Icon, titulo, children, flush = false,
}) {
  const { abierta, alternar, tono } = useSeccion(id);
  return (
    <section id={id} className={`hgq-section${abierta ? '' : ' is-collapsed'}`}>
      <h4 className="hgq-section-head">
        <button
          type="button"
          className="hgq-section-toggle"
          aria-expanded={abierta}
          aria-controls={`${id}-cuerpo`}
          onClick={alternar}
        >
          {Icon && (
            <span className={`hgq-section-icon-wrap tone-${tono}`} aria-hidden="true">
              <Icon className="icon hgq-section-icon" />
            </span>
          )}
          <span className="hgq-section-title" id={`${id}-titulo`}>{titulo}</span>
          {TONO_TEXTO[tono] && <span className="hgq-sr-only">{TONO_TEXTO[tono]}</span>}
          <LuChevronDown className="icon hgq-section-chevron" aria-hidden="true" />
        </button>
      </h4>
      <div
        id={`${id}-cuerpo`}
        role="region"
        aria-labelledby={`${id}-titulo`}
        className="hgq-section-collapse"
        aria-hidden={!abierta}
        inert={!abierta}
      >
        <div className="hgq-section-clip">
          <div className={`hgq-section-body${flush ? ' is-flush' : ''}`}>{children}</div>
        </div>
      </div>
    </section>
  );
}
