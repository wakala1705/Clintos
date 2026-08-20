import './BedCard.css';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import BedActionsMenu from '../BedActionsMenu/BedActionsMenu';
import {
  AREA_LABEL, CTA_PRINCIPAL, PISO_LABEL, SECTOR_LABEL, SEDE_LABEL,
} from '@/hooks/GestionEnfermeria/mockCamasData';
import { LuUser } from 'react-icons/lu';

// Progressive disclosure por estado (encargo explícito): en reposo, la
// tarjeta ya responde "¿qué cama es? ¿cuál es su estado? ¿qué está pasando?
// ¿qué puedo hacer ahora?" sin abrir nada — el bloque contextual (paciente/
// reserva/motivo/inicio de limpieza) es la única parte que cambia según
// `cama.estado`, el resto de la tarjeta (header, ubicación, tipo, CTA+menú)
// es el mismo esqueleto para los 6 estados.
function BloqueContextual({ cama }) {
  if (cama.estado === 'ocupada' && cama.paciente) {
    return (
      <div className="cb-card-paciente">
        <LuUser className="icon" aria-hidden="true" />
        <div>
          <div className="cb-card-paciente-nombre">{cama.paciente.nombre}</div>
          <div className="cb-card-paciente-hc">{cama.paciente.hc}</div>
        </div>
      </div>
    );
  }
  if (cama.estado === 'reservada' && cama.reserva) {
    return (
      <div className="cb-card-contexto">
        {cama.reserva.paciente} · reserva {cama.reserva.inicio}–{cama.reserva.vencimiento}
      </div>
    );
  }
  if (cama.estado === 'limpieza' && cama.limpiezaDesde) {
    return <div className="cb-card-contexto">Desde {cama.limpiezaDesde}</div>;
  }
  if (cama.estado === 'mantenimiento' && cama.mantenimientoTipo) {
    return <div className="cb-card-contexto">{cama.mantenimientoTipo}</div>;
  }
  if (cama.estado === 'bloqueada' && cama.motivo) {
    return <div className="cb-card-contexto">{cama.motivo}</div>;
  }
  return null;
}

export default function BedCard({ cama, onAction }) {
  const cta = CTA_PRINCIPAL[cama.estado];
  return (
    <div className={`cb-card cb-card-${cama.estado}`}>
      <div className="cb-card-top">
        <span className="cb-card-numero">Cama {cama.numero}</span>
        <EstadoCamaBadge estado={cama.estado} />
      </div>

      <BloqueContextual cama={cama} />

      <div className="cb-card-meta">
        {SEDE_LABEL[cama.sede]} · {AREA_LABEL[cama.area]} · {PISO_LABEL[cama.piso]} · {SECTOR_LABEL[cama.sector]}
      </div>
      <div className="cb-card-tipo">Tipo {cama.tipo}</div>

      <div className="cb-card-footer">
        <button type="button" className="btn btn-secondary btn-sm cb-card-btn" onClick={() => onAction(cta.action, cama.id)}>
          {cta.label}
        </button>
        <BedActionsMenu estado={cama.estado} numero={cama.numero} onAction={(action) => onAction(action, cama.id)} />
      </div>
    </div>
  );
}
