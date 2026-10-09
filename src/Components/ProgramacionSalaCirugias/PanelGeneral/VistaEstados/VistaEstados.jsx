'use client';

import { useState } from 'react';
import {
  DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import './VistaEstados.css';
import ColumnaEtapa from '../ColumnaEtapa/ColumnaEtapa';
import CirugiaCard from '../../CirugiaCard/CirugiaCard';
import { agruparPorEtapa } from '@/hooks/ProgramacionSalaCirugias/tablero/etapas';

// Vista "Tablero" del Panel general (contenido de la tarjeta, en lugar de la tabla), por estado: una columna por etapa (programada,
// admitido, en preparación, en quirófano, finalizado, en recuperación,
// derivación) y las cirugías del día arrastrables entre ellas. Soltar una
// tarjeta llama `onMoverEtapa(cirugia, etapaDestino)`, que decide si es un
// cambio directo o si abre un modal (iniciar/finalizar/derivar) -- la tarjeta
// no cambia de columna hasta que eso se confirma. Mouse con distancia mínima
// y táctil con pulsación corta para no pelear con el clic ni con el scroll.
export default function VistaEstados({
  cirugias, salaLabel, mostrarFecha = false, ahora, selectedId, onSelect, onMoverEtapa,
  onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  const [activaId, setActivaId] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );
  const grupos = agruparPorEtapa(cirugias);
  const activa = cirugias.find((c) => c.id === activaId) ?? null;

  function handleDragEnd({ active, over }) {
    setActivaId(null);
    const cirugia = cirugias.find((c) => c.id === active.id);
    if (cirugia && over) onMoverEtapa(cirugia, over.id);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActivaId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActivaId(null)}
    >
      <div className="ve-board">
        {grupos.map((grupo) => (
          <ColumnaEtapa
            key={grupo.etapa.id}
            grupo={grupo}
            salaLabel={salaLabel}
            mostrarFecha={mostrarFecha}
            ahora={ahora}
            selectedId={selectedId}
            onSelect={onSelect}
            onMoverEtapa={onMoverEtapa}
            onReprogramar={onReprogramar}
            onMarcarRealizada={onMarcarRealizada}
            onMarcarIncumplida={onMarcarIncumplida}
            onCancelar={onCancelar}
          />
        ))}
      </div>
      <DragOverlay>
        {activa && (
          <div className="ve-overlay">
            <CirugiaCard cirugia={activa} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
