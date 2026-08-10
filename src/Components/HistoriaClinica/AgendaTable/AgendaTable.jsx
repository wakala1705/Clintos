import './AgendaTable.css';
import TipoBadge from '../TipoBadge/TipoBadge';

// Tabla de escritorio/tablet + tarjetas de mobile del mismo dataset — se
// renderizan ambas y la CSS decide cuál mostrar según el ancho (mismo patrón
// que PatientsTable, ver AGENTS.md), así que no hay dos fuentes de verdad
// para las mismas filas. Doble clic en una fila/tarjeta abre la atención de
// ese paciente (onOpenAtencion), igual que "Ir a historia clínica" en
// PatientsTable — un solo clic queda libre para selección de texto/futuras
// acciones sin disparar la navegación por accidente.
export default function AgendaTable({ items, onOpenAtencion }) {
  return (
    <>
      <div className="hc-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th className="group-head" colSpan={4}>Hora</th>
              <th rowSpan={2} className="group-divider">Id. Afiliado</th>
              <th rowSpan={2}>Nombre Afiliado</th>
              <th rowSpan={2}>Id. Servicio</th>
              <th rowSpan={2}>Descripción</th>
              <th className="group-head group-divider" colSpan={3}>Primera vez</th>
              <th rowSpan={2} className="group-divider">Tipo cita</th>
            </tr>
            <tr>
              <th>Cita</th>
              <th>Llegada</th>
              <th>Inicio atención</th>
              <th>Final atención</th>
              <th className="group-divider">Año</th>
              <th>IPS</th>
              <th>Médico</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr
                key={a.id}
                className={a.estado === 'atendido' ? 'row-atendido' : undefined}
                onDoubleClick={() => onOpenAtencion(a.id)}
              >
                <td className="cell-primary">{a.citaHora}</td>
                <td className="cell-muted">{a.llegadaHora || '—'}</td>
                <td className="cell-muted">{a.inicioHora || '—'}</td>
                <td className="cell-muted">{a.finalHora || '—'}</td>
                <td className="group-divider">{a.idAfiliado}</td>
                <td className="cell-primary">{a.nombreAfiliado}</td>
                <td>{a.idServicio}</td>
                <td>{a.descripcionServicio}</td>
                <td className="cell-muted group-divider">{a.primeraVez?.anio ?? '-'}</td>
                <td className="cell-muted">{a.primeraVez?.ips ?? '-'}</td>
                <td className="cell-muted">{a.primeraVez?.medico ?? '-'}</td>
                <td className="group-divider"><TipoBadge tipo={a.tipoCita} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hc-cards">
        {items.map((a) => (
          <div
            className={`hc-card${a.estado === 'atendido' ? ' row-atendido' : ''}`}
            key={a.id}
            onDoubleClick={() => onOpenAtencion(a.id)}
          >
            <div className="hc-card-top">
              <div className="hc-card-id">
                <div className="hc-card-name">{a.nombreAfiliado}</div>
                <div className="hc-card-doc">{a.idAfiliado} · {a.descripcionServicio}</div>
              </div>
              <TipoBadge tipo={a.tipoCita} />
            </div>
            <div className="hc-card-times">
              <span><b>Cita</b> {a.citaHora}</span>
              <span><b>Llegada</b> {a.llegadaHora || '—'}</span>
              <span><b>Inicio</b> {a.inicioHora || '—'}</span>
              <span><b>Final</b> {a.finalHora || '—'}</span>
            </div>
            {a.primeraVez && (
              <div className="hc-card-meta">
                Primera vez {a.primeraVez.anio} · {a.primeraVez.ips} · {a.primeraVez.medico}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
