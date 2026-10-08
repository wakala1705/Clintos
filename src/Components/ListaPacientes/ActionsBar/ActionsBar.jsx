import './ActionsBar.css';


import SearchField from '@/Components/SearchField/SearchField';
// Los CTA principales ("Exportar"/"Agregar paciente") viven en
// .lp-page-header-actions (ver ListaPacientes.jsx), mismo patrón que el
// resto de páginas de nivel superior (ej. .adm-page-header-actions en
// Admisiones) — esta barra solo lleva el buscador.
export default function ActionsBar({ query, onQueryChange }) {
  return (
    <div className="lp-actions-bar">
      <SearchField className="lp-search" value={query} onChange={(v) => onQueryChange(v)} placeholder="Buscar por nombre o documento" ariaLabel="Buscar paciente por nombre o documento" />
    </div>
  );
}
