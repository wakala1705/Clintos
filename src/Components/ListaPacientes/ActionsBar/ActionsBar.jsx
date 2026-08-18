import './ActionsBar.css';
import { LuSearch } from 'react-icons/lu';

// Los CTA principales ("Exportar"/"Agregar paciente") viven en
// .lp-page-header-actions (ver ListaPacientes.jsx), mismo patrón que el
// resto de páginas de nivel superior (ej. .adm-page-header-actions en
// Admisiones) — esta barra solo lleva el buscador.
export default function ActionsBar({ query, onQueryChange }) {
  return (
    <div className="lp-actions-bar">
      <div className="search-field">
        <LuSearch className="icon" />
        <input
          type="text"
          placeholder="Buscar por nombre o documento"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Buscar paciente por nombre o documento"
        />
      </div>
    </div>
  );
}
