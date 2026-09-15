'use client';

import { useState } from 'react';
import './BodegaPickerButton.css';
import { LuChevronDown, LuWarehouse } from 'react-icons/lu';
import BodegaPickerModal from '@/Components/BodegaPickerModal/BodegaPickerModal';
import { setBodegaSeleccionada, useBodegaSeleccionada } from '@/hooks/Bodega/bodega';

// Meta-item "Bodega:" del Topbar + su modal -- un solo componente para que
// cualquier pantalla lo sume a los children de <Topbar> con una línea (ver
// Solicitudes.jsx). Estilos (.meta-item + reset de botón) en
// @/Components/Topbar/Topbar.css (global, siempre cargado donde se monta
// Topbar), no acá -- ver AGENTS.md "Component organization".
//
// Gate de entrada a la pantalla (encargo explícito "sin bodega seleccionada
// todavía, el modal se abre solo y no hay forma de cerrarlo sin elegir una"):
// `!bodega` fuerza `abierto=true` sin importar cuántas veces se dispare
// onClose (Cancelar/Escape/click afuera), porque se recalcula en cada render
// a partir del estado global (bodega.js), no de un flag local aparte. Una
// vez elegida, este mismo botón sirve para cambiarla más adelante.
//
// Dónde vive el gate (encargo explícito "pasemos este modal a cuando
// selecciono el módulo/card de Salidas asistenciales, tanto en usuario
// contable como administrador"): antes se montaba en el Topbar de Home.jsx
// (disparaba apenas se entraba al módulo, antes de llegar a ninguna pantalla
// concreta) y también se pedía desde el login. Ahora solo se monta en
// Solicitudes.jsx (destino de la card "Salidas asistenciales", el único
// ítem del grupo "Inventario"/módulo contable).
//
// Pregunta en cada entrada a la pantalla, no solo la primera vez global
// (encargo explícito "quiero que cada vez que entre al módulo de salidas
// asistenciales, me pregunte"): la selección persiste en localStorage entre
// sesiones (ver hooks/Bodega/bodega.js), así que `!bodega` por sí solo deja
// de preguntar apenas se elige una vez. `preguntadoEsteMontaje` arranca en
// false y pasa a true en cuanto el usuario cierra o elige (una sola vez por
// montaje de este componente) -- como Solicitudes.jsx desmonta este botón al
// salir de la pantalla, cada entrada real vuelve a montarlo con el flag en
// false y el modal se auto-abre de nuevo, ya con la última bodega elegida
// pre-seleccionada. Si nunca hubo bodega elegida (primer uso real), `!bodega`
// sigue forzando `abierto=true` sin importar este flag -- mismo gate
// infranqueable de siempre.
export default function BodegaPickerButton() {
  const bodega = useBodegaSeleccionada();
  const [abiertoManual, setAbiertoManual] = useState(false);
  const [preguntadoEsteMontaje, setPreguntadoEsteMontaje] = useState(false);
  const abierto = !bodega || !preguntadoEsteMontaje || abiertoManual;

  function cerrar() {
    setPreguntadoEsteMontaje(true);
    setAbiertoManual(false);
  }

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
          onSelect={(b) => { setBodegaSeleccionada(b.idGrupo); cerrar(); }}
          onClose={cerrar}
        />
      )}
    </>
  );
}
