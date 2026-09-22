'use client';

import './CategoriaRail.css';

// Riel vertical de categorías de "Iniciar nueva orden" — un ícono por
// categoría de SECCIONES_ORDEN (ver ../../shared/ordenSecciones.js). El
// tooltip nativo (`title`) alcanza para identificar cada ícono sin construir
// un tooltip propio (no hay otro consumidor de esa pieza en el proyecto,
// ver AGENTS.md "Component organization").
export default function CategoriaRail({ categorias, activa, onSelect }) {
  return (
    <nav className="cr-rail" aria-label="Categorías de la orden">
      {categorias.map((cat) => {
        const Icon = cat.icon;
        const isActive = cat.clave === activa;
        return (
          <button
            key={cat.clave}
            type="button"
            className={`cr-item${isActive ? ' active' : ''}`}
            onClick={() => onSelect(cat.clave)}
            aria-pressed={isActive}
            title={cat.titulo}
            aria-label={cat.titulo}
          >
            <Icon className="icon" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}
