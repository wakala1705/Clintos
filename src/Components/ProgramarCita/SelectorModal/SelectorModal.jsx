'use client';

import { useEffect, useState } from 'react';
import './SelectorModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuSearch } from 'react-icons/lu';
import Button from '@/Components/Button/Button';

// Quita tildes para que la búsqueda encuentre "cardiologia" al escribir
// "cardiología" o viceversa (compara por rango de código en vez de una
// clase de regex con marcas combinadas literales, más difícil de mantener).
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Modal genérico de selección de una sola opción en forma de tabla buscable
// (ID / nombre / conteo), reutilizado por AgendaToolbar para especialidad y
// médico en vez de un <select> nativo — ver AGENTS.md (un solo componente
// para el mismo patrón, en lugar de duplicarlo por cada selector).
// La fila elegida queda "pendiente" hasta confirmar con el botón Seleccionar
// del footer; cerrar sin confirmar no cambia la selección previa.
// El padre monta este componente solo mientras el picker está abierto (en
// vez de pasarle un prop `open`): así cada apertura es una instancia nueva y
// `query`/`pendingId` arrancan limpios sin necesitar un efecto que los
// resetee (ver AgendaToolbar.jsx).
export default function SelectorModal({
  title, searchPlaceholder, idHeader, nameHeader, countHeader,
  items, selectedId, onSelect, onClose,
}) {
  const [query, setQuery] = useState('');
  const [pendingId, setPendingId] = useState(selectedId);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtered = q
    ? items.filter((item) => normalizar(item.label).includes(q) || normalizar(item.codigo).includes(q))
    : items;

  function handleConfirm() {
    if (pendingId) onSelect(pendingId);
    onClose();
  }

  return (
    <div className="pc-modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pc-modal pc-modal-sm">
        <ModalHeader title={title} onClose={onClose} />

        <div className="pc-selector-search">
          <LuSearch className="icon" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>

        <div className="pc-selector-table">
          <div className="pc-selector-row pc-selector-row-head">
            <span>{idHeader}</span>
            <span>{nameHeader}</span>
            <span className="pc-selector-count-head">{countHeader}</span>
          </div>
          <div className="pc-selector-list" role="listbox">
            {filtered.length === 0 && (
              <div className="pc-selector-empty">Sin resultados para &quot;{query}&quot;.</div>
            )}
            {filtered.map((item) => {
              const active = item.id === pendingId;
              return (
                <button
                  type="button"
                  key={item.id}
                  role="option"
                  aria-selected={active}
                  className={`pc-selector-row pc-selector-option${active ? ' active' : ''}`}
                  onClick={() => setPendingId(item.id)}
                >
                  <span className="pc-selector-code">{item.codigo}</span>
                  <span className="pc-selector-option-label">{item.label}</span>
                  <span className="pc-selector-count">{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pc-modal-footer">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!pendingId}>Seleccionar</Button>
        </div>
      </div>
    </div>
  );
}
