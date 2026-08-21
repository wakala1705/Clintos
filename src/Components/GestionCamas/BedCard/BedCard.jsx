import './BedCard.css';
import EstadoCamaBadge from '../EstadoCamaBadge/EstadoCamaBadge';
import BedActionsMenu from '../BedActionsMenu/BedActionsMenu';
import InfoLine from '../InfoLine/InfoLine';
import { formatIngreso, formatVentanaReserva, infoLimpieza } from '@/hooks/GestionCamas/bedContextFormat';
import { CTA_PRINCIPAL } from '@/hooks/GestionCamas/mockCamasData';
import { LuUser } from 'react-icons/lu';

// Progressive disclosure por estado (encargo explícito): en reposo, la
// tarjeta ya responde "¿qué cama es? ¿cuál es su estado? ¿qué está pasando?
// ¿qué puedo hacer ahora?" sin abrir nada — el bloque contextual (paciente/
// reserva/motivo/inicio de limpieza) es la única parte que cambia según
// `cama.estado`, el resto de la tarjeta (header, ubicación, tipo, CTA+menú)
// es el mismo esqueleto para los 6 estados.
function BloqueContextual({ cama, etaTimestamp, now }) {
  if (cama.estado === 'ocupada' && cama.paciente) {
    return (
      <>
        <div className="cb-card-paciente">
          <LuUser className="icon" aria-hidden="true" />
          <div>
            <div className="cb-card-paciente-nombre">{cama.paciente.nombre}</div>
            <div className="cb-card-paciente-hc">{cama.paciente.hc}</div>
          </div>
        </div>
        <InfoLine label="Ingreso" value={formatIngreso(cama.paciente.admision, cama.paciente.horaIngreso)} />
      </>
    );
  }
  if (cama.estado === 'libre') {
    return (
      <>
        {/* Texto de situación (encargo: "comunicar claramente la condición
            operativa") — mismo rol que el nombre del paciente en Ocupada:
            lo primero que se lee después del header. Reutilizable tal cual
            para futuros sub-estados de Libre (Pendiente de limpieza, En
            preparación, ver .cb-card-status-text en BedCard.css) sin romper
            esta jerarquía. */}
        <div className="cb-card-status-text">Disponible para asignación</div>
        <InfoLine label="Última limpieza" value={cama.ultimaLimpieza ? `Hoy · ${cama.ultimaLimpieza}` : null} />
      </>
    );
  }
  if (cama.estado === 'reservada' && cama.reserva) {
    const ventana = formatVentanaReserva(cama.reserva.fechaInicio, cama.reserva.fechaVencimiento);
    const valor = ventana ? `${cama.reserva.motivo} · ${ventana}` : cama.reserva.motivo;
    return (
      <>
        {cama.reserva.paciente && <div className="cb-card-contexto">{cama.reserva.paciente}</div>}
        <InfoLine label="Reservada para" value={valor} />
      </>
    );
  }
  if (cama.estado === 'limpieza') {
    const { label, valor } = infoLimpieza(cama, etaTimestamp, now);
    return <InfoLine label={label} value={valor} />;
  }
  if (cama.estado === 'mantenimiento') {
    return <InfoLine label="Mantenimiento" value={cama.mantenimientoTipo} />;
  }
  if (cama.estado === 'bloqueada') {
    return <InfoLine label="Motivo" value={cama.motivo} />;
  }
  return null;
}

export default function BedCard({
  cama, onAction, etaTimestamp, now,
}) {
  const cta = CTA_PRINCIPAL[cama.estado];
  return (
    <div className={`cb-card cb-card-${cama.estado}`}>
      <div className="cb-card-top">
        <span className="cb-card-numero">Cama {cama.numero}</span>
        <EstadoCamaBadge estado={cama.estado} />
      </div>

      <BloqueContextual cama={cama} etaTimestamp={etaTimestamp} now={now} />

      <div className="cb-card-footer">
        <button type="button" className="btn btn-secondary btn-sm cb-card-btn" onClick={() => onAction(cta.action, cama.id)}>
          {cta.label}
        </button>
        <BedActionsMenu estado={cama.estado} numero={cama.numero} onAction={(action) => onAction(action, cama.id)} />
      </div>
    </div>
  );
}
