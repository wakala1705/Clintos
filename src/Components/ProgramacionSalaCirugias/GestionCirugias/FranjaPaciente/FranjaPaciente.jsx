import './FranjaPaciente.css';
import EstadoChip from '../EstadoChip/EstadoChip';
import OrigenTag from '../OrigenTag/OrigenTag';
import { enmascararDocumento, evaluarSolicitud } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { listaProcedimientos } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

function Dato({ label, children }) {
  return (
    <div className="fp-dato">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Franja superior del modal "Programar cirugía": a quién se programa y qué.
export default function FranjaPaciente({ solicitud }) {
  const { paciente } = solicitud;
  const ev = evaluarSolicitud(solicitud);
  return (
    <section className="fp-franja" aria-label="Paciente y procedimiento">
      <dl className="fp-datos">
        <Dato label="Paciente">
          <span className="fp-valor">{paciente.nombre}</span>
          <span className="fp-sub">
            {enmascararDocumento(paciente.tipoDocumento, paciente.numeroDocumento)} · {paciente.edad} años
          </span>
        </Dato>
        <Dato label="Procedimiento">
          {listaProcedimientos(solicitud).map((p) => (
            <span key={p.nombre} className="fp-valor">{p.nombre}</span>
          ))}
          <span className="fp-sub">{solicitud.cups} · {solicitud.especialidad}</span>
        </Dato>
        <Dato label="Terceros · Entidad">
          <span className="fp-valor">{solicitud.eps}</span>
          <span className="fp-sub">{solicitud.regimen} · Contrato {solicitud.contrato}</span>
        </Dato>
        <Dato label="Origen">
          <span className="fp-origen"><OrigenTag origen={solicitud.origen} /></span>
          <span className="fp-sub">Orden {solicitud.ordenNumero}</span>
        </Dato>
      </dl>
      <EstadoChip tone="complete">Lista de chequeo completa · {ev.completos}/{ev.total}</EstadoChip>
    </section>
  );
}
