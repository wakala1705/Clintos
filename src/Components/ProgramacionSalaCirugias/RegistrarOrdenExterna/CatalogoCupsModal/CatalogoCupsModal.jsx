'use client';

import { useEffect, useState } from 'react';
import './CatalogoCupsModal.css';
import ModalHeader from '@/Components/ModalHeader/ModalHeader';
import Button from '@/Components/Button/Button';
import SearchField from '@/Components/SearchField/SearchField';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import { CATALOGO_CUPS, COBERTURA_LABEL, TONO_COBERTURA } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';

// Quita tildes para que la búsqueda no distinga "cirugía" de "cirugia".
function normalizar(texto) {
  return Array.from(texto.normalize('NFD'))
    .filter((ch) => {
      const code = ch.codePointAt(0);
      return code < 0x300 || code > 0x36f;
    })
    .join('')
    .toLowerCase();
}

// Catálogo de procedimientos CUPS de "Registrar orden externa": se abre desde
// el paso 3, se marcan uno o varios y "Agregar" los carga a la orden. Los que
// ya están en la orden (`agregados`, ids) salen deshabilitados. `onAgregar`
// recibe los procedimientos elegidos (objetos de CATALOGO_CUPS).
export default function CatalogoCupsModal({ agregados, onAgregar, onClose }) {
  const [query, setQuery] = useState('');
  const [seleccion, setSeleccion] = useState([]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const q = normalizar(query.trim());
  const filtrados = q
    ? CATALOGO_CUPS.filter((c) => normalizar(`${c.cups} ${c.nombre} ${c.especialidad}`).includes(q))
    : CATALOGO_CUPS;

  function alternar(id) {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleConfirm() {
    onAgregar(CATALOGO_CUPS.filter((c) => seleccion.includes(c.id)));
    onClose();
  }

  return (
    <div className="modal-overlay open">
      <div className="modal-card cpc-modal-card" role="dialog" aria-modal="true" aria-labelledby="cpc-title">
        <ModalHeader
          title="Seleccionar procedimientos"
          titleId="cpc-title"
          onClose={onClose}
          closeLabel="Cerrar catálogo de procedimientos"
        />
        <div className="modal-body cpc-body">
          <SearchField value={query} onChange={setQuery} placeholder="Buscar por código, nombre o especialidad..." ariaLabel="Buscar procedimiento" />

          <div className="cpc-table">
            <div className="cpc-row cpc-row-head">
              <span />
              <span>Código CUPS</span>
              <span>Procedimiento</span>
              <span>Especialidad</span>
              <span>Cobertura</span>
            </div>
            <div className="cpc-list" role="listbox" aria-multiselectable="true" aria-labelledby="cpc-title">
              {filtrados.length === 0 && (
                <div className="cpc-empty">Sin resultados para &quot;{query}&quot;.</div>
              )}
              {filtrados.map((c) => {
                const yaAgregado = agregados.includes(c.id);
                const active = seleccion.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    role="option"
                    aria-selected={active || yaAgregado}
                    disabled={yaAgregado}
                    className={`cpc-row cpc-option${active ? ' active' : ''}`}
                    onClick={() => alternar(c.id)}
                  >
                    <input
                      type="checkbox"
                      className="cpc-check"
                      checked={active || yaAgregado}
                      disabled={yaAgregado}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span className="cpc-cups">{c.cups}</span>
                    <span className="cpc-nombre">
                      {c.nombre}
                      {yaAgregado && <span className="cpc-agregado"> · ya agregado</span>}
                    </span>
                    <span className="cpc-especialidad">{c.especialidad}</span>
                    <span><EstadoChip tone={TONO_COBERTURA[c.cobertura]}>{COBERTURA_LABEL[c.cobertura]}</EstadoChip></span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={seleccion.length === 0}>
            {seleccion.length > 1 ? `Agregar (${seleccion.length})` : 'Agregar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
