'use client';

import { LuCalendarX, LuCheckCheck } from 'react-icons/lu';
import Button from '@/Components/Button/Button';
import './AccionesLoteBar.css';

// Barra al pie de la card cuando hay filas seleccionadas. En lote solo
// Realizada e Incumplida (spec): cancelar/reprogramar piden datos por fila.
export default function AccionesLoteBar({
  cantidad, onMarcarRealizadas, onMarcarIncumplidas, onDeseleccionar,
}) {
  return (
    <div className="rv-lote-bar" role="region" aria-label="Acciones en lote">
      <span className="rv-lote-count" aria-live="polite">
        <strong>{cantidad}</strong> {cantidad === 1 ? 'seleccionada' : 'seleccionadas'}
      </span>
      <div className="rv-lote-actions">
        <Button size="sm" icon={LuCheckCheck} onClick={onMarcarRealizadas}>Marcar realizadas</Button>
        <Button size="sm" variant="warning-outline" icon={LuCalendarX} onClick={onMarcarIncumplidas}>Marcar incumplidas</Button>
        <Button size="sm" variant="secondary" onClick={onDeseleccionar}>Deseleccionar</Button>
      </div>
    </div>
  );
}
