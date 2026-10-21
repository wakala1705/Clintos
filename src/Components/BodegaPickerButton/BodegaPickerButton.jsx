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
// Pregunta solo la primera vez que se entra a una pantalla con este botón
// (encargo explícito "se pida solo la primera vez que se entra a esta página
// hasta que recarguemos nuevamente", 2026-10-21; antes preguntaba en cada
// entrada): la selección persiste en localStorage entre sesiones (ver
// hooks/Bodega/bodega.js), así que `!bodega` por sí solo deja de preguntar
// apenas se elige una vez. `preguntadoEnSesion` vive a nivel de módulo, no en
// el estado del componente: sobrevive al desmontaje al navegar entre
// pantallas (Entradas ↔ Salidas ↔ otras rutas) y solo se reinicia al
// recargar la página. Tras cerrar o elegir una vez, la bodega solo se vuelve
// a pedir con el botón del Topbar. Si nunca hubo bodega elegida (primer uso
// real), `!bodega` sigue forzando `abierto=true` sin importar este flag --
// mismo gate infranqueable de siempre.
let preguntadoEnSesion = false;

export default function BodegaPickerButton() {
  const bodega = useBodegaSeleccionada();
  const [abiertoManual, setAbiertoManual] = useState(false);
  const [preguntado, setPreguntado] = useState(preguntadoEnSesion);
  const abierto = !bodega || !preguntado || abiertoManual;

  function cerrar() {
    preguntadoEnSesion = true;
    setPreguntado(true);
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
