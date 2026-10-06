import './ResumenOrden.css';
import { fechaLabel } from '@/hooks/ProgramacionSalaCirugias/mockCirugiaData';
import { DIAGNOSTICOS } from '@/hooks/ProgramacionSalaCirugias/gestion/catalogos';
import { LATERALIDAD_LABEL } from '@/hooks/ProgramacionSalaCirugias/gestion/ordenes';

const SinCompletar = () => <span className="rs-vacio">Sin completar</span>;

function Bloque({ titulo, children }) {
  return (
    <div className="rs-bloque">
      <dt>{titulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Resumen lateral: se llena a medida que avanza el asistente; lo que aún no
// existe se muestra como "Sin completar".
export default function ResumenOrden({ paciente, orden, procedimientos }) {
  const dx = DIAGNOSTICOS.find((d) => d.value === orden.dx)?.label;
  const hayOrden = orden.institucion || orden.medico || orden.fecha || dx || orden.adjunto;
  return (
    <aside className="rs-panel" aria-label="Resumen de la orden">
      <h2 className="rs-titulo">Resumen</h2>
      <dl className="rs-lista">
        <Bloque titulo="Paciente">
          {paciente ? (
            <>
              <span className="rs-valor">{paciente.nombre}</span>
              <span className="rs-sub">{paciente.tipoDocumento} {paciente.numeroDocumento} · {paciente.edad} años</span>
            </>
          ) : <SinCompletar />}
        </Bloque>
        <Bloque titulo="Terceros · Entidad">
          {paciente ? (
            <>
              <span className="rs-valor">{paciente.eps}</span>
              <span className="rs-sub">{paciente.regimen} · Contrato {paciente.contrato}</span>
            </>
          ) : <SinCompletar />}
        </Bloque>
        <Bloque titulo="Orden externa">
          {hayOrden ? (
            <>
              <span className="rs-valor">{orden.institucion || <SinCompletar />}</span>
              <span className="rs-sub">{orden.medico || 'Médico sin completar'}</span>
              <span className="rs-sub">{orden.fecha ? fechaLabel(orden.fecha) : 'Fecha sin completar'}</span>
              <span className="rs-sub">{dx ?? 'Diagnóstico sin completar'}</span>
              <span className="rs-sub">{orden.adjunto ? `Adjunto: ${orden.adjunto}` : 'Documento sin adjuntar'}</span>
            </>
          ) : <SinCompletar />}
        </Bloque>
        <Bloque titulo="CUPS · Procedimientos">
          {procedimientos.length > 0 ? procedimientos.map((p) => (
            <span key={p.id} className="rs-proc">
              <span className="rs-valor">{p.cups} · {p.nombre}</span>
              <span className="rs-sub">
                {p.especialidad} · {LATERALIDAD_LABEL[p.lateralidad]} · {p.fecha ? fechaLabel(p.fecha) : 'fecha sin completar'}
              </span>
            </span>
          )) : <SinCompletar />}
        </Bloque>
      </dl>
    </aside>
  );
}
