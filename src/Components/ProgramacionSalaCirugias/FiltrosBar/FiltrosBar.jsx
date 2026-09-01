'use client';

import { useState } from 'react';
import './FiltrosBar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogoSalasModal from '../modals/CatalogoSalasModal/CatalogoSalasModal';
import { ESTADO_FILTRO_OPTIONS, SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { LuChevronDown } from 'react-icons/lu';

// Vive embebido en .as-week-nav (ver AgendaSemana.jsx), junto a la
// navegación de semana propia de la agenda — por eso no tiene campo "Fecha"
// propio: sería un segundo prev/next que hace exactamente lo mismo que el ya
// presente en .as-week-center. Sin filtro de Sede (encargo explícito): la
// página opera fija sobre '02' (ver sedeId en ProgramacionSalaCirugias.jsx),
// `sedeId` acá solo sirve para acotar `salasDeSede`. Sin labels visibles
// (encargo explícito): cada control lleva su nombre accesible por
// aria-label/ariaLabel en vez de un <label> en pantalla — mismo valor
// semántico, menos ruido visual en la fila. El switch Día/Semana/Mes vive en
// el header de la página (ver .psc-page-header-actions en
// ProgramacionSalaCirugias.jsx, mismo lugar que .pc-page-header-actions en
// Programar cita) y no acá, a diferencia de una versión anterior de este
// componente.
export default function FiltrosBar({
  sedeId, salaId, onSalaChange, estado, onEstadoChange,
}) {
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);
  const salaActual = salasDeSede.find((s) => s.value === salaId);

  return (
    <div className="fb-bar">
      <div className="form-select">
        <button
          type="button"
          id="fb-sala"
          className={`form-select-trigger${catalogoOpen ? ' open' : ''}`}
          onClick={() => setCatalogoOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={catalogoOpen}
          aria-label="Sala / Quirófano"
        >
          <span className={salaActual ? 'form-select-value' : 'form-select-placeholder'}>
            {salaActual ? salaActual.label : 'Selecciona una opción'}
          </span>
          <LuChevronDown className="icon form-select-chev" aria-hidden="true" />
        </button>
      </div>
      <FormSelect id="fb-estado" ariaLabel="Estado" value={estado} onChange={onEstadoChange} options={ESTADO_FILTRO_OPTIONS} />

      {catalogoOpen && (
        <CatalogoSalasModal
          salas={salasDeSede}
          value={salaId}
          onSelect={onSalaChange}
          onClose={() => setCatalogoOpen(false)}
        />
      )}
    </div>
  );
}
