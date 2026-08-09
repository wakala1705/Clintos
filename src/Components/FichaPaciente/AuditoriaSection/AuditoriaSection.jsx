import './AuditoriaSection.css';

// Solo el evento (fecha/usuario/acción) — para esta primera versión no se
// detalla campo por campo qué cambió, ver prompt de esta pantalla.
export default function AuditoriaSection({ eventos }) {
  return (
    <div className="fp-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {[...eventos].reverse().map((ev, i) => (
            <tr key={i}>
              <td>{ev.fecha}</td>
              <td>{ev.usuario}</td>
              <td>{ev.accion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
