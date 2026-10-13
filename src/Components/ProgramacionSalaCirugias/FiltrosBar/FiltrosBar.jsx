'use client';

import { useState } from 'react';
import './FiltrosBar.css';
import FormSelect from '@/Components/FormSelect/FormSelect';
import CatalogPickerTrigger from '../CatalogPickerTrigger/CatalogPickerTrigger';
import CatalogoSalasModal from '../modals/CatalogoSalasModal/CatalogoSalasModal';
import CatalogoMedicosModal from '../modals/CatalogoMedicosModal/CatalogoMedicosModal';
import VistaAgenda from '../GestionCirugias/VistaAgenda/VistaAgenda';
import { ESTADO_FILTRO_OPTIONS, SALAS } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { capitalizarNombre } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';

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
  sedeId, salaId, onSalaChange, estado, onEstadoChange, cirujano = 'todos', cirujanos, onCirujanoChange,
  vista, onChangeVista, jornada, onJornada, diasVista, onDiasVista,
}) {
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [cirujanoOpen, setCirujanoOpen] = useState(false);
  const salasDeSede = SALAS.filter((s) => s.sedeId === sedeId);
  const salaActual = salasDeSede.find((s) => s.value === salaId);
  // Con un cirujano elegido la sala puede ser "Todas las salas" (agenda que cruza salas) o una sola.
  const porCirujano = cirujano !== 'todos';
  const todasSalas = salaId === 'todas';
  // Mismo shape que MEDICOS_CATALOGO para reusar CatalogoMedicosModal; el documento no se conoce acá.
  const cirujanosCatalogo = cirujanos?.map((n) => ({
    idMedico: '—', nombre: n, descripcion: 'Cirujano', sede: 'SEDE NORTE',
  }));

  return (
    <div className="fb-bar">
      <CatalogPickerTrigger
        id="fb-sala"
        label={todasSalas ? 'Todas las salas' : salaActual?.label}
        open={catalogoOpen}
        onClick={() => setCatalogoOpen(true)}
        ariaLabel="Sala / Quirófano"
      />
      {cirujanosCatalogo && (
        <CatalogPickerTrigger
          id="fb-cirujano"
          label={porCirujano ? capitalizarNombre(cirujano) : 'Todos los cirujanos'}
          open={cirujanoOpen}
          onClick={() => setCirujanoOpen(true)}
          ariaLabel="Cirujano"
        />
      )}
      <FormSelect id="fb-estado" ariaLabel="Estado" value={estado} onChange={onEstadoChange} options={ESTADO_FILTRO_OPTIONS} />
      {onJornada && (
        <VistaAgenda
          vista={vista}
          onVista={onChangeVista}
          jornada={jornada}
          onJornada={onJornada}
          diasVista={diasVista}
          onDiasVista={onDiasVista}
        />
      )}

      {cirujanoOpen && (
        <CatalogoMedicosModal
          tipo="Cirujano"
          titulo="Cirujanos con agenda"
          medicos={cirujanosCatalogo}
          value={porCirujano ? cirujano : undefined}
          onSelect={onCirujanoChange}
          onClear={() => onCirujanoChange('todos')}
          onClose={() => setCirujanoOpen(false)}
        />
      )}
      {catalogoOpen && (
        <CatalogoSalasModal
          salas={salasDeSede}
          value={salaId}
          onSelect={onSalaChange}
          onTodas={porCirujano && !todasSalas ? () => onSalaChange('todas') : undefined}
          onClose={() => setCatalogoOpen(false)}
        />
      )}
    </div>
  );
}
