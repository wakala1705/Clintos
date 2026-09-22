'use client';

import { useState } from 'react';
import './OrdenesMedicasTab.css';
import OrdenesPanel from './OrdenesPanel/OrdenesPanel';
import OrdenPreview from './OrdenPreview/OrdenPreview';
import NuevaOrdenForm from './NuevaOrdenForm/NuevaOrdenForm';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import { LuClipboardList } from 'react-icons/lu';

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

function formatFechaOrden(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${MESES[date.getMonth()]}.${date.getFullYear()}`;
}

// "Iniciar nueva orden" (ver AGENTS.md/comentario en NuevaOrdenForm.jsx) es
// autocontenido a esta pestaña: `ordenes` pasa de prop recalculada en cada
// render (AtencionPaciente.jsx llamaba getOrdenesMedicas() inline) a estado
// local acá, para poder agregarle la orden nueva sin tocar el padre.
export default function OrdenesMedicasTab({ ordenes, usuarioActual }) {
  const [ordenesState, setOrdenesState] = useState(ordenes);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [creandoOrden, setCreandoOrden] = useState(false);

  // Numera/fecha/autor la orden nueva a partir de lo que ya hay en la lista
  // (mismo criterio "solo layout, sin backend real" que mockOrdenesMedicas.js):
  // el número sigue al más alto ya existente, y especialidad/ámbito (no hay
  // de dónde más sacarlos, ver AtencionPaciente.jsx) se heredan de la última
  // orden del mismo autor.
  function handleGuardarOrden(itemsPorCategoria) {
    const maxNumero = ordenesState.reduce((max, o) => Math.max(max, parseInt(o.numero, 10) || 0), 0);
    const numero = String(maxNumero + 1);
    const ahora = new Date();
    const referencia = ordenesState.find((o) => o.autor?.toLowerCase() === usuarioActual.toLowerCase()) ?? ordenesState[0];

    const nuevaOrden = {
      id: `om-${numero}`,
      numero,
      fecha: formatFechaOrden(ahora),
      hora: ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }),
      tituloNota: 'ORDEN MÉDICA',
      autor: usuarioActual.toUpperCase(),
      especialidad: referencia?.especialidad ?? '',
      ambito: referencia?.ambito,
      ...itemsPorCategoria,
    };

    setOrdenesState((prev) => [nuevaOrden, ...prev]);
    setSelectedOrden(nuevaOrden);
    setCreandoOrden(false);
  }

  if (creandoOrden) {
    return <NuevaOrdenForm onCancelar={() => setCreandoOrden(false)} onGuardar={handleGuardarOrden} />;
  }

  return (
    <div className="omt-layout">
      <OrdenesPanel
        ordenes={ordenesState}
        usuarioActual={usuarioActual}
        onNuevaOrden={() => setCreandoOrden(true)}
        selectedOrdenId={selectedOrden?.id}
        onSelectOrden={setSelectedOrden}
      />

      <div className="omt-detail">
        {selectedOrden ? <OrdenPreview orden={selectedOrden} /> : (
          <AgendaEmptyState
            icon={LuClipboardList}
            title="Selecciona una orden médica"
            subtitle="La previsualización de la orden aparecerá aquí. También puedes iniciar una nueva orden desde el panel de la izquierda."
          />
        )}
      </div>
    </div>
  );
}
