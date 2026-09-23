'use client';

import { useState } from 'react';
import './SourcesDisclosure.css';
import { LuChevronDown, LuChevronUp, LuShieldCheck } from 'react-icons/lu';

// "Fuentes y trazabilidad" (brief sección 9) — cerrado por defecto para no
// sobrecargar el resumen; al expandir muestra cada fuente con su fecha.
// Genera confianza sin ocupar espacio permanente — mismo principio de
// "la IA nunca debe parecer una caja negra" (regla 15.8 del brief) sin
// forzar al usuario a leer la lista completa cada vez.
export default function SourcesDisclosure({ fuentes }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="cai-sources">
      <button
        type="button"
        className="cai-sources-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <LuShieldCheck className="icon" aria-hidden="true" />
        <span>Información basada en registros de Clintos</span>
        {open
          ? <LuChevronUp className="icon cai-sources-chevron" aria-hidden="true" />
          : <LuChevronDown className="icon cai-sources-chevron" aria-hidden="true" />}
      </button>
      {open && (
        <ul className="cai-sources-list">
          {fuentes.map((f) => (
            <li key={f.label}>{f.label} · {f.fecha}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
