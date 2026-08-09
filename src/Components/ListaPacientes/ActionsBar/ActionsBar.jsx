import './ActionsBar.css';
import { LuDownload, LuSearch, LuUserPlus } from 'react-icons/lu';

export default function ActionsBar({ query, onQueryChange, onExport }) {
  return (
    <div className="lp-actions-bar">
      <div className="lp-search-field">
        <LuSearch className="icon" />
        <input
          type="text"
          placeholder="Buscar por nombre o documento"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Buscar paciente por nombre o documento"
        />
      </div>
      <div className="lp-actions-bar-buttons">
        <button type="button" className="btn btn-secondary" onClick={onExport}>
          <LuDownload className="icon" />
          Exportar
        </button>
        <button type="button" className="btn btn-primary" onClick={() => window.apOpen()}>
          <LuUserPlus className="icon" />
          Agregar paciente
        </button>
      </div>
    </div>
  );
}
