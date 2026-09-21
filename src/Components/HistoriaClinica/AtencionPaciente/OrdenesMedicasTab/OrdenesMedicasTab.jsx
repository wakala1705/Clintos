'use client';

import { useState } from 'react';
import './OrdenesMedicasTab.css';
import OrdenesPanel from './OrdenesPanel/OrdenesPanel';
import OrdenPreview from './OrdenPreview/OrdenPreview';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import { LuClipboardList } from 'react-icons/lu';

export default function OrdenesMedicasTab({ ordenes, usuarioActual, onNuevaOrden }) {
  const [selectedOrden, setSelectedOrden] = useState(null);

  return (
    <div className="omt-layout">
      <OrdenesPanel
        ordenes={ordenes}
        usuarioActual={usuarioActual}
        onNuevaOrden={onNuevaOrden}
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
