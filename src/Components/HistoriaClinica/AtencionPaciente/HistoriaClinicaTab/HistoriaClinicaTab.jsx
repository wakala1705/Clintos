'use client';

import { useEffect, useState } from 'react';
import './HistoriaClinicaTab.css';
import RegistrosPanel from '../RegistrosPanel/RegistrosPanel';
import AgendaEmptyState from '../../AgendaEmptyState/AgendaEmptyState';
import RegistroDetalle from '../RegistroDetalle/RegistroDetalle';
import CreandoPlantillaModal from '../CreandoPlantillaModal/CreandoPlantillaModal';
import Button from '@/Components/Button/Button';
import { LuEye, LuEyeOff, LuFileText, LuLoaderCircle, LuPencil, LuPrinter, LuSparkles } from 'react-icons/lu';

// Sin backend/IA real (mock: "solo pinta el front"), "generar" el resumen es
// un delay simulado (mismo criterio que PRINT_LOADING_DELAY_MS en
// FacturaVistaClasica.jsx) que revela el texto fijo de `registro.resumen`.
const RESUMEN_DELAY_MS = 1200;
// "Ver detalle": misma carga simulada, con el modal chico de carga de la
// atención (CreandoPlantillaModal con otro texto, encargo explícito) como
// si se estuvieran trayendo los datos del registro.
const DETALLE_DELAY_MS = 1200;

// Placeholder de detalle — el diseño interno de cada tipo de nota (EVO,
// notas de enfermería...) todavía no está definido (ver prompt de esta
// pantalla). Por ahora título + fecha + autor + una fila de acciones
// (Resumen/Imprimir/Editar/Ver detalle, variante secondary-accent) para que
// un futuro renderDetalle específico por tipo de nota lo reemplace sin tocar
// el resto del layout de la pestaña. Las 4 acciones se muestran para
// cualquier tipo de registro (encargo explícito), pero solo "Resumen"
// funciona hoy, y únicamente cuando el registro trae `resumen` (hoy solo
// HCURG, ver mockHistoriaClinicaRecords.js) — en el resto queda con
// `onClick` sin asignar, mismo criterio ya usado en "Imprimir"
// (`registro.archivoUrl`), "Editar" (`registro.contenido`) y "Ver detalle"
// (sin flujo aún, solo visual).
//
// "Resumen" con `onResumenRegistro` (encargo explícito, variante
// "hospitalizacion" con Clintos AI montado — ver AtencionPaciente.jsx): el
// resultado ya no aparece inline acá, viaja al panel de Clintos AI como una
// pregunta+respuesta de la conversación, así que `resumenStatus` nunca pasa
// de `null` en ese camino (nunca se llama `onGenerarResumen`) y el bloque
// "Resumen generado"/el spinner de abajo quedan sin usarse — ver el fallback
// de "consulta-externa" (sin `onResumenRegistro`, sin Clintos AI todavía),
// que sigue mostrando el resultado inline como antes.
function renderDetalle({
  registro, resumenStatus, onGenerarResumen, onResumenRegistro, onEditarRegistro, detalleStatus, onToggleDetalle,
}) {
  const handleResumenClick = onResumenRegistro ? () => onResumenRegistro(registro) : onGenerarResumen;
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

        <div className="hct-detalle-actions">
          {resumenStatus !== 'ready' && (
            <Button
              variant="secondary-accent"
              size="sm"
              icon={resumenStatus === 'loading' ? LuLoaderCircle : LuSparkles}
              disabled={resumenStatus === 'loading'}
              onClick={registro.resumen ? handleResumenClick : undefined}
              className={`hct-resumen-btn${resumenStatus === 'loading' ? ' loading' : ''}`}
            >
              {resumenStatus === 'loading' ? 'Generando resumen…' : 'Resumen'}
            </Button>
          )}
          <Button
            variant="secondary-accent"
            size="sm"
            icon={LuPrinter}
            onClick={registro.archivoUrl ? () => window.open(registro.archivoUrl, '_blank') : undefined}
          >
            Imprimir
          </Button>
          {/* "Editar" abre la plantilla ya diligenciada cuando el registro
              trae `contenido` (hoy solo el INGHOSP de ejemplo, ver
              mockIngresoHospitalizacionEjemplo.js). "Ver detalle" muestra el
              registro en lectura debajo de esta cabecera (RegistroDetalle),
              tras el modal de carga; si ya está visible, lo oculta. */}
          <Button
            variant="secondary-accent"
            size="sm"
            icon={LuPencil}
            onClick={registro.contenido && onEditarRegistro ? () => onEditarRegistro(registro) : undefined}
          >
            Editar
          </Button>
          <Button
            variant="secondary-accent"
            size="sm"
            icon={detalleStatus === 'ready' ? LuEyeOff : LuEye}
            aria-expanded={detalleStatus === 'ready'}
            disabled={detalleStatus === 'loading'}
            onClick={onToggleDetalle}
          >
            {detalleStatus === 'ready' ? 'Ocultar detalle' : 'Ver detalle'}
          </Button>
        </div>
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

      {detalleStatus === 'ready' && <RegistroDetalle registro={registro} />}
    </div>
  );
}

export default function HistoriaClinicaTab({
  grupos, nuevaAtencionLabel, onNuevaAtencion, onAgregarRegistro, usuarioActual, onResumenRegistro, onEditarRegistro,
}) {
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  // null | 'loading' | 'ready' — se resetea al cambiar de registro
  // seleccionado (ver handleSelectRegistro) para que el resumen de uno no
  // "sobreviva" visualmente al abrir otro.
  const [resumenStatus, setResumenStatus] = useState(null);

  // null | 'loading' | 'ready' — mismo criterio de reset que resumenStatus.
  const [detalleStatus, setDetalleStatus] = useState(null);

  useEffect(() => {
    if (detalleStatus !== 'loading') return undefined;
    const timer = setTimeout(() => setDetalleStatus('ready'), DETALLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [detalleStatus]);

  useEffect(() => {
    if (resumenStatus !== 'loading') return undefined;
    const timer = setTimeout(() => setResumenStatus('ready'), RESUMEN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [resumenStatus]);

  function handleSelectRegistro(registro) {
    setSelectedRegistro(registro);
    setResumenStatus(null);
    setDetalleStatus(null);
  }

  return (
    <div className="hct-layout">
      <RegistrosPanel
        grupos={grupos}
        nuevaAtencionLabel={nuevaAtencionLabel}
        onNuevaAtencion={onNuevaAtencion}
        onAgregarRegistro={onAgregarRegistro}
        usuarioActual={usuarioActual}
        selectedRegistroId={selectedRegistro?.id}
        onSelectRegistro={handleSelectRegistro}
      />

      <div className="hct-detail">
        {selectedRegistro ? renderDetalle({
          registro: selectedRegistro,
          resumenStatus,
          onGenerarResumen: () => setResumenStatus('loading'),
          onResumenRegistro,
          onEditarRegistro,
          detalleStatus,
          onToggleDetalle: () => setDetalleStatus((st) => (st === 'ready' ? null : 'loading')),
        }) : (
          <AgendaEmptyState
            icon={LuFileText}
            title="Aún no hay historia clínica registrada"
            subtitle="Los registros de evolución, diagnósticos y notas clínicas de este paciente aparecerán aquí a medida que se generen."
          />
        )}
      </div>

      {detalleStatus === 'loading' && selectedRegistro && (
        <CreandoPlantillaModal texto="Cargando detalle..." descripcion={selectedRegistro.tituloNota} />
      )}
    </div>
  );
}
