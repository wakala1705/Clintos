'use client';

import { LuInfo } from 'react-icons/lu';
import Badge from '@/Components/Badge/Badge';
import EstadoCirugiaBadge from '../../EstadoCirugiaBadge/EstadoCirugiaBadge';
import RecepcionTab from '../RecepcionTab/RecepcionTab';
import ConsumoTab from '../ConsumoTab/ConsumoTab';
import { CANASTA_ESTADO_LABEL, resumenCanasta } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import {
  CANASTA_FARMACIA_LABEL, CANASTA_META, badgeProps, bannerCanasta,
} from '@/hooks/ProgramacionSalaCirugias/canastaPresentacion';
import './CanastaDetalle.css';

// Panel derecho: cabecera de la cirugía, banner del estado de la compuerta,
// pestañas Recepción / Consumo y devolución. El estado editable vive en
// `draft` (lo guarda el orquestador por cirugía); esta capa no tiene estado.
export default function CanastaDetalle({
  cirugia, draft, error, onDraftChange, onRecibir, onRegistrarConsumo,
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
            <span className="cnc-det-doc">{cirugia.paciente.documento} · {cirugia.paciente.edad} años</span>
          </div>
          <div className="cnc-det-head-right">
            <span className="cnc-det-solicitud">Solicitud {cirugia.farmacia?.numeroPedido ?? '—'}</span>
            <Badge {...badgeProps(CANASTA_META[estado])}>{CANASTA_ESTADO_LABEL[estado]}</Badge>
          </div>
        </div>
        <div className="cnc-det-grid">
          <div><span className="cnc-det-label">Procedimiento</span><span className="cnc-det-value">{cirugia.procedimientoPrincipal}</span></div>
          <div><span className="cnc-det-label">Horario</span><span className="cnc-det-value">{cirugia.horaInicio} – {cirugia.horaFin}</span></div>
          <div><span className="cnc-det-label">Cirujano</span><span className="cnc-det-value">{cirugia.cirujano}</span></div>
          <div><span className="cnc-det-label">Farmacia</span><span className="cnc-det-value">{CANASTA_FARMACIA_LABEL[estado]}</span></div>
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
          onClick={() => onDraftChange({ tab: 'consumo' })}
        >
          Consumo y devolución
          {!consumoDisponible && <span className="cnc-tab-nota"> · al finalizar la cirugía</span>}
        </button>
      </div>

      <div className="cnc-tabpanel" role="tabpanel" id={`cnc-panel-${tab}`} aria-labelledby={`cnc-tab-${tab}`}>
        {tab === 'recepcion' ? (
          <RecepcionTab cirugia={cirugia} draft={draft} onDraftChange={onDraftChange} onRecibir={onRecibir} />
        ) : (
          <ConsumoTab cirugia={cirugia} draft={draft} onDraftChange={onDraftChange} onRegistrarConsumo={onRegistrarConsumo} />
        )}
      </div>
    </section>
  );
}
