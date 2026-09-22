'use client';

import { useEffect, useState } from 'react';
import './HistoriaClinicaTab.css';
import RegistrosPanel from '../RegistrosPanel/RegistrosPanel';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import Button from '@/Components/Button/Button';
import { LuFileText, LuLoaderCircle, LuSparkles } from 'react-icons/lu';

// Sin backend/IA real (mock: "solo pinta el front"), "generar" el resumen es
// un delay simulado (mismo criterio que PRINT_LOADING_DELAY_MS en
// FacturaVistaClasica.jsx) que revela el texto fijo de `registro.resumen`.
const RESUMEN_DELAY_MS = 1200;

// Placeholder de detalle — el diseño interno de cada tipo de nota (EVO,
// notas de enfermería...) todavía no está definido (ver prompt de esta
// pantalla). Por ahora título + fecha + autor + el botón "Resumen" (solo si
// el registro trae `resumen` — hoy únicamente HCURG, ver
// mockHistoriaClinicaRecords.js), para que un futuro renderDetalle
// específico por tipo de nota lo reemplace sin tocar el resto del layout de
// la pestaña.
function renderDetalle(registro, resumenStatus, onGenerarResumen) {
  return (
    <div className="hct-detalle">
      <div className="hct-detalle-header">
        <div>
          <h3 className="hct-detalle-title">{registro.tituloNota}</h3>
          <div className="hct-detalle-meta">
            <span>{registro.fecha} · {registro.hora}</span>
            <span className="hct-detalle-sep">·</span>
            <span>{registro.autor}{registro.rol ? ` — ${registro.rol}` : ''}</span>
          </div>
        </div>

        {registro.resumen && resumenStatus !== 'ready' && (
          <Button
            variant="secondary"
            size="sm"
            icon={resumenStatus === 'loading' ? LuLoaderCircle : LuSparkles}
            disabled={resumenStatus === 'loading'}
            onClick={onGenerarResumen}
            className={`hct-resumen-btn${resumenStatus === 'loading' ? ' loading' : ''}`}
          >
            {resumenStatus === 'loading' ? 'Generando resumen…' : 'Resumen'}
          </Button>
        )}
      </div>

      {resumenStatus === 'ready' && registro.resumen && (
        <div className="hct-resumen-result">
          <div className="hct-resumen-result-label">
            <LuSparkles className="icon" aria-hidden="true" />
            Resumen generado
          </div>
          <p className="hct-resumen-result-text">{registro.resumen}</p>
        </div>
      )}
    </div>
  );
}

export default function HistoriaClinicaTab({ grupos, nuevaAtencionLabel, onNuevaAtencion, usuarioActual }) {
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  // null | 'loading' | 'ready' — se resetea al cambiar de registro
  // seleccionado (ver handleSelectRegistro) para que el resumen de uno no
  // "sobreviva" visualmente al abrir otro.
  const [resumenStatus, setResumenStatus] = useState(null);

  useEffect(() => {
    if (resumenStatus !== 'loading') return undefined;
    const timer = setTimeout(() => setResumenStatus('ready'), RESUMEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [resumenStatus]);

  function handleSelectRegistro(registro) {
    setSelectedRegistro(registro);
    setResumenStatus(null);
  }

  return (
    <div className="hct-layout">
      <RegistrosPanel
        grupos={grupos}
        nuevaAtencionLabel={nuevaAtencionLabel}
        onNuevaAtencion={onNuevaAtencion}
        usuarioActual={usuarioActual}
        selectedRegistroId={selectedRegistro?.id}
        onSelectRegistro={handleSelectRegistro}
      />

      <div className="hct-detail">
        {selectedRegistro ? renderDetalle(selectedRegistro, resumenStatus, () => setResumenStatus('loading')) : (
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
