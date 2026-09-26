import { LuClipboardCheck } from 'react-icons/lu';
import './ClasificadosTable.css';
import TriageBadge from '@/Components/TriageBadge/TriageBadge';
import { TRIAGE_LABEL } from '@/hooks/TriageBadge/triageLevels';
import { formatearEspera } from '@/hooks/Triage/triageData';

// Pestaña "Clasificados": pacientes ya valorados, con su nivel de triage
// (círculo de color + etiqueta), cuánto esperaron hasta ser clasificados y
// quién los clasificó. .tg-table-wrap/.tg-empty*: ../../shared/shared.css.
export default function ClasificadosTable({ pacientes }) {
  return (
    <div className="tg-table-wrap">
      <table className="data-table tg-table">
        <thead>
          <tr>
            <th>Clasificación</th>
            <th>Nombre del afiliado</th>
            <th>Edad</th>
            <th>Tipo ingreso</th>
            <th>Hora</th>
            <th>Tiempo de espera</th>
            <th>Clasificado por</th>
          </tr>
        </thead>
        {pacientes.length > 0 && (
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>
                  <span className="tg-nivel">
                    <TriageBadge level={p.nivel} />
                    <span className="tg-nivel-label">{TRIAGE_LABEL[p.nivel].split(' · ')[1]}</span>
                  </span>
                </td>
                <td className="cell-primary">
                  {p.paciente}
                  <span className="cell-sub">{p.documento}</span>
                </td>
                <td className="tg-cell-nowrap">{p.edad}</td>
                <td>{p.tipoIngreso}</td>
                <td className="tg-cell-nowrap">{p.hora}</td>
                <td className="tg-cell-nowrap">{formatearEspera(p.esperaMin)}</td>
                <td>{p.clasificadoPor}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {pacientes.length === 0 && (
        <div className="tg-empty">
          <LuClipboardCheck className="tg-empty-icon" aria-hidden="true" />
          <p className="tg-empty-title">No hay pacientes clasificados</p>
          <p className="tg-empty-sub">Las valoraciones de triage registradas aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
}
