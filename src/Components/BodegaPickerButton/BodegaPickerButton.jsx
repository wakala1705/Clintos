'use client';

import { useState } from 'react';
import './BodegaPickerButton.css';
import { LuChevronDown, LuWarehouse } from 'react-icons/lu';
import BodegaPickerModal from '@/Components/BodegaPickerModal/BodegaPickerModal';
import { setBodegaSeleccionada, useBodegaSeleccionada } from '@/hooks/Bodega/bodega';

// Meta-item "Bodega:" del Topbar + su modal -- un solo componente para que
// cualquier pantalla lo sume a los children de <Topbar> con una línea (ver
// Home.jsx / Solicitudes.jsx). Estilos (.meta-item + reset de botón) en
// @/Components/Topbar/Topbar.css (global, siempre cargado donde se monta
// Topbar), no acá -- ver AGENTS.md "Component organization".
//
// Gate de entrada al módulo (encargo explícito): sin bodega seleccionada
// todavía (primer ingreso tras el login), el modal se abre solo y no hay
// forma de cerrarlo sin elegir una -- `abierto` sigue en true mientras
// `bodega` sea null sin importar cuántas veces se dispare onClose (Cancelar/
// Escape/click afuera), porque se recalcula en cada render a partir del
// estado global, no de un flag local aparte. Una vez elegida, este mismo
// botón sirve para cambiarla más adelante desde cualquier pantalla.
export default function BodegaPickerButton() {
  const bodega = useBodegaSeleccionada();
  const [abiertoManual, setAbiertoManual] = useState(false);
  const abierto = !bodega || abiertoManual;

  return (
    <>
      <button type="button" className="meta-item picker-btn" onClick={() => setAbiertoManual(true)}>
        <LuWarehouse className="icon" />
        <span className="lbl">Bodega:</span> <b>{bodega?.descripcion ?? 'Selecciona'}</b>
        <LuChevronDown className="icon chev" aria-hidden="true" />
      </button>

      {abierto && (
        <BodegaPickerModal
          bodega={bodega}
          onSelect={(b) => setBodegaSeleccionada(b.idGrupo)}
          onClose={() => setAbiertoManual(false)}
        />
      )}
    </>
  );
}
