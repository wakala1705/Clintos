'use client';

import { useEffect, useState } from 'react';
import './FiltroPickerModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import { LuSearch } from 'react-icons/lu';

// Quita tildes para que la búsqueda encuentre "pediatria" al escribir
// "pediatría" o viceversa — mismo helper que SelectorModal.jsx de
// ProgramarCita (no importado desde ahí para no acoplar dos features por un
// componente de picker, ver filtrosData.js).
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
// (ID / nombre / conteo) — reemplaza al <select> nativo de "Especialidad" y
// "Médico" en el header de la agenda (ver page.jsx), mismo patrón de
// interacción que SelectorModal en ProgramarCita/AgendaToolbar.jsx pero con
// su propio scaffolding CSS (.acp-*) para no depender del shared.css de esa
// feature. La fila elegida queda "pendiente" hasta confirmar con el botón
// del footer; cerrar sin confirmar no cambia la selección previa.
export default function FiltroPickerModal({
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
    <div className="acp-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="acp-modal">
        <ModalHeader title={title} onClose={onClose} />

        <div className="acp-search">
          <LuSearch className="icon" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </div>

        <div className="acp-table">
          <div className="acp-row acp-row-head">
            <span>{idHeader}</span>
            <span>{nameHeader}</span>
            <span className="acp-count-head">{countHeader}</span>
          </div>
          <div className="acp-list" role="listbox">
            {filtered.length === 0 && (
              <div className="acp-empty">Sin resultados para &quot;{query}&quot;.</div>
            )}
            {filtered.map((item) => {
              const active = item.id === pendingId;
              return (
                <button
                  type="button"
                  key={item.id}
                  role="option"
                  aria-selected={active}
                  className={`acp-row acp-option${active ? ' active' : ''}`}
                  onClick={() => setPendingId(item.id)}
                >
                  <span className="acp-code">{item.codigo}</span>
                  <span className="acp-option-label">{item.label}</span>
                  <span className="acp-count">{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="acp-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!pendingId}>Seleccionar</button>
        </div>
      </div>
    </div>
  );
}
