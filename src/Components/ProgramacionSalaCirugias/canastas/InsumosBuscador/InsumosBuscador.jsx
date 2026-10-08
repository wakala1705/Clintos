'use client';


import './InsumosBuscador.css';

import SearchField from '@/Components/SearchField/SearchField';
// Buscador de insumos de una canasta larga (se monta solo con varios ítems).
// Usa la clase global .search-field de shared.css.
export default function InsumosBuscador({ value, onChange }) {
  return (
    <div className="cnc-buscador">
      <SearchField className="psc-search" value={value} onChange={(v) => onChange(v)} placeholder="Buscar insumo" ariaLabel="Buscar insumo en la canasta" />
    </div>
  );
}
