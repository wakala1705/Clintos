import { LuClipboardCheck, LuStethoscope } from 'react-icons/lu';
import './EsperaTable.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { formatearEspera, toneEspera } from '@/hooks/Triage/triageData';

// Pestaña "En espera": pacientes sin valoración de triage, con el tiempo que
// llevan esperando como badge de color (verde / ámbar / rojo según el umbral,
// ver toneEspera). "Iniciar valoración" es la acción de la fila.
// .tg-table-wrap/.tg-empty*: ../../shared/shared.css (compartidos con
// ClasificadosTable).
export default function EsperaTable({ pacientes, onIniciar }) {
  return (
    <div className="tg-table-wrap">
      <table className="data-table tg-table">
        <thead>
          <tr>
            <th>Tiempo en espera</th>
            <th>Nombre del afiliado</th>
            <th>Edad</th>
            <th>Tipo ingreso</th>
            <th>Banderas</th>
            <th>Observación</th>
            <th>Acción</th>
          </tr>
        </thead>
        {pacientes.length > 0 && (
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td className="tg-cell-nowrap">
                  <Badge tone={toneEspera(p.esperaMin)} dot>{formatearEspera(p.esperaMin)}</Badge>
                </td>
                <td className="cell-primary">
                  {p.paciente}
                  <span className="cell-sub">{p.documento}</span>
                </td>
                <td className="tg-cell-nowrap">{p.edad}</td>
                <td>{p.tipoIngreso}</td>
                <td>
                  {p.banderas.length > 0
                    ? <span className="tg-banderas">{p.banderas.map((b) => <Badge key={b} tone="info">{b}</Badge>)}</span>
                    : <span className="cell-muted">—</span>}
                </td>
                <td className={p.observacion ? undefined : 'cell-muted'}>
                  {p.observacion ? <span className="tg-obs">{p.observacion}</span> : '—'}
                </td>
                <td className="tg-cell-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={LuStethoscope}
                    aria-label={`Iniciar valoración de ${p.paciente}`}
                    onClick={() => onIniciar(p.id)}
                  >
                    Iniciar valoración
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {pacientes.length === 0 && (
        <div className="tg-empty">
          <LuClipboardCheck className="tg-empty-icon" aria-hidden="true" />
          <p className="tg-empty-title">No hay pacientes en espera</p>
          <p className="tg-empty-sub">Los pacientes que lleguen sin clasificar aparecerán aquí.</p>
        </div>
      )}
    </div>
  );
}
