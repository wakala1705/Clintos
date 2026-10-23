'use client';

import { useEffect, useRef, useState } from 'react';
import { LuFilter } from 'react-icons/lu';
import './MasFiltrosCirugiasPopover.css';
import Button from '@/Components/Button/Button';
import Badge from '@/Components/Badge/Badge';
import FormSelect from '@/Components/FormSelect/FormSelect';
import { CANASTA_PEDIDA_LABEL } from '@/hooks/ProgramacionSalaCirugias/panel/panel';

const VINCULADA_OPTIONS = [
  { value: 'vinculada', label: 'Vinculada' },
  { value: 'no-vinculada', label: 'No vinculada' },
];
const PEDIDA_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  ...Object.entries(CANASTA_PEDIDA_LABEL).map(([value, label]) => ({ value, label })),
];

const alternar = (lista, value) => (lista.includes(value) ? lista.filter((v) => v !== value) : [...lista, value]);

// "Más filtros" del Panel general: sala y canasta pedida (selects, una sola
// opción; 'todas' = sin filtro) y canasta vinculada (casillas, sin marcar = sin
// filtro). Patrón borrador + aplicar: los controles solo tocan `draft`; recién
// "Aplicar" llama a `onAplicar`.
export default function MasFiltrosCirugiasPopover({
  salaOptions, sala, vinculada, pedida, onAplicar,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ sala, vinculada, pedida });
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handleClickOutside(e) {
      // Las listas de FormSelect viven en document.body: no cuentan como "afuera".
      if (e.target.closest('.form-select-dropdown')) return;
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
    if (!open) setDraft({ sala, vinculada, pedida });
    setOpen((v) => !v);
  }

  function handleAplicar() {
    onAplicar(draft);
    setOpen(false);
  }

  function handleLimpiar() {
    onAplicar({ sala: 'todas', vinculada: [], pedida: 'todas' });
    setOpen(false);
  }

  const activos = (sala !== 'todas' ? 1 : 0) + vinculada.length + (pedida !== 'todas' ? 1 : 0);

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
          <div className="mfc-section">
            <label htmlFor="mfc-sala" className="mfc-title">Sala de cirugía</label>
            <FormSelect
              id="mfc-sala"
              value={draft.sala}
              onChange={(v) => setDraft((x) => ({ ...x, sala: v }))}
              options={salaOptions}
            />
          </div>
          <fieldset className="mfc-section">
            <legend className="mfc-title">Canasta vinculada</legend>
            <div className="mfc-options">
              {VINCULADA_OPTIONS.map((o) => (
                <label key={o.value} className="mfc-check">
                  <input
                    type="checkbox"
                    checked={draft.vinculada.includes(o.value)}
                    onChange={() => setDraft((x) => ({ ...x, vinculada: alternar(x.vinculada, o.value) }))}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mfc-section">
            <label htmlFor="mfc-pedida" className="mfc-title">Canasta pedida</label>
            <FormSelect
              id="mfc-pedida"
              value={draft.pedida}
              onChange={(v) => setDraft((x) => ({ ...x, pedida: v }))}
              options={PEDIDA_OPTIONS}
            />
          </div>
          <div className="mfc-actions">
            <Button variant="secondary" size="sm" onClick={handleLimpiar}>Limpiar</Button>
            <Button size="sm" onClick={handleAplicar}>Aplicar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
