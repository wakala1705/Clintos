'use client';

import { useState } from 'react';
import './FiltrosBar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogPickerTrigger from '../CatalogPickerTrigger/CatalogPickerTrigger';
import CatalogoSalasModal from '../modals/CatalogoSalasModal/CatalogoSalasModal';
import VistaDropdown from '../VistaDropdown/VistaDropdown';
import VistaAgenda from '../GestionCirugias/VistaAgenda/VistaAgenda';
import { ESTADO_FILTRO_OPTIONS, SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Vive embebido en .as-week-nav (ver AgendaSemana.jsx), junto a la
// navegación de semana propia de la agenda — por eso no tiene campo "Fecha"
// propio: sería un segundo prev/next que hace exactamente lo mismo que el ya
// presente en .as-week-center. Sin filtro de Sede (encargo explícito): la
// página opera fija sobre '02' (ver sedeId en ProgramacionSalaCirugias.jsx),
// `sedeId` acá solo sirve para acotar `salasDeSede`. Sin labels visibles
// (encargo explícito): cada control lleva su nombre accesible por
// aria-label/ariaLabel en vez de un <label> en pantalla — mismo valor
// semántico, menos ruido visual en la fila. El switch Día/Semana/Mes vuelve a
// vivir acá, al final de la fila (encargo explícito, 2026-09-29) -- antes
// estaba en el header de la página (.psc-page-header-actions en
// ProgramacionSalaCirugias.jsx); `vista`/`onChangeVista`/
// el estado sigue viviendo en el orquestador. `jornada`/`diasVista` (horas y
// días visibles) los maneja VistaAgenda -- el mismo menú "Vista" del modal de
// Programar cirugía; solo aparece si el padre pasa `onJornada` (no en Mes) y
// los días solo aplican a la vista Semana.
export default function FiltrosBar({
  sedeId, salaId, onSalaChange, estado, onEstadoChange,
  vista, onChangeVista, jornada, onJornada, diasVista, onDiasVista,
}) {
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);
  const salaActual = salasDeSede.find((s) => s.value === salaId);

  return (
    <div className="fb-bar">
      <CatalogPickerTrigger
        id="fb-sala"
        label={salaActual?.label}
        open={catalogoOpen}
        onClick={() => setCatalogoOpen(true)}
        ariaLabel="Sala / Quirófano"
      />
      <FormSelect id="fb-estado" ariaLabel="Estado" value={estado} onChange={onEstadoChange} options={ESTADO_FILTRO_OPTIONS} />
      <VistaDropdown value={vista} onChange={onChangeVista} />
      {onJornada && (
        <VistaAgenda
          jornada={jornada}
          onJornada={onJornada}
          diasVista={diasVista}
          onDiasVista={onDiasVista}
          ocultarDias={vista !== 'semana'}
        />
      )}

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
