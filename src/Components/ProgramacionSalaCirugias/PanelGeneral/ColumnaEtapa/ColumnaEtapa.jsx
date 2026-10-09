'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import './ColumnaEtapa.css';
import Badge from '@/Components/Badge/Badge';
import CirugiaCard from '../../CirugiaCard/CirugiaCard';
import { DERIVACION_LABEL } from '@/hooks/ProgramacionSalaCirugias/tablero/etapas';
import { esRetrasada } from '@/hooks/ProgramacionSalaCirugias/tablero/tablero';
import { diaCortoLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';

// Tarjeta arrastrable: el contenedor lleva los listeners de arrastre (con una
// distancia mínima, ver sensores en VistaEstados) para que el clic de la card
// y el de su "⋯" sigan funcionando. El arrastre es solo de puntero/táctil: por
// teclado se mueve con "Mover a…" del menú de la card.
function TarjetaEtapa({
  cirugia, etapaId, salaLabel, mostrarFecha, ahora, selectedId, onSelect, onMoverEtapa,
  onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: cirugia.id });
  const retrasada = Boolean(ahora) && etapaId === 'programada' && esRetrasada(cirugia, ahora);

  return (
    <div
      ref={setNodeRef}
      className={`te-item${isDragging ? ' dragging' : ''}`}
      {...listeners}
    >
      <div className="te-item-meta">
        <span className="te-sala">
          {mostrarFecha ? `${diaCortoLabel(cirugia.fecha).replace(/ \d{4}$/, '')} · ` : ''}
          {salaLabel}
        </span>
        {retrasada && <Badge tone="danger" dot>Retrasada</Badge>}
        {etapaId === 'derivado' && cirugia.derivacion && (
          <Badge tone="info">{DERIVACION_LABEL[cirugia.derivacion]}</Badge>
        )}
      </div>
      <CirugiaCard
        cirugia={cirugia}
        selected={cirugia.id === selectedId}
        onClick={() => onSelect(cirugia.id === selectedId ? null : cirugia.id)}
        etapaActual={etapaId}
        onMoverEtapa={onMoverEtapa}
        onReprogramar={onReprogramar}
        onMarcarRealizada={onMarcarRealizada}
        onMarcarIncumplida={onMarcarIncumplida}
        onCancelar={onCancelar}
      />
    </div>
  );
}

// Una etapa del tablero por estado: zona donde se sueltan las tarjetas.
export default function ColumnaEtapa({
  grupo, salaLabel, mostrarFecha, ahora, selectedId, onSelect, onMoverEtapa,
  onReprogramar, onMarcarRealizada, onMarcarIncumplida, onCancelar,
}) {
  const { etapa, cirugias } = grupo;
  const { setNodeRef, isOver } = useDroppable({ id: etapa.id });

  return (
    <section className={`te-col${isOver ? ' over' : ''}`} aria-label={etapa.label}>
      <header className="te-col-header">
        <h3>{etapa.label}</h3>
        <span className="te-col-count" aria-label={`${cirugias.length} cirugías`}>{cirugias.length}</span>
      </header>
      <div ref={setNodeRef} className="te-col-body">
        {cirugias.length === 0 ? (
          <p className="te-col-empty">Arrastra una cirugía aquí</p>
        ) : cirugias.map((c) => (
          <TarjetaEtapa
            key={c.id}
            cirugia={c}
            etapaId={etapa.id}
            salaLabel={salaLabel(c.salaId)}
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
    </section>
  );
}
