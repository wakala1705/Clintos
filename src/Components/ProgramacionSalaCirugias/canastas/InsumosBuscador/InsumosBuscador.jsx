'use client';

import { LuSearch } from 'react-icons/lu';
import './InsumosBuscador.css';

// Buscador de insumos de una canasta larga (se monta solo con varios ítems).
// Usa la clase global .search-field de shared.css.
export default function InsumosBuscador({ value, onChange }) {
  return (
    <div className="cnc-buscador">
      <div className="search-field">
        <LuSearch className="icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Buscar insumo"
          aria-label="Buscar insumo en la canasta"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
