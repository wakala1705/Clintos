'use client';

import { useState } from 'react';
import './SedePickerButton.css';
import { LuBuilding2, LuChevronDown } from 'react-icons/lu';
import SedePickerModal from '@/Components/SedePickerModal/SedePickerModal';
import { setSedeSeleccionada, useSedeSeleccionada } from '@/hooks/Sede/sede';

// Meta-item "Sede:" del Topbar + su modal -- hermano de
// @/Components/AreaFuncionalPickerButton (mismo look .meta-item.picker-btn).
// Sin gate de entrada: la sede siempre tiene un valor por defecto (ver
// hooks/Sede/sede.js), así que el modal solo se abre a pedido del usuario.
export default function SedePickerButton() {
  const sede = useSedeSeleccionada();
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button type="button" className="meta-item picker-btn" onClick={() => setAbierto(true)}>
        <LuBuilding2 className="icon" />
        <span className="lbl">Sede:</span> <b>{sede.descripcion}</b>
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {abierto && (
        <SedePickerModal
          sede={sede}
          onSelect={(s) => setSedeSeleccionada(s.id)}
          onClose={() => setAbierto(false)}
        />
      )}
    </>
  );
}
