import './FranjaPaciente.css';
import EstadoChip from '../../GestionCirugias/EstadoChip/EstadoChip';
import OrigenTag from '../../GestionCirugias/OrigenTag/OrigenTag';
import { enmascararDocumento } from '@/hooks/ProgramacionSalaCirugias/gestion/gestion';
import { listaProcedimientos } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

function Dato({ label, children }) {
  return (
    <div className="fp-dato">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Franja superior de "Programar cirugía": a quién se programa y qué.
export default function FranjaPaciente({ solicitud }) {
  const { paciente } = solicitud;
  return (
    <section className="gc-card fp-franja" aria-label="Paciente y procedimiento">
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
      <EstadoChip tone="complete">Lista de chequeo completa</EstadoChip>
    </section>
  );
}
