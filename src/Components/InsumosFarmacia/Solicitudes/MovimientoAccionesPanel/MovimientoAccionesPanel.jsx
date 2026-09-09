'use client';

import './MovimientoAccionesPanel.css';
import Button from '@/Components/Button/Button';
import {
  LuUndo2, LuBan, LuPrinter, LuPlus, LuPencil,
} from 'react-icons/lu';

// Panel de acciones lateral fijo junto a la grilla -- primer uso de este
// patrón en el proyecto (encargo explícito, réplica de la pantalla legacy
// de referencia). V1 es visual-only: sin onClick con efectos reales (sin
// modales de Nuevo/Editar/Reversar/Anular todavía, ver spec). "Reversar"
// queda deshabilitado siempre, igual que en la referencia; el resto se
// deshabilita solo cuando no hay ningún movimiento seleccionado. "Editar"
// usa variant="primary" para marcarla como la acción resaltada/activa de la
// captura de referencia -- no implica que sea la acción por defecto, solo
// replica el estilo visual.
export default function MovimientoAccionesPanel({ hasSelection }) {
  return (
    <div className="mig-acciones-panel">
      <Button variant="secondary" icon={LuUndo2} disabled>Reversar</Button>
      <Button variant="danger-outline" icon={LuBan} disabled={!hasSelection}>Anular</Button>
      <Button variant="secondary" icon={LuPrinter} disabled={!hasSelection}>Imprimir</Button>
      <Button variant="outline" icon={LuPlus}>Nuevo</Button>
      <Button variant="primary" icon={LuPencil} disabled={!hasSelection}>Editar</Button>
    </div>
  );
}
