'use client';

import './PillTabs.css';

// Tabs de pill plano (fondo gris solo en la activa, sin línea inferior) —
// excepción puntual al patrón "underline" del resto del proyecto, calcada
// del selector de categorías de referencia (Magnific). Compartido por el
// selector rápido de módulo del hero (Home.jsx) y las tabs de módulo de
// AllModulesModal.jsx — ambos dentro de la feature Home, por eso vive acá y
// no en un Components/ de nivel superior (ver AGENTS.md "Component
// organization": app-wide es para 2+ rutas, no 2 componentes de una misma
// feature).
export default function PillTabs({ options, value, onChange, ariaLabel }) {
  return (
    <div className="pill-tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`pill-tab${value === opt.value ? ' active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
