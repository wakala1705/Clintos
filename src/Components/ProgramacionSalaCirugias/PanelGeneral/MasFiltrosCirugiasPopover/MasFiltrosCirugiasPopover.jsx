'use client';

import { useEffect, useRef, useState } from 'react';
import { LuFilter } from 'react-icons/lu';
import './MasFiltrosCirugiasPopover.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import { CANASTA_PEDIDA_LABEL } from '@/hooks/ProgramacionSalaCirugias/panel/panel';

const VINCULADA_OPTIONS = [
  { value: 'vinculada', label: 'Vinculada' },
  { value: 'no-vinculada', label: 'No vinculada' },
];
const PEDIDA_OPTIONS = Object.entries(CANASTA_PEDIDA_LABEL).map(([value, label]) => ({ value, label }));

const alternar = (lista, value) => (lista.includes(value) ? lista.filter((v) => v !== value) : [...lista, value]);

// "Más filtros" del Panel general: canasta vinculada y canasta pedida, con
// casillas de selección múltiple (sin marcar = sin filtro). Patrón borrador +
// aplicar: las casillas solo tocan `draft`; recién "Aplicar" llama a `onAplicar`.
export default function MasFiltrosCirugiasPopover({ vinculada, pedida, onAplicar }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ vinculada, pedida });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleToggleOpen() {
    if (!open) setDraft({ vinculada, pedida });
    setOpen((v) => !v);
  }

  function handleAplicar() {
    onAplicar(draft);
    setOpen(false);
  }

  function handleLimpiar() {
    onAplicar({ vinculada: [], pedida: [] });
    setOpen(false);
  }

  const activos = vinculada.length + pedida.length;

  function renderGrupo(titulo, clave, opciones) {
    return (
      <fieldset className="mfc-section">
        <legend className="mfc-title">{titulo}</legend>
        <div className="mfc-options">
          {opciones.map((o) => (
            <label key={o.value} className="mfc-check">
              <input
                type="checkbox"
                checked={draft[clave].includes(o.value)}
                onChange={() => setDraft((d) => ({ ...d, [clave]: alternar(d[clave], o.value) }))}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="mfc-wrap" ref={rootRef}>
      <Button
        variant="secondary"
        icon={LuFilter}
        onClick={handleToggleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Más filtros
        {activos > 0 && <Badge tone="info" className="mfc-count">{activos}</Badge>}
      </Button>

      {open && (
        <div className="mfc-popover" role="dialog" aria-label="Más filtros">
          {renderGrupo('Canasta vinculada', 'vinculada', VINCULADA_OPTIONS)}
          {renderGrupo('Canasta pedida', 'pedida', PEDIDA_OPTIONS)}
          <div className="mfc-actions">
            <Button variant="secondary" size="sm" onClick={handleLimpiar}>Limpiar</Button>
            <Button size="sm" onClick={handleAplicar}>Aplicar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
