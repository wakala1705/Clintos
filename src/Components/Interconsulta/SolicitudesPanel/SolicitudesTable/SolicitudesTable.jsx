import { LuClipboardCheck, LuEye } from 'react-icons/lu';
import './SolicitudesTable.css';
import Badge from '@/Components/Badge/Badge';
import Button from '@/Components/Button/Button';
import { ESTADO_LABEL, ESTADO_TONE, formatearFecha } from '@/hooks/Interconsulta/interconsultaData';

// Tabla de solicitudes con su estado vacío (filtro/búsqueda sin resultados).
// "Abrir" abre el modal de detalle de la solicitud (ver Interconsulta.jsx).
export default function SolicitudesTable({ solicitudes, onAbrir }) {
  return (
    <div className="ic-table-wrap">
      <table className="data-table ic-table">
        <thead>
          <tr>
            <th>Paciente</th>
            <th>Servicio</th>
            <th>Especialidad</th>
            <th>Solicitante</th>
            <th>Fecha</th>
            <th className="col-right">Días</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        {solicitudes.length > 0 && (
          <tbody>
            {solicitudes.map((s) => (
              <tr key={s.id}>
                <td className="cell-primary">
                  {s.paciente}
                  <span className="cell-sub">Doc: {s.documento}</span>
                </td>
                <td>{s.servicio}</td>
                <td>{s.especialidad}</td>
                <td>{s.solicitante}</td>
                <td className="ic-cell-fecha">{formatearFecha(s.fecha)}</td>
                <td className="col-right ic-cell-dias">{s.dias}</td>
                <td>
                  <Badge tone={ESTADO_TONE[s.estado] ?? 'neutral'} dot>{ESTADO_LABEL[s.estado] ?? s.estado}</Badge>
                </td>
                <td>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={LuEye}
                    aria-label={`Abrir interconsulta #${s.numero} de ${s.paciente}`}
                    onClick={() => onAbrir(s.id)}
                  >
                    Abrir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>

      {solicitudes.length === 0 && (
        <div className="ic-empty">
          <LuClipboardCheck className="ic-empty-icon" aria-hidden="true" />
          <p className="ic-empty-title">No hay solicitudes para mostrar</p>
          <p className="ic-empty-sub">Ajusta los filtros o actualiza la bandeja para consultar nuevos registros.</p>
        </div>
      )}
    </div>
  );
}
