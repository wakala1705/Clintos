'use client';

import { useState } from 'react';
import './AreaFuncionalPickerButton.css';
import { LuChevronDown, LuLayers } from 'react-icons/lu';
import AreaFuncionalPickerModal from '@/Components/AreaFuncionalPickerModal/AreaFuncionalPickerModal';
import { setAreaFuncionalSeleccionada, useAreaFuncionalSeleccionada } from '@/hooks/AreaFuncional/areaFuncional';

// Meta-item "Área:" del Topbar (módulo Asistencial) + su modal -- análogo a
// @/Components/BodegaPickerButton (módulo Inventario). Mismo gate de entrada
// al módulo: sin área seleccionada todavía, el modal se abre solo y no hay
// forma de cerrarlo sin elegir una (ver comentario de BodegaPickerButton
// para el detalle de por qué `abierto` no necesita un flag aparte).
export default function AreaFuncionalPickerButton() {
  const area = useAreaFuncionalSeleccionada();
  const [abiertoManual, setAbiertoManual] = useState(false);
  const abierto = !area || abiertoManual;

  return (
    <>
      <button type="button" className="meta-item picker-btn" onClick={() => setAbiertoManual(true)}>
        <LuLayers className="icon" />
        <span className="lbl">Área:</span> <b>{area?.descripcion ?? 'Selecciona'}</b>
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {abierto && (
        <AreaFuncionalPickerModal
          area={area}
          onSelect={(a) => setAreaFuncionalSeleccionada(a.id)}
          onClose={() => setAbiertoManual(false)}
        />
      )}
    </>
  );
}
