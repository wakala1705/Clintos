'use client';

import { useState } from 'react';
import './HistoriaClinicaTab.css';
import RegistrosPanel from '../RegistrosPanel/RegistrosPanel';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import { LuFileText } from 'react-icons/lu';

// Placeholder de detalle — el diseño interno de cada tipo de nota (EVO,
// notas de enfermería...) todavía no está definido (ver prompt de esta
// pantalla). Por ahora solo título + fecha + autor, para que un futuro
// renderDetalle específico por tipo de nota lo reemplace sin tocar el resto
// del layout de la pestaña.
function renderDetalle(registro) {
  return (
    <div className="hct-detalle">
      <h3 className="hct-detalle-title">{registro.tituloNota}</h3>
      <div className="hct-detalle-meta">
        <span>{registro.fecha} · {registro.hora}</span>
        <span className="hct-detalle-sep">·</span>
        <span>{registro.autor}{registro.rol ? ` — ${registro.rol}` : ''}</span>
      </div>
    </div>
  );
}

export default function HistoriaClinicaTab({ grupos, nuevaAtencionLabel, onNuevaAtencion }) {
  const [selectedRegistro, setSelectedRegistro] = useState(null);

  return (
    <div className="hct-layout">
      <RegistrosPanel
        grupos={grupos}
        nuevaAtencionLabel={nuevaAtencionLabel}
        onNuevaAtencion={onNuevaAtencion}
        selectedRegistroId={selectedRegistro?.id}
        onSelectRegistro={setSelectedRegistro}
      />

      <div className="hct-detail">
        {selectedRegistro ? renderDetalle(selectedRegistro) : (
          <AgendaEmptyState
            icon={LuFileText}
            title="Aún no hay historia clínica registrada"
            subtitle="Los registros de evolución, diagnósticos y notas clínicas de este paciente aparecerán aquí a medida que se generen."
          />
        )}
      </div>
    </div>
  );
}
