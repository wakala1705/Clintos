'use client';

import { LuInfo, LuLock } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import RecepcionTab from '../RecepcionTab/RecepcionTab';
import ConsumoTab from '../ConsumoTab/ConsumoTab';
import {
  CANASTA_ESTADO_LABEL, edadDetalleLabel, fechaHoraRangoLabel, resumenCanasta,
} from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  CANASTA_META, badgeProps, bannerCanasta,
} from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastaDetalle.css';

// Los nombres de procedimiento vienen en mayúsculas sostenidas: se muestran en minúscula con la inicial en mayúscula.
const oracion = (t = '') => (t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '');

// Panel derecho: cabecera de la cirugía, banner de excepciones (novedades, preparación),
// pestañas Recepción / Consumo y devolución. El estado editable vive en
// `draft` (lo guarda el orquestador por cirugía); esta capa no tiene estado.
export default function CanastaDetalle({
  cirugia, draft, error, onDraftChange, onRecibir, onCerrarConFaltante, onRegistrarConsumo, onDespachar,
}) {
  const { estado } = resumenCanasta(cirugia);
  const banner = bannerCanasta(cirugia);
  const consumoDisponible = cirugia.estado === 'realizada';
  const tab = consumoDisponible ? (draft.tab ?? 'consumo') : 'recepcion';

  return (
    <section className="cnc-panel cnc-detalle" aria-label="Detalle de la canasta">
      <div className="cnc-det-head">
        <div className="cnc-det-head-top">
          <div className="cnc-det-paciente-row">
            <h2>{cirugia.paciente.nombre}</h2>
            {cirugia.estado === 'urgencia' && <EstadoCirugiaBadge estado="urgencia" size="sm" />}
            <span className="cnc-det-doc">{cirugia.paciente.documento}{Number.isFinite(cirugia.paciente.edad) && ` · ${edadDetalleLabel(cirugia.paciente)}`}</span>
          </div>
          <div className="cnc-det-head-right">
            <span className="cnc-det-solicitud">Solicitud <strong>{cirugia.farmacia?.numeroPedido ?? '—'}</strong></span>
            <Badge {...badgeProps(CANASTA_META[estado])}>{CANASTA_ESTADO_LABEL[estado]}</Badge>
          </div>
        </div>
        <div className="cnc-det-grid">
          <div><span className="cnc-det-label">Procedimiento</span><span className="cnc-det-value">{oracion(cirugia.procedimientoPrincipal)}</span></div>
          <div><span className="cnc-det-label">Horario</span><span className="cnc-det-value">{fechaHoraRangoLabel(cirugia.fecha, cirugia.horaInicio, cirugia.horaFin)}</span></div>
          <div><span className="cnc-det-label">Cirujano</span><span className="cnc-det-value">{cirugia.cirujano}</span></div>
        </div>
      </div>

      {banner && (
        <div className={`cnc-banner cnc-banner-${banner.tone}`}>
          <LuInfo className="icon" aria-hidden="true" />
          <span>{banner.texto}</span>
        </div>
      )}
      {error && <p className="cnc-error" role="alert">{error}</p>}

      <div className="cnc-tabs" role="tablist" aria-label="Secciones de la canasta">
        <button
          type="button"
          role="tab"
          id="cnc-tab-recepcion"
          aria-controls="cnc-panel-recepcion"
          aria-selected={tab === 'recepcion'}
          className="cnc-tab"
          onClick={() => onDraftChange({ tab: 'recepcion' })}
        >
          Recepción
        </button>
        <button
          type="button"
          role="tab"
          id="cnc-tab-consumo"
          aria-controls="cnc-panel-consumo"
          aria-selected={tab === 'consumo'}
          className="cnc-tab"
          disabled={!consumoDisponible}
          title={consumoDisponible ? undefined : 'Se habilita al marcar la cirugía como realizada'}
          onClick={() => onDraftChange({ tab: 'consumo' })}
        >
          Consumo y devolución
          {!consumoDisponible && <LuLock className="cnc-tab-lock" aria-hidden="true" />}
          {!consumoDisponible && <span className="cnc-sr"> (se habilita al marcar la cirugía como realizada)</span>}
        </button>
      </div>

      <div className="cnc-tabpanel" role="tabpanel" id={`cnc-panel-${tab}`} aria-labelledby={`cnc-tab-${tab}`}>
        {tab === 'recepcion' ? (
          <RecepcionTab cirugia={cirugia} draft={draft} onDraftChange={onDraftChange} onRecibir={onRecibir} onCerrarConFaltante={onCerrarConFaltante} onDespachar={onDespachar} />
        ) : (
          <ConsumoTab cirugia={cirugia} draft={draft} onDraftChange={onDraftChange} onRegistrarConsumo={onRegistrarConsumo} />
        )}
      </div>
    </section>
  );
}
